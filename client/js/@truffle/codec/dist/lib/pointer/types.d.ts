import type * as Ast from "../ast";
import type * as Storage from "../storage/types";
export declare type DataPointer = StackFormPointer | MemoryPointer | StoragePointer | AbiDataPointer | CodeFormPointer | ConstantDefinitionPointer | SpecialPointer | EventTopicPointer;
export declare type StackFormPointer = StackPointer | StackLiteralPointer;
export declare type AbiPointer = AbiDataPointer | GenericAbiPointer;
export declare type AbiDataPointer = CalldataPointer | ReturndataPointer | EventDataPointer;
export declare type BytesPointer = MemoryPointer | AbiDataPointer | CodePointer;
export declare type CodeFormPointer = CodePointer | UnreadablePointer;
export interface StackPointer {
    location: "stack";
    from: number;
    to: number;
}
export interface MemoryPointer {
    location: "memory";
    start: number;
    length: number;
}
export interface CalldataPointer {
    location: "calldata";
    start: number;
    length: number;
}
export interface ReturndataPointer {
    location: "returndata";
    start: number;
    length: number;
}
export interface EventDataPointer {
    location: "eventdata";
    start: number;
    length: number;
}
export interface EventTopicPointer {
    location: "eventtopic";
    topic: number;
}
export interface GenericAbiPointer {
    location: "abi";
    start: number;
    length: number;
}
export interface CodePointer {
    location: "code";
    start: number;
    length: number;
}
export interface StoragePointer {
    location: "storage";
    range: Storage.Range;
}
export interface StackLiteralPointer {
    location: "stackliteral";
    literal: Uint8Array;
}
export interface ConstantDefinitionPointer {
    location: "definition";
    definition: Ast.AstNode;
}
export interface SpecialPointer {
    location: "special";
    special: string;
}
export interface UnreadablePointer {
    location: "nowhere";
}
