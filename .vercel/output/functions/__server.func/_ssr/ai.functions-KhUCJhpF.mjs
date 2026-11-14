import { l as createServerFn } from "./createServerFn-BhqelEmK.mjs";
import { t as createServerRpc } from "./createServerRpc-DSPYtqIT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-CVhGCUbY.mjs";
import { i as friendlyAIError, n as aiJson, t as UNTRUSTED_NOTE } from "./ai-gateway-DhABLHmq.mjs";
import { r as buildTeamContext, t as assertTeamMember } from "./ai-context-Do3x7TGT.mjs";
import { n as matchWantedSkills, r as rankCandidates, t as factualReason } from "./teammate-ranking-DCXNbdin.mjs";
import { a as numberType, o as objectType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.functions-KhUCJhpF.js
var DAY = 864e5;
var PRIORITIES = [
	"low",
	"medium",
	"high",
	"urgent"
];
var draftTaskPlan_createServerFn_handler = createServerRpc({
	id: "7c6328d4e7394546f68853cc682d21bce05ec5f1dc7315896bc31ff1a54279e2",
	name: "draftTaskPlan",
	filename: "src/lib/ai.functions.ts"
}, (opts) => draftTaskPlan.__executeServer(opts));
var draftTaskPlan = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	teamId: stringType().uuid(),
	focus: stringType().max(500).optional(),
	count: numberType().int().min(3).max(10).optional()
}).parse(d)).handler(draftTaskPlan_createServerFn_handler, async ({ data, context }) => {
	const ctx = await buildTeamContext(context.supabase, context.userId, data.teamId, { noteChars: 300 });
	const count = data.count ?? 6;
	const today = new Date(ctx.now);
	const deadline = ctx.team.deadline ? new Date(ctx.team.deadline) : null;
	let raw;
	try {
		raw = await aiJson([{
			role: "system",
			content: `You plan student group projects. Propose exactly ${count} new, concrete tasks that move the team toward its goal. Do not repeat existing tasks. Spread due dates sensibly between tomorrow and the deadline (or over the next 4 weeks if there is no deadline), ordering foundational work first. For each task, suggest the member whose recorded skills fit best and give a one-sentence reason that names the skill; use an empty assignee when no recorded skill fits. Balance workload across members. Add 2-4 short checklist steps per task. ${UNTRUSTED_NOTE}`
		}, {
			role: "user",
			content: `${ctx.text}\n\nEXTRA FOCUS FROM THE STUDENT: ${data.focus?.trim() || "none"}`
		}], "task_plan", {
			type: "object",
			additionalProperties: false,
			required: ["tasks"],
			properties: { tasks: {
				type: "array",
				items: {
					type: "object",
					additionalProperties: false,
					required: [
						"title",
						"description",
						"priority",
						"dueDate",
						"assignee",
						"assigneeReason",
						"checklist"
					],
					properties: {
						title: { type: "string" },
						description: { type: "string" },
						priority: {
							type: "string",
							enum: [...PRIORITIES]
						},
						dueDate: {
							type: "string",
							description: "YYYY-MM-DD"
						},
						assignee: {
							type: "string",
							description: "Exact member name, or empty string"
						},
						assigneeReason: { type: "string" },
						checklist: {
							type: "array",
							items: { type: "string" }
						}
					}
				}
			} }
		});
	} catch (e) {
		throw new Error(friendlyAIError(e));
	}
	const minDue = new Date(today.getTime() + DAY);
	return {
		tasks: (raw.tasks ?? []).slice(0, count).map((t, i) => {
			let due = /* @__PURE__ */ new Date(`${t.dueDate}T17:00:00Z`);
			if (Number.isNaN(due.getTime())) due = new Date(today.getTime() + (i + 1) * 3 * DAY);
			if (due < minDue) due = minDue;
			if (deadline && due > deadline) due = deadline;
			const member = ctx.members.find((m) => t.assignee && m.name.toLowerCase() === t.assignee.trim().toLowerCase());
			return {
				title: t.title.slice(0, 200),
				description: t.description ?? "",
				priority: PRIORITIES.includes(t.priority) ? t.priority : "medium",
				dueDate: due.toISOString(),
				assigneeId: member?.id ?? null,
				assigneeName: member?.name ?? null,
				assigneeReason: member ? t.assigneeReason : "",
				checklist: (t.checklist ?? []).filter(Boolean).slice(0, 5)
			};
		}),
		members: ctx.members.map((m) => ({
			id: m.id,
			name: m.name
		})),
		deadline: ctx.team.deadline
	};
});
var LOAD_ERROR = "Couldn't load student profiles to compare. Please try again.";
var suggestTeammates_createServerFn_handler = createServerRpc({
	id: "fba7fc8273d3524db1f0de50e7dc7d2f67375b11e725b8407b9e6a48b7d22e77",
	name: "suggestTeammates",
	filename: "src/lib/ai.functions.ts"
}, (opts) => suggestTeammates.__executeServer(opts));
var suggestTeammates = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
	teamId: stringType().uuid(),
	wantedSkills: arrayType(stringType().trim().min(1).max(40)).max(8).optional()
}).parse(d)).handler(suggestTeammates_createServerFn_handler, async ({ data, context }) => {
	const wanted = data.wantedSkills ?? [];
	const sb = context.supabase;
	await assertTeamMember(sb, context.userId, data.teamId);
	const [teamRes, membersRes, teamSkillsRes, candidatesRes] = await Promise.all([
		sb.from("teams").select("name, project_goal, course_id").eq("id", data.teamId).single(),
		sb.from("team_members").select("user_id").eq("team_id", data.teamId),
		sb.rpc("team_member_skills", { _team: data.teamId }),
		sb.from("profiles").select("id, display_name, avatar_url, university, major, bio, discoverable").eq("discoverable", true).neq("id", context.userId).limit(200)
	]);
	if (teamRes.error || membersRes.error || teamSkillsRes.error || candidatesRes.error) {
		console.error("[teammates] load failed", teamRes.error ?? membersRes.error ?? teamSkillsRes.error ?? candidatesRes.error);
		throw new Error(LOAD_ERROR);
	}
	const team = teamRes.data;
	const memberIds = (membersRes.data ?? []).map((m) => m.user_id);
	const everyone = candidatesRes.data ?? [];
	if (!everyone.length) return {
		suggestions: [],
		empty: "none_discoverable"
	};
	const pool = everyone.filter((c) => !memberIds.includes(c.id));
	if (!pool.length) return {
		suggestions: [],
		empty: "all_members"
	};
	const poolIds = pool.map((p) => p.id);
	const avatars = new Map(pool.map((p) => [p.id, p.avatar_url]));
	const [teamCoursesRes, poolCoursesRes, poolSkillsRes, overlapRes] = await Promise.all([
		sb.from("user_courses").select("course_id").in("user_id", memberIds),
		sb.from("user_courses").select("user_id, course_id, courses(code, title)").in("user_id", poolIds),
		sb.from("user_skills").select("user_id, level, skills(name)").in("user_id", poolIds),
		sb.rpc("candidate_availability_overlap", {
			_team: data.teamId,
			_candidates: poolIds
		})
	]);
	if (teamCoursesRes.error || poolCoursesRes.error || poolSkillsRes.error || overlapRes.error) {
		console.error("[teammates] facts failed", teamCoursesRes.error ?? poolCoursesRes.error ?? poolSkillsRes.error ?? overlapRes.error);
		throw new Error(LOAD_ERROR);
	}
	const teamCourseIds = new Set((teamCoursesRes.data ?? []).map((c) => c.course_id));
	if (team.course_id) teamCourseIds.add(team.course_id);
	const teamSkillNames = new Set((teamSkillsRes.data ?? []).map((s) => s.skill.toLowerCase()));
	const ranked = rankCandidates(pool.map((p) => ({
		id: p.id,
		name: p.display_name,
		discoverable: p.discoverable,
		major: p.major,
		university: p.university,
		bio: p.bio,
		sharedCourses: (poolCoursesRes.data ?? []).filter((c) => c.user_id === p.id && teamCourseIds.has(c.course_id)).map((c) => c.courses ? `${c.courses.code} ${c.courses.title}` : "a shared course"),
		newSkills: [...new Set((poolSkillsRes.data ?? []).filter((s) => s.user_id === p.id && s.skills && !teamSkillNames.has(s.skills.name.toLowerCase())).map((s) => s.skills.name))],
		overlapMinutes: (overlapRes.data ?? []).find((o) => o.candidate_id === p.id)?.overlap_minutes ?? 0,
		wantedSkills: matchWantedSkills((poolSkillsRes.data ?? []).filter((s) => s.user_id === p.id && s.skills).map((s) => s.skills.name), wanted)
	})), memberIds, 4, { requireWanted: wanted.length > 0 });
	if (!ranked.length) return {
		suggestions: [],
		empty: "no_matches"
	};
	const keyed = ranked.map((c, i) => ({
		key: `c${i + 1}`,
		c
	}));
	const facts = (c) => {
		const f = [];
		if (c.wantedSkills?.length) f.push(`has the skills you asked for: ${c.wantedSkills.join(", ")}`);
		if (c.sharedCourses.length) f.push(`shared courses: ${c.sharedCourses.join(", ")}`);
		if (c.newSkills.length) f.push(`skills the team lacks: ${c.newSkills.join(", ")}`);
		const h = Math.round(c.overlapMinutes / 60 * 2) / 2;
		if (h > 0) f.push(`overlapping free time: ${h} h/week`);
		return f.join(" | ");
	};
	let reasons;
	try {
		reasons = await aiJson([{
			role: "system",
			content: `For each candidate, write one short, friendly sentence (under 30 words) on why they would help this student team. Name the most useful specific facts: shared courses first, then the skills the user asked for, then 2-3 of the skills the team lacks, then overlapping free time. Use only the listed facts. Do not mention facts that are not listed, and never say what a candidate lacks. Never invent courses, skills, times or personal details. Return one item per candidate key. ${UNTRUSTED_NOTE}`
		}, {
			role: "user",
			content: `<records>\nTEAM: ${team.name} | goal: ${team.project_goal || "not specified"}\nCANDIDATES:\n${keyed.map(({ key, c }) => `- ${key} | ${c.name} | ${facts(c)}`).join("\n")}\n</records>`
		}], "teammate_reasons", {
			type: "object",
			additionalProperties: false,
			required: ["suggestions"],
			properties: { suggestions: {
				type: "array",
				items: {
					type: "object",
					additionalProperties: false,
					required: ["key", "reason"],
					properties: {
						key: {
							type: "string",
							enum: keyed.map((k) => k.key)
						},
						reason: { type: "string" }
					}
				}
			} }
		});
	} catch (e) {
		throw new Error(`Found matches, but couldn't write the reasons. ${friendlyAIError(e)}`);
	}
	return {
		suggestions: keyed.map(({ key, c }, i) => ({
			id: c.id,
			rank: i + 1,
			name: c.name,
			avatar: avatars.get(c.id) ?? null,
			major: c.major,
			university: c.university,
			sharedCourses: c.sharedCourses,
			newSkills: c.newSkills,
			overlapHours: Math.round(c.overlapMinutes / 60 * 2) / 2,
			reason: reasons.suggestions?.find((r) => r.key === key)?.reason?.trim() || factualReason(c)
		})),
		empty: null
	};
});
var breakdownTask_createServerFn_handler = createServerRpc({
	id: "dbb05214657ab236ecd62c9578dbfe910a0442a8bf667c72610a3fefb77d0a95",
	name: "breakdownTask",
	filename: "src/lib/ai.functions.ts"
}, (opts) => breakdownTask.__executeServer(opts));
var breakdownTask = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({ taskId: stringType().uuid() }).parse(d)).handler(breakdownTask_createServerFn_handler, async ({ data, context }) => {
	const { data: task } = await context.supabase.from("tasks").select("id, title, description, due_date, priority, team_id").eq("id", data.taskId).maybeSingle();
	if (!task) throw new Error("This task could not be found, or you no longer have access to it.");
	await assertTeamMember(context.supabase, context.userId, task.team_id);
	const { data: team } = await context.supabase.from("teams").select("name, project_goal").eq("id", task.team_id).single();
	try {
		const res = await aiJson([{
			role: "system",
			content: `Break a student's task into 3-7 small, concrete checklist steps (each under 12 words, starting with a verb), in a sensible order. Add one short practical tip. ${UNTRUSTED_NOTE}`
		}, {
			role: "user",
			content: `<records>\nTEAM: ${team?.name} | goal: ${team?.project_goal || "not specified"}\nTASK: ${task.title}\nDETAILS: ${task.description || "none"}\nPRIORITY: ${task.priority}\nDUE: ${task.due_date?.slice(0, 10) ?? "none"}\n</records>`
		}], "task_breakdown", {
			type: "object",
			additionalProperties: false,
			required: ["steps", "tip"],
			properties: {
				steps: {
					type: "array",
					items: { type: "string" }
				},
				tip: { type: "string" }
			}
		});
		return {
			steps: (res.steps ?? []).filter(Boolean).slice(0, 8),
			tip: res.tip ?? ""
		};
	} catch (e) {
		throw new Error(friendlyAIError(e));
	}
});
//#endregion
export { breakdownTask_createServerFn_handler, draftTaskPlan_createServerFn_handler, suggestTeammates_createServerFn_handler };
