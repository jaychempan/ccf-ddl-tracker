const STORAGE_KEY = "deadlines";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 60 * 1000;
const STARTUP_CLICK_GUARD_MS = 300;
const TIME_FORMAT_STORAGE_KEY = "timeFormat";
const DATE_ORDER_STORAGE_KEY = "dateOrder";
const TIMEZONE_STORAGE_KEY = "displayTimezone";
const DEFAULT_TIME_ZONE = "Asia/Shanghai";
const FALLBACK_TIME_ZONES = [
  DEFAULT_TIME_ZONE,
  "UTC",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const form = document.getElementById("deadline-form");
const titleInput = document.getElementById("title");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const timeZoneNote = document.getElementById("timezone-note");
const listEl = document.getElementById("deadline-list");
const emptyEl = document.getElementById("empty-state");
const countEl = document.getElementById("count");
const addActionBtn = document.getElementById("show-add-panel");
const importActionBtn = document.getElementById("show-import-panel");
const addPanel = document.getElementById("add-panel");
const importPanel = document.getElementById("import-panel");
const ccfddlSearchInput = document.getElementById("ccfddl-search");
const ccfddlDropdown = document.getElementById("ccfddl-dropdown");
const ccfddlList = document.getElementById("ccfddl-list");
const ccfddlEmpty = document.getElementById("ccfddl-empty");
const langToggle = document.getElementById("lang-toggle");
const settingsToggle = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("settings-panel");
const refreshDeadlinesBtn = document.getElementById("refresh-deadlines");
const timeFormatInputs = Array.from(document.querySelectorAll('input[name="time-format"]'));
const dateOrderInputs = Array.from(document.querySelectorAll('input[name="date-order"]'));
const timeZoneSelect = document.getElementById("timezone-select");

let ccfddlItems = [];
let currentLang = "zh";
const LANG_STORAGE_KEY = "language";
let currentTimeFormat = "24h";
let currentDateOrder = "ymd";
let currentTimeZone = DEFAULT_TIME_ZONE;
let refreshTimer = null;
let refreshButtonAnimationTimer = null;
let isAddFormExpanded = false;
let isCcfddlExpanded = false;
let isCcfddlDropdownOpen = false;
let isCcfddlLoading = false;
let isSettingsOpen = false;
const popupOpenedAt = performance.now();
const AVAILABLE_TIME_ZONES = getAvailableTimeZones();

const translations = {
  zh: {
    title: "CCF DDL Tracker",
    subtitle_zh: "添加你正在赶的截止日期，徽标显示最近的剩余天数。",
    subtitle_en: "",
    open: "打开 CCFDDL",
    contribute: "共同开发",
    add_section: "新增截止日期",
    add_hint: "手动填写标题、日期和时间",
    title_label: "标题",
    title_placeholder: "例如：ACL 2025",
    date_label: "日期",
    time_label: "时间",
    add_button: "添加",
    import_section: "从 CCFDDL 导入",
    import_hint_short: "加载推荐会议并一键加入",
    loading: "加载中...",
    search_label: "搜索会议",
    search_placeholder: "例如：ICML / SIGMOD",
    import_click_hint: "点击搜索框可获取最新会议列表",
    import_empty: "推荐会议会显示在这里。",
    my_section: "我的截止日期",
    empty_state: "还没有添加任何截止日期。",
    refresh_button: "刷新",
    settings_button: "设置",
    settings_title: "显示设置",
    timezone_label: "显示时区",
    time_format_label: "时间显示",
    time_format_24h: "24 小时制",
    time_format_12h: "12 小时制",
    date_order_label: "日期顺序",
    date_order_ymd: "年月日",
    date_order_mdy: "月日年",
    open_site: "打开会议官网",
    add_item: "添加",
    delete_item: "删除",
    remaining: (days) => `剩余 ${days} 天`,
    load_failed: "加载失败，请稍后重试。",
    invalid_date: "无效日期",
    timezone_note: (label) => `按当前时区保存：${label}`,
  },
  en: {
    title: "CCF DDL Tracker",
    subtitle_zh: "",
    subtitle_en: "Track deadlines and show the nearest days left.",
    open: "Open CCFDDL",
    contribute: "Contribute",
    add_section: "Add DDL",
    add_hint: "Add a title, date, and time",
    title_label: "Title",
    title_placeholder: "e.g., ACL 2025",
    date_label: "Date",
    time_label: "Time",
    add_button: "Add",
    import_section: "Import CCFDDL",
    import_hint_short: "Browse conferences and add them fast",
    loading: "Loading...",
    search_label: "Search",
    search_placeholder: "e.g., ICML / SIGMOD",
    import_click_hint: "Click the search box to load the latest conferences",
    import_empty: "Recommended conferences will appear here.",
    my_section: "My DDLs",
    empty_state: "No deadlines yet.",
    refresh_button: "Refresh",
    settings_button: "Settings",
    settings_title: "Display Settings",
    timezone_label: "Display Time Zone",
    time_format_label: "Time Format",
    time_format_24h: "24-hour clock",
    time_format_12h: "12-hour clock",
    date_order_label: "Date Order",
    date_order_ymd: "Year / Month / Day",
    date_order_mdy: "Month / Day / Year",
    open_site: "Open conference website",
    add_item: "Add",
    delete_item: "Delete",
    remaining: (days) => `${days} days left`,
    load_failed: "Failed to load. Please try again.",
    invalid_date: "Invalid date",
    timezone_note: (label) => `Saved in selected time zone: ${label}`,
  },
};

function getAvailableTimeZones() {
  if (typeof Intl.supportedValuesOf !== "function") {
    return [...FALLBACK_TIME_ZONES];
  }

  try {
    const supported = Intl.supportedValuesOf("timeZone");
    const deduped = Array.from(new Set([DEFAULT_TIME_ZONE, "UTC", ...supported]));
    return deduped.sort((left, right) => {
      if (left === DEFAULT_TIME_ZONE) return -1;
      if (right === DEFAULT_TIME_ZONE) return 1;
      if (left === "UTC") return -1;
      if (right === "UTC") return 1;
      return left.localeCompare(right);
    });
  } catch (error) {
    return [...FALLBACK_TIME_ZONES];
  }
}

function t(key, fallback = "") {
  const entry = translations[currentLang]?.[key];
  if (typeof entry === "function") return entry;
  return entry ?? fallback;
}

function getLocale() {
  return currentLang === "en" ? "en-US" : "zh-CN";
}

function sanitizeTimeZone(timeZone) {
  if (AVAILABLE_TIME_ZONES.includes(timeZone)) {
    return timeZone;
  }
  return DEFAULT_TIME_ZONE;
}

function syncTimeZoneSelect() {
  if (!timeZoneSelect) return;

  const selectedTimeZone = sanitizeTimeZone(currentTimeZone);
  const shouldRebuild =
    timeZoneSelect.options.length !== AVAILABLE_TIME_ZONES.length ||
    !timeZoneSelect.querySelector(`option[value="${selectedTimeZone}"]`);

  if (shouldRebuild) {
    timeZoneSelect.innerHTML = "";
    AVAILABLE_TIME_ZONES.forEach((timeZone) => {
      const option = document.createElement("option");
      option.value = timeZone;
      option.textContent = timeZone;
      timeZoneSelect.appendChild(option);
    });
  }

  if (timeZoneSelect.value !== selectedTimeZone) {
    timeZoneSelect.value = selectedTimeZone;
  }
}

function syncTimeZoneNote() {
  if (!timeZoneNote) return;
  const renderNote = t("timezone_note", (label) => `按当前时区保存：${label}`);
  timeZoneNote.textContent = renderNote(sanitizeTimeZone(currentTimeZone));
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(key, el.textContent);
    el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    const value = t(key, el.getAttribute("aria-label") || "");
    el.setAttribute("aria-label", value);
    el.setAttribute("title", value);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(key, el.getAttribute("placeholder") || ""));
  });

  if (langToggle) {
    langToggle.textContent = currentLang === "zh" ? "EN" : "ZH";
  }

  const locale = getLocale();
  document.documentElement.setAttribute("lang", locale);
  timeInput?.setAttribute("lang", locale);
  syncTimeZoneSelect();
  syncTimeZoneNote();
  syncTimeFormatInputs();
  syncDateOrderInputs();
  syncDateInputMode();
  syncActionButtons();
}

function syncDateInputMode() {
  if (!dateInput) return;

  const currentValue = dateInput.value;
  if (dateInput.type !== "date") {
    dateInput.type = "date";
  }

  dateInput.setAttribute("lang", currentLang === "en" ? "en-US" : "zh-CN");
  dateInput.placeholder = "";

  if (currentValue) {
    dateInput.value = currentValue;
  }
}

function setLanguage(lang) {
  currentLang = lang;
  applyTranslations();
  chrome.storage.local.set({ [LANG_STORAGE_KEY]: currentLang });
  renderCcfddlList(ccfddlItems);
  loadDeadlines();
}

function setAddFormExpanded(expanded) {
  isAddFormExpanded = expanded;
  addPanel.hidden = !expanded;
  if (expanded) {
    setCcfddlDropdownOpen(false);
  }
  syncActionButtons();
}

function syncActionButtons() {
  if (addActionBtn) {
    addActionBtn.classList.toggle("is-active", isAddFormExpanded);
    addActionBtn.setAttribute("aria-pressed", isAddFormExpanded ? "true" : "false");
  }
  if (importActionBtn) {
    importActionBtn.classList.toggle("is-active", isCcfddlExpanded);
    importActionBtn.setAttribute("aria-pressed", isCcfddlExpanded ? "true" : "false");
  }
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function toTimestamp(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function normalizeDateInput(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return trimmed;
  }

  const slashMatch = trimmed.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (slashMatch) {
    const [, year, month, day] = slashMatch;
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

function daysLeft(datetime) {
  const ts = toTimestamp(datetime);
  if (ts === null) return null;
  const diff = ts - Date.now();
  return Math.max(0, Math.floor(diff / MS_PER_DAY));
}

function getDateTimeParts(date, includeTimeZoneName = false) {
  const formatter = new Intl.DateTimeFormat(getLocale(), {
    timeZone: sanitizeTimeZone(currentTimeZone),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: currentTimeFormat === "12h",
    ...(currentTimeFormat === "24h" ? { hourCycle: "h23" } : {}),
    ...(includeTimeZoneName ? { timeZoneName: "short" } : {}),
  });

  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
}

function formatDate(datetime) {
  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return t("invalid_date", "无效日期");

  const parts = getDateTimeParts(date, true);
  const year = parts.year;
  const month = parts.month;
  const day = parts.day;
  const dateText =
    currentDateOrder === "mdy"
      ? `${month}/${day}/${year}`
      : `${year}/${month}/${day}`;
  const timeZoneName = parts.timeZoneName ? ` ${parts.timeZoneName}` : "";
  if (currentTimeFormat === "12h") {
    const period = parts.dayPeriod ? `${parts.dayPeriod} ` : "";
    return `${dateText} ${period}${parts.hour}:${parts.minute}${timeZoneName}`;
  }

  return `${dateText} ${parts.hour}:${parts.minute}${timeZoneName}`;
}

function syncTimeFormatInputs() {
  timeFormatInputs.forEach((input) => {
    input.checked = input.value === currentTimeFormat;
  });
}

function syncDateOrderInputs() {
  dateOrderInputs.forEach((input) => {
    input.checked = input.value === currentDateOrder;
  });
}

function getTimeZoneOffsetMinutes(timeZone, date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});

  const utcTimestamp = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second)
  );

  return (utcTimestamp - date.getTime()) / (60 * 1000);
}

function buildIsoFromTimeZoneParts(parts, timeZone) {
  const { year, month, day, hour, minute, second = 0 } = parts;
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  let utcMs = naiveUtcMs;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, new Date(utcMs));
    const nextUtcMs = naiveUtcMs - offsetMinutes * 60 * 1000;
    if (nextUtcMs === utcMs) break;
    utcMs = nextUtcMs;
  }

  const value = new Date(utcMs);
  if (Number.isNaN(value.getTime())) return null;
  return value.toISOString();
}

function buildIsoFromTimeZoneInput(dateValue, timeValue, timeZone) {
  const dateMatch = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = (timeValue || "23:59").match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch) return null;

  return buildIsoFromTimeZoneParts(
    {
      year: Number(dateMatch[1]),
      month: Number(dateMatch[2]),
      day: Number(dateMatch[3]),
      hour: Number(timeMatch[1]),
      minute: Number(timeMatch[2]),
      second: 0,
    },
    timeZone
  );
}

function normalizeIcsTimeZoneHint(timeZoneHint) {
  return (timeZoneHint || "").trim().replace(/^"(.*)"$/, "$1");
}

function parseFixedOffsetTimeZone(timeZoneHint) {
  const normalized = normalizeIcsTimeZoneHint(timeZoneHint);
  if (!normalized) return "";
  if (normalized.toUpperCase() === "UTC" || normalized === "Z") return "Z";

  const utcOffsetMatch = normalized.match(/^UTC([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (utcOffsetMatch) {
    const [, sign, hourDigits, minuteDigits = "00"] = utcOffsetMatch;
    return `${sign}${hourDigits.padStart(2, "0")}:${minuteDigits}`;
  }

  const offsetMatch = normalized.match(/^([+-])(\d{2}):?(\d{2})$/);
  if (offsetMatch) {
    const [, sign, hourDigits, minuteDigits] = offsetMatch;
    return `${sign}${hourDigits}:${minuteDigits}`;
  }

  return "";
}

function parseIcsProperty(rawKey) {
  const [name, ...parameterEntries] = rawKey.split(";");
  const parameters = {};

  parameterEntries.forEach((entry) => {
    const [parameterName, ...parameterValueParts] = entry.split("=");
    if (!parameterName || parameterValueParts.length === 0) return;
    parameters[parameterName.toUpperCase()] = normalizeIcsTimeZoneHint(
      parameterValueParts.join("=")
    );
  });

  return { name, parameters };
}

function splitIcsLine(line) {
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === ":" && !inQuotes) {
      return [line.slice(0, index), line.slice(index + 1)];
    }
  }

  return [line, ""];
}

function setSettingsOpen(open) {
  isSettingsOpen = open;
  if (settingsPanel) {
    settingsPanel.hidden = !open;
  }
  if (settingsToggle) {
    settingsToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
}

function setTimeFormat(nextFormat) {
  if (nextFormat !== "24h" && nextFormat !== "12h") return;
  currentTimeFormat = nextFormat;
  syncTimeFormatInputs();
  chrome.storage.local.set({ [TIME_FORMAT_STORAGE_KEY]: currentTimeFormat });
  renderCcfddlList(ccfddlItems);
  loadDeadlines();
}

function setDateOrder(nextOrder) {
  if (nextOrder !== "ymd" && nextOrder !== "mdy") return;
  currentDateOrder = nextOrder;
  syncDateOrderInputs();
  chrome.storage.local.set({ [DATE_ORDER_STORAGE_KEY]: currentDateOrder });
  renderCcfddlList(ccfddlItems);
  loadDeadlines();
}

function setTimeZone(nextTimeZone) {
  currentTimeZone = sanitizeTimeZone(nextTimeZone);
  syncTimeZoneSelect();
  syncTimeZoneNote();
  chrome.storage.local.set({ [TIMEZONE_STORAGE_KEY]: currentTimeZone });
  renderCcfddlList(ccfddlItems);
  loadDeadlines();
}

function parseIcsDate(value, timeZoneHint = "") {
  if (!value) return null;
  const sanitized = value.trim();
  const dateTimeMatch =
    sanitized.match(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z|[+-]\d{4})?$/
    );
  if (dateTimeMatch) {
    const [, year, month, day, hour, minute, second, tz] = dateTimeMatch;
    const embeddedOffset = tz && tz !== "Z" ? `${tz.slice(0, 3)}:${tz.slice(3)}` : "";
    const fixedOffset = parseFixedOffsetTimeZone(timeZoneHint);
    const suffix = tz === "Z" ? "Z" : embeddedOffset || fixedOffset;
    if (suffix) {
      const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}${suffix}`;
      const date = new Date(iso);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    const normalizedTimeZone = normalizeIcsTimeZoneHint(timeZoneHint);
    if (normalizedTimeZone) {
      const iso = buildIsoFromTimeZoneParts(
        {
          year: Number(year),
          month: Number(month),
          day: Number(day),
          hour: Number(hour),
          minute: Number(minute),
          second: Number(second),
        },
        normalizedTimeZone
      );
      if (iso) {
        const date = new Date(iso);
        return Number.isNaN(date.getTime()) ? null : date;
      }
    }

    const localDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    return Number.isNaN(localDate.getTime()) ? null : localDate;
  }

  const dateOnlyMatch = sanitized.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    const date = new Date(`${year}-${month}-${day}T23:59:59`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(sanitized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseIcs(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const unfolded = [];
  lines.forEach((line) => {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      const previous = unfolded.pop() ?? "";
      unfolded.push(previous + line.trim());
    } else {
      unfolded.push(line);
    }
  });

  const events = [];
  let current = null;
  unfolded.forEach((line) => {
    if (line === "BEGIN:VEVENT") {
      current = {};
      return;
    }
    if (line === "END:VEVENT") {
      if (current) events.push(current);
      current = null;
      return;
    }
    if (!current) return;

    const [rawKey, value] = splitIcsLine(line);
    const { name: key, parameters } = parseIcsProperty(rawKey);
    if (key === "SUMMARY") current.summary = value;
    if (key === "DTSTART") {
      current.start = value;
      current.startTimeZone = parameters.TZID || "";
    }
    if (key === "URL") current.url = value;
  });

  return events
    .map((event) => {
      const date = parseIcsDate(event.start, event.startTimeZone);
      if (!event.summary || !date) return null;
      return {
        title: event.summary,
        datetime: date.toISOString(),
        url: event.url || "",
      };
    })
    .filter(Boolean);
}

function normalizeConferenceUrl(value) {
  if (!value) return "";
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed)) return `https://${trimmed}`;
  return "";
}

function parseTimezoneOffset(timezone) {
  if (!timezone) return 0;
  const normalized = timezone.trim();
  if (normalized.toUpperCase() === "AOE") return -12;
  const match = normalized.match(/UTC([+-]\d{1,2})/i);
  if (!match) return 0;
  return Number.parseInt(match[1], 10);
}

function parseDeadlineWithTimezone(deadline, timezone) {
  if (!deadline || deadline.toUpperCase() === "TBD") return null;
  const [datePart, timePart] = deadline.split(" ");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split("-").map((value) => Number(value));
  const [hour, minute, second] = timePart.split(":").map((value) => Number(value));
  if ([year, month, day, hour, minute, second].some((value) => Number.isNaN(value))) {
    return null;
  }
  const offsetHours = parseTimezoneOffset(timezone);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - offsetHours * 3600 * 1000;
  return new Date(utcMs).toISOString();
}

function parseAllConfYaml(text) {
  const items = [];
  let current = null;
  let currentTimezone = null;
  let currentYear = null;
  let pendingDeadline = null;
  let pendingComment = null;

  const flushPending = () => {
    if (!pendingDeadline || !current) return;
    const iso = parseDeadlineWithTimezone(pendingDeadline, currentTimezone);
    if (!iso) return;
    const suffix = pendingComment ? ` (${pendingComment})` : "";
    const title = currentYear ? `${current.title} ${currentYear}${suffix}` : `${current.title}${suffix}`;
    items.push({ title, datetime: iso, url: normalizeConferenceUrl(current.link) });
    pendingDeadline = null;
    pendingComment = null;
  };

  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    if (trimmed.startsWith("- title:")) {
      flushPending();
      const title = trimmed.replace("- title:", "").trim().replace(/^['"]|['"]$/g, "");
      current = { title };
      currentTimezone = null;
      currentYear = null;
      return;
    }

    if (!current) return;

    if (trimmed.startsWith("year:")) {
      currentYear = trimmed.replace("year:", "").trim();
      return;
    }

    if (trimmed.startsWith("timezone:")) {
      currentTimezone = trimmed.replace("timezone:", "").trim();
      return;
    }

    if (trimmed.startsWith("link:")) {
      current.link = trimmed.replace("link:", "").trim();
      return;
    }

    if (trimmed.startsWith("- deadline:") || trimmed.startsWith("deadline:")) {
      flushPending();
      pendingDeadline = trimmed.replace("- deadline:", "").replace("deadline:", "").trim();
      pendingDeadline = pendingDeadline.replace(/^['"]|['"]$/g, "");
      return;
    }

    if (trimmed.startsWith("- abstract_deadline:") || trimmed.startsWith("abstract_deadline:")) {
      flushPending();
      pendingDeadline = trimmed
        .replace("- abstract_deadline:", "")
        .replace("abstract_deadline:", "")
        .trim();
      pendingDeadline = pendingDeadline.replace(/^['"]|['"]$/g, "");
      pendingComment = pendingComment ? pendingComment : "abstract";
      return;
    }

    if (trimmed.startsWith("comment:")) {
      pendingComment = trimmed.replace("comment:", "").trim().replace(/^['"]|['"]$/g, "");
      return;
    }
  });

  flushPending();
  return items;
}

function renderCcfddlList(items) {
  ccfddlList.innerHTML = "";

  if (items.length === 0) {
    ccfddlEmpty.style.display = isCcfddlExpanded && isCcfddlDropdownOpen ? "block" : "none";
    return;
  }

  ccfddlEmpty.style.display = "none";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "import-item";

    const header = document.createElement("div");
    header.className = "import-item-header";

    const title = document.createElement("span");
    title.className = "import-title";
    title.textContent = item.title;

    const addBtn = document.createElement("button");
    addBtn.className = "import-add";
    addBtn.textContent = t("add_item", "添加");
    addBtn.addEventListener("click", () => addImportedDeadline(item));

    header.append(title, addBtn);

    const meta = document.createElement("div");
    meta.className = "import-meta";
    meta.textContent = formatDate(item.datetime);

    li.append(header, meta);
    ccfddlList.appendChild(li);
  });
}

function setCcfddlDropdownOpen(open) {
  isCcfddlDropdownOpen = open && isCcfddlExpanded;
  ccfddlDropdown.hidden = !isCcfddlDropdownOpen;

  if (!isCcfddlDropdownOpen) {
    ccfddlEmpty.style.display = "none";
    return;
  }

  if (ccfddlList.children.length === 0) {
    ccfddlEmpty.style.display = "block";
  } else {
    ccfddlEmpty.style.display = "none";
  }
}

function setCcfddlExpanded(expanded) {
  isCcfddlExpanded = expanded;
  importPanel.hidden = !expanded;

  if (!expanded) {
    setCcfddlDropdownOpen(false);
  } else if (ccfddlList.children.length === 0 && isCcfddlDropdownOpen) {
    ccfddlEmpty.textContent = t("import_empty", "推荐会议会显示在这里。");
    ccfddlEmpty.style.display = "block";
  } else {
    ccfddlEmpty.style.display = "none";
  }

  syncActionButtons();
}

function filterCcfddlList() {
  const keyword = ccfddlSearchInput.value.trim().toLowerCase();
  if (!keyword) {
    renderCcfddlList(ccfddlItems);
    return;
  }
  const normalizedKeyword = normalizeText(keyword);
  const filtered = ccfddlItems.filter((item) => {
    const title = item.title.toLowerCase();
    return (
      title.includes(keyword) ||
      normalizeText(title).includes(normalizedKeyword)
    );
  });
  renderCcfddlList(filtered);
}

function applyLoadedCcfddlItems(items) {
  if (items.length === 0) {
    if (ccfddlItems.length === 0) {
      ccfddlEmpty.textContent = t("import_empty", "推荐会议会显示在这里。");
      ccfddlEmpty.style.display = isCcfddlExpanded && isCcfddlDropdownOpen ? "block" : "none";
    }
    return;
  }

  ccfddlItems = items;
  ccfddlEmpty.textContent = t("import_empty", "推荐会议会显示在这里。");
  filterCcfddlList();
}

function addImportedDeadline(item) {
  chrome.storage.local.get({ [STORAGE_KEY]: [] }, (result) => {
    const existing = result[STORAGE_KEY];
    const matchIndex = existing.findIndex(
      (entry) => entry.title === item.title && entry.datetime === item.datetime
    );
    if (matchIndex >= 0) {
      const matchedItem = existing[matchIndex];
      if (matchedItem.url || !item.url) return;
      const updated = [...existing];
      updated[matchIndex] = { ...matchedItem, url: item.url };
      saveDeadlines(updated);
      return;
    }
    const updated = [...existing, item];
    saveDeadlines(updated);
  });
}

function mergeCcfddlItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.title}__${item.datetime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function loadCcfddlData() {
  if (isCcfddlLoading) return;
  isCcfddlLoading = true;
  ccfddlEmpty.textContent = t("loading", "加载中...");
  ccfddlEmpty.style.display = isCcfddlExpanded && isCcfddlDropdownOpen ? "block" : "none";
  try {
    const repoResponse = await fetch(
      "https://ccfddl.github.io/conference/allconf.yml"
    );
    if (repoResponse.ok) {
      const repoText = await repoResponse.text();
      const now = Date.now();
      const parsedItems = mergeCcfddlItems(parseAllConfYaml(repoText))
        .filter((item) => toTimestamp(item.datetime) >= now)
        .sort((a, b) => toTimestamp(a.datetime) - toTimestamp(b.datetime));
      applyLoadedCcfddlItems(parsedItems);
      return;
    }

    const [zhResponse, enResponse] = await Promise.all([
      fetch("https://ccfddl.com/conference/deadlines_zh.ics"),
      fetch("https://ccfddl.com/conference/deadlines_en.ics"),
    ]);
    const responses = [zhResponse, enResponse].filter((res) => res.ok);
    if (responses.length === 0) throw new Error("加载失败");
    const texts = await Promise.all(responses.map((res) => res.text()));
    const now = Date.now();
    const parsedItems = mergeCcfddlItems(texts.flatMap((text) => parseIcs(text)))
      .filter((item) => toTimestamp(item.datetime) >= now)
      .sort((a, b) => toTimestamp(a.datetime) - toTimestamp(b.datetime));
    applyLoadedCcfddlItems(parsedItems);
  } catch (error) {
    if (ccfddlItems.length === 0) {
      ccfddlEmpty.textContent = t("load_failed", "加载失败，请稍后重试。");
      ccfddlEmpty.style.display = isCcfddlExpanded && isCcfddlDropdownOpen ? "block" : "none";
    }
  } finally {
    isCcfddlLoading = false;
  }
}

async function openCcfddlDropdown() {
  if (!isCcfddlExpanded) return;

  setCcfddlDropdownOpen(true);
  if (ccfddlItems.length > 0) {
    filterCcfddlList();
    return;
  }

  renderCcfddlList([]);
  await loadCcfddlData();
}

async function toggleAddPanel() {
  if (isAddFormExpanded) {
    setAddFormExpanded(false);
    return;
  }

  setCcfddlExpanded(false);
  setAddFormExpanded(true);
  titleInput.focus();
}

async function toggleImportPanel() {
  if (isCcfddlExpanded) {
    setCcfddlExpanded(false);
    return;
  }

  setAddFormExpanded(false);
  setCcfddlExpanded(true);
}

function render(deadlines) {
  listEl.innerHTML = "";
  const sorted = [...deadlines].sort((a, b) => {
    return toTimestamp(a.datetime) - toTimestamp(b.datetime);
  });

  if (sorted.length === 0) {
    emptyEl.style.display = "block";
    countEl.textContent = "";
    return;
  }

  emptyEl.style.display = "none";
  countEl.textContent = currentLang === "zh" ? `(${sorted.length} 项)` : `(${sorted.length})`;

  sorted.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "item";
    const hasLink = Boolean(item.url);

    if (hasLink) {
      li.classList.add("is-linkable");
      li.tabIndex = 0;
      li.setAttribute("role", "link");
      li.setAttribute("title", t("open_site", "打开会议官网"));
      li.addEventListener("click", () => openDeadlineLink(item.url));
      li.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openDeadlineLink(item.url);
      });
    }

    const header = document.createElement("div");
    header.className = "item-header";

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = item.title;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = t("delete_item", "删除");
    del.addEventListener("click", (event) => {
      event.stopPropagation();
      removeDeadline(index);
    });

    header.append(title, del);

    const meta = document.createElement("div");
    meta.className = "item-meta";

    const date = document.createElement("span");
    date.textContent = formatDate(item.datetime);

    const remaining = document.createElement("span");
    const remainingDays = daysLeft(item.datetime);
    if (remainingDays === null) {
      remaining.textContent = "";
    } else {
      const remainingText = t("remaining", (days) => `剩余 ${days} 天`);
      remaining.textContent = remainingText(remainingDays);
    }

    meta.append(date, remaining);

    li.append(header, meta);
    listEl.appendChild(li);
  });
}

function openDeadlineLink(url) {
  const normalizedUrl = normalizeConferenceUrl(url);
  if (!normalizedUrl) return;

  if (chrome.tabs?.create) {
    chrome.tabs.create({ url: normalizedUrl });
    return;
  }

  window.open(normalizedUrl, "_blank", "noopener,noreferrer");
}

function loadDeadlines() {
  chrome.storage.local.get({ [STORAGE_KEY]: [] }, (result) => {
    render(result[STORAGE_KEY]);
  });
}

function animateRefreshButton() {
  if (!refreshDeadlinesBtn) return;
  refreshDeadlinesBtn.classList.add("is-spinning");
  if (refreshButtonAnimationTimer) {
    clearTimeout(refreshButtonAnimationTimer);
  }
  refreshButtonAnimationTimer = window.setTimeout(() => {
    refreshDeadlinesBtn.classList.remove("is-spinning");
    refreshButtonAnimationTimer = null;
  }, 700);
}

function shouldIgnoreStartupInteraction() {
  return performance.now() - popupOpenedAt < STARTUP_CLICK_GUARD_MS;
}

function startAutoRefresh() {
  if (refreshTimer) return;
  refreshTimer = setInterval(loadDeadlines, REFRESH_INTERVAL_MS);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      loadDeadlines();
    }
  });

  window.addEventListener("focus", loadDeadlines);
}

function saveDeadlines(deadlines) {
  chrome.storage.local.set({ [STORAGE_KEY]: deadlines }, () => {
    render(deadlines);
  });
}

function removeDeadline(index) {
  chrome.storage.local.get({ [STORAGE_KEY]: [] }, (result) => {
    const updated = result[STORAGE_KEY].filter((_, idx) => idx !== index);
    saveDeadlines(updated);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const date = normalizeDateInput(dateInput.value);
  const time = timeInput.value || "23:59";

  if (!title || !date) return;

  const datetime = buildIsoFromTimeZoneInput(
    date,
    time,
    sanitizeTimeZone(currentTimeZone)
  );
  if (!datetime) return;

  chrome.storage.local.get({ [STORAGE_KEY]: [] }, (result) => {
    const updated = [
      ...result[STORAGE_KEY],
      {
        title,
        datetime,
      },
    ];
    saveDeadlines(updated);
    form.reset();
    timeInput.value = "23:59";
    setAddFormExpanded(false);
  });
});

langToggle.addEventListener("click", () => {
  const next = currentLang === "zh" ? "en" : "zh";
  setLanguage(next);
});

chrome.storage.local.get(
  {
    [LANG_STORAGE_KEY]: "zh",
    [TIME_FORMAT_STORAGE_KEY]: "24h",
    [DATE_ORDER_STORAGE_KEY]: "ymd",
    [TIMEZONE_STORAGE_KEY]: DEFAULT_TIME_ZONE,
  },
  (result) => {
    currentLang = result[LANG_STORAGE_KEY] || "zh";
    currentTimeFormat = result[TIME_FORMAT_STORAGE_KEY] || "24h";
    currentDateOrder = result[DATE_ORDER_STORAGE_KEY] || "ymd";
    currentTimeZone = sanitizeTimeZone(result[TIMEZONE_STORAGE_KEY] || DEFAULT_TIME_ZONE);
    applyTranslations();
    setAddFormExpanded(false);
    setCcfddlExpanded(true);
    setSettingsOpen(false);
    renderCcfddlList(ccfddlItems);
    loadDeadlines();
    startAutoRefresh();
  }
);

addActionBtn.addEventListener("click", () => {
  setSettingsOpen(false);
  toggleAddPanel().catch(() => {});
});
importActionBtn.addEventListener("click", () => {
  if (shouldIgnoreStartupInteraction()) return;
  setSettingsOpen(false);
  toggleImportPanel().catch(() => {});
});
settingsToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  setSettingsOpen(!isSettingsOpen);
});
timeFormatInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    setTimeFormat(input.value);
  });
});
dateOrderInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    setDateOrder(input.value);
  });
});
timeZoneSelect?.addEventListener("change", () => {
  setTimeZone(timeZoneSelect.value);
});
ccfddlSearchInput.addEventListener("focus", () => {
  if (shouldIgnoreStartupInteraction()) return;
  openCcfddlDropdown().catch(() => {});
});
ccfddlSearchInput.addEventListener("click", () => {
  if (shouldIgnoreStartupInteraction()) return;
  openCcfddlDropdown().catch(() => {});
});
ccfddlSearchInput.addEventListener("input", filterCcfddlList);
refreshDeadlinesBtn.addEventListener("click", () => {
  animateRefreshButton();
  loadDeadlines();
});
document.addEventListener("pointerdown", (event) => {
  if (
    isSettingsOpen &&
    !settingsPanel?.contains(event.target) &&
    !settingsToggle?.contains(event.target)
  ) {
    setSettingsOpen(false);
  }
  if (!isCcfddlDropdownOpen) return;
  if (importPanel.hidden) return;
  if (importPanel.contains(event.target)) return;
  setCcfddlDropdownOpen(false);
});
