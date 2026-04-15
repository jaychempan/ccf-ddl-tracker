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
            "nav.github": "GitHub",
            "menu.ariaLabel": "Open site navigation",
            "langToggle.ariaLabel": "Switch website language",
            "footer.privacy": "Privacy Policy"
        },
        pages: {
            home: {
                "meta.title": "CCF DDL Tracker",
                "meta.description": "CCF DDL Tracker is an open source Chrome extension for tracking CCF deadlines with a compact popup, import flow, and local-only storage.",
                "home.subtitle": "An open source Chrome extension for tracking CCF deadlines",
                "home.primaryCta": "Get Started",
                "home.preview.eyebrow": "Version 2.0",
                "home.preview.title": "Compact popup workflow for dense conference schedules",
                "home.preview.body": "The popup focuses on quick scanning: compact top cards, a persistent import panel, a floating conference picker, footer shortcuts, and lightweight settings.",
                "home.preview.imageAlt": "Preview of the CCF DDL Tracker popup",
                "home.intro": "CCF DDL Tracker provides a compact popup for keeping deadlines visible in Chrome. You can add custom deadlines, import recommended conferences from CCFDDL, and keep everything stored locally in your browser.",
                "home.features.title": "Features",
                "home.features.focused.title": "Focused tracking",
                "home.features.focused.item1": "Keep deadlines in a dense popup instead of a separate dashboard.",
                "home.features.focused.item2": "See remaining days quickly with compact cards and sorted lists.",
                "home.features.import.title": "CCFDDL import flow",
                "home.features.import.item1": "Import recommended conferences from the CCFDDL dataset and ICS fallback.",
                "home.features.import.item2": "Keep homepage links so each card can jump to the official conference site.",
                "home.features.settings.title": "User-friendly settings",
                "home.features.settings.item1": "Switch between Chinese and English from the bottom toolbar.",
                "home.features.settings.item2": "Choose time format and date order without leaving the popup.",
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
                "meta.title": "Get CCF DDL Tracker",
                "meta.description": "Install CCF DDL Tracker from the Chrome Web Store or load it unpacked from source.",
                "getIt.title": "Get CCF DDL Tracker",
                "getIt.intro": "CCF DDL Tracker is built as a Manifest V3 Chrome extension. You can install it from the Chrome Web Store or load it unpacked from the repository during development.",
                "getIt.release.title": "Stable Release",
                "getIt.release.body": "The easiest path is the Chrome Web Store release.",
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
                "meta.title": "CCF DDL Tracker Guide",
                "meta.description": "Guide for using the CCF DDL Tracker Chrome extension.",
                "guide.title": "Guide",
                "guide.intro": "This page covers the basic workflow for using CCF DDL Tracker after installation.",
                "guide.openPopup.title": "Open the Popup",
                "guide.openPopup.body": "Pin the extension to the Chrome toolbar and click the icon. The extension opens as a native popup, so you can check deadlines without leaving the current tab.",
                "guide.manual.title": "Add a Deadline Manually",
                "guide.manual.body": "Use the add form to enter a title, date, and time. Saved deadlines are displayed in time order, and the nearest item drives the toolbar badge countdown.",
                "guide.import.title": "Import Conferences from CCFDDL",
                "guide.import.body": "The import panel can fetch recommended conferences from the upstream CCFDDL data source. Imported cards keep their official homepage links, and you can add selected items into your own deadline list.",
                "guide.tip.title": "Tip",
                "guide.tip.body": "Imported deadlines are helpful for discovery, but you should still confirm the final submission schedule on the official conference website.",
                "guide.customize.title": "Customize the Display",
                "guide.customize.item1": "Switch language between Chinese and English from the bottom toolbar.",
                "guide.customize.item2": "Choose a 24-hour or 12-hour clock in settings.",
                "guide.customize.item3": "Change date order between year-first and month-first formats.",
                "guide.links.title": "Open Official Conference Sites",
                "guide.links.body": "Imported conferences retain their homepage links, so once a card is added to your list, you can jump from the popup to the official website for calls for papers or updates.",
                "guide.storage.title": "Storage Model",
                "guide.storage.body": "All deadlines and preferences are stored in <code>chrome.storage.local</code>. The extension does not require sign-in or cloud sync to function."
            },
            faq: {
                "meta.title": "CCF DDL Tracker FAQ",
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
                "faq.a6": "Yes. The extension supports both manually added deadlines and imported conference entries."
            },
            privacy: {
                "meta.title": "CCF DDL Tracker Privacy Policy",
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
            "nav.github": "GitHub",
            "menu.ariaLabel": "打开网站导航",
            "langToggle.ariaLabel": "切换网站语言",
            "footer.privacy": "隐私政策"
        },
        pages: {
            home: {
                "meta.title": "CCF DDL Tracker",
                "meta.description": "CCF DDL Tracker 是一个开源 Chrome 扩展，用紧凑弹窗、本地存储和导入流程帮助你跟踪 CCF 截稿日期。",
                "home.subtitle": "一个用于跟踪 CCF 截稿日期的开源 Chrome 扩展",
                "home.primaryCta": "开始使用",
                "home.preview.eyebrow": "2.0 版本",
                "home.preview.title": "为密集会议日程设计的紧凑弹窗工作流",
                "home.preview.body": "弹窗界面强调快速浏览：顶部紧凑卡片、常驻导入面板、悬浮会议选择器、底部快捷入口，以及轻量级设置。",
                "home.preview.imageAlt": "CCF DDL Tracker 弹窗预览图",
                "home.intro": "CCF DDL Tracker 提供了一个紧凑弹窗，让你在 Chrome 中随时看到截稿信息。你可以手动添加自定义截止日期、从 CCFDDL 导入推荐会议，并将所有数据只保存在当前浏览器本地。",
                "home.features.title": "功能特性",
                "home.features.focused.title": "聚焦跟踪",
                "home.features.focused.item1": "在紧凑弹窗里集中查看截止日期，不需要额外打开独立面板。",
                "home.features.focused.item2": "通过紧凑卡片和排序列表快速看到剩余天数。",
                "home.features.import.title": "CCFDDL 导入流程",
                "home.features.import.item1": "可从 CCFDDL 数据集导入推荐会议，并在需要时回退到 ICS 数据源。",
                "home.features.import.item2": "保留会议主页链接，卡片可直接跳转到官网。",
                "home.features.settings.title": "易用设置",
                "home.features.settings.item1": "可在底部工具栏中切换中英文。",
                "home.features.settings.item2": "无需离开弹窗即可调整时间格式和日期顺序。",
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
                "meta.title": "获取 CCF DDL Tracker",
                "meta.description": "从 Chrome Web Store 安装 CCF DDL Tracker，或从源码以未打包方式加载。",
                "getIt.title": "获取 CCF DDL Tracker",
                "getIt.intro": "CCF DDL Tracker 是一个 Manifest V3 Chrome 扩展。你可以从 Chrome Web Store 安装，也可以在开发时直接从仓库源码加载未打包版本。",
                "getIt.release.title": "稳定版本",
                "getIt.release.body": "最简单的方式是直接安装 Chrome Web Store 版本。",
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
                "meta.title": "CCF DDL Tracker 使用指南",
                "meta.description": "CCF DDL Tracker Chrome 扩展使用指南。",
                "guide.title": "使用指南",
                "guide.intro": "本页介绍安装完成后使用 CCF DDL Tracker 的基本流程。",
                "guide.openPopup.title": "打开弹窗",
                "guide.openPopup.body": "将扩展固定到 Chrome 工具栏后点击图标。扩展会以原生弹窗形式打开，因此你无需离开当前标签页就能查看截稿信息。",
                "guide.manual.title": "手动添加截止日期",
                "guide.manual.body": "使用添加表单填写标题、日期和时间。保存后的截止日期会按时间顺序显示，最近的一项会驱动工具栏徽标倒计时。",
                "guide.import.title": "从 CCFDDL 导入会议",
                "guide.import.body": "导入面板可以从上游 CCFDDL 数据源抓取推荐会议。导入卡片会保留官方主页链接，你也可以把选中的项目加入自己的截止日期列表。",
                "guide.tip.title": "提示",
                "guide.tip.body": "导入的截止日期适合用于发现和初筛，但正式投稿前仍应到会议官网确认最终投稿时间。",
                "guide.customize.title": "自定义显示",
                "guide.customize.item1": "可在底部工具栏中切换中文和英文。",
                "guide.customize.item2": "可在设置中选择 24 小时制或 12 小时制。",
                "guide.customize.item3": "可在年在前和月在前之间切换日期格式。",
                "guide.links.title": "打开会议官网",
                "guide.links.body": "导入的会议会保留主页链接，因此当卡片加入你的列表后，你可以直接从弹窗跳转到会议官网查看征稿信息或最新动态。",
                "guide.storage.title": "存储方式",
                "guide.storage.body": "所有截止日期和偏好设置都保存在 <code>chrome.storage.local</code> 中。扩展无需登录，也不依赖云同步。"
            },
            faq: {
                "meta.title": "CCF DDL Tracker 常见问题",
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
                "faq.a6": "可以。扩展同时支持手动添加的截止日期和导入的会议条目。"
            },
            privacy: {
                "meta.title": "CCF DDL Tracker 隐私政策",
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
