import { HTTPGETParameters, Vault, VaultRequestOptions } from "./Vault";

export abstract class AbstractVaultClient {
    private readonly mountPoint: string[];
    protected vault: Vault;

    protected constructor(vault: Vault, mountPoint: string | string[]) {
        this.mountPoint = typeof mountPoint === "string" ? [mountPoint] : mountPoint;
        this.vault = vault;
    }

    protected async rawRead(path: string[], parameters?: HTTPGETParameters, options?: VaultRequestOptions): Promise<any> {
        return this.vault.read([...this.mountPoint, ...path], parameters, options);
    }

    protected async rawWrite(path: string[], body?: any, options?: VaultRequestOptions): Promise<any> {
        return this.vault.write([...this.mountPoint, ...path], body, options);
    }

    protected async rawDelete(path: string[], body?: any, options?: VaultRequestOptions): Promise<any> {
        return this.vault.delete([...this.mountPoint, ...path], body, options);
    }

    protected async rawList(path: string[], options?: VaultRequestOptions): Promise<any> {
        return this.vault.list([...this.mountPoint, ...path], options);
    }
}
