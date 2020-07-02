import request from "request-promise-native";
import { VaultKubernetesAuthClient } from "./auth/kubernetes";
import { IVaultKubernetesAuthLoginConfig } from "./auth/kubernetes_types";
import { IVaultAuthProvider, VaultTokenClient } from "./auth/token";
import { TransitVaultClient } from "./engines/transit";
import { VaultHealthClient } from "./sys/VaultHealthClient";
import { resolveURL } from "./util";
import { TotpVaultClient } from "./engines/totp";
import { KVVaultClient } from "./engines/kv";
import { KV2VaultClient } from "./engines";

export type VaultHTTPMethods = "GET" | "POST" | "DELETE" | "LIST";
export interface HTTPGETParameters {
    [key: string]: string;
}

export interface IVaultConfig {
    vaultAddress?: string;
    vaultToken?: string;
    vaultCaCertificate?: string;
    vaultNamespace?: string;
    apiVersion?: string;
}

export class VaultError extends Error {}

export interface IVaultErrorResponse {
    statusCode: number;
    body?: {
        errors: string[];
    };
}

export class VaultRequestError extends VaultError {
    public readonly response: IVaultErrorResponse;

    public constructor(message: string, response: IVaultErrorResponse) {
        super(message);
        this.response = response;
    }
}

export class Vault {
    public readonly config: IVaultConfig;
    private tokenClient?: VaultTokenClient;

    public constructor(userConfig?: IVaultConfig) {
        this.config = {
            vaultAddress: process.env.VAULT_ADDR ?? "http://127.0.0.1:8200",
            apiVersion: "v1",
            vaultToken: process.env.VAULT_TOKEN,
            ...userConfig,
        };
    }

    public get token(): string | undefined {
        if (this.tokenClient) {
            return this.tokenClient.token;
        }
        return this.config.vaultToken;
    }

    public async read(path: string | string[], parameters?: HTTPGETParameters, acceptedReturnCodes?: number[]): Promise<any> {
        return this.request("GET", path, {}, parameters, acceptedReturnCodes);
    }

    public async write(path: string | string[], body: any, acceptedReturnCodes?: number[]): Promise<any> {
        return this.request("POST", path, body, undefined, acceptedReturnCodes);
    }

    public async delete(path: string | string[], body: any, acceptedReturnCodes?: number[]): Promise<any> {
        return this.request("DELETE", path, body, undefined, acceptedReturnCodes);
    }

    public async list(path: string | string[], acceptedReturnCodes?: number[]): Promise<any> {
        return this.request("LIST", path, {}, undefined, acceptedReturnCodes);
    }

    public Health(): VaultHealthClient {
        return new VaultHealthClient(this, "/sys");
    }

    public Transit(mountPoint?: string): TransitVaultClient {
        return new TransitVaultClient(this, mountPoint);
    }

    public Totp(mountPoint?: string): TotpVaultClient {
        return new TotpVaultClient(this, mountPoint);
    }

    public KV(version: 2 | undefined, mountPoint?: string): KV2VaultClient;
    public KV(version: 1, mountPoint?: string): KVVaultClient;
    public KV(version: 1 | 2 = 2, mountPoint?: string): KV2VaultClient | KVVaultClient {
        if (version === 1) {
            return new KVVaultClient(this, mountPoint);
        }
        return new KV2VaultClient(this, mountPoint);
    }

    public KubernetesAuth(config?: IVaultKubernetesAuthLoginConfig, mountPoint?: string): VaultKubernetesAuthClient {
        return new VaultKubernetesAuthClient(this, config, mountPoint);
    }

    public Auth(provider?: IVaultAuthProvider, mountPoint?: string): VaultTokenClient {
        if (!this.tokenClient) {
            this.tokenClient = new VaultTokenClient(this, mountPoint, provider);
        }
        return this.tokenClient;
    }

    private async request(
        method: VaultHTTPMethods,
        path: string | string[],
        body: any,
        parameters?: HTTPGETParameters,
        acceptedReturnCodes: number[] = [200, 204],
    ): Promise<any> {
        if (typeof path === "string") {
            path = [path];
        }
        const uri = resolveURL(this.config.vaultAddress!, this.config.apiVersion!, ...path);

        const requestOptions: request.Options = {
            method,
            uri: uri.toString(),
            headers: {
                "X-Vault-Token": this.token,
                "X-Vault-Namespace": this.config.vaultNamespace,
            },
            body,
            json: true,
            // vault health endpoint responds with >400 status code
            simple: false,
            resolveWithFullResponse: true,
            ca: this.config.vaultCaCertificate,
            qs: parameters,
        };

        const res = await request(requestOptions);

        if (!acceptedReturnCodes.some((c) => c === res.statusCode)) {
            let errorResponse: IVaultErrorResponse = {
                statusCode: res.statusCode,
            };

            if (res.body && res.body.errors && res.body.errors.length > 0) {
                errorResponse = {
                    ...errorResponse,
                    body: res.body,
                };
            }
            throw new VaultRequestError(
                `Request to ${requestOptions.uri.toString()} failed (Status ${errorResponse.statusCode})`,
                errorResponse,
            );
        }

        return res.body;
    }
}
