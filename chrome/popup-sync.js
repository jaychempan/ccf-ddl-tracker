(() => {
  let state = { enabled: false };
  let busy = false;
  let ready = false;
  let operation = 0;
  let desiredEnabled = null;
  const el = (id) => document.getElementById(id);
  const toggle = el("sync-enabled");
  const account = el("account-toggle");
  const refresh = el("refresh-deadlines");
  const messages = {
    zh: {
      login: "通过 GitHub 登录并合并 CCFDDL 收藏", click_sync: "点击刷新收藏", continue_login: "点击继续登录", manage_account: "点击前往设置切换账号",
      label: "同步网站收藏", connect_failed: "连接失败，请重新勾选以重试", hint: "请保留已登录的网站标签页。",
      disabled: "登录后合并会议收藏，手动 DDL 留在本地。", pending: "等待同步…",
      synced: "收藏已同步", open_website: "打开 CCFDDL 即可继续同步", sign_in: "请在 CCFDDL 使用 GitHub 登录",
      account_changed: "网站账号已变更，请关闭后重新开启此选项。", retry: "暂未同步，操作已保留。点击刷新重试。",
      invalid_catalog: "会议数据暂不可用，请稍后刷新", unavailable: "项收藏暂无截止时间", busy: "正在同步…", refresh: "刷新截止日期与网站收藏",
    },
    en: {
      login: "Sign in with GitHub and merge CCFDDL stars", click_sync: "Click to refresh stars", continue_login: "Click to continue sign-in", manage_account: "Click to switch accounts in Settings",
      label: "Sync website stars", connect_failed: "Could not connect; check again to retry", hint: "Keep a signed-in website tab open.",
      disabled: "Sign in to merge conference stars. Manual DDLs stay local.", pending: "Sync pending…",
      synced: "Stars synced", open_website: "Open CCFDDL to resume sync", sign_in: "Sign in with GitHub on CCFDDL",
      account_changed: "Website account changed. Turn this option off and on to reconnect.", retry: "Changes saved for retry. Click refresh to try again.",
      invalid_catalog: "Conference data is unavailable; refresh later", unavailable: "star(s) have no deadline yet", busy: "Syncing…", refresh: "Refresh deadlines and website stars",
    },
  };
  function renderSync() {
    const text = messages[currentLang] || messages.zh;
    const status = busy ? text.busy : !state.enabled && state.status === "retry" ? text.connect_failed : text[state.enabled ? state.status || "pending" : "disabled"] || text.retry;
    toggle.disabled = !ready;
    toggle.checked = desiredEnabled ?? state.enabled;
    account.disabled = !ready || busy;
    account.dataset.state = !state.enabled ? "disconnected" : ["synced", "pending"].includes(state.status) ? "connected" : "attention";
    const actionHint = state.status === "account_changed" ? text.manage_account
      : ["sign_in", "open_website"].includes(state.status) ? text.continue_login : text.click_sync;
    const label = !state.enabled ? text.login : [state.account ? `@${state.account}` : "", status, actionHint].filter(Boolean).join(" · ");
    account.setAttribute("title", label);
    account.setAttribute("aria-label", label);
    el("sync-label").textContent = text.label;
    el("sync-status").textContent = [state.enabled && state.account ? `@${state.account}` : "", status,
      state.enabled && state.status === "synced" && !busy ? text.hint : "",
      state.enabled && state.unavailable ? `${state.unavailable} ${text.unavailable}` : ""].filter(Boolean).join(" · ");
    refresh.classList.toggle("is-syncing", busy);
    refresh.setAttribute("aria-busy", String(busy));
    const refreshLabel = state.enabled ? text.refresh : t("refresh_button");
    refresh.setAttribute("title", refreshLabel);
    refresh.setAttribute("aria-label", refreshLabel);
  }
  async function run(action) {
    if (action === "sync" && busy) return;
    const version = ++operation;
    if (action === "connect" || action === "disconnect") desiredEnabled = action === "connect";
    busy = action !== "disconnect";
    renderSync();
    try {
      const result = await chrome.runtime.sendMessage({ type: "ccfddl-sync", action });
      if (!result?.ok) throw new Error("sync_failed");
      const resultState = await chrome.storage.local.get({ starSync: { enabled: false } });
      if (version === operation) state = resultState.starSync;
    } catch {
      if (version === operation) state.status = "retry";
    } finally {
      if (version === operation) { busy = false; desiredEnabled = null; renderSync(); }
    }
  }
  account.addEventListener("click", () => {
    if (!state.enabled || ["sign_in", "open_website"].includes(state.status)) run("connect");
    else if (state.status === "account_changed") { setSettingsOpen(true); toggle.focus(); }
    else run("sync");
  });
  toggle.addEventListener("change", () => run(toggle.checked ? "connect" : "disconnect"));
  // One existing refresh button serves local deadlines and optional star sync.
  refresh.addEventListener("click", () => { if (state.enabled) run("sync"); });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes.starSync) { state = changes.starSync.newValue || { enabled: false }; renderSync(); }
    if (changes.deadlines && isPopupReady) loadDeadlines();
  });
  globalThis.renderStarSync = renderSync;
  chrome.storage.local.get({ starSync: { enabled: false } }).then((result) => {
    state = result.starSync;
    ready = true;
    renderSync();
    if (state.enabled) run("sync");
  }).catch(() => { ready = true; state.status = "retry"; renderSync(); });
})();
