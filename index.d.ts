/// <reference types="@types/node" />
/// <reference types="@types/zen-observable" />
/// <reference types="@slimio/safe-emitter" />

import * as SafeEmitter from "@slimio/safe-emitter";

// Require modules
import * as Evt from "./src/events";

declare namespace TcpClient {
    interface ConstructorOptions {
        host?: string;
        port?: number;
    }

    interface GetInfo {
        uid: string;
        name: string;
        version: string;
        containerVersion: string;
        started: boolean;
        callbacksDescriptor: string;
        callbacks: string[];
    }

    interface AgentInfo {
        location: string;
        version: string;
    }

    interface NativeCallbacks {
        start(): Promise<void>,
        stop(): Promise<void>,
        healthCheck(): Promise<void>,
        getInfo(): Promise<GetInfo>
    };

    interface DefaultModules {
        events: (agent: TcpClient) => Evt.Callbacks
    }
}

declare class TcpClient extends SafeEmitter {
    constructor(options?: TcpClient.ConstructorOptions);

    public readonly agent: TcpClient.AgentInfo | null;
    public static DEFAULT_PORT: number;
    public static modules: TcpClient.DefaultModules;
    public client: NodeJS.Socket;
    public host: string;
    public port: string;

    getActiveAddons(): Promise<String[]>;
    ping(): Promise<void>;
    connect(): Promise<void>;
    sendMessage(target: string, args?: any[]): ZenObservable.ObservableLike<any>;
    sendOne(target: string, args: any): Promise<any>;
    close(): void;
}

export as namespace TcpClient;
export = TcpClient;
