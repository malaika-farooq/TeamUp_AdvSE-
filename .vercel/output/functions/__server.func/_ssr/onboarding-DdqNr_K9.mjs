import { i as __toESM } from "../_runtime.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { O as LoaderCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { A as loadMyAvailability, C as fetchProfile, G as saveSkills, H as saveAvailability, K as tidy, M as loadMySkills, N as loadSuggestions, U as saveCourses, X as uploadAvatar, j as loadMyCourses, y as deleteAvatarFile, z as profileError } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { t as Switch } from "./switch-BCZQSDb-.mjs";
import { t as Progress } from "./progress-BElPnoUY.mjs";
import { i as SkillsEditor, n as CoursesEditor, r as PhotoField, t as AvailabilityEditor } from "./SkillsEditor-CNFeU6Zl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-DdqNr_K9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"About you",
	"Courses & skills",
	"Availability"
];
function Onboarding() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [step, setStep] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [avatarFile, setAvatarFile] = (0, import_react.useState)(null);
	const [avatarPreview, setAvatarPreview] = (0, import_react.useState)(null);
	const [university, setUniversity] = (0, import_react.useState)("");
	const [major, setMajor] = (0, import_react.useState)("");
	const [bio, setBio] = (0, import_react.useState)("");
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [skills, setSkills] = (0, import_react.useState)([]);
	const [timezone, setTimezone] = (0, import_react.useState)(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
	const [ranges, setRanges] = (0, import_react.useState)([]);
	const [discoverable, setDiscoverable] = (0, import_react.useState)(true);
	const userId = user?.id;
	const profileQuery = useQuery({
		queryKey: ["profile", userId],
		queryFn: () => fetchProfile(userId),
		enabled: !!userId
	});
	const coursesQuery = useQuery({
		queryKey: ["my-courses", userId],
		queryFn: () => loadMyCourses(userId),
		enabled: !!userId
	});
	const skillsQuery = useQuery({
		queryKey: ["my-skills", userId],
		queryFn: () => loadMySkills(userId),
		enabled: !!userId
	});
	const slotsQuery = useQuery({
		queryKey: ["availability", userId],
		queryFn: () => loadMyAvailability(userId),
		enabled: !!userId
	});
	const suggestionsQuery = useQuery({
		queryKey: ["profile-suggestions"],
		queryFn: loadSuggestions,
		staleTime: 3e5
	});
	const prefilled = (0, import_react.useRef)({
		profile: false,
		courses: false,
		skills: false,
		slots: false
	});
	(0, import_react.useEffect)(() => {
		const p = profileQuery.data;
		if (!p || prefilled.current.profile) return;
		prefilled.current.profile = true;
		const isDefaultName = p.display_name === (user?.email?.split("@")[0] ?? "") || p.display_name === "Student";
		setName(p.onboarded || !isDefaultName ? p.display_name : "");
		setUniversity(p.university ?? "");
		setMajor(p.major ?? "");
		setBio(p.bio ?? "");
		if (p.onboarded && p.timezone) setTimezone(p.timezone);
		setDiscoverable(p.onboarded ? p.discoverable : true);
	}, [profileQuery.data, user?.email]);
	(0, import_react.useEffect)(() => {
		if (coursesQuery.data && !prefilled.current.courses) {
			prefilled.current.courses = true;
			setCourses(coursesQuery.data);
		}
	}, [coursesQuery.data]);
	(0, import_react.useEffect)(() => {
		if (skillsQuery.data && !prefilled.current.skills) {
			prefilled.current.skills = true;
			setSkills(skillsQuery.data);
		}
	}, [skillsQuery.data]);
	(0, import_react.useEffect)(() => {
		if (slotsQuery.data && !prefilled.current.slots) {
			prefilled.current.slots = true;
			setRanges(slotsQuery.data);
		}
	}, [slotsQuery.data]);
	(0, import_react.useEffect)(() => {
		if (!avatarFile) return setAvatarPreview(null);
		const url = URL.createObjectURL(avatarFile);
		setAvatarPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [avatarFile]);
	async function finish() {
		if (!user) return;
		const zone = timezone.trim() || "UTC";
		try {
			new Intl.DateTimeFormat("en", { timeZone: zone });
		} catch {
			setStep(2);
			toast.error("That time zone isn't recognised. Try something like America/Toronto.");
			return;
		}
		setBusy(true);
		try {
			try {
				await saveCourses(courses);
			} catch (e) {
				setStep(1);
				throw new Error(`Your courses weren't saved. ${e instanceof Error ? e.message : ""}`.trim());
			}
			try {
				await saveSkills(skills);
			} catch (e) {
				setStep(1);
				throw new Error(`Your skills weren't saved. ${e instanceof Error ? e.message : ""}`.trim());
			}
			try {
				await saveAvailability(ranges);
			} catch (e) {
				setStep(2);
				throw new Error(`Your availability wasn't saved. ${e instanceof Error ? e.message : ""}`.trim());
			}
			let newAvatar = null;
			if (avatarFile) try {
				newAvatar = await uploadAvatar(user.id, avatarFile);
			} catch (e) {
				toast.warning(`Your photo couldn't be uploaded (${e instanceof Error ? e.message : "unknown error"}). You can add it later in Settings.`);
			}
			const previousAvatar = profileQuery.data?.avatar_url ?? null;
			const { error: pErr } = await supabase.from("profiles").upsert({
				id: user.id,
				display_name: tidy(name) || user.email?.split("@")[0] || "Student",
				university: tidy(university) || null,
				major: tidy(major) || null,
				bio: bio.trim() || null,
				timezone: zone,
				discoverable,
				onboarded: true,
				...newAvatar ? { avatar_url: newAvatar } : {}
			});
			if (pErr) {
				if (newAvatar) await deleteAvatarFile(newAvatar);
				throw profileError(pErr);
			}
			if (newAvatar) await deleteAvatarFile(previousAvatar);
			toast.success("Profile saved");
			await queryClient.invalidateQueries();
			navigate({ to: "/dashboard" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save your profile");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-medium text-primary",
				children: [
					"Step ",
					step + 1,
					" of ",
					STEPS.length
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 text-3xl font-bold",
				children: STEPS[step]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: (step + 1) / STEPS.length * 100,
				className: "mt-4"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					x: 16
				},
				animate: {
					opacity: 1,
					x: 0
				},
				transition: { duration: .22 },
				className: "surface-card mt-6 space-y-5 p-6",
				children: [
					step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "n",
								children: "Full name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "n",
								value: name,
								onChange: (e) => setName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Profile photo (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoField, {
								name: name || user?.email || "Student",
								path: profileQuery.data?.avatar_url,
								previewUrl: avatarPreview,
								onPick: setAvatarFile,
								onRemove: avatarFile ? () => setAvatarFile(null) : void 0
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "u",
									children: "University"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "u",
									value: university,
									onChange: (e) => setUniversity(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "m",
									children: "Major"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "m",
									value: major,
									onChange: (e) => setMajor(e.target.value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "b",
								children: "Short bio"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "b",
								value: bio,
								onChange: (e) => setBio(e.target.value),
								rows: 3,
								maxLength: 500
							})]
						})
					] }),
					step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoursesEditor, {
							value: courses,
							onChange: setCourses,
							suggestions: suggestionsQuery.data?.courses ?? []
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", { className: "border-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillsEditor, {
							value: skills,
							onChange: setSkills,
							suggestions: suggestionsQuery.data?.skills ?? []
						})
					] }),
					step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "tz",
								children: "Time zone"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "tz",
								value: timezone,
								onChange: (e) => setTimezone(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvailabilityEditor, {
							value: ranges,
							onChange: setRanges
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between rounded-xl border border-border p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "Let classmates discover me"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Shares your name, courses and skills for teammate matching. Availability details stay private."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: discoverable,
								onCheckedChange: setDiscoverable,
								"aria-label": "Let classmates discover me"
							})]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: () => step === 0 ? navigate({ to: "/dashboard" }) : setStep(step - 1),
							disabled: busy,
							children: step === 0 ? "Skip for now" : "Back"
						}), step < STEPS.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => setStep(step + 1),
							children: "Continue"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: finish,
							disabled: busy,
							children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Finish setup"]
						})]
					})
				]
			}, step)
		]
	});
}
//#endregion
export { Onboarding as component };
