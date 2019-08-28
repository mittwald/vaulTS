import {Vault} from "./Vault";

export abstract class AbstractVaultClient {
    protected constructor(private vault: Vault, private mountPoint: string) {}

    protected async read(path: string, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.read([this.mountPoint, path], acceptedReturnCodes);
    }

    protected async write(path: string, body: any, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.write([this.mountPoint, path], body, acceptedReturnCodes);
    }

    protected async delete(path: string, body: any, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.delete([this.mountPoint, path], body, acceptedReturnCodes);
    }

    protected async list(path: string, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.list([this.mountPoint, path], acceptedReturnCodes);
    }
}
