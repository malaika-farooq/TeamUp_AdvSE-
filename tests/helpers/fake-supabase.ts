// A small in-memory stand-in for the Supabase client, enough to run the app's data code offline.
// It keeps tables as arrays of rows, understands the query-builder calls the app makes
// (select / insert / upsert / update / delete / eq / in / ilike / order / limit / maybeSingle / single),
// records every call, and lets tests inject errors.

type Row = Record<string, unknown>;
export type DbError = { message: string; code?: string };
type Result = { data: unknown; error: DbError | null };

export type Call = {
  table: string;
  op: "select" | "insert" | "upsert" | "update" | "delete";
  payload?: unknown;
  filters: Record<string, unknown>;
  onConflict?: string;
};

type Injected = { match: (c: Call) => boolean; error: DbError; once: boolean };

/** What the real database fills in when a row is added without these columns. */
const ROW_DEFAULTS: Record<string, () => Record<string, unknown>> = {
  tasks: () => ({
    description: null,
    status: "todo",
    priority: "medium",
    assignee_id: null,
    due_date: null,
    position: 1000,
    completed_at: null,
  }),
  resources: () => ({ content: null, url: null, storage_path: null, file_size: null, mime_type: null, tags: [], version: 1 }),
  notifications: () => ({ body: null, link: null, read_at: null }),
  sessions: () => ({ description: null, location: null, recurrence: "none", recurrence_end: null }),
  task_comments: () => ({}),
  task_checklist_items: () => ({ done: false, position: 0 }),
  activity_logs: () => ({ entity_id: null }),
  ai_threads: () => ({ title: "New conversation" }),
  ai_messages: () => ({}),
  invitations: () => ({}),
};

export function createFake(initialUserId = "user-1") {
  let userId = initialUserId;
  const tables: Record<string, Row[]> = {};
  const calls: Call[] = [];
  const rpcCalls: { name: string; args: Record<string, unknown> }[] = [];
  const storageCalls: { bucket: string; op: string; args: unknown[] }[] = [];
  const authCalls: { op: string; args: unknown }[] = [];
  const injected: Injected[] = [];
  const rpcErrors: Record<string, DbError> = {};
  const rpcHandlers: Record<string, (args: Record<string, unknown>) => Result> = {};
  const authErrors: Record<string, DbError> = {};
  const storageErrors: Record<string, DbError> = {};
  const authSession: Record<string, unknown> = {};
  const asError = (e: DbError) => Object.assign(new Error(e.message), e);
  const authThrows: Record<string, Error> = {};
  let sessionMode: "signed-in" | "signed-out" | "error" = "signed-in";

  const clone = <T>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));

  function builder(table: string) {
    const call: Call = { table, op: "select", filters: {} };
    let returning = false;
    let single: "none" | "maybe" | "one" = "none";
    const ranges: { col: string; op: "lt" | "lte" | "gt" | "gte"; val: unknown }[] = [];
    let orderBy: { col: string; ascending: boolean } | null = null;
    let max: number | null = null;

    const run = async (): Promise<Result> => {
      calls.push(clone({ ...call }));
      const idx = injected.findIndex((i) => i.match(call));
      if (idx >= 0) {
        const hit = injected[idx]!;
        if (hit.once) injected.splice(idx, 1);
        return { data: null, error: hit.error };
      }
      const rows = (tables[table] ??= []);
      const cmp = (a: unknown, b: unknown) => (String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0);
      // Like the database's row-level rules: you only ever see and change your own notifications.
      const mine = (r: Row) => table !== "notifications" || r["user_id"] === undefined || r["user_id"] === userId;
      const matches = (r: Row) =>
        mine(r) &&
        Object.entries(call.filters).every(([k, v]) =>
          Array.isArray(v) ? v.includes(r[k]) : r[k] === v,
        ) &&
        ranges.every(({ col, op, val }) => {
          const c = cmp(r[col], val);
          return op === "lt" ? c < 0 : op === "lte" ? c <= 0 : op === "gt" ? c > 0 : c >= 0;
        });
      let data: unknown;
      if (call.op === "select") {
        let found = rows.filter(matches);
        if (orderBy) {
          const { col, ascending } = orderBy;
          found = [...found].sort((a, b) => (ascending ? 1 : -1) * cmp(a[col], b[col]));
        }
        if (max !== null) found = found.slice(0, max);
        data = found.map(clone);
      } else if (call.op === "insert") {
        const items = ([] as Row[]).concat(call.payload as Row | Row[]);
        const made = items.map((i) => {
          const defaults = ROW_DEFAULTS[table];
          if (!defaults) return clone(i);
          const now = new Date().toISOString();
          return { id: crypto.randomUUID(), created_at: now, updated_at: now, ...defaults(), ...clone(i) };
        });
        made.forEach((r) => rows.push(r));
        data = made.map(clone);
      } else if (call.op === "upsert") {
        const items = ([] as Row[]).concat(call.payload as Row | Row[]);
        const keys = (call.onConflict ?? "id").split(",").map((k) => k.trim());
        for (const item of items) {
          const at = rows.findIndex((r) => keys.every((k) => r[k] === item[k]));
          if (at >= 0) Object.assign(rows[at]!, clone(item));
          else rows.push(clone(item));
        }
        data = items.map(clone);
      } else if (call.op === "update") {
        const hit = rows.filter(matches);
        hit.forEach((r) => Object.assign(r, clone(call.payload as Row)));
        data = hit.map(clone);
      } else {
        const removed = rows.filter(matches);
        tables[table] = rows.filter((r) => !matches(r));
        data = removed.map(clone);
      }
      if (call.op !== "select" && !returning) data = null;
      if (single !== "none" && Array.isArray(data)) data = data[0] ?? null;
      return { data, error: null };
    };

    const b: Record<string, unknown> = {
      select() {
        if (call.op !== "select") returning = true;
        return b;
      },
      insert(payload: unknown) {
        call.op = "insert";
        call.payload = payload;
        return b;
      },
      upsert(payload: unknown, opts?: { onConflict?: string }) {
        call.op = "upsert";
        call.payload = payload;
        if (opts?.onConflict) call.onConflict = opts.onConflict;
        return b;
      },
      update(payload: unknown) {
        call.op = "update";
        call.payload = payload;
        return b;
      },
      delete() {
        call.op = "delete";
        return b;
      },
      eq(col: string, val: unknown) {
        call.filters[col] = val;
        return b;
      },
      in(col: string, vals: unknown[]) {
        call.filters[col] = vals;
        return b;
      },
      ilike: () => b,
      order(col: string, opts?: { ascending?: boolean }) {
        orderBy = { col, ascending: opts?.ascending !== false };
        return b;
      },
      limit(n: number) {
        max = n;
        return b;
      },
      lt(col: string, val: unknown) {
        ranges.push({ col, op: "lt", val });
        return b;
      },
      lte(col: string, val: unknown) {
        ranges.push({ col, op: "lte", val });
        return b;
      },
      gt(col: string, val: unknown) {
        ranges.push({ col, op: "gt", val });
        return b;
      },
      gte(col: string, val: unknown) {
        ranges.push({ col, op: "gte", val });
        return b;
      },
      maybeSingle() {
        single = "maybe";
        return b;
      },
      single() {
        single = "one";
        return b;
      },
      then(resolve: (v: Result) => unknown, reject?: (e: unknown) => unknown) {
        return run().then(resolve, reject);
      },
    };
    return b;
  }

  // The three profile RPCs behave like the real database functions (simplified).
  rpcHandlers["set_my_courses"] = (args) => {
    const seen = new Set<string>();
    const items = (args["_courses"] as { code?: string; title: string }[]).filter((c) => {
      const key = `${(c.code || c.title).toLowerCase()}|${c.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    tables["user_courses"] = items.map((c) => ({
      user_id: userId,
      courses: { code: c.code || c.title, title: c.title },
    }));
    for (const c of items) {
      const rows = (tables["courses"] ??= []);
      if (!rows.some((r) => String(r["title"]).toLowerCase() === c.title.toLowerCase())) {
        rows.push({ code: c.code || c.title, title: c.title });
      }
    }
    return { data: items.length, error: null };
  };
  rpcHandlers["set_my_skills"] = (args) => {
    const items = args["_skills"] as { name: string; level: number }[];
    tables["user_skills"] = items.map((s) => ({
      user_id: userId,
      level: s.level,
      skills: { name: s.name },
    }));
    return { data: items.length, error: null };
  };
  rpcHandlers["set_my_availability"] = (args) => {
    const items = args["_slots"] as { weekday: number; start: number; end: number }[];
    tables["availability_slots"] = items.map((s) => ({
      user_id: userId,
      weekday: s.weekday,
      start_minute: s.start,
      end_minute: s.end,
    }));
    return { data: items.length, error: null };
  };

  const client = {
    from: (table: string) => builder(table),
    // Live updates aren't simulated; pages just need the calls to exist.
    channel: () => {
      const ch = { on: () => ch, subscribe: () => ch };
      return ch;
    },
    removeChannel: () => {},
    rpc: async (name: string, args: Record<string, unknown> = {}): Promise<Result> => {
      rpcCalls.push({ name, args: clone(args) });
      const err = rpcErrors[name];
      if (err) return { data: null, error: err };
      const handler = rpcHandlers[name];
      return handler ? handler(args) : { data: null, error: null };
    },
    storage: {
      from: (bucket: string) => ({
        upload: async (...args: unknown[]) => {
          storageCalls.push({ bucket, op: "upload", args });
          const err = storageErrors["upload"];
          return err
            ? { data: null, error: err }
            : { data: { path: String(args[0]) }, error: null };
        },
        remove: async (...args: unknown[]) => {
          storageCalls.push({ bucket, op: "remove", args });
          const err = storageErrors["remove"];
          return err ? { data: null, error: err } : { data: [], error: null };
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://files.test/${bucket}/${path}` },
        }),
        createSignedUrl: async (path: string) => ({
          data: { signedUrl: `https://files.test/signed/${path}` },
          error: null,
        }),
      }),
    },
    auth: {
      getSession: async () => {
        if (sessionMode === "signed-out") return { data: { session: null }, error: null };
        if (sessionMode === "error") return { data: { session: null }, error: new Error("Failed to fetch") };
        return {
          data: { session: { access_token: "test-token", user: { id: userId, email: "maya.chen@example.edu" } } },
          error: null,
        };
      },
      updateUser: async (args: unknown) => {
        authCalls.push({ op: "updateUser", args: clone(args) });
        const err = authErrors["updateUser"] && asError(authErrors["updateUser"]!);
        return err ? { data: null, error: err } : { data: { user: {} }, error: null };
      },
      signUp: async (args: unknown) => {
        authCalls.push({ op: "signUp", args: clone(args) });
        const err = authErrors["signUp"] && asError(authErrors["signUp"]!);
        return err
          ? { data: { session: null, user: null }, error: err }
          : { data: { session: authSession["signUp"] ?? null, user: {} }, error: null };
      },
      signInWithPassword: async (args: unknown) => {
        authCalls.push({ op: "signInWithPassword", args: clone(args) });
        const err = authErrors["signInWithPassword"] && asError(authErrors["signInWithPassword"]!);
        return err ? { data: null, error: err } : { data: { session: {} }, error: null };
      },
      signInWithOAuth: async (args: unknown) => {
        authCalls.push({ op: "signInWithOAuth", args: clone(args) });
        const err = authErrors["signInWithOAuth"] && asError(authErrors["signInWithOAuth"]!);
        if (authThrows["signInWithOAuth"]) throw authThrows["signInWithOAuth"];
        return err
          ? { data: null, error: err }
          : { data: { url: "https://accounts.google.com/o/oauth2" }, error: null };
      },
      resetPasswordForEmail: async (...args: unknown[]) => {
        authCalls.push({ op: "resetPasswordForEmail", args: clone(args) });
        const err =
          authErrors["resetPasswordForEmail"] && asError(authErrors["resetPasswordForEmail"]!);
        return err ? { data: null, error: err } : { data: {}, error: null };
      },
    },
  };

  return {
    userId,
    client,
    tables,
    calls,
    rpcCalls,
    storageCalls,
    authCalls,
    rpcHandlers,
    seed(name: string, rows: Row[]) {
      tables[name] = clone(rows);
    },
    /** Make the next matching table call fail with this error. */
    failTable(table: string, op: Call["op"], error: DbError, once = true) {
      injected.push({ match: (c) => c.table === table && c.op === op, error, once });
    },
    failRpc(name: string, error: DbError) {
      rpcErrors[name] = error;
    },
    /** Stop an RPC from failing, e.g. after the network "comes back". */
    clearRpcError(name: string) {
      delete rpcErrors[name];
    },
    failAuth(op: string, error: DbError) {
      authErrors[op] = error;
    },
    /** Make signUp return a session straight away (email confirmation turned off). */
    signUpReturnsSession() {
      authSession["signUp"] = { access_token: "t" };
    },
    /** Pretend a different student is signed in (their id is what the session reports). */
    setUserId(id: string) {
      userId = id;
    },
    /** What "who is signed in on this device?" answers. */
    setSessionMode(mode: "signed-in" | "signed-out" | "error") {
      sessionMode = mode;
    },
    /** Make a sign-in call throw, as a network failure does ("Failed to fetch"). */
    throwAuth(op: string, error: Error) {
      authThrows[op] = error;
    },
    failStorage(op: "upload" | "remove", error: DbError) {
      storageErrors[op] = error;
    },
    callsTo(table: string, op?: Call["op"]) {
      return calls.filter((c) => c.table === table && (!op || c.op === op));
    },
  };
}

export type FakeSupabase = ReturnType<typeof createFake>;
