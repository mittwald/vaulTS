import {AbstractVaultClient} from "../VaultClient";
import {Vault} from "../Vault";

export interface IVaultKubernetesAuthConfig {
    kubernetes_host: string;
    kubernetes_ca_cert?: string;
    token_reviewer_jwt?: string;
    pem_keys?: string;
}

export interface IVaultKubernetesAuthLoginConfig {
    role: string;
    jwt: string;
}

export interface IVaultKubernetesAuthLoginResponseMetadata {
    role: string;
    service_account_name: string;
    service_account_namespace: string;
    service_account_secret_name: string;
    service_account_uid: string;
}

export interface IVaultKubernetesAuthLoginResponse {
    auth: {
        client_token: string;
        accessor: string;
        policies: string[];
        metadata: IVaultKubernetesAuthLoginResponseMetadata;
        lease_duration: number;
        renewable: boolean;
    }
}

export class VaultKubernetesAuthClient extends AbstractVaultClient {
    constructor(vault: Vault, mountPoint: string) {
        super(vault, mountPoint);
    }

    public async login(payload: IVaultKubernetesAuthLoginConfig): Promise<IVaultKubernetesAuthLoginResponse> {
        return this.write('/login', payload);
    }
}
