import {IVaultConfig, Vault} from "../src/Vault";

describe("Vault Integration Test (requires running vault instance)", () => {
    const vaultOptions: IVaultConfig = {
        vaultToken: "rootTokenTest",
    };

    test("successfully queries running dev vault", async () => {
        const client = new Vault(vaultOptions);

        const res = await client.read("/sys/health");
        console.log(res);
    });
});
