import { a as parse, d as html, f as svg, h as normalize, p as find, s as parse$1 } from "./@shikijs/core+[...].mjs";
import "./devlop.mjs";
//#region node_modules/hast-util-parse-selector/lib/index.js
/**
* @typedef {import('hast').Element} Element
* @typedef {import('hast').Properties} Properties
*/
/**
* @template {string} SimpleSelector
*   Selector type.
* @template {string} DefaultTagName
*   Default tag name.
* @typedef {(
*   SimpleSelector extends ''
*     ? DefaultTagName
*     : SimpleSelector extends `${infer TagName}.${infer Rest}`
*     ? ExtractTagName<TagName, DefaultTagName>
*     : SimpleSelector extends `${infer TagName}#${infer Rest}`
*     ? ExtractTagName<TagName, DefaultTagName>
*     : SimpleSelector extends string
*     ? SimpleSelector
*     : DefaultTagName
* )} ExtractTagName
*   Extract tag name from a simple selector.
*/
var search = /[#.]/g;
/**
* Create a hast element from a simple CSS selector.
*
* @template {string} Selector
*   Type of selector.
* @template {string} [DefaultTagName='div']
*   Type of default tag name (default: `'div'`).
* @param {Selector | null | undefined} [selector]
*   Simple CSS selector (optional).
*
*   Can contain a tag name (`foo`), classes (`.bar`), and an ID (`#baz`).
*   Multiple classes are allowed.
*   Uses the last ID if multiple IDs are found.
* @param {DefaultTagName | null | undefined} [defaultTagName='div']
*   Tag name to use if `selector` does not specify one (default: `'div'`).
* @returns {Element & {tagName: ExtractTagName<Selector, DefaultTagName>}}
*   Built element.
*/
function parseSelector(selector, defaultTagName) {
	const value = selector || "";
	/** @type {Properties} */
	const props = {};
	let start = 0;
	/** @type {string | undefined} */
	let previous;
	/** @type {string | undefined} */
	let tagName;
	while (start < value.length) {
		search.lastIndex = start;
		const match = search.exec(value);
		const subvalue = value.slice(start, match ? match.index : value.length);
		if (subvalue) {
			if (!previous) tagName = subvalue;
			else if (previous === "#") props.id = subvalue;
			else if (Array.isArray(props.className)) props.className.push(subvalue);
			else props.className = [subvalue];
			start += subvalue.length;
		}
		if (match) {
			previous = match[0];
			start++;
		}
	}
	return {
		type: "element",
		tagName: tagName || defaultTagName || "div",
		properties: props,
		children: []
	};
}
//#endregion
//#region node_modules/hastscript/lib/create-h.js
/**
* @import {Element, Nodes, RootContent, Root} from 'hast'
* @import {Info, Schema} from 'property-information'
*/
/**
* @typedef {Array<Nodes | PrimitiveChild>} ArrayChildNested
*   List of children (deep).
*/
/**
* @typedef {Array<ArrayChildNested | Nodes | PrimitiveChild>} ArrayChild
*   List of children.
*/
/**
* @typedef {Array<number | string>} ArrayValue
*   List of property values for space- or comma separated values (such as `className`).
*/
/**
* @typedef {ArrayChild | Nodes | PrimitiveChild} Child
*   Acceptable child value.
*/
/**
* @typedef {number | string | null | undefined} PrimitiveChild
*   Primitive children, either ignored (nullish), or turned into text nodes.
*/
/**
* @typedef {boolean | number | string | null | undefined} PrimitiveValue
*   Primitive property value.
*/
/**
* @typedef {Record<string, PropertyValue | Style>} Properties
*   Acceptable value for element properties.
*/
/**
* @typedef {ArrayValue | PrimitiveValue} PropertyValue
*   Primitive value or list value.
*/
/**
* @typedef {Element | Root} Result
*   Result from a `h` (or `s`) call.
*/
/**
* @typedef {number | string} StyleValue
*   Value for a CSS style field.
*/
/**
* @typedef {Record<string, StyleValue>} Style
*   Supported value of a `style` prop.
*/
/**
* @param {Schema} schema
*   Schema to use.
* @param {string} defaultTagName
*   Default tag name.
* @param {ReadonlyArray<string> | undefined} [caseSensitive]
*   Case-sensitive tag names (default: `undefined`).
* @returns
*   `h`.
*/
function createH(schema, defaultTagName, caseSensitive) {
	const adjust = caseSensitive ? createAdjustMap(caseSensitive) : void 0;
	/**
	* Hyperscript compatible DSL for creating virtual hast trees.
	*
	* @overload
	* @param {null | undefined} [selector]
	* @param {...Child} children
	* @returns {Root}
	*
	* @overload
	* @param {string} selector
	* @param {Properties} properties
	* @param {...Child} children
	* @returns {Element}
	*
	* @overload
	* @param {string} selector
	* @param {...Child} children
	* @returns {Element}
	*
	* @param {string | null | undefined} [selector]
	*   Selector.
	* @param {Child | Properties | null | undefined} [properties]
	*   Properties (or first child) (default: `undefined`).
	* @param {...Child} children
	*   Children.
	* @returns {Result}
	*   Result.
	*/
	function h(selector, properties, ...children) {
		/** @type {Result} */
		let node;
		if (selector === null || selector === void 0) {
			node = {
				type: "root",
				children: []
			};
			const child = properties;
			children.unshift(child);
		} else {
			node = parseSelector(selector, defaultTagName);
			const lower = node.tagName.toLowerCase();
			const adjusted = adjust ? adjust.get(lower) : void 0;
			node.tagName = adjusted || lower;
			if (isChild(properties)) children.unshift(properties);
			else for (const [key, value] of Object.entries(properties)) addProperty(schema, node.properties, key, value);
		}
		for (const child of children) addChild(node.children, child);
		if (node.type === "element" && node.tagName === "template") {
			node.content = {
				type: "root",
				children: node.children
			};
			node.children = [];
		}
		return node;
	}
	return h;
}
/**
* Check if something is properties or a child.
*
* @param {Child | Properties} value
*   Value to check.
* @returns {value is Child}
*   Whether `value` is definitely a child.
*/
function isChild(value) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) return true;
	if (typeof value.type !== "string") return false;
	const record = value;
	const keys = Object.keys(value);
	for (const key of keys) {
		const value = record[key];
		if (value && typeof value === "object") {
			if (!Array.isArray(value)) return true;
			const list = value;
			for (const item of list) if (typeof item !== "number" && typeof item !== "string") return true;
		}
	}
	if ("children" in value && Array.isArray(value.children)) return true;
	return false;
}
/**
* @param {Schema} schema
*   Schema.
* @param {Properties} properties
*   Properties object.
* @param {string} key
*   Property name.
* @param {PropertyValue | Style} value
*   Property value.
* @returns {undefined}
*   Nothing.
*/
function addProperty(schema, properties, key, value) {
	const info = find(schema, key);
	/** @type {PropertyValue} */
	let result;
	if (value === null || value === void 0) return;
	if (typeof value === "number") {
		if (Number.isNaN(value)) return;
		result = value;
	} else if (typeof value === "boolean") result = value;
	else if (typeof value === "string") if (info.spaceSeparated) result = parse(value);
	else if (info.commaSeparated) result = parse$1(value);
	else if (info.commaOrSpaceSeparated) result = parse(parse$1(value).join(" "));
	else result = parsePrimitive(info, info.property, value);
	else if (Array.isArray(value)) result = [...value];
	else result = info.property === "style" ? style(value) : String(value);
	if (Array.isArray(result)) {
		/** @type {Array<number | string>} */
		const finalResult = [];
		for (const item of result) finalResult.push(parsePrimitive(info, info.property, item));
		result = finalResult;
	}
	if (info.property === "className" && Array.isArray(properties.className)) result = properties.className.concat(result);
	properties[info.property] = result;
}
/**
* @param {Array<RootContent>} nodes
*   Children.
* @param {Child} value
*   Child.
* @returns {undefined}
*   Nothing.
*/
function addChild(nodes, value) {
	if (value === null || value === void 0) {} else if (typeof value === "number" || typeof value === "string") nodes.push({
		type: "text",
		value: String(value)
	});
	else if (Array.isArray(value)) for (const child of value) addChild(nodes, child);
	else if (typeof value === "object" && "type" in value) if (value.type === "root") addChild(nodes, value.children);
	else nodes.push(value);
	else throw new Error("Expected node, nodes, or string, got `" + value + "`");
}
/**
* Parse a single primitives.
*
* @param {Info} info
*   Property information.
* @param {string} name
*   Property name.
* @param {PrimitiveValue} value
*   Property value.
* @returns {PrimitiveValue}
*   Property value.
*/
function parsePrimitive(info, name, value) {
	if (typeof value === "string") {
		if (info.number && value && !Number.isNaN(Number(value))) return Number(value);
		if ((info.boolean || info.overloadedBoolean) && (value === "" || normalize(value) === normalize(name))) return true;
	}
	return value;
}
/**
* Serialize a `style` object as a string.
*
* @param {Style} styles
*   Style object.
* @returns {string}
*   CSS string.
*/
function style(styles) {
	/** @type {Array<string>} */
	const result = [];
	for (const [key, value] of Object.entries(styles)) result.push([key, value].join(": "));
	return result.join("; ");
}
/**
* Create a map to adjust casing.
*
* @param {ReadonlyArray<string>} values
*   List of properly cased keys.
* @returns {Map<string, string>}
*   Map of lowercase keys to uppercase keys.
*/
function createAdjustMap(values) {
	/** @type {Map<string, string>} */
	const result = /* @__PURE__ */ new Map();
	for (const value of values) result.set(value.toLowerCase(), value);
	return result;
}
//#endregion
//#region node_modules/hastscript/lib/svg-case-sensitive-tag-names.js
/**
* List of case-sensitive SVG tag names.
*
* @type {ReadonlyArray<string>}
*/
var svgCaseSensitiveTagNames = [
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"clipPath",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"foreignObject",
	"glyphRef",
	"linearGradient",
	"radialGradient",
	"solidColor",
	"textArea",
	"textPath"
];
//#endregion
//#region node_modules/hastscript/lib/index.js
/**
* @typedef {import('./jsx-classic.js').Element} h.JSX.Element
* @typedef {import('./jsx-classic.js').ElementChildrenAttribute} h.JSX.ElementChildrenAttribute
* @typedef {import('./jsx-classic.js').IntrinsicAttributes} h.JSX.IntrinsicAttributes
* @typedef {import('./jsx-classic.js').IntrinsicElements} h.JSX.IntrinsicElements
*/
/**
* @typedef {import('./jsx-classic.js').Element} s.JSX.Element
* @typedef {import('./jsx-classic.js').ElementChildrenAttribute} s.JSX.ElementChildrenAttribute
* @typedef {import('./jsx-classic.js').IntrinsicAttributes} s.JSX.IntrinsicAttributes
* @typedef {import('./jsx-classic.js').IntrinsicElements} s.JSX.IntrinsicElements
*/
/** @type {ReturnType<createH>} */
var h = createH(html, "div");
/** @type {ReturnType<createH>} */
var s = createH(svg, "g", svgCaseSensitiveTagNames);
//#endregion
//#region node_modules/vfile-location/lib/index.js
/**
* @import {VFile, Value} from 'vfile'
* @import {Location} from 'vfile-location'
*/
/**
* Create an index of the given document to translate between line/column and
* offset based positional info.
*
* Also implemented in Rust in [`wooorm/markdown-rs`][markdown-rs].
*
* [markdown-rs]: https://github.com/wooorm/markdown-rs/blob/main/src/util/location.rs
*
* @param {VFile | Value} file
*   File to index.
* @returns {Location}
*   Accessors for index.
*/
function location(file) {
	const value = String(file);
	/**
	* List, where each index is a line number (0-based), and each value is the
	* byte index *after* where the line ends.
	*
	* @type {Array<number>}
	*/
	const indices = [];
	return {
		toOffset,
		toPoint
	};
	/** @type {Location['toPoint']} */
	function toPoint(offset) {
		if (typeof offset === "number" && offset > -1 && offset <= value.length) {
			let index = 0;
			while (true) {
				let end = indices[index];
				if (end === void 0) {
					const eol = next(value, indices[index - 1]);
					end = eol === -1 ? value.length + 1 : eol + 1;
					indices[index] = end;
				}
				if (end > offset) return {
					line: index + 1,
					column: offset - (index > 0 ? indices[index - 1] : 0) + 1,
					offset
				};
				index++;
			}
		}
	}
	/** @type {Location['toOffset']} */
	function toOffset(point) {
		if (point && typeof point.line === "number" && typeof point.column === "number" && !Number.isNaN(point.line) && !Number.isNaN(point.column)) {
			while (indices.length < point.line) {
				const from = indices[indices.length - 1];
				const eol = next(value, from);
				const end = eol === -1 ? value.length + 1 : eol + 1;
				if (from === end) break;
				indices.push(end);
			}
			const offset = (point.line > 1 ? indices[point.line - 2] : 0) + point.column - 1;
			if (offset < indices[point.line - 1]) return offset;
		}
	}
}
/**
* @param {string} value
* @param {number} from
*/
function next(value, from) {
	const cr = value.indexOf("\r", from);
	const lf = value.indexOf("\n", from);
	if (lf === -1) return cr;
	if (cr === -1 || cr + 1 === lf) return lf;
	return cr < lf ? cr : lf;
}
//#endregion
//#region node_modules/web-namespaces/index.js
/**
* Map of web namespaces.
*
* @type {Record<string, string>}
*/
var webNamespaces = {
	html: "http://www.w3.org/1999/xhtml",
	mathml: "http://www.w3.org/1998/Math/MathML",
	svg: "http://www.w3.org/2000/svg",
	xlink: "http://www.w3.org/1999/xlink",
	xml: "http://www.w3.org/XML/1998/namespace",
	xmlns: "http://www.w3.org/2000/xmlns/"
};
//#endregion
//#region node_modules/hast-util-from-parse5/lib/index.js
/**
* @import {ElementData, Element, Nodes, RootContent, Root} from 'hast'
* @import {DefaultTreeAdapterMap, Token} from 'parse5'
* @import {Schema} from 'property-information'
* @import {Point, Position} from 'unist'
* @import {VFile} from 'vfile'
* @import {Options} from 'hast-util-from-parse5'
*/
/**
* @typedef State
*   Info passed around about the current state.
* @property {VFile | undefined} file
*   Corresponding file.
* @property {boolean} location
*   Whether location info was found.
* @property {Schema} schema
*   Current schema.
* @property {boolean | undefined} verbose
*   Add extra positional info.
*/
var own = {}.hasOwnProperty;
/** @type {unknown} */
var proto = Object.prototype;
/**
* Transform a `parse5` AST to hast.
*
* @param {DefaultTreeAdapterMap['node']} tree
*   `parse5` tree to transform.
* @param {Options | null | undefined} [options]
*   Configuration (optional).
* @returns {Nodes}
*   hast tree.
*/
function fromParse5(tree, options) {
	const settings = options || {};
	return one({
		file: settings.file || void 0,
		location: false,
		schema: settings.space === "svg" ? svg : html,
		verbose: settings.verbose || false
	}, tree);
}
/**
* Transform a node.
*
* @param {State} state
*   Info passed around about the current state.
* @param {DefaultTreeAdapterMap['node']} node
*   p5 node.
* @returns {Nodes}
*   hast node.
*/
function one(state, node) {
	/** @type {Nodes} */
	let result;
	switch (node.nodeName) {
		case "#comment": {
			const reference = node;
			result = {
				type: "comment",
				value: reference.data
			};
			patch(state, reference, result);
			return result;
		}
		case "#document":
		case "#document-fragment": {
			const reference = node;
			const quirksMode = "mode" in reference ? reference.mode === "quirks" || reference.mode === "limited-quirks" : false;
			result = {
				type: "root",
				children: all(state, node.childNodes),
				data: { quirksMode }
			};
			if (state.file && state.location) {
				const document = String(state.file);
				const loc = location(document);
				const start = loc.toPoint(0);
				const end = loc.toPoint(document.length);
				result.position = {
					start,
					end
				};
			}
			return result;
		}
		case "#documentType": {
			const reference = node;
			result = { type: "doctype" };
			patch(state, reference, result);
			return result;
		}
		case "#text": {
			const reference = node;
			result = {
				type: "text",
				value: reference.value
			};
			patch(state, reference, result);
			return result;
		}
		default:
			result = element(state, node);
			return result;
	}
}
/**
* Transform children.
*
* @param {State} state
*   Info passed around about the current state.
* @param {Array<DefaultTreeAdapterMap['node']>} nodes
*   Nodes.
* @returns {Array<RootContent>}
*   hast nodes.
*/
function all(state, nodes) {
	let index = -1;
	/** @type {Array<RootContent>} */
	const results = [];
	while (++index < nodes.length) {
		const result = one(state, nodes[index]);
		results.push(result);
	}
	return results;
}
/**
* Transform an element.
*
* @param {State} state
*   Info passed around about the current state.
* @param {DefaultTreeAdapterMap['element']} node
*   `parse5` node to transform.
* @returns {Element}
*   hast node.
*/
function element(state, node) {
	const schema = state.schema;
	state.schema = node.namespaceURI === webNamespaces.svg ? svg : html;
	let index = -1;
	/** @type {Record<string, string>} */
	const properties = {};
	while (++index < node.attrs.length) {
		const attribute = node.attrs[index];
		const name = (attribute.prefix ? attribute.prefix + ":" : "") + attribute.name;
		if (!own.call(proto, name)) properties[name] = attribute.value;
	}
	const result = (state.schema.space === "svg" ? s : h)(node.tagName, properties, all(state, node.childNodes));
	patch(state, node, result);
	if (result.tagName === "template") {
		const reference = node;
		const pos = reference.sourceCodeLocation;
		const startTag = pos && pos.startTag && position(pos.startTag);
		const endTag = pos && pos.endTag && position(pos.endTag);
		const content = one(state, reference.content);
		if (startTag && endTag && state.file) content.position = {
			start: startTag.end,
			end: endTag.start
		};
		result.content = content;
	}
	state.schema = schema;
	return result;
}
/**
* Patch positional info from `from` onto `to`.
*
* @param {State} state
*   Info passed around about the current state.
* @param {DefaultTreeAdapterMap['node']} from
*   p5 node.
* @param {Nodes} to
*   hast node.
* @returns {undefined}
*   Nothing.
*/
function patch(state, from, to) {
	if ("sourceCodeLocation" in from && from.sourceCodeLocation && state.file) {
		const position = createLocation(state, to, from.sourceCodeLocation);
		if (position) {
			state.location = true;
			to.position = position;
		}
	}
}
/**
* Create clean positional information.
*
* @param {State} state
*   Info passed around about the current state.
* @param {Nodes} node
*   hast node.
* @param {Token.ElementLocation} location
*   p5 location info.
* @returns {Position | undefined}
*   Position, or nothing.
*/
function createLocation(state, node, location) {
	const result = position(location);
	if (node.type === "element") {
		const tail = node.children[node.children.length - 1];
		if (result && !location.endTag && tail && tail.position && tail.position.end) result.end = Object.assign({}, tail.position.end);
		if (state.verbose) {
			/** @type {Record<string, Position | undefined>} */
			const properties = {};
			/** @type {string} */
			let key;
			if (location.attrs) {
				for (key in location.attrs) if (own.call(location.attrs, key)) properties[find(state.schema, key).property] = position(location.attrs[key]);
			}
			location.startTag;
			const opening = position(location.startTag);
			const closing = location.endTag ? position(location.endTag) : void 0;
			/** @type {ElementData['position']} */
			const data = { opening };
			if (closing) data.closing = closing;
			data.properties = properties;
			node.data = { position: data };
		}
	}
	return result;
}
/**
* Turn a p5 location into a position.
*
* @param {Token.Location} loc
*   Location.
* @returns {Position | undefined}
*   Position or nothing.
*/
function position(loc) {
	const start = point({
		line: loc.startLine,
		column: loc.startCol,
		offset: loc.startOffset
	});
	const end = point({
		line: loc.endLine,
		column: loc.endCol,
		offset: loc.endOffset
	});
	return start || end ? {
		start,
		end
	} : void 0;
}
/**
* Filter out invalid points.
*
* @param {Point} point
*   Point with potentially `undefined` values.
* @returns {Point | undefined}
*   Point or nothing.
*/
function point(point) {
	return point.line && point.column ? point : void 0;
}
//#endregion
export { webNamespaces as n, fromParse5 as t };
