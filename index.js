// Require Node.js Dependencies
const { createConnection } = require("net");

// Require Third-party Dependencies
const uuid = require("uuid/v4");
const SafeEmitter = require("@slimio/safe-emitter");
const Observable = require("zen-observable");

/**
 * @class SDK
 * @classdesc TCP SDK
 */
class SDK extends SafeEmitter {
    /**
     * @constructor
     * @param {!Number} port
     *
     * @throws {TypeError}
     */
    constructor(port) {
        super();
        if (typeof port !== "number") {
            throw new TypeError("port must be a number!");
        }

        // Create TCP Server
        const client = createConnection({ port });
        Reflect.defineProperty(this, "client", {
            value: client,
            enumerable: false
        });
        this.isConnected = false;

        // Listen for events
        client.on("error", console.error);
        client.on("end", () => {
            // Do nothing
        });

        client.on("data", (buf) => {

        });

        client.on("connect", () => {
            this.emit("connect");
            this.isConnected = true;
        });
    }

    /**
     * @method sendMessage
     * @desc Send a message
     * @memberof SDK#
     * @param {!String} callbackName
     * @param {*} options
     */
    sendMessage(callbackName, options) {

    }
}
