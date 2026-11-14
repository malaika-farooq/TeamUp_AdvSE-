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

export function createFake(userId = "user-1") {
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

  const clone = <T>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));

  function builder(table: string) {
    const call: Call = { table, op: "select", filters: {} };
    let returning = false;
    let single: "none" | "maybe" | "one" = "none";

    const run = async (): Promise<Result> => {
      calls.push(clone({ ...call }));
      const idx = injected.findIndex((i) => i.match(call));
      if (idx >= 0) {
        const hit = injected[idx]!;
        if (hit.once) injected.splice(idx, 1);
        return { data: null, error: hit.error };
      }
      const rows = (tables[table] ??= []);
      const matches = (r: Row) =>
        Object.entries(call.filters).every(([k, v]) =>
          Array.isArray(v) ? v.includes(r[k]) : r[k] === v,
        );
      let data: unknown;
      if (call.op === "select") {
        data = rows.filter(matches).map(clone);
      } else if (call.op === "insert") {
        const items = ([] as Row[]).concat(call.payload as Row | Row[]);
        items.forEach((i) => rows.push(clone(i)));
        data = items.map(clone);
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
      order: () => b,
      limit: () => b,
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
      updateUser: async (args: unknown) => {
        authCalls.push({ op: "updateUser", args: clone(args) });
        const err = authErrors["updateUser"];
        return err ? { data: null, error: err } : { data: { user: {} }, error: null };
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
    failAuth(op: string, error: DbError) {
      authErrors[op] = error;
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
