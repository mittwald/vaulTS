export interface ITotpCreateOptionsGenerate {
    generate: true;
    exported?: boolean;
    key_size?: number;
    issuer: string;
    account_name: string;
    period?: number;
    algorithm?: string;
    digits?: number;
    skew?: number;
    qr_size?: number;
}
export interface ITotpCreateOptionsNoGenerate {
    generate: false;
    url?: string;
    issuer?: string;
    account_name?: string;
    period?: number;
    algorithm?: string;
    digits?: number;
}
export type ITotpCreateOptions = ITotpCreateOptionsGenerate | ITotpCreateOptionsNoGenerate;
export interface ITotpCreateResponseExported {
    data: {
        barcode: string;
        url: string;
    };
}

export interface ITotpReadResponse {
    data: {
        account_name: string;
        algorithm: string;
        digits: number;
        issuer: string;
        period: number;
    };
}

export interface ITotpListResponse {
    data: {
        keys: string[];
    };
}

export interface ITotpGenerateCodeResponse {
    data: {
        code: string;
    };
}

export interface ITotpValidateCodeResponse {
    data: {
        valid: boolean;
    };
}
