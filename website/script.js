const menuToggle = document.querySelector("[data-menu-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const languageToggle = document.querySelector("[data-lang-toggle]");
const previewShowcase = document.querySelector(".preview-showcase");
const previewScroller = document.querySelector("[data-preview-scroller]");
const previewSlides = Array.from(document.querySelectorAll("[data-preview-slide]"));
const previewTabs = Array.from(document.querySelectorAll("[data-preview-target]"));
const pageName = document.body.dataset.page;
const languageStorageKey = "ccf-ddl-tracker-site-lang";
const previewAutoplayDelayMs = 4500;
const previewReducedMotionQuery = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

let previewAutoplayTimer = null;
let previewAutoplayPaused = false;
let previewAutoScrolling = false;

const translations = {
    en: {
        common: {
            "brand.ariaLabel": "CCF DDL Tracker home",
            "brand.logoAlt": "CCF DDL Tracker logo",
            "nav.getIt": "Get it",
            "nav.guide": "Guide",
            "nav.faq": "FAQ",
            "nav.changelog": "Changelog",
            "nav.citationTracker": "Citation Tracker",
            "nav.github": "GitHub",
            "menu.ariaLabel": "Open site navigation",
            "langToggle.ariaLabel": "Switch website language",
            "footer.privacy": "Privacy Policy"
        },
        pages: {
            home: {
                "home.preview.v26.eyebrow": "Version 2.6",
                "home.preview.v26.title": "One conference. Every deadline.",
                "home.preview.v26.body": "Connect CCFDDL stars from the small account icon beside My DDLs. A compact card shows the next deadline; expand it for submission rounds, calendar actions, and individual stages. Light and dark previews use example data.",
                "home.preview.v26.imageAlt": "CCF DDL Tracker v2.6 light and dark previews showing the account icon, a compact conference card and expanded submission stages, using example dates",
                "home.features.sync.title": "Optional website-star sync",
                "home.features.sync.item1": "Click the account icon beside My DDLs; sign in with GitHub on ccfddl.com if needed.",
                "home.features.sync.item2": "Keep the website tab open for automatic sync. Disconnect from Settings; manual deadlines stay local.",
                "home.preview.tabsLabel": "Choose a release preview",
                "meta.title": "CCF DDL Tracker: Add and manage your deadlines in one click",
                "meta.description": "CCF DDL Tracker v2.6: compact conference cards, optional CCFDDL star sync through GitHub sign-in, and calendar exports.",
                "home.subtitle": "An open source Chrome extension for tracking CCF deadlines",
                "home.release": "v2.6 · Website stars, simpler conference cards",
                "home.primaryCta": "Get Started",
                "home.preview.v25.eyebrow": "Version 2.5",
                "home.preview.v25.title": "Familiar appearance, less startup work",
                "home.preview.v25.body": "Keep the original toolbar clock and your Light / Dark settings. v2.5 schedules badges when their display changes, loads conference parsing only when you search, and recovers through independent calendar feeds when the main import source fails.",
                "home.preview.v25.imageAlt": "Illustration of CCF DDL Tracker v2.5 with the familiar light and dark interface, saved deadlines, theme settings, and local-loading retry",
                "home.preview.v24.eyebrow": "Version 2.4",
                "home.preview.v24.title": "Your deadlines, in light or dark",
                "home.preview.v24.body": "Follow your system appearance or choose Light or Dark. v2.4 reduces popup startup work, initializes time-zone settings only when needed, and offers Retry if local data loading fails, without clearing your saved deadlines.",
                "home.preview.v24.imageAlt": "Illustration of CCF DDL Tracker v2.4 light and dark appearance with theme settings and a loading retry option",
                "home.preview.eyebrow": "v2.3 layout preview",
                "home.preview.title": "Conference metadata built into the popup workflow",
                "home.preview.body": "v2.3 surfaces CCF categories and rankings while browsing imports, lets you choose which metadata appears on saved cards and calendar exports, and remembers unfinished manual entries.",
                "home.preview.imageAlt": "Preview of the CCF DDL Tracker v2.3 popup",
                "home.preview.v22.eyebrow": "Version 2.2",
                "home.preview.v22.title": "Right-click calendar actions",
                "home.preview.v22.body": "v2.2 added a right-click context menu for deadline cards, with direct export to Google Calendar and Apple-compatible .ics download.",
                "home.preview.v22.imageAlt": "Preview of the CCF DDL Tracker popup in v2.2",
                "home.preview.v21.eyebrow": "Version 2.1",
                "home.preview.v21.title": "Time zone switching that fits real submission workflows",
                "home.preview.v21.body": "v2.1 added a popup time zone selector, kept imported source time semantics intact, and made manual deadlines save against the zone you selected.",
                "home.preview.v21.imageAlt": "Preview of the CCF DDL Tracker popup in v2.1",
                "home.preview.v20.eyebrow": "Version 2.0",
                "home.preview.v20.title": "A denser popup redesign for faster deadline triage",
                "home.preview.v20.body": "v2.0 reworked the popup into a tighter layout, kept the import panel visible, added homepage links, and introduced display settings for time and date formats.",
                "home.preview.v20.imageAlt": "Preview of the CCF DDL Tracker popup in v2.0",
                "home.intro": "Keep conference deadlines together in a compact Chrome popup. Import a conference once, see its next deadline, and expand its card for other stages and calendar actions. Connect your CCFDDL website stars through GitHub sign-in, or use the tracker locally without an account.",
                "home.features.title": "Features",
                "home.features.focused.title": "Focused tracking",
                "home.features.focused.item1": "Keep deadlines in a dense popup instead of a separate dashboard.",
                "home.features.focused.item2": "One card per conference edition, with the next deadline visible and other stages a click away.",
                "home.features.focused.item3": "Compact countdowns, expandable submission rounds, and separate calendar actions for each deadline.",
                "home.features.import.title": "CCFDDL import flow",
                "home.features.import.item1": "Import the CCFDDL dataset over HTTPS, with independent Chinese and English ICS fallbacks.",
                "home.features.import.item2": "Add all available deadlines for an edition together; click its title to open the official site.",
                "home.features.settings.title": "User-friendly settings",
                "home.features.settings.item1": "Switch between Chinese and English, and choose a display time zone from the popup.",
                "home.features.settings.item2": "Choose System, Light, or Dark appearance, time format, and date order without leaving the popup.",
                "home.features.calendar.title": "Calendar handoff",
                "home.features.calendar.item1": "Right-click a card for its next deadline, or expand it to export a specific stage.",
                "home.features.calendar.item2": "Send deadlines to Google Calendar or export ICS for Apple / iCloud and other calendar apps.",
                "home.note.title": "Note",
                "home.note.body": "Deadlines and preferences are stored in <code>chrome.storage.local</code>. Website-star sync is optional and uses GitHub sign-in on ccfddl.com. Manual deadlines stay local; the extension does not read or store GitHub tokens.",
                "home.warning.title": "Warning",
                "home.warning.body": "Imported deadlines are a convenience layer, not a replacement for official conference announcements. Submission schedules can change, so always verify important deadlines on the conference website before submitting.",
                "home.install.title": "Installation",
                "home.install.body": "CCF DDL Tracker is built as a Manifest V3 Chrome extension. You can install it from the Chrome Web Store or load it unpacked from source during development.",
                "home.links.chromeWebStore": "Chrome Web Store",
                "home.links.repository": "Repository",
                "home.links.ccfddl": "CCFDDL Official Site",
                "home.install.more": "View detailed installation options <a href=\"./get-it/\">here</a>.",
                "home.contribution.title": "Contribution",
                "home.contribution.lead": "You are welcome to contribute to this project by:",
                "home.contribution.item1": "contributing code or opening issues on <a href=\"https://github.com/jaychempan/ccf-ddl-tracker\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a>",
                "home.contribution.item2": "improving the extension workflow and documentation in <a href=\"https://github.com/jaychempan/ccf-ddl-tracker/tree/main/chrome\" target=\"_blank\" rel=\"noopener noreferrer\">the Chrome extension directory</a>",
                "home.contribution.item3": "helping improve the upstream deadline source at <a href=\"https://github.com/ccfddl/ccf-deadlines\" target=\"_blank\" rel=\"noopener noreferrer\">ccfddl/ccf-deadlines</a>",
                "home.contribution.item4": "sharing feedback from real deadline-tracking workflows"
            },
            getIt: {
                "getIt.upgrade.title": "Upgrade an Unpacked Copy",
                "getIt.upgrade.body": "Update the files in the same chrome/ directory, then click Reload for CCF DDL Tracker in chrome://extensions/ (edge://extensions/ in Edge). Reopen the popup and check for v2.6. Keep the same installed extension to retain local data. Refresh any already-open ccfddl.com tabs before connecting stars.",
                "meta.title": "CCF DDL Tracker｜Get it",
                "meta.description": "Install CCF DDL Tracker from the Chrome Web Store or load it unpacked from source.",
                "getIt.title": "Get CCF DDL Tracker",
                "getIt.intro": "CCF DDL Tracker is built as a Manifest V3 Chrome extension. You can install it from the Chrome Web Store or load it unpacked from the repository during development.",
                "getIt.release.title": "Current Version",
                "getIt.release.body": "v2.6.0 adds optional CCFDDL star sync, compact conference cards with expandable stages, and clearer recovery for failed saves or an outdated background worker. The repository version and the Chrome Web Store package are updated separately; check the installed version.",
                "getIt.links.chromeWebStore": "Chrome Web Store",
                "getIt.note.title": "Note",
                "getIt.note.body": "The primary supported target is Chrome. Other Chromium-based browsers may work if they support Manifest V3 extension loading, but Chrome is the main distribution path.",
                "getIt.unpack.title": "Load Unpacked",
                "getIt.unpack.body": "If you want to inspect or modify the source code, load the extension unpacked:",
                "getIt.unpack.step1": "Open <code>chrome://extensions/</code>.",
                "getIt.unpack.step2": "Enable <code>Developer mode</code>.",
                "getIt.unpack.step3": "Click <code>Load unpacked</code>.",
                "getIt.unpack.step4": "Select the <code>chrome/</code> directory in this repository.",
                "getIt.unpack.step5": "Pin the extension icon to the toolbar and click it to open the popup.",
                "getIt.resources.title": "Project Resources",
                "getIt.links.repository": "Repository",
                "getIt.links.chromeReadme": "Chrome README",
                "getIt.links.ccfddl": "CCFDDL Official Site",
                "getIt.source.title": "Need the Source?",
                "getIt.source.body": "Browse the repository, open issues, or submit pull requests if you want to help improve the extension or the surrounding documentation."
            },
            guide: {
                "guide.cards.title": "One Card per Conference Edition",
                "guide.cards.body": "A conference card shows the next upcoming deadline and a compact countdown. Use the chevron to see all saved stages and submission rounds. Removing one stage hides it locally; Remove conference deletes all saved stages for the edition. Manual deadlines remain separate cards.",
                "guide.sync.title": "Connect Your CCFDDL Stars",
                "guide.sync.step1": "Click the small account icon beside My DDLs. An open, signed-in ccfddl.com tab connects directly; otherwise sign in with GitHub on the website that opens.",
                "guide.sync.step2": "Keep that website tab open. The first connection merges both sets of conference stars and imports upcoming stages. Sync runs automatically; the existing refresh button also refreshes stars.",
                "guide.sync.step3": "Once connected, click the account icon to refresh stars directly or hover to see status. Uncheck Sync website stars in Settings to disconnect. Refresh the website to see extension changes.",
                "guide.sync.removal": "With sync enabled, removing a conference or its last saved stage removes its website star. Website unstars remove linked local stages. Manual deadlines and older imports without an edition ID stay local; re-add a conference from the current import list to link it.",
                "guide.sync.recovery": "Offline changes are retained for retry. If the website account changes, sync pauses until you disconnect and reconnect. Stars with unknown or TBD dates remain on the website until dates are available.",
                "meta.title": "CCF DDL Tracker｜Guide",
                "meta.description": "Guide for using the CCF DDL Tracker Chrome extension.",
                "guide.title": "Guide",
                "guide.intro": "A guide to CCF DDL Tracker v2.6: add conferences, connect website stars, and manage individual deadlines. Check your installed version when comparing features with the Chrome Web Store package.",
                "guide.badge.title": "Read the Toolbar Badge",
                "guide.badge.body": "The toolbar clock shows days remaining until the nearest upcoming deadline across all stages. It updates after deadline edits and at the next day-count change or expiration. No badge update is scheduled without upcoming deadlines. A sleeping browser may deliver an update later.",
                "guide.openPopup.title": "Open the Popup",
                "guide.openPopup.body": "Pin the extension to the toolbar and click its icon. You can also right-click the icon and choose Options to open the same tracker and saved data in a regular tab.",
                "guide.manual.title": "Add a Deadline Manually",
                "guide.manual.body": "Use the add form to enter a title, date, and time. Manual deadlines are interpreted in the currently selected display time zone before being saved, and the nearest item drives the toolbar badge countdown.",
                "guide.import.title": "Import Conferences from CCFDDL",
                "guide.import.body": "Click the import search field to load CCFDDL conferences. Add conference saves the available dates for that edition together. Source time zones and official links are preserved. If the main dataset fails, either Chinese or English ICS feed can recover the import; each request has a 10-second timeout. ICS entries without an edition ID remain separate local entries.",
                "guide.calendar.title": "Add a Deadline to Calendar",
                "guide.calendar.body": "Right-click a conference card to export its next deadline. To choose another stage, expand the card and use that stage’s calendar icon or right-click menu. Google Calendar and Apple / iCloud-compatible ICS exports use the selected stage’s date.",
                "guide.tip.title": "Tip",
                "guide.tip.body": "Imported deadlines are helpful for discovery, but you should still confirm the final submission schedule on the official conference website.",
                "guide.customize.title": "Customize the Display",
                "guide.customize.item1": "Switch language between Chinese and English from the bottom toolbar.",
                "guide.customize.item2": "Choose a display time zone in settings. The default is Asia/Shanghai.",
                "guide.customize.item3": "Choose a 24-hour or 12-hour clock in settings.",
                "guide.customize.item4": "Change date order between year-first and month-first formats.",
                "guide.customize.item5": "Choose System (default), Light, or Dark appearance. Your saved choice loads asynchronously when the popup opens, so system colors may appear briefly.",
                "guide.links.title": "Open Official Conference Sites",
                "guide.links.body": "Click the conference title to open its official website. The chevron expands the card’s deadlines without opening another page.",
                "guide.storage.title": "Storage Model",
                "guide.storage.body": "Deadlines and preferences are saved in <code>chrome.storage.local</code>. Optional sync shares conference edition stars with ccfddl.com; manual deadlines stay local. Disconnecting keeps local deadlines and website stars, while cancelling pending sync operations."
            },
            faq: {
                "faq.q10": "How do I connect my GitHub login and website stars?",
                "faq.a10": "Click the account icon beside My DDLs, then sign in with GitHub on ccfddl.com if needed. Keep the website tab open for automatic sync. This syncs conference stars on CCFDDL, not GitHub repository stars. No token entry is needed. Disconnect in Settings.",
                "faq.q11": "Why are several deadlines combined into one card?",
                "faq.a11": "Dates with the same conference edition ID share one card. Its next deadline is visible by default; expand it for the other stages and rounds. Each stage has its own calendar action. A website star represents the whole edition.",
                "faq.q12": "What if adding or deleting a conference fails after upgrading?",
                "faq.a12": "An unpacked extension can show updated popup files while still running its old background worker. Reload the extension from its recovery button or the browser’s extension manager, then reopen the popup. v2.6 distinguishes a missing background from a failed save or read. For an uncertain save, refresh the list before repeating the action. Existing saved data is not automatically cleared.",
                "meta.title": "CCF DDL Tracker｜FAQ",
                "meta.description": "Frequently asked questions about CCF DDL Tracker.",
                "faq.title": "FAQ",
                "faq.q1": "Where are my deadlines stored?",
                "faq.a1": "Deadlines and preferences are stored in <code>chrome.storage.local</code>. In v2.6, you can optionally sync conference stars through a signed-in ccfddl.com tab. Manual deadlines remain local.",
                "faq.q2": "Where do imported conferences come from?",
                "faq.a2": "Imports use the CCFDDL dataset served over direct HTTPS. The data comes from the upstream <a href=\"https://github.com/ccfddl/ccf-deadlines\" target=\"_blank\" rel=\"noopener noreferrer\">ccfddl/ccf-deadlines</a> project. If that source fails, the Chinese and English ICS feeds can recover independently; each request and response read is limited to 10 seconds.",
                "faq.q3": "Should I trust imported deadlines without checking?",
                "faq.a3": "No. Imported dates are a convenience feature. For any real submission, always confirm the current CFP and official deadline on the conference website.",
                "faq.q4": "Does the extension collect analytics or telemetry?",
                "faq.a4": "No project-hosted telemetry is built into the extension. The workflow is designed to be local-first and does not require logging in.",
                "faq.q5": "Can I open the official conference homepage from a card?",
                "faq.a5": "Yes. Click the title of an imported conference to open its official site. The chevron expands its deadlines.",
                "faq.q6": "Can I use my own custom deadlines?",
                "faq.a6": "Yes. The extension supports both manually added deadlines and imported conference entries.",
                "faq.q7": "How do I add a deadline to my calendar?",
                "faq.a7": "Right-click a card for its next deadline, or expand the conference and use a specific stage’s calendar icon. Export to Google Calendar or download ICS for Apple / iCloud and other calendar apps.",
                "faq.q9": "How often does the toolbar badge update?",
                "faq.a9": "The badge recalculates after saved deadlines change and schedules its next update when the day count changes or a deadline expires. Optional website-star sync runs separately, about once a minute while the browser can run it, and after local edits.",
                "faq.q8": "What if the popup gets stuck or does not open?",
                "faq.a8": "If a local read fails or takes more than 3 seconds, click Retry. If the popup does not appear at all, right-click the extension icon and choose Options to use the tracker in a tab. Record browser and extension versions and console errors if it recurs. This is separate from the v2.6 save-error recovery."
            },
            privacy: {
                "privacy.sync.title": "Your Sync Choices",
                "privacy.sync.body": "Sync is off until you connect it. You can disconnect in Settings at any time. Disconnecting retains local deadlines and existing website stars, clears the extension’s sync account/state and cancels pending sync operations. It does not delete your CCFDDL account or sign you out of the website. Website stars and GitHub sign-in are handled by those services under their own policies.",
                "meta.title": "CCF DDL Tracker｜Privacy Policy",
                "meta.description": "Privacy policy for CCF DDL Tracker.",
                "privacy.title": "Privacy Policy",
                "privacy.effectiveDate": "Effective date: October 8, 2026",
                "privacy.summary": "<strong>Deadline tracking works locally without an account. Optional conference-star sync uses GitHub sign-in on ccfddl.com.</strong>",
                "privacy.local.title": "Local Storage",
                "privacy.local.body": "Deadlines, imported conference entries that you save, and interface preferences are stored in <code>chrome.storage.local</code> within the browser profile where the extension runs. Optional sync also stores the GitHub login, pending conference IDs, excluded stages and sync status locally.",
                "privacy.sources.title": "External Data Sources",
                "privacy.sources.body": "The extension requests the CCFDDL dataset and fallback ICS feeds over HTTPS when you use conference import. These requests populate the import list. If you enable star sync, the extension uses a signed-in ccfddl.com tab to read your account login and conference stars, send conference-star changes, and fetch conference dates. It never reads or stores GitHub tokens; manual deadlines are not uploaded.",
                "privacy.analytics.title": "Analytics",
                "privacy.analytics.body": "The extension has no project-hosted analytics or telemetry. Core deadline tracking works without an account. Optional star sync communicates with ccfddl.com using your website session.",
                "privacy.links.title": "Third-Party Links",
                "privacy.links.body": "The extension and this website may link to third-party sites such as conference homepages, GitHub repositories, or the Chrome Web Store. Those services have their own privacy policies and terms.",
                "privacy.changes.title": "Changes",
                "privacy.changes.body": "If this policy changes, the updated version will be published on this page.",
                "privacy.contact.title": "Contact",
                "privacy.contact.body": "For questions about the project, open an issue on <a href=\"https://github.com/jaychempan/ccf-ddl-tracker\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a>."
            },
            changelog: {
                "changelog.v26.title": "v2.6",
                "changelog.v26.subtitle": "Website-star sync, compact conference cards, and reliable save recovery · October 8, 2026",
                "changelog.v26.item1": "Added opt-in CCFDDL conference-star sync through the website’s GitHub login. Connect from the small account icon beside My DDLs; subsequent sync is automatic and the existing refresh button also refreshes stars.",
                "changelog.v26.item2": "Merged deadlines by conference edition into compact cards. Show the next deadline first, expand stages and rounds, and add all available dates from one import result.",
                "changelog.v26.item3": "Added calendar and removal actions per stage, plus whole-conference removal. With sync enabled, removing the final saved stage or the whole conference also removes its website star.",
                "changelog.v26.item4": "Preserved source time zones and stage metadata when parsing conference editions, including fields declared after the timeline.",
                "changelog.v26.item5": "Serialized local writes and sync commits, retained offline changes, guarded account switches and stale responses, and kept manual deadlines local. No GitHub token entry or additional extension permissions are required.",
                "changelog.v26.item6": "Fixed save and background-connection errors being reported as local-read failures. Added extension reload for an unavailable background and list refresh before retrying an uncertain save.",
                "changelog.v26.item7": "Updated the bilingual website, guides, privacy policy and release preview. Expanded popup and sync regression coverage, including browser checks for upgrade recovery and retained data.",
                "meta.title": "CCF DDL Tracker｜Changelog",
                "meta.description": "Release notes and update history for CCF DDL Tracker.",
                "changelog.title": "Changelog",
                "changelog.intro": "This page records major product and interface changes across website and extension releases.",
                "changelog.v25.title": "v2.5",
                "changelog.v25.subtitle": "Badge scheduling, lighter first-view resources, and more resilient imports.",
                "changelog.v25.item1": "Replaced minute-by-minute badge polling with one-shot alarms at the next day-count change or expiration, while recalculating immediately after deadline changes.",
                "changelog.v25.item2": "Bound background local-data reads to 3 seconds and scheduled a single retry after 5 minutes on failure; stale reads and errors cannot overwrite newer badge updates.",
                "changelog.v25.item3": "Deferred theme initialization and removed synchronous Web Storage access. Saved themes load asynchronously, so system colors may appear briefly.",
                "changelog.v25.item4": "Preserved the original toolbar clock. Loaded the local YAML/ICS parser only when fetching conferences and added an 84 px popup-header logo asset. First-view files fell from about 203 KB to 109 KB (about 46%); this measures file size, not startup time.",
                "changelog.v25.item5": "Requested the main conference dataset through direct HTTPS, with independent Chinese and English ICS fallbacks and a 10 second timeout covering each request and response read.",
                "changelog.v25.item6": "Skipped minute refresh reads while a fallback tracker tab is hidden and refreshed it when visible again.",
                "changelog.v25.item7": "Added startup timing diagnostics and recovery checks. These improvements do not establish that the long-running browser popup failure is fixed.",
                "changelog.v24.title": "v2.4",
                "changelog.v24.subtitle": "Appearance settings, lighter startup, and popup recovery.",
                "changelog.v24.item1": "Added System (default), Light, and Dark appearance settings, saved locally.",
                "changelog.v24.item2": "Applied dark colors to cards, forms, settings, import results, and calendar menus.",
                "changelog.v24.item3": "Initialized time-zone settings on demand, reused date formatters, and combined preferences and deadlines into one startup read.",
                "changelog.v24.item4": "Added error feedback and Retry for failed or timed-out local reads, without automatically clearing saved data.",
                "changelog.v24.item5": "Added an Options entry to use the same tracker in a regular tab, plus Chrome and Edge troubleshooting guidance.",
                "changelog.v24.item6": "Added 11 popup regression tests and initialization timing marks. Startup improvements do not guarantee a fix for browser-level popup failures.",
                "changelog.v23.title": "v2.3",
                "changelog.v23.subtitle": "Manual links, remembered input, and footer shortcuts.",
                "changelog.v23.item1": "Added an optional card link field when manually creating a deadline.",
                "changelog.v23.item2": "Remembered the last opened add/import panel and unfinished add-form draft between popup opens.",
                "changelog.v23.item3": "Changed the default countdown display to include hours and minutes.",
                "changelog.v23.item4": "Refined footer shortcuts for GitHub, the extension home, and CCFDDL.",
                "changelog.v23.item5": "Added CCF category and ranking metadata to the import list for easier conference browsing.",
                "changelog.v23.item6": "Added optional settings to choose which conference metadata appears on saved cards.",
                "changelog.v23.item7": "Included the selected conference metadata in Google Calendar and ICS exports.",
                "changelog.v22.title": "v2.2",
                "changelog.v22.subtitle": "Right-click calendar actions.",
                "changelog.v22.item1": "Added a right-click context menu for deadline cards in the popup.",
                "changelog.v22.item2": "Added direct export to Google Calendar from saved or imported deadline items.",
                "changelog.v22.item3": "Added Apple / iCloud compatible .ics export and a generic ICS download action.",
                "changelog.v22.item4": "Fixed list deletion so removing an item still targets the correct deadline after sorting.",
                "changelog.v21.title": "v2.1",
                "changelog.v21.subtitle": "Time zone switching and import time handling.",
                "changelog.v21.item1": "Added a popup time zone selector with Asia/Shanghai as the default display zone.",
                "changelog.v21.item2": "Manual deadlines now save against the currently selected time zone instead of the browser local zone.",
                "changelog.v21.item3": "Imported CCFDDL deadlines keep their source time zone semantics when displayed.",
                "changelog.v21.item4": "Improved ICS fallback parsing so TZID-based timestamps are handled correctly.",
                "changelog.v2.title": "v2.0",
                "changelog.v2.subtitle": "UI overhaul, import improvements, settings, and versioning.",
                "changelog.v2.item1": "Reworked the popup into a denser layout with two entry cards and a bottom utility bar.",
                "changelog.v2.item2": "Kept the import panel visible by default while moving recommendations into a floating search picker.",
                "changelog.v2.item3": "Imported conferences now keep homepage links and added cards can open the official conference site.",
                "changelog.v2.item4": "Added display settings for 24-hour or 12-hour time and year-first or month-first date order.",
                "changelog.v2.item5": "Added a v2.0 version label in the popup header and bumped the extension version.",
                "changelog.v101.title": "v1.0.1",
                "changelog.v101.subtitle": "Refresh and remaining-day fixes.",
                "changelog.v101.item1": "Fixed automatic date refresh issues.",
                "changelog.v101.item2": "Added a manual refresh button.",
                "changelog.v101.item3": "Corrected same-day deadlines to display 0 days."
            }
        }
    },
    zh: {
        common: {
            "brand.ariaLabel": "CCF DDL Tracker 首页",
            "brand.logoAlt": "CCF DDL Tracker 标志",
            "nav.getIt": "获取",
            "nav.guide": "指南",
            "nav.faq": "常见问题",
            "nav.changelog": "更新日志",
            "nav.citationTracker": "Citation Tracker",
            "nav.github": "GitHub",
            "menu.ariaLabel": "打开网站导航",
            "langToggle.ariaLabel": "切换网站语言",
            "footer.privacy": "隐私政策"
        },
        pages: {
            home: {
                "home.preview.v26.eyebrow": "版本 2.6",
                "home.preview.v26.title": "一场会议，一张卡片",
                "home.preview.v26.body": "在“我的截止日期”旁点击小账号图标，连接 CCFDDL 收藏。精简卡片展示最近节点，展开即可查看投稿轮次、各阶段日期并添加日历。浅色与深色预览使用示例数据。",
                "home.preview.v26.imageAlt": "CCF DDL Tracker v2.6 浅色与深色预览，展示小账号入口、简约会议卡片和展开后的投稿节点，日期为示例",
                "home.features.sync.title": "可选的网站收藏同步",
                "home.features.sync.item1": "点击“我的截止日期”右侧账号图标，按需在 ccfddl.com 使用 GitHub 登录。",
                "home.features.sync.item2": "保留网站标签页即可自动同步，在设置中可断开；手动 DDL 保留在本地。",
                "home.preview.tabsLabel": "选择版本预览",
                "meta.title": "CCF DDL Tracker: 一键添加和管理你的截止日期",
                "meta.description": "CCF DDL Tracker v2.6：简约会议卡片、通过 GitHub 登录连接的可选 CCFDDL 收藏同步与日历导出。",
                "home.subtitle": "一个用于跟踪 CCF 截稿日期的开源 Chrome 扩展",
                "home.release": "v2.6 · 收藏同步，会议卡片更简约",
                "home.primaryCta": "开始使用",
                "home.preview.v25.eyebrow": "版本 2.5",
                "home.preview.v25.title": "保持熟悉外观，减少启动工作",
                "home.preview.v25.body": "保留原有工具栏时钟和浅色 / 深色设置。v2.5 在角标显示变化时安排更新，搜索会议时才加载解析器；主导入源失败时，可通过独立的日历备用源恢复。",
                "home.preview.v25.imageAlt": "CCF DDL Tracker v2.5 界面示意，展示熟悉的浅色和深色界面、已保存截止日期、外观设置与本地加载重试",
                "home.preview.v24.eyebrow": "2.4 版本",
                "home.preview.v24.title": "白天与夜晚，都能清楚查看截止日期",
                "home.preview.v24.body": "外观可跟随系统，也可固定为浅色或深色。v2.4 减少弹窗启动工作量，时区设置按需加载；本地数据读取失败时提供重试，不会清空已保存的截止日期。",
                "home.preview.v24.imageAlt": "CCF DDL Tracker v2.4 浅色与深色界面示意，展示外观设置和加载失败重试入口",
                "home.preview.eyebrow": "v2.3 布局预览",
                "home.preview.title": "把会议分类和等级放进 popup 工作流",
                "home.preview.body": "v2.3 在浏览导入会议时展示 CCF 分类和等级，可自定义哪些元信息显示在已保存卡片和日历导出中，并能恢复未完成的手动新增草稿。",
                "home.preview.imageAlt": "CCF DDL Tracker v2.3 弹窗预览图",
                "home.preview.v22.eyebrow": "2.2 版本",
                "home.preview.v22.title": "右键日历操作",
                "home.preview.v22.body": "v2.2 新增右键菜单，可直接将截止日期导出到 Google 日历或下载 Apple 兼容的 .ics 文件。",
                "home.preview.v22.imageAlt": "CCF DDL Tracker v2.2 弹窗预览图",
                "home.preview.v21.eyebrow": "2.1 版本",
                "home.preview.v21.title": "时区切换终于更贴近真实投稿工作流",
                "home.preview.v21.body": "v2.1 新增 popup 时区选择器，保留导入会议的原始时区语义，也让手动添加的截止日期按你当前选择的时区保存。",
                "home.preview.v21.imageAlt": "CCF DDL Tracker v2.1 弹窗预览图",
                "home.preview.v20.eyebrow": "2.0 版本",
                "home.preview.v20.title": "更紧凑的 popup 改版，让筛选截止日期更快",
                "home.preview.v20.body": "v2.0 重构了 popup 布局，让导入面板默认常驻，保留会议官网链接，并加入时间格式和日期顺序设置。",
                "home.preview.v20.imageAlt": "CCF DDL Tracker v2.0 弹窗预览图",
                "home.intro": "在紧凑的浏览器弹窗里管理会议截止日期。整届会议一次导入，卡片显示最近节点，展开即可查看其他阶段并添加日历。可通过 GitHub 登录连接 CCFDDL 网站收藏，也可无需账号在本地使用。",
                "home.features.title": "功能特性",
                "home.features.focused.title": "聚焦跟踪",
                "home.features.focused.item1": "在紧凑弹窗里集中查看截止日期，不需要额外打开独立面板。",
                "home.features.focused.item2": "同一届会议合并为一张卡片，最近截止日期直接可见，其他阶段点击展开。",
                "home.features.focused.item3": "精简倒计时，展开查看投稿轮次，每个时间节点可单独添加日历。",
                "home.features.import.title": "CCFDDL 导入流程",
                "home.features.import.item1": "通过 HTTPS 导入 CCFDDL 数据集，中文和英文 ICS 备用源可独立恢复。",
                "home.features.import.item2": "一次添加整届会议的可用节点，点击标题直达会议官网。",
                "home.features.settings.title": "易用设置",
                "home.features.settings.item1": "可在弹窗中切换中英文，并选择显示时区。",
                "home.features.settings.item2": "无需离开弹窗即可选择跟随系统、浅色或深色外观，以及时间格式和日期顺序。",
                "home.features.calendar.title": "日历接力",
                "home.features.calendar.item1": "右键卡片导出最近节点，或展开后为指定阶段添加日历。",
                "home.features.calendar.item2": "支持发送到 Google Calendar，或导出适用于 Apple / iCloud 及其他日历应用的 ICS 文件。",
                "home.note.title": "说明",
                "home.note.body": "截止日期和偏好保存在 <code>chrome.storage.local</code> 中。网站收藏同步可选，通过 ccfddl.com 的 GitHub 登录连接。手动 DDL 保留在本地，扩展不读取或保存 GitHub Token。",
                "home.warning.title": "提醒",
                "home.warning.body": "导入的截止日期只是便捷信息层，不应替代官方会议公告。投稿时间可能变动，因此在正式提交前，请务必到会议官网核实重要截止日期。",
                "home.install.title": "安装方式",
                "home.install.body": "CCF DDL Tracker 基于 Manifest V3 构建。你可以直接从 Chrome Web Store 安装，也可以在开发时从源码以未打包方式加载。",
                "home.links.chromeWebStore": "Chrome 应用商店",
                "home.links.repository": "代码仓库",
                "home.links.ccfddl": "CCFDDL 官网",
                "home.install.more": "查看更详细的安装方式请点<a href=\"./get-it/\">这里</a>。",
                "home.contribution.title": "参与贡献",
                "home.contribution.lead": "欢迎通过以下方式参与这个项目：",
                "home.contribution.item1": "在 <a href=\"https://github.com/jaychempan/ccf-ddl-tracker\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a> 上提交代码或反馈问题",
                "home.contribution.item2": "完善 <a href=\"https://github.com/jaychempan/ccf-ddl-tracker/tree/main/chrome\" target=\"_blank\" rel=\"noopener noreferrer\">Chrome 扩展目录</a>中的工作流和文档",
                "home.contribution.item3": "帮助改进上游截止日期数据源 <a href=\"https://github.com/ccfddl/ccf-deadlines\" target=\"_blank\" rel=\"noopener noreferrer\">ccfddl/ccf-deadlines</a>",
                "home.contribution.item4": "分享真实使用场景中的截止日期跟踪反馈"
            },
            getIt: {
                "getIt.upgrade.title": "升级已解压版本",
                "getIt.upgrade.body": "更新原 chrome/ 目录中的文件后，在 chrome://extensions/（Edge 使用 edge://extensions/）点击 CCF DDL Tracker 的“重新加载”。重新打开弹窗，确认显示 v2.6。保留原安装项以沿用本地数据；连接收藏前，刷新已经打开的 ccfddl.com 标签页。",
                "meta.title": "CCF DDL Tracker｜获取",
                "meta.description": "从 Chrome Web Store 安装 CCF DDL Tracker，或从源码以未打包方式加载。",
                "getIt.title": "获取 CCF DDL Tracker",
                "getIt.intro": "CCF DDL Tracker 是一个 Manifest V3 Chrome 扩展。你可以从 Chrome Web Store 安装，也可以在开发时直接从仓库源码加载未打包版本。",
                "getIt.release.title": "当前版本",
                "getIt.release.body": "v2.6.0 新增可选的 CCFDDL 收藏同步、可展开时间节点的简约会议卡片，以及保存失败或旧后台未更新时的恢复入口。仓库版本与 Chrome 应用商店安装包分别更新，请以已安装版本为准。",
                "getIt.links.chromeWebStore": "Chrome 应用商店",
                "getIt.note.title": "说明",
                "getIt.note.body": "当前主要支持的目标浏览器是 Chrome。只要支持 Manifest V3 扩展加载，其他 Chromium 内核浏览器理论上也可能可用，但 Chrome 仍是主要分发渠道。",
                "getIt.unpack.title": "加载未打包版本",
                "getIt.unpack.body": "如果你想检查或修改源码，可以按以下方式加载未打包扩展：",
                "getIt.unpack.step1": "打开 <code>chrome://extensions/</code>。",
                "getIt.unpack.step2": "启用 <code>开发者模式</code>。",
                "getIt.unpack.step3": "点击 <code>加载已解压的扩展程序</code>。",
                "getIt.unpack.step4": "选择本仓库中的 <code>chrome/</code> 目录。",
                "getIt.unpack.step5": "将扩展图标固定到工具栏，然后点击图标打开弹窗。",
                "getIt.resources.title": "项目资源",
                "getIt.links.repository": "代码仓库",
                "getIt.links.chromeReadme": "Chrome README",
                "getIt.links.ccfddl": "CCFDDL 官网",
                "getIt.source.title": "想看源码？",
                "getIt.source.body": "如果你想帮助改进扩展或配套文档，可以浏览仓库、提交 issue，或者发起 pull request。"
            },
            guide: {
                "guide.cards.title": "同届会议合并显示",
                "guide.cards.body": "会议卡片显示最近截止节点和精简倒计时，点击箭头可查看已保存的各阶段与投稿轮次。删除单个节点会在本地隐藏该阶段；“移除会议”会删除该届所有已保存节点。手动 DDL 保持独立卡片。",
                "guide.sync.title": "连接 CCFDDL 收藏",
                "guide.sync.step1": "点击“我的截止日期”旁的小账号图标。已有已登录的 ccfddl.com 标签页时直接连接，否则在打开的网站上使用 GitHub 登录。",
                "guide.sync.step2": "保留该网站标签页。首次连接合并双方会议收藏，并导入未来的时间节点。此后自动同步；原有刷新按钮也可刷新收藏。",
                "guide.sync.step3": "连接后点击账号图标直接刷新收藏，悬停可查看状态。在设置中取消勾选“同步网站收藏”即可断开。网站可能需要刷新后才显示扩展中的修改。",
                "guide.sync.removal": "开启同步后，移除整届会议或最后一个已保存节点会取消网站收藏；网站取消收藏也会移除关联的本地节点。手动 DDL 和没有届次 ID 的旧导入保留在本地；从当前导入列表重新添加会议可建立关联。",
                "guide.sync.recovery": "离线修改会保留，恢复后重试。网站账号变化时暂停同步，需断开后重新连接。暂无日期或日期待定的收藏留在网站，待日期可用后再导入。",
                "meta.title": "CCF DDL Tracker｜使用指南",
                "meta.description": "CCF DDL Tracker Chrome 扩展使用指南。",
                "guide.title": "使用指南",
                "guide.intro": "CCF DDL Tracker v2.6 使用指南：添加会议、连接网站收藏、管理每个截止节点。对照 Chrome 应用商店安装包时，请先检查已安装版本。",
                "guide.badge.title": "查看工具栏角标",
                "guide.badge.body": "工具栏时钟显示所有阶段中最近截止日期的剩余天数。修改条目后立即重算，并在下次天数变化或到期时更新；没有未来 DDL 时不安排角标更新。浏览器休眠可能延后更新。",
                "guide.openPopup.title": "打开弹窗",
                "guide.openPopup.body": "将扩展固定到工具栏，点击图标即可打开弹窗。也可右键图标选择“选项”，在普通标签页使用同一工具和已保存数据。",
                "guide.manual.title": "手动添加截止日期",
                "guide.manual.body": "使用添加表单填写标题、日期和时间。手动添加的截止日期会按当前选中的显示时区解释并保存，最近的一项会驱动工具栏徽标倒计时。",
                "guide.import.title": "从 CCFDDL 导入会议",
                "guide.import.body": "点击导入搜索框加载 CCFDDL 会议。“添加会议”一次保存该届可用日期，保留源时区和官网链接。主数据源失败时可独立回退到中文或英文 ICS，每次请求最多等待 10 秒。没有届次 ID 的 ICS 条目保留为独立的本地条目。",
                "guide.calendar.title": "添加到日历",
                "guide.calendar.body": "右键会议卡片可导出最近截止日期。需要其他阶段时，展开卡片，点击该阶段的日历图标或使用右键菜单。Google Calendar 和 Apple / iCloud 兼容的 ICS 导出会使用所选阶段的日期。",
                "guide.tip.title": "提示",
                "guide.tip.body": "导入的截止日期适合用于发现和初筛，但正式投稿前仍应到会议官网确认最终投稿时间。",
                "guide.customize.title": "自定义显示",
                "guide.customize.item1": "可在底部工具栏中切换中文和英文。",
                "guide.customize.item2": "可在设置中切换显示时区，默认是 Asia/Shanghai。",
                "guide.customize.item3": "可在设置中选择 24 小时制或 12 小时制。",
                "guide.customize.item4": "可在年在前和月在前之间切换日期格式。",
                "guide.customize.item5": "可选择跟随系统（默认）、浅色或深色外观。打开弹窗时会异步应用已保存的选择，因此可能短暂显示系统外观。",
                "guide.links.title": "打开会议官网",
                "guide.links.body": "点击会议标题打开官网；点击折叠箭头查看时间节点，不会跳转页面。",
                "guide.storage.title": "存储方式",
                "guide.storage.body": "截止日期和偏好保存在 <code>chrome.storage.local</code>。可选同步与 ccfddl.com 共享会议届次收藏，手动 DDL 保留在本地。断开连接保留本地截止日期和网站收藏，并取消待同步操作。"
            },
            faq: {
                "faq.q10": "如何通过 GitHub 登录同步网站收藏？",
                "faq.a10": "点击“我的截止日期”旁的账号图标，按需在 ccfddl.com 使用 GitHub 登录，并保留网站标签页以便自动同步。同步的是 CCFDDL 上的会议收藏，不是 GitHub 仓库 Star；无需填写 Token，可在设置中断开。",
                "faq.q11": "为什么多个截止日期合并成了一张卡片？",
                "faq.a11": "同一会议届次 ID 的日期共用一张卡片，默认展示最近截止日期，展开可查看其他阶段和轮次。每个节点都可单独添加日历；网站的一颗星对应整届会议。",
                "faq.q12": "升级后添加或删除会议失败怎么办？",
                "faq.a12": "已解压扩展可能加载了新界面，但仍在运行旧后台。点击恢复提示中的“重新加载扩展”，或到扩展管理页重新加载，再打开弹窗。v2.6 会区分后台未连接、保存失败和读取失败；保存结果不确定时，先刷新列表再重试。已有数据不会自动清空。",
                "meta.title": "CCF DDL Tracker｜常见问题",
                "meta.description": "关于 CCF DDL Tracker 的常见问题。",
                "faq.title": "常见问题",
                "faq.q1": "我的截止日期数据存在哪里？",
                "faq.a1": "截止日期和偏好保存在 <code>chrome.storage.local</code> 中。v2.6 可通过已登录的 ccfddl.com 标签页选择同步会议收藏；手动 DDL 保留在本地。",
                "faq.q2": "导入的会议信息来自哪里？",
                "faq.a2": "导入通过直接 HTTPS 地址获取 CCFDDL 数据集，数据来自上游 <a href=\"https://github.com/ccfddl/ccf-deadlines\" target=\"_blank\" rel=\"noopener noreferrer\">ccfddl/ccf-deadlines</a> 项目。主源失败时，中文和英文 ICS 备用源可独立恢复；每次请求和响应读取最多等待 10 秒。",
                "faq.q3": "可以不核实就直接相信导入的截止日期吗？",
                "faq.a3": "不建议。导入日期只是便捷功能。对于真实投稿，请始终到会议官网确认最新 CFP 和官方 deadline。",
                "faq.q4": "扩展会收集统计数据或遥测吗？",
                "faq.a4": "扩展没有内置项目自托管遥测。整个工作流以本地优先为原则，也不要求登录。",
                "faq.q5": "我能从卡片直接打开会议官网吗？",
                "faq.a5": "可以。点击导入会议的标题打开官网，点击箭头展开时间节点。",
                "faq.q6": "我能管理自己的自定义截止日期吗？",
                "faq.a6": "可以。扩展同时支持手动添加的截止日期和导入的会议条目。",
                "faq.q7": "我怎么把截止日期加到日历里？",
                "faq.a7": "右键卡片导出最近节点，或展开会议后点击指定阶段的日历图标。可导出到 Google Calendar，或下载供 Apple / iCloud 等日历使用的 ICS。",
                "faq.q9": "工具栏角标多久更新一次？",
                "faq.a9": "角标在保存的截止日期变化后重算，并在下一次天数变化或到期时更新。可选的网站收藏同步独立运行，浏览器可执行任务时约每分钟同步一次，本地修改后也会触发。",
                "faq.q8": "弹窗卡住或无法打开时怎么办？",
                "faq.a8": "本地读取失败或超过 3 秒时可点击“重试”。若弹窗完全没有出现，右键扩展图标选择“选项”，先在标签页使用工具。反复出现时请记录浏览器、扩展版本和 Console 错误。这与 v2.6 的保存错误恢复是两类问题。"
            },
            privacy: {
                "privacy.sync.title": "同步控制",
                "privacy.sync.body": "同步默认关闭，连接后才启用。可随时在设置中断开；断开保留本地截止日期和已有网站收藏，清除扩展保存的同步账号及状态，并取消待同步操作。此操作不会删除 CCFDDL 账号或退出网站登录。网站收藏和 GitHub 登录由对应服务按各自政策处理。",
                "meta.title": "CCF DDL Tracker｜隐私政策",
                "meta.description": "CCF DDL Tracker 的隐私政策。",
                "privacy.title": "隐私政策",
                "privacy.effectiveDate": "生效日期：2026 年 10 月 8 日",
                "privacy.summary": "<strong>截止日期管理无需账号，可在本地使用。可选的会议收藏同步使用 ccfddl.com 上的 GitHub 登录。</strong>",
                "privacy.local.title": "本地存储",
                "privacy.local.body": "你保存的截止日期、导入后保留的会议条目以及界面偏好设置，都会存储在扩展运行所在浏览器配置中的 <code>chrome.storage.local</code> 里。可选同步还会在本地保存 GitHub 登录名、待同步会议 ID、隐藏阶段和同步状态。",
                "privacy.sources.title": "外部数据源",
                "privacy.sources.body": "使用会议导入功能时，扩展会通过 HTTPS 请求 CCFDDL 数据集及备用 ICS 订阅源，用于填充导入列表。启用收藏同步后，扩展通过已登录的 ccfddl.com 标签页读取登录名和会议收藏、发送会议收藏变更并获取日期，不读取或存储 GitHub Token，不上传手动 DDL。",
                "privacy.analytics.title": "统计与分析",
                "privacy.analytics.body": "扩展不包含项目自托管的统计或遥测。基本截止日期管理无需账号；可选收藏同步使用你在 ccfddl.com 的网站登录会话。",
                "privacy.links.title": "第三方链接",
                "privacy.links.body": "扩展和本网站可能会链接到第三方站点，例如会议主页、GitHub 仓库或 Chrome Web Store。这些服务各自拥有独立的隐私政策和条款。",
                "privacy.changes.title": "政策变更",
                "privacy.changes.body": "如果本政策发生更新，最新版本会发布在本页面。",
                "privacy.contact.title": "联系",
                "privacy.contact.body": "如果你对项目有问题，请在 <a href=\"https://github.com/jaychempan/ccf-ddl-tracker\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a> 上提交 issue。"
            },
            changelog: {
                "changelog.v26.title": "v2.6",
                "changelog.v26.subtitle": "网站收藏同步、简约会议卡片与保存恢复 · 2026 年 10 月 8 日",
                "changelog.v26.item1": "新增通过网站 GitHub 登录连接的可选 CCFDDL 会议收藏同步。在“我的截止日期”旁点击小账号图标即可连接，此后自动同步，原有刷新按钮也会刷新收藏。",
                "changelog.v26.item2": "按会议届次合并截止日期，卡片默认展示最近节点，展开查看阶段和轮次；一条导入结果即可添加该届可用日期。",
                "changelog.v26.item3": "各阶段支持单独添加日历和移除，也可移除整届会议。开启同步后，删除最后一个已保存节点或整届会议会取消网站收藏。",
                "changelog.v26.item4": "解析会议时保留源时区及阶段信息，正确处理位于时间线之后的时区与地点字段。",
                "changelog.v26.item5": "本地写入与同步提交排队执行，保留离线操作，防止切换账号和过时响应覆盖数据；手动 DDL 保留在本地，无需填写 GitHub Token 或增加扩展权限。",
                "changelog.v26.item6": "修复将保存失败和后台连接失败误报为本地读取失败的问题。后台未连接时可重新加载扩展；保存结果不确定时先刷新列表再重试。",
                "changelog.v26.item7": "同步更新中英文网站、指南、隐私说明和版本预览，补充弹窗与同步回归测试，并在浏览器中验证升级恢复及数据保留。",
                "meta.title": "CCF DDL Tracker｜更新日志",
                "meta.description": "CCF DDL Tracker 的发布记录与更新历史。",
                "changelog.title": "更新日志",
                "changelog.intro": "本页记录网站与扩展版本中的主要产品更新和界面变化。",
                "changelog.v25.title": "v2.5",
                "changelog.v25.subtitle": "角标按需调度、首屏资源精简与会议导入恢复。",
                "changelog.v25.item1": "角标取消每分钟轮询，改为在下一次剩余天数变化或到期时设置单次 alarm，截止日期变化后仍立即重算。",
                "changelog.v25.item2": "后台本地读取超过 3 秒会判为失败，并安排 5 分钟后的单次重试；过时读取和错误不会覆盖较新的角标更新。",
                "changelog.v25.item3": "延后主题初始化，移除同步 Web Storage 访问。异步加载已保存主题时，可能短暂显示系统外观。",
                "changelog.v25.item4": "保留原有工具栏时钟；获取会议时才加载本地 YAML/ICS 解析器，并为弹窗顶部添加 84 px logo 资源。首屏文件从约 203 KB 降至 109 KB（减少约 46%）；该统计表示文件体积，不代表启动耗时。",
                "changelog.v25.item5": "主会议数据改用直接 HTTPS 地址；中文和英文 ICS 备用源可独立恢复，每次请求和响应读取最多等待 10 秒。",
                "changelog.v25.item6": "备用工具标签页隐藏时跳过分钟刷新读取，重新显示时立即刷新。",
                "changelog.v25.item7": "增加启动计时诊断和恢复检查；这些优化尚不能证明浏览器长时间运行后的弹窗故障已解决。",
                "changelog.v24.title": "v2.4",
                "changelog.v24.subtitle": "外观设置、启动优化与弹窗恢复。",
                "changelog.v24.item1": "新增跟随系统（默认）、浅色和深色外观设置，并保存在本机。",
                "changelog.v24.item2": "卡片、表单、设置、导入结果和日历菜单适配深色。",
                "changelog.v24.item3": "时区设置按需初始化，日期格式器复用，偏好和截止日期合并为一次启动读取。",
                "changelog.v24.item4": "本地读取失败或超时时显示错误提示和重试，不会自动清空已保存的数据。",
                "changelog.v24.item5": "新增“选项”标签页备用入口，使用同一工具，并补充 Chrome 和 Edge 排查指南。",
                "changelog.v24.item6": "新增 11 项弹窗回归测试和初始化计时；启动优化不能保证解决浏览器层面的弹窗故障。",
                "changelog.v23.title": "v2.3",
                "changelog.v23.subtitle": "手动链接、输入记忆与底部入口优化。",
                "changelog.v23.item1": "手动新增截止日期时，可填写一个可选卡片链接。",
                "changelog.v23.item2": "记住上次打开的新增 / 导入面板，并在下次打开 popup 时恢复未完成的新增表单草稿。",
                "changelog.v23.item3": "默认倒计时显示改为包含小时和分钟。",
                "changelog.v23.item4": "优化底部快捷入口，区分 GitHub、插件主页和 CCFDDL。",
                "changelog.v23.item5": "导入列表新增 CCF 分类和等级信息，方便浏览和筛选会议。",
                "changelog.v23.item6": "新增可选设置，可选择哪些会议元信息显示在已保存卡片中。",
                "changelog.v23.item7": "导出到 Google Calendar 或 ICS 时会带上已选择的会议元信息。",
                "changelog.v22.title": "v2.2",
                "changelog.v22.subtitle": "右键日历菜单。",
                "changelog.v22.item1": "为 popup 中的截止日期卡片新增右键上下文菜单。",
                "changelog.v22.item2": "支持把保存或导入的条目直接添加到 Google Calendar。",
                "changelog.v22.item3": "支持导出适用于 Apple / iCloud 的 .ics 文件，并提供通用 ICS 下载。",
                "changelog.v22.item4": "修复列表排序后删除条目可能删错目标的问题。",
                "changelog.v21.title": "v2.1",
                "changelog.v21.subtitle": "时区切换与导入时间处理增强。",
                "changelog.v21.item1": "新增 popup 时区选择器，默认显示时区为 Asia/Shanghai。",
                "changelog.v21.item2": "手动添加截止日期时，会按当前选中的时区保存，而不是依赖浏览器本地时区。",
                "changelog.v21.item3": "从 CCFDDL 导入的截止日期会继续保留原始时区语义，再按当前显示时区渲染。",
                "changelog.v21.item4": "增强 ICS 回退数据源解析，能够正确处理基于 TZID 的时间戳。",
                "changelog.v2.title": "v2.0",
                "changelog.v2.subtitle": "界面重构、导入优化、设置增强与版本标识。",
                "changelog.v2.item1": "重构 popup 布局，改为更紧凑的双入口卡片和底部工具栏。",
                "changelog.v2.item2": "导入面板默认常驻，推荐会议改为悬浮搜索选择器。",
                "changelog.v2.item3": "导入会议支持保留官网链接，加入卡片后可直接打开官方会议网站。",
                "changelog.v2.item4": "新增显示设置，支持 24 小时或 12 小时时间制，以及年在前或月在前的日期顺序。",
                "changelog.v2.item5": "在弹窗头部新增 v2.0 版本标识，并同步升级扩展版本号。",
                "changelog.v101.title": "v1.0.1",
                "changelog.v101.subtitle": "刷新与剩余天数修复。",
                "changelog.v101.item1": "修复日期无法自动更新的问题。",
                "changelog.v101.item2": "新增手动刷新按钮。",
                "changelog.v101.item3": "修正当天截止任务显示为 0 天。"
            }
        }
    }
};

function setMenuOpen(isOpen) {
    if (!menuToggle) {
        return;
    }

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
}

function readSavedLanguage() {
    try {
        const savedLanguage = window.localStorage.getItem(languageStorageKey);
        if (savedLanguage === "en" || savedLanguage === "zh") {
            return savedLanguage;
        }
    } catch (error) {
        return null;
    }

    return null;
}

function getPreferredLanguage() {
    const savedLanguage = readSavedLanguage();
    if (savedLanguage) {
        return savedLanguage;
    }

    return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function persistLanguage(language) {
    try {
        window.localStorage.setItem(languageStorageKey, language);
    } catch (error) {
        return;
    }
}

function getMessages(language) {
    const locale = translations[language] || translations.en;
    return {
        ...locale.common,
        ...(locale.pages[pageName] || {})
    };
}

function applyTextTranslations(messages) {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        if (messages[key]) {
            element.textContent = messages[key];
        }
    });

    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
        const key = element.dataset.i18nHtml;
        if (messages[key]) {
            element.innerHTML = messages[key];
        }
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        const key = element.dataset.i18nAriaLabel;
        if (messages[key]) {
            element.setAttribute("aria-label", messages[key]);
        }
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        const key = element.dataset.i18nAlt;
        if (messages[key]) {
            element.setAttribute("alt", messages[key]);
        }
    });

    document.querySelectorAll("[data-i18n-content]").forEach((element) => {
        const key = element.dataset.i18nContent;
        if (messages[key]) {
            element.setAttribute("content", messages[key]);
        }
    });
}

function applyLanguage(language) {
    const messages = getMessages(language);
    applyTextTranslations(messages);

    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    document.body.dataset.language = language;

    if (messages["meta.title"]) {
        document.title = messages["meta.title"];
    }

    if (languageToggle) {
        languageToggle.setAttribute("aria-pressed", String(language === "zh"));
    }
}

function toggleLanguage() {
    const currentLanguage = document.body.dataset.language || getPreferredLanguage();
    const nextLanguage = currentLanguage === "zh" ? "en" : "zh";
    persistLanguage(nextLanguage);
    applyLanguage(nextLanguage);
}

function setActivePreviewTab(activeIndex) {
    previewTabs.forEach((tab, index) => {
        const isActive = index === activeIndex;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-pressed", String(isActive));
    });
}

function scrollPreviewToIndex(index, behavior = "smooth") {
    const targetSlide = previewSlides[index];
    if (!targetSlide) {
        return;
    }

    targetSlide.scrollIntoView({
        behavior,
        block: "nearest",
        inline: "start"
    });

    setActivePreviewTab(index);
}

function getNearestPreviewIndex() {
    if (!previewScroller || previewSlides.length === 0) {
        return 0;
    }

    const currentScrollLeft = previewScroller.scrollLeft;
    let activeIndex = 0;
    let smallestDistance = Number.POSITIVE_INFINITY;

    previewSlides.forEach((slide, index) => {
        const distance = Math.abs(slide.offsetLeft - currentScrollLeft);
        if (distance < smallestDistance) {
            smallestDistance = distance;
            activeIndex = index;
        }
    });

    return activeIndex;
}

function clearPreviewAutoplayTimer() {
    if (previewAutoplayTimer !== null) {
        window.clearTimeout(previewAutoplayTimer);
        previewAutoplayTimer = null;
    }
}

function canPreviewAutoplay() {
    return Boolean(
        previewScroller
        && previewSlides.length > 1
        && previewTabs.length > 0
        && !previewAutoplayPaused
        && !document.hidden
        && !(previewReducedMotionQuery && previewReducedMotionQuery.matches)
    );
}

function schedulePreviewAutoplay(delay = previewAutoplayDelayMs) {
    clearPreviewAutoplayTimer();

    if (!canPreviewAutoplay()) {
        return;
    }

    previewAutoplayTimer = window.setTimeout(() => {
        const nextIndex = (getNearestPreviewIndex() + 1) % previewSlides.length;

        previewAutoScrolling = true;
        scrollPreviewToIndex(nextIndex);

        window.setTimeout(() => {
            previewAutoScrolling = false;
        }, 500);

        schedulePreviewAutoplay();
    }, delay);
}

function setPreviewAutoplayPaused(isPaused) {
    previewAutoplayPaused = isPaused;

    if (isPaused) {
        clearPreviewAutoplayTimer();
        return;
    }

    schedulePreviewAutoplay();
}

function initPreviewScroller() {
    if (!previewScroller || previewSlides.length === 0 || previewTabs.length === 0) {
        return;
    }

    previewTabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            scrollPreviewToIndex(index);
            schedulePreviewAutoplay();
        });
    });

    previewScroller.addEventListener("scroll", () => {
        setActivePreviewTab(getNearestPreviewIndex());

        if (!previewAutoScrolling) {
            schedulePreviewAutoplay();
        }
    }, { passive: true });

    if (previewShowcase) {
        previewShowcase.addEventListener("pointerenter", () => {
            setPreviewAutoplayPaused(true);
        });

        previewShowcase.addEventListener("pointerleave", () => {
            setPreviewAutoplayPaused(false);
        });

        previewShowcase.addEventListener("focusin", () => {
            setPreviewAutoplayPaused(true);
        });

        previewShowcase.addEventListener("focusout", (event) => {
            if (event.relatedTarget && previewShowcase.contains(event.relatedTarget)) {
                return;
            }

            setPreviewAutoplayPaused(false);
        });
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            clearPreviewAutoplayTimer();
            return;
        }

        schedulePreviewAutoplay();
    });

    if (previewReducedMotionQuery) {
        const handlePreviewMotionChange = () => {
            if (previewReducedMotionQuery.matches) {
                clearPreviewAutoplayTimer();
                return;
            }

            schedulePreviewAutoplay();
        };

        if (typeof previewReducedMotionQuery.addEventListener === "function") {
            previewReducedMotionQuery.addEventListener("change", handlePreviewMotionChange);
        } else if (typeof previewReducedMotionQuery.addListener === "function") {
            previewReducedMotionQuery.addListener(handlePreviewMotionChange);
        }
    }

    setActivePreviewTab(getNearestPreviewIndex());
    schedulePreviewAutoplay();
}

if (menuToggle && navPanel) {
    menuToggle.addEventListener("click", () => {
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        setMenuOpen(!expanded);
    });

    navPanel.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            setMenuOpen(false);
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 720) {
            setMenuOpen(false);
        }
    });
}

if (languageToggle) {
    languageToggle.addEventListener("click", () => {
        toggleLanguage();
        setMenuOpen(false);
    });
}

initPreviewScroller();
applyLanguage(getPreferredLanguage());
