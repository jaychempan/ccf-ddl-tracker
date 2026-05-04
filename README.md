<div align="center">
  <img src="assets/ccf-ddl-tracker-logo.png" alt="CCF DDL Tracker Logo" width="96" />

  # CCF DDL Tracker

  Chrome extension for tracking CCF deadlines with a compact popup, import flow, and local-only storage.

  **Version:** `v2.3`

  [中文版本](README.zh-CN.md) ·
  [GitHub Pages](https://jaychempan.github.io/ccf-ddl-tracker/) ·
  [Chrome Web Store](https://chromewebstore.google.com/detail/fnnpcnlkehcbickmdmepjpjimgcleidd?utm_source=item-share-cb) ·
  [Chrome Extension README](chrome/README.md) ·
  [CCFDDL Source](https://github.com/ccfddl/ccf-deadlines) ·
  [Repository](https://github.com/jaychempan/ccf-ddl-tracker)
</div>

---

## Preview

<div align="center">
  <img src="assets/previewv2.0.png" alt="CCF DDL Tracker v2.0 Preview" width="720" />
</div>

The current popup keeps the compact layout, adds manual card links and draft restoration, defaults countdowns to minute precision, and refines footer shortcuts for GitHub, the extension home, and CCFDDL.

---

## Install

### Chrome Web Store

Install directly from the Chrome Web Store:

<div align="center">
  <a href="https://chromewebstore.google.com/detail/fnnpcnlkehcbickmdmepjpjimgcleidd?utm_source=item-share-cb" target="_blank" rel="noopener">
    <img src="https://fonts.gstatic.com/s/i/productlogos/chrome_store/v7/192px.svg" alt="Chrome Web Store" width="56" height="56" />
  </a>
</div>

### Load Unpacked

1. Open Chrome and visit `chrome://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the [`chrome/`](chrome/) directory in this repository.
5. Pin `CCF DDL Tracker` to the toolbar and click the icon to use it.

<details>
  <summary>Need more extension-specific details?</summary>

  See [chrome/README.md](chrome/README.md) for the extension-only guide.
</details>

---


## Highlights

- **Native popup experience**: Clicking the extension icon opens a compact Chrome popup instead of a separate window.
- **Manual + imported deadlines**: You can add custom deadlines or import recommended conferences from CCFDDL.
- **Official site shortcuts**: Imported conferences retain homepage links, and added cards can open the conference website directly.
- **Calendar handoff**: Right-click saved or imported cards to send a deadline to Google Calendar or download ICS for Apple/iCloud and other calendar apps.
- **Bilingual UI**: Switch between Chinese and English from the bottom toolbar.
- **Display preferences**: Choose a display time zone, switch between `24-hour` and `12-hour`, and change date order between `YYYY/MM/DD` and `MM/DD/YYYY`.
- **Local-only data**: All data stays in `chrome.storage.local`, with no account or cloud sync.

---

## Customization

- **Language**: Toggle between Chinese and English from the popup footer.
- **Time zone**: Switch deadline display between supported time zones. The default is `Asia/Shanghai`.
- **Time format**: Choose `24-hour` or `12-hour (AM/PM)` in the settings panel.
- **Date order**: Choose `YYYY/MM/DD` or `MM/DD/YYYY`.
- **Calendar actions**: Right-click a saved or imported deadline card to open the calendar menu.
- **Imported conference cards**: Imported items can be added to your own list and opened directly on the conference website.

---

## Add To Calendar

1. Open the popup and locate any saved or imported deadline card.
2. Right-click the card to open the calendar menu.
3. Choose `Google Calendar` to open a prefilled event in the browser.
4. Choose `Apple / iCloud (.ics)` or `Download ICS` to import the deadline into calendar apps that support ICS files.

---

## Data Source & Privacy

- **Primary source**: [`ccfddl/ccf-deadlines`](https://github.com/ccfddl/ccf-deadlines)
- **Fallback**: CCFDDL ICS feeds when GitHub data is unavailable
- **Storage**: `chrome.storage.local`
- **Privacy**: no account, no cloud sync, no telemetry

---

## Development

- Repository: <https://github.com/jaychempan/ccf-ddl-tracker>
- Website source: [`website/`](website/)
- GitHub Pages URL: <https://jaychempan.github.io/ccf-ddl-tracker/>
- Chrome extension docs: [chrome/README.md](chrome/README.md)
- Tech stack: Manifest V3, Vanilla JavaScript, `chrome.storage.local`
- Contribution: Issues and pull requests are welcome

## Changelog

<details open>
  <summary><strong>v2.3</strong> - Manual links, remembered input, and footer shortcuts</summary>

  - Added optional card links when manually creating deadlines
  - Remembered the last opened add/import panel and unfinished add-form draft between popup opens
  - Changed the default countdown display to include hours and minutes
  - Refined footer shortcuts for GitHub, the extension home, and CCFDDL
  - Added CCF category and ranking metadata to imported conference browsing
  - Added optional settings to choose which conference metadata appears on saved cards
  - Included the selected conference metadata in Google Calendar and ICS exports
</details>

<details>
  <summary><strong>v2.2</strong> - Right-click calendar actions</summary>

  - Added a right-click context menu for deadline cards in the popup
  - Added direct export to Google Calendar from saved or imported deadline items
  - Added Apple / iCloud compatible `.ics` export and a generic ICS download action
  - Fixed list deletion so removing an item still targets the correct deadline after sorting
</details>

<details>
  <summary><strong>v2.1</strong> - Time zone switching and import time handling</summary>

  - Added a popup time zone selector with `Asia/Shanghai` as the default display zone
  - Manual deadlines are now saved using the currently selected time zone instead of the browser's local zone
  - Imported CCFDDL deadlines continue to respect their source time zone metadata when displayed
  - Improved ICS fallback parsing so `TZID` based timestamps are handled correctly when GitHub-hosted YAML is unavailable
</details>

<details>
  <summary><strong>v2.0</strong> - UI overhaul, import improvements, settings, and versioning</summary>

  - Reworked the popup into a denser layout with two entry cards and a bottom utility bar
  - Kept the import panel visible by default while moving recommendations into a floating search picker
  - Imported conferences now keep homepage links and added cards can open the official conference site
  - Added display settings for `24-hour / 12-hour` time and `year-month-day / month-day-year` date order
  - Added a `v2.0` version label in the popup header and bumped the extension version
</details>

<details>
  <summary><strong>v1.0.1</strong> - Refresh and day-count fixes</summary>

  - Fixed automatic date refresh issues
  - Added a manual refresh button
  - Corrected same-day deadlines to display `0 days`
</details>

---

## License

MIT License
