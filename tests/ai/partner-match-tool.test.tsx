import { beforeEach, describe, expect, mock, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { PartnerMatchTool } from "../../src/components/app/ai/partner-tools";
import type { PartnerResult, PartnerSuggestion } from "../../src/lib/partners.functions";
import { h, resetHarness } from "../helpers/harness";
import { deferred, renderWithClient } from "../helpers/render";

const person = (over: Partial<PartnerSuggestion> = {}): PartnerSuggestion => ({
  id: "u-zara",
  rank: 1,
  name: "Zara Ali",
  avatar: null,
  major: "Computer Science",
  university: "Northbridge University",
  sharedCourses: ["CS201 Data Structures"],
  newSkills: ["Python", "SQL"],
  wantedSkills: ["SQL"],
  overlapHours: 6.5,
  workload: "light",
  reason: "Has the SQL skills you asked for and shares CS201 with you.",
  ...over,
});
const answer = (suggestions: PartnerSuggestion[], empty: PartnerResult["empty"] = null) =>
  ({ suggestions, empty }) as PartnerResult;

const findButton = () => screen.getByRole("button", { name: /find (study partners|again)/i });
const list = () => screen.getByRole("list", { name: /suggested study partners/i });
const lastInput = () =>
  h.ai.suggestPartners.mock.calls.at(-1)![0] as {
    data: {
      wantedSkills?: string[];
      windows?: { weekday: number; start: number; end: number }[];
      avoidHeavy?: boolean;
    };
  };

beforeEach(() => resetHarness());

describe("AI Teammate Matching > Find study partners: asking", () => {
  test("explains what the match is based on and what stays private", () => {
    renderWithClient(<PartnerMatchTool />);
    expect(
      screen.getByText(/shared courses, skills you don't have, overlapping free hours/i),
    ).toBeTruthy();
    expect(screen.getByText(/how busy each student is/i)).toBeTruthy();
    expect(screen.getByText(/nobody's schedule or task list is shown/i)).toBeTruthy();
  });

  test("with nothing chosen, asks for a plain match on saved profile and availability", async () => {
    h.ai.suggestPartners = mock(async () => answer([person()]));
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.click(findButton());
    await waitFor(() => expect(h.ai.suggestPartners).toHaveBeenCalledTimes(1));
    expect(lastInput().data).toEqual({
      wantedSkills: undefined,
      windows: undefined,
      avoidHeavy: undefined,
    });
    expect(
      screen.getByText(/leave empty to match on your saved weekly availability/i),
    ).toBeTruthy();
  });

  test("skills the student wants are sent along, trimmed and without duplicates", async () => {
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.type(screen.getByLabelText(/what kind of partner/i), "SQL, React ,sql{Enter}");
    expect(screen.getByRole("button", { name: "Remove SQL" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Remove React" })).toBeTruthy();
    await user.click(findButton());
    await waitFor(() => expect(h.ai.suggestPartners).toHaveBeenCalled());
    expect(lastInput().data.wantedSkills).toEqual(["SQL", "React", "sql"]);
  });

  test("the Add button works too, and the box is emptied", async () => {
    const { user } = renderWithClient(<PartnerMatchTool />);
    const box = screen.getByLabelText(/what kind of partner/i) as HTMLInputElement;
    await user.type(box, "Figma");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("button", { name: "Remove Figma" })).toBeTruthy();
    expect(box.value).toBe("");
  });

  test("a wanted skill can be taken back out", async () => {
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.type(screen.getByLabelText(/what kind of partner/i), "SQL{Enter}");
    await user.click(screen.getByRole("button", { name: "Remove SQL" }));
    expect(screen.queryByRole("button", { name: "Remove SQL" })).toBeNull();
    await user.click(findButton());
    await waitFor(() => expect(h.ai.suggestPartners).toHaveBeenCalled());
    expect(lastInput().data.wantedSkills).toBeUndefined();
  });

  test("keeps at most 8 wanted skills", async () => {
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.type(
      screen.getByLabelText(/what kind of partner/i),
      "a1,b2,c3,d4,e5,f6,g7,h8,i9,j10{Enter}",
    );
    expect(screen.getAllByRole("button", { name: /^Remove / }).length).toBe(8);
  });

  test("study times turn into exact windows (Monday evening = 17:00-22:00)", async () => {
    const { user } = renderWithClient(<PartnerMatchTool />);
    const mon = screen.getByRole("button", { name: "Mon Evening" });
    expect(mon.getAttribute("aria-pressed")).toBe("false");
    await user.click(mon);
    await user.click(screen.getByRole("button", { name: "Wed Morning" }));
    expect(mon.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/free for at least an hour within these times/i)).toBeTruthy();
    await user.click(findButton());
    await waitFor(() => expect(h.ai.suggestPartners).toHaveBeenCalled());
    expect(lastInput().data.windows).toEqual([
      { weekday: 1, start: 1020, end: 1320 },
      { weekday: 3, start: 480, end: 720 },
    ]);
  });

  test("a study time can be switched off again", async () => {
    const { user } = renderWithClient(<PartnerMatchTool />);
    const sat = screen.getByRole("button", { name: "Sat Afternoon" });
    await user.click(sat);
    await user.click(sat);
    expect(sat.getAttribute("aria-pressed")).toBe("false");
    await user.click(findButton());
    await waitFor(() => expect(h.ai.suggestPartners).toHaveBeenCalled());
    expect(lastInput().data.windows).toBeUndefined();
  });

  test("covers the whole week: 7 days x 3 time blocks", () => {
    renderWithClient(<PartnerMatchTool />);
    const cells = screen
      .getAllByRole("button")
      .filter((b) =>
        /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) (Morning|Afternoon|Evening)$/.test(
          b.getAttribute("aria-label") ?? "",
        ),
      );
    expect(cells.length).toBe(21);
  });

  test("'not overloaded' filter is sent when ticked", async () => {
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.click(screen.getByLabelText(/aren't overloaded right now/i));
    await user.click(findButton());
    await waitFor(() => expect(h.ai.suggestPartners).toHaveBeenCalled());
    expect(lastInput().data.avoidHeavy).toBe(true);
  });

  test("the button is disabled while looking, then says 'Find again'", async () => {
    const gate = deferred<PartnerResult>();
    h.ai.suggestPartners = mock(() => gate.promise);
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.click(findButton());
    await waitFor(() => expect((findButton() as HTMLButtonElement).disabled).toBe(true));
    gate.resolve(answer([person()]));
    await screen.findByText(/Zara Ali/);
    expect((findButton() as HTMLButtonElement).disabled).toBe(false);
    expect(findButton().textContent).toContain("Find again");
  });
});

describe("AI Teammate Matching > Find study partners: results", () => {
  async function showTwo() {
    h.ai.suggestPartners = mock(async () =>
      answer([
        person(),
        person({
          id: "u-omar",
          rank: 2,
          name: "Omar Reyes",
          major: null,
          university: null,
          sharedCourses: [],
          wantedSkills: [],
          newSkills: ["Figma"],
          overlapHours: 0,
          workload: "heavy",
          reason: "",
        }),
      ]),
    );
    const view = renderWithClient(<PartnerMatchTool />);
    await view.user.click(findButton());
    await screen.findByText(/Zara Ali/);
    return view;
  }

  test("lists the best match first, numbered, with who they are", async () => {
    await showTwo();
    const items = within(list()).getAllByRole("listitem");
    expect(items.length).toBe(2);
    expect(items[0]!.textContent).toContain("1. Zara Ali");
    expect(items[0]!.textContent).toContain("Computer Science · Northbridge University");
    expect(items[1]!.textContent).toContain("2. Omar Reyes");
    expect(items[1]!.textContent).toContain("Student");
  });

  test("shows each reason to match: reason, skills, shared course, free time", async () => {
    await showTwo();
    const first = within(list()).getAllByRole("listitem")[0]!;
    expect(first.textContent).toContain("Has the SQL skills you asked for");
    expect(within(first).getByText("SQL")).toBeTruthy();
    expect(within(first).getByText("CS201 Data Structures")).toBeTruthy();
    expect(within(first).getByText("+ Python")).toBeTruthy();
    expect(within(first).queryByText("+ SQL")).toBeNull(); // already shown as a requested skill
    expect(first.textContent).toContain("6.5 h/week free together");
  });

  test("shows the academic workload of each match", async () => {
    await showTwo();
    const [a, b] = within(list()).getAllByRole("listitem");
    expect(a!.textContent).toContain("light workload");
    expect(b!.textContent).toContain("heavy workload");
  });

  test("leaves out the free-time badge when nothing overlaps", async () => {
    await showTwo();
    const second = within(list()).getAllByRole("listitem")[1]!;
    expect(second.textContent).not.toContain("h/week free together");
  });

  test("'Send request' asks the database and then shows 'Request sent'", async () => {
    const { user } = await showTwo();
    const first = within(list()).getAllByRole("listitem")[0]!;
    await user.click(within(first).getByRole("button", { name: /send request/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Request sent to Zara Ali."));
    expect(h.fake.rpcCalls.filter((c) => c.name === "send_partner_request")).toEqual([
      { name: "send_partner_request", args: { _to: "u-zara" } },
    ]);
    expect(within(first).getByText("Request sent")).toBeTruthy();
    expect(within(first).queryByRole("button", { name: /send request/i })).toBeNull();
    // the other card is untouched
    const second = within(list()).getAllByRole("listitem")[1]!;
    expect(within(second).getByRole("button", { name: /send request/i })).toBeTruthy();
  });

  test("a refused request shows the reason and can be tried again", async () => {
    h.fake.failRpc("send_partner_request", {
      message: "You already have a request with this student",
    });
    const { user } = await showTwo();
    const first = within(list()).getAllByRole("listitem")[0]!;
    await user.click(within(first).getByRole("button", { name: /send request/i }));
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("You already have a request with this student"),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(within(first).getByRole("button", { name: /send request/i })).toBeTruthy();
  });

  test("'Not now' hides just that student", async () => {
    const { user } = await showTwo();
    const first = within(list()).getAllByRole("listitem")[0]!;
    await user.click(within(first).getByRole("button", { name: "Not now" }));
    expect(screen.queryByText(/Zara Ali/)).toBeNull();
    expect(screen.getByText(/Omar Reyes/)).toBeTruthy();
    expect(h.fake.rpcCalls.length).toBe(0); // nothing was sent
  });

  test("searching again clears the old results and the 'sent' marks", async () => {
    const { user } = await showTwo();
    const first = within(list()).getAllByRole("listitem")[0]!;
    await user.click(within(first).getByRole("button", { name: /send request/i }));
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    await user.click(findButton());
    await waitFor(() => expect(h.ai.suggestPartners).toHaveBeenCalledTimes(2));
    const again = within(list()).getAllByRole("listitem")[0]!;
    expect(within(again).getByRole("button", { name: /send request/i })).toBeTruthy();
  });
});

describe("AI Teammate Matching > Find study partners: when there is nothing to show", () => {
  const run = async (res: PartnerResult) => {
    h.ai.suggestPartners = mock(async () => res);
    const view = renderWithClient(<PartnerMatchTool />);
    await view.user.click(findButton());
    return view;
  };

  test("nobody discoverable left", async () => {
    await run(answer([], "none_discoverable"));
    expect(await screen.findByText("No new students to suggest")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /open settings/i })).toBeNull();
  });

  test("an empty profile points to Settings", async () => {
    await run(answer([], "profile_empty"));
    expect(await screen.findByText("Add your courses and skills first")).toBeTruthy();
    expect(screen.getByRole("link", { name: /open settings/i }).getAttribute("href")).toBe(
      "/settings",
    );
  });

  test("no overlap points to Settings too", async () => {
    await run(answer([], "no_matches"));
    expect(await screen.findByText("Nobody matches yet")).toBeTruthy();
    expect(screen.getByRole("link", { name: /open settings/i })).toBeTruthy();
  });

  test("an empty answer with no reason is treated as 'nobody matches'", async () => {
    await run(answer([], null));
    expect(await screen.findByText("Nobody matches yet")).toBeTruthy();
  });
});

describe("AI Teammate Matching > Find study partners: when it goes wrong", () => {
  test("shows the reason and lets the student retry", async () => {
    h.ai.suggestPartners = mock(async () => {
      throw new Error("The AI service is busy. Try again in a minute.");
    });
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.click(findButton());
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Couldn't find partners");
    expect(alert.textContent).toContain("The AI service is busy");

    h.ai.suggestPartners = mock(async () => answer([person()]));
    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByText(/Zara Ali/)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("unwraps an error the server sent as JSON", async () => {
    h.ai.suggestPartners = mock(async () => {
      throw new Error(JSON.stringify({ error: "NVIDIA_API_KEY is not configured." }));
    });
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.click(findButton());
    expect((await screen.findByRole("alert")).textContent).toContain(
      "NVIDIA_API_KEY is not configured.",
    );
  });

  test("an unreadable answer is reported, not shown as 'nobody matches'", async () => {
    h.ai.suggestPartners = mock(async () => ({ nope: true }));
    const { user } = renderWithClient(<PartnerMatchTool />);
    await user.click(findButton());
    expect((await screen.findByRole("alert")).textContent).toContain("unreadable answer");
    expect(screen.queryByText("Nobody matches yet")).toBeNull();
  });
});
