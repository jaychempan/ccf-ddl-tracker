// All deadline mutations and sync commits share one service-worker queue.
// The website keeps its HttpOnly session; the extension never reads a token.
(() => {
  const KEY = "starSync";
  const ALARM = "ccfddl-star-sync";
  const DEADLINE_ALARM = "ccfddl-deadline-sync";
  const validId = (id) => typeof id === "string" && /^[A-Za-z0-9][A-Za-z0-9._&+'-]{0,99}$/.test(id);
  const identity = (item) => item.conferenceDeadlineId || JSON.stringify([item.title, item.datetime]);
  const ids = (items) => new Set(items.map((item) => item.conferenceId).filter(validId));
  let queue = Promise.resolve();
  let syncing = null;
  let resync = false;
  let refreshingDeadlines = null;
  const serialize = (work) => {
    const result = queue.then(work);
    queue = result.catch(() => {});
    return result;
  };
  async function read() {
    const data = await chrome.storage.local.get({ deadlines: [], [KEY]: { enabled: false } });
    if (!Array.isArray(data.deadlines) || data.deadlines.some((item) => !item || typeof item !== "object")) {
      throw new Error("invalid_storage");
    }
    return { deadlines: data.deadlines, state: data[KEY] };
  }
  function refreshDeadlines() {
    if (refreshingDeadlines) return refreshingDeadlines;
    refreshingDeadlines = (async () => {
      const initial = await serialize(read);
      if (!initial.deadlines.length) return { deadlines: [], updated: 0, unmatched: 0 };
      const controller = new AbortController();
      let timer;
      try {
        const catalog = await Promise.race([
          (async () => {
            const response = await fetch("https://ccfddl.com/conference/allconf.yml", {
              cache: "no-store", credentials: "omit", signal: controller.signal,
            });
            if (!response.ok) throw new Error("catalog_unavailable");
            const items = globalThis.CcfddlConferenceParser.parseAllConfYaml(await response.text());
            if (!items.some((item) => validId(item.conferenceId))) throw new Error("invalid_catalog");
            return items;
          })(),
          new Promise((_, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(new Error("timeout")); }, 15000);
          }),
        ]);
        // Re-read inside the same queue as add/remove and star-sync commits.
        // A response must never resurrect a card removed while fetching.
        return await serialize(async () => {
          const { deadlines, state } = await read();
          const result = globalThis.CcfddlConferenceParser.reconcileConferenceDeadlines(deadlines, catalog);
          if (result.updated) {
            if (state.enabled) {
              const before = ids(deadlines);
              state.pending ||= {};
              for (const id of ids(result.deadlines)) if (!before.has(id)) state.pending[id] = true;
            }
            state.revision = (state.revision || 0) + 1;
            await chrome.storage.local.set({ deadlines: result.deadlines, [KEY]: state });
          }
          return result;
        });
      } finally { clearTimeout(timer); }
    })().finally(() => { refreshingDeadlines = null; });
    return refreshingDeadlines;
  }
  async function bridge(tabId, request) {
    let timer;
    let result;
    try {
      result = await Promise.race([
        chrome.tabs.sendMessage(tabId, { type: "ccfddl-api", ...request }),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), 25000); }),
      ]);
    } finally { clearTimeout(timer); }
    if (!result?.ok) throw new Error(result?.error || "website_unavailable");
    return result.data;
  }
  async function websiteTab() {
    const tabs = await chrome.tabs.query({ url: "https://ccfddl.com/*" });
    const tab = tabs.find((entry) => !new URL(entry.url).pathname.startsWith("/api/"));
    if (!tab) throw new Error("open_website");
    return tab.id;
  }
  function snapshot(value) {
    if (!value || !Array.isArray(value.starred) || !value.starred.every(validId)) throw new Error("invalid_response");
    if (!value.user?.login) throw new Error("sign_in");
    return value;
  }
  async function sync() {
    const { deadlines, state } = await serialize(read);
    if (!state.enabled) return;
    const assertFresh = async () => {
      const current = await read();
      if (!current.state.enabled || (current.state.revision || 0) !== (state.revision || 0)) {
        throw new Error("superseded");
      }
    };
    try {
      const tab = await websiteTab();
      const remote = snapshot(await bridge(tab, { action: "bootstrap" }));
      if (state.account && state.account !== remote.user.login) throw new Error("account_changed");
      if (!state.account) {
        state.account = remote.user.login;
        state.pending = Object.fromEntries([...ids(deadlines)].map((id) => [id, true]));
        // Bind account and persist intent before any remote write.
        await serialize(async () => {
          await assertFresh();
          await chrome.storage.local.set({ [KEY]: state });
        });
      }
      const text = await bridge(tab, { action: "catalog" });
      const catalog = globalThis.CcfddlConferenceParser.parseAllConfYaml(text);
      if (!catalog.some((item) => validId(item.conferenceId))) throw new Error("invalid_catalog");
      state.pending ||= {};
      for (const [id, starred] of Object.entries(state.pending).slice(0, 5)) {
        await serialize(assertFresh);
        await bridge(tab, { action: "star", id, starred, account: state.account });
        await serialize(async () => {
          await assertFresh();
          delete state.pending[id];
          await chrome.storage.local.set({ [KEY]: state });
        });
      }
      const latest = snapshot(await bridge(tab, { action: "bootstrap" }));
      if (latest.user.login !== state.account) throw new Error("account_changed");
      const selected = new Set(latest.starred);
      for (const [id, value] of Object.entries(state.pending)) {
        if (value) selected.add(id); else selected.delete(id);
      }
      const updated = deadlines.filter((item) => !validId(item.conferenceId) || selected.has(item.conferenceId))
        .map((item) => item.conferenceId
          ? globalThis.CcfddlConferenceParser.reconcileConferenceDeadlines([item], catalog).deadlines[0] : item);
      const excluded = new Set((state.excluded || []).filter((key) => selected.has(key.split(":")[0])));
      state.excluded = [...excluded];
      const existing = new Set(updated.map(identity));
      for (const item of catalog) {
        if (!selected.has(item.conferenceId) || Date.parse(item.datetime) < Date.now() || excluded.has(identity(item)) || existing.has(identity(item))) continue;
        updated.push(item);
        existing.add(identity(item));
      }
      const available = ids(catalog);
      state.unavailable = [...selected].filter((id) => !available.has(id)).length;
      state.status = Object.keys(state.pending).length ? "pending" : "synced";
      state.lastSyncedAt = Date.now();
      await serialize(async () => {
        await assertFresh();
        await chrome.storage.local.set({ deadlines: updated, [KEY]: state });
      });
    } catch (error) {
      await serialize(async () => {
        try { await assertFresh(); }
        catch { resync = true; return; }
        state.status = ["open_website", "sign_in", "account_changed", "invalid_catalog"].includes(error.message) ? error.message : "retry";
        await chrome.storage.local.set({ [KEY]: state });
      });
    }
  }
  function requestSync() {
    if (syncing) { resync = true; return syncing; }
    // Network work never occupies the local write queue. A changed revision
    // discards the old response and reruns against the latest persisted intent.
    syncing = (async () => {
      do { resync = false; await sync(); } while (resync);
    })().finally(() => { syncing = null; });
    return syncing;
  }
  async function mutate(message) {
    const { deadlines, state } = await read();
    let updated;
    if (message.action === "add" || message.action === "addMany") {
      const items = message.action === "addMany" ? message.items : [message.item];
      if (!Array.isArray(items) || !items.length || items.length > 500) throw new Error("invalid_deadlines");
      updated = [...deadlines];
      for (const item of items) {
        if (!item || typeof item.title !== "string" || !Number.isFinite(Date.parse(item.datetime))) throw new Error("invalid_deadline");
        const found = updated.findIndex((entry) => identity(entry) === identity(item) || (entry.title === item.title && entry.datetime === item.datetime));
        if (found < 0) updated.push(item);
        else {
          const saved = updated[found];
          const merged = { ...item, ...saved, rank: { ...saved.rank } };
          for (const field of ["url", "description", "sub", "place"]) merged[field] = saved[field] || item[field] || "";
          for (const field of ["ccf", "core", "thcpl"]) {
            if (!merged.rank[field] && item.rank?.[field]) merged.rank[field] = item.rank[field];
          }
          if (item.conferenceId) {
            merged.source = "ccfddl";
            merged.conferenceId = item.conferenceId;
            merged.conferenceDeadlineId = item.conferenceDeadlineId;
            // Re-adding an edition must update its dates as well as its tags.
            if (saved.conferenceDeadlineId === item.conferenceDeadlineId) Object.assign(merged, item);
          }
          updated[found] = merged;
        }
      }
    } else if (message.action === "removeConference") {
      if (!validId(message.conferenceId)) throw new Error("invalid_conference");
      updated = deadlines.filter((item) => item.conferenceId !== message.conferenceId);
    } else if (message.action === "remove") {
      const index = deadlines.findIndex((item) => identity(item) === identity(message.item));
      updated = deadlines.filter((_, position) => position !== index);
    } else if (message.action === "enrich") {
      const patches = new Map(message.items.map((item) => [identity(item), item]));
      updated = deadlines.map((item) => {
        const patch = patches.get(identity(item));
        if (!patch) return item;
        return { ...patch, ...item, sub: item.sub || patch.sub, place: item.place || patch.place, rank: { ...patch.rank, ...item.rank } };
      });
    } else throw new Error("invalid_action");
    if (state.enabled) {
      state.pending ||= {};
      const excluded = new Set(state.excluded || []);
      if (message.action === "remove" && message.item.conferenceDeadlineId) excluded.add(identity(message.item));
      if (message.action === "add") excluded.delete(identity(message.item));
      if (message.action === "addMany") for (const item of message.items) excluded.delete(identity(item));
      const before = ids(deadlines), after = ids(updated);
      for (const id of after) if (!before.has(id)) state.pending[id] = true;
      for (const id of before) if (!after.has(id)) {
        state.pending[id] = false;
        for (const key of excluded) if (key.startsWith(`${id}:`)) excluded.delete(key);
      }
      state.excluded = [...excluded];
      state.status = "pending";
    }
    state.revision = (state.revision || 0) + 1;
    await chrome.storage.local.set({ deadlines: updated, [KEY]: state });
    return updated;
  }
  async function openWebsite(tabs) {
    if (tabs.length) await chrome.tabs.update(tabs[0].id, { active: true, url: "https://ccfddl.com/" });
    else await chrome.tabs.create({ url: "https://ccfddl.com/" });
  }
  async function handle(message) {
    if (message.action === "refreshDeadlines") return refreshDeadlines();
    if (message.action === "connect") {
      await serialize(async () => {
        const { state } = await read();
        await chrome.storage.local.set({ [KEY]: { ...state, enabled: true, status: "pending", revision: (state.revision || 0) + 1 } });
        await chrome.alarms.create(ALARM, { periodInMinutes: 1 });
      });
      const tabs = await chrome.tabs.query({ url: "https://ccfddl.com/*" });
      // A signed-in tab can connect immediately without navigating away from
      // the tracker. New/expired sessions still use the site's normal login.
      const existing = tabs.find((tab) => !new URL(tab.url).pathname.startsWith("/api/"));
      if (existing) {
        try {
          const account = await bridge(existing.id, { action: "bootstrap" });
          if (account?.user?.login) { await requestSync(); return {}; }
        } catch { /* Reload below if an older tab has no content script yet. */ }
      }
      if (!(await read()).state.enabled) return {};
      await openWebsite(tabs);
      requestSync().catch(console.error);

    } else if (message.action === "disconnect") {
      await serialize(async () => {
        const { state } = await read();
        await chrome.storage.local.set({ [KEY]: { enabled: false, revision: (state.revision || 0) + 1 } });
        await chrome.alarms.clear(ALARM);
      });
    } else if (message.action === "sync") await requestSync();
    else {
      const deadlines = await serialize(() => mutate(message));
      requestSync().catch(console.error);
      return { deadlines };
    }
    return {};
  }
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id) return;
    if (message?.type === "ccfddl-site-ready") {
      if (sender.tab && sender.origin === "https://ccfddl.com") requestSync().catch(console.error);
      return;
    }
    // A content script can announce readiness, but cannot issue local mutations.
    if (message?.type !== "ccfddl-sync" || !sender.url?.startsWith(chrome.runtime.getURL(""))) return;
    handle(message).then((data) => respond({ ok: true, ...data }), () => respond({ ok: false }));
    return true;
  });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM) requestSync().catch(console.error);
    if (alarm.name === DEADLINE_ALARM) refreshDeadlines().catch(console.error);
  });
  async function recover() {
    const { state } = await read();
    if (state.enabled && !await chrome.alarms.get(ALARM)) await chrome.alarms.create(ALARM, { periodInMinutes: 1 });
    if (!await chrome.alarms.get(DEADLINE_ALARM)) await chrome.alarms.create(DEADLINE_ALARM, { periodInMinutes: 360 });
  }
  recover().catch(console.error);
  globalThis.CcfddlStarSync = { handle, requestSync };
})();
