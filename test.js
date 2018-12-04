const TCP_SDK = require("./index");

// NAMESPACE
const events = require("./namespace/events");

// CONSTANTS
const CONNECT_TIMEOUT_MS = 1000;
const SLIMIO_DEFAULT_PORT = 1337;

/**
 * @async
 * @func main
 * @returns {Promise<void>}
 */
async function main() {
    const Agent = new TCP_SDK(SLIMIO_DEFAULT_PORT);
    await Agent.once("connect", CONNECT_TIMEOUT_MS);
    console.log("Connected to the SlimIO Agent!");

    const evt = events(Agent);
    const info = await evt.getInfo();
    console.log(info);
}
main().catch(console.error);