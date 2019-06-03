// Require Node.js Dependencies
const { join } = require("path");
const { access } = require("fs").promises;
const { spawn } = require("child_process");

// Require Third-party Dependencies
const avaTest = require("ava");
const commands = require("@slimio/cli");
const del = require("del");
const is = require("@slimio/is");

// Require Internal Dependencies
const TcpClient = require("../index");

// Globals
let cp = null;
const agentDir = join(__dirname, "..", "agent");

avaTest.before("Clone SlimIO Agent", async(assert) => {
    try {
        await access(agentDir);
        await del([agentDir]);
    }
    catch (err) {
        // Ignore
    }

    await commands.initAgent("agent");
    cp = spawn(process.argv[0], [join(agentDir, "index.js"), "--silent"], {
        stdio: "inherit"
    });
    cp.on("error", (err) => console.error(err));

    // Wait a little bit (else the agent will not be yet started).
    await new Promise((resolve) => setTimeout(resolve, 1000));
    assert.pass();
});

avaTest.after("Cleanup Agent", async(assert) => {
    if (cp !== null) {
        cp.kill();
    }
    await del([agentDir]);
});

avaTest("constructor errors", (assert) => {
    assert.throws(() => {
        new TcpClient({ port: "1337" });
    }, { instanceOf: TypeError, message: "port must be a number!" });

    assert.throws(() => {
        new TcpClient({ host: 10 });
    }, { instanceOf: TypeError, message: "host must be a string!" });
});

avaTest("default agent must be null", async(assert) => {
    const client = new TcpClient();
    assert.is(client.port, TcpClient.DEFAULT_PORT);
    assert.is(client.host, "localhost");
    assert.is(client.agent, null);

    await client.once("connect", 1000);
    const agent = client.agent;
    assert.deepEqual(Object.keys(agent), ["version", "location"]);
    assert.true(typeof agent.version === "string");
    assert.is(agent.location, agentDir);

    client.close();
});

avaTest("pull information from gate", async(assert) => {
    const client = new TcpClient();
    const add1 = await client.getActiveAddons();
    assert.deepEqual(add1, []);
    await client.once("connect", 1000);

    const info = await client.sendOne("gate.global_info");
    assert.deepEqual(Object.keys(info), ["root", "silent", "coreVersion"]);
    assert.is(info.root, agentDir);
    assert.is(info.silent, true);
    assert.true(typeof info.coreVersion === "string");

    const addons = await client.sendOne("gate.list_addons");
    assert.deepEqual(addons, ["alerting", "events", "gate", "socket"]);

    const add2 = await client.getActiveAddons();
    assert.deepEqual(add2, ["alerting", "events", "gate", "socket"]);

    client.close();
    // assert.true(client.client.destroyed);
});
