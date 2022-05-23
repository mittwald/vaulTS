export type ITransitKeyType = "aes256-gcm96" | "chacha20-poly1305" | "d25519" | "ecdsa-p256" | "rsa-2048" | "rsa-4096";
export type ITransitSignHashAlgorithm =
    | "sha1"
    | "sha2-224"
    | "sha2-256"
    | "sha2-384"
    | "sha2-512"
    | "sha3-224"
    | "sha3-256"
    | "sha3-384"
    | "sha3-512";
export type ITransitSignSignatureAlgorithm = "pss" | "pkcs1v15";
export type ITransitSignMarshalingAlgorithm = "asn1" | "jws";

export type ITransitBatchPlaintext = Array<{
    plaintext: string;
    context?: string;
}>;
export type ITransitRawBatchPlaintext = Array<{
    plaintext?: string;
    context?: string;
}>;
export type ITransitBatchCiphertext = Array<{
    ciphertext: string;
    context?: string;
}>;
export type ITransitSignBatchInput = Array<{
    input: string;
    context?: string;
}>;
export type ITransitVerifyBatchInputSignature = Array<{
    input: string;
    signature: string;
    context?: string;
}>;
export type ITransitVerifyBatchInputHMAC = Array<{
    input: string;
    hmac: string;
    context?: string;
}>;
export type ITransitSignBatchOutput = Array<{
    signature?: string;
    publickey?: string;
    error?: string;
}>;

export interface ITransitCreateOptions {
    convergent_encryption?: boolean;
    derived?: boolean;
    exportable?: boolean;
    allow_plaintext_backup?: boolean;
    type?: ITransitKeyType;
}

export interface ITransitReadResponse {
    data: {
        type: ITransitKeyType;
        deletion_allowed: boolean;
        derived: boolean;
        exportable: boolean;
        allow_plaintext_backup: boolean;
        keys: {
            [key: string]: number;
        };
        min_decryption_version: number;
        min_encryption_version: number;
        name: string;
        supports_encryption: boolean;
        supports_decryption: boolean;
        supports_derivation: boolean;
        supports_signing: boolean;
        latest_version?: number;
    };
}

export interface ITransitListResponse {
    data: {
        keys: string[];
    };
    lease_duration: number;
    lease_id: string;
    renewable: boolean;
}

export interface ITransitUpdateOptions {
    min_decryption_version?: number;
    min_encryption_version?: number;
    deletion_allowed?: boolean;
    exportable?: boolean;
    allow_plaintext_backup?: boolean;
}

export interface ITransitExportOptions {
    key_type: "encryption-key" | "signing-key" | "hmac-key";
    version?: string | "latest";
}

export interface ITransitExportResponse {
    data: {
        name: string;
        keys: {
            [key: string]: string;
        };
        type: ITransitKeyType;
    };
}

export interface ITransitEncryptOptionsSingle {
    plaintext: string;
    context?: string;
    key_version?: number;
    nonce?: string;
    type?: ITransitKeyType;
    convergent_encryption?: string;
}
export interface ITransitEncryptOptionsBatch {
    key_version?: number;
    batch_input: ITransitBatchPlaintext;
    type?: ITransitKeyType;
    convergent_encryption?: string;
}

export interface ITransitEncryptResponseSingle {
    data: {
        ciphertext: string;
    };
}

export interface ITransitEncryptResponseBatch {
    data: {
        batch_results: ITransitBatchCiphertext;
    };
}

export interface ITransitDecryptOptionsSingle {
    ciphertext: string;
    context?: string;
    nonce?: string;
}

export interface ITransitDecryptOptionsBatch {
    batch_input: ITransitBatchCiphertext;
}

export interface ITransitDecryptResponseSingle {
    data: {
        plaintext: string | undefined;
    };
}

export interface ITransitDecryptResponseBatch {
    data: {
        batch_results: ITransitBatchPlaintext;
    };
}
export interface ITransitDecryptRawResponseBatch {
    data: {
        batch_results: ITransitRawBatchPlaintext;
    };
}

export interface ITransitSignOptionsSingle {
    key_version?: number;
    hash_algorithm?: ITransitSignHashAlgorithm;
    input: string;
    context?: string;
    prehashed?: boolean;
    signature_algorithm?: ITransitSignSignatureAlgorithm;
    marshaling_algorithm?: ITransitSignMarshalingAlgorithm;
}
export interface ITransitSignOptionsBatch {
    key_version?: number;
    hash_algorithm?: ITransitSignHashAlgorithm;
    batch_input: ITransitSignBatchInput;
    prehashed?: boolean;
    signature_algorithm?: ITransitSignSignatureAlgorithm;
    marshaling_algorithm?: ITransitSignMarshalingAlgorithm;
}

export interface ITransitSignResponseSingle {
    data: {
        signature: string | undefined;
    };
}
export interface ITransitSignResponseBatch {
    data: {
        batch_results: ITransitSignBatchOutput;
    };
}

export interface ITransitVerifyOptionsSingle {
    input: string;
    signature?: string;
    hmac?: string;
    hash_algorithm?: ITransitSignHashAlgorithm;
    context?: string;
    prehashed?: boolean;
    signature_algorithm?: ITransitSignSignatureAlgorithm;
    marshaling_algorithm?: ITransitSignMarshalingAlgorithm;
}
export interface ITransitVerifyOptionsBatch {
    batch_input: ITransitVerifyBatchInputSignature | ITransitVerifyBatchInputHMAC;
    hash_algorithm?: ITransitSignHashAlgorithm;
    prehashed?: boolean;
    signature_algorithm?: ITransitSignSignatureAlgorithm;
    marshaling_algorithm?: ITransitSignMarshalingAlgorithm;
}

export interface ITransitVerifyResponseSingle {
    data: {
        valid: boolean;
    };
}
export interface ITransitVerifyResponseBatch {
    data: {
        batch_results: Array<{
            valid: boolean;
        }>;
    };
}
