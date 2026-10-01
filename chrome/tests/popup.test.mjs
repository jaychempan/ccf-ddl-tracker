// Run with: node chrome/tests/popup.test.mjs
// No browser or third-party dependencies. These tests exercise the real popup
// script with a small DOM/storage harness; they do not benchmark Chrome's UI.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../popup.js", import.meta.url), "utf8");
const parserSource = await readFile(new URL("../conference-parser.js", import.meta.url), "utf8");

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
  append(...children) {
    for (const child of children) {
      child.parentElement = this;
      this.children.push(child);
    }
  }
  appendChild(child) { this.append(child); return child; }
  remove() {
    if (!this.parentElement) return;
    this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
    this.parentElement = null;
  }
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
  document.head = new Element("head");
  document.getElementById = getElement;
  document.createElement = (tag) => new Element(tag);
  document.hidden = false;
  const timers = new Map();
  let nextTimer = 1;
  const state = { data, behavior: "ok", parserBehavior: "ok", scriptLoads: [], scripts: [], reads: [], writes: [], errors: [], warnings: [], frameCallbacks: [], formatters: 0, lastErrorReads: 0 };
  const runtime = {
    error: null,
    get lastError() { state.lastErrorReads += 1; return this.error; },
  };
  const window = new Element();
  window.requestAnimationFrame = (callback) => {
    state.frameCallbacks.push(callback);
    return state.frameCallbacks.length;
  };
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
    console: {
      error: (...args) => state.errors.push(args),
      warn: (...args) => state.warnings.push(args),
    },
    setTimeout,
    clearTimeout: (id) => timers.delete(id),
    setInterval: () => nextTimer++,
    clearInterval() {},
    URL,
    URLSearchParams,
    AbortController,
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
  const completeParserLoad = (index = state.scripts.length - 1) => {
    const script = state.scripts[index];
    vm.runInContext(parserSource, context, { filename: "conference-parser.js" });
    script.onload?.();
  };
  const appendHeadChild = document.head.appendChild.bind(document.head);
  document.head.appendChild = (script) => {
    appendHeadChild(script);
    state.scriptLoads.push(script.src);
    state.scripts.push(script);
    const behavior = state.parserBehavior;
    if (behavior !== "hang") {
      queueMicrotask(() => {
        if (behavior === "error") script.onerror?.();
        else if (behavior === "invalid") script.onload?.();
        else completeParserLoad(state.scripts.indexOf(script));
      });
    }
    return script;
  };
  vm.runInContext(script, context, { filename: "popup.js" });
  // Drain promise jobs before advancing the fake clock, including script load
  // and fetch/body-read chains whose depth changes as features are extracted.
  const settle = async () => { await new Promise((resolve) => setImmediate(resolve)); };
  return {
    state, getElement, runtime, performanceEntries, context, settle, completeParserLoad,
    async loadParser() {
      await vm.runInContext("loadConferenceParser()", context);
    },
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
    assert.deepEqual(h.state.scriptLoads, []);
    assert.equal(h.evaluate("typeof parseAllConfYaml"), "undefined");
    assert.equal(h.getElement("show-add-panel").disabled, false);
    assert.equal(h.getElement("popup-status").hidden, true);
    assert.equal(h.getElement("empty-state").hidden, false);
    assert.equal(h.getElement("deadline-list").attributes["aria-busy"], "false");
    assert.equal(h.getElement("timezone-select").options.length, 0);
    assert.ok(h.state.formatters <= 1);
    assert.deepEqual(h.performanceEntries, [
      "ccf-popup-document-to-script", "ccf-popup-storage-read", "ccf-popup-initialization",
    ]);
  });

  await check("an early refresh and the startup timer cannot initialize twice", async () => {
    const h = createPopupHarness(source, { deadlines: [sample] });
    const first = h.evaluate("loadDeadlines()");
    assert.equal(first, h.evaluate("loadDeadlines()"));
    await first;
    await h.runTimers(0);
    assert.equal(h.state.reads.length, 1);
    assert.equal(h.getElement("deadline-list").children.length, 1);
    assert.equal(h.performanceEntries.filter((name) => name === "ccf-popup-initialization").length, 1);
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

  await check("a hidden popup becomes ready without waiting for an animation frame", async () => {
    const h = createPopupHarness(source, { deadlines: [sample] });
    h.context.document.hidden = true;
    await h.runTimers(0);
    assert.equal(h.getElement("popup-status").hidden, true);
    assert.equal(h.getElement("show-add-panel").disabled, false);
    assert.equal(h.state.frameCallbacks.length, 1);
    assert.ok(h.performanceEntries.includes("ccf-popup-document-to-script"));
    assert.ok(h.performanceEntries.includes("ccf-popup-storage-read"));
    assert.ok(!h.performanceEntries.includes("ccf-popup-ready-to-frame"));
    h.state.frameCallbacks[0]();
    assert.ok(h.performanceEntries.includes("ccf-popup-ready-to-frame"));
  });

  const tagged = {
    title: "CVPR 2027", datetime: "2026-11-17T11:59:00.000Z",
    sub: "AI", rank: { ccf: "A", core: "A*", thcpl: "A" }, place: "Example City",
  };
  const savedBadges = (h, index = 0) => h.getElement("deadline-list").children[index]
    .children.find((child) => child.className === "item-badges")?.children.map((child) => child.textContent) || [];

  await check("saved conference tags appear by default without adding startup reads", async () => {
    const h = createPopupHarness(source, { deadlines: [tagged, sample] });
    await h.runTimers(0);
    assert.equal(h.getElement("card-info-toggle").checked, true);
    assert.deepEqual(savedBadges(h, 1), ["CCF A", "AI · 人工智能"]);
    assert.deepEqual(savedBadges(h), []);
    assert.equal(h.state.reads.length, 1);
    assert.equal(h.state.writes.length, 0);
    assert.deepEqual(h.state.scriptLoads, []);
  });

  await check("saved tag opt-outs and field choices survive and labels follow language", async () => {
    const h = createPopupHarness(source, {
      deadlines: [tagged], language: "en", cardInfo: false,
      cardInfoFields: { ccf: false, sub: true, core: true, thcpl: false, place: true },
    });
    await h.runTimers(0);
    assert.equal(h.getElement("card-info-toggle").checked, false);
    assert.deepEqual(savedBadges(h), []);
    h.evaluate("setCardInfo(true)");
    await h.settle();
    assert.deepEqual(savedBadges(h), ["AI · Artificial Intelligence", "CORE A*", "Example City"]);
    assert.equal(h.state.data.cardInfo, true);
    h.evaluate('setCardInfoFields({ ccf: true, sub: false, core: false, thcpl: true, place: false })');
    await h.settle();
    assert.deepEqual(savedBadges(h), ["CCF A", "TH-CPL A"]);
    const reopened = createPopupHarness(source, h.state.data);
    await reopened.runTimers(0);
    assert.deepEqual(savedBadges(reopened), ["CCF A", "TH-CPL A"]);
  });

  await check("loading recommendations fills older ICS tags while preserving saved fields", async () => {
    const paper = { title: "CVPR", datetime: tagged.datetime, rank: { core: "Local" }, url: "https://example.com/saved" };
    const abstract = { title: "CVPR (abstract)", datetime: "2026-11-11T11:59:00.000Z" };
    const unrelated = { title: "Different Conference", datetime: tagged.datetime };
    const otherRound = { title: "CVPR", datetime: "2026-11-18T11:59:00.000Z" };
    const h = createPopupHarness(source, { deadlines: [paper, abstract, unrelated, otherRound] });
    await h.runTimers(0);
    await h.loadParser();
    const yaml = `- title: CVPR
  sub: AI
  rank:
    ccf: A
    core: A*
  confs:
    - year: 2027
      timezone: UTC-12
      place: Example City
      timeline:
        - abstract_deadline: '2026-11-10 23:59:00'
        - deadline: '2026-11-16 23:59:00'
`;
    await h.evaluate(`applyLoadedCcfddlItems(parseAllConfYaml(${JSON.stringify(yaml)}))`);
    const [savedPaper, savedAbstract, savedUnrelated, savedOtherRound] = JSON.parse(JSON.stringify(h.state.data.deadlines));
    assert.deepEqual(savedPaper, { ...paper, sub: "AI", rank: { core: "Local", ccf: "A" }, place: "Example City" });
    assert.deepEqual(savedAbstract, { ...abstract, sub: "AI", rank: { ccf: "A", core: "A*" }, place: "Example City" });
    assert.deepEqual(savedUnrelated, unrelated);
    assert.deepEqual(savedOtherRound, otherRound);
    assert.deepEqual(savedBadges(h), ["CCF A", "AI · 人工智能"]);
    assert.equal(h.state.writes.length, 1);
    await h.evaluate(`applyLoadedCcfddlItems(parseAllConfYaml(${JSON.stringify(yaml)}))`);
    assert.equal(h.state.writes.length, 1, "complete tags do not trigger another write");
  });

  await check("ambiguous recommendations and failed reads never change saved deadlines", async () => {
    const h = createPopupHarness(source, { deadlines: [{ title: "CVPR", datetime: tagged.datetime }] });
    await h.runTimers(0);
    await h.evaluate(`applyLoadedCcfddlItems(${JSON.stringify([tagged, { ...tagged, title: "CVPR", sub: "CG" }])})`);
    assert.equal(h.state.writes.length, 0);
    assert.deepEqual(savedBadges(h), []);
    h.state.behavior = "error";
    await h.evaluate(`applyLoadedCcfddlItems(${JSON.stringify([tagged])})`);
    assert.equal(h.state.writes.length, 0);
    assert.equal(h.state.errors.length, 1);
    h.state.behavior = "ok";
    h.state.data.deadlines = "invalid";
    await h.evaluate(`applyLoadedCcfddlItems(${JSON.stringify([tagged])})`);
    assert.equal(h.state.writes.length, 0);
    assert.equal(h.state.data.deadlines, "invalid");
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

  const primaryUrl = "https://ccfddl.com/conference/allconf.yml";
  const zhUrl = "https://ccfddl.com/conference/deadlines_zh.ics";
  const enUrl = "https://ccfddl.com/conference/deadlines_en.ics";
  const calendar = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Upcoming Conference
DTSTART:20990101T235959Z
END:VEVENT
BEGIN:VEVENT
SUMMARY:Expired Conference
DTSTART:20000101T235959Z
END:VEVENT
END:VCALENDAR`;
  const ok = (body) => ({ ok: true, status: 200, text: async () => body });
  const prepareImport = async (fetch) => {
    const h = createPopupHarness();
    await h.runTimers(0);
    h.context.fetch = fetch;
    h.evaluate("setCcfddlExpanded(true); setCcfddlDropdownOpen(true)");
    return h;
  };

  await check("the first search shares one parser load and cached recommendations need no new script", async () => {
    const requested = [];
    const h = await prepareImport(async (url) => {
      requested.push(url);
      return ok(calendar);
    });
    h.state.parserBehavior = "hang";
    const first = h.evaluate("openCcfddlDropdown()");
    const second = h.evaluate("openCcfddlDropdown()");
    assert.deepEqual(h.state.scriptLoads, ["conference-parser.js"]);
    assert.equal(h.evaluate("loadConferenceParser()"), h.evaluate("conferenceParserLoadPromise"));
    assert.deepEqual(requested, [], "network requests wait for the local parser");
    h.completeParserLoad();
    await Promise.all([first, second]);
    assert.equal(h.getElement("ccfddl-list").children.length, 1);
    const loadedRequests = [...requested];
    await h.evaluate("openCcfddlDropdown()");
    assert.deepEqual(requested, loadedRequests);
    assert.deepEqual(h.state.scriptLoads, ["conference-parser.js"]);
  });

  await check("a local script error or missing parser reports failure and can be retried", async () => {
    for (const behavior of ["error", "invalid"]) {
      const requested = [];
      const h = await prepareImport(async (url) => {
        requested.push(url);
        return ok(calendar);
      });
      h.state.parserBehavior = behavior;
      await h.evaluate("openCcfddlDropdown()");
      assert.deepEqual(requested, [], "local failures must not request remote sources");
      assert.equal(h.state.errors.length, 1);
      assert.equal(h.context.document.head.children.length, 0);
      assert.equal(h.evaluate("conferenceParserLoadPromise"), null);
      assert.equal(h.evaluate("isCcfddlLoading"), false);
      assert.match(h.getElement("ccfddl-empty").textContent, /加载失败/);
      h.state.parserBehavior = "ok";
      await h.evaluate("openCcfddlDropdown()");
      assert.equal(h.getElement("ccfddl-list").children.length, 1);
      assert.equal(h.state.scriptLoads.length, 2);
    }
  });

  await check("a stalled parser times out and a late callback cannot replace the retry", async () => {
    const requested = [];
    const h = await prepareImport(async (url) => {
      requested.push(url);
      return ok(calendar);
    });
    h.state.parserBehavior = "hang";
    const first = h.evaluate("openCcfddlDropdown()");
    const lateCallback = h.state.scripts[0].onload;
    await h.runTimers(3000);
    await first;
    assert.equal(h.state.errors.length, 1);
    assert.deepEqual(requested, []);
    assert.equal(h.context.document.head.children.length, 0);
    const retry = h.evaluate("openCcfddlDropdown()");
    const retryParserPromise = h.evaluate("conferenceParserLoadPromise");
    h.completeParserLoad(0);
    lateCallback();
    assert.equal(h.evaluate("conferenceParserLoadPromise"), retryParserPromise);
    assert.deepEqual(requested, []);
    h.completeParserLoad(1);
    await retry;
    assert.equal(h.getElement("ccfddl-list").children.length, 1);
    assert.equal(h.state.scriptLoads.length, 2);
    assert.equal(h.evaluate("isCcfddlLoading"), false);
  });

  await check("the extracted ICS parser still uses shared IANA timezone helpers", async () => {
    const h = createPopupHarness();
    await h.runTimers(0);
    await h.loadParser();
    const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
SUMMARY:Zoned Conference
DTSTART;TZID=America/New_York:20261001T090000
END:VEVENT
END:VCALENDAR`;
    assert.equal(h.evaluate(`parseIcs(${JSON.stringify(ics)})[0].datetime`), "2026-10-01T13:00:00.000Z");
  });

  await check("primary network failures fall back to calendars and deduplicate future deadlines", async () => {
    const requested = [];
    const h = await prepareImport(async (url) => {
      requested.push(url);
      if (url === primaryUrl) throw new TypeError("Failed to fetch");
      return ok(calendar);
    });
    await h.evaluate("loadCcfddlData()");
    assert.deepEqual(requested, [primaryUrl, zhUrl, enUrl]);
    assert.equal(h.getElement("ccfddl-list").children.length, 1);
    assert.equal(h.evaluate("ccfddlItems[0].title"), "Upcoming Conference");
    assert.equal(h.state.errors.length, 0);
    assert.equal(h.state.writes.length, 0);
  });

  await check("HTTP errors and unreadable primary responses reach a working fallback feed", async () => {
    for (const primary of [
      { ok: false, status: 503 },
      ok("<html>Temporary gateway error</html>"),
      { ok: true, status: 200, text: async () => { throw new Error("Body read failed"); } },
    ]) {
      const h = await prepareImport(async (url) => {
        if (url === primaryUrl) return primary;
        if (url === zhUrl) throw new TypeError("Calendar unavailable");
        return ok(calendar);
      });
      await h.evaluate("loadCcfddlData()");
      assert.equal(h.getElement("ccfddl-list").children.length, 1);
      assert.equal(h.state.errors.length, 0);
      assert.equal(h.state.warnings.length, 2);
    }
  });

  await check("stalled primary requests and response bodies time out, abort and use fallback", async () => {
    for (const stallBody of [false, true]) {
      let primarySignal;
      const h = await prepareImport(async (url, { signal }) => {
        if (url !== primaryUrl) return ok(calendar);
        primarySignal = signal;
        const stalled = new Promise(() => {});
        return stallBody ? { ok: true, status: 200, text: () => stalled } : stalled;
      });
      const loading = h.evaluate("loadCcfddlData()");
      await h.settle();
      await h.runTimers(10000);
      await loading;
      assert.equal(primarySignal.aborted, true);
      assert.equal(h.getElement("ccfddl-list").children.length, 1);
      assert.equal(h.evaluate("isCcfddlLoading"), false);
      assert.equal(h.state.errors.length, 0);
    }
  });

  await check("a stalled calendar cannot discard another working calendar", async () => {
    let stalledSignal;
    const h = await prepareImport(async (url, { signal }) => {
      if (url === primaryUrl) throw new TypeError("Failed to fetch");
      if (url === enUrl) return ok(calendar);
      stalledSignal = signal;
      return new Promise(() => {});
    });
    const loading = h.evaluate("loadCcfddlData()");
    await h.settle();
    await h.runTimers(10000);
    await loading;
    assert.equal(stalledSignal.aborted, true);
    assert.equal(h.getElement("ccfddl-list").children.length, 1);
    assert.equal(h.evaluate("isCcfddlLoading"), false);
  });

  await check("a valid primary calendar with only expired dates does not trigger network fallback", async () => {
    const requested = [];
    const yaml = `- title: Expired Conference
  confs:
  - year: 2000
    timeline:
    - deadline: '2000-01-01 23:59:59'
    timezone: UTC+0`;
    const h = await prepareImport(async (url) => {
      requested.push(url);
      return ok(yaml);
    });
    await h.evaluate("loadCcfddlData()");
    assert.deepEqual(requested, [primaryUrl]);
    assert.equal(h.evaluate("ccfddlItems.length"), 0);
    assert.equal(h.state.errors.length, 0);
  });

  await check("all import sources failing reports an error and a later retry recovers", async () => {
    const h = await prepareImport(async () => { throw new TypeError("Failed to fetch"); });
    await h.evaluate("loadCcfddlData()");
    assert.equal(h.getElement("ccfddl-empty").textContent, "加载失败，请稍后重试");
    assert.equal(h.evaluate("isCcfddlLoading"), false);
    assert.equal(h.state.errors.length, 1);
    assert.equal(h.state.writes.length, 0);
    h.context.fetch = async (url) => {
      if (url === primaryUrl) throw new TypeError("Failed to fetch");
      return ok(calendar);
    };
    await h.evaluate("loadCcfddlData()");
    assert.equal(h.getElement("ccfddl-list").children.length, 1);
    assert.equal(h.evaluate("isCcfddlLoading"), false);
  });

  return { passed: results.length, tests: results };
}

console.log(await runPopupTests());
