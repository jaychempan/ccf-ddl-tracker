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
  const state = { stored, remote, calls, tabs: true, fail: false, catalog, hold: null, navigation: [], fetches: [], alarms: [] };
  const context = vm.createContext({ URL, Date, AbortController, setTimeout, clearTimeout, console,
    fetch: async (url, options) => {
      state.fetches.push({ url, options });
      if (state.fetchHold) await state.fetchHold;
      if (state.fail) throw new Error("offline");
      return { ok: state.httpOk !== false, text: async () => state.catalog };
    },
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
      alarms: { get: async () => null, create: async (name, options) => { state.alarms.push({ name, options }); }, clear: async () => {}, onAlarm: { addListener(fn) { state.onAlarm = fn; } } },
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

// Public deadline refresh works without website tabs, login or star opt-in.
const publicSync = harness({ starSync: { enabled: false }, deadlines: [parsed[1], parsed[2], manual] });
publicSync.state.tabs = false;
publicSync.state.catalog = catalog.replace("2099-11-08 23:59:59", "2099-11-21 23:59:59").replace("timezone: UTC-12", "timezone: UTC+8");
const refreshed = await publicSync.api.handle({ action: "refreshDeadlines" });
assert.equal(refreshed.updated, 2);
assert.equal(publicSync.stored.deadlines[1].datetime, "2099-11-21T15:59:59.000Z");
assert.deepEqual(publicSync.stored.deadlines[2], manual);
assert.equal(publicSync.calls.length, 0, "public refresh never invokes the signed-in website bridge");
assert.equal(publicSync.state.fetches[0].options.cache, "no-store");
assert.equal(publicSync.state.fetches[0].options.credentials, "omit");
assert.ok(publicSync.state.alarms.some(({ name, options }) => name === "ccfddl-deadline-sync" && options.periodInMinutes === 360));
assert.equal((await publicSync.api.handle({ action: "refreshDeadlines" })).updated, 0, "repeat refresh is idempotent");
assert.equal(publicSync.stored.deadlines.length, 3);
const savedPublic = copy(publicSync.stored.deadlines);
for (const failure of ["offline", "invalid", "http"]) {
  publicSync.state.fail = failure === "offline";
  publicSync.state.httpOk = failure !== "http";
  publicSync.state.catalog = "not a conference catalog";
  await assert.rejects(publicSync.api.handle({ action: "refreshDeadlines" }));
  assert.deepEqual(publicSync.stored.deadlines, savedPublic, `${failure} retains saved dates`);
}

const reconcile = (items, entries = parsed) => copy(h.context.CcfddlConferenceParser.reconcileConferenceDeadlines(items, entries));
const legacy = { title: parsed[2].title, url: parsed[2].url, datetime: "2099-10-01T00:00:00Z" };
assert.equal(reconcile([legacy]).deadlines[0].datetime, parsed[2].datetime, "legacy matching does not depend on the stale date");
assert.equal(reconcile([legacy]).deadlines[0].conferenceDeadlineId, parsed[2].conferenceDeadlineId);
const oldIcs = { ...legacy, title: "CVPR (Main round)" };
assert.equal(reconcile([oldIcs]).deadlines[0].conferenceId, "cvpr99", "unique yearless ICS import is linked");
assert.equal(reconcile([{ ...legacy, title: "CVPR (abstract)" }]).deadlines[0].conferenceDeadlineId, parsed[1].conferenceDeadlineId, "old abstract titles without round labels are linked only to a unique stage");
assert.equal(reconcile([{ ...legacy, title: "CVPR" }]).deadlines[0].conferenceDeadlineId, parsed[2].conferenceDeadlineId, "old bare titles are linked to a unique submission stage");
const duplicateEdition = { ...parsed[2], title: "CVPR 2100 (Main round)", conferenceId: "cvpr00", conferenceDeadlineId: "cvpr00:0:deadline" };
assert.deepEqual(reconcile([oldIcs], [...parsed, duplicateEdition]).deadlines[0], oldIcs, "reused URLs cannot choose a different edition");
assert.deepEqual(reconcile([{ ...legacy, source: "manual" }]).deadlines[0], { ...legacy, source: "manual" });
assert.deepEqual(reconcile([{ ...legacy, url: "" }]).deadlines[0], { ...legacy, url: "" }, "title alone cannot identify a legacy import");
assert.deepEqual(reconcile([parsed[2]], [parsed[0]]).deadlines[0], parsed[2], "missing or TBD stages are retained");
assert.deepEqual(reconcile([parsed[2]], [parsed[2], parsed[2]]).deadlines[0], parsed[2], "ambiguous IDs are retained");
assert.equal(reconcile([parsed[2]], [{ ...parsed[2], datetime: "2000-01-01T00:00:00Z" }]).deadlines[0].datetime, "2000-01-01T00:00:00Z", "an advanced deadline is updated even if already past");

const publicRace = harness({ starSync: { enabled: false }, deadlines: [parsed[1], parsed[2]] });
let releasePublic;
publicRace.state.fetchHold = new Promise((resolve) => { releasePublic = resolve; });
const firstRefresh = publicRace.api.handle({ action: "refreshDeadlines" });
const secondRefresh = publicRace.api.handle({ action: "refreshDeadlines" });
await new Promise((resolve) => setImmediate(resolve));
await publicRace.api.handle({ action: "remove", item: parsed[1] });
await publicRace.api.handle({ action: "add", item: manual });
releasePublic();
await Promise.all([firstRefresh, secondRefresh]);
assert.equal(publicRace.state.fetches.length, 1, "concurrent refreshes share a request");
assert.deepEqual(publicRace.stored.deadlines, [parsed[2], manual], "late catalog cannot restore deleted stages or lose new cards");

const reimport = harness({ starSync: { enabled: false }, deadlines: [{ ...parsed[2], datetime: "2099-10-01T00:00:00Z" }] });
await reimport.api.handle({ action: "addMany", items: [parsed[2]] });
assert.equal(reimport.stored.deadlines.length, 1);
assert.equal(reimport.stored.deadlines[0].datetime, parsed[2].datetime, "reimport updates an existing card's old deadline");
const migratingStars = harness({ starSync: { enabled: true, account: "alice" }, deadlines: [legacy] });
migratingStars.remote.starred = [];
await migratingStars.api.handle({ action: "refreshDeadlines" });
assert.equal(migratingStars.stored.starSync.pending.cvpr99, true, "legacy linking preserves local selection for star sync");
await migratingStars.settle();
assert.ok(migratingStars.remote.starred.includes("cvpr99"));
assert.ok(migratingStars.stored.deadlines.some((item) => item.conferenceDeadlineId === parsed[2].conferenceDeadlineId), "subsequent star sync cannot delete the migrated card");
const scheduled = harness({ starSync: { enabled: false }, deadlines: [{ ...parsed[2], datetime: "2099-10-01T00:00:00Z" }] });
scheduled.state.onAlarm({ name: "ccfddl-deadline-sync" });
await new Promise((resolve) => setImmediate(resolve));
assert.equal(scheduled.stored.deadlines[0].datetime, parsed[2].datetime, "background alarm refreshes without a popup or website tab");
console.log("Public deadline sync: rescheduling, timezone, legacy migration, manual isolation, offline retention, alarm and concurrent mutations passed");
