//#region node_modules/.nitro/vite/services/ssr/assets/partner-ranking-CGfSgEHb.js
var SESSION_MINUTES = 90;
var MIN_SESSION_MINUTES = 30;
/** Tasks due soon and booked sessions weigh more than a long backlog. */
function workloadScore(w) {
	return w.openTasks + w.dueSoon * 2 + w.sessionsWeek;
}
function workloadLevel(w) {
	const s = workloadScore(w);
	return s <= 3 ? "light" : s <= 8 ? "moderate" : "heavy";
}
var PENALTY = {
	light: 0,
	moderate: 1,
	heavy: 2.5
};
var DAY_LABELS = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
var TIME_BLOCKS = [
	{
		label: "Morning",
		start: 480,
		end: 720
	},
	{
		label: "Afternoon",
		start: 720,
		end: 1020
	},
	{
		label: "Evening",
		start: 1020,
		end: 1320
	}
];
/** Matches come from shared courses, complementary skills and free time; a heavy workload costs points. */
function matchScore(p) {
	return p.sharedCourses.length * 3 + p.newSkills.length * 1.5 + p.wantedSkills.length * 5 + p.overlapMinutes / 120 + (p.windowMinutes ?? 0) / 60;
}
function scorePartner(p) {
	return matchScore(p) - PENALTY[workloadLevel(p.workload)];
}
/** Drops anyone with no positive match (workload alone never makes a match), then ranks the rest. */
function rankPartners(people, limit = 5, opts = {}) {
	return people.filter((p) => matchScore(p) > 0).filter((p) => !opts.requireWanted || p.wantedSkills.length > 0).filter((p) => !opts.requireWindow || (p.windowMinutes ?? 0) >= 60).filter((p) => !opts.avoidHeavy || workloadLevel(p.workload) !== "heavy").map((p) => ({
		...p,
		score: scorePartner(p),
		level: workloadLevel(p.workload)
	})).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, limit);
}
/** Plain, fact-only reason used when the AI leaves one out. Never mentions a heavy workload or gaps. */
function partnerReason(p) {
	const parts = [];
	if (p.wantedSkills.length) parts.push(`has the ${p.wantedSkills.slice(0, 3).join(", ")} skills you asked for`);
	if ((p.windowMinutes ?? 0) >= 60) parts.push("is free at the times you asked for");
	if (p.sharedCourses.length) parts.push(`takes ${p.sharedCourses.slice(0, 2).join(" and ")} with you`);
	if (p.newSkills.length) parts.push(`adds ${p.newSkills.slice(0, 3).join(", ")}`);
	const h = Math.round(p.overlapMinutes / 60 * 2) / 2;
	if (h > 0) parts.push(`shares about ${h} h/week of free time`);
	if (p.level !== "heavy") parts.push(`has a ${p.level} workload right now`);
	if (!parts.length) return "";
	const text = parts.join("; ");
	return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
}
/** Best windows first: more people free, then longer. Each proposal is at most 90 minutes. */
function pickSessionSlots(windows, limit = 3) {
	return windows.filter((w) => w.end_minute - w.start_minute >= MIN_SESSION_MINUTES).sort((a, b) => b.free_count - a.free_count || b.end_minute - b.start_minute - (a.end_minute - a.start_minute) || a.weekday - b.weekday || a.start_minute - b.start_minute).slice(0, limit).map((w) => ({
		weekday: w.weekday,
		startMinute: w.start_minute,
		endMinute: Math.min(w.end_minute, w.start_minute + SESSION_MINUTES),
		freeCount: w.free_count
	}));
}
/** The next calendar date (local time) that falls on `weekday` at `minute`, strictly after `from`. */
function nextOccurrence(weekday, minute, from = /* @__PURE__ */ new Date()) {
	const d = new Date(from);
	d.setHours(0, 0, 0, 0);
	d.setMinutes(minute);
	let add = (weekday - d.getDay() + 7) % 7;
	d.setDate(d.getDate() + add);
	if (d.getTime() <= from.getTime()) {
		add = 7;
		d.setDate(d.getDate() + add);
	}
	return d;
}
//#endregion
export { pickSessionSlots as a, partnerReason as i, TIME_BLOCKS as n, rankPartners as o, nextOccurrence as r, DAY_LABELS as t };
