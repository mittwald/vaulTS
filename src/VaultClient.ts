import {Vault} from "./Vault";

export abstract class AbstractVaultClient {
    private mountPoint: string[];
    protected constructor(protected vault: Vault, mountPoint: string | string[]) {
        this.mountPoint = typeof mountPoint === "string" ? [mountPoint] : mountPoint;
    }

    protected async rawRead(path: string[], acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.read([...this.mountPoint, ...path], acceptedReturnCodes);
    }

    protected async rawWrite(path: string[], body?: any, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.write([...this.mountPoint, ...path], body, acceptedReturnCodes);
    }

    protected async rawDelete(path: string[], body?: any, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.delete([...this.mountPoint, ...path], body, acceptedReturnCodes);
    }

    protected async rawList(path: string[], acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.list([...this.mountPoint, ...path], acceptedReturnCodes);
    }
}
