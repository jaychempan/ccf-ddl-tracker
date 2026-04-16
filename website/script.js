const menuToggle = document.querySelector("[data-menu-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const languageToggle = document.querySelector("[data-lang-toggle]");
const pageName = document.body.dataset.page;
const languageStorageKey = "ccf-ddl-tracker-site-lang";

const translations = {
    en: {
        common: {
            "brand.ariaLabel": "CCF DDL Tracker home",
            "brand.logoAlt": "CCF DDL Tracker logo",
            "nav.home": "Home",
            "nav.getIt": "Get it",
            "nav.guide": "Guide",
            "nav.faq": "FAQ",
            "nav.changelog": "Changelog",
            "nav.github": "GitHub",
            "menu.ariaLabel": "Open site navigation",
            "langToggle.ariaLabel": "Switch website language",
            "footer.privacy": "Privacy Policy"
        },
        pages: {
            home: {
                "meta.title": "CCF DDL Tracker: Add and manage your deadlines in one click",
                "meta.description": "CCF DDL Tracker is an open source Chrome extension for tracking CCF deadlines with a compact popup, right-click calendar actions, time zone switching, import flow, and local-only storage.",
                "home.subtitle": "An open source Chrome extension for tracking CCF deadlines",
                "home.primaryCta": "Get Started",
                "home.preview.eyebrow": "Version 2.2",
                "home.preview.title": "Compact popup workflow for dense conference schedules",
                "home.preview.body": "The compact popup now adds a v2.2 right-click calendar menu, so you can send a deadline to Google Calendar or export an Apple / iCloud friendly ICS file.",
                "home.preview.imageAlt": "Preview of the CCF DDL Tracker popup",
                "home.intro": "CCF DDL Tracker provides a compact popup for keeping deadlines visible in Chrome. You can add custom deadlines, import recommended conferences from CCFDDL, switch the display time zone, send items to calendar apps from the right-click menu, and keep everything stored locally in your browser.",
                "home.features.title": "Features",
                "home.features.focused.title": "Focused tracking",
                "home.features.focused.item1": "Keep deadlines in a dense popup instead of a separate dashboard.",
                "home.features.focused.item2": "See remaining days quickly with compact cards and sorted lists.",
                "home.features.import.title": "CCFDDL import flow",
                "home.features.import.item1": "Import recommended conferences from the CCFDDL dataset and ICS fallback.",
                "home.features.import.item2": "Keep homepage links and source time zone data so each card can jump to the official conference site.",
                "home.features.settings.title": "User-friendly settings",
                "home.features.settings.item1": "Switch between Chinese and English, and choose a display time zone from the popup.",
                "home.features.settings.item2": "Choose time format and date order without leaving the popup.",
                "home.features.calendar.title": "Calendar handoff",
                "home.features.calendar.item1": "Right-click any saved or imported card to open the calendar menu.",
                "home.features.calendar.item2": "Send deadlines to Google Calendar or export ICS for Apple / iCloud and other calendar apps.",
                "home.note.title": "Note",
                "home.note.body": "This extension does not require an account and does not upload your saved deadlines. Your data stays in <code>chrome.storage.local</code> on the current browser.",
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
                "meta.title": "CCF DDL Tracker｜Get it",
                "meta.description": "Install CCF DDL Tracker from the Chrome Web Store or load it unpacked from source.",
                "getIt.title": "Get CCF DDL Tracker",
                "getIt.intro": "CCF DDL Tracker is built as a Manifest V3 Chrome extension. You can install it from the Chrome Web Store or load it unpacked from the repository during development.",
                "getIt.release.title": "Stable Release",
                "getIt.release.body": "The current stable release is v2.2, including right-click calendar actions for Google Calendar and Apple / iCloud friendly ICS export.",
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
                "meta.title": "CCF DDL Tracker｜Guide",
                "meta.description": "Guide for using the CCF DDL Tracker Chrome extension.",
                "guide.title": "Guide",
                "guide.intro": "This page covers the basic workflow for using CCF DDL Tracker after installation.",
                "guide.openPopup.title": "Open the Popup",
                "guide.openPopup.body": "Pin the extension to the Chrome toolbar and click the icon. The extension opens as a native popup, so you can check deadlines without leaving the current tab.",
                "guide.manual.title": "Add a Deadline Manually",
                "guide.manual.body": "Use the add form to enter a title, date, and time. Manual deadlines are interpreted in the currently selected display time zone before being saved, and the nearest item drives the toolbar badge countdown.",
                "guide.import.title": "Import Conferences from CCFDDL",
                "guide.import.body": "The import panel can fetch recommended conferences from the upstream CCFDDL data source. Imported cards keep their official homepage links and source time zone semantics, and you can add selected items into your own deadline list.",
                "guide.calendar.title": "Add a Deadline to Calendar",
                "guide.calendar.body": "Right-click any saved or imported deadline card to open the calendar menu. From there, you can send the item to Google Calendar or export an ICS file for Apple / iCloud and other calendar apps.",
                "guide.tip.title": "Tip",
                "guide.tip.body": "Imported deadlines are helpful for discovery, but you should still confirm the final submission schedule on the official conference website.",
                "guide.customize.title": "Customize the Display",
                "guide.customize.item1": "Switch language between Chinese and English from the bottom toolbar.",
                "guide.customize.item2": "Choose a display time zone in settings. The default is Asia/Shanghai.",
                "guide.customize.item3": "Choose a 24-hour or 12-hour clock in settings.",
                "guide.customize.item4": "Change date order between year-first and month-first formats.",
                "guide.links.title": "Open Official Conference Sites",
                "guide.links.body": "Imported conferences retain their homepage links, so once a card is added to your list, you can jump from the popup to the official website for calls for papers or updates.",
                "guide.storage.title": "Storage Model",
                "guide.storage.body": "All deadlines and preferences are stored in <code>chrome.storage.local</code>. The extension does not require sign-in or cloud sync to function."
            },
            faq: {
                "meta.title": "CCF DDL Tracker｜FAQ",
                "meta.description": "Frequently asked questions about CCF DDL Tracker.",
                "faq.title": "FAQ",
                "faq.q1": "Where are my deadlines stored?",
                "faq.a1": "They are stored in <code>chrome.storage.local</code> inside the browser. There is no account system and no project-hosted cloud sync.",
                "faq.q2": "Where do imported conferences come from?",
                "faq.a2": "Imports prefer the upstream <a href=\"https://github.com/ccfddl/ccf-deadlines\" target=\"_blank\" rel=\"noopener noreferrer\">ccfddl/ccf-deadlines</a> repository and fall back to CCFDDL ICS feeds when needed.",
                "faq.q3": "Should I trust imported deadlines without checking?",
                "faq.a3": "No. Imported dates are a convenience feature. For any real submission, always confirm the current CFP and official deadline on the conference website.",
                "faq.q4": "Does the extension collect analytics or telemetry?",
                "faq.a4": "No project-hosted telemetry is built into the extension. The workflow is designed to be local-first and does not require logging in.",
                "faq.q5": "Can I open the official conference homepage from a card?",
                "faq.a5": "Yes. Imported conferences keep their homepage links, and added cards can open the conference website directly from the popup.",
                "faq.q6": "Can I use my own custom deadlines?",
                "faq.a6": "Yes. The extension supports both manually added deadlines and imported conference entries.",
                "faq.q7": "How do I add a deadline to my calendar?",
                "faq.a7": "Right-click any saved or imported deadline card in the popup. You can open a prefilled Google Calendar event or export an ICS file for Apple / iCloud and other calendar apps."
            },
            privacy: {
                "meta.title": "CCF DDL Tracker｜Privacy Policy",
                "meta.description": "Privacy policy for CCF DDL Tracker.",
                "privacy.title": "Privacy Policy",
                "privacy.effectiveDate": "Effective date: April 15, 2026",
                "privacy.summary": "<strong>CCF DDL Tracker does not require an account and does not intentionally collect your personal data.</strong>",
                "privacy.local.title": "Local Storage",
                "privacy.local.body": "Deadlines, imported conference entries that you save, and interface preferences are stored in <code>chrome.storage.local</code> within the browser profile where the extension runs.",
                "privacy.sources.title": "External Data Sources",
                "privacy.sources.body": "The extension can fetch conference information from the upstream CCFDDL repository and fallback ICS feeds. These sources are used to help populate the import list.",
                "privacy.analytics.title": "Analytics",
                "privacy.analytics.body": "The extension workflow is designed to operate without project-hosted telemetry, user accounts, or cloud sync managed by this project.",
                "privacy.links.title": "Third-Party Links",
                "privacy.links.body": "The extension and this website may link to third-party sites such as conference homepages, GitHub repositories, or the Chrome Web Store. Those services have their own privacy policies and terms.",
                "privacy.changes.title": "Changes",
                "privacy.changes.body": "If this policy changes, the updated version will be published on this page.",
                "privacy.contact.title": "Contact",
                "privacy.contact.body": "For questions about the project, open an issue on <a href=\"https://github.com/jaychempan/ccf-ddl-tracker\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a>."
            },
            changelog: {
                "meta.title": "CCF DDL Tracker｜Changelog",
                "meta.description": "Release notes and update history for CCF DDL Tracker.",
                "changelog.title": "Changelog",
                "changelog.intro": "This page records major product and interface changes across website and extension releases.",
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
            "nav.home": "首页",
            "nav.getIt": "获取",
            "nav.guide": "指南",
            "nav.faq": "常见问题",
            "nav.changelog": "更新日志",
            "nav.github": "GitHub",
            "menu.ariaLabel": "打开网站导航",
            "langToggle.ariaLabel": "切换网站语言",
            "footer.privacy": "隐私政策"
        },
        pages: {
            home: {
                "meta.title": "CCF DDL Tracker: 一键添加和管理你的截止日期",
                "meta.description": "CCF DDL Tracker 是一个开源 Chrome 扩展，用紧凑弹窗、右键日历操作、时区切换、本地存储和导入流程帮助你跟踪 CCF 截稿日期。",
                "home.subtitle": "一个用于跟踪 CCF 截稿日期的开源 Chrome 扩展",
                "home.primaryCta": "开始使用",
                "home.preview.eyebrow": "2.2 版本",
                "home.preview.title": "为密集会议日程设计的紧凑弹窗工作流",
                "home.preview.body": "紧凑 popup 在 v2.2 中新增了右键日历菜单，你可以把截止日期直接发到 Google Calendar，或导出适用于 Apple / iCloud 的 ICS 文件。",
                "home.preview.imageAlt": "CCF DDL Tracker 弹窗预览图",
                "home.intro": "CCF DDL Tracker 提供了一个紧凑弹窗，让你在 Chrome 中随时看到截稿信息。你可以手动添加自定义截止日期、从 CCFDDL 导入推荐会议、切换显示时区、通过右键菜单发往日历应用，并将所有数据只保存在当前浏览器本地。",
                "home.features.title": "功能特性",
                "home.features.focused.title": "聚焦跟踪",
                "home.features.focused.item1": "在紧凑弹窗里集中查看截止日期，不需要额外打开独立面板。",
                "home.features.focused.item2": "通过紧凑卡片和排序列表快速看到剩余天数。",
                "home.features.import.title": "CCFDDL 导入流程",
                "home.features.import.item1": "可从 CCFDDL 数据集导入推荐会议，并在需要时回退到 ICS 数据源。",
                "home.features.import.item2": "保留会议主页链接和原始时区语义，卡片可直接跳转到官网。",
                "home.features.settings.title": "易用设置",
                "home.features.settings.item1": "可在弹窗中切换中英文，并选择显示时区。",
                "home.features.settings.item2": "无需离开弹窗即可调整时间格式和日期顺序。",
                "home.features.calendar.title": "日历接力",
                "home.features.calendar.item1": "可对任意已保存或已导入的卡片点击右键，打开日历菜单。",
                "home.features.calendar.item2": "支持发送到 Google Calendar，或导出适用于 Apple / iCloud 及其他日历应用的 ICS 文件。",
                "home.note.title": "说明",
                "home.note.body": "这个扩展不需要账号，也不会上传你保存的截止日期数据。所有数据都保存在当前浏览器的 <code>chrome.storage.local</code> 中。",
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
                "meta.title": "CCF DDL Tracker｜获取",
                "meta.description": "从 Chrome Web Store 安装 CCF DDL Tracker，或从源码以未打包方式加载。",
                "getIt.title": "获取 CCF DDL Tracker",
                "getIt.intro": "CCF DDL Tracker 是一个 Manifest V3 Chrome 扩展。你可以从 Chrome Web Store 安装，也可以在开发时直接从仓库源码加载未打包版本。",
                "getIt.release.title": "稳定版本",
                "getIt.release.body": "当前稳定版本为 v2.2，包含右键日历菜单、Google Calendar 直达和适用于 Apple / iCloud 的 ICS 导出。",
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
                "meta.title": "CCF DDL Tracker｜使用指南",
                "meta.description": "CCF DDL Tracker Chrome 扩展使用指南。",
                "guide.title": "使用指南",
                "guide.intro": "本页介绍安装完成后使用 CCF DDL Tracker 的基本流程。",
                "guide.openPopup.title": "打开弹窗",
                "guide.openPopup.body": "将扩展固定到 Chrome 工具栏后点击图标。扩展会以原生弹窗形式打开，因此你无需离开当前标签页就能查看截稿信息。",
                "guide.manual.title": "手动添加截止日期",
                "guide.manual.body": "使用添加表单填写标题、日期和时间。手动添加的截止日期会按当前选中的显示时区解释并保存，最近的一项会驱动工具栏徽标倒计时。",
                "guide.import.title": "从 CCFDDL 导入会议",
                "guide.import.body": "导入面板可以从上游 CCFDDL 数据源抓取推荐会议。导入卡片会保留官方主页链接和原始时区语义，你也可以把选中的项目加入自己的截止日期列表。",
                "guide.calendar.title": "添加到日历",
                "guide.calendar.body": "可对任意已保存或已导入的截止日期卡片点击右键，打开日历菜单。你可以从这里直接发送到 Google Calendar，或导出适用于 Apple / iCloud 及其他日历应用的 ICS 文件。",
                "guide.tip.title": "提示",
                "guide.tip.body": "导入的截止日期适合用于发现和初筛，但正式投稿前仍应到会议官网确认最终投稿时间。",
                "guide.customize.title": "自定义显示",
                "guide.customize.item1": "可在底部工具栏中切换中文和英文。",
                "guide.customize.item2": "可在设置中切换显示时区，默认是 Asia/Shanghai。",
                "guide.customize.item3": "可在设置中选择 24 小时制或 12 小时制。",
                "guide.customize.item4": "可在年在前和月在前之间切换日期格式。",
                "guide.links.title": "打开会议官网",
                "guide.links.body": "导入的会议会保留主页链接，因此当卡片加入你的列表后，你可以直接从弹窗跳转到会议官网查看征稿信息或最新动态。",
                "guide.storage.title": "存储方式",
                "guide.storage.body": "所有截止日期和偏好设置都保存在 <code>chrome.storage.local</code> 中。扩展无需登录，也不依赖云同步。"
            },
            faq: {
                "meta.title": "CCF DDL Tracker｜常见问题",
                "meta.description": "关于 CCF DDL Tracker 的常见问题。",
                "faq.title": "常见问题",
                "faq.q1": "我的截止日期数据存在哪里？",
                "faq.a1": "它们保存在浏览器内的 <code>chrome.storage.local</code> 中。项目没有账号系统，也没有项目托管的云同步。",
                "faq.q2": "导入的会议信息来自哪里？",
                "faq.a2": "导入优先使用上游 <a href=\"https://github.com/ccfddl/ccf-deadlines\" target=\"_blank\" rel=\"noopener noreferrer\">ccfddl/ccf-deadlines</a> 仓库，必要时回退到 CCFDDL 的 ICS 订阅源。",
                "faq.q3": "可以不核实就直接相信导入的截止日期吗？",
                "faq.a3": "不建议。导入日期只是便捷功能。对于真实投稿，请始终到会议官网确认最新 CFP 和官方 deadline。",
                "faq.q4": "扩展会收集统计数据或遥测吗？",
                "faq.a4": "扩展没有内置项目自托管遥测。整个工作流以本地优先为原则，也不要求登录。",
                "faq.q5": "我能从卡片直接打开会议官网吗？",
                "faq.a5": "可以。导入会议会保留主页链接，加入列表后的卡片可以直接从弹窗打开会议官网。",
                "faq.q6": "我能管理自己的自定义截止日期吗？",
                "faq.a6": "可以。扩展同时支持手动添加的截止日期和导入的会议条目。",
                "faq.q7": "我怎么把截止日期加到日历里？",
                "faq.a7": "可在 popup 中对任意已保存或已导入的截止日期卡片点击右键。你可以打开预填好的 Google Calendar 事件，或导出适用于 Apple / iCloud 及其他日历应用的 ICS 文件。"
            },
            privacy: {
                "meta.title": "CCF DDL Tracker｜隐私政策",
                "meta.description": "CCF DDL Tracker 的隐私政策。",
                "privacy.title": "隐私政策",
                "privacy.effectiveDate": "生效日期：2026 年 4 月 15 日",
                "privacy.summary": "<strong>CCF DDL Tracker 不需要账号，也不会主动收集你的个人数据。</strong>",
                "privacy.local.title": "本地存储",
                "privacy.local.body": "你保存的截止日期、导入后保留的会议条目以及界面偏好设置，都会存储在扩展运行所在浏览器配置中的 <code>chrome.storage.local</code> 里。",
                "privacy.sources.title": "外部数据源",
                "privacy.sources.body": "扩展可以从上游 CCFDDL 仓库及其备用 ICS 数据源获取会议信息，用于填充导入列表。",
                "privacy.analytics.title": "统计与分析",
                "privacy.analytics.body": "扩展工作流在设计上不依赖项目自托管遥测、用户账号或由本项目管理的云同步。",
                "privacy.links.title": "第三方链接",
                "privacy.links.body": "扩展和本网站可能会链接到第三方站点，例如会议主页、GitHub 仓库或 Chrome Web Store。这些服务各自拥有独立的隐私政策和条款。",
                "privacy.changes.title": "政策变更",
                "privacy.changes.body": "如果本政策发生更新，最新版本会发布在本页面。",
                "privacy.contact.title": "联系",
                "privacy.contact.body": "如果你对项目有问题，请在 <a href=\"https://github.com/jaychempan/ccf-ddl-tracker\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a> 上提交 issue。"
            },
            changelog: {
                "meta.title": "CCF DDL Tracker｜更新日志",
                "meta.description": "CCF DDL Tracker 的发布记录与更新历史。",
                "changelog.title": "更新日志",
                "changelog.intro": "本页记录网站与扩展版本中的主要产品更新和界面变化。",
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

applyLanguage(getPreferredLanguage());
