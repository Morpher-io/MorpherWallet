import { defineChain } from "viem";

const version = '1.2.0'

export type ErrorCode =

    // Generic Errors
    "UNKNOWN_ERROR" | "NOT_IMPLEMENTED" | "UNSUPPORTED_OPERATION" |
    "NETWORK_ERROR" | "SERVER_ERROR" | "TIMEOUT" | "BAD_DATA" |
    "CANCELLED" |

    // Operational Errors
    "BUFFER_OVERRUN" |  "NUMERIC_FAULT" |

    // Argument Errors
    "INVALID_ARGUMENT" | "MISSING_ARGUMENT" | "UNEXPECTED_ARGUMENT" |
    "VALUE_MISMATCH" |

    // Blockchain Errors
    "CALL_EXCEPTION" | "INSUFFICIENT_FUNDS" | "NONCE_EXPIRED" |
    "REPLACEMENT_UNDERPRICED" | "TRANSACTION_REPLACED" |
    "UNCONFIGURED_NAME" | "OFFCHAIN_FAULT" |

    // User Interaction
    "ACTION_REJECTED"
;


function checkType(value: any, type: string, name: string): void {
    const types = type.split("|").map(t => t.trim());
    for (let i = 0; i < types.length; i++) {
        switch (type) {
            case "any":
                return;
            case "bigint":
            case "boolean":
            case "number":
            case "string":
                if (typeof(value) === type) { return; }
        }
    }

    const error: any = new Error(`invalid value for type ${ type }`);
    error.code = "INVALID_ARGUMENT";
    error.argument = `value.${ name }`;
    error.value = value;

    throw error;
}

export function defineProperties<T>(
    target: T,
    values: { [ K in keyof T ]?: T[K] },
    types?: { [ K in keyof T ]?: string }): void {
   
       for (let key in values) {
           let value = values[key];
   
           const type = (types ? types[key]: null);
           if (type) { checkType(value, type, key); }
   
           Object.defineProperty(target, key, { enumerable: true, value, writable: false });
       }
   }
   
/**
 *  All errors include properties to assist in machine-readable errors.
 */
export interface ErrorData<T extends ErrorCode = ErrorCode> extends Error {
    /**
     *  The string error code.
     */
    code: ErrorCode;

    /**
     *  A short message describing the error, with minimal additional
     *  details.
     */
    shortMessage: string;

    /**
     *  Additional info regarding the error that may be useful.
     *
     *  This is generally helpful mostly for human-based debugging.
     */
    info?: Record<string, any>;

    /**
     *  Any related error.
     */
    error?: Error;
}


    export type ErrorInfo<T> = Omit<T, "code" | "name" | "message" | "shortMessage"> & { shortMessage?: string };

    function stringify(value: any): any {
        if (value == null) { return "null"; }
    
        if (Array.isArray(value)) {
            return "[ " + (value.map(stringify)).join(", ") + " ]";
        }
    
        if (value instanceof Uint8Array) {
            const HEX = "0123456789abcdef";
            let result = "0x";
            for (let i = 0; i < value.length; i++) {
                result += HEX[value[i] >> 4];
                result += HEX[value[i] & 0xf];
            }
            return result;
        }
    
        if (typeof(value) === "object" && typeof(value.toJSON) === "function") {
            return stringify(value.toJSON());
        }
    
        switch (typeof(value)) {
            case "boolean": case "symbol":
                return value.toString();
            case "bigint":
                return BigInt(value).toString();
            case "number":
                return (value).toString();
            case "string":
                return JSON.stringify(value);
            case "object": {
                const keys = Object.keys(value);
                keys.sort();
                return "{ " + keys.map((k) => `${ stringify(k) }: ${ stringify(value[k]) }`).join(", ") + " }";
            }
        }
    
        return `[ COULD NOT SERIALIZE ]`;
    }

export function makeError<K extends ErrorCode>(message: string, code: K, info?: any): any {
    let shortMessage = message;

    {
        const details: Array<string> = [];
        if (info) {
            if ("message" in info || "code" in info || "name" in info) {
                throw new Error(`value will overwrite populated values: ${ stringify(info) }`);
            }
            for (const key in info) {
                if (key === "shortMessage") { continue; }
                const value = <any>(info[key]);
//                try {
                    details.push(key + "=" + stringify(value));
//                } catch (error: any) {
//                console.log("MMM", error.message);
//                    details.push(key + "=[could not serialize object]");
//                }
            }
        }
        details.push(`code=${ code }`);
        details.push(`version=${ version }`);

        if (details.length) {
            message += " (" + details.join(", ") + ")";
        }
    }

    let error;
    switch (code) {
        case "INVALID_ARGUMENT":
            error = new TypeError(message);
            break;
        case "NUMERIC_FAULT":
        case "BUFFER_OVERRUN":
            error = new RangeError(message);
            break;
        default:
            error = new Error(message);
    }

    defineProperties<ErrorData>(<ErrorData>error, { code });

    if (info) { Object.assign(error, info); }

    if ((<any>error).shortMessage == null) {
        defineProperties<ErrorData>(<ErrorData>error, { shortMessage });
    }

    return error;
}

export const getChain = (chain_id: number, rpcEndpointURL: string) => {
    const polygonChain = defineChain({
        id: chain_id,
        name: 'Wallet Linked Chain',
        nativeCurrency: {
            decimals: 18,
            name: 'GAS',
            symbol: 'GAS',
        },
        rpcUrls: {
            default: {
                http:[rpcEndpointURL],
                webSocket: rpcEndpointURL.includes('wss:') || rpcEndpointURL.includes('ws:') ? [rpcEndpointURL] : undefined,
            },
        },

    })

    return polygonChain
}