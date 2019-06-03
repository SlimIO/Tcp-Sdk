/// <reference types="@types/zen-observable" />
/// <reference types="@slimio/safe-emitter" />

import * as SafeEmitter from "@slimio/safe-emitter";
import * as Net from "net";

declare namespace TcpClient {
    interface ConstructorOptions {
        host?: string;
        port?: number;
    }

    interface AgentInfo {
        location: string;
        version: string;
    }

    type Calback = { [key: string]: any };

    // TODO how to compose from Addon ? (instead of creating a whole thing here...)
    interface Targets {
        "gate.get_info": null;
        "gate.start": null;
        "gate.stop": null;
        "gate.health_check": null;
    }

    interface Events {
        connect: void;
    }
}

declare class TcpClient<T extends TcpClient.Calback = TcpClient.Targets> extends SafeEmitter<TcpClient.Events> {

    constructor(options?: TcpClient.ConstructorOptions);

    public readonly agent: TcpClient.AgentInfo | null;
    public static DEFAULT_PORT: number;
    public client: Net.Socket;
    public host: string;
    public port: string;

    getActiveAddons(): Promise<String[]>;
    ping(): Promise<void>;
    connect(): Promise<void>;

    // TODO: how to handle the return type on T ?
    sendMessage<K extends keyof T>(target: K, args?: T[K]): ZenObservable.ObservableLike<any>;
    sendOne<K extends keyof T>(target: K, args?: T[K]): Promise<any>;
    close(): void;
}

export as namespace TcpClient;
export = TcpClient;
