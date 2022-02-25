import * as fs from "fs";
import { Vault } from "../Vault";
import { AbstractVaultClient } from "../VaultClient";
import { IVaultKubernetesAuthLoginConfig, IVaultKubernetesAuthLoginResponse } from "./kubernetes_types";
import { IVaultAuthProvider } from "./token";
import { createCheckers } from "ts-interface-checker";
import tokenTi from "./token_types-ti";
import kubernetesTi from "./kubernetes_types-ti";

const tiChecker = createCheckers(kubernetesTi, tokenTi);

export class VaultKubernetesAuthClient extends AbstractVaultClient implements IVaultAuthProvider {
    private config?: IVaultKubernetesAuthLoginConfig;

    public constructor(vault: Vault, config?: IVaultKubernetesAuthLoginConfig, mountPoint: string = "kubernetes") {
        super(vault, ["auth", mountPoint]);
        this.config = config;
    }

    /**
     * Fetches a token from the configured kubernetes api
     * @see https://www.vaultproject.io/api/auth/kubernetes/index.html#login
     */
    public async auth(): Promise<IVaultKubernetesAuthLoginResponse> {
        if (!this.config) {
            throw new Error("Kubernetes Auth Client not configured");
        }
        return this.rawWrite(
            ["/login"],
            {
                role: this.config.role,
                jwt: this.config.jwt ?? this.loadJwtFromPath(),
            },
            {
                retryWithTokenRenew: false,
            },
        ).then((res) => {
            tiChecker.IVaultTokenAuthResponse.check(res);
            return res;
        });
    }

    /**
     * Initializes the config and fetches a token.
     * @param config
     */
    public async login(config?: IVaultKubernetesAuthLoginConfig): Promise<IVaultKubernetesAuthLoginResponse> {
        if (config) {
            this.config = config;
        }
        return this.auth();
    }

    private loadJwtFromPath(): string {
        if (!this.config) {
            throw new Error("Kubernetes Auth Client not configured");
        }
        const jwt = fs.readFileSync(this.config.jwt_path ?? "/run/secrets/kubernetes.io/serviceaccount/token", "utf8");
        return jwt;
    }
}
