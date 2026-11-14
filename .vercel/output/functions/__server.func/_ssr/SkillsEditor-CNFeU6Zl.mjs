import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { r as cn, t as Button } from "./button-BkEFdjsN.mjs";
import { O as LoaderCircle, g as Plus, l as Trash2, s as Upload, t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { F as mergeRanges, J as toggleBlock, O as formatRange, V as removeRange, Y as totalHours, _ as courseLabel, a as SKILL_LEVELS, d as addSkills, g as courseKey, h as clampLevel, k as keyOf, l as addCourses, m as checkRange, n as AVATAR_TYPES, p as checkAvatarFile, q as timeOptions, s as UserAvatar, u as addRange, v as covers } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { n as TIME_BLOCKS, t as DAY_LABELS } from "./partner-ranking-CGfSgEHb.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SkillsEditor-CNFeU6Zl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DAY_NAMES = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
];
var TARGETS = [
	...DAY_NAMES.map((n, i) => ({
		value: String(i),
		label: n,
		days: [i]
	})),
	{
		value: "weekdays",
		label: "Every weekday",
		days: [
			1,
			2,
			3,
			4,
			5
		]
	},
	{
		value: "weekends",
		label: "Every weekend day",
		days: [0, 6]
	},
	{
		value: "all",
		label: "Every day",
		days: [
			0,
			1,
			2,
			3,
			4,
			5,
			6
		]
	}
];
var TIMES = timeOptions();
var selectClass = "h-9 rounded-md border border-input bg-background px-2 text-sm";
/** Weekly free time: quick Morning / Afternoon / Evening toggles per day, plus exact custom times. */
function AvailabilityEditor({ value, onChange }) {
	const id = (0, import_react.useId)();
	const [target, setTarget] = (0, import_react.useState)("1");
	const [start, setStart] = (0, import_react.useState)(540);
	const [end, setEnd] = (0, import_react.useState)(660);
	const merged = mergeRanges(value);
	function addCustom() {
		const check = checkRange(start, end);
		if (!check.ok) return void toast.error(check.reason);
		onChange((TARGETS.find((t) => t.value === target)?.days ?? []).reduce((acc, d) => addRange(acc, d, start, end), merged));
	}
	const hours = totalHours(merged);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Mark when you're usually free to study. Tap a block, or add exact times below. Classmates only see how much free time you share with them, never your schedule."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				"aria-label": "Weekly availability",
				children: DAY_LABELS.map((label, day) => {
					const dayRanges = merged.filter((r) => r.weekday === day);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-20 font-medium",
								children: DAY_NAMES[day]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: TIME_BLOCKS.map((b) => {
									const on = covers(merged, day, b.start, b.end);
									const partial = !on && dayRanges.some((r) => r.start < b.end && r.end > b.start);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": on,
										"aria-label": `${DAY_NAMES[day]} ${b.label}`,
										onClick: () => onChange(toggleBlock(merged, day, b.start, b.end)),
										className: cn("h-9 rounded-lg border px-3 text-sm transition-colors duration-150", on ? "border-teal bg-teal/20 font-medium" : partial ? "border-dashed border-teal bg-teal/5" : "border-border bg-muted/40 hover:bg-muted"),
										children: b.label
									}, b.label);
								})
							})]
						}), dayRanges.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-wrap gap-1.5",
							children: dayRanges.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-1 rounded-full bg-muted py-0.5 pl-2.5 pr-1 text-xs",
								children: [formatRange(r), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground",
									"aria-label": `Remove ${DAY_NAMES[day]} ${formatRange(r)}`,
									onClick: () => onChange(removeRange(merged, r)),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3" })
								})]
							}, `${r.start}-${r.end}`))
						})]
					}, label);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "rounded-xl border border-border p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "px-1 text-sm font-medium",
					children: "Add exact times"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `${id}-day`,
								className: "text-xs",
								children: "Day"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: `${id}-day`,
								className: selectClass,
								value: target,
								onChange: (e) => setTarget(e.target.value),
								children: TARGETS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t.value,
									children: t.label
								}, t.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `${id}-from`,
								className: "text-xs",
								children: "From"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: `${id}-from`,
								className: selectClass,
								value: start,
								onChange: (e) => setStart(Number(e.target.value)),
								children: TIMES.slice(0, -1).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t.value,
									children: t.label
								}, t.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: `${id}-to`,
								className: "text-xs",
								children: "To"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								id: `${id}-to`,
								className: selectClass,
								value: end,
								onChange: (e) => setEnd(Number(e.target.value)),
								children: TIMES.slice(1).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: t.value,
									children: t.label
								}, t.value))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							onClick: addCustom,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), "Add"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					"aria-live": "polite",
					children: hours > 0 ? `You're free about ${hours} h a week.` : "No free time marked yet."
				}), merged.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "ghost",
					size: "sm",
					onClick: () => onChange([]),
					children: "Clear all"
				})]
			})
		]
	});
}
/** Enrolled courses: type "CS101 Intro to Programming" (several at once with commas) and press Add. */
function CoursesEditor({ value, onChange, suggestions = [] }) {
	const id = (0, import_react.useId)();
	const [text, setText] = (0, import_react.useState)("");
	const full = value.length >= 30;
	function add() {
		if (!text.trim()) return;
		onChange(addCourses(value, text));
		setText("");
	}
	const taken = new Set(value.map(courseKey));
	const options = suggestions.filter((s) => !taken.has(courseKey(s))).slice(0, 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: id,
						children: "Enrolled courses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id,
							list: `${id}-options`,
							value: text,
							disabled: full,
							placeholder: "CS201 Data Structures, MATH210 Linear Algebra",
							onChange: (e) => setText(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									add();
								}
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							onClick: add,
							disabled: !text.trim() || full,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), "Add"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
						id: `${id}-options`,
						children: options.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s.code && s.code !== s.title ? `${s.code} ${s.title}` : s.title }, courseKey(s)))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Start with the course code if you have one. Press Enter or Add; separate several with commas."
					})
				]
			}),
			value.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No courses yet. Courses help match you with classmates."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-wrap gap-2",
				"aria-label": "Your courses",
				children: value.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-1 rounded-full border border-border bg-muted/50 py-1 pl-3 pr-1 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: courseLabel(c) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
						"aria-label": `Remove ${courseLabel(c)}`,
						onClick: () => onChange(value.filter((x) => courseKey(x) !== courseKey(c))),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
					})]
				}, courseKey(c)))
			}),
			full && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"You can list up to ",
					30,
					" courses."
				]
			})
		]
	});
}
/**
* Profile photo chooser. It only picks and validates the file; the parent decides when to upload it
* (immediately in Settings, on "Finish" during onboarding).
*/
function PhotoField({ name, path, previewUrl, busy = false, onPick, onRemove }) {
	const input = (0, import_react.useRef)(null);
	const hasPhoto = !!previewUrl || !!path;
	function chosen(e) {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		const check = checkAvatarFile(file);
		if (!check.ok) return void toast.error(check.reason);
		onPick(file);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-4",
		children: [previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: previewUrl,
			alt: "Selected profile photo",
			className: "size-20 rounded-full object-cover"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserAvatar, {
			name,
			path,
			className: "size-20",
			fallbackClassName: "text-xl"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						disabled: busy,
						onClick: () => input.current?.click(),
						children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mr-2 size-4" }), hasPhoto ? "Change photo" : "Upload photo"]
					}), hasPhoto && onRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						size: "sm",
						disabled: busy,
						onClick: onRemove,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 size-4" }), "Remove"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "JPG, PNG, WebP or GIF, up to 2 MB."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: input,
					type: "file",
					accept: AVATAR_TYPES.join(","),
					className: "sr-only",
					"aria-label": "Choose a profile photo",
					onChange: chosen
				})
			]
		})]
	});
}
/** Skills with a 1–5 level each. Teammate matching uses both the skill and how strong you are at it. */
function SkillsEditor({ value, onChange, suggestions = [] }) {
	const id = (0, import_react.useId)();
	const [text, setText] = (0, import_react.useState)("");
	const full = value.length >= 40;
	function add() {
		if (!text.trim()) return;
		onChange(addSkills(value, text));
		setText("");
	}
	const taken = new Set(value.map((s) => keyOf(s.name)));
	const options = suggestions.filter((s) => !taken.has(keyOf(s))).slice(0, 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: id,
						children: "Skills and interests"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id,
							list: `${id}-options`,
							value: text,
							disabled: full,
							maxLength: 200,
							placeholder: "Python, research writing, UI design",
							onChange: (e) => setText(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									add();
								}
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							onClick: add,
							disabled: !text.trim() || full,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 size-4" }), "Add"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
						id: `${id}-options`,
						children: options.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s }, s))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Separate several with commas (up to ",
							40,
							" characters each). Then set how strong you are."
						]
					})
				]
			}),
			value.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No skills yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2 sm:grid-cols-2",
				"aria-label": "Your skills",
				children: value.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-xl border border-border p-2 pl-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm font-medium",
							children: s.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": `Level for ${s.name}`,
							value: s.level,
							className: "h-8 rounded-md border border-input bg-background px-2 text-xs",
							onChange: (e) => onChange(value.map((x) => keyOf(x.name) === keyOf(s.name) ? {
								...x,
								level: clampLevel(Number(e.target.value))
							} : x)),
							children: SKILL_LEVELS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: l.value,
								children: l.label
							}, l.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
							"aria-label": `Remove ${s.name}`,
							onClick: () => onChange(value.filter((x) => keyOf(x.name) !== keyOf(s.name))),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				}, keyOf(s.name)))
			}),
			full && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"You can list up to ",
					40,
					" skills."
				]
			})
		]
	});
}
//#endregion
export { SkillsEditor as i, CoursesEditor as n, PhotoField as r, AvailabilityEditor as t };
