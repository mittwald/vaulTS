import { IVaultConfig, Vault } from "../src";

describe("Vault Integration Test (requires running vault instance)", () => {
    test("successfully queries running dev vault", async () => {
        const client = new Vault();

        const res = await client.Health().health();
    });
});
