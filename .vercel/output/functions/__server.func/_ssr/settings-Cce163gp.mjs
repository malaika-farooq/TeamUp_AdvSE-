import { i as __toESM } from "../_runtime.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { i as useQuery, o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { O as LoaderCircle, f as Sparkles, l as Trash2 } from "../_libs/lucide-react.mjs";
import { C as useTheme } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { A as loadMyAvailability, B as removeAvatar, C as fetchProfile, G as saveSkills, H as saveAvailability, M as loadMySkills, N as loadSuggestions, R as profileCompleteness, U as saveCourses, W as saveProfile, Y as totalHours, Z as validateProfile, f as changeAvatar, i as PROFILE_LIMITS, j as loadMyCourses } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { s as ErrorState, t as AppShell } from "./states-BLyrGC0l.mjs";
import { n as useServerFn } from "./createSsrRpc-DdtAGDIv.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { t as Switch } from "./switch-BCZQSDb-.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-x-SErZBX.mjs";
import { t as Progress } from "./progress-BElPnoUY.mjs";
import { n as removeSampleWorkspace, t as createSampleWorkspace } from "./sample.functions-syRnQCGo.mjs";
import { i as SkillsEditor, n as CoursesEditor, r as PhotoField, t as AvailabilityEditor } from "./SkillsEditor-CNFeU6Zl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-Cce163gp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Settings > Account: change password, sample workspace, sign out. */
function AccountTab() {
	const { signOut } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const createSample = useServerFn(createSampleWorkspace);
	const removeSample = useServerFn(removeSampleWorkspace);
	const [password, setPassword] = (0, import_react.useState)({
		current: "",
		next: ""
	});
	const [changing, setChanging] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(null);
	async function changePassword(e) {
		e.preventDefault();
		if (password.next.length < 8) {
			toast.error(`Use at least 8 characters.`);
			return;
		}
		if (password.current && password.current === password.next) {
			toast.error("Choose a new password that is different from the current one.");
			return;
		}
		setChanging(true);
		try {
			const { error } = await supabase.auth.updateUser({
				password: password.next,
				...password.current ? { current_password: password.current } : {}
			});
			if (error) return void toast.error(error.message);
			toast.success("Password updated");
			setPassword({
				current: "",
				next: ""
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't update your password.");
		} finally {
			setChanging(false);
		}
	}
	async function sample(kind) {
		setBusy(kind);
		try {
			await (kind === "create" ? createSample({ data: void 0 }) : removeSample({ data: void 0 }));
			toast.success(kind === "create" ? "Sample workspace created" : "Sample workspace removed");
			queryClient.invalidateQueries();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : kind === "create" ? "Couldn't create the sample." : "Couldn't remove the sample.");
		} finally {
			setBusy(null);
		}
	}
	async function leave() {
		await queryClient.cancelQueries();
		queryClient.clear();
		await signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				noValidate: true,
				"aria-label": "Change password",
				onSubmit: changePassword,
				className: "surface-card max-w-xl space-y-4 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold",
						children: "Change password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "cp",
							children: "Current password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "cp",
							type: "password",
							autoComplete: "current-password",
							value: password.current,
							onChange: (e) => setPassword({
								...password,
								current: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "np",
								children: "New password"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "np",
								type: "password",
								autoComplete: "new-password",
								value: password.next,
								onChange: (e) => setPassword({
									...password,
									next: e.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									"At least ",
									8,
									" characters."
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						variant: "outline",
						disabled: changing,
						children: [changing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Update password"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card max-w-xl space-y-3 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-semibold",
						children: "Sample workspace"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Creates a clearly labelled demo team visible only to you, with example tasks, sessions and notes. Remove it any time."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							disabled: busy !== null,
							onClick: () => void sample("create"),
							children: [busy === "create" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mr-2 size-4" }), "Create sample workspace"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							disabled: busy !== null,
							onClick: () => void sample("remove"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Remove sample"]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => void leave(),
				children: "Sign out"
			})
		]
	});
}
/** Settings > Courses & skills: enrolled courses and skills with a 1-5 level, saved together. */
function AcademicTab() {
	const { user } = useAuth();
	const userId = user?.id;
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
	const suggestionsQuery = useQuery({
		queryKey: ["profile-suggestions"],
		queryFn: loadSuggestions,
		staleTime: 3e5
	});
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [skills, setSkills] = (0, import_react.useState)([]);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (coursesQuery.data) setCourses(coursesQuery.data);
	}, [coursesQuery.data]);
	(0, import_react.useEffect)(() => {
		if (skillsQuery.data) setSkills(skillsQuery.data);
	}, [skillsQuery.data]);
	const dirty = JSON.stringify(courses) !== JSON.stringify(coursesQuery.data ?? []) || JSON.stringify(skills) !== JSON.stringify(skillsQuery.data ?? []);
	async function save() {
		setSaving(true);
		try {
			await saveCourses(courses);
			await saveSkills(skills);
			toast.success("Courses and skills saved");
			await Promise.all([
				coursesQuery.refetch(),
				skillsQuery.refetch(),
				suggestionsQuery.refetch()
			]);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't save your courses and skills.");
		} finally {
			setSaving(false);
		}
	}
	const loadError = coursesQuery.isError ? coursesQuery.error : skillsQuery.isError ? skillsQuery.error : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card max-w-3xl space-y-6 p-6",
		children: [
			loadError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "space-y-2 text-sm text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Couldn't load your saved courses and skills. ", loadError.message] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						coursesQuery.refetch();
						skillsQuery.refetch();
					},
					children: "Try again"
				})]
			}),
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: save,
					disabled: saving || !dirty,
					children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Save courses & skills"]
				}), dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: "You have unsaved changes."
				})]
			})
		]
	});
}
/** Settings > Appearance: light or dark theme, remembered on this device. */
function AppearanceTab() {
	const { theme, setTheme } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card flex max-w-xl items-center justify-between p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			id: "dark-label",
			className: "font-medium",
			children: "Dark theme"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Your choice is remembered on this device."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			"aria-labelledby": "dark-label",
			checked: theme === "dark",
			onCheckedChange: (v) => setTheme(v ? "dark" : "light")
		})]
	});
}
/** Settings > Availability: weekly free time, saved as one all-or-nothing update. */
function AvailabilityTab() {
	const { user } = useAuth();
	const userId = user?.id;
	const slotsQuery = useQuery({
		queryKey: ["availability", userId],
		queryFn: () => loadMyAvailability(userId),
		enabled: !!userId
	});
	const [ranges, setRanges] = (0, import_react.useState)([]);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (slotsQuery.data) setRanges(slotsQuery.data);
	}, [slotsQuery.data]);
	const dirty = JSON.stringify(ranges) !== JSON.stringify(slotsQuery.data ?? []);
	async function save() {
		setSaving(true);
		try {
			await saveAvailability(ranges);
			toast.success("Availability saved");
			await slotsQuery.refetch();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't save your availability.");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card max-w-3xl space-y-5 p-6",
		children: [
			slotsQuery.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "space-y-2 text-sm text-destructive",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Couldn't load your saved availability. ", slotsQuery.error.message] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => void slotsQuery.refetch(),
					children: "Try again"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvailabilityEditor, {
				value: ranges,
				onChange: setRanges
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: save,
					disabled: saving || !dirty,
					children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Save availability"]
				}), dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: "You have unsaved changes."
				})]
			})
		]
	});
}
var emptyForm = (timezone) => ({
	display_name: "",
	university: "",
	major: "",
	bio: "",
	timezone,
	discoverable: false
});
function CompletenessCard({ percent, missing }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card max-w-xl space-y-3 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Profile completeness"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-sm font-medium",
					children: [percent, "%"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: percent,
				"aria-label": "Profile completeness"
			}),
			missing.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Your profile is complete. Great for matching!"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "list-disc space-y-0.5 pl-5 text-sm text-muted-foreground",
				children: missing.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: m }, m))
			})
		]
	});
}
/** Settings > Profile: photo, name, university, major, time zone, bio and discoverability. */
function ProfileTab() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const userId = user?.id;
	const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
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
	const [form, setForm] = (0, import_react.useState)(emptyForm(browserZone));
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [photoBusy, setPhotoBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!profileQuery.isSuccess) return;
		const p = profileQuery.data;
		if (p) setForm({
			display_name: p.display_name,
			university: p.university ?? "",
			major: p.major ?? "",
			bio: p.bio ?? "",
			timezone: p.timezone,
			discoverable: p.discoverable
		});
		else {
			const meta = user?.user_metadata;
			setForm({
				...emptyForm(browserZone),
				display_name: meta?.display_name ?? user?.email?.split("@")[0] ?? ""
			});
		}
	}, [profileQuery.isSuccess, profileQuery.data]);
	async function submit(e) {
		e.preventDefault();
		if (!user) return;
		const checked = validateProfile(form);
		if (!checked.ok) return void toast.error(checked.error);
		setSaving(true);
		try {
			await saveProfile(user.id, checked.value);
			toast.success("Profile saved");
			await queryClient.invalidateQueries({ queryKey: ["profile"] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't save your profile.");
		} finally {
			setSaving(false);
		}
	}
	async function pickPhoto(file) {
		if (!user) return;
		setPhotoBusy(true);
		try {
			await changeAvatar(user.id, file, profileQuery.data?.avatar_url);
			toast.success("Photo updated");
			await queryClient.invalidateQueries({ queryKey: ["profile"] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't upload that photo.");
		} finally {
			setPhotoBusy(false);
		}
	}
	async function dropPhoto() {
		if (!user) return;
		setPhotoBusy(true);
		try {
			await removeAvatar(user.id, profileQuery.data?.avatar_url);
			toast.success("Photo removed");
			await queryClient.invalidateQueries({ queryKey: ["profile"] });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't remove your photo.");
		} finally {
			setPhotoBusy(false);
		}
	}
	if (profileQuery.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
		title: "Couldn't load your profile",
		message: profileQuery.error.message,
		onRetry: () => void profileQuery.refetch()
	});
	const completeness = profileCompleteness({
		hasPhoto: !!profileQuery.data?.avatar_url,
		university: profileQuery.data?.university,
		major: profileQuery.data?.major,
		bio: profileQuery.data?.bio,
		courseCount: coursesQuery.data?.length ?? 0,
		skillCount: skillsQuery.data?.length ?? 0,
		availableMinutes: Math.round(totalHours(slotsQuery.data ?? []) * 60)
	});
	const avatarPath = profileQuery.data?.avatar_url;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompletenessCard, {
				percent: completeness.percent,
				missing: completeness.missing
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "surface-card max-w-xl space-y-3 p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: "Profile photo"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoField, {
					name: form.display_name || user?.email || "Student",
					path: avatarPath,
					busy: photoBusy,
					onPick: pickPhoto,
					onRemove: avatarPath ? dropPhoto : void 0
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				noValidate: true,
				onSubmit: submit,
				"aria-label": "Profile details",
				className: "surface-card max-w-xl space-y-4 p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "dn",
							children: "Display name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "dn",
							value: form.display_name,
							maxLength: PROFILE_LIMITS.name,
							disabled: profileQuery.isLoading,
							onChange: (e) => setForm({
								...form,
								display_name: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "uni",
								children: "University"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "uni",
								value: form.university,
								maxLength: PROFILE_LIMITS.university,
								disabled: profileQuery.isLoading,
								onChange: (e) => setForm({
									...form,
									university: e.target.value
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "maj",
								children: "Major"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "maj",
								value: form.major,
								maxLength: PROFILE_LIMITS.major,
								disabled: profileQuery.isLoading,
								onChange: (e) => setForm({
									...form,
									major: e.target.value
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "tz",
							children: "Time zone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "tz",
							value: form.timezone,
							disabled: profileQuery.isLoading,
							onChange: (e) => setForm({
								...form,
								timezone: e.target.value
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "bio",
								children: "About you"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "bio",
								rows: 3,
								value: form.bio,
								maxLength: PROFILE_LIMITS.bio,
								disabled: profileQuery.isLoading,
								onChange: (e) => setForm({
									...form,
									bio: e.target.value
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									form.bio.length,
									"/",
									PROFILE_LIMITS.bio
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-xl border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							id: "disc-label",
							className: "text-sm font-medium",
							children: "Show me in Discover"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Only your name, university, major and courses are shared."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							"aria-labelledby": "disc-label",
							checked: form.discoverable,
							onCheckedChange: (v) => setForm({
								...form,
								discoverable: v
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: saving || profileQuery.isLoading,
						children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), "Save profile"]
					})
				]
			})
		]
	});
}
/**
* The five Settings sections. Every section stays mounted (inactive ones are only hidden) so that
* unsaved edits survive a trip to another tab.
*/
function SettingsTabs({ defaultTab = "profile" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		defaultValue: defaultTab,
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
				className: "flex flex-wrap justify-start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "profile",
						children: "Profile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "academic",
						children: "Courses & skills"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "availability",
						children: "Availability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "appearance",
						children: "Appearance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "account",
						children: "Account"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "profile",
				forceMount: true,
				className: "data-[state=inactive]:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileTab, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "academic",
				forceMount: true,
				className: "data-[state=inactive]:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AcademicTab, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "availability",
				forceMount: true,
				className: "data-[state=inactive]:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AvailabilityTab, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "appearance",
				forceMount: true,
				className: "data-[state=inactive]:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppearanceTab, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "account",
				forceMount: true,
				className: "data-[state=inactive]:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountTab, {})
			})
		]
	});
}
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Settings",
		description: "Your profile, availability and app preferences.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsTabs, {})
	});
}
//#endregion
export { SettingsPage as component };
