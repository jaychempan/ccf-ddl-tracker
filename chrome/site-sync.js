// Isolated content-script world: no window.postMessage bridge or page token access.
(() => {
  const validId = (id) => typeof id === "string" && /^[A-Za-z0-9][A-Za-z0-9._&+'-]{0,99}$/.test(id);
  async function request(path, options = {}, asText = false) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(new URL(path, "https://ccfddl.com"), {
        ...options, credentials: "same-origin", cache: "no-store", redirect: "error", signal: controller.signal,
      });
      if (!response.ok) throw new Error(response.status === 401 ? "sign_in" : "request_failed");
      return await (asText ? response.text() : response.json());
    } finally { clearTimeout(timer); }
  }
  async function handle(message) {
    if (message.action === "bootstrap") return request("/api/bootstrap");
    if (message.action === "catalog") return request("/conference/allconf.yml", {}, true);
    if (message.action === "star" && validId(message.id) && typeof message.starred === "boolean") {
      const current = await request("/api/bootstrap");
      if (!current.user?.login) throw new Error("sign_in");
      if (current.user.login !== message.account) throw new Error("account_changed");
      return request(`/api/stars/${encodeURIComponent(message.id)}`, { method: message.starred ? "PUT" : "DELETE" });
    }
    throw new Error("invalid_action");
  }
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id || message?.type !== "ccfddl-api") return;
    handle(message).then((data) => respond({ ok: true, data }), (error) => respond({ ok: false, error: error.message }));
    return true;
  });
  chrome.runtime.sendMessage({ type: "ccfddl-site-ready" }).catch(() => {});
})();
