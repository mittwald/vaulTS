# Typescript Library for HashiCorp vault

This is yet another typescript vault client. While other clients usually provide more APIs, we aim to fully type the requests and responses
for an improved Developing experience.

Typing every request and response is rather time consuming, only a few vault APIs are implemented at the moment. If there is demand for us
to use other APIs, they will be added. We are also always open to Pull Requests :)

## Supported APIs

Currently, these APIs are implemented:

-   `Health()`
-   `Transit(mountPoint)`
-   `Totp(mountPoint)`
-   `KV(version: 1|2, mountPoint)`

## Authentication

Token-based and Kubernetes Auth are supported as of now.

### Token-Based

Initialize a new Vault Client using your token and endpoint:

```js
const cert = await fs.readFile("../vault-cacert", "utf8");
const client = new Vault({
    vaultAddress: "http://127.0.0.1:8200",
    vaultToken: "SECRET",
    vaultCaCertificate: cert, // vault CA Cert, required for secure communication
});
```

### Kubernetes In-Cluster Example

```js
const client = new Vault({
    vaultAddress: "https://vault:8200",
    vaultCaCertificate: cert,
    vaultCaCertificatePath: "../vault-cacert",
});

const k8sauth = client.KubernetesAuth({
    role: "myrole",
});

await client.Auth(k8sauth).login();

client
    .Health()
    .health()
    .then((a) => console.log(a));
```

## Usage

Once the Vault Client is created, instanciate new clients for each engine:

```
client.Health() // returns Health client
client.Transit("transit") // returns Transit client (uses mountpoint transit)
client.KV(2, "kv2") // returns KV2 client (uses mountpoint kv2)
client.KV(1, "kv") // returns KV client (uses mountpoint kv)
client.Totp("totp") // returns Totp client (uses mountpoint totp)
```

Each client supports the CRUD operations show in its respective [API docs](https://www.vaultproject.io/api/secret/kv/kv-v1.html). Reqest and
Response for each operation are fully typed.
