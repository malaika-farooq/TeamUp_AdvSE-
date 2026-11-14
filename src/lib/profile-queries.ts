// Loading and saving the student's courses, skills, availability and profile photo.
// Saves go through all-or-nothing database functions (migration 0007_profile_completion.sql).
import { supabase } from "@/integrations/supabase/client";
import {
  avatarPath,
  checkAvatarFile,
  clampLevel,
  rangesFromRows,
  type CleanProfile,
  type CourseInput,
  type Range,
  type SkillInput,
} from "./profile-data";

export const SETUP_MESSAGE =
  "Saving your profile isn't set up in the database yet. Ask the project owner to run migration 0007_profile_completion.sql in Supabase.";

/** Turns a database error into something a student can act on. */
export function profileError(error: { message?: string; code?: string } | null | undefined): Error {
  const message = error?.message ?? "";
  if (error?.code === "PGRST202" || /could not find the function|schema cache/i.test(message)) {
    return new Error(SETUP_MESSAGE);
  }
  if (/bucket not found/i.test(message)) {
    return new Error(
      "Photo storage isn't set up yet. Run migration 0007_profile_completion.sql in Supabase.",
    );
  }
  if (/row-level security|permission denied/i.test(message)) {
    return new Error("You don't have permission to do that. Please sign in again.");
  }
  return new Error(message || "Something went wrong. Please try again.");
}

export async function loadMyCourses(userId: string): Promise<CourseInput[]> {
  const { data, error } = await supabase
    .from("user_courses")
    .select("courses(code, title)")
    .eq("user_id", userId);
  if (error) throw profileError(error);
  return (data ?? [])
    .map((r) => r.courses)
    .filter((c): c is { code: string; title: string } => !!c)
    .map((c) => ({ code: c.code, title: c.title }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function loadMySkills(userId: string): Promise<SkillInput[]> {
  const { data, error } = await supabase
    .from("user_skills")
    .select("level, skills(name)")
    .eq("user_id", userId);
  if (error) throw profileError(error);
  return (data ?? [])
    .filter((r) => !!r.skills?.name)
    .map((r) => ({ name: r.skills!.name, level: clampLevel(r.level) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function loadMyAvailability(userId: string): Promise<Range[]> {
  const { data, error } = await supabase
    .from("availability_slots")
    .select("weekday, start_minute, end_minute")
    .eq("user_id", userId);
  if (error) throw profileError(error);
  return rangesFromRows(data ?? []);
}

/** Existing courses and skills, offered as suggestions so students reuse the same spelling. */
export async function loadSuggestions(): Promise<{ courses: CourseInput[]; skills: string[] }> {
  const [c, s] = await Promise.all([
    supabase.from("courses").select("code, title").order("code").limit(300),
    supabase.from("skills").select("name").order("name").limit(300),
  ]);
  return {
    courses: (c.data ?? []).map((x) => ({ code: x.code, title: x.title })),
    skills: (s.data ?? []).map((x) => x.name),
  };
}

export async function saveCourses(courses: CourseInput[]): Promise<void> {
  const { error } = await supabase.rpc("set_my_courses", { _courses: courses });
  if (error) throw profileError(error);
}

export async function saveSkills(skills: SkillInput[]): Promise<void> {
  const { error } = await supabase.rpc("set_my_skills", { _skills: skills });
  if (error) throw profileError(error);
}

export async function saveAvailability(ranges: Range[]): Promise<void> {
  const slots = ranges.map((r) => ({ weekday: r.weekday, start: r.start, end: r.end }));
  const { error } = await supabase.rpc("set_my_availability", { _slots: slots });
  if (error) throw profileError(error);
}

/* --------------------------------- Photo ---------------------------------- */

/** Public address of a stored profile photo (undefined when the person has none). */
export function avatarSrc(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

/** Validates and uploads a photo; returns the stored path. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const check = checkAvatarFile(file);
  if (!check.ok) throw new Error(check.reason);
  const path = avatarPath(userId, file.name);
  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw profileError(error);
  return path;
}

/** Best-effort cleanup of an old photo file; failures are not worth bothering the student about. */
export async function deleteAvatarFile(path: string | null | undefined): Promise<void> {
  if (!path || /^https?:\/\//i.test(path)) return;
  await supabase.storage.from("avatars").remove([path]);
}

/** Uploads a new photo, points the profile at it and removes the previous file. */
export async function changeAvatar(
  userId: string,
  file: File,
  previous: string | null | undefined,
) {
  const path = await uploadAvatar(userId, file);
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: path, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) {
    await deleteAvatarFile(path);
    throw profileError(error);
  }
  await deleteAvatarFile(previous);
  return path;
}

export async function removeAvatar(userId: string, previous: string | null | undefined) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw profileError(error);
  await deleteAvatarFile(previous);
}

/**
 * Saves the profile fields. It creates the row if it is somehow missing (an update would silently change
 * nothing) and checks that a row really came back, so a "saved" message always means it was saved.
 */
export async function saveProfile(userId: string, fields: CleanProfile): Promise<void> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() }, { onConflict: "id" })
    .select("id")
    .maybeSingle();
  if (error) throw profileError(error);
  if (!data) {
    throw new Error("Your profile couldn't be saved. Please sign out, sign back in and try again.");
  }
}
