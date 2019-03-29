/// <reference types="@types/node" />
/// <reference types="@types/zen-observable" />
/// <reference types="@slimio/safe-emitter" />

import * as SafeEmitter from "@slimio/safe-emitter";

// Require modules
import * as Evt from "./modules/events";

declare namespace TcpClient {
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
    constructor(port: number);

    public readonly agent(): TcpClient.AgentInfo | null;
    public static DEFAULT_PORT: number;
    public static modules: TcpClient.DefaultModules;
    public client: NodeJS.Socket;

    getActiveAddons(): Promise<String[]>;
    sendMessage<T>(callbackName: string, args?: any[]): ZenObservable.ObservableLike<T>;
    close(): void;
}

export as namespace TcpClient;
export = TcpClient;
