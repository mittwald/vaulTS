import {Vault} from "../../src";
import {KVVaultClient} from "../../src/engines/kv";

describe("KV Vault Client", () => {
    let client: KVVaultClient;

    describe("Integration Test (requires running vault instance)", () => {
        beforeAll(async () => {
            const vault = new Vault();
            client = vault.KV(1);
        });

        test("successfully create, read and list key in root", async () => {
            const resCreate = await client.create("testpath", {
                mykey: "myvalue"
            });
            const resRead = await client.read("testpath");
            expect(resRead.data.mykey).toBe("myvalue");

            const resList = await client.list();
            expect(resList.data.keys).toContain("testpath");
        });

        test("successfully create, read and list key in sub-path", async () => {
            const resCreate = await client.create("my/test/path", {
                mykey: "myvalue"
            });
            const resRead = await client.read("my/test/path");
            expect(resRead.data.mykey).toBe("myvalue");

            const resListRoot = await client.list();
            expect(resListRoot.data.keys).toContain("my/");
            const resListMy = await client.list("my");
            expect(resListMy.data.keys).toContain("test/");
            const resListTest = await client.list("my/test");
            expect(resListTest.data.keys).toContain("path");
        });

        test("successfully delete", async () => {
            const resCreate = await client.create("delete", {
                mykey: "myvalue"
            });

            await client.delete("delete");

            const resList = await client.list();
            expect(resList.data.keys).not.toContain("delete");
        });
    });

});
