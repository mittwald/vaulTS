import {AbstractVaultClient} from "../VaultClient";
import {Vault} from "../Vault";
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
    ITransitUpdateOptions
} from "./transit_types";
import transitTi from "../../src/engines/transit_types-ti";
import {createCheckers} from "ts-interface-checker";

const transitChecker = createCheckers(transitTi);

export class TransitVaultClient extends AbstractVaultClient {

    public constructor(vault: Vault, mountPoint: string = "/transit") {
        super(vault, mountPoint);
    }

    public async create(key: string, options?: ITransitCreateOptions): Promise<void> {
        return this.rawWrite(["keys", key], options);
    }

    public async read(key: string): Promise<ITransitReadResponse> {
        return this.rawRead(["keys", key]).then(res => {
            transitChecker.ITransitReadResponse.check(res);
            return res;
        });
    }

    public async list(): Promise<ITransitListResponse> {
        return this.rawList(["keys"]).then(res => {
            transitChecker.ITransitListResponse.check(res);
            return res;
        });
    }

    public async delete(key: string): Promise<void> {
        return this.rawDelete(["keys", key]);
    }

    public async update(key: string, options: ITransitUpdateOptions): Promise<void> {
        return this.rawWrite(["keys", key, "config"], options);
    }

    public async rotate(key: string): Promise<void> {
        return this.rawWrite(["keys", key, "rotate"]);
    }

    public async export(key: string, options: ITransitExportOptions): Promise<ITransitExportResponse> {
        let parts = ["export", options.key_type, key];
        if (options.version) {
            parts.push(options.version);
        }
        return this.rawRead(parts).then(res => {
            transitChecker.ITransitExportResponse.check(res);
            return res;
        });
    }

    public async encrypt(key: string, options: ITransitEncryptOptionsSingle): Promise<ITransitEncryptResponseSingle>;
    public async encrypt(key: string, options: ITransitEncryptOptionsBatch): Promise<ITransitEncryptResponseBatch>;
    public async encrypt(key: string, options: ITransitEncryptOptionsSingle | ITransitEncryptOptionsBatch): Promise<ITransitEncryptResponseSingle | ITransitEncryptResponseBatch> {
        return this.rawWrite(["encrypt", key], options).then( res => {
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
        return this.rawWrite(["decrypt", key], options).then( res => {
            if ("batch_input" in options) {
                transitChecker.ITransitDecryptResponseBatch.check(res);
            } else {
                transitChecker.ITransitDecryptResponseSingle.check(res);
            }
            return res;
        });
    }

    public async encryptText(key: string, plaintext: string): Promise<string> {
        const base64 = Buffer.from(plaintext).toString("base64");
        return this.encrypt(key, {plaintext: base64}).then(res => res.data.ciphertext);
    }

    public async decryptText(key: string, ciphertext: string): Promise<string> {
        return this.decrypt(key, {ciphertext}).then(res => Buffer.from(res.data.plaintext, "base64").toString());
    }
}
