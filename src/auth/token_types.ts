
export interface IVaultTokenRenewSelfOptions {
    increment?: string;
}

export interface IVaultTokenRenewOptions {
    token: string;
    increment?: string;
}

export interface IVaultTokenAuthResponse<T> {
    auth: {
        client_token: string;
        accessor: string;
        policies: string[];
        metadata: T;
        lease_duration: number;
        renewable: boolean;
    };
}
