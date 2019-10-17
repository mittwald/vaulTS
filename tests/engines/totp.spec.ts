import {Vault} from "../../src";
import {TransitVaultClient} from "../../src";
import {TotpVaultClient} from "../../src/engines/totp";

describe("Totp Vault Client", () => {
    let client: TotpVaultClient;

    describe("Integration Test (requires running vault instance)", () => {
        beforeAll(async () => {
            const vault = new Vault();
            client = vault.Totp();
        });

        test("successfully create, read and list key", async () => {
            const resCreate = await client.create("test", {
                generate: true,
                issuer: "test",
                account_name: "name"
            });
            const resRead = await client.read("test");
            expect(resRead.data.account_name).toBe("name");
            expect(resRead.data.issuer).toBe("test");

            const resList = await client.list();
            expect(resList.data.keys).toContain("test");
        });

        test("successfully delete key", async () => {
            const resCreate = await client.create("delete", {
                generate: true,
                issuer: "test",
                account_name: "delete"
            });

            await client.delete("delete");

            const resList = await client.list();
            expect(resList.data.keys).not.toContain("delete");
        });

        test("successfully generate and validate code", async () => {
            const resCreate = await client.create("code", {
                 generate: true,
                 issuer: "test",
                 account_name: "code"
            });
            const resGenerate = await client.generateCode("code");
            const code = resGenerate.data.code;

            const resValidate = await client.validateCode("code", code);
            expect(resValidate.data.valid).toBe(true);
        });
    });

});
