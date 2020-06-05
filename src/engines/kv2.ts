import { AbstractVaultClient } from "../VaultClient";
import { HTTPGETParameters, Vault } from "../Vault";
import { createCheckers } from "ts-interface-checker";
import kv2Ti from "./kv2_types-ti";
import { IKV2CreateBody, IKV2CreateResponse, IKV2ListResponse, IKV2ReadMetadataResponse, IKV2ReadResponse } from "./kv2_types";

const tiChecker = createCheckers(kv2Ti);

/**
 * KV Version 2 Client
 * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html
 */
export class KV2VaultClient extends AbstractVaultClient {
    public constructor(vault: Vault, mountPoint: string = "/secret") {
        super(vault, mountPoint);
    }

    /**
     * Retrieves the secret at the specified location
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#read-secret-version
     * @param path
     * @param version Specifies the version to return. If not set the latest version is returned.
     */
    public async read(path: string, version?: number): Promise<IKV2ReadResponse> {
        let parameters: HTTPGETParameters | undefined;
        if (version) {
            parameters = { version: version.toString() };
        }
        return this.rawRead(["data", path], parameters).then((res) => {
            tiChecker.IKV2ReadResponse.check(res);
            return res;
        });
    }

    /**
     * Returns a list of key names at the specified location
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#list-secrets
     * @param path
     */
    public async list(path: string = ""): Promise<IKV2ListResponse> {
        return this.rawList(["metadata", path]).then((res) => {
            tiChecker.IKV2ListResponse.check(res);
            return res;
        });
    }

    /**
     * Creates a new version of a secret at the specified location
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#list-secrets
     * @param path
     * @param body
     */
    public async create(path: string, body: IKV2CreateBody): Promise<IKV2CreateResponse> {
        return this.rawWrite(["data", path], body).then((res) => {
            tiChecker.IKV2CreateResponse.check(res);
            return res;
        });
    }

    /**
     * Soft delete of versions at the specified location, latest version if not specified
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#delete-latest-version-of-secret
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#delete-secret-versions
     * @param path
     * @param versions
     */
    public async deleteVersion(path: string, versions?: number[]): Promise<void> {
        if (versions) {
            return this.rawWrite(["delete", path], { versions });
        } else {
            return this.rawDelete(["data", path]);
        }
    }

    /**
     * Undeletes the data for the provided version and path
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#undelete-secret-versions
     * @param path
     * @param versions
     */
    public async undeleteVersion(path: string, versions: number[]): Promise<void> {
        return this.rawWrite(["undelete", path], { versions });
    }

    /**
     * Permanently removes the specified version data for the provided key
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#destroy-secret-versions
     * @param path
     * @param versions
     */
    public async destroyVersion(path: string, versions: number[]): Promise<void> {
        return this.rawWrite(["destroy", path], { versions });
    }

    /**
     * Retrieves the metadata and versions for the secret at the specified path
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#read-secret-metadata
     * @param path
     */
    public async readMetadata(path: string = ""): Promise<IKV2ReadMetadataResponse> {
        return this.rawRead(["metadata", path]).then((res) => {
            tiChecker.IKV2ReadMetadataResponse.check(res);
            return res;
        });
    }

    /**
     * Deletes the key metadata and all version data for the specified key.
     * @see https://www.vaultproject.io/api/secret/kv/kv-v2.html#delete-metadata-and-all-versions
     * @param path
     */
    public async delete(path: string): Promise<void> {
        return this.rawDelete(["metadata", path]);
    }
}
