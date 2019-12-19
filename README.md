# Typescript library for vault

## In-Cluster Example
```js
const cert = await fs.readFile("../vault-cacert", "utf8");
const client = new Vault({
    vaultAddress: "https://vault:8200",
    vaultCaCertificate: cert,
});

const k8sauth  = client.KubernetesAuth({
        role: "signup-api"
});

await client.Auth(k8sauth)
    .enableAutoRenew()

client.on("error", e => console.log(e));

client.Health().health().then(a => console.log(a));
```
