// Require Node.js Dependencies
const { createConnection } = require("net");

// Require Third-party Dependencies
const uuidv4 = require("uuid/v4");
const SafeEmitter = require("@slimio/safe-emitter");
const Observable = require("zen-observable");

// Require Internal Dependencies
const namespaces = require("./namespace");

// CONSTANTS
const SOCKET_TIMEOUT_MS = 5000;
const MESSAGE_TIMEOUT_MS = 5000;

/**
 * @class TcpSdk
 * @classdesc TCP SDK
 */
class TcpSdk extends SafeEmitter {
    /**
     * @constructor
     * @memberof TcpSdk#
     * @param {!Number} port agent port
     *
     * @throws {TypeError}
     */
    constructor(port) {
        super();
        if (typeof port !== "number") {
            throw new TypeError("port must be a number!");
        }

        // Max listeners
        this.setMaxListeners(100);

        // Create TCP Server
        this.client = createConnection({ port });
        this.client.setTimeout(SOCKET_TIMEOUT_MS);
        this.client.on("timeout", () => {
            this.close();
        });
        this.client.on("error", console.error);
        this.client.on("end", () => {
            // Do nothing
        });

        this.client.on("connect", () => {
            this.emit("connect");
        });

        this.client.on("data", (buf) => {
            try {
                for (const msg of buf.toString().trim().split("\n")) {
                    const { uuid, ...options } = JSON.parse(msg);
                    this.emit(uuid, options);
                }
            }
            catch (err) {
                console.error(err);
            }
        });

        process.on("SIGINT", () => {
            this.close();
        });
    }

    /**
     * @method sendMessage
     * @desc Send a message
     * @memberof TcpSdk#
     * @param {!String} callback target
     * @param {*} args message arguments
     * @returns {ZenObservable.ObservableLike<any>}
     */
    sendMessage(callback, args = []) {
        return new Observable((subscriber) => {
            const uuid = uuidv4();
            setImmediate(() => {
                this.client.write(`${JSON.stringify({ uuid, callback, args })}\n`);
            });

            // Listen for UUID
            this.on(uuid, ({ error, complete, data }) => {
                if (error !== null) {
                    return subscriber.error(new Error(`Message with id ${uuid} timeOut`));
                }

                return complete ? subscriber.complete() : subscriber.next(data);
            });

            const timer = setTimeout(() => {
                this.removeAllListeners(uuid);
            }, MESSAGE_TIMEOUT_MS);

            return () => {
                clearTimeout(timer);
            };
        });
    }

    /**
     * @method close
     * @desc Close Agent connection
     * @memberof TcpSdk#
     * @returns {void}
     */
    close() {
        if (this.client.destroyed) {
            return;
        }

        this.client.end();
    }
}

TcpSdk.namespaces = namespaces;

module.exports = TcpSdk;
