import {AbstractVaultClient} from "../VaultClient";
import {HTTPGETParameters, Vault} from "../Vault";
import {createCheckers} from "ts-interface-checker";
import kv2Ti from "./kv2_types-ti";
import {
    IKV2CreateBody,
    IKV2CreateResponse,
    IKV2ListResponse,
    IKV2ReadMetadataResponse,
    IKV2ReadResponse,
} from "./kv2_types";

const tiChecker = createCheckers(kv2Ti);

export class KV2VaultClient extends AbstractVaultClient {

    public constructor(vault: Vault, mountPoint: string = "/secret") {
        super(vault, mountPoint);
    }

    public async read(path: string, version?: number): Promise<IKV2ReadResponse> {
        let parameters: HTTPGETParameters | undefined;
        if (version) {
            parameters = {version: version.toString()};
        }
        return this.rawRead(["data", path], parameters).then(res => {
            tiChecker.IKV2ReadResponse.check(res);
            return res;
        });
    }

    public async list(path: string = ""): Promise<IKV2ListResponse> {
        return this.rawList(["metadata", path]).then(res => {
            tiChecker.IKV2ListResponse.check(res);
            return res;
        });
    }

    public async create(path: string, body: IKV2CreateBody): Promise<IKV2CreateResponse> {
        return this.rawWrite(["data", path], body).then(res => {
            tiChecker.IKV2CreateResponse.check(res);
            return res;
        });
    }

    public async deleteVersion(path: string, versions?: number[]): Promise<void> {
        if (versions) {
            return this.rawWrite(["delete", path], {versions});
        } else {
            return this.rawDelete(["data", path]);
        }
    }

    public async undeleteVersion(path: string, versions: number[]): Promise<void> {
        return this.rawWrite(["undelete", path], {versions});
    }

    public async destroyVersion(path: string, versions: number[]): Promise<void> {
        return this.rawWrite(["destroy", path], {versions});
    }

    public async readMetadata(path: string = ""): Promise<IKV2ReadMetadataResponse> {
        return this.rawRead(["metadata", path]).then(res => {
            tiChecker.IKV2ReadMetadataResponse.check(res);
            return res;
        });
    }

    public async delete(path: string): Promise<void> {
        return this.rawDelete(["metadata", path]);
    }
}
