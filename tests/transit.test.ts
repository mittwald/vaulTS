import {TransitVaultClient, Vault, IVaultConfig, VaultRequestError} from "../src";

const clearKeys = async (client: TransitVaultClient): Promise<void> => {
    const keysResponse = await client.list();
    for (const k of keysResponse.data.keys) {
        await client.forceDelete(k);
    }
}

describe("TransitClient", () => {
    const vaultConfig: IVaultConfig = {
        vaultAddress: "http://127.0.0.1:8200",
        vaultToken: process.env.VAULT_TOKEN,
    }
    const vault = new Vault(vaultConfig);
    const keyID = "testkey";
    const plainText = "this is a to encrypt test text";

    let client: TransitVaultClient;

    beforeAll(() => {
        client = new TransitVaultClient(vault);
    });

    beforeEach(async () => {
        await clearKeys(client);
    });

    test("should encrypt and decrypt text", async () => {
        const encrypted = await client.encryptText(keyID, plainText);
        const decrypted = await client.decryptText(keyID, encrypted);

        expect(plainText).toEqual(decrypted);
    });

    test("should response with 400 if the keyID for decryption is invalid", async () => {
        const encrypted = await client.encryptText(keyID, plainText);
        const invalidKeyID = "invalid";
        await client.create(invalidKeyID);
        try {
            await client.decryptText(invalidKeyID, encrypted);
        } catch (err) {
            expect(err.response.statusCode).toEqual(400);
        }
    });

    test("should response with 404 if the keyID for decryption does not exists", async () => {
        const encrypted = await client.encryptText(keyID, plainText);
        try {
            await client.decryptText("unknown key", encrypted);
        } catch (err) {
            expect(err.response.statusCode).toEqual(404);
        }
    });

});
