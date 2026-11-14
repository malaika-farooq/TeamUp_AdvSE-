import { beforeEach, describe, expect, test } from "bun:test";
import { screen, waitFor, within } from "@testing-library/react";
import { AcademicTab } from "../../src/components/app/settings/AcademicTab";
import { h, resetHarness } from "../helpers/harness";
import { renderWithClient } from "../helpers/render";

const saveButton = () =>
  screen.getByRole("button", { name: /save courses & skills/i }) as HTMLButtonElement;
const courseBox = () => screen.getByLabelText("Enrolled courses") as HTMLInputElement;
const skillBox = () => screen.getByLabelText("Skills and interests") as HTMLInputElement;
const courseList = () => screen.getByRole("list", { name: "Your courses" });
const skillList = () => screen.getByRole("list", { name: "Your skills" });
const rpc = (name: string) => h.fake.rpcCalls.filter((c) => c.name === name);

type U = ReturnType<typeof renderWithClient>["user"];
const addCourse = async (user: U, text: string) => {
  await user.type(courseBox(), `${text}{Enter}`);
};
const addSkill = async (user: U, text: string) => {
  await user.type(skillBox(), `${text}{Enter}`);
};

beforeEach(() => {
  resetHarness();
  h.fake.seed("user_courses", [
    { user_id: "user-1", courses: { code: "CS101", title: "Intro to Programming" } },
    { user_id: "user-1", courses: { code: "MATH210", title: "Linear Algebra" } },
  ]);
  h.fake.seed("user_skills", [
    { user_id: "user-1", level: 4, skills: { name: "Python" } },
    { user_id: "user-1", level: 2, skills: { name: "SQL" } },
  ]);
  h.fake.seed("courses", [
    { code: "CS101", title: "Intro to Programming" },
    { code: "CS340", title: "Databases" },
  ]);
  h.fake.seed("skills", [{ name: "Python" }, { name: "SQL" }, { name: "React" }]);
});

describe("Settings > Courses & skills: loading", () => {
  test("shows saved courses and skills", async () => {
    renderWithClient(<AcademicTab />);
    expect(
      await within(await screen.findByRole("list", { name: "Your courses" })).findByText(
        "CS101 · Intro to Programming",
      ),
    ).toBeTruthy();
    expect(within(courseList()).getByText("MATH210 · Linear Algebra")).toBeTruthy();
    expect(within(skillList()).getByText("Python")).toBeTruthy();
    expect(within(skillList()).getByText("SQL")).toBeTruthy();
  });

  test("shows each skill's level", async () => {
    renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your skills" });
    expect((screen.getByLabelText("Level for Python") as HTMLSelectElement).value).toBe("4");
    expect((screen.getByLabelText("Level for SQL") as HTMLSelectElement).value).toBe("2");
  });

  test("offers the five skill levels with names", async () => {
    renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your skills" });
    const options = within(screen.getByLabelText("Level for Python"))
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(options).toEqual(["Beginner", "Basic", "Comfortable", "Strong", "Expert"]);
  });

  test("says so when there is nothing yet", async () => {
    h.fake.seed("user_courses", []);
    h.fake.seed("user_skills", []);
    renderWithClient(<AcademicTab />);
    expect(await screen.findByText(/no courses yet/i)).toBeTruthy();
    expect(screen.getByText("No skills yet.")).toBeTruthy();
  });

  test("suggests existing courses and skills that aren't already chosen", async () => {
    const { container } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    const options = Array.from(container.querySelectorAll("datalist option")).map((o) =>
      o.getAttribute("value"),
    );
    expect(options).toContain("CS340 Databases");
    expect(options).toContain("React");
    expect(options).not.toContain("CS101 Intro to Programming");
    expect(options).not.toContain("Python");
  });

  test("shows an error and a retry when saved data can't be loaded", async () => {
    h.fake.failTable("user_courses", "select", { message: "Network down" });
    const { user } = renderWithClient(<AcademicTab />);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("Network down");
    await user.click(within(alert).getByRole("button", { name: /try again/i }));
    expect(
      await within(await screen.findByRole("list", { name: "Your courses" })).findByText(
        "CS101 · Intro to Programming",
      ),
    ).toBeTruthy();
  });
});

describe("Settings > Courses & skills: editing", () => {
  test("Save is disabled until something changes", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    expect(saveButton().disabled).toBe(true);
    expect(screen.queryByText(/unsaved changes/i)).toBeNull();
    await addCourse(user, "CS201 Data Structures");
    expect(saveButton().disabled).toBe(false);
    expect(screen.getByText(/you have unsaved changes/i)).toBeTruthy();
  });

  test("adding then removing a course puts things back, so there is nothing to save", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "CS201 Data Structures");
    await user.click(screen.getByRole("button", { name: "Remove CS201 · Data Structures" }));
    expect(saveButton().disabled).toBe(true);
  });

  test("splits a typed course into code and title", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "math 301 - Probability");
    expect(within(courseList()).getByText("MATH301 · Probability")).toBeTruthy();
  });

  test("the Add button works as well as Enter", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await user.type(courseBox(), "CS201 Data Structures");
    const addButtons = screen.getAllByRole("button", { name: "Add" });
    await user.click(addButtons[0]!);
    expect(within(courseList()).getByText("CS201 · Data Structures")).toBeTruthy();
    expect(courseBox().value).toBe("");
  });

  test("several courses can be typed at once with commas", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "CS201 Data Structures, PHYS150 Mechanics");
    expect(within(courseList()).getByText("CS201 · Data Structures")).toBeTruthy();
    expect(within(courseList()).getByText("PHYS150 · Mechanics")).toBeTruthy();
  });

  test("ignores a course that is already there, whatever the letter case", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "cs101 INTRO TO PROGRAMMING");
    expect(within(courseList()).getAllByRole("listitem")).toHaveLength(2);
    expect(saveButton().disabled).toBe(true);
  });

  test("a course typed without a code is kept by its title", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "Technical Writing");
    expect(within(courseList()).getByText("Technical Writing")).toBeTruthy();
  });

  test("skills are added at the middle level and can be changed", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your skills" });
    await addSkill(user, "React");
    expect((screen.getByLabelText("Level for React") as HTMLSelectElement).value).toBe("3");
    await user.selectOptions(screen.getByLabelText("Level for React"), "5");
    expect((screen.getByLabelText("Level for React") as HTMLSelectElement).value).toBe("5");
    expect(saveButton().disabled).toBe(false);
  });

  test("several skills can be typed at once, and duplicates are ignored", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your skills" });
    await addSkill(user, "React, python, Docker, docker");
    expect(within(skillList()).getAllByRole("listitem")).toHaveLength(4); // Python, SQL, React, Docker
  });

  test("a skill name over 40 characters is not added", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your skills" });
    await user.type(skillBox(), "s".repeat(41));
    await user.keyboard("{Enter}");
    expect(within(skillList()).getAllByRole("listitem")).toHaveLength(2);
  });

  test("a skill can be removed", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your skills" });
    await user.click(screen.getByRole("button", { name: "Remove SQL" }));
    expect(within(skillList()).queryByText("SQL")).toBeNull();
    expect(saveButton().disabled).toBe(false);
  });
});

describe("Settings > Courses & skills: saving", () => {
  test("saves courses and skills exactly as shown", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "CS201 Data Structures");
    await user.click(screen.getByRole("button", { name: "Remove MATH210 · Linear Algebra" }));
    await addSkill(user, "React");
    await user.selectOptions(screen.getByLabelText("Level for Python"), "5");
    await user.click(saveButton());

    await waitFor(() => expect(h.toast.success).toHaveBeenCalledWith("Courses and skills saved"));
    expect(rpc("set_my_courses")[0]!.args).toEqual({
      _courses: [
        { code: "CS101", title: "Intro to Programming" },
        { code: "CS201", title: "Data Structures" },
      ],
    });
    expect(rpc("set_my_skills")[0]!.args).toEqual({
      _skills: [
        { name: "Python", level: 5 },
        { name: "SQL", level: 2 },
        { name: "React", level: 3 },
      ],
    });
  });

  test("saves courses before skills", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addSkill(user, "React");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    const order = h.fake.rpcCalls.map((c) => c.name);
    expect(order.indexOf("set_my_courses")).toBeLessThan(order.indexOf("set_my_skills"));
  });

  test("after saving, the page shows the saved state and nothing is 'unsaved'", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "CS201 Data Structures");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    await waitFor(() => expect(saveButton().disabled).toBe(true));
    expect(screen.queryByText(/unsaved changes/i)).toBeNull();
    expect(within(courseList()).getByText("CS201 · Data Structures")).toBeTruthy();
  });

  test("a course without a code still settles to 'saved' afterwards", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "Technical Writing");
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    await waitFor(() => expect(saveButton().disabled).toBe(true));
    expect(within(courseList()).getByText("Technical Writing")).toBeTruthy();
  });

  test("an empty list can be saved (removing everything)", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await user.click(screen.getByRole("button", { name: "Remove CS101 · Intro to Programming" }));
    await user.click(screen.getByRole("button", { name: "Remove MATH210 · Linear Algebra" }));
    await user.click(saveButton());
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
    expect(rpc("set_my_courses")[0]!.args).toEqual({ _courses: [] });
    expect(await screen.findByText(/no courses yet/i)).toBeTruthy();
  });

  test("Save is disabled while saving", async () => {
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "CS201 Data Structures");
    await user.click(saveButton());
    expect(saveButton().disabled).toBe(true);
    await waitFor(() => expect(h.toast.success).toHaveBeenCalled());
  });
});

describe("Settings > Courses & skills: when saving goes wrong", () => {
  test("explains a database that hasn't been set up", async () => {
    h.fake.failRpc("set_my_courses", {
      message: "Could not find the function public.set_my_courses",
      code: "PGRST202",
    });
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "CS201 Data Structures");
    await user.click(saveButton());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith(
        expect.stringContaining("0007_profile_completion.sql"),
      ),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(screen.getByText(/you have unsaved changes/i)).toBeTruthy();
    expect(saveButton().disabled).toBe(false);
  });

  test("shows a validation message from the database", async () => {
    h.fake.failRpc("set_my_courses", { message: "Course title is too long (max 120 characters)" });
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "CS201 Data Structures");
    await user.click(saveButton());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("Course title is too long (max 120 characters)"),
    );
  });

  test("if skills fail after courses were saved, says so and keeps the edits", async () => {
    h.fake.failRpc("set_my_skills", { message: "You can list at most 40 skills" });
    const { user } = renderWithClient(<AcademicTab />);
    await screen.findByRole("list", { name: "Your courses" });
    await addCourse(user, "CS201 Data Structures");
    await addSkill(user, "React");
    await user.click(saveButton());
    await waitFor(() =>
      expect(h.toast.error).toHaveBeenCalledWith("You can list at most 40 skills"),
    );
    expect(h.toast.success).not.toHaveBeenCalled();
    expect(within(skillList()).getByText("React")).toBeTruthy();
    expect(saveButton().disabled).toBe(false);
  });
});
