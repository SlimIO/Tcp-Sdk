// Require Node.js Dependencies
const { createConnection } = require("net");

// Require Third-party Dependencies
const uuidv4 = require("uuid/v4");
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
        this.client = createConnection({ port });
        this.isConnected = false;
        /** @type {Map<String, ZenObservable.SubscriptionObserver<any>>} */
        this.store = new Map();

        // Listen for events
        this.client.on("error", console.error);
        this.client.on("end", () => {
            // Do nothing
        });

        this.client.on("data", (buf) => {
            try {
                const { uuid, error, data, complete } = JSON.parse(buf.toString());
                if (!this.store.has(uuid)) {
                    return;
                }

                const subscriber = this.store.get(uuid);
                if (error !== null) {
                    return subscriber.error(error);
                }
                if (complete) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(data);
                }
            }
            catch (err) {
                console.error(err);
            }
        });

        this.client.on("connect", () => {
            this.emit("connect");
            this.isConnected = true;
        });
    }

    /**
     * @method sendMessage
     * @desc Send a message
     * @memberof SDK#
     * @param {!String} callback
     * @param {*} args
     * @returns {ZenObservable.ObservableLike<any>}
     */
    sendMessage(callback, args = []) {
        return new Observable((subscriber) => {
            const uuid = uuidv4();
            this.store.set(uuid, subscriber);

            setImmediate(() => {
                const msg = { uuid, callback, args };
                this.client.write(`${JSON.stringify(msg)}\n`);
            });

            const timer = setTimeout(() => {
                this.store.delete(uuid);
                subscriber.error(new Error(`Message id ${uuid} timeout!`));
            }, 5000);

            return () => {
                this.store.delete(uuid);
                clearTimeout(timer);
            }
        });
    }

    /**
     * @method close
     * @desc Close TCP Client connection
     * @returns {void}
     */
    close() {
        if (!this.isConnected) {
            return;
        }

        // Close all subscribers
        for (const observer of this.store.values()) {
            observer.complete();
        }
        this.isConnected = false;
        this.client.end();
    }
}

module.exports = SDK;
