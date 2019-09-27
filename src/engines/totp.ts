import {AbstractVaultClient} from "../VaultClient";
import {
    ITotpCreateOptions,
    ITotpCreateResponse,
    ITotpGenerateCodeResponse,
    ITotpListResponse,
    ITotpReadResponse, ITotpValidateCodeResponse
} from "./totp_types";
import {Vault} from "../Vault";
import {createCheckers} from "ts-interface-checker";
import totpTi from "./totp_types-ti";

const tiChecker = createCheckers(totpTi);

export class TotpVaultClient extends AbstractVaultClient {

    public constructor(vault: Vault, mountPoint: string = '/totp') {
        super(vault, mountPoint);
    }

    public async create(key: string, options: ITotpCreateOptions): Promise<ITotpCreateResponse> {
        return this.rawWrite(['keys', key], options).then(res => {
            tiChecker.ITotpCreateResponse.check(res);
            return res;
        });
    }

    public async read(key: string): Promise<ITotpReadResponse> {
        return this.rawRead(['keys', key]).then(res => {
            tiChecker.ITotpReadResponse.check(res);
            return res;
        });
    }

    public async list(): Promise<ITotpListResponse> {
        return this.rawList(['keys']).then(res => {
            tiChecker.ITotpListResponse.check(res);
            return res;
        });
    }

    public async delete(key: string): Promise<void> {
        return this.rawDelete(['keys', key]);
    }

    public async generateCode(key: string): Promise<ITotpGenerateCodeResponse> {
        return this.rawRead(['code', key]).then(res => {
            tiChecker.ITotpGenerateCodeResponse.check(res);
            return res;
        });
    }

    public async validateCode(key: string, code: string): Promise<ITotpValidateCodeResponse> {
        return this.rawWrite(['code', key], {
            code: code
        }).then(res => {
            tiChecker.ITotpValidateCodeResponse.check(res);
            return res;
        });
    }
}
