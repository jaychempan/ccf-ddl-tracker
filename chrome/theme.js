(() => {
  const STORAGE_KEY = "theme";
  const CACHE_KEY = "popupTheme";
  const THEMES = new Set(["system", "light", "dark"]);
  let preferenceChanged = false;

  function normalizeTheme(value) {
    return THEMES.has(value) ? value : "system";
  }

  function syncThemeInputs() {
    document.querySelectorAll('input[name="theme"]').forEach((input) => {
      input.checked = input.value === document.documentElement.dataset.theme;
    });
  }

  function applyTheme(value) {
    const theme = normalizeTheme(value);
    document.documentElement.dataset.theme = theme;
    syncThemeInputs();
    try {
      // A synchronous cache prevents a flash when reopening with a manual theme.
      // chrome.storage.local remains the source of truth.
      localStorage.setItem(CACHE_KEY, theme);
    } catch {
      // System colors still work when the local cache is unavailable.
    }
  }

  let cachedTheme = "system";
  try {
    cachedTheme = localStorage.getItem(CACHE_KEY);
  } catch {
    // CSS follows the system before stored preferences finish loading.
  }
  applyTheme(cachedTheme);

  document.addEventListener("DOMContentLoaded", syncThemeInputs, { once: true });
  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.matches('input[name="theme"]') || !input.checked || !THEMES.has(input.value)) return;
    preferenceChanged = true;
    applyTheme(input.value);
    chrome.storage.local.set({ [STORAGE_KEY]: input.value });
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    preferenceChanged = true;
    applyTheme(changes[STORAGE_KEY].newValue);
  });

  chrome.storage.local.get({ [STORAGE_KEY]: "system" }, (result) => {
    if (chrome.runtime.lastError || preferenceChanged) return;
    applyTheme(result[STORAGE_KEY]);
  });
})();
