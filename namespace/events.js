const TCP_SDK = require("../index");

/**
 * @namespace Events
 */

/**
 * @function events
 * @memberof Events#
 * @param {!TCP_SDK} Agent Agent Handler
 * @returns {*}
 */
function events(Agent) {
    if (!(Agent instanceof TCP_SDK)) {
        throw new Error("agent must be instanceof TCP SDK");
    }

    function getInfo() {
        return new Promise((resolve, reject) => {
            Agent.sendMessage("events.get_info").subscribe(resolve, reject);
        });
    }

    return {
        getInfo
    };
}

module.exports = events;
