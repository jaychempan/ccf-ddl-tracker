const STORAGE_KEY = "deadlines";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REFRESH_INTERVAL_MS = 60 * 1000;
const STARTUP_CLICK_GUARD_MS = 300;
const TIME_FORMAT_STORAGE_KEY = "timeFormat";
const DATE_ORDER_STORAGE_KEY = "dateOrder";
const TIMEZONE_STORAGE_KEY = "displayTimezone";
const PRECISE_COUNTDOWN_STORAGE_KEY = "preciseCountdown";
const DEFAULT_TIME_ZONE = "Asia/Shanghai";
const STANDARD_TIME_ZONE_OPTIONS = [
  { value: "UTC", group: "featured", zh: "协调世界时", en: "Coordinated Universal Time" },
  { value: "Etc/GMT+12", group: "featured", zh: "AOE - 全球最晚时区", en: "AOE - Anywhere on Earth" },
  { value: DEFAULT_TIME_ZONE, group: "featured", zh: "中国 - 上海", en: "China - Shanghai" },
  { value: "America/Los_Angeles", group: "featured", zh: "美国 - 洛杉矶", en: "United States - Los Angeles" },
  { value: "America/New_York", group: "featured", zh: "美国 - 纽约", en: "United States - New York" },
  { value: "Europe/London", group: "featured", zh: "英国 - 伦敦", en: "United Kingdom - London" },
  { value: "Europe/Berlin", group: "featured", zh: "德国 - 柏林", en: "Germany - Berlin" },
  { value: "Asia/Tokyo", group: "featured", zh: "日本 - 东京", en: "Japan - Tokyo" },
  { value: "Australia/Sydney", group: "featured", zh: "澳大利亚 - 悉尼", en: "Australia - Sydney" },
  { value: "Asia/Hong_Kong", group: "asia_pacific", zh: "中国香港 - 香港", en: "Hong Kong - Hong Kong" },
  { value: "Asia/Singapore", group: "asia_pacific", zh: "新加坡 - 新加坡", en: "Singapore - Singapore" },
  { value: "Asia/Seoul", group: "asia_pacific", zh: "韩国 - 首尔", en: "South Korea - Seoul" },
  { value: "Asia/Taipei", group: "asia_pacific", zh: "中国台湾 - 台北", en: "Taiwan - Taipei" },
  { value: "Asia/Kolkata", group: "asia_pacific", zh: "印度 - 加尔各答", en: "India - Kolkata" },
  { value: "Asia/Bangkok", group: "asia_pacific", zh: "泰国 - 曼谷", en: "Thailand - Bangkok" },
  { value: "Asia/Ho_Chi_Minh", group: "asia_pacific", zh: "越南 - 胡志明市", en: "Vietnam - Ho Chi Minh City" },
  { value: "Asia/Jakarta", group: "asia_pacific", zh: "印度尼西亚 - 雅加达", en: "Indonesia - Jakarta" },
  { value: "Asia/Manila", group: "asia_pacific", zh: "菲律宾 - 马尼拉", en: "Philippines - Manila" },
  { value: "Asia/Kuala_Lumpur", group: "asia_pacific", zh: "马来西亚 - 吉隆坡", en: "Malaysia - Kuala Lumpur" },
  { value: "Asia/Dubai", group: "asia_pacific", zh: "阿联酋 - 迪拜", en: "United Arab Emirates - Dubai" },
  { value: "Australia/Melbourne", group: "asia_pacific", zh: "澳大利亚 - 墨尔本", en: "Australia - Melbourne" },
  { value: "Pacific/Auckland", group: "asia_pacific", zh: "新西兰 - 奥克兰", en: "New Zealand - Auckland" },
  { value: "Europe/Lisbon", group: "europe_africa", zh: "葡萄牙 - 里斯本", en: "Portugal - Lisbon" },
  { value: "Europe/Paris", group: "europe_africa", zh: "法国 - 巴黎", en: "France - Paris" },
  { value: "Europe/Madrid", group: "europe_africa", zh: "西班牙 - 马德里", en: "Spain - Madrid" },
  { value: "Europe/Rome", group: "europe_africa", zh: "意大利 - 罗马", en: "Italy - Rome" },
  { value: "Europe/Amsterdam", group: "europe_africa", zh: "荷兰 - 阿姆斯特丹", en: "Netherlands - Amsterdam" },
  { value: "Europe/Zurich", group: "europe_africa", zh: "瑞士 - 苏黎世", en: "Switzerland - Zurich" },
  { value: "Europe/Warsaw", group: "europe_africa", zh: "波兰 - 华沙", en: "Poland - Warsaw" },
  { value: "Europe/Stockholm", group: "europe_africa", zh: "瑞典 - 斯德哥尔摩", en: "Sweden - Stockholm" },
  { value: "Europe/Helsinki", group: "europe_africa", zh: "芬兰 - 赫尔辛基", en: "Finland - Helsinki" },
  { value: "Europe/Istanbul", group: "europe_africa", zh: "土耳其 - 伊斯坦布尔", en: "Turkey - Istanbul" },
  { value: "Europe/Moscow", group: "europe_africa", zh: "俄罗斯 - 莫斯科", en: "Russia - Moscow" },
  { value: "Africa/Johannesburg", group: "europe_africa", zh: "南非 - 约翰内斯堡", en: "South Africa - Johannesburg" },
  { value: "Africa/Nairobi", group: "europe_africa", zh: "肯尼亚 - 内罗毕", en: "Kenya - Nairobi" },
  { value: "Pacific/Honolulu", group: "americas", zh: "美国 - 檀香山", en: "United States - Honolulu" },
  { value: "America/Anchorage", group: "americas", zh: "美国 - 安克雷奇", en: "United States - Anchorage" },
  { value: "America/Denver", group: "americas", zh: "美国 - 丹佛", en: "United States - Denver" },
  { value: "America/Phoenix", group: "americas", zh: "美国 - 菲尼克斯", en: "United States - Phoenix" },
  { value: "America/Chicago", group: "americas", zh: "美国 - 芝加哥", en: "United States - Chicago" },
  { value: "America/Toronto", group: "americas", zh: "加拿大 - 多伦多", en: "Canada - Toronto" },
  { value: "America/Halifax", group: "americas", zh: "加拿大 - 哈利法克斯", en: "Canada - Halifax" },
  { value: "America/Vancouver", group: "americas", zh: "加拿大 - 温哥华", en: "Canada - Vancouver" },
  { value: "America/Mexico_City", group: "americas", zh: "墨西哥 - 墨西哥城", en: "Mexico - Mexico City" },
  { value: "America/Bogota", group: "americas", zh: "哥伦比亚 - 波哥大", en: "Colombia - Bogota" },
  { value: "America/Lima", group: "americas", zh: "秘鲁 - 利马", en: "Peru - Lima" },
  { value: "America/Santiago", group: "americas", zh: "智利 - 圣地亚哥", en: "Chile - Santiago" },
  { value: "America/Sao_Paulo", group: "americas", zh: "巴西 - 圣保罗", en: "Brazil - Sao Paulo" },
  { value: "America/Argentina/Buenos_Aires", group: "americas", zh: "阿根廷 - 布宜诺斯艾利斯", en: "Argentina - Buenos Aires" },
];
const STANDARD_TIME_ZONE_MAP = new Map(STANDARD_TIME_ZONE_OPTIONS.map((option) => [option.value, option]));

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
const preciseCountdownToggle = document.getElementById("precise-countdown-toggle");

let ccfddlItems = [];
let currentLang = "zh";
const LANG_STORAGE_KEY = "language";
let currentTimeFormat = "24h";
let currentDateOrder = "ymd";
let currentTimeZone = DEFAULT_TIME_ZONE;
let isPreciseCountdownEnabled = false;
let refreshTimer = null;
let refreshButtonAnimationTimer = null;
let isAddFormExpanded = false;
let isCcfddlExpanded = false;
let isCcfddlDropdownOpen = false;
let isCcfddlLoading = false;
let isSettingsOpen = false;
const popupOpenedAt = performance.now();
const SUPPORTED_TIME_ZONES = getSupportedTimeZones();
const AVAILABLE_TIME_ZONES = getAvailableTimeZones();

const translations = {
  zh: {
    title: "CCF DDL Tracker",
    subtitle_zh: "一键添加和管理你的截止日期，徽标显示最近的剩余天数",
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
    import_empty: "推荐会议会显示在这里",
    my_section: "我的截止日期",
    empty_state: "还没有添加任何截止日期",
    refresh_button: "刷新",
    settings_button: "设置",
    settings_title: "显示设置",
    timezone_label: "显示时区",
    timezone_group_featured: "常用",
    timezone_group_asia_pacific: "亚太",
    timezone_group_europe_africa: "欧洲 / 非洲",
    timezone_group_americas: "美洲",
    timezone_group_custom: "当前保存的时区",
    time_format_label: "时间显示",
    time_format_24h: "24 小时制",
    time_format_12h: "12 小时制",
    date_order_label: "日期顺序",
    date_order_ymd: "年月日",
    date_order_mdy: "月日年",
    countdown_label: "倒计时显示",
    countdown_precise: "显示小时和分钟",
    open_site: "打开会议官网",
    add_item: "添加",
    delete_item: "删除",
    remaining: (days) => `剩余 ${days} 天`,
    remaining_precise: ({ days, hours, minutes }) => {
      const parts = [];
      if (days > 0) parts.push(`${days} 天`);
      if (days > 0 || hours > 0) parts.push(`${hours} 小时`);
      parts.push(`${minutes} 分钟`);
      return `剩余 ${parts.join(" ")}`;
    },
    load_failed: "加载失败，请稍后重试",
    invalid_date: "无效日期",
    timezone_note: (label) => `按当前时区保存：${label}`,
  },
  en: {
    title: "CCF DDL Tracker",
    subtitle_zh: "",
    subtitle_en: "Add and manage your deadlines in one click, and show the nearest days left",
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
    import_empty: "Recommended conferences will appear here",
    my_section: "My DDLs",
    empty_state: "No deadlines yet",
    refresh_button: "Refresh",
    settings_button: "Settings",
    settings_title: "Display Settings",
    timezone_label: "Display Time Zone",
    timezone_group_featured: "Featured",
    timezone_group_asia_pacific: "Asia-Pacific",
    timezone_group_europe_africa: "Europe / Africa",
    timezone_group_americas: "Americas",
    timezone_group_custom: "Saved Time Zone",
    time_format_label: "Time Format",
    time_format_24h: "24-hour clock",
    time_format_12h: "12-hour clock",
    date_order_label: "Date Order",
    date_order_ymd: "Year / Month / Day",
    date_order_mdy: "Month / Day / Year",
    countdown_label: "Countdown Display",
    countdown_precise: "Show hours and minutes",
    open_site: "Open conference website",
    add_item: "Add",
    delete_item: "Delete",
    remaining: (days) => `${days} days left`,
    remaining_precise: ({ days, hours, minutes }) => {
      const parts = [];
      if (days > 0) parts.push(`${days}d`);
      if (days > 0 || hours > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);
      return `${parts.join(" ")} left`;
    },
    load_failed: "Failed to load, please try again",
    invalid_date: "Invalid date",
    timezone_note: (label) => `Saved in selected time zone: ${label}`,
  },
};

function getSupportedTimeZones() {
  if (typeof Intl.supportedValuesOf !== "function") {
    return new Set(STANDARD_TIME_ZONE_OPTIONS.map(({ value }) => value));
  }

  try {
    const supported = new Set(["UTC", ...Intl.supportedValuesOf("timeZone")]);

    STANDARD_TIME_ZONE_OPTIONS.forEach(({ value }) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
        supported.add(value);
      } catch (error) {
        // Ignore zones unsupported by the current runtime.
      }
    });

    return supported;
  } catch (error) {
    return new Set(STANDARD_TIME_ZONE_OPTIONS.map(({ value }) => value));
  }
}

function getAvailableTimeZones() {
  return STANDARD_TIME_ZONE_OPTIONS.map(({ value }) => value).filter((value) => SUPPORTED_TIME_ZONES.has(value));
}

function t(key, fallback = "") {
  const entry = translations[currentLang]?.[key];
  if (typeof entry === "function") return entry;
  return entry ?? fallback;
}

function getLocale() {
  return currentLang === "en" ? "en-US" : "zh-CN";
}

function isSupportedTimeZone(timeZone) {
  return SUPPORTED_TIME_ZONES.has(timeZone);
}

function sanitizeTimeZone(timeZone) {
  if (isSupportedTimeZone(timeZone)) {
    return timeZone;
  }
  return DEFAULT_TIME_ZONE;
}

function getRenderableTimeZoneOptions(selectedTimeZone) {
  const options = STANDARD_TIME_ZONE_OPTIONS.filter(({ value }) => AVAILABLE_TIME_ZONES.includes(value));

  if (
    selectedTimeZone &&
    isSupportedTimeZone(selectedTimeZone) &&
    !options.some(({ value }) => value === selectedTimeZone)
  ) {
    options.push({
      value: selectedTimeZone,
      group: "custom",
      zh: `自定义 - ${formatTimeZoneIdentifier(selectedTimeZone)}`,
      en: `Custom - ${formatTimeZoneIdentifier(selectedTimeZone)}`,
    });
  }

  return options;
}

function getTimeZoneNamePart(locale, timeZone, timeZoneName) {
  try {
    return (
      new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName,
      })
        .formatToParts(new Date())
        .find((part) => part.type === "timeZoneName")?.value || ""
    );
  } catch (error) {
    return "";
  }
}

function formatTimeZoneIdentifier(timeZone) {
  return timeZone
    .split("/")
    .map((part) => part.replace(/_/g, " "))
    .join(" / ");
}

function getTimeZoneOffsetLabel(timeZone) {
  return getTimeZoneNamePart("en-US", timeZone, "longOffset").replace(/^GMT/, "UTC");
}

function getTimeZoneGroupLabel(group) {
  return t(`timezone_group_${group}`, group);
}

function getTimeZoneDisplayLabel(timeZone) {
  const option = STANDARD_TIME_ZONE_MAP.get(timeZone);
  const localizedName =
    option?.[currentLang] ||
    getTimeZoneNamePart(getLocale(), timeZone, "longGeneric") ||
    getTimeZoneNamePart(getLocale(), timeZone, "long") ||
    formatTimeZoneIdentifier(timeZone);
  const offset = getTimeZoneOffsetLabel(timeZone);

  if (!offset) {
    return localizedName;
  }

  return currentLang === "en"
    ? `${localizedName} (${offset})`
    : `${localizedName}（${offset}）`;
}

function syncTimeZoneSelect() {
  if (!timeZoneSelect) return;

  const selectedTimeZone = sanitizeTimeZone(currentTimeZone);
  const renderableOptions = getRenderableTimeZoneOptions(selectedTimeZone);
  const shouldRebuild =
    timeZoneSelect.dataset.lang !== currentLang ||
    timeZoneSelect.options.length !== renderableOptions.length ||
    !timeZoneSelect.querySelector(`option[value="${selectedTimeZone}"]`);

  if (shouldRebuild) {
    timeZoneSelect.innerHTML = "";
    const groupElements = new Map();

    renderableOptions.forEach(({ group, value }) => {
      let parent = timeZoneSelect;
      if (group) {
        if (!groupElements.has(group)) {
          const optgroup = document.createElement("optgroup");
          optgroup.label = getTimeZoneGroupLabel(group);
          groupElements.set(group, optgroup);
          timeZoneSelect.appendChild(optgroup);
        }
        parent = groupElements.get(group);
      }

      const option = document.createElement("option");
      option.value = value;
      option.textContent = getTimeZoneDisplayLabel(value);
      parent.appendChild(option);
    });

    timeZoneSelect.dataset.lang = currentLang;
  }

  if (timeZoneSelect.value !== selectedTimeZone) {
    timeZoneSelect.value = selectedTimeZone;
  }
}

function syncTimeZoneNote() {
  if (!timeZoneNote) return;
  const renderNote = t("timezone_note", (label) => `按当前时区保存：${label}`);
  timeZoneNote.textContent = renderNote(getTimeZoneDisplayLabel(sanitizeTimeZone(currentTimeZone)));
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
  syncPreciseCountdownToggle();
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

function getCountdownParts(datetime) {
  const ts = toTimestamp(datetime);
  if (ts === null) return null;

  const diff = Math.max(0, ts - Date.now());
  const totalMinutes = Math.floor(diff / (60 * 1000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

function formatTimeZoneAbbreviation(value) {
  if (!value) return "";
  return value.replace(/^GMT/, "UTC");
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
  const timeZoneLabel = formatTimeZoneAbbreviation(parts.timeZoneName);
  const timeZoneName = timeZoneLabel ? ` ${timeZoneLabel}` : "";
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

function syncPreciseCountdownToggle() {
  if (!preciseCountdownToggle) return;
  preciseCountdownToggle.checked = isPreciseCountdownEnabled;
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

function setPreciseCountdown(enabled) {
  isPreciseCountdownEnabled = Boolean(enabled);
  syncPreciseCountdownToggle();
  chrome.storage.local.set({ [PRECISE_COUNTDOWN_STORAGE_KEY]: isPreciseCountdownEnabled });
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
    ccfddlEmpty.textContent = t("import_empty", "推荐会议会显示在这里");
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
      ccfddlEmpty.textContent = t("import_empty", "推荐会议会显示在这里");
      ccfddlEmpty.style.display = isCcfddlExpanded && isCcfddlDropdownOpen ? "block" : "none";
    }
    return;
  }

  ccfddlItems = items;
  ccfddlEmpty.textContent = t("import_empty", "推荐会议会显示在这里");
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
      ccfddlEmpty.textContent = t("load_failed", "加载失败，请稍后重试");
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
    const countdown = getCountdownParts(item.datetime);
    if (countdown === null) {
      remaining.textContent = "";
    } else if (isPreciseCountdownEnabled) {
      const remainingText = t("remaining_precise", ({ days, hours, minutes }) => {
        const parts = [];
        if (days > 0) parts.push(`${days} 天`);
        if (days > 0 || hours > 0) parts.push(`${hours} 小时`);
        parts.push(`${minutes} 分钟`);
        return `剩余 ${parts.join(" ")}`;
      });
      remaining.textContent = remainingText(countdown);
    } else {
      const remainingDays = countdown.days;
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
    [PRECISE_COUNTDOWN_STORAGE_KEY]: false,
  },
  (result) => {
    currentLang = result[LANG_STORAGE_KEY] || "zh";
    currentTimeFormat = result[TIME_FORMAT_STORAGE_KEY] || "24h";
    currentDateOrder = result[DATE_ORDER_STORAGE_KEY] || "ymd";
    currentTimeZone = sanitizeTimeZone(result[TIMEZONE_STORAGE_KEY] || DEFAULT_TIME_ZONE);
    isPreciseCountdownEnabled = Boolean(result[PRECISE_COUNTDOWN_STORAGE_KEY]);
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
preciseCountdownToggle?.addEventListener("change", () => {
  setPreciseCountdown(preciseCountdownToggle.checked);
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
