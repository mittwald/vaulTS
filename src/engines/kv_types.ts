export interface IKVCreateBody {
    [key: string]: string;
}

export interface IKVReadResponse {
    data: {
        [key: string]: string;
    };
}

export interface IKVListResponse {
    data: {
        keys: string[];
    };
}
