import { Vault } from "../Vault";
import { AbstractVaultClient } from "../VaultClient";
import { IVaultTokenAuthResponse, IVaultTokenRenewOptions, IVaultTokenRenewSelfOptions } from "./token_types";
import tokenTi from "./token_types-ti";
import { createCheckers } from "ts-interface-checker";

const tiChecker = createCheckers(tokenTi);

export class VaultTokenClient extends AbstractVaultClient {
    private state?: IVaultTokenAuthResponse;
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
            newState = await this.rawWrite(["/renew-self"], options, {
                retryWithTokenRenew: false,
            }).then((res) => {
                tiChecker.IVaultTokenAuthResponse.check(res);
                return res;
            });
        } catch (e) {
            if (!this.authProvider || !authProviderFallback) {
                throw e;
            }
            newState = await this.authProvider.auth();
        }
        this.state = newState;
        return this.state;
    }

    /**
     * Updates the token using the configured authProvider
     */
    public async login(): Promise<IVaultTokenAuthResponse> {
        if (!this.authProvider) {
            throw new Error("No Authprovider configured");
        }
        this.state = await this.authProvider.auth();
        return this.state;
    }
}

export interface IVaultAuthProvider {
    auth(): Promise<IVaultTokenAuthResponse>;
}
