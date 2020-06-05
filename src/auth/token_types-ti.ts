/**
 * This module was automatically generated by `ts-interface-builder`
 */
import * as t from "ts-interface-checker";
// tslint:disable:object-literal-key-quotes

export const IVaultTokenRenewSelfOptions = t.iface([], {
    increment: t.opt("string"),
});

export const IVaultTokenRenewOptions = t.iface([], {
    token: "string",
    increment: t.opt("string"),
});

export const IVaultTokenAuthResponse = t.iface([], {
    auth: t.iface([], {
        client_token: "string",
        accessor: "string",
        policies: t.array("string"),
        lease_duration: "number",
        renewable: "boolean",
    }),
});

const exportedTypeSuite: t.ITypeSuite = {
    IVaultTokenRenewSelfOptions,
    IVaultTokenRenewOptions,
    IVaultTokenAuthResponse,
};
export default exportedTypeSuite;
