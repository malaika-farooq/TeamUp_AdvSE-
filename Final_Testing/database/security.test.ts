// Database security audit: applies every migration to an in-memory Postgres (PGlite) and tries to break the rules.
// Needs the optional dev tool PGlite:  npm i -D @electric-sql/pglite   (or set PGLITE_PATH to its index.js).
// Without it these tests are skipped, and the report says so.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Db = {
  exec(sql: string): Promise<unknown>;
  query(sql: string): Promise<{ rows: Record<string, unknown>[] }>;
};

let PGlite: (new () => Db) | null = null;
for (const where of [process.env["PGLITE_PATH"], "@electric-sql/pglite"]) {
  if (!where) continue;
  try {
    PGlite = ((await import(where)) as { PGlite: new () => Db }).PGlite;
    break;
  } catch {
    /* try the next place */
  }
}
const has = PGlite !== null;

const A = "00000000-0000-0000-0000-00000000000a"; // owner of the private team
const B = "00000000-0000-0000-0000-00000000000b"; // member
const C = "00000000-0000-0000-0000-00000000000c"; // member
const D = "00000000-0000-0000-0000-00000000000d"; // outsider
const E = "00000000-0000-0000-0000-00000000000e"; // owner of another (public) team
const T = "00000000-0000-0000-0000-0000000000a1";
const U = "00000000-0000-0000-0000-0000000000a2";
const TASK = "00000000-0000-0000-0000-0000000000b1";
const RES = "00000000-0000-0000-0000-0000000000c1";
const SESSION = "00000000-0000-0000-0000-0000000000d1";

let db: Db;

/** Runs SQL as a signed-in student (row-level security applies). */
async function as(uid: string | null, sql: string) {
  await db.exec(`set app.uid = '${uid ?? ""}'; set role authenticated;`);
  try {
    return (await db.query(sql)).rows;
  } finally {
    await db.exec("reset role;");
  }
}
const refused = async (uid: string | null, sql: string) => {
  try {
    const rows = await as(uid, sql);
    return rows.length === 0 ? "no-rows" : false;
  } catch {
    return "error";
  }
};
const count = async (uid: string, table: string, where = "true") =>
  Number((await as(uid, `select count(*)::int as n from public.${table} where ${where}`))[0]!["n"]);

beforeAll(async () => {
  if (!PGlite) return;
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select 'authenticated' $$;
    create function public.gen_random_bytes(n int) returns bytea language sql as $$ select decode(md5(random()::text)||md5(random()::text),'hex') $$;
    create publication supabase_realtime;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, owner_id text);
    alter table storage.objects enable row level security;
    create function storage.foldername(n text) returns text[] language sql as $$ select string_to_array(n, '/') $$;
    grant usage on schema auth, storage to authenticated, anon, service_role;
    grant execute on function auth.uid() to authenticated, anon, service_role;
  `);
  const dir = join(import.meta.dir, "../../drizzle/migrations");
  for (const f of readdirSync(dir)
    .filter((x) => /^\d{4}_.*\.sql$/.test(x))
    .sort()) {
    await db.exec(readFileSync(join(dir, f), "utf8"));
  }
  await db.exec(`
    insert into auth.users (id, email) values
      ('${A}','a@x.edu'),('${B}','b@x.edu'),('${C}','c@x.edu'),('${D}','d@x.edu'),('${E}','e@x.edu');
    insert into public.profiles (id, display_name, discoverable) values
      ('${A}','Ann',true),('${B}','Ben',false),('${C}','Cy',false),('${D}','Dee',false),('${E}','Eve',true)
      on conflict (id) do update set display_name = excluded.display_name, discoverable = excluded.discoverable;
    insert into public.teams (id, name, created_by, visibility) values
      ('${T}','Private crew','${A}','private'),('${U}','Public circle','${E}','public');
    insert into public.team_members (team_id, user_id, role) values
      ('${T}','${A}','owner'),('${T}','${B}','member'),('${T}','${C}','member'),('${U}','${E}','owner')
      on conflict do nothing;
    insert into public.tasks (id, team_id, title, created_by, assignee_id) values ('${TASK}','${T}','Secret plan','${A}','${B}');
    insert into public.task_comments (task_id, author_id, body) values ('${TASK}','${A}','private comment');
    insert into public.task_checklist_items (task_id, label) values ('${TASK}','step one');
    insert into public.resources (id, team_id, kind, title, content, created_by) values ('${RES}','${T}','note','Team note','secret','${A}');
    insert into public.sessions (id, team_id, title, starts_at, ends_at, created_by)
      values ('${SESSION}','${T}','Standup', now() + interval '1 day', now() + interval '1 day 1 hour','${A}');
    insert into public.activity_logs (team_id, actor_id, action, summary) values ('${T}','${A}','task_created','created "Secret plan"');
    insert into public.availability_slots (user_id, weekday, start_minute, end_minute) values ('${B}',1,600,720);
    insert into public.notifications (user_id, type, title) values ('${B}','task_assigned','Private for Ben');
  `);
});
afterAll(() => {
  if (!has)
    console.warn(
      "Database security tests skipped: PGlite is not installed (npm i -D @electric-sql/pglite).",
    );
});

const t = has ? test : test.skip;

describe("Database: every migration applies", () => {
  t("0000 to the latest apply cleanly in order", async () => {
    const files = readdirSync(join(import.meta.dir, "../../drizzle/migrations")).filter((x) =>
      /^\d{4}_.*\.sql$/.test(x),
    );
    expect(files.length).toBeGreaterThanOrEqual(13);
    expect(Number((await db.query("select count(*)::int n from public.teams")).rows[0]!["n"])).toBe(
      2,
    );
  });
  t("running the later migrations a second time is harmless", async () => {
    const dir = join(import.meta.dir, "../../drizzle/migrations");
    for (const f of readdirSync(dir)
      .filter((x) => /^00(08|09|1\d)_.*\.sql$/.test(x))
      .sort()) {
      await db.exec(readFileSync(join(dir, f), "utf8"));
    }
  });
});

describe("Database: an outsider sees nothing of a private team", () => {
  for (const table of [
    "tasks",
    "task_comments",
    "task_checklist_items",
    "resources",
    "sessions",
    "activity_logs",
    "team_members",
  ]) {
    t(`cannot read ${table}`, async () => {
      expect(await count(D, table)).toBe(0);
    });
  }
  t("cannot read other people's notifications or free time", async () => {
    expect(await count(D, "notifications")).toBe(0);
    expect(await count(D, "availability_slots")).toBe(0);
  });
  t("cannot read the private team itself, but can read a public one", async () => {
    const seen = (await as(D, "select name from public.teams")).map((r) => r["name"]);
    expect(seen).toEqual(["Public circle"]);
  });
  t("cannot see a student who is not discoverable", async () => {
    const seen = (await as(D, "select display_name from public.profiles order by 1")).map(
      (r) => r["display_name"],
    );
    expect(seen).toEqual(["Ann", "Dee", "Eve"]);
  });
  t("teammates can see each other's profile even when not discoverable", async () => {
    const seen = (await as(B, "select display_name from public.profiles order by 1")).map(
      (r) => r["display_name"],
    );
    expect(seen).toContain("Cy");
    expect(seen).not.toContain("Dee");
  });
  t("cannot read the team's free time or reminders through the functions", async () => {
    expect(await refused(D, `select * from public.team_availability('${T}')`)).toBe("error");
    expect(await refused(D, `select public.nudge_team_availability('${T}')`)).toBe("error");
  });
});

describe("Database: an outsider cannot change a team's data", () => {
  const forTeam = (table: string, cols: string, vals: string) =>
    `insert into public.${table} (${cols}) values (${vals})`;
  t("cannot add a task", async () => {
    expect(
      await refused(D, forTeam("tasks", "team_id, title, created_by", `'${T}','x','${D}'`)),
    ).toBe("error");
  });
  t("cannot share a resource", async () => {
    expect(
      await refused(
        D,
        forTeam("resources", "team_id, kind, title, created_by", `'${T}','note','x','${D}'`),
      ),
    ).toBe("error");
  });
  t("cannot schedule a session", async () => {
    expect(
      await refused(
        D,
        forTeam(
          "sessions",
          "team_id, title, starts_at, ends_at, created_by",
          `'${T}','x', now(), now() + interval '1 hour','${D}'`,
        ),
      ),
    ).toBe("error");
  });
  t("cannot write into the activity history", async () => {
    expect(
      await refused(
        D,
        forTeam(
          "activity_logs",
          "team_id, actor_id, action, summary",
          `'${T}','${D}','task_created','x'`,
        ),
      ),
    ).toBe("error");
  });
  t("cannot comment on a task", async () => {
    expect(
      await refused(
        D,
        forTeam("task_comments", "task_id, author_id, body", `'${TASK}','${D}','hi'`),
      ),
    ).toBe("error");
  });
  t("cannot change or delete the team's tasks, resources or sessions", async () => {
    expect(
      await refused(D, `update public.tasks set title='hacked' where id='${TASK}' returning id`),
    ).toBe("no-rows");
    expect(await refused(D, `delete from public.tasks where id='${TASK}' returning id`)).toBe(
      "no-rows",
    );
    expect(
      await refused(D, `update public.resources set title='hacked' where id='${RES}' returning id`),
    ).toBe("no-rows");
    expect(await refused(D, `delete from public.resources where id='${RES}' returning id`)).toBe(
      "no-rows",
    );
    expect(await refused(D, `delete from public.sessions where id='${SESSION}' returning id`)).toBe(
      "no-rows",
    );
  });
  t("cannot rename or delete the team, or add themselves to it", async () => {
    expect(
      await refused(D, `update public.teams set name='hacked' where id='${T}' returning id`),
    ).toBe("no-rows");
    expect(await refused(D, `delete from public.teams where id='${T}' returning id`)).toBe(
      "no-rows",
    );
    expect(
      await refused(
        D,
        `insert into public.team_members (team_id, user_id, role) values ('${T}','${D}','owner')`,
      ),
    ).toBe("error");
  });
  t("signed-out visitors see and change nothing", async () => {
    expect(await refused(null, "select * from public.tasks")).toBe("no-rows");
    expect(
      await refused(
        null,
        `insert into public.tasks (team_id, title, created_by) values ('${T}','x','${A}')`,
      ),
    ).toBe("error");
  });
});

describe("Database: nobody can pretend to be someone else", () => {
  const as_B = (sql: string) => refused(B, sql);
  t("a task cannot be created in someone else's name", async () => {
    expect(
      await as_B(
        `insert into public.tasks (team_id, title, created_by) values ('${T}','x','${A}')`,
      ),
    ).toBe("error");
  });
  t("a resource cannot be shared in someone else's name", async () => {
    expect(
      await as_B(
        `insert into public.resources (team_id, kind, title, created_by) values ('${T}','note','x','${A}')`,
      ),
    ).toBe("error");
  });
  t("a comment cannot be written in someone else's name", async () => {
    expect(
      await as_B(
        `insert into public.task_comments (task_id, author_id, body) values ('${TASK}','${A}','x')`,
      ),
    ).toBe("error");
  });
  t("an activity entry cannot be written in someone else's name", async () => {
    expect(
      await as_B(
        `insert into public.activity_logs (team_id, actor_id, action, summary) values ('${T}','${A}','task_created','fake')`,
      ),
    ).toBe("error");
  });
  t("a task cannot be assigned to someone outside the team", async () => {
    expect(
      await as_B(`update public.tasks set assignee_id='${D}' where id='${TASK}' returning id`),
    ).toBe("error");
  });
  t("a task cannot be moved to another team or re-attributed", async () => {
    expect(
      await as_B(`update public.tasks set team_id='${U}' where id='${TASK}' returning id`),
    ).toBe("error");
    expect(
      await as_B(`update public.tasks set created_by='${B}' where id='${TASK}' returning id`),
    ).toBe("error");
  });
});

describe("Database: the history cannot be rewritten", () => {
  t("nobody can edit or delete an activity entry", async () => {
    expect(
      await as(A, "select count(*)::int n from public.activity_logs").then((r) =>
        Number(r[0]!["n"]),
      ),
    ).toBeGreaterThan(0);
    expect(await refused(A, "update public.activity_logs set summary='edited' returning id")).toBe(
      "error",
    );
    expect(await refused(A, "delete from public.activity_logs returning id")).toBe("error");
    expect(await refused(B, "delete from public.activity_logs returning id")).toBe("error");
  });
});

describe("Database: roles inside a team", () => {
  t("a member cannot delete or rewrite the owner's task", async () => {
    expect(
      await refused(C, `update public.tasks set status='done' where id='${TASK}' returning id`),
    ).toBe("no-rows");
    expect(await refused(C, `delete from public.tasks where id='${TASK}' returning id`)).toBe(
      "no-rows",
    );
  });
  t("the assignee can update their task but not delete it", async () => {
    expect(
      (await as(B, `update public.tasks set status='in_progress' where id='${TASK}' returning id`))
        .length,
    ).toBe(1);
    expect(await refused(B, `delete from public.tasks where id='${TASK}' returning id`)).toBe(
      "no-rows",
    );
  });
  t("a member cannot edit or delete the owner's note", async () => {
    expect(
      await refused(B, `update public.resources set content='x' where id='${RES}' returning id`),
    ).toBe("no-rows");
    expect(await refused(B, `delete from public.resources where id='${RES}' returning id`)).toBe(
      "no-rows",
    );
  });
  t("a member cannot promote themselves, remove the owner or delete the team", async () => {
    expect(
      await refused(
        B,
        `update public.team_members set role='owner' where team_id='${T}' and user_id='${B}' returning user_id`,
      ),
    ).not.toBe(false);
    expect(
      Number(
        (
          await db.query(
            `select count(*)::int n from public.team_members where team_id='${T}' and role='owner'`,
          )
        ).rows[0]!["n"],
      ),
    ).toBe(1);
    expect(
      await refused(
        B,
        `delete from public.team_members where team_id='${T}' and user_id='${A}' returning user_id`,
      ),
    ).not.toBe(false);
    expect(await refused(B, `delete from public.teams where id='${T}' returning id`)).toBe(
      "no-rows",
    );
  });
  t("an owner can manage everything", async () => {
    expect(
      (await as(A, `update public.tasks set priority='high' where id='${TASK}' returning id`))
        .length,
    ).toBe(1);
    expect(
      (await as(A, `update public.resources set title='Renamed' where id='${RES}' returning id`))
        .length,
    ).toBe(1);
  });
});

describe("Database: notifications and free time stay private", () => {
  t("nobody can send a notification to a stranger", async () => {
    expect(
      await refused(
        B,
        `insert into public.notifications (user_id, type, title) values ('${D}','x','spam')`,
      ),
    ).toBe("error");
  });
  t("teammates can notify each other", async () => {
    expect(
      (
        await as(
          B,
          `insert into public.notifications (user_id, type, title) values ('${C}','resource_shared','hello')`,
        )
      ).length,
    ).toBe(0);
    expect(
      Number(
        (
          await db.query(
            `select count(*)::int n from public.notifications where user_id='${C}' and title='hello'`,
          )
        ).rows[0]!["n"],
      ),
    ).toBe(1);
  });
  t("you cannot read or change another person's notification", async () => {
    expect(await count(C, "notifications", "title = 'Private for Ben'")).toBe(0);
    expect(
      await refused(
        C,
        `update public.notifications set read_at = now() where title = 'Private for Ben' returning id`,
      ),
    ).toBe("no-rows");
    expect(
      await refused(
        C,
        `delete from public.notifications where title = 'Private for Ben' returning id`,
      ),
    ).toBe("no-rows");
  });
  t("a notification's text cannot be rewritten even by its owner", async () => {
    expect(
      await refused(
        B,
        `update public.notifications set title='forged' where title='Private for Ben' returning id`,
      ),
    ).toBe("error");
  });
  t("teammates see free time only through the team function, not the table", async () => {
    expect(await count(C, "availability_slots")).toBe(0);
    expect((await as(C, `select * from public.team_availability('${T}')`)).length).toBe(1);
  });
});

describe("Database: structural checks", () => {
  t("every table in the public schema has row-level security turned on", async () => {
    const rows = (
      await db.query(
        `select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
         where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity order by 1`,
      )
    ).rows.map((r) => r["relname"]);
    expect(rows).toEqual([]);
  });
  t("the signed-out role has no access to any table", async () => {
    const rows = (
      await db.query(
        `select table_name from information_schema.role_table_grants
         where grantee = 'anon' and table_schema = 'public' group by 1`,
      )
    ).rows;
    expect(rows).toEqual([]);
  });
  t("only the invitation page's lookup can be run by signed-out visitors", async () => {
    const rows = (
      await db.query(
        `select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.prosecdef
           and has_function_privilege('anon', p.oid, 'EXECUTE')
           and p.prorettype <> 'trigger'::regtype
           and p.proname <> 'invitation_preview'
         order by 1`,
      )
    ).rows.map((r) => r["proname"]);
    expect(rows).toEqual([]);
  });
});
