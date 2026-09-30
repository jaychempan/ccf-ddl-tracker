// Run with: node chrome/tests/popup.test.mjs
// No browser or third-party dependencies. These tests exercise the real popup
// script with a small DOM/storage harness; they do not benchmark Chrome's UI.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../popup.js", import.meta.url), "utf8");

class Element {
  constructor(tagName = "div") {
    this.tagName = tagName;
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.listeners = new Map();
    this.value = "";
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
    this.classList = { add() {}, remove() {}, toggle() {} };
  }
  set innerHTML(value) { this.children = []; }
  get innerHTML() { return ""; }
  get options() {
    return this.children.flatMap((child) => child.tagName === "optgroup" ? child.children : [child]);
  }
  append(...children) { this.children.push(...children); }
  appendChild(child) { this.append(child); return child; }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key] ?? null; }
  addEventListener(name, listener) {
    const listeners = this.listeners.get(name) || [];
    listeners.push(listener);
    this.listeners.set(name, listeners);
  }
  querySelector(selector) {
    const value = selector.match(/option\[value="([^"]+)"\]/)?.[1];
    return this.options.find((option) => option.value === value) || null;
  }
  querySelectorAll() { return []; }
  focus() {}
  contains(child) { return child === this || this.children.some((entry) => entry.contains(child)); }
}

export function createPopupHarness(script = source, data = {}) {
  const elements = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, new Element(id === "timezone-select" ? "select" : "div"));
    return elements.get(id);
  };
  for (const id of ["show-add-panel", "show-import-panel", "lang-toggle", "settings-toggle"]) {
    getElement(id).disabled = true;
  }
  for (const id of ["empty-state", "popup-retry", "add-panel", "import-panel", "settings-panel"]) {
    getElement(id).hidden = true;
  }
  const document = new Element();
  document.documentElement = new Element("html");
  document.getElementById = getElement;
  document.createElement = (tag) => new Element(tag);
  document.hidden = false;
  const timers = new Map();
  let nextTimer = 1;
  const state = { data, behavior: "ok", reads: [], writes: [], errors: [], formatters: 0, lastErrorReads: 0 };
  const runtime = {
    error: null,
    get lastError() { state.lastErrorReads += 1; return this.error; },
  };
  const window = new Element();
  const setTimeout = (callback, delay) => {
    const id = nextTimer++;
    timers.set(id, { callback, delay });
    return id;
  };
  window.setTimeout = setTimeout;
  const performanceEntries = [];
  const context = vm.createContext({
    document,
    window,
    performance: { now: () => 1000, mark() {}, measure: (name) => performanceEntries.push(name) },
    console: { error: (...args) => state.errors.push(args) },
    setTimeout,
    clearTimeout: (id) => timers.delete(id),
    setInterval: () => nextTimer++,
    clearInterval() {},
    URL,
    URLSearchParams,
    fetch: () => { throw new Error("Popup startup must not fetch network data"); },
    Intl: {
      supportedValuesOf: Intl.supportedValuesOf?.bind(Intl),
      DateTimeFormat: function (...args) {
        state.formatters += 1;
        return new Intl.DateTimeFormat(...args);
      },
    },
    chrome: {
      runtime,
      storage: {
        local: {
          get(defaults, callback) {
            state.reads.push({ defaults, callback });
            if (state.behavior === "throw") throw new Error("Storage API unavailable");
            if (state.behavior === "hang") return;
            const fail = state.behavior === "error";
            const result = { ...defaults, ...state.data };
            queueMicrotask(() => {
              runtime.error = fail ? { message: "Storage read failed" } : null;
              callback(fail ? undefined : result);
              runtime.error = null;
            });
          },
          set(value, callback) {
            state.writes.push(value);
            Object.assign(state.data, value);
            callback?.();
          },
          remove() {},
        },
      },
    },
  });
  vm.runInContext(script, context, { filename: "popup.js" });
  const settle = async () => { for (let i = 0; i < 12; i += 1) await Promise.resolve(); };
  return {
    state, getElement, runtime, performanceEntries, context, settle,
    evaluate: (code) => vm.runInContext(code, context),
    async runTimers(delay) {
      for (const [id, timer] of [...timers]) {
        if (timer.delay !== delay) continue;
        timers.delete(id);
        timer.callback();
      }
      await settle();
    },
  };
}

const sample = { title: "Example", datetime: "2026-09-30T12:30:00.000Z" };

export async function runPopupTests() {
  const results = [];
  const check = async (name, callback) => {
    await callback();
    results.push(name);
  };

  await check("startup yields with no storage reads or date formatters", async () => {
    const h = createPopupHarness();
    assert.equal(h.state.reads.length, 0);
    assert.equal(h.state.formatters, 0);
    assert.equal(h.getElement("show-add-panel").disabled, true);
    await h.runTimers(0);
    assert.equal(h.state.reads.length, 1);
    assert.ok("deadlines" in h.state.reads[0].defaults);
    assert.ok("language" in h.state.reads[0].defaults);
    assert.equal(h.getElement("show-add-panel").disabled, false);
    assert.equal(h.getElement("popup-status").hidden, true);
    assert.equal(h.getElement("empty-state").hidden, false);
    assert.equal(h.getElement("deadline-list").attributes["aria-busy"], "false");
    assert.equal(h.getElement("timezone-select").options.length, 0);
    assert.ok(h.state.formatters <= 1);
    assert.deepEqual(h.performanceEntries, ["ccf-popup-initialization"]);
  });

  await check("an early refresh and the startup timer cannot initialize twice", async () => {
    const h = createPopupHarness(source, { deadlines: [sample] });
    const first = h.evaluate("loadDeadlines()");
    assert.equal(first, h.evaluate("loadDeadlines()"));
    await first;
    await h.runTimers(0);
    assert.equal(h.state.reads.length, 1);
    assert.equal(h.getElement("deadline-list").children.length, 1);
    assert.equal(h.performanceEntries.length, 1);
  });

  await check("100 deadlines share formatters and settings initialize lazily", async () => {
    const h = createPopupHarness(source, { deadlines: Array.from({ length: 100 }, () => ({ ...sample })) });
    await h.runTimers(0);
    assert.equal(h.getElement("deadline-list").children.length, 100);
    assert.equal(h.getElement("empty-state").hidden, true);
    assert.ok(h.state.formatters <= 2);
    h.evaluate("setSettingsOpen(true)");
    assert.ok(h.getElement("timezone-select").options.length > 40);
    assert.equal(h.getElement("timezone-select").value, "Asia/Shanghai");
    const count = h.state.formatters;
    h.evaluate("setSettingsOpen(false); setSettingsOpen(true)");
    assert.equal(h.state.formatters, count);
    assert.ok(h.evaluate("dateTimeFormatterCache.size <= MAX_CACHED_FORMATTERS"));
  });

  await check("language, date/time preferences, custom zones and drafts survive", async () => {
    const h = createPopupHarness(source, {
      deadlines: [sample], language: "en", timeFormat: "12h", dateOrder: "mdy",
      displayTimezone: "Asia/Shanghai", activePanel: "add",
      addFormDraft: { title: "Draft", date: "2026-10-01", time: "15:30", url: "https://example.com" },
    });
    await h.runTimers(0);
    assert.equal(h.getElement("add-panel").hidden, false);
    assert.equal(h.getElement("title").value, "Draft");
    assert.equal(h.getElement("time").value, "15:30");
    assert.match(h.evaluate(`formatDate(${JSON.stringify(sample.datetime)})`), /^09\/30\/2026 PM 08:30/);
    assert.ok(h.getElement("timezone-note").textContent.includes("Shanghai"));
    h.evaluate('setTimeZone("Asia/Kathmandu"); setSettingsOpen(true)');
    await h.settle();
    assert.equal(h.getElement("timezone-select").value, "Asia/Kathmandu");
    assert.ok(h.getElement("timezone-select").options.some((option) => option.value === "Asia/Kathmandu"));
  });

  await check("invalid time zones fall back and DST offsets remain date-sensitive", async () => {
    const h = createPopupHarness(source, { deadlines: [sample], displayTimezone: "Invalid/Zone" });
    await h.runTimers(0);
    assert.equal(h.evaluate("currentTimeZone"), "Asia/Shanghai");
    assert.equal(h.evaluate('getTimeZoneOffsetMinutes("Europe/London", new Date("2026-01-15T12:00:00Z"))'), 0);
    assert.equal(h.evaluate('getTimeZoneOffsetMinutes("Europe/London", new Date("2026-07-15T12:00:00Z"))'), 60);
    assert.equal(h.evaluate('buildIsoFromTimeZoneInput("2026-09-30", "23:59", "Asia/Shanghai")'), "2026-09-30T15:59:00.000Z");
  });

  for (const behavior of ["error", "throw", "hang"]) {
    await check(`${behavior} storage read shows retry without changing saved data`, async () => {
      const h = createPopupHarness(source, { deadlines: [sample] });
      h.state.behavior = behavior;
      await h.runTimers(0);
      if (behavior === "hang") await h.runTimers(3000);
      assert.equal(h.getElement("popup-status").dataset.state, "error");
      assert.equal(h.getElement("popup-retry").hidden, false);
      assert.equal(h.getElement("show-add-panel").disabled, true);
      assert.equal(h.state.writes.length, 0);
      h.state.behavior = "ok";
      await h.evaluate("loadDeadlines()");
      assert.equal(h.getElement("popup-status").hidden, true);
      assert.equal(h.getElement("show-add-panel").disabled, false);
      assert.equal(h.getElement("deadline-list").children.length, 1);
    });
  }

  await check("late responses after timeout cannot overwrite a successful retry", async () => {
    const h = createPopupHarness();
    h.state.behavior = "hang";
    await h.runTimers(0);
    const stale = h.state.reads[0];
    await h.runTimers(3000);
    h.state.behavior = "ok";
    h.state.data = { deadlines: [sample] };
    await h.evaluate("loadDeadlines()");
    const errorReads = h.state.lastErrorReads;
    h.runtime.error = { message: "Late storage error" };
    stale.callback({ ...stale.defaults, deadlines: [] });
    h.runtime.error = null;
    await h.settle();
    assert.equal(h.state.lastErrorReads, errorReads + 1);
    assert.equal(h.getElement("deadline-list").children.length, 1);
    assert.equal(h.getElement("popup-status").hidden, true);
  });

  await check("corrupt saved data is reported, never replaced with an empty array", async () => {
    for (const deadlines of ["invalid", [null]]) {
      const h = createPopupHarness(source, { deadlines });
      await h.runTimers(0);
      assert.equal(h.getElement("popup-status").dataset.state, "error");
      assert.equal(h.state.writes.length, 0);
      assert.equal(h.getElement("empty-state").hidden, true);
    }
  });

  await check("concurrent reloads share one read and recover from a failed reload", async () => {
    const h = createPopupHarness(source, { deadlines: [sample] });
    await h.runTimers(0);
    h.state.behavior = "hang";
    const first = h.evaluate("loadDeadlines()");
    const second = h.evaluate("loadDeadlines()");
    assert.equal(first, second);
    assert.equal(h.state.reads.length, 2);
    await h.runTimers(3000);
    assert.equal(h.getElement("deadline-list").children.length, 1);
    h.state.behavior = "ok";
    await h.evaluate("loadDeadlines()");
    assert.equal(h.getElement("popup-status").hidden, true);
  });

  return { passed: results.length, tests: results };
}

console.log(await runPopupTests());
