// Run with: node chrome/tests/background.test.mjs
// Exercise scheduling and asynchronous Chrome API ordering without reading a
// browser profile or relying on Chrome's real-time alarm delivery.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../background.js", import.meta.url), "utf8");
const DAY = 24 * 60 * 60 * 1000;
const RETRY = 5 * 60 * 1000;
const NOW = Date.parse("2030-01-01T00:00:00.000Z");
const deadline = (timestamp) => ({ title: "Example", datetime: new Date(timestamp).toISOString() });
const copy = (value) => JSON.parse(JSON.stringify(value));

function createHarness({ deadlines = [], alarm = { when: NOW + DAY }, manualReads = false, manualAlarmGet = false } = {}) {
  const state = {
    now: NOW, deadlines, alarm: alarm && { name: "badge-refresh", ...alarm },
    badgeText: "previous", reads: [], alarmGets: [], operations: [], held: [],
    errors: [], holdNext: null, failNext: null, lastError: null, timers: new Map(),
  };
  let nextTimer = 1;
  const listeners = {};
  const event = (name) => ({ addListener: (callback) => { listeners[name] = callback; } });
  const operation = (name, value, apply) => {
    state.operations.push({ name, value: copy(value) });
    if (state.failNext === name) {
      state.failNext = null;
      return Promise.reject(new Error(`${name} API failed`));
    }
    if (state.holdNext === name) {
      state.holdNext = null;
      return new Promise((resolve, reject) => {
        state.held.push((error) => {
          if (error) reject(error);
          else { const result = apply(); resolve(result); }
        });
      });
    }
    return Promise.resolve(apply());
  };
  const respondRead = (index, value, error = null) => {
    state.lastError = error;
    state.reads[index].callback(error ? undefined : { deadlines: value });
    state.lastError = null;
  };
  class ClockDate extends Date { static now() { return state.now; } }
  const context = vm.createContext({
    Date: ClockDate,
    // Icon rendering is separate from the badge scheduling exercised here.
    OffscreenCanvas: class { getContext() { return null; } },
    setTimeout: (callback, delay) => {
      const id = nextTimer++;
      state.timers.set(id, { callback, delay });
      return id;
    },
    clearTimeout: (id) => state.timers.delete(id),
    console: { error: (...args) => state.errors.push(args) },
    chrome: {
      runtime: {
        onInstalled: event("installed"), onStartup: event("startup"),
        get lastError() { return state.lastError; },
      },
      action: {
        setBadgeText: (value) => operation("badge", value, () => { state.badgeText = value.text; }),
        setBadgeBackgroundColor: (value) => operation("color", value, () => {}),
      },
      alarms: {
        onAlarm: event("alarm"),
        get: (name) => {
          if (manualAlarmGet) return new Promise((resolve, reject) => state.alarmGets.push({ name, resolve, reject }));
          state.alarmGets.push({ name });
          return Promise.resolve(state.alarm && { ...state.alarm });
        },
        clear: (name) => operation("clear", { name }, () => {
          const existed = !!state.alarm;
          state.alarm = null;
          return existed;
        }),
        create: (name, options) => operation("create", { name, options }, () => {
          state.alarm = { name, ...options };
        }),
      },
      storage: {
        onChanged: event("storage"),
        local: {
          get: (defaults, callback) => {
            const index = state.reads.push({ defaults, callback }) - 1;
            const snapshot = state.deadlines;
            if (!manualReads) queueMicrotask(() => respondRead(index, snapshot));
          },
        },
      },
    },
  });
  vm.runInContext(source, context, { filename: "background.js" });
  const settle = async () => { for (let i = 0; i < 32; i += 1) await Promise.resolve(); };
  return {
    state, settle, respondRead,
    async runTimeouts(delay) {
      for (const [id, timer] of [...state.timers]) {
        if (timer.delay !== delay) continue;
        state.timers.delete(id);
        timer.callback();
      }
      await settle();
    },
    fire: (name, ...args) => listeners[name](...args),
    change: (value) => {
      state.deadlines = value;
      return listeners.storage({ deadlines: { newValue: value } }, "local");
    },
    plan: (value, now = state.now) => {
      context.fixtureDeadlines = value;
      context.fixtureNow = now;
      return copy(vm.runInContext("getBadgeState(fixtureDeadlines, fixtureNow)", context));
    },
    operations: (name) => state.operations.filter((item) => item.name === name),
  };
}

const results = [];
async function check(name, callback) { await callback(); results.push(name); }

await check("floor-day boundaries change one millisecond after the exact boundary", async () => {
  const h = createHarness();
  const exact = [deadline(NOW + DAY)];
  assert.deepEqual(h.plan(exact), { text: "1", nextRefreshAt: NOW + 1 });
  assert.deepEqual(h.plan(exact, NOW + 1), { text: "0", nextRefreshAt: NOW + DAY + 1 });
  const fractional = [deadline(NOW + 2.5 * DAY)];
  assert.deepEqual(h.plan(fractional), { text: "2", nextRefreshAt: NOW + 0.5 * DAY + 1 });
  assert.equal(h.plan(fractional, NOW + 0.5 * DAY).text, "2");
  assert.equal(h.plan(fractional, NOW + 0.5 * DAY + 1).text, "1");
});

await check("deadline equality displays zero until expiration and then selects the next deadline", async () => {
  const h = createHarness();
  const entries = [deadline(NOW), deadline(NOW + 2 * DAY)];
  assert.deepEqual(h.plan(entries), { text: "0", nextRefreshAt: NOW + 1 });
  assert.deepEqual(h.plan(entries, NOW + 1), { text: "1", nextRefreshAt: NOW + DAY + 1 });
  assert.deepEqual(h.plan([deadline(NOW - 1)]), { text: "", nextRefreshAt: null });
});

await check("malformed records are ignored while valid unsorted future deadlines remain usable", async () => {
  const h = createHarness();
  const entries = [null, [], "bad", 5, {}, { datetime: null }, { datetime: true },
    { datetime: Infinity }, { datetime: "invalid" }, deadline(NOW - DAY),
    deadline(NOW + 8 * DAY), deadline(NOW + 1.5 * DAY)];
  assert.deepEqual(h.plan(entries), { text: "1", nextRefreshAt: NOW + 0.5 * DAY + 1 });
  for (const invalid of [undefined, null, "bad", {}, 8]) {
    assert.deepEqual(h.plan(invalid), { text: "", nextRefreshAt: null });
  }
  assert.equal(h.plan([{ datetime: NOW + DAY }]).text, "1");
});

await check("install migrates the recurring alarm and initializes once with stored deadlines", async () => {
  const h = createHarness({ deadlines: [deadline(NOW + 2.5 * DAY)], alarm: { periodInMinutes: 1 } });
  await h.fire("installed");
  await h.settle();
  assert.equal(h.state.reads.length, 1);
  assert.equal(h.state.badgeText, "2");
  assert.equal(h.operations("clear").length, 1);
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + 0.5 * DAY + 1 });
  assert.equal(h.operations("color")[0].value.color, "#334155");
});

await check("browser startup clears the previous alarm and badge when no deadlines remain", async () => {
  const h = createHarness({ deadlines: [], alarm: { periodInMinutes: 1 } });
  await h.fire("startup");
  await h.settle();
  assert.equal(h.state.reads.length, 1);
  assert.equal(h.state.badgeText, "");
  assert.equal(h.state.alarm, null);
  assert.equal(h.operations("create").length, 0);
});

await check("a worker with a saved one-shot alarm performs no storage reads or toolbar writes", async () => {
  const h = createHarness({ deadlines: [deadline(NOW + DAY)] });
  await h.settle();
  assert.equal(h.state.alarmGets.length, 1);
  assert.equal(h.state.reads.length, 0);
  assert.equal(h.state.operations.length, 0);
});

await check("a worker recovers a missing alarm without a startup or install event", async () => {
  const h = createHarness({ deadlines: [deadline(NOW + 1.5 * DAY)], alarm: null });
  await h.settle();
  assert.equal(h.state.reads.length, 1);
  assert.equal(h.state.badgeText, "1");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + 0.5 * DAY + 1 });
});

await check("a worker migrates a legacy periodic alarm even after an unpacked reload", async () => {
  const h = createHarness({ deadlines: [deadline(NOW + 3.5 * DAY)], alarm: { periodInMinutes: 1 } });
  await h.settle();
  assert.equal(h.state.reads.length, 1);
  assert.equal(h.state.badgeText, "3");
  assert.equal(h.operations("clear").length, 1);
  assert.equal(h.state.alarm.periodInMinutes, undefined);
});

await check("alarm wake performs one read and schedules from actual delivery time", async () => {
  const entries = [deadline(NOW + 0.25 * DAY), deadline(NOW + 2.5 * DAY)];
  const h = createHarness({ deadlines: entries, alarm: null });
  h.state.now = NOW + 2 * DAY;
  await h.fire("alarm", { name: "badge-refresh" });
  await h.settle();
  assert.equal(h.state.reads.length, 1);
  assert.equal(h.state.badgeText, "0");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + 2.5 * DAY + 1 });
  assert.equal(h.fire("alarm", { name: "unrelated" }), undefined);
  assert.equal(h.state.reads.length, 1);
});

await check("storage changes update directly and deletion cancels scheduling without reading storage", async () => {
  const h = createHarness();
  await h.settle();
  h.fire("storage", { deadlines: { newValue: [] } }, "sync");
  h.fire("storage", { language: { newValue: "en" } }, "local");
  await h.settle();
  assert.equal(h.state.operations.length, 0);
  await h.change([deadline(NOW + 4.5 * DAY)]);
  assert.equal(h.state.badgeText, "4");
  await h.change(undefined);
  assert.equal(h.state.badgeText, "");
  assert.equal(h.state.alarm, null);
  assert.equal(h.state.reads.length, 0);
});

await check("storage API errors preserve the badge, schedule a retry, and allow recovery", async () => {
  const h = createHarness({ manualReads: true });
  await h.settle();
  const failed = h.fire("startup");
  h.respondRead(0, undefined, { message: "Storage unavailable" });
  await failed;
  assert.equal(h.state.badgeText, "previous");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + RETRY });
  assert.equal(h.state.errors.length, 1);
  const retry = h.fire("startup");
  h.respondRead(1, [deadline(NOW + 1.5 * DAY)]);
  await retry;
  assert.equal(h.state.badgeText, "1");
});

await check("a stale startup read cannot overwrite a newer storage-event badge or schedule", async () => {
  const h = createHarness({ manualReads: true });
  await h.settle();
  const stale = h.fire("startup");
  await h.change([deadline(NOW + 3.5 * DAY)]);
  const latestAlarm = { ...h.state.alarm };
  h.respondRead(0, [deadline(NOW + 1.5 * DAY)]);
  await stale;
  assert.equal(h.state.badgeText, "3");
  assert.deepEqual(h.state.alarm, latestAlarm);
  assert.equal(h.operations("badge").length, 1);
});

await check("an alarm read following a storage change does not reuse the older pending snapshot", async () => {
  const h = createHarness({ manualReads: true });
  await h.settle();
  const first = h.fire("startup");
  const fresh = [deadline(NOW + 4.5 * DAY)];
  const change = h.change(fresh);
  const alarm = h.fire("alarm", { name: "badge-refresh" });
  assert.equal(h.state.reads.length, 2);
  h.respondRead(0, [deadline(NOW + 1.5 * DAY)]);
  h.respondRead(1, fresh);
  await Promise.all([first, change, alarm]);
  assert.equal(h.state.badgeText, "4");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + 0.5 * DAY + 1 });
});

await check("a delayed old badge API completion is serialized before the latest update", async () => {
  const h = createHarness();
  await h.settle();
  h.state.holdNext = "badge";
  const first = h.change([deadline(NOW + 1.5 * DAY)]);
  await h.settle();
  const second = h.change([deadline(NOW + 3.5 * DAY)]);
  await h.settle();
  assert.equal(h.state.held.length, 1);
  assert.equal(h.operations("badge").length, 1);
  h.state.held.shift()();
  await Promise.all([first, second]);
  assert.equal(h.state.badgeText, "3");
  assert.deepEqual(h.operations("badge").map(item => item.value.text), ["1", "3"]);
  assert.equal(h.operations("create").length, 1);
});

await check("a delayed old alarm creation cannot finish after the latest schedule", async () => {
  const h = createHarness();
  await h.settle();
  h.state.holdNext = "create";
  const first = h.change([deadline(NOW + 1.5 * DAY)]);
  await h.settle();
  const second = h.change([deadline(NOW + 3.25 * DAY)]);
  await h.settle();
  assert.equal(h.state.held.length, 1);
  h.state.held.shift()();
  await Promise.all([first, second]);
  assert.equal(h.state.badgeText, "3");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + 0.25 * DAY + 1 });
});

await check("late worker-start alarm inspection cannot overwrite an event's newer state", async () => {
  const h = createHarness({ alarm: null, manualAlarmGet: true });
  await h.change([deadline(NOW + 2.5 * DAY)]);
  h.state.alarmGets[0].resolve(null);
  await h.settle();
  assert.equal(h.state.reads.length, 0);
  assert.equal(h.state.badgeText, "2");
  assert.equal(h.operations("create").length, 1);
});

await check("worker recovery and its wake event share an already pending storage read", async () => {
  const h = createHarness({ alarm: null, manualReads: true });
  await h.settle();
  assert.equal(h.state.reads.length, 1);
  const alarm = h.fire("alarm", { name: "badge-refresh" });
  assert.equal(h.state.reads.length, 1);
  h.respondRead(0, [deadline(NOW + 2.5 * DAY)]);
  await alarm;
  await h.settle();
  assert.equal(h.state.badgeText, "2");
  assert.equal(h.operations("create").length, 1);
});

await check("failure after a consumed alarm schedules one retry and a healthy empty result stops it", async () => {
  const h = createHarness({ manualReads: true });
  await h.settle();
  h.state.alarm = null;
  const failed = h.fire("alarm", { name: "badge-refresh" });
  h.respondRead(0, undefined, { message: "Temporary storage failure" });
  await failed;
  assert.equal(h.state.badgeText, "previous");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + RETRY });
  h.state.now = NOW + RETRY;
  h.state.alarm = null;
  const retry = h.fire("alarm", { name: "badge-refresh" });
  h.respondRead(1, []);
  await retry;
  assert.equal(h.state.badgeText, "");
  assert.equal(h.state.alarm, null);
});

await check("a hung storage read times out, ignores its late callback, and retries successfully", async () => {
  const h = createHarness({ manualReads: true });
  await h.settle();
  h.state.alarm = null;
  const hung = h.fire("alarm", { name: "badge-refresh" });
  h.state.now = NOW + 3000;
  await h.runTimeouts(3000);
  await hung;
  const retryWhen = h.state.now + RETRY;
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: retryWhen });
  assert.equal(h.state.errors.length, 1);
  h.respondRead(0, [deadline(NOW + 7 * DAY)], { message: "Late error" });
  await h.settle();
  assert.equal(h.state.badgeText, "previous");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: retryWhen });
  assert.equal(h.state.errors.length, 1);
  h.state.now = retryWhen;
  h.state.alarm = null;
  const retry = h.fire("alarm", { name: "badge-refresh" });
  h.respondRead(1, [deadline(NOW + 2.5 * DAY)]);
  await retry;
  assert.equal(h.state.badgeText, "2");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + 0.5 * DAY + 1 });
});

await check("an older storage error cannot replace a newer healthy schedule with a retry", async () => {
  const h = createHarness({ manualReads: true });
  await h.settle();
  const old = h.fire("startup");
  await h.change([deadline(NOW + 3.5 * DAY)]);
  const latest = { ...h.state.alarm };
  h.respondRead(0, undefined, { message: "Old read failed" });
  await old;
  assert.equal(h.state.badgeText, "3");
  assert.deepEqual(h.state.alarm, latest);
  assert.equal(h.operations("create").length, 1);
  assert.equal(h.state.errors.length, 0);
});

await check("an older storage timeout cannot replace a newer healthy schedule", async () => {
  const h = createHarness({ manualReads: true });
  await h.settle();
  const old = h.fire("startup");
  await h.change([deadline(NOW + 3.5 * DAY)]);
  const latest = { ...h.state.alarm };
  h.state.now = NOW + 3000;
  await h.runTimeouts(3000);
  await old;
  assert.equal(h.state.badgeText, "3");
  assert.deepEqual(h.state.alarm, latest);
  assert.equal(h.operations("create").length, 1);
  assert.equal(h.state.errors.length, 0);
});

await check("current badge and alarm API failures leave a retry wake-up", async () => {
  for (const api of ["badge", "color", "clear", "create"]) {
    const h = createHarness();
    await h.settle();
    h.state.failNext = api;
    await h.change([deadline(NOW + 2.5 * DAY)]);
    assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + RETRY });
    assert.equal(h.state.errors.length, 1);
    h.state.now = NOW + RETRY;
    h.state.alarm = null;
    await h.fire("alarm", { name: "badge-refresh" });
    assert.equal(h.state.badgeText, "2");
    assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + 0.5 * DAY + 1 });
  }
});

await check("an old rejected API completion cannot add a retry over a newer update", async () => {
  const h = createHarness();
  await h.settle();
  h.state.holdNext = "badge";
  const old = h.change([deadline(NOW + 1.5 * DAY)]);
  await h.settle();
  const fresh = h.change([deadline(NOW + 3.5 * DAY)]);
  h.state.held.shift()(new Error("Old API call failed"));
  await Promise.all([old, fresh]);
  assert.equal(h.state.badgeText, "3");
  assert.deepEqual(h.state.alarm, { name: "badge-refresh", when: NOW + 0.5 * DAY + 1 });
  assert.equal(h.operations("create").length, 1);
  assert.equal(h.state.errors.length, 0);
});

await check("worker recovery inspection errors retry, while stale inspection errors are discarded", async () => {
  const failed = createHarness({ manualAlarmGet: true });
  failed.state.alarmGets[0].reject(new Error("Cannot read alarm"));
  await failed.settle();
  assert.deepEqual(failed.state.alarm, { name: "badge-refresh", when: NOW + RETRY });
  const stale = createHarness({ manualAlarmGet: true });
  await stale.change([deadline(NOW + 4.5 * DAY)]);
  stale.state.alarmGets[0].reject(new Error("Old alarm inspection failed"));
  await stale.settle();
  assert.equal(stale.state.badgeText, "4");
  assert.deepEqual(stale.state.alarm, { name: "badge-refresh", when: NOW + 0.5 * DAY + 1 });
  assert.equal(stale.operations("create").length, 1);
  assert.equal(stale.state.errors.length, 0);
});

console.log({ passed: results.length, result: "Badge boundaries, alarm recovery, retry timeouts, migration and concurrent updates passed" });
