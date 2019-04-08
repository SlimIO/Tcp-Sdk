// Require modules methods!
const events = require("./events");

const nativeCallbacks = {
    getInfo() {
        return new Promise((resolve, reject) => {
            this.tcpConn.sendMessage("events.get_info").subscribe(resolve, reject);
        });
    }
};

/**
 * @func createModule
 * @param {!TcpClient} agent TcpClient connection
 * @param {*} extendedMethods methods
 * @returns {void}
 */
function createModule(agent, extendedMethods) {
    if (agent.constructor.name !== "TcpClient") {
        throw new TypeError("agent must be instanceof TcpClient");
    }

    const ret = Object.assign(nativeCallbacks, extendedMethods);
    Reflect.set(ret, "tcpConn", agent);

    return ret;
}

module.exports = {
    events: (agent) => createModule(agent, events)
};
