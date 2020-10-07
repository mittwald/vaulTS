import { IVaultTokenAuthResponse, Vault, VaultTokenClient } from "../../src";

describe("Token Vault Client", () => {
    describe("Token AutoRenew", () => {
        test("Renew Token multiple times", async () => {
            const realSetTimeout = setTimeout;
            jest.useFakeTimers();
            const vault = new Vault();
            const tokenClient = new VaultTokenClient(vault);

            const renewfn = jest.fn();
            tokenClient.renewSelf = renewfn;

            const exp = new Date();
            exp.setHours(9999);
            Object.defineProperty(tokenClient, "expires", { value: exp });
            renewfn.mockResolvedValue({
                auth: {
                    client_token: "newtoken",
                },
            } as IVaultTokenAuthResponse);

            await tokenClient.enableAutoRenew();

            const sleep = (ms: number) => new Promise((resolve) => realSetTimeout(resolve, ms));

            await jest.runAllTimers();
            await sleep(50);
            await jest.runAllTimers();
            await sleep(50);
            await jest.runAllTimers();
            await sleep(50);
            await jest.runAllTimers();

            expect(renewfn).toBeCalledTimes(5);
        });
    });
});
