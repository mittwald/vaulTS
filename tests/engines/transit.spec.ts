import { Vault } from "../../src";
import { TransitVaultClient } from "../../src";

describe("Transit Vault Client", () => {
    let client: TransitVaultClient;

    describe("class", () => {
        beforeAll(async () => {
            const vault = new Vault();
            client = vault.Transit();
        });

        test("throws error on invalid keys", async () => {
            const shouldNeverBeCalled = jest.fn();
            const invalidKeys = ["", "invalid/key"];
            for (const key of invalidKeys) {
                try {
                    await client.create(key);
                    shouldNeverBeCalled();
                } catch (err) {
                    expect(err.response.statusCode).toEqual(400);
                }
            }
            expect(shouldNeverBeCalled).toBeCalledTimes(0);
        });
    });

    describe("Integration Test (requires running vault instance)", () => {
        beforeAll(async () => {
            const vault = new Vault();
            client = vault.Transit();
        });

        test("successfully create and read key", async () => {
            await client.create("test");
            const res = await client.read("test");
        });

        test("successfully create, list and delete key", async () => {
            await client.create("delete");
            const listCreated = await client.list();
            expect(listCreated.data.keys).toContain("delete");
            await client.update("delete", { deletion_allowed: true });
            await client.delete("delete");
            const listDeleted = await client.list();
            expect(listDeleted.data.keys).not.toContain("delete");
        });

        test("successfully rotate key", async () => {
            await client.create("rotate");
            await client.update("rotate", { deletion_allowed: true });
            await client.rotate("rotate");
            const res = await client.read("rotate");
            expect(res.data.latest_version).toEqual(2);
            await client.delete("rotate");
        });

        test("successfully export key", async () => {
            await client.create("export");
            await client.update("export", { deletion_allowed: true, exportable: true });
            const res = await client.export("export", { key_type: "encryption-key" });
            expect(res.data.keys).toHaveProperty("1");
            await client.delete("export");
        });

        test("successfully encrypt and decrypt plaintext", async () => {
            const text = Buffer.from("test123").toString("base64");

            const ciphertext = await client
                .encrypt("test", {
                    plaintext: text,
                })
                .then((res) => res.data.ciphertext);
            const res = await client
                .decrypt("test", {
                    ciphertext,
                })
                .then((res) => res.data.plaintext);

            expect(res).toEqual(text);
        });

        test("successfully encrypt and decrypt batch", async () => {
            const text = Buffer.from("test123").toString("base64");
            const input = [
                {
                    plaintext: text,
                },
                {
                    plaintext: "",
                },
            ];

            const result = await client
                .encrypt("test", {
                    batch_input: input,
                })
                .then((res) => res.data.batch_results);
            const res = await client
                .decrypt("test", {
                    batch_input: result.map((r) => ({
                        ciphertext: r.ciphertext,
                        context: r.context,
                    })),
                })
                .then((res) => res.data.batch_results);

            expect(res).toEqual(input);
        });

        test("successfully encrypt and decrypt simple plaintext", async () => {
            const enc = await client.encryptText("test", "hello");
            const dec = await client.decryptText("test", enc);
            expect(dec).toEqual("hello");
        });

        test("should response with 400 if the keyID for decryption is invalid", async () => {
            const encrypted = await client.encryptText("400test", "plainText");
            const invalidKeyID = "invalid";
            await client.create(invalidKeyID);
            try {
                await client.decryptText(invalidKeyID, encrypted);
            } catch (err) {
                expect(err.response.statusCode).toEqual(400);
            }
        });

        test("should response with 404 if the keyID for decryption does not exists", async () => {
            const encrypted = await client.encryptText("404test", "plainText");
            try {
                await client.decryptText("unknown key", encrypted);
            } catch (err) {
                expect(err.response.statusCode).toEqual(404);
            }
        });
    });
});
