import { describe, expect, test } from "bun:test";
import {
  canManage,
  expiresText,
  inviteRolesFor,
  invitationProblem,
  memberActions,
  requestState,
} from "../src/lib/team-rules";

describe("roles", () => {
  test("only owners and admins manage a team", () => {
    expect(canManage("owner")).toBe(true);
    expect(canManage("admin")).toBe(true);
    expect(canManage("member")).toBe(false);
    expect(canManage(null)).toBe(false);
  });

  test("owners can invite admins, admins only members, members nobody", () => {
    expect(inviteRolesFor("owner")).toEqual(["member", "admin"]);
    expect(inviteRolesFor("admin")).toEqual(["member"]);
    expect(inviteRolesFor("member")).toEqual([]);
    expect(inviteRolesFor(undefined)).toEqual([]);
  });

  test("the owner controls everyone else", () => {
    expect(memberActions("owner", "admin", false)).toEqual({
      changeRole: true,
      transfer: true,
      remove: true,
    });
    expect(memberActions("owner", "member", false)).toEqual({
      changeRole: true,
      transfer: true,
      remove: true,
    });
  });

  test("an admin can only remove plain members", () => {
    expect(memberActions("admin", "member", false)).toEqual({
      changeRole: false,
      transfer: false,
      remove: true,
    });
    expect(memberActions("admin", "admin", false).remove).toBe(false);
    expect(memberActions("admin", "owner", false).remove).toBe(false);
  });

  test("nobody acts on themselves or on the owner", () => {
    const none = { changeRole: false, transfer: false, remove: false };
    expect(memberActions("owner", "owner", true)).toEqual(none);
    expect(memberActions("admin", "admin", true)).toEqual(none);
    expect(memberActions("owner", "owner", false)).toEqual(none);
    expect(memberActions("member", "member", false)).toEqual(none);
    expect(memberActions(null, "member", false)).toEqual(none);
  });
});

describe("join request state", () => {
  const now = new Date("2026-11-13T12:00:00Z");

  test("no request means the student can ask", () => {
    expect(requestState(undefined, now)).toEqual({ kind: "none" });
  });
  test("pending is pending", () => {
    expect(requestState({ status: "pending", decided_at: null }, now)).toEqual({ kind: "pending" });
  });
  test("a declined request blocks asking again for 7 days", () => {
    const s = requestState({ status: "rejected", decided_at: "2026-11-10T12:00:00Z" }, now);
    expect(s.kind).toBe("wait");
    if (s.kind === "wait") expect(s.retryOn.toISOString()).toBe("2026-11-17T12:00:00.000Z");
  });
  test("after 7 days they can ask again", () => {
    expect(requestState({ status: "rejected", decided_at: "2026-11-05T12:00:00Z" }, now)).toEqual({
      kind: "none",
    });
  });
  test("an approved request (for someone no longer a member) can be repeated", () => {
    expect(requestState({ status: "approved", decided_at: "2026-11-12T12:00:00Z" }, now)).toEqual({
      kind: "none",
    });
  });
});

describe("invitation wording", () => {
  test("each reason has a plain explanation", () => {
    expect(invitationProblem("expired")).toContain("expired");
    expect(invitationProblem("revoked")).toContain("cancelled");
    expect(invitationProblem("declined")).toContain("declined");
    expect(invitationProblem("used")).toContain("already used");
    expect(invitationProblem("not_for_you")).toContain("someone else");
    expect(invitationProblem("whatever")).toContain("couldn't find");
  });

  test("expiry text", () => {
    const now = new Date("2026-11-13T12:00:00Z");
    expect(expiresText("2026-11-16T13:00:00Z", now)).toBe("expires in 3 days");
    expect(expiresText("2026-11-14T13:00:00Z", now)).toBe("expires in 1 day");
    expect(expiresText("2026-11-13T18:00:00Z", now)).toBe("expires today");
    expect(expiresText("2026-11-13T11:00:00Z", now)).toBe("expired");
  });
});
