# Tcp-Sdk
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/Tcp-Sdk/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/Tcp-Sdk/commit-activity)
[![mit](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/SlimIO/Tcp-Sdk/blob/master/LICENSE)
![dep](https://img.shields.io/david/SlimIO/Tcp-Sdk)
![size](https://img.shields.io/github/languages/code-size/SlimIO/Tcp-Sdk)
[![Known Vulnerabilities](https://snyk.io//test/github/SlimIO/Tcp-Sdk/badge.svg?targetFile=package.json)](https://snyk.io//test/github/SlimIO/Tcp-Sdk?targetFile=package.json)
[![Build Status](https://travis-ci.com/SlimIO/Tcp-Sdk.svg?branch=master)](https://travis-ci.com/SlimIO/Tcp-Sdk)
[![Greenkeeper badge](https://badges.greenkeeper.io/SlimIO/Tcp-Sdk.svg)](https://greenkeeper.io/)

SlimIO TCP Socket SDK. This package has been created to help developer to communicate with the product (Require the [Socket](https://github.com/SlimIO/Socket) Addon on the SlimIO agent you want to communicate to).

<p align="center">
<img src="https://i.imgur.com/hXT8ZB1.png">
</p>

> ⚠️ TCP SDK will automatically search and request informations from the built-in [Gate](https://github.com/SlimIO/Gate) addon.

## Requirements
- [Node.js](https://nodejs.org/en/) v12 or higher

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

    try {
        const info = await client.sendOne("cpu.status");
        console.log(info);
    }
    finally {
        client.close();
    }
}
main().catch(console.error);
```

## API

<details><summary>constructor(options?: TcpClient.ConstructorOptions)</summary>

Create and instanciate a new TCP Connection to the socket server. Listen for event **connection** to known when you'r ready to send messages.

Options is described by the following interface:
```ts
interface ConstructorOptions {
    host?: string;
    port?: number;
}
```

Default value of port would be **TcpClient.DEFAULT_PORT**.
</details>

<details><summary>getActiveAddons(): Promise< String[] ></summary>

Return the list of active addons on the current agent.
</details>

<details><summary>ping(): Promise< void ></summary>

Send a ping event (avoid timeout).
</details>

<details><summary>sendMessage(target: string, args?: any[]): ZenObservable.ObservableLike< any ></summary>

send a callback message.
</details>

<details><summary>sendOne< T >(target: string, args?: any[]): Promise< any ></summary>

send a callback message wrapped by a Promise.
</details>

<details><summary>connect(): Promise< void ></summary>

Connect (or re-connect) the Net.socket. If the Socket is alive it will return.
</details>

<details><summary>close(): void</summary>

Close the TCP (Socket) connection.
</details>

### Properties

<details><summary>readonly agent(): TcpClient.AgentInfo | null</summary>

The readonly getter is described by the following TypeScript interface:
```ts
interface AgentInfo {
    location: string;
    version: string;
}
```
</details>

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/safe-emitter](https://github.com/SlimIO/safeEmitter#readme)|Minor|Medium|Node.js Safe Emitter|
|[@lukeed/uuid](https://www.npmjs.org/package/@lukeed/uuid)|Minor|Low|Generate Unique ID|
|[zen-observable](https://github.com/zenparsing/zen-observable)|Minor|Low|Observable Implementation|

## License
MIT
