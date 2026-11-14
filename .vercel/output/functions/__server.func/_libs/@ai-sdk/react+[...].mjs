import { i as __toESM, t as __commonJSMin } from "../../_runtime.mjs";
import { n as APICallError, r as EmptyResponseBodyError, s as UnsupportedFunctionalityError, t as AISDKError } from "../ai-sdk__provider.mjs";
import { $ as $ZodAsyncError, A as cleanRegex, B as isObject, C as safeParse, D as allowsEval, E as aborted, F as extend, G as nullish, H as issue, I as finalizeIssue, J as partial, K as omit, L as floatSafeRemainder, M as defineLazy, N as esc, O as assignProp, P as escapeRegex, Q as required, R as getEnumValues, S as globalRegistry, T as NUMBER_FORMAT_RANGES, U as merge, V as isPlainObject, W as normalizeParams, X as prefixIssues, Y as pick, Z as propertyKeyTypes, _ as zodSchema, b as safeParse$1, c as isBuffer, d as parseJsonEventStream, et as $constructor, h as validateTypes, i as createIdGenerator, j as clone, k as cached, l as lazySchema, m as safeParseJSON, nt as globalConfig, o as generateId, p as resolve, q as optionalKeys, tt as config, u as normalizeHeaders, v as parse, w as safeParseAsync, x as safeParseAsync$1, y as parseAsync, z as getLengthableOrigin } from "./provider-utils+[...].mjs";
//#region node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	};
	var assign = Object.assign;
	var emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	};
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result;
			ctor = ctor();
			ctor.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
			});
			-1 === payload._status && (payload._status = 0, payload._result = ctor);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	var Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = function(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	};
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.2.8";
}));
//#endregion
//#region node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
}));
//#endregion
//#region node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][^\s-]{8,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
var duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
/** Returns a regex for validating an RFC 4122 UUID.
*
* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
var uuid = (version) => {
	if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/;
	return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
/** Practical email validation */
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
function emoji() {
	return new RegExp(_emoji$1, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var hostname = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
var e164 = /^\+(?:[0-9]){6,14}[0-9]$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
var date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
function timeSource(args) {
	const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
	return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function time$1(args) {
	return new RegExp(`^${timeSource(args)}$`);
}
function datetime$1(args) {
	const time = timeSource({ precision: args.precision });
	const opts = ["Z"];
	if (args.local) opts.push("");
	if (args.offset) opts.push(`([+-]\\d{2}:\\d{2})`);
	const timeRegex = `${time}(?:${opts.join("|")})`;
	return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string$1 = (params) => {
	const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
	return new RegExp(`^${regex}$`);
};
var integer = /^\d+$/;
var number$1 = /^-?\d+(?:\.\d+)?/i;
var boolean$1 = /true|false/i;
var _null$2 = /null/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;
//#endregion
//#region node_modules/zod/v4/core/checks.js
var $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
	var _a;
	inst._zod ?? (inst._zod = {});
	inst._zod.def = def;
	(_a = inst._zod).onattach ?? (_a.onattach = []);
});
var numericOriginMap = {
	number: "number",
	bigint: "bigint",
	object: "date"
};
var $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
		if (def.value < curr) if (def.inclusive) bag.maximum = def.value;
		else bag.exclusiveMaximum = def.value;
	});
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
	$ZodCheck.init(inst, def);
	const origin = numericOriginMap[typeof def.value];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
		if (def.value > curr) if (def.inclusive) bag.minimum = def.value;
		else bag.exclusiveMinimum = def.value;
	});
	inst._zod.check = (payload) => {
		if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.value,
			input: payload.value,
			inclusive: def.inclusive,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.onattach.push((inst) => {
		var _a;
		(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
	});
	inst._zod.check = (payload) => {
		if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
		if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
		payload.issues.push({
			origin: typeof payload.value,
			code: "not_multiple_of",
			divisor: def.value,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
	$ZodCheck.init(inst, def);
	def.format = def.format || "float64";
	const isInt = def.format?.includes("int");
	const origin = isInt ? "int" : "number";
	const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = def.format;
		bag.minimum = minimum;
		bag.maximum = maximum;
		if (isInt) bag.pattern = integer;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (isInt) {
			if (!Number.isInteger(input)) {
				payload.issues.push({
					expected: origin,
					format: def.format,
					code: "invalid_type",
					input,
					inst
				});
				return;
			}
			if (!Number.isSafeInteger(input)) {
				if (input > 0) payload.issues.push({
					input,
					code: "too_big",
					maximum: Number.MAX_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					continue: !def.abort
				});
				else payload.issues.push({
					input,
					code: "too_small",
					minimum: Number.MIN_SAFE_INTEGER,
					note: "Integers must be within the safe integer range.",
					inst,
					origin,
					continue: !def.abort
				});
				return;
			}
		}
		if (input < minimum) payload.issues.push({
			origin: "number",
			input,
			code: "too_small",
			minimum,
			inclusive: true,
			inst,
			continue: !def.abort
		});
		if (input > maximum) payload.issues.push({
			origin: "number",
			input,
			code: "too_big",
			maximum,
			inst
		});
	};
});
var $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
		if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (input.length <= def.maximum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_big",
			maximum: def.maximum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
		if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		if (input.length >= def.minimum) return;
		const origin = getLengthableOrigin(input);
		payload.issues.push({
			origin,
			code: "too_small",
			minimum: def.minimum,
			inclusive: true,
			input,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
	var _a;
	$ZodCheck.init(inst, def);
	(_a = inst._zod.def).when ?? (_a.when = (payload) => {
		const val = payload.value;
		return !nullish(val) && val.length !== void 0;
	});
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.minimum = def.length;
		bag.maximum = def.length;
		bag.length = def.length;
	});
	inst._zod.check = (payload) => {
		const input = payload.value;
		const length = input.length;
		if (length === def.length) return;
		const origin = getLengthableOrigin(input);
		const tooBig = length > def.length;
		payload.issues.push({
			origin,
			...tooBig ? {
				code: "too_big",
				maximum: def.length
			} : {
				code: "too_small",
				minimum: def.length
			},
			inclusive: true,
			exact: true,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
	var _a, _b;
	$ZodCheck.init(inst, def);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = def.format;
		if (def.pattern) {
			bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
			bag.patterns.add(def.pattern);
		}
	});
	if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: def.format,
			input: payload.value,
			...def.pattern ? { pattern: def.pattern.toString() } : {},
			inst,
			continue: !def.abort
		});
	});
	else (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		def.pattern.lastIndex = 0;
		if (def.pattern.test(payload.value)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "regex",
			input: payload.value,
			pattern: def.pattern.toString(),
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
	def.pattern ?? (def.pattern = lowercase);
	$ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
	def.pattern ?? (def.pattern = uppercase);
	$ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
	$ZodCheck.init(inst, def);
	const escapedRegex = escapeRegex(def.includes);
	const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
	def.pattern = pattern;
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.includes(def.includes, def.position)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "includes",
			includes: def.includes,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.startsWith(def.prefix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "starts_with",
			prefix: def.prefix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
	$ZodCheck.init(inst, def);
	const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
	def.pattern ?? (def.pattern = pattern);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
		bag.patterns.add(pattern);
	});
	inst._zod.check = (payload) => {
		if (payload.value.endsWith(def.suffix)) return;
		payload.issues.push({
			origin: "string",
			code: "invalid_format",
			format: "ends_with",
			suffix: def.suffix,
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
	$ZodCheck.init(inst, def);
	inst._zod.check = (payload) => {
		payload.value = def.tx(payload.value);
	};
});
//#endregion
//#region node_modules/zod/v4/core/doc.js
var Doc = class {
	constructor(args = []) {
		this.content = [];
		this.indent = 0;
		if (this) this.args = args;
	}
	indented(fn) {
		this.indent += 1;
		fn(this);
		this.indent -= 1;
	}
	write(arg) {
		if (typeof arg === "function") {
			arg(this, { execution: "sync" });
			arg(this, { execution: "async" });
			return;
		}
		const lines = arg.split("\n").filter((x) => x);
		const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
		const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
		for (const line of dedented) this.content.push(line);
	}
	compile() {
		const F = Function;
		const args = this?.args;
		const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
		return new F(...args, lines.join("\n"));
	}
};
//#endregion
//#region node_modules/zod/v4/core/versions.js
var version = {
	major: 4,
	minor: 0,
	patch: 0
};
//#endregion
//#region node_modules/zod/v4/core/schemas.js
var $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
	var _a;
	inst ?? (inst = {});
	inst._zod.def = def;
	inst._zod.bag = inst._zod.bag || {};
	inst._zod.version = version;
	const checks = [...inst._zod.def.checks ?? []];
	if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
	for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
	if (checks.length === 0) {
		(_a = inst._zod).deferred ?? (_a.deferred = []);
		inst._zod.deferred?.push(() => {
			inst._zod.run = inst._zod.parse;
		});
	} else {
		const runChecks = (payload, checks, ctx) => {
			let isAborted = aborted(payload);
			let asyncResult;
			for (const ch of checks) {
				if (ch._zod.def.when) {
					if (!ch._zod.def.when(payload)) continue;
				} else if (isAborted) continue;
				const currLen = payload.issues.length;
				const _ = ch._zod.check(payload);
				if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
				if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
					await _;
					if (payload.issues.length === currLen) return;
					if (!isAborted) isAborted = aborted(payload, currLen);
				});
				else {
					if (payload.issues.length === currLen) continue;
					if (!isAborted) isAborted = aborted(payload, currLen);
				}
			}
			if (asyncResult) return asyncResult.then(() => {
				return payload;
			});
			return payload;
		};
		inst._zod.run = (payload, ctx) => {
			const result = inst._zod.parse(payload, ctx);
			if (result instanceof Promise) {
				if (ctx.async === false) throw new $ZodAsyncError();
				return result.then((result) => runChecks(result, checks, ctx));
			}
			return runChecks(result, checks, ctx);
		};
	}
	inst["~standard"] = {
		validate: (value) => {
			try {
				const r = safeParse(inst, value);
				return r.success ? { value: r.data } : { issues: r.error?.issues };
			} catch (_) {
				return safeParseAsync(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
			}
		},
		vendor: "zod",
		version: 1
	};
});
var $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
	inst._zod.parse = (payload, _) => {
		if (def.coerce) try {
			payload.value = String(payload.value);
		} catch (_) {}
		if (typeof payload.value === "string") return payload;
		payload.issues.push({
			expected: "string",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
var $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
	$ZodCheckStringFormat.init(inst, def);
	$ZodString.init(inst, def);
});
var $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
	def.pattern ?? (def.pattern = guid);
	$ZodStringFormat.init(inst, def);
});
var $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
	if (def.version) {
		const v = {
			v1: 1,
			v2: 2,
			v3: 3,
			v4: 4,
			v5: 5,
			v6: 6,
			v7: 7,
			v8: 8
		}[def.version];
		if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
		def.pattern ?? (def.pattern = uuid(v));
	} else def.pattern ?? (def.pattern = uuid());
	$ZodStringFormat.init(inst, def);
});
var $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
	def.pattern ?? (def.pattern = email);
	$ZodStringFormat.init(inst, def);
});
var $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		try {
			const orig = payload.value;
			const url = new URL(orig);
			const href = url.href;
			if (def.hostname) {
				def.hostname.lastIndex = 0;
				if (!def.hostname.test(url.hostname)) payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid hostname",
					pattern: hostname.source,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
			if (def.protocol) {
				def.protocol.lastIndex = 0;
				if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
					code: "invalid_format",
					format: "url",
					note: "Invalid protocol",
					pattern: def.protocol.source,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			}
			if (!orig.endsWith("/") && href.endsWith("/")) payload.value = href.slice(0, -1);
			else payload.value = href;
			return;
		} catch (_) {
			payload.issues.push({
				code: "invalid_format",
				format: "url",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
var $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
	def.pattern ?? (def.pattern = emoji());
	$ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
	def.pattern ?? (def.pattern = nanoid);
	$ZodStringFormat.init(inst, def);
});
var $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
	def.pattern ?? (def.pattern = cuid);
	$ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
	def.pattern ?? (def.pattern = cuid2);
	$ZodStringFormat.init(inst, def);
});
var $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
	def.pattern ?? (def.pattern = ulid);
	$ZodStringFormat.init(inst, def);
});
var $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
	def.pattern ?? (def.pattern = xid);
	$ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
	def.pattern ?? (def.pattern = ksuid);
	$ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
	def.pattern ?? (def.pattern = datetime$1(def));
	$ZodStringFormat.init(inst, def);
});
var $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
	def.pattern ?? (def.pattern = date$1);
	$ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
	def.pattern ?? (def.pattern = time$1(def));
	$ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
	def.pattern ?? (def.pattern = duration$1);
	$ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
	def.pattern ?? (def.pattern = ipv4);
	$ZodStringFormat.init(inst, def);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = `ipv4`;
	});
});
var $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
	def.pattern ?? (def.pattern = ipv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.onattach.push((inst) => {
		const bag = inst._zod.bag;
		bag.format = `ipv6`;
	});
	inst._zod.check = (payload) => {
		try {
			new URL(`http://[${payload.value}]`);
		} catch {
			payload.issues.push({
				code: "invalid_format",
				format: "ipv6",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
var $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv4);
	$ZodStringFormat.init(inst, def);
});
var $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
	def.pattern ?? (def.pattern = cidrv6);
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		const [address, prefix] = payload.value.split("/");
		try {
			if (!prefix) throw new Error();
			const prefixNum = Number(prefix);
			if (`${prefixNum}` !== prefix) throw new Error();
			if (prefixNum < 0 || prefixNum > 128) throw new Error();
			new URL(`http://[${address}]`);
		} catch {
			payload.issues.push({
				code: "invalid_format",
				format: "cidrv6",
				input: payload.value,
				inst,
				continue: !def.abort
			});
		}
	};
});
function isValidBase64(data) {
	if (data === "") return true;
	if (data.length % 4 !== 0) return false;
	try {
		atob(data);
		return true;
	} catch {
		return false;
	}
}
var $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
	def.pattern ?? (def.pattern = base64);
	$ZodStringFormat.init(inst, def);
	inst._zod.onattach.push((inst) => {
		inst._zod.bag.contentEncoding = "base64";
	});
	inst._zod.check = (payload) => {
		if (isValidBase64(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
function isValidBase64URL(data) {
	if (!base64url.test(data)) return false;
	const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
	return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
}
var $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
	def.pattern ?? (def.pattern = base64url);
	$ZodStringFormat.init(inst, def);
	inst._zod.onattach.push((inst) => {
		inst._zod.bag.contentEncoding = "base64url";
	});
	inst._zod.check = (payload) => {
		if (isValidBase64URL(payload.value)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "base64url",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
	def.pattern ?? (def.pattern = e164);
	$ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
	try {
		const tokensParts = token.split(".");
		if (tokensParts.length !== 3) return false;
		const [header] = tokensParts;
		if (!header) return false;
		const parsedHeader = JSON.parse(atob(header));
		if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
		if (!parsedHeader.alg) return false;
		if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
		return true;
	} catch {
		return false;
	}
}
var $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	inst._zod.check = (payload) => {
		if (isValidJWT(payload.value, def.alg)) return;
		payload.issues.push({
			code: "invalid_format",
			format: "jwt",
			input: payload.value,
			inst,
			continue: !def.abort
		});
	};
});
var $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Number(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
		const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
		payload.issues.push({
			expected: "number",
			code: "invalid_type",
			input,
			inst,
			...received ? { received } : {}
		});
		return payload;
	};
});
var $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
	$ZodCheckNumberFormat.init(inst, def);
	$ZodNumber.init(inst, def);
});
var $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = boolean$1;
	inst._zod.parse = (payload, _ctx) => {
		if (def.coerce) try {
			payload.value = Boolean(payload.value);
		} catch (_) {}
		const input = payload.value;
		if (typeof input === "boolean") return payload;
		payload.issues.push({
			expected: "boolean",
			code: "invalid_type",
			input,
			inst
		});
		return payload;
	};
});
var $ZodNull = /*@__PURE__*/ $constructor("$ZodNull", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.pattern = _null$2;
	inst._zod.values = /* @__PURE__ */ new Set([null]);
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (input === null) return payload;
		payload.issues.push({
			expected: "null",
			code: "invalid_type",
			input,
			inst
		});
		return payload;
	};
});
var $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload) => payload;
});
var $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.issues.push({
			expected: "never",
			code: "invalid_type",
			input: payload.value,
			inst
		});
		return payload;
	};
});
function handleArrayResult(result, final, index) {
	if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
	final.value[index] = result.value;
}
var $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!Array.isArray(input)) {
			payload.issues.push({
				expected: "array",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		payload.value = Array(input.length);
		const proms = [];
		for (let i = 0; i < input.length; i++) {
			const item = input[i];
			const result = def.element._zod.run({
				value: item,
				issues: []
			}, ctx);
			if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
			else handleArrayResult(result, payload, i);
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
function handleObjectResult(result, final, key) {
	if (result.issues.length) final.issues.push(...prefixIssues(key, result.issues));
	final.value[key] = result.value;
}
function handleOptionalObjectResult(result, final, key, input) {
	if (result.issues.length) if (input[key] === void 0) if (key in input) final.value[key] = void 0;
	else final.value[key] = result.value;
	else final.issues.push(...prefixIssues(key, result.issues));
	else if (result.value === void 0) {
		if (key in input) final.value[key] = void 0;
	} else final.value[key] = result.value;
}
var $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
	$ZodType.init(inst, def);
	const _normalized = cached(() => {
		const keys = Object.keys(def.shape);
		for (const k of keys) if (!(def.shape[k] instanceof $ZodType)) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
		const okeys = optionalKeys(def.shape);
		return {
			shape: def.shape,
			keys,
			keySet: new Set(keys),
			numKeys: keys.length,
			optionalKeys: new Set(okeys)
		};
	});
	defineLazy(inst._zod, "propValues", () => {
		const shape = def.shape;
		const propValues = {};
		for (const key in shape) {
			const field = shape[key]._zod;
			if (field.values) {
				propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
				for (const v of field.values) propValues[key].add(v);
			}
		}
		return propValues;
	});
	const generateFastpass = (shape) => {
		const doc = new Doc([
			"shape",
			"payload",
			"ctx"
		]);
		const normalized = _normalized.value;
		const parseStr = (key) => {
			const k = esc(key);
			return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
		};
		doc.write(`const input = payload.value;`);
		const ids = Object.create(null);
		let counter = 0;
		for (const key of normalized.keys) ids[key] = `key_${counter++}`;
		doc.write(`const newResult = {}`);
		for (const key of normalized.keys) if (normalized.optionalKeys.has(key)) {
			const id = ids[key];
			doc.write(`const ${id} = ${parseStr(key)};`);
			const k = esc(key);
			doc.write(`
        if (${id}.issues.length) {
          if (input[${k}] === undefined) {
            if (${k} in input) {
              newResult[${k}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${id}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${k}, ...iss.path] : [${k}],
              }))
            );
          }
        } else if (${id}.value === undefined) {
          if (${k} in input) newResult[${k}] = undefined;
        } else {
          newResult[${k}] = ${id}.value;
        }
        `);
		} else {
			const id = ids[key];
			doc.write(`const ${id} = ${parseStr(key)};`);
			doc.write(`
          if (${id}.issues.length) payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${esc(key)}, ...iss.path] : [${esc(key)}]
          })));`);
			doc.write(`newResult[${esc(key)}] = ${id}.value`);
		}
		doc.write(`payload.value = newResult;`);
		doc.write(`return payload;`);
		const fn = doc.compile();
		return (payload, ctx) => fn(shape, payload, ctx);
	};
	let fastpass;
	const isObject$1 = isObject;
	const jit = !globalConfig.jitless;
	const fastEnabled = jit && allowsEval.value;
	const catchall = def.catchall;
	let value;
	inst._zod.parse = (payload, ctx) => {
		value ?? (value = _normalized.value);
		const input = payload.value;
		if (!isObject$1(input)) {
			payload.issues.push({
				expected: "object",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		const proms = [];
		if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
			if (!fastpass) fastpass = generateFastpass(def.shape);
			payload = fastpass(payload, ctx);
		} else {
			payload.value = {};
			const shape = value.shape;
			for (const key of value.keys) {
				const el = shape[key];
				const r = el._zod.run({
					value: input[key],
					issues: []
				}, ctx);
				const isOptional = el._zod.optin === "optional" && el._zod.optout === "optional";
				if (r instanceof Promise) proms.push(r.then((r) => isOptional ? handleOptionalObjectResult(r, payload, key, input) : handleObjectResult(r, payload, key)));
				else if (isOptional) handleOptionalObjectResult(r, payload, key, input);
				else handleObjectResult(r, payload, key);
			}
		}
		if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
		const unrecognized = [];
		const keySet = value.keySet;
		const _catchall = catchall._zod;
		const t = _catchall.def.type;
		for (const key of Object.keys(input)) {
			if (keySet.has(key)) continue;
			if (t === "never") {
				unrecognized.push(key);
				continue;
			}
			const r = _catchall.run({
				value: input[key],
				issues: []
			}, ctx);
			if (r instanceof Promise) proms.push(r.then((r) => handleObjectResult(r, payload, key)));
			else handleObjectResult(r, payload, key);
		}
		if (unrecognized.length) payload.issues.push({
			code: "unrecognized_keys",
			keys: unrecognized,
			input,
			inst
		});
		if (!proms.length) return payload;
		return Promise.all(proms).then(() => {
			return payload;
		});
	};
});
function handleUnionResults(results, final, inst, ctx) {
	for (const result of results) if (result.issues.length === 0) {
		final.value = result.value;
		return final;
	}
	final.issues.push({
		code: "invalid_union",
		input: final.value,
		inst,
		errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
	});
	return final;
}
var $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
	defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
	defineLazy(inst._zod, "values", () => {
		if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
	});
	defineLazy(inst._zod, "pattern", () => {
		if (def.options.every((o) => o._zod.pattern)) {
			const patterns = def.options.map((o) => o._zod.pattern);
			return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
		}
	});
	inst._zod.parse = (payload, ctx) => {
		let async = false;
		const results = [];
		for (const option of def.options) {
			const result = option._zod.run({
				value: payload.value,
				issues: []
			}, ctx);
			if (result instanceof Promise) {
				results.push(result);
				async = true;
			} else {
				if (result.issues.length === 0) return result;
				results.push(result);
			}
		}
		if (!async) return handleUnionResults(results, payload, inst, ctx);
		return Promise.all(results).then((results) => {
			return handleUnionResults(results, payload, inst, ctx);
		});
	};
});
var $ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	const _super = inst._zod.parse;
	defineLazy(inst._zod, "propValues", () => {
		const propValues = {};
		for (const option of def.options) {
			const pv = option._zod.propValues;
			if (!pv || Object.keys(pv).length === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
			for (const [k, v] of Object.entries(pv)) {
				if (!propValues[k]) propValues[k] = /* @__PURE__ */ new Set();
				for (const val of v) propValues[k].add(val);
			}
		}
		return propValues;
	});
	const disc = cached(() => {
		const opts = def.options;
		const map = /* @__PURE__ */ new Map();
		for (const o of opts) {
			const values = o._zod.propValues[def.discriminator];
			if (!values || values.size === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
			for (const v of values) {
				if (map.has(v)) throw new Error(`Duplicate discriminator value "${String(v)}"`);
				map.set(v, o);
			}
		}
		return map;
	});
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!isObject(input)) {
			payload.issues.push({
				code: "invalid_type",
				expected: "object",
				input,
				inst
			});
			return payload;
		}
		const opt = disc.value.get(input?.[def.discriminator]);
		if (opt) return opt._zod.run(payload, ctx);
		if (def.unionFallback) return _super(payload, ctx);
		payload.issues.push({
			code: "invalid_union",
			errors: [],
			note: "No matching discriminator",
			input,
			path: [def.discriminator],
			inst
		});
		return payload;
	};
});
var $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		const left = def.left._zod.run({
			value: input,
			issues: []
		}, ctx);
		const right = def.right._zod.run({
			value: input,
			issues: []
		}, ctx);
		if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
			return handleIntersectionResults(payload, left, right);
		});
		return handleIntersectionResults(payload, left, right);
	};
});
function mergeValues(a, b) {
	if (a === b) return {
		valid: true,
		data: a
	};
	if (a instanceof Date && b instanceof Date && +a === +b) return {
		valid: true,
		data: a
	};
	if (isPlainObject(a) && isPlainObject(b)) {
		const bKeys = Object.keys(b);
		const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
		const newObj = {
			...a,
			...b
		};
		for (const key of sharedKeys) {
			const sharedValue = mergeValues(a[key], b[key]);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
			};
			newObj[key] = sharedValue.data;
		}
		return {
			valid: true,
			data: newObj
		};
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return {
			valid: false,
			mergeErrorPath: []
		};
		const newArray = [];
		for (let index = 0; index < a.length; index++) {
			const itemA = a[index];
			const itemB = b[index];
			const sharedValue = mergeValues(itemA, itemB);
			if (!sharedValue.valid) return {
				valid: false,
				mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
			};
			newArray.push(sharedValue.data);
		}
		return {
			valid: true,
			data: newArray
		};
	}
	return {
		valid: false,
		mergeErrorPath: []
	};
}
function handleIntersectionResults(result, left, right) {
	if (left.issues.length) result.issues.push(...left.issues);
	if (right.issues.length) result.issues.push(...right.issues);
	if (aborted(result)) return result;
	const merged = mergeValues(left.value, right.value);
	if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
	result.value = merged.data;
	return result;
}
var $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, ctx) => {
		const input = payload.value;
		if (!isPlainObject(input)) {
			payload.issues.push({
				expected: "record",
				code: "invalid_type",
				input,
				inst
			});
			return payload;
		}
		const proms = [];
		if (def.keyType._zod.values) {
			const values = def.keyType._zod.values;
			payload.value = {};
			for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
				const result = def.valueType._zod.run({
					value: input[key],
					issues: []
				}, ctx);
				if (result instanceof Promise) proms.push(result.then((result) => {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[key] = result.value;
				}));
				else {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[key] = result.value;
				}
			}
			let unrecognized;
			for (const key in input) if (!values.has(key)) {
				unrecognized = unrecognized ?? [];
				unrecognized.push(key);
			}
			if (unrecognized && unrecognized.length > 0) payload.issues.push({
				code: "unrecognized_keys",
				input,
				inst,
				keys: unrecognized
			});
		} else {
			payload.value = {};
			for (const key of Reflect.ownKeys(input)) {
				if (key === "__proto__") continue;
				const keyResult = def.keyType._zod.run({
					value: key,
					issues: []
				}, ctx);
				if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
				if (keyResult.issues.length) {
					payload.issues.push({
						origin: "record",
						code: "invalid_key",
						issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
						input: key,
						path: [key],
						inst
					});
					payload.value[keyResult.value] = keyResult.value;
					continue;
				}
				const result = def.valueType._zod.run({
					value: input[key],
					issues: []
				}, ctx);
				if (result instanceof Promise) proms.push(result.then((result) => {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[keyResult.value] = result.value;
				}));
				else {
					if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
					payload.value[keyResult.value] = result.value;
				}
			}
		}
		if (proms.length) return Promise.all(proms).then(() => payload);
		return payload;
	};
});
var $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
	$ZodType.init(inst, def);
	const values = getEnumValues(def.entries);
	inst._zod.values = new Set(values);
	inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (inst._zod.values.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values,
			input,
			inst
		});
		return payload;
	};
});
var $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.values = new Set(def.values);
	inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? o.toString() : String(o)).join("|")})$`);
	inst._zod.parse = (payload, _ctx) => {
		const input = payload.value;
		if (inst._zod.values.has(input)) return payload;
		payload.issues.push({
			code: "invalid_value",
			values: def.values,
			input,
			inst
		});
		return payload;
	};
});
var $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		const _out = def.transform(payload.value, payload);
		if (_ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
			payload.value = output;
			return payload;
		});
		if (_out instanceof Promise) throw new $ZodAsyncError();
		payload.value = _out;
		return payload;
	};
});
var $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	inst._zod.optout = "optional";
	defineLazy(inst._zod, "values", () => {
		return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
	});
	defineLazy(inst._zod, "pattern", () => {
		const pattern = def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (def.innerType._zod.optin === "optional") return def.innerType._zod.run(payload, ctx);
		if (payload.value === void 0) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	defineLazy(inst._zod, "pattern", () => {
		const pattern = def.innerType._zod.pattern;
		return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
	});
	defineLazy(inst._zod, "values", () => {
		return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === null) return payload;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === void 0) {
			payload.value = def.defaultValue;
			/**
			* $ZodDefault always returns the default value immediately.
			* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
			return payload;
		}
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
		return handleDefaultResult(result, def);
	};
});
function handleDefaultResult(payload, def) {
	if (payload.value === void 0) payload.value = def.defaultValue;
	return payload;
}
var $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		if (payload.value === void 0) payload.value = def.defaultValue;
		return def.innerType._zod.run(payload, ctx);
	};
});
var $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "values", () => {
		const v = def.innerType._zod.values;
		return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
	});
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
		return handleNonOptionalResult(result, inst);
	};
});
function handleNonOptionalResult(payload, inst) {
	if (!payload.issues.length && payload.value === void 0) payload.issues.push({
		code: "invalid_type",
		expected: "nonoptional",
		input: payload.value,
		inst
	});
	return payload;
}
var $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
	$ZodType.init(inst, def);
	inst._zod.optin = "optional";
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then((result) => {
			payload.value = result.value;
			if (result.issues.length) {
				payload.value = def.catchValue({
					...payload,
					error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
					input: payload.value
				});
				payload.issues = [];
			}
			return payload;
		});
		payload.value = result.value;
		if (result.issues.length) {
			payload.value = def.catchValue({
				...payload,
				error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
				input: payload.value
			});
			payload.issues = [];
		}
		return payload;
	};
});
var $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "values", () => def.in._zod.values);
	defineLazy(inst._zod, "optin", () => def.in._zod.optin);
	defineLazy(inst._zod, "optout", () => def.out._zod.optout);
	inst._zod.parse = (payload, ctx) => {
		const left = def.in._zod.run(payload, ctx);
		if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def, ctx));
		return handlePipeResult(left, def, ctx);
	};
});
function handlePipeResult(left, def, ctx) {
	if (aborted(left)) return left;
	return def.out._zod.run({
		value: left.value,
		issues: left.issues
	}, ctx);
}
var $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
	defineLazy(inst._zod, "values", () => def.innerType._zod.values);
	defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
	defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
	inst._zod.parse = (payload, ctx) => {
		const result = def.innerType._zod.run(payload, ctx);
		if (result instanceof Promise) return result.then(handleReadonlyResult);
		return handleReadonlyResult(result);
	};
});
function handleReadonlyResult(payload) {
	payload.value = Object.freeze(payload.value);
	return payload;
}
var $ZodLazy = /*@__PURE__*/ $constructor("$ZodLazy", (inst, def) => {
	$ZodType.init(inst, def);
	defineLazy(inst._zod, "innerType", () => def.getter());
	defineLazy(inst._zod, "pattern", () => inst._zod.innerType._zod.pattern);
	defineLazy(inst._zod, "propValues", () => inst._zod.innerType._zod.propValues);
	defineLazy(inst._zod, "optin", () => inst._zod.innerType._zod.optin);
	defineLazy(inst._zod, "optout", () => inst._zod.innerType._zod.optout);
	inst._zod.parse = (payload, ctx) => {
		return inst._zod.innerType._zod.run(payload, ctx);
	};
});
var $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
	$ZodCheck.init(inst, def);
	$ZodType.init(inst, def);
	inst._zod.parse = (payload, _) => {
		return payload;
	};
	inst._zod.check = (payload) => {
		const input = payload.value;
		const r = def.fn(input);
		if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
		handleRefineResult(r, payload, input, inst);
	};
});
function handleRefineResult(result, payload, input, inst) {
	if (!result) {
		const _iss = {
			code: "custom",
			input,
			inst,
			path: [...inst._zod.def.path ?? []],
			continue: !inst._zod.def.abort
		};
		if (inst._zod.def.params) _iss.params = inst._zod.def.params;
		payload.issues.push(issue(_iss));
	}
}
//#endregion
//#region node_modules/zod/v4/core/api.js
function _string(Class, params) {
	return new Class({
		type: "string",
		...normalizeParams(params)
	});
}
function _email(Class, params) {
	return new Class({
		type: "string",
		format: "email",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _guid(Class, params) {
	return new Class({
		type: "string",
		format: "guid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _uuid(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _uuidv4(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v4",
		...normalizeParams(params)
	});
}
function _uuidv6(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v6",
		...normalizeParams(params)
	});
}
function _uuidv7(Class, params) {
	return new Class({
		type: "string",
		format: "uuid",
		check: "string_format",
		abort: false,
		version: "v7",
		...normalizeParams(params)
	});
}
function _url(Class, params) {
	return new Class({
		type: "string",
		format: "url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _emoji(Class, params) {
	return new Class({
		type: "string",
		format: "emoji",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _nanoid(Class, params) {
	return new Class({
		type: "string",
		format: "nanoid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _cuid(Class, params) {
	return new Class({
		type: "string",
		format: "cuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _cuid2(Class, params) {
	return new Class({
		type: "string",
		format: "cuid2",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _ulid(Class, params) {
	return new Class({
		type: "string",
		format: "ulid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _xid(Class, params) {
	return new Class({
		type: "string",
		format: "xid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _ksuid(Class, params) {
	return new Class({
		type: "string",
		format: "ksuid",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _ipv4(Class, params) {
	return new Class({
		type: "string",
		format: "ipv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _ipv6(Class, params) {
	return new Class({
		type: "string",
		format: "ipv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _cidrv4(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv4",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _cidrv6(Class, params) {
	return new Class({
		type: "string",
		format: "cidrv6",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _base64(Class, params) {
	return new Class({
		type: "string",
		format: "base64",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _base64url(Class, params) {
	return new Class({
		type: "string",
		format: "base64url",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _e164(Class, params) {
	return new Class({
		type: "string",
		format: "e164",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _jwt(Class, params) {
	return new Class({
		type: "string",
		format: "jwt",
		check: "string_format",
		abort: false,
		...normalizeParams(params)
	});
}
function _isoDateTime(Class, params) {
	return new Class({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: false,
		local: false,
		precision: null,
		...normalizeParams(params)
	});
}
function _isoDate(Class, params) {
	return new Class({
		type: "string",
		format: "date",
		check: "string_format",
		...normalizeParams(params)
	});
}
function _isoTime(Class, params) {
	return new Class({
		type: "string",
		format: "time",
		check: "string_format",
		precision: null,
		...normalizeParams(params)
	});
}
function _isoDuration(Class, params) {
	return new Class({
		type: "string",
		format: "duration",
		check: "string_format",
		...normalizeParams(params)
	});
}
function _number(Class, params) {
	return new Class({
		type: "number",
		checks: [],
		...normalizeParams(params)
	});
}
function _int(Class, params) {
	return new Class({
		type: "number",
		check: "number_format",
		abort: false,
		format: "safeint",
		...normalizeParams(params)
	});
}
function _boolean(Class, params) {
	return new Class({
		type: "boolean",
		...normalizeParams(params)
	});
}
function _null$1(Class, params) {
	return new Class({
		type: "null",
		...normalizeParams(params)
	});
}
function _unknown(Class) {
	return new Class({ type: "unknown" });
}
function _never(Class, params) {
	return new Class({
		type: "never",
		...normalizeParams(params)
	});
}
function _lt(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
function _lte(value, params) {
	return new $ZodCheckLessThan({
		check: "less_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
function _gt(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: false
	});
}
function _gte(value, params) {
	return new $ZodCheckGreaterThan({
		check: "greater_than",
		...normalizeParams(params),
		value,
		inclusive: true
	});
}
function _multipleOf(value, params) {
	return new $ZodCheckMultipleOf({
		check: "multiple_of",
		...normalizeParams(params),
		value
	});
}
function _maxLength(maximum, params) {
	return new $ZodCheckMaxLength({
		check: "max_length",
		...normalizeParams(params),
		maximum
	});
}
function _minLength(minimum, params) {
	return new $ZodCheckMinLength({
		check: "min_length",
		...normalizeParams(params),
		minimum
	});
}
function _length(length, params) {
	return new $ZodCheckLengthEquals({
		check: "length_equals",
		...normalizeParams(params),
		length
	});
}
function _regex(pattern, params) {
	return new $ZodCheckRegex({
		check: "string_format",
		format: "regex",
		...normalizeParams(params),
		pattern
	});
}
function _lowercase(params) {
	return new $ZodCheckLowerCase({
		check: "string_format",
		format: "lowercase",
		...normalizeParams(params)
	});
}
function _uppercase(params) {
	return new $ZodCheckUpperCase({
		check: "string_format",
		format: "uppercase",
		...normalizeParams(params)
	});
}
function _includes(includes, params) {
	return new $ZodCheckIncludes({
		check: "string_format",
		format: "includes",
		...normalizeParams(params),
		includes
	});
}
function _startsWith(prefix, params) {
	return new $ZodCheckStartsWith({
		check: "string_format",
		format: "starts_with",
		...normalizeParams(params),
		prefix
	});
}
function _endsWith(suffix, params) {
	return new $ZodCheckEndsWith({
		check: "string_format",
		format: "ends_with",
		...normalizeParams(params),
		suffix
	});
}
function _overwrite(tx) {
	return new $ZodCheckOverwrite({
		check: "overwrite",
		tx
	});
}
function _normalize(form) {
	return _overwrite((input) => input.normalize(form));
}
function _trim() {
	return _overwrite((input) => input.trim());
}
function _toLowerCase() {
	return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
	return _overwrite((input) => input.toUpperCase());
}
function _array(Class, element, params) {
	return new Class({
		type: "array",
		element,
		...normalizeParams(params)
	});
}
function _custom(Class, fn, _params) {
	const norm = normalizeParams(_params);
	norm.abort ?? (norm.abort = true);
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...norm
	});
}
function _refine(Class, fn, _params) {
	return new Class({
		type: "custom",
		check: "custom",
		fn,
		...normalizeParams(_params)
	});
}
//#endregion
//#region node_modules/zod/v4/classic/iso.js
var ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
	$ZodISODateTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function datetime(params) {
	return _isoDateTime(ZodISODateTime, params);
}
var ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
	$ZodISODate.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function date(params) {
	return _isoDate(ZodISODate, params);
}
var ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
	$ZodISOTime.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function time(params) {
	return _isoTime(ZodISOTime, params);
}
var ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
	$ZodISODuration.init(inst, def);
	ZodStringFormat.init(inst, def);
});
function duration(params) {
	return _isoDuration(ZodISODuration, params);
}
//#endregion
//#region node_modules/zod/v4/classic/schemas.js
var ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
	$ZodType.init(inst, def);
	inst.def = def;
	Object.defineProperty(inst, "_def", { value: def });
	inst.check = (...checks) => {
		return inst.clone({
			...def,
			checks: [...def.checks ?? [], ...checks.map((ch) => typeof ch === "function" ? { _zod: {
				check: ch,
				def: { check: "custom" },
				onattach: []
			} } : ch)]
		});
	};
	inst.clone = (def, params) => clone(inst, def, params);
	inst.brand = () => inst;
	inst.register = ((reg, meta) => {
		reg.add(inst, meta);
		return inst;
	});
	inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
	inst.safeParse = (data, params) => safeParse$1(inst, data, params);
	inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
	inst.safeParseAsync = async (data, params) => safeParseAsync$1(inst, data, params);
	inst.spa = inst.safeParseAsync;
	inst.refine = (check, params) => inst.check(refine(check, params));
	inst.superRefine = (refinement) => inst.check(superRefine(refinement));
	inst.overwrite = (fn) => inst.check(_overwrite(fn));
	inst.optional = () => optional(inst);
	inst.nullable = () => nullable(inst);
	inst.nullish = () => optional(nullable(inst));
	inst.nonoptional = (params) => nonoptional(inst, params);
	inst.array = () => array(inst);
	inst.or = (arg) => union([inst, arg]);
	inst.and = (arg) => intersection(inst, arg);
	inst.transform = (tx) => pipe(inst, transform(tx));
	inst.default = (def) => _default(inst, def);
	inst.prefault = (def) => prefault(inst, def);
	inst.catch = (params) => _catch(inst, params);
	inst.pipe = (target) => pipe(inst, target);
	inst.readonly = () => readonly(inst);
	inst.describe = (description) => {
		const cl = inst.clone();
		globalRegistry.add(cl, { description });
		return cl;
	};
	Object.defineProperty(inst, "description", {
		get() {
			return globalRegistry.get(inst)?.description;
		},
		configurable: true
	});
	inst.meta = (...args) => {
		if (args.length === 0) return globalRegistry.get(inst);
		const cl = inst.clone();
		globalRegistry.add(cl, args[0]);
		return cl;
	};
	inst.isOptional = () => inst.safeParse(void 0).success;
	inst.isNullable = () => inst.safeParse(null).success;
	return inst;
});
/** @internal */
var _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	ZodType.init(inst, def);
	const bag = inst._zod.bag;
	inst.format = bag.format ?? null;
	inst.minLength = bag.minimum ?? null;
	inst.maxLength = bag.maximum ?? null;
	inst.regex = (...args) => inst.check(_regex(...args));
	inst.includes = (...args) => inst.check(_includes(...args));
	inst.startsWith = (...args) => inst.check(_startsWith(...args));
	inst.endsWith = (...args) => inst.check(_endsWith(...args));
	inst.min = (...args) => inst.check(_minLength(...args));
	inst.max = (...args) => inst.check(_maxLength(...args));
	inst.length = (...args) => inst.check(_length(...args));
	inst.nonempty = (...args) => inst.check(_minLength(1, ...args));
	inst.lowercase = (params) => inst.check(_lowercase(params));
	inst.uppercase = (params) => inst.check(_uppercase(params));
	inst.trim = () => inst.check(_trim());
	inst.normalize = (...args) => inst.check(_normalize(...args));
	inst.toLowerCase = () => inst.check(_toLowerCase());
	inst.toUpperCase = () => inst.check(_toUpperCase());
});
var ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
	$ZodString.init(inst, def);
	_ZodString.init(inst, def);
	inst.email = (params) => inst.check(_email(ZodEmail, params));
	inst.url = (params) => inst.check(_url(ZodURL, params));
	inst.jwt = (params) => inst.check(_jwt(ZodJWT, params));
	inst.emoji = (params) => inst.check(_emoji(ZodEmoji, params));
	inst.guid = (params) => inst.check(_guid(ZodGUID, params));
	inst.uuid = (params) => inst.check(_uuid(ZodUUID, params));
	inst.uuidv4 = (params) => inst.check(_uuidv4(ZodUUID, params));
	inst.uuidv6 = (params) => inst.check(_uuidv6(ZodUUID, params));
	inst.uuidv7 = (params) => inst.check(_uuidv7(ZodUUID, params));
	inst.nanoid = (params) => inst.check(_nanoid(ZodNanoID, params));
	inst.guid = (params) => inst.check(_guid(ZodGUID, params));
	inst.cuid = (params) => inst.check(_cuid(ZodCUID, params));
	inst.cuid2 = (params) => inst.check(_cuid2(ZodCUID2, params));
	inst.ulid = (params) => inst.check(_ulid(ZodULID, params));
	inst.base64 = (params) => inst.check(_base64(ZodBase64, params));
	inst.base64url = (params) => inst.check(_base64url(ZodBase64URL, params));
	inst.xid = (params) => inst.check(_xid(ZodXID, params));
	inst.ksuid = (params) => inst.check(_ksuid(ZodKSUID, params));
	inst.ipv4 = (params) => inst.check(_ipv4(ZodIPv4, params));
	inst.ipv6 = (params) => inst.check(_ipv6(ZodIPv6, params));
	inst.cidrv4 = (params) => inst.check(_cidrv4(ZodCIDRv4, params));
	inst.cidrv6 = (params) => inst.check(_cidrv6(ZodCIDRv6, params));
	inst.e164 = (params) => inst.check(_e164(ZodE164, params));
	inst.datetime = (params) => inst.check(datetime(params));
	inst.date = (params) => inst.check(date(params));
	inst.time = (params) => inst.check(time(params));
	inst.duration = (params) => inst.check(duration(params));
});
function string(params) {
	return _string(ZodString, params);
}
var ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
	$ZodStringFormat.init(inst, def);
	_ZodString.init(inst, def);
});
var ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
	$ZodEmail.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
	$ZodGUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
	$ZodUUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
	$ZodURL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
	$ZodEmoji.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
	$ZodNanoID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
	$ZodCUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
	$ZodCUID2.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
	$ZodULID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
	$ZodXID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
	$ZodKSUID.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
	$ZodIPv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
	$ZodIPv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
	$ZodCIDRv4.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
	$ZodCIDRv6.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
	$ZodBase64.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
	$ZodBase64URL.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
	$ZodE164.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
	$ZodJWT.init(inst, def);
	ZodStringFormat.init(inst, def);
});
var ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
	$ZodNumber.init(inst, def);
	ZodType.init(inst, def);
	inst.gt = (value, params) => inst.check(_gt(value, params));
	inst.gte = (value, params) => inst.check(_gte(value, params));
	inst.min = (value, params) => inst.check(_gte(value, params));
	inst.lt = (value, params) => inst.check(_lt(value, params));
	inst.lte = (value, params) => inst.check(_lte(value, params));
	inst.max = (value, params) => inst.check(_lte(value, params));
	inst.int = (params) => inst.check(int(params));
	inst.safe = (params) => inst.check(int(params));
	inst.positive = (params) => inst.check(_gt(0, params));
	inst.nonnegative = (params) => inst.check(_gte(0, params));
	inst.negative = (params) => inst.check(_lt(0, params));
	inst.nonpositive = (params) => inst.check(_lte(0, params));
	inst.multipleOf = (value, params) => inst.check(_multipleOf(value, params));
	inst.step = (value, params) => inst.check(_multipleOf(value, params));
	inst.finite = () => inst;
	const bag = inst._zod.bag;
	inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
	inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
	inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
	inst.isFinite = true;
	inst.format = bag.format ?? null;
});
function number(params) {
	return _number(ZodNumber, params);
}
var ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
	$ZodNumberFormat.init(inst, def);
	ZodNumber.init(inst, def);
});
function int(params) {
	return _int(ZodNumberFormat, params);
}
var ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
	$ZodBoolean.init(inst, def);
	ZodType.init(inst, def);
});
function boolean(params) {
	return _boolean(ZodBoolean, params);
}
var ZodNull = /*@__PURE__*/ $constructor("ZodNull", (inst, def) => {
	$ZodNull.init(inst, def);
	ZodType.init(inst, def);
});
function _null(params) {
	return _null$1(ZodNull, params);
}
var ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
	$ZodUnknown.init(inst, def);
	ZodType.init(inst, def);
});
function unknown() {
	return _unknown(ZodUnknown);
}
var ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
	$ZodNever.init(inst, def);
	ZodType.init(inst, def);
});
function never(params) {
	return _never(ZodNever, params);
}
var ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
	$ZodArray.init(inst, def);
	ZodType.init(inst, def);
	inst.element = def.element;
	inst.min = (minLength, params) => inst.check(_minLength(minLength, params));
	inst.nonempty = (params) => inst.check(_minLength(1, params));
	inst.max = (maxLength, params) => inst.check(_maxLength(maxLength, params));
	inst.length = (len, params) => inst.check(_length(len, params));
	inst.unwrap = () => inst.element;
});
function array(element, params) {
	return _array(ZodArray, element, params);
}
var ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
	$ZodObject.init(inst, def);
	ZodType.init(inst, def);
	defineLazy(inst, "shape", () => def.shape);
	inst.keyof = () => _enum(Object.keys(inst._zod.def.shape));
	inst.catchall = (catchall) => inst.clone({
		...inst._zod.def,
		catchall
	});
	inst.passthrough = () => inst.clone({
		...inst._zod.def,
		catchall: unknown()
	});
	inst.loose = () => inst.clone({
		...inst._zod.def,
		catchall: unknown()
	});
	inst.strict = () => inst.clone({
		...inst._zod.def,
		catchall: never()
	});
	inst.strip = () => inst.clone({
		...inst._zod.def,
		catchall: void 0
	});
	inst.extend = (incoming) => {
		return extend(inst, incoming);
	};
	inst.merge = (other) => merge(inst, other);
	inst.pick = (mask) => pick(inst, mask);
	inst.omit = (mask) => omit(inst, mask);
	inst.partial = (...args) => partial(ZodOptional, inst, args[0]);
	inst.required = (...args) => required(ZodNonOptional, inst, args[0]);
});
function object(shape, params) {
	return new ZodObject({
		type: "object",
		get shape() {
			assignProp(this, "shape", { ...shape });
			return this.shape;
		},
		...normalizeParams(params)
	});
}
function looseObject(shape, params) {
	return new ZodObject({
		type: "object",
		get shape() {
			assignProp(this, "shape", { ...shape });
			return this.shape;
		},
		catchall: unknown(),
		...normalizeParams(params)
	});
}
var ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
	$ZodUnion.init(inst, def);
	ZodType.init(inst, def);
	inst.options = def.options;
});
function union(options, params) {
	return new ZodUnion({
		type: "union",
		options,
		...normalizeParams(params)
	});
}
var ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("ZodDiscriminatedUnion", (inst, def) => {
	ZodUnion.init(inst, def);
	$ZodDiscriminatedUnion.init(inst, def);
});
function discriminatedUnion(discriminator, options, params) {
	return new ZodDiscriminatedUnion({
		type: "union",
		options,
		discriminator,
		...normalizeParams(params)
	});
}
var ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
	$ZodIntersection.init(inst, def);
	ZodType.init(inst, def);
});
function intersection(left, right) {
	return new ZodIntersection({
		type: "intersection",
		left,
		right
	});
}
var ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
	$ZodRecord.init(inst, def);
	ZodType.init(inst, def);
	inst.keyType = def.keyType;
	inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
	return new ZodRecord({
		type: "record",
		keyType,
		valueType,
		...normalizeParams(params)
	});
}
var ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
	$ZodEnum.init(inst, def);
	ZodType.init(inst, def);
	inst.enum = def.entries;
	inst.options = Object.values(def.entries);
	const keys = new Set(Object.keys(def.entries));
	inst.extract = (values, params) => {
		const newEntries = {};
		for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
	inst.exclude = (values, params) => {
		const newEntries = { ...def.entries };
		for (const value of values) if (keys.has(value)) delete newEntries[value];
		else throw new Error(`Key ${value} not found in enum`);
		return new ZodEnum({
			...def,
			checks: [],
			...normalizeParams(params),
			entries: newEntries
		});
	};
});
function _enum(values, params) {
	return new ZodEnum({
		type: "enum",
		entries: Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values,
		...normalizeParams(params)
	});
}
var ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
	$ZodLiteral.init(inst, def);
	ZodType.init(inst, def);
	inst.values = new Set(def.values);
	Object.defineProperty(inst, "value", { get() {
		if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
		return def.values[0];
	} });
});
function literal(value, params) {
	return new ZodLiteral({
		type: "literal",
		values: Array.isArray(value) ? value : [value],
		...normalizeParams(params)
	});
}
var ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
	$ZodTransform.init(inst, def);
	ZodType.init(inst, def);
	inst._zod.parse = (payload, _ctx) => {
		payload.addIssue = (issue$2) => {
			if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, def));
			else {
				const _issue = issue$2;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = inst);
				_issue.continue ?? (_issue.continue = true);
				payload.issues.push(issue(_issue));
			}
		};
		const output = def.transform(payload.value, payload);
		if (output instanceof Promise) return output.then((output) => {
			payload.value = output;
			return payload;
		});
		payload.value = output;
		return payload;
	};
});
function transform(fn) {
	return new ZodTransform({
		type: "transform",
		transform: fn
	});
}
var ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
	$ZodOptional.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
	return new ZodOptional({
		type: "optional",
		innerType
	});
}
var ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
	$ZodNullable.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
	return new ZodNullable({
		type: "nullable",
		innerType
	});
}
var ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
	$ZodDefault.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
	return new ZodDefault({
		type: "default",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : defaultValue;
		}
	});
}
var ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
	$ZodPrefault.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
	return new ZodPrefault({
		type: "prefault",
		innerType,
		get defaultValue() {
			return typeof defaultValue === "function" ? defaultValue() : defaultValue;
		}
	});
}
var ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
	$ZodNonOptional.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
	return new ZodNonOptional({
		type: "nonoptional",
		innerType,
		...normalizeParams(params)
	});
}
var ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
	$ZodCatch.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.innerType;
	inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
	return new ZodCatch({
		type: "catch",
		innerType,
		catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
	});
}
var ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
	$ZodPipe.init(inst, def);
	ZodType.init(inst, def);
	inst.in = def.in;
	inst.out = def.out;
});
function pipe(in_, out) {
	return new ZodPipe({
		type: "pipe",
		in: in_,
		out
	});
}
var ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
	$ZodReadonly.init(inst, def);
	ZodType.init(inst, def);
});
function readonly(innerType) {
	return new ZodReadonly({
		type: "readonly",
		innerType
	});
}
var ZodLazy = /*@__PURE__*/ $constructor("ZodLazy", (inst, def) => {
	$ZodLazy.init(inst, def);
	ZodType.init(inst, def);
	inst.unwrap = () => inst._zod.def.getter();
});
function lazy(getter) {
	return new ZodLazy({
		type: "lazy",
		getter
	});
}
var ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
	$ZodCustom.init(inst, def);
	ZodType.init(inst, def);
});
function check(fn) {
	const ch = new $ZodCheck({ check: "custom" });
	ch._zod.check = fn;
	return ch;
}
function custom(fn, _params) {
	return _custom(ZodCustom, fn ?? (() => true), _params);
}
function refine(fn, _params = {}) {
	return _refine(ZodCustom, fn, _params);
}
function superRefine(fn) {
	const ch = check((payload) => {
		payload.addIssue = (issue$1) => {
			if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, ch._zod.def));
			else {
				const _issue = issue$1;
				if (_issue.fatal) _issue.continue = false;
				_issue.code ?? (_issue.code = "custom");
				_issue.input ?? (_issue.input = payload.value);
				_issue.inst ?? (_issue.inst = ch);
				_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
				payload.issues.push(issue(_issue));
			}
		};
		return fn(payload.value, payload);
	});
	return ch;
}
function _instanceof(cls, params = { error: `Input not instance of ${cls.name}` }) {
	const inst = new ZodCustom({
		type: "custom",
		check: "custom",
		fn: (data) => data instanceof cls,
		abort: true,
		...normalizeParams(params)
	});
	inst._zod.bag.Class = cls;
	return inst;
}
//#endregion
//#region node_modules/ai/dist/index.js
var name$23 = "AI_InvalidArgumentError";
var marker$23 = `vercel.ai.error.${name$23}`;
var symbol$23 = Symbol.for(marker$23);
var InvalidArgumentError = class extends AISDKError {
	constructor({ parameter, value, message }) {
		super({
			name: name$23,
			message: `Invalid argument for parameter ${parameter}: ${message}`
		});
		this[symbol$23] = true;
		this.parameter = parameter;
		this.value = value;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$23);
	}
};
var name$5 = "AI_UIMessageStreamError";
var marker$5 = `vercel.ai.error.${name$5}`;
var symbol$5 = Symbol.for(marker$5);
/**
* Error thrown when a UI message stream reports an error or contains invalid
* or out-of-sequence chunks.
*
* This typically occurs when:
* - An error chunk is received
* - A delta chunk is received without a corresponding start chunk
* - An end chunk is received without a corresponding start chunk
* - A tool invocation is not found for the given toolCallId
*
* @see https://ai-sdk.dev/docs/reference/ai-sdk-errors/ai-ui-message-stream-error
*/
var UIMessageStreamError = class extends AISDKError {
	constructor({ chunkType, chunkId, message }) {
		super({
			name: name$5,
			message
		});
		this[symbol$5] = true;
		this.chunkType = chunkType;
		this.chunkId = chunkId;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$5);
	}
};
/**
* Deeply merges two objects together.
* - Properties from the `overrides` object override those in the `base` object with the same key.
* - For nested objects, the merge is performed recursively (deep merge).
* - Arrays are replaced, not merged.
* - Primitive values are replaced.
* - If both `base` and `overrides` are undefined, returns undefined.
* - If one of `base` or `overrides` is undefined, returns the other.
*
* @param base The target object to merge into
* @param overrides The source object to merge from
* @returns A new object with the merged properties, or undefined if both inputs are undefined
*/
function mergeObjects(base, overrides) {
	if (base === void 0 && overrides === void 0) return;
	if (base === void 0) return overrides;
	if (overrides === void 0) return base;
	const result = { ...base };
	for (const key in overrides) {
		if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
		if (Object.prototype.hasOwnProperty.call(overrides, key)) {
			const overridesValue = overrides[key];
			if (overridesValue === void 0) continue;
			const baseValue = key in base ? base[key] : void 0;
			const isSourceObject = overridesValue !== null && typeof overridesValue === "object" && !Array.isArray(overridesValue) && !(overridesValue instanceof Date) && !(overridesValue instanceof RegExp);
			const isTargetObject = baseValue !== null && baseValue !== void 0 && typeof baseValue === "object" && !Array.isArray(baseValue) && !(baseValue instanceof Date) && !(baseValue instanceof RegExp);
			if (isSourceObject && isTargetObject) result[key] = mergeObjects(baseValue, overridesValue);
			else result[key] = overridesValue;
		}
	}
	return result;
}
var z = {
	array,
	boolean,
	custom,
	discriminatedUnion,
	enum: _enum,
	instanceof: _instanceof,
	lazy,
	literal,
	looseObject,
	never,
	null: _null,
	number,
	object,
	record,
	string,
	union,
	unknown
};
var jsonValueSchema = z.lazy(() => z.union([
	z.null(),
	z.string(),
	z.number(),
	z.boolean(),
	z.record(z.string(), jsonValueSchema.optional()),
	z.array(jsonValueSchema)
]));
var providerMetadataSchema = z.record(z.string(), z.record(z.string(), jsonValueSchema.optional()));
var fileInlineDataSchema = z.union([
	z.string(),
	z.instanceof(Uint8Array),
	z.instanceof(ArrayBuffer),
	z.custom(isBuffer, { message: "Must be a Buffer" })
]);
var providerReferenceSchema$1 = z.record(z.string(), z.string());
/**
* @internal
*/
var textPartSchema = z.object({
	type: z.literal("text"),
	text: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
* @deprecated Use `filePartSchema` with `mediaType: 'image'` instead:
* `{ type: 'file', mediaType: 'image', data: { type: 'data', data } }`.
*/
var imagePartSchema = z.object({
	type: z.literal("image"),
	image: z.union([
		fileInlineDataSchema,
		z.instanceof(URL),
		providerReferenceSchema$1
	]),
	mediaType: z.string().optional(),
	providerOptions: providerMetadataSchema.optional()
});
var taggedFileDataSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("data"),
		data: fileInlineDataSchema
	}),
	z.object({
		type: z.literal("url"),
		url: z.instanceof(URL)
	}),
	z.object({
		type: z.literal("reference"),
		reference: providerReferenceSchema$1
	}),
	z.object({
		type: z.literal("text"),
		text: z.string()
	})
]);
var taggedReasoningFileDataSchema = z.discriminatedUnion("type", [z.object({
	type: z.literal("data"),
	data: fileInlineDataSchema
}), z.object({
	type: z.literal("url"),
	url: z.instanceof(URL)
})]);
/**
* @internal
*/
var filePartSchema = z.object({
	type: z.literal("file"),
	data: z.union([
		taggedFileDataSchema,
		fileInlineDataSchema,
		z.instanceof(URL),
		providerReferenceSchema$1
	]),
	filename: z.string().optional(),
	mediaType: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var reasoningPartSchema = z.object({
	type: z.literal("reasoning"),
	text: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var customPartSchema = z.object({
	type: z.literal("custom"),
	kind: z.string().transform((value) => value),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var reasoningFilePartSchema = z.object({
	type: z.literal("reasoning-file"),
	data: z.union([
		taggedReasoningFileDataSchema,
		fileInlineDataSchema,
		z.instanceof(URL)
	]),
	mediaType: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var toolCallPartSchema = z.object({
	type: z.literal("tool-call"),
	toolCallId: z.string(),
	toolName: z.string(),
	input: z.unknown(),
	providerOptions: providerMetadataSchema.optional(),
	providerExecuted: z.boolean().optional()
});
/**
* @internal
*/
var outputSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("text"),
		value: z.string(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("json"),
		value: jsonValueSchema,
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("execution-denied"),
		reason: z.string().optional(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("error-text"),
		value: z.string(),
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("error-json"),
		value: jsonValueSchema,
		providerOptions: providerMetadataSchema.optional()
	}),
	z.object({
		type: z.literal("content"),
		value: z.array(z.union([
			z.object({
				type: z.literal("text"),
				text: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file"),
				data: taggedFileDataSchema,
				mediaType: z.string(),
				filename: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-data"),
				data: z.string(),
				mediaType: z.string(),
				filename: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-url"),
				url: z.string(),
				mediaType: z.string().optional(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-id"),
				fileId: z.union([z.string(), z.record(z.string(), z.string())]),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file-reference"),
				providerReference: z.record(z.string(), z.string()),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-data"),
				data: z.string(),
				mediaType: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-url"),
				url: z.string(),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-file-id"),
				fileId: z.union([z.string(), z.record(z.string(), z.string())]),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("image-file-reference"),
				providerReference: z.record(z.string(), z.string()),
				providerOptions: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("custom"),
				providerOptions: providerMetadataSchema.optional()
			})
		]))
	})
]);
/**
* @internal
*/
var toolResultPartSchema = z.object({
	type: z.literal("tool-result"),
	toolCallId: z.string(),
	toolName: z.string(),
	output: outputSchema,
	providerOptions: providerMetadataSchema.optional()
});
/**
* @internal
*/
var toolApprovalRequestSchema = z.object({
	type: z.literal("tool-approval-request"),
	approvalId: z.string(),
	toolCallId: z.string(),
	reason: z.string().optional(),
	isAutomatic: z.boolean().optional(),
	signature: z.string().optional(),
	inputSchemaInput: z.unknown().optional()
});
/**
* @internal
*/
var toolApprovalResponseSchema = z.object({
	type: z.literal("tool-approval-response"),
	approvalId: z.string(),
	approved: z.boolean(),
	reason: z.string().optional()
});
var systemModelMessageSchema = z.object({
	role: z.literal("system"),
	content: z.string(),
	providerOptions: providerMetadataSchema.optional()
});
var userModelMessageSchema = z.object({
	role: z.literal("user"),
	content: z.union([z.string(), z.array(z.union([
		textPartSchema,
		imagePartSchema,
		filePartSchema
	]))]),
	providerOptions: providerMetadataSchema.optional()
});
var assistantModelMessageSchema = z.object({
	role: z.literal("assistant"),
	content: z.union([z.string(), z.array(z.union([
		textPartSchema,
		customPartSchema,
		filePartSchema,
		reasoningPartSchema,
		reasoningFilePartSchema,
		toolCallPartSchema,
		toolResultPartSchema,
		toolApprovalRequestSchema
	]))]),
	providerOptions: providerMetadataSchema.optional()
});
var toolModelMessageSchema = z.object({
	role: z.literal("tool"),
	content: z.array(z.union([toolResultPartSchema, toolApprovalResponseSchema])),
	providerOptions: providerMetadataSchema.optional()
});
z.union([
	systemModelMessageSchema,
	userModelMessageSchema,
	assistantModelMessageSchema,
	toolModelMessageSchema
]);
function fixJson(input) {
	const stack = ["ROOT"];
	let lastValidIndex = -1;
	let literalStart = null;
	let unicodeEscapeDigits = 0;
	function isHexDigit(char) {
		return char >= "0" && char <= "9" || char >= "A" && char <= "F" || char >= "a" && char <= "f";
	}
	function processValueStart(char, i, swapState) {
		switch (char) {
			case "\"":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_STRING");
				break;
			case "f":
			case "t":
			case "n":
				lastValidIndex = i;
				literalStart = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_LITERAL");
				break;
			case "-":
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_NUMBER");
				break;
			case "0":
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			case "8":
			case "9":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_NUMBER");
				break;
			case "{":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_OBJECT_START");
				break;
			case "[":
				lastValidIndex = i;
				stack.pop();
				stack.push(swapState);
				stack.push("INSIDE_ARRAY_START");
		}
	}
	function processAfterObjectValue(char, i) {
		switch (char) {
			case ",":
				stack.pop();
				stack.push("INSIDE_OBJECT_AFTER_COMMA");
				break;
			case "}":
				lastValidIndex = i;
				stack.pop();
		}
	}
	function processAfterArrayValue(char, i) {
		switch (char) {
			case ",":
				stack.pop();
				stack.push("INSIDE_ARRAY_AFTER_COMMA");
				break;
			case "]":
				lastValidIndex = i;
				stack.pop();
		}
	}
	for (let i = 0; i < input.length; i++) {
		const char = input[i];
		switch (stack[stack.length - 1]) {
			case "ROOT":
				processValueStart(char, i, "FINISH");
				break;
			case "INSIDE_OBJECT_START":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_KEY");
						break;
					case "}":
						lastValidIndex = i;
						stack.pop();
				}
				break;
			case "INSIDE_OBJECT_AFTER_COMMA":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_KEY");
				}
				break;
			case "INSIDE_OBJECT_KEY":
				switch (char) {
					case "\"":
						stack.pop();
						stack.push("INSIDE_OBJECT_AFTER_KEY");
				}
				break;
			case "INSIDE_OBJECT_AFTER_KEY":
				switch (char) {
					case ":":
						stack.pop();
						stack.push("INSIDE_OBJECT_BEFORE_VALUE");
				}
				break;
			case "INSIDE_OBJECT_BEFORE_VALUE":
				processValueStart(char, i, "INSIDE_OBJECT_AFTER_VALUE");
				break;
			case "INSIDE_OBJECT_AFTER_VALUE":
				processAfterObjectValue(char, i);
				break;
			case "INSIDE_STRING":
				switch (char) {
					case "\"":
						stack.pop();
						lastValidIndex = i;
						break;
					case "\\":
						stack.push("INSIDE_STRING_ESCAPE");
						break;
					default: lastValidIndex = i;
				}
				break;
			case "INSIDE_ARRAY_START":
				switch (char) {
					case "]":
						lastValidIndex = i;
						stack.pop();
						break;
					default:
						lastValidIndex = i;
						processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
				}
				break;
			case "INSIDE_ARRAY_AFTER_VALUE":
				switch (char) {
					case ",":
						stack.pop();
						stack.push("INSIDE_ARRAY_AFTER_COMMA");
						break;
					case "]":
						lastValidIndex = i;
						stack.pop();
						break;
					default: lastValidIndex = i;
				}
				break;
			case "INSIDE_ARRAY_AFTER_COMMA":
				processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
				break;
			case "INSIDE_STRING_ESCAPE":
				stack.pop();
				if (char === "u") {
					unicodeEscapeDigits = 0;
					stack.push("INSIDE_STRING_UNICODE_ESCAPE");
				} else lastValidIndex = i;
				break;
			case "INSIDE_STRING_UNICODE_ESCAPE":
				if (isHexDigit(char)) {
					unicodeEscapeDigits++;
					if (unicodeEscapeDigits === 4) {
						stack.pop();
						lastValidIndex = i;
					}
				}
				break;
			case "INSIDE_NUMBER":
				switch (char) {
					case "0":
					case "1":
					case "2":
					case "3":
					case "4":
					case "5":
					case "6":
					case "7":
					case "8":
					case "9":
						lastValidIndex = i;
						break;
					case "e":
					case "E":
					case "-":
					case ".": break;
					case ",":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
						if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
						break;
					case "}":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
						break;
					case "]":
						stack.pop();
						if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
						break;
					default: stack.pop();
				}
				break;
			case "INSIDE_LITERAL": {
				const partialLiteral = input.substring(literalStart, i + 1);
				if (!"false".startsWith(partialLiteral) && !"true".startsWith(partialLiteral) && !"null".startsWith(partialLiteral)) {
					stack.pop();
					if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") processAfterObjectValue(char, i);
					else if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") processAfterArrayValue(char, i);
				} else lastValidIndex = i;
				break;
			}
		}
	}
	let result = input.slice(0, lastValidIndex + 1);
	for (let i = stack.length - 1; i >= 0; i--) switch (stack[i]) {
		case "INSIDE_STRING":
			result += "\"";
			break;
		case "INSIDE_OBJECT_KEY":
		case "INSIDE_OBJECT_AFTER_KEY":
		case "INSIDE_OBJECT_AFTER_COMMA":
		case "INSIDE_OBJECT_START":
		case "INSIDE_OBJECT_BEFORE_VALUE":
		case "INSIDE_OBJECT_AFTER_VALUE":
			result += "}";
			break;
		case "INSIDE_ARRAY_START":
		case "INSIDE_ARRAY_AFTER_COMMA":
		case "INSIDE_ARRAY_AFTER_VALUE":
			result += "]";
			break;
		case "INSIDE_LITERAL": {
			const partialLiteral = input.substring(literalStart, input.length);
			if ("true".startsWith(partialLiteral)) result += "true".slice(partialLiteral.length);
			else if ("false".startsWith(partialLiteral)) result += "false".slice(partialLiteral.length);
			else if ("null".startsWith(partialLiteral)) result += "null".slice(partialLiteral.length);
		}
	}
	return result;
}
async function parsePartialJson(jsonText) {
	if (jsonText === void 0) return {
		value: void 0,
		state: "undefined-input"
	};
	let result = await safeParseJSON({ text: jsonText });
	if (result.success) return {
		value: result.value,
		state: "successful-parse"
	};
	result = await safeParseJSON({ text: fixJson(jsonText) });
	if (result.success) return {
		value: result.value,
		state: "repaired-parse"
	};
	return {
		value: void 0,
		state: "failed-parse"
	};
}
new TextEncoder();
new TextEncoder();
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
function prepareHeaders(headers, defaultHeaders) {
	const responseHeaders = new Headers(headers ?? {});
	for (const [key, value] of Object.entries(defaultHeaders)) if (!responseHeaders.has(key)) responseHeaders.set(key, value);
	return responseHeaders;
}
var STREAM_OPEN_COMMENT = ": stream-open\n\n";
var KEEP_ALIVE_COMMENT = ": keep-alive\n\n";
function createSseStreamWithKeepAlive({ stream, keepAliveMs }) {
	if (keepAliveMs == null) return stream;
	if (!Number.isFinite(keepAliveMs) || keepAliveMs <= 0 || keepAliveMs > 2147483647) throw new Error("keepAliveMs must be a positive finite timer duration no greater than 2147483647");
	const reader = stream.getReader();
	let keepAliveTimeout;
	let isCancelled = false;
	const clearKeepAliveTimeout = () => {
		clearTimeout(keepAliveTimeout);
		keepAliveTimeout = void 0;
	};
	const scheduleKeepAlive = (controller) => {
		clearKeepAliveTimeout();
		keepAliveTimeout = setTimeout(() => {
			if (isCancelled) return;
			if (controller.desiredSize != null && controller.desiredSize > 0) controller.enqueue(KEEP_ALIVE_COMMENT);
			scheduleKeepAlive(controller);
		}, keepAliveMs);
	};
	return new ReadableStream({
		start(controller) {
			controller.enqueue(STREAM_OPEN_COMMENT);
			scheduleKeepAlive(controller);
		},
		pull(controller) {
			return reader.read().then((result) => {
				clearKeepAliveTimeout();
				if (isCancelled) return;
				if (result.done) controller.close();
				else {
					controller.enqueue(result.value);
					scheduleKeepAlive(controller);
				}
			}, (error) => {
				clearKeepAliveTimeout();
				if (!isCancelled) throw error;
			});
		},
		async cancel(reason) {
			isCancelled = true;
			clearKeepAliveTimeout();
			await reader.cancel(reason);
		}
	});
}
/**
* A TransformStream that converts JSON objects to Server-Sent Events (SSE) format.
* Each object is serialized to JSON and wrapped in `data: ...\n\n` format.
* When the stream ends, a `data: [DONE]\n\n` message is sent.
*/
var JsonToSseTransformStream = class extends TransformStream {
	constructor() {
		super({
			transform(part, controller) {
				controller.enqueue(`data: ${JSON.stringify(part)}\n\n`);
			},
			flush(controller) {
				controller.enqueue("data: [DONE]\n\n");
			}
		});
	}
};
var UI_MESSAGE_STREAM_HEADERS = {
	"content-type": "text/event-stream",
	"cache-control": "no-cache",
	connection: "keep-alive",
	"x-vercel-ai-ui-message-stream": "v1",
	"x-accel-buffering": "no"
};
/**
* Creates a Response object from a UI message stream.
* The stream is transformed to Server-Sent Events (SSE) format.
*
* @param options.status - The HTTP status code for the response.
* @param options.statusText - The HTTP status text for the response.
* @param options.headers - Additional HTTP headers to include in the response.
* @param options.stream - The UI message chunk stream to send.
* @param options.keepAliveMs - Optional interval for sending SSE keep-alive comments.
* @param options.consumeSseStream - Optional callback to consume a copy of the SSE stream independently.
*
* @returns A `Response` object with the UI message stream as the body.
*/
function createUIMessageStreamResponse({ status, statusText, headers, stream, keepAliveMs, consumeSseStream }) {
	let sseStream = createSseStreamWithKeepAlive({
		stream: stream.pipeThrough(new JsonToSseTransformStream()),
		keepAliveMs
	});
	if (consumeSseStream) {
		const [stream1, stream2] = sseStream.tee();
		sseStream = stream1;
		consumeSseStream({ stream: stream2 });
	}
	return new Response(sseStream.pipeThrough(new TextEncoderStream()), {
		status,
		statusText,
		headers: prepareHeaders(headers, UI_MESSAGE_STREAM_HEADERS)
	});
}
var citationSchema = z.object({
	source: z.discriminatedUnion("sourceType", [z.object({
		type: z.literal("source"),
		sourceType: z.literal("url"),
		id: z.string(),
		url: z.string(),
		title: z.string().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}), z.object({
		type: z.literal("source"),
		sourceType: z.literal("document"),
		id: z.string(),
		mediaType: z.string(),
		title: z.string(),
		filename: z.string().optional(),
		providerMetadata: providerMetadataSchema.optional()
	})]),
	startIndex: z.number().int().nonnegative().optional(),
	endIndex: z.number().int().nonnegative().optional(),
	citedText: z.string().optional()
});
var toolMetadataSchema$1 = z.record(z.string(), jsonValueSchema.optional());
var uiMessageChunkSchema = lazySchema(() => zodSchema(z.union([
	z.looseObject({
		type: z.literal("text-start"),
		id: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("text-delta"),
		id: z.string(),
		delta: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("text-end"),
		id: z.string(),
		citations: z.array(citationSchema).optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("error"),
		errorText: z.string()
	}),
	z.looseObject({
		type: z.literal("tool-input-start"),
		toolCallId: z.string(),
		toolName: z.string(),
		inputEncoding: z.enum(["json", "text"]).optional(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema$1.optional(),
		dynamic: z.boolean().optional(),
		title: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("tool-input-delta"),
		toolCallId: z.string(),
		inputTextDelta: z.string()
	}),
	z.looseObject({
		type: z.literal("tool-input-available"),
		toolCallId: z.string(),
		toolName: z.string(),
		input: z.unknown(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema$1.optional(),
		dynamic: z.boolean().optional(),
		title: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("tool-input-error"),
		toolCallId: z.string(),
		toolName: z.string(),
		input: z.unknown(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema$1.optional(),
		dynamic: z.boolean().optional(),
		errorText: z.string(),
		title: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("tool-approval-request"),
		approvalId: z.string(),
		toolCallId: z.string(),
		approvalDescriptor: z.unknown().optional(),
		inputSchemaInput: z.unknown().optional(),
		reason: z.string().optional(),
		isAutomatic: z.boolean().optional(),
		signature: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("tool-approval-response"),
		approvalId: z.string(),
		approved: z.boolean(),
		reason: z.string().optional(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("tool-output-available"),
		toolCallId: z.string(),
		output: z.unknown(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema$1.optional(),
		dynamic: z.boolean().optional(),
		preliminary: z.boolean().optional()
	}),
	z.looseObject({
		type: z.literal("tool-output-error"),
		toolCallId: z.string(),
		errorText: z.string(),
		providerExecuted: z.boolean().optional(),
		providerMetadata: providerMetadataSchema.optional(),
		toolMetadata: toolMetadataSchema$1.optional(),
		dynamic: z.boolean().optional()
	}),
	z.looseObject({
		type: z.literal("tool-output-denied"),
		toolCallId: z.string()
	}),
	z.looseObject({
		type: z.literal("reasoning-start"),
		id: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("reasoning-delta"),
		id: z.string(),
		delta: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("reasoning-end"),
		id: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("custom"),
		kind: z.string().transform((value) => value),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("source-url"),
		sourceId: z.string(),
		url: z.string(),
		title: z.string().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("source-document"),
		sourceId: z.string(),
		mediaType: z.string(),
		title: z.string(),
		filename: z.string().optional(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("file"),
		url: z.string(),
		mediaType: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.literal("reasoning-file"),
		url: z.string(),
		mediaType: z.string(),
		providerMetadata: providerMetadataSchema.optional()
	}),
	z.looseObject({
		type: z.custom((value) => typeof value === "string" && value.startsWith("data-"), { message: "Type must start with \"data-\"" }),
		id: z.string().optional(),
		data: z.unknown(),
		transient: z.boolean().optional()
	}),
	z.looseObject({ type: z.literal("start-step") }),
	z.looseObject({ type: z.literal("finish-step") }),
	z.looseObject({ type: z.literal("reset-step") }),
	z.looseObject({
		type: z.literal("start"),
		messageId: z.string().optional(),
		messageMetadata: z.unknown().optional()
	}),
	z.looseObject({
		type: z.literal("finish"),
		finishReason: z.enum([
			"stop",
			"length",
			"content-filter",
			"tool-calls",
			"error",
			"other"
		]).optional(),
		messageMetadata: z.unknown().optional()
	}),
	z.looseObject({
		type: z.literal("abort"),
		reason: z.string().optional()
	}),
	z.looseObject({
		type: z.literal("message-metadata"),
		messageMetadata: z.unknown()
	})
])));
function isDataUIMessageChunk(chunk) {
	return chunk.type.startsWith("data-");
}
/**
* Creates a string-keyed map without an object prototype.
*
* Use this for lookup tables keyed by IDs or names that may come from outside
* the SDK, such as streamed chunk IDs or tool call IDs. Unlike `{}`, these maps
* do not inherit `__proto__`, `constructor`, or other Object prototype members,
* so a missing untrusted key cannot resolve to a shared prototype object.
*/
function createIdMap() {
	return Object.create(null);
}
/**
* Check if a message part is a static tool part.
*
* Static tools are tools for which the types are known at development time.
*/
function isStaticToolUIPart(part) {
	return part.type.startsWith("tool-");
}
/**
* Check if a message part is a dynamic tool part.
*
* Dynamic tools are tools for which the input and output types are unknown.
*/
function isDynamicToolUIPart(part) {
	return part.type === "dynamic-tool";
}
/**
* Check if a message part is a tool part.
*
* Tool parts are either static or dynamic tools.
*
* Use `isStaticToolUIPart` or `isDynamicToolUIPart` to check the type of the tool.
*/
function isToolUIPart(part) {
	return isStaticToolUIPart(part) || isDynamicToolUIPart(part);
}
/**
* Returns the name of the static tool.
*
* The possible values are the keys of the tool set.
*/
function getStaticToolName(part) {
	return part.type.split("-").slice(1).join("-");
}
function createStreamingUIMessageState({ lastMessage, messageId }) {
	const message = lastMessage?.role === "assistant" ? lastMessage : {
		id: messageId,
		metadata: void 0,
		role: "assistant",
		parts: []
	};
	const partialToolCalls = createIdMap();
	const lastStepStartIndex = message.parts.findLastIndex((part) => part.type === "step-start");
	let staticToolIndex = 0;
	for (const part of message.parts.slice(lastStepStartIndex + 1)) {
		if (!isToolUIPart(part)) continue;
		const index = staticToolIndex;
		if (isStaticToolUIPart(part)) staticToolIndex++;
		if (part.state !== "input-streaming") continue;
		partialToolCalls[part.toolCallId] = {
			text: part.rawInput ?? "",
			inputEncoding: part.inputEncoding,
			index,
			toolName: part.type === "dynamic-tool" ? part.toolName : getStaticToolName(part),
			dynamic: part.type === "dynamic-tool",
			title: part.title,
			toolMetadata: part.toolMetadata
		};
	}
	return {
		message,
		activeTextParts: createIdMap(),
		activeReasoningParts: createIdMap(),
		partialToolCalls
	};
}
function processUIMessageStream({ stream, messageMetadataSchema, dataPartSchemas, runUpdateMessageJob, onError, onToolCall, onData, resetStateOnMessageIdChange = false, resetStateOnFirstMessageStart = false }) {
	let isFirstMessageStart = true;
	return stream.pipeThrough(new TransformStream({ async transform(chunk, controller) {
		await runUpdateMessageJob(async ({ state, write }) => {
			function getCurrentStepParts() {
				const parts = state.message.parts;
				let currentStepStartIndex = parts.length - 1;
				while (currentStepStartIndex >= 0 && parts[currentStepStartIndex].type !== "step-start") currentStepStartIndex--;
				return parts.slice(currentStepStartIndex + 1);
			}
			function getCurrentStepToolInvocations() {
				return getCurrentStepParts().filter(isToolUIPart);
			}
			function getToolInvocation(toolCallId) {
				let toolInvocation = getCurrentStepToolInvocations().find((invocation) => invocation.toolCallId === toolCallId);
				if (toolInvocation == null) {
					const parts = state.message.parts;
					for (let i = parts.length - 1; i >= 0; i--) {
						const part = parts[i];
						if (isToolUIPart(part) && part.toolCallId === toolCallId) {
							toolInvocation = part;
							break;
						}
					}
				}
				if (toolInvocation == null) throw new UIMessageStreamError({
					chunkType: "tool-invocation",
					chunkId: toolCallId,
					message: `No tool invocation found for tool call ID "${toolCallId}".`
				});
				return toolInvocation;
			}
			function getToolInvocationByApprovalId(approvalId) {
				const toolInvocation = state.message.parts.filter(isToolUIPart).find((invocation) => invocation.approval?.id === approvalId);
				if (toolInvocation == null) throw new UIMessageStreamError({
					chunkType: "tool-approval-response",
					chunkId: approvalId,
					message: `No tool invocation found for approval ID "${approvalId}".`
				});
				return toolInvocation;
			}
			function updateToolPart(options, existingPart) {
				const part = existingPart ?? getCurrentStepParts().find((part) => isStaticToolUIPart(part) && part.toolCallId === options.toolCallId);
				const anyOptions = options;
				const anyPart = part;
				if (part != null) {
					part.state = options.state;
					anyPart.type = `tool-${options.toolName}`;
					anyPart.input = anyOptions.input;
					anyPart.output = anyOptions.output;
					anyPart.errorText = anyOptions.errorText;
					anyPart.rawInput = anyOptions.rawInput;
					if (anyOptions.inputEncoding != null) anyPart.inputEncoding = anyOptions.inputEncoding;
					else delete anyPart.inputEncoding;
					anyPart.preliminary = anyOptions.preliminary;
					if (options.title !== void 0) anyPart.title = options.title;
					if (options.toolMetadata !== void 0) anyPart.toolMetadata = options.toolMetadata;
					anyPart.providerExecuted = anyOptions.providerExecuted ?? part.providerExecuted;
					const providerMetadata = anyOptions.providerMetadata;
					if (providerMetadata != null) if (options.state === "output-available" || options.state === "output-error") {
						const resultPart = part;
						resultPart.resultProviderMetadata = providerMetadata;
					} else part.callProviderMetadata = providerMetadata;
				} else state.message.parts.push({
					type: `tool-${options.toolName}`,
					toolCallId: options.toolCallId,
					state: options.state,
					title: options.title,
					...options.toolMetadata !== void 0 ? { toolMetadata: options.toolMetadata } : {},
					input: anyOptions.input,
					...anyOptions.inputEncoding != null ? { inputEncoding: anyOptions.inputEncoding } : {},
					output: anyOptions.output,
					rawInput: anyOptions.rawInput,
					errorText: anyOptions.errorText,
					providerExecuted: anyOptions.providerExecuted,
					preliminary: anyOptions.preliminary,
					...anyOptions.providerMetadata != null && (options.state === "output-available" || options.state === "output-error") ? { resultProviderMetadata: anyOptions.providerMetadata } : {},
					...anyOptions.providerMetadata != null && !(options.state === "output-available" || options.state === "output-error") ? { callProviderMetadata: anyOptions.providerMetadata } : {}
				});
			}
			function updateDynamicToolPart(options, existingPart) {
				const part = existingPart ?? getCurrentStepParts().find((part) => part.type === "dynamic-tool" && part.toolCallId === options.toolCallId);
				const anyOptions = options;
				const anyPart = part;
				if (part != null) {
					part.state = options.state;
					anyPart.toolName = options.toolName;
					anyPart.input = anyOptions.input;
					anyPart.output = anyOptions.output;
					anyPart.errorText = anyOptions.errorText;
					anyPart.rawInput = anyOptions.rawInput;
					if (anyOptions.inputEncoding != null) anyPart.inputEncoding = anyOptions.inputEncoding;
					else delete anyPart.inputEncoding;
					anyPart.preliminary = anyOptions.preliminary;
					if (options.title !== void 0) anyPart.title = options.title;
					if (options.toolMetadata !== void 0) anyPart.toolMetadata = options.toolMetadata;
					anyPart.providerExecuted = anyOptions.providerExecuted ?? part.providerExecuted;
					const providerMetadata = anyOptions.providerMetadata;
					if (providerMetadata != null) if (options.state === "output-available" || options.state === "output-error") {
						const resultPart = part;
						resultPart.resultProviderMetadata = providerMetadata;
					} else part.callProviderMetadata = providerMetadata;
				} else state.message.parts.push({
					type: "dynamic-tool",
					toolName: options.toolName,
					toolCallId: options.toolCallId,
					state: options.state,
					input: anyOptions.input,
					...anyOptions.inputEncoding != null ? { inputEncoding: anyOptions.inputEncoding } : {},
					output: anyOptions.output,
					errorText: anyOptions.errorText,
					preliminary: anyOptions.preliminary,
					providerExecuted: anyOptions.providerExecuted,
					title: options.title,
					...options.toolMetadata !== void 0 ? { toolMetadata: options.toolMetadata } : {},
					...anyOptions.providerMetadata != null && (options.state === "output-available" || options.state === "output-error") ? { resultProviderMetadata: anyOptions.providerMetadata } : {},
					...anyOptions.providerMetadata != null && !(options.state === "output-available" || options.state === "output-error") ? { callProviderMetadata: anyOptions.providerMetadata } : {}
				});
			}
			async function updateMessageMetadata(metadata) {
				if (metadata != null) {
					const mergedMetadata = state.message.metadata != null ? mergeObjects(state.message.metadata, metadata) : metadata;
					if (messageMetadataSchema != null) await validateTypes({
						value: mergedMetadata,
						schema: messageMetadataSchema,
						context: {
							field: "message.metadata",
							entityId: state.message.id
						}
					});
					state.message.metadata = mergedMetadata;
				}
			}
			switch (chunk.type) {
				case "text-start": {
					const textPart = {
						type: "text",
						text: "",
						providerMetadata: chunk.providerMetadata,
						state: "streaming"
					};
					state.activeTextParts[chunk.id] = textPart;
					state.message.parts.push(textPart);
					write();
					break;
				}
				case "text-delta": {
					const textPart = state.activeTextParts[chunk.id];
					if (textPart == null) throw new UIMessageStreamError({
						chunkType: "text-delta",
						chunkId: chunk.id,
						message: `Received text-delta for missing text part with ID "${chunk.id}". Ensure a "text-start" chunk is sent before any "text-delta" chunks.`
					});
					textPart.text += chunk.delta;
					textPart.providerMetadata = chunk.providerMetadata ?? textPart.providerMetadata;
					write();
					break;
				}
				case "text-end": {
					const textPart = state.activeTextParts[chunk.id];
					if (textPart == null) throw new UIMessageStreamError({
						chunkType: "text-end",
						chunkId: chunk.id,
						message: `Received text-end for missing text part with ID "${chunk.id}". Ensure a "text-start" chunk is sent before any "text-end" chunks.`
					});
					textPart.state = "done";
					if (chunk.citations != null) textPart.citations = chunk.citations;
					textPart.providerMetadata = chunk.providerMetadata ?? textPart.providerMetadata;
					delete state.activeTextParts[chunk.id];
					write();
					break;
				}
				case "custom": {
					const customPart = {
						type: "custom",
						kind: chunk.kind,
						providerMetadata: chunk.providerMetadata
					};
					state.message.parts.push(customPart);
					write();
					break;
				}
				case "reasoning-start": {
					const reasoningPart = {
						type: "reasoning",
						id: chunk.id,
						text: "",
						providerMetadata: chunk.providerMetadata,
						state: "streaming"
					};
					state.activeReasoningParts[chunk.id] = reasoningPart;
					state.message.parts.push(reasoningPart);
					write();
					break;
				}
				case "reasoning-delta": {
					const reasoningPart = state.activeReasoningParts[chunk.id];
					if (reasoningPart == null) throw new UIMessageStreamError({
						chunkType: "reasoning-delta",
						chunkId: chunk.id,
						message: `Received reasoning-delta for missing reasoning part with ID "${chunk.id}". Ensure a "reasoning-start" chunk is sent before any "reasoning-delta" chunks.`
					});
					reasoningPart.text += chunk.delta;
					reasoningPart.providerMetadata = chunk.providerMetadata ?? reasoningPart.providerMetadata;
					write();
					break;
				}
				case "reasoning-end": {
					const reasoningPart = state.activeReasoningParts[chunk.id];
					if (reasoningPart == null) throw new UIMessageStreamError({
						chunkType: "reasoning-end",
						chunkId: chunk.id,
						message: `Received reasoning-end for missing reasoning part with ID "${chunk.id}". Ensure a "reasoning-start" chunk is sent before any "reasoning-end" chunks.`
					});
					reasoningPart.providerMetadata = chunk.providerMetadata ?? reasoningPart.providerMetadata;
					reasoningPart.state = "done";
					delete state.activeReasoningParts[chunk.id];
					write();
					break;
				}
				case "file":
				case "reasoning-file":
					state.message.parts.push({
						type: chunk.type,
						mediaType: chunk.mediaType,
						url: chunk.url,
						...chunk.providerMetadata != null ? { providerMetadata: chunk.providerMetadata } : {}
					});
					write();
					break;
				case "source-url":
					state.message.parts.push({
						type: "source-url",
						sourceId: chunk.sourceId,
						url: chunk.url,
						title: chunk.title,
						providerMetadata: chunk.providerMetadata
					});
					write();
					break;
				case "source-document":
					state.message.parts.push({
						type: "source-document",
						sourceId: chunk.sourceId,
						mediaType: chunk.mediaType,
						title: chunk.title,
						filename: chunk.filename,
						providerMetadata: chunk.providerMetadata
					});
					write();
					break;
				case "tool-input-start": {
					const toolInvocations = getCurrentStepParts().filter(isStaticToolUIPart);
					state.partialToolCalls[chunk.toolCallId] = {
						text: "",
						inputEncoding: chunk.inputEncoding,
						toolName: chunk.toolName,
						index: toolInvocations.length,
						dynamic: chunk.dynamic,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata
					};
					if (chunk.dynamic) updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "input-streaming",
						inputEncoding: chunk.inputEncoding,
						input: void 0,
						providerExecuted: chunk.providerExecuted,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata,
						providerMetadata: chunk.providerMetadata
					});
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "input-streaming",
						inputEncoding: chunk.inputEncoding,
						input: void 0,
						providerExecuted: chunk.providerExecuted,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata,
						providerMetadata: chunk.providerMetadata
					});
					write();
					break;
				}
				case "tool-input-delta": {
					const partialToolCall = state.partialToolCalls[chunk.toolCallId];
					if (partialToolCall == null) throw new UIMessageStreamError({
						chunkType: "tool-input-delta",
						chunkId: chunk.toolCallId,
						message: `Received tool-input-delta for missing tool call with ID "${chunk.toolCallId}". Ensure a "tool-input-start" chunk is sent before any "tool-input-delta" chunks.`
					});
					partialToolCall.text += chunk.inputTextDelta;
					const partialArgs = partialToolCall.inputEncoding === "text" ? partialToolCall.text : (await parsePartialJson(partialToolCall.text)).value;
					if (partialToolCall.dynamic) updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: partialToolCall.toolName,
						state: "input-streaming",
						inputEncoding: partialToolCall.inputEncoding,
						input: partialArgs,
						rawInput: partialToolCall.text,
						title: partialToolCall.title,
						toolMetadata: partialToolCall.toolMetadata
					});
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: partialToolCall.toolName,
						state: "input-streaming",
						inputEncoding: partialToolCall.inputEncoding,
						input: partialArgs,
						rawInput: partialToolCall.text,
						title: partialToolCall.title,
						toolMetadata: partialToolCall.toolMetadata
					});
					write();
					break;
				}
				case "tool-input-available":
					if (chunk.dynamic) updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "input-available",
						input: chunk.input,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata
					});
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "input-available",
						input: chunk.input,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: chunk.title,
						toolMetadata: chunk.toolMetadata
					});
					write();
					if (onToolCall && !chunk.providerExecuted) await onToolCall({ toolCall: chunk });
					break;
				case "tool-input-error": {
					const existingPart = getCurrentStepParts().filter(isToolUIPart).find((p) => p.toolCallId === chunk.toolCallId);
					if (existingPart != null ? existingPart.type === "dynamic-tool" : !!chunk.dynamic) updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "output-error",
						input: chunk.input,
						errorText: chunk.errorText,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						toolMetadata: chunk.toolMetadata
					});
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: chunk.toolName,
						state: "output-error",
						input: chunk.input,
						errorText: chunk.errorText,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						toolMetadata: chunk.toolMetadata
					});
					write();
					break;
				}
				case "tool-approval-request": {
					const toolInvocation = getToolInvocation(chunk.toolCallId);
					toolInvocation.state = "approval-requested";
					toolInvocation.approval = {
						id: chunk.approvalId,
						...chunk.approvalDescriptor != null ? { descriptor: chunk.approvalDescriptor } : {},
						...Object.prototype.hasOwnProperty.call(chunk, "inputSchemaInput") ? { inputSchemaInput: chunk.inputSchemaInput } : {},
						...chunk.reason != null ? { requestReason: chunk.reason } : {},
						...chunk.isAutomatic === true ? { isAutomatic: true } : {},
						...chunk.signature != null ? { signature: chunk.signature } : {}
					};
					write();
					break;
				}
				case "tool-approval-response": {
					const toolInvocation = getToolInvocationByApprovalId(chunk.approvalId);
					const approval = toolInvocation.approval == null ? { id: chunk.approvalId } : toolInvocation.approval;
					toolInvocation.state = "approval-responded";
					toolInvocation.approval = {
						...approval,
						id: chunk.approvalId,
						approved: chunk.approved,
						...chunk.reason != null ? { reason: chunk.reason } : {}
					};
					if (chunk.providerExecuted != null) toolInvocation.providerExecuted = chunk.providerExecuted;
					if (chunk.providerMetadata != null) toolInvocation.callProviderMetadata = chunk.providerMetadata;
					write();
					break;
				}
				case "tool-output-denied": {
					const toolInvocation = getToolInvocation(chunk.toolCallId);
					toolInvocation.state = "output-denied";
					write();
					break;
				}
				case "tool-output-available": {
					const toolInvocation = getToolInvocation(chunk.toolCallId);
					if (toolInvocation.type === "dynamic-tool") updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: toolInvocation.toolName,
						state: "output-available",
						input: toolInvocation.input,
						output: chunk.output,
						preliminary: chunk.preliminary,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: toolInvocation.title,
						toolMetadata: chunk.toolMetadata ?? toolInvocation.toolMetadata
					}, toolInvocation);
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: getStaticToolName(toolInvocation),
						state: "output-available",
						input: toolInvocation.input,
						output: chunk.output,
						providerExecuted: chunk.providerExecuted,
						preliminary: chunk.preliminary,
						providerMetadata: chunk.providerMetadata,
						title: toolInvocation.title,
						toolMetadata: chunk.toolMetadata ?? toolInvocation.toolMetadata
					}, toolInvocation);
					write();
					break;
				}
				case "tool-output-error": {
					const toolInvocation = getToolInvocation(chunk.toolCallId);
					if (toolInvocation.type === "dynamic-tool") updateDynamicToolPart({
						toolCallId: chunk.toolCallId,
						toolName: toolInvocation.toolName,
						state: "output-error",
						input: toolInvocation.input,
						errorText: chunk.errorText,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: toolInvocation.title,
						toolMetadata: chunk.toolMetadata ?? toolInvocation.toolMetadata
					}, toolInvocation);
					else updateToolPart({
						toolCallId: chunk.toolCallId,
						toolName: getStaticToolName(toolInvocation),
						state: "output-error",
						input: toolInvocation.input,
						rawInput: toolInvocation.rawInput,
						errorText: chunk.errorText,
						providerExecuted: chunk.providerExecuted,
						providerMetadata: chunk.providerMetadata,
						title: toolInvocation.title,
						toolMetadata: chunk.toolMetadata ?? toolInvocation.toolMetadata
					}, toolInvocation);
					write();
					break;
				}
				case "start-step":
					state.message.parts.push({ type: "step-start" });
					break;
				case "finish-step": break;
				case "reset-step": {
					const currentStepParts = getCurrentStepParts();
					state.activeTextParts = createIdMap();
					state.activeReasoningParts = createIdMap();
					state.partialToolCalls = createIdMap();
					if (currentStepParts.length > 0) {
						state.message.parts.splice(state.message.parts.length - currentStepParts.length, currentStepParts.length);
						write();
					}
					break;
				}
				case "start": {
					const shouldReset = resetStateOnFirstMessageStart && isFirstMessageStart || resetStateOnMessageIdChange && chunk.messageId != null && chunk.messageId !== state.message.id;
					isFirstMessageStart = false;
					if (shouldReset) Object.assign(state, createStreamingUIMessageState({
						lastMessage: void 0,
						messageId: chunk.messageId ?? state.message.id
					}), { finishReason: void 0 });
					if (chunk.messageId != null) state.message.id = chunk.messageId;
					await updateMessageMetadata(chunk.messageMetadata);
					if (shouldReset || chunk.messageId != null || chunk.messageMetadata != null) write({ updateStatus: false });
					break;
				}
				case "finish":
					if (chunk.finishReason != null) state.finishReason = chunk.finishReason;
					await updateMessageMetadata(chunk.messageMetadata);
					if (chunk.messageMetadata != null) write();
					break;
				case "message-metadata":
					await updateMessageMetadata(chunk.messageMetadata);
					if (chunk.messageMetadata != null) write();
					break;
				case "error":
					onError?.(new Error(chunk.errorText));
					break;
				default: if (isDataUIMessageChunk(chunk)) {
					if (dataPartSchemas?.[chunk.type] != null) {
						const partIdx = state.message.parts.findIndex((p) => "id" in p && "data" in p && p.id === chunk.id && p.type === chunk.type);
						const actualPartIdx = partIdx >= 0 ? partIdx : state.message.parts.length;
						await validateTypes({
							value: chunk.data,
							schema: dataPartSchemas[chunk.type],
							context: {
								field: `message.parts[${actualPartIdx}].data`,
								entityName: chunk.type,
								entityId: chunk.id
							}
						});
					}
					const dataChunk = chunk;
					if (dataChunk.transient) {
						onData?.(dataChunk);
						break;
					}
					const existingUIPart = dataChunk.id != null ? state.message.parts.find((chunkArg) => dataChunk.type === chunkArg.type && dataChunk.id === chunkArg.id) : void 0;
					if (existingUIPart != null) existingUIPart.data = dataChunk.data;
					else state.message.parts.push(dataChunk);
					onData?.(dataChunk);
					write();
				}
			}
			controller.enqueue(chunk);
		});
	} }));
}
function handleUIMessageStreamFinish({ messageId, originalMessages = [], onStepEnd, onStepFinish, onEnd, onFinish, onError, stream, getOutcome }) {
	let lastMessage = originalMessages?.[originalMessages.length - 1];
	if (lastMessage?.role !== "assistant") lastMessage = void 0;
	else messageId = lastMessage.id;
	let isAborted = false;
	let hasProcessingFailure = false;
	let processingError;
	const recordProcessingFailure = (error) => {
		hasProcessingFailure = true;
		processingError = error;
	};
	const idInjectedStream = stream.pipeThrough(new TransformStream({ transform(chunk, controller) {
		try {
			let outputChunk = chunk;
			if (chunk.type === "start") {
				const startChunk = chunk;
				if (startChunk.messageId == null && messageId != null) outputChunk = {
					...startChunk,
					messageId
				};
			}
			if (chunk.type === "abort") isAborted = true;
			controller.enqueue(outputChunk);
		} catch (error) {
			recordProcessingFailure(error);
			throw error;
		}
	} }));
	const resolvedOnStepEnd = onStepEnd ?? onStepFinish;
	const resolvedOnEnd = onEnd ?? onFinish;
	if (resolvedOnEnd == null && resolvedOnStepEnd == null) return idInjectedStream;
	const state = createStreamingUIMessageState({
		lastMessage: lastMessage ? structuredClone(lastMessage) : void 0,
		messageId: messageId ?? ""
	});
	const runUpdateMessageJob = async (job) => {
		try {
			await job({
				state,
				write: () => {}
			});
		} catch (error) {
			recordProcessingFailure(error);
			throw error;
		}
	};
	let finishCalled = false;
	const callOnEnd = async ({ isCancelled }) => {
		if (finishCalled || !resolvedOnEnd) return;
		finishCalled = true;
		const isContinuation = state.message.id === lastMessage?.id;
		const declaredOutcome = getOutcome?.() ?? { status: "unknown" };
		const outcome = hasProcessingFailure ? {
			status: "failed",
			error: processingError
		} : declaredOutcome.status === "unknown" && isAborted ? { status: "aborted" } : declaredOutcome;
		const isConsumerCancellation = isCancelled && outcome.status === "unknown";
		await resolvedOnEnd({
			isAborted: isAborted || outcome.status === "aborted",
			...isConsumerCancellation ? { isCancelled: true } : {},
			isContinuation,
			outcome,
			responseMessage: state.message,
			messages: [...isContinuation ? originalMessages.slice(0, -1) : originalMessages, state.message],
			finishReason: state.finishReason
		});
	};
	const callOnStepFinish = async () => {
		if (!resolvedOnStepEnd) return;
		const isContinuation = state.message.id === lastMessage?.id;
		try {
			await resolvedOnStepEnd({
				isContinuation,
				responseMessage: structuredClone(state.message),
				messages: [...isContinuation ? originalMessages.slice(0, -1) : originalMessages, structuredClone(state.message)]
			});
		} catch (error) {
			onError(error);
		}
	};
	return processUIMessageStream({
		stream: idInjectedStream,
		runUpdateMessageJob,
		onError
	}).pipeThrough(new TransformStream({
		async transform(chunk, controller) {
			if (chunk.type === "finish-step") await callOnStepFinish();
			controller.enqueue(chunk);
		},
		async cancel() {
			await callOnEnd({ isCancelled: true });
		},
		async flush() {
			await callOnEnd({ isCancelled: false });
		}
	}));
}
/**
* Consumes a ReadableStream until it's fully read.
*
* This function reads the stream chunk by chunk until the stream is exhausted.
* It doesn't process or return the data from the stream; it simply ensures
* that the entire stream is read.
*
* @param options - The options for consuming the stream.
* @param options.stream - The ReadableStream to be consumed.
* @param options.onError - Optional callback to handle errors that occur during consumption.
* @returns A promise that resolves when the stream is fully consumed.
*/
async function consumeStream({ stream, onError, abortSignal }) {
	const reader = stream.getReader();
	const cancelOnAbort = () => {
		reader.cancel().catch(() => {});
	};
	if (abortSignal?.aborted) cancelOnAbort();
	else abortSignal?.addEventListener("abort", cancelOnAbort, { once: true });
	try {
		while (true) {
			const { done } = await reader.read();
			if (done) break;
		}
	} catch (error) {
		onError?.(error);
	} finally {
		abortSignal?.removeEventListener("abort", cancelOnAbort);
		reader.releaseLock();
	}
}
/**
* Creates a Promise with externally accessible resolve and reject functions.
*
* @template T - The type of the value that the Promise will resolve to.
* @returns An object containing:
*   - promise: A Promise that can be resolved or rejected externally.
*   - resolve: A function to resolve the Promise with a value of type T.
*   - reject: A function to reject the Promise with an error.
*/
function createResolvablePromise() {
	let resolve;
	let reject;
	return {
		promise: new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		}),
		resolve,
		reject
	};
}
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "aitxt",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
/**
* Creates a UI message stream that can be used to send messages to the client.
*
* @param options.execute - A function that is called with a writer to write UI message chunks to the stream.
* @param options.onError - A function that extracts an error message from an error. Defaults to `() => 'An error occurred.'` so server-side error details are not leaked to the client; supply your own to surface richer messages.
* @param options.originalMessages - The original messages. If provided, persistence mode is assumed
*   and a message ID is provided for the response message.
* @param options.onStepEnd - A callback that is called when each step ends. Useful for persisting intermediate messages.
* @param options.onStepFinish - Deprecated alias for `onStepEnd`.
* @param options.onEnd - A callback that is called when the stream ends.
* @param options.onFinish - Deprecated alias for `onEnd`.
* @param options.generateId - A function that generates a unique ID. Defaults to the built-in ID generator.
*
* @returns A `ReadableStream` of UI message chunks.
*/
function createUIMessageStream({ execute, onError = () => "An error occurred.", originalMessages, onStepEnd, onStepFinish, onEnd, onFinish, generateId: generateId$1 = generateId }) {
	let controller;
	const ongoingStreamPromises = [];
	const activeReaders = /* @__PURE__ */ new Set();
	let isCancelled = false;
	let cancelReason;
	let outcome = { status: "unknown" };
	const stream = new ReadableStream({
		start(controllerArg) {
			controller = controllerArg;
		},
		async cancel(reason) {
			isCancelled = true;
			cancelReason = reason;
			await Promise.all(Array.from(activeReaders, (reader) => reader.cancel(reason)));
		}
	});
	function safeEnqueue(data) {
		try {
			controller.enqueue(data);
		} catch {}
	}
	function setOutcome(newOutcome) {
		if (outcome.status === "unknown" && newOutcome.status !== "unknown") outcome = newOutcome;
	}
	function failOutcome(error) {
		outcome = {
			status: "failed",
			error
		};
	}
	function safeError(error) {
		try {
			controller.error(error);
		} catch {}
	}
	function handleError(error) {
		failOutcome(error);
		let errorText;
		try {
			errorText = onError(error);
		} catch (onErrorError) {
			failOutcome(onErrorError);
			safeError(onErrorError);
			return;
		}
		safeEnqueue({
			type: "error",
			errorText
		});
	}
	try {
		const result = execute({ writer: {
			write(part) {
				safeEnqueue(part);
			},
			merge(streamArg) {
				if (isCancelled) {
					streamArg.cancel(cancelReason).catch(() => {});
					return;
				}
				ongoingStreamPromises.push((async () => {
					const reader = streamArg.getReader();
					activeReaders.add(reader);
					try {
						while (true) {
							const { done, value } = await reader.read();
							if (done) break;
							safeEnqueue(value);
						}
					} finally {
						activeReaders.delete(reader);
						reader.releaseLock();
					}
				})().catch((error) => {
					handleError(error);
				}));
			},
			setOutcome,
			onError
		} });
		if (result) ongoingStreamPromises.push(result.catch((error) => {
			handleError(error);
		}));
	} catch (error) {
		handleError(error);
	}
	(async () => {
		while (ongoingStreamPromises.length > 0) await ongoingStreamPromises.shift();
	})().finally(() => {
		try {
			controller.close();
		} catch {}
	});
	return handleUIMessageStreamFinish({
		stream,
		messageId: generateId$1(),
		originalMessages,
		onStepEnd: onStepEnd ?? onStepFinish,
		onEnd: onEnd ?? onFinish,
		onError,
		getOutcome: () => outcome
	});
}
var toolMetadataSchema = z.record(z.string(), jsonValueSchema.optional());
var providerReferenceSchema = z.record(z.string(), z.string());
lazySchema(() => {
	const approvalRequestedSchema = z.object({
		id: z.string(),
		approved: z.never().optional(),
		descriptor: z.unknown().optional(),
		requestReason: z.string().optional(),
		reason: z.never().optional(),
		isAutomatic: z.boolean().optional(),
		signature: z.string().optional(),
		inputSchemaInput: z.unknown().optional()
	});
	const approvalRespondedSchema = approvalRequestedSchema.extend({
		approved: z.boolean(),
		reason: z.string().optional()
	});
	const approvalGrantedSchema = approvalRespondedSchema.extend({ approved: z.literal(true) });
	const approvalDeniedSchema = approvalRespondedSchema.extend({ approved: z.literal(false) });
	return zodSchema(z.array(z.object({
		id: z.string(),
		role: z.enum([
			"system",
			"user",
			"assistant"
		]),
		metadata: z.unknown().optional(),
		parts: z.array(z.union([
			z.object({
				type: z.literal("text"),
				text: z.string(),
				citations: z.array(citationSchema).optional(),
				state: z.enum(["streaming", "done"]).optional(),
				providerMetadata: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("reasoning"),
				id: z.string().optional(),
				text: z.string(),
				state: z.enum(["streaming", "done"]).optional(),
				providerMetadata: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("custom"),
				kind: z.string(),
				providerMetadata: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("source-url"),
				sourceId: z.string(),
				url: z.string(),
				title: z.string().optional(),
				providerMetadata: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("source-document"),
				sourceId: z.string(),
				mediaType: z.string(),
				title: z.string(),
				filename: z.string().optional(),
				providerMetadata: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("file"),
				mediaType: z.string(),
				filename: z.string().optional(),
				url: z.string(),
				providerReference: providerReferenceSchema.optional(),
				providerMetadata: providerMetadataSchema.optional()
			}),
			z.object({
				type: z.literal("reasoning-file"),
				mediaType: z.string(),
				url: z.string(),
				providerMetadata: providerMetadataSchema.optional()
			}),
			z.object({ type: z.literal("step-start") }),
			z.object({
				type: z.string().startsWith("data-"),
				id: z.string().optional(),
				data: z.unknown()
			}),
			z.object({
				type: z.literal("dynamic-tool"),
				dynamic: z.literal(false).optional(),
				toolName: z.string(),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("input-streaming"),
				input: z.unknown().optional(),
				rawInput: z.string().optional(),
				inputEncoding: z.enum(["json", "text"]).optional(),
				providerExecuted: z.boolean().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				approval: z.never().optional()
			}),
			z.object({
				type: z.literal("dynamic-tool"),
				dynamic: z.literal(false).optional(),
				toolName: z.string(),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("input-available"),
				input: z.unknown(),
				providerExecuted: z.boolean().optional(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				approval: z.never().optional()
			}),
			z.object({
				type: z.literal("dynamic-tool"),
				dynamic: z.literal(false).optional(),
				toolName: z.string(),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("approval-requested"),
				input: z.unknown(),
				providerExecuted: z.boolean().optional(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				approval: approvalRequestedSchema
			}),
			z.object({
				type: z.literal("dynamic-tool"),
				dynamic: z.literal(false).optional(),
				toolName: z.string(),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("approval-responded"),
				input: z.unknown(),
				providerExecuted: z.boolean().optional(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				approval: approvalRespondedSchema
			}),
			z.object({
				type: z.literal("dynamic-tool"),
				dynamic: z.literal(false).optional(),
				toolName: z.string(),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("output-available"),
				input: z.unknown(),
				providerExecuted: z.boolean().optional(),
				output: z.unknown(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				resultProviderMetadata: providerMetadataSchema.optional(),
				preliminary: z.boolean().optional(),
				approval: approvalGrantedSchema.optional()
			}),
			z.object({
				type: z.literal("dynamic-tool"),
				dynamic: z.literal(false).optional(),
				toolName: z.string(),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("output-error"),
				input: z.unknown().optional(),
				rawInput: z.unknown().optional(),
				providerExecuted: z.boolean().optional(),
				output: z.never().optional(),
				errorText: z.string(),
				callProviderMetadata: providerMetadataSchema.optional(),
				resultProviderMetadata: providerMetadataSchema.optional(),
				approval: approvalGrantedSchema.optional()
			}),
			z.object({
				type: z.literal("dynamic-tool"),
				dynamic: z.literal(false).optional(),
				toolName: z.string(),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("output-denied"),
				input: z.unknown(),
				providerExecuted: z.boolean().optional(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				approval: approvalDeniedSchema
			}),
			z.object({
				type: z.string().startsWith("tool-"),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("input-streaming"),
				providerExecuted: z.boolean().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				input: z.unknown().optional(),
				rawInput: z.string().optional(),
				inputEncoding: z.enum(["json", "text"]).optional(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				approval: z.never().optional()
			}),
			z.object({
				type: z.string().startsWith("tool-"),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("input-available"),
				providerExecuted: z.boolean().optional(),
				input: z.unknown(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				approval: z.never().optional()
			}),
			z.object({
				type: z.string().startsWith("tool-"),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("approval-requested"),
				input: z.unknown(),
				providerExecuted: z.boolean().optional(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				approval: approvalRequestedSchema
			}),
			z.object({
				type: z.string().startsWith("tool-"),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("approval-responded"),
				input: z.unknown(),
				providerExecuted: z.boolean().optional(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				approval: approvalRespondedSchema
			}),
			z.object({
				type: z.string().startsWith("tool-"),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("output-available"),
				providerExecuted: z.boolean().optional(),
				input: z.unknown(),
				output: z.unknown(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				resultProviderMetadata: providerMetadataSchema.optional(),
				preliminary: z.boolean().optional(),
				approval: approvalGrantedSchema.optional()
			}),
			z.object({
				type: z.string().startsWith("tool-"),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("output-error"),
				providerExecuted: z.boolean().optional(),
				input: z.unknown().optional(),
				rawInput: z.unknown().optional(),
				output: z.never().optional(),
				errorText: z.string(),
				callProviderMetadata: providerMetadataSchema.optional(),
				resultProviderMetadata: providerMetadataSchema.optional(),
				approval: approvalGrantedSchema.optional()
			}),
			z.object({
				type: z.string().startsWith("tool-"),
				toolCallId: z.string(),
				title: z.string().optional(),
				toolMetadata: toolMetadataSchema.optional(),
				state: z.literal("output-denied"),
				providerExecuted: z.boolean().optional(),
				input: z.unknown(),
				output: z.never().optional(),
				errorText: z.never().optional(),
				callProviderMetadata: providerMetadataSchema.optional(),
				approval: approvalDeniedSchema
			})
		]))
	}).superRefine((message, context) => {
		if (message.role !== "assistant" && message.parts.length === 0) context.addIssue({
			origin: "array",
			code: "too_small",
			minimum: 1,
			inclusive: true,
			input: message.parts,
			path: ["parts"],
			message: "Message must contain at least one part"
		});
	})).nonempty("Messages array must not be empty"));
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
new TextEncoder();
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "aiobj",
	size: 24
});
var { atob: atob$1 } = globalThis;
var SerialJobExecutor = class {
	constructor() {
		this.queue = [];
		this.isProcessing = false;
		this.idleWaiters = [];
	}
	async processQueue() {
		if (this.isProcessing) return;
		this.isProcessing = true;
		try {
			while (this.queue.length > 0) {
				await this.queue[0]();
				this.queue.shift();
			}
		} finally {
			this.isProcessing = false;
			for (const resolve of this.idleWaiters.splice(0)) resolve();
		}
	}
	async run(job) {
		return new Promise((resolve, reject) => {
			this.queue.push(async () => {
				try {
					await job();
					resolve();
				} catch (error) {
					reject(error);
				}
			});
			this.processQueue();
		});
	}
	async waitForIdle() {
		if (!this.isProcessing && this.queue.length === 0) return;
		await new Promise((resolve) => {
			this.idleWaiters.push(resolve);
		});
	}
};
createIdGenerator({
	prefix: "aiobj",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
z.object({
	token: z.string().refine((value) => value.trim().length > 0),
	url: z.string().refine((value) => {
		try {
			const url = new URL(value);
			return (url.protocol === "ws:" || url.protocol === "wss:") && url.hostname !== "";
		} catch {
			return false;
		}
	}),
	expiresAt: z.number().positive().max(Number.MAX_SAFE_INTEGER).optional(),
	tools: z.array(z.object({
		type: z.literal("function"),
		name: z.string().min(1),
		description: z.string().optional(),
		parameters: z.record(z.string(), z.unknown())
	})).optional()
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
createIdGenerator({
	prefix: "call",
	size: 24
});
async function createUIApiCallError({ response, url, fallbackMessage }) {
	const responseBody = await response.text();
	return new APICallError({
		message: responseBody || fallbackMessage,
		url,
		requestBodyValues: void 0,
		statusCode: response.status,
		responseBody
	});
}
async function convertFileListToFileUIParts(files) {
	if (files == null) return [];
	if (!globalThis.FileList || !(files instanceof globalThis.FileList)) throw new UnsupportedFunctionalityError({
		functionality: "FileList",
		message: "FileList is not supported in the current environment"
	});
	return Promise.all(Array.from(files).map(async (file) => {
		const { name, type } = file;
		return {
			type: "file",
			mediaType: type,
			filename: name,
			url: await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = (readerEvent) => {
					resolve(readerEvent.target?.result);
				};
				reader.onerror = (error) => reject(error);
				reader.readAsDataURL(file);
			})
		};
	}));
}
function appendPathToUrl(url, path) {
	const queryOrFragmentStart = url.search(/[?#]/);
	const urlPath = queryOrFragmentStart === -1 ? url : url.slice(0, queryOrFragmentStart);
	const suffix = queryOrFragmentStart === -1 ? "" : url.slice(queryOrFragmentStart);
	return `${urlPath.endsWith("/") && path.startsWith("/") ? urlPath.slice(0, -1) : urlPath}${path}${suffix}`;
}
var HttpChatTransport = class {
	constructor({ api = "/api/chat", credentials, headers, body, fetch, prepareSendMessagesRequest, prepareReconnectToStreamRequest }) {
		this.api = api;
		this.credentials = credentials;
		this.headers = headers;
		this.body = body;
		this.fetch = fetch;
		this.prepareSendMessagesRequest = prepareSendMessagesRequest;
		this.prepareReconnectToStreamRequest = prepareReconnectToStreamRequest;
	}
	async sendMessages({ abortSignal, ...options }) {
		const resolvedBody = await resolve(this.body);
		const resolvedHeaders = await resolve(this.headers);
		const resolvedCredentials = await resolve(this.credentials);
		const baseHeaders = {
			...normalizeHeaders(resolvedHeaders),
			...normalizeHeaders(options.headers)
		};
		const preparedRequest = await this.prepareSendMessagesRequest?.({
			api: this.api,
			id: options.chatId,
			messages: options.messages,
			body: {
				...resolvedBody,
				...options.body
			},
			headers: baseHeaders,
			credentials: resolvedCredentials,
			requestMetadata: options.metadata,
			trigger: options.trigger,
			messageId: options.messageId
		});
		const api = preparedRequest?.api ?? this.api;
		const headers = preparedRequest?.headers !== void 0 ? normalizeHeaders(preparedRequest.headers) : baseHeaders;
		const body = preparedRequest?.body !== void 0 ? preparedRequest.body : {
			...resolvedBody,
			...options.body,
			id: options.chatId,
			messages: options.messages,
			trigger: options.trigger,
			messageId: options.messageId
		};
		const credentials = preparedRequest?.credentials ?? resolvedCredentials;
		const response = await (this.fetch ?? globalThis.fetch)(api, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				...headers
			},
			body: JSON.stringify(body),
			credentials,
			signal: abortSignal
		});
		if (!response.ok) throw await createUIApiCallError({
			response,
			url: api,
			fallbackMessage: "Failed to fetch the chat response."
		});
		if (!response.body) throw new EmptyResponseBodyError({ message: "The response body is empty." });
		return this.processResponseStream(response.body);
	}
	async reconnectToStream(options) {
		const resolvedBody = await resolve(this.body);
		const resolvedHeaders = await resolve(this.headers);
		const resolvedCredentials = await resolve(this.credentials);
		const baseHeaders = {
			...normalizeHeaders(resolvedHeaders),
			...normalizeHeaders(options.headers)
		};
		const preparedRequest = await this.prepareReconnectToStreamRequest?.({
			api: this.api,
			id: options.chatId,
			body: {
				...resolvedBody,
				...options.body
			},
			headers: baseHeaders,
			credentials: resolvedCredentials,
			requestMetadata: options.metadata
		});
		let api = preparedRequest?.api;
		if (api == null) {
			if (options.chatId === "." || options.chatId === "..") throw new InvalidArgumentError({
				parameter: "chatId",
				value: options.chatId,
				message: "Chat IDs must not be \".\" or \"..\" when using the default reconnect URL."
			});
			api = appendPathToUrl(this.api, `/${encodeURIComponent(options.chatId)}/stream`);
		}
		const headers = preparedRequest?.headers !== void 0 ? normalizeHeaders(preparedRequest.headers) : baseHeaders;
		const credentials = preparedRequest?.credentials ?? resolvedCredentials;
		const response = await (this.fetch ?? globalThis.fetch)(api, {
			method: "GET",
			headers,
			credentials,
			signal: options.abortSignal
		});
		if (response.status === 204) return null;
		if (!response.ok) throw await createUIApiCallError({
			response,
			url: api,
			fallbackMessage: "Failed to fetch the chat response."
		});
		if (!response.body) throw new EmptyResponseBodyError({ message: "The response body is empty." });
		return this.processResponseStream(response.body);
	}
};
var DefaultChatTransport = class extends HttpChatTransport {
	constructor({ resumeStreamIsReplay = true, ...options } = {}) {
		super(options);
		this.resumeStreamIsReplay = resumeStreamIsReplay;
	}
	processResponseStream(stream) {
		return parseJsonEventStream({
			stream,
			schema: uiMessageChunkSchema
		}).pipeThrough(new TransformStream({ async transform(chunk, controller) {
			if (!chunk.success) throw chunk.error;
			controller.enqueue(chunk.value);
		} }));
	}
};
var AbstractChat = class {
	get id() {
		return this._id ??= this.generateId();
	}
	constructor({ generateId: generateId$2 = generateId, id, transport = new DefaultChatTransport(), messageMetadataSchema, dataPartSchemas, state, onError, onToolCall, onFinish, onData, sendAutomaticallyWhen }) {
		this.pendingMessagePreparations = /* @__PURE__ */ new Set();
		this.activeResponse = void 0;
		this.activeResumeRequest = void 0;
		this.resumableStreamState = void 0;
		this.jobExecutor = new SerialJobExecutor();
		this.activeStopCount = 0;
		this.stopGeneration = 0;
		this.sendMessage = async (message, options) => {
			if (message == null) {
				let messageId = this.pendingApprovalMessageId;
				if (messageId == null) {
					messageId = this.lastMessage?.id;
					for (let i = this.state.messages.length - 1; i >= 0; i--) {
						const candidate = this.state.messages[i];
						if (candidate.role === "assistant" && candidate.parts.some((part) => isToolUIPart(part) && part.state === "approval-responded")) {
							messageId = candidate.id;
							break;
						}
					}
				}
				const pendingApprovalMessageIndex = messageId != null && messageId === this.pendingApprovalMessageId ? this.state.messages.findIndex((message) => message.id === messageId) : -1;
				await this.makeRequestForToolApproval({
					messageId,
					messageIndex: pendingApprovalMessageIndex,
					...options
				});
				return;
			}
			let uiMessage;
			if ("text" in message || "files" in message) {
				const abortController = new AbortController();
				this.pendingMessagePreparations.add(abortController);
				let fileParts;
				try {
					fileParts = Array.isArray(message.files) ? message.files : await convertFileListToFileUIParts(message.files);
				} finally {
					this.pendingMessagePreparations.delete(abortController);
				}
				if (abortController.signal.aborted) return;
				uiMessage = { parts: [...fileParts, ..."text" in message && message.text != null ? [{
					type: "text",
					text: message.text
				}] : []] };
			} else uiMessage = message;
			if (message.messageId != null) {
				const messageIndex = this.state.messages.findIndex((m) => m.id === message.messageId);
				if (messageIndex === -1) throw new InvalidArgumentError({
					parameter: "message.messageId",
					value: message.messageId,
					message: `message with id ${message.messageId} not found`
				});
				if (this.state.messages[messageIndex].role !== "user") throw new InvalidArgumentError({
					parameter: "message.messageId",
					value: message.messageId,
					message: `message with id ${message.messageId} is not a user message`
				});
				this.state.messages = this.state.messages.slice(0, messageIndex + 1);
				this.state.replaceMessage(messageIndex, {
					id: message.messageId,
					...uiMessage,
					role: uiMessage.role ?? "user",
					metadata: message.metadata
				});
			} else this.state.pushMessage({
				...uiMessage,
				id: uiMessage.id ?? this.generateId(),
				role: uiMessage.role ?? "user",
				metadata: message.metadata
			});
			await this.makeRequest({
				trigger: "submit-message",
				messageId: message.messageId,
				...options
			});
		};
		this.regenerate = async ({ messageId, ...options } = {}) => {
			const messageIndex = messageId == null ? this.state.messages.length - 1 : this.state.messages.findIndex((message) => message.id === messageId);
			if (messageIndex === -1) throw new InvalidArgumentError({
				parameter: "messageId",
				value: messageId,
				message: `message ${messageId} not found`
			});
			this.state.messages = this.state.messages.slice(0, this.messages[messageIndex].role === "assistant" ? messageIndex : messageIndex + 1);
			await this.makeRequest({
				trigger: "regenerate-message",
				messageId,
				...options
			});
		};
		this.resumeStream = async (options = {}) => {
			await this.makeRequest({
				trigger: "resume-stream",
				...options
			});
		};
		this["~resumeStreamIfDisconnected"] = async ({ shouldResume = () => true } = {}) => {
			const activeResponse = this.activeResponse;
			if (this.resumableStreamState == null && activeResponse != null) {
				await activeResponse.completionPromise;
				if (this.resumableStreamState !== activeResponse.state) return;
			}
			if (this.resumableStreamState != null && shouldResume()) await this.resumeStream();
		};
		this.clearError = () => {
			if (this.status === "error") {
				this.state.error = void 0;
				this.setStatus({ status: "ready" });
			}
		};
		this.addToolApprovalResponse = async ({ id, approved, reason, options }) => this.jobExecutor.run(async () => {
			const messages = this.state.messages;
			const updatePart = (part) => isToolUIPart(part) && part.state === "approval-requested" && part.approval.id === id ? {
				...part,
				state: "approval-responded",
				approval: {
					...part.approval,
					id,
					approved,
					reason
				}
			} : part;
			const messageIndex = messages.findIndex((message) => message.parts.some((part) => isToolUIPart(part) && part.state === "approval-requested" && part.approval.id === id));
			if (messageIndex !== -1) {
				const message = messages[messageIndex];
				this.state.replaceMessage(messageIndex, {
					...message,
					parts: message.parts.map(updatePart)
				});
				this.pendingApprovalMessageId = message.id;
			}
			if (this.activeResponse) this.activeResponse.state.message.parts = this.activeResponse.state.message.parts.map(updatePart);
			if (messageIndex !== -1 && this.status !== "streaming" && this.status !== "submitted" && this.sendAutomaticallyWhen) {
				const shouldSend = await this.shouldSendAutomatically();
				if (shouldSend) this.runAutomaticRequest(() => {
					const messageId = messageIndex === -1 ? this.lastMessage?.id : messages[messageIndex].id;
					return this.makeRequestForToolApproval({
						messageId,
						messageIndex,
						...options
					});
				}, shouldSend);
			}
		});
		this.addToolOutput = async ({ state, toolCallId, output, errorText, options }) => this.jobExecutor.run(async () => {
			const messages = this.state.messages;
			const updatePart = (part) => {
				if (!isToolUIPart(part) || part.toolCallId !== toolCallId) return part;
				const { approval: existingApproval, ...toolPart } = part;
				const approval = existingApproval?.approved === true ? { approval: {
					...existingApproval,
					approved: existingApproval.approved
				} } : {};
				return state === "output-error" ? {
					...toolPart,
					...approval,
					state,
					input: part.input,
					output: void 0,
					errorText
				} : {
					...toolPart,
					...approval,
					state: "output-available",
					input: part.input,
					output,
					errorText: void 0
				};
			};
			const messageIndex = messages.findIndex((message) => message.parts.some((part) => isToolUIPart(part) && part.toolCallId === toolCallId));
			if (messageIndex !== -1) {
				const message = messages[messageIndex];
				this.state.replaceMessage(messageIndex, {
					...message,
					parts: message.parts.map(updatePart)
				});
			}
			if (this.activeResponse) this.activeResponse.state.message.parts = this.activeResponse.state.message.parts.map(updatePart);
			if (messageIndex !== -1 && this.status !== "streaming" && this.status !== "submitted" && this.sendAutomaticallyWhen) {
				const shouldSend = await this.shouldSendAutomatically();
				if (shouldSend) this.runAutomaticRequest(() => this.makeRequest({
					trigger: "submit-message",
					messageId: messages[messageIndex].id,
					...options
				}), shouldSend);
			}
		});
		this.addToolResult = this.addToolOutput;
		this.stop = async () => {
			this.activeStopCount++;
			this.stopGeneration++;
			try {
				const activeResumeRequest = this.activeResumeRequest;
				const activeResponse = this.activeResponse;
				for (const controller of this.pendingMessagePreparations) controller.abort();
				activeResumeRequest?.abortController.abort();
				activeResponse?.abortController.abort();
				await Promise.all([activeResumeRequest?.completionPromise, activeResponse?.completionPromise]);
				await this.jobExecutor.waitForIdle();
			} finally {
				this.activeStopCount--;
			}
		};
		this.dispose = async () => {
			await this.stop();
			this.transport.close?.();
		};
		this._id = id;
		this.transport = transport;
		this.generateId = generateId$2;
		this.messageMetadataSchema = messageMetadataSchema;
		this.dataPartSchemas = dataPartSchemas;
		this.state = state;
		this.onError = onError;
		this.onToolCall = onToolCall;
		this.onFinish = onFinish;
		this.onData = onData;
		this.sendAutomaticallyWhen = sendAutomaticallyWhen;
	}
	/**
	* Hook status:
	*
	* - `submitted`: The message has been sent to the API and we're awaiting the start of the response stream.
	* - `streaming`: The response is actively streaming in from the API, receiving chunks of data.
	* - `ready`: The full response has been received and processed; a new user message can be submitted.
	* - `error`: An error occurred during the API request, preventing successful completion.
	*/
	get status() {
		return this.state.status;
	}
	setStatus({ status, error }) {
		if (this.status === status) {
			if (this.error !== error) this.state.error = error;
			return;
		}
		this.state.status = status;
		this.state.error = error;
	}
	get error() {
		return this.state.error;
	}
	get messages() {
		return this.state.messages;
	}
	get lastMessage() {
		return this.state.messages[this.state.messages.length - 1];
	}
	set messages(messages) {
		this.state.messages = messages;
	}
	async shouldSendAutomatically() {
		if (!this.sendAutomaticallyWhen) return false;
		const result = this.sendAutomaticallyWhen({ messages: this.state.messages });
		if (result && typeof result === "object" && "then" in result) return await result;
		return result;
	}
	async runAutomaticRequest(request, shouldSend) {
		const stopGeneration = this.stopGeneration;
		const startedWhileStopping = this.activeStopCount > 0;
		if (!(shouldSend ?? await this.shouldSendAutomatically())) return;
		if (startedWhileStopping || stopGeneration !== this.stopGeneration || this.activeStopCount > 0) return;
		await request();
	}
	async makeRequestForToolApproval({ messageId, messageIndex, ...options }) {
		const consumesPendingApproval = messageId != null && messageId === this.pendingApprovalMessageId;
		if (consumesPendingApproval) this.pendingApprovalMessageId = void 0;
		await this.makeRequest({
			trigger: "submit-message",
			messageId,
			...options
		});
		if (consumesPendingApproval && this.status === "error" && this.pendingApprovalMessageId == null) this.pendingApprovalMessageId = this.state.messages[messageIndex]?.id ?? messageId;
	}
	async makeRequest(options) {
		const completion = createResolvablePromise();
		try {
			await this.makeRequestImpl({
				...options,
				completionPromise: completion.promise
			});
		} finally {
			completion.resolve();
		}
	}
	async makeRequestImpl({ trigger, metadata, headers, body, messageId, completionPromise }) {
		if (trigger !== "resume-stream") this.resumableStreamState = void 0;
		const abortController = new AbortController();
		const activeResumeRequest = trigger === "resume-stream" ? {
			abortController,
			completionPromise
		} : void 0;
		if (activeResumeRequest) {
			this.activeResumeRequest?.abortController.abort();
			this.activeResumeRequest = activeResumeRequest;
		}
		const isCurrentRequest = () => activeResumeRequest == null || this.activeResumeRequest === activeResumeRequest;
		const clearActiveResumeRequest = () => {
			if (this.activeResumeRequest === activeResumeRequest) this.activeResumeRequest = void 0;
		};
		let resumeStream;
		if (trigger === "resume-stream") try {
			const reconnect = await this.transport.reconnectToStream({
				chatId: this.id,
				abortSignal: abortController.signal,
				metadata,
				headers,
				body
			});
			if (abortController.signal.aborted || !isCurrentRequest()) {
				await reconnect?.cancel().catch(() => {});
				if (isCurrentRequest()) {
					this.setStatus({ status: "ready" });
					this.resumableStreamState = void 0;
				}
				clearActiveResumeRequest();
				return;
			}
			if (reconnect == null) {
				this.setStatus({ status: "ready" });
				this.resumableStreamState = void 0;
				clearActiveResumeRequest();
				return;
			}
			resumeStream = reconnect;
		} catch (err) {
			if (abortController.signal.aborted || err.name === "AbortError") {
				if (isCurrentRequest()) {
					this.setStatus({ status: "ready" });
					this.resumableStreamState = void 0;
				}
				clearActiveResumeRequest();
				return;
			}
			if (!isCurrentRequest()) return;
			if (this.onError && err instanceof Error) this.onError(err);
			this.setStatus({
				status: "error",
				error: err
			});
			clearActiveResumeRequest();
			return;
		}
		this.setStatus({
			status: "submitted",
			error: void 0
		});
		const lastMessage = this.lastMessage;
		const responseMessageIndex = trigger === "submit-message" && messageId != null ? this.state.messages.findIndex((message) => message.id === messageId) : this.state.messages.length - 1;
		const responseMessage = responseMessageIndex === -1 ? lastMessage : this.state.messages[responseMessageIndex];
		const originalResponseMessageId = responseMessage?.id;
		const resumableResponseMessage = trigger === "resume-stream" && responseMessage?.role === "assistant" && responseMessage.parts.some((part) => isToolUIPart(part) && (part.state === "input-streaming" || part.state === "input-available" && part.providerExecuted || part.state === "approval-responded")) ? this.state.snapshot(responseMessage) : void 0;
		const usesEarlierAssistantMessage = responseMessageIndex !== -1 && responseMessageIndex < this.state.messages.length - 1 && responseMessage?.role === "assistant";
		let isAbort = false;
		let isDisconnect = false;
		let isError = false;
		let activeResponse;
		try {
			const response = {
				state: trigger === "resume-stream" && this.resumableStreamState != null ? this.resumableStreamState : createStreamingUIMessageState({
					lastMessage: trigger === "resume-stream" ? resumableResponseMessage : trigger === "regenerate-message" ? void 0 : this.state.snapshot(responseMessage),
					messageId: this.generateId()
				}),
				abortController,
				completionPromise
			};
			activeResponse = response;
			response.abortController.signal.addEventListener("abort", () => {
				isAbort = true;
			});
			this.activeResponse = response;
			let stream;
			if (trigger === "resume-stream") stream = resumeStream;
			else stream = await this.transport.sendMessages({
				chatId: this.id,
				messages: this.state.messages,
				abortSignal: response.abortController.signal,
				metadata,
				headers,
				body,
				trigger,
				messageId
			});
			const runUpdateMessageJob = (job) => this.jobExecutor.run(() => {
				if (response.abortController.signal.aborted) return Promise.resolve();
				return job({
					state: response.state,
					write: ({ updateStatus = true } = {}) => {
						if (response.abortController.signal.aborted) return;
						if (updateStatus) this.setStatus({ status: "streaming" });
						const existingMessageIndex = this.state.messages.findLastIndex((message) => message.id === response.state.message.id);
						if (existingMessageIndex !== -1) this.state.replaceMessage(existingMessageIndex, response.state.message);
						else if (usesEarlierAssistantMessage) {
							const originalMessageIndex = this.state.messages.findLastIndex((message) => message.id === originalResponseMessageId);
							if (originalMessageIndex !== -1) this.state.replaceMessage(originalMessageIndex, response.state.message);
							else this.state.pushMessage(response.state.message);
						} else this.state.pushMessage(response.state.message);
					}
				});
			});
			await consumeStream({
				stream: processUIMessageStream({
					stream,
					resetStateOnMessageIdChange: trigger === "resume-stream",
					resetStateOnFirstMessageStart: trigger === "resume-stream" && this.transport.resumeStreamIsReplay,
					onToolCall: this.onToolCall,
					onData: this.onData,
					messageMetadataSchema: this.messageMetadataSchema,
					dataPartSchemas: this.dataPartSchemas,
					runUpdateMessageJob,
					onError: (error) => {
						throw error;
					}
				}),
				abortSignal: response.abortController.signal,
				onError: (error) => {
					throw error;
				}
			});
			if (isAbort) {
				if (isCurrentRequest()) {
					this.setStatus({ status: "ready" });
					if (this.resumableStreamState === response.state) this.resumableStreamState = void 0;
				}
				return null;
			}
			if (isCurrentRequest()) {
				this.setStatus({ status: "ready" });
				if (this.resumableStreamState === response.state) this.resumableStreamState = void 0;
			}
		} catch (err) {
			if (isAbort || err.name === "AbortError") {
				isAbort = true;
				if (isCurrentRequest()) {
					this.setStatus({ status: "ready" });
					if (this.resumableStreamState === activeResponse?.state) this.resumableStreamState = void 0;
				}
				return null;
			}
			if (!isCurrentRequest()) return null;
			isError = true;
			if (err instanceof TypeError) {
				const message = err.message.toLowerCase();
				isDisconnect = message.includes("fetch") || message.includes("network") || message === "load failed";
			}
			if (isDisconnect) this.resumableStreamState = activeResponse?.state;
			else if (this.resumableStreamState === activeResponse?.state) this.resumableStreamState = void 0;
			if (this.onError && err instanceof Error) this.onError(err);
			this.setStatus({
				status: "error",
				error: err
			});
		} finally {
			try {
				if (activeResponse) this.onFinish?.({
					message: activeResponse.state.message,
					messages: this.state.messages,
					isAbort,
					isDisconnect,
					isError,
					finishReason: activeResponse.state.finishReason
				});
			} finally {
				if (this.activeResponse === activeResponse) this.activeResponse = void 0;
				clearActiveResumeRequest();
			}
		}
		if (!isAbort && !isError) await this.runAutomaticRequest(() => this.makeRequest({
			trigger: "submit-message",
			messageId: this.lastMessage?.id,
			metadata,
			headers,
			body
		}));
	}
};
//#endregion
//#region node_modules/throttleit/index.js
var require_throttleit = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function throttle(function_, wait) {
		if (typeof function_ !== "function") throw new TypeError(`Expected the first argument to be a \`function\`, got \`${typeof function_}\`.`);
		let timeoutId;
		let lastCallTime = 0;
		return function throttled(...arguments_) {
			clearTimeout(timeoutId);
			const now = Date.now();
			const delayForNextCall = wait - (now - lastCallTime);
			if (delayForNextCall <= 0) {
				lastCallTime = now;
				function_.apply(this, arguments_);
			} else timeoutId = setTimeout(() => {
				lastCallTime = Date.now();
				function_.apply(this, arguments_);
			}, delayForNextCall);
		};
	}
	module.exports = throttle;
}));
//#endregion
//#region node_modules/@ai-sdk/react/dist/index.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_throttleit = /* @__PURE__ */ __toESM(require_throttleit(), 1);
require_jsx_runtime();
function throttle(fn, waitMs) {
	return waitMs != null ? (0, import_throttleit.default)(fn, waitMs) : fn;
}
function cloneMetadata(metadata) {
	if (Array.isArray(metadata)) return [...metadata];
	if (metadata != null && typeof metadata === "object" && (Object.getPrototypeOf(metadata) === Object.prototype || Object.getPrototypeOf(metadata) === null)) return { ...metadata };
	return metadata;
}
var ReactChatState = class {
	#messages;
	#status;
	#error;
	#messagesCallbacks;
	#statusCallbacks;
	#errorCallbacks;
	constructor(initialMessages = []) {
		this.#status = "ready";
		this.#error = void 0;
		this.#messagesCallbacks = /* @__PURE__ */ new Set();
		this.#statusCallbacks = /* @__PURE__ */ new Set();
		this.#errorCallbacks = /* @__PURE__ */ new Set();
		this.pushMessage = (message) => {
			this.#messages = this.#messages.concat(message);
			this.#callMessagesCallbacks();
		};
		this.popMessage = () => {
			this.#messages = this.#messages.slice(0, -1);
			this.#callMessagesCallbacks();
		};
		this.replaceMessage = (index, message) => {
			this.#messages = [
				...this.#messages.slice(0, index),
				this.snapshot(message),
				...this.#messages.slice(index + 1)
			];
			this.#callMessagesCallbacks();
		};
		this.snapshot = (value) => {
			if (value == null || typeof value !== "object" || !("parts" in value) || !Array.isArray(value.parts)) return value;
			const message = value;
			const snapshot = {
				...message,
				parts: message.parts.map((part) => ({ ...part }))
			};
			if ("metadata" in message) snapshot.metadata = cloneMetadata(message.metadata);
			return snapshot;
		};
		this["~registerMessagesCallback"] = (onChange, throttleWaitMs) => {
			const callback = throttleWaitMs ? throttle(onChange, throttleWaitMs) : onChange;
			this.#messagesCallbacks.add(callback);
			return () => {
				this.#messagesCallbacks.delete(callback);
			};
		};
		this["~registerStatusCallback"] = (onChange) => {
			this.#statusCallbacks.add(onChange);
			return () => {
				this.#statusCallbacks.delete(onChange);
			};
		};
		this["~registerErrorCallback"] = (onChange) => {
			this.#errorCallbacks.add(onChange);
			return () => {
				this.#errorCallbacks.delete(onChange);
			};
		};
		this.#callMessagesCallbacks = () => {
			this.#messagesCallbacks.forEach((callback) => callback());
		};
		this.#callStatusCallbacks = () => {
			this.#statusCallbacks.forEach((callback) => callback());
		};
		this.#callErrorCallbacks = () => {
			this.#errorCallbacks.forEach((callback) => callback());
		};
		this.#messages = initialMessages;
	}
	get status() {
		return this.#status;
	}
	set status(newStatus) {
		this.#status = newStatus;
		this.#callStatusCallbacks();
	}
	get error() {
		return this.#error;
	}
	set error(newError) {
		this.#error = newError;
		this.#callErrorCallbacks();
	}
	get messages() {
		return this.#messages;
	}
	set messages(newMessages) {
		this.#messages = [...newMessages];
		this.#callMessagesCallbacks();
	}
	#callMessagesCallbacks;
	#callStatusCallbacks;
	#callErrorCallbacks;
};
var Chat = class extends AbstractChat {
	#state;
	constructor({ messages, ...init }) {
		const state = new ReactChatState(messages);
		super({
			...init,
			state
		});
		this["~registerMessagesCallback"] = (onChange, throttleWaitMs) => this.#state["~registerMessagesCallback"](onChange, throttleWaitMs);
		this["~registerStatusCallback"] = (onChange) => this.#state["~registerStatusCallback"](onChange);
		this["~registerErrorCallback"] = (onChange) => this.#state["~registerErrorCallback"](onChange);
		this.#state = state;
	}
};
var automaticResumeStates = /* @__PURE__ */ new WeakMap();
/**
* When the document becomes visible again, resume the chat stream if it was
* interrupted by a network disconnect while the page was in the background.
*/
function resumeOnVisible({ chat, state }) {
	if (document.visibilityState !== "visible" || state.pendingVisibilityResume != null) return;
	const isRegistered = () => automaticResumeStates.get(chat) === state && state.registrations.size > 0;
	const clearPendingResume = () => {
		state.pendingVisibilityResume = void 0;
	};
	state.pendingVisibilityResume = chat["~resumeStreamIfDisconnected"]({ shouldResume: () => isRegistered() && document.visibilityState === "visible" }).then(clearPendingResume, clearPendingResume);
}
function registerAutomaticResume({ chat, registration }) {
	let state = automaticResumeStates.get(chat);
	if (state == null) {
		const newState = { registrations: /* @__PURE__ */ new Set() };
		automaticResumeStates.set(chat, newState);
		state = newState;
		if (typeof document !== "undefined") {
			const onVisibilityChange = () => resumeOnVisible({
				chat,
				state: newState
			});
			document.addEventListener("visibilitychange", onVisibilityChange);
			newState.cleanupVisibilityListener = () => {
				document.removeEventListener("visibilitychange", onVisibilityChange);
			};
		}
	}
	const { registrations } = state;
	const shouldResume = registrations.size === 0;
	registrations.add(registration);
	if (shouldResume && chat.status !== "submitted" && chat.status !== "streaming") chat.resumeStream();
	return () => {
		registrations.delete(registration);
		if (registrations.size === 0) {
			state.cleanupVisibilityListener?.();
			automaticResumeStates.delete(chat);
		}
	};
}
function readChatSnapshot(chat) {
	return {
		chat,
		messages: chat.messages,
		status: chat.status,
		error: chat.error
	};
}
function equalChatSnapshots(current, next) {
	return current.chat === next.chat && current.messages === next.messages && current.status === next.status && current.error === next.error;
}
function useChat({ throttle, experimental_throttle, resume = false, ...options } = {}) {
	const throttleWaitMs = throttle ?? experimental_throttle;
	const automaticResumeRegistration = (0, import_react.useRef)({});
	const latestRef = (0, import_react.useRef)({});
	if (!("chat" in options)) latestRef.current = {
		onToolCall: options.onToolCall,
		onData: options.onData,
		onFinish: options.onFinish,
		onError: options.onError,
		sendAutomaticallyWhen: options.sendAutomaticallyWhen,
		transport: options.transport
	};
	let defaultTransport;
	const getTransport = () => latestRef.current.transport ?? (defaultTransport ??= new DefaultChatTransport());
	const chatOptions = {
		...options,
		transport: {
			get resumeStreamIsReplay() {
				return getTransport().resumeStreamIsReplay;
			},
			sendMessages: (sendOptions) => getTransport().sendMessages(sendOptions),
			reconnectToStream: (reconnectOptions) => getTransport().reconnectToStream(reconnectOptions)
		},
		onToolCall: (arg) => latestRef.current.onToolCall?.(arg),
		onData: (arg) => latestRef.current.onData?.(arg),
		onFinish: (arg) => latestRef.current.onFinish?.(arg),
		onError: (arg) => latestRef.current.onError?.(arg),
		sendAutomaticallyWhen: (arg) => latestRef.current.sendAutomaticallyWhen?.(arg) ?? false
	};
	const chatKey = "chat" in options ? options.chat : options.id;
	const { chat, isExternallyManaged } = (0, import_react.useMemo)(() => ({
		chat: "chat" in options ? options.chat : new Chat(chatOptions),
		isExternallyManaged: "chat" in options
	}), [chatKey]);
	(0, import_react.useEffect)(() => {
		if (isExternallyManaged) return;
		return () => {
			chat.stop();
		};
	}, [chat, isExternallyManaged]);
	const [snapshot, setSnapshot] = (0, import_react.useState)(() => readChatSnapshot(chat));
	if (snapshot.chat !== chat) setSnapshot(readChatSnapshot(chat));
	(0, import_react.useEffect)(() => {
		let isSubscribed = true;
		const publishSnapshot = () => {
			if (!isSubscribed) return;
			const nextSnapshot = readChatSnapshot(chat);
			setSnapshot((current) => current.chat !== chat || equalChatSnapshots(current, nextSnapshot) ? current : nextSnapshot);
		};
		const unsubscribes = [
			chat["~registerMessagesCallback"](publishSnapshot, throttleWaitMs),
			chat["~registerStatusCallback"](publishSnapshot),
			chat["~registerErrorCallback"](publishSnapshot)
		];
		const nextSnapshot = readChatSnapshot(chat);
		setSnapshot((current) => equalChatSnapshots(current, nextSnapshot) ? current : nextSnapshot);
		return () => {
			isSubscribed = false;
			unsubscribes.forEach((unsubscribe) => unsubscribe());
		};
	}, [chat, throttleWaitMs]);
	const { messages, status, error } = snapshot;
	const setMessages = (0, import_react.useCallback)((messagesParam) => {
		if (typeof messagesParam === "function") messagesParam = messagesParam(chat.messages);
		chat.messages = messagesParam;
	}, [chat]);
	(0, import_react.useEffect)(() => {
		if (resume) return registerAutomaticResume({
			chat,
			registration: automaticResumeRegistration.current
		});
	}, [resume, chat]);
	return {
		get id() {
			return chat.id;
		},
		messages,
		setMessages,
		sendMessage: chat.sendMessage,
		regenerate: chat.regenerate,
		clearError: chat.clearError,
		stop: chat.stop,
		error,
		resumeStream: chat.resumeStream,
		status,
		/**
		* @deprecated Use `addToolOutput` instead.
		*/
		addToolResult: chat.addToolOutput,
		addToolOutput: chat.addToolOutput,
		addToolApprovalResponse: chat.addToolApprovalResponse
	};
}
//#endregion
export { require_jsx_runtime as a, createUIMessageStreamResponse as i, DefaultChatTransport as n, require_react as o, createUIMessageStream as r, useChat as t };
