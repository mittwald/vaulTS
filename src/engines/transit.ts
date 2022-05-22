import { createCheckers } from "ts-interface-checker";
import transitTi from "./transit_types-ti";
import { Vault } from "../Vault";
import { AbstractVaultClient } from "../VaultClient";
import {
    ITransitCreateOptions,
    ITransitDecryptOptionsBatch,
    ITransitDecryptOptionsSingle,
    ITransitDecryptRawResponseBatch,
    ITransitDecryptResponseBatch,
    ITransitDecryptResponseSingle,
    ITransitEncryptOptionsBatch,
    ITransitEncryptOptionsSingle,
    ITransitEncryptResponseBatch,
    ITransitEncryptResponseSingle,
    ITransitSignOptionsSingle,
    ITransitSignOptionsBatch,
    ITransitExportOptions,
    ITransitExportResponse,
    ITransitListResponse,
    ITransitReadResponse,
    ITransitUpdateOptions,
    ITransitSignResponseSingle,
    ITransitSignResponseBatch,
    ITransitVerifyOptionsSingle,
    ITransitVerifyResponseSingle,
    ITransitVerifyOptionsBatch,
    ITransitVerifyResponseBatch,
} from "./transit_types";
import { validateKeyName } from "../util";

const transitChecker = createCheckers(transitTi);

/**
 * Transit client
 * @see https://www.vaultproject.io/api/secret/transit/index.html
 */
export class TransitVaultClient extends AbstractVaultClient {
    public constructor(vault: Vault, mountPoint: string = "/transit") {
        super(vault, mountPoint);
    }

    /**
     * @see https://www.vaultproject.io/api/secret/transit/index.html#create-key
     * @param key
     * @param options
     * @param options.
     * @param options.convergent_encryption If enabled, the key will support convergent encryption, where the same plaintext creates the same ciphertext. This requires derived to be set to true. When enabled, each encryption(/decryption/rewrap/datakey) operation will derive a nonce value rather than randomly generate it.
     * @param options.derived Specifies if key derivation is to be used. If enabled, all encrypt/decrypt requests to this named key must provide a context which is used for key derivation.
     * @param options.exportable Enables keys to be exportable. This allows for all the valid keys in the key ring to be exported. Once set, this cannot be disabled.
     * @param options.allow_plaintext_backup If set, enables taking backup of named key in the plaintext format. Once set, this cannot be disabled.
     * @param options.type Specifies the type of key to create.
     */
    public async create(key: string, options?: ITransitCreateOptions): Promise<void> {
        validateKeyName(key);
        return this.rawWrite(["keys", key], options);
    }

    /**
     * @see https://www.vaultproject.io/api/secret/transit/index.html#read-key
     * @param key
     */
    public async read(key: string): Promise<ITransitReadResponse> {
        validateKeyName(key);
        return this.rawRead(["keys", key]).then((res) => {
            transitChecker.ITransitReadResponse.check(res);
            return res;
        });
    }

    /**
     * Returns a list of keys. Only the key names are returned.
     * @see https://www.vaultproject.io/api/secret/transit/index.html#list-keys
     */
    public async list(): Promise<ITransitListResponse> {
        return this.rawList(["keys"]).then((res) => {
            transitChecker.ITransitListResponse.check(res);
            return res;
        });
    }

    /**
     * Deletes a named encryption key. The `deletion_allowed` tunable must be set in the keys config.
     * @see https://www.vaultproject.io/api/secret/transit/index.html#delete-key
     * @param key
     */
    public async delete(key: string): Promise<void> {
        validateKeyName(key);
        return this.rawDelete(["keys", key]);
    }

    /**
     * Deletes any named encryption key, `deletion_allowed` will be set.
     * @param key
     */
    public async forceDelete(key: string): Promise<void> {
        validateKeyName(key);
        if (!(await this.keyExists(key))) {
            return;
        }
        await this.update(key, { deletion_allowed: true });
        await this.delete(key);
    }

    /**
     * @see https://www.vaultproject.io/api/secret/transit/index.html#update-key-configuration
     * @param key
     * @param options
     * @param options.min_decryption_version Specifies the minimum version of ciphertext allowed to be decrypted. Adjusting this as part of a key rotation policy can prevent old copies of ciphertext from being decrypted, should they fall into the wrong hands. For signatures, this value controls the minimum version of signature that can be verified against. For HMACs, this controls the minimum version of a key allowed to be used as the key for verification.
     * @param options.min_encryption_version Specifies the minimum version of the key that can be used to encrypt plaintext, sign payloads, or generate HMACs. Must be 0 (which will use the latest version) or a value greater or equal to min_decryption_version.
     * @param options.deletion_allowed Specifies if the key is allowed to be deleted.
     * @param options.exportable  Enables keys to be exportable. This allows for all the valid keys in the key ring to be exported. Once set, this cannot be disabled.
     * @param options.allow_plaintext_backup If set, enables taking backup of named key in the plaintext format. Once set, this cannot be disabled.
     */
    public async update(key: string, options: ITransitUpdateOptions): Promise<void> {
        validateKeyName(key);
        return this.rawWrite(["keys", key, "config"], options);
    }

    /**
     * @see https://www.vaultproject.io/api/secret/transit/index.html#rotate-key
     * @param key
     */
    public async rotate(key: string): Promise<void> {
        validateKeyName(key);
        return this.rawWrite(["keys", key, "rotate"]);
    }

    /**
     * @see https://www.vaultproject.io/api/secret/transit/index.html#export-key
     * @param key
     * @param options
     * @param options.key_type Specifies the type of the key to export.
     * @param options.version Specifies the version of the key to read. If omitted, all versions of the key will be returned. This is specified as part of the URL. If the version is set to latest, the current key will be returned.
     */
    public async export(key: string, options: ITransitExportOptions): Promise<ITransitExportResponse> {
        validateKeyName(key);
        const parts = ["export", options.key_type, key];
        if (options.version) {
            parts.push(options.version);
        }
        return this.rawRead(parts).then((res) => {
            transitChecker.ITransitExportResponse.check(res);
            return res;
        });
    }

    /**
     * Checks wheather the specified key exists in in the list()
     * @param key
     */
    public async keyExists(key: string): Promise<boolean> {
        validateKeyName(key);
        const keys = await this.list();
        const exists = keys.data.keys.find((k) => k === key);
        if (exists) {
            return true;
        }
        return false;
    }

    /**
     * Encrypts the provided base64 plaintext or batch_input using the named key
     * @see https://www.vaultproject.io/api/secret/transit/index.html#encrypt-data
     * @param key
     * @param options
     *
     * @param options.plaintext Specifies base64 encoded plaintext to be encoded.
     * @param options.context Specifies the base64 encoded context for key derivation. This is required if key derivation is enabled for this key.
     * @param options.key_version Specifies the version of the key to use for encryption. If not set, uses the latest version. Must be greater than or equal to the key's min_encryption_version, if set.
     * @param options.nonce Specifies the base64 encoded nonce value. This must be provided if convergent encryption is enabled for this key and the key was generated with Vault 0.6.1. Not required for keys created in 0.6.2+. The value must be exactly 96 bits (12 bytes) long and the user must ensure that for any given context (and thus, any given encryption key) this nonce value is never reused.
     * @param options.batch_input Specifies a list of items to be encrypted in a single batch. When this parameter is set, if the parameters 'plaintext', 'context' and 'nonce' are also set, they will be ignored.
     * @param options.type This parameter is required when encryption key is expected to be created. When performing an upsert operation, the type of key to create.
     * @param options.convergent_encryption This parameter will only be used when a key is expected to be created. Whether to support convergent encryption. This is only supported when using a key with key derivation enabled and will require all requests to carry both a context and 96-bit (12-byte) nonce. The given nonce will be used in place of a randomly generated nonce. As a result, when the same context and nonce are supplied, the same ciphertext is generated. It is very important when using this mode that you ensure that all nonces are unique for a given context. Failing to do so will severely impact the ciphertext's security.
     */
    public async encrypt(key: string, options: ITransitEncryptOptionsSingle): Promise<ITransitEncryptResponseSingle>;
    public async encrypt(key: string, options: ITransitEncryptOptionsBatch): Promise<ITransitEncryptResponseBatch>;
    public async encrypt(
        key: string,
        options: ITransitEncryptOptionsSingle | ITransitEncryptOptionsBatch,
    ): Promise<ITransitEncryptResponseSingle | ITransitEncryptResponseBatch> {
        validateKeyName(key);
        return this.rawWrite(["encrypt", key], options).then((res) => {
            if ("batch_input" in options) {
                transitChecker.ITransitEncryptResponseBatch.check(res);
            } else {
                transitChecker.ITransitEncryptResponseSingle.check(res);
            }
            return res;
        });
    }

    /**
     * Decrypts the provided ciphertext or batch_input using the named key
     * @see https://www.vaultproject.io/api/secret/transit/index.html#decrypt-data
     * @param key
     * @param options
     * @param options.ciphertext Specifies the ciphertext to decrypt.
     * @param options.context Specifies the base64 encoded context for key derivation. This is required if key derivation is enabled.
     * @param options.nonce Specifies a base64 encoded nonce value used during encryption. Must be provided if convergent encryption is enabled for this key and the key was generated with Vault 0.6.1. Not required for keys created in 0.6.2+.
     * @param options.batch_input Specifies a list of items to be decrypted in a single batch. When this parameter is set, if the parameters 'ciphertext', 'context' and 'nonce' are also set, they will be ignored.
     */
    public async decrypt(key: string, options: ITransitDecryptOptionsSingle): Promise<ITransitDecryptResponseSingle>;
    public async decrypt(key: string, options: ITransitDecryptOptionsBatch): Promise<ITransitDecryptResponseBatch>;
    public async decrypt(
        key: string,
        options: ITransitDecryptOptionsSingle | ITransitDecryptOptionsBatch,
    ): Promise<ITransitDecryptResponseSingle | ITransitDecryptResponseBatch> {
        validateKeyName(key);
        return this.rawWrite(["decrypt", key], options).then((res) => {
            if ("batch_input" in options) {
                transitChecker.ITransitDecryptRawResponseBatch.check(res);
                return TransitVaultClient.checkEmptyBatchValues(res as ITransitDecryptRawResponseBatch);
            } else {
                transitChecker.ITransitDecryptResponseSingle.check(res);
                return res;
            }
        });
    }

    /**
     * Returns the cryptographic signature of the given data using the named key and the specified hash algorithm
     * @see https://www.vaultproject.io/api-docs/secret/transit#sign-data
     * @param key
     * @param options
     *
     * @param options.input Specifies the base64 encoded input data. One of input or batch_input must be supplied.
     * @param options.batch_input Specifies a list of items for processing. When this parameter is set, any supplied 'input' or 'context' parameters will be ignored.
     * @param options.key_version Specifies the version of the key to use for encryption. If not set, uses the latest version. Must be greater than or equal to the key's min_encryption_version, if set.
     * @param options.context Base64 encoded context for key derivation. Required if key derivation is enabled.
     * @param options.hash_algorithm Specifies the hash algorithm to use for supporting key types.
     * @param options.prehashed Set to true when the input is already hashed. When set, input is expected to be base64-encoded binary hashed data, not hex-formatted.
     * @param options.signature_algorithm When using a RSA key, specifies the RSA signature algorithm to use for signing.
     * @param options.marshaling_algorithm Specifies the way in which the signature should be marshaled.
     */
    public async sign(key: string, options: ITransitSignOptionsSingle): Promise<ITransitSignResponseSingle>;
    public async sign(key: string, options: ITransitSignOptionsBatch): Promise<ITransitSignResponseBatch>;
    public async sign(
        key: string,
        options: ITransitSignOptionsSingle | ITransitSignOptionsBatch,
    ): Promise<ITransitSignResponseSingle | ITransitSignResponseBatch> {
        validateKeyName(key);
        return this.rawWrite(["sign", key], options).then((res) => {
            if ("batch_input" in options) {
                transitChecker.ITransitSignResponseBatch.check(res);
            } else {
                transitChecker.ITransitSignResponseSingle.check(res);
            }
            return res;
        });
    }

    /**
     * Returns whether the provided signature is valid for the given data.
     * @see https://www.vaultproject.io/api-docs/secret/transit#verify-signed-data
     * @param key
     * @param options
     *
     * @param options.input Specifies the base64 encoded input data. One of input or batch_input must be supplied.
     * @param options.batch_input  Specifies a list of items for processing. When this parameter is set, any supplied 'input', 'hmac' or 'signature' parameters will be ignored. All items in the batch must consistently supply either 'hmac' or 'signature' parameters.
     * @param options.signature Specifies the signature output from the /transit/sign function. Either this must be supplied or hmac must be supplied.
     * @param options.hmac Specifies the signature output from the /transit/hmac function. Either this must be supplied or signature must be supplied.
     * @param options.hash_algorithm Specifies the hash algorithm to use.
     * @param options.context Base64 encoded context for key derivation.
     * @param options.prehashed Set to true when the input is already hashed.
     * @param options.signature_algorithm When using a RSA key, specifies the RSA signature algorithm to use for signature verification.
     * @param options.marshaling_algorithm Specifies the way in which the signature was originally marshaled.
     */
    public async verify(key: string, options: ITransitVerifyOptionsSingle): Promise<ITransitVerifyResponseSingle>;
    public async verify(key: string, options: ITransitVerifyOptionsBatch): Promise<ITransitVerifyResponseBatch>;
    public async verify(
        key: string,
        options: ITransitVerifyOptionsSingle | ITransitVerifyOptionsBatch,
    ): Promise<ITransitVerifyResponseSingle | ITransitVerifyResponseBatch> {
        validateKeyName(key);
        return this.rawWrite(["verify", key], options).then((res) => {
            if ("batch_input" in options) {
                transitChecker.ITransitVerifyResponseBatch.check(res);
            } else {
                transitChecker.ITransitVerifyResponseSingle.check(res);
            }
            return res;
        });
    }

    /**
     * Encrypts the specified plaintext with default options using the named key.
     * @param key
     * @param plaintext
     */
    public async encryptText(key: string, plaintext: string): Promise<string> {
        validateKeyName(key);
        const base64 = Buffer.from(plaintext).toString("base64");
        return this.encrypt(key, { plaintext: base64 }).then((res) => res.data.ciphertext);
    }

    /**
     * Decrypts the specified ciphertext with default options using the named key.
     * @param key
     * @param ciphertext
     */
    public async decryptText(key: string, ciphertext: string): Promise<string> {
        validateKeyName(key);
        const res = await this.decrypt(key, { ciphertext });
        if (res.data.plaintext === undefined) {
            return "";
        }
        return Buffer.from(res.data.plaintext, "base64").toString();
    }

    /*
     * Check to fix undefined plaintext values in a decrypt response.
     * @see https://github.com/hashicorp/vault/issues/6140
     *
     * {plaintext: ""} -> encrypt -> {ciphertext: "abc...yxz"} -> decrypt -> {}
     */
    private static checkEmptyBatchValues(res: ITransitDecryptRawResponseBatch): ITransitDecryptResponseBatch {
        const batchData = res.data.batch_results;
        return {
            ...res,
            data: {
                ...res.data,
                batch_results: batchData.map((v) => {
                    return {
                        ...v,
                        plaintext: v.plaintext ?? "",
                    };
                }),
            },
        };
    }
}
