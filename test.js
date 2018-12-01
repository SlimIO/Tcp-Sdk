const TCP_SDK = require("./index");

// CONSTANTS
const RECONNECT_TIMEOUT_MS = 1000;
const SLIMIO_DEFAULT_PORT = 1337;

async function main() {
    const Agent = new TCP_SDK(SLIMIO_DEFAULT_PORT);

    do {
        await Agent.once("connect", RECONNECT_TIMEOUT_MS);
    } while(Agent.isConnected === false);
    console.log("Connected to the SlimIO Agent!");

    process.on("SIGINT", () => {
        Agent.close();
    });

    Agent.sendMessage("events.get_info").subscribe({
        next(data) {
            console.log(data);
        },
        error(err) {
            console.error(err);
        },
        complete() {
            console.log("completed!");
        }
    });
}
main().catch(console.error);
