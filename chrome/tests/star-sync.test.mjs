// Run with: node chrome/tests/star-sync.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
const source = await readFile(new URL("../star-sync.js", import.meta.url), "utf8");
const parser = await readFile(new URL("../conference-parser.js", import.meta.url), "utf8");
const copy = (value) => JSON.parse(JSON.stringify(value));
const catalog = `- title: CVPR
  sub: AI
  rank:
    ccf: A
  confs:
  - year: 2098
    id: cvpr98
    timeline:
    - deadline: '2098-01-01 23:59:59'
    timezone: UTC+8
  - year: 2099
    id: cvpr99
    link: https://example.com/
    timeline:
    - abstract_deadline: '2099-11-01 23:59:59'
      deadline: '2099-11-08 23:59:59'
      comment: Main round
    timezone: UTC-12
    place: Example city
  conference_key: AI/cvpr
- title: ACL
  confs:
  - year: 2099
    id: acl99
    timeline:
    - deadline: TBD
    timezone: UTC+0
`;
function harness(data = {}) {
  const stored = { deadlines: [], starSync: { enabled: true }, ...copy(data) };
  const remote = { user: { login: "alice" }, starred: ["cvpr99", "acl99"] };
  const calls = [];
  const state = { stored, remote, calls, tabs: true, fail: false, catalog, hold: null, navigation: [] };
  const context = vm.createContext({ URL, Date, setTimeout, clearTimeout, console,
    chrome: {
      storage: { local: {
        get: async (defaults) => copy({ ...defaults, ...stored }),
        set: async (value) => Object.assign(stored, copy(value)),
      } },
      tabs: {
        query: async () => state.tabs ? [{ id: 1, url: "https://ccfddl.com/" }] : [],
        update: async (id, options) => { state.navigation.push({ action: "update", id, options }); },
        create: async (options) => { state.navigation.push({ action: "create", options }); },
        sendMessage: async (_, message) => {
          calls.push(copy(message));
          if (state.hold) { const hold = state.hold; state.hold = null; await hold; }
          if (state.fail) throw new Error("network");
          if (message.action === "bootstrap") return { ok: true, data: copy(remote) };
          if (message.action === "catalog") return { ok: true, data: state.catalog };
          if (message.action === "star") {
            assert.equal(message.account, remote.user.login);
            const starred = new Set(remote.starred);
            if (message.starred) starred.add(message.id); else starred.delete(message.id);
            remote.starred = [...starred];
            return { ok: true, data: { starred: message.starred } };
          }
        },
      },
      runtime: { onMessage: { addListener(fn) { state.listener = fn; } }, id: "test", getURL: (p) => `chrome-extension://test/${p}` },
      alarms: { get: async () => ({}), create: async () => {}, clear: async () => {}, onAlarm: { addListener() {} } },
    },
  });
  vm.runInContext(parser, context);
  vm.runInContext(source, context);
  const api = context.CcfddlStarSync;
  return { ...state, state, context, api, settle: () => api.requestSync() };
}
const h = harness();
const parsed = copy(h.context.CcfddlConferenceParser.parseAllConfYaml(catalog));
assert.equal(parsed[0].datetime, "2098-01-01T15:59:59.000Z");
assert.equal(parsed[1].datetime, "2099-11-02T11:59:59.000Z");
assert.equal(parsed[2].title, "CVPR 2099 (Main round)");
assert.equal(parsed[1].place, "Example city");
assert.equal(parsed[1].conferenceId, "cvpr99");
await h.api.requestSync();
assert.equal(h.stored.deadlines.length, 2);
assert.equal(h.stored.starSync.unavailable, 1);
assert.equal(h.stored.starSync.account, "alice");
await h.api.requestSync();
assert.equal(h.stored.deadlines.length, 2, "repeat pulls do not duplicate rounds");
await h.api.handle({ action: "remove", item: h.stored.deadlines[0] });
await h.settle();
assert.equal(h.stored.deadlines.length, 1, "a removed individual stage is not reimported");
assert.ok(h.remote.starred.includes("cvpr99"), "removing one stage retains edition star");
await h.api.handle({ action: "remove", item: h.stored.deadlines[0] });
await h.settle();
assert.ok(!h.remote.starred.includes("cvpr99"), "removing final stage unstars edition");
h.remote.starred.push("cvpr99");
await h.settle();
assert.equal(h.stored.deadlines.length, 2, "re-starring an edition restores its stages");
const manual = { title: "My private deadline", datetime: "2099-01-01T00:00:00Z" };
const first = harness({ deadlines: [manual, parsed[0]] });
await first.settle();
assert.ok(first.remote.starred.includes("cvpr98"), "first sync merges local stars");
assert.ok(first.stored.deadlines.some((item) => item.title === manual.title));
first.remote.starred = [];
await first.settle();
assert.deepEqual(first.stored.deadlines, [manual], "remote deletions preserve manual entries");
first.state.tabs = false;
await first.api.handle({ action: "add", item: parsed[1] });
await first.settle();
assert.equal(first.stored.starSync.pending.cvpr99, true);
assert.equal(first.stored.starSync.status, "open_website");
const restarted = harness(first.stored);
await restarted.settle();
assert.deepEqual(restarted.stored.starSync.pending, {}, "persisted intents survive worker restart");
restarted.remote.user.login = "bob";
const beforeSwitch = copy(restarted.stored.deadlines);
restarted.calls.length = 0;
await restarted.settle();
assert.equal(restarted.stored.starSync.status, "account_changed");
assert.deepEqual(restarted.stored.deadlines, beforeSwitch);
assert.ok(!restarted.calls.some((call) => call.action === "star"));
restarted.remote.user = null;
await restarted.settle();
assert.equal(restarted.stored.starSync.status, "sign_in");
const broken = harness({ deadlines: [manual] });
broken.state.catalog = "garbage";
await broken.settle();
assert.equal(broken.stored.starSync.status, "invalid_catalog");
assert.deepEqual(broken.stored.deadlines, [manual]);
const offline = harness();
offline.state.fail = true;
await offline.api.handle({ action: "add", item: parsed[1] });
await offline.settle();
assert.equal(offline.stored.starSync.pending.cvpr99, true);
assert.equal(offline.stored.deadlines.length, 1);
const disabled = harness({ starSync: { enabled: false } });
await disabled.settle();
assert.equal(disabled.calls.length, 0, "sync is opt-in");
const concurrent = harness();
let release;
concurrent.state.hold = new Promise((resolve) => { release = resolve; });
const syncing = concurrent.api.requestSync();
await new Promise((resolve) => setImmediate(resolve));
assert.ok(concurrent.calls.length > 0, "network request is in flight");
const adding = concurrent.api.handle({ action: "add", item: manual });
await adding;
assert.ok(concurrent.stored.deadlines.some((item) => item.title === manual.title), "local writes complete while the network is stalled");
release();
await syncing;
await concurrent.settle();
assert.ok(concurrent.stored.deadlines.some((item) => item.title === manual.title), "network sync cannot overwrite a concurrent local addition");
const disconnecting = harness();
let releaseDisconnect;
disconnecting.state.hold = new Promise((resolve) => { releaseDisconnect = resolve; });
const inFlight = disconnecting.api.requestSync();
await new Promise((resolve) => setImmediate(resolve));
await disconnecting.api.handle({ action: "disconnect" });
releaseDisconnect();
await inFlight;
assert.equal(disconnecting.stored.starSync.enabled, false, "late network responses cannot reconnect a disconnected account");
assert.deepEqual(disconnecting.stored.deadlines, []);
let replied = false;
concurrent.state.listener({ type: "ccfddl-sync", action: "disconnect" }, { id: "test", tab: { id: 1 }, url: "https://ccfddl.com/" }, () => { replied = true; });
assert.equal(replied, false, "website senders cannot mutate extension state");
const batch = harness({ starSync: { enabled: false }, deadlines: [manual] });
await batch.api.handle({ action: "addMany", items: parsed });
await batch.settle();
assert.equal(batch.stored.deadlines.length, parsed.length + 1);
await batch.api.handle({ action: "addMany", items: parsed });
await batch.settle();
assert.equal(batch.stored.deadlines.length, parsed.length + 1, "reimporting a group is idempotent");
const beforeInvalidBatch = copy(batch.stored.deadlines);
await assert.rejects(batch.api.handle({ action: "addMany", items: [parsed[0], { title: "Invalid" }] }));
assert.deepEqual(batch.stored.deadlines, beforeInvalidBatch, "invalid group imports are atomic");
await batch.api.handle({ action: "removeConference", conferenceId: "cvpr99" });
assert.ok(batch.stored.deadlines.some((item) => item.conferenceId === "cvpr98"), "other editions survive group removal");
assert.ok(batch.stored.deadlines.some((item) => item.title === manual.title));
assert.ok(!batch.stored.deadlines.some((item) => item.conferenceId === "cvpr99"));
const groupedSync = harness();
await groupedSync.settle();
await groupedSync.api.handle({ action: "removeConference", conferenceId: "cvpr99" });
await groupedSync.settle();
assert.ok(!groupedSync.remote.starred.includes("cvpr99"), "group removal unstars its edition");
assert.ok(groupedSync.remote.starred.includes("acl99"), "unrelated website stars survive");
const signedIn = harness({ starSync: { enabled: false } });
await signedIn.api.handle({ action: "connect" });
assert.equal(signedIn.stored.starSync.account, "alice");
assert.deepEqual(signedIn.state.navigation, [], "signed-in tabs connect without navigating away from the popup");
const noSite = harness({ starSync: { enabled: false } });
noSite.state.tabs = false;
await noSite.api.handle({ action: "connect" });
await noSite.settle();
assert.equal(noSite.state.navigation[0].action, "create", "first connection opens the website if needed");
const signedOut = harness({ starSync: { enabled: false } });
signedOut.remote.user = null;
await signedOut.api.handle({ action: "connect" });
await signedOut.settle();
assert.equal(signedOut.state.navigation[0].action, "update", "expired sessions open the website for sign-in");
assert.equal(signedOut.stored.starSync.status, "sign_in");
console.log("Star sync: parser, merge, deletion, offline retry, restart, account guard, invalid catalog, opt-in, concurrency and sender checks passed");
