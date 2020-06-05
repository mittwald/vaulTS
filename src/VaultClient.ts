import { HTTPGETParameters, Vault } from "./Vault";

export abstract class AbstractVaultClient {
    private readonly mountPoint: string[];
    protected vault: Vault;

    protected constructor(vault: Vault, mountPoint: string | string[]) {
        this.mountPoint = typeof mountPoint === "string" ? [mountPoint] : mountPoint;
        this.vault = vault;
    }

    protected async rawRead(path: string[], parameters?: HTTPGETParameters, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.read([...this.mountPoint, ...path], parameters, acceptedReturnCodes);
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
