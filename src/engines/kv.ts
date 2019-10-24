import {AbstractVaultClient} from "../VaultClient";
import {Vault} from "../Vault";
import {IKVCreateBody, IKVListResponse, IKVReadResponse} from "./kv_types";
import {createCheckers} from "ts-interface-checker";
import kvTi from "./kv_types-ti";

const tiChecker = createCheckers(kvTi);

export class KVVaultClient extends AbstractVaultClient {

    public constructor(vault: Vault, mountPoint: string = "/kv") {
        super(vault, mountPoint);
    }

    public async read(path: string): Promise<IKVReadResponse> {
        return this.rawRead([path]).then(res => {
            tiChecker.IKVReadResponse.check(res);
            return res;
        });
    }

    public async list(path: string = ""): Promise<IKVListResponse> {
        return this.rawList([path]).then(res => {
            tiChecker.IKVListResponse.check(res);
            return res;
        });
    }

    public async create(path: string, body: IKVCreateBody): Promise<void> {
        return this.rawWrite([path], body);
    }

    public async delete(path: string): Promise<void> {
        return this.rawDelete([path]);
    }
}
