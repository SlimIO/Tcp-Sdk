/// <reference types="@types/node" />

declare namespace Events {
    interface Callbacks extends TcpClient.NativeCallbacks {
        declareEntity(): Promise<number>
    };
}

export = Events;
