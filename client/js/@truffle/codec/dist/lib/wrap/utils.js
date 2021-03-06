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
exports.isValidUtf16 = exports.isBoxedPrimitive = exports.isBoxedBoolean = exports.isBoxedNumber = exports.isBoxedString = exports.isByteString = exports.isPrefixlessHexString = exports.isHexString = exports.base64Length = exports.isBase64 = exports.isPlainObject = exports.isUint8ArrayLike = exports.isWrappedResult = exports.isFunctionExternalInput = exports.isContractInput = exports.isEncodingTextInput = exports.isTypeValueInput = exports.isSafeNumber = exports.minValue = exports.maxValue = exports.places = void 0;
const big_js_1 = __importDefault(require("big.js"));
const Conversion = __importStar(require("../conversion"));
const lodash_isboolean_1 = __importDefault(require("lodash.isboolean")); //recognizes boolean *or* Boolean
const lodash_isstring_1 = __importDefault(require("lodash.isstring")); //recognizes string *or* String
const lodash_isnumber_1 = __importDefault(require("lodash.isnumber")); //recognizes number *or* Number
const utf8_1 = __importDefault(require("utf8"));
function places(dataType) {
    switch (dataType.typeClass) {
        case "int":
        case "uint":
            return 0;
        case "fixed":
        case "ufixed":
            return dataType.places;
    }
}
exports.places = places;
function maxValue(dataType) {
    let bits = dataType.bits;
    if (dataType.typeClass === "int" || dataType.typeClass === "fixed") {
        bits -= 1; //subtract 1 for signed
    }
    const maxIntegerValue = new big_js_1.default(2).pow(bits).minus(1);
    return Conversion.shiftBigDown(maxIntegerValue, places(dataType));
}
exports.maxValue = maxValue;
function minValue(dataType) {
    if (dataType.typeClass === "uint" || dataType.typeClass === "ufixed") {
        return new big_js_1.default(0);
    }
    const minIntegerValue = new big_js_1.default(0).minus(new big_js_1.default(2).pow(dataType.bits));
    return Conversion.shiftBigDown(minIntegerValue, places(dataType));
}
exports.minValue = minValue;
function isSafeNumber(dataType, input) {
    const scaledUp = input * (10 ** dataType.places);
    return Number.MIN_SAFE_INTEGER <= scaledUp &&
        scaledUp <= Number.MAX_SAFE_INTEGER;
}
exports.isSafeNumber = isSafeNumber;
function isTypeValueInput(input) {
    return (typeof input === "object" &&
        input !== null &&
        typeof input.type === "string" &&
        "value" in input &&
        Object.keys(input).length === 2);
}
exports.isTypeValueInput = isTypeValueInput;
function isEncodingTextInput(input) {
    return (typeof input === "object" &&
        input !== null &&
        typeof input.encoding === "string" &&
        typeof input.text === "string" &&
        Object.keys(input).length === 2);
}
exports.isEncodingTextInput = isEncodingTextInput;
function isContractInput(input) {
    return (typeof input === "object" &&
        input !== null &&
        typeof input.address === "string" &&
        //we *don't* check anything more for addresses, we'll let the
        //address wrapper handle that
        !("selector" in input));
}
exports.isContractInput = isContractInput;
function isFunctionExternalInput(input) {
    return (typeof input === "object" &&
        input !== null &&
        "address" in input &&
        "selector" in input);
}
exports.isFunctionExternalInput = isFunctionExternalInput;
function isWrappedResult(input) {
    return (typeof input === "object" &&
        input !== null &&
        typeof input.type === "object" &&
        input.type !== null &&
        typeof input.type.typeClass === "string" &&
        ((input.kind === "value" && typeof input.value === "object") ||
            (input.kind === "error" && typeof input.error === "object")));
}
exports.isWrappedResult = isWrappedResult;
function isUint8ArrayLike(input) {
    return (input instanceof Uint8Array ||
        (typeof input === "object" &&
            input !== null &&
            typeof input.length === "number"));
}
exports.isUint8ArrayLike = isUint8ArrayLike;
//hack?
function isPlainObject(input) {
    return typeof input === "object" && input !== null;
}
exports.isPlainObject = isPlainObject;
function isBase64(input) {
    const base64Pattern = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}([A-Za-z0-9+/]|=)=)?$/; //Vim's syntax highlighting is wrong here
    return Boolean(input.match(base64Pattern));
}
exports.isBase64 = isBase64;
function base64Length(base64) {
    const [_, endingEquals] = base64.match(/(=*)$/); //note this match always succeeds
    return (base64.length * 3) / 4 - endingEquals.length;
}
exports.base64Length = base64Length;
function isHexString(input) {
    const hexStringPattern = /^0[xX][0-9a-fA-F]*$/;
    return Boolean(input.match(hexStringPattern));
}
exports.isHexString = isHexString;
function isPrefixlessHexString(input) {
    const shortHexStringPattern = /^[0-9a-fA-F]*$/;
    return Boolean(input.match(shortHexStringPattern));
}
exports.isPrefixlessHexString = isPrefixlessHexString;
function isByteString(input) {
    const byteStringPattern = /^0[xX]([0-9a-fA-F]{2})*$/;
    return Boolean(input.match(byteStringPattern));
}
exports.isByteString = isByteString;
function isBoxedString(input) {
    //unfortunately, isString has been typed incorrectly.
    //it should return `input is string|String`, but instead it
    //incorrectly returns `input is string`.  As such, we have
    //to work around its incorrect typing here.
    return lodash_isstring_1.default(input) && typeof input !== "string";
}
exports.isBoxedString = isBoxedString;
function isBoxedNumber(input) {
    //see comment on isBoxedString
    return lodash_isnumber_1.default(input) && typeof input !== "number";
}
exports.isBoxedNumber = isBoxedNumber;
function isBoxedBoolean(input) {
    //see comment on isBoxedString
    return lodash_isboolean_1.default(input) && typeof input !== "boolean";
}
exports.isBoxedBoolean = isBoxedBoolean;
function isBoxedPrimitive(input) {
    return isBoxedString(input) || isBoxedNumber(input) || isBoxedBoolean(input);
}
exports.isBoxedPrimitive = isBoxedPrimitive;
function isValidUtf16(input) {
    try {
        utf8_1.default.encode(input); //encode but discard :P
        return true;
    }
    catch (_a) {
        return false;
    }
}
exports.isValidUtf16 = isValidUtf16;
//# sourceMappingURL=utils.js.map