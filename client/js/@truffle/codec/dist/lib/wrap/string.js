"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringCases = void 0;
const debug_1 = __importDefault(require("debug"));
const debug = debug_1.default("codec:wrap:string");
const dispatch_1 = require("./dispatch");
const errors_1 = require("./errors");
const Utils = __importStar(require("./utils"));
const Messages = __importStar(require("./messages"));
const stringCasesBasic = [
    stringFromString,
    stringFromBoxedString,
    stringFromStringValue,
    stringFailureCase
];
exports.stringCases = [
    stringFromTypeValueInput,
    ...stringCasesBasic
];
function* stringFromString(dataType, input, wrapOptions) {
    if (typeof input !== "string") {
        throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 1, "Input was not a string");
    }
    if (!Utils.isValidUtf16(input)) {
        throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 5, Messages.invalidUtf16Message);
    }
    return {
        type: dataType,
        kind: "value",
        value: {
            kind: "valid",
            asString: input
        }
    };
}
function* stringFromBoxedString(dataType, input, wrapOptions) {
    if (!Utils.isBoxedString(input)) {
        throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 1, "Input was not a boxed string");
    }
    //defer to primitive string case
    return yield* stringFromString(dataType, input.valueOf(), wrapOptions);
}
function* stringFromStringValue(dataType, input, wrapOptions) {
    if (!Utils.isWrappedResult(input)) {
        throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 1, "Input was not a wrapped result");
    }
    if (input.type.typeClass !== "string") {
        throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 5, Messages.wrappedTypeMessage(input.type));
    }
    if (input.kind !== "value") {
        throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 5, Messages.errorResultMessage);
    }
    //rather than dealing with the different kinds in this case
    //for rewrapping, we'll just rewrap directly;
    //yes, this is a bit inconsistent with how we handle this case for other types
    return {
        type: dataType,
        kind: "value",
        value: input.value
    };
}
function* stringFromTypeValueInput(dataType, input, wrapOptions) {
    if (!Utils.isTypeValueInput(input)) {
        throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 1, "Input was not a type/value pair");
    }
    if (input.type !== "string") {
        throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 5, Messages.specifiedTypeMessage(input.type));
    }
    //extract value & try again, with loose option turned on
    return yield* dispatch_1.wrapWithCases(dataType, input.value, Object.assign(Object.assign({}, wrapOptions), { loose: true }), stringCasesBasic);
}
function* stringFailureCase(dataType, input, wrapOptions) {
    throw new errors_1.TypeMismatchError(dataType, input, wrapOptions.name, 2, Messages.notAStringMessage);
}
//# sourceMappingURL=string.js.map