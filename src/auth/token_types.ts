export interface IVaultTokenRenewSelfOptions {
    increment?: string;
}

export interface IVaultTokenRenewOptions {
    token: string;
    increment?: string;
}

export interface IVaultTokenAuthResponse {
    auth: {
        client_token: string;
        accessor: string;
        policies: string[];
        lease_duration: number;
        renewable: boolean;
    };
}
