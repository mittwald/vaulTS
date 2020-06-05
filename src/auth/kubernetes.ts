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
        if (!this.config.jwt) {
            this.initConfig(this.config);
        }
        return this.rawWrite(["/login"], this.config).then((res) => {
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
            this.initConfig(config);
        }
        return this.auth();
    }

    private initConfig(config: IVaultKubernetesAuthLoginConfig): void {
        if (!config.jwt) {
            config.jwt = fs.readFileSync(config.jwt_path ?? "/run/secrets/kubernetes.io/serviceaccount/token", "utf8");
            delete config.jwt_path;
        }
        this.config = config;
    }
}
