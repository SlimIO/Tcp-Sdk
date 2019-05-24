declare namespace Events {
    interface Callbacks extends TcpClient.NativeCallbacks {
        declareEntity(): Promise<number>
    };
}

export = Events;
