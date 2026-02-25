(function() {


//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
	var util;
	(function(util) {
		util.assertEqual = (_) => {};
		function assertIs(_arg) {}
		util.assertIs = assertIs;
		function assertNever(_x) {
			throw new Error();
		}
		util.assertNever = assertNever;
		util.arrayToEnum = (items) => {
			const obj = {};
			for (const item of items) obj[item] = item;
			return obj;
		};
		util.getValidEnumValues = (obj) => {
			const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
			const filtered = {};
			for (const k of validKeys) filtered[k] = obj[k];
			return util.objectValues(filtered);
		};
		util.objectValues = (obj) => {
			return util.objectKeys(obj).map(function(e) {
				return obj[e];
			});
		};
		util.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
			const keys = [];
			for (const key in object) if (Object.prototype.hasOwnProperty.call(object, key)) keys.push(key);
			return keys;
		};
		util.find = (arr, checker) => {
			for (const item of arr) if (checker(item)) return item;
		};
		util.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
		function joinValues(array, separator = " | ") {
			return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
		}
		util.joinValues = joinValues;
		util.jsonStringifyReplacer = (_, value) => {
			if (typeof value === "bigint") return value.toString();
			return value;
		};
	})(util || (util = {}));
	var objectUtil;
	(function(objectUtil) {
		objectUtil.mergeShapes = (first, second) => {
			return {
				...first,
				...second
			};
		};
	})(objectUtil || (objectUtil = {}));
	const ZodParsedType = util.arrayToEnum([
		"string",
		"nan",
		"number",
		"integer",
		"float",
		"boolean",
		"date",
		"bigint",
		"symbol",
		"function",
		"undefined",
		"null",
		"array",
		"object",
		"unknown",
		"promise",
		"void",
		"never",
		"map",
		"set"
	]);
	const getParsedType = (data) => {
		switch (typeof data) {
			case "undefined": return ZodParsedType.undefined;
			case "string": return ZodParsedType.string;
			case "number": return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
			case "boolean": return ZodParsedType.boolean;
			case "function": return ZodParsedType.function;
			case "bigint": return ZodParsedType.bigint;
			case "symbol": return ZodParsedType.symbol;
			case "object":
				if (Array.isArray(data)) return ZodParsedType.array;
				if (data === null) return ZodParsedType.null;
				if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") return ZodParsedType.promise;
				if (typeof Map !== "undefined" && data instanceof Map) return ZodParsedType.map;
				if (typeof Set !== "undefined" && data instanceof Set) return ZodParsedType.set;
				if (typeof Date !== "undefined" && data instanceof Date) return ZodParsedType.date;
				return ZodParsedType.object;
			default: return ZodParsedType.unknown;
		}
	};

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
	const ZodIssueCode = util.arrayToEnum([
		"invalid_type",
		"invalid_literal",
		"custom",
		"invalid_union",
		"invalid_union_discriminator",
		"invalid_enum_value",
		"unrecognized_keys",
		"invalid_arguments",
		"invalid_return_type",
		"invalid_date",
		"invalid_string",
		"too_small",
		"too_big",
		"invalid_intersection_types",
		"not_multiple_of",
		"not_finite"
	]);
	var ZodError$1 = class ZodError$1 extends Error {
		get errors() {
			return this.issues;
		}
		constructor(issues) {
			super();
			this.issues = [];
			this.addIssue = (sub) => {
				this.issues = [...this.issues, sub];
			};
			this.addIssues = (subs = []) => {
				this.issues = [...this.issues, ...subs];
			};
			const actualProto = new.target.prototype;
			if (Object.setPrototypeOf) Object.setPrototypeOf(this, actualProto);
			else this.__proto__ = actualProto;
			this.name = "ZodError";
			this.issues = issues;
		}
		format(_mapper) {
			const mapper = _mapper || function(issue) {
				return issue.message;
			};
			const fieldErrors = { _errors: [] };
			const processError = (error) => {
				for (const issue of error.issues) if (issue.code === "invalid_union") issue.unionErrors.map(processError);
				else if (issue.code === "invalid_return_type") processError(issue.returnTypeError);
				else if (issue.code === "invalid_arguments") processError(issue.argumentsError);
				else if (issue.path.length === 0) fieldErrors._errors.push(mapper(issue));
				else {
					let curr = fieldErrors;
					let i = 0;
					while (i < issue.path.length) {
						const el = issue.path[i];
						if (!(i === issue.path.length - 1)) curr[el] = curr[el] || { _errors: [] };
						else {
							curr[el] = curr[el] || { _errors: [] };
							curr[el]._errors.push(mapper(issue));
						}
						curr = curr[el];
						i++;
					}
				}
			};
			processError(this);
			return fieldErrors;
		}
		static assert(value) {
			if (!(value instanceof ZodError$1)) throw new Error(`Not a ZodError: ${value}`);
		}
		toString() {
			return this.message;
		}
		get message() {
			return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
		}
		get isEmpty() {
			return this.issues.length === 0;
		}
		flatten(mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of this.issues) if (sub.path.length > 0) {
				const firstEl = sub.path[0];
				fieldErrors[firstEl] = fieldErrors[firstEl] || [];
				fieldErrors[firstEl].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		get formErrors() {
			return this.flatten();
		}
	};
	ZodError$1.create = (issues) => {
		return new ZodError$1(issues);
	};

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
	const errorMap = (issue, _ctx) => {
		let message;
		switch (issue.code) {
			case ZodIssueCode.invalid_type:
				if (issue.received === ZodParsedType.undefined) message = "Required";
				else message = `Expected ${issue.expected}, received ${issue.received}`;
				break;
			case ZodIssueCode.invalid_literal:
				message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
				break;
			case ZodIssueCode.unrecognized_keys:
				message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
				break;
			case ZodIssueCode.invalid_union:
				message = `Invalid input`;
				break;
			case ZodIssueCode.invalid_union_discriminator:
				message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
				break;
			case ZodIssueCode.invalid_enum_value:
				message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
				break;
			case ZodIssueCode.invalid_arguments:
				message = `Invalid function arguments`;
				break;
			case ZodIssueCode.invalid_return_type:
				message = `Invalid function return type`;
				break;
			case ZodIssueCode.invalid_date:
				message = `Invalid date`;
				break;
			case ZodIssueCode.invalid_string:
				if (typeof issue.validation === "object") if ("includes" in issue.validation) {
					message = `Invalid input: must include "${issue.validation.includes}"`;
					if (typeof issue.validation.position === "number") message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
				} else if ("startsWith" in issue.validation) message = `Invalid input: must start with "${issue.validation.startsWith}"`;
				else if ("endsWith" in issue.validation) message = `Invalid input: must end with "${issue.validation.endsWith}"`;
				else util.assertNever(issue.validation);
				else if (issue.validation !== "regex") message = `Invalid ${issue.validation}`;
				else message = "Invalid";
				break;
			case ZodIssueCode.too_small:
				if (issue.type === "array") message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
				else if (issue.type === "string") message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
				else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
				else if (issue.type === "bigint") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
				else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
				else message = "Invalid input";
				break;
			case ZodIssueCode.too_big:
				if (issue.type === "array") message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
				else if (issue.type === "string") message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
				else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
				else if (issue.type === "bigint") message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
				else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
				else message = "Invalid input";
				break;
			case ZodIssueCode.custom:
				message = `Invalid input`;
				break;
			case ZodIssueCode.invalid_intersection_types:
				message = `Intersection results could not be merged`;
				break;
			case ZodIssueCode.not_multiple_of:
				message = `Number must be a multiple of ${issue.multipleOf}`;
				break;
			case ZodIssueCode.not_finite:
				message = "Number must be finite";
				break;
			default:
				message = _ctx.defaultError;
				util.assertNever(issue);
		}
		return { message };
	};

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
	let overrideErrorMap = errorMap;
	function getErrorMap() {
		return overrideErrorMap;
	}

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
	const makeIssue = (params) => {
		const { data, path, errorMaps, issueData } = params;
		const fullPath = [...path, ...issueData.path || []];
		const fullIssue = {
			...issueData,
			path: fullPath
		};
		if (issueData.message !== void 0) return {
			...issueData,
			path: fullPath,
			message: issueData.message
		};
		let errorMessage = "";
		const maps = errorMaps.filter((m) => !!m).slice().reverse();
		for (const map of maps) errorMessage = map(fullIssue, {
			data,
			defaultError: errorMessage
		}).message;
		return {
			...issueData,
			path: fullPath,
			message: errorMessage
		};
	};
	function addIssueToContext(ctx, issueData) {
		const overrideMap = getErrorMap();
		const issue = makeIssue({
			issueData,
			data: ctx.data,
			path: ctx.path,
			errorMaps: [
				ctx.common.contextualErrorMap,
				ctx.schemaErrorMap,
				overrideMap,
				overrideMap === errorMap ? void 0 : errorMap
			].filter((x) => !!x)
		});
		ctx.common.issues.push(issue);
	}
	var ParseStatus = class ParseStatus {
		constructor() {
			this.value = "valid";
		}
		dirty() {
			if (this.value === "valid") this.value = "dirty";
		}
		abort() {
			if (this.value !== "aborted") this.value = "aborted";
		}
		static mergeArray(status, results) {
			const arrayValue = [];
			for (const s of results) {
				if (s.status === "aborted") return INVALID;
				if (s.status === "dirty") status.dirty();
				arrayValue.push(s.value);
			}
			return {
				status: status.value,
				value: arrayValue
			};
		}
		static async mergeObjectAsync(status, pairs) {
			const syncPairs = [];
			for (const pair of pairs) {
				const key = await pair.key;
				const value = await pair.value;
				syncPairs.push({
					key,
					value
				});
			}
			return ParseStatus.mergeObjectSync(status, syncPairs);
		}
		static mergeObjectSync(status, pairs) {
			const finalObject = {};
			for (const pair of pairs) {
				const { key, value } = pair;
				if (key.status === "aborted") return INVALID;
				if (value.status === "aborted") return INVALID;
				if (key.status === "dirty") status.dirty();
				if (value.status === "dirty") status.dirty();
				if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) finalObject[key.value] = value.value;
			}
			return {
				status: status.value,
				value: finalObject
			};
		}
	};
	const INVALID = Object.freeze({ status: "aborted" });
	const DIRTY = (value) => ({
		status: "dirty",
		value
	});
	const OK = (value) => ({
		status: "valid",
		value
	});
	const isAborted = (x) => x.status === "aborted";
	const isDirty = (x) => x.status === "dirty";
	const isValid = (x) => x.status === "valid";
	const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
	var errorUtil;
	(function(errorUtil) {
		errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
		errorUtil.toString = (message) => typeof message === "string" ? message : message?.message;
	})(errorUtil || (errorUtil = {}));

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
	var ParseInputLazyPath = class {
		constructor(parent, value, path, key) {
			this._cachedPath = [];
			this.parent = parent;
			this.data = value;
			this._path = path;
			this._key = key;
		}
		get path() {
			if (!this._cachedPath.length) if (Array.isArray(this._key)) this._cachedPath.push(...this._path, ...this._key);
			else this._cachedPath.push(...this._path, this._key);
			return this._cachedPath;
		}
	};
	const handleResult = (ctx, result) => {
		if (isValid(result)) return {
			success: true,
			data: result.value
		};
		else {
			if (!ctx.common.issues.length) throw new Error("Validation failed but no issues detected.");
			return {
				success: false,
				get error() {
					if (this._error) return this._error;
					this._error = new ZodError$1(ctx.common.issues);
					return this._error;
				}
			};
		}
	};
	function processCreateParams(params) {
		if (!params) return {};
		const { errorMap, invalid_type_error, required_error, description } = params;
		if (errorMap && (invalid_type_error || required_error)) throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
		if (errorMap) return {
			errorMap,
			description
		};
		const customMap = (iss, ctx) => {
			const { message } = params;
			if (iss.code === "invalid_enum_value") return { message: message ?? ctx.defaultError };
			if (typeof ctx.data === "undefined") return { message: message ?? required_error ?? ctx.defaultError };
			if (iss.code !== "invalid_type") return { message: ctx.defaultError };
			return { message: message ?? invalid_type_error ?? ctx.defaultError };
		};
		return {
			errorMap: customMap,
			description
		};
	}
	var ZodType$1 = class {
		get description() {
			return this._def.description;
		}
		_getType(input) {
			return getParsedType(input.data);
		}
		_getOrReturnCtx(input, ctx) {
			return ctx || {
				common: input.parent.common,
				data: input.data,
				parsedType: getParsedType(input.data),
				schemaErrorMap: this._def.errorMap,
				path: input.path,
				parent: input.parent
			};
		}
		_processInputParams(input) {
			return {
				status: new ParseStatus(),
				ctx: {
					common: input.parent.common,
					data: input.data,
					parsedType: getParsedType(input.data),
					schemaErrorMap: this._def.errorMap,
					path: input.path,
					parent: input.parent
				}
			};
		}
		_parseSync(input) {
			const result = this._parse(input);
			if (isAsync(result)) throw new Error("Synchronous parse encountered promise.");
			return result;
		}
		_parseAsync(input) {
			const result = this._parse(input);
			return Promise.resolve(result);
		}
		parse(data, params) {
			const result = this.safeParse(data, params);
			if (result.success) return result.data;
			throw result.error;
		}
		safeParse(data, params) {
			const ctx = {
				common: {
					issues: [],
					async: params?.async ?? false,
					contextualErrorMap: params?.errorMap
				},
				path: params?.path || [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: getParsedType(data)
			};
			return handleResult(ctx, this._parseSync({
				data,
				path: ctx.path,
				parent: ctx
			}));
		}
		"~validate"(data) {
			const ctx = {
				common: {
					issues: [],
					async: !!this["~standard"].async
				},
				path: [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: getParsedType(data)
			};
			if (!this["~standard"].async) try {
				const result = this._parseSync({
					data,
					path: [],
					parent: ctx
				});
				return isValid(result) ? { value: result.value } : { issues: ctx.common.issues };
			} catch (err) {
				if (err?.message?.toLowerCase()?.includes("encountered")) this["~standard"].async = true;
				ctx.common = {
					issues: [],
					async: true
				};
			}
			return this._parseAsync({
				data,
				path: [],
				parent: ctx
			}).then((result) => isValid(result) ? { value: result.value } : { issues: ctx.common.issues });
		}
		async parseAsync(data, params) {
			const result = await this.safeParseAsync(data, params);
			if (result.success) return result.data;
			throw result.error;
		}
		async safeParseAsync(data, params) {
			const ctx = {
				common: {
					issues: [],
					contextualErrorMap: params?.errorMap,
					async: true
				},
				path: params?.path || [],
				schemaErrorMap: this._def.errorMap,
				parent: null,
				data,
				parsedType: getParsedType(data)
			};
			const maybeAsyncResult = this._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
			return handleResult(ctx, await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult)));
		}
		refine(check, message) {
			const getIssueProperties = (val) => {
				if (typeof message === "string" || typeof message === "undefined") return { message };
				else if (typeof message === "function") return message(val);
				else return message;
			};
			return this._refinement((val, ctx) => {
				const result = check(val);
				const setError = () => ctx.addIssue({
					code: ZodIssueCode.custom,
					...getIssueProperties(val)
				});
				if (typeof Promise !== "undefined" && result instanceof Promise) return result.then((data) => {
					if (!data) {
						setError();
						return false;
					} else return true;
				});
				if (!result) {
					setError();
					return false;
				} else return true;
			});
		}
		refinement(check, refinementData) {
			return this._refinement((val, ctx) => {
				if (!check(val)) {
					ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
					return false;
				} else return true;
			});
		}
		_refinement(refinement) {
			return new ZodEffects({
				schema: this,
				typeName: ZodFirstPartyTypeKind.ZodEffects,
				effect: {
					type: "refinement",
					refinement
				}
			});
		}
		superRefine(refinement) {
			return this._refinement(refinement);
		}
		constructor(def) {
			/** Alias of safeParseAsync */
			this.spa = this.safeParseAsync;
			this._def = def;
			this.parse = this.parse.bind(this);
			this.safeParse = this.safeParse.bind(this);
			this.parseAsync = this.parseAsync.bind(this);
			this.safeParseAsync = this.safeParseAsync.bind(this);
			this.spa = this.spa.bind(this);
			this.refine = this.refine.bind(this);
			this.refinement = this.refinement.bind(this);
			this.superRefine = this.superRefine.bind(this);
			this.optional = this.optional.bind(this);
			this.nullable = this.nullable.bind(this);
			this.nullish = this.nullish.bind(this);
			this.array = this.array.bind(this);
			this.promise = this.promise.bind(this);
			this.or = this.or.bind(this);
			this.and = this.and.bind(this);
			this.transform = this.transform.bind(this);
			this.brand = this.brand.bind(this);
			this.default = this.default.bind(this);
			this.catch = this.catch.bind(this);
			this.describe = this.describe.bind(this);
			this.pipe = this.pipe.bind(this);
			this.readonly = this.readonly.bind(this);
			this.isNullable = this.isNullable.bind(this);
			this.isOptional = this.isOptional.bind(this);
			this["~standard"] = {
				version: 1,
				vendor: "zod",
				validate: (data) => this["~validate"](data)
			};
		}
		optional() {
			return ZodOptional$1.create(this, this._def);
		}
		nullable() {
			return ZodNullable$1.create(this, this._def);
		}
		nullish() {
			return this.nullable().optional();
		}
		array() {
			return ZodArray$1.create(this);
		}
		promise() {
			return ZodPromise.create(this, this._def);
		}
		or(option) {
			return ZodUnion$1.create([this, option], this._def);
		}
		and(incoming) {
			return ZodIntersection$1.create(this, incoming, this._def);
		}
		transform(transform) {
			return new ZodEffects({
				...processCreateParams(this._def),
				schema: this,
				typeName: ZodFirstPartyTypeKind.ZodEffects,
				effect: {
					type: "transform",
					transform
				}
			});
		}
		default(def) {
			const defaultValueFunc = typeof def === "function" ? def : () => def;
			return new ZodDefault$1({
				...processCreateParams(this._def),
				innerType: this,
				defaultValue: defaultValueFunc,
				typeName: ZodFirstPartyTypeKind.ZodDefault
			});
		}
		brand() {
			return new ZodBranded({
				typeName: ZodFirstPartyTypeKind.ZodBranded,
				type: this,
				...processCreateParams(this._def)
			});
		}
		catch(def) {
			const catchValueFunc = typeof def === "function" ? def : () => def;
			return new ZodCatch$1({
				...processCreateParams(this._def),
				innerType: this,
				catchValue: catchValueFunc,
				typeName: ZodFirstPartyTypeKind.ZodCatch
			});
		}
		describe(description) {
			const This = this.constructor;
			return new This({
				...this._def,
				description
			});
		}
		pipe(target) {
			return ZodPipeline.create(this, target);
		}
		readonly() {
			return ZodReadonly$1.create(this);
		}
		isOptional() {
			return this.safeParse(void 0).success;
		}
		isNullable() {
			return this.safeParse(null).success;
		}
	};
	const cuidRegex = /^c[^\s-]{8,}$/i;
	const cuid2Regex = /^[0-9a-z]+$/;
	const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
	const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
	const nanoidRegex = /^[a-z0-9_-]{21}$/i;
	const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
	const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
	const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
	const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
	let emojiRegex$1;
	const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
	const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
	const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
	const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
	const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
	const base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
	const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
	const dateRegex = new RegExp(`^${dateRegexSource}$`);
	function timeRegexSource(args) {
		let secondsRegexSource = `[0-5]\\d`;
		if (args.precision) secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
		else if (args.precision == null) secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
		const secondsQuantifier = args.precision ? "+" : "?";
		return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
	}
	function timeRegex(args) {
		return new RegExp(`^${timeRegexSource(args)}$`);
	}
	function datetimeRegex(args) {
		let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
		const opts = [];
		opts.push(args.local ? `Z?` : `Z`);
		if (args.offset) opts.push(`([+-]\\d{2}:?\\d{2})`);
		regex = `${regex}(${opts.join("|")})`;
		return new RegExp(`^${regex}$`);
	}
	function isValidIP(ip, version) {
		if ((version === "v4" || !version) && ipv4Regex.test(ip)) return true;
		if ((version === "v6" || !version) && ipv6Regex.test(ip)) return true;
		return false;
	}
	function isValidJWT$1(jwt, alg) {
		if (!jwtRegex.test(jwt)) return false;
		try {
			const [header] = jwt.split(".");
			if (!header) return false;
			const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
			const decoded = JSON.parse(atob(base64));
			if (typeof decoded !== "object" || decoded === null) return false;
			if ("typ" in decoded && decoded?.typ !== "JWT") return false;
			if (!decoded.alg) return false;
			if (alg && decoded.alg !== alg) return false;
			return true;
		} catch {
			return false;
		}
	}
	function isValidCidr(ip, version) {
		if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) return true;
		if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) return true;
		return false;
	}
	var ZodString$1 = class ZodString$1 extends ZodType$1 {
		_parse(input) {
			if (this._def.coerce) input.data = String(input.data);
			if (this._getType(input) !== ZodParsedType.string) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.string,
					received: ctx.parsedType
				});
				return INVALID;
			}
			const status = new ParseStatus();
			let ctx = void 0;
			for (const check of this._def.checks) if (check.kind === "min") {
				if (input.data.length < check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_small,
						minimum: check.value,
						type: "string",
						inclusive: true,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (input.data.length > check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_big,
						maximum: check.value,
						type: "string",
						inclusive: true,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "length") {
				const tooBig = input.data.length > check.value;
				const tooSmall = input.data.length < check.value;
				if (tooBig || tooSmall) {
					ctx = this._getOrReturnCtx(input, ctx);
					if (tooBig) addIssueToContext(ctx, {
						code: ZodIssueCode.too_big,
						maximum: check.value,
						type: "string",
						inclusive: true,
						exact: true,
						message: check.message
					});
					else if (tooSmall) addIssueToContext(ctx, {
						code: ZodIssueCode.too_small,
						minimum: check.value,
						type: "string",
						inclusive: true,
						exact: true,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "email") {
				if (!emailRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "email",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "emoji") {
				if (!emojiRegex$1) emojiRegex$1 = new RegExp(_emojiRegex, "u");
				if (!emojiRegex$1.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "emoji",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "uuid") {
				if (!uuidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "uuid",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "nanoid") {
				if (!nanoidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "nanoid",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cuid") {
				if (!cuidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "cuid",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cuid2") {
				if (!cuid2Regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "cuid2",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "ulid") {
				if (!ulidRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "ulid",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "url") try {
				new URL(input.data);
			} catch {
				ctx = this._getOrReturnCtx(input, ctx);
				addIssueToContext(ctx, {
					validation: "url",
					code: ZodIssueCode.invalid_string,
					message: check.message
				});
				status.dirty();
			}
			else if (check.kind === "regex") {
				check.regex.lastIndex = 0;
				if (!check.regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "regex",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "trim") input.data = input.data.trim();
			else if (check.kind === "includes") {
				if (!input.data.includes(check.value, check.position)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_string,
						validation: {
							includes: check.value,
							position: check.position
						},
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "toLowerCase") input.data = input.data.toLowerCase();
			else if (check.kind === "toUpperCase") input.data = input.data.toUpperCase();
			else if (check.kind === "startsWith") {
				if (!input.data.startsWith(check.value)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_string,
						validation: { startsWith: check.value },
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "endsWith") {
				if (!input.data.endsWith(check.value)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_string,
						validation: { endsWith: check.value },
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "datetime") {
				if (!datetimeRegex(check).test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_string,
						validation: "datetime",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "date") {
				if (!dateRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_string,
						validation: "date",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "time") {
				if (!timeRegex(check).test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_string,
						validation: "time",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "duration") {
				if (!durationRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "duration",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "ip") {
				if (!isValidIP(input.data, check.version)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "ip",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "jwt") {
				if (!isValidJWT$1(input.data, check.alg)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "jwt",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "cidr") {
				if (!isValidCidr(input.data, check.version)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "cidr",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "base64") {
				if (!base64Regex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "base64",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "base64url") {
				if (!base64urlRegex.test(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "base64url",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
			} else util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		_regex(regex, validation, message) {
			return this.refinement((data) => regex.test(data), {
				validation,
				code: ZodIssueCode.invalid_string,
				...errorUtil.errToObj(message)
			});
		}
		_addCheck(check) {
			return new ZodString$1({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		email(message) {
			return this._addCheck({
				kind: "email",
				...errorUtil.errToObj(message)
			});
		}
		url(message) {
			return this._addCheck({
				kind: "url",
				...errorUtil.errToObj(message)
			});
		}
		emoji(message) {
			return this._addCheck({
				kind: "emoji",
				...errorUtil.errToObj(message)
			});
		}
		uuid(message) {
			return this._addCheck({
				kind: "uuid",
				...errorUtil.errToObj(message)
			});
		}
		nanoid(message) {
			return this._addCheck({
				kind: "nanoid",
				...errorUtil.errToObj(message)
			});
		}
		cuid(message) {
			return this._addCheck({
				kind: "cuid",
				...errorUtil.errToObj(message)
			});
		}
		cuid2(message) {
			return this._addCheck({
				kind: "cuid2",
				...errorUtil.errToObj(message)
			});
		}
		ulid(message) {
			return this._addCheck({
				kind: "ulid",
				...errorUtil.errToObj(message)
			});
		}
		base64(message) {
			return this._addCheck({
				kind: "base64",
				...errorUtil.errToObj(message)
			});
		}
		base64url(message) {
			return this._addCheck({
				kind: "base64url",
				...errorUtil.errToObj(message)
			});
		}
		jwt(options) {
			return this._addCheck({
				kind: "jwt",
				...errorUtil.errToObj(options)
			});
		}
		ip(options) {
			return this._addCheck({
				kind: "ip",
				...errorUtil.errToObj(options)
			});
		}
		cidr(options) {
			return this._addCheck({
				kind: "cidr",
				...errorUtil.errToObj(options)
			});
		}
		datetime(options) {
			if (typeof options === "string") return this._addCheck({
				kind: "datetime",
				precision: null,
				offset: false,
				local: false,
				message: options
			});
			return this._addCheck({
				kind: "datetime",
				precision: typeof options?.precision === "undefined" ? null : options?.precision,
				offset: options?.offset ?? false,
				local: options?.local ?? false,
				...errorUtil.errToObj(options?.message)
			});
		}
		date(message) {
			return this._addCheck({
				kind: "date",
				message
			});
		}
		time(options) {
			if (typeof options === "string") return this._addCheck({
				kind: "time",
				precision: null,
				message: options
			});
			return this._addCheck({
				kind: "time",
				precision: typeof options?.precision === "undefined" ? null : options?.precision,
				...errorUtil.errToObj(options?.message)
			});
		}
		duration(message) {
			return this._addCheck({
				kind: "duration",
				...errorUtil.errToObj(message)
			});
		}
		regex(regex, message) {
			return this._addCheck({
				kind: "regex",
				regex,
				...errorUtil.errToObj(message)
			});
		}
		includes(value, options) {
			return this._addCheck({
				kind: "includes",
				value,
				position: options?.position,
				...errorUtil.errToObj(options?.message)
			});
		}
		startsWith(value, message) {
			return this._addCheck({
				kind: "startsWith",
				value,
				...errorUtil.errToObj(message)
			});
		}
		endsWith(value, message) {
			return this._addCheck({
				kind: "endsWith",
				value,
				...errorUtil.errToObj(message)
			});
		}
		min(minLength, message) {
			return this._addCheck({
				kind: "min",
				value: minLength,
				...errorUtil.errToObj(message)
			});
		}
		max(maxLength, message) {
			return this._addCheck({
				kind: "max",
				value: maxLength,
				...errorUtil.errToObj(message)
			});
		}
		length(len, message) {
			return this._addCheck({
				kind: "length",
				value: len,
				...errorUtil.errToObj(message)
			});
		}
		/**
		* Equivalent to `.min(1)`
		*/
		nonempty(message) {
			return this.min(1, errorUtil.errToObj(message));
		}
		trim() {
			return new ZodString$1({
				...this._def,
				checks: [...this._def.checks, { kind: "trim" }]
			});
		}
		toLowerCase() {
			return new ZodString$1({
				...this._def,
				checks: [...this._def.checks, { kind: "toLowerCase" }]
			});
		}
		toUpperCase() {
			return new ZodString$1({
				...this._def,
				checks: [...this._def.checks, { kind: "toUpperCase" }]
			});
		}
		get isDatetime() {
			return !!this._def.checks.find((ch) => ch.kind === "datetime");
		}
		get isDate() {
			return !!this._def.checks.find((ch) => ch.kind === "date");
		}
		get isTime() {
			return !!this._def.checks.find((ch) => ch.kind === "time");
		}
		get isDuration() {
			return !!this._def.checks.find((ch) => ch.kind === "duration");
		}
		get isEmail() {
			return !!this._def.checks.find((ch) => ch.kind === "email");
		}
		get isURL() {
			return !!this._def.checks.find((ch) => ch.kind === "url");
		}
		get isEmoji() {
			return !!this._def.checks.find((ch) => ch.kind === "emoji");
		}
		get isUUID() {
			return !!this._def.checks.find((ch) => ch.kind === "uuid");
		}
		get isNANOID() {
			return !!this._def.checks.find((ch) => ch.kind === "nanoid");
		}
		get isCUID() {
			return !!this._def.checks.find((ch) => ch.kind === "cuid");
		}
		get isCUID2() {
			return !!this._def.checks.find((ch) => ch.kind === "cuid2");
		}
		get isULID() {
			return !!this._def.checks.find((ch) => ch.kind === "ulid");
		}
		get isIP() {
			return !!this._def.checks.find((ch) => ch.kind === "ip");
		}
		get isCIDR() {
			return !!this._def.checks.find((ch) => ch.kind === "cidr");
		}
		get isBase64() {
			return !!this._def.checks.find((ch) => ch.kind === "base64");
		}
		get isBase64url() {
			return !!this._def.checks.find((ch) => ch.kind === "base64url");
		}
		get minLength() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxLength() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
	};
	ZodString$1.create = (params) => {
		return new ZodString$1({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodString,
			coerce: params?.coerce ?? false,
			...processCreateParams(params)
		});
	};
	function floatSafeRemainder$1(val, step) {
		const valDecCount = (val.toString().split(".")[1] || "").length;
		const stepDecCount = (step.toString().split(".")[1] || "").length;
		const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
		return Number.parseInt(val.toFixed(decCount).replace(".", "")) % Number.parseInt(step.toFixed(decCount).replace(".", "")) / 10 ** decCount;
	}
	var ZodNumber$1 = class ZodNumber$1 extends ZodType$1 {
		constructor() {
			super(...arguments);
			this.min = this.gte;
			this.max = this.lte;
			this.step = this.multipleOf;
		}
		_parse(input) {
			if (this._def.coerce) input.data = Number(input.data);
			if (this._getType(input) !== ZodParsedType.number) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.number,
					received: ctx.parsedType
				});
				return INVALID;
			}
			let ctx = void 0;
			const status = new ParseStatus();
			for (const check of this._def.checks) if (check.kind === "int") {
				if (!util.isInteger(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: "integer",
						received: "float",
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "min") {
				if (check.inclusive ? input.data < check.value : input.data <= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_small,
						minimum: check.value,
						type: "number",
						inclusive: check.inclusive,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (check.inclusive ? input.data > check.value : input.data >= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_big,
						maximum: check.value,
						type: "number",
						inclusive: check.inclusive,
						exact: false,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "multipleOf") {
				if (floatSafeRemainder$1(input.data, check.value) !== 0) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.not_multiple_of,
						multipleOf: check.value,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "finite") {
				if (!Number.isFinite(input.data)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.not_finite,
						message: check.message
					});
					status.dirty();
				}
			} else util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		gte(value, message) {
			return this.setLimit("min", value, true, errorUtil.toString(message));
		}
		gt(value, message) {
			return this.setLimit("min", value, false, errorUtil.toString(message));
		}
		lte(value, message) {
			return this.setLimit("max", value, true, errorUtil.toString(message));
		}
		lt(value, message) {
			return this.setLimit("max", value, false, errorUtil.toString(message));
		}
		setLimit(kind, value, inclusive, message) {
			return new ZodNumber$1({
				...this._def,
				checks: [...this._def.checks, {
					kind,
					value,
					inclusive,
					message: errorUtil.toString(message)
				}]
			});
		}
		_addCheck(check) {
			return new ZodNumber$1({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		int(message) {
			return this._addCheck({
				kind: "int",
				message: errorUtil.toString(message)
			});
		}
		positive(message) {
			return this._addCheck({
				kind: "min",
				value: 0,
				inclusive: false,
				message: errorUtil.toString(message)
			});
		}
		negative(message) {
			return this._addCheck({
				kind: "max",
				value: 0,
				inclusive: false,
				message: errorUtil.toString(message)
			});
		}
		nonpositive(message) {
			return this._addCheck({
				kind: "max",
				value: 0,
				inclusive: true,
				message: errorUtil.toString(message)
			});
		}
		nonnegative(message) {
			return this._addCheck({
				kind: "min",
				value: 0,
				inclusive: true,
				message: errorUtil.toString(message)
			});
		}
		multipleOf(value, message) {
			return this._addCheck({
				kind: "multipleOf",
				value,
				message: errorUtil.toString(message)
			});
		}
		finite(message) {
			return this._addCheck({
				kind: "finite",
				message: errorUtil.toString(message)
			});
		}
		safe(message) {
			return this._addCheck({
				kind: "min",
				inclusive: true,
				value: Number.MIN_SAFE_INTEGER,
				message: errorUtil.toString(message)
			})._addCheck({
				kind: "max",
				inclusive: true,
				value: Number.MAX_SAFE_INTEGER,
				message: errorUtil.toString(message)
			});
		}
		get minValue() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxValue() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
		get isInt() {
			return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
		}
		get isFinite() {
			let max = null;
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") return true;
			else if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			} else if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return Number.isFinite(min) && Number.isFinite(max);
		}
	};
	ZodNumber$1.create = (params) => {
		return new ZodNumber$1({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodNumber,
			coerce: params?.coerce || false,
			...processCreateParams(params)
		});
	};
	var ZodBigInt = class ZodBigInt extends ZodType$1 {
		constructor() {
			super(...arguments);
			this.min = this.gte;
			this.max = this.lte;
		}
		_parse(input) {
			if (this._def.coerce) try {
				input.data = BigInt(input.data);
			} catch {
				return this._getInvalidInput(input);
			}
			if (this._getType(input) !== ZodParsedType.bigint) return this._getInvalidInput(input);
			let ctx = void 0;
			const status = new ParseStatus();
			for (const check of this._def.checks) if (check.kind === "min") {
				if (check.inclusive ? input.data < check.value : input.data <= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_small,
						type: "bigint",
						minimum: check.value,
						inclusive: check.inclusive,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (check.inclusive ? input.data > check.value : input.data >= check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_big,
						type: "bigint",
						maximum: check.value,
						inclusive: check.inclusive,
						message: check.message
					});
					status.dirty();
				}
			} else if (check.kind === "multipleOf") {
				if (input.data % check.value !== BigInt(0)) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.not_multiple_of,
						multipleOf: check.value,
						message: check.message
					});
					status.dirty();
				}
			} else util.assertNever(check);
			return {
				status: status.value,
				value: input.data
			};
		}
		_getInvalidInput(input) {
			const ctx = this._getOrReturnCtx(input);
			addIssueToContext(ctx, {
				code: ZodIssueCode.invalid_type,
				expected: ZodParsedType.bigint,
				received: ctx.parsedType
			});
			return INVALID;
		}
		gte(value, message) {
			return this.setLimit("min", value, true, errorUtil.toString(message));
		}
		gt(value, message) {
			return this.setLimit("min", value, false, errorUtil.toString(message));
		}
		lte(value, message) {
			return this.setLimit("max", value, true, errorUtil.toString(message));
		}
		lt(value, message) {
			return this.setLimit("max", value, false, errorUtil.toString(message));
		}
		setLimit(kind, value, inclusive, message) {
			return new ZodBigInt({
				...this._def,
				checks: [...this._def.checks, {
					kind,
					value,
					inclusive,
					message: errorUtil.toString(message)
				}]
			});
		}
		_addCheck(check) {
			return new ZodBigInt({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		positive(message) {
			return this._addCheck({
				kind: "min",
				value: BigInt(0),
				inclusive: false,
				message: errorUtil.toString(message)
			});
		}
		negative(message) {
			return this._addCheck({
				kind: "max",
				value: BigInt(0),
				inclusive: false,
				message: errorUtil.toString(message)
			});
		}
		nonpositive(message) {
			return this._addCheck({
				kind: "max",
				value: BigInt(0),
				inclusive: true,
				message: errorUtil.toString(message)
			});
		}
		nonnegative(message) {
			return this._addCheck({
				kind: "min",
				value: BigInt(0),
				inclusive: true,
				message: errorUtil.toString(message)
			});
		}
		multipleOf(value, message) {
			return this._addCheck({
				kind: "multipleOf",
				value,
				message: errorUtil.toString(message)
			});
		}
		get minValue() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min;
		}
		get maxValue() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max;
		}
	};
	ZodBigInt.create = (params) => {
		return new ZodBigInt({
			checks: [],
			typeName: ZodFirstPartyTypeKind.ZodBigInt,
			coerce: params?.coerce ?? false,
			...processCreateParams(params)
		});
	};
	var ZodBoolean$1 = class extends ZodType$1 {
		_parse(input) {
			if (this._def.coerce) input.data = Boolean(input.data);
			if (this._getType(input) !== ZodParsedType.boolean) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.boolean,
					received: ctx.parsedType
				});
				return INVALID;
			}
			return OK(input.data);
		}
	};
	ZodBoolean$1.create = (params) => {
		return new ZodBoolean$1({
			typeName: ZodFirstPartyTypeKind.ZodBoolean,
			coerce: params?.coerce || false,
			...processCreateParams(params)
		});
	};
	var ZodDate = class ZodDate extends ZodType$1 {
		_parse(input) {
			if (this._def.coerce) input.data = new Date(input.data);
			if (this._getType(input) !== ZodParsedType.date) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.date,
					received: ctx.parsedType
				});
				return INVALID;
			}
			if (Number.isNaN(input.data.getTime())) {
				addIssueToContext(this._getOrReturnCtx(input), { code: ZodIssueCode.invalid_date });
				return INVALID;
			}
			const status = new ParseStatus();
			let ctx = void 0;
			for (const check of this._def.checks) if (check.kind === "min") {
				if (input.data.getTime() < check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_small,
						message: check.message,
						inclusive: true,
						exact: false,
						minimum: check.value,
						type: "date"
					});
					status.dirty();
				}
			} else if (check.kind === "max") {
				if (input.data.getTime() > check.value) {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_big,
						message: check.message,
						inclusive: true,
						exact: false,
						maximum: check.value,
						type: "date"
					});
					status.dirty();
				}
			} else util.assertNever(check);
			return {
				status: status.value,
				value: new Date(input.data.getTime())
			};
		}
		_addCheck(check) {
			return new ZodDate({
				...this._def,
				checks: [...this._def.checks, check]
			});
		}
		min(minDate, message) {
			return this._addCheck({
				kind: "min",
				value: minDate.getTime(),
				message: errorUtil.toString(message)
			});
		}
		max(maxDate, message) {
			return this._addCheck({
				kind: "max",
				value: maxDate.getTime(),
				message: errorUtil.toString(message)
			});
		}
		get minDate() {
			let min = null;
			for (const ch of this._def.checks) if (ch.kind === "min") {
				if (min === null || ch.value > min) min = ch.value;
			}
			return min != null ? new Date(min) : null;
		}
		get maxDate() {
			let max = null;
			for (const ch of this._def.checks) if (ch.kind === "max") {
				if (max === null || ch.value < max) max = ch.value;
			}
			return max != null ? new Date(max) : null;
		}
	};
	ZodDate.create = (params) => {
		return new ZodDate({
			checks: [],
			coerce: params?.coerce || false,
			typeName: ZodFirstPartyTypeKind.ZodDate,
			...processCreateParams(params)
		});
	};
	var ZodSymbol = class extends ZodType$1 {
		_parse(input) {
			if (this._getType(input) !== ZodParsedType.symbol) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.symbol,
					received: ctx.parsedType
				});
				return INVALID;
			}
			return OK(input.data);
		}
	};
	ZodSymbol.create = (params) => {
		return new ZodSymbol({
			typeName: ZodFirstPartyTypeKind.ZodSymbol,
			...processCreateParams(params)
		});
	};
	var ZodUndefined = class extends ZodType$1 {
		_parse(input) {
			if (this._getType(input) !== ZodParsedType.undefined) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.undefined,
					received: ctx.parsedType
				});
				return INVALID;
			}
			return OK(input.data);
		}
	};
	ZodUndefined.create = (params) => {
		return new ZodUndefined({
			typeName: ZodFirstPartyTypeKind.ZodUndefined,
			...processCreateParams(params)
		});
	};
	var ZodNull$1 = class extends ZodType$1 {
		_parse(input) {
			if (this._getType(input) !== ZodParsedType.null) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.null,
					received: ctx.parsedType
				});
				return INVALID;
			}
			return OK(input.data);
		}
	};
	ZodNull$1.create = (params) => {
		return new ZodNull$1({
			typeName: ZodFirstPartyTypeKind.ZodNull,
			...processCreateParams(params)
		});
	};
	var ZodAny = class extends ZodType$1 {
		constructor() {
			super(...arguments);
			this._any = true;
		}
		_parse(input) {
			return OK(input.data);
		}
	};
	ZodAny.create = (params) => {
		return new ZodAny({
			typeName: ZodFirstPartyTypeKind.ZodAny,
			...processCreateParams(params)
		});
	};
	var ZodUnknown$1 = class extends ZodType$1 {
		constructor() {
			super(...arguments);
			this._unknown = true;
		}
		_parse(input) {
			return OK(input.data);
		}
	};
	ZodUnknown$1.create = (params) => {
		return new ZodUnknown$1({
			typeName: ZodFirstPartyTypeKind.ZodUnknown,
			...processCreateParams(params)
		});
	};
	var ZodNever$1 = class extends ZodType$1 {
		_parse(input) {
			const ctx = this._getOrReturnCtx(input);
			addIssueToContext(ctx, {
				code: ZodIssueCode.invalid_type,
				expected: ZodParsedType.never,
				received: ctx.parsedType
			});
			return INVALID;
		}
	};
	ZodNever$1.create = (params) => {
		return new ZodNever$1({
			typeName: ZodFirstPartyTypeKind.ZodNever,
			...processCreateParams(params)
		});
	};
	var ZodVoid = class extends ZodType$1 {
		_parse(input) {
			if (this._getType(input) !== ZodParsedType.undefined) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.void,
					received: ctx.parsedType
				});
				return INVALID;
			}
			return OK(input.data);
		}
	};
	ZodVoid.create = (params) => {
		return new ZodVoid({
			typeName: ZodFirstPartyTypeKind.ZodVoid,
			...processCreateParams(params)
		});
	};
	var ZodArray$1 = class ZodArray$1 extends ZodType$1 {
		_parse(input) {
			const { ctx, status } = this._processInputParams(input);
			const def = this._def;
			if (ctx.parsedType !== ZodParsedType.array) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.array,
					received: ctx.parsedType
				});
				return INVALID;
			}
			if (def.exactLength !== null) {
				const tooBig = ctx.data.length > def.exactLength.value;
				const tooSmall = ctx.data.length < def.exactLength.value;
				if (tooBig || tooSmall) {
					addIssueToContext(ctx, {
						code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
						minimum: tooSmall ? def.exactLength.value : void 0,
						maximum: tooBig ? def.exactLength.value : void 0,
						type: "array",
						inclusive: true,
						exact: true,
						message: def.exactLength.message
					});
					status.dirty();
				}
			}
			if (def.minLength !== null) {
				if (ctx.data.length < def.minLength.value) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_small,
						minimum: def.minLength.value,
						type: "array",
						inclusive: true,
						exact: false,
						message: def.minLength.message
					});
					status.dirty();
				}
			}
			if (def.maxLength !== null) {
				if (ctx.data.length > def.maxLength.value) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_big,
						maximum: def.maxLength.value,
						type: "array",
						inclusive: true,
						exact: false,
						message: def.maxLength.message
					});
					status.dirty();
				}
			}
			if (ctx.common.async) return Promise.all([...ctx.data].map((item, i) => {
				return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
			})).then((result) => {
				return ParseStatus.mergeArray(status, result);
			});
			const result = [...ctx.data].map((item, i) => {
				return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
			});
			return ParseStatus.mergeArray(status, result);
		}
		get element() {
			return this._def.type;
		}
		min(minLength, message) {
			return new ZodArray$1({
				...this._def,
				minLength: {
					value: minLength,
					message: errorUtil.toString(message)
				}
			});
		}
		max(maxLength, message) {
			return new ZodArray$1({
				...this._def,
				maxLength: {
					value: maxLength,
					message: errorUtil.toString(message)
				}
			});
		}
		length(len, message) {
			return new ZodArray$1({
				...this._def,
				exactLength: {
					value: len,
					message: errorUtil.toString(message)
				}
			});
		}
		nonempty(message) {
			return this.min(1, message);
		}
	};
	ZodArray$1.create = (schema, params) => {
		return new ZodArray$1({
			type: schema,
			minLength: null,
			maxLength: null,
			exactLength: null,
			typeName: ZodFirstPartyTypeKind.ZodArray,
			...processCreateParams(params)
		});
	};
	function deepPartialify(schema) {
		if (schema instanceof ZodObject$1) {
			const newShape = {};
			for (const key in schema.shape) {
				const fieldSchema = schema.shape[key];
				newShape[key] = ZodOptional$1.create(deepPartialify(fieldSchema));
			}
			return new ZodObject$1({
				...schema._def,
				shape: () => newShape
			});
		} else if (schema instanceof ZodArray$1) return new ZodArray$1({
			...schema._def,
			type: deepPartialify(schema.element)
		});
		else if (schema instanceof ZodOptional$1) return ZodOptional$1.create(deepPartialify(schema.unwrap()));
		else if (schema instanceof ZodNullable$1) return ZodNullable$1.create(deepPartialify(schema.unwrap()));
		else if (schema instanceof ZodTuple) return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
		else return schema;
	}
	var ZodObject$1 = class ZodObject$1 extends ZodType$1 {
		constructor() {
			super(...arguments);
			this._cached = null;
			/**
			* @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
			* If you want to pass through unknown properties, use `.passthrough()` instead.
			*/
			this.nonstrict = this.passthrough;
			/**
			* @deprecated Use `.extend` instead
			*  */
			this.augment = this.extend;
		}
		_getCached() {
			if (this._cached !== null) return this._cached;
			const shape = this._def.shape();
			this._cached = {
				shape,
				keys: util.objectKeys(shape)
			};
			return this._cached;
		}
		_parse(input) {
			if (this._getType(input) !== ZodParsedType.object) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.object,
					received: ctx.parsedType
				});
				return INVALID;
			}
			const { status, ctx } = this._processInputParams(input);
			const { shape, keys: shapeKeys } = this._getCached();
			const extraKeys = [];
			if (!(this._def.catchall instanceof ZodNever$1 && this._def.unknownKeys === "strip")) {
				for (const key in ctx.data) if (!shapeKeys.includes(key)) extraKeys.push(key);
			}
			const pairs = [];
			for (const key of shapeKeys) {
				const keyValidator = shape[key];
				const value = ctx.data[key];
				pairs.push({
					key: {
						status: "valid",
						value: key
					},
					value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
					alwaysSet: key in ctx.data
				});
			}
			if (this._def.catchall instanceof ZodNever$1) {
				const unknownKeys = this._def.unknownKeys;
				if (unknownKeys === "passthrough") for (const key of extraKeys) pairs.push({
					key: {
						status: "valid",
						value: key
					},
					value: {
						status: "valid",
						value: ctx.data[key]
					}
				});
				else if (unknownKeys === "strict") {
					if (extraKeys.length > 0) {
						addIssueToContext(ctx, {
							code: ZodIssueCode.unrecognized_keys,
							keys: extraKeys
						});
						status.dirty();
					}
				} else if (unknownKeys === "strip") {} else throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
			} else {
				const catchall = this._def.catchall;
				for (const key of extraKeys) {
					const value = ctx.data[key];
					pairs.push({
						key: {
							status: "valid",
							value: key
						},
						value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
						alwaysSet: key in ctx.data
					});
				}
			}
			if (ctx.common.async) return Promise.resolve().then(async () => {
				const syncPairs = [];
				for (const pair of pairs) {
					const key = await pair.key;
					const value = await pair.value;
					syncPairs.push({
						key,
						value,
						alwaysSet: pair.alwaysSet
					});
				}
				return syncPairs;
			}).then((syncPairs) => {
				return ParseStatus.mergeObjectSync(status, syncPairs);
			});
			else return ParseStatus.mergeObjectSync(status, pairs);
		}
		get shape() {
			return this._def.shape();
		}
		strict(message) {
			errorUtil.errToObj;
			return new ZodObject$1({
				...this._def,
				unknownKeys: "strict",
				...message !== void 0 ? { errorMap: (issue, ctx) => {
					const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
					if (issue.code === "unrecognized_keys") return { message: errorUtil.errToObj(message).message ?? defaultError };
					return { message: defaultError };
				} } : {}
			});
		}
		strip() {
			return new ZodObject$1({
				...this._def,
				unknownKeys: "strip"
			});
		}
		passthrough() {
			return new ZodObject$1({
				...this._def,
				unknownKeys: "passthrough"
			});
		}
		extend(augmentation) {
			return new ZodObject$1({
				...this._def,
				shape: () => ({
					...this._def.shape(),
					...augmentation
				})
			});
		}
		/**
		* Prior to zod@1.0.12 there was a bug in the
		* inferred type of merged objects. Please
		* upgrade if you are experiencing issues.
		*/
		merge(merging) {
			return new ZodObject$1({
				unknownKeys: merging._def.unknownKeys,
				catchall: merging._def.catchall,
				shape: () => ({
					...this._def.shape(),
					...merging._def.shape()
				}),
				typeName: ZodFirstPartyTypeKind.ZodObject
			});
		}
		setKey(key, schema) {
			return this.augment({ [key]: schema });
		}
		catchall(index) {
			return new ZodObject$1({
				...this._def,
				catchall: index
			});
		}
		pick(mask) {
			const shape = {};
			for (const key of util.objectKeys(mask)) if (mask[key] && this.shape[key]) shape[key] = this.shape[key];
			return new ZodObject$1({
				...this._def,
				shape: () => shape
			});
		}
		omit(mask) {
			const shape = {};
			for (const key of util.objectKeys(this.shape)) if (!mask[key]) shape[key] = this.shape[key];
			return new ZodObject$1({
				...this._def,
				shape: () => shape
			});
		}
		/**
		* @deprecated
		*/
		deepPartial() {
			return deepPartialify(this);
		}
		partial(mask) {
			const newShape = {};
			for (const key of util.objectKeys(this.shape)) {
				const fieldSchema = this.shape[key];
				if (mask && !mask[key]) newShape[key] = fieldSchema;
				else newShape[key] = fieldSchema.optional();
			}
			return new ZodObject$1({
				...this._def,
				shape: () => newShape
			});
		}
		required(mask) {
			const newShape = {};
			for (const key of util.objectKeys(this.shape)) if (mask && !mask[key]) newShape[key] = this.shape[key];
			else {
				let newField = this.shape[key];
				while (newField instanceof ZodOptional$1) newField = newField._def.innerType;
				newShape[key] = newField;
			}
			return new ZodObject$1({
				...this._def,
				shape: () => newShape
			});
		}
		keyof() {
			return createZodEnum(util.objectKeys(this.shape));
		}
	};
	ZodObject$1.create = (shape, params) => {
		return new ZodObject$1({
			shape: () => shape,
			unknownKeys: "strip",
			catchall: ZodNever$1.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	ZodObject$1.strictCreate = (shape, params) => {
		return new ZodObject$1({
			shape: () => shape,
			unknownKeys: "strict",
			catchall: ZodNever$1.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	ZodObject$1.lazycreate = (shape, params) => {
		return new ZodObject$1({
			shape,
			unknownKeys: "strip",
			catchall: ZodNever$1.create(),
			typeName: ZodFirstPartyTypeKind.ZodObject,
			...processCreateParams(params)
		});
	};
	var ZodUnion$1 = class extends ZodType$1 {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const options = this._def.options;
			function handleResults(results) {
				for (const result of results) if (result.result.status === "valid") return result.result;
				for (const result of results) if (result.result.status === "dirty") {
					ctx.common.issues.push(...result.ctx.common.issues);
					return result.result;
				}
				const unionErrors = results.map((result) => new ZodError$1(result.ctx.common.issues));
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_union,
					unionErrors
				});
				return INVALID;
			}
			if (ctx.common.async) return Promise.all(options.map(async (option) => {
				const childCtx = {
					...ctx,
					common: {
						...ctx.common,
						issues: []
					},
					parent: null
				};
				return {
					result: await option._parseAsync({
						data: ctx.data,
						path: ctx.path,
						parent: childCtx
					}),
					ctx: childCtx
				};
			})).then(handleResults);
			else {
				let dirty = void 0;
				const issues = [];
				for (const option of options) {
					const childCtx = {
						...ctx,
						common: {
							...ctx.common,
							issues: []
						},
						parent: null
					};
					const result = option._parseSync({
						data: ctx.data,
						path: ctx.path,
						parent: childCtx
					});
					if (result.status === "valid") return result;
					else if (result.status === "dirty" && !dirty) dirty = {
						result,
						ctx: childCtx
					};
					if (childCtx.common.issues.length) issues.push(childCtx.common.issues);
				}
				if (dirty) {
					ctx.common.issues.push(...dirty.ctx.common.issues);
					return dirty.result;
				}
				const unionErrors = issues.map((issues) => new ZodError$1(issues));
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_union,
					unionErrors
				});
				return INVALID;
			}
		}
		get options() {
			return this._def.options;
		}
	};
	ZodUnion$1.create = (types, params) => {
		return new ZodUnion$1({
			options: types,
			typeName: ZodFirstPartyTypeKind.ZodUnion,
			...processCreateParams(params)
		});
	};
	const getDiscriminator = (type) => {
		if (type instanceof ZodLazy) return getDiscriminator(type.schema);
		else if (type instanceof ZodEffects) return getDiscriminator(type.innerType());
		else if (type instanceof ZodLiteral$1) return [type.value];
		else if (type instanceof ZodEnum$1) return type.options;
		else if (type instanceof ZodNativeEnum) return util.objectValues(type.enum);
		else if (type instanceof ZodDefault$1) return getDiscriminator(type._def.innerType);
		else if (type instanceof ZodUndefined) return [void 0];
		else if (type instanceof ZodNull$1) return [null];
		else if (type instanceof ZodOptional$1) return [void 0, ...getDiscriminator(type.unwrap())];
		else if (type instanceof ZodNullable$1) return [null, ...getDiscriminator(type.unwrap())];
		else if (type instanceof ZodBranded) return getDiscriminator(type.unwrap());
		else if (type instanceof ZodReadonly$1) return getDiscriminator(type.unwrap());
		else if (type instanceof ZodCatch$1) return getDiscriminator(type._def.innerType);
		else return [];
	};
	var ZodDiscriminatedUnion$1 = class ZodDiscriminatedUnion$1 extends ZodType$1 {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== ZodParsedType.object) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.object,
					received: ctx.parsedType
				});
				return INVALID;
			}
			const discriminator = this.discriminator;
			const discriminatorValue = ctx.data[discriminator];
			const option = this.optionsMap.get(discriminatorValue);
			if (!option) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_union_discriminator,
					options: Array.from(this.optionsMap.keys()),
					path: [discriminator]
				});
				return INVALID;
			}
			if (ctx.common.async) return option._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
			else return option._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
		}
		get discriminator() {
			return this._def.discriminator;
		}
		get options() {
			return this._def.options;
		}
		get optionsMap() {
			return this._def.optionsMap;
		}
		/**
		* The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
		* However, it only allows a union of objects, all of which need to share a discriminator property. This property must
		* have a different value for each object in the union.
		* @param discriminator the name of the discriminator property
		* @param types an array of object schemas
		* @param params
		*/
		static create(discriminator, options, params) {
			const optionsMap = /* @__PURE__ */ new Map();
			for (const type of options) {
				const discriminatorValues = getDiscriminator(type.shape[discriminator]);
				if (!discriminatorValues.length) throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
				for (const value of discriminatorValues) {
					if (optionsMap.has(value)) throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
					optionsMap.set(value, type);
				}
			}
			return new ZodDiscriminatedUnion$1({
				typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
				discriminator,
				options,
				optionsMap,
				...processCreateParams(params)
			});
		}
	};
	function mergeValues$1(a, b) {
		const aType = getParsedType(a);
		const bType = getParsedType(b);
		if (a === b) return {
			valid: true,
			data: a
		};
		else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
			const bKeys = util.objectKeys(b);
			const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
			const newObj = {
				...a,
				...b
			};
			for (const key of sharedKeys) {
				const sharedValue = mergeValues$1(a[key], b[key]);
				if (!sharedValue.valid) return { valid: false };
				newObj[key] = sharedValue.data;
			}
			return {
				valid: true,
				data: newObj
			};
		} else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
			if (a.length !== b.length) return { valid: false };
			const newArray = [];
			for (let index = 0; index < a.length; index++) {
				const itemA = a[index];
				const itemB = b[index];
				const sharedValue = mergeValues$1(itemA, itemB);
				if (!sharedValue.valid) return { valid: false };
				newArray.push(sharedValue.data);
			}
			return {
				valid: true,
				data: newArray
			};
		} else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) return {
			valid: true,
			data: a
		};
		else return { valid: false };
	}
	var ZodIntersection$1 = class extends ZodType$1 {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			const handleParsed = (parsedLeft, parsedRight) => {
				if (isAborted(parsedLeft) || isAborted(parsedRight)) return INVALID;
				const merged = mergeValues$1(parsedLeft.value, parsedRight.value);
				if (!merged.valid) {
					addIssueToContext(ctx, { code: ZodIssueCode.invalid_intersection_types });
					return INVALID;
				}
				if (isDirty(parsedLeft) || isDirty(parsedRight)) status.dirty();
				return {
					status: status.value,
					value: merged.data
				};
			};
			if (ctx.common.async) return Promise.all([this._def.left._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}), this._def.right._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			})]).then(([left, right]) => handleParsed(left, right));
			else return handleParsed(this._def.left._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}), this._def.right._parseSync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}));
		}
	};
	ZodIntersection$1.create = (left, right, params) => {
		return new ZodIntersection$1({
			left,
			right,
			typeName: ZodFirstPartyTypeKind.ZodIntersection,
			...processCreateParams(params)
		});
	};
	var ZodTuple = class ZodTuple extends ZodType$1 {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== ZodParsedType.array) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.array,
					received: ctx.parsedType
				});
				return INVALID;
			}
			if (ctx.data.length < this._def.items.length) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.too_small,
					minimum: this._def.items.length,
					inclusive: true,
					exact: false,
					type: "array"
				});
				return INVALID;
			}
			if (!this._def.rest && ctx.data.length > this._def.items.length) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.too_big,
					maximum: this._def.items.length,
					inclusive: true,
					exact: false,
					type: "array"
				});
				status.dirty();
			}
			const items = [...ctx.data].map((item, itemIndex) => {
				const schema = this._def.items[itemIndex] || this._def.rest;
				if (!schema) return null;
				return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
			}).filter((x) => !!x);
			if (ctx.common.async) return Promise.all(items).then((results) => {
				return ParseStatus.mergeArray(status, results);
			});
			else return ParseStatus.mergeArray(status, items);
		}
		get items() {
			return this._def.items;
		}
		rest(rest) {
			return new ZodTuple({
				...this._def,
				rest
			});
		}
	};
	ZodTuple.create = (schemas, params) => {
		if (!Array.isArray(schemas)) throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
		return new ZodTuple({
			items: schemas,
			typeName: ZodFirstPartyTypeKind.ZodTuple,
			rest: null,
			...processCreateParams(params)
		});
	};
	var ZodRecord$1 = class ZodRecord$1 extends ZodType$1 {
		get keySchema() {
			return this._def.keyType;
		}
		get valueSchema() {
			return this._def.valueType;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== ZodParsedType.object) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.object,
					received: ctx.parsedType
				});
				return INVALID;
			}
			const pairs = [];
			const keyType = this._def.keyType;
			const valueType = this._def.valueType;
			for (const key in ctx.data) pairs.push({
				key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
				value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
				alwaysSet: key in ctx.data
			});
			if (ctx.common.async) return ParseStatus.mergeObjectAsync(status, pairs);
			else return ParseStatus.mergeObjectSync(status, pairs);
		}
		get element() {
			return this._def.valueType;
		}
		static create(first, second, third) {
			if (second instanceof ZodType$1) return new ZodRecord$1({
				keyType: first,
				valueType: second,
				typeName: ZodFirstPartyTypeKind.ZodRecord,
				...processCreateParams(third)
			});
			return new ZodRecord$1({
				keyType: ZodString$1.create(),
				valueType: first,
				typeName: ZodFirstPartyTypeKind.ZodRecord,
				...processCreateParams(second)
			});
		}
	};
	var ZodMap = class extends ZodType$1 {
		get keySchema() {
			return this._def.keyType;
		}
		get valueSchema() {
			return this._def.valueType;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== ZodParsedType.map) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.map,
					received: ctx.parsedType
				});
				return INVALID;
			}
			const keyType = this._def.keyType;
			const valueType = this._def.valueType;
			const pairs = [...ctx.data.entries()].map(([key, value], index) => {
				return {
					key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
					value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
				};
			});
			if (ctx.common.async) {
				const finalMap = /* @__PURE__ */ new Map();
				return Promise.resolve().then(async () => {
					for (const pair of pairs) {
						const key = await pair.key;
						const value = await pair.value;
						if (key.status === "aborted" || value.status === "aborted") return INVALID;
						if (key.status === "dirty" || value.status === "dirty") status.dirty();
						finalMap.set(key.value, value.value);
					}
					return {
						status: status.value,
						value: finalMap
					};
				});
			} else {
				const finalMap = /* @__PURE__ */ new Map();
				for (const pair of pairs) {
					const key = pair.key;
					const value = pair.value;
					if (key.status === "aborted" || value.status === "aborted") return INVALID;
					if (key.status === "dirty" || value.status === "dirty") status.dirty();
					finalMap.set(key.value, value.value);
				}
				return {
					status: status.value,
					value: finalMap
				};
			}
		}
	};
	ZodMap.create = (keyType, valueType, params) => {
		return new ZodMap({
			valueType,
			keyType,
			typeName: ZodFirstPartyTypeKind.ZodMap,
			...processCreateParams(params)
		});
	};
	var ZodSet = class ZodSet extends ZodType$1 {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.parsedType !== ZodParsedType.set) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.set,
					received: ctx.parsedType
				});
				return INVALID;
			}
			const def = this._def;
			if (def.minSize !== null) {
				if (ctx.data.size < def.minSize.value) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_small,
						minimum: def.minSize.value,
						type: "set",
						inclusive: true,
						exact: false,
						message: def.minSize.message
					});
					status.dirty();
				}
			}
			if (def.maxSize !== null) {
				if (ctx.data.size > def.maxSize.value) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_big,
						maximum: def.maxSize.value,
						type: "set",
						inclusive: true,
						exact: false,
						message: def.maxSize.message
					});
					status.dirty();
				}
			}
			const valueType = this._def.valueType;
			function finalizeSet(elements) {
				const parsedSet = /* @__PURE__ */ new Set();
				for (const element of elements) {
					if (element.status === "aborted") return INVALID;
					if (element.status === "dirty") status.dirty();
					parsedSet.add(element.value);
				}
				return {
					status: status.value,
					value: parsedSet
				};
			}
			const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
			if (ctx.common.async) return Promise.all(elements).then((elements) => finalizeSet(elements));
			else return finalizeSet(elements);
		}
		min(minSize, message) {
			return new ZodSet({
				...this._def,
				minSize: {
					value: minSize,
					message: errorUtil.toString(message)
				}
			});
		}
		max(maxSize, message) {
			return new ZodSet({
				...this._def,
				maxSize: {
					value: maxSize,
					message: errorUtil.toString(message)
				}
			});
		}
		size(size, message) {
			return this.min(size, message).max(size, message);
		}
		nonempty(message) {
			return this.min(1, message);
		}
	};
	ZodSet.create = (valueType, params) => {
		return new ZodSet({
			valueType,
			minSize: null,
			maxSize: null,
			typeName: ZodFirstPartyTypeKind.ZodSet,
			...processCreateParams(params)
		});
	};
	var ZodFunction = class ZodFunction extends ZodType$1 {
		constructor() {
			super(...arguments);
			this.validate = this.implement;
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== ZodParsedType.function) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.function,
					received: ctx.parsedType
				});
				return INVALID;
			}
			function makeArgsIssue(args, error) {
				return makeIssue({
					data: args,
					path: ctx.path,
					errorMaps: [
						ctx.common.contextualErrorMap,
						ctx.schemaErrorMap,
						getErrorMap(),
						errorMap
					].filter((x) => !!x),
					issueData: {
						code: ZodIssueCode.invalid_arguments,
						argumentsError: error
					}
				});
			}
			function makeReturnsIssue(returns, error) {
				return makeIssue({
					data: returns,
					path: ctx.path,
					errorMaps: [
						ctx.common.contextualErrorMap,
						ctx.schemaErrorMap,
						getErrorMap(),
						errorMap
					].filter((x) => !!x),
					issueData: {
						code: ZodIssueCode.invalid_return_type,
						returnTypeError: error
					}
				});
			}
			const params = { errorMap: ctx.common.contextualErrorMap };
			const fn = ctx.data;
			if (this._def.returns instanceof ZodPromise) {
				const me = this;
				return OK(async function(...args) {
					const error = new ZodError$1([]);
					const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
						error.addIssue(makeArgsIssue(args, e));
						throw error;
					});
					const result = await Reflect.apply(fn, this, parsedArgs);
					return await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
						error.addIssue(makeReturnsIssue(result, e));
						throw error;
					});
				});
			} else {
				const me = this;
				return OK(function(...args) {
					const parsedArgs = me._def.args.safeParse(args, params);
					if (!parsedArgs.success) throw new ZodError$1([makeArgsIssue(args, parsedArgs.error)]);
					const result = Reflect.apply(fn, this, parsedArgs.data);
					const parsedReturns = me._def.returns.safeParse(result, params);
					if (!parsedReturns.success) throw new ZodError$1([makeReturnsIssue(result, parsedReturns.error)]);
					return parsedReturns.data;
				});
			}
		}
		parameters() {
			return this._def.args;
		}
		returnType() {
			return this._def.returns;
		}
		args(...items) {
			return new ZodFunction({
				...this._def,
				args: ZodTuple.create(items).rest(ZodUnknown$1.create())
			});
		}
		returns(returnType) {
			return new ZodFunction({
				...this._def,
				returns: returnType
			});
		}
		implement(func) {
			return this.parse(func);
		}
		strictImplement(func) {
			return this.parse(func);
		}
		static create(args, returns, params) {
			return new ZodFunction({
				args: args ? args : ZodTuple.create([]).rest(ZodUnknown$1.create()),
				returns: returns || ZodUnknown$1.create(),
				typeName: ZodFirstPartyTypeKind.ZodFunction,
				...processCreateParams(params)
			});
		}
	};
	var ZodLazy = class extends ZodType$1 {
		get schema() {
			return this._def.getter();
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			return this._def.getter()._parse({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			});
		}
	};
	ZodLazy.create = (getter, params) => {
		return new ZodLazy({
			getter,
			typeName: ZodFirstPartyTypeKind.ZodLazy,
			...processCreateParams(params)
		});
	};
	var ZodLiteral$1 = class extends ZodType$1 {
		_parse(input) {
			if (input.data !== this._def.value) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					received: ctx.data,
					code: ZodIssueCode.invalid_literal,
					expected: this._def.value
				});
				return INVALID;
			}
			return {
				status: "valid",
				value: input.data
			};
		}
		get value() {
			return this._def.value;
		}
	};
	ZodLiteral$1.create = (value, params) => {
		return new ZodLiteral$1({
			value,
			typeName: ZodFirstPartyTypeKind.ZodLiteral,
			...processCreateParams(params)
		});
	};
	function createZodEnum(values, params) {
		return new ZodEnum$1({
			values,
			typeName: ZodFirstPartyTypeKind.ZodEnum,
			...processCreateParams(params)
		});
	}
	var ZodEnum$1 = class ZodEnum$1 extends ZodType$1 {
		_parse(input) {
			if (typeof input.data !== "string") {
				const ctx = this._getOrReturnCtx(input);
				const expectedValues = this._def.values;
				addIssueToContext(ctx, {
					expected: util.joinValues(expectedValues),
					received: ctx.parsedType,
					code: ZodIssueCode.invalid_type
				});
				return INVALID;
			}
			if (!this._cache) this._cache = new Set(this._def.values);
			if (!this._cache.has(input.data)) {
				const ctx = this._getOrReturnCtx(input);
				const expectedValues = this._def.values;
				addIssueToContext(ctx, {
					received: ctx.data,
					code: ZodIssueCode.invalid_enum_value,
					options: expectedValues
				});
				return INVALID;
			}
			return OK(input.data);
		}
		get options() {
			return this._def.values;
		}
		get enum() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		get Values() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		get Enum() {
			const enumValues = {};
			for (const val of this._def.values) enumValues[val] = val;
			return enumValues;
		}
		extract(values, newDef = this._def) {
			return ZodEnum$1.create(values, {
				...this._def,
				...newDef
			});
		}
		exclude(values, newDef = this._def) {
			return ZodEnum$1.create(this.options.filter((opt) => !values.includes(opt)), {
				...this._def,
				...newDef
			});
		}
	};
	ZodEnum$1.create = createZodEnum;
	var ZodNativeEnum = class extends ZodType$1 {
		_parse(input) {
			const nativeEnumValues = util.getValidEnumValues(this._def.values);
			const ctx = this._getOrReturnCtx(input);
			if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
				const expectedValues = util.objectValues(nativeEnumValues);
				addIssueToContext(ctx, {
					expected: util.joinValues(expectedValues),
					received: ctx.parsedType,
					code: ZodIssueCode.invalid_type
				});
				return INVALID;
			}
			if (!this._cache) this._cache = new Set(util.getValidEnumValues(this._def.values));
			if (!this._cache.has(input.data)) {
				const expectedValues = util.objectValues(nativeEnumValues);
				addIssueToContext(ctx, {
					received: ctx.data,
					code: ZodIssueCode.invalid_enum_value,
					options: expectedValues
				});
				return INVALID;
			}
			return OK(input.data);
		}
		get enum() {
			return this._def.values;
		}
	};
	ZodNativeEnum.create = (values, params) => {
		return new ZodNativeEnum({
			values,
			typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
			...processCreateParams(params)
		});
	};
	var ZodPromise = class extends ZodType$1 {
		unwrap() {
			return this._def.type;
		}
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.promise,
					received: ctx.parsedType
				});
				return INVALID;
			}
			return OK((ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data)).then((data) => {
				return this._def.type.parseAsync(data, {
					path: ctx.path,
					errorMap: ctx.common.contextualErrorMap
				});
			}));
		}
	};
	ZodPromise.create = (schema, params) => {
		return new ZodPromise({
			type: schema,
			typeName: ZodFirstPartyTypeKind.ZodPromise,
			...processCreateParams(params)
		});
	};
	var ZodEffects = class extends ZodType$1 {
		innerType() {
			return this._def.schema;
		}
		sourceType() {
			return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
		}
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			const effect = this._def.effect || null;
			const checkCtx = {
				addIssue: (arg) => {
					addIssueToContext(ctx, arg);
					if (arg.fatal) status.abort();
					else status.dirty();
				},
				get path() {
					return ctx.path;
				}
			};
			checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
			if (effect.type === "preprocess") {
				const processed = effect.transform(ctx.data, checkCtx);
				if (ctx.common.async) return Promise.resolve(processed).then(async (processed) => {
					if (status.value === "aborted") return INVALID;
					const result = await this._def.schema._parseAsync({
						data: processed,
						path: ctx.path,
						parent: ctx
					});
					if (result.status === "aborted") return INVALID;
					if (result.status === "dirty") return DIRTY(result.value);
					if (status.value === "dirty") return DIRTY(result.value);
					return result;
				});
				else {
					if (status.value === "aborted") return INVALID;
					const result = this._def.schema._parseSync({
						data: processed,
						path: ctx.path,
						parent: ctx
					});
					if (result.status === "aborted") return INVALID;
					if (result.status === "dirty") return DIRTY(result.value);
					if (status.value === "dirty") return DIRTY(result.value);
					return result;
				}
			}
			if (effect.type === "refinement") {
				const executeRefinement = (acc) => {
					const result = effect.refinement(acc, checkCtx);
					if (ctx.common.async) return Promise.resolve(result);
					if (result instanceof Promise) throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
					return acc;
				};
				if (ctx.common.async === false) {
					const inner = this._def.schema._parseSync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					});
					if (inner.status === "aborted") return INVALID;
					if (inner.status === "dirty") status.dirty();
					executeRefinement(inner.value);
					return {
						status: status.value,
						value: inner.value
					};
				} else return this._def.schema._parseAsync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				}).then((inner) => {
					if (inner.status === "aborted") return INVALID;
					if (inner.status === "dirty") status.dirty();
					return executeRefinement(inner.value).then(() => {
						return {
							status: status.value,
							value: inner.value
						};
					});
				});
			}
			if (effect.type === "transform") if (ctx.common.async === false) {
				const base = this._def.schema._parseSync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				});
				if (!isValid(base)) return INVALID;
				const result = effect.transform(base.value, checkCtx);
				if (result instanceof Promise) throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
				return {
					status: status.value,
					value: result
				};
			} else return this._def.schema._parseAsync({
				data: ctx.data,
				path: ctx.path,
				parent: ctx
			}).then((base) => {
				if (!isValid(base)) return INVALID;
				return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
					status: status.value,
					value: result
				}));
			});
			util.assertNever(effect);
		}
	};
	ZodEffects.create = (schema, effect, params) => {
		return new ZodEffects({
			schema,
			typeName: ZodFirstPartyTypeKind.ZodEffects,
			effect,
			...processCreateParams(params)
		});
	};
	ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
		return new ZodEffects({
			schema,
			effect: {
				type: "preprocess",
				transform: preprocess
			},
			typeName: ZodFirstPartyTypeKind.ZodEffects,
			...processCreateParams(params)
		});
	};
	var ZodOptional$1 = class extends ZodType$1 {
		_parse(input) {
			if (this._getType(input) === ZodParsedType.undefined) return OK(void 0);
			return this._def.innerType._parse(input);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	ZodOptional$1.create = (type, params) => {
		return new ZodOptional$1({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodOptional,
			...processCreateParams(params)
		});
	};
	var ZodNullable$1 = class extends ZodType$1 {
		_parse(input) {
			if (this._getType(input) === ZodParsedType.null) return OK(null);
			return this._def.innerType._parse(input);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	ZodNullable$1.create = (type, params) => {
		return new ZodNullable$1({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodNullable,
			...processCreateParams(params)
		});
	};
	var ZodDefault$1 = class extends ZodType$1 {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			let data = ctx.data;
			if (ctx.parsedType === ZodParsedType.undefined) data = this._def.defaultValue();
			return this._def.innerType._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
		}
		removeDefault() {
			return this._def.innerType;
		}
	};
	ZodDefault$1.create = (type, params) => {
		return new ZodDefault$1({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodDefault,
			defaultValue: typeof params.default === "function" ? params.default : () => params.default,
			...processCreateParams(params)
		});
	};
	var ZodCatch$1 = class extends ZodType$1 {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const newCtx = {
				...ctx,
				common: {
					...ctx.common,
					issues: []
				}
			};
			const result = this._def.innerType._parse({
				data: newCtx.data,
				path: newCtx.path,
				parent: { ...newCtx }
			});
			if (isAsync(result)) return result.then((result) => {
				return {
					status: "valid",
					value: result.status === "valid" ? result.value : this._def.catchValue({
						get error() {
							return new ZodError$1(newCtx.common.issues);
						},
						input: newCtx.data
					})
				};
			});
			else return {
				status: "valid",
				value: result.status === "valid" ? result.value : this._def.catchValue({
					get error() {
						return new ZodError$1(newCtx.common.issues);
					},
					input: newCtx.data
				})
			};
		}
		removeCatch() {
			return this._def.innerType;
		}
	};
	ZodCatch$1.create = (type, params) => {
		return new ZodCatch$1({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodCatch,
			catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
			...processCreateParams(params)
		});
	};
	var ZodNaN = class extends ZodType$1 {
		_parse(input) {
			if (this._getType(input) !== ZodParsedType.nan) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.nan,
					received: ctx.parsedType
				});
				return INVALID;
			}
			return {
				status: "valid",
				value: input.data
			};
		}
	};
	ZodNaN.create = (params) => {
		return new ZodNaN({
			typeName: ZodFirstPartyTypeKind.ZodNaN,
			...processCreateParams(params)
		});
	};
	var ZodBranded = class extends ZodType$1 {
		_parse(input) {
			const { ctx } = this._processInputParams(input);
			const data = ctx.data;
			return this._def.type._parse({
				data,
				path: ctx.path,
				parent: ctx
			});
		}
		unwrap() {
			return this._def.type;
		}
	};
	var ZodPipeline = class ZodPipeline extends ZodType$1 {
		_parse(input) {
			const { status, ctx } = this._processInputParams(input);
			if (ctx.common.async) {
				const handleAsync = async () => {
					const inResult = await this._def.in._parseAsync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					});
					if (inResult.status === "aborted") return INVALID;
					if (inResult.status === "dirty") {
						status.dirty();
						return DIRTY(inResult.value);
					} else return this._def.out._parseAsync({
						data: inResult.value,
						path: ctx.path,
						parent: ctx
					});
				};
				return handleAsync();
			} else {
				const inResult = this._def.in._parseSync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				});
				if (inResult.status === "aborted") return INVALID;
				if (inResult.status === "dirty") {
					status.dirty();
					return {
						status: "dirty",
						value: inResult.value
					};
				} else return this._def.out._parseSync({
					data: inResult.value,
					path: ctx.path,
					parent: ctx
				});
			}
		}
		static create(a, b) {
			return new ZodPipeline({
				in: a,
				out: b,
				typeName: ZodFirstPartyTypeKind.ZodPipeline
			});
		}
	};
	var ZodReadonly$1 = class extends ZodType$1 {
		_parse(input) {
			const result = this._def.innerType._parse(input);
			const freeze = (data) => {
				if (isValid(data)) data.value = Object.freeze(data.value);
				return data;
			};
			return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
		}
		unwrap() {
			return this._def.innerType;
		}
	};
	ZodReadonly$1.create = (type, params) => {
		return new ZodReadonly$1({
			innerType: type,
			typeName: ZodFirstPartyTypeKind.ZodReadonly,
			...processCreateParams(params)
		});
	};
	const late = { object: ZodObject$1.lazycreate };
	var ZodFirstPartyTypeKind;
	(function(ZodFirstPartyTypeKind) {
		ZodFirstPartyTypeKind["ZodString"] = "ZodString";
		ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
		ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
		ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
		ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
		ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
		ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
		ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
		ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
		ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
		ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
		ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
		ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
		ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
		ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
		ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
		ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
		ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
		ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
		ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
		ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
		ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
		ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
		ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
		ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
		ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
		ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
		ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
		ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
		ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
		ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
		ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
		ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
		ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
		ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
		ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
	})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
	const stringType = ZodString$1.create;
	const numberType = ZodNumber$1.create;
	const nanType = ZodNaN.create;
	const bigIntType = ZodBigInt.create;
	const booleanType = ZodBoolean$1.create;
	const dateType = ZodDate.create;
	const symbolType = ZodSymbol.create;
	const undefinedType = ZodUndefined.create;
	const nullType = ZodNull$1.create;
	const anyType = ZodAny.create;
	const unknownType = ZodUnknown$1.create;
	const neverType = ZodNever$1.create;
	const voidType = ZodVoid.create;
	const arrayType = ZodArray$1.create;
	const objectType = ZodObject$1.create;
	const strictObjectType = ZodObject$1.strictCreate;
	const unionType = ZodUnion$1.create;
	const discriminatedUnionType = ZodDiscriminatedUnion$1.create;
	const intersectionType = ZodIntersection$1.create;
	const tupleType = ZodTuple.create;
	const recordType = ZodRecord$1.create;
	const mapType = ZodMap.create;
	const setType = ZodSet.create;
	const functionType = ZodFunction.create;
	const lazyType = ZodLazy.create;
	const literalType = ZodLiteral$1.create;
	const enumType = ZodEnum$1.create;
	const nativeEnumType = ZodNativeEnum.create;
	const promiseType = ZodPromise.create;
	const effectsType = ZodEffects.create;
	const optionalType = ZodOptional$1.create;
	const nullableType = ZodNullable$1.create;
	const preprocessType = ZodEffects.createWithPreprocess;
	const pipelineType = ZodPipeline.create;

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/core.js
/** A special constant with type `never` */
	const NEVER = Object.freeze({ status: "aborted" });
	function $constructor(name, initializer, params) {
		function init(inst, def) {
			var _a;
			Object.defineProperty(inst, "_zod", {
				value: inst._zod ?? {},
				enumerable: false
			});
			(_a = inst._zod).traits ?? (_a.traits = /* @__PURE__ */ new Set());
			inst._zod.traits.add(name);
			initializer(inst, def);
			for (const k in _.prototype) if (!(k in inst)) Object.defineProperty(inst, k, { value: _.prototype[k].bind(inst) });
			inst._zod.constr = _;
			inst._zod.def = def;
		}
		const Parent = params?.Parent ?? Object;
		class Definition extends Parent {}
		Object.defineProperty(Definition, "name", { value: name });
		function _(def) {
			var _a;
			const inst = params?.Parent ? new Definition() : this;
			init(inst, def);
			(_a = inst._zod).deferred ?? (_a.deferred = []);
			for (const fn of inst._zod.deferred) fn();
			return inst;
		}
		Object.defineProperty(_, "init", { value: init });
		Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
			if (params?.Parent && inst instanceof params.Parent) return true;
			return inst?._zod?.traits?.has(name);
		} });
		Object.defineProperty(_, "name", { value: name });
		return _;
	}
	var $ZodAsyncError = class extends Error {
		constructor() {
			super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
		}
	};
	const globalConfig = {};
	function config(newConfig) {
		if (newConfig) Object.assign(globalConfig, newConfig);
		return globalConfig;
	}

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/util.js
	function getEnumValues(entries) {
		const numericValues = Object.values(entries).filter((v) => typeof v === "number");
		return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
	}
	function jsonStringifyReplacer(_, value) {
		if (typeof value === "bigint") return value.toString();
		return value;
	}
	function cached(getter) {
		return { get value() {
			{
				const value = getter();
				Object.defineProperty(this, "value", { value });
				return value;
			}
			throw new Error("cached value already set");
		} };
	}
	function nullish(input) {
		return input === null || input === void 0;
	}
	function cleanRegex(source) {
		const start = source.startsWith("^") ? 1 : 0;
		const end = source.endsWith("$") ? source.length - 1 : source.length;
		return source.slice(start, end);
	}
	function floatSafeRemainder(val, step) {
		const valDecCount = (val.toString().split(".")[1] || "").length;
		const stepDecCount = (step.toString().split(".")[1] || "").length;
		const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
		return Number.parseInt(val.toFixed(decCount).replace(".", "")) % Number.parseInt(step.toFixed(decCount).replace(".", "")) / 10 ** decCount;
	}
	function defineLazy(object, key, getter) {
		Object.defineProperty(object, key, {
			get() {
				{
					const value = getter();
					object[key] = value;
					return value;
				}
				throw new Error("cached value already set");
			},
			set(v) {
				Object.defineProperty(object, key, { value: v });
			},
			configurable: true
		});
	}
	function assignProp(target, prop, value) {
		Object.defineProperty(target, prop, {
			value,
			writable: true,
			enumerable: true,
			configurable: true
		});
	}
	function esc(str) {
		return JSON.stringify(str);
	}
	const captureStackTrace = Error.captureStackTrace ? Error.captureStackTrace : (..._args) => {};
	function isObject(data) {
		return typeof data === "object" && data !== null && !Array.isArray(data);
	}
	const allowsEval = cached(() => {
		if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
		try {
			new Function("");
			return true;
		} catch (_) {
			return false;
		}
	});
	function isPlainObject$2(o) {
		if (isObject(o) === false) return false;
		const ctor = o.constructor;
		if (ctor === void 0) return true;
		const prot = ctor.prototype;
		if (isObject(prot) === false) return false;
		if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
		return true;
	}
	const propertyKeyTypes = new Set([
		"string",
		"number",
		"symbol"
	]);
	function escapeRegex(str) {
		return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}
	function clone(inst, def, params) {
		const cl = new inst._zod.constr(def ?? inst._zod.def);
		if (!def || params?.parent) cl._zod.parent = inst;
		return cl;
	}
	function normalizeParams(_params) {
		const params = _params;
		if (!params) return {};
		if (typeof params === "string") return { error: () => params };
		if (params?.message !== void 0) {
			if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
			params.error = params.message;
		}
		delete params.message;
		if (typeof params.error === "string") return {
			...params,
			error: () => params.error
		};
		return params;
	}
	function optionalKeys(shape) {
		return Object.keys(shape).filter((k) => {
			return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
		});
	}
	const NUMBER_FORMAT_RANGES = {
		safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
		int32: [-2147483648, 2147483647],
		uint32: [0, 4294967295],
		float32: [-34028234663852886e22, 34028234663852886e22],
		float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
	};
	function pick(schema, mask) {
		const newShape = {};
		const currDef = schema._zod.def;
		for (const key in mask) {
			if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
			if (!mask[key]) continue;
			newShape[key] = currDef.shape[key];
		}
		return clone(schema, {
			...schema._zod.def,
			shape: newShape,
			checks: []
		});
	}
	function omit(schema, mask) {
		const newShape = { ...schema._zod.def.shape };
		const currDef = schema._zod.def;
		for (const key in mask) {
			if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
			if (!mask[key]) continue;
			delete newShape[key];
		}
		return clone(schema, {
			...schema._zod.def,
			shape: newShape,
			checks: []
		});
	}
	function extend(schema, shape) {
		if (!isPlainObject$2(shape)) throw new Error("Invalid input to extend: expected a plain object");
		return clone(schema, {
			...schema._zod.def,
			get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			},
			checks: []
		});
	}
	function merge(a, b) {
		return clone(a, {
			...a._zod.def,
			get shape() {
				const _shape = {
					...a._zod.def.shape,
					...b._zod.def.shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			},
			catchall: b._zod.def.catchall,
			checks: []
		});
	}
	function partial(Class, schema, mask) {
		const oldShape = schema._zod.def.shape;
		const shape = { ...oldShape };
		if (mask) for (const key in mask) {
			if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
			if (!mask[key]) continue;
			shape[key] = Class ? new Class({
				type: "optional",
				innerType: oldShape[key]
			}) : oldShape[key];
		}
		else for (const key in oldShape) shape[key] = Class ? new Class({
			type: "optional",
			innerType: oldShape[key]
		}) : oldShape[key];
		return clone(schema, {
			...schema._zod.def,
			shape,
			checks: []
		});
	}
	function required(Class, schema, mask) {
		const oldShape = schema._zod.def.shape;
		const shape = { ...oldShape };
		if (mask) for (const key in mask) {
			if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
			if (!mask[key]) continue;
			shape[key] = new Class({
				type: "nonoptional",
				innerType: oldShape[key]
			});
		}
		else for (const key in oldShape) shape[key] = new Class({
			type: "nonoptional",
			innerType: oldShape[key]
		});
		return clone(schema, {
			...schema._zod.def,
			shape,
			checks: []
		});
	}
	function aborted(x, startIndex = 0) {
		for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
		return false;
	}
	function prefixIssues(path, issues) {
		return issues.map((iss) => {
			var _a;
			(_a = iss).path ?? (_a.path = []);
			iss.path.unshift(path);
			return iss;
		});
	}
	function unwrapMessage(message) {
		return typeof message === "string" ? message : message?.message;
	}
	function finalizeIssue(iss, ctx, config) {
		const full = {
			...iss,
			path: iss.path ?? []
		};
		if (!iss.message) full.message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
		delete full.inst;
		delete full.continue;
		if (!ctx?.reportInput) delete full.input;
		return full;
	}
	function getLengthableOrigin(input) {
		if (Array.isArray(input)) return "array";
		if (typeof input === "string") return "string";
		return "unknown";
	}
	function issue(...args) {
		const [iss, input, inst] = args;
		if (typeof iss === "string") return {
			message: iss,
			code: "custom",
			input,
			inst
		};
		return { ...iss };
	}

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/errors.js
	const initializer$1 = (inst, def) => {
		inst.name = "$ZodError";
		Object.defineProperty(inst, "_zod", {
			value: inst._zod,
			enumerable: false
		});
		Object.defineProperty(inst, "issues", {
			value: def,
			enumerable: false
		});
		Object.defineProperty(inst, "message", {
			get() {
				return JSON.stringify(def, jsonStringifyReplacer, 2);
			},
			enumerable: true
		});
		Object.defineProperty(inst, "toString", {
			value: () => inst.message,
			enumerable: false
		});
	};
	const $ZodError = $constructor("$ZodError", initializer$1);
	const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
	function flattenError(error, mapper = (issue) => issue.message) {
		const fieldErrors = {};
		const formErrors = [];
		for (const sub of error.issues) if (sub.path.length > 0) {
			fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
			fieldErrors[sub.path[0]].push(mapper(sub));
		} else formErrors.push(mapper(sub));
		return {
			formErrors,
			fieldErrors
		};
	}
	function formatError(error, _mapper) {
		const mapper = _mapper || function(issue) {
			return issue.message;
		};
		const fieldErrors = { _errors: [] };
		const processError = (error) => {
			for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }));
			else if (issue.code === "invalid_key") processError({ issues: issue.issues });
			else if (issue.code === "invalid_element") processError({ issues: issue.issues });
			else if (issue.path.length === 0) fieldErrors._errors.push(mapper(issue));
			else {
				let curr = fieldErrors;
				let i = 0;
				while (i < issue.path.length) {
					const el = issue.path[i];
					if (!(i === issue.path.length - 1)) curr[el] = curr[el] || { _errors: [] };
					else {
						curr[el] = curr[el] || { _errors: [] };
						curr[el]._errors.push(mapper(issue));
					}
					curr = curr[el];
					i++;
				}
			}
		};
		processError(error);
		return fieldErrors;
	}

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/parse.js
	const _parse = (_Err) => (schema, value, _ctx, _params) => {
		const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
		const result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) throw new $ZodAsyncError();
		if (result.issues.length) {
			const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, _params?.callee);
			throw e;
		}
		return result.value;
	};
	const parse$1 = /* @__PURE__ */ _parse($ZodRealError);
	const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
		const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
		let result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) result = await result;
		if (result.issues.length) {
			const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
			captureStackTrace(e, params?.callee);
			throw e;
		}
		return result.value;
	};
	const parseAsync$1 = /* @__PURE__ */ _parseAsync($ZodRealError);
	const _safeParse = (_Err) => (schema, value, _ctx) => {
		const ctx = _ctx ? {
			..._ctx,
			async: false
		} : { async: false };
		const result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) throw new $ZodAsyncError();
		return result.issues.length ? {
			success: false,
			error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
		} : {
			success: true,
			data: result.value
		};
	};
	const safeParse$2 = /* @__PURE__ */ _safeParse($ZodRealError);
	const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
		const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
		let result = schema._zod.run({
			value,
			issues: []
		}, ctx);
		if (result instanceof Promise) result = await result;
		return result.issues.length ? {
			success: false,
			error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
		} : {
			success: true,
			data: result.value
		};
	};
	const safeParseAsync$2 = /* @__PURE__ */ _safeParseAsync($ZodRealError);

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/regexes.js
	const cuid = /^[cC][^\s-]{8,}$/;
	const cuid2 = /^[0-9a-z]+$/;
	const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
	const xid = /^[0-9a-vA-V]{20}$/;
	const ksuid = /^[A-Za-z0-9]{27}$/;
	const nanoid = /^[a-zA-Z0-9_-]{21}$/;
	/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
	const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
	/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
	const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
	/** Returns a regex for validating an RFC 4122 UUID.
	*
	* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
	const uuid = (version) => {
		if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/;
		return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
	};
	/** Practical email validation */
	const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
	const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
	function emoji() {
		return new RegExp(_emoji$1, "u");
	}
	const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
	const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/;
	const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
	const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
	const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
	const base64url = /^[A-Za-z0-9_-]*$/;
	const hostname = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/;
	const e164 = /^\+(?:[0-9]){6,14}[0-9]$/;
	const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
	const date$2 = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
	function timeSource(args) {
		const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
		return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
	}
	function time$2(args) {
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
	const string$1 = (params) => {
		const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
		return new RegExp(`^${regex}$`);
	};
	const integer = /^\d+$/;
	const number$1 = /^-?\d+(?:\.\d+)?/i;
	const boolean$1 = /true|false/i;
	const _null$2 = /null/i;
	const lowercase = /^[^A-Z]*$/;
	const uppercase = /^[^a-z]*$/;

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/checks.js
	const $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
		var _a;
		inst._zod ?? (inst._zod = {});
		inst._zod.def = def;
		(_a = inst._zod).onattach ?? (_a.onattach = []);
	});
	const numericOriginMap = {
		number: "number",
		bigint: "bigint",
		object: "date"
	};
	const $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
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
	const $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
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
	const $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
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
	const $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
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
	const $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
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
	const $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
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
	const $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
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
	const $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
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
	const $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
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
	const $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
		def.pattern ?? (def.pattern = lowercase);
		$ZodCheckStringFormat.init(inst, def);
	});
	const $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
		def.pattern ?? (def.pattern = uppercase);
		$ZodCheckStringFormat.init(inst, def);
	});
	const $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
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
	const $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
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
	const $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
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
	const $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
		$ZodCheck.init(inst, def);
		inst._zod.check = (payload) => {
			payload.value = def.tx(payload.value);
		};
	});

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/doc.js
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
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/versions.js
	const version = {
		major: 4,
		minor: 0,
		patch: 0
	};

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/schemas.js
	const $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
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
					const r = safeParse$2(inst, value);
					return r.success ? { value: r.data } : { issues: r.error?.issues };
				} catch (_) {
					return safeParseAsync$2(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
				}
			},
			vendor: "zod",
			version: 1
		};
	});
	const $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
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
	const $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
		$ZodCheckStringFormat.init(inst, def);
		$ZodString.init(inst, def);
	});
	const $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
		def.pattern ?? (def.pattern = guid);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
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
	const $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
		def.pattern ?? (def.pattern = email);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
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
	const $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
		def.pattern ?? (def.pattern = emoji());
		$ZodStringFormat.init(inst, def);
	});
	const $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
		def.pattern ?? (def.pattern = nanoid);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
		def.pattern ?? (def.pattern = cuid);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
		def.pattern ?? (def.pattern = cuid2);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
		def.pattern ?? (def.pattern = ulid);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
		def.pattern ?? (def.pattern = xid);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
		def.pattern ?? (def.pattern = ksuid);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
		def.pattern ?? (def.pattern = datetime$1(def));
		$ZodStringFormat.init(inst, def);
	});
	const $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
		def.pattern ?? (def.pattern = date$2);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
		def.pattern ?? (def.pattern = time$2(def));
		$ZodStringFormat.init(inst, def);
	});
	const $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
		def.pattern ?? (def.pattern = duration$1);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
		def.pattern ?? (def.pattern = ipv4);
		$ZodStringFormat.init(inst, def);
		inst._zod.onattach.push((inst) => {
			const bag = inst._zod.bag;
			bag.format = `ipv4`;
		});
	});
	const $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
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
	const $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
		def.pattern ?? (def.pattern = cidrv4);
		$ZodStringFormat.init(inst, def);
	});
	const $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
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
	const $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
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
	const $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
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
	const $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
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
	const $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
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
	const $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
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
	const $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
		$ZodCheckNumberFormat.init(inst, def);
		$ZodNumber.init(inst, def);
	});
	const $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
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
	const $ZodNull = /* @__PURE__ */ $constructor("$ZodNull", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.pattern = _null$2;
		inst._zod.values = new Set([null]);
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
	const $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.parse = (payload) => payload;
	});
	const $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
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
	const $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
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
	const $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
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
		const allowsEval$1 = allowsEval;
		const fastEnabled = jit && allowsEval$1.value;
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
	const $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
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
	const $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
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
	const $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
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
		if (isPlainObject$2(a) && isPlainObject$2(b)) {
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
	const $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.parse = (payload, ctx) => {
			const input = payload.value;
			if (!isPlainObject$2(input)) {
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
	const $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
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
	const $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
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
	const $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
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
	const $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.optin = "optional";
		inst._zod.optout = "optional";
		defineLazy(inst._zod, "values", () => {
			return def.innerType._zod.values ? new Set([...def.innerType._zod.values, void 0]) : void 0;
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
	const $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
		$ZodType.init(inst, def);
		defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
		defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
		defineLazy(inst._zod, "pattern", () => {
			const pattern = def.innerType._zod.pattern;
			return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
		});
		defineLazy(inst._zod, "values", () => {
			return def.innerType._zod.values ? new Set([...def.innerType._zod.values, null]) : void 0;
		});
		inst._zod.parse = (payload, ctx) => {
			if (payload.value === null) return payload;
			return def.innerType._zod.run(payload, ctx);
		};
	});
	const $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
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
	const $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
		$ZodType.init(inst, def);
		inst._zod.optin = "optional";
		defineLazy(inst._zod, "values", () => def.innerType._zod.values);
		inst._zod.parse = (payload, ctx) => {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return def.innerType._zod.run(payload, ctx);
		};
	});
	const $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
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
	const $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
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
	const $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
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
	const $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
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
	const $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
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
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/registries.js
	var $ZodRegistry = class {
		constructor() {
			this._map = /* @__PURE__ */ new Map();
			this._idmap = /* @__PURE__ */ new Map();
		}
		add(schema, ..._meta) {
			const meta = _meta[0];
			this._map.set(schema, meta);
			if (meta && typeof meta === "object" && "id" in meta) {
				if (this._idmap.has(meta.id)) throw new Error(`ID ${meta.id} already exists in the registry`);
				this._idmap.set(meta.id, schema);
			}
			return this;
		}
		clear() {
			this._map = /* @__PURE__ */ new Map();
			this._idmap = /* @__PURE__ */ new Map();
			return this;
		}
		remove(schema) {
			const meta = this._map.get(schema);
			if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
			this._map.delete(schema);
			return this;
		}
		get(schema) {
			const p = schema._zod.parent;
			if (p) {
				const pm = { ...this.get(p) ?? {} };
				delete pm.id;
				return {
					...pm,
					...this._map.get(schema)
				};
			}
			return this._map.get(schema);
		}
		has(schema) {
			return this._map.has(schema);
		}
	};
	function registry() {
		return new $ZodRegistry();
	}
	const globalRegistry = /* @__PURE__ */ registry();

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/api.js
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
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/core/to-json-schema.js
	var JSONSchemaGenerator = class {
		constructor(params) {
			this.counter = 0;
			this.metadataRegistry = params?.metadata ?? globalRegistry;
			this.target = params?.target ?? "draft-2020-12";
			this.unrepresentable = params?.unrepresentable ?? "throw";
			this.override = params?.override ?? (() => {});
			this.io = params?.io ?? "output";
			this.seen = /* @__PURE__ */ new Map();
		}
		process(schema, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const formatMap = {
				guid: "uuid",
				url: "uri",
				datetime: "date-time",
				json_string: "json-string",
				regex: ""
			};
			const seen = this.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			this.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				const parent = schema._zod.parent;
				if (parent) {
					result.ref = parent;
					this.process(parent, params);
					this.seen.get(parent).isParent = true;
				} else {
					const _json = result.schema;
					switch (def.type) {
						case "string": {
							const json = _json;
							json.type = "string";
							const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
							if (typeof minimum === "number") json.minLength = minimum;
							if (typeof maximum === "number") json.maxLength = maximum;
							if (format) {
								json.format = formatMap[format] ?? format;
								if (json.format === "") delete json.format;
							}
							if (contentEncoding) json.contentEncoding = contentEncoding;
							if (patterns && patterns.size > 0) {
								const regexes = [...patterns];
								if (regexes.length === 1) json.pattern = regexes[0].source;
								else if (regexes.length > 1) result.schema.allOf = [...regexes.map((regex) => ({
									...this.target === "draft-7" ? { type: "string" } : {},
									pattern: regex.source
								}))];
							}
							break;
						}
						case "number": {
							const json = _json;
							const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
							if (typeof format === "string" && format.includes("int")) json.type = "integer";
							else json.type = "number";
							if (typeof exclusiveMinimum === "number") json.exclusiveMinimum = exclusiveMinimum;
							if (typeof minimum === "number") {
								json.minimum = minimum;
								if (typeof exclusiveMinimum === "number") if (exclusiveMinimum >= minimum) delete json.minimum;
								else delete json.exclusiveMinimum;
							}
							if (typeof exclusiveMaximum === "number") json.exclusiveMaximum = exclusiveMaximum;
							if (typeof maximum === "number") {
								json.maximum = maximum;
								if (typeof exclusiveMaximum === "number") if (exclusiveMaximum <= maximum) delete json.maximum;
								else delete json.exclusiveMaximum;
							}
							if (typeof multipleOf === "number") json.multipleOf = multipleOf;
							break;
						}
						case "boolean": {
							const json = _json;
							json.type = "boolean";
							break;
						}
						case "bigint":
							if (this.unrepresentable === "throw") throw new Error("BigInt cannot be represented in JSON Schema");
							break;
						case "symbol":
							if (this.unrepresentable === "throw") throw new Error("Symbols cannot be represented in JSON Schema");
							break;
						case "null":
							_json.type = "null";
							break;
						case "any": break;
						case "unknown": break;
						case "undefined":
							if (this.unrepresentable === "throw") throw new Error("Undefined cannot be represented in JSON Schema");
							break;
						case "void":
							if (this.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema");
							break;
						case "never":
							_json.not = {};
							break;
						case "date":
							if (this.unrepresentable === "throw") throw new Error("Date cannot be represented in JSON Schema");
							break;
						case "array": {
							const json = _json;
							const { minimum, maximum } = schema._zod.bag;
							if (typeof minimum === "number") json.minItems = minimum;
							if (typeof maximum === "number") json.maxItems = maximum;
							json.type = "array";
							json.items = this.process(def.element, {
								...params,
								path: [...params.path, "items"]
							});
							break;
						}
						case "object": {
							const json = _json;
							json.type = "object";
							json.properties = {};
							const shape = def.shape;
							for (const key in shape) json.properties[key] = this.process(shape[key], {
								...params,
								path: [
									...params.path,
									"properties",
									key
								]
							});
							const allKeys = new Set(Object.keys(shape));
							const requiredKeys = new Set([...allKeys].filter((key) => {
								const v = def.shape[key]._zod;
								if (this.io === "input") return v.optin === void 0;
								else return v.optout === void 0;
							}));
							if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
							if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
							else if (!def.catchall) {
								if (this.io === "output") json.additionalProperties = false;
							} else if (def.catchall) json.additionalProperties = this.process(def.catchall, {
								...params,
								path: [...params.path, "additionalProperties"]
							});
							break;
						}
						case "union": {
							const json = _json;
							json.anyOf = def.options.map((x, i) => this.process(x, {
								...params,
								path: [
									...params.path,
									"anyOf",
									i
								]
							}));
							break;
						}
						case "intersection": {
							const json = _json;
							const a = this.process(def.left, {
								...params,
								path: [
									...params.path,
									"allOf",
									0
								]
							});
							const b = this.process(def.right, {
								...params,
								path: [
									...params.path,
									"allOf",
									1
								]
							});
							const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
							json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
							break;
						}
						case "tuple": {
							const json = _json;
							json.type = "array";
							const prefixItems = def.items.map((x, i) => this.process(x, {
								...params,
								path: [
									...params.path,
									"prefixItems",
									i
								]
							}));
							if (this.target === "draft-2020-12") json.prefixItems = prefixItems;
							else json.items = prefixItems;
							if (def.rest) {
								const rest = this.process(def.rest, {
									...params,
									path: [...params.path, "items"]
								});
								if (this.target === "draft-2020-12") json.items = rest;
								else json.additionalItems = rest;
							}
							if (def.rest) json.items = this.process(def.rest, {
								...params,
								path: [...params.path, "items"]
							});
							const { minimum, maximum } = schema._zod.bag;
							if (typeof minimum === "number") json.minItems = minimum;
							if (typeof maximum === "number") json.maxItems = maximum;
							break;
						}
						case "record": {
							const json = _json;
							json.type = "object";
							json.propertyNames = this.process(def.keyType, {
								...params,
								path: [...params.path, "propertyNames"]
							});
							json.additionalProperties = this.process(def.valueType, {
								...params,
								path: [...params.path, "additionalProperties"]
							});
							break;
						}
						case "map":
							if (this.unrepresentable === "throw") throw new Error("Map cannot be represented in JSON Schema");
							break;
						case "set":
							if (this.unrepresentable === "throw") throw new Error("Set cannot be represented in JSON Schema");
							break;
						case "enum": {
							const json = _json;
							const values = getEnumValues(def.entries);
							if (values.every((v) => typeof v === "number")) json.type = "number";
							if (values.every((v) => typeof v === "string")) json.type = "string";
							json.enum = values;
							break;
						}
						case "literal": {
							const json = _json;
							const vals = [];
							for (const val of def.values) if (val === void 0) {
								if (this.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
							} else if (typeof val === "bigint") if (this.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
							else vals.push(Number(val));
							else vals.push(val);
							if (vals.length === 0) {} else if (vals.length === 1) {
								const val = vals[0];
								json.type = val === null ? "null" : typeof val;
								json.const = val;
							} else {
								if (vals.every((v) => typeof v === "number")) json.type = "number";
								if (vals.every((v) => typeof v === "string")) json.type = "string";
								if (vals.every((v) => typeof v === "boolean")) json.type = "string";
								if (vals.every((v) => v === null)) json.type = "null";
								json.enum = vals;
							}
							break;
						}
						case "file": {
							const json = _json;
							const file = {
								type: "string",
								format: "binary",
								contentEncoding: "binary"
							};
							const { minimum, maximum, mime } = schema._zod.bag;
							if (minimum !== void 0) file.minLength = minimum;
							if (maximum !== void 0) file.maxLength = maximum;
							if (mime) if (mime.length === 1) {
								file.contentMediaType = mime[0];
								Object.assign(json, file);
							} else json.anyOf = mime.map((m) => {
								return {
									...file,
									contentMediaType: m
								};
							});
							else Object.assign(json, file);
							break;
						}
						case "transform":
							if (this.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
							break;
						case "nullable":
							_json.anyOf = [this.process(def.innerType, params), { type: "null" }];
							break;
						case "nonoptional":
							this.process(def.innerType, params);
							result.ref = def.innerType;
							break;
						case "success": {
							const json = _json;
							json.type = "boolean";
							break;
						}
						case "default":
							this.process(def.innerType, params);
							result.ref = def.innerType;
							_json.default = JSON.parse(JSON.stringify(def.defaultValue));
							break;
						case "prefault":
							this.process(def.innerType, params);
							result.ref = def.innerType;
							if (this.io === "input") _json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
							break;
						case "catch": {
							this.process(def.innerType, params);
							result.ref = def.innerType;
							let catchValue;
							try {
								catchValue = def.catchValue(void 0);
							} catch {
								throw new Error("Dynamic catch values are not supported in JSON Schema");
							}
							_json.default = catchValue;
							break;
						}
						case "nan":
							if (this.unrepresentable === "throw") throw new Error("NaN cannot be represented in JSON Schema");
							break;
						case "template_literal": {
							const json = _json;
							const pattern = schema._zod.pattern;
							if (!pattern) throw new Error("Pattern not found in template literal");
							json.type = "string";
							json.pattern = pattern.source;
							break;
						}
						case "pipe": {
							const innerType = this.io === "input" ? def.in._zod.def.type === "transform" ? def.out : def.in : def.out;
							this.process(innerType, params);
							result.ref = innerType;
							break;
						}
						case "readonly":
							this.process(def.innerType, params);
							result.ref = def.innerType;
							_json.readOnly = true;
							break;
						case "promise":
							this.process(def.innerType, params);
							result.ref = def.innerType;
							break;
						case "optional":
							this.process(def.innerType, params);
							result.ref = def.innerType;
							break;
						case "lazy": {
							const innerType = schema._zod.innerType;
							this.process(innerType, params);
							result.ref = innerType;
							break;
						}
						case "custom":
							if (this.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
							break;
						default:
					}
				}
			}
			const meta = this.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (this.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (this.io === "input" && result.schema._prefault) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return this.seen.get(schema).schema;
		}
		emit(schema, _params) {
			const params = {
				cycles: _params?.cycles ?? "ref",
				reused: _params?.reused ?? "inline",
				external: _params?.external ?? void 0
			};
			const root = this.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const makeURI = (entry) => {
				const defsSegment = this.target === "draft-2020-12" ? "$defs" : "definitions";
				if (params.external) {
					const externalId = params.external.registry.get(entry[0])?.id;
					const uriGenerator = params.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${this.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${this.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (params.cycles === "throw") for (const entry of this.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of this.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (params.external) {
					const ext = params.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (this.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (params.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
			const flattenRef = (zodSchema, params) => {
				const seen = this.seen.get(zodSchema);
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				if (seen.ref === null) return;
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref, params);
					const refSchema = this.seen.get(ref).schema;
					if (refSchema.$ref && params.target === "draft-7") {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else {
						Object.assign(schema, refSchema);
						Object.assign(schema, _cached);
					}
				}
				if (!seen.isParent) this.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...this.seen.entries()].reverse()) flattenRef(entry[0], { target: this.target });
			const result = {};
			if (this.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (this.target === "draft-7") result.$schema = "http://json-schema.org/draft-07/schema#";
			else console.warn(`Invalid target: ${this.target}`);
			if (params.external?.uri) {
				const id = params.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = params.external.uri(id);
			}
			Object.assign(result, root.def);
			const defs = params.external?.defs ?? {};
			for (const entry of this.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) defs[seen.defId] = seen.def;
			}
			if (params.external) {} else if (Object.keys(defs).length > 0) if (this.target === "draft-2020-12") result.$defs = defs;
			else result.definitions = defs;
			try {
				return JSON.parse(JSON.stringify(result));
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
	};
	function toJSONSchema(input, _params) {
		if (input instanceof $ZodRegistry) {
			const gen = new JSONSchemaGenerator(_params);
			const defs = {};
			for (const entry of input._idmap.entries()) {
				const [_, schema] = entry;
				gen.process(schema);
			}
			const schemas = {};
			const external = {
				registry: input,
				uri: _params?.uri,
				defs
			};
			for (const entry of input._idmap.entries()) {
				const [key, schema] = entry;
				schemas[key] = gen.emit(schema, {
					..._params,
					external
				});
			}
			if (Object.keys(defs).length > 0) schemas.__shared = { [gen.target === "draft-2020-12" ? "$defs" : "definitions"]: defs };
			return { schemas };
		}
		const gen = new JSONSchemaGenerator(_params);
		gen.process(input);
		return gen.emit(input, _params);
	}
	function isTransforming(_schema, _ctx) {
		const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
		if (ctx.seen.has(_schema)) return false;
		ctx.seen.add(_schema);
		const def = _schema._zod.def;
		switch (def.type) {
			case "string":
			case "number":
			case "bigint":
			case "boolean":
			case "date":
			case "symbol":
			case "undefined":
			case "null":
			case "any":
			case "unknown":
			case "never":
			case "void":
			case "literal":
			case "enum":
			case "nan":
			case "file":
			case "template_literal": return false;
			case "array": return isTransforming(def.element, ctx);
			case "object":
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			case "union":
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			case "intersection": return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			case "tuple":
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			case "record": return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			case "map": return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			case "set": return isTransforming(def.valueType, ctx);
			case "promise":
			case "optional":
			case "nonoptional":
			case "nullable":
			case "readonly": return isTransforming(def.innerType, ctx);
			case "lazy": return isTransforming(def.getter(), ctx);
			case "default": return isTransforming(def.innerType, ctx);
			case "prefault": return isTransforming(def.innerType, ctx);
			case "custom": return false;
			case "transform": return true;
			case "pipe": return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			case "success": return false;
			case "catch": return false;
			default:
		}
		throw new Error(`Unknown schema type: ${def.type}`);
	}

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/mini/schemas.js
	const ZodMiniType = /* @__PURE__ */ $constructor("ZodMiniType", (inst, def) => {
		if (!inst._zod) throw new Error("Uninitialized schema in ZodMiniType.");
		$ZodType.init(inst, def);
		inst.def = def;
		inst.parse = (data, params) => parse$1(inst, data, params, { callee: inst.parse });
		inst.safeParse = (data, params) => safeParse$2(inst, data, params);
		inst.parseAsync = async (data, params) => parseAsync$1(inst, data, params, { callee: inst.parseAsync });
		inst.safeParseAsync = async (data, params) => safeParseAsync$2(inst, data, params);
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
		inst.clone = (_def, params) => clone(inst, _def, params);
		inst.brand = () => inst;
		inst.register = ((reg, meta) => {
			reg.add(inst, meta);
			return inst;
		});
	});
	const ZodMiniObject = /* @__PURE__ */ $constructor("ZodMiniObject", (inst, def) => {
		$ZodObject.init(inst, def);
		ZodMiniType.init(inst, def);
		defineLazy(inst, "shape", () => def.shape);
	});
	function object$1(shape, params) {
		return new ZodMiniObject({
			type: "object",
			get shape() {
				assignProp(this, "shape", { ...shape });
				return this.shape;
			},
			...normalizeParams(params)
		});
	}

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/classic/iso.js
	const ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
		$ZodISODateTime.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	function datetime(params) {
		return _isoDateTime(ZodISODateTime, params);
	}
	const ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
		$ZodISODate.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	function date$1(params) {
		return _isoDate(ZodISODate, params);
	}
	const ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
		$ZodISOTime.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	function time$1(params) {
		return _isoTime(ZodISOTime, params);
	}
	const ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
		$ZodISODuration.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	function duration(params) {
		return _isoDuration(ZodISODuration, params);
	}

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/classic/errors.js
	const initializer = (inst, issues) => {
		$ZodError.init(inst, issues);
		inst.name = "ZodError";
		Object.defineProperties(inst, {
			format: { value: (mapper) => formatError(inst, mapper) },
			flatten: { value: (mapper) => flattenError(inst, mapper) },
			addIssue: { value: (issue) => inst.issues.push(issue) },
			addIssues: { value: (issues) => inst.issues.push(...issues) },
			isEmpty: { get() {
				return inst.issues.length === 0;
			} }
		});
	};
	const ZodError = $constructor("ZodError", initializer);
	const ZodRealError = $constructor("ZodError", initializer, { Parent: Error });

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/classic/parse.js
	const parse = /* @__PURE__ */ _parse(ZodRealError);
	const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
	const safeParse$1 = /* @__PURE__ */ _safeParse(ZodRealError);
	const safeParseAsync$1 = /* @__PURE__ */ _safeParseAsync(ZodRealError);

//#endregion
//#region node_modules/.pnpm/zod@3.25.76/node_modules/zod/v4/classic/schemas.js
	const ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
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
	const _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
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
	const ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
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
		inst.date = (params) => inst.check(date$1(params));
		inst.time = (params) => inst.check(time$1(params));
		inst.duration = (params) => inst.check(duration(params));
	});
	function string(params) {
		return _string(ZodString, params);
	}
	const ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
		$ZodStringFormat.init(inst, def);
		_ZodString.init(inst, def);
	});
	const ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
		$ZodEmail.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
		$ZodGUID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
		$ZodUUID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
		$ZodURL.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
		$ZodEmoji.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
		$ZodNanoID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
		$ZodCUID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
		$ZodCUID2.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
		$ZodULID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
		$ZodXID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
		$ZodKSUID.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
		$ZodIPv4.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
		$ZodIPv6.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
		$ZodCIDRv4.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
		$ZodCIDRv6.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
		$ZodBase64.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
		$ZodBase64URL.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
		$ZodE164.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
		$ZodJWT.init(inst, def);
		ZodStringFormat.init(inst, def);
	});
	const ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
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
	const ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
		$ZodNumberFormat.init(inst, def);
		ZodNumber.init(inst, def);
	});
	function int(params) {
		return _int(ZodNumberFormat, params);
	}
	const ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
		$ZodBoolean.init(inst, def);
		ZodType.init(inst, def);
	});
	function boolean(params) {
		return _boolean(ZodBoolean, params);
	}
	const ZodNull = /* @__PURE__ */ $constructor("ZodNull", (inst, def) => {
		$ZodNull.init(inst, def);
		ZodType.init(inst, def);
	});
	function _null(params) {
		return _null$1(ZodNull, params);
	}
	const ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
		$ZodUnknown.init(inst, def);
		ZodType.init(inst, def);
	});
	function unknown() {
		return _unknown(ZodUnknown);
	}
	const ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
		$ZodNever.init(inst, def);
		ZodType.init(inst, def);
	});
	function never(params) {
		return _never(ZodNever, params);
	}
	const ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
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
	const ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
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
	const ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
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
	const ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
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
	const ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
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
	const ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
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
	const ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
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
	const ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
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
	const ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
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
	const ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
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
	const ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
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
	const ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
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
	const ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
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
	const ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
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
	const ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
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
	const ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
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
	const ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
		$ZodReadonly.init(inst, def);
		ZodType.init(inst, def);
	});
	function readonly(innerType) {
		return new ZodReadonly({
			type: "readonly",
			innerType
		});
	}
	const ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
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
	function preprocess(fn, schema) {
		return pipe(transform(fn), schema);
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/Options.js
	const ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");
	const defaultOptions = {
		name: void 0,
		$refStrategy: "root",
		basePath: ["#"],
		effectStrategy: "input",
		pipeStrategy: "all",
		dateStrategy: "format:date-time",
		mapStrategy: "entries",
		removeAdditionalStrategy: "passthrough",
		allowedAdditionalProperties: true,
		rejectedAdditionalProperties: false,
		definitionPath: "definitions",
		target: "jsonSchema7",
		strictUnions: false,
		definitions: {},
		errorMessages: false,
		markdownDescription: false,
		patternStrategy: "escape",
		applyRegexFlags: false,
		emailStrategy: "format:email",
		base64Strategy: "contentEncoding:base64",
		nameStrategy: "ref",
		openAiAnyTypeName: "OpenAiAnyType"
	};
	const getDefaultOptions = (options) => typeof options === "string" ? {
		...defaultOptions,
		name: options
	} : {
		...defaultOptions,
		...options
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/Refs.js
	const getRefs = (options) => {
		const _options = getDefaultOptions(options);
		const currentPath = _options.name !== void 0 ? [
			..._options.basePath,
			_options.definitionPath,
			_options.name
		] : _options.basePath;
		return {
			..._options,
			flags: { hasReferencedOpenAiAnyType: false },
			currentPath,
			propertyPath: void 0,
			seen: new Map(Object.entries(_options.definitions).map(([name, def]) => [def._def, {
				def: def._def,
				path: [
					..._options.basePath,
					_options.definitionPath,
					name
				],
				jsonSchema: void 0
			}]))
		};
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/errorMessages.js
	function addErrorMessage(res, key, errorMessage, refs) {
		if (!refs?.errorMessages) return;
		if (errorMessage) res.errorMessage = {
			...res.errorMessage,
			[key]: errorMessage
		};
	}
	function setResponseValueAndErrors(res, key, value, errorMessage, refs) {
		res[key] = value;
		addErrorMessage(res, key, errorMessage, refs);
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/getRelativePath.js
	const getRelativePath = (pathA, pathB) => {
		let i = 0;
		for (; i < pathA.length && i < pathB.length; i++) if (pathA[i] !== pathB[i]) break;
		return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/any.js
	function parseAnyDef(refs) {
		if (refs.target !== "openAi") return {};
		const anyDefinitionPath = [
			...refs.basePath,
			refs.definitionPath,
			refs.openAiAnyTypeName
		];
		refs.flags.hasReferencedOpenAiAnyType = true;
		return { $ref: refs.$refStrategy === "relative" ? getRelativePath(anyDefinitionPath, refs.currentPath) : anyDefinitionPath.join("/") };
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/array.js
	function parseArrayDef(def, refs) {
		const res = { type: "array" };
		if (def.type?._def && def.type?._def?.typeName !== ZodFirstPartyTypeKind.ZodAny) res.items = parseDef(def.type._def, {
			...refs,
			currentPath: [...refs.currentPath, "items"]
		});
		if (def.minLength) setResponseValueAndErrors(res, "minItems", def.minLength.value, def.minLength.message, refs);
		if (def.maxLength) setResponseValueAndErrors(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
		if (def.exactLength) {
			setResponseValueAndErrors(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
			setResponseValueAndErrors(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
		}
		return res;
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/bigint.js
	function parseBigintDef(def, refs) {
		const res = {
			type: "integer",
			format: "int64"
		};
		if (!def.checks) return res;
		for (const check of def.checks) switch (check.kind) {
			case "min":
				if (refs.target === "jsonSchema7") if (check.inclusive) setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
				else setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
				else {
					if (!check.inclusive) res.exclusiveMinimum = true;
					setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
				}
				break;
			case "max":
				if (refs.target === "jsonSchema7") if (check.inclusive) setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
				else setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
				else {
					if (!check.inclusive) res.exclusiveMaximum = true;
					setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
				}
				break;
			case "multipleOf":
				setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
				break;
		}
		return res;
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/boolean.js
	function parseBooleanDef() {
		return { type: "boolean" };
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/branded.js
	function parseBrandedDef(_def, refs) {
		return parseDef(_def.type._def, refs);
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/catch.js
	const parseCatchDef = (def, refs) => {
		return parseDef(def.innerType._def, refs);
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/date.js
	function parseDateDef(def, refs, overrideDateStrategy) {
		const strategy = overrideDateStrategy ?? refs.dateStrategy;
		if (Array.isArray(strategy)) return { anyOf: strategy.map((item, i) => parseDateDef(def, refs, item)) };
		switch (strategy) {
			case "string":
			case "format:date-time": return {
				type: "string",
				format: "date-time"
			};
			case "format:date": return {
				type: "string",
				format: "date"
			};
			case "integer": return integerDateParser(def, refs);
		}
	}
	const integerDateParser = (def, refs) => {
		const res = {
			type: "integer",
			format: "unix-time"
		};
		if (refs.target === "openApi3") return res;
		for (const check of def.checks) switch (check.kind) {
			case "min":
				setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
				break;
			case "max":
				setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
				break;
		}
		return res;
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/default.js
	function parseDefaultDef(_def, refs) {
		return {
			...parseDef(_def.innerType._def, refs),
			default: _def.defaultValue()
		};
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/effects.js
	function parseEffectsDef(_def, refs) {
		return refs.effectStrategy === "input" ? parseDef(_def.schema._def, refs) : parseAnyDef(refs);
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/enum.js
	function parseEnumDef(def) {
		return {
			type: "string",
			enum: Array.from(def.values)
		};
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/intersection.js
	const isJsonSchema7AllOfType = (type) => {
		if ("type" in type && type.type === "string") return false;
		return "allOf" in type;
	};
	function parseIntersectionDef(def, refs) {
		const allOf = [parseDef(def.left._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"allOf",
				"0"
			]
		}), parseDef(def.right._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"allOf",
				"1"
			]
		})].filter((x) => !!x);
		let unevaluatedProperties = refs.target === "jsonSchema2019-09" ? { unevaluatedProperties: false } : void 0;
		const mergedAllOf = [];
		allOf.forEach((schema) => {
			if (isJsonSchema7AllOfType(schema)) {
				mergedAllOf.push(...schema.allOf);
				if (schema.unevaluatedProperties === void 0) unevaluatedProperties = void 0;
			} else {
				let nestedSchema = schema;
				if ("additionalProperties" in schema && schema.additionalProperties === false) {
					const { additionalProperties, ...rest } = schema;
					nestedSchema = rest;
				} else unevaluatedProperties = void 0;
				mergedAllOf.push(nestedSchema);
			}
		});
		return mergedAllOf.length ? {
			allOf: mergedAllOf,
			...unevaluatedProperties
		} : void 0;
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/literal.js
	function parseLiteralDef(def, refs) {
		const parsedType = typeof def.value;
		if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") return { type: Array.isArray(def.value) ? "array" : "object" };
		if (refs.target === "openApi3") return {
			type: parsedType === "bigint" ? "integer" : parsedType,
			enum: [def.value]
		};
		return {
			type: parsedType === "bigint" ? "integer" : parsedType,
			const: def.value
		};
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/string.js
	let emojiRegex = void 0;
	/**
	* Generated from the regular expressions found here as of 2024-05-22:
	* https://github.com/colinhacks/zod/blob/master/src/types.ts.
	*
	* Expressions with /i flag have been changed accordingly.
	*/
	const zodPatterns = {
		cuid: /^[cC][^\s-]{8,}$/,
		cuid2: /^[0-9a-z]+$/,
		ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
		email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
		emoji: () => {
			if (emojiRegex === void 0) emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
			return emojiRegex;
		},
		uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
		ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
		ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
		ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
		ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
		base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
		base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
		nanoid: /^[a-zA-Z0-9_-]{21}$/,
		jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
	};
	function parseStringDef(def, refs) {
		const res = { type: "string" };
		if (def.checks) for (const check of def.checks) switch (check.kind) {
			case "min":
				setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
				break;
			case "max":
				setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
				break;
			case "email":
				switch (refs.emailStrategy) {
					case "format:email":
						addFormat(res, "email", check.message, refs);
						break;
					case "format:idn-email":
						addFormat(res, "idn-email", check.message, refs);
						break;
					case "pattern:zod":
						addPattern(res, zodPatterns.email, check.message, refs);
						break;
				}
				break;
			case "url":
				addFormat(res, "uri", check.message, refs);
				break;
			case "uuid":
				addFormat(res, "uuid", check.message, refs);
				break;
			case "regex":
				addPattern(res, check.regex, check.message, refs);
				break;
			case "cuid":
				addPattern(res, zodPatterns.cuid, check.message, refs);
				break;
			case "cuid2":
				addPattern(res, zodPatterns.cuid2, check.message, refs);
				break;
			case "startsWith":
				addPattern(res, RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`), check.message, refs);
				break;
			case "endsWith":
				addPattern(res, RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`), check.message, refs);
				break;
			case "datetime":
				addFormat(res, "date-time", check.message, refs);
				break;
			case "date":
				addFormat(res, "date", check.message, refs);
				break;
			case "time":
				addFormat(res, "time", check.message, refs);
				break;
			case "duration":
				addFormat(res, "duration", check.message, refs);
				break;
			case "length":
				setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
				setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
				break;
			case "includes":
				addPattern(res, RegExp(escapeLiteralCheckValue(check.value, refs)), check.message, refs);
				break;
			case "ip":
				if (check.version !== "v6") addFormat(res, "ipv4", check.message, refs);
				if (check.version !== "v4") addFormat(res, "ipv6", check.message, refs);
				break;
			case "base64url":
				addPattern(res, zodPatterns.base64url, check.message, refs);
				break;
			case "jwt":
				addPattern(res, zodPatterns.jwt, check.message, refs);
				break;
			case "cidr":
				if (check.version !== "v6") addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
				if (check.version !== "v4") addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
				break;
			case "emoji":
				addPattern(res, zodPatterns.emoji(), check.message, refs);
				break;
			case "ulid":
				addPattern(res, zodPatterns.ulid, check.message, refs);
				break;
			case "base64":
				switch (refs.base64Strategy) {
					case "format:binary":
						addFormat(res, "binary", check.message, refs);
						break;
					case "contentEncoding:base64":
						setResponseValueAndErrors(res, "contentEncoding", "base64", check.message, refs);
						break;
					case "pattern:zod":
						addPattern(res, zodPatterns.base64, check.message, refs);
						break;
				}
				break;
			case "nanoid": addPattern(res, zodPatterns.nanoid, check.message, refs);
			case "toLowerCase":
			case "toUpperCase":
			case "trim": break;
			default: ((_) => {})(check);
		}
		return res;
	}
	function escapeLiteralCheckValue(literal, refs) {
		return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
	}
	const ALPHA_NUMERIC = /* @__PURE__ */ new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
	function escapeNonAlphaNumeric(source) {
		let result = "";
		for (let i = 0; i < source.length; i++) {
			if (!ALPHA_NUMERIC.has(source[i])) result += "\\";
			result += source[i];
		}
		return result;
	}
	function addFormat(schema, value, message, refs) {
		if (schema.format || schema.anyOf?.some((x) => x.format)) {
			if (!schema.anyOf) schema.anyOf = [];
			if (schema.format) {
				schema.anyOf.push({
					format: schema.format,
					...schema.errorMessage && refs.errorMessages && { errorMessage: { format: schema.errorMessage.format } }
				});
				delete schema.format;
				if (schema.errorMessage) {
					delete schema.errorMessage.format;
					if (Object.keys(schema.errorMessage).length === 0) delete schema.errorMessage;
				}
			}
			schema.anyOf.push({
				format: value,
				...message && refs.errorMessages && { errorMessage: { format: message } }
			});
		} else setResponseValueAndErrors(schema, "format", value, message, refs);
	}
	function addPattern(schema, regex, message, refs) {
		if (schema.pattern || schema.allOf?.some((x) => x.pattern)) {
			if (!schema.allOf) schema.allOf = [];
			if (schema.pattern) {
				schema.allOf.push({
					pattern: schema.pattern,
					...schema.errorMessage && refs.errorMessages && { errorMessage: { pattern: schema.errorMessage.pattern } }
				});
				delete schema.pattern;
				if (schema.errorMessage) {
					delete schema.errorMessage.pattern;
					if (Object.keys(schema.errorMessage).length === 0) delete schema.errorMessage;
				}
			}
			schema.allOf.push({
				pattern: stringifyRegExpWithFlags(regex, refs),
				...message && refs.errorMessages && { errorMessage: { pattern: message } }
			});
		} else setResponseValueAndErrors(schema, "pattern", stringifyRegExpWithFlags(regex, refs), message, refs);
	}
	function stringifyRegExpWithFlags(regex, refs) {
		if (!refs.applyRegexFlags || !regex.flags) return regex.source;
		const flags = {
			i: regex.flags.includes("i"),
			m: regex.flags.includes("m"),
			s: regex.flags.includes("s")
		};
		const source = flags.i ? regex.source.toLowerCase() : regex.source;
		let pattern = "";
		let isEscaped = false;
		let inCharGroup = false;
		let inCharRange = false;
		for (let i = 0; i < source.length; i++) {
			if (isEscaped) {
				pattern += source[i];
				isEscaped = false;
				continue;
			}
			if (flags.i) {
				if (inCharGroup) {
					if (source[i].match(/[a-z]/)) {
						if (inCharRange) {
							pattern += source[i];
							pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
							inCharRange = false;
						} else if (source[i + 1] === "-" && source[i + 2]?.match(/[a-z]/)) {
							pattern += source[i];
							inCharRange = true;
						} else pattern += `${source[i]}${source[i].toUpperCase()}`;
						continue;
					}
				} else if (source[i].match(/[a-z]/)) {
					pattern += `[${source[i]}${source[i].toUpperCase()}]`;
					continue;
				}
			}
			if (flags.m) {
				if (source[i] === "^") {
					pattern += `(^|(?<=[\r\n]))`;
					continue;
				} else if (source[i] === "$") {
					pattern += `($|(?=[\r\n]))`;
					continue;
				}
			}
			if (flags.s && source[i] === ".") {
				pattern += inCharGroup ? `${source[i]}\r\n` : `[${source[i]}\r\n]`;
				continue;
			}
			pattern += source[i];
			if (source[i] === "\\") isEscaped = true;
			else if (inCharGroup && source[i] === "]") inCharGroup = false;
			else if (!inCharGroup && source[i] === "[") inCharGroup = true;
		}
		try {
			new RegExp(pattern);
		} catch {
			console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);
			return regex.source;
		}
		return pattern;
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/record.js
	function parseRecordDef(def, refs) {
		if (refs.target === "openAi") console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.");
		if (refs.target === "openApi3" && def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodEnum) return {
			type: "object",
			required: def.keyType._def.values,
			properties: def.keyType._def.values.reduce((acc, key) => ({
				...acc,
				[key]: parseDef(def.valueType._def, {
					...refs,
					currentPath: [
						...refs.currentPath,
						"properties",
						key
					]
				}) ?? parseAnyDef(refs)
			}), {}),
			additionalProperties: refs.rejectedAdditionalProperties
		};
		const schema = {
			type: "object",
			additionalProperties: parseDef(def.valueType._def, {
				...refs,
				currentPath: [...refs.currentPath, "additionalProperties"]
			}) ?? refs.allowedAdditionalProperties
		};
		if (refs.target === "openApi3") return schema;
		if (def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodString && def.keyType._def.checks?.length) {
			const { type, ...keyType } = parseStringDef(def.keyType._def, refs);
			return {
				...schema,
				propertyNames: keyType
			};
		} else if (def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodEnum) return {
			...schema,
			propertyNames: { enum: def.keyType._def.values }
		};
		else if (def.keyType?._def.typeName === ZodFirstPartyTypeKind.ZodBranded && def.keyType._def.type._def.typeName === ZodFirstPartyTypeKind.ZodString && def.keyType._def.type._def.checks?.length) {
			const { type, ...keyType } = parseBrandedDef(def.keyType._def, refs);
			return {
				...schema,
				propertyNames: keyType
			};
		}
		return schema;
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/map.js
	function parseMapDef(def, refs) {
		if (refs.mapStrategy === "record") return parseRecordDef(def, refs);
		return {
			type: "array",
			maxItems: 125,
			items: {
				type: "array",
				items: [parseDef(def.keyType._def, {
					...refs,
					currentPath: [
						...refs.currentPath,
						"items",
						"items",
						"0"
					]
				}) || parseAnyDef(refs), parseDef(def.valueType._def, {
					...refs,
					currentPath: [
						...refs.currentPath,
						"items",
						"items",
						"1"
					]
				}) || parseAnyDef(refs)],
				minItems: 2,
				maxItems: 2
			}
		};
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/nativeEnum.js
	function parseNativeEnumDef(def) {
		const object = def.values;
		const actualValues = Object.keys(def.values).filter((key) => {
			return typeof object[object[key]] !== "number";
		}).map((key) => object[key]);
		const parsedTypes = Array.from(new Set(actualValues.map((values) => typeof values)));
		return {
			type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
			enum: actualValues
		};
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/never.js
	function parseNeverDef(refs) {
		return refs.target === "openAi" ? void 0 : { not: parseAnyDef({
			...refs,
			currentPath: [...refs.currentPath, "not"]
		}) };
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/null.js
	function parseNullDef(refs) {
		return refs.target === "openApi3" ? {
			enum: ["null"],
			nullable: true
		} : { type: "null" };
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/union.js
	const primitiveMappings = {
		ZodString: "string",
		ZodNumber: "number",
		ZodBigInt: "integer",
		ZodBoolean: "boolean",
		ZodNull: "null"
	};
	function parseUnionDef(def, refs) {
		if (refs.target === "openApi3") return asAnyOf(def, refs);
		const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
		if (options.every((x) => x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
			const types = options.reduce((types, x) => {
				const type = primitiveMappings[x._def.typeName];
				return type && !types.includes(type) ? [...types, type] : types;
			}, []);
			return { type: types.length > 1 ? types : types[0] };
		} else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
			const types = options.reduce((acc, x) => {
				const type = typeof x._def.value;
				switch (type) {
					case "string":
					case "number":
					case "boolean": return [...acc, type];
					case "bigint": return [...acc, "integer"];
					case "object": if (x._def.value === null) return [...acc, "null"];
					default: return acc;
				}
			}, []);
			if (types.length === options.length) {
				const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
				return {
					type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
					enum: options.reduce((acc, x) => {
						return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
					}, [])
				};
			}
		} else if (options.every((x) => x._def.typeName === "ZodEnum")) return {
			type: "string",
			enum: options.reduce((acc, x) => [...acc, ...x._def.values.filter((x) => !acc.includes(x))], [])
		};
		return asAnyOf(def, refs);
	}
	const asAnyOf = (def, refs) => {
		const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i) => parseDef(x._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"anyOf",
				`${i}`
			]
		})).filter((x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
		return anyOf.length ? { anyOf } : void 0;
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/nullable.js
	function parseNullableDef(def, refs) {
		if ([
			"ZodString",
			"ZodNumber",
			"ZodBigInt",
			"ZodBoolean",
			"ZodNull"
		].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
			if (refs.target === "openApi3") return {
				type: primitiveMappings[def.innerType._def.typeName],
				nullable: true
			};
			return { type: [primitiveMappings[def.innerType._def.typeName], "null"] };
		}
		if (refs.target === "openApi3") {
			const base = parseDef(def.innerType._def, {
				...refs,
				currentPath: [...refs.currentPath]
			});
			if (base && "$ref" in base) return {
				allOf: [base],
				nullable: true
			};
			return base && {
				...base,
				nullable: true
			};
		}
		const base = parseDef(def.innerType._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"anyOf",
				"0"
			]
		});
		return base && { anyOf: [base, { type: "null" }] };
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/number.js
	function parseNumberDef(def, refs) {
		const res = { type: "number" };
		if (!def.checks) return res;
		for (const check of def.checks) switch (check.kind) {
			case "int":
				res.type = "integer";
				addErrorMessage(res, "type", check.message, refs);
				break;
			case "min":
				if (refs.target === "jsonSchema7") if (check.inclusive) setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
				else setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
				else {
					if (!check.inclusive) res.exclusiveMinimum = true;
					setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
				}
				break;
			case "max":
				if (refs.target === "jsonSchema7") if (check.inclusive) setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
				else setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
				else {
					if (!check.inclusive) res.exclusiveMaximum = true;
					setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
				}
				break;
			case "multipleOf":
				setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
				break;
		}
		return res;
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/object.js
	function parseObjectDef(def, refs) {
		const forceOptionalIntoNullable = refs.target === "openAi";
		const result = {
			type: "object",
			properties: {}
		};
		const required = [];
		const shape = def.shape();
		for (const propName in shape) {
			let propDef = shape[propName];
			if (propDef === void 0 || propDef._def === void 0) continue;
			let propOptional = safeIsOptional(propDef);
			if (propOptional && forceOptionalIntoNullable) {
				if (propDef._def.typeName === "ZodOptional") propDef = propDef._def.innerType;
				if (!propDef.isNullable()) propDef = propDef.nullable();
				propOptional = false;
			}
			const parsedDef = parseDef(propDef._def, {
				...refs,
				currentPath: [
					...refs.currentPath,
					"properties",
					propName
				],
				propertyPath: [
					...refs.currentPath,
					"properties",
					propName
				]
			});
			if (parsedDef === void 0) continue;
			result.properties[propName] = parsedDef;
			if (!propOptional) required.push(propName);
		}
		if (required.length) result.required = required;
		const additionalProperties = decideAdditionalProperties(def, refs);
		if (additionalProperties !== void 0) result.additionalProperties = additionalProperties;
		return result;
	}
	function decideAdditionalProperties(def, refs) {
		if (def.catchall._def.typeName !== "ZodNever") return parseDef(def.catchall._def, {
			...refs,
			currentPath: [...refs.currentPath, "additionalProperties"]
		});
		switch (def.unknownKeys) {
			case "passthrough": return refs.allowedAdditionalProperties;
			case "strict": return refs.rejectedAdditionalProperties;
			case "strip": return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
		}
	}
	function safeIsOptional(schema) {
		try {
			return schema.isOptional();
		} catch {
			return true;
		}
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/optional.js
	const parseOptionalDef = (def, refs) => {
		if (refs.currentPath.toString() === refs.propertyPath?.toString()) return parseDef(def.innerType._def, refs);
		const innerSchema = parseDef(def.innerType._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"anyOf",
				"1"
			]
		});
		return innerSchema ? { anyOf: [{ not: parseAnyDef(refs) }, innerSchema] } : parseAnyDef(refs);
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/pipeline.js
	const parsePipelineDef = (def, refs) => {
		if (refs.pipeStrategy === "input") return parseDef(def.in._def, refs);
		else if (refs.pipeStrategy === "output") return parseDef(def.out._def, refs);
		const a = parseDef(def.in._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"allOf",
				"0"
			]
		});
		return { allOf: [a, parseDef(def.out._def, {
			...refs,
			currentPath: [
				...refs.currentPath,
				"allOf",
				a ? "1" : "0"
			]
		})].filter((x) => x !== void 0) };
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/promise.js
	function parsePromiseDef(def, refs) {
		return parseDef(def.type._def, refs);
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/set.js
	function parseSetDef(def, refs) {
		const schema = {
			type: "array",
			uniqueItems: true,
			items: parseDef(def.valueType._def, {
				...refs,
				currentPath: [...refs.currentPath, "items"]
			})
		};
		if (def.minSize) setResponseValueAndErrors(schema, "minItems", def.minSize.value, def.minSize.message, refs);
		if (def.maxSize) setResponseValueAndErrors(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
		return schema;
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/tuple.js
	function parseTupleDef(def, refs) {
		if (def.rest) return {
			type: "array",
			minItems: def.items.length,
			items: def.items.map((x, i) => parseDef(x._def, {
				...refs,
				currentPath: [
					...refs.currentPath,
					"items",
					`${i}`
				]
			})).reduce((acc, x) => x === void 0 ? acc : [...acc, x], []),
			additionalItems: parseDef(def.rest._def, {
				...refs,
				currentPath: [...refs.currentPath, "additionalItems"]
			})
		};
		else return {
			type: "array",
			minItems: def.items.length,
			maxItems: def.items.length,
			items: def.items.map((x, i) => parseDef(x._def, {
				...refs,
				currentPath: [
					...refs.currentPath,
					"items",
					`${i}`
				]
			})).reduce((acc, x) => x === void 0 ? acc : [...acc, x], [])
		};
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/undefined.js
	function parseUndefinedDef(refs) {
		return { not: parseAnyDef(refs) };
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/unknown.js
	function parseUnknownDef(refs) {
		return parseAnyDef(refs);
	}

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parsers/readonly.js
	const parseReadonlyDef = (def, refs) => {
		return parseDef(def.innerType._def, refs);
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/selectParser.js
	const selectParser = (def, typeName, refs) => {
		switch (typeName) {
			case ZodFirstPartyTypeKind.ZodString: return parseStringDef(def, refs);
			case ZodFirstPartyTypeKind.ZodNumber: return parseNumberDef(def, refs);
			case ZodFirstPartyTypeKind.ZodObject: return parseObjectDef(def, refs);
			case ZodFirstPartyTypeKind.ZodBigInt: return parseBigintDef(def, refs);
			case ZodFirstPartyTypeKind.ZodBoolean: return parseBooleanDef();
			case ZodFirstPartyTypeKind.ZodDate: return parseDateDef(def, refs);
			case ZodFirstPartyTypeKind.ZodUndefined: return parseUndefinedDef(refs);
			case ZodFirstPartyTypeKind.ZodNull: return parseNullDef(refs);
			case ZodFirstPartyTypeKind.ZodArray: return parseArrayDef(def, refs);
			case ZodFirstPartyTypeKind.ZodUnion:
			case ZodFirstPartyTypeKind.ZodDiscriminatedUnion: return parseUnionDef(def, refs);
			case ZodFirstPartyTypeKind.ZodIntersection: return parseIntersectionDef(def, refs);
			case ZodFirstPartyTypeKind.ZodTuple: return parseTupleDef(def, refs);
			case ZodFirstPartyTypeKind.ZodRecord: return parseRecordDef(def, refs);
			case ZodFirstPartyTypeKind.ZodLiteral: return parseLiteralDef(def, refs);
			case ZodFirstPartyTypeKind.ZodEnum: return parseEnumDef(def);
			case ZodFirstPartyTypeKind.ZodNativeEnum: return parseNativeEnumDef(def);
			case ZodFirstPartyTypeKind.ZodNullable: return parseNullableDef(def, refs);
			case ZodFirstPartyTypeKind.ZodOptional: return parseOptionalDef(def, refs);
			case ZodFirstPartyTypeKind.ZodMap: return parseMapDef(def, refs);
			case ZodFirstPartyTypeKind.ZodSet: return parseSetDef(def, refs);
			case ZodFirstPartyTypeKind.ZodLazy: return () => def.getter()._def;
			case ZodFirstPartyTypeKind.ZodPromise: return parsePromiseDef(def, refs);
			case ZodFirstPartyTypeKind.ZodNaN:
			case ZodFirstPartyTypeKind.ZodNever: return parseNeverDef(refs);
			case ZodFirstPartyTypeKind.ZodEffects: return parseEffectsDef(def, refs);
			case ZodFirstPartyTypeKind.ZodAny: return parseAnyDef(refs);
			case ZodFirstPartyTypeKind.ZodUnknown: return parseUnknownDef(refs);
			case ZodFirstPartyTypeKind.ZodDefault: return parseDefaultDef(def, refs);
			case ZodFirstPartyTypeKind.ZodBranded: return parseBrandedDef(def, refs);
			case ZodFirstPartyTypeKind.ZodReadonly: return parseReadonlyDef(def, refs);
			case ZodFirstPartyTypeKind.ZodCatch: return parseCatchDef(def, refs);
			case ZodFirstPartyTypeKind.ZodPipeline: return parsePipelineDef(def, refs);
			case ZodFirstPartyTypeKind.ZodFunction:
			case ZodFirstPartyTypeKind.ZodVoid:
			case ZodFirstPartyTypeKind.ZodSymbol: return;
			default: return ((_) => void 0)(typeName);
		}
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/parseDef.js
	function parseDef(def, refs, forceResolution = false) {
		const seenItem = refs.seen.get(def);
		if (refs.override) {
			const overrideResult = refs.override?.(def, refs, seenItem, forceResolution);
			if (overrideResult !== ignoreOverride) return overrideResult;
		}
		if (seenItem && !forceResolution) {
			const seenSchema = get$ref(seenItem, refs);
			if (seenSchema !== void 0) return seenSchema;
		}
		const newItem = {
			def,
			path: refs.currentPath,
			jsonSchema: void 0
		};
		refs.seen.set(def, newItem);
		const jsonSchemaOrGetter = selectParser(def, def.typeName, refs);
		const jsonSchema = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
		if (jsonSchema) addMeta(def, refs, jsonSchema);
		if (refs.postProcess) {
			const postProcessResult = refs.postProcess(jsonSchema, def, refs);
			newItem.jsonSchema = jsonSchema;
			return postProcessResult;
		}
		newItem.jsonSchema = jsonSchema;
		return jsonSchema;
	}
	const get$ref = (item, refs) => {
		switch (refs.$refStrategy) {
			case "root": return { $ref: item.path.join("/") };
			case "relative": return { $ref: getRelativePath(refs.currentPath, item.path) };
			case "none":
			case "seen":
				if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
					console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
					return parseAnyDef(refs);
				}
				return refs.$refStrategy === "seen" ? parseAnyDef(refs) : void 0;
		}
	};
	const addMeta = (def, refs, jsonSchema) => {
		if (def.description) {
			jsonSchema.description = def.description;
			if (refs.markdownDescription) jsonSchema.markdownDescription = def.description;
		}
		return jsonSchema;
	};

//#endregion
//#region node_modules/.pnpm/zod-to-json-schema@3.25.1_zod@3.25.76/node_modules/zod-to-json-schema/dist/esm/zodToJsonSchema.js
	const zodToJsonSchema = (schema, options) => {
		const refs = getRefs(options);
		let definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name, schema]) => ({
			...acc,
			[name]: parseDef(schema._def, {
				...refs,
				currentPath: [
					...refs.basePath,
					refs.definitionPath,
					name
				]
			}, true) ?? parseAnyDef(refs)
		}), {}) : void 0;
		const name = typeof options === "string" ? options : options?.nameStrategy === "title" ? void 0 : options?.name;
		const main = parseDef(schema._def, name === void 0 ? refs : {
			...refs,
			currentPath: [
				...refs.basePath,
				refs.definitionPath,
				name
			]
		}, false) ?? parseAnyDef(refs);
		const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
		if (title !== void 0) main.title = title;
		if (refs.flags.hasReferencedOpenAiAnyType) {
			if (!definitions) definitions = {};
			if (!definitions[refs.openAiAnyTypeName]) definitions[refs.openAiAnyTypeName] = {
				type: [
					"string",
					"number",
					"integer",
					"boolean",
					"array",
					"null"
				],
				items: { $ref: refs.$refStrategy === "relative" ? "1" : [
					...refs.basePath,
					refs.definitionPath,
					refs.openAiAnyTypeName
				].join("/") }
			};
		}
		const combined = name === void 0 ? definitions ? {
			...main,
			[refs.definitionPath]: definitions
		} : main : {
			$ref: [
				...refs.$refStrategy === "relative" ? [] : refs.basePath,
				refs.definitionPath,
				name
			].join("/"),
			[refs.definitionPath]: {
				...definitions,
				[name]: main
			}
		};
		if (refs.target === "jsonSchema7") combined.$schema = "http://json-schema.org/draft-07/schema#";
		else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
		if (refs.target === "openAi" && ("anyOf" in combined || "oneOf" in combined || "allOf" in combined || "type" in combined && Array.isArray(combined.type))) console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.");
		return combined;
	};

//#endregion
//#region node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/deep-compare-strict.js
	function deepCompareStrict(a, b) {
		const typeofa = typeof a;
		if (typeofa !== typeof b) return false;
		if (Array.isArray(a)) {
			if (!Array.isArray(b)) return false;
			const length = a.length;
			if (length !== b.length) return false;
			for (let i = 0; i < length; i++) if (!deepCompareStrict(a[i], b[i])) return false;
			return true;
		}
		if (typeofa === "object") {
			if (!a || !b) return a === b;
			const aKeys = Object.keys(a);
			const bKeys = Object.keys(b);
			if (aKeys.length !== bKeys.length) return false;
			for (const k of aKeys) if (!deepCompareStrict(a[k], b[k])) return false;
			return true;
		}
		return a === b;
	}

//#endregion
//#region node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/pointer.js
	function encodePointer(p) {
		return encodeURI(escapePointer(p));
	}
	function escapePointer(p) {
		return p.replace(/~/g, "~0").replace(/\//g, "~1");
	}

//#endregion
//#region node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/dereference.js
	const schemaArrayKeyword = {
		prefixItems: true,
		items: true,
		allOf: true,
		anyOf: true,
		oneOf: true
	};
	const schemaMapKeyword = {
		$defs: true,
		definitions: true,
		properties: true,
		patternProperties: true,
		dependentSchemas: true
	};
	const ignoredKeyword = {
		id: true,
		$id: true,
		$ref: true,
		$schema: true,
		$anchor: true,
		$vocabulary: true,
		$comment: true,
		default: true,
		enum: true,
		const: true,
		required: true,
		type: true,
		maximum: true,
		minimum: true,
		exclusiveMaximum: true,
		exclusiveMinimum: true,
		multipleOf: true,
		maxLength: true,
		minLength: true,
		pattern: true,
		format: true,
		maxItems: true,
		minItems: true,
		uniqueItems: true,
		maxProperties: true,
		minProperties: true
	};
	let initialBaseURI = typeof self !== "undefined" && self.location && self.location.origin !== "null" ? new URL(self.location.origin + self.location.pathname + location.search) : new URL("https://github.com/cfworker");
	function dereference(schema, lookup = Object.create(null), baseURI = initialBaseURI, basePointer = "") {
		if (schema && typeof schema === "object" && !Array.isArray(schema)) {
			const id = schema.$id || schema.id;
			if (id) {
				const url = new URL(id, baseURI.href);
				if (url.hash.length > 1) lookup[url.href] = schema;
				else {
					url.hash = "";
					if (basePointer === "") baseURI = url;
					else dereference(schema, lookup, baseURI);
				}
			}
		} else if (schema !== true && schema !== false) return lookup;
		const schemaURI = baseURI.href + (basePointer ? "#" + basePointer : "");
		if (lookup[schemaURI] !== void 0) throw new Error(`Duplicate schema URI "${schemaURI}".`);
		lookup[schemaURI] = schema;
		if (schema === true || schema === false) return lookup;
		if (schema.__absolute_uri__ === void 0) Object.defineProperty(schema, "__absolute_uri__", {
			enumerable: false,
			value: schemaURI
		});
		if (schema.$ref && schema.__absolute_ref__ === void 0) {
			const url = new URL(schema.$ref, baseURI.href);
			url.hash = url.hash;
			Object.defineProperty(schema, "__absolute_ref__", {
				enumerable: false,
				value: url.href
			});
		}
		if (schema.$recursiveRef && schema.__absolute_recursive_ref__ === void 0) {
			const url = new URL(schema.$recursiveRef, baseURI.href);
			url.hash = url.hash;
			Object.defineProperty(schema, "__absolute_recursive_ref__", {
				enumerable: false,
				value: url.href
			});
		}
		if (schema.$anchor) {
			const url = new URL("#" + schema.$anchor, baseURI.href);
			lookup[url.href] = schema;
		}
		for (let key in schema) {
			if (ignoredKeyword[key]) continue;
			const keyBase = `${basePointer}/${encodePointer(key)}`;
			const subSchema = schema[key];
			if (Array.isArray(subSchema)) {
				if (schemaArrayKeyword[key]) {
					const length = subSchema.length;
					for (let i = 0; i < length; i++) dereference(subSchema[i], lookup, baseURI, `${keyBase}/${i}`);
				}
			} else if (schemaMapKeyword[key]) for (let subKey in subSchema) dereference(subSchema[subKey], lookup, baseURI, `${keyBase}/${encodePointer(subKey)}`);
			else dereference(subSchema, lookup, baseURI, keyBase);
		}
		return lookup;
	}

//#endregion
//#region node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/format.js
	const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
	const DAYS = [
		0,
		31,
		28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	];
	const TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
	const HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
	const URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	const URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
	const URL_ = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-?)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
	const UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
	const JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
	const JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
	const RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
	const EMAIL = (input) => {
		if (input[0] === "\"") return false;
		const [name, host, ...rest] = input.split("@");
		if (!name || !host || rest.length !== 0 || name.length > 64 || host.length > 253) return false;
		if (name[0] === "." || name.endsWith(".") || name.includes("..")) return false;
		if (!/^[a-z0-9.-]+$/i.test(host) || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(name)) return false;
		return host.split(".").every((part) => /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(part));
	};
	const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
	const IPV6 = /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i;
	const DURATION = (input) => input.length > 1 && input.length < 80 && (/^P\d+([.,]\d+)?W$/.test(input) || /^P[\dYMDTHS]*(\d[.,]\d+)?[YMDHS]$/.test(input) && /^P([.,\d]+Y)?([.,\d]+M)?([.,\d]+D)?(T([.,\d]+H)?([.,\d]+M)?([.,\d]+S)?)?$/.test(input));
	function bind(r) {
		return r.test.bind(r);
	}
	const format = {
		date,
		time: time.bind(void 0, false),
		"date-time": date_time,
		duration: DURATION,
		uri,
		"uri-reference": bind(URIREF),
		"uri-template": bind(URITEMPLATE),
		url: bind(URL_),
		email: EMAIL,
		hostname: bind(HOSTNAME),
		ipv4: bind(IPV4),
		ipv6: bind(IPV6),
		regex,
		uuid: bind(UUID),
		"json-pointer": bind(JSON_POINTER),
		"json-pointer-uri-fragment": bind(JSON_POINTER_URI_FRAGMENT),
		"relative-json-pointer": bind(RELATIVE_JSON_POINTER)
	};
	function isLeapYear(year) {
		return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	}
	function date(str) {
		const matches = str.match(DATE);
		if (!matches) return false;
		const year = +matches[1];
		const month = +matches[2];
		const day = +matches[3];
		return month >= 1 && month <= 12 && day >= 1 && day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
	}
	function time(full, str) {
		const matches = str.match(TIME);
		if (!matches) return false;
		const hour = +matches[1];
		const minute = +matches[2];
		const second = +matches[3];
		const timeZone = !!matches[5];
		return (hour <= 23 && minute <= 59 && second <= 59 || hour == 23 && minute == 59 && second == 60) && (!full || timeZone);
	}
	const DATE_TIME_SEPARATOR = /t|\s/i;
	function date_time(str) {
		const dateTime = str.split(DATE_TIME_SEPARATOR);
		return dateTime.length == 2 && date(dateTime[0]) && time(true, dateTime[1]);
	}
	const NOT_URI_FRAGMENT = /\/|:/;
	const URI_PATTERN = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
	function uri(str) {
		return NOT_URI_FRAGMENT.test(str) && URI_PATTERN.test(str);
	}
	const Z_ANCHOR = /[^\\]\\Z/;
	function regex(str) {
		if (Z_ANCHOR.test(str)) return false;
		try {
			new RegExp(str, "u");
			return true;
		} catch (e) {
			return false;
		}
	}

//#endregion
//#region node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/ucs2-length.js
	function ucs2length(s) {
		let result = 0;
		let length = s.length;
		let index = 0;
		let charCode;
		while (index < length) {
			result++;
			charCode = s.charCodeAt(index++);
			if (charCode >= 55296 && charCode <= 56319 && index < length) {
				charCode = s.charCodeAt(index);
				if ((charCode & 64512) == 56320) index++;
			}
		}
		return result;
	}

//#endregion
//#region node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validate.js
	function validate(instance, schema, draft = "2019-09", lookup = dereference(schema), shortCircuit = true, recursiveAnchor = null, instanceLocation = "#", schemaLocation = "#", evaluated = Object.create(null)) {
		if (schema === true) return {
			valid: true,
			errors: []
		};
		if (schema === false) return {
			valid: false,
			errors: [{
				instanceLocation,
				keyword: "false",
				keywordLocation: instanceLocation,
				error: "False boolean schema."
			}]
		};
		const rawInstanceType = typeof instance;
		let instanceType;
		switch (rawInstanceType) {
			case "boolean":
			case "number":
			case "string":
				instanceType = rawInstanceType;
				break;
			case "object":
				if (instance === null) instanceType = "null";
				else if (Array.isArray(instance)) instanceType = "array";
				else instanceType = "object";
				break;
			default: throw new Error(`Instances of "${rawInstanceType}" type are not supported.`);
		}
		const { $ref, $recursiveRef, $recursiveAnchor, type: $type, const: $const, enum: $enum, required: $required, not: $not, anyOf: $anyOf, allOf: $allOf, oneOf: $oneOf, if: $if, then: $then, else: $else, format: $format, properties: $properties, patternProperties: $patternProperties, additionalProperties: $additionalProperties, unevaluatedProperties: $unevaluatedProperties, minProperties: $minProperties, maxProperties: $maxProperties, propertyNames: $propertyNames, dependentRequired: $dependentRequired, dependentSchemas: $dependentSchemas, dependencies: $dependencies, prefixItems: $prefixItems, items: $items, additionalItems: $additionalItems, unevaluatedItems: $unevaluatedItems, contains: $contains, minContains: $minContains, maxContains: $maxContains, minItems: $minItems, maxItems: $maxItems, uniqueItems: $uniqueItems, minimum: $minimum, maximum: $maximum, exclusiveMinimum: $exclusiveMinimum, exclusiveMaximum: $exclusiveMaximum, multipleOf: $multipleOf, minLength: $minLength, maxLength: $maxLength, pattern: $pattern, __absolute_ref__, __absolute_recursive_ref__ } = schema;
		const errors = [];
		if ($recursiveAnchor === true && recursiveAnchor === null) recursiveAnchor = schema;
		if ($recursiveRef === "#") {
			const refSchema = recursiveAnchor === null ? lookup[__absolute_recursive_ref__] : recursiveAnchor;
			const keywordLocation = `${schemaLocation}/$recursiveRef`;
			const result = validate(instance, recursiveAnchor === null ? schema : recursiveAnchor, draft, lookup, shortCircuit, refSchema, instanceLocation, keywordLocation, evaluated);
			if (!result.valid) errors.push({
				instanceLocation,
				keyword: "$recursiveRef",
				keywordLocation,
				error: "A subschema had errors."
			}, ...result.errors);
		}
		if ($ref !== void 0) {
			const refSchema = lookup[__absolute_ref__ || $ref];
			if (refSchema === void 0) {
				let message = `Unresolved $ref "${$ref}".`;
				if (__absolute_ref__ && __absolute_ref__ !== $ref) message += `  Absolute URI "${__absolute_ref__}".`;
				message += `\nKnown schemas:\n- ${Object.keys(lookup).join("\n- ")}`;
				throw new Error(message);
			}
			const keywordLocation = `${schemaLocation}/$ref`;
			const result = validate(instance, refSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated);
			if (!result.valid) errors.push({
				instanceLocation,
				keyword: "$ref",
				keywordLocation,
				error: "A subschema had errors."
			}, ...result.errors);
			if (draft === "4" || draft === "7") return {
				valid: errors.length === 0,
				errors
			};
		}
		if (Array.isArray($type)) {
			let length = $type.length;
			let valid = false;
			for (let i = 0; i < length; i++) if (instanceType === $type[i] || $type[i] === "integer" && instanceType === "number" && instance % 1 === 0 && instance === instance) {
				valid = true;
				break;
			}
			if (!valid) errors.push({
				instanceLocation,
				keyword: "type",
				keywordLocation: `${schemaLocation}/type`,
				error: `Instance type "${instanceType}" is invalid. Expected "${$type.join("\", \"")}".`
			});
		} else if ($type === "integer") {
			if (instanceType !== "number" || instance % 1 || instance !== instance) errors.push({
				instanceLocation,
				keyword: "type",
				keywordLocation: `${schemaLocation}/type`,
				error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
			});
		} else if ($type !== void 0 && instanceType !== $type) errors.push({
			instanceLocation,
			keyword: "type",
			keywordLocation: `${schemaLocation}/type`,
			error: `Instance type "${instanceType}" is invalid. Expected "${$type}".`
		});
		if ($const !== void 0) {
			if (instanceType === "object" || instanceType === "array") {
				if (!deepCompareStrict(instance, $const)) errors.push({
					instanceLocation,
					keyword: "const",
					keywordLocation: `${schemaLocation}/const`,
					error: `Instance does not match ${JSON.stringify($const)}.`
				});
			} else if (instance !== $const) errors.push({
				instanceLocation,
				keyword: "const",
				keywordLocation: `${schemaLocation}/const`,
				error: `Instance does not match ${JSON.stringify($const)}.`
			});
		}
		if ($enum !== void 0) {
			if (instanceType === "object" || instanceType === "array") {
				if (!$enum.some((value) => deepCompareStrict(instance, value))) errors.push({
					instanceLocation,
					keyword: "enum",
					keywordLocation: `${schemaLocation}/enum`,
					error: `Instance does not match any of ${JSON.stringify($enum)}.`
				});
			} else if (!$enum.some((value) => instance === value)) errors.push({
				instanceLocation,
				keyword: "enum",
				keywordLocation: `${schemaLocation}/enum`,
				error: `Instance does not match any of ${JSON.stringify($enum)}.`
			});
		}
		if ($not !== void 0) {
			const keywordLocation = `${schemaLocation}/not`;
			if (validate(instance, $not, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation).valid) errors.push({
				instanceLocation,
				keyword: "not",
				keywordLocation,
				error: "Instance matched \"not\" schema."
			});
		}
		let subEvaluateds = [];
		if ($anyOf !== void 0) {
			const keywordLocation = `${schemaLocation}/anyOf`;
			const errorsLength = errors.length;
			let anyValid = false;
			for (let i = 0; i < $anyOf.length; i++) {
				const subSchema = $anyOf[i];
				const subEvaluated = Object.create(evaluated);
				const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
				errors.push(...result.errors);
				anyValid = anyValid || result.valid;
				if (result.valid) subEvaluateds.push(subEvaluated);
			}
			if (anyValid) errors.length = errorsLength;
			else errors.splice(errorsLength, 0, {
				instanceLocation,
				keyword: "anyOf",
				keywordLocation,
				error: "Instance does not match any subschemas."
			});
		}
		if ($allOf !== void 0) {
			const keywordLocation = `${schemaLocation}/allOf`;
			const errorsLength = errors.length;
			let allValid = true;
			for (let i = 0; i < $allOf.length; i++) {
				const subSchema = $allOf[i];
				const subEvaluated = Object.create(evaluated);
				const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
				errors.push(...result.errors);
				allValid = allValid && result.valid;
				if (result.valid) subEvaluateds.push(subEvaluated);
			}
			if (allValid) errors.length = errorsLength;
			else errors.splice(errorsLength, 0, {
				instanceLocation,
				keyword: "allOf",
				keywordLocation,
				error: `Instance does not match every subschema.`
			});
		}
		if ($oneOf !== void 0) {
			const keywordLocation = `${schemaLocation}/oneOf`;
			const errorsLength = errors.length;
			const matches = $oneOf.filter((subSchema, i) => {
				const subEvaluated = Object.create(evaluated);
				const result = validate(instance, subSchema, draft, lookup, shortCircuit, $recursiveAnchor === true ? recursiveAnchor : null, instanceLocation, `${keywordLocation}/${i}`, subEvaluated);
				errors.push(...result.errors);
				if (result.valid) subEvaluateds.push(subEvaluated);
				return result.valid;
			}).length;
			if (matches === 1) errors.length = errorsLength;
			else errors.splice(errorsLength, 0, {
				instanceLocation,
				keyword: "oneOf",
				keywordLocation,
				error: `Instance does not match exactly one subschema (${matches} matches).`
			});
		}
		if (instanceType === "object" || instanceType === "array") Object.assign(evaluated, ...subEvaluateds);
		if ($if !== void 0) {
			const keywordLocation = `${schemaLocation}/if`;
			if (validate(instance, $if, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, keywordLocation, evaluated).valid) {
				if ($then !== void 0) {
					const thenResult = validate(instance, $then, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${schemaLocation}/then`, evaluated);
					if (!thenResult.valid) errors.push({
						instanceLocation,
						keyword: "if",
						keywordLocation,
						error: `Instance does not match "then" schema.`
					}, ...thenResult.errors);
				}
			} else if ($else !== void 0) {
				const elseResult = validate(instance, $else, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${schemaLocation}/else`, evaluated);
				if (!elseResult.valid) errors.push({
					instanceLocation,
					keyword: "if",
					keywordLocation,
					error: `Instance does not match "else" schema.`
				}, ...elseResult.errors);
			}
		}
		if (instanceType === "object") {
			if ($required !== void 0) {
				for (const key of $required) if (!(key in instance)) errors.push({
					instanceLocation,
					keyword: "required",
					keywordLocation: `${schemaLocation}/required`,
					error: `Instance does not have required property "${key}".`
				});
			}
			const keys = Object.keys(instance);
			if ($minProperties !== void 0 && keys.length < $minProperties) errors.push({
				instanceLocation,
				keyword: "minProperties",
				keywordLocation: `${schemaLocation}/minProperties`,
				error: `Instance does not have at least ${$minProperties} properties.`
			});
			if ($maxProperties !== void 0 && keys.length > $maxProperties) errors.push({
				instanceLocation,
				keyword: "maxProperties",
				keywordLocation: `${schemaLocation}/maxProperties`,
				error: `Instance does not have at least ${$maxProperties} properties.`
			});
			if ($propertyNames !== void 0) {
				const keywordLocation = `${schemaLocation}/propertyNames`;
				for (const key in instance) {
					const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
					const result = validate(key, $propertyNames, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
					if (!result.valid) errors.push({
						instanceLocation,
						keyword: "propertyNames",
						keywordLocation,
						error: `Property name "${key}" does not match schema.`
					}, ...result.errors);
				}
			}
			if ($dependentRequired !== void 0) {
				const keywordLocation = `${schemaLocation}/dependantRequired`;
				for (const key in $dependentRequired) if (key in instance) {
					const required = $dependentRequired[key];
					for (const dependantKey of required) if (!(dependantKey in instance)) errors.push({
						instanceLocation,
						keyword: "dependentRequired",
						keywordLocation,
						error: `Instance has "${key}" but does not have "${dependantKey}".`
					});
				}
			}
			if ($dependentSchemas !== void 0) for (const key in $dependentSchemas) {
				const keywordLocation = `${schemaLocation}/dependentSchemas`;
				if (key in instance) {
					const result = validate(instance, $dependentSchemas[key], draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${encodePointer(key)}`, evaluated);
					if (!result.valid) errors.push({
						instanceLocation,
						keyword: "dependentSchemas",
						keywordLocation,
						error: `Instance has "${key}" but does not match dependant schema.`
					}, ...result.errors);
				}
			}
			if ($dependencies !== void 0) {
				const keywordLocation = `${schemaLocation}/dependencies`;
				for (const key in $dependencies) if (key in instance) {
					const propsOrSchema = $dependencies[key];
					if (Array.isArray(propsOrSchema)) {
						for (const dependantKey of propsOrSchema) if (!(dependantKey in instance)) errors.push({
							instanceLocation,
							keyword: "dependencies",
							keywordLocation,
							error: `Instance has "${key}" but does not have "${dependantKey}".`
						});
					} else {
						const result = validate(instance, propsOrSchema, draft, lookup, shortCircuit, recursiveAnchor, instanceLocation, `${keywordLocation}/${encodePointer(key)}`);
						if (!result.valid) errors.push({
							instanceLocation,
							keyword: "dependencies",
							keywordLocation,
							error: `Instance has "${key}" but does not match dependant schema.`
						}, ...result.errors);
					}
				}
			}
			const thisEvaluated = Object.create(null);
			let stop = false;
			if ($properties !== void 0) {
				const keywordLocation = `${schemaLocation}/properties`;
				for (const key in $properties) {
					if (!(key in instance)) continue;
					const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
					const result = validate(instance[key], $properties[key], draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${encodePointer(key)}`);
					if (result.valid) evaluated[key] = thisEvaluated[key] = true;
					else {
						stop = shortCircuit;
						errors.push({
							instanceLocation,
							keyword: "properties",
							keywordLocation,
							error: `Property "${key}" does not match schema.`
						}, ...result.errors);
						if (stop) break;
					}
				}
			}
			if (!stop && $patternProperties !== void 0) {
				const keywordLocation = `${schemaLocation}/patternProperties`;
				for (const pattern in $patternProperties) {
					const regex = new RegExp(pattern, "u");
					const subSchema = $patternProperties[pattern];
					for (const key in instance) {
						if (!regex.test(key)) continue;
						const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
						const result = validate(instance[key], subSchema, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, `${keywordLocation}/${encodePointer(pattern)}`);
						if (result.valid) evaluated[key] = thisEvaluated[key] = true;
						else {
							stop = shortCircuit;
							errors.push({
								instanceLocation,
								keyword: "patternProperties",
								keywordLocation,
								error: `Property "${key}" matches pattern "${pattern}" but does not match associated schema.`
							}, ...result.errors);
						}
					}
				}
			}
			if (!stop && $additionalProperties !== void 0) {
				const keywordLocation = `${schemaLocation}/additionalProperties`;
				for (const key in instance) {
					if (thisEvaluated[key]) continue;
					const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
					const result = validate(instance[key], $additionalProperties, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
					if (result.valid) evaluated[key] = true;
					else {
						stop = shortCircuit;
						errors.push({
							instanceLocation,
							keyword: "additionalProperties",
							keywordLocation,
							error: `Property "${key}" does not match additional properties schema.`
						}, ...result.errors);
					}
				}
			} else if (!stop && $unevaluatedProperties !== void 0) {
				const keywordLocation = `${schemaLocation}/unevaluatedProperties`;
				for (const key in instance) if (!evaluated[key]) {
					const subInstancePointer = `${instanceLocation}/${encodePointer(key)}`;
					const result = validate(instance[key], $unevaluatedProperties, draft, lookup, shortCircuit, recursiveAnchor, subInstancePointer, keywordLocation);
					if (result.valid) evaluated[key] = true;
					else errors.push({
						instanceLocation,
						keyword: "unevaluatedProperties",
						keywordLocation,
						error: `Property "${key}" does not match unevaluated properties schema.`
					}, ...result.errors);
				}
			}
		} else if (instanceType === "array") {
			if ($maxItems !== void 0 && instance.length > $maxItems) errors.push({
				instanceLocation,
				keyword: "maxItems",
				keywordLocation: `${schemaLocation}/maxItems`,
				error: `Array has too many items (${instance.length} > ${$maxItems}).`
			});
			if ($minItems !== void 0 && instance.length < $minItems) errors.push({
				instanceLocation,
				keyword: "minItems",
				keywordLocation: `${schemaLocation}/minItems`,
				error: `Array has too few items (${instance.length} < ${$minItems}).`
			});
			const length = instance.length;
			let i = 0;
			let stop = false;
			if ($prefixItems !== void 0) {
				const keywordLocation = `${schemaLocation}/prefixItems`;
				const length2 = Math.min($prefixItems.length, length);
				for (; i < length2; i++) {
					const result = validate(instance[i], $prefixItems[i], draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, `${keywordLocation}/${i}`);
					evaluated[i] = true;
					if (!result.valid) {
						stop = shortCircuit;
						errors.push({
							instanceLocation,
							keyword: "prefixItems",
							keywordLocation,
							error: `Items did not match schema.`
						}, ...result.errors);
						if (stop) break;
					}
				}
			}
			if ($items !== void 0) {
				const keywordLocation = `${schemaLocation}/items`;
				if (Array.isArray($items)) {
					const length2 = Math.min($items.length, length);
					for (; i < length2; i++) {
						const result = validate(instance[i], $items[i], draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, `${keywordLocation}/${i}`);
						evaluated[i] = true;
						if (!result.valid) {
							stop = shortCircuit;
							errors.push({
								instanceLocation,
								keyword: "items",
								keywordLocation,
								error: `Items did not match schema.`
							}, ...result.errors);
							if (stop) break;
						}
					}
				} else for (; i < length; i++) {
					const result = validate(instance[i], $items, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
					evaluated[i] = true;
					if (!result.valid) {
						stop = shortCircuit;
						errors.push({
							instanceLocation,
							keyword: "items",
							keywordLocation,
							error: `Items did not match schema.`
						}, ...result.errors);
						if (stop) break;
					}
				}
				if (!stop && $additionalItems !== void 0) {
					const keywordLocation = `${schemaLocation}/additionalItems`;
					for (; i < length; i++) {
						const result = validate(instance[i], $additionalItems, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
						evaluated[i] = true;
						if (!result.valid) {
							stop = shortCircuit;
							errors.push({
								instanceLocation,
								keyword: "additionalItems",
								keywordLocation,
								error: `Items did not match additional items schema.`
							}, ...result.errors);
						}
					}
				}
			}
			if ($contains !== void 0) if (length === 0 && $minContains === void 0) errors.push({
				instanceLocation,
				keyword: "contains",
				keywordLocation: `${schemaLocation}/contains`,
				error: `Array is empty. It must contain at least one item matching the schema.`
			});
			else if ($minContains !== void 0 && length < $minContains) errors.push({
				instanceLocation,
				keyword: "minContains",
				keywordLocation: `${schemaLocation}/minContains`,
				error: `Array has less items (${length}) than minContains (${$minContains}).`
			});
			else {
				const keywordLocation = `${schemaLocation}/contains`;
				const errorsLength = errors.length;
				let contained = 0;
				for (let j = 0; j < length; j++) {
					const result = validate(instance[j], $contains, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${j}`, keywordLocation);
					if (result.valid) {
						evaluated[j] = true;
						contained++;
					} else errors.push(...result.errors);
				}
				if (contained >= ($minContains || 0)) errors.length = errorsLength;
				if ($minContains === void 0 && $maxContains === void 0 && contained === 0) errors.splice(errorsLength, 0, {
					instanceLocation,
					keyword: "contains",
					keywordLocation,
					error: `Array does not contain item matching schema.`
				});
				else if ($minContains !== void 0 && contained < $minContains) errors.push({
					instanceLocation,
					keyword: "minContains",
					keywordLocation: `${schemaLocation}/minContains`,
					error: `Array must contain at least ${$minContains} items matching schema. Only ${contained} items were found.`
				});
				else if ($maxContains !== void 0 && contained > $maxContains) errors.push({
					instanceLocation,
					keyword: "maxContains",
					keywordLocation: `${schemaLocation}/maxContains`,
					error: `Array may contain at most ${$maxContains} items matching schema. ${contained} items were found.`
				});
			}
			if (!stop && $unevaluatedItems !== void 0) {
				const keywordLocation = `${schemaLocation}/unevaluatedItems`;
				for (; i < length; i++) {
					if (evaluated[i]) continue;
					const result = validate(instance[i], $unevaluatedItems, draft, lookup, shortCircuit, recursiveAnchor, `${instanceLocation}/${i}`, keywordLocation);
					evaluated[i] = true;
					if (!result.valid) errors.push({
						instanceLocation,
						keyword: "unevaluatedItems",
						keywordLocation,
						error: `Items did not match unevaluated items schema.`
					}, ...result.errors);
				}
			}
			if ($uniqueItems) for (let j = 0; j < length; j++) {
				const a = instance[j];
				const ao = typeof a === "object" && a !== null;
				for (let k = 0; k < length; k++) {
					if (j === k) continue;
					const b = instance[k];
					if (a === b || ao && typeof b === "object" && b !== null && deepCompareStrict(a, b)) {
						errors.push({
							instanceLocation,
							keyword: "uniqueItems",
							keywordLocation: `${schemaLocation}/uniqueItems`,
							error: `Duplicate items at indexes ${j} and ${k}.`
						});
						j = Number.MAX_SAFE_INTEGER;
						k = Number.MAX_SAFE_INTEGER;
					}
				}
			}
		} else if (instanceType === "number") {
			if (draft === "4") {
				if ($minimum !== void 0 && ($exclusiveMinimum === true && instance <= $minimum || instance < $minimum)) errors.push({
					instanceLocation,
					keyword: "minimum",
					keywordLocation: `${schemaLocation}/minimum`,
					error: `${instance} is less than ${$exclusiveMinimum ? "or equal to " : ""} ${$minimum}.`
				});
				if ($maximum !== void 0 && ($exclusiveMaximum === true && instance >= $maximum || instance > $maximum)) errors.push({
					instanceLocation,
					keyword: "maximum",
					keywordLocation: `${schemaLocation}/maximum`,
					error: `${instance} is greater than ${$exclusiveMaximum ? "or equal to " : ""} ${$maximum}.`
				});
			} else {
				if ($minimum !== void 0 && instance < $minimum) errors.push({
					instanceLocation,
					keyword: "minimum",
					keywordLocation: `${schemaLocation}/minimum`,
					error: `${instance} is less than ${$minimum}.`
				});
				if ($maximum !== void 0 && instance > $maximum) errors.push({
					instanceLocation,
					keyword: "maximum",
					keywordLocation: `${schemaLocation}/maximum`,
					error: `${instance} is greater than ${$maximum}.`
				});
				if ($exclusiveMinimum !== void 0 && instance <= $exclusiveMinimum) errors.push({
					instanceLocation,
					keyword: "exclusiveMinimum",
					keywordLocation: `${schemaLocation}/exclusiveMinimum`,
					error: `${instance} is less than ${$exclusiveMinimum}.`
				});
				if ($exclusiveMaximum !== void 0 && instance >= $exclusiveMaximum) errors.push({
					instanceLocation,
					keyword: "exclusiveMaximum",
					keywordLocation: `${schemaLocation}/exclusiveMaximum`,
					error: `${instance} is greater than or equal to ${$exclusiveMaximum}.`
				});
			}
			if ($multipleOf !== void 0) {
				const remainder = instance % $multipleOf;
				if (Math.abs(0 - remainder) >= 1.1920929e-7 && Math.abs($multipleOf - remainder) >= 1.1920929e-7) errors.push({
					instanceLocation,
					keyword: "multipleOf",
					keywordLocation: `${schemaLocation}/multipleOf`,
					error: `${instance} is not a multiple of ${$multipleOf}.`
				});
			}
		} else if (instanceType === "string") {
			const length = $minLength === void 0 && $maxLength === void 0 ? 0 : ucs2length(instance);
			if ($minLength !== void 0 && length < $minLength) errors.push({
				instanceLocation,
				keyword: "minLength",
				keywordLocation: `${schemaLocation}/minLength`,
				error: `String is too short (${length} < ${$minLength}).`
			});
			if ($maxLength !== void 0 && length > $maxLength) errors.push({
				instanceLocation,
				keyword: "maxLength",
				keywordLocation: `${schemaLocation}/maxLength`,
				error: `String is too long (${length} > ${$maxLength}).`
			});
			if ($pattern !== void 0 && !new RegExp($pattern, "u").test(instance)) errors.push({
				instanceLocation,
				keyword: "pattern",
				keywordLocation: `${schemaLocation}/pattern`,
				error: `String does not match pattern.`
			});
			if ($format !== void 0 && format[$format] && !format[$format](instance)) errors.push({
				instanceLocation,
				keyword: "format",
				keywordLocation: `${schemaLocation}/format`,
				error: `String does not match format "${$format}".`
			});
		}
		return {
			valid: errors.length === 0,
			errors
		};
	}

//#endregion
//#region node_modules/.pnpm/@cfworker+json-schema@4.1.1/node_modules/@cfworker/json-schema/dist/esm/validator.js
	var Validator = class {
		schema;
		draft;
		shortCircuit;
		lookup;
		constructor(schema, draft = "2019-09", shortCircuit = true) {
			this.schema = schema;
			this.draft = draft;
			this.shortCircuit = shortCircuit;
			this.lookup = dereference(schema);
		}
		validate(instance) {
			return validate(instance, this.schema, this.draft, this.lookup, this.shortCircuit);
		}
		addSchema(schema, id) {
			if (id) schema = {
				...schema,
				$id: id
			};
			dereference(schema, this.lookup);
		}
	};

//#endregion
//#region node_modules/.pnpm/@mcp-b+webmcp-polyfill@0.3.0/node_modules/@mcp-b/webmcp-polyfill/dist/index.js
	const FAILED_TO_PARSE_INPUT_ARGUMENTS_MESSAGE = "Failed to parse input arguments";
	const TOOL_INVOCATION_FAILED_MESSAGE = "Tool was executed but the invocation failed. For example, the script function threw an error";
	const TOOL_CANCELLED_MESSAGE = "Tool was cancelled";
	const DEFAULT_INPUT_SCHEMA$1 = {
		type: "object",
		properties: {}
	};
	const STANDARD_JSON_SCHEMA_TARGETS = ["draft-2020-12", "draft-07"];
	const POLYFILL_MARKER_PROPERTY = "__isWebMCPPolyfill";
	const STANDARD_VALIDATOR_SYMBOL = Symbol("standardValidator");
	const installState = {
		installed: false,
		previousModelContextDescriptor: void 0,
		previousModelContextTestingDescriptor: void 0
	};
	var StrictWebMCPContext = class {
		tools = /* @__PURE__ */ new Map();
		toolsChangedCallback = null;
		provideContext(options = {}) {
			const nextTools = /* @__PURE__ */ new Map();
			for (const tool of options.tools ?? []) {
				const normalized = normalizeToolDescriptor(tool, nextTools);
				nextTools.set(normalized.name, normalized);
			}
			this.tools = nextTools;
			this.notifyToolsChanged();
		}
		clearContext() {
			this.tools.clear();
			this.notifyToolsChanged();
		}
		registerTool(tool) {
			const normalized = normalizeToolDescriptor(tool, this.tools);
			this.tools.set(normalized.name, normalized);
			this.notifyToolsChanged();
		}
		unregisterTool(name) {
			if (this.tools.delete(name)) this.notifyToolsChanged();
		}
		getTestingShim() {
			return {
				listTools: () => {
					return [...this.tools.values()].map((tool) => {
						const output = {
							name: tool.name,
							description: tool.description
						};
						try {
							output.inputSchema = JSON.stringify(tool.inputSchema);
						} catch {}
						return output;
					});
				},
				executeTool: (toolName, inputArgsJson, options) => this.executeToolForTesting(toolName, inputArgsJson, options),
				registerToolsChangedCallback: (callback) => {
					if (typeof callback !== "function") throw new TypeError("Failed to execute 'registerToolsChangedCallback' on 'ModelContextTesting': parameter 1 is not of type 'Function'.");
					this.toolsChangedCallback = callback;
				},
				getCrossDocumentScriptToolResult: async () => "[]"
			};
		}
		async executeToolForTesting(toolName, inputArgsJson, options) {
			if (options?.signal?.aborted) throw createUnknownError(TOOL_CANCELLED_MESSAGE);
			const tool = this.tools.get(toolName);
			if (!tool) throw createUnknownError(`Tool not found: ${toolName}`);
			const args = parseInputArgsJson(inputArgsJson);
			const validationError = await validateArgsForTool(args, tool);
			if (validationError) throw createUnknownError(validationError);
			let contextActive = true;
			const client = { requestUserInteraction: async (callback) => {
				if (!contextActive) throw new Error(`ModelContextClient for tool "${toolName}" is no longer active after execute() resolved`);
				if (typeof callback !== "function") throw new TypeError("requestUserInteraction(callback) requires a function callback");
				return callback();
			} };
			try {
				const execution = tool.execute(args, client);
				return toSerializedTestingResult(await withAbortSignal(Promise.resolve(execution), options?.signal));
			} catch (error) {
				throw createUnknownError(error instanceof Error ? `${TOOL_INVOCATION_FAILED_MESSAGE}: ${error.message}` : TOOL_INVOCATION_FAILED_MESSAGE);
			} finally {
				contextActive = false;
			}
		}
		notifyToolsChanged() {
			if (!this.toolsChangedCallback) return;
			queueMicrotask(() => {
				try {
					this.toolsChangedCallback?.();
				} catch (error) {
					console.warn("[WebMCPPolyfill] toolsChanged callback threw:", error);
				}
			});
		}
	};
	function createUnknownError(message) {
		try {
			return new DOMException(message, "UnknownError");
		} catch {
			const error = new Error(message);
			error.name = "UnknownError";
			return error;
		}
	}
	function parseInputArgsJson(inputArgsJson) {
		let parsed;
		try {
			parsed = JSON.parse(inputArgsJson);
		} catch {
			throw createUnknownError(FAILED_TO_PARSE_INPUT_ARGUMENTS_MESSAGE);
		}
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw createUnknownError(FAILED_TO_PARSE_INPUT_ARGUMENTS_MESSAGE);
		return parsed;
	}
	function isPlainObject(value) {
		return Boolean(value) && typeof value === "object" && !Array.isArray(value);
	}
	function getStandardProps(value) {
		if (!isPlainObject(value)) return null;
		const standard = value["~standard"];
		if (!isPlainObject(standard)) return null;
		return standard;
	}
	function isStandardInputValidatorSchema(value) {
		const standard = getStandardProps(value);
		return Boolean(standard && standard.version === 1 && typeof standard.validate === "function");
	}
	function isStandardInputJsonSchema(value) {
		const standard = getStandardProps(value);
		if (!standard || standard.version !== 1 || !isPlainObject(standard.jsonSchema)) return false;
		return typeof standard.jsonSchema.input === "function";
	}
	function createStandardValidatorFromJsonSchema(schema) {
		return { "~standard": {
			version: 1,
			vendor: "@mcp-b/webmcp-polyfill-json-schema",
			validate(value) {
				if (!isPlainObject(value)) return { issues: [{ message: "expected object arguments" }] };
				const issue = validateArgsWithSchema(value, schema);
				if (issue) return { issues: [issue] };
				return { value };
			}
		} };
	}
	function convertStandardInputSchema(schema) {
		for (const target of STANDARD_JSON_SCHEMA_TARGETS) try {
			const converted = schema["~standard"].jsonSchema.input({ target });
			validateInputSchema(converted);
			return converted;
		} catch (error) {
			console.warn(`[WebMCPPolyfill] Standard JSON Schema conversion failed for target "${target}":`, error);
		}
		throw new Error("Failed to convert Standard JSON Schema inputSchema to a JSON Schema object");
	}
	function normalizeInputSchema(inputSchema) {
		if (inputSchema === void 0) {
			const normalized = DEFAULT_INPUT_SCHEMA$1;
			return {
				inputSchema: normalized,
				standardValidator: createStandardValidatorFromJsonSchema(normalized)
			};
		}
		if (isStandardInputJsonSchema(inputSchema)) {
			const converted = convertStandardInputSchema(inputSchema);
			return {
				inputSchema: converted,
				standardValidator: createStandardValidatorFromJsonSchema(converted)
			};
		}
		if (isStandardInputValidatorSchema(inputSchema)) return {
			inputSchema: DEFAULT_INPUT_SCHEMA$1,
			standardValidator: inputSchema
		};
		validateInputSchema(inputSchema);
		return {
			inputSchema,
			standardValidator: createStandardValidatorFromJsonSchema(inputSchema)
		};
	}
	function validateInputSchema(schema) {
		if (!isPlainObject(schema)) throw new Error("inputSchema must be a JSON Schema object");
		validateJsonSchemaNode(schema, "$");
	}
	function validateJsonSchemaNode(node, path) {
		const typeValue = node.type;
		if (typeValue !== void 0 && typeof typeValue !== "string" && !(Array.isArray(typeValue) && typeValue.every((entry) => typeof entry === "string" && entry.length > 0))) throw new Error(`Invalid JSON Schema at ${path}: "type" must be a string or string[]`);
		const requiredValue = node.required;
		if (requiredValue !== void 0 && !(Array.isArray(requiredValue) && requiredValue.every((entry) => typeof entry === "string"))) throw new Error(`Invalid JSON Schema at ${path}: "required" must be an array of strings`);
		const propertiesValue = node.properties;
		if (propertiesValue !== void 0) {
			if (!isPlainObject(propertiesValue)) throw new Error(`Invalid JSON Schema at ${path}: "properties" must be an object`);
			for (const [key, value] of Object.entries(propertiesValue)) {
				if (!isPlainObject(value)) throw new Error(`Invalid JSON Schema at ${path}.properties.${key}: expected object schema`);
				validateJsonSchemaNode(value, `${path}.properties.${key}`);
			}
		}
		const itemsValue = node.items;
		if (itemsValue !== void 0) if (Array.isArray(itemsValue)) for (const [index, value] of itemsValue.entries()) {
			if (!isPlainObject(value)) throw new Error(`Invalid JSON Schema at ${path}.items[${index}]: expected object schema`);
			validateJsonSchemaNode(value, `${path}.items[${index}]`);
		}
		else if (isPlainObject(itemsValue)) validateJsonSchemaNode(itemsValue, `${path}.items`);
		else throw new Error(`Invalid JSON Schema at ${path}: "items" must be an object or object[]`);
		for (const keyword of [
			"allOf",
			"anyOf",
			"oneOf"
		]) {
			const value = node[keyword];
			if (value === void 0) continue;
			if (!Array.isArray(value)) throw new Error(`Invalid JSON Schema at ${path}: "${keyword}" must be an array`);
			for (const [index, entry] of value.entries()) {
				if (!isPlainObject(entry)) throw new Error(`Invalid JSON Schema at ${path}.${keyword}[${index}]: expected object schema`);
				validateJsonSchemaNode(entry, `${path}.${keyword}[${index}]`);
			}
		}
		const notValue = node.not;
		if (notValue !== void 0) {
			if (!isPlainObject(notValue)) throw new Error(`Invalid JSON Schema at ${path}: "not" must be an object schema`);
			validateJsonSchemaNode(notValue, `${path}.not`);
		}
		try {
			JSON.stringify(node);
		} catch {
			throw new Error(`Invalid JSON Schema at ${path}: schema must be JSON-serializable`);
		}
	}
	function normalizeToolDescriptor(tool, existing) {
		if (!tool || typeof tool !== "object") throw new TypeError("registerTool(tool) requires a tool object");
		if (typeof tool.name !== "string" || tool.name.length === 0) throw new TypeError("Tool \"name\" must be a non-empty string");
		if (typeof tool.description !== "string" || tool.description.length === 0) throw new TypeError("Tool \"description\" must be a non-empty string");
		if (typeof tool.execute !== "function") throw new TypeError("Tool \"execute\" must be a function");
		if (existing.has(tool.name)) throw new Error(`Tool already registered: ${tool.name}`);
		const normalizedInputSchema = normalizeInputSchema(tool.inputSchema);
		return {
			...tool,
			inputSchema: normalizedInputSchema.inputSchema,
			[STANDARD_VALIDATOR_SYMBOL]: normalizedInputSchema.standardValidator
		};
	}
	function validateArgsWithSchema(args, schema) {
		const result = new Validator(schema, "2020-12", true).validate(args);
		if (result.valid) return null;
		const error = result.errors[result.errors.length - 1];
		if (!error) return { message: "Input validation failed" };
		return { message: error.error };
	}
	function formatStandardIssuePath(path) {
		if (!path || path.length === 0) return null;
		const segments = path.map((segment) => {
			if (isPlainObject(segment) && "key" in segment) return segment.key;
			return segment;
		}).map((segment) => String(segment)).filter((segment) => segment.length > 0);
		if (segments.length === 0) return null;
		return segments.join(".");
	}
	async function validateArgsWithStandardSchema(args, schema) {
		let result;
		try {
			result = await Promise.resolve(schema["~standard"].validate(args));
		} catch (error) {
			const detail = error instanceof Error ? `: ${error.message}` : "";
			console.error("[WebMCPPolyfill] Standard Schema validation threw unexpectedly:", error);
			return `Input validation error: schema validation failed${detail}`;
		}
		if (!result.issues || result.issues.length === 0) return null;
		const firstIssue = result.issues[0];
		if (!firstIssue) return "Input validation error";
		const path = formatStandardIssuePath(firstIssue?.path);
		if (path) return `Input validation error: ${firstIssue.message} at ${path}`;
		return `Input validation error: ${firstIssue.message}`;
	}
	async function validateArgsForTool(args, tool) {
		return validateArgsWithStandardSchema(args, tool[STANDARD_VALIDATOR_SYMBOL]);
	}
	function getFirstTextBlock(result) {
		for (const block of result.content ?? []) if (block.type === "text" && "text" in block && typeof block.text === "string") return block.text;
		return null;
	}
	function toSerializedTestingResult(result) {
		if (result.isError) throw createUnknownError(getFirstTextBlock(result)?.replace(/^Error:\s*/i, "").trim() || TOOL_INVOCATION_FAILED_MESSAGE);
		const metadata = result.metadata;
		if (metadata && typeof metadata === "object" && metadata.willNavigate) return null;
		try {
			return JSON.stringify(result);
		} catch {
			throw createUnknownError(TOOL_INVOCATION_FAILED_MESSAGE);
		}
	}
	function withAbortSignal(operation, signal) {
		if (!signal) return operation;
		if (signal.aborted) return Promise.reject(createUnknownError(TOOL_CANCELLED_MESSAGE));
		return new Promise((resolve, reject) => {
			const onAbort = () => {
				cleanup();
				reject(createUnknownError(TOOL_CANCELLED_MESSAGE));
			};
			const cleanup = () => {
				signal.removeEventListener("abort", onAbort);
			};
			signal.addEventListener("abort", onAbort, { once: true });
			operation.then((value) => {
				cleanup();
				resolve(value);
			}, (error) => {
				cleanup();
				reject(error);
			});
		});
	}
	function getNavigator() {
		if (typeof navigator !== "undefined") return navigator;
		return null;
	}
	function defineNavigatorProperty(target, key, value) {
		Object.defineProperty(target, key, {
			configurable: true,
			enumerable: true,
			writable: false,
			value
		});
	}
	function initializeWebMCPPolyfill(options) {
		const nav = getNavigator();
		if (!nav) return;
		if (Boolean(nav.modelContext)) return;
		if (installState.installed) cleanupWebMCPPolyfill();
		const context = new StrictWebMCPContext();
		const modelContext = context;
		modelContext[POLYFILL_MARKER_PROPERTY] = true;
		installState.previousModelContextDescriptor = Object.getOwnPropertyDescriptor(nav, "modelContext");
		installState.previousModelContextTestingDescriptor = Object.getOwnPropertyDescriptor(nav, "modelContextTesting");
		defineNavigatorProperty(nav, "modelContext", modelContext);
		const installTestingShim = options?.installTestingShim ?? "if-missing";
		const hasModelContextTesting = Boolean(nav.modelContextTesting);
		if (installTestingShim === "always" || (installTestingShim === true || installTestingShim === "if-missing") && !hasModelContextTesting) defineNavigatorProperty(nav, "modelContextTesting", context.getTestingShim());
		installState.installed = true;
	}
	function cleanupWebMCPPolyfill() {
		const nav = getNavigator();
		if (!nav || !installState.installed) return;
		const restore = (key, previousDescriptor) => {
			if (previousDescriptor) {
				Object.defineProperty(nav, key, previousDescriptor);
				return;
			}
			delete nav[key];
		};
		restore("modelContext", installState.previousModelContextDescriptor);
		restore("modelContextTesting", installState.previousModelContextTestingDescriptor);
		installState.installed = false;
		installState.previousModelContextDescriptor = void 0;
		installState.previousModelContextTestingDescriptor = void 0;
	}
	if (typeof window !== "undefined" && typeof document !== "undefined") {
		const options = window.__webMCPPolyfillOptions;
		if (options?.autoInitialize !== false) try {
			initializeWebMCPPolyfill(options);
		} catch (error) {
			console.error("[WebMCPPolyfill] Auto-initialization failed:", error);
		}
	}

//#endregion
//#region node_modules/.pnpm/@mcp-b+webmcp-ts-sdk@1.6.0_zod-to-json-schema@3.25.1_zod@3.25.76__zod@3.25.76/node_modules/@mcp-b/webmcp-ts-sdk/dist/index.js
	function isZ4Schema(s) {
		return !!s._zod;
	}
	function objectFromShape(shape) {
		const values = Object.values(shape);
		if (values.length === 0) return object$1({});
		const allV4 = values.every(isZ4Schema);
		const allV3 = values.every((s) => !isZ4Schema(s));
		if (allV4) return object$1(shape);
		if (allV3) return objectType(shape);
		throw new Error("Mixed Zod versions detected in object shape.");
	}
	function safeParse(schema, data) {
		if (isZ4Schema(schema)) return safeParse$2(schema, data);
		return schema.safeParse(data);
	}
	async function safeParseAsync(schema, data) {
		if (isZ4Schema(schema)) return await safeParseAsync$2(schema, data);
		return await schema.safeParseAsync(data);
	}
	function getObjectShape(schema) {
		if (!schema) return void 0;
		let rawShape;
		if (isZ4Schema(schema)) rawShape = schema._zod?.def?.shape;
		else rawShape = schema.shape;
		if (!rawShape) return void 0;
		if (typeof rawShape === "function") try {
			return rawShape();
		} catch {
			return;
		}
		return rawShape;
	}
	/**
	* Normalizes a schema to an object schema. Handles both:
	* - Already-constructed object schemas (v3 or v4)
	* - Raw shapes that need to be wrapped into object schemas
	*/
	function normalizeObjectSchema(schema) {
		if (!schema) return void 0;
		if (typeof schema === "object") {
			const asV3 = schema;
			const asV4 = schema;
			if (!asV3._def && !asV4._zod) {
				const values = Object.values(schema);
				if (values.length > 0 && values.every((v) => typeof v === "object" && v !== null && (v._def !== void 0 || v._zod !== void 0 || typeof v.parse === "function"))) return objectFromShape(schema);
			}
		}
		if (isZ4Schema(schema)) {
			const def = schema._zod?.def;
			if (def && (def.type === "object" || def.shape !== void 0)) return schema;
		} else if (schema.shape !== void 0) return schema;
	}
	/**
	* Safely extracts an error message from a parse result error.
	* Zod errors can have different structures, so we handle various cases.
	*/
	function getParseErrorMessage(error) {
		if (error && typeof error === "object") {
			if ("message" in error && typeof error.message === "string") return error.message;
			if ("issues" in error && Array.isArray(error.issues) && error.issues.length > 0) {
				const firstIssue = error.issues[0];
				if (firstIssue && typeof firstIssue === "object" && "message" in firstIssue) return String(firstIssue.message);
			}
			try {
				return JSON.stringify(error);
			} catch {
				return String(error);
			}
		}
		return String(error);
	}
	/**
	* Gets the description from a schema, if available.
	* Works with both Zod v3 and v4.
	*
	* Both versions expose a `.description` getter that returns the description
	* from their respective internal storage (v3: _def, v4: globalRegistry).
	*/
	function getSchemaDescription(schema) {
		return schema.description;
	}
	/**
	* Checks if a schema is optional.
	* Works with both Zod v3 and v4.
	*/
	function isSchemaOptional(schema) {
		if (isZ4Schema(schema)) return schema._zod?.def?.type === "optional";
		const v3Schema = schema;
		if (typeof schema.isOptional === "function") return schema.isOptional();
		return v3Schema._def?.typeName === "ZodOptional";
	}
	/**
	* Gets the literal value from a schema, if it's a literal schema.
	* Works with both Zod v3 and v4.
	* Returns undefined if the schema is not a literal or the value cannot be determined.
	*/
	function getLiteralValue(schema) {
		if (isZ4Schema(schema)) {
			const def$1 = schema._zod?.def;
			if (def$1) {
				if (def$1.value !== void 0) return def$1.value;
				if (Array.isArray(def$1.values) && def$1.values.length > 0) return def$1.values[0];
			}
		}
		const def = schema._def;
		if (def) {
			if (def.value !== void 0) return def.value;
			if (Array.isArray(def.values) && def.values.length > 0) return def.values[0];
		}
		const directValue = schema.value;
		if (directValue !== void 0) return directValue;
	}
	const LATEST_PROTOCOL_VERSION = "2025-11-25";
	const SUPPORTED_PROTOCOL_VERSIONS = [
		LATEST_PROTOCOL_VERSION,
		"2025-06-18",
		"2025-03-26",
		"2024-11-05",
		"2024-10-07"
	];
	const RELATED_TASK_META_KEY = "io.modelcontextprotocol/related-task";
	const JSONRPC_VERSION = "2.0";
	/**
	* Assert 'object' type schema.
	*
	* @internal
	*/
	const AssertObjectSchema = custom((v) => v !== null && (typeof v === "object" || typeof v === "function"));
	/**
	* A progress token, used to associate progress notifications with the original request.
	*/
	const ProgressTokenSchema = union([string(), number().int()]);
	/**
	* An opaque token used to represent a cursor for pagination.
	*/
	const CursorSchema = string();
	looseObject({
		ttl: union([number(), _null()]).optional(),
		pollInterval: number().optional()
	});
	const TaskMetadataSchema = object({ ttl: number().optional() });
	/**
	* Metadata for associating messages with a task.
	* Include this in the `_meta` field under the key `io.modelcontextprotocol/related-task`.
	*/
	const RelatedTaskMetadataSchema = object({ taskId: string() });
	const RequestMetaSchema = looseObject({
		progressToken: ProgressTokenSchema.optional(),
		[RELATED_TASK_META_KEY]: RelatedTaskMetadataSchema.optional()
	});
	/**
	* Common params for any request.
	*/
	const BaseRequestParamsSchema = object({ _meta: RequestMetaSchema.optional() });
	/**
	* Common params for any task-augmented request.
	*/
	const TaskAugmentedRequestParamsSchema = BaseRequestParamsSchema.extend({ task: TaskMetadataSchema.optional() });
	/**
	* Checks if a value is a valid TaskAugmentedRequestParams.
	* @param value - The value to check.
	*
	* @returns True if the value is a valid TaskAugmentedRequestParams, false otherwise.
	*/
	const isTaskAugmentedRequestParams = (value) => TaskAugmentedRequestParamsSchema.safeParse(value).success;
	const RequestSchema = object({
		method: string(),
		params: BaseRequestParamsSchema.loose().optional()
	});
	const NotificationsParamsSchema = object({ _meta: RequestMetaSchema.optional() });
	const NotificationSchema = object({
		method: string(),
		params: NotificationsParamsSchema.loose().optional()
	});
	const ResultSchema = looseObject({ _meta: RequestMetaSchema.optional() });
	/**
	* A uniquely identifying ID for a request in JSON-RPC.
	*/
	const RequestIdSchema = union([string(), number().int()]);
	/**
	* A request that expects a response.
	*/
	const JSONRPCRequestSchema = object({
		jsonrpc: literal(JSONRPC_VERSION),
		id: RequestIdSchema,
		...RequestSchema.shape
	}).strict();
	const isJSONRPCRequest = (value) => JSONRPCRequestSchema.safeParse(value).success;
	/**
	* A notification which does not expect a response.
	*/
	const JSONRPCNotificationSchema = object({
		jsonrpc: literal(JSONRPC_VERSION),
		...NotificationSchema.shape
	}).strict();
	const isJSONRPCNotification = (value) => JSONRPCNotificationSchema.safeParse(value).success;
	/**
	* A successful (non-error) response to a request.
	*/
	const JSONRPCResultResponseSchema = object({
		jsonrpc: literal(JSONRPC_VERSION),
		id: RequestIdSchema,
		result: ResultSchema
	}).strict();
	/**
	* Checks if a value is a valid JSONRPCResultResponse.
	* @param value - The value to check.
	*
	* @returns True if the value is a valid JSONRPCResultResponse, false otherwise.
	*/
	const isJSONRPCResultResponse = (value) => JSONRPCResultResponseSchema.safeParse(value).success;
	/**
	* Error codes defined by the JSON-RPC specification.
	*/
	var ErrorCode;
	(function(ErrorCode$1) {
		ErrorCode$1[ErrorCode$1["ConnectionClosed"] = -32e3] = "ConnectionClosed";
		ErrorCode$1[ErrorCode$1["RequestTimeout"] = -32001] = "RequestTimeout";
		ErrorCode$1[ErrorCode$1["ParseError"] = -32700] = "ParseError";
		ErrorCode$1[ErrorCode$1["InvalidRequest"] = -32600] = "InvalidRequest";
		ErrorCode$1[ErrorCode$1["MethodNotFound"] = -32601] = "MethodNotFound";
		ErrorCode$1[ErrorCode$1["InvalidParams"] = -32602] = "InvalidParams";
		ErrorCode$1[ErrorCode$1["InternalError"] = -32603] = "InternalError";
		ErrorCode$1[ErrorCode$1["UrlElicitationRequired"] = -32042] = "UrlElicitationRequired";
	})(ErrorCode || (ErrorCode = {}));
	/**
	* A response to a request that indicates an error occurred.
	*/
	const JSONRPCErrorResponseSchema = object({
		jsonrpc: literal(JSONRPC_VERSION),
		id: RequestIdSchema.optional(),
		error: object({
			code: number().int(),
			message: string(),
			data: unknown().optional()
		})
	}).strict();
	/**
	* Checks if a value is a valid JSONRPCErrorResponse.
	* @param value - The value to check.
	*
	* @returns True if the value is a valid JSONRPCErrorResponse, false otherwise.
	*/
	const isJSONRPCErrorResponse = (value) => JSONRPCErrorResponseSchema.safeParse(value).success;
	const JSONRPCMessageSchema = union([
		JSONRPCRequestSchema,
		JSONRPCNotificationSchema,
		JSONRPCResultResponseSchema,
		JSONRPCErrorResponseSchema
	]);
	union([JSONRPCResultResponseSchema, JSONRPCErrorResponseSchema]);
	/**
	* A response that indicates success but carries no data.
	*/
	const EmptyResultSchema = ResultSchema.strict();
	const CancelledNotificationParamsSchema = NotificationsParamsSchema.extend({
		requestId: RequestIdSchema.optional(),
		reason: string().optional()
	});
	/**
	* This notification can be sent by either side to indicate that it is cancelling a previously-issued request.
	*
	* The request SHOULD still be in-flight, but due to communication latency, it is always possible that this notification MAY arrive after the request has already finished.
	*
	* This notification indicates that the result will be unused, so any associated processing SHOULD cease.
	*
	* A client MUST NOT attempt to cancel its `initialize` request.
	*/
	const CancelledNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/cancelled"),
		params: CancelledNotificationParamsSchema
	});
	/**
	* Icon schema for use in tools, prompts, resources, and implementations.
	*/
	const IconSchema = object({
		src: string(),
		mimeType: string().optional(),
		sizes: array(string()).optional(),
		theme: _enum(["light", "dark"]).optional()
	});
	/**
	* Base schema to add `icons` property.
	*
	*/
	const IconsSchema = object({ icons: array(IconSchema).optional() });
	/**
	* Base metadata interface for common properties across resources, tools, prompts, and implementations.
	*/
	const BaseMetadataSchema = object({
		name: string(),
		title: string().optional()
	});
	/**
	* Describes the name and version of an MCP implementation.
	*/
	const ImplementationSchema = BaseMetadataSchema.extend({
		...BaseMetadataSchema.shape,
		...IconsSchema.shape,
		version: string(),
		websiteUrl: string().optional(),
		description: string().optional()
	});
	const FormElicitationCapabilitySchema = intersection(object({ applyDefaults: boolean().optional() }), record(string(), unknown()));
	const ElicitationCapabilitySchema = preprocess((value) => {
		if (value && typeof value === "object" && !Array.isArray(value)) {
			if (Object.keys(value).length === 0) return { form: {} };
		}
		return value;
	}, intersection(object({
		form: FormElicitationCapabilitySchema.optional(),
		url: AssertObjectSchema.optional()
	}), record(string(), unknown()).optional()));
	/**
	* Task capabilities for clients, indicating which request types support task creation.
	*/
	const ClientTasksCapabilitySchema = looseObject({
		list: AssertObjectSchema.optional(),
		cancel: AssertObjectSchema.optional(),
		requests: looseObject({
			sampling: looseObject({ createMessage: AssertObjectSchema.optional() }).optional(),
			elicitation: looseObject({ create: AssertObjectSchema.optional() }).optional()
		}).optional()
	});
	/**
	* Task capabilities for servers, indicating which request types support task creation.
	*/
	const ServerTasksCapabilitySchema = looseObject({
		list: AssertObjectSchema.optional(),
		cancel: AssertObjectSchema.optional(),
		requests: looseObject({ tools: looseObject({ call: AssertObjectSchema.optional() }).optional() }).optional()
	});
	/**
	* Capabilities a client may support. Known capabilities are defined here, in this schema, but this is not a closed set: any client can define its own, additional capabilities.
	*/
	const ClientCapabilitiesSchema = object({
		experimental: record(string(), AssertObjectSchema).optional(),
		sampling: object({
			context: AssertObjectSchema.optional(),
			tools: AssertObjectSchema.optional()
		}).optional(),
		elicitation: ElicitationCapabilitySchema.optional(),
		roots: object({ listChanged: boolean().optional() }).optional(),
		tasks: ClientTasksCapabilitySchema.optional()
	});
	const InitializeRequestParamsSchema = BaseRequestParamsSchema.extend({
		protocolVersion: string(),
		capabilities: ClientCapabilitiesSchema,
		clientInfo: ImplementationSchema
	});
	/**
	* This request is sent from the client to the server when it first connects, asking it to begin initialization.
	*/
	const InitializeRequestSchema = RequestSchema.extend({
		method: literal("initialize"),
		params: InitializeRequestParamsSchema
	});
	/**
	* Capabilities that a server may support. Known capabilities are defined here, in this schema, but this is not a closed set: any server can define its own, additional capabilities.
	*/
	const ServerCapabilitiesSchema = object({
		experimental: record(string(), AssertObjectSchema).optional(),
		logging: AssertObjectSchema.optional(),
		completions: AssertObjectSchema.optional(),
		prompts: object({ listChanged: boolean().optional() }).optional(),
		resources: object({
			subscribe: boolean().optional(),
			listChanged: boolean().optional()
		}).optional(),
		tools: object({ listChanged: boolean().optional() }).optional(),
		tasks: ServerTasksCapabilitySchema.optional()
	});
	/**
	* After receiving an initialize request from the client, the server sends this response.
	*/
	const InitializeResultSchema = ResultSchema.extend({
		protocolVersion: string(),
		capabilities: ServerCapabilitiesSchema,
		serverInfo: ImplementationSchema,
		instructions: string().optional()
	});
	/**
	* This notification is sent from the client to the server after initialization has finished.
	*/
	const InitializedNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/initialized"),
		params: NotificationsParamsSchema.optional()
	});
	/**
	* A ping, issued by either the server or the client, to check that the other party is still alive. The receiver must promptly respond, or else may be disconnected.
	*/
	const PingRequestSchema = RequestSchema.extend({
		method: literal("ping"),
		params: BaseRequestParamsSchema.optional()
	});
	const ProgressSchema = object({
		progress: number(),
		total: optional(number()),
		message: optional(string())
	});
	const ProgressNotificationParamsSchema = object({
		...NotificationsParamsSchema.shape,
		...ProgressSchema.shape,
		progressToken: ProgressTokenSchema
	});
	/**
	* An out-of-band notification used to inform the receiver of a progress update for a long-running request.
	*
	* @category notifications/progress
	*/
	const ProgressNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/progress"),
		params: ProgressNotificationParamsSchema
	});
	const PaginatedRequestParamsSchema = BaseRequestParamsSchema.extend({ cursor: CursorSchema.optional() });
	const PaginatedRequestSchema = RequestSchema.extend({ params: PaginatedRequestParamsSchema.optional() });
	const PaginatedResultSchema = ResultSchema.extend({ nextCursor: CursorSchema.optional() });
	/**
	* The status of a task.
	* */
	const TaskStatusSchema = _enum([
		"working",
		"input_required",
		"completed",
		"failed",
		"cancelled"
	]);
	/**
	* A pollable state object associated with a request.
	*/
	const TaskSchema = object({
		taskId: string(),
		status: TaskStatusSchema,
		ttl: union([number(), _null()]),
		createdAt: string(),
		lastUpdatedAt: string(),
		pollInterval: optional(number()),
		statusMessage: optional(string())
	});
	/**
	* Result returned when a task is created, containing the task data wrapped in a task field.
	*/
	const CreateTaskResultSchema = ResultSchema.extend({ task: TaskSchema });
	/**
	* Parameters for task status notification.
	*/
	const TaskStatusNotificationParamsSchema = NotificationsParamsSchema.merge(TaskSchema);
	/**
	* A notification sent when a task's status changes.
	*/
	const TaskStatusNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/tasks/status"),
		params: TaskStatusNotificationParamsSchema
	});
	/**
	* A request to get the state of a specific task.
	*/
	const GetTaskRequestSchema = RequestSchema.extend({
		method: literal("tasks/get"),
		params: BaseRequestParamsSchema.extend({ taskId: string() })
	});
	/**
	* The response to a tasks/get request.
	*/
	const GetTaskResultSchema = ResultSchema.merge(TaskSchema);
	/**
	* A request to get the result of a specific task.
	*/
	const GetTaskPayloadRequestSchema = RequestSchema.extend({
		method: literal("tasks/result"),
		params: BaseRequestParamsSchema.extend({ taskId: string() })
	});
	ResultSchema.loose();
	/**
	* A request to list tasks.
	*/
	const ListTasksRequestSchema = PaginatedRequestSchema.extend({ method: literal("tasks/list") });
	/**
	* The response to a tasks/list request.
	*/
	const ListTasksResultSchema = PaginatedResultSchema.extend({ tasks: array(TaskSchema) });
	/**
	* A request to cancel a specific task.
	*/
	const CancelTaskRequestSchema = RequestSchema.extend({
		method: literal("tasks/cancel"),
		params: BaseRequestParamsSchema.extend({ taskId: string() })
	});
	/**
	* The response to a tasks/cancel request.
	*/
	const CancelTaskResultSchema = ResultSchema.merge(TaskSchema);
	/**
	* The contents of a specific resource or sub-resource.
	*/
	const ResourceContentsSchema = object({
		uri: string(),
		mimeType: optional(string()),
		_meta: record(string(), unknown()).optional()
	});
	const TextResourceContentsSchema = ResourceContentsSchema.extend({ text: string() });
	/**
	* A Zod schema for validating Base64 strings that is more performant and
	* robust for very large inputs than the default regex-based check. It avoids
	* stack overflows by using the native `atob` function for validation.
	*/
	const Base64Schema = string().refine((val) => {
		try {
			atob(val);
			return true;
		} catch {
			return false;
		}
	}, { message: "Invalid Base64 string" });
	const BlobResourceContentsSchema = ResourceContentsSchema.extend({ blob: Base64Schema });
	/**
	* The sender or recipient of messages and data in a conversation.
	*/
	const RoleSchema = _enum(["user", "assistant"]);
	/**
	* Optional annotations providing clients additional context about a resource.
	*/
	const AnnotationsSchema = object({
		audience: array(RoleSchema).optional(),
		priority: number().min(0).max(1).optional(),
		lastModified: datetime({ offset: true }).optional()
	});
	/**
	* A known resource that the server is capable of reading.
	*/
	const ResourceSchema = object({
		...BaseMetadataSchema.shape,
		...IconsSchema.shape,
		uri: string(),
		description: optional(string()),
		mimeType: optional(string()),
		annotations: AnnotationsSchema.optional(),
		_meta: optional(looseObject({}))
	});
	/**
	* A template description for resources available on the server.
	*/
	const ResourceTemplateSchema = object({
		...BaseMetadataSchema.shape,
		...IconsSchema.shape,
		uriTemplate: string(),
		description: optional(string()),
		mimeType: optional(string()),
		annotations: AnnotationsSchema.optional(),
		_meta: optional(looseObject({}))
	});
	/**
	* Sent from the client to request a list of resources the server has.
	*/
	const ListResourcesRequestSchema = PaginatedRequestSchema.extend({ method: literal("resources/list") });
	/**
	* The server's response to a resources/list request from the client.
	*/
	const ListResourcesResultSchema = PaginatedResultSchema.extend({ resources: array(ResourceSchema) });
	/**
	* Sent from the client to request a list of resource templates the server has.
	*/
	const ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({ method: literal("resources/templates/list") });
	/**
	* The server's response to a resources/templates/list request from the client.
	*/
	const ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({ resourceTemplates: array(ResourceTemplateSchema) });
	const ResourceRequestParamsSchema = BaseRequestParamsSchema.extend({ uri: string() });
	/**
	* Parameters for a `resources/read` request.
	*/
	const ReadResourceRequestParamsSchema = ResourceRequestParamsSchema;
	/**
	* Sent from the client to the server, to read a specific resource URI.
	*/
	const ReadResourceRequestSchema = RequestSchema.extend({
		method: literal("resources/read"),
		params: ReadResourceRequestParamsSchema
	});
	/**
	* The server's response to a resources/read request from the client.
	*/
	const ReadResourceResultSchema = ResultSchema.extend({ contents: array(union([TextResourceContentsSchema, BlobResourceContentsSchema])) });
	/**
	* An optional notification from the server to the client, informing it that the list of resources it can read from has changed. This may be issued by servers without any previous subscription from the client.
	*/
	const ResourceListChangedNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/resources/list_changed"),
		params: NotificationsParamsSchema.optional()
	});
	const SubscribeRequestParamsSchema = ResourceRequestParamsSchema;
	/**
	* Sent from the client to request resources/updated notifications from the server whenever a particular resource changes.
	*/
	const SubscribeRequestSchema = RequestSchema.extend({
		method: literal("resources/subscribe"),
		params: SubscribeRequestParamsSchema
	});
	const UnsubscribeRequestParamsSchema = ResourceRequestParamsSchema;
	/**
	* Sent from the client to request cancellation of resources/updated notifications from the server. This should follow a previous resources/subscribe request.
	*/
	const UnsubscribeRequestSchema = RequestSchema.extend({
		method: literal("resources/unsubscribe"),
		params: UnsubscribeRequestParamsSchema
	});
	/**
	* Parameters for a `notifications/resources/updated` notification.
	*/
	const ResourceUpdatedNotificationParamsSchema = NotificationsParamsSchema.extend({ uri: string() });
	/**
	* A notification from the server to the client, informing it that a resource has changed and may need to be read again. This should only be sent if the client previously sent a resources/subscribe request.
	*/
	const ResourceUpdatedNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/resources/updated"),
		params: ResourceUpdatedNotificationParamsSchema
	});
	/**
	* Describes an argument that a prompt can accept.
	*/
	const PromptArgumentSchema = object({
		name: string(),
		description: optional(string()),
		required: optional(boolean())
	});
	/**
	* A prompt or prompt template that the server offers.
	*/
	const PromptSchema = object({
		...BaseMetadataSchema.shape,
		...IconsSchema.shape,
		description: optional(string()),
		arguments: optional(array(PromptArgumentSchema)),
		_meta: optional(looseObject({}))
	});
	/**
	* Sent from the client to request a list of prompts and prompt templates the server has.
	*/
	const ListPromptsRequestSchema = PaginatedRequestSchema.extend({ method: literal("prompts/list") });
	/**
	* The server's response to a prompts/list request from the client.
	*/
	const ListPromptsResultSchema = PaginatedResultSchema.extend({ prompts: array(PromptSchema) });
	/**
	* Parameters for a `prompts/get` request.
	*/
	const GetPromptRequestParamsSchema = BaseRequestParamsSchema.extend({
		name: string(),
		arguments: record(string(), string()).optional()
	});
	/**
	* Used by the client to get a prompt provided by the server.
	*/
	const GetPromptRequestSchema = RequestSchema.extend({
		method: literal("prompts/get"),
		params: GetPromptRequestParamsSchema
	});
	/**
	* Text provided to or from an LLM.
	*/
	const TextContentSchema = object({
		type: literal("text"),
		text: string(),
		annotations: AnnotationsSchema.optional(),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* An image provided to or from an LLM.
	*/
	const ImageContentSchema = object({
		type: literal("image"),
		data: Base64Schema,
		mimeType: string(),
		annotations: AnnotationsSchema.optional(),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* An Audio provided to or from an LLM.
	*/
	const AudioContentSchema = object({
		type: literal("audio"),
		data: Base64Schema,
		mimeType: string(),
		annotations: AnnotationsSchema.optional(),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* A tool call request from an assistant (LLM).
	* Represents the assistant's request to use a tool.
	*/
	const ToolUseContentSchema = object({
		type: literal("tool_use"),
		name: string(),
		id: string(),
		input: record(string(), unknown()),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* The contents of a resource, embedded into a prompt or tool call result.
	*/
	const EmbeddedResourceSchema = object({
		type: literal("resource"),
		resource: union([TextResourceContentsSchema, BlobResourceContentsSchema]),
		annotations: AnnotationsSchema.optional(),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* A resource that the server is capable of reading, included in a prompt or tool call result.
	*
	* Note: resource links returned by tools are not guaranteed to appear in the results of `resources/list` requests.
	*/
	const ResourceLinkSchema = ResourceSchema.extend({ type: literal("resource_link") });
	/**
	* A content block that can be used in prompts and tool results.
	*/
	const ContentBlockSchema = union([
		TextContentSchema,
		ImageContentSchema,
		AudioContentSchema,
		ResourceLinkSchema,
		EmbeddedResourceSchema
	]);
	/**
	* Describes a message returned as part of a prompt.
	*/
	const PromptMessageSchema = object({
		role: RoleSchema,
		content: ContentBlockSchema
	});
	/**
	* The server's response to a prompts/get request from the client.
	*/
	const GetPromptResultSchema = ResultSchema.extend({
		description: string().optional(),
		messages: array(PromptMessageSchema)
	});
	/**
	* An optional notification from the server to the client, informing it that the list of prompts it offers has changed. This may be issued by servers without any previous subscription from the client.
	*/
	const PromptListChangedNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/prompts/list_changed"),
		params: NotificationsParamsSchema.optional()
	});
	/**
	* Additional properties describing a Tool to clients.
	*
	* NOTE: all properties in ToolAnnotations are **hints**.
	* They are not guaranteed to provide a faithful description of
	* tool behavior (including descriptive properties like `title`).
	*
	* Clients should never make tool use decisions based on ToolAnnotations
	* received from untrusted servers.
	*/
	const ToolAnnotationsSchema = object({
		title: string().optional(),
		readOnlyHint: boolean().optional(),
		destructiveHint: boolean().optional(),
		idempotentHint: boolean().optional(),
		openWorldHint: boolean().optional()
	});
	/**
	* Execution-related properties for a tool.
	*/
	const ToolExecutionSchema = object({ taskSupport: _enum([
		"required",
		"optional",
		"forbidden"
	]).optional() });
	/**
	* Definition for a tool the client can call.
	*/
	const ToolSchema = object({
		...BaseMetadataSchema.shape,
		...IconsSchema.shape,
		description: string().optional(),
		inputSchema: object({
			type: literal("object"),
			properties: record(string(), AssertObjectSchema).optional(),
			required: array(string()).optional()
		}).catchall(unknown()),
		outputSchema: object({
			type: literal("object"),
			properties: record(string(), AssertObjectSchema).optional(),
			required: array(string()).optional()
		}).catchall(unknown()).optional(),
		annotations: ToolAnnotationsSchema.optional(),
		execution: ToolExecutionSchema.optional(),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* Sent from the client to request a list of tools the server has.
	*/
	const ListToolsRequestSchema = PaginatedRequestSchema.extend({ method: literal("tools/list") });
	/**
	* The server's response to a tools/list request from the client.
	*/
	const ListToolsResultSchema = PaginatedResultSchema.extend({ tools: array(ToolSchema) });
	/**
	* The server's response to a tool call.
	*/
	const CallToolResultSchema = ResultSchema.extend({
		content: array(ContentBlockSchema).default([]),
		structuredContent: record(string(), unknown()).optional(),
		isError: boolean().optional()
	});
	CallToolResultSchema.or(ResultSchema.extend({ toolResult: unknown() }));
	/**
	* Parameters for a `tools/call` request.
	*/
	const CallToolRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
		name: string(),
		arguments: record(string(), unknown()).optional()
	});
	/**
	* Used by the client to invoke a tool provided by the server.
	*/
	const CallToolRequestSchema = RequestSchema.extend({
		method: literal("tools/call"),
		params: CallToolRequestParamsSchema
	});
	/**
	* An optional notification from the server to the client, informing it that the list of tools it offers has changed. This may be issued by servers without any previous subscription from the client.
	*/
	const ToolListChangedNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/tools/list_changed"),
		params: NotificationsParamsSchema.optional()
	});
	/**
	* Base schema for list changed subscription options (without callback).
	* Used internally for Zod validation of autoRefresh and debounceMs.
	*/
	const ListChangedOptionsBaseSchema = object({
		autoRefresh: boolean().default(true),
		debounceMs: number().int().nonnegative().default(300)
	});
	/**
	* The severity of a log message.
	*/
	const LoggingLevelSchema = _enum([
		"debug",
		"info",
		"notice",
		"warning",
		"error",
		"critical",
		"alert",
		"emergency"
	]);
	/**
	* Parameters for a `logging/setLevel` request.
	*/
	const SetLevelRequestParamsSchema = BaseRequestParamsSchema.extend({ level: LoggingLevelSchema });
	/**
	* A request from the client to the server, to enable or adjust logging.
	*/
	const SetLevelRequestSchema = RequestSchema.extend({
		method: literal("logging/setLevel"),
		params: SetLevelRequestParamsSchema
	});
	/**
	* Parameters for a `notifications/message` notification.
	*/
	const LoggingMessageNotificationParamsSchema = NotificationsParamsSchema.extend({
		level: LoggingLevelSchema,
		logger: string().optional(),
		data: unknown()
	});
	/**
	* Notification of a log message passed from server to client. If no logging/setLevel request has been sent from the client, the server MAY decide which messages to send automatically.
	*/
	const LoggingMessageNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/message"),
		params: LoggingMessageNotificationParamsSchema
	});
	/**
	* Hints to use for model selection.
	*/
	const ModelHintSchema = object({ name: string().optional() });
	/**
	* The server's preferences for model selection, requested of the client during sampling.
	*/
	const ModelPreferencesSchema = object({
		hints: array(ModelHintSchema).optional(),
		costPriority: number().min(0).max(1).optional(),
		speedPriority: number().min(0).max(1).optional(),
		intelligencePriority: number().min(0).max(1).optional()
	});
	/**
	* Controls tool usage behavior in sampling requests.
	*/
	const ToolChoiceSchema = object({ mode: _enum([
		"auto",
		"required",
		"none"
	]).optional() });
	/**
	* The result of a tool execution, provided by the user (server).
	* Represents the outcome of invoking a tool requested via ToolUseContent.
	*/
	const ToolResultContentSchema = object({
		type: literal("tool_result"),
		toolUseId: string().describe("The unique identifier for the corresponding tool call."),
		content: array(ContentBlockSchema).default([]),
		structuredContent: object({}).loose().optional(),
		isError: boolean().optional(),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* Basic content types for sampling responses (without tool use).
	* Used for backwards-compatible CreateMessageResult when tools are not used.
	*/
	const SamplingContentSchema = discriminatedUnion("type", [
		TextContentSchema,
		ImageContentSchema,
		AudioContentSchema
	]);
	/**
	* Content block types allowed in sampling messages.
	* This includes text, image, audio, tool use requests, and tool results.
	*/
	const SamplingMessageContentBlockSchema = discriminatedUnion("type", [
		TextContentSchema,
		ImageContentSchema,
		AudioContentSchema,
		ToolUseContentSchema,
		ToolResultContentSchema
	]);
	/**
	* Describes a message issued to or received from an LLM API.
	*/
	const SamplingMessageSchema = object({
		role: RoleSchema,
		content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)]),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* Parameters for a `sampling/createMessage` request.
	*/
	const CreateMessageRequestParamsSchema = TaskAugmentedRequestParamsSchema.extend({
		messages: array(SamplingMessageSchema),
		modelPreferences: ModelPreferencesSchema.optional(),
		systemPrompt: string().optional(),
		includeContext: _enum([
			"none",
			"thisServer",
			"allServers"
		]).optional(),
		temperature: number().optional(),
		maxTokens: number().int(),
		stopSequences: array(string()).optional(),
		metadata: AssertObjectSchema.optional(),
		tools: array(ToolSchema).optional(),
		toolChoice: ToolChoiceSchema.optional()
	});
	/**
	* A request from the server to sample an LLM via the client. The client has full discretion over which model to select. The client should also inform the user before beginning sampling, to allow them to inspect the request (human in the loop) and decide whether to approve it.
	*/
	const CreateMessageRequestSchema = RequestSchema.extend({
		method: literal("sampling/createMessage"),
		params: CreateMessageRequestParamsSchema
	});
	/**
	* The client's response to a sampling/create_message request from the server.
	* This is the backwards-compatible version that returns single content (no arrays).
	* Used when the request does not include tools.
	*/
	const CreateMessageResultSchema = ResultSchema.extend({
		model: string(),
		stopReason: optional(_enum([
			"endTurn",
			"stopSequence",
			"maxTokens"
		]).or(string())),
		role: RoleSchema,
		content: SamplingContentSchema
	});
	/**
	* The client's response to a sampling/create_message request when tools were provided.
	* This version supports array content for tool use flows.
	*/
	const CreateMessageResultWithToolsSchema = ResultSchema.extend({
		model: string(),
		stopReason: optional(_enum([
			"endTurn",
			"stopSequence",
			"maxTokens",
			"toolUse"
		]).or(string())),
		role: RoleSchema,
		content: union([SamplingMessageContentBlockSchema, array(SamplingMessageContentBlockSchema)])
	});
	/**
	* Primitive schema definition for boolean fields.
	*/
	const BooleanSchemaSchema = object({
		type: literal("boolean"),
		title: string().optional(),
		description: string().optional(),
		default: boolean().optional()
	});
	/**
	* Primitive schema definition for string fields.
	*/
	const StringSchemaSchema = object({
		type: literal("string"),
		title: string().optional(),
		description: string().optional(),
		minLength: number().optional(),
		maxLength: number().optional(),
		format: _enum([
			"email",
			"uri",
			"date",
			"date-time"
		]).optional(),
		default: string().optional()
	});
	/**
	* Primitive schema definition for number fields.
	*/
	const NumberSchemaSchema = object({
		type: _enum(["number", "integer"]),
		title: string().optional(),
		description: string().optional(),
		minimum: number().optional(),
		maximum: number().optional(),
		default: number().optional()
	});
	/**
	* Schema for single-selection enumeration without display titles for options.
	*/
	const UntitledSingleSelectEnumSchemaSchema = object({
		type: literal("string"),
		title: string().optional(),
		description: string().optional(),
		enum: array(string()),
		default: string().optional()
	});
	/**
	* Schema for single-selection enumeration with display titles for each option.
	*/
	const TitledSingleSelectEnumSchemaSchema = object({
		type: literal("string"),
		title: string().optional(),
		description: string().optional(),
		oneOf: array(object({
			const: string(),
			title: string()
		})),
		default: string().optional()
	});
	/**
	* Use TitledSingleSelectEnumSchema instead.
	* This interface will be removed in a future version.
	*/
	const LegacyTitledEnumSchemaSchema = object({
		type: literal("string"),
		title: string().optional(),
		description: string().optional(),
		enum: array(string()),
		enumNames: array(string()).optional(),
		default: string().optional()
	});
	const SingleSelectEnumSchemaSchema = union([UntitledSingleSelectEnumSchemaSchema, TitledSingleSelectEnumSchemaSchema]);
	/**
	* Schema for multiple-selection enumeration without display titles for options.
	*/
	const UntitledMultiSelectEnumSchemaSchema = object({
		type: literal("array"),
		title: string().optional(),
		description: string().optional(),
		minItems: number().optional(),
		maxItems: number().optional(),
		items: object({
			type: literal("string"),
			enum: array(string())
		}),
		default: array(string()).optional()
	});
	/**
	* Schema for multiple-selection enumeration with display titles for each option.
	*/
	const TitledMultiSelectEnumSchemaSchema = object({
		type: literal("array"),
		title: string().optional(),
		description: string().optional(),
		minItems: number().optional(),
		maxItems: number().optional(),
		items: object({ anyOf: array(object({
			const: string(),
			title: string()
		})) }),
		default: array(string()).optional()
	});
	/**
	* Combined schema for multiple-selection enumeration
	*/
	const MultiSelectEnumSchemaSchema = union([UntitledMultiSelectEnumSchemaSchema, TitledMultiSelectEnumSchemaSchema]);
	/**
	* Primitive schema definition for enum fields.
	*/
	const EnumSchemaSchema = union([
		LegacyTitledEnumSchemaSchema,
		SingleSelectEnumSchemaSchema,
		MultiSelectEnumSchemaSchema
	]);
	/**
	* Union of all primitive schema definitions.
	*/
	const PrimitiveSchemaDefinitionSchema = union([
		EnumSchemaSchema,
		BooleanSchemaSchema,
		StringSchemaSchema,
		NumberSchemaSchema
	]);
	/**
	* Parameters for an `elicitation/create` request for form-based elicitation.
	*/
	const ElicitRequestFormParamsSchema = TaskAugmentedRequestParamsSchema.extend({
		mode: literal("form").optional(),
		message: string(),
		requestedSchema: object({
			type: literal("object"),
			properties: record(string(), PrimitiveSchemaDefinitionSchema),
			required: array(string()).optional()
		})
	});
	/**
	* Parameters for an `elicitation/create` request for URL-based elicitation.
	*/
	const ElicitRequestURLParamsSchema = TaskAugmentedRequestParamsSchema.extend({
		mode: literal("url"),
		message: string(),
		elicitationId: string(),
		url: string().url()
	});
	/**
	* The parameters for a request to elicit additional information from the user via the client.
	*/
	const ElicitRequestParamsSchema = union([ElicitRequestFormParamsSchema, ElicitRequestURLParamsSchema]);
	/**
	* A request from the server to elicit user input via the client.
	* The client should present the message and form fields to the user (form mode)
	* or navigate to a URL (URL mode).
	*/
	const ElicitRequestSchema = RequestSchema.extend({
		method: literal("elicitation/create"),
		params: ElicitRequestParamsSchema
	});
	/**
	* Parameters for a `notifications/elicitation/complete` notification.
	*
	* @category notifications/elicitation/complete
	*/
	const ElicitationCompleteNotificationParamsSchema = NotificationsParamsSchema.extend({ elicitationId: string() });
	/**
	* A notification from the server to the client, informing it of a completion of an out-of-band elicitation request.
	*
	* @category notifications/elicitation/complete
	*/
	const ElicitationCompleteNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/elicitation/complete"),
		params: ElicitationCompleteNotificationParamsSchema
	});
	/**
	* The client's response to an elicitation/create request from the server.
	*/
	const ElicitResultSchema = ResultSchema.extend({
		action: _enum([
			"accept",
			"decline",
			"cancel"
		]),
		content: preprocess((val) => val === null ? void 0 : val, record(string(), union([
			string(),
			number(),
			boolean(),
			array(string())
		])).optional())
	});
	/**
	* A reference to a resource or resource template definition.
	*/
	const ResourceTemplateReferenceSchema = object({
		type: literal("ref/resource"),
		uri: string()
	});
	/**
	* Identifies a prompt.
	*/
	const PromptReferenceSchema = object({
		type: literal("ref/prompt"),
		name: string()
	});
	/**
	* Parameters for a `completion/complete` request.
	*/
	const CompleteRequestParamsSchema = BaseRequestParamsSchema.extend({
		ref: union([PromptReferenceSchema, ResourceTemplateReferenceSchema]),
		argument: object({
			name: string(),
			value: string()
		}),
		context: object({ arguments: record(string(), string()).optional() }).optional()
	});
	/**
	* A request from the client to the server, to ask for completion options.
	*/
	const CompleteRequestSchema = RequestSchema.extend({
		method: literal("completion/complete"),
		params: CompleteRequestParamsSchema
	});
	function assertCompleteRequestPrompt(request) {
		if (request.params.ref.type !== "ref/prompt") throw new TypeError(`Expected CompleteRequestPrompt, but got ${request.params.ref.type}`);
	}
	function assertCompleteRequestResourceTemplate(request) {
		if (request.params.ref.type !== "ref/resource") throw new TypeError(`Expected CompleteRequestResourceTemplate, but got ${request.params.ref.type}`);
	}
	/**
	* The server's response to a completion/complete request
	*/
	const CompleteResultSchema = ResultSchema.extend({ completion: looseObject({
		values: array(string()).max(100),
		total: optional(number().int()),
		hasMore: optional(boolean())
	}) });
	/**
	* Represents a root directory or file that the server can operate on.
	*/
	const RootSchema = object({
		uri: string().startsWith("file://"),
		name: string().optional(),
		_meta: record(string(), unknown()).optional()
	});
	/**
	* Sent from the server to request a list of root URIs from the client.
	*/
	const ListRootsRequestSchema = RequestSchema.extend({
		method: literal("roots/list"),
		params: BaseRequestParamsSchema.optional()
	});
	/**
	* The client's response to a roots/list request from the server.
	*/
	const ListRootsResultSchema = ResultSchema.extend({ roots: array(RootSchema) });
	/**
	* A notification from the client to the server, informing it that the list of roots has changed.
	*/
	const RootsListChangedNotificationSchema = NotificationSchema.extend({
		method: literal("notifications/roots/list_changed"),
		params: NotificationsParamsSchema.optional()
	});
	union([
		PingRequestSchema,
		InitializeRequestSchema,
		CompleteRequestSchema,
		SetLevelRequestSchema,
		GetPromptRequestSchema,
		ListPromptsRequestSchema,
		ListResourcesRequestSchema,
		ListResourceTemplatesRequestSchema,
		ReadResourceRequestSchema,
		SubscribeRequestSchema,
		UnsubscribeRequestSchema,
		CallToolRequestSchema,
		ListToolsRequestSchema,
		GetTaskRequestSchema,
		GetTaskPayloadRequestSchema,
		ListTasksRequestSchema,
		CancelTaskRequestSchema
	]);
	union([
		CancelledNotificationSchema,
		ProgressNotificationSchema,
		InitializedNotificationSchema,
		RootsListChangedNotificationSchema,
		TaskStatusNotificationSchema
	]);
	union([
		EmptyResultSchema,
		CreateMessageResultSchema,
		CreateMessageResultWithToolsSchema,
		ElicitResultSchema,
		ListRootsResultSchema,
		GetTaskResultSchema,
		ListTasksResultSchema,
		CreateTaskResultSchema
	]);
	union([
		PingRequestSchema,
		CreateMessageRequestSchema,
		ElicitRequestSchema,
		ListRootsRequestSchema,
		GetTaskRequestSchema,
		GetTaskPayloadRequestSchema,
		ListTasksRequestSchema,
		CancelTaskRequestSchema
	]);
	union([
		CancelledNotificationSchema,
		ProgressNotificationSchema,
		LoggingMessageNotificationSchema,
		ResourceUpdatedNotificationSchema,
		ResourceListChangedNotificationSchema,
		ToolListChangedNotificationSchema,
		PromptListChangedNotificationSchema,
		TaskStatusNotificationSchema,
		ElicitationCompleteNotificationSchema
	]);
	union([
		EmptyResultSchema,
		InitializeResultSchema,
		CompleteResultSchema,
		GetPromptResultSchema,
		ListPromptsResultSchema,
		ListResourcesResultSchema,
		ListResourceTemplatesResultSchema,
		ReadResourceResultSchema,
		CallToolResultSchema,
		ListToolsResultSchema,
		GetTaskResultSchema,
		ListTasksResultSchema,
		CreateTaskResultSchema
	]);
	var McpError = class McpError extends Error {
		constructor(code, message, data) {
			super(`MCP error ${code}: ${message}`);
			this.code = code;
			this.data = data;
			this.name = "McpError";
		}
		/**
		* Factory method to create the appropriate error type based on the error code and data
		*/
		static fromError(code, message, data) {
			if (code === ErrorCode.UrlElicitationRequired && data) {
				const errorData = data;
				if (errorData.elicitations) return new UrlElicitationRequiredError(errorData.elicitations, message);
			}
			return new McpError(code, message, data);
		}
	};
	/**
	* Specialized error type when a tool requires a URL mode elicitation.
	* This makes it nicer for the client to handle since there is specific data to work with instead of just a code to check against.
	*/
	var UrlElicitationRequiredError = class extends McpError {
		constructor(elicitations, message = `URL elicitation${elicitations.length > 1 ? "s" : ""} required`) {
			super(ErrorCode.UrlElicitationRequired, message, { elicitations });
		}
		get elicitations() {
			return this.data?.elicitations ?? [];
		}
	};
	/**
	* Experimental task interfaces for MCP SDK.
	* WARNING: These APIs are experimental and may change without notice.
	*/
	/**
	* Checks if a task status represents a terminal state.
	* Terminal states are those where the task has finished and will not change.
	*
	* @param status - The task status to check
	* @returns True if the status is terminal (completed, failed, or cancelled)
	* @experimental
	*/
	function isTerminal(status) {
		return status === "completed" || status === "failed" || status === "cancelled";
	}
	function mapMiniTarget(t) {
		if (!t) return "draft-7";
		if (t === "jsonSchema7" || t === "draft-7") return "draft-7";
		if (t === "jsonSchema2019-09" || t === "draft-2020-12") return "draft-2020-12";
		return "draft-7";
	}
	function toJsonSchemaCompat(schema, opts) {
		if (isZ4Schema(schema)) return toJSONSchema(schema, {
			target: mapMiniTarget(opts?.target),
			io: opts?.pipeStrategy ?? "input"
		});
		return zodToJsonSchema(schema, {
			strictUnions: opts?.strictUnions ?? true,
			pipeStrategy: opts?.pipeStrategy ?? "input"
		});
	}
	function getMethodLiteral(schema) {
		const methodSchema = getObjectShape(schema)?.method;
		if (!methodSchema) throw new Error("Schema is missing a method literal");
		const value = getLiteralValue(methodSchema);
		if (typeof value !== "string") throw new Error("Schema method literal must be a string");
		return value;
	}
	function parseWithCompat(schema, data) {
		const result = safeParse(schema, data);
		if (!result.success) throw result.error;
		return result.data;
	}
	/**
	* The default request timeout, in miliseconds.
	*/
	const DEFAULT_REQUEST_TIMEOUT_MSEC = 6e4;
	/**
	* Implements MCP protocol framing on top of a pluggable transport, including
	* features like request/response linking, notifications, and progress.
	*/
	var Protocol = class {
		constructor(_options) {
			this._options = _options;
			this._requestMessageId = 0;
			this._requestHandlers = /* @__PURE__ */ new Map();
			this._requestHandlerAbortControllers = /* @__PURE__ */ new Map();
			this._notificationHandlers = /* @__PURE__ */ new Map();
			this._responseHandlers = /* @__PURE__ */ new Map();
			this._progressHandlers = /* @__PURE__ */ new Map();
			this._timeoutInfo = /* @__PURE__ */ new Map();
			this._pendingDebouncedNotifications = /* @__PURE__ */ new Set();
			this._taskProgressTokens = /* @__PURE__ */ new Map();
			this._requestResolvers = /* @__PURE__ */ new Map();
			this.setNotificationHandler(CancelledNotificationSchema, (notification) => {
				this._oncancel(notification);
			});
			this.setNotificationHandler(ProgressNotificationSchema, (notification) => {
				this._onprogress(notification);
			});
			this.setRequestHandler(PingRequestSchema, (_request) => ({}));
			this._taskStore = _options?.taskStore;
			this._taskMessageQueue = _options?.taskMessageQueue;
			if (this._taskStore) {
				this.setRequestHandler(GetTaskRequestSchema, async (request, extra) => {
					const task = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
					if (!task) throw new McpError(ErrorCode.InvalidParams, "Failed to retrieve task: Task not found");
					return { ...task };
				});
				this.setRequestHandler(GetTaskPayloadRequestSchema, async (request, extra) => {
					const handleTaskResult = async () => {
						const taskId = request.params.taskId;
						if (this._taskMessageQueue) {
							let queuedMessage;
							while (queuedMessage = await this._taskMessageQueue.dequeue(taskId, extra.sessionId)) {
								if (queuedMessage.type === "response" || queuedMessage.type === "error") {
									const message = queuedMessage.message;
									const requestId = message.id;
									const resolver = this._requestResolvers.get(requestId);
									if (resolver) {
										this._requestResolvers.delete(requestId);
										if (queuedMessage.type === "response") resolver(message);
										else {
											const errorMessage = message;
											resolver(new McpError(errorMessage.error.code, errorMessage.error.message, errorMessage.error.data));
										}
									} else {
										const messageType = queuedMessage.type === "response" ? "Response" : "Error";
										this._onerror(/* @__PURE__ */ new Error(`${messageType} handler missing for request ${requestId}`));
									}
									continue;
								}
								await this._transport?.send(queuedMessage.message, { relatedRequestId: extra.requestId });
							}
						}
						const task = await this._taskStore.getTask(taskId, extra.sessionId);
						if (!task) throw new McpError(ErrorCode.InvalidParams, `Task not found: ${taskId}`);
						if (!isTerminal(task.status)) {
							await this._waitForTaskUpdate(taskId, extra.signal);
							return await handleTaskResult();
						}
						if (isTerminal(task.status)) {
							const result = await this._taskStore.getTaskResult(taskId, extra.sessionId);
							this._clearTaskQueue(taskId);
							return {
								...result,
								_meta: {
									...result._meta,
									[RELATED_TASK_META_KEY]: { taskId }
								}
							};
						}
						return await handleTaskResult();
					};
					return await handleTaskResult();
				});
				this.setRequestHandler(ListTasksRequestSchema, async (request, extra) => {
					try {
						const { tasks, nextCursor } = await this._taskStore.listTasks(request.params?.cursor, extra.sessionId);
						return {
							tasks,
							nextCursor,
							_meta: {}
						};
					} catch (error) {
						throw new McpError(ErrorCode.InvalidParams, `Failed to list tasks: ${error instanceof Error ? error.message : String(error)}`);
					}
				});
				this.setRequestHandler(CancelTaskRequestSchema, async (request, extra) => {
					try {
						const task = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
						if (!task) throw new McpError(ErrorCode.InvalidParams, `Task not found: ${request.params.taskId}`);
						if (isTerminal(task.status)) throw new McpError(ErrorCode.InvalidParams, `Cannot cancel task in terminal status: ${task.status}`);
						await this._taskStore.updateTaskStatus(request.params.taskId, "cancelled", "Client cancelled task execution.", extra.sessionId);
						this._clearTaskQueue(request.params.taskId);
						const cancelledTask = await this._taskStore.getTask(request.params.taskId, extra.sessionId);
						if (!cancelledTask) throw new McpError(ErrorCode.InvalidParams, `Task not found after cancellation: ${request.params.taskId}`);
						return {
							_meta: {},
							...cancelledTask
						};
					} catch (error) {
						if (error instanceof McpError) throw error;
						throw new McpError(ErrorCode.InvalidRequest, `Failed to cancel task: ${error instanceof Error ? error.message : String(error)}`);
					}
				});
			}
		}
		async _oncancel(notification) {
			if (!notification.params.requestId) return;
			this._requestHandlerAbortControllers.get(notification.params.requestId)?.abort(notification.params.reason);
		}
		_setupTimeout(messageId, timeout, maxTotalTimeout, onTimeout, resetTimeoutOnProgress = false) {
			this._timeoutInfo.set(messageId, {
				timeoutId: setTimeout(onTimeout, timeout),
				startTime: Date.now(),
				timeout,
				maxTotalTimeout,
				resetTimeoutOnProgress,
				onTimeout
			});
		}
		_resetTimeout(messageId) {
			const info = this._timeoutInfo.get(messageId);
			if (!info) return false;
			const totalElapsed = Date.now() - info.startTime;
			if (info.maxTotalTimeout && totalElapsed >= info.maxTotalTimeout) {
				this._timeoutInfo.delete(messageId);
				throw McpError.fromError(ErrorCode.RequestTimeout, "Maximum total timeout exceeded", {
					maxTotalTimeout: info.maxTotalTimeout,
					totalElapsed
				});
			}
			clearTimeout(info.timeoutId);
			info.timeoutId = setTimeout(info.onTimeout, info.timeout);
			return true;
		}
		_cleanupTimeout(messageId) {
			const info = this._timeoutInfo.get(messageId);
			if (info) {
				clearTimeout(info.timeoutId);
				this._timeoutInfo.delete(messageId);
			}
		}
		/**
		* Attaches to the given transport, starts it, and starts listening for messages.
		*
		* The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
		*/
		async connect(transport) {
			if (this._transport) throw new Error("Already connected to a transport. Call close() before connecting to a new transport, or use a separate Protocol instance per connection.");
			this._transport = transport;
			const _onclose = this.transport?.onclose;
			this._transport.onclose = () => {
				_onclose?.();
				this._onclose();
			};
			const _onerror = this.transport?.onerror;
			this._transport.onerror = (error) => {
				_onerror?.(error);
				this._onerror(error);
			};
			const _onmessage = this._transport?.onmessage;
			this._transport.onmessage = (message, extra) => {
				_onmessage?.(message, extra);
				if (isJSONRPCResultResponse(message) || isJSONRPCErrorResponse(message)) this._onresponse(message);
				else if (isJSONRPCRequest(message)) this._onrequest(message, extra);
				else if (isJSONRPCNotification(message)) this._onnotification(message);
				else this._onerror(/* @__PURE__ */ new Error(`Unknown message type: ${JSON.stringify(message)}`));
			};
			await this._transport.start();
		}
		_onclose() {
			const responseHandlers = this._responseHandlers;
			this._responseHandlers = /* @__PURE__ */ new Map();
			this._progressHandlers.clear();
			this._taskProgressTokens.clear();
			this._pendingDebouncedNotifications.clear();
			for (const controller of this._requestHandlerAbortControllers.values()) controller.abort();
			this._requestHandlerAbortControllers.clear();
			const error = McpError.fromError(ErrorCode.ConnectionClosed, "Connection closed");
			this._transport = void 0;
			this.onclose?.();
			for (const handler of responseHandlers.values()) handler(error);
		}
		_onerror(error) {
			this.onerror?.(error);
		}
		_onnotification(notification) {
			const handler = this._notificationHandlers.get(notification.method) ?? this.fallbackNotificationHandler;
			if (handler === void 0) return;
			Promise.resolve().then(() => handler(notification)).catch((error) => this._onerror(/* @__PURE__ */ new Error(`Uncaught error in notification handler: ${error}`)));
		}
		_onrequest(request, extra) {
			const handler = this._requestHandlers.get(request.method) ?? this.fallbackRequestHandler;
			const capturedTransport = this._transport;
			const relatedTaskId = request.params?._meta?.[RELATED_TASK_META_KEY]?.taskId;
			if (handler === void 0) {
				const errorResponse = {
					jsonrpc: "2.0",
					id: request.id,
					error: {
						code: ErrorCode.MethodNotFound,
						message: "Method not found"
					}
				};
				if (relatedTaskId && this._taskMessageQueue) this._enqueueTaskMessage(relatedTaskId, {
					type: "error",
					message: errorResponse,
					timestamp: Date.now()
				}, capturedTransport?.sessionId).catch((error) => this._onerror(/* @__PURE__ */ new Error(`Failed to enqueue error response: ${error}`)));
				else capturedTransport?.send(errorResponse).catch((error) => this._onerror(/* @__PURE__ */ new Error(`Failed to send an error response: ${error}`)));
				return;
			}
			const abortController = new AbortController();
			this._requestHandlerAbortControllers.set(request.id, abortController);
			const taskCreationParams = isTaskAugmentedRequestParams(request.params) ? request.params.task : void 0;
			const taskStore = this._taskStore ? this.requestTaskStore(request, capturedTransport?.sessionId) : void 0;
			const fullExtra = {
				signal: abortController.signal,
				sessionId: capturedTransport?.sessionId,
				_meta: request.params?._meta,
				sendNotification: async (notification) => {
					if (abortController.signal.aborted) return;
					const notificationOptions = { relatedRequestId: request.id };
					if (relatedTaskId) notificationOptions.relatedTask = { taskId: relatedTaskId };
					await this.notification(notification, notificationOptions);
				},
				sendRequest: async (r, resultSchema, options) => {
					if (abortController.signal.aborted) throw new McpError(ErrorCode.ConnectionClosed, "Request was cancelled");
					const requestOptions = {
						...options,
						relatedRequestId: request.id
					};
					if (relatedTaskId && !requestOptions.relatedTask) requestOptions.relatedTask = { taskId: relatedTaskId };
					const effectiveTaskId = requestOptions.relatedTask?.taskId ?? relatedTaskId;
					if (effectiveTaskId && taskStore) await taskStore.updateTaskStatus(effectiveTaskId, "input_required");
					return await this.request(r, resultSchema, requestOptions);
				},
				authInfo: extra?.authInfo,
				requestId: request.id,
				requestInfo: extra?.requestInfo,
				taskId: relatedTaskId,
				taskStore,
				taskRequestedTtl: taskCreationParams?.ttl,
				closeSSEStream: extra?.closeSSEStream,
				closeStandaloneSSEStream: extra?.closeStandaloneSSEStream
			};
			Promise.resolve().then(() => {
				if (taskCreationParams) this.assertTaskHandlerCapability(request.method);
			}).then(() => handler(request, fullExtra)).then(async (result) => {
				if (abortController.signal.aborted) return;
				const response = {
					result,
					jsonrpc: "2.0",
					id: request.id
				};
				if (relatedTaskId && this._taskMessageQueue) await this._enqueueTaskMessage(relatedTaskId, {
					type: "response",
					message: response,
					timestamp: Date.now()
				}, capturedTransport?.sessionId);
				else await capturedTransport?.send(response);
			}, async (error) => {
				if (abortController.signal.aborted) return;
				const errorResponse = {
					jsonrpc: "2.0",
					id: request.id,
					error: {
						code: Number.isSafeInteger(error["code"]) ? error["code"] : ErrorCode.InternalError,
						message: error.message ?? "Internal error",
						...error["data"] !== void 0 && { data: error["data"] }
					}
				};
				if (relatedTaskId && this._taskMessageQueue) await this._enqueueTaskMessage(relatedTaskId, {
					type: "error",
					message: errorResponse,
					timestamp: Date.now()
				}, capturedTransport?.sessionId);
				else await capturedTransport?.send(errorResponse);
			}).catch((error) => this._onerror(/* @__PURE__ */ new Error(`Failed to send response: ${error}`))).finally(() => {
				this._requestHandlerAbortControllers.delete(request.id);
			});
		}
		_onprogress(notification) {
			const { progressToken, ...params } = notification.params;
			const messageId = Number(progressToken);
			const handler = this._progressHandlers.get(messageId);
			if (!handler) {
				this._onerror(/* @__PURE__ */ new Error(`Received a progress notification for an unknown token: ${JSON.stringify(notification)}`));
				return;
			}
			const responseHandler = this._responseHandlers.get(messageId);
			const timeoutInfo = this._timeoutInfo.get(messageId);
			if (timeoutInfo && responseHandler && timeoutInfo.resetTimeoutOnProgress) try {
				this._resetTimeout(messageId);
			} catch (error) {
				this._responseHandlers.delete(messageId);
				this._progressHandlers.delete(messageId);
				this._cleanupTimeout(messageId);
				responseHandler(error);
				return;
			}
			handler(params);
		}
		_onresponse(response) {
			const messageId = Number(response.id);
			const resolver = this._requestResolvers.get(messageId);
			if (resolver) {
				this._requestResolvers.delete(messageId);
				if (isJSONRPCResultResponse(response)) resolver(response);
				else resolver(new McpError(response.error.code, response.error.message, response.error.data));
				return;
			}
			const handler = this._responseHandlers.get(messageId);
			if (handler === void 0) {
				this._onerror(/* @__PURE__ */ new Error(`Received a response for an unknown message ID: ${JSON.stringify(response)}`));
				return;
			}
			this._responseHandlers.delete(messageId);
			this._cleanupTimeout(messageId);
			let isTaskResponse = false;
			if (isJSONRPCResultResponse(response) && response.result && typeof response.result === "object") {
				const result = response.result;
				if (result.task && typeof result.task === "object") {
					const task = result.task;
					if (typeof task.taskId === "string") {
						isTaskResponse = true;
						this._taskProgressTokens.set(task.taskId, messageId);
					}
				}
			}
			if (!isTaskResponse) this._progressHandlers.delete(messageId);
			if (isJSONRPCResultResponse(response)) handler(response);
			else handler(McpError.fromError(response.error.code, response.error.message, response.error.data));
		}
		get transport() {
			return this._transport;
		}
		/**
		* Closes the connection.
		*/
		async close() {
			await this._transport?.close();
		}
		/**
		* Sends a request and returns an AsyncGenerator that yields response messages.
		* The generator is guaranteed to end with either a 'result' or 'error' message.
		*
		* @example
		* ```typescript
		* const stream = protocol.requestStream(request, resultSchema, options);
		* for await (const message of stream) {
		*   switch (message.type) {
		*     case 'taskCreated':
		*       console.log('Task created:', message.task.taskId);
		*       break;
		*     case 'taskStatus':
		*       console.log('Task status:', message.task.status);
		*       break;
		*     case 'result':
		*       console.log('Final result:', message.result);
		*       break;
		*     case 'error':
		*       console.error('Error:', message.error);
		*       break;
		*   }
		* }
		* ```
		*
		* @experimental Use `client.experimental.tasks.requestStream()` to access this method.
		*/
		async *requestStream(request, resultSchema, options) {
			const { task } = options ?? {};
			if (!task) {
				try {
					yield {
						type: "result",
						result: await this.request(request, resultSchema, options)
					};
				} catch (error) {
					yield {
						type: "error",
						error: error instanceof McpError ? error : new McpError(ErrorCode.InternalError, String(error))
					};
				}
				return;
			}
			let taskId;
			try {
				const createResult = await this.request(request, CreateTaskResultSchema, options);
				if (createResult.task) {
					taskId = createResult.task.taskId;
					yield {
						type: "taskCreated",
						task: createResult.task
					};
				} else throw new McpError(ErrorCode.InternalError, "Task creation did not return a task");
				while (true) {
					const task$1 = await this.getTask({ taskId }, options);
					yield {
						type: "taskStatus",
						task: task$1
					};
					if (isTerminal(task$1.status)) {
						if (task$1.status === "completed") yield {
							type: "result",
							result: await this.getTaskResult({ taskId }, resultSchema, options)
						};
						else if (task$1.status === "failed") yield {
							type: "error",
							error: new McpError(ErrorCode.InternalError, `Task ${taskId} failed`)
						};
						else if (task$1.status === "cancelled") yield {
							type: "error",
							error: new McpError(ErrorCode.InternalError, `Task ${taskId} was cancelled`)
						};
						return;
					}
					if (task$1.status === "input_required") {
						yield {
							type: "result",
							result: await this.getTaskResult({ taskId }, resultSchema, options)
						};
						return;
					}
					const pollInterval = task$1.pollInterval ?? this._options?.defaultTaskPollInterval ?? 1e3;
					await new Promise((resolve) => setTimeout(resolve, pollInterval));
					options?.signal?.throwIfAborted();
				}
			} catch (error) {
				yield {
					type: "error",
					error: error instanceof McpError ? error : new McpError(ErrorCode.InternalError, String(error))
				};
			}
		}
		/**
		* Sends a request and waits for a response.
		*
		* Do not use this method to emit notifications! Use notification() instead.
		*/
		request(request, resultSchema, options) {
			const { relatedRequestId, resumptionToken, onresumptiontoken, task, relatedTask } = options ?? {};
			return new Promise((resolve, reject) => {
				const earlyReject = (error) => {
					reject(error);
				};
				if (!this._transport) {
					earlyReject(/* @__PURE__ */ new Error("Not connected"));
					return;
				}
				if (this._options?.enforceStrictCapabilities === true) try {
					this.assertCapabilityForMethod(request.method);
					if (task) this.assertTaskCapability(request.method);
				} catch (e) {
					earlyReject(e);
					return;
				}
				options?.signal?.throwIfAborted();
				const messageId = this._requestMessageId++;
				const jsonrpcRequest = {
					...request,
					jsonrpc: "2.0",
					id: messageId
				};
				if (options?.onprogress) {
					this._progressHandlers.set(messageId, options.onprogress);
					jsonrpcRequest.params = {
						...request.params,
						_meta: {
							...request.params?._meta || {},
							progressToken: messageId
						}
					};
				}
				if (task) jsonrpcRequest.params = {
					...jsonrpcRequest.params,
					task
				};
				if (relatedTask) jsonrpcRequest.params = {
					...jsonrpcRequest.params,
					_meta: {
						...jsonrpcRequest.params?._meta || {},
						[RELATED_TASK_META_KEY]: relatedTask
					}
				};
				const cancel = (reason) => {
					this._responseHandlers.delete(messageId);
					this._progressHandlers.delete(messageId);
					this._cleanupTimeout(messageId);
					this._transport?.send({
						jsonrpc: "2.0",
						method: "notifications/cancelled",
						params: {
							requestId: messageId,
							reason: String(reason)
						}
					}, {
						relatedRequestId,
						resumptionToken,
						onresumptiontoken
					}).catch((error) => this._onerror(/* @__PURE__ */ new Error(`Failed to send cancellation: ${error}`)));
					reject(reason instanceof McpError ? reason : new McpError(ErrorCode.RequestTimeout, String(reason)));
				};
				this._responseHandlers.set(messageId, (response) => {
					if (options?.signal?.aborted) return;
					if (response instanceof Error) return reject(response);
					try {
						const parseResult = safeParse(resultSchema, response.result);
						if (!parseResult.success) reject(parseResult.error);
						else resolve(parseResult.data);
					} catch (error) {
						reject(error);
					}
				});
				options?.signal?.addEventListener("abort", () => {
					cancel(options?.signal?.reason);
				});
				const timeout = options?.timeout ?? DEFAULT_REQUEST_TIMEOUT_MSEC;
				const timeoutHandler = () => cancel(McpError.fromError(ErrorCode.RequestTimeout, "Request timed out", { timeout }));
				this._setupTimeout(messageId, timeout, options?.maxTotalTimeout, timeoutHandler, options?.resetTimeoutOnProgress ?? false);
				const relatedTaskId = relatedTask?.taskId;
				if (relatedTaskId) {
					const responseResolver = (response) => {
						const handler = this._responseHandlers.get(messageId);
						if (handler) handler(response);
						else this._onerror(/* @__PURE__ */ new Error(`Response handler missing for side-channeled request ${messageId}`));
					};
					this._requestResolvers.set(messageId, responseResolver);
					this._enqueueTaskMessage(relatedTaskId, {
						type: "request",
						message: jsonrpcRequest,
						timestamp: Date.now()
					}).catch((error) => {
						this._cleanupTimeout(messageId);
						reject(error);
					});
				} else this._transport.send(jsonrpcRequest, {
					relatedRequestId,
					resumptionToken,
					onresumptiontoken
				}).catch((error) => {
					this._cleanupTimeout(messageId);
					reject(error);
				});
			});
		}
		/**
		* Gets the current status of a task.
		*
		* @experimental Use `client.experimental.tasks.getTask()` to access this method.
		*/
		async getTask(params, options) {
			return this.request({
				method: "tasks/get",
				params
			}, GetTaskResultSchema, options);
		}
		/**
		* Retrieves the result of a completed task.
		*
		* @experimental Use `client.experimental.tasks.getTaskResult()` to access this method.
		*/
		async getTaskResult(params, resultSchema, options) {
			return this.request({
				method: "tasks/result",
				params
			}, resultSchema, options);
		}
		/**
		* Lists tasks, optionally starting from a pagination cursor.
		*
		* @experimental Use `client.experimental.tasks.listTasks()` to access this method.
		*/
		async listTasks(params, options) {
			return this.request({
				method: "tasks/list",
				params
			}, ListTasksResultSchema, options);
		}
		/**
		* Cancels a specific task.
		*
		* @experimental Use `client.experimental.tasks.cancelTask()` to access this method.
		*/
		async cancelTask(params, options) {
			return this.request({
				method: "tasks/cancel",
				params
			}, CancelTaskResultSchema, options);
		}
		/**
		* Emits a notification, which is a one-way message that does not expect a response.
		*/
		async notification(notification, options) {
			if (!this._transport) throw new Error("Not connected");
			this.assertNotificationCapability(notification.method);
			const relatedTaskId = options?.relatedTask?.taskId;
			if (relatedTaskId) {
				const jsonrpcNotification$1 = {
					...notification,
					jsonrpc: "2.0",
					params: {
						...notification.params,
						_meta: {
							...notification.params?._meta || {},
							[RELATED_TASK_META_KEY]: options.relatedTask
						}
					}
				};
				await this._enqueueTaskMessage(relatedTaskId, {
					type: "notification",
					message: jsonrpcNotification$1,
					timestamp: Date.now()
				});
				return;
			}
			if ((this._options?.debouncedNotificationMethods ?? []).includes(notification.method) && !notification.params && !options?.relatedRequestId && !options?.relatedTask) {
				if (this._pendingDebouncedNotifications.has(notification.method)) return;
				this._pendingDebouncedNotifications.add(notification.method);
				Promise.resolve().then(() => {
					this._pendingDebouncedNotifications.delete(notification.method);
					if (!this._transport) return;
					let jsonrpcNotification$1 = {
						...notification,
						jsonrpc: "2.0"
					};
					if (options?.relatedTask) jsonrpcNotification$1 = {
						...jsonrpcNotification$1,
						params: {
							...jsonrpcNotification$1.params,
							_meta: {
								...jsonrpcNotification$1.params?._meta || {},
								[RELATED_TASK_META_KEY]: options.relatedTask
							}
						}
					};
					this._transport?.send(jsonrpcNotification$1, options).catch((error) => this._onerror(error));
				});
				return;
			}
			let jsonrpcNotification = {
				...notification,
				jsonrpc: "2.0"
			};
			if (options?.relatedTask) jsonrpcNotification = {
				...jsonrpcNotification,
				params: {
					...jsonrpcNotification.params,
					_meta: {
						...jsonrpcNotification.params?._meta || {},
						[RELATED_TASK_META_KEY]: options.relatedTask
					}
				}
			};
			await this._transport.send(jsonrpcNotification, options);
		}
		/**
		* Registers a handler to invoke when this protocol object receives a request with the given method.
		*
		* Note that this will replace any previous request handler for the same method.
		*/
		setRequestHandler(requestSchema, handler) {
			const method = getMethodLiteral(requestSchema);
			this.assertRequestHandlerCapability(method);
			this._requestHandlers.set(method, (request, extra) => {
				const parsed = parseWithCompat(requestSchema, request);
				return Promise.resolve(handler(parsed, extra));
			});
		}
		/**
		* Removes the request handler for the given method.
		*/
		removeRequestHandler(method) {
			this._requestHandlers.delete(method);
		}
		/**
		* Asserts that a request handler has not already been set for the given method, in preparation for a new one being automatically installed.
		*/
		assertCanSetRequestHandler(method) {
			if (this._requestHandlers.has(method)) throw new Error(`A request handler for ${method} already exists, which would be overridden`);
		}
		/**
		* Registers a handler to invoke when this protocol object receives a notification with the given method.
		*
		* Note that this will replace any previous notification handler for the same method.
		*/
		setNotificationHandler(notificationSchema, handler) {
			const method = getMethodLiteral(notificationSchema);
			this._notificationHandlers.set(method, (notification) => {
				const parsed = parseWithCompat(notificationSchema, notification);
				return Promise.resolve(handler(parsed));
			});
		}
		/**
		* Removes the notification handler for the given method.
		*/
		removeNotificationHandler(method) {
			this._notificationHandlers.delete(method);
		}
		/**
		* Cleans up the progress handler associated with a task.
		* This should be called when a task reaches a terminal status.
		*/
		_cleanupTaskProgressHandler(taskId) {
			const progressToken = this._taskProgressTokens.get(taskId);
			if (progressToken !== void 0) {
				this._progressHandlers.delete(progressToken);
				this._taskProgressTokens.delete(taskId);
			}
		}
		/**
		* Enqueues a task-related message for side-channel delivery via tasks/result.
		* @param taskId The task ID to associate the message with
		* @param message The message to enqueue
		* @param sessionId Optional session ID for binding the operation to a specific session
		* @throws Error if taskStore is not configured or if enqueue fails (e.g., queue overflow)
		*
		* Note: If enqueue fails, it's the TaskMessageQueue implementation's responsibility to handle
		* the error appropriately (e.g., by failing the task, logging, etc.). The Protocol layer
		* simply propagates the error.
		*/
		async _enqueueTaskMessage(taskId, message, sessionId) {
			if (!this._taskStore || !this._taskMessageQueue) throw new Error("Cannot enqueue task message: taskStore and taskMessageQueue are not configured");
			const maxQueueSize = this._options?.maxTaskQueueSize;
			await this._taskMessageQueue.enqueue(taskId, message, sessionId, maxQueueSize);
		}
		/**
		* Clears the message queue for a task and rejects any pending request resolvers.
		* @param taskId The task ID whose queue should be cleared
		* @param sessionId Optional session ID for binding the operation to a specific session
		*/
		async _clearTaskQueue(taskId, sessionId) {
			if (this._taskMessageQueue) {
				const messages = await this._taskMessageQueue.dequeueAll(taskId, sessionId);
				for (const message of messages) if (message.type === "request" && isJSONRPCRequest(message.message)) {
					const requestId = message.message.id;
					const resolver = this._requestResolvers.get(requestId);
					if (resolver) {
						resolver(new McpError(ErrorCode.InternalError, "Task cancelled or completed"));
						this._requestResolvers.delete(requestId);
					} else this._onerror(/* @__PURE__ */ new Error(`Resolver missing for request ${requestId} during task ${taskId} cleanup`));
				}
			}
		}
		/**
		* Waits for a task update (new messages or status change) with abort signal support.
		* Uses polling to check for updates at the task's configured poll interval.
		* @param taskId The task ID to wait for
		* @param signal Abort signal to cancel the wait
		* @returns Promise that resolves when an update occurs or rejects if aborted
		*/
		async _waitForTaskUpdate(taskId, signal) {
			let interval = this._options?.defaultTaskPollInterval ?? 1e3;
			try {
				const task = await this._taskStore?.getTask(taskId);
				if (task?.pollInterval) interval = task.pollInterval;
			} catch {}
			return new Promise((resolve, reject) => {
				if (signal.aborted) {
					reject(new McpError(ErrorCode.InvalidRequest, "Request cancelled"));
					return;
				}
				const timeoutId = setTimeout(resolve, interval);
				signal.addEventListener("abort", () => {
					clearTimeout(timeoutId);
					reject(new McpError(ErrorCode.InvalidRequest, "Request cancelled"));
				}, { once: true });
			});
		}
		requestTaskStore(request, sessionId) {
			const taskStore = this._taskStore;
			if (!taskStore) throw new Error("No task store configured");
			return {
				createTask: async (taskParams) => {
					if (!request) throw new Error("No request provided");
					return await taskStore.createTask(taskParams, request.id, {
						method: request.method,
						params: request.params
					}, sessionId);
				},
				getTask: async (taskId) => {
					const task = await taskStore.getTask(taskId, sessionId);
					if (!task) throw new McpError(ErrorCode.InvalidParams, "Failed to retrieve task: Task not found");
					return task;
				},
				storeTaskResult: async (taskId, status, result) => {
					await taskStore.storeTaskResult(taskId, status, result, sessionId);
					const task = await taskStore.getTask(taskId, sessionId);
					if (task) {
						const notification = TaskStatusNotificationSchema.parse({
							method: "notifications/tasks/status",
							params: task
						});
						await this.notification(notification);
						if (isTerminal(task.status)) this._cleanupTaskProgressHandler(taskId);
					}
				},
				getTaskResult: (taskId) => {
					return taskStore.getTaskResult(taskId, sessionId);
				},
				updateTaskStatus: async (taskId, status, statusMessage) => {
					const task = await taskStore.getTask(taskId, sessionId);
					if (!task) throw new McpError(ErrorCode.InvalidParams, `Task "${taskId}" not found - it may have been cleaned up`);
					if (isTerminal(task.status)) throw new McpError(ErrorCode.InvalidParams, `Cannot update task "${taskId}" from terminal status "${task.status}" to "${status}". Terminal states (completed, failed, cancelled) cannot transition to other states.`);
					await taskStore.updateTaskStatus(taskId, status, statusMessage, sessionId);
					const updatedTask = await taskStore.getTask(taskId, sessionId);
					if (updatedTask) {
						const notification = TaskStatusNotificationSchema.parse({
							method: "notifications/tasks/status",
							params: updatedTask
						});
						await this.notification(notification);
						if (isTerminal(updatedTask.status)) this._cleanupTaskProgressHandler(taskId);
					}
				},
				listTasks: (cursor) => {
					return taskStore.listTasks(cursor, sessionId);
				}
			};
		}
	};
	function isPlainObject$1(value) {
		return value !== null && typeof value === "object" && !Array.isArray(value);
	}
	function mergeCapabilities(base, additional) {
		const result = { ...base };
		for (const key in additional) {
			const k = key;
			const addValue = additional[k];
			if (addValue === void 0) continue;
			const baseValue = result[k];
			if (isPlainObject$1(baseValue) && isPlainObject$1(addValue)) result[k] = {
				...baseValue,
				...addValue
			};
			else result[k] = addValue;
		}
		return result;
	}
	/**
	* Throwing ajv stub for browser environments.
	*
	* The MCP SDK's Server class statically imports AjvJsonSchemaValidator as a
	* default fallback. BrowserMcpServer always passes PolyfillJsonSchemaValidator,
	* so ajv is never actually used — but the static import still resolves. This
	* stub satisfies that import without pulling in the real ajv (CJS-only, breaks
	* in browsers).
	*
	* If any code path unexpectedly reaches this stub, it throws immediately so the
	* issue is surfaced rather than silently passing all validation.
	*/
	var Ajv = class {
		compile(_schema) {
			throw new Error("[WebMCP] Ajv stub was invoked. This indicates the MCP SDK is bypassing PolyfillJsonSchemaValidator. Please report this as a bug.");
		}
		getSchema(_id) {}
		errorsText(_errors) {
			return "";
		}
	};
	var ajv_default = Ajv;
	/**
	* No-op ajv-formats stub for browser environments.
	* See ./ajv.ts for rationale.
	*/
	function addFormats(_ajv) {}
	function createDefaultAjvInstance() {
		const ajv = new ajv_default({
			strict: false,
			validateFormats: true,
			validateSchema: false,
			allErrors: true
		});
		addFormats(ajv);
		return ajv;
	}
	/**
	* @example
	* ```typescript
	* // Use with default AJV instance (recommended)
	* import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv';
	* const validator = new AjvJsonSchemaValidator();
	*
	* // Use with custom AJV instance
	* import { Ajv } from 'ajv';
	* const ajv = new Ajv({ strict: true, allErrors: true });
	* const validator = new AjvJsonSchemaValidator(ajv);
	* ```
	*/
	var AjvJsonSchemaValidator = class {
		/**
		* Create an AJV validator
		*
		* @param ajv - Optional pre-configured AJV instance. If not provided, a default instance will be created.
		*
		* @example
		* ```typescript
		* // Use default configuration (recommended for most cases)
		* import { AjvJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/ajv';
		* const validator = new AjvJsonSchemaValidator();
		*
		* // Or provide custom AJV instance for advanced configuration
		* import { Ajv } from 'ajv';
		* import addFormats from 'ajv-formats';
		*
		* const ajv = new Ajv({ validateFormats: true });
		* addFormats(ajv);
		* const validator = new AjvJsonSchemaValidator(ajv);
		* ```
		*/
		constructor(ajv) {
			this._ajv = ajv ?? createDefaultAjvInstance();
		}
		/**
		* Create a validator for the given JSON Schema
		*
		* The validator is compiled once and can be reused multiple times.
		* If the schema has an $id, it will be cached by AJV automatically.
		*
		* @param schema - Standard JSON Schema object
		* @returns A validator function that validates input data
		*/
		getValidator(schema) {
			const ajvValidator = "$id" in schema && typeof schema.$id === "string" ? this._ajv.getSchema(schema.$id) ?? this._ajv.compile(schema) : this._ajv.compile(schema);
			return (input) => {
				if (ajvValidator(input)) return {
					valid: true,
					data: input,
					errorMessage: void 0
				};
				else return {
					valid: false,
					data: void 0,
					errorMessage: this._ajv.errorsText(ajvValidator.errors)
				};
			};
		}
	};
	/**
	* Experimental task capability assertion helpers.
	* WARNING: These APIs are experimental and may change without notice.
	*
	* @experimental
	*/
	/**
	* Asserts that task creation is supported for tools/call.
	* Used by Client.assertTaskCapability and Server.assertTaskHandlerCapability.
	*
	* @param requests - The task requests capability object
	* @param method - The method being checked
	* @param entityName - 'Server' or 'Client' for error messages
	* @throws Error if the capability is not supported
	*
	* @experimental
	*/
	function assertToolsCallTaskCapability(requests, method, entityName) {
		if (!requests) throw new Error(`${entityName} does not support task creation (required for ${method})`);
		switch (method) {
			case "tools/call":
				if (!requests.tools?.call) throw new Error(`${entityName} does not support task creation for tools/call (required for ${method})`);
				break;
			default: break;
		}
	}
	/**
	* Asserts that task creation is supported for sampling/createMessage or elicitation/create.
	* Used by Server.assertTaskCapability and Client.assertTaskHandlerCapability.
	*
	* @param requests - The task requests capability object
	* @param method - The method being checked
	* @param entityName - 'Server' or 'Client' for error messages
	* @throws Error if the capability is not supported
	*
	* @experimental
	*/
	function assertClientRequestTaskCapability(requests, method, entityName) {
		if (!requests) throw new Error(`${entityName} does not support task creation (required for ${method})`);
		switch (method) {
			case "sampling/createMessage":
				if (!requests.sampling?.createMessage) throw new Error(`${entityName} does not support task creation for sampling/createMessage (required for ${method})`);
				break;
			case "elicitation/create":
				if (!requests.elicitation?.create) throw new Error(`${entityName} does not support task creation for elicitation/create (required for ${method})`);
				break;
			default: break;
		}
	}
	/**
	* Experimental server task features for MCP SDK.
	* WARNING: These APIs are experimental and may change without notice.
	*
	* @experimental
	*/
	/**
	* Experimental task features for low-level MCP servers.
	*
	* Access via `server.experimental.tasks`:
	* ```typescript
	* const stream = server.experimental.tasks.requestStream(request, schema, options);
	* ```
	*
	* For high-level server usage with task-based tools, use `McpServer.experimental.tasks` instead.
	*
	* @experimental
	*/
	var ExperimentalServerTasks = class {
		constructor(_server) {
			this._server = _server;
		}
		/**
		* Sends a request and returns an AsyncGenerator that yields response messages.
		* The generator is guaranteed to end with either a 'result' or 'error' message.
		*
		* This method provides streaming access to request processing, allowing you to
		* observe intermediate task status updates for task-augmented requests.
		*
		* @param request - The request to send
		* @param resultSchema - Zod schema for validating the result
		* @param options - Optional request options (timeout, signal, task creation params, etc.)
		* @returns AsyncGenerator that yields ResponseMessage objects
		*
		* @experimental
		*/
		requestStream(request, resultSchema, options) {
			return this._server.requestStream(request, resultSchema, options);
		}
		/**
		* Gets the current status of a task.
		*
		* @param taskId - The task identifier
		* @param options - Optional request options
		* @returns The task status
		*
		* @experimental
		*/
		async getTask(taskId, options) {
			return this._server.getTask({ taskId }, options);
		}
		/**
		* Retrieves the result of a completed task.
		*
		* @param taskId - The task identifier
		* @param resultSchema - Zod schema for validating the result
		* @param options - Optional request options
		* @returns The task result
		*
		* @experimental
		*/
		async getTaskResult(taskId, resultSchema, options) {
			return this._server.getTaskResult({ taskId }, resultSchema, options);
		}
		/**
		* Lists tasks with optional pagination.
		*
		* @param cursor - Optional pagination cursor
		* @param options - Optional request options
		* @returns List of tasks with optional next cursor
		*
		* @experimental
		*/
		async listTasks(cursor, options) {
			return this._server.listTasks(cursor ? { cursor } : void 0, options);
		}
		/**
		* Cancels a running task.
		*
		* @param taskId - The task identifier
		* @param options - Optional request options
		*
		* @experimental
		*/
		async cancelTask(taskId, options) {
			return this._server.cancelTask({ taskId }, options);
		}
	};
	/**
	* An MCP server on top of a pluggable transport.
	*
	* This server will automatically respond to the initialization flow as initiated from the client.
	*
	* To use with custom types, extend the base Request/Notification/Result types and pass them as type parameters:
	*
	* ```typescript
	* // Custom schemas
	* const CustomRequestSchema = RequestSchema.extend({...})
	* const CustomNotificationSchema = NotificationSchema.extend({...})
	* const CustomResultSchema = ResultSchema.extend({...})
	*
	* // Type aliases
	* type CustomRequest = z.infer<typeof CustomRequestSchema>
	* type CustomNotification = z.infer<typeof CustomNotificationSchema>
	* type CustomResult = z.infer<typeof CustomResultSchema>
	*
	* // Create typed server
	* const server = new Server<CustomRequest, CustomNotification, CustomResult>({
	*   name: "CustomServer",
	*   version: "1.0.0"
	* })
	* ```
	* @deprecated Use `McpServer` instead for the high-level API. Only use `Server` for advanced use cases.
	*/
	var Server = class extends Protocol {
		/**
		* Initializes this server with the given name and version information.
		*/
		constructor(_serverInfo, options) {
			super(options);
			this._serverInfo = _serverInfo;
			this._loggingLevels = /* @__PURE__ */ new Map();
			this.LOG_LEVEL_SEVERITY = new Map(LoggingLevelSchema.options.map((level, index) => [level, index]));
			this.isMessageIgnored = (level, sessionId) => {
				const currentLevel = this._loggingLevels.get(sessionId);
				return currentLevel ? this.LOG_LEVEL_SEVERITY.get(level) < this.LOG_LEVEL_SEVERITY.get(currentLevel) : false;
			};
			this._capabilities = options?.capabilities ?? {};
			this._instructions = options?.instructions;
			this._jsonSchemaValidator = options?.jsonSchemaValidator ?? new AjvJsonSchemaValidator();
			this.setRequestHandler(InitializeRequestSchema, (request) => this._oninitialize(request));
			this.setNotificationHandler(InitializedNotificationSchema, () => this.oninitialized?.());
			if (this._capabilities.logging) this.setRequestHandler(SetLevelRequestSchema, async (request, extra) => {
				const transportSessionId = extra.sessionId || extra.requestInfo?.headers["mcp-session-id"] || void 0;
				const { level } = request.params;
				const parseResult = LoggingLevelSchema.safeParse(level);
				if (parseResult.success) this._loggingLevels.set(transportSessionId, parseResult.data);
				return {};
			});
		}
		/**
		* Access experimental features.
		*
		* WARNING: These APIs are experimental and may change without notice.
		*
		* @experimental
		*/
		get experimental() {
			if (!this._experimental) this._experimental = { tasks: new ExperimentalServerTasks(this) };
			return this._experimental;
		}
		/**
		* Registers new capabilities. This can only be called before connecting to a transport.
		*
		* The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
		*/
		registerCapabilities(capabilities) {
			if (this.transport) throw new Error("Cannot register capabilities after connecting to transport");
			this._capabilities = mergeCapabilities(this._capabilities, capabilities);
		}
		/**
		* Override request handler registration to enforce server-side validation for tools/call.
		*/
		setRequestHandler(requestSchema, handler) {
			const methodSchema = getObjectShape(requestSchema)?.method;
			if (!methodSchema) throw new Error("Schema is missing a method literal");
			let methodValue;
			if (isZ4Schema(methodSchema)) {
				const v4Schema = methodSchema;
				methodValue = (v4Schema._zod?.def)?.value ?? v4Schema.value;
			} else {
				const v3Schema = methodSchema;
				methodValue = v3Schema._def?.value ?? v3Schema.value;
			}
			if (typeof methodValue !== "string") throw new Error("Schema method literal must be a string");
			if (methodValue === "tools/call") {
				const wrappedHandler = async (request, extra) => {
					const validatedRequest = safeParse(CallToolRequestSchema, request);
					if (!validatedRequest.success) {
						const errorMessage = validatedRequest.error instanceof Error ? validatedRequest.error.message : String(validatedRequest.error);
						throw new McpError(ErrorCode.InvalidParams, `Invalid tools/call request: ${errorMessage}`);
					}
					const { params } = validatedRequest.data;
					const result = await Promise.resolve(handler(request, extra));
					if (params.task) {
						const taskValidationResult = safeParse(CreateTaskResultSchema, result);
						if (!taskValidationResult.success) {
							const errorMessage = taskValidationResult.error instanceof Error ? taskValidationResult.error.message : String(taskValidationResult.error);
							throw new McpError(ErrorCode.InvalidParams, `Invalid task creation result: ${errorMessage}`);
						}
						return taskValidationResult.data;
					}
					const validationResult = safeParse(CallToolResultSchema, result);
					if (!validationResult.success) {
						const errorMessage = validationResult.error instanceof Error ? validationResult.error.message : String(validationResult.error);
						throw new McpError(ErrorCode.InvalidParams, `Invalid tools/call result: ${errorMessage}`);
					}
					return validationResult.data;
				};
				return super.setRequestHandler(requestSchema, wrappedHandler);
			}
			return super.setRequestHandler(requestSchema, handler);
		}
		assertCapabilityForMethod(method) {
			switch (method) {
				case "sampling/createMessage":
					if (!this._clientCapabilities?.sampling) throw new Error(`Client does not support sampling (required for ${method})`);
					break;
				case "elicitation/create":
					if (!this._clientCapabilities?.elicitation) throw new Error(`Client does not support elicitation (required for ${method})`);
					break;
				case "roots/list":
					if (!this._clientCapabilities?.roots) throw new Error(`Client does not support listing roots (required for ${method})`);
					break;
				case "ping": break;
			}
		}
		assertNotificationCapability(method) {
			switch (method) {
				case "notifications/message":
					if (!this._capabilities.logging) throw new Error(`Server does not support logging (required for ${method})`);
					break;
				case "notifications/resources/updated":
				case "notifications/resources/list_changed":
					if (!this._capabilities.resources) throw new Error(`Server does not support notifying about resources (required for ${method})`);
					break;
				case "notifications/tools/list_changed":
					if (!this._capabilities.tools) throw new Error(`Server does not support notifying of tool list changes (required for ${method})`);
					break;
				case "notifications/prompts/list_changed":
					if (!this._capabilities.prompts) throw new Error(`Server does not support notifying of prompt list changes (required for ${method})`);
					break;
				case "notifications/elicitation/complete":
					if (!this._clientCapabilities?.elicitation?.url) throw new Error(`Client does not support URL elicitation (required for ${method})`);
					break;
				case "notifications/cancelled": break;
				case "notifications/progress": break;
			}
		}
		assertRequestHandlerCapability(method) {
			if (!this._capabilities) return;
			switch (method) {
				case "completion/complete":
					if (!this._capabilities.completions) throw new Error(`Server does not support completions (required for ${method})`);
					break;
				case "logging/setLevel":
					if (!this._capabilities.logging) throw new Error(`Server does not support logging (required for ${method})`);
					break;
				case "prompts/get":
				case "prompts/list":
					if (!this._capabilities.prompts) throw new Error(`Server does not support prompts (required for ${method})`);
					break;
				case "resources/list":
				case "resources/templates/list":
				case "resources/read":
					if (!this._capabilities.resources) throw new Error(`Server does not support resources (required for ${method})`);
					break;
				case "tools/call":
				case "tools/list":
					if (!this._capabilities.tools) throw new Error(`Server does not support tools (required for ${method})`);
					break;
				case "tasks/get":
				case "tasks/list":
				case "tasks/result":
				case "tasks/cancel":
					if (!this._capabilities.tasks) throw new Error(`Server does not support tasks capability (required for ${method})`);
					break;
				case "ping":
				case "initialize": break;
			}
		}
		assertTaskCapability(method) {
			assertClientRequestTaskCapability(this._clientCapabilities?.tasks?.requests, method, "Client");
		}
		assertTaskHandlerCapability(method) {
			if (!this._capabilities) return;
			assertToolsCallTaskCapability(this._capabilities.tasks?.requests, method, "Server");
		}
		async _oninitialize(request) {
			const requestedVersion = request.params.protocolVersion;
			this._clientCapabilities = request.params.capabilities;
			this._clientVersion = request.params.clientInfo;
			return {
				protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion) ? requestedVersion : LATEST_PROTOCOL_VERSION,
				capabilities: this.getCapabilities(),
				serverInfo: this._serverInfo,
				...this._instructions && { instructions: this._instructions }
			};
		}
		/**
		* After initialization has completed, this will be populated with the client's reported capabilities.
		*/
		getClientCapabilities() {
			return this._clientCapabilities;
		}
		/**
		* After initialization has completed, this will be populated with information about the client's name and version.
		*/
		getClientVersion() {
			return this._clientVersion;
		}
		getCapabilities() {
			return this._capabilities;
		}
		async ping() {
			return this.request({ method: "ping" }, EmptyResultSchema);
		}
		async createMessage(params, options) {
			if (params.tools || params.toolChoice) {
				if (!this._clientCapabilities?.sampling?.tools) throw new Error("Client does not support sampling tools capability.");
			}
			if (params.messages.length > 0) {
				const lastMessage = params.messages[params.messages.length - 1];
				const lastContent = Array.isArray(lastMessage.content) ? lastMessage.content : [lastMessage.content];
				const hasToolResults = lastContent.some((c) => c.type === "tool_result");
				const previousMessage = params.messages.length > 1 ? params.messages[params.messages.length - 2] : void 0;
				const previousContent = previousMessage ? Array.isArray(previousMessage.content) ? previousMessage.content : [previousMessage.content] : [];
				const hasPreviousToolUse = previousContent.some((c) => c.type === "tool_use");
				if (hasToolResults) {
					if (lastContent.some((c) => c.type !== "tool_result")) throw new Error("The last message must contain only tool_result content if any is present");
					if (!hasPreviousToolUse) throw new Error("tool_result blocks are not matching any tool_use from the previous message");
				}
				if (hasPreviousToolUse) {
					const toolUseIds = new Set(previousContent.filter((c) => c.type === "tool_use").map((c) => c.id));
					const toolResultIds = new Set(lastContent.filter((c) => c.type === "tool_result").map((c) => c.toolUseId));
					if (toolUseIds.size !== toolResultIds.size || ![...toolUseIds].every((id) => toolResultIds.has(id))) throw new Error("ids of tool_result blocks and tool_use blocks from previous message do not match");
				}
			}
			if (params.tools) return this.request({
				method: "sampling/createMessage",
				params
			}, CreateMessageResultWithToolsSchema, options);
			return this.request({
				method: "sampling/createMessage",
				params
			}, CreateMessageResultSchema, options);
		}
		/**
		* Creates an elicitation request for the given parameters.
		* For backwards compatibility, `mode` may be omitted for form requests and will default to `'form'`.
		* @param params The parameters for the elicitation request.
		* @param options Optional request options.
		* @returns The result of the elicitation request.
		*/
		async elicitInput(params, options) {
			switch (params.mode ?? "form") {
				case "url": {
					if (!this._clientCapabilities?.elicitation?.url) throw new Error("Client does not support url elicitation.");
					const urlParams = params;
					return this.request({
						method: "elicitation/create",
						params: urlParams
					}, ElicitResultSchema, options);
				}
				case "form": {
					if (!this._clientCapabilities?.elicitation?.form) throw new Error("Client does not support form elicitation.");
					const formParams = params.mode === "form" ? params : {
						...params,
						mode: "form"
					};
					const result = await this.request({
						method: "elicitation/create",
						params: formParams
					}, ElicitResultSchema, options);
					if (result.action === "accept" && result.content && formParams.requestedSchema) try {
						const validationResult = this._jsonSchemaValidator.getValidator(formParams.requestedSchema)(result.content);
						if (!validationResult.valid) throw new McpError(ErrorCode.InvalidParams, `Elicitation response content does not match requested schema: ${validationResult.errorMessage}`);
					} catch (error) {
						if (error instanceof McpError) throw error;
						throw new McpError(ErrorCode.InternalError, `Error validating elicitation response: ${error instanceof Error ? error.message : String(error)}`);
					}
					return result;
				}
			}
		}
		/**
		* Creates a reusable callback that, when invoked, will send a `notifications/elicitation/complete`
		* notification for the specified elicitation ID.
		*
		* @param elicitationId The ID of the elicitation to mark as complete.
		* @param options Optional notification options. Useful when the completion notification should be related to a prior request.
		* @returns A function that emits the completion notification when awaited.
		*/
		createElicitationCompletionNotifier(elicitationId, options) {
			if (!this._clientCapabilities?.elicitation?.url) throw new Error("Client does not support URL elicitation (required for notifications/elicitation/complete)");
			return () => this.notification({
				method: "notifications/elicitation/complete",
				params: { elicitationId }
			}, options);
		}
		async listRoots(params, options) {
			return this.request({
				method: "roots/list",
				params
			}, ListRootsResultSchema, options);
		}
		/**
		* Sends a logging message to the client, if connected.
		* Note: You only need to send the parameters object, not the entire JSON RPC message
		* @see LoggingMessageNotification
		* @param params
		* @param sessionId optional for stateless and backward compatibility
		*/
		async sendLoggingMessage(params, sessionId) {
			if (this._capabilities.logging) {
				if (!this.isMessageIgnored(params.level, sessionId)) return this.notification({
					method: "notifications/message",
					params
				});
			}
		}
		async sendResourceUpdated(params) {
			return this.notification({
				method: "notifications/resources/updated",
				params
			});
		}
		async sendResourceListChanged() {
			return this.notification({ method: "notifications/resources/list_changed" });
		}
		async sendToolListChanged() {
			return this.notification({ method: "notifications/tools/list_changed" });
		}
		async sendPromptListChanged() {
			return this.notification({ method: "notifications/prompts/list_changed" });
		}
	};
	const COMPLETABLE_SYMBOL = Symbol.for("mcp.completable");
	/**
	* Checks if a schema is completable (has completion metadata).
	*/
	function isCompletable(schema) {
		return !!schema && typeof schema === "object" && COMPLETABLE_SYMBOL in schema;
	}
	/**
	* Gets the completer callback from a completable schema, if it exists.
	*/
	function getCompleter(schema) {
		return schema[COMPLETABLE_SYMBOL]?.complete;
	}
	var McpZodTypeKind;
	(function(McpZodTypeKind$1) {
		McpZodTypeKind$1["Completable"] = "McpCompletable";
	})(McpZodTypeKind || (McpZodTypeKind = {}));
	/**
	* Tool name validation utilities according to SEP: Specify Format for Tool Names
	*
	* Tool names SHOULD be between 1 and 128 characters in length (inclusive).
	* Tool names are case-sensitive.
	* Allowed characters: uppercase and lowercase ASCII letters (A-Z, a-z), digits
	* (0-9), underscore (_), dash (-), and dot (.).
	* Tool names SHOULD NOT contain spaces, commas, or other special characters.
	*/
	/**
	* Regular expression for valid tool names according to SEP-986 specification
	*/
	const TOOL_NAME_REGEX = /^[A-Za-z0-9._-]{1,128}$/;
	/**
	* Validates a tool name according to the SEP specification
	* @param name - The tool name to validate
	* @returns An object containing validation result and any warnings
	*/
	function validateToolName(name) {
		const warnings = [];
		if (name.length === 0) return {
			isValid: false,
			warnings: ["Tool name cannot be empty"]
		};
		if (name.length > 128) return {
			isValid: false,
			warnings: [`Tool name exceeds maximum length of 128 characters (current: ${name.length})`]
		};
		if (name.includes(" ")) warnings.push("Tool name contains spaces, which may cause parsing issues");
		if (name.includes(",")) warnings.push("Tool name contains commas, which may cause parsing issues");
		if (name.startsWith("-") || name.endsWith("-")) warnings.push("Tool name starts or ends with a dash, which may cause parsing issues in some contexts");
		if (name.startsWith(".") || name.endsWith(".")) warnings.push("Tool name starts or ends with a dot, which may cause parsing issues in some contexts");
		if (!TOOL_NAME_REGEX.test(name)) {
			const invalidChars = name.split("").filter((char) => !/[A-Za-z0-9._-]/.test(char)).filter((char, index, arr) => arr.indexOf(char) === index);
			warnings.push(`Tool name contains invalid characters: ${invalidChars.map((c) => `"${c}"`).join(", ")}`, "Allowed characters are: A-Z, a-z, 0-9, underscore (_), dash (-), and dot (.)");
			return {
				isValid: false,
				warnings
			};
		}
		return {
			isValid: true,
			warnings
		};
	}
	/**
	* Issues warnings for non-conforming tool names
	* @param name - The tool name that triggered the warnings
	* @param warnings - Array of warning messages
	*/
	function issueToolNameWarning(name, warnings) {
		if (warnings.length > 0) {
			console.warn(`Tool name validation warning for "${name}":`);
			for (const warning of warnings) console.warn(`  - ${warning}`);
			console.warn("Tool registration will proceed, but this may cause compatibility issues.");
			console.warn("Consider updating the tool name to conform to the MCP tool naming standard.");
			console.warn("See SEP: Specify Format for Tool Names (https://github.com/modelcontextprotocol/modelcontextprotocol/issues/986) for more details.");
		}
	}
	/**
	* Validates a tool name and issues warnings for non-conforming names
	* @param name - The tool name to validate
	* @returns true if the name is valid, false otherwise
	*/
	function validateAndWarnToolName(name) {
		const result = validateToolName(name);
		issueToolNameWarning(name, result.warnings);
		return result.isValid;
	}
	/**
	* Experimental McpServer task features for MCP SDK.
	* WARNING: These APIs are experimental and may change without notice.
	*
	* @experimental
	*/
	/**
	* Experimental task features for McpServer.
	*
	* Access via `server.experimental.tasks`:
	* ```typescript
	* server.experimental.tasks.registerToolTask('long-running', config, handler);
	* ```
	*
	* @experimental
	*/
	var ExperimentalMcpServerTasks = class {
		constructor(_mcpServer) {
			this._mcpServer = _mcpServer;
		}
		registerToolTask(name, config, handler) {
			const execution = {
				taskSupport: "required",
				...config.execution
			};
			if (execution.taskSupport === "forbidden") throw new Error(`Cannot register task-based tool '${name}' with taskSupport 'forbidden'. Use registerTool() instead.`);
			return this._mcpServer._createRegisteredTool(name, config.title, config.description, config.inputSchema, config.outputSchema, config.annotations, execution, config._meta, handler);
		}
	};
	/**
	* High-level MCP server that provides a simpler API for working with resources, tools, and prompts.
	* For advanced usage (like sending notifications or setting custom request handlers), use the underlying
	* Server instance available via the `server` property.
	*/
	var McpServer = class {
		constructor(serverInfo, options) {
			this._registeredResources = {};
			this._registeredResourceTemplates = {};
			this._registeredTools = {};
			this._registeredPrompts = {};
			this._toolHandlersInitialized = false;
			this._completionHandlerInitialized = false;
			this._resourceHandlersInitialized = false;
			this._promptHandlersInitialized = false;
			this.server = new Server(serverInfo, options);
		}
		/**
		* Access experimental features.
		*
		* WARNING: These APIs are experimental and may change without notice.
		*
		* @experimental
		*/
		get experimental() {
			if (!this._experimental) this._experimental = { tasks: new ExperimentalMcpServerTasks(this) };
			return this._experimental;
		}
		/**
		* Attaches to the given transport, starts it, and starts listening for messages.
		*
		* The `server` object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
		*/
		async connect(transport) {
			return await this.server.connect(transport);
		}
		/**
		* Closes the connection.
		*/
		async close() {
			await this.server.close();
		}
		setToolRequestHandlers() {
			if (this._toolHandlersInitialized) return;
			this.server.assertCanSetRequestHandler(getMethodValue(ListToolsRequestSchema));
			this.server.assertCanSetRequestHandler(getMethodValue(CallToolRequestSchema));
			this.server.registerCapabilities({ tools: { listChanged: true } });
			this.server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: Object.entries(this._registeredTools).filter(([, tool]) => tool.enabled).map(([name, tool]) => {
				const toolDefinition = {
					name,
					title: tool.title,
					description: tool.description,
					inputSchema: (() => {
						const obj = normalizeObjectSchema(tool.inputSchema);
						return obj ? toJsonSchemaCompat(obj, {
							strictUnions: true,
							pipeStrategy: "input"
						}) : EMPTY_OBJECT_JSON_SCHEMA;
					})(),
					annotations: tool.annotations,
					execution: tool.execution,
					_meta: tool._meta
				};
				if (tool.outputSchema) {
					const obj = normalizeObjectSchema(tool.outputSchema);
					if (obj) toolDefinition.outputSchema = toJsonSchemaCompat(obj, {
						strictUnions: true,
						pipeStrategy: "output"
					});
				}
				return toolDefinition;
			}) }));
			this.server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
				try {
					const tool = this._registeredTools[request.params.name];
					if (!tool) throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} not found`);
					if (!tool.enabled) throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} disabled`);
					const isTaskRequest = !!request.params.task;
					const taskSupport = tool.execution?.taskSupport;
					const isTaskHandler = "createTask" in tool.handler;
					if ((taskSupport === "required" || taskSupport === "optional") && !isTaskHandler) throw new McpError(ErrorCode.InternalError, `Tool ${request.params.name} has taskSupport '${taskSupport}' but was not registered with registerToolTask`);
					if (taskSupport === "required" && !isTaskRequest) throw new McpError(ErrorCode.MethodNotFound, `Tool ${request.params.name} requires task augmentation (taskSupport: 'required')`);
					if (taskSupport === "optional" && !isTaskRequest && isTaskHandler) return await this.handleAutomaticTaskPolling(tool, request, extra);
					const args = await this.validateToolInput(tool, request.params.arguments, request.params.name);
					const result = await this.executeToolHandler(tool, args, extra);
					if (isTaskRequest) return result;
					await this.validateToolOutput(tool, result, request.params.name);
					return result;
				} catch (error) {
					if (error instanceof McpError) {
						if (error.code === ErrorCode.UrlElicitationRequired) throw error;
					}
					return this.createToolError(error instanceof Error ? error.message : String(error));
				}
			});
			this._toolHandlersInitialized = true;
		}
		/**
		* Creates a tool error result.
		*
		* @param errorMessage - The error message.
		* @returns The tool error result.
		*/
		createToolError(errorMessage) {
			return {
				content: [{
					type: "text",
					text: errorMessage
				}],
				isError: true
			};
		}
		/**
		* Validates tool input arguments against the tool's input schema.
		*/
		async validateToolInput(tool, args, toolName) {
			if (!tool.inputSchema) return;
			const parseResult = await safeParseAsync(normalizeObjectSchema(tool.inputSchema) ?? tool.inputSchema, args);
			if (!parseResult.success) {
				const errorMessage = getParseErrorMessage("error" in parseResult ? parseResult.error : "Unknown error");
				throw new McpError(ErrorCode.InvalidParams, `Input validation error: Invalid arguments for tool ${toolName}: ${errorMessage}`);
			}
			return parseResult.data;
		}
		/**
		* Validates tool output against the tool's output schema.
		*/
		async validateToolOutput(tool, result, toolName) {
			if (!tool.outputSchema) return;
			if (!("content" in result)) return;
			if (result.isError) return;
			if (!result.structuredContent) throw new McpError(ErrorCode.InvalidParams, `Output validation error: Tool ${toolName} has an output schema but no structured content was provided`);
			const parseResult = await safeParseAsync(normalizeObjectSchema(tool.outputSchema), result.structuredContent);
			if (!parseResult.success) {
				const errorMessage = getParseErrorMessage("error" in parseResult ? parseResult.error : "Unknown error");
				throw new McpError(ErrorCode.InvalidParams, `Output validation error: Invalid structured content for tool ${toolName}: ${errorMessage}`);
			}
		}
		/**
		* Executes a tool handler (either regular or task-based).
		*/
		async executeToolHandler(tool, args, extra) {
			const handler = tool.handler;
			if ("createTask" in handler) {
				if (!extra.taskStore) throw new Error("No task store provided.");
				const taskExtra = {
					...extra,
					taskStore: extra.taskStore
				};
				if (tool.inputSchema) {
					const typedHandler = handler;
					return await Promise.resolve(typedHandler.createTask(args, taskExtra));
				} else {
					const typedHandler = handler;
					return await Promise.resolve(typedHandler.createTask(taskExtra));
				}
			}
			if (tool.inputSchema) {
				const typedHandler = handler;
				return await Promise.resolve(typedHandler(args, extra));
			} else {
				const typedHandler = handler;
				return await Promise.resolve(typedHandler(extra));
			}
		}
		/**
		* Handles automatic task polling for tools with taskSupport 'optional'.
		*/
		async handleAutomaticTaskPolling(tool, request, extra) {
			if (!extra.taskStore) throw new Error("No task store provided for task-capable tool.");
			const args = await this.validateToolInput(tool, request.params.arguments, request.params.name);
			const handler = tool.handler;
			const taskExtra = {
				...extra,
				taskStore: extra.taskStore
			};
			const createTaskResult = args ? await Promise.resolve(handler.createTask(args, taskExtra)) : await Promise.resolve(handler.createTask(taskExtra));
			const taskId = createTaskResult.task.taskId;
			let task = createTaskResult.task;
			const pollInterval = task.pollInterval ?? 5e3;
			while (task.status !== "completed" && task.status !== "failed" && task.status !== "cancelled") {
				await new Promise((resolve) => setTimeout(resolve, pollInterval));
				const updatedTask = await extra.taskStore.getTask(taskId);
				if (!updatedTask) throw new McpError(ErrorCode.InternalError, `Task ${taskId} not found during polling`);
				task = updatedTask;
			}
			return await extra.taskStore.getTaskResult(taskId);
		}
		setCompletionRequestHandler() {
			if (this._completionHandlerInitialized) return;
			this.server.assertCanSetRequestHandler(getMethodValue(CompleteRequestSchema));
			this.server.registerCapabilities({ completions: {} });
			this.server.setRequestHandler(CompleteRequestSchema, async (request) => {
				switch (request.params.ref.type) {
					case "ref/prompt":
						assertCompleteRequestPrompt(request);
						return this.handlePromptCompletion(request, request.params.ref);
					case "ref/resource":
						assertCompleteRequestResourceTemplate(request);
						return this.handleResourceCompletion(request, request.params.ref);
					default: throw new McpError(ErrorCode.InvalidParams, `Invalid completion reference: ${request.params.ref}`);
				}
			});
			this._completionHandlerInitialized = true;
		}
		async handlePromptCompletion(request, ref) {
			const prompt = this._registeredPrompts[ref.name];
			if (!prompt) throw new McpError(ErrorCode.InvalidParams, `Prompt ${ref.name} not found`);
			if (!prompt.enabled) throw new McpError(ErrorCode.InvalidParams, `Prompt ${ref.name} disabled`);
			if (!prompt.argsSchema) return EMPTY_COMPLETION_RESULT;
			const field = getObjectShape(prompt.argsSchema)?.[request.params.argument.name];
			if (!isCompletable(field)) return EMPTY_COMPLETION_RESULT;
			const completer = getCompleter(field);
			if (!completer) return EMPTY_COMPLETION_RESULT;
			return createCompletionResult(await completer(request.params.argument.value, request.params.context));
		}
		async handleResourceCompletion(request, ref) {
			const template = Object.values(this._registeredResourceTemplates).find((t) => t.resourceTemplate.uriTemplate.toString() === ref.uri);
			if (!template) {
				if (this._registeredResources[ref.uri]) return EMPTY_COMPLETION_RESULT;
				throw new McpError(ErrorCode.InvalidParams, `Resource template ${request.params.ref.uri} not found`);
			}
			const completer = template.resourceTemplate.completeCallback(request.params.argument.name);
			if (!completer) return EMPTY_COMPLETION_RESULT;
			return createCompletionResult(await completer(request.params.argument.value, request.params.context));
		}
		setResourceRequestHandlers() {
			if (this._resourceHandlersInitialized) return;
			this.server.assertCanSetRequestHandler(getMethodValue(ListResourcesRequestSchema));
			this.server.assertCanSetRequestHandler(getMethodValue(ListResourceTemplatesRequestSchema));
			this.server.assertCanSetRequestHandler(getMethodValue(ReadResourceRequestSchema));
			this.server.registerCapabilities({ resources: { listChanged: true } });
			this.server.setRequestHandler(ListResourcesRequestSchema, async (request, extra) => {
				const resources = Object.entries(this._registeredResources).filter(([_, resource]) => resource.enabled).map(([uri, resource]) => ({
					uri,
					name: resource.name,
					...resource.metadata
				}));
				const templateResources = [];
				for (const template of Object.values(this._registeredResourceTemplates)) {
					if (!template.resourceTemplate.listCallback) continue;
					const result = await template.resourceTemplate.listCallback(extra);
					for (const resource of result.resources) templateResources.push({
						...template.metadata,
						...resource
					});
				}
				return { resources: [...resources, ...templateResources] };
			});
			this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
				return { resourceTemplates: Object.entries(this._registeredResourceTemplates).map(([name, template]) => ({
					name,
					uriTemplate: template.resourceTemplate.uriTemplate.toString(),
					...template.metadata
				})) };
			});
			this.server.setRequestHandler(ReadResourceRequestSchema, async (request, extra) => {
				const uri = new URL(request.params.uri);
				const resource = this._registeredResources[uri.toString()];
				if (resource) {
					if (!resource.enabled) throw new McpError(ErrorCode.InvalidParams, `Resource ${uri} disabled`);
					return resource.readCallback(uri, extra);
				}
				for (const template of Object.values(this._registeredResourceTemplates)) {
					const variables = template.resourceTemplate.uriTemplate.match(uri.toString());
					if (variables) return template.readCallback(uri, variables, extra);
				}
				throw new McpError(ErrorCode.InvalidParams, `Resource ${uri} not found`);
			});
			this._resourceHandlersInitialized = true;
		}
		setPromptRequestHandlers() {
			if (this._promptHandlersInitialized) return;
			this.server.assertCanSetRequestHandler(getMethodValue(ListPromptsRequestSchema));
			this.server.assertCanSetRequestHandler(getMethodValue(GetPromptRequestSchema));
			this.server.registerCapabilities({ prompts: { listChanged: true } });
			this.server.setRequestHandler(ListPromptsRequestSchema, () => ({ prompts: Object.entries(this._registeredPrompts).filter(([, prompt]) => prompt.enabled).map(([name, prompt]) => {
				return {
					name,
					title: prompt.title,
					description: prompt.description,
					arguments: prompt.argsSchema ? promptArgumentsFromSchema(prompt.argsSchema) : void 0
				};
			}) }));
			this.server.setRequestHandler(GetPromptRequestSchema, async (request, extra) => {
				const prompt = this._registeredPrompts[request.params.name];
				if (!prompt) throw new McpError(ErrorCode.InvalidParams, `Prompt ${request.params.name} not found`);
				if (!prompt.enabled) throw new McpError(ErrorCode.InvalidParams, `Prompt ${request.params.name} disabled`);
				if (prompt.argsSchema) {
					const parseResult = await safeParseAsync(normalizeObjectSchema(prompt.argsSchema), request.params.arguments);
					if (!parseResult.success) {
						const errorMessage = getParseErrorMessage("error" in parseResult ? parseResult.error : "Unknown error");
						throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for prompt ${request.params.name}: ${errorMessage}`);
					}
					const args = parseResult.data;
					const cb = prompt.callback;
					return await Promise.resolve(cb(args, extra));
				} else {
					const cb = prompt.callback;
					return await Promise.resolve(cb(extra));
				}
			});
			this._promptHandlersInitialized = true;
		}
		resource(name, uriOrTemplate, ...rest) {
			let metadata;
			if (typeof rest[0] === "object") metadata = rest.shift();
			const readCallback = rest[0];
			if (typeof uriOrTemplate === "string") {
				if (this._registeredResources[uriOrTemplate]) throw new Error(`Resource ${uriOrTemplate} is already registered`);
				const registeredResource = this._createRegisteredResource(name, void 0, uriOrTemplate, metadata, readCallback);
				this.setResourceRequestHandlers();
				this.sendResourceListChanged();
				return registeredResource;
			} else {
				if (this._registeredResourceTemplates[name]) throw new Error(`Resource template ${name} is already registered`);
				const registeredResourceTemplate = this._createRegisteredResourceTemplate(name, void 0, uriOrTemplate, metadata, readCallback);
				this.setResourceRequestHandlers();
				this.sendResourceListChanged();
				return registeredResourceTemplate;
			}
		}
		registerResource(name, uriOrTemplate, config, readCallback) {
			if (typeof uriOrTemplate === "string") {
				if (this._registeredResources[uriOrTemplate]) throw new Error(`Resource ${uriOrTemplate} is already registered`);
				const registeredResource = this._createRegisteredResource(name, config.title, uriOrTemplate, config, readCallback);
				this.setResourceRequestHandlers();
				this.sendResourceListChanged();
				return registeredResource;
			} else {
				if (this._registeredResourceTemplates[name]) throw new Error(`Resource template ${name} is already registered`);
				const registeredResourceTemplate = this._createRegisteredResourceTemplate(name, config.title, uriOrTemplate, config, readCallback);
				this.setResourceRequestHandlers();
				this.sendResourceListChanged();
				return registeredResourceTemplate;
			}
		}
		_createRegisteredResource(name, title, uri, metadata, readCallback) {
			const registeredResource = {
				name,
				title,
				metadata,
				readCallback,
				enabled: true,
				disable: () => registeredResource.update({ enabled: false }),
				enable: () => registeredResource.update({ enabled: true }),
				remove: () => registeredResource.update({ uri: null }),
				update: (updates) => {
					if (typeof updates.uri !== "undefined" && updates.uri !== uri) {
						delete this._registeredResources[uri];
						if (updates.uri) this._registeredResources[updates.uri] = registeredResource;
					}
					if (typeof updates.name !== "undefined") registeredResource.name = updates.name;
					if (typeof updates.title !== "undefined") registeredResource.title = updates.title;
					if (typeof updates.metadata !== "undefined") registeredResource.metadata = updates.metadata;
					if (typeof updates.callback !== "undefined") registeredResource.readCallback = updates.callback;
					if (typeof updates.enabled !== "undefined") registeredResource.enabled = updates.enabled;
					this.sendResourceListChanged();
				}
			};
			this._registeredResources[uri] = registeredResource;
			return registeredResource;
		}
		_createRegisteredResourceTemplate(name, title, template, metadata, readCallback) {
			const registeredResourceTemplate = {
				resourceTemplate: template,
				title,
				metadata,
				readCallback,
				enabled: true,
				disable: () => registeredResourceTemplate.update({ enabled: false }),
				enable: () => registeredResourceTemplate.update({ enabled: true }),
				remove: () => registeredResourceTemplate.update({ name: null }),
				update: (updates) => {
					if (typeof updates.name !== "undefined" && updates.name !== name) {
						delete this._registeredResourceTemplates[name];
						if (updates.name) this._registeredResourceTemplates[updates.name] = registeredResourceTemplate;
					}
					if (typeof updates.title !== "undefined") registeredResourceTemplate.title = updates.title;
					if (typeof updates.template !== "undefined") registeredResourceTemplate.resourceTemplate = updates.template;
					if (typeof updates.metadata !== "undefined") registeredResourceTemplate.metadata = updates.metadata;
					if (typeof updates.callback !== "undefined") registeredResourceTemplate.readCallback = updates.callback;
					if (typeof updates.enabled !== "undefined") registeredResourceTemplate.enabled = updates.enabled;
					this.sendResourceListChanged();
				}
			};
			this._registeredResourceTemplates[name] = registeredResourceTemplate;
			const variableNames = template.uriTemplate.variableNames;
			if (Array.isArray(variableNames) && variableNames.some((v) => !!template.completeCallback(v))) this.setCompletionRequestHandler();
			return registeredResourceTemplate;
		}
		_createRegisteredPrompt(name, title, description, argsSchema, callback) {
			const registeredPrompt = {
				title,
				description,
				argsSchema: argsSchema === void 0 ? void 0 : objectFromShape(argsSchema),
				callback,
				enabled: true,
				disable: () => registeredPrompt.update({ enabled: false }),
				enable: () => registeredPrompt.update({ enabled: true }),
				remove: () => registeredPrompt.update({ name: null }),
				update: (updates) => {
					if (typeof updates.name !== "undefined" && updates.name !== name) {
						delete this._registeredPrompts[name];
						if (updates.name) this._registeredPrompts[updates.name] = registeredPrompt;
					}
					if (typeof updates.title !== "undefined") registeredPrompt.title = updates.title;
					if (typeof updates.description !== "undefined") registeredPrompt.description = updates.description;
					if (typeof updates.argsSchema !== "undefined") registeredPrompt.argsSchema = objectFromShape(updates.argsSchema);
					if (typeof updates.callback !== "undefined") registeredPrompt.callback = updates.callback;
					if (typeof updates.enabled !== "undefined") registeredPrompt.enabled = updates.enabled;
					this.sendPromptListChanged();
				}
			};
			this._registeredPrompts[name] = registeredPrompt;
			if (argsSchema) {
				if (Object.values(argsSchema).some((field) => {
					return isCompletable(field instanceof ZodOptional$1 ? field._def?.innerType : field);
				})) this.setCompletionRequestHandler();
			}
			return registeredPrompt;
		}
		_createRegisteredTool(name, title, description, inputSchema, outputSchema, annotations, execution, _meta, handler) {
			validateAndWarnToolName(name);
			const registeredTool = {
				title,
				description,
				inputSchema: getZodSchemaObject(inputSchema),
				outputSchema: getZodSchemaObject(outputSchema),
				annotations,
				execution,
				_meta,
				handler,
				enabled: true,
				disable: () => registeredTool.update({ enabled: false }),
				enable: () => registeredTool.update({ enabled: true }),
				remove: () => registeredTool.update({ name: null }),
				update: (updates) => {
					if (typeof updates.name !== "undefined" && updates.name !== name) {
						if (typeof updates.name === "string") validateAndWarnToolName(updates.name);
						delete this._registeredTools[name];
						if (updates.name) this._registeredTools[updates.name] = registeredTool;
					}
					if (typeof updates.title !== "undefined") registeredTool.title = updates.title;
					if (typeof updates.description !== "undefined") registeredTool.description = updates.description;
					if (typeof updates.paramsSchema !== "undefined") registeredTool.inputSchema = objectFromShape(updates.paramsSchema);
					if (typeof updates.outputSchema !== "undefined") registeredTool.outputSchema = objectFromShape(updates.outputSchema);
					if (typeof updates.callback !== "undefined") registeredTool.handler = updates.callback;
					if (typeof updates.annotations !== "undefined") registeredTool.annotations = updates.annotations;
					if (typeof updates._meta !== "undefined") registeredTool._meta = updates._meta;
					if (typeof updates.enabled !== "undefined") registeredTool.enabled = updates.enabled;
					this.sendToolListChanged();
				}
			};
			this._registeredTools[name] = registeredTool;
			this.setToolRequestHandlers();
			this.sendToolListChanged();
			return registeredTool;
		}
		/**
		* tool() implementation. Parses arguments passed to overrides defined above.
		*/
		tool(name, ...rest) {
			if (this._registeredTools[name]) throw new Error(`Tool ${name} is already registered`);
			let description;
			let inputSchema;
			let outputSchema;
			let annotations;
			if (typeof rest[0] === "string") description = rest.shift();
			if (rest.length > 1) {
				const firstArg = rest[0];
				if (isZodRawShapeCompat(firstArg)) {
					inputSchema = rest.shift();
					if (rest.length > 1 && typeof rest[0] === "object" && rest[0] !== null && !isZodRawShapeCompat(rest[0])) annotations = rest.shift();
				} else if (typeof firstArg === "object" && firstArg !== null) annotations = rest.shift();
			}
			const callback = rest[0];
			return this._createRegisteredTool(name, void 0, description, inputSchema, outputSchema, annotations, { taskSupport: "forbidden" }, void 0, callback);
		}
		/**
		* Registers a tool with a config object and callback.
		*/
		registerTool(name, config, cb) {
			if (this._registeredTools[name]) throw new Error(`Tool ${name} is already registered`);
			const { title, description, inputSchema, outputSchema, annotations, _meta } = config;
			return this._createRegisteredTool(name, title, description, inputSchema, outputSchema, annotations, { taskSupport: "forbidden" }, _meta, cb);
		}
		prompt(name, ...rest) {
			if (this._registeredPrompts[name]) throw new Error(`Prompt ${name} is already registered`);
			let description;
			if (typeof rest[0] === "string") description = rest.shift();
			let argsSchema;
			if (rest.length > 1) argsSchema = rest.shift();
			const cb = rest[0];
			const registeredPrompt = this._createRegisteredPrompt(name, void 0, description, argsSchema, cb);
			this.setPromptRequestHandlers();
			this.sendPromptListChanged();
			return registeredPrompt;
		}
		/**
		* Registers a prompt with a config object and callback.
		*/
		registerPrompt(name, config, cb) {
			if (this._registeredPrompts[name]) throw new Error(`Prompt ${name} is already registered`);
			const { title, description, argsSchema } = config;
			const registeredPrompt = this._createRegisteredPrompt(name, title, description, argsSchema, cb);
			this.setPromptRequestHandlers();
			this.sendPromptListChanged();
			return registeredPrompt;
		}
		/**
		* Checks if the server is connected to a transport.
		* @returns True if the server is connected
		*/
		isConnected() {
			return this.server.transport !== void 0;
		}
		/**
		* Sends a logging message to the client, if connected.
		* Note: You only need to send the parameters object, not the entire JSON RPC message
		* @see LoggingMessageNotification
		* @param params
		* @param sessionId optional for stateless and backward compatibility
		*/
		async sendLoggingMessage(params, sessionId) {
			return this.server.sendLoggingMessage(params, sessionId);
		}
		/**
		* Sends a resource list changed event to the client, if connected.
		*/
		sendResourceListChanged() {
			if (this.isConnected()) this.server.sendResourceListChanged();
		}
		/**
		* Sends a tool list changed event to the client, if connected.
		*/
		sendToolListChanged() {
			if (this.isConnected()) this.server.sendToolListChanged();
		}
		/**
		* Sends a prompt list changed event to the client, if connected.
		*/
		sendPromptListChanged() {
			if (this.isConnected()) this.server.sendPromptListChanged();
		}
	};
	const EMPTY_OBJECT_JSON_SCHEMA = {
		type: "object",
		properties: {}
	};
	/**
	* Checks if a value looks like a Zod schema by checking for parse/safeParse methods.
	*/
	function isZodTypeLike(value) {
		return value !== null && typeof value === "object" && "parse" in value && typeof value.parse === "function" && "safeParse" in value && typeof value.safeParse === "function";
	}
	/**
	* Checks if an object is a Zod schema instance (v3 or v4).
	*
	* Zod schemas have internal markers:
	* - v3: `_def` property
	* - v4: `_zod` property
	*
	* This includes transformed schemas like z.preprocess(), z.transform(), z.pipe().
	*/
	function isZodSchemaInstance(obj) {
		return "_def" in obj || "_zod" in obj || isZodTypeLike(obj);
	}
	/**
	* Checks if an object is a "raw shape" - a plain object where values are Zod schemas.
	*
	* Raw shapes are used as shorthand: `{ name: z.string() }` instead of `z.object({ name: z.string() })`.
	*
	* IMPORTANT: This must NOT match actual Zod schema instances (like z.preprocess, z.pipe),
	* which have internal properties that could be mistaken for schema values.
	*/
	function isZodRawShapeCompat(obj) {
		if (typeof obj !== "object" || obj === null) return false;
		if (isZodSchemaInstance(obj)) return false;
		if (Object.keys(obj).length === 0) return true;
		return Object.values(obj).some(isZodTypeLike);
	}
	/**
	* Converts a provided Zod schema to a Zod object if it is a ZodRawShapeCompat,
	* otherwise returns the schema as is.
	*/
	function getZodSchemaObject(schema) {
		if (!schema) return;
		if (isZodRawShapeCompat(schema)) return objectFromShape(schema);
		return schema;
	}
	function promptArgumentsFromSchema(schema) {
		const shape = getObjectShape(schema);
		if (!shape) return [];
		return Object.entries(shape).map(([name, field]) => {
			return {
				name,
				description: getSchemaDescription(field),
				required: !isSchemaOptional(field)
			};
		});
	}
	function getMethodValue(schema) {
		const methodSchema = getObjectShape(schema)?.method;
		if (!methodSchema) throw new Error("Schema is missing a method literal");
		const value = getLiteralValue(methodSchema);
		if (typeof value === "string") return value;
		throw new Error("Schema method literal must be a string");
	}
	function createCompletionResult(suggestions) {
		return { completion: {
			values: suggestions.slice(0, 100),
			total: suggestions.length,
			hasMore: suggestions.length > 100
		} };
	}
	const EMPTY_COMPLETION_RESULT = { completion: {
		values: [],
		hasMore: false
	} };
	var PolyfillJsonSchemaValidator = class {
		getValidator(schema) {
			return (input) => {
				if (!isPlainObject(input)) return {
					valid: false,
					data: void 0,
					errorMessage: "expected object arguments"
				};
				const issue = validateArgsWithSchema(input, schema);
				if (issue) return {
					valid: false,
					data: void 0,
					errorMessage: issue.message
				};
				return {
					valid: true,
					data: input,
					errorMessage: void 0
				};
			};
		}
	};
	const DEFAULT_INPUT_SCHEMA = {
		type: "object",
		properties: {}
	};
	const DEFAULT_CLIENT_REQUEST_TIMEOUT = 1e4;
	function withDefaultTimeout(options) {
		if (options?.signal) return options;
		return {
			...options,
			signal: AbortSignal.timeout(DEFAULT_CLIENT_REQUEST_TIMEOUT)
		};
	}
	/**
	* Browser-optimized MCP Server that speaks WebMCP natively.
	*
	* This server IS navigator.modelContext — it implements the WebMCP standard API
	* (provideContext, registerTool, unregisterTool, clearContext) while retaining
	* full MCP protocol capabilities (resources, prompts, elicitation, sampling)
	* via the inherited BaseMcpServer surface.
	*
	* When `native` is provided, all tool operations are mirrored to it so that
	* navigator.modelContextTesting (polyfill testing shim) stays in sync.
	*/
	var BrowserMcpServer = class extends McpServer {
		native;
		_promptSchemas = /* @__PURE__ */ new Map();
		_jsonValidator;
		_publicMethodsBound = false;
		constructor(serverInfo, options) {
			const validator = new PolyfillJsonSchemaValidator();
			const enhancedOptions = {
				capabilities: mergeCapabilities(options?.capabilities || {}, {
					tools: { listChanged: true },
					resources: { listChanged: true },
					prompts: { listChanged: true }
				}),
				jsonSchemaValidator: options?.jsonSchemaValidator ?? validator
			};
			super(serverInfo, enhancedOptions);
			this._jsonValidator = validator;
			this.native = options?.native;
			this.bindPublicApiMethods();
		}
		/**
		* navigator.modelContext consumers may destructure methods (e.g. const { registerTool } = ...).
		* Bind methods once so they remain callable outside instance-method invocation syntax.
		*/
		bindPublicApiMethods() {
			if (this._publicMethodsBound) return;
			this.registerTool = this.registerTool.bind(this);
			this.unregisterTool = this.unregisterTool.bind(this);
			this.provideContext = this.provideContext.bind(this);
			this.clearContext = this.clearContext.bind(this);
			this.listTools = this.listTools.bind(this);
			this.callTool = this.callTool.bind(this);
			this.executeTool = this.executeTool.bind(this);
			this.registerResource = this.registerResource.bind(this);
			this.listResources = this.listResources.bind(this);
			this.readResource = this.readResource.bind(this);
			this.registerPrompt = this.registerPrompt.bind(this);
			this.listPrompts = this.listPrompts.bind(this);
			this.getPrompt = this.getPrompt.bind(this);
			this.createMessage = this.createMessage.bind(this);
			this.elicitInput = this.elicitInput.bind(this);
			this._publicMethodsBound = true;
		}
		get _parentTools() {
			return this._registeredTools;
		}
		get _parentResources() {
			return this._registeredResources;
		}
		get _parentPrompts() {
			return this._registeredPrompts;
		}
		toTransportSchema(schema) {
			if (!schema || typeof schema !== "object") return DEFAULT_INPUT_SCHEMA;
			const normalized = normalizeObjectSchema(schema);
			if (normalized) return toJsonSchemaCompat(normalized, {
				strictUnions: true,
				pipeStrategy: "input"
			});
			return schema;
		}
		isZodSchema(schema) {
			if (!schema || typeof schema !== "object") return false;
			const s = schema;
			return "_zod" in s || "_def" in s;
		}
		getNativeToolsApi() {
			if (!this.native) return;
			const candidate = this.native;
			if (typeof candidate.listTools !== "function" || typeof candidate.callTool !== "function") return;
			return candidate;
		}
		registerToolInServer(tool) {
			const inputSchema = tool.inputSchema ?? DEFAULT_INPUT_SCHEMA;
			super.registerTool(tool.name, {
				description: tool.description,
				inputSchema,
				...tool.outputSchema ? { outputSchema: tool.outputSchema } : {},
				...tool.annotations ? { annotations: tool.annotations } : {}
			}, async (args) => {
				return tool.execute(args, { requestUserInteraction: async (cb) => cb() });
			});
			return { unregister: () => this.unregisterTool(tool.name) };
		}
		backfillTools(tools, execute) {
			let synced = 0;
			for (const sourceTool of tools) {
				if (!sourceTool?.name || this._parentTools[sourceTool.name]) continue;
				const toolDescriptor = {
					name: sourceTool.name,
					description: sourceTool.description ?? "",
					inputSchema: sourceTool.inputSchema ?? DEFAULT_INPUT_SCHEMA,
					execute: async (args) => execute(sourceTool.name, args)
				};
				if (sourceTool.outputSchema) toolDescriptor.outputSchema = sourceTool.outputSchema;
				if (sourceTool.annotations) toolDescriptor.annotations = sourceTool.annotations;
				this.registerToolInServer(toolDescriptor);
				synced++;
			}
			return synced;
		}
		registerTool(tool) {
			if (this.native) this.native.registerTool(tool);
			try {
				return this.registerToolInServer(tool);
			} catch (error) {
				if (this.native) try {
					this.native.unregisterTool(tool.name);
				} catch (rollbackError) {
					console.error("[BrowserMcpServer] Rollback of native tool registration failed:", rollbackError);
				}
				throw error;
			}
		}
		/**
		* Backfill tools that were already registered on the native/polyfill context
		* before this BrowserMcpServer wrapper was installed.
		*/
		syncNativeTools() {
			const nativeToolsApi = this.getNativeToolsApi();
			if (!nativeToolsApi) return 0;
			const nativeCallTool = nativeToolsApi.callTool.bind(nativeToolsApi);
			return this.backfillTools(nativeToolsApi.listTools(), async (name, args) => nativeCallTool({
				name,
				arguments: args
			}));
		}
		unregisterTool(name) {
			this._parentTools[name]?.remove();
			if (this.native) this.native.unregisterTool(name);
		}
		registerResource(descriptor) {
			const registered = super.registerResource(descriptor.name, descriptor.uri, {
				...descriptor.description !== void 0 && { description: descriptor.description },
				...descriptor.mimeType !== void 0 && { mimeType: descriptor.mimeType }
			}, async (uri) => ({ contents: (await descriptor.read(uri)).contents }));
			return { unregister: () => registered.remove() };
		}
		registerPrompt(descriptor) {
			if (descriptor.argsSchema) this._promptSchemas.set(descriptor.name, descriptor.argsSchema);
			const registered = super.registerPrompt(descriptor.name, { ...descriptor.description !== void 0 && { description: descriptor.description } }, async (args) => ({ messages: (await descriptor.get(args)).messages }));
			return { unregister: () => {
				this._promptSchemas.delete(descriptor.name);
				registered.remove();
			} };
		}
		provideContext(options) {
			for (const tool of Object.values(this._parentTools)) tool.remove();
			if (this.native) this.native.clearContext();
			for (const tool of options?.tools ?? []) this.registerTool(tool);
		}
		clearContext() {
			for (const tool of Object.values(this._parentTools)) tool.remove();
			if (this.native) this.native.clearContext();
		}
		listResources() {
			return Object.entries(this._parentResources).filter(([, resource]) => resource.enabled).map(([uri, resource]) => ({
				uri,
				name: resource.name,
				...resource.metadata
			}));
		}
		async readResource(uri) {
			const resource = this._parentResources[uri];
			if (!resource) throw new Error(`Resource not found: ${uri}`);
			return resource.readCallback(new URL(uri), {});
		}
		listPrompts() {
			return Object.entries(this._parentPrompts).filter(([, prompt]) => prompt.enabled).map(([name, prompt]) => {
				const schema = this._promptSchemas.get(name);
				return {
					name,
					...prompt.description !== void 0 && { description: prompt.description },
					...schema?.properties ? { arguments: Object.entries(schema.properties).map(([argName, prop]) => ({
						name: argName,
						...typeof prop === "object" && prop !== null && "description" in prop ? { description: prop.description } : {},
						...schema.required?.includes(argName) ? { required: true } : {}
					})) } : {}
				};
			});
		}
		async getPrompt(name, args = {}) {
			const prompt = this._parentPrompts[name];
			if (!prompt) throw new Error(`Prompt not found: ${name}`);
			const schema = this._promptSchemas.get(name);
			if (schema) {
				const result = this._jsonValidator.getValidator(schema)(args);
				if (!result.valid) throw new Error(`Invalid arguments for prompt ${name}: ${result.errorMessage}`);
			}
			return prompt.callback(args, {});
		}
		listTools() {
			return Object.entries(this._parentTools).filter(([, tool]) => tool.enabled).map(([name, tool]) => {
				const item = {
					name,
					description: tool.description ?? "",
					inputSchema: this.toTransportSchema(tool.inputSchema ?? DEFAULT_INPUT_SCHEMA)
				};
				if (tool.outputSchema) item.outputSchema = this.toTransportSchema(tool.outputSchema);
				if (tool.annotations) item.annotations = tool.annotations;
				return item;
			});
		}
		/**
		* Override SDK's validateToolInput to handle both Zod schemas and plain JSON Schema.
		* Zod schemas use the SDK's safeParseAsync; plain JSON Schema uses PolyfillJsonSchemaValidator.
		*/
		async validateToolInput(tool, args, toolName) {
			if (!tool.inputSchema) return void 0;
			if (this.isZodSchema(tool.inputSchema)) {
				const result$1 = await safeParseAsync(tool.inputSchema, args ?? {});
				if (!result$1.success) throw new Error(`Invalid arguments for tool ${toolName}: ${getParseErrorMessage(result$1.error)}`);
				return result$1.data;
			}
			const result = this._jsonValidator.getValidator(tool.inputSchema)(args ?? {});
			if (!result.valid) throw new Error(`Invalid arguments for tool ${toolName}: ${result.errorMessage}`);
			return result.data;
		}
		/**
		* Override SDK's validateToolOutput to handle both Zod schemas and plain JSON Schema.
		*/
		async validateToolOutput(tool, result, toolName) {
			if (!tool.outputSchema) return;
			const r = result;
			if (!("content" in r) || r.isError || !r.structuredContent) return;
			if (this.isZodSchema(tool.outputSchema)) {
				const parseResult = await safeParseAsync(tool.outputSchema, r.structuredContent);
				if (!parseResult.success) throw new Error(`Output validation error: Invalid structured content for tool ${toolName}: ${getParseErrorMessage(parseResult.error)}`);
				return;
			}
			const validationResult = this._jsonValidator.getValidator(tool.outputSchema)(r.structuredContent);
			if (!validationResult.valid) throw new Error(`Output validation error: Invalid structured content for tool ${toolName}: ${validationResult.errorMessage}`);
		}
		async callTool(params) {
			const tool = this._parentTools[params.name];
			if (!tool) throw new Error(`Tool not found: ${params.name}`);
			return tool.handler(params.arguments ?? {}, {});
		}
		async executeTool(name, args = {}) {
			return this.callTool({
				name,
				arguments: args
			});
		}
		/**
		* Override connect to initialize request handlers BEFORE the transport connection.
		* This prevents "Cannot register capabilities after connecting to transport" errors
		* when tools are registered dynamically after connection.
		*
		* After the parent sets up its Zod-based handlers, we replace the ones that break
		* with plain JSON Schema objects (ListTools, ListPrompts, GetPrompt).
		*/
		async connect(transport) {
			this.setToolRequestHandlers();
			this.setResourceRequestHandlers();
			this.setPromptRequestHandlers();
			this.server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: this.listTools() }));
			this.server.setRequestHandler(ListPromptsRequestSchema, () => ({ prompts: this.listPrompts() }));
			this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
				const prompt = this._parentPrompts[request.params.name];
				if (!prompt) throw new Error(`Prompt ${request.params.name} not found`);
				if (!prompt.enabled) throw new Error(`Prompt ${request.params.name} disabled`);
				const schema = this._promptSchemas.get(request.params.name);
				if (schema) {
					const result = this._jsonValidator.getValidator(schema)(request.params.arguments ?? {});
					if (!result.valid) throw new Error(`Invalid arguments for prompt ${request.params.name}: ${result.errorMessage}`);
					return prompt.callback(request.params.arguments, {});
				}
				return prompt.callback({}, {});
			});
			return super.connect(transport);
		}
		async createMessage(params, options) {
			return this.server.createMessage(params, withDefaultTimeout(options));
		}
		async elicitInput(params, options) {
			return this.server.elicitInput(params, withDefaultTimeout(options));
		}
	};

//#endregion
//#region node_modules/.pnpm/@mcp-b+transports@1.4.0_zod-to-json-schema@3.25.1_zod@3.25.76_/node_modules/@mcp-b/transports/dist/index.js
	let t = function(e) {
		return e.START = `start`, e.STARTED = `started`, e.STOP = `stop`, e.STOPPED = `stopped`, e.PING = `ping`, e.PONG = `pong`, e.ERROR = `error`, e.LIST_TOOLS = `list_tools`, e.CALL_TOOL = `call_tool`, e.TOOL_LIST_UPDATED = `tool_list_updated`, e.TOOL_LIST_UPDATED_ACK = `tool_list_updated_ack`, e.PROCESS_DATA = `process_data`, e.SERVER_STARTED = `server_started`, e.SERVER_STOPPED = `server_stopped`, e.ERROR_FROM_NATIVE_HOST = `error_from_native_host`, e.CONNECT_NATIVE = `connectNative`, e.PING_NATIVE = `ping_native`, e.DISCONNECT_NATIVE = `disconnect_native`, e;
	}({});
	const n = {
		NAME: `com.chromemcp.nativehost`,
		DEFAULT_PORT: 12306
	}, r = {
		NATIVE_CONNECTION_FAILED: `Failed to connect to native host`,
		NATIVE_DISCONNECTED: `Native connection disconnected`,
		SERVER_STATUS_LOAD_FAILED: `Failed to load server status`,
		TOOL_EXECUTION_FAILED: `Tool execution failed`,
		SERVER_STATUS_SAVE_FAILED: `Failed to save server status`
	}, i = {
		TOOL_EXECUTED: `Tool executed successfully`,
		CONNECTION_ESTABLISHED: `Connection established`,
		SERVER_STARTED: `Server started successfully`,
		SERVER_STOPPED: `Server stopped successfully`
	}, a = { SERVER_STATUS: `serverStatus` }, o = {
		GET_SERVER_STATUS: `get_server_status`,
		REFRESH_SERVER_STATUS: `refresh_server_status`,
		SERVER_STATUS_CHANGED: `server_status_changed`
	}, s = n.NAME;
	var c = class {
		_port;
		_extensionId;
		_portName;
		_messageHandler;
		_disconnectHandler;
		_isReconnecting = !1;
		_reconnectAttempts = 0;
		_reconnectTimer;
		_currentReconnectDelay;
		_isStarted = !1;
		_isClosed = !1;
		_autoReconnect;
		_maxReconnectAttempts;
		_reconnectDelay;
		_maxReconnectDelay;
		_reconnectBackoffMultiplier;
		onclose;
		onerror;
		onmessage;
		constructor(e = {}) {
			this._extensionId = e.extensionId, this._portName = e.portName || `mcp`, this._autoReconnect = e.autoReconnect ?? !0, this._maxReconnectAttempts = e.maxReconnectAttempts ?? 10, this._reconnectDelay = e.reconnectDelay ?? 1e3, this._maxReconnectDelay = e.maxReconnectDelay ?? 3e4, this._reconnectBackoffMultiplier = e.reconnectBackoffMultiplier ?? 1.5, this._currentReconnectDelay = this._reconnectDelay;
		}
		async start() {
			if (this._isStarted && this._port) {
				console.warn(`ExtensionClientTransport already started! If using Client class, note that connect() calls start() automatically.`);
				return;
			}
			this._isStarted = !0, this._isClosed = !1, await this._connect();
		}
		async _connect() {
			return new Promise((t, n) => {
				if (!chrome?.runtime?.connect) {
					n(Error(`Chrome runtime API not available. This transport must be used in a Chrome extension context.`));
					return;
				}
				try {
					this._extensionId ? this._port = chrome.runtime.connect(this._extensionId, { name: this._portName }) : this._port = chrome.runtime.connect({ name: this._portName }), this._messageHandler = (t) => {
						try {
							if (t.type === `keep-alive`) return;
							let n = JSONRPCMessageSchema.parse(t);
							this.onmessage?.(n);
						} catch (e) {
							this.onerror?.(Error(`Failed to parse message: ${e}`));
						}
					}, this._disconnectHandler = () => {
						this._cleanup(), this._isStarted && !this._isClosed && this._autoReconnect ? this._scheduleReconnect() : this.onclose?.();
					}, this._port.onMessage.addListener(this._messageHandler), this._port.onDisconnect.addListener(this._disconnectHandler);
					let r = chrome.runtime.lastError;
					if (r) {
						if (this._cleanup(), this._isReconnecting && this._isStarted && !this._isClosed && this._autoReconnect) {
							n(Error(`Connection failed: ${r.message}`));
							return;
						}
						n(Error(`Connection failed: ${r.message}`));
						return;
					}
					this._reconnectAttempts = 0, this._currentReconnectDelay = this._reconnectDelay, this._isReconnecting = !1, t();
				} catch (e) {
					n(e);
				}
			});
		}
		async send(e, t) {
			if (!this._isStarted) throw Error(`Transport not started`);
			if (this._isClosed) throw Error(`Transport is closed`);
			if (!this._port) throw Error(`Not connected`);
			try {
				this._port.postMessage(e);
			} catch (e) {
				throw Error(`Failed to send message: ${e}`);
			}
		}
		async close() {
			if (this._isClosed = !0, this._isStarted = !1, this._reconnectTimer !== void 0 && (clearTimeout(this._reconnectTimer), this._reconnectTimer = void 0), this._port) try {
				this._port.disconnect();
			} catch {}
			this._cleanup(), this.onclose?.();
		}
		_cleanup() {
			this._port && (this._messageHandler && this._port.onMessage.removeListener(this._messageHandler), this._disconnectHandler && this._port.onDisconnect.removeListener(this._disconnectHandler)), this._port = void 0;
		}
		_scheduleReconnect() {
			if (!(this._isReconnecting || this._isClosed || !this._isStarted)) {
				if (this._isReconnecting = !0, this._reconnectAttempts >= this._maxReconnectAttempts) {
					console.error(`Maximum reconnection attempts reached`), this._isReconnecting = !1, this.onerror?.(Error(`Maximum reconnection attempts reached`)), this.onclose?.();
					return;
				}
				this._reconnectAttempts++, console.log(`Scheduling reconnection attempt ${this._reconnectAttempts}/${this._maxReconnectAttempts} in ${this._currentReconnectDelay}ms`), this._reconnectTimer = setTimeout(() => {
					this._attemptReconnect();
				}, this._currentReconnectDelay), this._currentReconnectDelay = Math.min(this._currentReconnectDelay * this._reconnectBackoffMultiplier, this._maxReconnectDelay);
			}
		}
		async _attemptReconnect() {
			if (!(this._isClosed || !this._isStarted)) try {
				if (chrome?.runtime?.sendMessage) try {
					await chrome.runtime.sendMessage({ type: `ping` });
				} catch {}
				await this._connect(), console.log(`Reconnection successful`), this._isReconnecting = !1;
			} catch (e) {
				console.error(`Reconnection failed:`, e), this._scheduleReconnect();
			}
		}
	}, l = class {
		_port;
		_started = !1;
		_messageHandler;
		_disconnectHandler;
		_keepAliveTimer;
		_options;
		_connectionInfo;
		onclose;
		onerror;
		onmessage;
		constructor(e, t = {}) {
			this._port = e, this._options = {
				keepAlive: t.keepAlive ?? !0,
				keepAliveInterval: t.keepAliveInterval ?? 1e3
			}, this._connectionInfo = {
				connectedAt: Date.now(),
				lastMessageAt: Date.now(),
				messageCount: 0
			};
		}
		async start() {
			if (this._started) throw Error(`ExtensionServerTransport already started! If using Server class, note that connect() calls start() automatically.`);
			if (!this._port) throw Error(`Port not available`);
			this._started = !0, this._messageHandler = (t) => {
				try {
					if (this._connectionInfo.lastMessageAt = Date.now(), this._connectionInfo.messageCount++, t.type === `ping`) {
						this._port.postMessage({ type: `pong` });
						return;
					}
					let n = JSONRPCMessageSchema.parse(t);
					this.onmessage?.(n);
				} catch (e) {
					this.onerror?.(Error(`Failed to parse message: ${e}`));
				}
			}, this._disconnectHandler = () => {
				console.log(`[ExtensionServerTransport] Client disconnected after ${Date.now() - this._connectionInfo.connectedAt}ms, processed ${this._connectionInfo.messageCount} messages`), this._cleanup(), this.onclose?.();
			}, this._port.onMessage.addListener(this._messageHandler), this._port.onDisconnect.addListener(this._disconnectHandler), this._options.keepAlive && this._startKeepAlive(), console.log(`[ExtensionServerTransport] Started with client: ${this._port.sender?.id || `unknown`}`);
		}
		async send(e, t) {
			if (!this._started) throw Error(`Transport not started`);
			if (!this._port) throw Error(`Not connected to client`);
			try {
				this._port.postMessage(e);
			} catch (e) {
				throw chrome.runtime.lastError || !this._port ? (this._cleanup(), this.onclose?.(), Error(`Client disconnected`)) : Error(`Failed to send message: ${e}`);
			}
		}
		async close() {
			if (this._started = !1, this._port) try {
				this._port.disconnect();
			} catch {}
			this._cleanup(), this.onclose?.();
		}
		_cleanup() {
			this._keepAliveTimer !== void 0 && (clearInterval(this._keepAliveTimer), this._keepAliveTimer = void 0), this._port && (this._messageHandler && this._port.onMessage.removeListener(this._messageHandler), this._disconnectHandler && this._port.onDisconnect.removeListener(this._disconnectHandler));
		}
		_startKeepAlive() {
			this._keepAliveTimer ||= (console.log(`[ExtensionServerTransport] Starting keep-alive with ${this._options.keepAliveInterval}ms interval`), setInterval(() => {
				if (!this._port) {
					this._stopKeepAlive();
					return;
				}
				try {
					this._port.postMessage({
						type: `keep-alive`,
						timestamp: Date.now()
					});
				} catch (e) {
					console.error(`[ExtensionServerTransport] Keep-alive failed:`, e), this._stopKeepAlive();
				}
			}, this._options.keepAliveInterval));
		}
		_stopKeepAlive() {
			this._keepAliveTimer !== void 0 && (clearInterval(this._keepAliveTimer), this._keepAliveTimer = void 0);
		}
		getConnectionInfo() {
			return {
				...this._connectionInfo,
				uptime: Date.now() - this._connectionInfo.connectedAt,
				isConnected: !!this._port && this._started
			};
		}
	}, u = class {
		_started = !1;
		_allowedOrigins;
		_channelId;
		_messageHandler;
		_clientOrigin;
		_serverReadyTimeout;
		_serverReadyRetryMs;
		onclose;
		onerror;
		onmessage;
		constructor(e) {
			if (!e.allowedOrigins || e.allowedOrigins.length === 0) throw Error(`At least one allowed origin must be specified`);
			this._allowedOrigins = e.allowedOrigins, this._channelId = e.channelId || `mcp-iframe`, this._serverReadyRetryMs = e.serverReadyRetryMs ?? 250;
		}
		async start() {
			if (this._started) throw Error(`Transport already started`);
			this._messageHandler = (t) => {
				if (!this._allowedOrigins.includes(t.origin) && !this._allowedOrigins.includes(`*`) || t.data?.channel !== this._channelId || t.data?.type !== `mcp` || t.data?.direction !== `client-to-server`) return;
				this._clientOrigin = t.origin;
				let n = t.data.payload;
				if (typeof n == `string` && n === `mcp-check-ready`) {
					this.broadcastServerReady();
					return;
				}
				try {
					let t = JSONRPCMessageSchema.parse(n);
					this.onmessage?.(t);
				} catch (e) {
					this.onerror?.(Error(`Invalid message: ${e instanceof Error ? e.message : String(e)}`));
				}
			}, window.addEventListener(`message`, this._messageHandler), this._started = !0, this.broadcastServerReady();
		}
		broadcastServerReady() {
			window.parent && window.parent !== window ? (window.parent.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `server-to-client`,
				payload: `mcp-server-ready`
			}, `*`), this.clearServerReadyRetry()) : this.scheduleServerReadyRetry();
		}
		scheduleServerReadyRetry() {
			this._serverReadyTimeout ||= setTimeout(() => {
				this._serverReadyTimeout = void 0, this._started && this.broadcastServerReady();
			}, this._serverReadyRetryMs);
		}
		clearServerReadyRetry() {
			this._serverReadyTimeout &&= (clearTimeout(this._serverReadyTimeout), void 0);
		}
		async send(e) {
			if (!this._started) throw Error(`Transport not started`);
			if (!this._clientOrigin) {
				console.warn(`[IframeChildTransport] No client connected, message not sent`);
				return;
			}
			window.parent && window.parent !== window ? window.parent.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `server-to-client`,
				payload: e
			}, this._clientOrigin) : console.warn(`[IframeChildTransport] Not running in an iframe, message not sent`);
		}
		async close() {
			this._messageHandler && window.removeEventListener(`message`, this._messageHandler), this._started = !1, this._clientOrigin && window.parent && window.parent !== window && window.parent.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `server-to-client`,
				payload: `mcp-server-stopped`
			}, `*`), this.clearServerReadyRetry(), this.onclose?.();
		}
	}, d = class {
		_started = !1;
		_iframe;
		_targetOrigin;
		_channelId;
		_messageHandler;
		_checkReadyTimeout;
		_checkReadyRetryMs;
		serverReadyPromise;
		_serverReadyResolve;
		_serverReadyReject;
		onclose;
		onerror;
		onmessage;
		constructor(e) {
			if (!e.iframe) throw Error(`iframe element is required`);
			if (!e.targetOrigin) throw Error(`targetOrigin must be explicitly set for security`);
			this._iframe = e.iframe, this._targetOrigin = e.targetOrigin, this._channelId = e.channelId || `mcp-iframe`, this._checkReadyRetryMs = e.checkReadyRetryMs ?? 250;
			let { promise: t, resolve: n, reject: r } = Promise.withResolvers();
			this.serverReadyPromise = t, this._serverReadyResolve = n, this._serverReadyReject = r;
		}
		async start() {
			if (this._started) throw Error(`Transport already started`);
			this._messageHandler = (t) => {
				if (t.origin !== this._targetOrigin || t.data?.channel !== this._channelId || t.data?.type !== `mcp` || t.data?.direction !== `server-to-client`) return;
				let n = t.data.payload;
				if (typeof n == `string` && n === `mcp-server-ready`) {
					this._serverReadyResolve(), this.clearCheckReadyRetry();
					return;
				}
				if (typeof n == `string` && n === `mcp-server-stopped`) {
					console.log(`[IframeParentTransport] Received mcp-server-stopped event, closing transport`), this.close();
					return;
				}
				try {
					let t = JSONRPCMessageSchema.parse(n);
					this._serverReadyResolve(), this.onmessage?.(t);
				} catch (e) {
					this.onerror?.(Error(`Invalid message: ${e instanceof Error ? e.message : String(e)}`));
				}
			}, window.addEventListener(`message`, this._messageHandler), this._started = !0, this.sendCheckReady();
		}
		sendCheckReady() {
			let e = this._iframe.contentWindow;
			if (!e) {
				console.warn(`[IframeParentTransport] iframe.contentWindow not available, will retry`), this.scheduleCheckReadyRetry();
				return;
			}
			e.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `client-to-server`,
				payload: `mcp-check-ready`
			}, this._targetOrigin);
		}
		scheduleCheckReadyRetry() {
			this._checkReadyTimeout ||= setTimeout(() => {
				this._checkReadyTimeout = void 0, this._started && this.sendCheckReady();
			}, this._checkReadyRetryMs);
		}
		clearCheckReadyRetry() {
			this._checkReadyTimeout &&= (clearTimeout(this._checkReadyTimeout), void 0);
		}
		async send(e) {
			if (!this._started) throw Error(`Transport not started`);
			await this.serverReadyPromise;
			let t = this._iframe.contentWindow;
			if (!t) throw Error(`iframe.contentWindow not available`);
			t.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `client-to-server`,
				payload: e
			}, this._targetOrigin);
		}
		async close() {
			this._messageHandler && window.removeEventListener(`message`, this._messageHandler), this._serverReadyReject(Error(`Transport closed before server ready`)), this.clearCheckReadyRetry(), this._started = !1, this.onclose?.();
		}
	}, f = class {
		_started = !1;
		_targetOrigin;
		_channelId;
		_requestTimeout;
		_messageHandler;
		serverReadyPromise;
		_serverReadyResolve;
		_serverReadyReject;
		_serverReadySettled = !1;
		_activeRequests = /* @__PURE__ */ new Map();
		onclose;
		onerror;
		onmessage;
		constructor(e) {
			if (!e.targetOrigin) throw Error(`targetOrigin must be explicitly set for security`);
			this._targetOrigin = e.targetOrigin, this._channelId = e.channelId ?? `mcp-default`, this._requestTimeout = e.requestTimeout ?? 1e4;
			let { promise: t, resolve: n, reject: r } = Promise.withResolvers();
			this.serverReadyPromise = t, this._serverReadyResolve = n, this._serverReadyReject = r;
		}
		async start() {
			if (this._started) throw Error(`Transport already started`);
			this._messageHandler = (t) => {
				if (this._targetOrigin !== `*` && t.origin !== this._targetOrigin || t.data?.channel !== this._channelId || t.data?.type !== `mcp` || t.data?.direction !== `server-to-client`) return;
				let n = t.data.payload;
				if (typeof n == `string` && n === `mcp-server-ready`) {
					this._serverReadySettled || (this._serverReadySettled = !0, this._serverReadyResolve());
					return;
				}
				if (typeof n == `string` && n === `mcp-server-stopped`) {
					console.log(`[TabClientTransport] Received mcp-server-stopped event, closing transport`), this.close();
					return;
				}
				try {
					let t = JSONRPCMessageSchema.parse(n);
					this._serverReadySettled || (this._serverReadySettled = !0, this._serverReadyResolve()), this._clearRequestTimeout(t), this.onmessage?.(t);
				} catch (e) {
					this.onerror?.(Error(`Invalid message: ${e instanceof Error ? e.message : String(e)}`));
				}
			}, window.addEventListener(`message`, this._messageHandler), this._started = !0, this._sendCheckReady();
		}
		async send(e) {
			if (!this._started) throw Error(`Transport not started`);
			await this.serverReadyPromise, `method` in e && `id` in e && e.id !== void 0 && this._startRequestTimeout(e), window.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `client-to-server`,
				payload: e
			}, this._targetOrigin);
		}
		async close() {
			this._messageHandler && window.removeEventListener(`message`, this._messageHandler);
			for (let [e, t] of this._activeRequests) clearTimeout(t.timeoutId);
			this._activeRequests.clear(), this._serverReadySettled || (this._serverReadySettled = !0, this._serverReadyReject(Error(`Transport closed before server ready`))), this._started = !1, this.onclose?.();
		}
		_sendCheckReady() {
			window.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `client-to-server`,
				payload: `mcp-check-ready`
			}, this._targetOrigin);
		}
		_startRequestTimeout(e) {
			if (!(`id` in e) || e.id === void 0) return;
			let t = setTimeout(() => {
				this._handleRequestTimeout(e.id);
			}, this._requestTimeout);
			this._activeRequests.set(e.id, {
				timeoutId: t,
				request: e
			});
		}
		_clearRequestTimeout(e) {
			if ((`result` in e || `error` in e) && e.id !== void 0) {
				let t = this._activeRequests.get(e.id);
				t && (clearTimeout(t.timeoutId), this._activeRequests.delete(e.id));
			}
		}
		_handleRequestTimeout(e) {
			let t = this._activeRequests.get(e);
			if (!t) return;
			this._activeRequests.delete(e);
			let n = {
				jsonrpc: `2.0`,
				id: e,
				error: {
					code: -32e3,
					message: `Request timeout - server may have navigated or become unresponsive`,
					data: {
						timeoutMs: this._requestTimeout,
						originalMethod: `method` in t.request ? t.request.method : void 0
					}
				}
			};
			this.onmessage?.(n);
		}
	}, p = class {
		_started = !1;
		_allowedOrigins;
		_channelId;
		_messageHandler;
		_clientOrigin;
		_beforeUnloadHandler;
		_cleanupInterval;
		_pendingRequests = /* @__PURE__ */ new Map();
		REQUEST_TIMEOUT_MS = 3e5;
		onclose;
		onerror;
		onmessage;
		_resolveTargetOrigin(e) {
			return e && e !== `null` ? e : `*`;
		}
		constructor(e) {
			if (!e.allowedOrigins || e.allowedOrigins.length === 0) throw Error(`At least one allowed origin must be specified`);
			this._allowedOrigins = e.allowedOrigins, this._channelId = e.channelId || `mcp-default`;
		}
		async start() {
			if (this._started) throw Error(`Transport already started`);
			this._messageHandler = (t) => {
				if (!this._allowedOrigins.includes(t.origin) && !this._allowedOrigins.includes(`*`) || t.data?.channel !== this._channelId || t.data?.type !== `mcp` || t.data?.direction !== `client-to-server`) return;
				this._clientOrigin = t.origin;
				let n = t.data.payload;
				if (typeof n == `string` && n === `mcp-check-ready`) {
					window.postMessage({
						channel: this._channelId,
						type: `mcp`,
						direction: `server-to-client`,
						payload: `mcp-server-ready`
					}, this._resolveTargetOrigin(this._clientOrigin));
					return;
				}
				try {
					let t = JSONRPCMessageSchema.parse(n);
					`method` in t && `id` in t && t.id !== void 0 && this._pendingRequests.set(t.id, {
						request: t,
						receivedAt: Date.now(),
						interruptedSent: !1
					}), this.onmessage?.(t);
				} catch (e) {
					this.onerror?.(Error(`Invalid message: ${e instanceof Error ? e.message : String(e)}`));
				}
			}, window.addEventListener(`message`, this._messageHandler), this._started = !0, this._beforeUnloadHandler = () => {
				this._handleBeforeUnload();
			}, window.addEventListener(`beforeunload`, this._beforeUnloadHandler), this._cleanupInterval = setInterval(() => {
				this._cleanupStaleRequests();
			}, 6e4), window.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `server-to-client`,
				payload: `mcp-server-ready`
			}, `*`);
		}
		async send(e) {
			if (!this._started) throw Error(`Transport not started`);
			if ((`result` in e || `error` in e) && e.id !== void 0) {
				if (this._pendingRequests.get(e.id)?.interruptedSent) {
					console.debug(`[TabServerTransport] Suppressing response for ${e.id} - interrupted response already sent`), this._pendingRequests.delete(e.id);
					return;
				}
				this._pendingRequests.delete(e.id);
			}
			let t = this._resolveTargetOrigin(this._clientOrigin);
			this._clientOrigin || console.debug(`[TabServerTransport] Sending to unknown client origin (backwards compatibility mode)`), window.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `server-to-client`,
				payload: e
			}, t);
		}
		_handleBeforeUnload() {
			let e = Array.from(this._pendingRequests.entries()).reverse();
			for (let [t, n] of e) {
				n.interruptedSent = !0;
				let e = {
					jsonrpc: `2.0`,
					id: t,
					result: {
						content: [{
							type: `text`,
							text: `Tool execution interrupted by page navigation`
						}],
						metadata: {
							navigationInterrupted: !0,
							originalMethod: `method` in n.request ? n.request.method : `unknown`,
							timestamp: Date.now()
						}
					}
				};
				try {
					window.postMessage({
						channel: this._channelId,
						type: `mcp`,
						direction: `server-to-client`,
						payload: e
					}, this._resolveTargetOrigin(this._clientOrigin));
				} catch (e) {
					console.error(`[TabServerTransport] Failed to send beforeunload response:`, e);
				}
			}
			this._pendingRequests.clear();
		}
		_cleanupStaleRequests() {
			let e = Date.now(), t = [];
			for (let [n, r] of this._pendingRequests) e - r.receivedAt > this.REQUEST_TIMEOUT_MS && t.push(n);
			if (t.length > 0) {
				console.warn(`[TabServerTransport] Cleaning up ${t.length} stale requests`);
				for (let e of t) this._pendingRequests.delete(e);
			}
		}
		async close() {
			this._messageHandler && window.removeEventListener(`message`, this._messageHandler), this._beforeUnloadHandler && window.removeEventListener(`beforeunload`, this._beforeUnloadHandler), this._cleanupInterval !== void 0 && clearInterval(this._cleanupInterval), this._pendingRequests.clear(), this._started = !1, window.postMessage({
				channel: this._channelId,
				type: `mcp`,
				direction: `server-to-client`,
				payload: `mcp-server-stopped`
			}, `*`), this.onclose?.();
		}
	}, m = class {
		_port;
		_extensionId;
		_portName;
		_messageHandler;
		_disconnectHandler;
		_isReconnecting = !1;
		_reconnectAttempts = 0;
		_reconnectTimer;
		_currentReconnectDelay;
		_isStarted = !1;
		_isClosed = !1;
		_autoReconnect;
		_maxReconnectAttempts;
		_reconnectDelay;
		_maxReconnectDelay;
		_reconnectBackoffMultiplier;
		onclose;
		onerror;
		onmessage;
		constructor(e = {}) {
			this._extensionId = e.extensionId, this._portName = e.portName || `mcp`, this._autoReconnect = e.autoReconnect ?? !0, this._maxReconnectAttempts = e.maxReconnectAttempts ?? 10, this._reconnectDelay = e.reconnectDelay ?? 1e3, this._maxReconnectDelay = e.maxReconnectDelay ?? 3e4, this._reconnectBackoffMultiplier = e.reconnectBackoffMultiplier ?? 1.5, this._currentReconnectDelay = this._reconnectDelay;
		}
		async start() {
			if (this._isStarted && this._port) {
				console.warn(`UserScriptClientTransport already started! If using Client class, note that connect() calls start() automatically.`);
				return;
			}
			this._isStarted = !0, this._isClosed = !1, await this._connect();
		}
		async _connect() {
			return new Promise((t, n) => {
				if (!chrome?.runtime?.connect) {
					n(Error(`Chrome runtime API not available. This transport must be used in a Chrome MV3 User Script context.`));
					return;
				}
				try {
					this._extensionId ? this._port = chrome.runtime.connect(this._extensionId, { name: this._portName }) : this._port = chrome.runtime.connect({ name: this._portName }), this._messageHandler = (t) => {
						try {
							if (t.type === `keep-alive`) return;
							let n = JSONRPCMessageSchema.parse(t);
							this.onmessage?.(n);
						} catch (e) {
							this.onerror?.(Error(`Failed to parse message: ${e}`));
						}
					}, this._disconnectHandler = () => {
						this._cleanup(), this._isStarted && !this._isClosed && this._autoReconnect ? this._scheduleReconnect() : this.onclose?.();
					}, this._port.onMessage.addListener(this._messageHandler), this._port.onDisconnect.addListener(this._disconnectHandler);
					let r = chrome.runtime.lastError;
					if (r) {
						if (this._cleanup(), this._isReconnecting && this._isStarted && !this._isClosed && this._autoReconnect) {
							n(Error(`Connection failed: ${r.message}`));
							return;
						}
						n(Error(`Connection failed: ${r.message}`));
						return;
					}
					this._reconnectAttempts = 0, this._currentReconnectDelay = this._reconnectDelay, this._isReconnecting = !1, t();
				} catch (e) {
					n(e);
				}
			});
		}
		async send(e, t) {
			if (!this._isStarted) throw Error(`Transport not started`);
			if (this._isClosed) throw Error(`Transport is closed`);
			if (!this._port) throw Error(`Not connected`);
			try {
				this._port.postMessage(e);
			} catch (e) {
				throw Error(`Failed to send message: ${e}`);
			}
		}
		async close() {
			if (this._isClosed = !0, this._isStarted = !1, this._reconnectTimer !== void 0 && (clearTimeout(this._reconnectTimer), this._reconnectTimer = void 0), this._port) try {
				this._port.disconnect();
			} catch {}
			this._cleanup(), this.onclose?.();
		}
		_cleanup() {
			this._port && (this._messageHandler && this._port.onMessage.removeListener(this._messageHandler), this._disconnectHandler && this._port.onDisconnect.removeListener(this._disconnectHandler)), this._port = void 0;
		}
		_scheduleReconnect() {
			if (!(this._isReconnecting || this._isClosed || !this._isStarted)) {
				if (this._isReconnecting = !0, this._reconnectAttempts >= this._maxReconnectAttempts) {
					console.error(`Maximum reconnection attempts reached`), this._isReconnecting = !1, this.onerror?.(Error(`Maximum reconnection attempts reached`)), this.onclose?.();
					return;
				}
				this._reconnectAttempts++, console.log(`Scheduling reconnection attempt ${this._reconnectAttempts}/${this._maxReconnectAttempts} in ${this._currentReconnectDelay}ms`), this._reconnectTimer = setTimeout(() => {
					this._attemptReconnect();
				}, this._currentReconnectDelay), this._currentReconnectDelay = Math.min(this._currentReconnectDelay * this._reconnectBackoffMultiplier, this._maxReconnectDelay);
			}
		}
		async _attemptReconnect() {
			if (!(this._isClosed || !this._isStarted)) try {
				if (chrome?.runtime?.sendMessage) try {
					await chrome.runtime.sendMessage({ type: `ping` });
				} catch {}
				await this._connect(), console.log(`Reconnection successful`), this._isReconnecting = !1;
			} catch (e) {
				console.error(`Reconnection failed:`, e), this._scheduleReconnect();
			}
		}
	}, h = class {
		_port;
		_started = !1;
		_messageHandler;
		_disconnectHandler;
		_keepAliveTimer;
		_options;
		_connectionInfo;
		onclose;
		onerror;
		onmessage;
		constructor(e, t = {}) {
			this._port = e, this._options = {
				keepAlive: t.keepAlive ?? !0,
				keepAliveInterval: t.keepAliveInterval ?? 1e3
			}, this._connectionInfo = {
				connectedAt: Date.now(),
				lastMessageAt: Date.now(),
				messageCount: 0
			};
		}
		async start() {
			if (this._started) throw Error(`UserScriptServerTransport already started! If using Server class, note that connect() calls start() automatically.`);
			if (!this._port) throw Error(`Port not available`);
			this._started = !0, this._messageHandler = (t) => {
				try {
					if (this._connectionInfo.lastMessageAt = Date.now(), this._connectionInfo.messageCount++, t.type === `ping`) {
						this._port.postMessage({ type: `pong` });
						return;
					}
					let n = JSONRPCMessageSchema.parse(t);
					this.onmessage?.(n);
				} catch (e) {
					this.onerror?.(Error(`Failed to parse message: ${e}`));
				}
			}, this._disconnectHandler = () => {
				console.log(`[UserScriptServerTransport] Client disconnected after ${Date.now() - this._connectionInfo.connectedAt}ms, processed ${this._connectionInfo.messageCount} messages`), this._cleanup(), this.onclose?.();
			}, this._port.onMessage.addListener(this._messageHandler), this._port.onDisconnect.addListener(this._disconnectHandler), this._options.keepAlive && this._startKeepAlive(), console.log(`[UserScriptServerTransport] Started with client: ${this._port.sender?.id || `unknown`}`);
		}
		async send(e, t) {
			if (!this._started) throw Error(`Transport not started`);
			if (!this._port) throw Error(`Not connected to client`);
			try {
				this._port.postMessage(e);
			} catch (e) {
				throw chrome.runtime.lastError || !this._port ? (this._cleanup(), this.onclose?.(), Error(`Client disconnected`)) : Error(`Failed to send message: ${e}`);
			}
		}
		async close() {
			if (this._started = !1, this._port) try {
				this._port.disconnect();
			} catch {}
			this._cleanup(), this.onclose?.();
		}
		_cleanup() {
			this._keepAliveTimer !== void 0 && (clearInterval(this._keepAliveTimer), this._keepAliveTimer = void 0), this._port && (this._messageHandler && this._port.onMessage.removeListener(this._messageHandler), this._disconnectHandler && this._port.onDisconnect.removeListener(this._disconnectHandler));
		}
		_startKeepAlive() {
			this._keepAliveTimer ||= (console.log(`[UserScriptServerTransport] Starting keep-alive with ${this._options.keepAliveInterval}ms interval`), setInterval(() => {
				if (!this._port) {
					this._stopKeepAlive();
					return;
				}
				try {
					this._port.postMessage({
						type: `keep-alive`,
						timestamp: Date.now()
					});
				} catch (e) {
					console.error(`[UserScriptServerTransport] Keep-alive failed:`, e), this._stopKeepAlive();
				}
			}, this._options.keepAliveInterval));
		}
		_stopKeepAlive() {
			this._keepAliveTimer !== void 0 && (clearInterval(this._keepAliveTimer), this._keepAliveTimer = void 0);
		}
		getConnectionInfo() {
			return {
				...this._connectionInfo,
				uptime: Date.now() - this._connectionInfo.connectedAt,
				isConnected: !!this._port && this._started
			};
		}
	};

//#endregion
//#region node_modules/.pnpm/@mcp-b+global@1.6.0_zod-to-json-schema@3.25.1_zod@3.25.76__zod@3.25.76/node_modules/@mcp-b/global/dist/index.js
	let runtime = null;
	function isBrowserEnvironment() {
		return typeof window !== "undefined" && typeof window.navigator !== "undefined";
	}
	/**
	* Replace navigator.modelContext with the given value.
	* Tries an own-property on the navigator instance first. If the native browser
	* defines modelContext as a non-configurable property (common in Chromium), this
	* will throw — in that case we fall back to redefining the getter on
	* Navigator.prototype so that `navigator.modelContext` resolves to our value.
	*/
	function replaceModelContext(value) {
		try {
			Object.defineProperty(navigator, "modelContext", {
				configurable: true,
				enumerable: true,
				writable: false,
				value
			});
		} catch {
			Object.defineProperty(Object.getPrototypeOf(navigator), "modelContext", {
				configurable: true,
				enumerable: true,
				get() {
					return value;
				}
			});
		}
		if (navigator.modelContext !== value) console.error("[WebModelContext] Failed to replace navigator.modelContext.", "Descriptor:", Object.getOwnPropertyDescriptor(navigator, "modelContext"));
	}
	function createTransport(config) {
		if (window.parent !== window && config?.iframeServer !== false) {
			const { allowedOrigins: allowedOrigins$1, ...rest$1 } = typeof config?.iframeServer === "object" ? config.iframeServer : {};
			return new u({
				allowedOrigins: allowedOrigins$1 ?? ["*"],
				...rest$1
			});
		}
		if (config?.tabServer === false) throw new Error("tabServer transport is disabled and iframe transport was not selected");
		const { allowedOrigins, ...rest } = typeof config?.tabServer === "object" ? config.tabServer : {};
		return new p({
			allowedOrigins: allowedOrigins ?? ["*"],
			...rest
		});
	}
	function parseTestingInputSchema(inputSchema) {
		if (!inputSchema) return;
		try {
			const parsed = JSON.parse(inputSchema);
			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
			return parsed;
		} catch (error) {
			console.warn("[WebMCP] Failed to parse testing inputSchema JSON:", error);
			return;
		}
	}
	function getTestingShimTools() {
		const testingShim = navigator.modelContextTesting;
		if (!testingShim) return;
		if (typeof testingShim.getRegisteredTools === "function") return {
			testingShim,
			tools: testingShim.getRegisteredTools()
		};
		if (typeof testingShim.listTools !== "function") return;
		return {
			testingShim,
			tools: testingShim.listTools().map((tool) => ({
				name: tool.name,
				description: tool.description ?? "",
				inputSchema: parseTestingInputSchema(tool.inputSchema) ?? {
					type: "object",
					properties: {}
				}
			}))
		};
	}
	function syncToolsFromTestingShim(server) {
		const shimState = getTestingShimTools();
		if (!shimState) return 0;
		const { testingShim, tools } = shimState;
		return server.backfillTools(tools, async (name, args) => {
			const serialized = await testingShim.executeTool(name, JSON.stringify(args ?? {}));
			if (serialized === null) return {
				content: [{
					type: "text",
					text: "Tool execution interrupted by navigation"
				}],
				isError: true
			};
			let parsed;
			try {
				parsed = JSON.parse(serialized);
			} catch (parseError) {
				throw new Error(`Failed to parse serialized tool response for ${name}: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
			}
			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`Invalid serialized tool response for ${name}`);
			return parsed;
		});
	}
	function initializeWebModelContext(options) {
		if (!isBrowserEnvironment()) return;
		if (runtime) return;
		initializeWebMCPPolyfill({ installTestingShim: options?.installTestingShim ?? "if-missing" });
		const native = navigator.modelContext;
		if (!native) throw new Error("navigator.modelContext is not available");
		const server = new BrowserMcpServer({
			name: `${window.location.hostname || "localhost"}-webmcp`,
			version: "1.0.0"
		}, { native });
		server.syncNativeTools();
		syncToolsFromTestingShim(server);
		replaceModelContext(server);
		const transport = createTransport(options?.transport);
		runtime = {
			native,
			server,
			transport
		};
		server.connect(transport).catch((error) => {
			console.error("[WebModelContext] Failed to connect MCP transport:", error);
		});
	}
	if (typeof window !== "undefined" && typeof document !== "undefined") {
		const options = window.__webModelContextOptions;
		if (options?.autoInitialize !== false) try {
			initializeWebModelContext(options);
		} catch (error) {
			console.error("[WebModelContext] Auto-initialization failed:", error);
		}
	}

//#endregion
//#region scripts/thefork-manager/verify-booking/tools.ts
/**
	* TheFork Manager — Booking page verification tools.
	*
	* These tools read specific UI elements on /booking/* pages to verify that
	* GraphQL mutations actually took effect.
	*
	* Pattern: ACT via the graphql tool, then VERIFY with these tools.
	*/
	navigator.modelContext.registerTool({
		name: "verify_booking_list",
		description: "Read the booking list visible on the page. Returns the date, active service, total reservation count, and each reservation's summary text. Use after a GraphQL mutation to confirm the change is reflected in the UI.",
		inputSchema: {
			type: "object",
			properties: {}
		},
		annotations: {
			title: "Verify Booking List",
			readOnlyHint: true
		},
		async execute() {
			const url = window.location.href;
			const dateButtons = Array.from(document.querySelectorAll("button"));
			const date = dateButtons.find((b) => /\b\d{1,2}\s\w{3}\b/.test(b.textContent ?? ""))?.textContent?.trim() ?? "unknown";
			const services = dateButtons.filter((b) => /(?:Lunch|Dinner|Brunch|Service)\s*\d+p/i.test(b.textContent ?? "")).map((b) => ({
				name: b.textContent?.trim() ?? "",
				active: b.getAttribute("aria-pressed") === "true" || b.classList.contains("active") || getComputedStyle(b).fontWeight >= "600"
			}));
			const total = Array.from(document.querySelectorAll("*")).find((el) => {
				return (el.textContent ?? "").includes("Total reserved:") && el.children.length < 5;
			})?.textContent?.trim().replace(/\s+/g, " ") ?? "unknown";
			const noReservations = dateButtons.some((b) => b.textContent?.includes("No reservations"));
			const reservations = [];
			document.querySelectorAll("[data-testid*=\"reservation\"], [class*=\"reservation-row\"], [class*=\"booking-row\"]").forEach((row) => {
				const text = row.textContent?.trim().replace(/\s+/g, " ") ?? "";
				if (text.length > 3) reservations.push({ text: text.substring(0, 200) });
			});
			return { content: [{
				type: "text",
				text: JSON.stringify({
					url,
					date,
					services,
					total,
					noReservations,
					reservationCount: reservations.length,
					reservations: reservations.slice(0, 20)
				}, null, 2)
			}] };
		}
	});
	navigator.modelContext.registerTool({
		name: "verify_page_context",
		description: "Read the current page context: URL, date, selected service, timeslot occupancy. Use to understand where you are before taking actions.",
		inputSchema: {
			type: "object",
			properties: {}
		},
		annotations: {
			title: "Verify Page Context",
			readOnlyHint: true
		},
		async execute() {
			const url = window.location.href;
			const urlMatch = url.match(/\/booking\/(\d{4}-\d{2}-\d{2})\/([a-f0-9-]+)/);
			const urlDate = urlMatch?.[1] ?? null;
			const urlServiceUuid = urlMatch?.[2] ?? null;
			const mainEl = document.querySelector("main");
			const heading = mainEl?.querySelector("h3, h2")?.textContent?.trim() ?? null;
			const staticTexts = mainEl ? Array.from(mainEl.querySelectorAll("*")).filter((el) => el.children.length === 0).map((el) => el.textContent?.trim()).filter(Boolean) : [];
			const totalBooked = staticTexts.find((t) => t.startsWith("Total booked")) ?? null;
			const totalBookable = staticTexts.find((t) => t.startsWith("Total bookable")) ?? null;
			const timeslots = [];
			for (let i = 0; i < staticTexts.length - 1; i++) {
				const timeMatch = staticTexts[i].match(/^(\d{2}:\d{2})$/);
				const occMatch = staticTexts[i + 1]?.match(/^(\d+\/\d+)$/);
				if (timeMatch && occMatch) timeslots.push({
					time: timeMatch[1],
					occupancy: occMatch[1]
				});
			}
			return { content: [{
				type: "text",
				text: JSON.stringify({
					url,
					urlDate,
					urlServiceUuid,
					heading,
					totalBooked,
					totalBookable,
					timeslots: timeslots.slice(0, 20)
				}, null, 2)
			}] };
		}
	});

//#endregion
})();