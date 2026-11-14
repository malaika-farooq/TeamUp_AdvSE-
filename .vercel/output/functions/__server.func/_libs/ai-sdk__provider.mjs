//#region node_modules/@ai-sdk/provider/dist/index.js
/**
* Symbol used for identifying AI SDK Error instances.
* Enables checking if an error is an instance of AISDKError across package versions.
*/
var marker$16 = "vercel.ai.error";
var symbol$16 = Symbol.for(marker$16);
/**
* Custom error class for AI SDK related errors.
* @extends Error
*/
var AISDKError = class AISDKError extends Error {
	/**
	* Creates an AI SDK Error.
	*
	* @param {Object} params - The parameters for creating the error.
	* @param {string} params.name - The name of the error.
	* @param {string} params.message - The error message.
	* @param {unknown} [params.cause] - The underlying cause of the error.
	*/
	constructor({ name, message, cause }) {
		super(message);
		this[symbol$16] = true;
		this.name = name;
		this.cause = cause;
	}
	/**
	* Checks if the given error is an AI SDK Error.
	* @param {unknown} error - The error to check.
	* @returns {boolean} True if the error is an AI SDK Error, false otherwise.
	*/
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$16);
	}
	static hasMarker(error, marker) {
		const markerSymbol = Symbol.for(marker);
		return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
	}
};
var name$14 = "AI_APICallError";
var marker$14 = `vercel.ai.error.${name$14}`;
var symbol$14 = Symbol.for(marker$14);
var APICallError = class extends AISDKError {
	constructor({ message, url, requestBodyValues, statusCode, responseHeaders, responseBody, cause, isRetryable = statusCode != null && (statusCode === 408 || statusCode === 409 || statusCode === 429 || statusCode >= 500), data }) {
		super({
			name: name$14,
			message,
			cause
		});
		this[symbol$14] = true;
		this.url = url;
		this.requestBodyValues = requestBodyValues;
		this.statusCode = statusCode;
		this.responseHeaders = responseHeaders;
		this.responseBody = responseBody;
		this.isRetryable = isRetryable;
		this.data = data;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$14);
	}
};
var name$13 = "AI_EmptyResponseBodyError";
var marker$13 = `vercel.ai.error.${name$13}`;
var symbol$13 = Symbol.for(marker$13);
var EmptyResponseBodyError = class extends AISDKError {
	constructor({ message = "Empty response body" } = {}) {
		super({
			name: name$13,
			message
		});
		this[symbol$13] = true;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$13);
	}
};
function getErrorMessage(error) {
	if (error == null) return "unknown error";
	if (typeof error === "string") return error;
	if (error instanceof Error) return error.toString();
	return JSON.stringify(error);
}
var name$11 = "AI_InvalidArgumentError";
var marker$11 = `vercel.ai.error.${name$11}`;
var symbol$11 = Symbol.for(marker$11);
/**
* A function argument is invalid.
*/
var InvalidArgumentError = class extends AISDKError {
	constructor({ message, cause, argument }) {
		super({
			name: name$11,
			message,
			cause
		});
		this[symbol$11] = true;
		this.argument = argument;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$11);
	}
};
var name$8 = "AI_JSONParseError";
var marker$8 = `vercel.ai.error.${name$8}`;
var symbol$8 = Symbol.for(marker$8);
var JSONParseError = class extends AISDKError {
	constructor({ text, cause }) {
		super({
			name: name$8,
			message: `JSON parsing failed: Text: ${text}.\nError message: ${getErrorMessage(cause)}`,
			cause
		});
		this[symbol$8] = true;
		this.text = text;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$8);
	}
};
var name$1 = "AI_TypeValidationError";
var marker$1 = `vercel.ai.error.${name$1}`;
var symbol$1 = Symbol.for(marker$1);
var TypeValidationError = class TypeValidationError extends AISDKError {
	constructor({ value, cause, context }) {
		let contextPrefix = "Type validation failed";
		if (context?.field) contextPrefix += ` for ${context.field}`;
		if (context?.entityName || context?.entityId) {
			contextPrefix += " (";
			const parts = [];
			if (context.entityName) parts.push(context.entityName);
			if (context.entityId) parts.push(`id: "${context.entityId}"`);
			contextPrefix += parts.join(", ");
			contextPrefix += ")";
		}
		super({
			name: name$1,
			message: `${contextPrefix}: Value: ${JSON.stringify(value)}.\nError message: ${getErrorMessage(cause)}`,
			cause
		});
		this[symbol$1] = true;
		this.value = value;
		this.context = context;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker$1);
	}
	/**
	* Wraps an error into a TypeValidationError.
	* If the cause is already a TypeValidationError with the same value and context, it returns the cause.
	* Otherwise, it creates a new TypeValidationError.
	*
	* @param {Object} params - The parameters for wrapping the error.
	* @param {unknown} params.value - The value that failed validation.
	* @param {unknown} params.cause - The original error or cause of the validation failure.
	* @param {TypeValidationContext} params.context - Optional context about what is being validated.
	* @returns {TypeValidationError} A TypeValidationError instance.
	*/
	static wrap({ value, cause, context }) {
		if (TypeValidationError.isInstance(cause) && cause.value === value && cause.context?.field === context?.field && cause.context?.entityName === context?.entityName && cause.context?.entityId === context?.entityId) return cause;
		return new TypeValidationError({
			value,
			cause,
			context
		});
	}
};
var name = "AI_UnsupportedFunctionalityError";
var marker = `vercel.ai.error.${name}`;
var symbol = Symbol.for(marker);
var UnsupportedFunctionalityError = class extends AISDKError {
	constructor({ functionality, message = `'${functionality}' functionality not supported.` }) {
		super({
			name,
			message
		});
		this[symbol] = true;
		this.functionality = functionality;
	}
	static isInstance(error) {
		return AISDKError.hasMarker(error, marker);
	}
};
//#endregion
export { JSONParseError as a, InvalidArgumentError as i, APICallError as n, TypeValidationError as o, EmptyResponseBodyError as r, UnsupportedFunctionalityError as s, AISDKError as t };
