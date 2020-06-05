import { IVaultTokenAuthResponse } from "./token_types";

export interface IVaultKubernetesAuthLoginConfig {
    role: string;
    jwt?: string;
    jwt_path?: string;
}

export interface IVaultKubernetesAuthLoginResponse extends IVaultTokenAuthResponse {
    auth: {
        client_token: string;
        accessor: string;
        policies: string[];
        lease_duration: number;
        renewable: boolean;
        metadata: {
            role: string;
            service_account_name: string;
            service_account_namespace: string;
            service_account_secret_name: string;
            service_account_uid: string;
        };
    };
}
