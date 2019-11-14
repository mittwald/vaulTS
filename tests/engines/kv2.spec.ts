import {KV2VaultClient, Vault} from "../../src";
import {KVVaultClient} from "../../src/engines/kv";

describe("KV Vault Client", () => {
    let client: KV2VaultClient;

    describe("Integration Test (requires running vault instance)", () => {
        beforeAll(async () => {
            const vault = new Vault();
            client = vault.KV(2);
        });

        test("successfully create, read and list key in root", async () => {
            const resCreate = await client.create("testpath", {
                data: {
                    mykey: "myvalue"
                }
            });
            const resRead = await client.read("testpath");
            expect(resRead.data.data.mykey).toBe("myvalue");

            const resList = await client.list();
            expect(resList.data.keys).toContain("testpath");
        });

        test("successfully create, read and list key in sub-path", async () => {
            const resCreate = await client.create("my/test/path", {
                data: {
                    mykey: "myvalue"
                }
            });
            const resRead = await client.read("my/test/path");
            expect(resRead.data.data.mykey).toBe("myvalue");

            const resListRoot = await client.list();
            expect(resListRoot.data.keys).toContain("my/");
            const resListMy = await client.list("my");
            expect(resListMy.data.keys).toContain("test/");
            const resListTest = await client.list("my/test");
            expect(resListTest.data.keys).toContain("path");
        });

        test("successfully deleteVersion and undelete", async () => {
            const resCreate = await client.create("undeleteversion", {
                data: {
                    mykey: "myvalue"
                }
            });

            const metadata = await client.readMetadata("undeleteversion");
            const versiontoDelete = Object.keys(metadata.data.versions).map(s => parseInt(s)).reverse()[0];

            await client.deleteVersion("undeleteversion", [versiontoDelete]);
            const metadataDelete = await client.readMetadata("undeleteversion");
            expect(metadataDelete.data.versions["" + versiontoDelete].deletion_time).not.toBe("");


            await client.undeleteVersion("undeleteversion", [versiontoDelete]);
            const metadataDestroy = await client.readMetadata("undeleteversion");
            expect(metadataDestroy.data.versions["" + versiontoDelete].destroyed).toBe(false);
            expect(metadataDestroy.data.versions["" + versiontoDelete].deletion_time).toBe("");
        });

        test("successfully deleteVersion and destroy", async () => {
            const resCreate = await client.create("destroyversion", {
                data: {
                    mykey: "myvalue"
                }
            });

            const metadata = await client.readMetadata("destroyversion");
            const versiontoDelete = Object.keys(metadata.data.versions).map(s => parseInt(s)).reverse()[0];

            await client.deleteVersion("destroyversion", [versiontoDelete]);
            const metadataDelete = await client.readMetadata("destroyversion");
            expect(metadataDelete.data.versions["" + versiontoDelete].destroyed).toBe(false);


            await client.destroyVersion("destroyversion", [versiontoDelete]);
            const metadataDestroy = await client.readMetadata("destroyversion");
            expect(metadataDestroy.data.versions["" + versiontoDelete].destroyed).toBe(true);

        });

        test("successfully delete", async () => {
            const resCreate = await client.create("delete", {
                data: {
                    mykey: "myvalue"
                }
            });

            await client.delete("delete");

            const resList = await client.list();
            expect(resList.data.keys).not.toContain("delete");
        });

        test("successfully read version", async () => {
            await client.create("version", {
                data: {
                    mykey: "myvalue"
                }
            });
            await client.create("version", {
                data: {
                    mykey: "myvalue2"
                }
            });

            const metadata = await client.readMetadata("version");
            const versions = Object.keys(metadata.data.versions).map(s => parseInt(s)).reverse();

            const readLast = await client.read("version");
            expect(readLast.data.data.mykey).toBe("myvalue2");
            const read2 = await client.read("version", versions[0]);
            expect(read2.data.data.mykey).toBe("myvalue2");
            const read1 = await client.read("version", versions[1]);
            expect(read1.data.data.mykey).toBe("myvalue");
        });
    });

});
