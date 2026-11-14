import { i as __toESM, n as __exportAll } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "./@ai-sdk/react+[...].mjs";
import { n as clsx } from "./class-variance-authority+clsx.mjs";
import { c as require_react_dom } from "./@dnd-kit/core+[...].mjs";
import { a as visit, o as SKIP, s as visitParents } from "./hast-util-raw+[...].mjs";
import { t as harden } from "./rehype-harden.mjs";
import "./devlop.mjs";
import { t as rehypeRaw } from "./rehype-raw.mjs";
import { n as defaultSchema } from "./hast-util-sanitize.mjs";
import { t as rehypeSanitize } from "./rehype-sanitize.mjs";
import { t as remarkGfm } from "./remark-gfm.mjs";
import { n as Or } from "./remend.mjs";
import { n as VFileMessage, t as toJsxRuntime } from "./hast-util-to-jsx-runtime+[...].mjs";
import { t as urlAttributes } from "./html-url-attributes.mjs";
import { t as remarkParse } from "./remark-parse.mjs";
import { t as remarkRehype } from "./remark-rehype.mjs";
import { t as bail } from "./bail.mjs";
import { t as require_extend } from "./extend.mjs";
import { t as isPlainObject } from "./is-plain-obj.mjs";
import { t as T$1 } from "./marked.mjs";
import minpath from "node:path";
import minproc from "node:process";
import { fileURLToPath as urlToPath } from "node:url";
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
/**
* Concatenates two arrays faster than the array spread operator.
*/
var concatArrays = (array1, array2) => {
	const combinedArray = new Array(array1.length + array2.length);
	for (let i = 0; i < array1.length; i++) combinedArray[i] = array1[i];
	for (let i = 0; i < array2.length; i++) combinedArray[array1.length + i] = array2[i];
	return combinedArray;
};
var createClassValidatorObject = (classGroupId, validator) => ({
	classGroupId,
	validator
});
var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
	nextPart,
	validators,
	classGroupId
});
var CLASS_PART_SEPARATOR = "-";
var EMPTY_CONFLICTS = [];
var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
var createClassGroupUtils = (config) => {
	const classMap = createClassMap(config);
	const { conflictingClassGroups, conflictingClassGroupModifiers } = config;
	const getClassGroupId = (className) => {
		if (className.startsWith("[") && className.endsWith("]")) return getGroupIdForArbitraryProperty(className);
		const classParts = className.split(CLASS_PART_SEPARATOR);
		return getGroupRecursive(classParts, classParts[0] === "" && classParts.length > 1 ? 1 : 0, classMap);
	};
	const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
		if (hasPostfixModifier) {
			const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
			const baseConflicts = conflictingClassGroups[classGroupId];
			if (modifierConflicts) {
				if (baseConflicts) return concatArrays(baseConflicts, modifierConflicts);
				return modifierConflicts;
			}
			return baseConflicts || EMPTY_CONFLICTS;
		}
		return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
	};
	return {
		getClassGroupId,
		getConflictingClassGroupIds
	};
};
var getGroupRecursive = (classParts, startIndex, classPartObject) => {
	if (classParts.length - startIndex === 0) return classPartObject.classGroupId;
	const currentClassPart = classParts[startIndex];
	const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
	if (nextClassPartObject) {
		const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
		if (result) return result;
	}
	const validators = classPartObject.validators;
	if (validators === null) return;
	const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
	const validatorsLength = validators.length;
	for (let i = 0; i < validatorsLength; i++) {
		const validatorObj = validators[i];
		if (validatorObj.validator(classRest)) return validatorObj.classGroupId;
	}
};
/**
* Get the class group ID for an arbitrary property.
*
* @param className - The class name to get the group ID for. Is expected to be string starting with `[` and ending with `]`.
*/
var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	const content = className.slice(1, -1);
	const colonIndex = content.indexOf(":");
	const property = content.slice(0, colonIndex);
	return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
/**
* Exported for testing only
*/
var createClassMap = (config) => {
	const { theme, classGroups } = config;
	return processClassGroups(classGroups, theme);
};
var processClassGroups = (classGroups, theme) => {
	const classMap = createClassPartObject();
	for (const classGroupId in classGroups) {
		const group = classGroups[classGroupId];
		processClassesRecursively(group, classMap, classGroupId, theme);
	}
	return classMap;
};
var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
	const len = classGroup.length;
	for (let i = 0; i < len; i++) {
		const classDefinition = classGroup[i];
		processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
	}
};
var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	if (typeof classDefinition === "string") {
		processStringDefinition(classDefinition, classPartObject, classGroupId);
		return;
	}
	if (typeof classDefinition === "function") {
		processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
		return;
	}
	processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
	const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
	classPartObjectToEdit.classGroupId = classGroupId;
};
var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	if (isThemeGetter(classDefinition)) {
		processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
		return;
	}
	if (classPartObject.validators === null) classPartObject.validators = [];
	classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	const entries = Object.entries(classDefinition);
	const len = entries.length;
	for (let i = 0; i < len; i++) {
		const [key, value] = entries[i];
		processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
	}
};
var getPart = (classPartObject, path) => {
	let current = classPartObject;
	const parts = path.split(CLASS_PART_SEPARATOR);
	const len = parts.length;
	for (let i = 0; i < len; i++) {
		const part = parts[i];
		let next = current.nextPart.get(part);
		if (!next) {
			next = createClassPartObject();
			current.nextPart.set(part, next);
		}
		current = next;
	}
	return current;
};
var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
var createLruCache = (maxCacheSize) => {
	if (maxCacheSize < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let cacheSize = 0;
	let cache = Object.create(null);
	let previousCache = Object.create(null);
	const update = (key, value) => {
		cache[key] = value;
		cacheSize++;
		if (cacheSize > maxCacheSize) {
			cacheSize = 0;
			previousCache = cache;
			cache = Object.create(null);
		}
	};
	return {
		get(key) {
			let value = cache[key];
			if (value !== void 0) return value;
			if ((value = previousCache[key]) !== void 0) {
				update(key, value);
				return value;
			}
		},
		set(key, value) {
			if (key in cache) cache[key] = value;
			else update(key, value);
		}
	};
};
var IMPORTANT_MODIFIER = "!";
var MODIFIER_SEPARATOR = ":";
var EMPTY_MODIFIERS = [];
var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
	modifiers,
	hasImportantModifier,
	baseClassName,
	maybePostfixModifierPosition,
	isExternal
});
var createParseClassName = (config) => {
	const { prefix, experimentalParseClassName } = config;
	/**
	* Parse class name into parts.
	*
	* Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
	* @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
	*/
	let parseClassName = (className) => {
		const modifiers = [];
		let bracketDepth = 0;
		let parenDepth = 0;
		let modifierStart = 0;
		let postfixModifierPosition;
		const len = className.length;
		for (let index = 0; index < len; index++) {
			const currentCharacter = className[index];
			if (bracketDepth === 0 && parenDepth === 0) {
				if (currentCharacter === MODIFIER_SEPARATOR) {
					modifiers.push(className.slice(modifierStart, index));
					modifierStart = index + 1;
					continue;
				}
				if (currentCharacter === "/") {
					postfixModifierPosition = index;
					continue;
				}
			}
			if (currentCharacter === "[") bracketDepth++;
			else if (currentCharacter === "]") bracketDepth--;
			else if (currentCharacter === "(") parenDepth++;
			else if (currentCharacter === ")") parenDepth--;
		}
		const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
		let baseClassName = baseClassNameWithImportantModifier;
		let hasImportantModifier = false;
		if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
			baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
			hasImportantModifier = true;
		} else if (baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)) {
			baseClassName = baseClassNameWithImportantModifier.slice(1);
			hasImportantModifier = true;
		}
		const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
		return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
	};
	if (prefix) {
		const fullPrefix = prefix + MODIFIER_SEPARATOR;
		const parseClassNameOriginal = parseClassName;
		parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
	}
	if (experimentalParseClassName) {
		const parseClassNameOriginal = parseClassName;
		parseClassName = (className) => experimentalParseClassName({
			className,
			parseClassName: parseClassNameOriginal
		});
	}
	return parseClassName;
};
/**
* Sorts modifiers according to following schema:
* - Predefined modifiers are sorted alphabetically
* - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
*/
var createSortModifiers = (config) => {
	const modifierWeights = /* @__PURE__ */ new Map();
	config.orderSensitiveModifiers.forEach((mod, index) => {
		modifierWeights.set(mod, 1e6 + index);
	});
	return (modifiers) => {
		const result = [];
		let currentSegment = [];
		for (let i = 0; i < modifiers.length; i++) {
			const modifier = modifiers[i];
			const isArbitrary = modifier[0] === "[";
			const isOrderSensitive = modifierWeights.has(modifier);
			if (isArbitrary || isOrderSensitive) {
				if (currentSegment.length > 0) {
					currentSegment.sort();
					result.push(...currentSegment);
					currentSegment = [];
				}
				result.push(modifier);
			} else currentSegment.push(modifier);
		}
		if (currentSegment.length > 0) {
			currentSegment.sort();
			result.push(...currentSegment);
		}
		return result;
	};
};
var createConfigUtils = (config) => ({
	cache: createLruCache(config.cacheSize),
	parseClassName: createParseClassName(config),
	sortModifiers: createSortModifiers(config),
	postfixLookupClassGroupIds: createPostfixLookupClassGroupIds(config),
	...createClassGroupUtils(config)
});
var createPostfixLookupClassGroupIds = (config) => {
	const lookup = Object.create(null);
	const classGroupIds = config.postfixLookupClassGroups;
	if (classGroupIds) for (let i = 0; i < classGroupIds.length; i++) lookup[classGroupIds[i]] = true;
	return lookup;
};
var SPLIT_CLASSES_REGEX = /\s+/;
var mergeClassList = (classList, configUtils) => {
	const { parseClassName, getClassGroupId, getConflictingClassGroupIds, sortModifiers, postfixLookupClassGroupIds } = configUtils;
	/**
	* Set of classGroupIds in following format:
	* `{importantModifier}{variantModifiers}{classGroupId}`
	* @example 'float'
	* @example 'hover:focus:bg-color'
	* @example 'md:!pr'
	*/
	const classGroupsInConflict = [];
	const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
	let result = "";
	for (let index = classNames.length - 1; index >= 0; index -= 1) {
		const originalClassName = classNames[index];
		const { isExternal, modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition } = parseClassName(originalClassName);
		if (isExternal) {
			result = originalClassName + (result.length > 0 ? " " + result : result);
			continue;
		}
		let hasPostfixModifier = !!maybePostfixModifierPosition;
		let classGroupId;
		if (hasPostfixModifier) {
			classGroupId = getClassGroupId(baseClassName.substring(0, maybePostfixModifierPosition));
			const classGroupIdWithPostfix = classGroupId && postfixLookupClassGroupIds[classGroupId] ? getClassGroupId(baseClassName) : void 0;
			if (classGroupIdWithPostfix && classGroupIdWithPostfix !== classGroupId) {
				classGroupId = classGroupIdWithPostfix;
				hasPostfixModifier = false;
			}
		} else classGroupId = getClassGroupId(baseClassName);
		if (!classGroupId) {
			if (!hasPostfixModifier) {
				result = originalClassName + (result.length > 0 ? " " + result : result);
				continue;
			}
			classGroupId = getClassGroupId(baseClassName);
			if (!classGroupId) {
				result = originalClassName + (result.length > 0 ? " " + result : result);
				continue;
			}
			hasPostfixModifier = false;
		}
		const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
		const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
		const classId = modifierId + classGroupId;
		if (classGroupsInConflict.indexOf(classId) > -1) continue;
		classGroupsInConflict.push(classId);
		const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
		for (let i = 0; i < conflictGroups.length; ++i) {
			const group = conflictGroups[i];
			classGroupsInConflict.push(modifierId + group);
		}
		result = originalClassName + (result.length > 0 ? " " + result : result);
	}
	return result;
};
/**
* The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
*
* Specifically:
* - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
* - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
*
* Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
*/
var twJoin = (...classLists) => {
	let index = 0;
	let argument;
	let resolvedValue;
	let string = "";
	while (index < classLists.length) if (argument = classLists[index++]) {
		if (resolvedValue = toValue(argument)) {
			string && (string += " ");
			string += resolvedValue;
		}
	}
	return string;
};
var toValue = (mix) => {
	if (typeof mix === "string") return mix;
	let resolvedValue;
	let string = "";
	for (let k = 0; k < mix.length; k++) if (mix[k]) {
		if (resolvedValue = toValue(mix[k])) {
			string && (string += " ");
			string += resolvedValue;
		}
	}
	return string;
};
var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
	let configUtils;
	let cacheGet;
	let cacheSet;
	let functionToCall;
	const initTailwindMerge = (classList) => {
		configUtils = createConfigUtils(createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst()));
		cacheGet = configUtils.cache.get;
		cacheSet = configUtils.cache.set;
		functionToCall = tailwindMerge;
		return tailwindMerge(classList);
	};
	const tailwindMerge = (classList) => {
		const cachedResult = cacheGet(classList);
		if (cachedResult) return cachedResult;
		const result = mergeClassList(classList, configUtils);
		cacheSet(classList, result);
		return result;
	};
	functionToCall = initTailwindMerge;
	return (...args) => functionToCall(twJoin(...args));
};
var fallbackThemeArr = [];
var fromTheme = (key) => {
	const themeGetter = (theme) => theme[key] || fallbackThemeArr;
	themeGetter.isThemeGetter = true;
	return themeGetter;
};
var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
var fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/;
var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
var isFraction = (value) => fractionRegex.test(value);
var isNumber = (value) => !!value && !Number.isNaN(Number(value));
var isInteger = (value) => !!value && Number.isInteger(Number(value));
var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
var isTshirtSize = (value) => tshirtUnitRegex.test(value);
var isAny = () => true;
var isLengthOnly = (value) => lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
var isNever = () => false;
var isShadow = (value) => shadowRegex.test(value);
var isImage = (value) => imageRegex.test(value);
var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
var isNamedContainerQuery = (value) => value.startsWith("@container") && (value[10] === "/" && value[11] !== void 0 || value[11] === "s" && value[16] !== void 0 && value.startsWith("-size/", 10) || value[11] === "n" && value[18] !== void 0 && value.startsWith("-normal/", 10));
var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
var isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
var isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
var isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
var getIsArbitraryValue = (value, testLabel, testValue) => {
	const result = arbitraryValueRegex.exec(value);
	if (result) {
		if (result[1]) return testLabel(result[1]);
		return testValue(result[2]);
	}
	return false;
};
var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
	const result = arbitraryVariableRegex.exec(value);
	if (result) {
		if (result[1]) return testLabel(result[1]);
		return shouldMatchNoLabel;
	}
	return false;
};
var isLabelPosition = (label) => label === "position" || label === "percentage";
var isLabelImage = (label) => label === "image" || label === "url";
var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
var isLabelLength = (label) => label === "length";
var isLabelNumber = (label) => label === "number";
var isLabelFamilyName = (label) => label === "family-name";
var isLabelWeight = (label) => label === "number" || label === "weight";
var isLabelShadow = (label) => label === "shadow";
var getDefaultConfig = () => {
	/**
	* Theme getters for theme variable namespaces
	* @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
	*/
	const themeColor = fromTheme("color");
	const themeFont = fromTheme("font");
	const themeText = fromTheme("text");
	const themeFontWeight = fromTheme("font-weight");
	const themeTracking = fromTheme("tracking");
	const themeLeading = fromTheme("leading");
	const themeBreakpoint = fromTheme("breakpoint");
	const themeContainer = fromTheme("container");
	const themeSpacing = fromTheme("spacing");
	const themeRadius = fromTheme("radius");
	const themeShadow = fromTheme("shadow");
	const themeInsetShadow = fromTheme("inset-shadow");
	const themeTextShadow = fromTheme("text-shadow");
	const themeDropShadow = fromTheme("drop-shadow");
	const themeBlur = fromTheme("blur");
	const themePerspective = fromTheme("perspective");
	const themeAspect = fromTheme("aspect");
	const themeEase = fromTheme("ease");
	const themeAnimate = fromTheme("animate");
	/**
	* Helpers to avoid repeating the same scales
	*
	* We use functions that create a new array every time they're called instead of static arrays.
	* This ensures that users who modify any scale by mutating the array (e.g. with `array.push(element)`) don't accidentally mutate arrays in other parts of the config.
	*/
	const scaleBreak = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	];
	const scalePosition = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	];
	const scalePositionWithArbitrary = () => [
		...scalePosition(),
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleOverflow = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	];
	const scaleOverscroll = () => [
		"auto",
		"contain",
		"none"
	];
	const scaleUnambiguousSpacing = () => [
		isArbitraryVariable,
		isArbitraryValue,
		themeSpacing
	];
	const scaleInset = () => [
		isFraction,
		"full",
		"auto",
		...scaleUnambiguousSpacing()
	];
	const scaleGridTemplateColsRows = () => [
		isInteger,
		"none",
		"subgrid",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridColRowStartAndEnd = () => [
		"auto",
		{ span: [
			"full",
			isInteger,
			isArbitraryVariable,
			isArbitraryValue
		] },
		isInteger,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridColRowStartOrEnd = () => [
		isInteger,
		"auto",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridAutoColsRows = () => [
		"auto",
		"min",
		"max",
		"fr",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleAlignPrimaryAxis = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	];
	const scaleAlignSecondaryAxis = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	];
	const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
	const scaleSizing = () => [
		isFraction,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleSizingInline = () => [
		isFraction,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleSizingBlock = () => [
		isFraction,
		"screen",
		"full",
		"lh",
		"dvh",
		"lvh",
		"svh",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleColor = () => [
		themeColor,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleBgPosition = () => [
		...scalePosition(),
		isArbitraryVariablePosition,
		isArbitraryPosition,
		{ position: [isArbitraryVariable, isArbitraryValue] }
	];
	const scaleBgRepeat = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }];
	const scaleBgSize = () => [
		"auto",
		"cover",
		"contain",
		isArbitraryVariableSize,
		isArbitrarySize,
		{ size: [isArbitraryVariable, isArbitraryValue] }
	];
	const scaleGradientStopPosition = () => [
		isPercent,
		isArbitraryVariableLength,
		isArbitraryLength
	];
	const scaleRadius = () => [
		"",
		"none",
		"full",
		themeRadius,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleBorderWidth = () => [
		"",
		isNumber,
		isArbitraryVariableLength,
		isArbitraryLength
	];
	const scaleLineStyle = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	];
	const scaleBlendMode = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	];
	const scaleMaskImagePosition = () => [
		isNumber,
		isPercent,
		isArbitraryVariablePosition,
		isArbitraryPosition
	];
	const scaleBlur = () => [
		"",
		"none",
		themeBlur,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleRotate = () => [
		"none",
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleScale = () => [
		"none",
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleSkew = () => [
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleTranslate = () => [
		isFraction,
		"full",
		...scaleUnambiguousSpacing()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [isTshirtSize],
			breakpoint: [isTshirtSize],
			color: [isAny],
			container: [isTshirtSize],
			"drop-shadow": [isTshirtSize],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [isAnyNonArbitrary],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [isTshirtSize],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [isTshirtSize],
			shadow: [isTshirtSize],
			spacing: ["px", isNumber],
			text: [isTshirtSize],
			"text-shadow": [isTshirtSize],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			/**
			* Aspect Ratio
			* @see https://tailwindcss.com/docs/aspect-ratio
			*/
			aspect: [{ aspect: [
				"auto",
				"square",
				isFraction,
				isArbitraryValue,
				isArbitraryVariable,
				themeAspect
			] }],
			/**
			* Container
			* @see https://tailwindcss.com/docs/container
			* @deprecated since Tailwind CSS v4.0.0
			*/
			container: ["container"],
			/**
			* Container Type
			* @see https://tailwindcss.com/docs/responsive-design#container-queries
			*/
			"container-type": [{ "@container": [
				"",
				"normal",
				"size",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Container Name
			* @see https://tailwindcss.com/docs/responsive-design#named-containers
			*/
			"container-named": [isNamedContainerQuery],
			/**
			* Columns
			* @see https://tailwindcss.com/docs/columns
			*/
			columns: [{ columns: [
				isNumber,
				isArbitraryValue,
				isArbitraryVariable,
				themeContainer
			] }],
			/**
			* Break After
			* @see https://tailwindcss.com/docs/break-after
			*/
			"break-after": [{ "break-after": scaleBreak() }],
			/**
			* Break Before
			* @see https://tailwindcss.com/docs/break-before
			*/
			"break-before": [{ "break-before": scaleBreak() }],
			/**
			* Break Inside
			* @see https://tailwindcss.com/docs/break-inside
			*/
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			/**
			* Box Decoration Break
			* @see https://tailwindcss.com/docs/box-decoration-break
			*/
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			/**
			* Box Sizing
			* @see https://tailwindcss.com/docs/box-sizing
			*/
			box: [{ box: ["border", "content"] }],
			/**
			* Display
			* @see https://tailwindcss.com/docs/display
			*/
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			/**
			* Screen Reader Only
			* @see https://tailwindcss.com/docs/display#screen-reader-only
			*/
			sr: ["sr-only", "not-sr-only"],
			/**
			* Floats
			* @see https://tailwindcss.com/docs/float
			*/
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			/**
			* Clear
			* @see https://tailwindcss.com/docs/clear
			*/
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			/**
			* Isolation
			* @see https://tailwindcss.com/docs/isolation
			*/
			isolation: ["isolate", "isolation-auto"],
			/**
			* Object Fit
			* @see https://tailwindcss.com/docs/object-fit
			*/
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			/**
			* Object Position
			* @see https://tailwindcss.com/docs/object-position
			*/
			"object-position": [{ object: scalePositionWithArbitrary() }],
			/**
			* Overflow
			* @see https://tailwindcss.com/docs/overflow
			*/
			overflow: [{ overflow: scaleOverflow() }],
			/**
			* Overflow X
			* @see https://tailwindcss.com/docs/overflow
			*/
			"overflow-x": [{ "overflow-x": scaleOverflow() }],
			/**
			* Overflow Y
			* @see https://tailwindcss.com/docs/overflow
			*/
			"overflow-y": [{ "overflow-y": scaleOverflow() }],
			/**
			* Overscroll Behavior
			* @see https://tailwindcss.com/docs/overscroll-behavior
			*/
			overscroll: [{ overscroll: scaleOverscroll() }],
			/**
			* Overscroll Behavior X
			* @see https://tailwindcss.com/docs/overscroll-behavior
			*/
			"overscroll-x": [{ "overscroll-x": scaleOverscroll() }],
			/**
			* Overscroll Behavior Y
			* @see https://tailwindcss.com/docs/overscroll-behavior
			*/
			"overscroll-y": [{ "overscroll-y": scaleOverscroll() }],
			/**
			* Position
			* @see https://tailwindcss.com/docs/position
			*/
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			/**
			* Inset
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			inset: [{ inset: scaleInset() }],
			/**
			* Inset Inline
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			"inset-x": [{ "inset-x": scaleInset() }],
			/**
			* Inset Block
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			"inset-y": [{ "inset-y": scaleInset() }],
			/**
			* Inset Inline Start
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			* @todo class group will be renamed to `inset-s` in next major release
			*/
			start: [{
				"inset-s": scaleInset(),
				/**
				* @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
				* @see https://github.com/tailwindlabs/tailwindcss/pull/19613
				*/
				start: scaleInset()
			}],
			/**
			* Inset Inline End
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			* @todo class group will be renamed to `inset-e` in next major release
			*/
			end: [{
				"inset-e": scaleInset(),
				/**
				* @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
				* @see https://github.com/tailwindlabs/tailwindcss/pull/19613
				*/
				end: scaleInset()
			}],
			/**
			* Inset Block Start
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			"inset-bs": [{ "inset-bs": scaleInset() }],
			/**
			* Inset Block End
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			"inset-be": [{ "inset-be": scaleInset() }],
			/**
			* Top
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			top: [{ top: scaleInset() }],
			/**
			* Right
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			right: [{ right: scaleInset() }],
			/**
			* Bottom
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			bottom: [{ bottom: scaleInset() }],
			/**
			* Left
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			left: [{ left: scaleInset() }],
			/**
			* Visibility
			* @see https://tailwindcss.com/docs/visibility
			*/
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			/**
			* Z-Index
			* @see https://tailwindcss.com/docs/z-index
			*/
			z: [{ z: [
				isInteger,
				"auto",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Flex Basis
			* @see https://tailwindcss.com/docs/flex-basis
			*/
			basis: [{ basis: [
				isFraction,
				"full",
				"auto",
				themeContainer,
				...scaleUnambiguousSpacing()
			] }],
			/**
			* Flex Direction
			* @see https://tailwindcss.com/docs/flex-direction
			*/
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			/**
			* Flex Wrap
			* @see https://tailwindcss.com/docs/flex-wrap
			*/
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			/**
			* Flex
			* @see https://tailwindcss.com/docs/flex
			*/
			flex: [{ flex: [
				isNumber,
				isFraction,
				"auto",
				"initial",
				"none",
				isArbitraryValue
			] }],
			/**
			* Flex Grow
			* @see https://tailwindcss.com/docs/flex-grow
			*/
			grow: [{ grow: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Flex Shrink
			* @see https://tailwindcss.com/docs/flex-shrink
			*/
			shrink: [{ shrink: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Order
			* @see https://tailwindcss.com/docs/order
			*/
			order: [{ order: [
				isInteger,
				"first",
				"last",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Grid Template Columns
			* @see https://tailwindcss.com/docs/grid-template-columns
			*/
			"grid-cols": [{ "grid-cols": scaleGridTemplateColsRows() }],
			/**
			* Grid Column Start / End
			* @see https://tailwindcss.com/docs/grid-column
			*/
			"col-start-end": [{ col: scaleGridColRowStartAndEnd() }],
			/**
			* Grid Column Start
			* @see https://tailwindcss.com/docs/grid-column
			*/
			"col-start": [{ "col-start": scaleGridColRowStartOrEnd() }],
			/**
			* Grid Column End
			* @see https://tailwindcss.com/docs/grid-column
			*/
			"col-end": [{ "col-end": scaleGridColRowStartOrEnd() }],
			/**
			* Grid Template Rows
			* @see https://tailwindcss.com/docs/grid-template-rows
			*/
			"grid-rows": [{ "grid-rows": scaleGridTemplateColsRows() }],
			/**
			* Grid Row Start / End
			* @see https://tailwindcss.com/docs/grid-row
			*/
			"row-start-end": [{ row: scaleGridColRowStartAndEnd() }],
			/**
			* Grid Row Start
			* @see https://tailwindcss.com/docs/grid-row
			*/
			"row-start": [{ "row-start": scaleGridColRowStartOrEnd() }],
			/**
			* Grid Row End
			* @see https://tailwindcss.com/docs/grid-row
			*/
			"row-end": [{ "row-end": scaleGridColRowStartOrEnd() }],
			/**
			* Grid Auto Flow
			* @see https://tailwindcss.com/docs/grid-auto-flow
			*/
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			/**
			* Grid Auto Columns
			* @see https://tailwindcss.com/docs/grid-auto-columns
			*/
			"auto-cols": [{ "auto-cols": scaleGridAutoColsRows() }],
			/**
			* Grid Auto Rows
			* @see https://tailwindcss.com/docs/grid-auto-rows
			*/
			"auto-rows": [{ "auto-rows": scaleGridAutoColsRows() }],
			/**
			* Gap
			* @see https://tailwindcss.com/docs/gap
			*/
			gap: [{ gap: scaleUnambiguousSpacing() }],
			/**
			* Gap X
			* @see https://tailwindcss.com/docs/gap
			*/
			"gap-x": [{ "gap-x": scaleUnambiguousSpacing() }],
			/**
			* Gap Y
			* @see https://tailwindcss.com/docs/gap
			*/
			"gap-y": [{ "gap-y": scaleUnambiguousSpacing() }],
			/**
			* Justify Content
			* @see https://tailwindcss.com/docs/justify-content
			*/
			"justify-content": [{ justify: [...scaleAlignPrimaryAxis(), "normal"] }],
			/**
			* Justify Items
			* @see https://tailwindcss.com/docs/justify-items
			*/
			"justify-items": [{ "justify-items": [...scaleAlignSecondaryAxis(), "normal"] }],
			/**
			* Justify Self
			* @see https://tailwindcss.com/docs/justify-self
			*/
			"justify-self": [{ "justify-self": ["auto", ...scaleAlignSecondaryAxis()] }],
			/**
			* Align Content
			* @see https://tailwindcss.com/docs/align-content
			*/
			"align-content": [{ content: ["normal", ...scaleAlignPrimaryAxis()] }],
			/**
			* Align Items
			* @see https://tailwindcss.com/docs/align-items
			*/
			"align-items": [{ items: [...scaleAlignSecondaryAxis(), { baseline: ["", "last"] }] }],
			/**
			* Align Self
			* @see https://tailwindcss.com/docs/align-self
			*/
			"align-self": [{ self: [
				"auto",
				...scaleAlignSecondaryAxis(),
				{ baseline: ["", "last"] }
			] }],
			/**
			* Place Content
			* @see https://tailwindcss.com/docs/place-content
			*/
			"place-content": [{ "place-content": scaleAlignPrimaryAxis() }],
			/**
			* Place Items
			* @see https://tailwindcss.com/docs/place-items
			*/
			"place-items": [{ "place-items": [...scaleAlignSecondaryAxis(), "baseline"] }],
			/**
			* Place Self
			* @see https://tailwindcss.com/docs/place-self
			*/
			"place-self": [{ "place-self": ["auto", ...scaleAlignSecondaryAxis()] }],
			/**
			* Padding
			* @see https://tailwindcss.com/docs/padding
			*/
			p: [{ p: scaleUnambiguousSpacing() }],
			/**
			* Padding Inline
			* @see https://tailwindcss.com/docs/padding
			*/
			px: [{ px: scaleUnambiguousSpacing() }],
			/**
			* Padding Block
			* @see https://tailwindcss.com/docs/padding
			*/
			py: [{ py: scaleUnambiguousSpacing() }],
			/**
			* Padding Inline Start
			* @see https://tailwindcss.com/docs/padding
			*/
			ps: [{ ps: scaleUnambiguousSpacing() }],
			/**
			* Padding Inline End
			* @see https://tailwindcss.com/docs/padding
			*/
			pe: [{ pe: scaleUnambiguousSpacing() }],
			/**
			* Padding Block Start
			* @see https://tailwindcss.com/docs/padding
			*/
			pbs: [{ pbs: scaleUnambiguousSpacing() }],
			/**
			* Padding Block End
			* @see https://tailwindcss.com/docs/padding
			*/
			pbe: [{ pbe: scaleUnambiguousSpacing() }],
			/**
			* Padding Top
			* @see https://tailwindcss.com/docs/padding
			*/
			pt: [{ pt: scaleUnambiguousSpacing() }],
			/**
			* Padding Right
			* @see https://tailwindcss.com/docs/padding
			*/
			pr: [{ pr: scaleUnambiguousSpacing() }],
			/**
			* Padding Bottom
			* @see https://tailwindcss.com/docs/padding
			*/
			pb: [{ pb: scaleUnambiguousSpacing() }],
			/**
			* Padding Left
			* @see https://tailwindcss.com/docs/padding
			*/
			pl: [{ pl: scaleUnambiguousSpacing() }],
			/**
			* Margin
			* @see https://tailwindcss.com/docs/margin
			*/
			m: [{ m: scaleMargin() }],
			/**
			* Margin Inline
			* @see https://tailwindcss.com/docs/margin
			*/
			mx: [{ mx: scaleMargin() }],
			/**
			* Margin Block
			* @see https://tailwindcss.com/docs/margin
			*/
			my: [{ my: scaleMargin() }],
			/**
			* Margin Inline Start
			* @see https://tailwindcss.com/docs/margin
			*/
			ms: [{ ms: scaleMargin() }],
			/**
			* Margin Inline End
			* @see https://tailwindcss.com/docs/margin
			*/
			me: [{ me: scaleMargin() }],
			/**
			* Margin Block Start
			* @see https://tailwindcss.com/docs/margin
			*/
			mbs: [{ mbs: scaleMargin() }],
			/**
			* Margin Block End
			* @see https://tailwindcss.com/docs/margin
			*/
			mbe: [{ mbe: scaleMargin() }],
			/**
			* Margin Top
			* @see https://tailwindcss.com/docs/margin
			*/
			mt: [{ mt: scaleMargin() }],
			/**
			* Margin Right
			* @see https://tailwindcss.com/docs/margin
			*/
			mr: [{ mr: scaleMargin() }],
			/**
			* Margin Bottom
			* @see https://tailwindcss.com/docs/margin
			*/
			mb: [{ mb: scaleMargin() }],
			/**
			* Margin Left
			* @see https://tailwindcss.com/docs/margin
			*/
			ml: [{ ml: scaleMargin() }],
			/**
			* Space Between X
			* @see https://tailwindcss.com/docs/margin#adding-space-between-children
			*/
			"space-x": [{ "space-x": scaleUnambiguousSpacing() }],
			/**
			* Space Between X Reverse
			* @see https://tailwindcss.com/docs/margin#adding-space-between-children
			*/
			"space-x-reverse": ["space-x-reverse"],
			/**
			* Space Between Y
			* @see https://tailwindcss.com/docs/margin#adding-space-between-children
			*/
			"space-y": [{ "space-y": scaleUnambiguousSpacing() }],
			/**
			* Space Between Y Reverse
			* @see https://tailwindcss.com/docs/margin#adding-space-between-children
			*/
			"space-y-reverse": ["space-y-reverse"],
			/**
			* Size
			* @see https://tailwindcss.com/docs/width#setting-both-width-and-height
			*/
			size: [{ size: scaleSizing() }],
			/**
			* Inline Size
			* @see https://tailwindcss.com/docs/width
			*/
			"inline-size": [{ inline: ["auto", ...scaleSizingInline()] }],
			/**
			* Min-Inline Size
			* @see https://tailwindcss.com/docs/min-width
			*/
			"min-inline-size": [{ "min-inline": ["auto", ...scaleSizingInline()] }],
			/**
			* Max-Inline Size
			* @see https://tailwindcss.com/docs/max-width
			*/
			"max-inline-size": [{ "max-inline": ["none", ...scaleSizingInline()] }],
			/**
			* Block Size
			* @see https://tailwindcss.com/docs/height
			*/
			"block-size": [{ block: ["auto", ...scaleSizingBlock()] }],
			/**
			* Min-Block Size
			* @see https://tailwindcss.com/docs/min-height
			*/
			"min-block-size": [{ "min-block": ["auto", ...scaleSizingBlock()] }],
			/**
			* Max-Block Size
			* @see https://tailwindcss.com/docs/max-height
			*/
			"max-block-size": [{ "max-block": ["none", ...scaleSizingBlock()] }],
			/**
			* Width
			* @see https://tailwindcss.com/docs/width
			*/
			w: [{ w: [
				themeContainer,
				"screen",
				...scaleSizing()
			] }],
			/**
			* Min-Width
			* @see https://tailwindcss.com/docs/min-width
			*/
			"min-w": [{ "min-w": [
				themeContainer,
				"screen",
				"none",
				...scaleSizing()
			] }],
			/**
			* Max-Width
			* @see https://tailwindcss.com/docs/max-width
			*/
			"max-w": [{ "max-w": [
				themeContainer,
				"screen",
				"none",
				"prose",
				{ screen: [themeBreakpoint] },
				...scaleSizing()
			] }],
			/**
			* Height
			* @see https://tailwindcss.com/docs/height
			*/
			h: [{ h: [
				"screen",
				"lh",
				...scaleSizing()
			] }],
			/**
			* Min-Height
			* @see https://tailwindcss.com/docs/min-height
			*/
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...scaleSizing()
			] }],
			/**
			* Max-Height
			* @see https://tailwindcss.com/docs/max-height
			*/
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...scaleSizing()
			] }],
			/**
			* Font Size
			* @see https://tailwindcss.com/docs/font-size
			*/
			"font-size": [{ text: [
				"base",
				themeText,
				isArbitraryVariableLength,
				isArbitraryLength
			] }],
			/**
			* Font Smoothing
			* @see https://tailwindcss.com/docs/font-smoothing
			*/
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			/**
			* Font Style
			* @see https://tailwindcss.com/docs/font-style
			*/
			"font-style": ["italic", "not-italic"],
			/**
			* Font Weight
			* @see https://tailwindcss.com/docs/font-weight
			*/
			"font-weight": [{ font: [
				themeFontWeight,
				isArbitraryVariableWeight,
				isArbitraryWeight
			] }],
			/**
			* Font Stretch
			* @see https://tailwindcss.com/docs/font-stretch
			*/
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				isPercent,
				isArbitraryValue
			] }],
			/**
			* Font Family
			* @see https://tailwindcss.com/docs/font-family
			*/
			"font-family": [{ font: [
				isArbitraryVariableFamilyName,
				isArbitraryFamilyName,
				themeFont
			] }],
			/**
			* Font Feature Settings
			* @see https://tailwindcss.com/docs/font-feature-settings
			*/
			"font-features": [{ "font-features": [isArbitraryValue] }],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-normal": ["normal-nums"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-ordinal": ["ordinal"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-slashed-zero": ["slashed-zero"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			/**
			* Letter Spacing
			* @see https://tailwindcss.com/docs/letter-spacing
			*/
			tracking: [{ tracking: [
				themeTracking,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Line Clamp
			* @see https://tailwindcss.com/docs/line-clamp
			*/
			"line-clamp": [{ "line-clamp": [
				isNumber,
				"none",
				isArbitraryVariable,
				isArbitraryNumber
			] }],
			/**
			* Line Height
			* @see https://tailwindcss.com/docs/line-height
			*/
			leading: [{ leading: [themeLeading, ...scaleUnambiguousSpacing()] }],
			/**
			* List Style Image
			* @see https://tailwindcss.com/docs/list-style-image
			*/
			"list-image": [{ "list-image": [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* List Style Position
			* @see https://tailwindcss.com/docs/list-style-position
			*/
			"list-style-position": [{ list: ["inside", "outside"] }],
			/**
			* List Style Type
			* @see https://tailwindcss.com/docs/list-style-type
			*/
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Text Alignment
			* @see https://tailwindcss.com/docs/text-align
			*/
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			/**
			* Placeholder Color
			* @deprecated since Tailwind CSS v3.0.0
			* @see https://v3.tailwindcss.com/docs/placeholder-color
			*/
			"placeholder-color": [{ placeholder: scaleColor() }],
			/**
			* Text Color
			* @see https://tailwindcss.com/docs/text-color
			*/
			"text-color": [{ text: scaleColor() }],
			/**
			* Text Decoration
			* @see https://tailwindcss.com/docs/text-decoration
			*/
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			/**
			* Text Decoration Style
			* @see https://tailwindcss.com/docs/text-decoration-style
			*/
			"text-decoration-style": [{ decoration: [...scaleLineStyle(), "wavy"] }],
			/**
			* Text Decoration Thickness
			* @see https://tailwindcss.com/docs/text-decoration-thickness
			*/
			"text-decoration-thickness": [{ decoration: [
				isNumber,
				"from-font",
				"auto",
				isArbitraryVariable,
				isArbitraryLength
			] }],
			/**
			* Text Decoration Color
			* @see https://tailwindcss.com/docs/text-decoration-color
			*/
			"text-decoration-color": [{ decoration: scaleColor() }],
			/**
			* Text Underline Offset
			* @see https://tailwindcss.com/docs/text-underline-offset
			*/
			"underline-offset": [{ "underline-offset": [
				isNumber,
				"auto",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Text Transform
			* @see https://tailwindcss.com/docs/text-transform
			*/
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			/**
			* Text Overflow
			* @see https://tailwindcss.com/docs/text-overflow
			*/
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			/**
			* Text Wrap
			* @see https://tailwindcss.com/docs/text-wrap
			*/
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			/**
			* Text Indent
			* @see https://tailwindcss.com/docs/text-indent
			*/
			indent: [{ indent: scaleUnambiguousSpacing() }],
			/**
			* Tab Size
			* @see https://tailwindcss.com/docs/tab-size
			*/
			"tab-size": [{ tab: [
				isInteger,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Vertical Alignment
			* @see https://tailwindcss.com/docs/vertical-align
			*/
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Whitespace
			* @see https://tailwindcss.com/docs/whitespace
			*/
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			/**
			* Word Break
			* @see https://tailwindcss.com/docs/word-break
			*/
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			/**
			* Overflow Wrap
			* @see https://tailwindcss.com/docs/overflow-wrap
			*/
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			/**
			* Hyphens
			* @see https://tailwindcss.com/docs/hyphens
			*/
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			/**
			* Content
			* @see https://tailwindcss.com/docs/content
			*/
			content: [{ content: [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Background Attachment
			* @see https://tailwindcss.com/docs/background-attachment
			*/
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			/**
			* Background Clip
			* @see https://tailwindcss.com/docs/background-clip
			*/
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			/**
			* Background Origin
			* @see https://tailwindcss.com/docs/background-origin
			*/
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			/**
			* Background Position
			* @see https://tailwindcss.com/docs/background-position
			*/
			"bg-position": [{ bg: scaleBgPosition() }],
			/**
			* Background Repeat
			* @see https://tailwindcss.com/docs/background-repeat
			*/
			"bg-repeat": [{ bg: scaleBgRepeat() }],
			/**
			* Background Size
			* @see https://tailwindcss.com/docs/background-size
			*/
			"bg-size": [{ bg: scaleBgSize() }],
			/**
			* Background Image
			* @see https://tailwindcss.com/docs/background-image
			*/
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						isInteger,
						isArbitraryVariable,
						isArbitraryValue
					],
					radial: [
						"",
						isArbitraryVariable,
						isArbitraryValue
					],
					conic: [
						isInteger,
						isArbitraryVariable,
						isArbitraryValue
					]
				},
				isArbitraryVariableImage,
				isArbitraryImage
			] }],
			/**
			* Background Color
			* @see https://tailwindcss.com/docs/background-color
			*/
			"bg-color": [{ bg: scaleColor() }],
			/**
			* Gradient Color Stops From Position
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-from-pos": [{ from: scaleGradientStopPosition() }],
			/**
			* Gradient Color Stops Via Position
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-via-pos": [{ via: scaleGradientStopPosition() }],
			/**
			* Gradient Color Stops To Position
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-to-pos": [{ to: scaleGradientStopPosition() }],
			/**
			* Gradient Color Stops From
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-from": [{ from: scaleColor() }],
			/**
			* Gradient Color Stops Via
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-via": [{ via: scaleColor() }],
			/**
			* Gradient Color Stops To
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-to": [{ to: scaleColor() }],
			/**
			* Border Radius
			* @see https://tailwindcss.com/docs/border-radius
			*/
			rounded: [{ rounded: scaleRadius() }],
			/**
			* Border Radius Start
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-s": [{ "rounded-s": scaleRadius() }],
			/**
			* Border Radius End
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-e": [{ "rounded-e": scaleRadius() }],
			/**
			* Border Radius Top
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-t": [{ "rounded-t": scaleRadius() }],
			/**
			* Border Radius Right
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-r": [{ "rounded-r": scaleRadius() }],
			/**
			* Border Radius Bottom
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-b": [{ "rounded-b": scaleRadius() }],
			/**
			* Border Radius Left
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-l": [{ "rounded-l": scaleRadius() }],
			/**
			* Border Radius Start Start
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-ss": [{ "rounded-ss": scaleRadius() }],
			/**
			* Border Radius Start End
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-se": [{ "rounded-se": scaleRadius() }],
			/**
			* Border Radius End End
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-ee": [{ "rounded-ee": scaleRadius() }],
			/**
			* Border Radius End Start
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-es": [{ "rounded-es": scaleRadius() }],
			/**
			* Border Radius Top Left
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-tl": [{ "rounded-tl": scaleRadius() }],
			/**
			* Border Radius Top Right
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-tr": [{ "rounded-tr": scaleRadius() }],
			/**
			* Border Radius Bottom Right
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-br": [{ "rounded-br": scaleRadius() }],
			/**
			* Border Radius Bottom Left
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-bl": [{ "rounded-bl": scaleRadius() }],
			/**
			* Border Width
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w": [{ border: scaleBorderWidth() }],
			/**
			* Border Width Inline
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-x": [{ "border-x": scaleBorderWidth() }],
			/**
			* Border Width Block
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-y": [{ "border-y": scaleBorderWidth() }],
			/**
			* Border Width Inline Start
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-s": [{ "border-s": scaleBorderWidth() }],
			/**
			* Border Width Inline End
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-e": [{ "border-e": scaleBorderWidth() }],
			/**
			* Border Width Block Start
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-bs": [{ "border-bs": scaleBorderWidth() }],
			/**
			* Border Width Block End
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-be": [{ "border-be": scaleBorderWidth() }],
			/**
			* Border Width Top
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-t": [{ "border-t": scaleBorderWidth() }],
			/**
			* Border Width Right
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-r": [{ "border-r": scaleBorderWidth() }],
			/**
			* Border Width Bottom
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-b": [{ "border-b": scaleBorderWidth() }],
			/**
			* Border Width Left
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-l": [{ "border-l": scaleBorderWidth() }],
			/**
			* Divide Width X
			* @see https://tailwindcss.com/docs/border-width#between-children
			*/
			"divide-x": [{ "divide-x": scaleBorderWidth() }],
			/**
			* Divide Width X Reverse
			* @see https://tailwindcss.com/docs/border-width#between-children
			*/
			"divide-x-reverse": ["divide-x-reverse"],
			/**
			* Divide Width Y
			* @see https://tailwindcss.com/docs/border-width#between-children
			*/
			"divide-y": [{ "divide-y": scaleBorderWidth() }],
			/**
			* Divide Width Y Reverse
			* @see https://tailwindcss.com/docs/border-width#between-children
			*/
			"divide-y-reverse": ["divide-y-reverse"],
			/**
			* Border Style
			* @see https://tailwindcss.com/docs/border-style
			*/
			"border-style": [{ border: [
				...scaleLineStyle(),
				"hidden",
				"none"
			] }],
			/**
			* Divide Style
			* @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
			*/
			"divide-style": [{ divide: [
				...scaleLineStyle(),
				"hidden",
				"none"
			] }],
			/**
			* Border Color
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color": [{ border: scaleColor() }],
			/**
			* Border Color Inline
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-x": [{ "border-x": scaleColor() }],
			/**
			* Border Color Block
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-y": [{ "border-y": scaleColor() }],
			/**
			* Border Color Inline Start
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-s": [{ "border-s": scaleColor() }],
			/**
			* Border Color Inline End
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-e": [{ "border-e": scaleColor() }],
			/**
			* Border Color Block Start
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-bs": [{ "border-bs": scaleColor() }],
			/**
			* Border Color Block End
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-be": [{ "border-be": scaleColor() }],
			/**
			* Border Color Top
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-t": [{ "border-t": scaleColor() }],
			/**
			* Border Color Right
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-r": [{ "border-r": scaleColor() }],
			/**
			* Border Color Bottom
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-b": [{ "border-b": scaleColor() }],
			/**
			* Border Color Left
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-l": [{ "border-l": scaleColor() }],
			/**
			* Divide Color
			* @see https://tailwindcss.com/docs/divide-color
			*/
			"divide-color": [{ divide: scaleColor() }],
			/**
			* Outline Style
			* @see https://tailwindcss.com/docs/outline-style
			*/
			"outline-style": [{ outline: [
				...scaleLineStyle(),
				"none",
				"hidden"
			] }],
			/**
			* Outline Offset
			* @see https://tailwindcss.com/docs/outline-offset
			*/
			"outline-offset": [{ "outline-offset": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Outline Width
			* @see https://tailwindcss.com/docs/outline-width
			*/
			"outline-w": [{ outline: [
				"",
				isNumber,
				isArbitraryVariableLength,
				isArbitraryLength
			] }],
			/**
			* Outline Color
			* @see https://tailwindcss.com/docs/outline-color
			*/
			"outline-color": [{ outline: scaleColor() }],
			/**
			* Box Shadow
			* @see https://tailwindcss.com/docs/box-shadow
			*/
			shadow: [{ shadow: [
				"",
				"none",
				themeShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			/**
			* Box Shadow Color
			* @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
			*/
			"shadow-color": [{ shadow: scaleColor() }],
			/**
			* Inset Box Shadow
			* @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
			*/
			"inset-shadow": [{ "inset-shadow": [
				"none",
				themeInsetShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			/**
			* Inset Box Shadow Color
			* @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
			*/
			"inset-shadow-color": [{ "inset-shadow": scaleColor() }],
			/**
			* Ring Width
			* @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
			*/
			"ring-w": [{ ring: scaleBorderWidth() }],
			/**
			* Ring Width Inset
			* @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
			* @deprecated since Tailwind CSS v4.0.0
			* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
			*/
			"ring-w-inset": ["ring-inset"],
			/**
			* Ring Color
			* @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
			*/
			"ring-color": [{ ring: scaleColor() }],
			/**
			* Ring Offset Width
			* @see https://v3.tailwindcss.com/docs/ring-offset-width
			* @deprecated since Tailwind CSS v4.0.0
			* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
			*/
			"ring-offset-w": [{ "ring-offset": [isNumber, isArbitraryLength] }],
			/**
			* Ring Offset Color
			* @see https://v3.tailwindcss.com/docs/ring-offset-color
			* @deprecated since Tailwind CSS v4.0.0
			* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
			*/
			"ring-offset-color": [{ "ring-offset": scaleColor() }],
			/**
			* Inset Ring Width
			* @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
			*/
			"inset-ring-w": [{ "inset-ring": scaleBorderWidth() }],
			/**
			* Inset Ring Color
			* @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
			*/
			"inset-ring-color": [{ "inset-ring": scaleColor() }],
			/**
			* Text Shadow
			* @see https://tailwindcss.com/docs/text-shadow
			*/
			"text-shadow": [{ "text-shadow": [
				"none",
				themeTextShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			/**
			* Text Shadow Color
			* @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
			*/
			"text-shadow-color": [{ "text-shadow": scaleColor() }],
			/**
			* Opacity
			* @see https://tailwindcss.com/docs/opacity
			*/
			opacity: [{ opacity: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Mix Blend Mode
			* @see https://tailwindcss.com/docs/mix-blend-mode
			*/
			"mix-blend": [{ "mix-blend": [
				...scaleBlendMode(),
				"plus-darker",
				"plus-lighter"
			] }],
			/**
			* Background Blend Mode
			* @see https://tailwindcss.com/docs/background-blend-mode
			*/
			"bg-blend": [{ "bg-blend": scaleBlendMode() }],
			/**
			* Mask Clip
			* @see https://tailwindcss.com/docs/mask-clip
			*/
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			/**
			* Mask Composite
			* @see https://tailwindcss.com/docs/mask-composite
			*/
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			/**
			* Mask Image
			* @see https://tailwindcss.com/docs/mask-image
			*/
			"mask-image-linear-pos": [{ "mask-linear": [isNumber] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": scaleMaskImagePosition() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": scaleMaskImagePosition() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": scaleColor() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": scaleColor() }],
			"mask-image-t-from-pos": [{ "mask-t-from": scaleMaskImagePosition() }],
			"mask-image-t-to-pos": [{ "mask-t-to": scaleMaskImagePosition() }],
			"mask-image-t-from-color": [{ "mask-t-from": scaleColor() }],
			"mask-image-t-to-color": [{ "mask-t-to": scaleColor() }],
			"mask-image-r-from-pos": [{ "mask-r-from": scaleMaskImagePosition() }],
			"mask-image-r-to-pos": [{ "mask-r-to": scaleMaskImagePosition() }],
			"mask-image-r-from-color": [{ "mask-r-from": scaleColor() }],
			"mask-image-r-to-color": [{ "mask-r-to": scaleColor() }],
			"mask-image-b-from-pos": [{ "mask-b-from": scaleMaskImagePosition() }],
			"mask-image-b-to-pos": [{ "mask-b-to": scaleMaskImagePosition() }],
			"mask-image-b-from-color": [{ "mask-b-from": scaleColor() }],
			"mask-image-b-to-color": [{ "mask-b-to": scaleColor() }],
			"mask-image-l-from-pos": [{ "mask-l-from": scaleMaskImagePosition() }],
			"mask-image-l-to-pos": [{ "mask-l-to": scaleMaskImagePosition() }],
			"mask-image-l-from-color": [{ "mask-l-from": scaleColor() }],
			"mask-image-l-to-color": [{ "mask-l-to": scaleColor() }],
			"mask-image-x-from-pos": [{ "mask-x-from": scaleMaskImagePosition() }],
			"mask-image-x-to-pos": [{ "mask-x-to": scaleMaskImagePosition() }],
			"mask-image-x-from-color": [{ "mask-x-from": scaleColor() }],
			"mask-image-x-to-color": [{ "mask-x-to": scaleColor() }],
			"mask-image-y-from-pos": [{ "mask-y-from": scaleMaskImagePosition() }],
			"mask-image-y-to-pos": [{ "mask-y-to": scaleMaskImagePosition() }],
			"mask-image-y-from-color": [{ "mask-y-from": scaleColor() }],
			"mask-image-y-to-color": [{ "mask-y-to": scaleColor() }],
			"mask-image-radial": [{ "mask-radial": [isArbitraryVariable, isArbitraryValue] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": scaleMaskImagePosition() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": scaleMaskImagePosition() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": scaleColor() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": scaleColor() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": scalePosition() }],
			"mask-image-conic-pos": [{ "mask-conic": [isNumber] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": scaleMaskImagePosition() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": scaleMaskImagePosition() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": scaleColor() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": scaleColor() }],
			/**
			* Mask Mode
			* @see https://tailwindcss.com/docs/mask-mode
			*/
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			/**
			* Mask Origin
			* @see https://tailwindcss.com/docs/mask-origin
			*/
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			/**
			* Mask Position
			* @see https://tailwindcss.com/docs/mask-position
			*/
			"mask-position": [{ mask: scaleBgPosition() }],
			/**
			* Mask Repeat
			* @see https://tailwindcss.com/docs/mask-repeat
			*/
			"mask-repeat": [{ mask: scaleBgRepeat() }],
			/**
			* Mask Size
			* @see https://tailwindcss.com/docs/mask-size
			*/
			"mask-size": [{ mask: scaleBgSize() }],
			/**
			* Mask Type
			* @see https://tailwindcss.com/docs/mask-type
			*/
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			/**
			* Mask Image
			* @see https://tailwindcss.com/docs/mask-image
			*/
			"mask-image": [{ mask: [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Filter
			* @see https://tailwindcss.com/docs/filter
			*/
			filter: [{ filter: [
				"",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Blur
			* @see https://tailwindcss.com/docs/blur
			*/
			blur: [{ blur: scaleBlur() }],
			/**
			* Brightness
			* @see https://tailwindcss.com/docs/brightness
			*/
			brightness: [{ brightness: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Contrast
			* @see https://tailwindcss.com/docs/contrast
			*/
			contrast: [{ contrast: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Drop Shadow
			* @see https://tailwindcss.com/docs/drop-shadow
			*/
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				themeDropShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			/**
			* Drop Shadow Color
			* @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
			*/
			"drop-shadow-color": [{ "drop-shadow": scaleColor() }],
			/**
			* Grayscale
			* @see https://tailwindcss.com/docs/grayscale
			*/
			grayscale: [{ grayscale: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Hue Rotate
			* @see https://tailwindcss.com/docs/hue-rotate
			*/
			"hue-rotate": [{ "hue-rotate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Invert
			* @see https://tailwindcss.com/docs/invert
			*/
			invert: [{ invert: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Saturate
			* @see https://tailwindcss.com/docs/saturate
			*/
			saturate: [{ saturate: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Sepia
			* @see https://tailwindcss.com/docs/sepia
			*/
			sepia: [{ sepia: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Filter
			* @see https://tailwindcss.com/docs/backdrop-filter
			*/
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Blur
			* @see https://tailwindcss.com/docs/backdrop-blur
			*/
			"backdrop-blur": [{ "backdrop-blur": scaleBlur() }],
			/**
			* Backdrop Brightness
			* @see https://tailwindcss.com/docs/backdrop-brightness
			*/
			"backdrop-brightness": [{ "backdrop-brightness": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Contrast
			* @see https://tailwindcss.com/docs/backdrop-contrast
			*/
			"backdrop-contrast": [{ "backdrop-contrast": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Grayscale
			* @see https://tailwindcss.com/docs/backdrop-grayscale
			*/
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Hue Rotate
			* @see https://tailwindcss.com/docs/backdrop-hue-rotate
			*/
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Invert
			* @see https://tailwindcss.com/docs/backdrop-invert
			*/
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Opacity
			* @see https://tailwindcss.com/docs/backdrop-opacity
			*/
			"backdrop-opacity": [{ "backdrop-opacity": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Saturate
			* @see https://tailwindcss.com/docs/backdrop-saturate
			*/
			"backdrop-saturate": [{ "backdrop-saturate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Sepia
			* @see https://tailwindcss.com/docs/backdrop-sepia
			*/
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Border Collapse
			* @see https://tailwindcss.com/docs/border-collapse
			*/
			"border-collapse": [{ border: ["collapse", "separate"] }],
			/**
			* Border Spacing
			* @see https://tailwindcss.com/docs/border-spacing
			*/
			"border-spacing": [{ "border-spacing": scaleUnambiguousSpacing() }],
			/**
			* Border Spacing X
			* @see https://tailwindcss.com/docs/border-spacing
			*/
			"border-spacing-x": [{ "border-spacing-x": scaleUnambiguousSpacing() }],
			/**
			* Border Spacing Y
			* @see https://tailwindcss.com/docs/border-spacing
			*/
			"border-spacing-y": [{ "border-spacing-y": scaleUnambiguousSpacing() }],
			/**
			* Table Layout
			* @see https://tailwindcss.com/docs/table-layout
			*/
			"table-layout": [{ table: ["auto", "fixed"] }],
			/**
			* Caption Side
			* @see https://tailwindcss.com/docs/caption-side
			*/
			caption: [{ caption: ["top", "bottom"] }],
			/**
			* Transition Property
			* @see https://tailwindcss.com/docs/transition-property
			*/
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Transition Behavior
			* @see https://tailwindcss.com/docs/transition-behavior
			*/
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			/**
			* Transition Duration
			* @see https://tailwindcss.com/docs/transition-duration
			*/
			duration: [{ duration: [
				isNumber,
				"initial",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Transition Timing Function
			* @see https://tailwindcss.com/docs/transition-timing-function
			*/
			ease: [{ ease: [
				"linear",
				"initial",
				themeEase,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Transition Delay
			* @see https://tailwindcss.com/docs/transition-delay
			*/
			delay: [{ delay: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Animation
			* @see https://tailwindcss.com/docs/animation
			*/
			animate: [{ animate: [
				"none",
				themeAnimate,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backface Visibility
			* @see https://tailwindcss.com/docs/backface-visibility
			*/
			backface: [{ backface: ["hidden", "visible"] }],
			/**
			* Perspective
			* @see https://tailwindcss.com/docs/perspective
			*/
			perspective: [{ perspective: [
				themePerspective,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Perspective Origin
			* @see https://tailwindcss.com/docs/perspective-origin
			*/
			"perspective-origin": [{ "perspective-origin": scalePositionWithArbitrary() }],
			/**
			* Rotate
			* @see https://tailwindcss.com/docs/rotate
			*/
			rotate: [{ rotate: scaleRotate() }],
			/**
			* Rotate X
			* @see https://tailwindcss.com/docs/rotate
			*/
			"rotate-x": [{ "rotate-x": scaleRotate() }],
			/**
			* Rotate Y
			* @see https://tailwindcss.com/docs/rotate
			*/
			"rotate-y": [{ "rotate-y": scaleRotate() }],
			/**
			* Rotate Z
			* @see https://tailwindcss.com/docs/rotate
			*/
			"rotate-z": [{ "rotate-z": scaleRotate() }],
			/**
			* Scale
			* @see https://tailwindcss.com/docs/scale
			*/
			scale: [{ scale: scaleScale() }],
			/**
			* Scale X
			* @see https://tailwindcss.com/docs/scale
			*/
			"scale-x": [{ "scale-x": scaleScale() }],
			/**
			* Scale Y
			* @see https://tailwindcss.com/docs/scale
			*/
			"scale-y": [{ "scale-y": scaleScale() }],
			/**
			* Scale Z
			* @see https://tailwindcss.com/docs/scale
			*/
			"scale-z": [{ "scale-z": scaleScale() }],
			/**
			* Scale 3D
			* @see https://tailwindcss.com/docs/scale
			*/
			"scale-3d": ["scale-3d"],
			/**
			* Skew
			* @see https://tailwindcss.com/docs/skew
			*/
			skew: [{ skew: scaleSkew() }],
			/**
			* Skew X
			* @see https://tailwindcss.com/docs/skew
			*/
			"skew-x": [{ "skew-x": scaleSkew() }],
			/**
			* Skew Y
			* @see https://tailwindcss.com/docs/skew
			*/
			"skew-y": [{ "skew-y": scaleSkew() }],
			/**
			* Transform
			* @see https://tailwindcss.com/docs/transform
			*/
			transform: [{ transform: [
				isArbitraryVariable,
				isArbitraryValue,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			/**
			* Transform Origin
			* @see https://tailwindcss.com/docs/transform-origin
			*/
			"transform-origin": [{ origin: scalePositionWithArbitrary() }],
			/**
			* Transform Style
			* @see https://tailwindcss.com/docs/transform-style
			*/
			"transform-style": [{ transform: ["3d", "flat"] }],
			/**
			* Translate
			* @see https://tailwindcss.com/docs/translate
			*/
			translate: [{ translate: scaleTranslate() }],
			/**
			* Translate X
			* @see https://tailwindcss.com/docs/translate
			*/
			"translate-x": [{ "translate-x": scaleTranslate() }],
			/**
			* Translate Y
			* @see https://tailwindcss.com/docs/translate
			*/
			"translate-y": [{ "translate-y": scaleTranslate() }],
			/**
			* Translate Z
			* @see https://tailwindcss.com/docs/translate
			*/
			"translate-z": [{ "translate-z": scaleTranslate() }],
			/**
			* Translate None
			* @see https://tailwindcss.com/docs/translate
			*/
			"translate-none": ["translate-none"],
			/**
			* Zoom
			* @see https://tailwindcss.com/docs/zoom
			*/
			zoom: [{ zoom: [
				isInteger,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Accent Color
			* @see https://tailwindcss.com/docs/accent-color
			*/
			accent: [{ accent: scaleColor() }],
			/**
			* Appearance
			* @see https://tailwindcss.com/docs/appearance
			*/
			appearance: [{ appearance: ["none", "auto"] }],
			/**
			* Caret Color
			* @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
			*/
			"caret-color": [{ caret: scaleColor() }],
			/**
			* Color Scheme
			* @see https://tailwindcss.com/docs/color-scheme
			*/
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			/**
			* Cursor
			* @see https://tailwindcss.com/docs/cursor
			*/
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Field Sizing
			* @see https://tailwindcss.com/docs/field-sizing
			*/
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			/**
			* Pointer Events
			* @see https://tailwindcss.com/docs/pointer-events
			*/
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			/**
			* Resize
			* @see https://tailwindcss.com/docs/resize
			*/
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			/**
			* Scroll Behavior
			* @see https://tailwindcss.com/docs/scroll-behavior
			*/
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			/**
			* Scrollbar Thumb Color
			* @see https://tailwindcss.com/docs/scrollbar-color
			*/
			"scrollbar-thumb-color": [{ "scrollbar-thumb": scaleColor() }],
			/**
			* Scrollbar Track Color
			* @see https://tailwindcss.com/docs/scrollbar-color
			*/
			"scrollbar-track-color": [{ "scrollbar-track": scaleColor() }],
			/**
			* Scrollbar Gutter
			* @see https://tailwindcss.com/docs/scrollbar-gutter
			*/
			"scrollbar-gutter": [{ "scrollbar-gutter": [
				"auto",
				"stable",
				"both"
			] }],
			/**
			* Scrollbar Width
			* @see https://tailwindcss.com/docs/scrollbar-width
			*/
			"scrollbar-w": [{ scrollbar: [
				"auto",
				"thin",
				"none"
			] }],
			/**
			* Scroll Margin
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-m": [{ "scroll-m": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Inline
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mx": [{ "scroll-mx": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Block
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-my": [{ "scroll-my": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Inline Start
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-ms": [{ "scroll-ms": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Inline End
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-me": [{ "scroll-me": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Block Start
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mbs": [{ "scroll-mbs": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Block End
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mbe": [{ "scroll-mbe": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Top
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mt": [{ "scroll-mt": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Right
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mr": [{ "scroll-mr": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Bottom
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mb": [{ "scroll-mb": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Left
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-ml": [{ "scroll-ml": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-p": [{ "scroll-p": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Inline
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-px": [{ "scroll-px": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Block
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-py": [{ "scroll-py": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Inline Start
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-ps": [{ "scroll-ps": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Inline End
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pe": [{ "scroll-pe": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Block Start
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pbs": [{ "scroll-pbs": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Block End
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pbe": [{ "scroll-pbe": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Top
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pt": [{ "scroll-pt": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Right
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pr": [{ "scroll-pr": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Bottom
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pb": [{ "scroll-pb": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Left
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pl": [{ "scroll-pl": scaleUnambiguousSpacing() }],
			/**
			* Scroll Snap Align
			* @see https://tailwindcss.com/docs/scroll-snap-align
			*/
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			/**
			* Scroll Snap Stop
			* @see https://tailwindcss.com/docs/scroll-snap-stop
			*/
			"snap-stop": [{ snap: ["normal", "always"] }],
			/**
			* Scroll Snap Type
			* @see https://tailwindcss.com/docs/scroll-snap-type
			*/
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			/**
			* Scroll Snap Type Strictness
			* @see https://tailwindcss.com/docs/scroll-snap-type
			*/
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			/**
			* Touch Action
			* @see https://tailwindcss.com/docs/touch-action
			*/
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			/**
			* Touch Action X
			* @see https://tailwindcss.com/docs/touch-action
			*/
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			/**
			* Touch Action Y
			* @see https://tailwindcss.com/docs/touch-action
			*/
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			/**
			* Touch Action Pinch Zoom
			* @see https://tailwindcss.com/docs/touch-action
			*/
			"touch-pz": ["touch-pinch-zoom"],
			/**
			* User Select
			* @see https://tailwindcss.com/docs/user-select
			*/
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			/**
			* Will Change
			* @see https://tailwindcss.com/docs/will-change
			*/
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Fill
			* @see https://tailwindcss.com/docs/fill
			*/
			fill: [{ fill: ["none", ...scaleColor()] }],
			/**
			* Stroke Width
			* @see https://tailwindcss.com/docs/stroke-width
			*/
			"stroke-w": [{ stroke: [
				isNumber,
				isArbitraryVariableLength,
				isArbitraryLength,
				isArbitraryNumber
			] }],
			/**
			* Stroke
			* @see https://tailwindcss.com/docs/stroke
			*/
			stroke: [{ stroke: ["none", ...scaleColor()] }],
			/**
			* Forced Color Adjust
			* @see https://tailwindcss.com/docs/forced-color-adjust
			*/
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			"container-named": ["container-type"],
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"inset-bs",
				"inset-be",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": ["right", "left"],
			"inset-y": ["top", "bottom"],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pbs",
				"pbe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: ["pr", "pl"],
			py: ["pt", "pb"],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mbs",
				"mbe",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: ["mr", "ml"],
			my: ["mt", "mb"],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": ["border-w-r", "border-w-l"],
			"border-w-y": ["border-w-t", "border-w-b"],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": ["border-color-r", "border-color-l"],
			"border-color-y": ["border-color-t", "border-color-b"],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": ["scroll-mr", "scroll-ml"],
			"scroll-my": ["scroll-mt", "scroll-mb"],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": ["scroll-pr", "scroll-pl"],
			"scroll-py": ["scroll-pt", "scroll-pb"],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		postfixLookupClassGroups: ["container-type"],
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
};
var twMerge = /*#__PURE__*/ createTailwindMerge(getDefaultConfig);
//#endregion
//#region node_modules/trough/lib/index.js
/**
* @typedef {(error?: Error | null | undefined, ...output: Array<any>) => void} Callback
*   Callback.
*
* @typedef {(...input: Array<any>) => any} Middleware
*   Ware.
*
* @typedef Pipeline
*   Pipeline.
* @property {Run} run
*   Run the pipeline.
* @property {Use} use
*   Add middleware.
*
* @typedef {(...input: Array<any>) => void} Run
*   Call all middleware.
*
*   Calls `done` on completion with either an error or the output of the
*   last middleware.
*
*   > 👉 **Note**: as the length of input defines whether async functions get a
*   > `next` function,
*   > it’s recommended to keep `input` at one value normally.

*
* @typedef {(fn: Middleware) => Pipeline} Use
*   Add middleware.
*/
/**
* Create new middleware.
*
* @returns {Pipeline}
*   Pipeline.
*/
function trough() {
	/** @type {Array<Middleware>} */
	const fns = [];
	/** @type {Pipeline} */
	const pipeline = {
		run,
		use
	};
	return pipeline;
	/** @type {Run} */
	function run(...values) {
		let middlewareIndex = -1;
		/** @type {Callback} */
		const callback = values.pop();
		if (typeof callback !== "function") throw new TypeError("Expected function as last argument, not " + callback);
		next(null, ...values);
		/**
		* Run the next `fn`, or we’re done.
		*
		* @param {Error | null | undefined} error
		* @param {Array<any>} output
		*/
		function next(error, ...output) {
			const fn = fns[++middlewareIndex];
			let index = -1;
			if (error) {
				callback(error);
				return;
			}
			while (++index < values.length) if (output[index] === null || output[index] === void 0) output[index] = values[index];
			values = output;
			if (fn) wrap(fn, next)(...output);
			else callback(null, ...output);
		}
	}
	/** @type {Use} */
	function use(middelware) {
		if (typeof middelware !== "function") throw new TypeError("Expected `middelware` to be a function, not " + middelware);
		fns.push(middelware);
		return pipeline;
	}
}
/**
* Wrap `middleware` into a uniform interface.
*
* You can pass all input to the resulting function.
* `callback` is then called with the output of `middleware`.
*
* If `middleware` accepts more arguments than the later given in input,
* an extra `done` function is passed to it after that input,
* which must be called by `middleware`.
*
* The first value in `input` is the main input value.
* All other input values are the rest input values.
* The values given to `callback` are the input values,
* merged with every non-nullish output value.
*
* * if `middleware` throws an error,
*   returns a promise that is rejected,
*   or calls the given `done` function with an error,
*   `callback` is called with that error
* * if `middleware` returns a value or returns a promise that is resolved,
*   that value is the main output value
* * if `middleware` calls `done`,
*   all non-nullish values except for the first one (the error) overwrite the
*   output values
*
* @param {Middleware} middleware
*   Function to wrap.
* @param {Callback} callback
*   Callback called with the output of `middleware`.
* @returns {Run}
*   Wrapped middleware.
*/
function wrap(middleware, callback) {
	/** @type {boolean} */
	let called;
	return wrapped;
	/**
	* Call `middleware`.
	* @this {any}
	* @param {Array<any>} parameters
	* @returns {void}
	*/
	function wrapped(...parameters) {
		const fnExpectsCallback = middleware.length > parameters.length;
		/** @type {any} */
		let result;
		if (fnExpectsCallback) parameters.push(done);
		try {
			result = middleware.apply(this, parameters);
		} catch (error) {
			const exception = error;
			if (fnExpectsCallback && called) throw exception;
			return done(exception);
		}
		if (!fnExpectsCallback) if (result && result.then && typeof result.then === "function") result.then(then, done);
		else if (result instanceof Error) done(result);
		else then(result);
	}
	/**
	* Call `callback`, only once.
	*
	* @type {Callback}
	*/
	function done(error, ...output) {
		if (!called) {
			called = true;
			callback(error, ...output);
		}
	}
	/**
	* Call `done` with one value.
	*
	* @param {any} [value]
	*/
	function then(value) {
		done(null, value);
	}
}
//#endregion
//#region node_modules/vfile/lib/minurl.shared.js
/**
* Checks if a value has the shape of a WHATWG URL object.
*
* Using a symbol or instanceof would not be able to recognize URL objects
* coming from other implementations (e.g. in Electron), so instead we are
* checking some well known properties for a lack of a better test.
*
* We use `href` and `protocol` as they are the only properties that are
* easy to retrieve and calculate due to the lazy nature of the getters.
*
* We check for auth attribute to distinguish legacy url instance with
* WHATWG URL instance.
*
* @param {unknown} fileUrlOrPath
*   File path or URL.
* @returns {fileUrlOrPath is URL}
*   Whether it’s a URL.
*/
function isUrl(fileUrlOrPath) {
	return Boolean(fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && fileUrlOrPath.auth === void 0);
}
//#endregion
//#region node_modules/vfile/lib/index.js
/**
* @import {Node, Point, Position} from 'unist'
* @import {Options as MessageOptions} from 'vfile-message'
* @import {Compatible, Data, Map, Options, Value} from 'vfile'
*/
/**
* @typedef {object & {type: string, position?: Position | undefined}} NodeLike
*/
/**
* Order of setting (least specific to most), we need this because otherwise
* `{stem: 'a', path: '~/b.js'}` would throw, as a path is needed before a
* stem can be set.
*/
var order = [
	"history",
	"path",
	"basename",
	"stem",
	"extname",
	"dirname"
];
var VFile = class {
	/**
	* Create a new virtual file.
	*
	* `options` is treated as:
	*
	* *   `string` or `Uint8Array` — `{value: options}`
	* *   `URL` — `{path: options}`
	* *   `VFile` — shallow copies its data over to the new file
	* *   `object` — all fields are shallow copied over to the new file
	*
	* Path related fields are set in the following order (least specific to
	* most specific): `history`, `path`, `basename`, `stem`, `extname`,
	* `dirname`.
	*
	* You cannot set `dirname` or `extname` without setting either `history`,
	* `path`, `basename`, or `stem` too.
	*
	* @param {Compatible | null | undefined} [value]
	*   File value.
	* @returns
	*   New instance.
	*/
	constructor(value) {
		/** @type {Options | VFile} */
		let options;
		if (!value) options = {};
		else if (isUrl(value)) options = { path: value };
		else if (typeof value === "string" || isUint8Array$1(value)) options = { value };
		else options = value;
		/**
		* Base of `path` (default: `process.cwd()` or `'/'` in browsers).
		*
		* @type {string}
		*/
		this.cwd = "cwd" in options ? "" : minproc.cwd();
		/**
		* Place to store custom info (default: `{}`).
		*
		* It’s OK to store custom data directly on the file but moving it to
		* `data` is recommended.
		*
		* @type {Data}
		*/
		this.data = {};
		/**
		* List of file paths the file moved between.
		*
		* The first is the original path and the last is the current path.
		*
		* @type {Array<string>}
		*/
		this.history = [];
		/**
		* List of messages associated with the file.
		*
		* @type {Array<VFileMessage>}
		*/
		this.messages = [];
		/**
		* Raw value.
		*
		* @type {Value}
		*/
		this.value;
		/**
		* Source map.
		*
		* This type is equivalent to the `RawSourceMap` type from the `source-map`
		* module.
		*
		* @type {Map | null | undefined}
		*/
		this.map;
		/**
		* Custom, non-string, compiled, representation.
		*
		* This is used by unified to store non-string results.
		* One example is when turning markdown into React nodes.
		*
		* @type {unknown}
		*/
		this.result;
		/**
		* Whether a file was saved to disk.
		*
		* This is used by vfile reporters.
		*
		* @type {boolean}
		*/
		this.stored;
		let index = -1;
		while (++index < order.length) {
			const field = order[index];
			if (field in options && options[field] !== void 0 && options[field] !== null) this[field] = field === "history" ? [...options[field]] : options[field];
		}
		/** @type {string} */
		let field;
		for (field in options) if (!order.includes(field)) this[field] = options[field];
	}
	/**
	* Get the basename (including extname) (example: `'index.min.js'`).
	*
	* @returns {string | undefined}
	*   Basename.
	*/
	get basename() {
		return typeof this.path === "string" ? minpath.basename(this.path) : void 0;
	}
	/**
	* Set basename (including extname) (`'index.min.js'`).
	*
	* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
	* on windows).
	* Cannot be nullified (use `file.path = file.dirname` instead).
	*
	* @param {string} basename
	*   Basename.
	* @returns {undefined}
	*   Nothing.
	*/
	set basename(basename) {
		assertNonEmpty(basename, "basename");
		assertPart(basename, "basename");
		this.path = minpath.join(this.dirname || "", basename);
	}
	/**
	* Get the parent path (example: `'~'`).
	*
	* @returns {string | undefined}
	*   Dirname.
	*/
	get dirname() {
		return typeof this.path === "string" ? minpath.dirname(this.path) : void 0;
	}
	/**
	* Set the parent path (example: `'~'`).
	*
	* Cannot be set if there’s no `path` yet.
	*
	* @param {string | undefined} dirname
	*   Dirname.
	* @returns {undefined}
	*   Nothing.
	*/
	set dirname(dirname) {
		assertPath(this.basename, "dirname");
		this.path = minpath.join(dirname || "", this.basename);
	}
	/**
	* Get the extname (including dot) (example: `'.js'`).
	*
	* @returns {string | undefined}
	*   Extname.
	*/
	get extname() {
		return typeof this.path === "string" ? minpath.extname(this.path) : void 0;
	}
	/**
	* Set the extname (including dot) (example: `'.js'`).
	*
	* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
	* on windows).
	* Cannot be set if there’s no `path` yet.
	*
	* @param {string | undefined} extname
	*   Extname.
	* @returns {undefined}
	*   Nothing.
	*/
	set extname(extname) {
		assertPart(extname, "extname");
		assertPath(this.dirname, "extname");
		if (extname) {
			if (extname.codePointAt(0) !== 46) throw new Error("`extname` must start with `.`");
			if (extname.includes(".", 1)) throw new Error("`extname` cannot contain multiple dots");
		}
		this.path = minpath.join(this.dirname, this.stem + (extname || ""));
	}
	/**
	* Get the full path (example: `'~/index.min.js'`).
	*
	* @returns {string}
	*   Path.
	*/
	get path() {
		return this.history[this.history.length - 1];
	}
	/**
	* Set the full path (example: `'~/index.min.js'`).
	*
	* Cannot be nullified.
	* You can set a file URL (a `URL` object with a `file:` protocol) which will
	* be turned into a path with `url.fileURLToPath`.
	*
	* @param {URL | string} path
	*   Path.
	* @returns {undefined}
	*   Nothing.
	*/
	set path(path) {
		if (isUrl(path)) path = urlToPath(path);
		assertNonEmpty(path, "path");
		if (this.path !== path) this.history.push(path);
	}
	/**
	* Get the stem (basename w/o extname) (example: `'index.min'`).
	*
	* @returns {string | undefined}
	*   Stem.
	*/
	get stem() {
		return typeof this.path === "string" ? minpath.basename(this.path, this.extname) : void 0;
	}
	/**
	* Set the stem (basename w/o extname) (example: `'index.min'`).
	*
	* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
	* on windows).
	* Cannot be nullified (use `file.path = file.dirname` instead).
	*
	* @param {string} stem
	*   Stem.
	* @returns {undefined}
	*   Nothing.
	*/
	set stem(stem) {
		assertNonEmpty(stem, "stem");
		assertPart(stem, "stem");
		this.path = minpath.join(this.dirname || "", stem + (this.extname || ""));
	}
	/**
	* Create a fatal message for `reason` associated with the file.
	*
	* The `fatal` field of the message is set to `true` (error; file not usable)
	* and the `file` field is set to the current file path.
	* The message is added to the `messages` field on `file`.
	*
	* > 🪦 **Note**: also has obsolete signatures.
	*
	* @overload
	* @param {string} reason
	* @param {MessageOptions | null | undefined} [options]
	* @returns {never}
	*
	* @overload
	* @param {string} reason
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {string} reason
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {string} reason
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {string | null | undefined} [origin]
	* @returns {never}
	*
	* @param {Error | VFileMessage | string} causeOrReason
	*   Reason for message, should use markdown.
	* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
	*   Configuration (optional).
	* @param {string | null | undefined} [origin]
	*   Place in code where the message originates (example:
	*   `'my-package:my-rule'` or `'my-rule'`).
	* @returns {never}
	*   Never.
	* @throws {VFileMessage}
	*   Message.
	*/
	fail(causeOrReason, optionsOrParentOrPlace, origin) {
		const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
		message.fatal = true;
		throw message;
	}
	/**
	* Create an info message for `reason` associated with the file.
	*
	* The `fatal` field of the message is set to `undefined` (info; change
	* likely not needed) and the `file` field is set to the current file path.
	* The message is added to the `messages` field on `file`.
	*
	* > 🪦 **Note**: also has obsolete signatures.
	*
	* @overload
	* @param {string} reason
	* @param {MessageOptions | null | undefined} [options]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @param {Error | VFileMessage | string} causeOrReason
	*   Reason for message, should use markdown.
	* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
	*   Configuration (optional).
	* @param {string | null | undefined} [origin]
	*   Place in code where the message originates (example:
	*   `'my-package:my-rule'` or `'my-rule'`).
	* @returns {VFileMessage}
	*   Message.
	*/
	info(causeOrReason, optionsOrParentOrPlace, origin) {
		const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
		message.fatal = void 0;
		return message;
	}
	/**
	* Create a message for `reason` associated with the file.
	*
	* The `fatal` field of the message is set to `false` (warning; change may be
	* needed) and the `file` field is set to the current file path.
	* The message is added to the `messages` field on `file`.
	*
	* > 🪦 **Note**: also has obsolete signatures.
	*
	* @overload
	* @param {string} reason
	* @param {MessageOptions | null | undefined} [options]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {string} reason
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Node | NodeLike | null | undefined} parent
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {Point | Position | null | undefined} place
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @overload
	* @param {Error | VFileMessage} cause
	* @param {string | null | undefined} [origin]
	* @returns {VFileMessage}
	*
	* @param {Error | VFileMessage | string} causeOrReason
	*   Reason for message, should use markdown.
	* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
	*   Configuration (optional).
	* @param {string | null | undefined} [origin]
	*   Place in code where the message originates (example:
	*   `'my-package:my-rule'` or `'my-rule'`).
	* @returns {VFileMessage}
	*   Message.
	*/
	message(causeOrReason, optionsOrParentOrPlace, origin) {
		const message = new VFileMessage(causeOrReason, optionsOrParentOrPlace, origin);
		if (this.path) {
			message.name = this.path + ":" + message.name;
			message.file = this.path;
		}
		message.fatal = false;
		this.messages.push(message);
		return message;
	}
	/**
	* Serialize the file.
	*
	* > **Note**: which encodings are supported depends on the engine.
	* > For info on Node.js, see:
	* > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
	*
	* @param {string | null | undefined} [encoding='utf8']
	*   Character encoding to understand `value` as when it’s a `Uint8Array`
	*   (default: `'utf-8'`).
	* @returns {string}
	*   Serialized file.
	*/
	toString(encoding) {
		if (this.value === void 0) return "";
		if (typeof this.value === "string") return this.value;
		return new TextDecoder(encoding || void 0).decode(this.value);
	}
};
/**
* Assert that `part` is not a path (as in, does not contain `path.sep`).
*
* @param {string | null | undefined} part
*   File path part.
* @param {string} name
*   Part name.
* @returns {undefined}
*   Nothing.
*/
function assertPart(part, name) {
	if (part && part.includes(minpath.sep)) throw new Error("`" + name + "` cannot be a path: did not expect `" + minpath.sep + "`");
}
/**
* Assert that `part` is not empty.
*
* @param {string | undefined} part
*   Thing.
* @param {string} name
*   Part name.
* @returns {asserts part is string}
*   Nothing.
*/
function assertNonEmpty(part, name) {
	if (!part) throw new Error("`" + name + "` cannot be empty");
}
/**
* Assert `path` exists.
*
* @param {string | undefined} path
*   Path.
* @param {string} name
*   Dependency name.
* @returns {asserts path is string}
*   Nothing.
*/
function assertPath(path, name) {
	if (!path) throw new Error("Setting `" + name + "` requires `path` to be set too");
}
/**
* Assert `value` is an `Uint8Array`.
*
* @param {unknown} value
*   thing.
* @returns {value is Uint8Array}
*   Whether `value` is an `Uint8Array`.
*/
function isUint8Array$1(value) {
	return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
}
//#endregion
//#region node_modules/unified/lib/callable-instance.js
var import_extend = /* @__PURE__ */ __toESM(require_extend(), 1);
var CallableInstance = (
/**
* @this {Function}
* @param {string | symbol} property
* @returns {(...parameters: Array<unknown>) => unknown}
*/
function(property) {
	const proto = this.constructor.prototype;
	const value = proto[property];
	/** @type {(...parameters: Array<unknown>) => unknown} */
	const apply = function() {
		return value.apply(apply, arguments);
	};
	Object.setPrototypeOf(apply, proto);
	return apply;
});
//#endregion
//#region node_modules/unified/lib/index.js
/**
* @typedef {import('trough').Pipeline} Pipeline
*
* @typedef {import('unist').Node} Node
*
* @typedef {import('vfile').Compatible} Compatible
* @typedef {import('vfile').Value} Value
*
* @typedef {import('../index.js').CompileResultMap} CompileResultMap
* @typedef {import('../index.js').Data} Data
* @typedef {import('../index.js').Settings} Settings
*/
/**
* @typedef {CompileResultMap[keyof CompileResultMap]} CompileResults
*   Acceptable results from compilers.
*
*   To register custom results, add them to
*   {@linkcode CompileResultMap}.
*/
/**
* @template {Node} [Tree=Node]
*   The node that the compiler receives (default: `Node`).
* @template {CompileResults} [Result=CompileResults]
*   The thing that the compiler yields (default: `CompileResults`).
* @callback Compiler
*   A **compiler** handles the compiling of a syntax tree to something else
*   (in most cases, text) (TypeScript type).
*
*   It is used in the stringify phase and called with a {@linkcode Node}
*   and {@linkcode VFile} representation of the document to compile.
*   It should return the textual representation of the given tree (typically
*   `string`).
*
*   > **Note**: unified typically compiles by serializing: most compilers
*   > return `string` (or `Uint8Array`).
*   > Some compilers, such as the one configured with
*   > [`rehype-react`][rehype-react], return other values (in this case, a
*   > React tree).
*   > If you’re using a compiler that doesn’t serialize, expect different
*   > result values.
*   >
*   > To register custom results in TypeScript, add them to
*   > {@linkcode CompileResultMap}.
*
*   [rehype-react]: https://github.com/rehypejs/rehype-react
* @param {Tree} tree
*   Tree to compile.
* @param {VFile} file
*   File associated with `tree`.
* @returns {Result}
*   New content: compiled text (`string` or `Uint8Array`, for `file.value`) or
*   something else (for `file.result`).
*/
/**
* @template {Node} [Tree=Node]
*   The node that the parser yields (default: `Node`)
* @callback Parser
*   A **parser** handles the parsing of text to a syntax tree.
*
*   It is used in the parse phase and is called with a `string` and
*   {@linkcode VFile} of the document to parse.
*   It must return the syntax tree representation of the given file
*   ({@linkcode Node}).
* @param {string} document
*   Document to parse.
* @param {VFile} file
*   File associated with `document`.
* @returns {Tree}
*   Node representing the given file.
*/
/**
* @typedef {(
*   Plugin<Array<any>, any, any> |
*   PluginTuple<Array<any>, any, any> |
*   Preset
* )} Pluggable
*   Union of the different ways to add plugins and settings.
*/
/**
* @typedef {Array<Pluggable>} PluggableList
*   List of plugins and presets.
*/
/**
* @template {Array<unknown>} [PluginParameters=[]]
*   Arguments passed to the plugin (default: `[]`, the empty tuple).
* @template {Node | string | undefined} [Input=Node]
*   Value that is expected as input (default: `Node`).
*
*   *   If the plugin returns a {@linkcode Transformer}, this
*       should be the node it expects.
*   *   If the plugin sets a {@linkcode Parser}, this should be
*       `string`.
*   *   If the plugin sets a {@linkcode Compiler}, this should be the
*       node it expects.
* @template [Output=Input]
*   Value that is yielded as output (default: `Input`).
*
*   *   If the plugin returns a {@linkcode Transformer}, this
*       should be the node that that yields.
*   *   If the plugin sets a {@linkcode Parser}, this should be the
*       node that it yields.
*   *   If the plugin sets a {@linkcode Compiler}, this should be
*       result it yields.
* @typedef {(
*   (this: Processor, ...parameters: PluginParameters) =>
*     Input extends string ? // Parser.
*        Output extends Node | undefined ? undefined | void : never :
*     Output extends CompileResults ? // Compiler.
*        Input extends Node | undefined ? undefined | void : never :
*     Transformer<
*       Input extends Node ? Input : Node,
*       Output extends Node ? Output : Node
*     > | undefined | void
* )} Plugin
*   Single plugin.
*
*   Plugins configure the processors they are applied on in the following
*   ways:
*
*   *   they change the processor, such as the parser, the compiler, or by
*       configuring data
*   *   they specify how to handle trees and files
*
*   In practice, they are functions that can receive options and configure the
*   processor (`this`).
*
*   > **Note**: plugins are called when the processor is *frozen*, not when
*   > they are applied.
*/
/**
* Tuple of a plugin and its configuration.
*
* The first item is a plugin, the rest are its parameters.
*
* @template {Array<unknown>} [TupleParameters=[]]
*   Arguments passed to the plugin (default: `[]`, the empty tuple).
* @template {Node | string | undefined} [Input=undefined]
*   Value that is expected as input (optional).
*
*   *   If the plugin returns a {@linkcode Transformer}, this
*       should be the node it expects.
*   *   If the plugin sets a {@linkcode Parser}, this should be
*       `string`.
*   *   If the plugin sets a {@linkcode Compiler}, this should be the
*       node it expects.
* @template [Output=undefined] (optional).
*   Value that is yielded as output.
*
*   *   If the plugin returns a {@linkcode Transformer}, this
*       should be the node that that yields.
*   *   If the plugin sets a {@linkcode Parser}, this should be the
*       node that it yields.
*   *   If the plugin sets a {@linkcode Compiler}, this should be
*       result it yields.
* @typedef {(
*   [
*     plugin: Plugin<TupleParameters, Input, Output>,
*     ...parameters: TupleParameters
*   ]
* )} PluginTuple
*/
/**
* @typedef Preset
*   Sharable configuration.
*
*   They can contain plugins and settings.
* @property {PluggableList | undefined} [plugins]
*   List of plugins and presets (optional).
* @property {Settings | undefined} [settings]
*   Shared settings for parsers and compilers (optional).
*/
/**
* @template {VFile} [File=VFile]
*   The file that the callback receives (default: `VFile`).
* @callback ProcessCallback
*   Callback called when the process is done.
*
*   Called with either an error or a result.
* @param {Error | undefined} [error]
*   Fatal error (optional).
* @param {File | undefined} [file]
*   Processed file (optional).
* @returns {undefined}
*   Nothing.
*/
/**
* @template {Node} [Tree=Node]
*   The tree that the callback receives (default: `Node`).
* @callback RunCallback
*   Callback called when transformers are done.
*
*   Called with either an error or results.
* @param {Error | undefined} [error]
*   Fatal error (optional).
* @param {Tree | undefined} [tree]
*   Transformed tree (optional).
* @param {VFile | undefined} [file]
*   File (optional).
* @returns {undefined}
*   Nothing.
*/
/**
* @template {Node} [Output=Node]
*   Node type that the transformer yields (default: `Node`).
* @callback TransformCallback
*   Callback passed to transforms.
*
*   If the signature of a `transformer` accepts a third argument, the
*   transformer may perform asynchronous operations, and must call it.
* @param {Error | undefined} [error]
*   Fatal error to stop the process (optional).
* @param {Output | undefined} [tree]
*   New, changed, tree (optional).
* @param {VFile | undefined} [file]
*   New, changed, file (optional).
* @returns {undefined}
*   Nothing.
*/
/**
* @template {Node} [Input=Node]
*   Node type that the transformer expects (default: `Node`).
* @template {Node} [Output=Input]
*   Node type that the transformer yields (default: `Input`).
* @callback Transformer
*   Transformers handle syntax trees and files.
*
*   They are functions that are called each time a syntax tree and file are
*   passed through the run phase.
*   When an error occurs in them (either because it’s thrown, returned,
*   rejected, or passed to `next`), the process stops.
*
*   The run phase is handled by [`trough`][trough], see its documentation for
*   the exact semantics of these functions.
*
*   > **Note**: you should likely ignore `next`: don’t accept it.
*   > it supports callback-style async work.
*   > But promises are likely easier to reason about.
*
*   [trough]: https://github.com/wooorm/trough#function-fninput-next
* @param {Input} tree
*   Tree to handle.
* @param {VFile} file
*   File to handle.
* @param {TransformCallback<Output>} next
*   Callback.
* @returns {(
*   Promise<Output | undefined | void> |
*   Promise<never> | // For some reason this is needed separately.
*   Output |
*   Error |
*   undefined |
*   void
* )}
*   If you accept `next`, nothing.
*   Otherwise:
*
*   *   `Error` — fatal error to stop the process
*   *   `Promise<undefined>` or `undefined` — the next transformer keeps using
*       same tree
*   *   `Promise<Node>` or `Node` — new, changed, tree
*/
/**
* @template {Node | undefined} ParseTree
*   Output of `parse`.
* @template {Node | undefined} HeadTree
*   Input for `run`.
* @template {Node | undefined} TailTree
*   Output for `run`.
* @template {Node | undefined} CompileTree
*   Input of `stringify`.
* @template {CompileResults | undefined} CompileResult
*   Output of `stringify`.
* @template {Node | string | undefined} Input
*   Input of plugin.
* @template Output
*   Output of plugin (optional).
* @typedef {(
*   Input extends string
*     ? Output extends Node | undefined
*       ? // Parser.
*         Processor<
*           Output extends undefined ? ParseTree : Output,
*           HeadTree,
*           TailTree,
*           CompileTree,
*           CompileResult
*         >
*       : // Unknown.
*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
*     : Output extends CompileResults
*     ? Input extends Node | undefined
*       ? // Compiler.
*         Processor<
*           ParseTree,
*           HeadTree,
*           TailTree,
*           Input extends undefined ? CompileTree : Input,
*           Output extends undefined ? CompileResult : Output
*         >
*       : // Unknown.
*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
*     : Input extends Node | undefined
*     ? Output extends Node | undefined
*       ? // Transform.
*         Processor<
*           ParseTree,
*           HeadTree extends undefined ? Input : HeadTree,
*           Output extends undefined ? TailTree : Output,
*           CompileTree,
*           CompileResult
*         >
*       : // Unknown.
*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
*     : // Unknown.
*       Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
* )} UsePlugin
*   Create a processor based on the input/output of a {@link Plugin plugin}.
*/
/**
* @template {CompileResults | undefined} Result
*   Node type that the transformer yields.
* @typedef {(
*   Result extends Value | undefined ?
*     VFile :
*     VFile & {result: Result}
*   )} VFileWithOutput
*   Type to generate a {@linkcode VFile} corresponding to a compiler result.
*
*   If a result that is not acceptable on a `VFile` is used, that will
*   be stored on the `result` field of {@linkcode VFile}.
*/
var own = {}.hasOwnProperty;
/**
* Create a new processor.
*
* @example
*   This example shows how a new processor can be created (from `remark`) and linked
*   to **stdin**(4) and **stdout**(4).
*
*   ```js
*   import process from 'node:process'
*   import concatStream from 'concat-stream'
*   import {remark} from 'remark'
*
*   process.stdin.pipe(
*     concatStream(function (buf) {
*       process.stdout.write(String(remark().processSync(buf)))
*     })
*   )
*   ```
*
* @returns
*   New *unfrozen* processor (`processor`).
*
*   This processor is configured to work the same as its ancestor.
*   When the descendant processor is configured in the future it does not
*   affect the ancestral processor.
*/
var unified = new class Processor extends CallableInstance {
	/**
	* Create a processor.
	*/
	constructor() {
		super("copy");
		/**
		* Compiler to use (deprecated).
		*
		* @deprecated
		*   Use `compiler` instead.
		* @type {(
		*   Compiler<
		*     CompileTree extends undefined ? Node : CompileTree,
		*     CompileResult extends undefined ? CompileResults : CompileResult
		*   > |
		*   undefined
		* )}
		*/
		this.Compiler = void 0;
		/**
		* Parser to use (deprecated).
		*
		* @deprecated
		*   Use `parser` instead.
		* @type {(
		*   Parser<ParseTree extends undefined ? Node : ParseTree> |
		*   undefined
		* )}
		*/
		this.Parser = void 0;
		/**
		* Internal list of configured plugins.
		*
		* @deprecated
		*   This is a private internal property and should not be used.
		* @type {Array<PluginTuple<Array<unknown>>>}
		*/
		this.attachers = [];
		/**
		* Compiler to use.
		*
		* @type {(
		*   Compiler<
		*     CompileTree extends undefined ? Node : CompileTree,
		*     CompileResult extends undefined ? CompileResults : CompileResult
		*   > |
		*   undefined
		* )}
		*/
		this.compiler = void 0;
		/**
		* Internal state to track where we are while freezing.
		*
		* @deprecated
		*   This is a private internal property and should not be used.
		* @type {number}
		*/
		this.freezeIndex = -1;
		/**
		* Internal state to track whether we’re frozen.
		*
		* @deprecated
		*   This is a private internal property and should not be used.
		* @type {boolean | undefined}
		*/
		this.frozen = void 0;
		/**
		* Internal state.
		*
		* @deprecated
		*   This is a private internal property and should not be used.
		* @type {Data}
		*/
		this.namespace = {};
		/**
		* Parser to use.
		*
		* @type {(
		*   Parser<ParseTree extends undefined ? Node : ParseTree> |
		*   undefined
		* )}
		*/
		this.parser = void 0;
		/**
		* Internal list of configured transformers.
		*
		* @deprecated
		*   This is a private internal property and should not be used.
		* @type {Pipeline}
		*/
		this.transformers = trough();
	}
	/**
	* Copy a processor.
	*
	* @deprecated
	*   This is a private internal method and should not be used.
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*   New *unfrozen* processor ({@linkcode Processor}) that is
	*   configured to work the same as its ancestor.
	*   When the descendant processor is configured in the future it does not
	*   affect the ancestral processor.
	*/
	copy() {
		const destination = new Processor();
		let index = -1;
		while (++index < this.attachers.length) {
			const attacher = this.attachers[index];
			destination.use(...attacher);
		}
		destination.data((0, import_extend.default)(true, {}, this.namespace));
		return destination;
	}
	/**
	* Configure the processor with info available to all plugins.
	* Information is stored in an object.
	*
	* Typically, options can be given to a specific plugin, but sometimes it
	* makes sense to have information shared with several plugins.
	* For example, a list of HTML elements that are self-closing, which is
	* needed during all phases.
	*
	* > **Note**: setting information cannot occur on *frozen* processors.
	* > Call the processor first to create a new unfrozen processor.
	*
	* > **Note**: to register custom data in TypeScript, augment the
	* > {@linkcode Data} interface.
	*
	* @example
	*   This example show how to get and set info:
	*
	*   ```js
	*   import {unified} from 'unified'
	*
	*   const processor = unified().data('alpha', 'bravo')
	*
	*   processor.data('alpha') // => 'bravo'
	*
	*   processor.data() // => {alpha: 'bravo'}
	*
	*   processor.data({charlie: 'delta'})
	*
	*   processor.data() // => {charlie: 'delta'}
	*   ```
	*
	* @template {keyof Data} Key
	*
	* @overload
	* @returns {Data}
	*
	* @overload
	* @param {Data} dataset
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*
	* @overload
	* @param {Key} key
	* @returns {Data[Key]}
	*
	* @overload
	* @param {Key} key
	* @param {Data[Key]} value
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*
	* @param {Data | Key} [key]
	*   Key to get or set, or entire dataset to set, or nothing to get the
	*   entire dataset (optional).
	* @param {Data[Key]} [value]
	*   Value to set (optional).
	* @returns {unknown}
	*   The current processor when setting, the value at `key` when getting, or
	*   the entire dataset when getting without key.
	*/
	data(key, value) {
		if (typeof key === "string") {
			if (arguments.length === 2) {
				assertUnfrozen("data", this.frozen);
				this.namespace[key] = value;
				return this;
			}
			return own.call(this.namespace, key) && this.namespace[key] || void 0;
		}
		if (key) {
			assertUnfrozen("data", this.frozen);
			this.namespace = key;
			return this;
		}
		return this.namespace;
	}
	/**
	* Freeze a processor.
	*
	* Frozen processors are meant to be extended and not to be configured
	* directly.
	*
	* When a processor is frozen it cannot be unfrozen.
	* New processors working the same way can be created by calling the
	* processor.
	*
	* It’s possible to freeze processors explicitly by calling `.freeze()`.
	* Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
	* `.stringify()`, `.process()`, or `.processSync()` are called.
	*
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*   The current processor.
	*/
	freeze() {
		if (this.frozen) return this;
		const self = this;
		while (++this.freezeIndex < this.attachers.length) {
			const [attacher, ...options] = this.attachers[this.freezeIndex];
			if (options[0] === false) continue;
			if (options[0] === true) options[0] = void 0;
			const transformer = attacher.call(self, ...options);
			if (typeof transformer === "function") this.transformers.use(transformer);
		}
		this.frozen = true;
		this.freezeIndex = Number.POSITIVE_INFINITY;
		return this;
	}
	/**
	* Parse text to a syntax tree.
	*
	* > **Note**: `parse` freezes the processor if not already *frozen*.
	*
	* > **Note**: `parse` performs the parse phase, not the run phase or other
	* > phases.
	*
	* @param {Compatible | undefined} [file]
	*   file to parse (optional); typically `string` or `VFile`; any value
	*   accepted as `x` in `new VFile(x)`.
	* @returns {ParseTree extends undefined ? Node : ParseTree}
	*   Syntax tree representing `file`.
	*/
	parse(file) {
		this.freeze();
		const realFile = vfile(file);
		const parser = this.parser || this.Parser;
		assertParser("parse", parser);
		return parser(String(realFile), realFile);
	}
	/**
	* Process the given file as configured on the processor.
	*
	* > **Note**: `process` freezes the processor if not already *frozen*.
	*
	* > **Note**: `process` performs the parse, run, and stringify phases.
	*
	* @overload
	* @param {Compatible | undefined} file
	* @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
	* @returns {undefined}
	*
	* @overload
	* @param {Compatible | undefined} [file]
	* @returns {Promise<VFileWithOutput<CompileResult>>}
	*
	* @param {Compatible | undefined} [file]
	*   File (optional); typically `string` or `VFile`]; any value accepted as
	*   `x` in `new VFile(x)`.
	* @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
	*   Callback (optional).
	* @returns {Promise<VFile> | undefined}
	*   Nothing if `done` is given.
	*   Otherwise a promise, rejected with a fatal error or resolved with the
	*   processed file.
	*
	*   The parsed, transformed, and compiled value is available at
	*   `file.value` (see note).
	*
	*   > **Note**: unified typically compiles by serializing: most
	*   > compilers return `string` (or `Uint8Array`).
	*   > Some compilers, such as the one configured with
	*   > [`rehype-react`][rehype-react], return other values (in this case, a
	*   > React tree).
	*   > If you’re using a compiler that doesn’t serialize, expect different
	*   > result values.
	*   >
	*   > To register custom results in TypeScript, add them to
	*   > {@linkcode CompileResultMap}.
	*
	*   [rehype-react]: https://github.com/rehypejs/rehype-react
	*/
	process(file, done) {
		const self = this;
		this.freeze();
		assertParser("process", this.parser || this.Parser);
		assertCompiler("process", this.compiler || this.Compiler);
		return done ? executor(void 0, done) : new Promise(executor);
		/**
		* @param {((file: VFileWithOutput<CompileResult>) => undefined | void) | undefined} resolve
		* @param {(error: Error | undefined) => undefined | void} reject
		* @returns {undefined}
		*/
		function executor(resolve, reject) {
			const realFile = vfile(file);
			const parseTree = self.parse(realFile);
			self.run(parseTree, realFile, function(error, tree, file) {
				if (error || !tree || !file) return realDone(error);
				const compileTree = tree;
				const compileResult = self.stringify(compileTree, file);
				if (looksLikeAValue(compileResult)) file.value = compileResult;
				else file.result = compileResult;
				realDone(error, file);
			});
			/**
			* @param {Error | undefined} error
			* @param {VFileWithOutput<CompileResult> | undefined} [file]
			* @returns {undefined}
			*/
			function realDone(error, file) {
				if (error || !file) reject(error);
				else if (resolve) resolve(file);
				else done(void 0, file);
			}
		}
	}
	/**
	* Process the given file as configured on the processor.
	*
	* An error is thrown if asynchronous transforms are configured.
	*
	* > **Note**: `processSync` freezes the processor if not already *frozen*.
	*
	* > **Note**: `processSync` performs the parse, run, and stringify phases.
	*
	* @param {Compatible | undefined} [file]
	*   File (optional); typically `string` or `VFile`; any value accepted as
	*   `x` in `new VFile(x)`.
	* @returns {VFileWithOutput<CompileResult>}
	*   The processed file.
	*
	*   The parsed, transformed, and compiled value is available at
	*   `file.value` (see note).
	*
	*   > **Note**: unified typically compiles by serializing: most
	*   > compilers return `string` (or `Uint8Array`).
	*   > Some compilers, such as the one configured with
	*   > [`rehype-react`][rehype-react], return other values (in this case, a
	*   > React tree).
	*   > If you’re using a compiler that doesn’t serialize, expect different
	*   > result values.
	*   >
	*   > To register custom results in TypeScript, add them to
	*   > {@linkcode CompileResultMap}.
	*
	*   [rehype-react]: https://github.com/rehypejs/rehype-react
	*/
	processSync(file) {
		/** @type {boolean} */
		let complete = false;
		/** @type {VFileWithOutput<CompileResult> | undefined} */
		let result;
		this.freeze();
		assertParser("processSync", this.parser || this.Parser);
		assertCompiler("processSync", this.compiler || this.Compiler);
		this.process(file, realDone);
		assertDone("processSync", "process", complete);
		return result;
		/**
		* @type {ProcessCallback<VFileWithOutput<CompileResult>>}
		*/
		function realDone(error, file) {
			complete = true;
			bail(error);
			result = file;
		}
	}
	/**
	* Run *transformers* on a syntax tree.
	*
	* > **Note**: `run` freezes the processor if not already *frozen*.
	*
	* > **Note**: `run` performs the run phase, not other phases.
	*
	* @overload
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
	* @returns {undefined}
	*
	* @overload
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	* @param {Compatible | undefined} file
	* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
	* @returns {undefined}
	*
	* @overload
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	* @param {Compatible | undefined} [file]
	* @returns {Promise<TailTree extends undefined ? Node : TailTree>}
	*
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	*   Tree to transform and inspect.
	* @param {(
	*   RunCallback<TailTree extends undefined ? Node : TailTree> |
	*   Compatible
	* )} [file]
	*   File associated with `node` (optional); any value accepted as `x` in
	*   `new VFile(x)`.
	* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
	*   Callback (optional).
	* @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
	*   Nothing if `done` is given.
	*   Otherwise, a promise rejected with a fatal error or resolved with the
	*   transformed tree.
	*/
	run(tree, file, done) {
		assertNode(tree);
		this.freeze();
		const transformers = this.transformers;
		if (!done && typeof file === "function") {
			done = file;
			file = void 0;
		}
		return done ? executor(void 0, done) : new Promise(executor);
		/**
		* @param {(
		*   ((tree: TailTree extends undefined ? Node : TailTree) => undefined | void) |
		*   undefined
		* )} resolve
		* @param {(error: Error) => undefined | void} reject
		* @returns {undefined}
		*/
		function executor(resolve, reject) {
			const realFile = vfile(file);
			transformers.run(tree, realFile, realDone);
			/**
			* @param {Error | undefined} error
			* @param {Node} outputTree
			* @param {VFile} file
			* @returns {undefined}
			*/
			function realDone(error, outputTree, file) {
				const resultingTree = outputTree || tree;
				if (error) reject(error);
				else if (resolve) resolve(resultingTree);
				else done(void 0, resultingTree, file);
			}
		}
	}
	/**
	* Run *transformers* on a syntax tree.
	*
	* An error is thrown if asynchronous transforms are configured.
	*
	* > **Note**: `runSync` freezes the processor if not already *frozen*.
	*
	* > **Note**: `runSync` performs the run phase, not other phases.
	*
	* @param {HeadTree extends undefined ? Node : HeadTree} tree
	*   Tree to transform and inspect.
	* @param {Compatible | undefined} [file]
	*   File associated with `node` (optional); any value accepted as `x` in
	*   `new VFile(x)`.
	* @returns {TailTree extends undefined ? Node : TailTree}
	*   Transformed tree.
	*/
	runSync(tree, file) {
		/** @type {boolean} */
		let complete = false;
		/** @type {(TailTree extends undefined ? Node : TailTree) | undefined} */
		let result;
		this.run(tree, file, realDone);
		assertDone("runSync", "run", complete);
		return result;
		/**
		* @type {RunCallback<TailTree extends undefined ? Node : TailTree>}
		*/
		function realDone(error, tree) {
			bail(error);
			result = tree;
			complete = true;
		}
	}
	/**
	* Compile a syntax tree.
	*
	* > **Note**: `stringify` freezes the processor if not already *frozen*.
	*
	* > **Note**: `stringify` performs the stringify phase, not the run phase
	* > or other phases.
	*
	* @param {CompileTree extends undefined ? Node : CompileTree} tree
	*   Tree to compile.
	* @param {Compatible | undefined} [file]
	*   File associated with `node` (optional); any value accepted as `x` in
	*   `new VFile(x)`.
	* @returns {CompileResult extends undefined ? Value : CompileResult}
	*   Textual representation of the tree (see note).
	*
	*   > **Note**: unified typically compiles by serializing: most compilers
	*   > return `string` (or `Uint8Array`).
	*   > Some compilers, such as the one configured with
	*   > [`rehype-react`][rehype-react], return other values (in this case, a
	*   > React tree).
	*   > If you’re using a compiler that doesn’t serialize, expect different
	*   > result values.
	*   >
	*   > To register custom results in TypeScript, add them to
	*   > {@linkcode CompileResultMap}.
	*
	*   [rehype-react]: https://github.com/rehypejs/rehype-react
	*/
	stringify(tree, file) {
		this.freeze();
		const realFile = vfile(file);
		const compiler = this.compiler || this.Compiler;
		assertCompiler("stringify", compiler);
		assertNode(tree);
		return compiler(tree, realFile);
	}
	/**
	* Configure the processor to use a plugin, a list of usable values, or a
	* preset.
	*
	* If the processor is already using a plugin, the previous plugin
	* configuration is changed based on the options that are passed in.
	* In other words, the plugin is not added a second time.
	*
	* > **Note**: `use` cannot be called on *frozen* processors.
	* > Call the processor first to create a new unfrozen processor.
	*
	* @example
	*   There are many ways to pass plugins to `.use()`.
	*   This example gives an overview:
	*
	*   ```js
	*   import {unified} from 'unified'
	*
	*   unified()
	*     // Plugin with options:
	*     .use(pluginA, {x: true, y: true})
	*     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
	*     .use(pluginA, {y: false, z: true})
	*     // Plugins:
	*     .use([pluginB, pluginC])
	*     // Two plugins, the second with options:
	*     .use([pluginD, [pluginE, {}]])
	*     // Preset with plugins and settings:
	*     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
	*     // Settings only:
	*     .use({settings: {position: false}})
	*   ```
	*
	* @template {Array<unknown>} [Parameters=[]]
	* @template {Node | string | undefined} [Input=undefined]
	* @template [Output=Input]
	*
	* @overload
	* @param {Preset | null | undefined} [preset]
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*
	* @overload
	* @param {PluggableList} list
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*
	* @overload
	* @param {Plugin<Parameters, Input, Output>} plugin
	* @param {...(Parameters | [boolean])} parameters
	* @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
	*
	* @param {PluggableList | Plugin | Preset | null | undefined} value
	*   Usable value.
	* @param {...unknown} parameters
	*   Parameters, when a plugin is given as a usable value.
	* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
	*   Current processor.
	*/
	use(value, ...parameters) {
		const attachers = this.attachers;
		const namespace = this.namespace;
		assertUnfrozen("use", this.frozen);
		if (value === null || value === void 0) {} else if (typeof value === "function") addPlugin(value, parameters);
		else if (typeof value === "object") if (Array.isArray(value)) addList(value);
		else addPreset(value);
		else throw new TypeError("Expected usable value, not `" + value + "`");
		return this;
		/**
		* @param {Pluggable} value
		* @returns {undefined}
		*/
		function add(value) {
			if (typeof value === "function") addPlugin(value, []);
			else if (typeof value === "object") if (Array.isArray(value)) {
				const [plugin, ...parameters] = value;
				addPlugin(plugin, parameters);
			} else addPreset(value);
			else throw new TypeError("Expected usable value, not `" + value + "`");
		}
		/**
		* @param {Preset} result
		* @returns {undefined}
		*/
		function addPreset(result) {
			if (!("plugins" in result) && !("settings" in result)) throw new Error("Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither");
			addList(result.plugins);
			if (result.settings) namespace.settings = (0, import_extend.default)(true, namespace.settings, result.settings);
		}
		/**
		* @param {PluggableList | null | undefined} plugins
		* @returns {undefined}
		*/
		function addList(plugins) {
			let index = -1;
			if (plugins === null || plugins === void 0) {} else if (Array.isArray(plugins)) while (++index < plugins.length) {
				const thing = plugins[index];
				add(thing);
			}
			else throw new TypeError("Expected a list of plugins, not `" + plugins + "`");
		}
		/**
		* @param {Plugin} plugin
		* @param {Array<unknown>} parameters
		* @returns {undefined}
		*/
		function addPlugin(plugin, parameters) {
			let index = -1;
			let entryIndex = -1;
			while (++index < attachers.length) if (attachers[index][0] === plugin) {
				entryIndex = index;
				break;
			}
			if (entryIndex === -1) attachers.push([plugin, ...parameters]);
			else if (parameters.length > 0) {
				let [primary, ...rest] = parameters;
				const currentPrimary = attachers[entryIndex][1];
				if (isPlainObject(currentPrimary) && isPlainObject(primary)) primary = (0, import_extend.default)(true, currentPrimary, primary);
				attachers[entryIndex] = [
					plugin,
					primary,
					...rest
				];
			}
		}
	}
}().freeze();
/**
* Assert a parser is available.
*
* @param {string} name
* @param {unknown} value
* @returns {asserts value is Parser}
*/
function assertParser(name, value) {
	if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `parser`");
}
/**
* Assert a compiler is available.
*
* @param {string} name
* @param {unknown} value
* @returns {asserts value is Compiler}
*/
function assertCompiler(name, value) {
	if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `compiler`");
}
/**
* Assert the processor is not frozen.
*
* @param {string} name
* @param {unknown} frozen
* @returns {asserts frozen is false}
*/
function assertUnfrozen(name, frozen) {
	if (frozen) throw new Error("Cannot call `" + name + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.");
}
/**
* Assert `node` is a unist node.
*
* @param {unknown} node
* @returns {asserts node is Node}
*/
function assertNode(node) {
	if (!isPlainObject(node) || typeof node.type !== "string") throw new TypeError("Expected node, got `" + node + "`");
}
/**
* Assert that `complete` is `true`.
*
* @param {string} name
* @param {string} asyncName
* @param {unknown} complete
* @returns {asserts complete is true}
*/
function assertDone(name, asyncName, complete) {
	if (!complete) throw new Error("`" + name + "` finished async. Use `" + asyncName + "` instead");
}
/**
* @param {Compatible | undefined} [value]
* @returns {VFile}
*/
function vfile(value) {
	return looksLikeAVFile(value) ? value : new VFile(value);
}
/**
* @param {Compatible | undefined} [value]
* @returns {value is VFile}
*/
function looksLikeAVFile(value) {
	return Boolean(value && typeof value === "object" && "message" in value && "messages" in value);
}
/**
* @param {unknown} [value]
* @returns {value is Value}
*/
function looksLikeAValue(value) {
	return typeof value === "string" || isUint8Array(value);
}
/**
* Assert `value` is an `Uint8Array`.
*
* @param {unknown} value
*   thing.
* @returns {value is Uint8Array}
*   Whether `value` is an `Uint8Array`.
*/
function isUint8Array(value) {
	return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
}
//#endregion
//#region node_modules/streamdown/dist/chunk-7TTQLYRW.js
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom(), 1);
var $r = 300;
var Wr = "300px";
var qr = 500;
function fn(e = {}) {
	let { immediate: t = false, debounceDelay: n = $r, rootMargin: o = Wr, idleTimeout: r = qr } = e, [s, a] = (0, import_react.useState)(false), i = (0, import_react.useRef)(null), l = (0, import_react.useRef)(null), c = (0, import_react.useRef)(null), d = (0, import_react.useMemo)(() => (f) => {
		let u = Date.now();
		return window.setTimeout(() => {
			f({
				didTimeout: false,
				timeRemaining: () => Math.max(0, 50 - (Date.now() - u))
			});
		}, 1);
	}, []), p = (0, import_react.useMemo)(() => typeof window != "undefined" && window.requestIdleCallback ? (f, u) => window.requestIdleCallback(f, u) : d, [d]), b = (0, import_react.useMemo)(() => typeof window != "undefined" && window.cancelIdleCallback ? (f) => window.cancelIdleCallback(f) : (f) => {
		clearTimeout(f);
	}, []);
	return (0, import_react.useEffect)(() => {
		if (t) {
			a(true);
			return;
		}
		let f = i.current;
		if (!f) return;
		l.current && (clearTimeout(l.current), l.current = null), c.current && (b(c.current), c.current = null);
		let u = () => {
			l.current && (clearTimeout(l.current), l.current = null), c.current && (b(c.current), c.current = null);
		}, g = (m) => {
			c.current = p((C) => {
				C.timeRemaining() > 0 || C.didTimeout ? (a(true), m.disconnect()) : c.current = p(() => {
					a(true), m.disconnect();
				}, { timeout: r / 2 });
			}, { timeout: r });
		}, h = (m) => {
			u(), l.current = window.setTimeout(() => {
				var P, M;
				let C = m.takeRecords();
				(C.length === 0 || (M = (P = C.at(-1)) == null ? void 0 : P.isIntersecting) != null && M) && g(m);
			}, n);
		}, y = (m, C) => {
			m.isIntersecting ? h(C) : u();
		}, x = new IntersectionObserver((m) => {
			for (let C of m) y(C, x);
		}, {
			rootMargin: o,
			threshold: 0
		});
		return x.observe(f), () => {
			l.current && clearTimeout(l.current), c.current && b(c.current), x.disconnect();
		};
	}, [
		t,
		n,
		o,
		r,
		b,
		p
	]), {
		shouldRender: s,
		containerRef: i
	};
}
var Xr = 320;
var Zr = 4;
var Cn = () => typeof performance == "undefined" ? Date.now() : performance.now();
function Et(e) {
	var s, a;
	let t = (s = e == null ? void 0 : e.now) != null ? s : Cn, n = (a = e == null ? void 0 : e.maxBacklogMs) != null ? a : Xr, o = 0, r = 0;
	return {
		now: t,
		beginPass(i) {
			r = Math.min(Math.max(o, i), i + n);
		},
		mark() {
			return r;
		},
		rewind(i) {
			r = i;
		},
		take(i, l, c) {
			if (i <= 0) return {
				baseDelay: 0,
				step: Math.max(0, l)
			};
			let d = Math.max(0, l), p = d === 0 ? 0 : Math.min(d, Zr), b = Math.max(r, c), f = c + n, u = b + Math.max(0, i - 1) * d, g = d;
			if (u > f && i > 1) if (b < f) {
				let y = f - b;
				g = Math.max(p, y / (i - 1));
			} else g = p;
			let h = Math.max(0, Math.round(b - c));
			return r = b + i * g, {
				baseDelay: h,
				step: g
			};
		},
		commitPass() {
			o = r;
		}
	};
}
var wn = /\s/;
var Gr = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\u3000-\u303F\uFF00-\uFFEF]/u;
var Mt = /^\s+$/;
var Kr = /* @__PURE__ */ new Set([
	"pre",
	"svg",
	"math",
	"annotation"
]);
var Jr = /* @__PURE__ */ new Set(["img", "hr"]);
var Fe = (e) => typeof e == "object" && e !== null && "type" in e && e.type === "element";
var St = (e) => e.some((t) => Fe(t) && Kr.has(t.tagName));
var Ur = (e) => {
	for (let t = e.length - 1; t >= 0; t--) {
		let n = e[t];
		if (Fe(n) && n.tagName === "li") return n;
	}
};
var Yr = (e, t, n, o) => {
	e.properties ??= {}, e.properties["data-sd-animate-marker"] = true;
	let r = typeof e.properties.style == "string" ? `${e.properties.style};` : "";
	e.properties.style = `${r}--sd-marker-duration:${t}ms;--sd-marker-delay:${Math.round(n)}ms;--sd-marker-easing:${o}`;
};
var Qr = /* @__PURE__ */ new Set([
	"ul",
	"ol",
	"li"
]);
var kn = (e) => {
	for (let t of e.children) if (Fe(t)) {
		if (t.tagName === "input") return t;
		if (Qr.has(t.tagName)) continue;
		let n = kn(t);
		if (n) return n;
	}
};
var xn = (e, t, n, o) => {
	e.properties ??= {}, e.properties["data-sd-animate"] = true;
	let r = typeof e.properties.style == "string" ? `${e.properties.style};` : "";
	e.properties.style = `${r}--sd-animation:sd-${t.animation};--sd-duration:${n}ms;--sd-easing:${t.easing};--sd-delay:${Math.round(o)}ms`;
};
var es = (e, t, n, o) => {
	let r = kn(e);
	r && xn(r, t, n, o);
};
var ts = (e, t, n, o, r, s) => {
	if (St(t)) return;
	let a = o.prevContentLength, i = r.count;
	r.count += 1;
	let l = a > 0 && i < a, c = l ? 0 : s.baseDelay + r.newIndex++ * s.step;
	xn(e, n, l ? 0 : n.duration, c);
};
var ns = (e) => {
	var t;
	for (let n = e.length - 1; n >= 0; n -= 1) {
		let o = e[n];
		if (Fe(o)) {
			if ((t = o.properties) != null && t["data-sd-animated"]) break;
			o.properties = {
				...o.properties,
				"data-sd-animated": true
			};
		}
	}
};
var vn = (e) => {
	let t = [], n = "", o = false, r = false;
	for (let s of e) {
		let a = wn.test(s), i = !a && Gr.test(s);
		if (!a && n !== "" && (i || r)) t.push(n), n = "", o = false;
		else if (a !== o && n) {
			if (a) {
				n += s, o = true;
				continue;
			}
			t.push(n), n = "";
		}
		n += s, o = a, r = i;
	}
	return n && t.push(n), t;
};
var Tn = (e) => {
	let t = [], n = "";
	for (let o of e) wn.test(o) ? t.length > 0 && !Mt.test(t.at(-1)) ? t[t.length - 1] += o : n += o : (n && (t.push(n), n = ""), t.push(o));
	return n && (t.length > 0 ? t[t.length - 1] += n : t.push(n)), t;
};
var gn = /^[^\s;:'"\\/](?:[^;:'"\\/\r\n]*[^\s;:'"\\/])?$/;
var os = (e, t, n, o) => {
	let r = `sd-${t.animation}`, s = `${n ? 0 : t.duration}ms`, a;
	return t.styleObjects ? (a = {
		"--sd-animation": r,
		"--sd-duration": s,
		"--sd-easing": t.easing
	}, o && (a["--sd-delay"] = `${Math.round(o)}ms`)) : (a = `--sd-animation:${r};--sd-duration:${s};--sd-easing:${t.easing}`, o && (a += `;--sd-delay:${Math.round(o)}ms`)), {
		type: "element",
		tagName: "span",
		properties: {
			"data-sd-animate": true,
			style: a
		},
		children: [{
			type: "text",
			value: e
		}]
	};
};
var bn = (e, t) => !(e > 0 && t < e);
var Pt = (e) => Fe(e) && Jr.has(e.tagName);
var rs = (e, t, n) => {
	let o = 0, r = 0;
	return visitParents(e, (s) => s.type === "text" || Pt(s), (s, a) => {
		if (St(a)) return SKIP;
		if (Pt(s)) {
			bn(n, r) && (o += 1), r += 1;
			return;
		}
		let i = s.value;
		if (!i.trim()) {
			r += i.length;
			return;
		}
		let l = t.sep === "char" ? Tn(i) : vn(i);
		for (let c of l) {
			let d = r;
			r += c.length, !Mt.test(c) && bn(n, d) && (o += 1);
		}
	}), o;
};
var ss = (e, t, n, o, r, s) => {
	var y;
	let a = t.at(-1);
	if (!(a && "children" in a)) return;
	if (St(t)) return SKIP;
	let i = a, l = i.children.indexOf(e);
	if (l === -1) return;
	let c = e.value;
	if (!c.trim()) {
		r.count += c.length;
		return;
	}
	let d = n.sep === "char" ? Tn(c) : vn(c), p = o.prevContentLength, b = false, f = Ur(t), u = !!(f && !((y = f.properties) != null && y["data-sd-animate-marker"])), g = false, h = d.map((x) => {
		let m = r.count;
		if (r.count += x.length, Mt.test(x)) return {
			type: "text",
			value: x
		};
		let C = p > 0 && m < p, E = C ? 0 : s.baseDelay + r.newIndex++ * s.step;
		if (b = true, f && u && !g) {
			let P = C ? 0 : n.duration;
			Yr(f, P, E, n.easing), es(f, n, P, E), g = true;
		}
		return os(x, n, C, E);
	});
	return b && ns(t), i.children.splice(l, 1, ...h), l + h.length;
};
var as = 0;
function Pn(e) {
	return Mn(e, false);
}
var En = (e) => Mn(e, true);
function Mn(e, t) {
	var l, c, d, p, b;
	let n = (l = e == null ? void 0 : e.animation) != null ? l : "fadeIn", o = (c = e == null ? void 0 : e.easing) != null ? c : "ease", r = {
		animation: n,
		duration: (d = e == null ? void 0 : e.duration) != null ? d : 150,
		easing: o,
		sep: (p = e == null ? void 0 : e.sep) != null ? p : "word",
		stagger: (b = e == null ? void 0 : e.stagger) != null ? b : 40,
		styleObjects: t && gn.test(n) && gn.test(o),
		timeline: e == null ? void 0 : e.timeline
	}, s = {
		committedCharCount: 0,
		prevContentLength: 0,
		lastRenderCharCount: 0,
		pendingMark: null
	}, a = as++, i = () => (f) => {
		var x;
		let u = {
			count: 0,
			newIndex: 0
		};
		s.prevContentLength = s.committedCharCount;
		let g = r.timeline, h = (x = g == null ? void 0 : g.now()) != null ? x : Cn();
		g && (s.pendingMark === null ? s.pendingMark = g.mark() : g.rewind(s.pendingMark));
		let y = g ? g.take(rs(f, r, s.prevContentLength), r.stagger, h) : {
			baseDelay: 0,
			step: r.stagger
		};
		visitParents(f, (m) => m.type === "text" || Pt(m), (m, C) => {
			if (m.type === "text") return ss(m, C, r, s, u, y);
			ts(m, C, r, s, u, y);
		}), s.lastRenderCharCount = u.count, s.prevContentLength = 0;
	};
	return Object.defineProperty(i, "name", { value: `rehypeAnimate$${a}` }), {
		name: "animate",
		type: "animate",
		rehypePlugin: i,
		setPrevContentLength(f) {
			s.committedCharCount = f, s.prevContentLength = f;
		},
		getLastRenderCharCount() {
			return s.lastRenderCharCount;
		},
		commit() {
			s.committedCharCount = s.lastRenderCharCount, s.pendingMark = null;
		}
	};
}
Pn();
var Nt = (0, import_react.createContext)(false);
var je = () => (0, import_react.useContext)(Nt);
var Pe = (...e) => twMerge(clsx(e));
var cs = (e, t) => {
	if (!e || !t) return t;
	let n = `${e}:`;
	return t.split(/\s+/).filter(Boolean).map((o) => o.startsWith(n) ? o : `${e}:${o}`).join(" ");
};
var Rn = (e) => e ? (...t) => cs(e, twMerge(clsx(t))) : Pe;
var re = (e, t, n) => {
	let o = typeof t == "string" && n.startsWith("text/csv") ? "﻿" : "", r = typeof t == "string" ? new Blob([o + t], { type: n }) : t, s = URL.createObjectURL(r), a = document.createElement("a");
	a.href = s, a.download = e, document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL(s);
};
var tt = (0, import_react.createContext)(Pe);
var w = () => (0, import_react.useContext)(tt);
var us = 8;
var rt = (e) => {
	if (!(e === void 0 || e === 0 || e === Number.POSITIVE_INFINITY)) {
		if (typeof e == "number") return Number.isFinite(e) && e > 0 ? `${e}px` : void 0;
		if (!(e === "0" || e === "none" || e === "Infinity")) return e;
	}
};
var st = (e, t, n) => {
	let o = (0, import_react.useRef)(null), r = (0, import_react.useRef)(true), s = (0, import_react.useRef)(false), a = (0, import_react.useRef)(null);
	return (0, import_react.useEffect)(() => {
		let i = o.current;
		if (!(i && t)) return;
		let l = () => {
			let c = i.scrollHeight - i.scrollTop - i.clientHeight < us;
			r.current = c;
		};
		return i.addEventListener("scroll", l, { passive: true }), () => i.removeEventListener("scroll", l);
	}, [t]), (0, import_react.useEffect)(() => {
		e && !s.current && (r.current = true), e || (r.current = true), s.current = e;
	}, [e]), (0, import_react.useEffect)(() => () => {
		a.current !== null && cancelAnimationFrame(a.current);
	}, []), (0, import_react.useEffect)(() => {
		let i = o.current;
		!(i && t && e && r.current) || a.current !== null || (a.current = requestAnimationFrame(() => {
			a.current = null, r.current && i.scrollTo({
				top: i.scrollHeight,
				behavior: "instant"
			});
		}));
	}, [
		e,
		t,
		n
	]), o;
};
var gs = Pe("block");
var bs = Pe("block", "before:content-[counter(line)]", "before:inline-block", "before:[counter-increment:line]", "before:w-6", "before:mr-4", "before:text-[13px]", "before:text-right", "before:text-muted-foreground/50", "before:font-mono", "before:select-none");
var hs = (e) => {
	let t = {};
	for (let n of e.split(";")) {
		let o = n.indexOf(":");
		if (o > 0) {
			let r = n.slice(0, o).trim(), s = n.slice(o + 1).trim();
			r && s && (t[r] = s);
		}
	}
	return t;
};
var In = (0, import_react.memo)(({ children: e, result: t, language: n, className: o, maxHeight: r, startLine: s, lineNumbers: a = true, ...i }) => {
	let l = w(), { isAnimating: c } = (0, import_react.useContext)(R), d = rt(r), p = st(c, !!d, t), b = (0, import_react.useMemo)(() => l(bs), [l]), f = (0, import_react.useMemo)(() => l(gs), [l]), u = (0, import_react.useMemo)(() => {
		let g = {};
		return t.bg && (g["--sdm-bg"] = t.bg), t.fg && (g["--sdm-fg"] = t.fg), t.rootStyle && Object.assign(g, hs(t.rootStyle)), g;
	}, [
		t.bg,
		t.fg,
		t.rootStyle
	]);
	return (0, import_jsx_runtime.jsx)("div", {
		className: l(o, d ? "overflow-y-auto" : null, "overflow-x-auto rounded-md border border-border bg-background p-4 text-sm"),
		"data-language": n,
		"data-streamdown": "code-block-body",
		ref: p,
		style: d ? { maxHeight: d } : void 0,
		...i,
		children: (0, import_jsx_runtime.jsx)("pre", {
			className: l(o, "bg-[var(--sdm-bg,inherit)]", "dark:bg-[var(--shiki-dark-bg,var(--sdm-bg,inherit))]"),
			style: u,
			children: (0, import_jsx_runtime.jsx)("code", {
				className: a ? l("[counter-increment:line_0] [counter-reset:line]") : void 0,
				style: a && s && s > 1 ? { counterReset: `line ${s - 1}` } : void 0,
				children: t.tokens.map((g, h) => (0, import_jsx_runtime.jsx)("span", {
					className: a ? b : f,
					children: g.length === 0 || g.length === 1 && g[0].content === "" ? `
` : g.map((y, x) => {
						let m = {}, C = !!y.bgColor;
						if (y.color && (m["--sdm-c"] = y.color), y.bgColor && (m["--sdm-tbg"] = y.bgColor), y.htmlStyle) for (let [E, P] of Object.entries(y.htmlStyle)) E === "color" ? m["--sdm-c"] = P : E === "background-color" ? (m["--sdm-tbg"] = P, C = true) : m[E] = P;
						return (0, import_jsx_runtime.jsx)("span", {
							className: l("text-[var(--sdm-c,inherit)]", "dark:text-[var(--shiki-dark,var(--sdm-c,inherit))]", C && "bg-[var(--sdm-tbg)]", C && "dark:bg-[var(--shiki-dark-bg,var(--sdm-tbg))]"),
							style: m,
							...y.htmlAttrs,
							children: y.content
						}, x);
					})
				}, h))
			})
		})
	});
});
var It = ({ className: e, language: t, style: n, isIncomplete: o, ...r }) => {
	let s = w();
	return (0, import_jsx_runtime.jsx)("div", {
		className: s("relative my-4 flex w-full flex-col gap-2 rounded-xl border border-border bg-sidebar p-2", e),
		"data-incomplete": o || void 0,
		"data-language": t,
		"data-streamdown": "code-block",
		style: {
			contentVisibility: "auto",
			containIntrinsicSize: "auto 200px",
			...n
		},
		...r
	});
};
var Lt = (0, import_react.createContext)({ code: "" });
var at = () => (0, import_react.useContext)(Lt);
var Dt = ({ language: e }) => {
	let t = w();
	return (0, import_jsx_runtime.jsx)("div", {
		className: t("flex h-8 items-center text-muted-foreground text-xs"),
		"data-language": e,
		"data-streamdown": "code-block-header",
		children: (0, import_jsx_runtime.jsx)("span", {
			className: t("ml-1 font-mono lowercase"),
			children: e
		})
	});
};
var Ts = (e) => {
	let t = e.length;
	for (; t > 0 && e[t - 1] === `
`;) t--;
	return e.slice(0, t);
};
var Ps = (0, import_react.lazy)(() => Promise.resolve().then(() => highlighted_body_JLMTFACH_exports).then((e) => ({ default: e.HighlightedCodeBlockBody })));
var At = ({ code: e, language: t, className: n, children: o, isIncomplete: r = false, startLine: s, lineNumbers: a, ...i }) => {
	let l = w(), { codeBlockMaxHeight: c } = (0, import_react.useContext)(R), d = (0, import_react.useMemo)(() => Ts(e), [e]), p = (0, import_react.useMemo)(() => ({
		bg: "transparent",
		fg: "inherit",
		tokens: d.split(`
`).map((b) => [{
			content: b,
			color: "inherit",
			bgColor: "transparent",
			htmlStyle: {},
			offset: 0
		}])
	}), [d]);
	return (0, import_jsx_runtime.jsx)(Lt.Provider, {
		value: { code: e },
		children: (0, import_jsx_runtime.jsxs)(It, {
			dir: "ltr",
			isIncomplete: r,
			language: t,
			children: [
				(0, import_jsx_runtime.jsx)(Dt, { language: t }),
				o ? (0, import_jsx_runtime.jsx)("div", {
					className: l("pointer-events-none absolute top-2 right-2 z-10 flex items-center"),
					children: (0, import_jsx_runtime.jsx)("div", {
						className: l("pointer-events-auto flex shrink-0 items-center gap-2 rounded-md border border-sidebar bg-sidebar/80 px-1.5 py-1 supports-[backdrop-filter]:bg-sidebar/70 supports-[backdrop-filter]:backdrop-blur"),
						"data-streamdown": "code-block-actions",
						children: o
					})
				}) : null,
				(0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: (0, import_jsx_runtime.jsx)(In, {
						className: n,
						language: t,
						lineNumbers: a,
						maxHeight: c,
						result: p,
						startLine: s,
						...i
					}),
					children: (0, import_jsx_runtime.jsx)(Ps, {
						className: n,
						code: d,
						isIncomplete: r,
						language: t,
						lineNumbers: a,
						maxHeight: c,
						raw: p,
						startLine: s,
						...i
					})
				})
			]
		})
	});
};
var An = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M15.5607 3.99999L15.0303 4.53032L6.23744 13.3232C5.55403 14.0066 4.44599 14.0066 3.76257 13.3232L4.2929 12.7929L3.76257 13.3232L0.969676 10.5303L0.439346 9.99999L1.50001 8.93933L2.03034 9.46966L4.82323 12.2626C4.92086 12.3602 5.07915 12.3602 5.17678 12.2626L13.9697 3.46966L14.5 2.93933L15.5607 3.99999Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var Hn = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M2.75 0.5C1.7835 0.5 1 1.2835 1 2.25V9.75C1 10.7165 1.7835 11.5 2.75 11.5H3.75H4.5V10H3.75H2.75C2.61193 10 2.5 9.88807 2.5 9.75V2.25C2.5 2.11193 2.61193 2 2.75 2H8.25C8.38807 2 8.5 2.11193 8.5 2.25V3H10V2.25C10 1.2835 9.2165 0.5 8.25 0.5H2.75ZM7.75 4.5C6.7835 4.5 6 5.2835 6 6.25V13.75C6 14.7165 6.7835 15.5 7.75 15.5H13.25C14.2165 15.5 15 14.7165 15 13.75V6.25C15 5.2835 14.2165 4.5 13.25 4.5H7.75ZM7.5 6.25C7.5 6.11193 7.61193 6 7.75 6H13.25C13.3881 6 13.5 6.11193 13.5 6.25V13.75C13.5 13.8881 13.3881 14 13.25 14H7.75C7.61193 14 7.5 13.8881 7.5 13.75V6.25Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var Bn = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M8.75 1V1.75V8.68934L10.7197 6.71967L11.25 6.18934L12.3107 7.25L11.7803 7.78033L8.70711 10.8536C8.31658 11.2441 7.68342 11.2441 7.29289 10.8536L4.21967 7.78033L3.68934 7.25L4.75 6.18934L5.28033 6.71967L7.25 8.68934V1.75V1H8.75ZM13.5 9.25V13.5H2.5V9.25V8.5H1V9.25V14C1 14.5523 1.44771 15 2 15H14C14.5523 15 15 14.5523 15 14V9.25V8.5H13.5V9.25Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var On = (e) => (0, import_jsx_runtime.jsxs)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: [
		(0, import_jsx_runtime.jsx)("path", {
			d: "M8 0V4",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M8 16V12",
			opacity: "0.5",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M3.29773 1.52783L5.64887 4.7639",
			opacity: "0.9",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M12.7023 1.52783L10.3511 4.7639",
			opacity: "0.1",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M12.7023 14.472L10.3511 11.236",
			opacity: "0.4",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M3.29773 14.472L5.64887 11.236",
			opacity: "0.6",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M15.6085 5.52783L11.8043 6.7639",
			opacity: "0.2",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M0.391602 10.472L4.19583 9.23598",
			opacity: "0.7",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M15.6085 10.4722L11.8043 9.2361",
			opacity: "0.3",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}),
		(0, import_jsx_runtime.jsx)("path", {
			d: "M0.391602 5.52783L4.19583 6.7639",
			opacity: "0.8",
			stroke: "currentColor",
			strokeWidth: "1.5"
		})
	]
});
var Vn = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M1 5.25V6H2.5V5.25V2.5H5.25H6V1H5.25H2C1.44772 1 1 1.44772 1 2V5.25ZM5.25 14.9994H6V13.4994H5.25H2.5V10.7494V9.99939H1V10.7494V13.9994C1 14.5517 1.44772 14.9994 2 14.9994H5.25ZM15 10V10.75V14C15 14.5523 14.5523 15 14 15H10.75H10V13.5H10.75H13.5V10.75V10H15ZM10.75 1H10V2.5H10.75H13.5V5.25V6H15V5.25V2C15 1.44772 14.5523 1 14 1H10.75Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var Fn = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M13.5 8C13.5 4.96643 11.0257 2.5 7.96452 2.5C5.42843 2.5 3.29365 4.19393 2.63724 6.5H5.25H6V8H5.25H0.75C0.335787 8 0 7.66421 0 7.25V2.75V2H1.5V2.75V5.23347C2.57851 2.74164 5.06835 1 7.96452 1C11.8461 1 15 4.13001 15 8C15 11.87 11.8461 15 7.96452 15C5.62368 15 3.54872 13.8617 2.27046 12.1122L1.828 11.5066L3.03915 10.6217L3.48161 11.2273C4.48831 12.6051 6.12055 13.5 7.96452 13.5C11.0257 13.5 13.5 11.0336 13.5 8Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var jn = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M12.4697 13.5303L13 14.0607L14.0607 13L13.5303 12.4697L9.06065 7.99999L13.5303 3.53032L14.0607 2.99999L13 1.93933L12.4697 2.46966L7.99999 6.93933L3.53032 2.46966L2.99999 1.93933L1.93933 2.99999L2.46966 3.53032L6.93933 7.99999L2.46966 12.4697L1.93933 13L2.99999 14.0607L3.53032 13.5303L7.99999 9.06065L12.4697 13.5303Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var _n = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M13.5 10.25V13.25C13.5 13.3881 13.3881 13.5 13.25 13.5H2.75C2.61193 13.5 2.5 13.3881 2.5 13.25L2.5 2.75C2.5 2.61193 2.61193 2.5 2.75 2.5H5.75H6.5V1H5.75H2.75C1.7835 1 1 1.7835 1 2.75V13.25C1 14.2165 1.7835 15 2.75 15H13.25C14.2165 15 15 14.2165 15 13.25V10.25V9.5H13.5V10.25ZM9 1H9.75H14.2495C14.6637 1 14.9995 1.33579 14.9995 1.75V6.25V7H13.4995V6.25V3.56066L8.53033 8.52978L8 9.06011L6.93934 7.99945L7.46967 7.46912L12.4388 2.5H9.75H9V1Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var zn = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5ZM6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C8.02469 13 9.42677 12.475 10.5353 11.596L13.9697 15.0303L14.5 15.5607L15.5607 14.5L15.0303 13.9697L11.596 10.5353C12.475 9.42677 13 8.02469 13 6.5C13 2.91015 10.0899 0 6.5 0ZM4.125 5.875H4.75H5.875V4.75V4.125H7.125V4.75V5.875H8.25H8.875V7.125H8.25H7.125V8.25V8.875H5.875V8.25V7.125H4.75H4.125V5.875Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var $n = (e) => (0, import_jsx_runtime.jsx)("svg", {
	"aria-hidden": "true",
	color: "currentColor",
	height: 16,
	strokeLinejoin: "round",
	viewBox: "0 0 16 16",
	width: 16,
	...e,
	children: (0, import_jsx_runtime.jsx)("path", {
		clipRule: "evenodd",
		d: "M1.5 6.5C1.5 3.73858 3.73858 1.5 6.5 1.5C9.26142 1.5 11.5 3.73858 11.5 6.5C11.5 9.26142 9.26142 11.5 6.5 11.5C3.73858 11.5 1.5 9.26142 1.5 6.5ZM6.5 0C2.91015 0 0 2.91015 0 6.5C0 10.0899 2.91015 13 6.5 13C8.02469 13 9.42677 12.475 10.5353 11.596L13.9697 15.0303L14.5 15.5607L15.5607 14.5L15.0303 13.9697L11.596 10.5353C12.475 9.42677 13 8.02469 13 6.5C13 2.91015 10.0899 0 6.5 0ZM4.125 5.875H4.75H8.25H8.875V7.125H8.25H4.75H4.125V5.875Z",
		fill: "currentColor",
		fillRule: "evenodd"
	})
});
var ze = {
	CheckIcon: An,
	CopyIcon: Hn,
	DownloadIcon: Bn,
	ExternalLinkIcon: _n,
	Loader2Icon: On,
	Maximize2Icon: Vn,
	RotateCcwIcon: Fn,
	XIcon: jn,
	ZoomInIcon: zn,
	ZoomOutIcon: $n
};
var qn = (0, import_react.createContext)(ze);
var Rs = (e, t) => {
	if (e === t) return true;
	if (!(e && t)) return e === t;
	let n = Object.keys(e), o = Object.keys(t);
	return n.length !== o.length ? false : n.every((r) => e[r] === t[r]);
};
var Ht = ({ icons: e, children: t }) => {
	let n = (0, import_react.useRef)(e), o = (0, import_react.useRef)(e ? {
		...ze,
		...e
	} : ze);
	Rs(n.current, e) || (n.current = e, o.current = e ? {
		...ze,
		...e
	} : ze);
	let r = o.current;
	return (0, import_jsx_runtime.jsx)(qn.Provider, {
		value: r,
		children: t
	});
};
var V = () => (0, import_react.useContext)(qn);
var it = {
	copyCode: "Copy Code",
	downloadFile: "Download file",
	downloadDiagram: "Download diagram",
	downloadDiagramAsSvg: "Download diagram as SVG",
	downloadDiagramAsPng: "Download diagram as PNG",
	downloadDiagramAsMmd: "Download diagram as MMD",
	viewFullscreen: "View fullscreen",
	exitFullscreen: "Exit fullscreen",
	mermaidFormatSvg: "SVG",
	mermaidFormatPng: "PNG",
	mermaidFormatMmd: "MMD",
	zoomIn: "Zoom in",
	zoomOut: "Zoom out",
	resetView: "Reset zoom and pan",
	mermaidAriaLabel: "Mermaid chart",
	errorMermaid: "Failed to render Mermaid chart",
	copyTable: "Copy table",
	copyTableAsMarkdown: "Copy table as Markdown",
	copyTableAsCsv: "Copy table as CSV",
	copyTableAsTsv: "Copy table as TSV",
	downloadTable: "Download table",
	downloadTableAsCsv: "Download table as CSV",
	downloadTableAsMarkdown: "Download table as Markdown",
	tableFormatMarkdown: "Markdown",
	tableFormatCsv: "CSV",
	tableFormatTsv: "TSV",
	imageNotAvailable: "Image not available",
	downloadImage: "Download image",
	openExternalLink: "Open external link?",
	externalLinkWarning: "You're about to visit an external website.",
	close: "Close",
	copyLink: "Copy link",
	copied: "Copied",
	openLink: "Open link"
};
var lt = (0, import_react.createContext)(it);
var F = () => (0, import_react.useContext)(lt);
var Ee = ({ onCopy: e, onError: t, timeout: n = 2e3, children: o, className: r, code: s, ...a }) => {
	let i = w(), [l, c] = (0, import_react.useState)(false), d = (0, import_react.useRef)(0), { code: p } = at(), { isAnimating: b } = (0, import_react.useContext)(R), f = F(), u = s != null ? s : p, g = async () => {
		var x;
		if (typeof window == "undefined" || !((x = navigator == null ? void 0 : navigator.clipboard) != null && x.writeText)) {
			t?.(/* @__PURE__ */ new Error("Clipboard API not available"));
			return;
		}
		try {
			l || (await navigator.clipboard.writeText(u), c(!0), e?.(), d.current = window.setTimeout(() => c(!1), n));
		} catch (m) {
			t?.(m);
		}
	};
	(0, import_react.useEffect)(() => () => {
		window.clearTimeout(d.current);
	}, []);
	let h = V(), y = l ? h.CheckIcon : h.CopyIcon;
	return (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("button", {
		"aria-label": f.copyCode,
		className: i("cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", r),
		"data-streamdown": "code-block-copy-button",
		disabled: b,
		onClick: g,
		title: f.copyCode,
		type: "button",
		...a,
		children: o != null ? o : (0, import_jsx_runtime.jsx)(y, {
			"aria-hidden": "true",
			size: 14
		})
	}), l && (0, import_jsx_runtime.jsx)("output", {
		"aria-live": "polite",
		className: "sr-only",
		children: f.copied
	})] });
};
var ye = (e, t, n) => {
	if (typeof e == "boolean") return n;
	let o = e[t];
	if (typeof o != "object") return n;
	let r = o.download;
	return typeof r != "object" ? n : r.filename || n;
};
var Ot = (e, t) => {
	if (typeof e == "boolean") return {};
	let n = e[t];
	if (typeof n != "object") return {};
	let o = n.copy;
	return typeof o != "object" || o === null ? {} : {
		onCopy: o.onCopy,
		onError: o.onError
	};
};
var Xn = {
	"1c": "1c",
	"1c-query": "1cq",
	abap: "abap",
	"actionscript-3": "as",
	ada: "ada",
	adoc: "adoc",
	"angular-html": "html",
	"angular-ts": "ts",
	apache: "conf",
	apex: "cls",
	apl: "apl",
	applescript: "applescript",
	ara: "ara",
	asciidoc: "adoc",
	asm: "asm",
	astro: "astro",
	awk: "awk",
	ballerina: "bal",
	bash: "sh",
	bat: "bat",
	batch: "bat",
	be: "be",
	beancount: "beancount",
	berry: "berry",
	bibtex: "bib",
	bicep: "bicep",
	blade: "blade.php",
	bsl: "bsl",
	c: "c",
	"c#": "cs",
	"c++": "cpp",
	cadence: "cdc",
	cairo: "cairo",
	cdc: "cdc",
	clarity: "clar",
	clj: "clj",
	clojure: "clj",
	"closure-templates": "soy",
	cmake: "cmake",
	cmd: "cmd",
	cobol: "cob",
	codeowners: "CODEOWNERS",
	codeql: "ql",
	coffee: "coffee",
	coffeescript: "coffee",
	"common-lisp": "lisp",
	console: "sh",
	coq: "v",
	cpp: "cpp",
	cql: "cql",
	crystal: "cr",
	cs: "cs",
	csharp: "cs",
	css: "css",
	csv: "csv",
	cue: "cue",
	cypher: "cql",
	d: "d",
	dart: "dart",
	dax: "dax",
	desktop: "desktop",
	diff: "diff",
	docker: "dockerfile",
	dockerfile: "dockerfile",
	dotenv: "env",
	"dream-maker": "dm",
	edge: "edge",
	elisp: "el",
	elixir: "ex",
	elm: "elm",
	"emacs-lisp": "el",
	erb: "erb",
	erl: "erl",
	erlang: "erl",
	f: "f",
	"f#": "fs",
	f03: "f03",
	f08: "f08",
	f18: "f18",
	f77: "f77",
	f90: "f90",
	f95: "f95",
	fennel: "fnl",
	fish: "fish",
	fluent: "ftl",
	for: "for",
	"fortran-fixed-form": "f",
	"fortran-free-form": "f90",
	fs: "fs",
	fsharp: "fs",
	fsl: "fsl",
	ftl: "ftl",
	gdresource: "tres",
	gdscript: "gd",
	gdshader: "gdshader",
	genie: "gs",
	gherkin: "feature",
	"git-commit": "gitcommit",
	"git-rebase": "gitrebase",
	gjs: "js",
	gleam: "gleam",
	"glimmer-js": "js",
	"glimmer-ts": "ts",
	glsl: "glsl",
	gnuplot: "plt",
	go: "go",
	gql: "gql",
	graphql: "graphql",
	groovy: "groovy",
	gts: "gts",
	hack: "hack",
	haml: "haml",
	handlebars: "hbs",
	haskell: "hs",
	haxe: "hx",
	hbs: "hbs",
	hcl: "hcl",
	hjson: "hjson",
	hlsl: "hlsl",
	hs: "hs",
	html: "html",
	"html-derivative": "html",
	http: "http",
	hxml: "hxml",
	hy: "hy",
	imba: "imba",
	ini: "ini",
	jade: "jade",
	java: "java",
	javascript: "js",
	jinja: "jinja",
	jison: "jison",
	jl: "jl",
	js: "js",
	json: "json",
	json5: "json5",
	jsonc: "jsonc",
	jsonl: "jsonl",
	jsonnet: "jsonnet",
	jssm: "jssm",
	jsx: "jsx",
	julia: "jl",
	kotlin: "kt",
	kql: "kql",
	kt: "kt",
	kts: "kts",
	kusto: "kql",
	latex: "tex",
	lean: "lean",
	lean4: "lean",
	less: "less",
	liquid: "liquid",
	lisp: "lisp",
	lit: "lit",
	llvm: "ll",
	log: "log",
	logo: "logo",
	lua: "lua",
	luau: "luau",
	make: "mak",
	makefile: "mak",
	markdown: "md",
	marko: "marko",
	matlab: "m",
	md: "md",
	mdc: "mdc",
	mdx: "mdx",
	mediawiki: "wiki",
	mermaid: "mmd",
	mips: "s",
	mipsasm: "s",
	mmd: "mmd",
	mojo: "mojo",
	move: "move",
	nar: "nar",
	narrat: "narrat",
	nextflow: "nf",
	nf: "nf",
	nginx: "conf",
	nim: "nim",
	nix: "nix",
	nu: "nu",
	nushell: "nu",
	objc: "m",
	"objective-c": "m",
	"objective-cpp": "mm",
	ocaml: "ml",
	pascal: "pas",
	perl: "pl",
	perl6: "p6",
	php: "php",
	plsql: "pls",
	po: "po",
	polar: "polar",
	postcss: "pcss",
	pot: "pot",
	potx: "potx",
	powerquery: "pq",
	powershell: "ps1",
	prisma: "prisma",
	prolog: "pl",
	properties: "properties",
	proto: "proto",
	protobuf: "proto",
	ps: "ps",
	ps1: "ps1",
	pug: "pug",
	puppet: "pp",
	purescript: "purs",
	py: "py",
	python: "py",
	ql: "ql",
	qml: "qml",
	qmldir: "qmldir",
	qss: "qss",
	r: "r",
	racket: "rkt",
	raku: "raku",
	razor: "cshtml",
	rb: "rb",
	reg: "reg",
	regex: "regex",
	regexp: "regexp",
	rel: "rel",
	riscv: "s",
	rs: "rs",
	rst: "rst",
	ruby: "rb",
	rust: "rs",
	sas: "sas",
	sass: "sass",
	scala: "scala",
	scheme: "scm",
	scss: "scss",
	sdbl: "sdbl",
	sh: "sh",
	shader: "shader",
	shaderlab: "shader",
	shell: "sh",
	shellscript: "sh",
	shellsession: "sh",
	smalltalk: "st",
	solidity: "sol",
	soy: "soy",
	sparql: "rq",
	spl: "spl",
	splunk: "spl",
	sql: "sql",
	"ssh-config": "config",
	stata: "do",
	styl: "styl",
	stylus: "styl",
	svelte: "svelte",
	swift: "swift",
	"system-verilog": "sv",
	systemd: "service",
	talon: "talon",
	talonscript: "talon",
	tasl: "tasl",
	tcl: "tcl",
	templ: "templ",
	terraform: "tf",
	tex: "tex",
	tf: "tf",
	tfvars: "tfvars",
	toml: "toml",
	ts: "ts",
	"ts-tags": "ts",
	tsp: "tsp",
	tsv: "tsv",
	tsx: "tsx",
	turtle: "ttl",
	twig: "twig",
	typ: "typ",
	typescript: "ts",
	typespec: "tsp",
	typst: "typ",
	v: "v",
	vala: "vala",
	vb: "vb",
	verilog: "v",
	vhdl: "vhdl",
	vim: "vim",
	viml: "vim",
	vimscript: "vim",
	vue: "vue",
	"vue-html": "html",
	"vue-vine": "vine",
	vy: "vy",
	vyper: "vy",
	wasm: "wasm",
	wenyan: "wy",
	wgsl: "wgsl",
	wiki: "wiki",
	wikitext: "wiki",
	wit: "wit",
	wl: "wl",
	wolfram: "wl",
	xml: "xml",
	xsl: "xsl",
	yaml: "yaml",
	yml: "yml",
	zenscript: "zs",
	zig: "zig",
	zsh: "zsh",
	文言: "wy"
};
var Vt = ({ onDownload: e, onError: t, language: n, children: o, className: r, code: s, ...a }) => {
	let i = w(), { code: l } = at(), { isAnimating: c, controls: d } = (0, import_react.useContext)(R), p = F(), b = V(), f = s != null ? s : l, u = n && n in Xn ? Xn[n] : "txt", g = `${ye(d, "code", "file")}.${u}`, h = "text/plain", y = () => {
		try {
			re(g, f, h), e?.();
		} catch (x) {
			t?.(x);
		}
	};
	return (0, import_jsx_runtime.jsx)("button", {
		"aria-label": p.downloadFile,
		className: i("cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", r),
		"data-streamdown": "code-block-download-button",
		disabled: c,
		onClick: y,
		title: p.downloadFile,
		type: "button",
		...a,
		children: o != null ? o : (0, import_jsx_runtime.jsx)(b.DownloadIcon, { size: 14 })
	});
};
var ct = () => {
	let { Loader2Icon: e } = V(), t = w();
	return (0, import_jsx_runtime.jsxs)("div", {
		className: t("w-full divide-y divide-border overflow-hidden rounded-xl border border-border"),
		children: [(0, import_jsx_runtime.jsx)("div", { className: t("h-[46px] w-full bg-muted/80") }), (0, import_jsx_runtime.jsx)("div", {
			className: t("flex w-full items-center justify-center p-4"),
			children: (0, import_jsx_runtime.jsx)(e, { className: t("size-4 animate-spin") })
		})]
	});
};
var qs = /\.[^/.]+$/;
var Jn = ({ node: e, className: t, src: n, alt: o, onLoad: r, onError: s, showControls: a = true, showDownloadControl: i = true, ...l }) => {
	let { DownloadIcon: c } = V(), d = w(), p = (0, import_react.useRef)(null), [b, f] = (0, import_react.useState)(false), [u, g] = (0, import_react.useState)(false), h = F(), y = l.width != null || l.height != null, m = (b || y) && !u && a && i, C = u && !y;
	(0, import_react.useEffect)(() => {
		let N = p.current;
		if (N != null && N.complete) {
			let I = N.naturalWidth > 0;
			f(I), g(!I);
		}
	}, []);
	let E$1 = (0, import_react.useCallback)((N) => {
		f(true), g(false), r?.(N);
	}, [r]), P = (0, import_react.useCallback)((N) => {
		f(false), g(true), s?.(N);
	}, [s]), M = async () => {
		if (n) try {
			let I = await (await fetch(n)).blob(), $ = new URL(n, window.location.origin).pathname.split("/").pop() || "", j = $.split(".").pop(), ne = $.includes(".") && j !== void 0 && j.length <= 4, Z = "";
			if (ne) Z = $;
			else {
				let D = I.type, _ = "png";
				D.includes("jpeg") || D.includes("jpg") ? _ = "jpg" : D.includes("png") ? _ = "png" : D.includes("svg") ? _ = "svg" : D.includes("gif") ? _ = "gif" : D.includes("webp") && (_ = "webp"), Z = `${(o || $ || "image").replace(qs, "")}.${_}`;
			}
			re(Z, I, I.type);
		} catch (N) {
			window.open(n, "_blank");
		}
	};
	return n ? n === "streamdown:incomplete-image" ? (0, import_jsx_runtime.jsx)("div", {
		className: d("group relative my-4 inline-block"),
		"data-incomplete": "true",
		"data-streamdown": "image-wrapper",
		children: (0, import_jsx_runtime.jsx)("div", {
			className: d("h-24 w-48 animate-pulse rounded-lg bg-muted"),
			"data-streamdown": "image-placeholder"
		})
	}) : (0, import_jsx_runtime.jsxs)("div", {
		className: d("group relative my-4 inline-block"),
		"data-streamdown": "image-wrapper",
		children: [
			(0, import_jsx_runtime.jsx)("img", {
				alt: o,
				className: d("max-w-full rounded-lg", C && "hidden", t),
				"data-streamdown": "image",
				onError: P,
				onLoad: E$1,
				ref: p,
				src: n,
				...l
			}),
			C && (0, import_jsx_runtime.jsx)("span", {
				className: d("text-muted-foreground text-xs italic"),
				"data-streamdown": "image-fallback",
				children: h.imageNotAvailable
			}),
			a && (0, import_jsx_runtime.jsx)("div", {
				className: d("pointer-events-none absolute inset-0 hidden rounded-lg bg-black/10 group-hover:block"),
				"data-streamdown": "image-overlay"
			}),
			m && (0, import_jsx_runtime.jsx)("button", {
				className: d("absolute right-2 bottom-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-background/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-background", "opacity-0 group-hover:opacity-100"),
				onClick: M,
				title: h.downloadImage,
				type: "button",
				children: (0, import_jsx_runtime.jsx)(c, { size: 14 })
			})
		]
	}) : null;
};
var Me = (e) => {
	let t = typeof e == "function" ? e() : e;
	return t != null ? t : document.body;
};
var $e = 0;
var Se = () => {
	$e += 1, $e === 1 && (document.body.style.overflow = "hidden");
};
var Ne = () => {
	$e = Math.max(0, $e - 1), $e === 0 && (document.body.style.overflow = "");
};
var Qn = ({ url: e, isOpen: t, onClose: n, onConfirm: o }) => {
	let { CheckIcon: r, CopyIcon: s, ExternalLinkIcon: a, XIcon: i } = V(), l = w(), [c, d] = (0, import_react.useState)(false), p = F(), { portal: b } = (0, import_react.useContext)(R), f = (0, import_react.useCallback)(async () => {
		try {
			await navigator.clipboard.writeText(e), d(!0), setTimeout(() => d(!1), 2e3);
		} catch (h) {}
	}, [e]), u = (0, import_react.useCallback)(() => {
		o(), n();
	}, [o, n]);
	if ((0, import_react.useEffect)(() => {
		if (t) {
			Se();
			let h = (y) => {
				y.key === "Escape" && n();
			};
			return document.addEventListener("keydown", h), () => {
				document.removeEventListener("keydown", h), Ne();
			};
		}
	}, [t, n]), !t || typeof document == "undefined") return null;
	let g = (0, import_jsx_runtime.jsx)("div", {
		className: l("fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm"),
		"data-streamdown": "link-safety-modal",
		onClick: n,
		onKeyDown: (h) => {
			h.key === "Escape" && n();
		},
		role: "button",
		tabIndex: 0,
		children: (0, import_jsx_runtime.jsxs)("div", {
			className: l("relative mx-4 flex w-full max-w-md flex-col gap-4 rounded-xl border bg-background p-6 shadow-lg"),
			onClick: (h) => h.stopPropagation(),
			onKeyDown: (h) => h.stopPropagation(),
			role: "presentation",
			children: [
				(0, import_jsx_runtime.jsx)("button", {
					className: l("absolute top-4 right-4 rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"),
					onClick: n,
					title: p.close,
					type: "button",
					children: (0, import_jsx_runtime.jsx)(i, { size: 16 })
				}),
				(0, import_jsx_runtime.jsxs)("div", {
					className: l("flex flex-col gap-2"),
					children: [(0, import_jsx_runtime.jsxs)("div", {
						className: l("flex items-center gap-2 font-semibold text-lg"),
						children: [(0, import_jsx_runtime.jsx)(a, { size: 20 }), (0, import_jsx_runtime.jsx)("span", { children: p.openExternalLink })]
					}), (0, import_jsx_runtime.jsx)("p", {
						className: l("text-muted-foreground text-sm"),
						children: p.externalLinkWarning
					})]
				}),
				(0, import_jsx_runtime.jsx)("div", {
					className: l("break-all rounded-md bg-muted p-3 font-mono text-sm", e.length > 100 && "max-h-32 overflow-y-auto"),
					children: e
				}),
				(0, import_jsx_runtime.jsxs)("div", {
					className: l("flex gap-2"),
					children: [(0, import_jsx_runtime.jsx)("button", {
						className: l("flex flex-1 items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 font-medium text-sm transition-all hover:bg-muted"),
						onClick: f,
						type: "button",
						children: c ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)(r, { size: 14 }), (0, import_jsx_runtime.jsx)("span", { children: p.copied })] }) : (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)(s, { size: 14 }), (0, import_jsx_runtime.jsx)("span", { children: p.copyLink })] })
					}), (0, import_jsx_runtime.jsxs)("button", {
						className: l("flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-all hover:bg-primary/90"),
						onClick: u,
						type: "button",
						children: [(0, import_jsx_runtime.jsx)(a, { size: 14 }), (0, import_jsx_runtime.jsx)("span", { children: p.openLink })]
					})]
				})
			]
		})
	});
	return (0, import_react_dom.createPortal)(g, Me(b));
};
var dt = (0, import_react.createContext)(null);
var jt = () => (0, import_react.useContext)(dt);
var Wc = () => {
	var t;
	let e = jt();
	return (t = e == null ? void 0 : e.code) != null ? t : null;
};
var Re = () => {
	var t;
	let e = jt();
	return (t = e == null ? void 0 : e.mermaid) != null ? t : null;
};
var eo = (e) => {
	var n;
	let t = jt();
	return t != null && t.renderers && e && (n = t.renderers.find((o) => Array.isArray(o.language) ? o.language.includes(e) : o.language === e)) != null ? n : null;
};
var oo = /<svg\b[^>]*>/i;
var Qs = /\bviewBox=(['"])(.*?)\1/i;
var ea = /[\s,]+/;
var ta = /\swidth=(['"]).*?\1/gi;
var na = /\sheight=(['"]).*?\1/gi;
var to = /\sstyle=(['"])(.*?)\1/i;
var oa = /^width\s*:/i;
var ra = /^height\s*:/i;
var sa = /^max-width\s*:/i;
var no = /^<svg/i;
var _t = (e) => {
	let t = e.match(oo);
	if (!t) return null;
	let o = t[0].match(Qs), r = o == null ? void 0 : o[2];
	if (!r) return null;
	let s = r.trim().split(ea).map((l) => Number.parseFloat(l));
	if (s.length < 4 || s.slice(0, 4).some(Number.isNaN)) return null;
	let a = s[2], i = s[3];
	return a > 0 && i > 0 ? {
		height: i,
		width: a
	} : null;
};
var ro = (e) => {
	let t = e.match(oo);
	if (!t) return e;
	try {
		let n = t[0], o = _t(e);
		if (!o) return e;
		let { width: r, height: s } = o, a = n.replace(ta, "").replace(na, ""), i = a.match(to), l = `width:${r}px;height:${s}px;max-width:none;`;
		if (i) {
			let c = i[1], p = i[2].split(";").map((f) => f.trim()).filter(Boolean).filter((f) => !(oa.test(f) || ra.test(f) || sa.test(f))).join(";"), b = `${l}${p ? `${p};` : ""}`;
			a = a.replace(to, ` style=${c}${b}${c}`);
		} else a = a.replace(no, `<svg style="${l}"`);
		return a = a.replace(no, `<svg width="${r}" height="${s}"`), e.replace(n, a);
	} catch (n) {
		return e;
	}
};
var so = (e) => {
	if (typeof DOMParser == "undefined" || typeof XMLSerializer == "undefined") return e;
	let n = new DOMParser().parseFromString(e, "text/html").querySelector("svg");
	return n ? new XMLSerializer().serializeToString(n) : e;
};
var ao = (e, t) => {
	var o;
	let n = (o = void 0) != null ? o : 5;
	return new Promise((r, s) => {
		let a = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(e))), i = new Image();
		i.crossOrigin = "anonymous", i.onload = () => {
			let l = document.createElement("canvas"), c = i.width * n, d = i.height * n;
			l.width = c, l.height = d;
			let p = l.getContext("2d");
			if (!p) {
				s(/* @__PURE__ */ new Error("Failed to create 2D canvas context for PNG export"));
				return;
			}
			p.drawImage(i, 0, 0, c, d), l.toBlob((b) => {
				if (!b) {
					s(/* @__PURE__ */ new Error("Failed to create PNG blob"));
					return;
				}
				r(b);
			}, "image/png");
		}, i.onerror = () => s(/* @__PURE__ */ new Error("Failed to load SVG image")), i.src = a;
	});
};
var mt = ({ chart: e, children: t, className: n, onDownload: o, config: r, onError: s }) => {
	let a = w(), [i, l] = (0, import_react.useState)(false), c = (0, import_react.useRef)(null), { isAnimating: d, controls: p } = (0, import_react.useContext)(R), b = V(), f = Re(), u = F(), g = ye(p, "mermaid", "diagram"), h = async (y) => {
		try {
			if (y === "mmd") {
				re(`${g}.mmd`, e, "text/plain"), l(!1), o?.(y);
				return;
			}
			if (!f) {
				s?.(/* @__PURE__ */ new Error("Mermaid plugin not available"));
				return;
			}
			let x = f.getMermaid(r), m = e.split("").reduce((M, S) => (M << 5) - M + S.charCodeAt(0) | 0, 0), C = `mermaid-${Math.abs(m)}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, { svg: E } = await x.render(C, e);
			if (!E) {
				s?.(/* @__PURE__ */ new Error("SVG not found. Please wait for the diagram to render."));
				return;
			}
			let P = so(E);
			if (y === "svg") {
				re(`${g}.svg`, P, "image/svg+xml"), l(!1), o?.(y);
				return;
			}
			if (y === "png") {
				let M = await ao(P);
				re(`${g}.png`, M, "image/png"), o?.(y), l(!1);
				return;
			}
		} catch (x) {
			s?.(x);
		}
	};
	return (0, import_react.useEffect)(() => {
		let y = (x) => {
			let m = x.composedPath();
			c.current && !m.includes(c.current) && l(false);
		};
		return document.addEventListener("mousedown", y), () => {
			document.removeEventListener("mousedown", y);
		};
	}, []), (0, import_jsx_runtime.jsxs)("div", {
		className: a("relative"),
		ref: c,
		children: [(0, import_jsx_runtime.jsx)("button", {
			"aria-label": u.downloadDiagram,
			className: a("cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", n),
			disabled: d,
			onClick: () => l(!i),
			title: u.downloadDiagram,
			type: "button",
			children: t != null ? t : (0, import_jsx_runtime.jsx)(b.DownloadIcon, {
				"aria-hidden": "true",
				size: 14
			})
		}), i ? (0, import_jsx_runtime.jsxs)("div", {
			className: a("absolute top-full right-0 z-10 mt-1 min-w-[120px] overflow-hidden rounded-md border border-border bg-background shadow-lg"),
			children: [
				(0, import_jsx_runtime.jsx)("button", {
					"aria-label": u.downloadDiagramAsSvg,
					className: a("w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"),
					onClick: () => h("svg"),
					title: u.downloadDiagramAsSvg,
					type: "button",
					children: u.mermaidFormatSvg
				}),
				(0, import_jsx_runtime.jsx)("button", {
					"aria-label": u.downloadDiagramAsPng,
					className: a("w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"),
					onClick: () => h("png"),
					title: u.downloadDiagramAsPng,
					type: "button",
					children: u.mermaidFormatPng
				}),
				(0, import_jsx_runtime.jsx)("button", {
					"aria-label": u.downloadDiagramAsMmd,
					className: a("w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"),
					onClick: () => h("mmd"),
					title: u.downloadDiagramAsMmd,
					type: "button",
					children: u.mermaidFormatMmd
				})
			]
		}) : null]
	});
};
var mo = ({ chart: e, config: t, onFullscreen: n, onExit: o, className: r, ...s }) => {
	let { Maximize2Icon: a, XIcon: i } = V(), l = w(), [c, d] = (0, import_react.useState)(false), { isAnimating: p, controls: b, portal: f } = (0, import_react.useContext)(R), u = F(), g = (() => {
		if (typeof b == "boolean") return b;
		let m = b.mermaid;
		return m === false ? false : m === true || m === void 0 ? true : m.panZoom !== false;
	})(), h = (() => {
		if (typeof b == "boolean") return b;
		let m = b.mermaid;
		return m === false ? false : m === true || m === void 0 ? true : m.download !== false;
	})(), y = (() => {
		if (typeof b == "boolean") return b;
		let m = b.mermaid;
		return m === false ? false : m === true || m === void 0 ? true : m.copy !== false;
	})(), x = () => {
		d(!c);
	};
	return (0, import_react.useEffect)(() => {
		if (c) {
			Se();
			let m = (C) => {
				C.key === "Escape" && d(false);
			};
			return document.addEventListener("keydown", m), () => {
				document.removeEventListener("keydown", m), Ne();
			};
		}
	}, [c]), (0, import_react.useEffect)(() => {
		c ? n?.() : o && o();
	}, [
		c,
		n,
		o
	]), (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("button", {
		className: l("cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", r),
		disabled: p,
		onClick: x,
		title: u.viewFullscreen,
		type: "button",
		...s,
		"aria-label": u.viewFullscreen,
		children: (0, import_jsx_runtime.jsx)(a, {
			"aria-hidden": "true",
			size: 14
		})
	}), c ? (0, import_react_dom.createPortal)((0, import_jsx_runtime.jsxs)("div", {
		"aria-label": u.viewFullscreen,
		"aria-modal": "true",
		className: l("fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"),
		"data-streamdown": "mermaid-fullscreen",
		onClick: x,
		onKeyDown: (m) => {
			m.key === "Escape" && x();
		},
		role: "dialog",
		children: [(0, import_jsx_runtime.jsxs)("div", {
			className: l("absolute top-4 right-4 z-10 flex items-center gap-1"),
			onClick: (m) => m.stopPropagation(),
			onKeyDown: (m) => m.stopPropagation(),
			role: "presentation",
			children: [
				h ? (0, import_jsx_runtime.jsx)(mt, {
					chart: e,
					config: t
				}) : null,
				y ? (0, import_jsx_runtime.jsx)(Ee, { code: e }) : null,
				(0, import_jsx_runtime.jsx)("button", {
					"aria-label": u.exitFullscreen,
					className: l("rounded-md p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"),
					onClick: x,
					title: u.exitFullscreen,
					type: "button",
					children: (0, import_jsx_runtime.jsx)(i, {
						"aria-hidden": "true",
						size: 20
					})
				})
			]
		}), (0, import_jsx_runtime.jsx)("div", {
			className: l("flex size-full items-center justify-center p-4"),
			onClick: (m) => m.stopPropagation(),
			onKeyDown: (m) => m.stopPropagation(),
			role: "presentation",
			children: (0, import_jsx_runtime.jsx)(co, {
				chart: e,
				className: l("size-full [&_svg]:h-auto [&_svg]:w-auto"),
				config: t,
				fullscreen: true,
				showControls: g
			})
		})]
	}), Me(f)) : null] });
};
function $t(e) {
	var n;
	if (e.nodeType === Node.TEXT_NODE) return (n = e.textContent) != null ? n : "";
	if (e.nodeType !== Node.ELEMENT_NODE) return "";
	let t = e;
	return t.tagName === "BR" ? `
` : Array.from(t.childNodes).map($t).join("");
}
var Ie = (e) => {
	let t = [], n = [], o = e.querySelectorAll("thead th");
	for (let s of o) t.push($t(s).trim());
	let r = e.querySelectorAll("tbody tr");
	for (let s of r) {
		let a = [], i = s.querySelectorAll("td");
		for (let l of i) a.push($t(l).trim());
		n.push(a);
	}
	return {
		headers: t,
		rows: n
	};
};
var qe = (e) => {
	var n;
	if (typeof e != "object") return ",";
	let t = e.table;
	return typeof t != "object" ? "," : (n = t.csvSeparator) != null ? n : ",";
};
var ke = (e, t = ",") => {
	let n;
	t === "auto" ? Intl.NumberFormat().format(1.1).includes(",") ? n = ";" : n = "," : n = t;
	let { headers: o, rows: r } = e, s = (c) => {
		let d = false;
		for (let p of c) if (p === n || p === "\"" || p === `
` || p === "\r") {
			d = true;
			break;
		}
		return d ? `"${c.replace(/"/g, "\"\"")}"` : c;
	}, a = o.length > 0 ? r.length + 1 : r.length, i = new Array(a), l = 0;
	o.length > 0 && (i[l] = o.map(s).join(n), l += 1);
	for (let c of r) i[l] = c.map(s).join(n), l += 1;
	return i.join(`
`);
};
var Wt = (e) => {
	let { headers: t, rows: n } = e, o = (i) => {
		let l = false;
		for (let d of i) if (d === "	" || d === `
` || d === "\r") {
			l = true;
			break;
		}
		if (!l) return i;
		let c = [];
		for (let d of i) d === "	" ? c.push("\\t") : d === `
` ? c.push("\\n") : d === "\r" ? c.push("\\r") : c.push(d);
		return c.join("");
	}, r = t.length > 0 ? n.length + 1 : n.length, s = new Array(r), a = 0;
	t.length > 0 && (s[a] = t.map(o).join("	"), a += 1);
	for (let i of n) s[a] = i.map(o).join("	"), a += 1;
	return s.join(`
`);
};
var ut = (e) => {
	let t = false;
	for (let o of e) if (o === "\\" || o === "|" || o === `
` || o === "&" || o === "<" || o === ">") {
		t = true;
		break;
	}
	if (!t) return e;
	let n = [];
	for (let o of e) o === "\\" ? n.push("\\\\") : o === "|" ? n.push("\\|") : o === `
` ? n.push("<br>") : o === "&" ? n.push("&amp;") : o === "<" ? n.push("&lt;") : o === ">" ? n.push("&gt;") : n.push(o);
	return n.join("");
};
var Le = (e) => {
	let { headers: t, rows: n } = e;
	if (t.length === 0) return "";
	let o = new Array(n.length + 2), r = 0, s = t.map((i) => ut(i));
	o[r] = `| ${s.join(" | ")} |`, r += 1;
	let a = new Array(t.length);
	for (let i = 0; i < t.length; i += 1) a[i] = "---";
	o[r] = `| ${a.join(" | ")} |`, r += 1;
	for (let i of n) if (i.length < t.length) {
		let l = new Array(t.length);
		for (let c = 0; c < t.length; c += 1) l[c] = c < i.length ? ut(i[c]) : "";
		o[r] = `| ${l.join(" | ")} |`, r += 1;
	} else {
		let l = i.map((c) => ut(c));
		o[r] = `| ${l.join(" | ")} |`, r += 1;
	}
	return o.join(`
`);
};
var Ze = ({ children: e, className: t, onCopy: n, onError: o, timeout: r = 2e3 }) => {
	let s = w(), [a, i] = (0, import_react.useState)(false), [l, c] = (0, import_react.useState)(false), d = (0, import_react.useRef)(null), p = (0, import_react.useRef)(0), { isAnimating: b, controls: f } = (0, import_react.useContext)(R), u = F(), g = qe(f), h = async (m) => {
		var C, E;
		if (typeof window == "undefined" || !((C = navigator == null ? void 0 : navigator.clipboard) != null && C.write)) {
			o?.(/* @__PURE__ */ new Error("Clipboard API not available"));
			return;
		}
		try {
			let P = (E = d.current) == null ? void 0 : E.closest("[data-streamdown=\"table-wrapper\"]"), M = P == null ? void 0 : P.querySelector("table");
			if (!M) {
				o?.(/* @__PURE__ */ new Error("Table not found"));
				return;
			}
			let S = Ie(M), N = "";
			m === "csv" ? N = ke(S, g) : m === "tsv" ? N = Wt(S) : N = Le(S);
			let I = new ClipboardItem({
				"text/plain": new Blob([N], { type: "text/plain" }),
				"text/html": new Blob([M.outerHTML], { type: "text/html" })
			});
			await navigator.clipboard.write([I]), c(!0), i(!1), n?.(m), p.current = window.setTimeout(() => c(!1), r);
		} catch (P) {
			o?.(P);
		}
	};
	(0, import_react.useEffect)(() => {
		let m = (C) => {
			let E = C.composedPath();
			d.current && !E.includes(d.current) && i(false);
		};
		return document.addEventListener("mousedown", m), () => {
			document.removeEventListener("mousedown", m), window.clearTimeout(p.current);
		};
	}, []);
	let y = V(), x = l ? y.CheckIcon : y.CopyIcon;
	return (0, import_jsx_runtime.jsxs)("div", {
		className: s("relative"),
		ref: d,
		children: [(0, import_jsx_runtime.jsx)("button", {
			className: s("cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", t),
			disabled: b,
			onClick: () => i(!a),
			title: u.copyTable,
			type: "button",
			children: e != null ? e : (0, import_jsx_runtime.jsx)(x, {
				height: 14,
				width: 14
			})
		}), a ? (0, import_jsx_runtime.jsxs)("div", {
			className: s("absolute top-full right-0 z-20 mt-1 min-w-[120px] overflow-hidden rounded-md border border-border bg-background shadow-lg"),
			children: [
				(0, import_jsx_runtime.jsx)("button", {
					className: s("w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"),
					onClick: () => h("md"),
					title: u.copyTableAsMarkdown,
					type: "button",
					children: u.tableFormatMarkdown
				}),
				(0, import_jsx_runtime.jsx)("button", {
					className: s("w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"),
					onClick: () => h("csv"),
					title: u.copyTableAsCsv,
					type: "button",
					children: u.tableFormatCsv
				}),
				(0, import_jsx_runtime.jsx)("button", {
					className: s("w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"),
					onClick: () => h("tsv"),
					title: u.copyTableAsTsv,
					type: "button",
					children: u.tableFormatTsv
				})
			]
		}) : null]
	});
};
var Ge = ({ children: e, className: t, onDownload: n, onError: o }) => {
	let r = w(), [s, a] = (0, import_react.useState)(false), i = (0, import_react.useRef)(null), { isAnimating: l, controls: c } = (0, import_react.useContext)(R), d = F(), p = V(), b = qe(c), f = (u) => {
		var g;
		try {
			let h = (g = i.current) == null ? void 0 : g.closest("[data-streamdown=\"table-wrapper\"]"), y = h == null ? void 0 : h.querySelector("table");
			if (!y) {
				o?.(/* @__PURE__ */ new Error("Table not found"));
				return;
			}
			let x = Ie(y), m = u === "csv" ? ke(x, b) : Le(x), C = u === "csv" ? "csv" : "md";
			re(`${ye(c, "table", "table")}.${C}`, m, u === "csv" ? "text/csv" : "text/markdown"), a(!1), n?.(u);
		} catch (h) {
			o?.(h);
		}
	};
	return (0, import_react.useEffect)(() => {
		let u = (g) => {
			let h = g.composedPath();
			i.current && !h.includes(i.current) && a(false);
		};
		return document.addEventListener("mousedown", u), () => {
			document.removeEventListener("mousedown", u);
		};
	}, []), (0, import_jsx_runtime.jsxs)("div", {
		className: r("relative"),
		ref: i,
		children: [(0, import_jsx_runtime.jsx)("button", {
			className: r("cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", t),
			disabled: l,
			onClick: () => a(!s),
			title: d.downloadTable,
			type: "button",
			children: e != null ? e : (0, import_jsx_runtime.jsx)(p.DownloadIcon, { size: 14 })
		}), s ? (0, import_jsx_runtime.jsxs)("div", {
			className: r("absolute top-full right-0 z-20 mt-1 min-w-[120px] overflow-hidden rounded-md border border-border bg-background shadow-lg"),
			children: [(0, import_jsx_runtime.jsx)("button", {
				className: r("w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"),
				onClick: () => f("csv"),
				title: d.downloadTableAsCsv,
				type: "button",
				children: d.tableFormatCsv
			}), (0, import_jsx_runtime.jsx)("button", {
				className: r("w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"),
				onClick: () => f("markdown"),
				title: d.downloadTableAsMarkdown,
				type: "button",
				children: d.tableFormatMarkdown
			})]
		}) : null]
	});
};
var ho = ({ children: e, className: t, showCopy: n = true, showDownload: o = true }) => {
	let { Maximize2Icon: r, XIcon: s } = V(), a = w(), [i, l] = (0, import_react.useState)(false), { isAnimating: c, portal: d } = (0, import_react.useContext)(R), p = F(), b = () => {
		l(true);
	}, f = () => {
		l(false);
	};
	return (0, import_react.useEffect)(() => {
		if (i) {
			Se();
			let u = (g) => {
				g.key === "Escape" && l(false);
			};
			return document.addEventListener("keydown", u), () => {
				document.removeEventListener("keydown", u), Ne();
			};
		}
	}, [i]), (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("button", {
		className: a("cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50", t),
		disabled: c,
		onClick: b,
		title: p.viewFullscreen,
		type: "button",
		children: (0, import_jsx_runtime.jsx)(r, { size: 14 })
	}), i ? (0, import_react_dom.createPortal)((0, import_jsx_runtime.jsx)("div", {
		"aria-label": p.viewFullscreen,
		"aria-modal": "true",
		className: a("fixed inset-0 z-50 flex flex-col bg-background"),
		"data-streamdown": "table-fullscreen",
		onClick: f,
		onKeyDown: (u) => {
			u.key === "Escape" && f();
		},
		role: "dialog",
		children: (0, import_jsx_runtime.jsxs)("div", {
			className: a("flex h-full flex-col"),
			"data-streamdown": "table-wrapper",
			onClick: (u) => u.stopPropagation(),
			onKeyDown: (u) => u.stopPropagation(),
			role: "presentation",
			children: [(0, import_jsx_runtime.jsxs)("div", {
				className: a("flex items-center justify-end gap-1 p-4"),
				children: [
					n ? (0, import_jsx_runtime.jsx)(Ze, {}) : null,
					o ? (0, import_jsx_runtime.jsx)(Ge, {}) : null,
					(0, import_jsx_runtime.jsx)("button", {
						className: a("rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"),
						onClick: f,
						title: p.exitFullscreen,
						type: "button",
						children: (0, import_jsx_runtime.jsx)(s, { size: 20 })
					})
				]
			}), (0, import_jsx_runtime.jsx)("div", {
				className: a("flex-1 overflow-auto p-4 pt-0 [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"),
				children: (0, import_jsx_runtime.jsx)("table", {
					className: a("w-full border-collapse border border-border"),
					"data-streamdown": "table",
					children: e
				})
			})]
		})
	}), Me(d)) : null] });
};
var Co = ({ children: e, className: t, maxHeight: n, showControls: o, showCopy: r = true, showDownload: s = true, showFullscreen: a = true, ...i }) => {
	let l = w(), { isAnimating: c } = (0, import_react.useContext)(R), d = rt(n), p = st(c, !!d, e), b = o && r, f = o && s, u = o && a, g = b || f || u;
	return (0, import_jsx_runtime.jsxs)("div", {
		className: l("my-4 flex flex-col gap-2 rounded-lg border border-border bg-sidebar p-2"),
		"data-streamdown": "table-wrapper",
		children: [g ? (0, import_jsx_runtime.jsxs)("div", {
			className: l("flex items-center justify-end gap-1"),
			children: [
				b ? (0, import_jsx_runtime.jsx)(Ze, {}) : null,
				f ? (0, import_jsx_runtime.jsx)(Ge, {}) : null,
				u ? (0, import_jsx_runtime.jsx)(ho, {
					showCopy: b,
					showDownload: f,
					children: e
				}) : null
			]
		}) : null, (0, import_jsx_runtime.jsx)("div", {
			className: l("border-collapse overflow-x-auto overflow-y-auto rounded-md border border-border bg-background"),
			ref: p,
			style: d ? { maxHeight: d } : void 0,
			children: (0, import_jsx_runtime.jsx)("table", {
				className: l("w-full divide-y divide-border", t),
				"data-streamdown": "table",
				...i,
				children: e
			})
		})]
	});
};
var Na = /startLine=(\d+)/;
var Ra = /\bnoLineNumbers\b/;
var Ia = (0, import_react.lazy)(() => Promise.resolve().then(() => mermaid_WFAXDIZX_exports).then((e) => ({ default: e.Mermaid })));
var La = /language-([^\s]+)/;
var Da = "node";
function H(e, t) {
	let n = Object.keys(e);
	if (n.length !== Object.keys(t).length) return false;
	let o = e, r = t;
	for (let s of n) if (s !== Da && !Object.is(o[s], r[s])) return false;
	return true;
}
function Aa(e, t) {
	var n, o;
	return ((n = e == null ? void 0 : e.properties) == null ? void 0 : n.metastring) === ((o = t == null ? void 0 : t.properties) == null ? void 0 : o.metastring);
}
var gt = (e, t) => typeof e == "boolean" ? e : e[t] !== false;
var Zt = (e, t) => {
	if (typeof e == "boolean") return e;
	let n = e.table;
	return n === false ? false : n === true || n === void 0 ? true : n[t] !== false;
};
var ko = (e, t) => {
	if (typeof e == "boolean") return e;
	let n = e.code;
	return n === false ? false : n === true || n === void 0 ? true : n[t] !== false;
};
var pt = (e, t) => {
	if (typeof e == "boolean") return e;
	let n = e.mermaid;
	return n === false ? false : n === true || n === void 0 ? true : n[t] !== false;
};
var Ha = (e, t) => {
	if (typeof e == "boolean") return e;
	let n = e.image;
	return n === false ? false : n === true || n === void 0 ? true : n[t] !== false;
};
var Gt = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("ol", {
		className: r("list-inside list-decimal whitespace-normal [li_&]:pl-6", t),
		"data-streamdown": "ordered-list",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Gt.displayName = "MarkdownOl";
var xo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	var i;
	let r = w(), s = Array.isArray(e) ? e.filter((l) => l !== `
` && l !== "") : [e], a = s.length === 1 && (0, import_react.isValidElement)(s[0]) && (s[0].type === Kt || ((i = s[0].props.node) == null ? void 0 : i.tagname) === "p") ? s[0].props.children : e;
	return (0, import_jsx_runtime.jsx)("li", {
		className: r("py-1 [&>p]:inline", t),
		"data-streamdown": "list-item",
		...o,
		children: a
	});
}, (e, t) => H(e, t));
xo.displayName = "MarkdownLi";
var vo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("ul", {
		className: r("list-inside list-disc whitespace-normal [li_&]:pl-6", t),
		"data-streamdown": "unordered-list",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
vo.displayName = "MarkdownUl";
var To = (0, import_react.memo)(({ className: e, node: t, ...n }) => {
	let o = w();
	return (0, import_jsx_runtime.jsx)("hr", {
		className: o("my-6 border-border", e),
		"data-streamdown": "horizontal-rule",
		...n
	});
}, (e, t) => H(e, t));
To.displayName = "MarkdownHr";
var Po = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("span", {
		className: r("font-semibold", t),
		"data-streamdown": "strong",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Po.displayName = "MarkdownStrong";
var Ba = ({ children: e, className: t, href: n, node: o, ...r }) => {
	let s = w(), { linkSafety: a } = (0, import_react.useContext)(R), [i, l] = (0, import_react.useState)(false), c = n === "streamdown:incomplete-link", d = (0, import_react.useCallback)(async (u) => {
		if (!(!(a != null && a.enabled && n) || c)) {
			if (u.preventDefault(), a.onLinkCheck && await a.onLinkCheck(n)) {
				window.open(n, "_blank", "noreferrer");
				return;
			}
			l(true);
		}
	}, [
		a,
		n,
		c
	]), p = (0, import_react.useCallback)(() => {
		n && window.open(n, "_blank", "noreferrer");
	}, [n]), b = (0, import_react.useCallback)(() => {
		l(false);
	}, []), f = {
		url: n != null ? n : "",
		isOpen: i,
		onClose: b,
		onConfirm: p
	};
	return a != null && a.enabled && n ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [(0, import_jsx_runtime.jsx)("button", {
		className: s("wrap-anywhere appearance-none text-left font-medium text-primary underline", t),
		"data-incomplete": c,
		"data-streamdown": "link",
		onClick: d,
		type: "button",
		children: e
	}), a.renderModal ? a.renderModal(f) : (0, import_jsx_runtime.jsx)(Qn, { ...f })] }) : (0, import_jsx_runtime.jsx)("a", {
		className: s("wrap-anywhere font-medium text-primary underline", t),
		"data-incomplete": c,
		"data-streamdown": "link",
		href: n,
		rel: "noreferrer",
		target: "_blank",
		...r,
		children: e
	});
};
var Eo = (0, import_react.memo)(Ba, (e, t) => H(e, t));
Eo.displayName = "MarkdownA";
var Mo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("h1", {
		className: r("mt-6 mb-2 font-semibold text-3xl", t),
		"data-streamdown": "heading-1",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Mo.displayName = "MarkdownH1";
var So = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("h2", {
		className: r("mt-6 mb-2 font-semibold text-2xl", t),
		"data-streamdown": "heading-2",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
So.displayName = "MarkdownH2";
var No = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("h3", {
		className: r("mt-6 mb-2 font-semibold text-xl", t),
		"data-streamdown": "heading-3",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
No.displayName = "MarkdownH3";
var Ro = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("h4", {
		className: r("mt-6 mb-2 font-semibold text-lg", t),
		"data-streamdown": "heading-4",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Ro.displayName = "MarkdownH4";
var Io = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("h5", {
		className: r("mt-6 mb-2 font-semibold text-base", t),
		"data-streamdown": "heading-5",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Io.displayName = "MarkdownH5";
var Lo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("h6", {
		className: r("mt-6 mb-2 font-semibold text-sm", t),
		"data-streamdown": "heading-6",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Lo.displayName = "MarkdownH6";
var Do = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let { controls: r, tableMaxHeight: s } = (0, import_react.useContext)(R), a = gt(r, "table"), i = Zt(r, "copy"), l = Zt(r, "download"), c = Zt(r, "fullscreen");
	return (0, import_jsx_runtime.jsx)(Co, {
		className: t,
		maxHeight: s,
		showControls: a,
		showCopy: i,
		showDownload: l,
		showFullscreen: c,
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Do.displayName = "MarkdownTable";
var Ao = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("thead", {
		className: r("bg-muted/80", t),
		"data-streamdown": "table-header",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Ao.displayName = "MarkdownThead";
var Ho = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("tbody", {
		className: r("divide-y divide-border", t),
		"data-streamdown": "table-body",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Ho.displayName = "MarkdownTbody";
var Bo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("tr", {
		className: r("border-border", t),
		"data-streamdown": "table-row",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Bo.displayName = "MarkdownTr";
var Oo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("th", {
		className: r("whitespace-nowrap px-4 py-2 text-left font-semibold text-sm", t),
		"data-streamdown": "table-header-cell",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Oo.displayName = "MarkdownTh";
var Vo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("td", {
		className: r("px-4 py-2 text-sm", t),
		"data-streamdown": "table-cell",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Vo.displayName = "MarkdownTd";
var Fo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("blockquote", {
		className: r("my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic", t),
		"data-streamdown": "blockquote",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
Fo.displayName = "MarkdownBlockquote";
var jo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("sup", {
		className: r("text-sm", t),
		"data-streamdown": "superscript",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
jo.displayName = "MarkdownSup";
var _o = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	let r = w();
	return (0, import_jsx_runtime.jsx)("sub", {
		className: r("text-sm", t),
		"data-streamdown": "subscript",
		...o,
		children: e
	});
}, (e, t) => H(e, t));
_o.displayName = "MarkdownSub";
var zo = (0, import_react.memo)(({ children: e, className: t, node: n, ...o }) => {
	if ("data-footnotes" in o) {
		let s = (l) => {
			var b, f;
			if (!(0, import_react.isValidElement)(l)) return false;
			let c = Array.isArray(l.props.children) ? l.props.children : [l.props.children], d = false, p = false;
			for (let u of c) if (u) {
				if (typeof u == "string") u.trim() !== "" && (d = true);
				else if ((0, import_react.isValidElement)(u)) if (((b = u.props) == null ? void 0 : b["data-footnote-backref"]) !== void 0) p = true;
				else {
					let g = Array.isArray(u.props.children) ? u.props.children : [u.props.children];
					for (let h of g) {
						if (typeof h == "string" && h.trim() !== "") {
							d = true;
							break;
						}
						if ((0, import_react.isValidElement)(h) && ((f = h.props) == null ? void 0 : f["data-footnote-backref"]) === void 0) {
							d = true;
							break;
						}
					}
				}
			}
			return p && !d;
		}, a = Array.isArray(e) ? e.map((l) => {
			if (!(0, import_react.isValidElement)(l)) return l;
			if (l.type === Gt) {
				let d = (Array.isArray(l.props.children) ? l.props.children : [l.props.children]).filter((p) => !s(p));
				return d.length === 0 ? null : {
					...l,
					props: {
						...l.props,
						children: d
					}
				};
			}
			return l;
		}) : e;
		return (Array.isArray(a) ? a.some((l) => l !== null) : a !== null) ? (0, import_jsx_runtime.jsx)("section", {
			className: t,
			...o,
			children: a
		}) : null;
	}
	return (0, import_jsx_runtime.jsx)("section", {
		className: t,
		...o,
		children: e
	});
}, (e, t) => H(e, t));
zo.displayName = "MarkdownSection";
var Oa = ({ node: e, className: t, children: n, ...o }) => {
	var I, z;
	let r = w(), s = !("data-block" in o), { mermaid: a, controls: i, lineNumbers: l } = (0, import_react.useContext)(R), c = Re(), d = je(), p = t == null ? void 0 : t.match(La), b = (I = p == null ? void 0 : p.at(1)) != null ? I : "", f = eo(b);
	if (s) return (0, import_jsx_runtime.jsx)("code", {
		className: r("rounded bg-muted px-1.5 py-0.5 font-mono text-sm", t),
		"data-streamdown": "inline-code",
		...o,
		children: n
	});
	let u = (z = e == null ? void 0 : e.properties) == null ? void 0 : z.metastring, g = u == null ? void 0 : u.match(Na), h = g ? Number.parseInt(g[1], 10) : void 0, y = h !== void 0 && h >= 1 ? h : void 0, m = !(u ? Ra.test(u) : false) && l !== false, C = "";
	if ((0, import_react.isValidElement)(n) && n.props && typeof n.props == "object" && "children" in n.props && typeof n.props.children == "string" ? C = n.props.children : typeof n == "string" && (C = n), f) {
		let $ = f.component;
		return (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: (0, import_jsx_runtime.jsx)(ct, {}),
			children: (0, import_jsx_runtime.jsx)($, {
				code: C,
				isIncomplete: d,
				language: b,
				meta: u
			})
		});
	}
	if (b === "mermaid" && c) {
		let $ = gt(i, "mermaid"), j = pt(i, "download"), ne = pt(i, "copy"), Z = pt(i, "fullscreen"), D = pt(i, "panZoom"), _ = $ && (j || ne || Z);
		return (0, import_jsx_runtime.jsx)(import_react.Suspense, {
			fallback: (0, import_jsx_runtime.jsx)(ct, {}),
			children: (0, import_jsx_runtime.jsxs)("div", {
				className: r("group relative my-4 flex w-full flex-col gap-2 rounded-xl border border-border bg-sidebar p-2", t),
				"data-streamdown": "mermaid-block",
				children: [
					(0, import_jsx_runtime.jsx)("div", {
						className: r("flex h-8 items-center text-muted-foreground text-xs"),
						children: (0, import_jsx_runtime.jsx)("span", {
							className: r("ml-1 font-mono lowercase"),
							children: "mermaid"
						})
					}),
					_ ? (0, import_jsx_runtime.jsx)("div", {
						className: r("pointer-events-none absolute top-2 right-2 z-10 flex items-center"),
						children: (0, import_jsx_runtime.jsxs)("div", {
							className: r("pointer-events-auto flex shrink-0 items-center gap-2 rounded-md border border-sidebar bg-sidebar/80 px-1.5 py-1 supports-[backdrop-filter]:bg-sidebar/70 supports-[backdrop-filter]:backdrop-blur"),
							"data-streamdown": "mermaid-block-actions",
							children: [
								j ? (0, import_jsx_runtime.jsx)(mt, {
									chart: C,
									config: a == null ? void 0 : a.config
								}) : null,
								ne ? (0, import_jsx_runtime.jsx)(Ee, {
									code: C,
									...Ot(i, "mermaid")
								}) : null,
								Z ? (0, import_jsx_runtime.jsx)(mo, {
									chart: C,
									config: a == null ? void 0 : a.config
								}) : null
							]
						})
					}) : null,
					(0, import_jsx_runtime.jsx)("div", {
						className: r("overflow-hidden rounded-md border border-border bg-background"),
						children: (0, import_jsx_runtime.jsx)(Ia, {
							chart: C,
							config: a == null ? void 0 : a.config,
							showControls: D
						})
					})
				]
			})
		});
	}
	let E = gt(i, "code"), P = ko(i, "download"), M = ko(i, "copy"), { "data-block": S, ...N } = o;
	return (0, import_jsx_runtime.jsx)(At, {
		className: t,
		code: C,
		isIncomplete: d,
		language: b,
		lineNumbers: m,
		startLine: y,
		...N,
		children: E ? (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [P ? (0, import_jsx_runtime.jsx)(Vt, {
			code: C,
			language: b
		}) : null, M ? (0, import_jsx_runtime.jsx)(Ee, { ...Ot(i, "code") }) : null] }) : null
	});
};
var $o = (0, import_react.memo)(Oa, (e, t) => H(e, t) && Aa(e.node, t.node));
$o.displayName = "MarkdownCode";
var Va = ({ node: e, className: t, ...n }) => {
	let { controls: o } = (0, import_react.useContext)(R), r = gt(o, "image"), s = r && Ha(o, "download");
	return (0, import_jsx_runtime.jsx)(Jn, {
		className: t,
		node: e,
		showControls: r,
		showDownloadControl: s,
		...n
	});
};
var Wo = (0, import_react.memo)(Va, (e, t) => H(e, t));
Wo.displayName = "MarkdownImg";
var Kt = (0, import_react.memo)(({ children: e, node: t, ...n }) => {
	let r = (Array.isArray(e) ? e : [e]).filter((s) => s != null && s !== "");
	if (r.length === 1 && (0, import_react.isValidElement)(r[0])) {
		let s = r[0].props.node, a = s == null ? void 0 : s.tagName;
		if (a === "img") return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: e });
		if (a === "code" && "data-block" in r[0].props) return (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: e });
	}
	return (0, import_jsx_runtime.jsx)("p", {
		...n,
		children: e
	});
}, (e, t) => H(e, t));
Kt.displayName = "MarkdownParagraph";
var Jt = {
	ol: Gt,
	li: xo,
	ul: vo,
	hr: To,
	strong: Po,
	a: Eo,
	h1: Mo,
	h2: So,
	h3: No,
	h4: Ro,
	h5: Io,
	h6: Lo,
	table: Do,
	thead: Ao,
	tbody: Ho,
	tr: Bo,
	th: Oo,
	td: Vo,
	blockquote: Fo,
	code: $o,
	img: Wo,
	pre: ({ children: e }) => (0, import_react.isValidElement)(e) ? (0, import_react.cloneElement)(e, { "data-block": "true" }) : e,
	sup: jo,
	sub: _o,
	p: Kt,
	section: zo
};
var Fa = /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
var ja = /\p{L}/u;
function Je(e) {
	let t = e.replace(/(```|~~~)[\s\S]*?\1/g, "").replace(/^#{1,6}\s+/gm, "").replace(/(\*{1,3}|_{1,3})/g, "").replace(/`[^`]*`/g, "").replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/^[\s>*\-+\d.]+/gm, ""), n, o = 0, r = 0;
	for (let s of t) {
		if (Fa.test(s)) {
			n ??= "rtl", r += 1;
			continue;
		}
		ja.test(s) && (n ??= "ltr", o += 1);
	}
	return r > o ? "rtl" : o > r ? "ltr" : n != null ? n : "ltr";
}
var _a = /^[ \t]{0,3}(`{3,}|~{3,})/;
var za = /^\|?[ \t]*:?-{1,}:?[ \t]*(\|[ \t]*:?-{1,}:?[ \t]*)*\|?$/;
var Ut = (e) => {
	let t = e.split(`
`), n = null, o = 0;
	for (let r of t) {
		let s = _a.exec(r);
		if (n === null) {
			if (s) {
				let a = s[1];
				n = a[0], o = a.length;
			}
		} else if (s) {
			let a = s[1], i = a[0], l = a.length;
			i === n && l >= o && (n = null, o = 0);
		}
	}
	return n !== null;
};
var qo = (e) => {
	let t = e.split(`
`);
	for (let n of t) {
		let o = n.trim();
		if (o.length > 0 && o.includes("|") && za.test(o)) return true;
	}
	return false;
};
var Xo = () => (e) => {
	visit(e, "html", (t, n, o) => {
		!o || typeof n != "number" || (o.children[n] = {
			type: "text",
			value: t.value
		});
	});
};
var Go = [];
var Ko = { allowDangerousHtml: true };
var yt = /* @__PURE__ */ new WeakMap();
var Qt = class {
	constructor() {
		this.cache = /* @__PURE__ */ new Map();
		this.keyCache = /* @__PURE__ */ new WeakMap();
		this.maxSize = 100;
	}
	generateCacheKey(t) {
		let n = this.keyCache.get(t);
		if (n) return n;
		let o = t.rehypePlugins, r = t.remarkPlugins, s = t.remarkRehypeOptions;
		if (!(o || r || s)) {
			let p = "default";
			return this.keyCache.set(t, p), p;
		}
		let a = (p) => {
			if (!p || p.length === 0) return "";
			let b = "";
			for (let f = 0; f < p.length; f += 1) {
				let u = p[f];
				if (f > 0 && (b += ","), Array.isArray(u)) {
					let [g, h] = u;
					if (typeof g == "function") {
						let y = yt.get(g);
						y || (y = g.name, yt.set(g, y)), b += y;
					} else b += String(g);
					b += ":", b += JSON.stringify(h);
				} else if (typeof u == "function") {
					let g = yt.get(u);
					g || (g = u.name, yt.set(u, g)), b += g;
				} else b += String(u);
			}
			return b;
		}, i = a(o), d = `${a(r)}::${i}::${s ? JSON.stringify(s) : ""}`;
		return this.keyCache.set(t, d), d;
	}
	get(t) {
		let n = this.generateCacheKey(t), o = this.cache.get(n);
		return o && (this.cache.delete(n), this.cache.set(n, o)), o;
	}
	set(t, n) {
		let o = this.generateCacheKey(t);
		if (this.cache.size >= this.maxSize) {
			let r = this.cache.keys().next().value;
			r && this.cache.delete(r);
		}
		this.cache.set(o, n);
	}
	clear() {
		this.cache.clear();
	}
};
var Jo = new Qt();
var en = (e) => {
	let t = Ya(e), n = e.children || "";
	return ri(t.runSync(t.parse(n), n), e);
};
var Ya = (e) => {
	let t = Jo.get(e);
	if (t) return t;
	let n = ei(e);
	return Jo.set(e, n), n;
};
var Qa = (e) => e.some((t) => Array.isArray(t) ? t[0] === rehypeRaw : t === rehypeRaw);
var ei = (e) => {
	let t = e.rehypePlugins || Go, n = e.remarkPlugins || Go, o = Qa(t) ? n : [...n, Xo], r = e.remarkRehypeOptions ? {
		...Ko,
		...e.remarkRehypeOptions
	} : Ko;
	return unified().use(remarkParse).use(o).use(remarkRehype, r).use(t);
};
var Uo = (e) => e;
var ti = (e, t, n, o) => {
	n ? e.children.splice(t, 1) : e.children[t] = {
		type: "text",
		value: o
	};
};
var ni = (e, t) => {
	var n;
	for (let o in urlAttributes) if (Object.hasOwn(urlAttributes, o) && Object.hasOwn(e.properties, o)) {
		let r = e.properties[o], s = urlAttributes[o];
		(s === null || s.includes(e.tagName)) && (e.properties[o] = (n = t(String(r || ""), o, e)) != null ? n : void 0);
	}
};
var oi = (e, t, n, o, r, s) => {
	let a = false;
	return o ? a = !o.includes(e.tagName) : r && (a = r.includes(e.tagName)), !a && s && typeof t == "number" && (a = !s(e, t, n)), a;
};
var ri = (e, t) => {
	let { allowElement: n, allowedElements: o, disallowedElements: r, skipHtml: s, unwrapDisallowed: a, urlTransform: i } = t;
	if (n || o || r || s || i) {
		let c = i || Uo;
		visit(e, (d, p, b) => {
			if (d.type === "raw" && b && typeof p == "number") return ti(b, p, s, d.value), p;
			if (d.type === "element" && (ni(d, c), oi(d, p, b, o, r, n) && b && typeof p == "number")) return a && d.children ? b.children.splice(p, 1, ...d.children) : b.children.splice(p, 1), p;
		});
	}
	return toJsxRuntime(e, {
		Fragment: import_jsx_runtime.Fragment,
		components: t.components,
		ignoreInvalidStyle: true,
		jsx: import_jsx_runtime.jsx,
		jsxs: import_jsx_runtime.jsxs,
		passKeys: true,
		passNode: true
	});
};
var ai = /\[\^[\w-]{1,200}\](?!:)/;
var ii = /\[\^[\w-]{1,200}\]:/;
var li = /<([A-Za-z][\w:-]*)[\s>/]/;
var ci = /^ {0,3}\[[^\]]+\]:/m;
var di = /* @__PURE__ */ new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
var Yo = /* @__PURE__ */ new Map();
var Qo = /* @__PURE__ */ new Map();
var mi = (e) => {
	let t = e.toLowerCase(), n = Yo.get(t);
	if (n) return n;
	let o = new RegExp(`<${t}(?=[\\s>/])[^>]*>`, "gi");
	return Yo.set(t, o), o;
};
var ui = (e) => {
	let t = e.toLowerCase(), n = Qo.get(t);
	if (n) return n;
	let o = new RegExp(`</${t}(?=[\\s>])[^>]*>`, "gi");
	return Qo.set(t, o), o;
};
var er = (e, t) => {
	if (di.has(t.toLowerCase())) return 0;
	let n = e.match(mi(t));
	if (!n) return 0;
	let o = 0;
	for (let r of n) r.trimEnd().endsWith("/>") || (o += 1);
	return o;
};
var tr = (e, t) => {
	let n = e.match(ui(t));
	return n ? n.length : 0;
};
var pi = (e) => {
	let t = 0;
	for (let n = 0; n < e.length - 1; n += 1) e[n] === "$" && e[n + 1] === "$" && (t += 1, n += 1);
	return t;
};
var fi = /\r\n|\r/g;
var nr = (e) => {
	let t = new T$1({ gfm: true });
	return {
		tokens: t.blockTokens(e),
		hasLinkDefinitions: Object.keys(t.tokens.links).length > 0
	};
};
var xe = null;
var gi = `

`;
var bi = (e) => {
	for (let t = e.length - 3; t >= 0; t -= 1) if (e[t].endsWith(gi)) return t + 1;
	return 0;
};
var or = (e) => ` ${e}`.slice(1);
var rr = (e) => e.map(or);
var sr = (e) => {
	let t = [], n = [], o = false;
	for (let r of e) {
		let s = r.raw, a = t.length;
		if (n.length > 0) {
			t[a - 1] += s;
			let i = n.at(-1), l = er(s, i), c = tr(s, i);
			for (let d = 0; d < l; d += 1) n.push(i);
			for (let d = 0; d < c; d += 1) n.length > 0 && n.at(-1) === i && n.pop();
			continue;
		}
		if (r.type === "html" && r.block) {
			let i = s.match(li);
			if (i) {
				let l = i[1];
				er(s, l) > tr(s, l) && n.push(l);
			}
		}
		if (r.type === "space" && a > 0) {
			t[a - 1] += s;
			continue;
		}
		if (a > 0 && !o) {
			let i = t[a - 1];
			if (pi(i) % 2 === 1) {
				t[a - 1] = i + s;
				continue;
			}
		}
		t.push(s), r.type !== "space" && (o = r.type === "code");
	}
	return t;
};
var hi = (e, t) => {
	if (t.length <= e.input.length || t.slice(0, e.input.length) !== e.input || ci.test(t)) return null;
	let n = bi(e.blocks);
	if (n === 0) return null;
	let o = e.verifiedCount, r = e.verifiedLength;
	if (o > n) {
		o = n, r = 0;
		for (let i = 0; i < o; i += 1) r += e.blocks[i].length;
	}
	for (; o < n && t.startsWith(e.blocks[o], r);) r += e.blocks[o].length, o += 1;
	if (o !== n) return null;
	let s = nr(t.slice(r));
	if (s.hasLinkDefinitions) return null;
	let a = rr(sr(s.tokens));
	return {
		input: t,
		blocks: e.blocks.slice(0, n).concat(a),
		verifiedCount: o,
		verifiedLength: r
	};
};
var tn = (e) => {
	let t = ai.test(e), n = ii.test(e);
	if (t || n) return [e];
	let o = e.includes("\r") ? e.replace(fi, `
`) : e;
	if ((xe == null ? void 0 : xe.input) === o) return xe.blocks;
	let s = xe ? hi(xe, o) : null;
	if (!s) {
		let { tokens: a, hasLinkDefinitions: i } = nr(o);
		s = {
			input: o,
			blocks: i ? [or(o)] : rr(sr(a)),
			verifiedCount: 0,
			verifiedLength: 0
		};
	}
	return xe = s, s.blocks;
};
var yi = /^\n*/;
var Ci = /\n*$/;
var nn = /\n\n/g;
var wi = (e, t, n) => {
	if (!t.includes(`
`)) return e + t + n;
	return `${e}${t.replace(nn, `
<!---->
`).replace(yi, `

`).replace(Ci, `

`)}${n}

`;
};
var ki = (e, t) => {
	let n = new RegExp(`<(${t})(?=[\\s>/])([^>]*)>`, "gi"), o = "", r = 0, s = n.exec(e);
	for (; s;) {
		let a = s[0], i = s[1], l = s.index + a.length, c = e.slice(l);
		if (new RegExp(`</${i}\\s*>`, "i").test(c)) {
			s = n.exec(e);
			continue;
		}
		if (o += e.slice(r, s.index), c.length === 0) {
			o += a, r = l, s = n.exec(e);
			continue;
		}
		if (c.startsWith(`

`)) {
			let f = c.slice(2).replace(nn, `
<!---->
`);
			o += `${a}

${f}`, r = e.length;
			break;
		}
		if (!c.startsWith(`
`)) {
			o += a, r = l, s = n.exec(e);
			continue;
		}
		let p = c.slice(1);
		if (p.trim().length === 0) {
			o += a, r = l, s = n.exec(e);
			continue;
		}
		let b = p.replace(nn, `
<!---->
`);
		o += `${a}

${b}`, r = e.length;
		break;
	}
	return r === 0 ? e : o + e.slice(r);
};
var ar = (e, t) => {
	if (!t.length) return e;
	let n = e;
	for (let o of t) {
		let r = new RegExp(`(<${o}(?=[\\s>/])[^>]*>)([\\s\\S]*?)(</${o}\\s*>)`, "gi");
		n = n.replace(r, (s, a, i, l) => wi(a, i, l)), n = ki(n, o);
	}
	return n;
};
var xi = /([\\`*_~[\]|])/g;
var vi = (e) => e.replace(xi, "\\$1");
var ir = (e, t) => {
	if (!t.length) return e;
	let n = e;
	for (let o of t) {
		let r = new RegExp(`(<${o}(?=[\\s>/])[^>]*>)([\\s\\S]*?)(</${o}\\s*>)`, "gi");
		n = n.replace(r, (s, a, i, l) => {
			return a + vi(i).replace(/\n\n/g, "&#10;&#10;") + l;
		});
	}
	return n;
};
var Pi = /* @__PURE__ */ new Set([
	"blockquote",
	"dd",
	"dt",
	"figcaption",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"li",
	"p",
	"td",
	"th"
]);
var lr = /* @__PURE__ */ new Set([
	"code",
	"kbd",
	"pre",
	"samp",
	"var"
]);
function cr(e) {
	return e.children.map((t) => t.type === "text" ? t.value : t.type === "element" && !lr.has(t.tagName) ? cr(t) : "").join("");
}
function dr() {
	return (e) => {
		visit(e, "element", (t) => {
			if (lr.has(t.tagName)) {
				t.properties ??= {}, t.properties.dir = "ltr";
				return;
			}
			Pi.has(t.tagName) && (t.properties ??= {}, typeof t.properties.dir != "string" && (t.properties.dir = Je(cr(t))));
		});
	};
}
var mr = (e) => e.type === "text" ? e.value : "children" in e && Array.isArray(e.children) ? e.children.map(mr).join("") : "";
var ur = (e) => (t) => {
	if (!e || e.length === 0) return;
	let n = new Set(e.map((o) => o.toLowerCase()));
	visit(t, "element", (o) => {
		if (n.has(o.tagName.toLowerCase())) {
			let r = mr(o);
			o.children = r ? [{
				type: "text",
				value: r
			}] : [];
		}
	});
};
var pr = () => (e) => {
	visit(e, "code", (t) => {
		var n, o;
		t.meta && (t.data = (n = t.data) != null ? n : {}, t.data.hProperties = {
			...(o = t.data.hProperties) != null ? o : {},
			metastring: t.meta
		});
	});
};
var Ni = /^([a-zA-Z][a-zA-Z\d+\-.]*:)/;
var Ri = (e) => new Set(e.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0).map((t) => t.endsWith(":") ? t : `${t}:`));
function Ii(e, t, n) {
	var i, l;
	let o = (l = (i = e.position) == null ? void 0 : i.start) == null ? void 0 : l.offset;
	if (typeof o == "number" && n.charCodeAt(o) === 91 || e.children.length !== 1) return false;
	let [r] = e.children;
	if (r.type !== "text") return false;
	let s = Ni.exec(e.url);
	if (!s) return false;
	let a = s[1].toLowerCase();
	return t.has(a) ? a === "mailto:" ? e.url === `mailto:${r.value}` : e.url === r.value || e.url === `${a}//${r.value}` : false;
}
var fr = (e = []) => {
	let t = Ri(e);
	return (n, o) => {
		var s;
		if (t.size === 0) return;
		let r = String((s = o.value) != null ? s : "");
		visit(n, "link", (a, i, l) => {
			if (!(!l || i === void 0) && Ii(a, t, r)) return l.children.splice(i, 1, ...a.children), i;
		});
	};
};
var br = "data-sd-caret-hidden";
var Ai = () => {};
var Hi = () => Ai;
var hr = (e) => {
	let t = (0, import_react.useRef)(null), n = (0, import_react.useRef)(null), o = (0, import_react.useSyncExternalStore)(Hi, () => true, () => false);
	return (0, import_react.useLayoutEffect)(() => {
		var a, i;
		let r = e && (i = (a = t.current) == null ? void 0 : a.lastElementChild) != null ? i : null, s = n.current;
		s !== r && (s?.removeAttribute(br), r?.setAttribute(br, ""), n.current = r);
	}), {
		containerRef: t,
		showCaret: o || !e
	};
};
var Cr = /^[a-z]/;
var $i = /^[ \t]*<[\w!/?-]/;
var Wi = /(^|\n)[ \t]{4,}(?=<[\w!/?-])/g;
var qi = (e) => typeof e != "string" || e.length === 0 || !$i.test(e) ? e : e.replace(Wi, "$1");
var kr;
var xr;
var vr;
var Tr;
var Pr;
var Er;
var Ct = {
	...defaultSchema,
	clobberPrefix: "",
	protocols: {
		...defaultSchema.protocols,
		href: [
			...(xr = (kr = defaultSchema.protocols) == null ? void 0 : kr.href) != null ? xr : [],
			"tel",
			"streamdown"
		],
		src: [...(Tr = (vr = defaultSchema.protocols) == null ? void 0 : vr.src) != null ? Tr : [], "streamdown"]
	},
	attributes: {
		...defaultSchema.attributes,
		code: [...(Er = (Pr = defaultSchema.attributes) == null ? void 0 : Pr.code) != null ? Er : [], "metastring"]
	}
};
var on = {
	raw: rehypeRaw,
	sanitize: [rehypeSanitize, Ct],
	harden: [harden, {
		allowedImagePrefixes: ["*"],
		allowedLinkPrefixes: ["*"],
		allowedProtocols: ["*"],
		defaultOrigin: void 0,
		allowDataImages: true
	}]
};
var Xi = {
	gfm: [remarkGfm, {}],
	codeMeta: pr
};
var wr = Object.values(on);
var Zi = Object.values(Xi);
var Gi = {
	block: " ▋",
	circle: " ●"
};
var Rr = ["github-light", "github-dark"];
var Ir = { enabled: true };
var R = (0, import_react.createContext)({
	codeBlockMaxHeight: 400,
	shikiTheme: Rr,
	controls: true,
	isAnimating: false,
	lineNumbers: true,
	mode: "streaming",
	mermaid: void 0,
	linkSafety: Ir,
	portal: void 0,
	tableMaxHeight: 300
});
var Lr = (0, import_react.memo)(({ content: e, shouldParseIncompleteMarkdown: t, shouldNormalizeHtmlIndentation: n, index: o, isIncomplete: r, dir: s, animatePlugin: a, ...i }) => {
	(0, import_react.useLayoutEffect)(() => {
		a?.commit();
	});
	let l = typeof e == "string" && n ? qi(e) : e, c = (0, import_jsx_runtime.jsx)(en, {
		...i,
		children: l
	});
	return (0, import_jsx_runtime.jsx)(Nt.Provider, {
		value: r,
		children: s ? (0, import_jsx_runtime.jsx)("div", {
			dir: s,
			style: { display: "contents" },
			children: c
		}) : c
	});
}, (e, t) => {
	if (e.content !== t.content || e.shouldNormalizeHtmlIndentation !== t.shouldNormalizeHtmlIndentation || e.index !== t.index || e.isIncomplete !== t.isIncomplete || e.dir !== t.dir) return false;
	if (e.components !== t.components) {
		let n = Object.keys(e.components || {}), o = Object.keys(t.components || {});
		if (n.length !== o.length || n.some((r) => {
			var s, a;
			return ((s = e.components) == null ? void 0 : s[r]) !== ((a = t.components) == null ? void 0 : a[r]);
		})) return false;
	}
	return !(e.rehypePlugins !== t.rehypePlugins || e.remarkPlugins !== t.remarkPlugins || !!e.animatePlugin != !!t.animatePlugin);
});
Lr.displayName = "Block";
var rn = (e) => {
	let t = {};
	for (let [n, o] of Object.entries(e)) (n.startsWith("data-") || n.startsWith("aria-")) && (t[n] = o);
	return t;
};
var Ji = (e, t) => {
	let n = rn(e), o = rn(t), r = Object.keys(n);
	return r.length === Object.keys(o).length && r.every((s) => Object.hasOwn(o, s) && n[s] === o[s]);
};
var Ui = (0, import_react.memo)(({ children: e, mode: t = "streaming", dir: n, parseIncompleteMarkdown: o = true, normalizeHtmlIndentation: r = false, components: s, rehypePlugins: a = wr, remarkPlugins: i = Zi, className: l, shikiTheme: c, mermaid: d, codeBlockMaxHeight: p = 400, controls: b = true, isAnimating: f = false, tableMaxHeight: u = 300, animated: g, BlockComponent: h = Lr, parseMarkdownIntoBlocksFn: y = tn, caret: x, plugins: m, remend: C, linkSafety: E = Ir, portal: P, lineNumbers: M = true, allowedTags: S, fallbackComponent: N, literalTagContent: I, disableAutolinkProtocols: z, translations: $, icons: j, prefix: ne, onAnimationStart: Z, onAnimationEnd: D, ..._ }) => {
	let J = (0, import_react.useId)(), U = rn(_), Y = (0, import_react.useMemo)(() => Rn(ne), [ne]), Qe = (0, import_react.useRef)(null), ae = (0, import_react.useRef)(Z), Te = (0, import_react.useRef)(D);
	ae.current = Z, Te.current = D, (0, import_react.useEffect)(() => {
		var O, G, oe;
		if (t === "static") return;
		let k = Qe.current;
		if (Qe.current = f, k === null) {
			f && ((O = ae.current) == null || O.call(ae));
			return;
		}
		f && !k ? (G = ae.current) == null || G.call(ae) : !f && k && ((oe = Te.current) == null || oe.call(Te));
	}, [f, t]);
	let ge = (0, import_react.useMemo)(() => S ? Object.keys(S) : [], [S]), Be = (0, import_react.useMemo)(() => {
		if (typeof e != "string") return "";
		let k = t === "streaming" && o ? Or(e, C) : e;
		return I && I.length > 0 && (k = ir(k, I)), ge.length > 0 && (k = ar(k, ge)), k;
	}, [
		e,
		t,
		o,
		C,
		ge,
		I
	]), q = (0, import_react.useMemo)(() => y(Be), [Be, y]), Oe = (0, import_react.useMemo)(() => n === "auto" ? q.map(Je) : void 0, [q, n]), T = (0, import_react.useMemo)(() => q.map((k, O) => `${J}-${O}`), [q.length, J]), B = (0, import_react.useMemo)(() => g === true ? "true" : g ? JSON.stringify(g) : "", [g]), X = (0, import_react.useRef)(null), ie = (0, import_react.useRef)([]), le = (0, import_react.useRef)([]), cn = (0, import_react.useRef)(null), xt = (0, import_react.useRef)("");
	if (B) {
		if (xt.current !== B) {
			xt.current = B;
			X.current = Et({ maxBacklogMs: B !== "true" ? g.maxBacklogMs : void 0 }), ie.current = [], le.current = [];
		} else X.current || (X.current = Et());
		f && X.current && X.current.beginPass(X.current.now());
	} else X.current = null, ie.current = [], le.current = [], xt.current = "";
	(0, import_react.useLayoutEffect)(() => {
		var k;
		f && ((k = X.current) == null || k.commitPass());
	});
	let dn = (0, import_react.useMemo)(() => {
		var k, O;
		return {
			codeBlockMaxHeight: p,
			shikiTheme: (O = c != null ? c : (k = m == null ? void 0 : m.code) == null ? void 0 : k.getThemes()) != null ? O : Rr,
			controls: b,
			isAnimating: f,
			lineNumbers: M,
			mode: t,
			mermaid: d,
			linkSafety: E,
			portal: P,
			tableMaxHeight: u
		};
	}, [
		p,
		c,
		b,
		f,
		M,
		t,
		d,
		E,
		P,
		m == null ? void 0 : m.code,
		u
	]), Hr = (0, import_react.useMemo)(() => $ ? JSON.stringify($) : "", [$]), mn = (0, import_react.useMemo)(() => ({
		...it,
		...$
	}), [Hr]), un = (0, import_react.useMemo)(() => {
		let { inlineCode: k, ...O } = s != null ? s : {}, G = {
			...Jt,
			...O
		};
		if (k) {
			let oe = G.code;
			G.code = (Q) => "data-block" in Q ? oe ? (0, import_react.createElement)(oe, Q) : null : (0, import_react.createElement)(k, Q);
		}
		if (N) {
			if (S) for (let Q of Object.keys(S)) Object.hasOwn(G, Q) || (G[Q] = N);
			let oe = {
				configurable: true,
				enumerable: false,
				value: N,
				writable: false
			};
			return new Proxy(G, {
				getOwnPropertyDescriptor(Q, te) {
					let be = Object.getOwnPropertyDescriptor(Q, te);
					if (be) return be;
					if (typeof te == "string" && Cr.test(te)) return oe;
				},
				get(Q, te, be) {
					return typeof te == "string" && Cr.test(te) && !Object.hasOwn(Q, te) ? N : Reflect.get(Q, te, be);
				}
			});
		}
		return G;
	}, [
		s,
		N,
		S
	]), pn = (0, import_react.useMemo)(() => {
		let k = [];
		return m != null && m.cjk && (k = [...k, ...m.cjk.remarkPluginsBefore]), k = [...k, ...i], z && z.length > 0 && (k = [...k, [fr, z]]), m != null && m.cjk && (k = [...k, ...m.cjk.remarkPluginsAfter]), m != null && m.math && (k = [...k, m.math.remarkPlugin]), k;
	}, [
		i,
		m == null ? void 0 : m.math,
		m == null ? void 0 : m.cjk,
		z
	]), Ve = (0, import_react.useMemo)(() => {
		var O;
		let k = a;
		if (S && Object.keys(S).length > 0 && a === wr) {
			let G = {
				...Ct,
				tagNames: [...(O = Ct.tagNames) != null ? O : [], ...Object.keys(S)],
				attributes: {
					...Ct.attributes,
					...S
				}
			};
			k = [
				on.raw,
				[rehypeSanitize, G],
				on.harden
			];
		}
		return I && I.length > 0 && (k = [...k, [ur, I]]), m != null && m.math && (k = [...k, m.math.rehypePlugin]), n === "auto" && t === "static" && (k = [...k, dr]), k;
	}, [
		a,
		m == null ? void 0 : m.math,
		S,
		I,
		n,
		t
	]), Br = (0, import_react.useMemo)(() => x && f ? { "--streamdown-caret": `"${Gi[x]}"` } : void 0, [x, f]), { containerRef: Vr, showCaret: Fr } = hr((0, import_react.useMemo)(() => {
		if (!f || q.length === 0) return false;
		let k = q.at(-1);
		return Ut(k) || qo(k);
	}, [f, q])), jr = (k) => {
		let O = null;
		if (X.current && f) {
			if (!ie.current[k]) {
				let { maxBacklogMs: Q, ...te } = B && B !== "true" ? g : {};
				ie.current[k] = En({
					...te,
					timeline: X.current
				});
			}
			O = ie.current[k];
		}
		cn.current !== Ve && (le.current = [], cn.current = Ve), O && !le.current[k] && (le.current[k] = [...Ve, O.rehypePlugin]);
		let G = O && le.current[k] ? le.current[k] : Ve;
		return {
			blockAnimatePlugin: O,
			blockRehypePlugins: G
		};
	};
	return t === "static" ? (0, import_jsx_runtime.jsx)(lt.Provider, {
		value: mn,
		children: (0, import_jsx_runtime.jsx)(dt.Provider, {
			value: m != null ? m : null,
			children: (0, import_jsx_runtime.jsx)(R.Provider, {
				value: dn,
				children: (0, import_jsx_runtime.jsx)(Ht, {
					icons: j,
					children: (0, import_jsx_runtime.jsx)(tt.Provider, {
						value: Y,
						children: (0, import_jsx_runtime.jsx)("div", {
							...U,
							className: Y("space-y-4 whitespace-normal [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", l),
							dir: n === "auto" ? void 0 : n,
							children: (0, import_jsx_runtime.jsx)(en, {
								components: un,
								rehypePlugins: Ve,
								remarkPlugins: pn,
								..._,
								children: Be
							})
						})
					})
				})
			})
		})
	}) : (0, import_jsx_runtime.jsx)(lt.Provider, {
		value: mn,
		children: (0, import_jsx_runtime.jsx)(dt.Provider, {
			value: m != null ? m : null,
			children: (0, import_jsx_runtime.jsx)(R.Provider, {
				value: dn,
				children: (0, import_jsx_runtime.jsx)(Ht, {
					icons: j,
					children: (0, import_jsx_runtime.jsx)(tt.Provider, {
						value: Y,
						children: (0, import_jsx_runtime.jsxs)("div", {
							...U,
							className: Y("space-y-4 whitespace-normal [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", x && Fr ? "[&>*:last-child:not([data-sd-caret-hidden])]:after:inline [&>*:last-child:not([data-sd-caret-hidden])]:after:align-baseline [&>*:last-child:not([data-sd-caret-hidden])]:after:content-[var(--streamdown-caret)]" : null, l),
							ref: Vr,
							style: Br,
							children: [q.length === 0 && x && f && (0, import_jsx_runtime.jsx)("span", {}), q.map((k, O) => {
								var be;
								let G = O === q.length - 1, oe = f && G && Ut(k), { blockAnimatePlugin: Q, blockRehypePlugins: te } = jr(O);
								return (0, import_jsx_runtime.jsx)(h, {
									animatePlugin: Q,
									components: un,
									content: k,
									dir: (be = Oe == null ? void 0 : Oe[O]) != null ? be : n !== "auto" ? n : void 0,
									index: O,
									isIncomplete: oe,
									rehypePlugins: te,
									remarkPlugins: pn,
									shouldNormalizeHtmlIndentation: r,
									shouldParseIncompleteMarkdown: o,
									..._
								}, T[O]);
							})]
						})
					})
				})
			})
		})
	});
}, (e, t) => e.children === t.children && e.shikiTheme === t.shikiTheme && e.isAnimating === t.isAnimating && e.animated === t.animated && e.mode === t.mode && e.plugins === t.plugins && e.className === t.className && e.linkSafety === t.linkSafety && e.lineNumbers === t.lineNumbers && e.codeBlockMaxHeight === t.codeBlockMaxHeight && e.tableMaxHeight === t.tableMaxHeight && e.normalizeHtmlIndentation === t.normalizeHtmlIndentation && e.literalTagContent === t.literalTagContent && e.disableAutolinkProtocols === t.disableAutolinkProtocols && JSON.stringify(e.translations) === JSON.stringify(t.translations) && e.prefix === t.prefix && e.dir === t.dir && e.fallbackComponent === t.fallbackComponent && Ji(e, t));
Ui.displayName = "Streamdown";
var Ue = (e) => e > 0 ? e : null;
var el = (e, t) => {
	if (e.endsWith("px")) return Ue(Number.parseFloat(e));
	if (e.endsWith("rem")) {
		let n = Number.parseFloat(getComputedStyle(document.documentElement).fontSize || "16");
		return Ue(Number.parseFloat(e) * n);
	}
	if (e.endsWith("em")) {
		let n = Number.parseFloat(getComputedStyle(t).fontSize || "16");
		return Ue(Number.parseFloat(e) * n);
	}
	if (e.endsWith("vh")) return Ue(Number.parseFloat(e) / 100 * window.innerHeight);
	if (e.endsWith("%")) {
		let n = t.parentElement;
		return n && n.clientHeight > 0 ? Ue(Number.parseFloat(e) / 100 * n.clientHeight) : null;
	}
	return null;
};
var an = (e, t) => {
	let n = t.trim().toLowerCase();
	return !n || n === "none" || n === "auto" ? null : el(n, e);
};
var tl = /^min\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/i;
var nl = (e, t) => {
	let n = an(e, t);
	if (n != null) return n;
	let o = t.trim().match(tl);
	if (!o) return null;
	let r = an(e, o[1].trim()), s = an(e, o[2].trim());
	return r == null || s == null ? null : Math.min(r, s);
};
var ol = (e, t, n) => {
	let o = t.clientWidth;
	if (!(o > 0)) return null;
	if (n) {
		let d = t.clientHeight;
		if (!(d > 0)) return null;
		let p = Math.min(o / e.width, d / e.height, 1);
		return !(p > 0) || Number.isNaN(p) ? null : {
			fitZoom: p,
			viewportHeight: null
		};
	}
	let r = Math.min(o / e.width, 1);
	if (!(r > 0) || Number.isNaN(r)) return null;
	let s = e.height * r, a = null, i = t;
	for (; i && a == null;) {
		let d = getComputedStyle(i);
		a = nl(i, d.maxHeight), i = i.parentElement;
	}
	let l = a != null ? Math.min(s, a) : s, c = Math.min(r, l / e.height, 1);
	return !(c > 0) || Number.isNaN(c) ? null : {
		fitZoom: c,
		viewportHeight: l
	};
};
var Ar = ({ children: e, className: t, contentSize: n, fitKey: o, minZoom: r = .5, maxZoom: s = 3, zoomStep: a = .1, showControls: i = true, initialZoom: l = 1, isAutoFit: c = false, fullscreen: d = false }) => {
	let { RotateCcwIcon: p, ZoomInIcon: b, ZoomOutIcon: f } = V(), u = w(), g = F(), h = (0, import_react.useRef)(null), y = (0, import_react.useRef)(null), x = (0, import_react.useRef)(false), [m, C] = (0, import_react.useState)(l), [E, P] = (0, import_react.useState)(r), [M, S] = (0, import_react.useState)(l), [N, I] = (0, import_react.useState)({
		x: 0,
		y: 0
	}), [z, $] = (0, import_react.useState)(false), [j, ne] = (0, import_react.useState)({
		x: 0,
		y: 0
	}), [Z, D] = (0, import_react.useState)({
		x: 0,
		y: 0
	}), [_, J] = (0, import_react.useState)(null), U = (0, import_react.useCallback)((T) => {
		let B = h.current;
		if (!B) return;
		let X = ol(T, B, d);
		if (!X) return;
		let { fitZoom: ie, viewportHeight: le } = X;
		J(le), C(ie), P(Math.min(r, ie)), x.current || (S(ie), I({
			x: 0,
			y: 0
		}));
	}, [d, r]), Y = (0, import_react.useCallback)((T) => {
		S((B) => Math.max(E, Math.min(s, B + T))), x.current = true;
	}, [E, s]), Qe = (0, import_react.useCallback)(() => {
		Y(a);
	}, [Y, a]), ae = (0, import_react.useCallback)(() => {
		Y(-a);
	}, [Y, a]), Te = (0, import_react.useCallback)(() => {
		S(m), I({
			x: 0,
			y: 0
		}), x.current = false;
	}, [m]), ge = (0, import_react.useCallback)((T) => {
		T.preventDefault();
		let B = T.deltaY > 0 ? -a : a;
		Y(B);
	}, [Y, a]), Be = (0, import_react.useCallback)((T) => {
		if (T.button !== 0 || T.isPrimary === false) return;
		$(true), x.current = true, ne({
			x: T.clientX,
			y: T.clientY
		}), D(N);
		let B = T.currentTarget;
		B instanceof HTMLElement && B.setPointerCapture(T.pointerId);
	}, [N]), et = (0, import_react.useCallback)((T) => {
		if (!z) return;
		T.preventDefault();
		let B = T.clientX - j.x, X = T.clientY - j.y;
		I({
			x: Z.x + B,
			y: Z.y + X
		});
	}, [
		z,
		j,
		Z
	]), q = (0, import_react.useCallback)((T) => {
		$(false);
		let B = T.currentTarget;
		B instanceof HTMLElement && B.releasePointerCapture(T.pointerId);
	}, []);
	(0, import_react.useEffect)(() => {
		P(r), c || (C(l), S(l), J(null));
	}, [
		l,
		c,
		r
	]), (0, import_react.useLayoutEffect)(() => {
		if (!(c && n)) return;
		U(n);
		let T = h.current;
		if (!T || typeof ResizeObserver == "undefined") return;
		let B = new ResizeObserver(() => {
			U(n);
		});
		return B.observe(T), () => {
			B.disconnect();
		};
	}, [
		U,
		n,
		c
	]), (0, import_react.useEffect)(() => {
		c && (x.current = false);
	}, [o, c]), (0, import_react.useEffect)(() => {
		let T = h.current;
		if (T) return T.addEventListener("wheel", ge, { passive: false }), () => {
			T.removeEventListener("wheel", ge);
		};
	}, [ge]), (0, import_react.useEffect)(() => {
		let T = y.current;
		if (T && z) return document.body.style.userSelect = "none", T.addEventListener("pointermove", et, { passive: false }), T.addEventListener("pointerup", q), T.addEventListener("pointercancel", q), () => {
			document.body.style.userSelect = "", T.removeEventListener("pointermove", et), T.removeEventListener("pointerup", q), T.removeEventListener("pointercancel", q);
		};
	}, [
		z,
		et,
		q
	]);
	let Oe = !d && c && _ != null ? { height: _ } : void 0;
	return (0, import_jsx_runtime.jsxs)("div", {
		className: u("relative flex flex-col", d ? "h-full w-full" : "min-h-28 w-full", t),
		ref: h,
		style: {
			cursor: z ? "grabbing" : "grab",
			...Oe
		},
		children: [i ? (0, import_jsx_runtime.jsxs)("div", {
			className: u("absolute z-10 flex flex-col gap-1 rounded-md border border-border bg-background/80 p-1 supports-[backdrop-filter]:bg-background/70 supports-[backdrop-filter]:backdrop-blur-sm", d ? "bottom-4 left-4" : "bottom-2 left-2"),
			children: [
				(0, import_jsx_runtime.jsx)("button", {
					"aria-label": g.zoomIn,
					className: u("flex items-center justify-center rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"),
					disabled: M >= s,
					onClick: Qe,
					title: g.zoomIn,
					type: "button",
					children: (0, import_jsx_runtime.jsx)(b, {
						"aria-hidden": "true",
						size: 16
					})
				}),
				(0, import_jsx_runtime.jsx)("button", {
					"aria-label": g.zoomOut,
					className: u("flex items-center justify-center rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"),
					disabled: M <= E,
					onClick: ae,
					title: g.zoomOut,
					type: "button",
					children: (0, import_jsx_runtime.jsx)(f, {
						"aria-hidden": "true",
						size: 16
					})
				}),
				(0, import_jsx_runtime.jsx)("button", {
					"aria-label": g.resetView,
					className: u("flex items-center justify-center rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"),
					onClick: Te,
					title: g.resetView,
					type: "button",
					children: (0, import_jsx_runtime.jsx)(p, {
						"aria-hidden": "true",
						size: 16
					})
				})
			]
		}) : null, (0, import_jsx_runtime.jsx)("div", {
			className: u("flex h-full w-full flex-1 origin-center items-center justify-center transition-transform duration-150 ease-out"),
			onPointerDown: Be,
			ref: y,
			role: "application",
			style: {
				transform: `translate(${N.x}px, ${N.y}px) scale(${M})`,
				transformOrigin: "center center",
				touchAction: "none",
				willChange: "transform"
			},
			children: e
		})]
	});
};
var sl = (e, t) => new Promise((n) => {
	let o = setTimeout(n, e);
	t(() => {
		clearTimeout(o), n();
	});
});
var al = async (e, { chart: t, config: n }, o, r) => {
	try {
		let s = e.getMermaid(n), a = t.split("").reduce((d, p) => (d << 5) - d + p.charCodeAt(0) | 0, 0), i = `mermaid-${Math.abs(a)}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, { svg: l } = await s.render(i, t), c = _t(l);
		return {
			ok: !0,
			svg: o ? l : ro(l),
			size: c
		};
	} catch (s) {
		return {
			ok: false,
			error: s instanceof Error ? s.message : r
		};
	}
};
var co = ({ chart: e, className: t, config: n, fullscreen: o = false, showControls: r = true }) => {
	let s = w(), [a, i] = (0, import_react.useState)(null), [l, c] = (0, import_react.useState)(false), [d, p] = (0, import_react.useState)(""), [b, f] = (0, import_react.useState)(null), u = F(), [g, h] = (0, import_react.useState)(""), [y, x] = (0, import_react.useState)(0), { mermaid: m } = (0, import_react.useContext)(R), C = Re(), E = m == null ? void 0 : m.errorComponent, { shouldRender: P, containerRef: M } = fn({ immediate: o }), S = (0, import_react.useRef)(null), N = (0, import_react.useRef)(false), I = (0, import_react.useRef)(false), z = je(), $ = (0, import_react.useRef)(z), j = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => (I.current = true, () => {
		var D;
		I.current = false, (D = j.current) == null || D.call(j);
	}), []), (0, import_react.useEffect)(() => {
		var D;
		$.current = z, z || (D = j.current) == null || D.call(j);
	}, [z]);
	let ne = async (D) => {
		$.current && (await sl(D, (_) => {
			j.current = _;
		}), j.current = null);
	};
	if ((0, import_react.useEffect)(() => {
		if (!P) return;
		if (!C) {
			i("Mermaid plugin not available. Please add the mermaid plugin to enable diagram rendering.");
			return;
		}
		if (S.current = {
			chart: e,
			config: n
		}, N.current) return;
		let D = (J, U) => {
			U.ok ? (p(U.svg), f(U.size), h(U.svg)) : J === S.current && i(U.error);
		};
		(async () => {
			N.current = true, i(null), c(true);
			try {
				let J = S.current;
				for (; J;) {
					let U = performance.now(), Y = await al(C, J, o, u.errorMermaid);
					if (!I.current || (D(J, Y), Y.ok && await ne(performance.now() - U), !I.current || J === S.current)) return;
					J = S.current;
				}
			} finally {
				N.current = false, I.current && c(false);
			}
		})();
	}, [
		e,
		n,
		y,
		P,
		C
	]), !(P || d || g)) return (0, import_jsx_runtime.jsx)("div", {
		className: s("my-4 min-h-[200px]", t),
		ref: M
	});
	if (l && !d && !g) return (0, import_jsx_runtime.jsx)("div", {
		className: s("my-4 flex justify-center p-4", t),
		ref: M,
		children: (0, import_jsx_runtime.jsxs)("div", {
			className: s("flex items-center space-x-2 text-muted-foreground"),
			children: [(0, import_jsx_runtime.jsx)("div", { className: s("h-4 w-4 animate-spin rounded-full border-current border-b-2") }), (0, import_jsx_runtime.jsx)("span", {
				className: s("text-sm"),
				children: "Loading diagram..."
			})]
		})
	});
	if (a && !d && !g) {
		let D = () => x((_) => _ + 1);
		return E ? (0, import_jsx_runtime.jsx)("div", {
			ref: M,
			children: (0, import_jsx_runtime.jsx)(E, {
				chart: e,
				error: a,
				retry: D
			})
		}) : (0, import_jsx_runtime.jsxs)("div", {
			className: s("rounded-md bg-red-50 p-4", t),
			ref: M,
			children: [(0, import_jsx_runtime.jsxs)("p", {
				className: s("font-mono text-red-700 text-sm"),
				children: ["Mermaid Error: ", a]
			}), (0, import_jsx_runtime.jsxs)("details", {
				className: s("mt-2"),
				children: [(0, import_jsx_runtime.jsx)("summary", {
					className: s("cursor-pointer text-red-600 text-xs"),
					children: "Show Code"
				}), (0, import_jsx_runtime.jsx)("pre", {
					className: s("mt-2 overflow-x-auto rounded bg-red-100 p-2 text-red-800 text-xs"),
					children: e
				})]
			})]
		});
	}
	let Z = d || g;
	return (0, import_jsx_runtime.jsx)("div", {
		className: s(o ? "size-full" : "max-h-[min(70vh,40rem)] w-full", t),
		"data-streamdown": "mermaid",
		ref: M,
		children: (0, import_jsx_runtime.jsx)(Ar, {
			className: s(o ? "size-full overflow-hidden" : "max-h-[min(70vh,40rem)] overflow-hidden", t),
			contentSize: b,
			fitKey: e,
			fullscreen: o,
			isAutoFit: true,
			maxZoom: 3,
			minZoom: .1,
			showControls: r,
			zoomStep: .1,
			children: (0, import_jsx_runtime.jsx)("div", {
				"aria-label": u.mermaidAriaLabel,
				className: s("flex justify-center", o ? "size-full items-center" : null),
				dangerouslySetInnerHTML: { __html: Z },
				role: "img"
			})
		})
	});
};
//#endregion
//#region node_modules/streamdown/dist/highlighted-body-JLMTFACH.js
var highlighted_body_JLMTFACH_exports = /* @__PURE__ */ __exportAll({ HighlightedCodeBlockBody: () => T });
var T = ({ code: s, isIncomplete: l = false, language: e, maxHeight: d, raw: t, className: a, startLine: c$1, lineNumbers: p, ...f$1 }) => {
	let { shikiTheme: r } = (0, import_react.useContext)(R), o = Wc(), [H, i] = (0, import_react.useState)(t);
	return (0, import_react.useEffect)(() => {
		if (!o) {
			i(t);
			return;
		}
		let n = true, u = o.highlight({
			code: s,
			isIncomplete: l,
			language: e,
			themes: r
		}, (B) => {
			n && i(B);
		});
		return u && i(u), () => {
			n = false;
		};
	}, [
		s,
		l,
		e,
		r,
		o,
		t
	]), (0, import_jsx_runtime.jsx)(In, {
		className: a,
		language: e,
		lineNumbers: p,
		maxHeight: d,
		result: H,
		startLine: c$1,
		...f$1
	});
};
//#endregion
//#region node_modules/streamdown/dist/mermaid-WFAXDIZX.js
var mermaid_WFAXDIZX_exports = /* @__PURE__ */ __exportAll({ Mermaid: () => co });
//#endregion
export { twMerge as n, Ui as t };
