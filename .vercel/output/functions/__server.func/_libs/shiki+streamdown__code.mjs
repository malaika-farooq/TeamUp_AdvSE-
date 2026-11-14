import { t as dist_exports } from "./shikijs__engine-oniguruma.mjs";
import { n as createSingletonShorthands, r as guessEmbeddedLanguages, t as createBundledHighlighter } from "./@shikijs/core+[...].mjs";
import { t as createJavaScriptRegexEngine } from "./@shikijs/engine-javascript+[...].mjs";
//#region node_modules/shiki/dist/rolldown-runtime-BBjsoOtd.mjs
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
//#endregion
//#region node_modules/shiki/dist/langs-bundle-full-xQVO1Cek.mjs
var bundledLanguagesInfo = [
	{
		"id": "abap",
		"name": "ABAP",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ei))
	},
	{
		"id": "actionscript-3",
		"name": "ActionScript",
		"aliases": ["actionscript", "as3"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ti))
	},
	{
		"id": "ada",
		"name": "Ada",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.wi))
	},
	{
		"id": "ahk",
		"name": "AutoHotkey",
		"aliases": ["ahk1"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ci))
	},
	{
		"id": "ahk2",
		"name": "AutoHotkey2",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Si))
	},
	{
		"id": "angular-html",
		"name": "Angular HTML",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.vi))
	},
	{
		"id": "angular-ts",
		"name": "Angular TypeScript",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.gi))
	},
	{
		"id": "apache",
		"name": "Apache Conf",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.hi))
	},
	{
		"id": "apex",
		"name": "Apex",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.mi))
	},
	{
		"id": "apl",
		"name": "APL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ui))
	},
	{
		"id": "applescript",
		"name": "AppleScript",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.li))
	},
	{
		"id": "ara",
		"name": "Ara",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ci))
	},
	{
		"id": "asciidoc",
		"name": "AsciiDoc",
		"aliases": ["adoc"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.si))
	},
	{
		"id": "asm",
		"name": "Assembly",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.oi))
	},
	{
		"id": "astro",
		"name": "Astro",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ni))
	},
	{
		"id": "awk",
		"name": "AWK",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ti))
	},
	{
		"id": "ballerina",
		"name": "Ballerina",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ei))
	},
	{
		"id": "bat",
		"name": "Batch File",
		"aliases": ["batch", "cmd"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.$r))
	},
	{
		"id": "beancount",
		"name": "Beancount",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Qr))
	},
	{
		"id": "berry",
		"name": "Berry",
		"aliases": ["be"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Zr))
	},
	{
		"id": "bibtex",
		"name": "BibTeX",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Xr))
	},
	{
		"id": "bicep",
		"name": "Bicep",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Yr))
	},
	{
		"id": "bird2",
		"name": "BIRD2 Configuration",
		"aliases": ["bird"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Jr))
	},
	{
		"id": "blade",
		"name": "Blade",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Gr))
	},
	{
		"id": "bsl",
		"name": "1C (Enterprise)",
		"aliases": ["1c"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ur))
	},
	{
		"id": "c",
		"name": "C",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Hr))
	},
	{
		"id": "c3",
		"name": "C3",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Vr))
	},
	{
		"id": "cadence",
		"name": "Cadence",
		"aliases": ["cdc"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Br))
	},
	{
		"id": "cairo",
		"name": "Cairo",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Rr))
	},
	{
		"id": "chapel",
		"name": "Chapel",
		"aliases": ["chpl"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Lr))
	},
	{
		"id": "clarity",
		"name": "Clarity",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ir))
	},
	{
		"id": "clojure",
		"name": "Clojure",
		"aliases": ["clj"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Fr))
	},
	{
		"id": "cmake",
		"name": "CMake",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Pr))
	},
	{
		"id": "cobol",
		"name": "COBOL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Nr))
	},
	{
		"id": "codeowners",
		"name": "CODEOWNERS",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Mr))
	},
	{
		"id": "codeql",
		"name": "CodeQL",
		"aliases": ["ql"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.jr))
	},
	{
		"id": "coffee",
		"name": "CoffeeScript",
		"aliases": ["coffeescript"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ar))
	},
	{
		"id": "common-lisp",
		"name": "Common Lisp",
		"aliases": ["lisp"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.kr))
	},
	{
		"id": "coq",
		"name": "Rocq",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Or))
	},
	{
		"id": "cpp",
		"name": "C++",
		"aliases": ["c++"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Tr))
	},
	{
		"id": "crystal",
		"name": "Crystal",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Cr))
	},
	{
		"id": "csharp",
		"name": "C#",
		"aliases": ["c#", "cs"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Sr))
	},
	{
		"id": "css",
		"name": "CSS",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.bi))
	},
	{
		"id": "csv",
		"name": "CSV",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.xr))
	},
	{
		"id": "cue",
		"name": "CUE",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.br))
	},
	{
		"id": "cypher",
		"name": "Cypher",
		"aliases": ["cql"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.yr))
	},
	{
		"id": "d",
		"name": "D",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.vr))
	},
	{
		"id": "dart",
		"name": "Dart",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n._r))
	},
	{
		"id": "dax",
		"name": "DAX",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.gr))
	},
	{
		"id": "desktop",
		"name": "Desktop",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.hr))
	},
	{
		"id": "diff",
		"name": "Diff",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.mr))
	},
	{
		"id": "docker",
		"name": "Dockerfile",
		"aliases": ["dockerfile"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.pr))
	},
	{
		"id": "dotenv",
		"name": "dotEnv",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.fr))
	},
	{
		"id": "dream-maker",
		"name": "Dream Maker",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.dr))
	},
	{
		"id": "edge",
		"name": "Edge",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ur))
	},
	{
		"id": "elixir",
		"name": "Elixir",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.lr))
	},
	{
		"id": "elm",
		"name": "Elm",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.cr))
	},
	{
		"id": "emacs-lisp",
		"name": "Emacs Lisp",
		"aliases": ["elisp"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.sr))
	},
	{
		"id": "erb",
		"name": "ERB",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.er))
	},
	{
		"id": "erlang",
		"name": "Erlang",
		"aliases": ["erl"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Qn))
	},
	{
		"id": "fennel",
		"name": "Fennel",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Zn))
	},
	{
		"id": "fish",
		"name": "Fish",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Xn))
	},
	{
		"id": "fluent",
		"name": "Fluent",
		"aliases": ["ftl"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Yn))
	},
	{
		"id": "fortran-fixed-form",
		"name": "Fortran (Fixed Form)",
		"aliases": [
			"f",
			"for",
			"f77"
		],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.qn))
	},
	{
		"id": "fortran-free-form",
		"name": "Fortran (Free Form)",
		"aliases": [
			"f90",
			"f95",
			"f03",
			"f08",
			"f18"
		],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Jn))
	},
	{
		"id": "fsharp",
		"name": "F#",
		"aliases": ["f#", "fs"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Kn))
	},
	{
		"id": "gdresource",
		"name": "GDResource",
		"aliases": ["tscn", "tres"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Un))
	},
	{
		"id": "gdscript",
		"name": "GDScript",
		"aliases": ["gd"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Wn))
	},
	{
		"id": "gdshader",
		"name": "GDShader",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Gn))
	},
	{
		"id": "genie",
		"name": "Genie",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Hn))
	},
	{
		"id": "gherkin",
		"name": "Gherkin",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Vn))
	},
	{
		"id": "git-commit",
		"name": "Git Commit Message",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Bn))
	},
	{
		"id": "git-rebase",
		"name": "Git Rebase Message",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.zn))
	},
	{
		"id": "gleam",
		"name": "Gleam",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Rn))
	},
	{
		"id": "glimmer-js",
		"name": "Glimmer JS",
		"aliases": ["gjs"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ln))
	},
	{
		"id": "glimmer-ts",
		"name": "Glimmer TS",
		"aliases": ["gts"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.In))
	},
	{
		"id": "glsl",
		"name": "GLSL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Er))
	},
	{
		"id": "gn",
		"name": "GN",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Fn))
	},
	{
		"id": "gnuplot",
		"name": "Gnuplot",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Pn))
	},
	{
		"id": "go",
		"name": "Go",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Nn))
	},
	{
		"id": "graphql",
		"name": "GraphQL",
		"aliases": ["gql"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ir))
	},
	{
		"id": "groovy",
		"name": "Groovy",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Mn))
	},
	{
		"id": "hack",
		"name": "Hack",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.jn))
	},
	{
		"id": "haml",
		"name": "Ruby Haml",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.or))
	},
	{
		"id": "handlebars",
		"name": "Handlebars",
		"aliases": ["hbs"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.An))
	},
	{
		"id": "haskell",
		"name": "Haskell",
		"aliases": ["hs"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.kn))
	},
	{
		"id": "haxe",
		"name": "Haxe",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.On))
	},
	{
		"id": "hcl",
		"name": "HashiCorp HCL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Dn))
	},
	{
		"id": "hjson",
		"name": "Hjson",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.En))
	},
	{
		"id": "hlsl",
		"name": "HLSL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Tn))
	},
	{
		"id": "html",
		"name": "HTML",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.yi))
	},
	{
		"id": "html-derivative",
		"name": "HTML (Derivative)",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.qr))
	},
	{
		"id": "http",
		"name": "HTTP",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.wn))
	},
	{
		"id": "hurl",
		"name": "Hurl",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Cn))
	},
	{
		"id": "hxml",
		"name": "HXML",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Sn))
	},
	{
		"id": "hy",
		"name": "Hy",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.xn))
	},
	{
		"id": "imba",
		"name": "Imba",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.bn))
	},
	{
		"id": "ini",
		"name": "INI",
		"aliases": ["properties"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.yn))
	},
	{
		"id": "java",
		"name": "Java",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.pi))
	},
	{
		"id": "javascript",
		"name": "JavaScript",
		"aliases": [
			"js",
			"cjs",
			"mjs"
		],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.xi))
	},
	{
		"id": "jinja",
		"name": "Jinja",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.vn))
	},
	{
		"id": "jison",
		"name": "Jison",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n._n))
	},
	{
		"id": "json",
		"name": "JSON",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.di))
	},
	{
		"id": "json5",
		"name": "JSON5",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.gn))
	},
	{
		"id": "jsonc",
		"name": "JSON with Comments",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.hn))
	},
	{
		"id": "jsonl",
		"name": "JSON Lines",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.mn))
	},
	{
		"id": "jsonnet",
		"name": "Jsonnet",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.pn))
	},
	{
		"id": "jssm",
		"name": "JSSM",
		"aliases": ["fsl"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.fn))
	},
	{
		"id": "jsx",
		"name": "JSX",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ar))
	},
	{
		"id": "julia",
		"name": "Julia",
		"aliases": ["jl"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.un))
	},
	{
		"id": "just",
		"name": "Just",
		"aliases": ["justfile"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.cn))
	},
	{
		"id": "kdl",
		"name": "KDL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.sn))
	},
	{
		"id": "kotlin",
		"name": "Kotlin",
		"aliases": ["kt", "kts"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.on))
	},
	{
		"id": "kusto",
		"name": "Kusto",
		"aliases": ["kql"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.an))
	},
	{
		"id": "latex",
		"name": "LaTeX",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.rn))
	},
	{
		"id": "lean",
		"name": "Lean 4",
		"aliases": ["lean4"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.nn))
	},
	{
		"id": "less",
		"name": "Less",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.tn))
	},
	{
		"id": "liquid",
		"name": "Liquid",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.en))
	},
	{
		"id": "llvm",
		"name": "LLVM IR",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.$t))
	},
	{
		"id": "log",
		"name": "Log file",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Qt))
	},
	{
		"id": "logo",
		"name": "Logo",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Zt))
	},
	{
		"id": "lua",
		"name": "Lua",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.rr))
	},
	{
		"id": "luau",
		"name": "Luau",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Xt))
	},
	{
		"id": "make",
		"name": "Makefile",
		"aliases": ["makefile"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Yt))
	},
	{
		"id": "markdown",
		"name": "Markdown",
		"aliases": ["md"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.$n))
	},
	{
		"id": "marko",
		"name": "Marko",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Jt))
	},
	{
		"id": "matlab",
		"name": "MATLAB",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.qt))
	},
	{
		"id": "mdc",
		"name": "MDC",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Kt))
	},
	{
		"id": "mdx",
		"name": "MDX",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Gt))
	},
	{
		"id": "mermaid",
		"name": "Mermaid",
		"aliases": ["mmd"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Wt))
	},
	{
		"id": "mipsasm",
		"name": "MIPS Assembly",
		"aliases": ["mips"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ut))
	},
	{
		"id": "mojo",
		"name": "Mojo",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ht))
	},
	{
		"id": "moonbit",
		"name": "MoonBit",
		"aliases": ["mbt", "mbti"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Vt))
	},
	{
		"id": "move",
		"name": "Move",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Bt))
	},
	{
		"id": "narrat",
		"name": "Narrat Language",
		"aliases": ["nar"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.zt))
	},
	{
		"id": "nextflow",
		"name": "Nextflow",
		"aliases": ["nf"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Lt))
	},
	{
		"id": "nextflow-groovy",
		"name": "Nextflow Groovy",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Rt))
	},
	{
		"id": "nginx",
		"name": "Nginx",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.It))
	},
	{
		"id": "nim",
		"name": "Nim",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ft))
	},
	{
		"id": "nix",
		"name": "Nix",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Pt))
	},
	{
		"id": "nsis",
		"name": "NSIS",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Nt))
	},
	{
		"id": "nushell",
		"name": "nushell",
		"aliases": ["nu"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Mt))
	},
	{
		"id": "objective-c",
		"name": "Objective-C",
		"aliases": ["objc"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.jt))
	},
	{
		"id": "objective-cpp",
		"name": "Objective-C++",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.At))
	},
	{
		"id": "ocaml",
		"name": "OCaml",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.kt))
	},
	{
		"id": "odin",
		"name": "Odin",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ot))
	},
	{
		"id": "openscad",
		"name": "OpenSCAD",
		"aliases": ["scad"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Dt))
	},
	{
		"id": "org",
		"name": "Org Markup",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.yt))
	},
	{
		"id": "pascal",
		"name": "Pascal",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.vt))
	},
	{
		"id": "perl",
		"name": "Perl",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ln))
	},
	{
		"id": "php",
		"name": "PHP",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Et))
	},
	{
		"id": "pkl",
		"name": "Pkl",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n._t))
	},
	{
		"id": "plsql",
		"name": "PL/SQL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.gt))
	},
	{
		"id": "po",
		"name": "Gettext PO",
		"aliases": ["pot", "potx"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ht))
	},
	{
		"id": "polar",
		"name": "Polar",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.mt))
	},
	{
		"id": "postcss",
		"name": "PostCSS",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ii))
	},
	{
		"id": "powerquery",
		"name": "PowerQuery",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.pt))
	},
	{
		"id": "powershell",
		"name": "PowerShell",
		"aliases": [
			"ps",
			"ps1",
			"pwsh"
		],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ft))
	},
	{
		"id": "prisma",
		"name": "Prisma",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.dt))
	},
	{
		"id": "prolog",
		"name": "Prolog",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ut))
	},
	{
		"id": "proto",
		"name": "Protocol Buffer 3",
		"aliases": ["protobuf"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.lt))
	},
	{
		"id": "pug",
		"name": "Pug",
		"aliases": ["jade"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ct))
	},
	{
		"id": "puppet",
		"name": "Puppet",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.st))
	},
	{
		"id": "purescript",
		"name": "PureScript",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ot))
	},
	{
		"id": "python",
		"name": "Python",
		"aliases": ["py"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.zr))
	},
	{
		"id": "qml",
		"name": "QML",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.at))
	},
	{
		"id": "qmldir",
		"name": "QML Directory",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.it))
	},
	{
		"id": "qss",
		"name": "Qt Style Sheets",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.rt))
	},
	{
		"id": "r",
		"name": "R",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.dn))
	},
	{
		"id": "racket",
		"name": "Racket",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.nt))
	},
	{
		"id": "raku",
		"name": "Raku",
		"aliases": ["perl6"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.wt))
	},
	{
		"id": "razor",
		"name": "ASP.NET Razor",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.tt))
	},
	{
		"id": "rbs",
		"name": "RBS",
		"aliases": ["ruby-signature"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.et))
	},
	{
		"id": "reg",
		"name": "Windows Registry Script",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.$))
	},
	{
		"id": "regexp",
		"name": "RegExp",
		"aliases": ["regex"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Dr))
	},
	{
		"id": "rel",
		"name": "Rel",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Q))
	},
	{
		"id": "riscv",
		"name": "RISC-V",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Z))
	},
	{
		"id": "ron",
		"name": "RON",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.X))
	},
	{
		"id": "rosmsg",
		"name": "ROS Interface",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Y))
	},
	{
		"id": "rst",
		"name": "reStructuredText",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.J))
	},
	{
		"id": "ruby",
		"name": "Ruby",
		"aliases": ["rb"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.tr))
	},
	{
		"id": "rust",
		"name": "Rust",
		"aliases": ["rs"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Ct))
	},
	{
		"id": "sas",
		"name": "SAS",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.q))
	},
	{
		"id": "sass",
		"name": "Sass",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.K))
	},
	{
		"id": "scala",
		"name": "Scala",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.St))
	},
	{
		"id": "scheme",
		"name": "Scheme",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.G))
	},
	{
		"id": "scss",
		"name": "SCSS",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n._i))
	},
	{
		"id": "sdbl",
		"name": "1C (Query)",
		"aliases": ["1c-query"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Wr))
	},
	{
		"id": "shaderlab",
		"name": "ShaderLab",
		"aliases": ["shader"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.W))
	},
	{
		"id": "shellscript",
		"name": "Shell",
		"aliases": [
			"bash",
			"sh",
			"shell",
			"zsh"
		],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.wr))
	},
	{
		"id": "shellsession",
		"name": "Shell Session",
		"aliases": ["console"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.U))
	},
	{
		"id": "smalltalk",
		"name": "GNU Smalltalk",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.H))
	},
	{
		"id": "smithy",
		"name": "Smithy",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.V))
	},
	{
		"id": "solidity",
		"name": "Solidity",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.B))
	},
	{
		"id": "soy",
		"name": "Closure Templates",
		"aliases": ["closure-templates"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.z))
	},
	{
		"id": "sparql",
		"name": "SPARQL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.L))
	},
	{
		"id": "splunk",
		"name": "Splunk Query Language",
		"aliases": ["spl"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.I))
	},
	{
		"id": "sql",
		"name": "SQL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Kr))
	},
	{
		"id": "ssh-config",
		"name": "SSH Config",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.F))
	},
	{
		"id": "stata",
		"name": "Stata",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.P))
	},
	{
		"id": "stylus",
		"name": "Stylus",
		"aliases": ["styl"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.N))
	},
	{
		"id": "surrealql",
		"name": "SurrealQL",
		"aliases": ["surql"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.M))
	},
	{
		"id": "svelte",
		"name": "Svelte",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.j))
	},
	{
		"id": "swift",
		"name": "Swift",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.A))
	},
	{
		"id": "system-verilog",
		"name": "SystemVerilog",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.k))
	},
	{
		"id": "systemd",
		"name": "Systemd Units",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.O))
	},
	{
		"id": "talonscript",
		"name": "TalonScript",
		"aliases": ["talon"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.D))
	},
	{
		"id": "tasl",
		"name": "Tasl",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.E))
	},
	{
		"id": "tcl",
		"name": "Tcl",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.T))
	},
	{
		"id": "templ",
		"name": "Templ",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.w))
	},
	{
		"id": "terraform",
		"name": "Terraform",
		"aliases": ["tf", "tfvars"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.C))
	},
	{
		"id": "tex",
		"name": "TeX",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.in))
	},
	{
		"id": "toml",
		"name": "TOML",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.S))
	},
	{
		"id": "ts-tags",
		"name": "TypeScript with Tags",
		"aliases": ["lit"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.x))
	},
	{
		"id": "tsv",
		"name": "TSV",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.b))
	},
	{
		"id": "tsx",
		"name": "TSX",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ri))
	},
	{
		"id": "turtle",
		"name": "Turtle",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.R))
	},
	{
		"id": "twig",
		"name": "Twig",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.y))
	},
	{
		"id": "typescript",
		"name": "TypeScript",
		"aliases": [
			"ts",
			"cts",
			"mts"
		],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.ai))
	},
	{
		"id": "typespec",
		"name": "TypeSpec",
		"aliases": ["tsp"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.v))
	},
	{
		"id": "typst",
		"name": "Typst",
		"aliases": ["typ"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.g))
	},
	{
		"id": "v",
		"name": "V",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.h))
	},
	{
		"id": "vala",
		"name": "Vala",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.m))
	},
	{
		"id": "vb",
		"name": "Visual Basic",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.Tt))
	},
	{
		"id": "verilog",
		"name": "Verilog",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n._))
	},
	{
		"id": "vhdl",
		"name": "VHDL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.p))
	},
	{
		"id": "viml",
		"name": "Vim Script",
		"aliases": ["vim", "vimscript"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.f))
	},
	{
		"id": "vue",
		"name": "Vue",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.l))
	},
	{
		"id": "vue-html",
		"name": "Vue HTML",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.d))
	},
	{
		"id": "vue-vine",
		"name": "Vue Vine",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.u))
	},
	{
		"id": "vyper",
		"name": "Vyper",
		"aliases": ["vy"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.c))
	},
	{
		"id": "wasm",
		"name": "WebAssembly",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.s))
	},
	{
		"id": "wenyan",
		"name": "Wenyan",
		"aliases": ["文言"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.o))
	},
	{
		"id": "wgsl",
		"name": "WGSL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.a))
	},
	{
		"id": "wikitext",
		"name": "Wikitext",
		"aliases": ["mediawiki", "wiki"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.i))
	},
	{
		"id": "wit",
		"name": "WebAssembly Interface Types",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.r))
	},
	{
		"id": "wolfram",
		"name": "Wolfram",
		"aliases": ["wl"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.n))
	},
	{
		"id": "xml",
		"name": "XML",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.fi))
	},
	{
		"id": "xsl",
		"name": "XSL",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.bt))
	},
	{
		"id": "yaml",
		"name": "YAML",
		"aliases": ["yml"],
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.nr))
	},
	{
		"id": "zenscript",
		"name": "ZenScript",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.t))
	},
	{
		"id": "zig",
		"name": "Zig",
		"import": (() => import("./shikijs__langs.mjs").then((n) => n.xt))
	}
];
var bundledLanguagesBase = Object.fromEntries(bundledLanguagesInfo.map((i) => [i.id, i.import]));
var bundledLanguagesAlias = Object.fromEntries(bundledLanguagesInfo.flatMap((i) => i.aliases?.map((a) => [a, i.import]) || []));
var bundledLanguages = {
	...bundledLanguagesBase,
	...bundledLanguagesAlias
};
var bundledThemes = Object.fromEntries([
	{
		"id": "andromeeda",
		"displayName": "Andromeeda",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.dt))
	},
	{
		"id": "aurora-x",
		"displayName": "Aurora X",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.ut))
	},
	{
		"id": "ayu-dark",
		"displayName": "Ayu Dark",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.lt))
	},
	{
		"id": "ayu-light",
		"displayName": "Ayu Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.ct))
	},
	{
		"id": "ayu-mirage",
		"displayName": "Ayu Mirage",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.st))
	},
	{
		"id": "catppuccin-frappe",
		"displayName": "Catppuccin Frappé",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.ot))
	},
	{
		"id": "catppuccin-latte",
		"displayName": "Catppuccin Latte",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.at))
	},
	{
		"id": "catppuccin-macchiato",
		"displayName": "Catppuccin Macchiato",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.it))
	},
	{
		"id": "catppuccin-mocha",
		"displayName": "Catppuccin Mocha",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.rt))
	},
	{
		"id": "dark-plus",
		"displayName": "Dark Plus",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.nt))
	},
	{
		"id": "dracula",
		"displayName": "Dracula Theme",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.et))
	},
	{
		"id": "dracula-soft",
		"displayName": "Dracula Theme Soft",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.tt))
	},
	{
		"id": "everforest-dark",
		"displayName": "Everforest Dark",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.$))
	},
	{
		"id": "everforest-light",
		"displayName": "Everforest Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.Q))
	},
	{
		"id": "github-dark",
		"displayName": "GitHub Dark",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.J))
	},
	{
		"id": "github-dark-default",
		"displayName": "GitHub Dark Default",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.Z))
	},
	{
		"id": "github-dark-dimmed",
		"displayName": "GitHub Dark Dimmed",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.X))
	},
	{
		"id": "github-dark-high-contrast",
		"displayName": "GitHub Dark High Contrast",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.Y))
	},
	{
		"id": "github-light",
		"displayName": "GitHub Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.G))
	},
	{
		"id": "github-light-default",
		"displayName": "GitHub Light Default",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.q))
	},
	{
		"id": "github-light-high-contrast",
		"displayName": "GitHub Light High Contrast",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.K))
	},
	{
		"id": "gruvbox-dark-hard",
		"displayName": "Gruvbox Dark Hard",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.W))
	},
	{
		"id": "gruvbox-dark-medium",
		"displayName": "Gruvbox Dark Medium",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.U))
	},
	{
		"id": "gruvbox-dark-soft",
		"displayName": "Gruvbox Dark Soft",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.H))
	},
	{
		"id": "gruvbox-light-hard",
		"displayName": "Gruvbox Light Hard",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.V))
	},
	{
		"id": "gruvbox-light-medium",
		"displayName": "Gruvbox Light Medium",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.B))
	},
	{
		"id": "gruvbox-light-soft",
		"displayName": "Gruvbox Light Soft",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.z))
	},
	{
		"id": "horizon",
		"displayName": "Horizon",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.L))
	},
	{
		"id": "horizon-bright",
		"displayName": "Horizon Bright",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.R))
	},
	{
		"id": "houston",
		"displayName": "Houston",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.I))
	},
	{
		"id": "kanagawa-dragon",
		"displayName": "Kanagawa Dragon",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.F))
	},
	{
		"id": "kanagawa-lotus",
		"displayName": "Kanagawa Lotus",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.P))
	},
	{
		"id": "kanagawa-wave",
		"displayName": "Kanagawa Wave",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.N))
	},
	{
		"id": "laserwave",
		"displayName": "LaserWave",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.M))
	},
	{
		"id": "light-plus",
		"displayName": "Light Plus",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.j))
	},
	{
		"id": "material-theme",
		"displayName": "Material Theme",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.E))
	},
	{
		"id": "material-theme-darker",
		"displayName": "Material Theme Darker",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.A))
	},
	{
		"id": "material-theme-lighter",
		"displayName": "Material Theme Lighter",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.k))
	},
	{
		"id": "material-theme-ocean",
		"displayName": "Material Theme Ocean",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.O))
	},
	{
		"id": "material-theme-palenight",
		"displayName": "Material Theme Palenight",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.D))
	},
	{
		"id": "min-dark",
		"displayName": "Min Dark",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.T))
	},
	{
		"id": "min-light",
		"displayName": "Min Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.w))
	},
	{
		"id": "monokai",
		"displayName": "Monokai",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.C))
	},
	{
		"id": "night-owl",
		"displayName": "Night Owl",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.x))
	},
	{
		"id": "night-owl-light",
		"displayName": "Night Owl Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.S))
	},
	{
		"id": "nord",
		"displayName": "Nord",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.b))
	},
	{
		"id": "one-dark-pro",
		"displayName": "One Dark Pro",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.y))
	},
	{
		"id": "one-light",
		"displayName": "One Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.v))
	},
	{
		"id": "plastic",
		"displayName": "Plastic",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n._))
	},
	{
		"id": "poimandres",
		"displayName": "Poimandres",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.g))
	},
	{
		"id": "red",
		"displayName": "Red",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.h))
	},
	{
		"id": "rose-pine",
		"displayName": "Rosé Pine",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.f))
	},
	{
		"id": "rose-pine-dawn",
		"displayName": "Rosé Pine Dawn",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.m))
	},
	{
		"id": "rose-pine-moon",
		"displayName": "Rosé Pine Moon",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.p))
	},
	{
		"id": "slack-dark",
		"displayName": "Slack Dark",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.d))
	},
	{
		"id": "slack-ochin",
		"displayName": "Slack Ochin",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.u))
	},
	{
		"id": "snazzy-light",
		"displayName": "Snazzy Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.l))
	},
	{
		"id": "solarized-dark",
		"displayName": "Solarized Dark",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.c))
	},
	{
		"id": "solarized-light",
		"displayName": "Solarized Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.s))
	},
	{
		"id": "synthwave-84",
		"displayName": "Synthwave '84",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.o))
	},
	{
		"id": "tokyo-night",
		"displayName": "Tokyo Night",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.a))
	},
	{
		"id": "vesper",
		"displayName": "Vesper",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.i))
	},
	{
		"id": "vitesse-black",
		"displayName": "Vitesse Black",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.r))
	},
	{
		"id": "vitesse-dark",
		"displayName": "Vitesse Dark",
		"type": "dark",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.n))
	},
	{
		"id": "vitesse-light",
		"displayName": "Vitesse Light",
		"type": "light",
		"import": (() => import("./shikijs__themes.mjs").then((n) => n.t))
	}
].map((i) => [i.id, i.import]));
//#endregion
//#region node_modules/shiki/dist/engine-oniguruma.mjs
var engine_oniguruma_exports = /* @__PURE__ */ __exportAll({});
__reExport(engine_oniguruma_exports, dist_exports);
//#endregion
//#region node_modules/shiki/dist/bundle-full.mjs
/**
* Initiate a highlighter instance and load the specified languages and themes.
* Later it can be used synchronously to highlight code.
*
* Importing this function will bundle all languages and themes.
* @see https://shiki.style/guide/bundles#shiki-bundle-full
*
* For granular control over the bundle, check:
* @see https://shiki.style/guide/bundles#fine-grained-bundle
*/
var createHighlighter = /* @__PURE__ */ createBundledHighlighter({
	langs: bundledLanguages,
	themes: bundledThemes,
	engine: () => (0, engine_oniguruma_exports.createOnigurumaEngine)(import("./shiki.mjs").then((n) => n.t))
});
var { codeToHtml, codeToHast, codeToTokens, codeToTokensBase, codeToTokensWithThemes, getSingletonHighlighter, getLastGrammarState } = /* @__PURE__ */ createSingletonShorthands(createHighlighter, { guessEmbeddedLanguages });
//#endregion
//#region node_modules/@streamdown/code/dist/index.js
var O = createJavaScriptRegexEngine({ forgiving: true });
var b = Object.fromEntries(bundledLanguagesInfo.flatMap((n) => {
	var e;
	return ((e = n.aliases) != null ? e : []).map((t) => [t, n.id]);
}));
var T = new Set(Object.keys(bundledLanguages));
var C = (n) => {
	let t = n.trim().toLowerCase();
	return b[t] || (T.has(t), t);
};
var L = /* @__PURE__ */ new Map();
var P = 3e5;
var M = 5e3;
var _ = 64;
var o = /* @__PURE__ */ new Map();
var B = 0;
var $ = (n, e) => {
	let t = e.tokens.length + Math.ceil(n.length / _);
	for (let g of e.tokens) t += g.length;
	return t;
};
var I = (n) => {
	let e = o.get(n);
	return e && (o.delete(n), o.set(n, e)), e == null ? void 0 : e.result;
};
var R = (n) => {
	let e = o.get(n);
	e && (o.delete(n), B -= e.cost);
};
var G = (n, e) => {
	R(n);
	let t = $(n, e);
	for (o.set(n, {
		cost: t,
		result: e
	}), B += t; (B > P || o.size > M) && o.size > 1;) R(o.keys().next().value);
};
var S = /* @__PURE__ */ new Map();
var z = 4;
var N = (n, e) => {
	let t = S.get(n);
	if (!t) return;
	let g = t.findIndex((r) => e.startsWith(r.prefix));
	return g === -1 ? void 0 : t.splice(g, 1)[0];
};
var H = (n, e) => {
	let t = S.get(n);
	t || (t = [], S.set(n, t)), t.unshift(e), t.length > z && t.pop();
};
var x = (n, e) => {
	if (e !== 0) for (let t of n) for (let g of t) g.offset += e;
};
var j = (n, e, t, g, r) => {
	let s = N(t, e), l = s ? s.prefix : "", u = s ? s.rows : [], a = s == null ? void 0 : s.grammarState, i = e.lastIndexOf(`
`) + 1;
	if (i > l.length) {
		let c = n.codeToTokens(e.slice(l.length, i), {
			lang: g,
			themes: r,
			grammarState: a
		}), h = c.tokens;
		h.pop(), x(h, l.length), u = u.concat(h), a = c.grammarState, l = e.slice(0, i), H(t, {
			grammarState: a,
			prefix: l,
			rows: u
		});
	} else s && H(t, s);
	let d = n.codeToTokens(e.slice(i), {
		lang: g,
		themes: r,
		grammarState: a
	});
	return x(d.tokens, i), {
		...d,
		tokens: u.concat(d.tokens)
	};
};
var f = (n) => {
	var e;
	return typeof n == "string" ? n : (e = n.name) != null ? e : "custom";
};
var w = (n, e) => `${n}-${f(e[0])}-${f(e[1])}`;
var X = (n, e, t) => `${e}:${t[0]}:${t[1]}
${n}`;
var D = (n, e) => {
	let t = w(n, e);
	if (L.has(t)) return L.get(t);
	let g = createHighlighter({
		themes: e,
		langs: [n],
		engine: O
	});
	return L.set(t, g), g;
};
function U(n = {}) {
	var t;
	let e = (t = n.themes) != null ? t : ["github-light", "github-dark"];
	return {
		name: "shiki",
		type: "code-highlighter",
		supportsLanguage(g) {
			let r = C(g);
			return T.has(r);
		},
		getSupportedLanguages() {
			return Array.from(T);
		},
		getThemes() {
			return e;
		},
		highlight({ code: g, language: r, themes: s, isIncomplete: l = false }, u) {
			let a = C(r), i = [f(s[0]), f(s[1])], d = T.has(a) ? a : "text", c = X(g, d, i);
			return I(c) || (D(d, s).then((m) => {
				let k = m.getLoadedLanguages().includes(a) ? a : "text", p = I(c);
				p || (p = j(m, g, `${w(d, s)}:${k}`, k, {
					light: i[0],
					dark: i[1]
				}), l || G(c, p)), u?.(p);
			}).catch((m) => {
				console.error("[Streamdown Code] Failed to highlight code:", m);
			}), null);
		}
	};
}
var W = U();
//#endregion
export { W as t };
