import BN from "bn.js";
export declare const WORD_SIZE = 32;
export declare const ADDRESS_SIZE = 20;
export declare const SELECTOR_SIZE = 4;
export declare const PC_SIZE = 4;
export declare const MAX_WORD: BN;
export declare const ZERO_ADDRESS: string;
export declare function keccak256(...args: any[]): BN;
export declare function equalData(bytes1: Uint8Array | undefined, bytes2: Uint8Array | undefined): boolean;
export declare function toAddress(bytes: Uint8Array | string): string;
