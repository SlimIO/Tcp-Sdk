// Require Node.js Dependencies
const { createConnection } = require("net");
const { randomBytes } = require("crypto");

// Require Third-party Dependencies
const SafeEmitter = require("@slimio/safe-emitter");
const Observable = require("zen-observable");

// Require Internal Dependencies
const modules = require("./src");

// CONSTANTS
const SOCKET_TIMEOUT_MS = 30000;
const MESSAGE_TIMEOUT_MS = 5000;

// Symbols
const symAgent = Symbol("agent");

/**
 * @class TcpClient
 * @classdesc TCP SDK
 */
class TcpClient extends SafeEmitter {
    /**
     * @constructor
     * @memberof TcpClient#
     * @param {Number} [port=1337] agent port
     *
     * @throws {TypeError}
     */
    constructor(port = TcpClient.DEFAULT_PORT) {
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

        this.client.on("connect", async() => {
            await this.ping();
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

        process.on("SIGINT", () => this.close());
        Reflect.defineProperty(this, symAgent, { value: null, writable: true });
    }

    /**
     * @memberof TcpClient#
     * @member {any} agent
     */
    get agent() {
        return this[symAgent];
    }

    /**
     * @async
     * @method ping
     * @memberof TcpClient#
     * @returns {Promise<void>}
     */
    async ping() {
        const ret = await new Promise((resolve, reject) => {
            this.sendMessage("agent.global_info").subscribe(resolve, reject);
        });
        this[symAgent] = {
            version: ret.coreVersion,
            location: ret.root
        };
    }

    /**
     * @async
     * @method getActiveAddons
     * @desc Return the list of active addons
     * @memberof TcpClient#
     * @returns {Promise<String[]>}
     */
    async getActiveAddons() {
        if (this.client.connecting) {
            return [];
        }

        const addons = await new Promise((resolve, reject) => {
            this.sendMessage("agent.list_addons").subscribe(resolve, reject);
        });

        return addons;
    }

    /**
     * @method sendMessage
     * @desc Send a message
     * @memberof TcpClient#
     * @param {!String} callback target
     * @param {*} args message arguments
     * @returns {ZenObservable.ObservableLike<any>}
     */
    sendMessage(callback, args = []) {
        return new Observable((subscriber) => {
            const uuid = randomBytes(16).toString();
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
     * @memberof TcpClient#
     * @returns {void}
     */
    close() {
        if (this.client.destroyed) {
            return;
        }

        this.client.end();
    }
}

TcpClient.DEFAULT_PORT = 1337;
TcpClient.modules = modules;
Object.preventExtensions(TcpClient);

module.exports = TcpClient;
