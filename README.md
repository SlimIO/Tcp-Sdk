# Tcp-Sdk
SlimIO TCP Socket SDK. This package has been created to help developer to communicate with the production (Socket addon).

## Requirements
- Node.js v10 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/tcp-sdk
# or
$ yarn add @slimio/tcp-sdk
```

## Usage example

```js
const TcpSdk = require("@slimio/tcp-sdk");
const CONNECT_TIMEOUT_MS = 1000;

async function main() {
    const client = new TcpSdk();
    await client.once("connect", CONNECT_TIMEOUT_MS);

    const info = await new Promise((resolve, reject) => {
        client.sendMessage("cpu.get_info").subscribe(resolve, reject);
    });
    console.log(info);

    client.close();
}
```

## License
MIT
