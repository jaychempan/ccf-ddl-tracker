// Loaded only when conference recommendations are requested. Shared URL and
// timezone helpers remain in popup.js for saved deadlines and manual entry.

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
  let currentPlace = null;
  let pendingDeadline = null;
  let pendingComment = null;

  const flushPending = () => {
    if (!pendingDeadline || !current) return;
    const iso = parseDeadlineWithTimezone(pendingDeadline, currentTimezone);
    if (!iso) return;
    const suffix = pendingComment ? ` (${pendingComment})` : "";
    const title = currentYear ? `${current.title} ${currentYear}${suffix}` : `${current.title}${suffix}`;
    items.push({
      title,
      datetime: iso,
      url: normalizeConferenceUrl(current.link),
      description: current.description || "",
      sub: current.sub || "",
      rank: current.rank || {},
      place: currentPlace || "",
    });
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
      currentPlace = null;
      return;
    }

    if (!current) return;

    if (trimmed.startsWith("description:")) {
      current.description = trimmed.replace("description:", "").trim().replace(/^['"]|['"]$/g, "");
      return;
    }

    if (trimmed.startsWith("sub:")) {
      current.sub = trimmed.replace("sub:", "").trim().replace(/^['"]|['"]$/g, "").toUpperCase();
      return;
    }

    if (trimmed.startsWith("ccf:")) {
      current.rank = { ...(current.rank || {}), ccf: trimmed.replace("ccf:", "").trim().replace(/^['"]|['"]$/g, "") };
      return;
    }

    if (trimmed.startsWith("core:")) {
      current.rank = { ...(current.rank || {}), core: trimmed.replace("core:", "").trim().replace(/^['"]|['"]$/g, "") };
      return;
    }

    if (trimmed.startsWith("thcpl:")) {
      current.rank = { ...(current.rank || {}), thcpl: trimmed.replace("thcpl:", "").trim().replace(/^['"]|['"]$/g, "") };
      return;
    }

    if (trimmed.startsWith("year:")) {
      currentYear = trimmed.replace("year:", "").trim();
      currentPlace = null;
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

    if (trimmed.startsWith("place:")) {
      currentPlace = trimmed.replace("place:", "").trim().replace(/^['"]|['"]$/g, "");
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

