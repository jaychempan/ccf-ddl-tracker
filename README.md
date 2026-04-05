<div align="center">
  <img src="assets/ccf-ddl-tracker-logo.png" alt="CCF DDL Tracker Logo" width="96" />

  # CCF DDL Tracker

  Chrome extension for tracking CCF deadlines with a compact popup, import flow, and local-only storage.

  轻量的 Chrome 扩展，用于管理 CCF 相关会议截止日期，支持手动添加、CCFDDL 导入和本地提醒。

  **Current Version / 当前版本:** `v2.0`

  [Chrome Web Store](https://chromewebstore.google.com/detail/fnnpcnlkehcbickmdmepjpjimgcleidd?utm_source=item-share-cb) ·
  [Local Install](#install--安装) ·
  [Chrome Extension README](chrome/README.md) ·
  [CCFDDL Source](https://github.com/ccfddl/ccf-deadlines) ·
  [Contribute](https://github.com/jaychempan/ccf-ddl-tracker) ·
  [Changelog](#changelog--更新日志)
</div>

---

## Overview / 简介

**CCF DDL Tracker** keeps your upcoming deadlines in one place and shows the nearest remaining days directly on the Chrome toolbar badge. It is designed for researchers, students, and developers who want a fast popup instead of a heavy dashboard.

**CCF DDL Tracker** 适合希望快速查看和管理会议截止日期的科研人员、学生和开发者。它使用 Chrome 原生 popup 交互，在工具栏徽标上直接显示最近一个截止日期的剩余天数。

---

## Highlights / 核心功能

- **Native popup experience / 原生贴靠弹窗**: Clicking the extension icon opens a compact Chrome popup instead of a separate window.
- **Manual + imported deadlines / 手动添加 + 导入会议**: You can add custom deadlines or import recommended conferences from CCFDDL.
- **Official site shortcuts / 官网直达**: Imported conferences retain homepage links, and added cards can open the conference website directly.
- **Bilingual UI / 中英双语**: Switch between Chinese and English from the bottom toolbar.
- **Display preferences / 显示设置**: Choose 24-hour or 12-hour time, and switch date order between `YYYY/MM/DD` and `MM/DD/YYYY`.
- **Local-only data / 仅本地存储**: All data stays in `chrome.storage.local`, with no account or cloud sync.

---

## Preview / 预览

<div align="center">
  <img width="399" height="643" alt="English Popup Preview" src="https://github.com/user-attachments/assets/4e8f42bb-f0c1-4333-8886-cec648cae39c" />
  <img width="356" height="602" alt="Chinese Popup Preview" src="https://github.com/user-attachments/assets/7b7ba68f-3afd-4d80-80ee-0e6a78af8332" />
</div>

<details>
  <summary>More Screens / 更多界面截图</summary>

  <div align="center">
    <img width="442" height="653" alt="Popup Screenshot 1" src="https://github.com/user-attachments/assets/df9dd755-0d3e-476d-902c-36ef460837e6" />
    <img width="381" height="614" alt="Popup Screenshot 2" src="https://github.com/user-attachments/assets/b0537a5c-ce59-4f53-81bb-4dce5547d29d" />
  </div>
</details>

<details>
  <summary>Demo Video / 演示视频</summary>

  <div align="center">
    <video width="400" controls>
      <source src="assets/demo.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
</details>

---

## Install / 安装

### Chrome Web Store

Install directly from the Chrome Web Store:

<div align="center">
  <a href="https://chromewebstore.google.com/detail/fnnpcnlkehcbickmdmepjpjimgcleidd?utm_source=item-share-cb" target="_blank" rel="noopener">
    <img src="https://fonts.gstatic.com/s/i/productlogos/chrome_store/v7/192px.svg" alt="Chrome Web Store" width="56" height="56" />
  </a>
</div>

### Load Unpacked / 开发者模式安装

1. Open Chrome and visit `chrome://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select the [`chrome/`](chrome/) directory in this repository.
5. Pin `CCF DDL Tracker` to the toolbar and click the icon to use it.

1. 打开 Chrome，进入 `chrome://extensions/`。
2. 打开 `开发者模式`。
3. 点击 `加载已解压的扩展程序`。
4. 选择本仓库下的 [`chrome/`](chrome/) 目录。
5. 固定到工具栏后点击图标即可使用。

<details>
  <summary>Need more extension-specific details? / 需要更细的扩展说明？</summary>

  See [chrome/README.md](chrome/README.md) for the extension-only guide.
</details>

---

## Customization / 自定义

- **Language / 语言**: Toggle between Chinese and English from the popup footer.
- **Time format / 时间制式**: Choose `24-hour` or `12-hour (AM/PM)` in the settings panel.
- **Date order / 日期顺序**: Choose `YYYY/MM/DD` or `MM/DD/YYYY`.
- **Imported conference cards / 导入会议卡片**: Imported items can be added to your own list and opened directly on the conference website.

---

## Data Source & Privacy / 数据来源与隐私

- **Primary source / 主数据源**: [`ccfddl/ccf-deadlines`](https://github.com/ccfddl/ccf-deadlines)
- **Fallback / 回退数据源**: CCFDDL ICS feeds when GitHub data is unavailable
- **Storage / 存储方式**: `chrome.storage.local`
- **Privacy / 隐私**: no account, no cloud sync, no telemetry

---

## Development / 开发

- Repository / 仓库: <https://github.com/jaychempan/ccf-ddl-tracker>
- Chrome extension docs / 扩展说明: [chrome/README.md](chrome/README.md)
- Tech stack / 技术栈: Manifest V3, Vanilla JavaScript, `chrome.storage.local`
- Contribution / 共同开发: Issues and pull requests are welcome

---

## Changelog / 更新日志

<details open>
  <summary><strong>v2.0</strong> - UI overhaul, import improvements, settings, and versioning</summary>

  **中文**

  - 重构 popup 布局，改为更紧凑的双入口卡片和底部工具栏
  - 导入面板默认常驻，搜索框点击后弹出悬浮推荐列表
  - 导入会议支持保留官网链接，加入“我的截止日期”后可点击卡片打开官网
  - 新增显示设置，支持 `24 小时 / 12 小时` 和 `年月日 / 月日年` 两组偏好
  - 弹窗右上角增加 `v2.0` 版本标记，并同步升级扩展版本号

  **English**

  - Reworked the popup into a denser layout with two entry cards and a bottom utility bar
  - Kept the import panel visible by default while moving recommendations into a floating search picker
  - Imported conferences now keep homepage links and added cards can open the official conference site
  - Added display settings for `24-hour / 12-hour` time and `year-month-day / month-day-year` date order
  - Added a `v2.0` version label in the popup header and bumped the extension version
</details>

<details>
  <summary><strong>v1.0.1</strong> - Refresh and day-count fixes</summary>

  **中文**

  - 修复日期无法自动更新的问题
  - 新增手动刷新按钮
  - 修正当天截止任务显示为 `0 天`

  **English**

  - Fixed automatic date refresh issues
  - Added a manual refresh button
  - Corrected same-day deadlines to display `0 days`
</details>

---

## License

MIT License
