import { Vault } from "../Vault";
import { AbstractVaultClient } from "../VaultClient";
import { IVaultTokenAuthResponse, IVaultTokenRenewOptions, IVaultTokenRenewSelfOptions } from "./token_types";
import tokenTi from "./token_types-ti";
import { createCheckers } from "ts-interface-checker";

const tiChecker = createCheckers(tokenTi);

// Time in ms to renew token before expiration
const RENEW_BEFORE_MS = 10000;

export class VaultTokenClient extends AbstractVaultClient {
    private state?: IVaultTokenAuthResponse;
    private expires?: Date;
    private readonly authProvider?: IVaultAuthProvider;

    public constructor(vault: Vault, mountPoint: string = "token", authProvider?: IVaultAuthProvider) {
        super(vault, ["auth", mountPoint]);
        this.authProvider = authProvider;
    }

    public get token(): undefined | string {
        if (this.state) {
            return this.state.auth.client_token;
        }

        return undefined;
    }

    /**
     * Renews a lease associated with a token. This is used to prevent the expiration of a token, and the automatic revocation of it. Token renewal is possible only if there is a lease associated with it.
     * @see https://www.vaultproject.io/api/auth/token/index.html#renew-a-token
     * @param options
     */
    public async renew(options?: IVaultTokenRenewOptions): Promise<IVaultTokenAuthResponse> {
        return this.rawWrite(["/renew"], options).then((res) => {
            tiChecker.IVaultTokenAuthResponse.check(res);
            return res;
        });
    }

    /**
     * Renews a lease associated with the calling token. This is used to prevent the expiration of a token, and the automatic revocation of it. Token renewal is possible only if there is a lease associated with it.
     * @see https://www.vaultproject.io/api/auth/token/index.html#renew-a-token-self-
     * @param options
     * @param authProviderFallback Tries to get a new token from the authProvider if renew fails
     */
    public async renewSelf(options?: IVaultTokenRenewSelfOptions, authProviderFallback: boolean = false): Promise<IVaultTokenAuthResponse> {
        let newState: IVaultTokenAuthResponse;
        try {
            newState = await this.rawWrite(["/renew-self"], options).then((res) => {
                tiChecker.IVaultTokenAuthResponse.check(res);
                return res;
            });
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

    /**
     * Enables a periodic job that renews the token before expiration.
     * To receive renew errors, subscribe to the "error" event on the vault instance.
     */
    public async enableAutoRenew(): Promise<IVaultTokenAuthResponse> {
        return this.autoRenew();
    }

    private async autoRenew(): Promise<IVaultTokenAuthResponse> {
        return this.renewSelf(undefined, true)
            .then((res) => {
                setTimeout(this.autoRenew.bind(this), this.expires!.getTime() - new Date().getTime() - RENEW_BEFORE_MS);
                return res;
            })
            .catch((e) => {
                this.vault.emit("error", e);
                throw e;
            });
    }
}

export interface IVaultAuthProvider {
    auth(): Promise<IVaultTokenAuthResponse>;
}
