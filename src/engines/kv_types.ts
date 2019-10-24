export interface IKVCreateBody {
    [key: string]: any;
}

export interface IKVReadResponse {
   data: {
       [key: string]: any;
   };
}

export interface IKVListResponse {
    data: {
        keys: string[];
    };
}
