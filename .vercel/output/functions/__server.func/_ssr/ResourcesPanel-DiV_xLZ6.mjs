import { i as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-yXxN1BOn.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { t as Button } from "./button-BkEFdjsN.mjs";
import { o as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { O as LoaderCircle, R as FileText, g as Plus, j as Link2, l as Trash2, y as NotebookPen, z as Download } from "../_libs/lucide-react.mjs";
import { a as DialogFooter, c as Select, d as SelectTrigger, f as SelectValue, i as DialogDescription, l as SelectContent, n as Dialog, o as DialogHeader, r as DialogContent, s as DialogTitle, u as SelectItem } from "./ai-client-CJwzytaT.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as useAuth } from "./auth-Bitinyml.mjs";
import { P as logActivity } from "./UserAvatar-CWAQ5zUT.mjs";
import { t as Input } from "./input-o8_kklxJ.mjs";
import { t as Textarea } from "./textarea-DpZdO9KZ.mjs";
import { t as motion } from "../_libs/motion.mjs";
import { c as MessageResponse, o as EmptyState, r as Badge } from "./states-BLyrGC0l.mjs";
import { t as Label } from "./label-BEbnXoK8.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-x-SErZBX.mjs";
import { a as canChangeItem } from "./team-rules-DG0EiWUj.mjs";
import { t as useTeamRoles } from "./use-team-roles-Dom1WBFT.mjs";
import { t as Progress } from "./progress-BElPnoUY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ResourcesPanel-DiV_xLZ6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MAX_BYTES = 26214400;
function ResourcesPanel({ resources, teams, defaultTeamId }) {
	const { user } = useAuth();
	const { roleIn } = useTeamRoles();
	const queryClient = useQueryClient();
	const [kind, setKind] = (0, import_react.useState)("all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => resources.filter((r) => {
		if (kind !== "all" && r.kind !== kind) return false;
		if (!search.trim()) return true;
		const s = search.toLowerCase();
		return r.title.toLowerCase().includes(s) || (r.content ?? "").toLowerCase().includes(s) || (r.tags ?? []).some((t) => t.toLowerCase().includes(s));
	}), [
		resources,
		kind,
		search
	]);
	async function download(r) {
		if (!r.storage_path) return;
		const { data, error } = await supabase.storage.from("team-files").createSignedUrl(r.storage_path, 60);
		if (error) return void toast.error(error.message);
		window.open(data.signedUrl, "_blank", "noopener");
	}
	async function remove(r) {
		const { error } = await supabase.from("resources").delete().eq("id", r.id);
		if (error) return void toast.error(error.message);
		if (r.storage_path) await supabase.storage.from("team-files").remove([r.storage_path]);
		toast.success("Resource removed");
		queryClient.invalidateQueries();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: search,
						onChange: (e) => setSearch(e.target.value),
						placeholder: "Search notes, links, files, tags",
						className: "w-full sm:w-64",
						"aria-label": "Search resources"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: kind,
						onValueChange: (v) => setKind(v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "all",
								children: "All"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "note",
								children: "Notes"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "link",
								children: "Links"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "file",
								children: "Files"
							})
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "ml-auto",
						onClick: () => {
							setEditing(null);
							setOpen(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1.5 size-4" }), "Add resource"]
					})
				]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				icon: NotebookPen,
				title: "No resources yet",
				description: "Share notes, bookmark links, or upload files your team needs."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3",
				children: filtered.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
					initial: {
						opacity: 0,
						y: 10
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .2,
						delay: i * .03
					},
					className: "surface-card hover-lift flex flex-col gap-2 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [r.kind === "note" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotebookPen, { className: "size-4 text-teal" }) : r.kind === "link" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "size-4 text-blue" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-lavender" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: r.title
							})]
						}),
						r.kind === "note" && r.content && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative max-h-28 overflow-hidden text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageResponse, {
								className: "[&_h1]:my-1 [&_h1]:text-sm [&_h2]:my-1 [&_h2]:text-sm [&_h3]:my-1 [&_h3]:text-sm [&_li]:py-0 [&_p]:my-1",
								children: r.content
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-card to-transparent" })]
						}),
						r.kind === "link" && r.url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: r.url,
							target: "_blank",
							rel: "noreferrer noopener",
							className: "truncate text-sm text-blue underline",
							children: r.url
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1",
							children: (r.tags ?? []).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								children: t
							}, t))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-auto text-xs text-muted-foreground",
							children: ["Updated ", new Date(r.updated_at).toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [
								r.kind === "file" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => download(r),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-1.5 size-4" }), "Download"]
								}),
								r.kind === "note" && canChangeItem(roleIn(r.team_id), user?.id, r) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									onClick: () => {
										setEditing(r);
										setOpen(true);
									},
									children: "Edit"
								}),
								canChangeItem(roleIn(r.team_id), user?.id, r) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									"aria-label": `Delete ${r.title}`,
									onClick: () => remove(r),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})
							]
						})
					]
				}, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResourceDialog, {
				open,
				onOpenChange: setOpen,
				teams,
				defaultTeamId,
				editing
			})
		]
	});
}
function ResourceDialog({ open, onOpenChange, teams, defaultTeamId, editing }) {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [kind, setKind] = (0, import_react.useState)("note");
	const [teamId, setTeamId] = (0, import_react.useState)(defaultTeamId ?? teams[0]?.id ?? "");
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [tags, setTags] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const isEdit = !!editing;
	function reset() {
		setTitle("");
		setBody("");
		setUrl("");
		setTags("");
		setFile(null);
		setProgress(0);
	}
	(0, import_react.useMemo)(() => {
		if (editing) {
			setKind(editing.kind);
			setTeamId(editing.team_id);
			setTitle(editing.title);
			setBody(editing.content ?? "");
			setUrl(editing.url ?? "");
			setTags((editing.tags ?? []).join(", "));
		}
	}, [editing]);
	async function submit(e) {
		e.preventDefault();
		if (!user || !teamId) return;
		setBusy(true);
		const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
		if (isEdit && editing) {
			const { data: current } = await supabase.from("resources").select("updated_at").eq("id", editing.id).single();
			if (current && current.updated_at !== editing.updated_at) {
				setBusy(false);
				toast.error("Someone else updated this note. Reopen it to see the latest version.");
				return;
			}
			const { error } = await supabase.from("resources").update({
				title,
				content: body,
				tags: tagList,
				updated_at: (/* @__PURE__ */ new Date()).toISOString(),
				updated_by: user.id
			}).eq("id", editing.id);
			setBusy(false);
			if (error) return void toast.error(error.message);
			toast.success("Note updated");
			onOpenChange(false);
			queryClient.invalidateQueries();
			return;
		}
		let storagePath = null;
		let fileSize = null;
		let mime = null;
		if (kind === "file") {
			if (!file) {
				setBusy(false);
				toast.error("Choose a file to upload.");
				return;
			}
			if (file.size > MAX_BYTES) {
				setBusy(false);
				toast.error("Files must be 25 MB or smaller.");
				return;
			}
			setProgress(35);
			const path = `${teamId}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
			const { error: upErr } = await supabase.storage.from("team-files").upload(path, file);
			if (upErr) {
				setBusy(false);
				setProgress(0);
				toast.error(upErr.message);
				return;
			}
			setProgress(80);
			storagePath = path;
			fileSize = file.size;
			mime = file.type || null;
		}
		const { error } = await supabase.from("resources").insert({
			team_id: teamId,
			kind,
			title,
			content: kind === "note" ? body : null,
			url: kind === "link" ? url : null,
			storage_path: storagePath,
			file_size: fileSize,
			mime_type: mime,
			tags: tagList,
			created_by: user.id,
			updated_by: user.id
		});
		setBusy(false);
		setProgress(100);
		if (error) return void toast.error(error.message);
		await logActivity(teamId, user.id, "resource_added", `added "${title}"`);
		toast.success("Resource added");
		reset();
		onOpenChange(false);
		queryClient.invalidateQueries();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit note" : "Add a resource" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Files are stored privately and only team members can open them." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "space-y-4",
				children: [
					!isEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
						value: kind,
						onValueChange: (v) => setKind(v),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "w-full",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "note",
									className: "flex-1",
									children: "Note"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "link",
									className: "flex-1",
									children: "Link"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: "file",
									className: "flex-1",
									children: "File"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Team" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: teamId,
							onValueChange: setTeamId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: teams.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: t.id,
								children: t.name
							}, t.id)) })]
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rt",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "rt",
							required: true,
							value: title,
							onChange: (e) => setTitle(e.target.value)
						})]
					}),
					kind === "note" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rb",
							children: "Note (Markdown supported)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "rb",
							rows: 8,
							value: body,
							onChange: (e) => setBody(e.target.value)
						})]
					}),
					kind === "link" && !isEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "ru",
							children: "URL"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "ru",
							type: "url",
							required: true,
							value: url,
							onChange: (e) => setUrl(e.target.value),
							placeholder: "https://"
						})]
					}),
					kind === "file" && !isEdit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "rf",
								children: "File (max 25 MB)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "rf",
								type: "file",
								onChange: (e) => setFile(e.target.files?.[0] ?? null)
							}),
							progress > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: progress,
								className: "h-2"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							htmlFor: "rtags",
							children: "Tags (comma separated)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "rtags",
							value: tags,
							onChange: (e) => setTags(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: busy || !teamId,
						children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 size-4 animate-spin" }), isEdit ? "Save note" : "Add resource"]
					})] })
				]
			})]
		})
	});
}
//#endregion
export { ResourcesPanel as t };
