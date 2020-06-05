import { AbstractVaultClient } from "../VaultClient";
import { Vault } from "../Vault";
import { IKVCreateBody, IKVListResponse, IKVReadResponse } from "./kv_types";
import { createCheckers } from "ts-interface-checker";
import kvTi from "./kv_types-ti";

const tiChecker = createCheckers(kvTi);

/**
 * KV Version 1 Client
 * @see https://www.vaultproject.io/api/secret/kv/kv-v1.html
 */
export class KVVaultClient extends AbstractVaultClient {
    public constructor(vault: Vault, mountPoint: string = "/kv") {
        super(vault, mountPoint);
    }

    /**
     * Retrieves the secret at the specified location
     * @see https://www.vaultproject.io/api/secret/kv/kv-v1.html#read-secret
     * @param path
     */
    public async read(path: string): Promise<IKVReadResponse> {
        return this.rawRead([path]).then((res) => {
            tiChecker.IKVReadResponse.check(res);
            return res;
        });
    }

    /**
     * Returns a list of key names at the specified location
     * @see https://www.vaultproject.io/api/secret/kv/kv-v1.html#list-secrets
     * @param path
     */
    public async list(path: string = ""): Promise<IKVListResponse> {
        return this.rawList([path]).then((res) => {
            tiChecker.IKVListResponse.check(res);
            return res;
        });
    }

    /**
     * Creates or updates a secret at the specified location
     * Body only supports [string]: string maps!, to store a complex object it should be converted to json first.
     * This conversion does not happen automatically to have the ability to store custom json strings that are not converted back to an object.
     * @see https://www.vaultproject.io/api/secret/kv/kv-v1.html#create-update-secret
     * @param path
     * @param body
     */
    public async create(path: string, body: IKVCreateBody): Promise<void> {
        return this.rawWrite([path], body);
    }

    /**
     * Deletes the secret at the specified location
     * @see https://www.vaultproject.io/api/secret/kv/kv-v1.html#delete-secret
     * @param path
     */
    public async delete(path: string): Promise<void> {
        return this.rawDelete([path]);
    }
}
