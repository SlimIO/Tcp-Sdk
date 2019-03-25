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

## API

<details><summary>constructor(port: number)</summary>

Create and instanciate a new TCP Connection to the socket server with `port`. Listen for event **connection** to known when you'r ready to send messages.
</details>

<details><summary>sendMessage< T >(callbackName: string, args?: any[]): ZenObservable.ObservableLike< T ></summary>

send a callback message.
</details>

<details><summary>close(): void</summary>

Close the TCP (Socket) connection.
</details>

## License
MIT
