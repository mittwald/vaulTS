import {AbstractVaultClient} from "../VaultClient";
import {Vault} from "../Vault";

export class VaultAuthClient extends AbstractVaultClient {
    constructor(vault: Vault, mountPoint: string = "auth") {
        super(vault, ["auth", mountPoint]);
    }

    protected setToken(auth: {
        client_token: string;
        accessor: string;
    }) {
        this.vault.config.vaultToken = auth.client_token;
        this.vault.config.vaultTokenAccessor = auth.accessor;
    }

}
