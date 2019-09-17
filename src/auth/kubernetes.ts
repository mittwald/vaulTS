import {AbstractVaultClient} from "../VaultClient";
import {Vault} from "../Vault";
import {promises as fs} from 'fs';
import {
    IVaultKubernetesAuthLoginConfig,
    IVaultKubernetesAuthLoginResponse
} from "./kubernetes_types";
import {VaultAuthClient} from "./auth";

export class VaultKubernetesAuthClient extends VaultAuthClient {
    constructor(vault: Vault, mountPoint: string = "kubernetes") {
        super(vault, mountPoint);
    }

    public async login(payload: IVaultKubernetesAuthLoginConfig): Promise<IVaultKubernetesAuthLoginResponse> {
        if (!payload.jwt) {
            payload.jwt = await fs.readFile(payload.jwt_path || "/run/secrets/kubernetes.io/serviceaccount/token", "utf8");
            delete payload.jwt_path;
        }

        const res = await this.rawWrite(['/login'], payload) as IVaultKubernetesAuthLoginResponse;

        this.setToken(res.auth);
        return res;
    }
}
