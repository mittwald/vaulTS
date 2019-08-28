import {Vault} from "./Vault";

export abstract class AbstractVaultClient {
    constructor(private vault: Vault) {}
}
