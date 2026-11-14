import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn } from "./button-BkEFdjsN.mjs";
import { i as useQuery } from "../_libs/tanstack__react-query.mjs";
import { n as AvatarFallback$1, r as AvatarImage$1, t as Avatar$1 } from "../_libs/radix-ui__react-avatar.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/UserAvatar-CWAQ5zUT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	{
		key: "todo",
		label: "To Do"
	},
	{
		key: "in_progress",
		label: "In Progress"
	},
	{
		key: "in_review",
		label: "In Review"
	},
	{
		key: "done",
		label: "Done"
	}
];
var PRIORITIES = [
	"low",
	"medium",
	"high",
	"urgent"
];
var ACCENTS = [
	"teal",
	"lavender",
	"blue",
	"primary"
];
function accentClasses(accent) {
	switch (accent) {
		case "lavender": return "bg-lavender/15 text-lavender border-lavender/30";
		case "blue": return "bg-blue/15 text-blue border-blue/30";
		case "primary": return "bg-primary/15 text-primary border-primary/30";
		default: return "bg-teal/15 text-teal border-teal/30";
	}
}
function unwrap(res) {
	if (res.error) throw new Error(res.error.message);
	return res.data;
}
async function fetchProfile(userId) {
	const res = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
	if (res.error) throw new Error(res.error.message);
	return res.data;
}
async function fetchMyTeams() {
	const memberships = unwrap(await supabase.from("team_members").select("team_id, role, joined_at"));
	const ids = memberships.map((m) => m.team_id);
	if (!ids.length) return [];
	return unwrap(await supabase.from("teams").select("*").in("id", ids)).map((t) => ({
		...t,
		role: memberships.find((m) => m.team_id === t.id)?.role ?? "member"
	}));
}
async function fetchTeamMembers(teamId) {
	const members = unwrap(await supabase.from("team_members").select("*").eq("team_id", teamId));
	const ids = members.map((m) => m.user_id);
	const profiles = ids.length ? unwrap(await supabase.from("profiles").select("*").in("id", ids)) : [];
	return members.map((m) => ({
		...m,
		profile: profiles.find((p) => p.id === m.user_id) ?? null
	}));
}
async function fetchTasks(teamIds) {
	if (!teamIds.length) return [];
	return unwrap(await supabase.from("tasks").select("*").in("team_id", teamIds).order("position", { ascending: true }));
}
async function fetchSessions(teamIds) {
	if (!teamIds.length) return [];
	return unwrap(await supabase.from("sessions").select("*").in("team_id", teamIds).order("starts_at", { ascending: true }));
}
async function fetchResources(teamIds) {
	if (!teamIds.length) return [];
	return unwrap(await supabase.from("resources").select("*").in("team_id", teamIds).order("updated_at", { ascending: false }));
}
async function fetchNotifications() {
	return unwrap(await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50));
}
async function fetchActivity(teamIds, limit = 25) {
	if (!teamIds.length) return [];
	return unwrap(await supabase.from("activity_logs").select("*").in("team_id", teamIds).order("created_at", { ascending: false }).limit(limit));
}
async function logActivity(teamId, actorId, action, summary, entityId) {
	await supabase.from("activity_logs").insert({
		team_id: teamId,
		actor_id: actorId,
		action,
		summary,
		entity_id: entityId ?? null
	});
}
async function notify(userId, type, title, body, link, dedupeKey) {
	await supabase.from("notifications").insert({
		user_id: userId,
		type,
		title,
		body,
		link,
		dedupe_key: dedupeKey ?? null
	});
}
/** Collapses runs of whitespace and trims. */
function tidy(text) {
	return text.replace(/\s+/g, " ").trim();
}
/** Case-insensitive identity used to avoid duplicates ("python" and " Python " are the same). */
function keyOf(text) {
	return tidy(text).toLowerCase();
}
/** Splits "a, b; c\nd" into trimmed, de-duplicated entries (first spelling wins). */
function splitList(text) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const raw of text.split(/[,;\n]/)) {
		const value = tidy(raw);
		const key = value.toLowerCase();
		if (!value || seen.has(key)) continue;
		seen.add(key);
		out.push(value);
	}
	return out;
}
/**
* Turns what a student types into a course.
*   "CS101 Intro to Programming" -> CS101 / Intro to Programming
*   "math 201 - Linear Algebra"  -> MATH201 / Linear Algebra
*   "Linear Algebra"             -> no code (code stays empty; the database then reuses the title)
* Returns null for empty input.
*/
function parseCourse(input) {
	const text = tidy(input);
	if (!text) return null;
	const match = /^([A-Za-z]{2,8})[ -]?(\d{2,4}[A-Za-z]?)(?![\w])\s*[-:–—]?\s*(.*)$/.exec(text);
	if (!match) return {
		code: "",
		title: text
	};
	const code = `${match[1]}${match[2]}`.toUpperCase();
	return {
		code,
		title: tidy(match[3] ?? "") || code
	};
}
function courseKey(c) {
	const title = keyOf(c.title);
	return `${keyOf(c.code) || title}|${title}`;
}
/** How a course is shown: "CS101 · Intro to Programming", or just the title when there is no code. */
function courseLabel(c) {
	const code = tidy(c.code);
	const title = tidy(c.title);
	if (!code || keyOf(code) === keyOf(title)) return title;
	return `${code} · ${title}`;
}
/** Adds courses typed as free text (comma-separated); skips ones already in the list. */
function addCourses(current, typed) {
	const next = [...current];
	const seen = new Set(next.map(courseKey));
	for (const part of typed.split(/[,;\n]/)) {
		const course = parseCourse(part);
		if (!course) continue;
		const key = courseKey(course);
		if (seen.has(key)) continue;
		seen.add(key);
		next.push(course);
	}
	return next.slice(0, 30);
}
var SKILL_LEVELS = [
	{
		value: 1,
		label: "Beginner"
	},
	{
		value: 2,
		label: "Basic"
	},
	{
		value: 3,
		label: "Comfortable"
	},
	{
		value: 4,
		label: "Strong"
	},
	{
		value: 5,
		label: "Expert"
	}
];
function clampLevel(value) {
	if (!Number.isFinite(value)) return 3;
	return Math.min(5, Math.max(1, Math.round(value)));
}
/** Adds skills typed as free text (comma-separated) at the default level; skips duplicates. */
function addSkills(current, typed, level = 3) {
	const next = [...current];
	const seen = new Set(next.map((s) => keyOf(s.name)));
	for (const name of splitList(typed)) {
		if (name.length > 40) continue;
		const key = keyOf(name);
		if (seen.has(key)) continue;
		seen.add(key);
		next.push({
			name,
			level: clampLevel(level)
		});
	}
	return next.slice(0, 40);
}
var DAY_END = 1440;
/** Sorts and merges overlapping or touching ranges on the same weekday. */
function mergeRanges(ranges) {
	const sorted = ranges.filter((r) => r.end > r.start).map((r) => ({ ...r })).sort((a, b) => a.weekday - b.weekday || a.start - b.start);
	const out = [];
	for (const r of sorted) {
		const last = out[out.length - 1];
		if (last && last.weekday === r.weekday && r.start <= last.end) last.end = Math.max(last.end, r.end);
		else out.push(r);
	}
	return out;
}
/** Removes the interval [start, end) from every range on that weekday. */
function subtractRange(ranges, weekday, start, end) {
	const out = [];
	for (const r of ranges) {
		if (r.weekday !== weekday || r.end <= start || r.start >= end) {
			out.push(r);
			continue;
		}
		if (r.start < start) out.push({
			weekday,
			start: r.start,
			end: start
		});
		if (r.end > end) out.push({
			weekday,
			start: end,
			end: r.end
		});
	}
	return out;
}
/** True when the whole interval is free. */
function covers(ranges, weekday, start, end) {
	return mergeRanges(ranges).some((r) => r.weekday === weekday && r.start <= start && r.end >= end);
}
/** Turns a time block (e.g. Morning) on or off for a day. */
function toggleBlock(ranges, weekday, start, end) {
	if (covers(ranges, weekday, start, end)) return mergeRanges(subtractRange(ranges, weekday, start, end));
	return mergeRanges([...ranges, {
		weekday,
		start,
		end
	}]);
}
/** Checks a custom time range typed or picked by the student. */
function checkRange(start, end) {
	if (!Number.isInteger(start) || !Number.isInteger(end)) return {
		ok: false,
		reason: "Pick a start and an end time."
	};
	if (start < 0 || end > 1440) return {
		ok: false,
		reason: "Times must be within one day."
	};
	if (end <= start) return {
		ok: false,
		reason: "The end time must be after the start time."
	};
	if (start % 30 !== 0 || end % 30 !== 0) return {
		ok: false,
		reason: "Times must be on the hour or half hour."
	};
	return { ok: true };
}
function addRange(ranges, weekday, start, end) {
	return mergeRanges([...ranges, {
		weekday,
		start,
		end
	}]);
}
function removeRange(ranges, target) {
	return ranges.filter((r) => !(r.weekday === target.weekday && r.start === target.start && r.end === target.end));
}
/** "9:00 AM", "12:30 PM", "12:00 AM" (and 1440 shows as midnight). */
function formatMinute(minute) {
	const total = minute % DAY_END;
	const h = Math.floor(total / 60);
	const m = total % 60;
	const suffix = h >= 12 ? "PM" : "AM";
	return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${suffix}`;
}
function formatRange(r) {
	return `${formatMinute(r.start)} – ${formatMinute(r.end)}`;
}
function totalHours(ranges) {
	const minutes = mergeRanges(ranges).reduce((sum, r) => sum + (r.end - r.start), 0);
	return Math.round(minutes / 60 * 10) / 10;
}
/** Every 30-minute time of day as a picker option (00:00 up to and including 24:00). */
function timeOptions() {
	const out = [];
	for (let m = 0; m <= DAY_END; m += 30) out.push({
		value: m,
		label: formatMinute(m)
	});
	return out;
}
/** Rows as stored in the database -> ranges. */
function rangesFromRows(rows) {
	return mergeRanges(rows.map((r) => ({
		weekday: r.weekday,
		start: r.start_minute,
		end: r.end_minute
	})));
}
var AVATAR_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif"
];
function checkAvatarFile(file) {
	if (!AVATAR_TYPES.includes(file.type)) return {
		ok: false,
		reason: "Use a JPG, PNG, WebP or GIF image."
	};
	if (file.size > 2097152) return {
		ok: false,
		reason: "The photo must be 2 MB or smaller."
	};
	if (file.size === 0) return {
		ok: false,
		reason: "That file is empty."
	};
	return { ok: true };
}
/** A safe storage path under the user's own folder. */
function avatarPath(userId, fileName, now = Date.now()) {
	const ext = /\.(jpe?g|png|webp|gif)$/i.exec(fileName)?.[1]?.toLowerCase() ?? "jpg";
	return `${userId}/avatar-${now}.${ext === "jpeg" ? "jpg" : ext}`;
}
function initialsOf(name, fallback = "S") {
	const parts = tidy(name ?? "").split(" ").filter(Boolean);
	if (!parts.length) return fallback.slice(0, 2).toUpperCase();
	const first = parts[0] ?? "";
	const last = parts.length > 1 ? parts[parts.length - 1] ?? "" : "";
	return ((first[0] ?? "") + (last[0] ?? first[1] ?? "")).toUpperCase();
}
function profileCompleteness(f) {
	const checks = [
		[f.hasPhoto, "Add a profile photo"],
		[!!tidy(f.university ?? ""), "Add your university"],
		[!!tidy(f.major ?? ""), "Add your major"],
		[!!tidy(f.bio ?? ""), "Write a short bio"],
		[f.courseCount > 0, "Add your enrolled courses"],
		[f.skillCount > 0, "Add your skills"],
		[f.availableMinutes >= 120, "Mark when you are free each week"]
	];
	const done = checks.filter(([ok]) => ok).length;
	return {
		percent: Math.round(done / checks.length * 100),
		missing: checks.filter(([ok]) => !ok).map(([, label]) => label)
	};
}
var PROFILE_LIMITS = {
	name: 80,
	university: 120,
	major: 120,
	bio: 500
};
/** True for a real IANA time zone such as "America/Toronto" or "UTC". */
function isValidTimeZone(zone) {
	try {
		new Intl.DateTimeFormat("en", { timeZone: zone });
		return true;
	} catch {
		return false;
	}
}
/** Checks and tidies the profile form before it is saved. Blank optional fields become null. */
function validateProfile(form) {
	const name = tidy(form.display_name);
	if (!name) return {
		ok: false,
		error: "Please enter your name."
	};
	if (name.length > PROFILE_LIMITS.name) return {
		ok: false,
		error: `Your name can be at most ${PROFILE_LIMITS.name} characters.`
	};
	const university = tidy(form.university);
	if (university.length > PROFILE_LIMITS.university) return {
		ok: false,
		error: `University can be at most ${PROFILE_LIMITS.university} characters.`
	};
	const major = tidy(form.major);
	if (major.length > PROFILE_LIMITS.major) return {
		ok: false,
		error: `Major can be at most ${PROFILE_LIMITS.major} characters.`
	};
	const bio = form.bio.trim();
	if (bio.length > PROFILE_LIMITS.bio) return {
		ok: false,
		error: `Your bio can be at most ${PROFILE_LIMITS.bio} characters.`
	};
	const timezone = form.timezone.trim() || "UTC";
	if (!isValidTimeZone(timezone)) return {
		ok: false,
		error: "That time zone isn't recognised. Try something like America/Toronto."
	};
	return {
		ok: true,
		value: {
			display_name: name,
			university: university || null,
			major: major || null,
			bio: bio || null,
			timezone,
			discoverable: form.discoverable
		}
	};
}
var Avatar = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar$1, {
	ref,
	className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
	...props
}));
Avatar.displayName = Avatar$1.displayName;
var AvatarImage = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage$1, {
	ref,
	className: cn("aspect-square h-full w-full", className),
	...props
}));
AvatarImage.displayName = AvatarImage$1.displayName;
var AvatarFallback = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback$1, {
	ref,
	className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className),
	...props
}));
AvatarFallback.displayName = AvatarFallback$1.displayName;
var SETUP_MESSAGE = "Saving your profile isn't set up in the database yet. Ask the project owner to run migration 0007_profile_completion.sql in Supabase.";
/** Turns a database error into something a student can act on. */
function profileError(error) {
	const message = error?.message ?? "";
	if (error?.code === "PGRST202" || /could not find the function|schema cache/i.test(message)) return /* @__PURE__ */ new Error(SETUP_MESSAGE);
	if (/bucket not found/i.test(message)) return /* @__PURE__ */ new Error("Photo storage isn't set up yet. Run migration 0007_profile_completion.sql in Supabase.");
	if (/row-level security|permission denied/i.test(message)) return /* @__PURE__ */ new Error("You don't have permission to do that. Please sign in again.");
	return new Error(message || "Something went wrong. Please try again.");
}
async function loadMyCourses(userId) {
	const { data, error } = await supabase.from("user_courses").select("courses(code, title)").eq("user_id", userId);
	if (error) throw profileError(error);
	return (data ?? []).map((r) => r.courses).filter((c) => !!c).map((c) => ({
		code: c.code,
		title: c.title
	})).sort((a, b) => a.title.localeCompare(b.title));
}
async function loadMySkills(userId) {
	const { data, error } = await supabase.from("user_skills").select("level, skills(name)").eq("user_id", userId);
	if (error) throw profileError(error);
	return (data ?? []).filter((r) => !!r.skills?.name).map((r) => ({
		name: r.skills.name,
		level: clampLevel(r.level)
	})).sort((a, b) => a.name.localeCompare(b.name));
}
async function loadMyAvailability(userId) {
	const { data, error } = await supabase.from("availability_slots").select("weekday, start_minute, end_minute").eq("user_id", userId);
	if (error) throw profileError(error);
	return rangesFromRows(data ?? []);
}
/** Existing courses and skills, offered as suggestions so students reuse the same spelling. */
async function loadSuggestions() {
	const [c, s] = await Promise.all([supabase.from("courses").select("code, title").order("code").limit(300), supabase.from("skills").select("name").order("name").limit(300)]);
	return {
		courses: (c.data ?? []).map((x) => ({
			code: x.code,
			title: x.title
		})),
		skills: (s.data ?? []).map((x) => x.name)
	};
}
async function saveCourses(courses) {
	const { error } = await supabase.rpc("set_my_courses", { _courses: courses });
	if (error) throw profileError(error);
}
async function saveSkills(skills) {
	const { error } = await supabase.rpc("set_my_skills", { _skills: skills });
	if (error) throw profileError(error);
}
async function saveAvailability(ranges) {
	const slots = ranges.map((r) => ({
		weekday: r.weekday,
		start: r.start,
		end: r.end
	}));
	const { error } = await supabase.rpc("set_my_availability", { _slots: slots });
	if (error) throw profileError(error);
}
/** Public address of a stored profile photo (undefined when the person has none). */
function avatarSrc(path) {
	if (!path) return void 0;
	if (/^https?:\/\//i.test(path)) return path;
	return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}
/** A temporary link that works even when the avatars bucket is private. */
async function signedAvatarUrl(path) {
	if (/^https?:\/\//i.test(path)) return path;
	const { data, error } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
	return error ? null : data?.signedUrl ?? null;
}
/** Validates and uploads a photo; returns the stored path. */
async function uploadAvatar(userId, file) {
	const check = checkAvatarFile(file);
	if (!check.ok) throw new Error(check.reason);
	const path = avatarPath(userId, file.name);
	const { error } = await supabase.storage.from("avatars").upload(path, file, {
		contentType: file.type,
		upsert: false
	});
	if (error) throw profileError(error);
	return path;
}
/** Best-effort cleanup of an old photo file; failures are not worth bothering the student about. */
async function deleteAvatarFile(path) {
	if (!path || /^https?:\/\//i.test(path)) return;
	await supabase.storage.from("avatars").remove([path]);
}
/** Uploads a new photo, points the profile at it and removes the previous file. */
async function changeAvatar(userId, file, previous) {
	const path = await uploadAvatar(userId, file);
	const { error } = await supabase.from("profiles").update({
		avatar_url: path,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", userId);
	if (error) {
		await deleteAvatarFile(path);
		throw profileError(error);
	}
	await deleteAvatarFile(previous);
	return path;
}
async function removeAvatar(userId, previous) {
	const { error } = await supabase.from("profiles").update({
		avatar_url: null,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", userId);
	if (error) throw profileError(error);
	await deleteAvatarFile(previous);
}
/**
* Saves the profile fields. It creates the row if it is somehow missing (an update would silently change
* nothing) and checks that a row really came back, so a "saved" message always means it was saved.
*/
async function saveProfile(userId, fields) {
	const { data, error } = await supabase.from("profiles").upsert({
		id: userId,
		...fields,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "id" }).select("id, display_name, university, major, bio, timezone, discoverable").maybeSingle();
	if (error) throw profileError(error);
	if (!data) throw new Error("Your profile couldn't be saved. Please sign out, sign back in and try again.");
	const kept = data;
	const lost = Object.keys(fields).filter((k) => k in kept && kept[k] !== fields[k]);
	if (lost.length > 0) throw new Error(`The database didn't keep your ${lost.join(", ").replace("display_name", "name")}. Please try again, or ask the project owner to check the profiles table.`);
}
/**
* A person's photo, or their initials when they have none. `path` is the stored avatar path.
* It tries the public address first; if the picture can't be loaded (for example the storage bucket is
* private) it asks for a temporary signed link instead, so the photo shows either way.
*/
function UserAvatar({ name, path, className, fallbackClassName }) {
	const [failed, setFailed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setFailed(false), [path]);
	const signed = useQuery({
		queryKey: ["avatar-signed", path],
		enabled: failed && !!path,
		staleTime: 3e6,
		queryFn: () => signedAvatarUrl(path)
	});
	const src = failed ? signed.data ?? void 0 : avatarSrc(path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Avatar, {
		className,
		children: [src && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarImage, {
			src,
			alt: name ? `${name}'s photo` : "Profile photo",
			className: "object-cover",
			onLoadingStatusChange: (status) => {
				if (status === "error" && !failed) setFailed(true);
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvatarFallback, {
			className: cn("bg-navy text-xs font-semibold text-navy-foreground", fallbackClassName),
			children: initialsOf(name)
		})]
	});
}
//#endregion
export { loadMyAvailability as A, removeAvatar as B, fetchProfile as C, fetchTeamMembers as D, fetchTasks as E, mergeRanges as F, saveSkills as G, saveAvailability as H, notify as I, toggleBlock as J, tidy as K, parseCourse as L, loadMySkills as M, loadSuggestions as N, formatRange as O, logActivity as P, profileCompleteness as R, fetchNotifications as S, fetchSessions as T, saveCourses as U, removeRange as V, saveProfile as W, uploadAvatar as X, totalHours as Y, validateProfile as Z, courseLabel as _, SKILL_LEVELS as a, fetchActivity as b, accentClasses as c, addSkills as d, changeAvatar as f, courseKey as g, clampLevel as h, PROFILE_LIMITS as i, loadMyCourses as j, keyOf as k, addCourses as l, checkRange as m, AVATAR_TYPES as n, STATUSES as o, checkAvatarFile as p, timeOptions as q, PRIORITIES as r, UserAvatar as s, ACCENTS as t, addRange as u, covers as v, fetchResources as w, fetchMyTeams as x, deleteAvatarFile as y, profileError as z };
