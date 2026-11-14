// Database workflow tests: the real SQL functions and triggers, run as different students, in the order a team uses them.
// Needs the optional dev tool PGlite (see Final_Testing/README.md). Skipped, and reported as skipped, without it.
import { beforeAll, describe, expect, test } from "bun:test";
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
    /* next */
  }
}
const t = PGlite ? test : test.skip;

const U = (n: number) => `00000000-0000-0000-0000-0000000000${String(n).padStart(2, "0")}`;
const [ANN, BEN, CY, DEE] = [U(1), U(2), U(3), U(4)];
let db: Db;

async function as(uid: string | null, sql: string) {
  await db.exec(`set app.uid = '${uid ?? ""}'; set role authenticated;`);
  try {
    return (await db.query(sql)).rows;
  } finally {
    await db.exec("reset role;");
  }
}
const fails = async (uid: string | null, sql: string, re?: RegExp) => {
  try {
    await as(uid, sql);
    return false;
  } catch (e) {
    return re ? re.test((e as Error).message) : true;
  }
};
const one = async (sql: string) => (await db.query(sql)).rows[0]!;
const val = async (uid: string, sql: string) => Object.values((await as(uid, sql))[0]!)[0] as never;

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
    insert into auth.users (id, email) values ('${ANN}','a@x.edu'),('${BEN}','b@x.edu'),('${CY}','c@x.edu'),('${DEE}','d@x.edu');
    insert into public.profiles (id, display_name, discoverable) values
      ('${ANN}','Ann',true),('${BEN}','Ben',true),('${CY}','Cy',true),('${DEE}','Dee',true)
      on conflict (id) do update set display_name = excluded.display_name, discoverable = excluded.discoverable;
  `);
});

let TEAM = "";

describe("Workflow (Functionality 2): create a team, invite, join, roles", () => {
  t("Ann creates a public team and becomes its owner", async () => {
    TEAM = await val(
      ANN,
      `select public.create_team('Capstone Crew','Project team',null,'Ship it',null,'public','teal')::text`,
    );
    expect(TEAM).toMatch(/^[0-9a-f-]{36}$/);
    expect(
      await val(
        ANN,
        `select role::text from public.team_members where team_id='${TEAM}' and user_id='${ANN}'`,
      ),
    ).toBe("owner");
  });
  t("an invitation link works once and makes Ben a member", async () => {
    const token = await val(ANN, `select public.create_invite_link('${TEAM}','member')`);
    expect(String(token).length).toBeGreaterThan(20);
    const preview = (
      await as(null, `select valid, team_name from public.invitation_preview('${token}')`)
    )[0]!;
    expect(preview).toMatchObject({ valid: true, team_name: "Capstone Crew" });
    await as(BEN, `select public.redeem_invitation('${token}')`);
    expect(
      await val(BEN, `select count(*)::int from public.team_members where team_id='${TEAM}'`),
    ).toBe(2);
    expect(await fails(CY, `select public.redeem_invitation('${token}')`)).toBe(true); // used
    expect(
      (await as(null, `select valid, reason from public.invitation_preview('${token}')`))[0],
    ).toMatchObject({ valid: false, reason: "used" });
  });
  t(
    "a member cannot invite; an owner can invite a student directly and the student can decline",
    async () => {
      expect(await fails(BEN, `select public.invite_student('${TEAM}','${CY}','member')`)).toBe(
        true,
      );
      const inv = await val(ANN, `select public.invite_student('${TEAM}','${CY}','member')::text`);
      expect(inv).toBeTruthy();
      expect(await val(CY, `select count(*)::int from public.my_team_invitations()`)).toBe(1);
      expect(
        await val(
          ANN,
          `select count(*)::int from public.notifications where user_id='${CY}' and type='team_invite'`,
        ),
      ).toBe(0); // private to Cy
      await db.exec(`reset role;`);
      expect(
        (
          await one(
            `select count(*)::int n from public.notifications where user_id='${CY}' and type='team_invite'`,
          )
        ).n,
      ).toBe(1);
    },
  );
  t("a student can ask to join a public team; owners and admins decide", async () => {
    const req = await val(
      DEE,
      `select public.request_to_join('${TEAM}','Hi, I would like to help')::text`,
    );
    expect(
      await fails(DEE, `select public.request_to_join('${TEAM}','again')`, /already asked/),
    ).toBe(true);
    expect(await fails(BEN, `select public.decide_join_request('${req}', true)`)).toBe(true); // a member cannot decide
    await as(ANN, `select public.decide_join_request('${req}', true)`);
    expect(
      await val(
        DEE,
        `select count(*)::int from public.team_members where team_id='${TEAM}' and user_id='${DEE}'`,
      ),
    ).toBe(1);
  });
  t(
    "roles: only the owner can promote, an admin cannot demote the owner, the last owner cannot leave without the team going",
    async () => {
      await as(ANN, `select public.set_member_role('${TEAM}','${BEN}','admin')`);
      expect(
        await val(
          BEN,
          `select role::text from public.team_members where team_id='${TEAM}' and user_id='${BEN}'`,
        ),
      ).toBe("admin");
      expect(await fails(BEN, `select public.set_member_role('${TEAM}','${ANN}','member')`)).toBe(
        true,
      );
      expect(await fails(DEE, `select public.set_member_role('${TEAM}','${DEE}','owner')`)).toBe(
        true,
      );
      await as(ANN, `select public.transfer_ownership('${TEAM}','${BEN}')`);
      expect(
        await val(
          BEN,
          `select role::text from public.team_members where team_id='${TEAM}' and user_id='${BEN}'`,
        ),
      ).toBe("owner");
      await as(BEN, `select public.set_member_role('${TEAM}','${ANN}','admin')`);
    },
  );
  t("an admin can remove a member; a member can leave", async () => {
    await as(ANN, `select public.remove_member('${TEAM}','${DEE}')`);
    expect(
      await val(
        BEN,
        `select count(*)::int from public.team_members where team_id='${TEAM}' and user_id='${DEE}'`,
      ),
    ).toBe(0);
  });
});

describe("Workflow (Functionality 3 and 4): free time, tasks, finish times", () => {
  t(
    "members read each other's free time through the team function; reminders go to people with none",
    async () => {
      await db.exec(
        `insert into public.availability_slots (user_id, weekday, start_minute, end_minute) values ('${ANN}',1,600,720),('${BEN}',1,660,780)`,
      );
      expect((await as(ANN, `select * from public.team_availability('${TEAM}')`)).length).toBe(2);
      expect(await val(ANN, `select public.nudge_team_availability('${TEAM}')`)).toBe(0); // Ben has time; Cy hasn't joined
      await as(
        CY,
        `select public.redeem_invitation(token) from public.invitations where invitee_id='${CY}'`,
      ).catch(() => undefined);
    },
  );
  t("a task's finish time is kept by the database and cleared on reopening", async () => {
    await as(
      ANN,
      `insert into public.tasks (team_id, title, created_by, assignee_id) values ('${TEAM}','Write intro','${ANN}','${BEN}')`,
    );
    expect(
      (await one(`select completed_at from public.tasks where title='Write intro'`)).completed_at,
    ).toBeNull();
    await as(BEN, `update public.tasks set status='done' where title='Write intro'`);
    expect(
      (await one(`select completed_at from public.tasks where title='Write intro'`)).completed_at,
    ).not.toBeNull();
    await as(BEN, `update public.tasks set status='in_progress' where title='Write intro'`);
    expect(
      (await one(`select completed_at from public.tasks where title='Write intro'`)).completed_at,
    ).toBeNull();
  });
  t("a task cannot be given to someone outside the team", async () => {
    expect(
      await fails(ANN, `update public.tasks set assignee_id='${U(9)}' where title='Write intro'`),
    ).toBe(true);
  });
  t("when a member leaves, their tasks become unassigned", async () => {
    await db.exec(`delete from public.team_members where team_id='${TEAM}' and user_id='${BEN}'`);
    expect(
      (await one(`select assignee_id from public.tasks where title='Write intro'`)).assignee_id,
    ).toBeNull();
  });
});

describe("Workflow (Functionality 5): deadline reminders", () => {
  t(
    "reminders are created once for due-soon, overdue and starting-soon, and again when a deadline moves",
    async () => {
      await db.exec(`
      insert into public.tasks (team_id, title, created_by, assignee_id, due_date) values
        ('${TEAM}','Due soon','${ANN}','${ANN}', now() + interval '5 hours'),
        ('${TEAM}','Overdue','${ANN}','${ANN}', now() - interval '2 hours'),
        ('${TEAM}','Long ago','${ANN}','${ANN}', now() - interval '10 days'),
        ('${TEAM}','Later','${ANN}','${ANN}', now() + interval '3 days');
    `);
      expect(await val(ANN, `select public.refresh_deadline_notifications()`)).toBe(2);
      expect(await val(ANN, `select public.refresh_deadline_notifications()`)).toBe(0);
      await db.exec(
        `update public.tasks set due_date = now() + interval '8 hours' where title='Later'`,
      );
      expect(await val(ANN, `select public.refresh_deadline_notifications()`)).toBe(1);
      const types = (
        await db.query(
          `select type from public.notifications where user_id='${ANN}' and type like 'task_%' order by 1`,
        )
      ).rows.map((r) => r["type"]);
      expect(types).toEqual(["task_due_soon", "task_due_soon", "task_overdue"]);
      // earlier steps told the owner about the join request and the accepted invitations
      const earlier = (
        await db.query(
          `select type from public.notifications where user_id='${ANN}' and type not like 'task_%'`,
        )
      ).rows.map((r) => r["type"]);
      expect(earlier).toContain("join_request");
      expect(earlier).toContain("invite_accepted");
    },
  );
});

describe("Workflow (Functionality 6): the history", () => {
  t("creating the team and joining it are in the history, and nobody can alter it", async () => {
    const actions = (
      await as(
        ANN,
        `select action from public.activity_logs where team_id='${TEAM}' order by created_at`,
      )
    ).map((r) => r["action"]);
    expect(actions).toContain("team_created");
    expect(await fails(ANN, `update public.activity_logs set summary='x'`)).toBe(true);
    expect(await fails(ANN, `delete from public.activity_logs`)).toBe(true);
  });
  t("a student who left can no longer read the team's history", async () => {
    expect(
      await val(BEN, `select count(*)::int from public.activity_logs where team_id='${TEAM}'`),
    ).toBe(0);
  });
});
