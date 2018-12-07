/// <reference types="@types/node" />
/// <reference types="@types/zen-observable" />
/// <reference types="@slimio/safe-emitter" />

import * as SafeEmitter from "@slimio/safe-emitter";

declare namespace TcpClient {

}

declare class TcpClient extends SafeEmitter {
    constructor(port: number);

    public client: NodeJS.Socket;

    sendMessage(callbackName: string, args?: any): ZenObservable.ObservableLike<any>;
    close(): void;
}

export as namespace TcpClient;
export = TcpClient;
