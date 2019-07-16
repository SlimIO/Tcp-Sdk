"use strict";

// Require Node.js Dependencies
const { createConnection } = require("net");

// Require Third-party Dependencies
const SafeEmitter = require("@slimio/safe-emitter");
const Observable = require("zen-observable");
const uuidv4 = require("uuid/v4");

// CONSTANTS
const SOCKET_TIMEOUT_MS = 30000;
const MESSAGE_TIMEOUT_MS = 5000;
const RECONNECT_TIMEOUT_MS = 1000;
const NULL_CHAR = "\0".charCodeAt(0);

// Symbols
const symAgent = Symbol("agent");

/**
 * @class TcpClient
 * @classdesc TCP SDK
 */
class TcpClient extends SafeEmitter {
    /**
     * @class
     * @memberof TcpClient#
     * @param {object} [options] options
     * @param {number} [options.port=1337] agent port
     * @param {string} [options.host=localhost] agent host
     *
     * @throws {TypeError}
     */
    constructor(options = Object.create(null)) {
        super();
        const { port, host } = Object.assign({}, TcpClient.DEFAULT_OPTIONS, options);
        if (typeof port !== "number") {
            throw new TypeError("port must be a number!");
        }
        if (typeof host !== "string") {
            throw new TypeError("host must be a string!");
        }

        // Max listeners
        this.setMaxListeners(20);
        this.port = port;
        this.host = host;

        // Create TCP Server
        this.client = createConnection({ port, host });
        this.client.setTimeout(SOCKET_TIMEOUT_MS);
        this.client.on("timeout", () => this.close());
        this.client.on("error", console.error);
        this.client.on("end", () => this.emit("end"));

        this.client.on("connect", async() => {
            await this.ping();
            this.emit("connect");
        });

        this.client.on("data", (buf) => {
            let tempBuf = [];
            try {
                let offset = 0;
                let index;

                while ((index = buf.indexOf(NULL_CHAR, offset)) !== -1) {
                    tempBuf.push(buf.slice(offset, index));
                    offset = index + 1;

                    const str = Buffer.concat(tempBuf).toString();
                    tempBuf = [];

                    try {
                        const { uuid, ...options } = JSON.parse(str);
                        this.emit(uuid, options);
                    }
                    catch (err) {
                        console.log("failed to parse JSON:\n", str);
                    }
                }

                if (offset < buf.length) {
                    tempBuf.push(buf.slice(offset));
                }
            }
            catch (err) {
                /* istanbul ignore next */
                console.error(err);
            }
        });

        /* istanbul ignore next */
        process.on("SIGINT", () => this.close());
        Reflect.defineProperty(this, symAgent, { value: null, writable: true });
    }

    /**
     * @memberof TcpClient#
     * @member {any} agent
     * @returns {any}
     */
    get agent() {
        return this[symAgent];
    }

    /**
     * @async
     * @function ping
     * @memberof TcpClient#
     * @returns {Promise<void>}
     */
    async ping() {
        const ret = await this.sendOne("gate.global_info");
        this[symAgent] = {
            version: ret.coreVersion,
            location: ret.root
        };
    }

    /**
     * @async
     * @function connect
     * @memberof TcpClient#
     * @param {number} [timeOut=1000] timeOut
     * @returns {Promise<void>}
     *
     * @throws {TypeError}
     */
    async connect(timeOut = RECONNECT_TIMEOUT_MS) {
        if (typeof timeOut !== "number") {
            throw new TypeError("timeOut must be a number");
        }
        if (!this.client.destroyed) {
            return false;
        }

        this.client.connect(this.port, this.host);
        await this.once("connect", timeOut);

        return true;
    }

    /**
     * @async
     * @function getActiveAddons
     * @description Return the list of active addons
     * @memberof TcpClient#
     * @returns {Promise<string[]>}
     */
    async getActiveAddons() {
        if (this.client.connecting) {
            return [];
        }

        const addons = await new Promise((resolve, reject) => {
            this.sendMessage("gate.list_addons").subscribe(resolve, reject);
        });

        return addons;
    }

    /**
     * @function sendMessage
     * @description Send a message
     * @memberof TcpClient#
     * @param {!string} callback target
     * @param {any[]} [args] message arguments
     * @returns {ZenObservable.ObservableLike<any>}
     */
    sendMessage(callback, args = []) {
        return new Observable((subscriber) => {
            const uuid = uuidv4();
            setImmediate(() => {
                this.client.write(`${JSON.stringify({ uuid, callback, args })}\0`);
            });

            // Listen for UUID
            this.on(uuid, ({ error, complete, data }) => {
                if (error !== null) {
                    return subscriber.error(error);
                }

                return complete ? subscriber.complete() : subscriber.next(data);
            });

            const timer = setTimeout(() => this.removeAllListeners(uuid), MESSAGE_TIMEOUT_MS);

            return () => {
                this.removeAllListeners(uuid);
                clearTimeout(timer);
            };
        });
    }

    /**
     * @function sendOne
     * @description Send a message wrapped with a Promise
     * @memberof TcpClient#
     * @param {!string} target target
     * @param {any} [args] message arguments
     * @returns {Promise<any>}
     */
    sendOne(target, args = []) {
        return new Promise((resolve, reject) => {
            this.sendMessage(target, Array.isArray(args) ? args : [args]).subscribe(resolve, reject);
        });
    }

    /**
     * @function close
     * @description Close Agent connection
     * @memberof TcpClient#
     * @returns {void}
     */
    close() {
        if (this.client.destroyed) {
            return false;
        }

        this.client.end();

        return true;
    }
}

TcpClient.DEFAULT_PORT = 1337;
TcpClient.DEFAULT_OPTIONS = {
    port: TcpClient.DEFAULT_PORT,
    host: "localhost"
};
Object.preventExtensions(TcpClient);

module.exports = TcpClient;
