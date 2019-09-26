import {promises as fs} from "fs";
import {Vault} from "../Vault";
import {AbstractVaultClient} from "../VaultClient";
import {
    IVaultKubernetesAuthLoginConfig, IVaultKubernetesAuthLoginResponse,
} from "./kubernetes_types";
import {IVaultAuthProvider} from "./token";
import {createCheckers} from "ts-interface-checker";
import tokenTi from "./token_types-ti";
import kubernetesTi from "./kubernetes_types-ti";

const tiChecker = createCheckers(kubernetesTi, tokenTi);

export class VaultKubernetesAuthClient extends AbstractVaultClient implements IVaultAuthProvider {

    private config?: IVaultKubernetesAuthLoginConfig;

    constructor(vault: Vault, config?: IVaultKubernetesAuthLoginConfig, mountPoint: string = "kubernetes") {
        super(vault, ["auth", mountPoint]);
        this.config = config;
    }

    public async auth(): Promise<IVaultKubernetesAuthLoginResponse> {
        if (!this.config) {
            throw new Error("Kubernetes Auth Client not configured");
        }
        if (!this.config.jwt) {
            await this.initConfig(this.config);
        }
        return this.rawWrite(["/login"], this.config).then((res) => {
            tiChecker.IVaultTokenAuthResponse.check(res);
            return res;
        });
    }

    public async login(config?: IVaultKubernetesAuthLoginConfig): Promise<IVaultKubernetesAuthLoginResponse> {
        if (config) {
            await this.initConfig(config);
        }
        return this.auth();
    }

    private async initConfig(config: IVaultKubernetesAuthLoginConfig) {
        if (!config.jwt) {
            config.jwt = await fs.readFile(config.jwt_path || "/run/secrets/kubernetes.io/serviceaccount/token", "utf8");
            delete config.jwt_path;
        }
        this.config = config;
    }
}
