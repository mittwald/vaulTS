export interface IKV2CreateBody {
    data: {
        [key: string]: string;
    };
    options?: {
        cas?: number;
    };
}

export interface IKV2CreateResponse {
    data: {
        created_time: string;
        deletion_time: string;
        destroyed: boolean;
        version: number;
    };
}

export interface IKV2ReadResponse {
    data: {
        data: {
            [key: string]: string;
        };
        metadata?: {
            created_time: string;
            deletion_time: string;
            destroyed: boolean;
            version: number;
        };
    };
}

export interface IKV2ListResponse {
    data: {
        keys: string[];
    };
}

export interface IKV2ReadMetadataResponse {
    data: {
        created_time: string;
        current_version: number;
        max_versions: number;
        oldest_version: number;
        updated_time: string;
        versions: {
            [key: string]: {
                created_time: string;
                deletion_time: string;
                destroyed: boolean;
            };
        };
    };
}
