import {Vault} from "../Vault";
import {AbstractVaultClient} from "../VaultClient";
import {IVaultTokenAuthResponse, IVaultTokenRenewOptions, IVaultTokenRenewSelfOptions} from "./token_types";

export class VaultTokenClient extends AbstractVaultClient {

    private state?: IVaultTokenAuthResponse<any>;
    private expires?: Date;

    get token() {
        if (this.state) {
            return this.state.auth.client_token;
        }
    }

    constructor(vault: Vault, mountPoint: string = "token", private authProvider?: IVaultAuthProvider) {
        super(vault, ["auth", mountPoint]);
    }

    public async renew(options?: IVaultTokenRenewOptions): Promise<IVaultTokenAuthResponse<any>> {
        return this.rawWrite(["/renew"], options);
    }

    public async renewSelf(options?: IVaultTokenRenewSelfOptions, authProviderFallback: boolean = false): Promise<IVaultTokenAuthResponse<any>> {
        let newState: IVaultTokenAuthResponse<any>;
        try {
            newState = await this.rawWrite(["/renew-self"], options);
        } catch (e) {
            if (!this.authProvider || !authProviderFallback) {
                throw e;
            }
            newState = await this.authProvider.auth();
        }
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + newState.auth.lease_duration);
        this.state = newState;
        this.expires = expires;
        return this.state;
    }

    public async enableAutoRenew(): Promise<IVaultTokenAuthResponse<any>> {
        return this.autoRenew();
    }

    private async autoRenew(): Promise<IVaultTokenAuthResponse<any>> {
        return this.renewSelf(undefined, true)
            .then((res) => {
                setTimeout(this.autoRenew.bind(this), (this.expires!.getTime() - new Date().getTime()));
                return res;
            }).catch((e) => {
                this.vault.emit("error", e);
                throw e;
            });
    }
}

export interface IVaultAuthProvider {
    auth(): Promise<IVaultTokenAuthResponse<any>>;
}
