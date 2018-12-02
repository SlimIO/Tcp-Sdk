/// <reference types="@types/node" />

declare namespace Events {
    interface CallbackGetInfo {
        uid: string;
        name: string;
        version: string;
        containerVersion: string;
        started: boolean;
        callbacksDescriptor: string;
        callbacks: string[];
    }

    interface Callbacks {
        getInfo(): Promise<CallbackGetInfo>
    };
}

function Events(agent: any): Events.Callbacks;

export as namespace Events;
export = Events;
