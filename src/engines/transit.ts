import {createCheckers} from "ts-interface-checker";
import transitTi from "./transit_types-ti";
import {Vault, VaultRequestError} from "../Vault";
import {AbstractVaultClient} from "../VaultClient";
import {
    ITransitCreateOptions,
    ITransitDecryptOptionsBatch,
    ITransitDecryptOptionsSingle,
    ITransitDecryptResponseBatch, ITransitDecryptResponseSingle,
    ITransitEncryptOptionsBatch,
    ITransitEncryptOptionsSingle, ITransitEncryptResponseBatch,
    ITransitEncryptResponseSingle,
    ITransitExportOptions,
    ITransitExportResponse,
    ITransitListResponse,
    ITransitReadResponse,
    ITransitUpdateOptions,
} from "./transit_types";

const transitChecker = createCheckers(transitTi);

export class TransitVaultClient extends AbstractVaultClient {

    public constructor(vault: Vault, mountPoint: string = "/transit") {
        super(vault, mountPoint);
    }

    public async create(key: string, options?: ITransitCreateOptions): Promise<void> {
        this.validateKey(key);
        return this.rawWrite(["keys", key], options);
    }

    public async read(key: string): Promise<ITransitReadResponse> {
        this.validateKey(key);
        return this.rawRead(["keys", key]).then((res) => {
            transitChecker.ITransitReadResponse.check(res);
            return res;
        });
    }

    public async list(): Promise<ITransitListResponse> {
        return this.rawList(["keys"]).then((res) => {
            transitChecker.ITransitListResponse.check(res);
            return res;
        });
    }

    public async delete(key: string): Promise<void> {
        this.validateKey(key);
        return this.rawDelete(["keys", key]);
    }

    public async forceDelete(key: string): Promise<void> {
        this.validateKey(key);
        if (!await this.keyExists(key)) {
            return;
        }
        await this.update(key, {deletion_allowed: true});
        await this.delete(key);
    }

    public async update(key: string, options: ITransitUpdateOptions): Promise<void> {
        this.validateKey(key);
        return this.rawWrite(["keys", key, "config"], options);
    }

    public async rotate(key: string): Promise<void> {
        this.validateKey(key);
        return this.rawWrite(["keys", key, "rotate"]);
    }

    public async export(key: string, options: ITransitExportOptions): Promise<ITransitExportResponse> {
        this.validateKey(key);
        const parts = ["export", options.key_type, key];
        if (options.version) {
            parts.push(options.version);
        }
        return this.rawRead(parts).then((res) => {
            transitChecker.ITransitExportResponse.check(res);
            return res;
        });
    }

    public async keyExists(key: string): Promise<boolean> {
        this.validateKey(key);
        const keys = await this.list();
        const exists = keys.data.keys.find((k) => k === key);
        if (exists) {
            return true;
        }
        return false;
    }

    public async encrypt(key: string, options: ITransitEncryptOptionsSingle): Promise<ITransitEncryptResponseSingle>;
    public async encrypt(key: string, options: ITransitEncryptOptionsBatch): Promise<ITransitEncryptResponseBatch>;
    public async encrypt(key: string, options: ITransitEncryptOptionsSingle | ITransitEncryptOptionsBatch): Promise<ITransitEncryptResponseSingle | ITransitEncryptResponseBatch> {
        this.validateKey(key);
        return this.rawWrite(["encrypt", key], options).then( (res) => {
            if ("batch_input" in options) {
                transitChecker.ITransitEncryptResponseBatch.check(res);
            } else {
                transitChecker.ITransitEncryptResponseSingle.check(res);
            }
            return res;
        });
    }

    public async decrypt(key: string, options: ITransitDecryptOptionsSingle): Promise<ITransitDecryptResponseSingle>;
    public async decrypt(key: string, options: ITransitDecryptOptionsBatch): Promise<ITransitDecryptResponseBatch>;
    public async decrypt(key: string, options: ITransitDecryptOptionsSingle | ITransitDecryptOptionsBatch): Promise<ITransitDecryptResponseSingle | ITransitDecryptResponseBatch> {
        this.validateKey(key);
        return this.rawWrite(["decrypt", key], options).then( (res) => {
            if ("batch_input" in options) {
                transitChecker.ITransitDecryptResponseBatch.check(res);
            } else {
                transitChecker.ITransitDecryptResponseSingle.check(res);
            }
            return res;
        });
    }

    public async encryptText(key: string, plaintext: string): Promise<string> {
        this.validateKey(key);
        const base64 = Buffer.from(plaintext).toString("base64");
        return this.encrypt(key, {plaintext: base64}).then((res) => res.data.ciphertext);
    }

    public async decryptText(key: string, ciphertext: string): Promise<string> {
        this.validateKey(key);
        return this.decrypt(key, {ciphertext}).then((res) => Buffer.from(res.data.plaintext, "base64").toString());
    }

    private validateKey(key: string) {
        if (key.length === 0) {
            throw new VaultRequestError("key is empty", {statusCode: 400});
        }
        if (key.includes("/")) {
            throw new VaultRequestError(`key "${key}" includes at least one illegal character ("/")`, {statusCode: 400});
        }
    }
}
