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

function parseDeadlineWithTimezone(deadline, timezone) {
  const match = deadline?.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "00"] = match;
  const zone = timezone?.trim().toUpperCase() === "AOE" ? "UTC-12" : timezone || "UTC";
  const offset = parseFixedOffsetTimeZone(zone);
  if (!offset) return null;
  const value = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`);
  return Number.isFinite(value.getTime()) ? value.toISOString() : null;
}

// Parse the generated allconf.yml subset by collecting an entire edition first.
// Its timezone/place usually follow timeline entries; emitting on each line would
// apply the previous edition's timezone. Star keys are edition IDs, not series keys.
function parseAllConfYaml(text) {
  const conferences = [];
  let conference, edition, round;
  const scalar = (value) => value.trim().replace(/^['"]|['"]$/g, "");
  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(/^(?:-\s+)?([a-z_]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, raw] = match;
    const value = scalar(raw);
    if (key === "title") {
      conference = { title: value, rank: {}, editions: [] };
      conferences.push(conference);
      edition = round = null;
    } else if (!conference) continue;
    else if (key === "year") {
      edition = { year: value, rounds: [] };
      conference.editions.push(edition);
      round = null;
    } else if (["description", "sub"].includes(key)) conference[key] = value;
    else if (["ccf", "core", "thcpl"].includes(key)) conference.rank[key] = value;
    else if (edition && ["id", "link", "timezone", "place"].includes(key)) edition[key] = value;
    else if (edition && /^(abstract_deadline|deadline|rebuttal_deadline|decision_deadline)$/.test(key)) {
      if (line.trim().startsWith("- ") || !round) {
        round = {};
        edition.rounds.push(round);
      }
      round[key] = value;
    } else if (round && key === "comment") round.comment = value;
  }
  const items = [];
  for (const conf of conferences) for (const ed of conf.editions) {
    for (const [roundIndex, entry] of ed.rounds.entries()) {
      for (const stage of ["abstract_deadline", "deadline", "rebuttal_deadline", "decision_deadline"]) {
        const datetime = parseDeadlineWithTimezone(entry[stage], ed.timezone);
        if (!datetime) continue;
        const suffix = [entry.comment, stage === "deadline" ? "" : stage.replace("_deadline", "")].filter(Boolean).join(" · ");
        let url = "";
        try { const parsed = new URL(ed.link); if (["http:", "https:"].includes(parsed.protocol)) url = parsed.href; } catch {}
        items.push({
          title: `${conf.title} ${ed.year}${suffix ? ` (${suffix})` : ""}`,
          datetime, url, description: conf.description || "", sub: conf.sub || "",
          rank: conf.rank, place: ed.place || "",
          ...(ed.id ? {
            conferenceId: ed.id, conferenceDeadlineId: `${ed.id}:${roundIndex}:${stage}`,
            conferenceTitle: `${conf.title} ${ed.year}`, deadlineStage: stage,
            deadlineRound: roundIndex, deadlineRoundLabel: entry.comment || "",
          } : {}),
        });
      }
    }
  }
  return items;
}

globalThis.CcfddlConferenceParser = { parseAllConfYaml };
