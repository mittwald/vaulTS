import { HTTPGETParameters, Vault } from "./Vault";

export abstract class AbstractVaultClient {
    private readonly mountPoint: string[];
    protected vault: Vault;

    protected constructor(vault: Vault, mountPoint: string | string[]) {
        this.mountPoint = typeof mountPoint === "string" ? [mountPoint] : mountPoint;
        this.vault = vault;
    }

    protected async rawRead(
        path: string[],
        parameters?: HTTPGETParameters,
        retryWithTokenRenew?: boolean,
        acceptedReturnCodes?: number[],
    ): Promise<any> {
        return this.vault.read([...this.mountPoint, ...path], parameters, retryWithTokenRenew, acceptedReturnCodes);
    }

    protected async rawWrite(path: string[], body?: any, retryWithTokenRenew?: boolean, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.write([...this.mountPoint, ...path], body, retryWithTokenRenew, acceptedReturnCodes);
    }

    protected async rawDelete(path: string[], body?: any, retryWithTokenRenew?: boolean, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.delete([...this.mountPoint, ...path], body, retryWithTokenRenew, acceptedReturnCodes);
    }

    protected async rawList(path: string[], retryWithTokenRenew?: boolean, acceptedReturnCodes?: number[]): Promise<any> {
        return this.vault.list([...this.mountPoint, ...path], retryWithTokenRenew, acceptedReturnCodes);
    }
}
