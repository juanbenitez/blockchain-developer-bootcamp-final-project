import type { NumericType, DecimalType, TypeValueInput, ContractInput, FunctionExternalInput, Uint8ArrayLike, EncodingTextInput } from "./types";
import type * as Format from "../format";
import Big from "big.js";
export declare function places(dataType: NumericType): number;
export declare function maxValue(dataType: NumericType): Big;
export declare function minValue(dataType: NumericType): Big;
export declare function isSafeNumber(dataType: DecimalType, input: number): boolean;
export declare function isTypeValueInput(input: any): input is TypeValueInput;
export declare function isEncodingTextInput(input: any): input is EncodingTextInput;
export declare function isContractInput(input: any): input is ContractInput;
export declare function isFunctionExternalInput(input: any): input is FunctionExternalInput;
export declare function isWrappedResult(input: any): input is Format.Values.Result;
export declare function isUint8ArrayLike(input: any): input is Uint8ArrayLike;
export declare function isPlainObject(input: any): input is {
    [key: string]: unknown;
};
export declare function isBase64(input: string): boolean;
export declare function base64Length(base64: string): number;
export declare function isHexString(input: string): boolean;
export declare function isPrefixlessHexString(input: string): boolean;
export declare function isByteString(input: string): boolean;
export declare function isBoxedString(input: any): input is String;
export declare function isBoxedNumber(input: any): input is Number;
export declare function isBoxedBoolean(input: any): input is Boolean;
export declare function isBoxedPrimitive(input: any): input is String | Number | Boolean;
export declare function isValidUtf16(input: string): boolean;