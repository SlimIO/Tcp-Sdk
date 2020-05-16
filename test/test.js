// Require Node.js Dependencies
const { join } = require("path");
const { promisify } = require("util");
const { strictEqual } = require("assert").strict;

// Require Third-party Dependencies
const avaTest = require("ava");
const installer = require("@slimio/installer");
const premove = require("premove");
const FuzzBuzz = require("fuzzbuzz");
const treekill = require("tree-kill");

// Require Internal Dependencies
const TcpClient = require("../index");

// Globals
let cp = null;
const sleep = promisify(setTimeout);
const agentDir = join(__dirname, "..", "agent");

async function runFuzz(nbOperations = 250) {
    const client = new TcpClient();
    await client.once("connect", 1000);

    const activeAddons = await client.getActiveAddons();
    console.log(activeAddons);

    const fuzz = new FuzzBuzz();
    console.log("fuzz random seed is", fuzz.seed);

    fuzz.add(5, async function () {
        const randomAddon = activeAddons[Math.floor(Math.random() * activeAddons.length)];
        const info = await client.sendOne(`${randomAddon}.status`);
        strictEqual(info.name, randomAddon);
        strictEqual(typeof info.version, "string");
        strictEqual(info.started, true);

        await sleep(10);
    });

    fuzz.add(1, async function () {
        const globalInfo = await client.sendOne("gate.global_info");
        strictEqual(typeof globalInfo.root, "string");
        strictEqual(globalInfo.silent, true);
        strictEqual(typeof globalInfo.coreVersion, "string");

        await sleep(10);
    });

    await fuzz.run(nbOperations);
    client.close();
}

avaTest.before("Clone SlimIO Agent", async(assert) => {
    assert.plan(1);

    try {
        await installer.initAgent(join(__dirname, ".."), {
            name: "agent"
        });

        cp = await installer.runAgent(agentDir, true);
        assert.true(cp !== null);
    }
    catch (err) {
        await premove(agentDir);
    }
});

avaTest.after("Cleanup Agent", async(assert) => {
    treekill(cp.pid);

    await sleep(100);
    await premove(agentDir);
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

avaTest("connect/deconnect", async(assert) => {
    const client = new TcpClient();
    assert.true(client.client.connecting);
    await client.once("connect", 1000);
    assert.false(client.client.connecting);

    assert.true(client.close());
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.false(client.close());
    assert.true(client.client.destroyed);

    await assert.throwsAsync(client.connect("1337"), { instanceOf: TypeError, message: "timeOut must be a number" });
    const ret = await client.connect();
    assert.true(ret);
    assert.false(client.client.connecting);
    assert.false(client.client.destroyed);
    assert.false(await client.connect());

    client.close();
});

avaTest("pull information from gate", async(assert) => {
    const client = new TcpClient();
    const add1 = await client.getActiveAddons();
    assert.deepEqual(add1, []);
    await client.once("connect", 1000);

    const info = await client.sendOne("gate.global_info");
    assert.deepEqual(Object.keys(info).sort(), ["root", "silent", "coreVersion", "versions"].sort());
    assert.is(info.root, agentDir);
    assert.is(info.silent, true);
    assert.true(typeof info.coreVersion === "string");

    const compareList = [...installer.CONSTANTS.BUILT_IN_ADDONS].map((name) => name.toLowerCase());
    compareList.sort();

    const addons = await client.sendOne("gate.list_addons");
    addons.sort();
    assert.deepEqual(addons, compareList);

    const add2 = await client.getActiveAddons();
    add2.sort();
    assert.deepEqual(add2, compareList);

    client.close();
});

avaTest("run fuzz tests", async(assert) => {
    await runFuzz();
    assert.pass();
});
