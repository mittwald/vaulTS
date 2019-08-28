import {AbstractVaultClient} from "../VaultClient";
import {Vault} from "../Vault";

export interface IVaultHealthResponse {
    initialized: boolean;
    sealed: boolean;
    standby: boolean;
    performance_standby: boolean;
    replication_performance_mode: string;
    replication_dr_mode: string;
    server_time_utc: number;
    version: string;
    cluster_name: string;
    cluster_id: string;
}

export class VaultHealthClient extends AbstractVaultClient {
    constructor(vault: Vault, mountPoint: string) {
        super(vault, mountPoint);
    }

    /**
     * Reports Vault Health status
     * Throws an VaultRequestError if vault is unhealthy
     */
    public async health(): Promise<IVaultHealthResponse> {
        return this.read('/health');
    }
}
