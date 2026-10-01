const STORAGE_KEY = "deadlines";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const BRAND_COLOR = "#334155";
const ICON_STROKE = "#1f2937";
const BADGE_ALARM = "badge-refresh";
const STORAGE_READ_TIMEOUT_MS = 3000;
const BADGE_RETRY_MS = 5 * 60 * 1000;

let updateVersion = 0;
let badgeUpdateQueue = Promise.resolve();
let pendingStorageRead = null;

function createIconImageData(size) {
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const strokeWidth = Math.max(1, size * 0.08);
  const radius = size / 2 - strokeWidth;

  ctx.strokeStyle = ICON_STROKE;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(size / 2, size / 2);
  ctx.lineTo(size / 2, size * 0.3);
  ctx.moveTo(size / 2, size / 2);
  ctx.lineTo(size * 0.68, size / 2);
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}

function ensureActionIcon() {
  const sizes = [16, 32, 48, 128];
  const imageData = {};
  sizes.forEach((size) => {
    const data = createIconImageData(size);
    if (data) {
      imageData[size] = data;
    }
  });

  if (Object.keys(imageData).length > 0) {
    chrome.action.setIcon({ imageData });
  }
}

function toTimestamp(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function getBadgeState(deadlines, now = Date.now()) {
  let soonest = null;
  if (Array.isArray(deadlines)) {
    for (const item of deadlines) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const timestamp = toTimestamp(item.datetime);
      if (timestamp !== null && timestamp >= now && (soonest === null || timestamp < soonest)) {
        soonest = timestamp;
      }
    }
  }
  if (soonest === null) return { text: "", nextRefreshAt: null };

  const daysLeft = Math.floor((soonest - now) / MS_PER_DAY);
  // With floor(days) and an inclusive deadline, the displayed value changes
  // one millisecond after the exact day boundary or deadline expiration.
  const nextRefreshAt = daysLeft > 0
    ? soonest - daysLeft * MS_PER_DAY + 1
    : soonest + 1;
  return { text: String(daysLeft), nextRefreshAt };
}

function reportBadgeError(error) {
  console.error("[CCF DDL Tracker] Could not update deadline badge:", error);
}

async function retryBadgeUpdate(error, version) {
  if (version !== updateVersion) return;
  reportBadgeError(error);
  try {
    // A consumed one-shot alarm must not leave a transient failure without
    // another wake-up. This retry is serialized with normal schedule writes.
    await chrome.alarms.create(BADGE_ALARM, { when: Date.now() + BADGE_RETRY_MS });
  } catch (retryError) {
    if (version === updateVersion) reportBadgeError(retryError);
  }
}

function queueBadgeRetry(error, version) {
  badgeUpdateQueue = badgeUpdateQueue.then(() => retryBadgeUpdate(error, version));
  return badgeUpdateQueue;
}

function readStoredDeadlines() {
  if (pendingStorageRead) return pendingStorageRead;
  const read = new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (error) reject(error);
      else resolve(result);
    };
    const timeout = setTimeout(() => {
      finish(new Error("Local storage read timed out"));
    }, STORAGE_READ_TIMEOUT_MS);
    try {
      chrome.storage.local.get({ [STORAGE_KEY]: [] }, (result) => {
        // Consume lastError even if this callback arrives after the timeout.
        const error = chrome.runtime.lastError;
        finish(error ? new Error(error.message) : null, result?.[STORAGE_KEY]);
      });
    } catch (error) {
      finish(error);
    }
  });
  pendingStorageRead = read;
  const clearPending = () => {
    if (pendingStorageRead === read) pendingStorageRead = null;
  };
  read.then(clearPending, clearPending);
  return read;
}

function queueBadgeUpdate(deadlines, version) {
  // Serialize API writes as well as rejecting stale reads. A slower older
  // alarm/toolbar write must finish before the latest state is committed.
  badgeUpdateQueue = badgeUpdateQueue.then(async () => {
    if (version !== updateVersion) return;
    const { text, nextRefreshAt } = getBadgeState(deadlines);
    await chrome.action.setBadgeText({ text });
    if (version !== updateVersion) return;
    await chrome.action.setBadgeBackgroundColor({ color: BRAND_COLOR });
    if (version !== updateVersion) return;
    // Clearing the old name also migrates the former one-minute recurring alarm.
    await chrome.alarms.clear(BADGE_ALARM);
    if (version !== updateVersion || nextRefreshAt === null) return;
    // Packaged Chrome extensions may deliver near-term alarms at least 30s
    // later. Recompute from the current clock when the alarm actually fires.
    await chrome.alarms.create(BADGE_ALARM, { when: nextRefreshAt });
  }).catch((error) => retryBadgeUpdate(error, version));
  return badgeUpdateQueue;
}

function updateBadge(deadlines) {
  const version = ++updateVersion;
  if (arguments.length > 0) {
    // A storage event supersedes any snapshot being read before that change.
    pendingStorageRead = null;
    return queueBadgeUpdate(deadlines, version);
  }
  return readStoredDeadlines().then((storedDeadlines) => {
    if (version !== updateVersion) return;
    return queueBadgeUpdate(storedDeadlines, version);
  }).catch((error) => queueBadgeRetry(error, version));
}

function recoverBadgeAlarm() {
  const version = updateVersion;
  return chrome.alarms.get(BADGE_ALARM).then((alarm) => {
    // The event that woke this worker may already be updating the badge.
    if (version !== updateVersion) return;
    if (!alarm || alarm.periodInMinutes) return updateBadge();
  }).catch((error) => queueBadgeRetry(error, version));
}

chrome.runtime.onInstalled.addListener(() => {
  ensureActionIcon();
  return updateBadge();
});
chrome.runtime.onStartup.addListener(() => {
  ensureActionIcon();
  return updateBadge();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === BADGE_ALARM) return updateBadge();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local" || !changes[STORAGE_KEY]) return;
  // The event already carries the latest value, including deletion; avoid an
  // extra storage round trip and invalidate any older read still in flight.
  return updateBadge(changes[STORAGE_KEY].newValue);
});

// Alarms can disappear across sessions/reloads. Check the cheap alarm record
// on worker startup; read deadlines only if a schedule is missing or legacy.
ensureActionIcon();
recoverBadgeAlarm();
