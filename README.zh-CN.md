<div align="center">
  <img src="assets/ccf-ddl-tracker-logo.png" alt="CCF DDL Tracker Logo" width="96" />

  # CCF DDL Tracker

  轻量的 Chrome 扩展，用于管理 CCF 相关会议截止日期，支持手动添加、CCFDDL 导入和本地提醒。

  **版本:** `v2.2`

  [English Version](README.md) ·
  [GitHub Pages](https://jaychempan.github.io/ccf-ddl-tracker/) ·
  [Chrome Web Store](https://chromewebstore.google.com/detail/fnnpcnlkehcbickmdmepjpjimgcleidd?utm_source=item-share-cb) ·
  [Chrome 扩展说明](chrome/README.md) ·
  [CCFDDL 数据源](https://github.com/ccfddl/ccf-deadlines) ·
  [项目仓库](https://github.com/jaychempan/ccf-ddl-tracker)
</div>

---

## 预览

<div align="center">
  <img src="assets/previewv2.0.png" alt="CCF DDL Tracker v2.0 中文预览" width="720" />
</div>

当前版本延续了 v2.0 的紧凑 popup 布局，保留了 v2.1 的时区切换能力，并在 v2.2 中新增了右键日历菜单，可导出到 Google Calendar、Apple / iCloud 或通用 ICS。

---

## 安装

### Chrome Web Store

可直接从 Chrome 应用商店安装：

<div align="center">
  <a href="https://chromewebstore.google.com/detail/fnnpcnlkehcbickmdmepjpjimgcleidd?utm_source=item-share-cb" target="_blank" rel="noopener">
    <img src="https://fonts.gstatic.com/s/i/productlogos/chrome_store/v7/192px.svg" alt="Chrome Web Store" width="56" height="56" />
  </a>
</div>

### 开发者模式安装

1. 打开 Chrome，进入 `chrome://extensions/`。
2. 打开 `开发者模式`。
3. 点击 `加载已解压的扩展程序`。
4. 选择本仓库下的 [`chrome/`](chrome/) 目录。
5. 固定到工具栏后点击图标即可使用。

<details>
  <summary>需要更细的扩展说明？</summary>

  可查看 [chrome/README.md](chrome/README.md)。
</details>

---


## 核心功能

- **原生贴靠弹窗**：点击扩展图标后，会直接打开紧凑的 Chrome popup，而不是单独窗口。
- **手动添加 + 导入会议**：既可以新增自定义截止日期，也可以从 CCFDDL 导入推荐会议。
- **官网直达**：导入的会议会保留官网链接，加入列表后可直接点击打开会议官网。
- **日历接力**：右键已保存或导入的卡片，可直接发往 Google Calendar，或下载适用于 Apple / iCloud 等日历的 ICS 文件。
- **中英双语**：可在底部工具栏中切换中文和英文界面。
- **显示设置**：支持显示时区切换、`24 小时 / 12 小时` 时间制，以及 `年月日 / 月日年` 日期顺序切换。
- **仅本地存储**：所有数据都保存在 `chrome.storage.local` 中，不依赖账号或云同步。

---

## 自定义

- **语言**：可在 popup 底部切换中文和英文。
- **时区**：可在设置面板中切换截止时间显示时区，默认是 `Asia/Shanghai`。
- **时间制式**：可在设置面板中选择 `24 小时` 或 `12 小时（AM/PM）`。
- **日期顺序**：可切换 `YYYY/MM/DD` 或 `MM/DD/YYYY`。
- **日历操作**：可对已保存或导入的截止日期卡片点击右键，打开日历菜单。
- **导入会议卡片**：导入后的会议可加入个人列表，并支持直接跳转会议官网。

---

## 添加到日历

1. 打开 popup，找到任意一个已保存或已导入的截止日期卡片。
2. 对该卡片点击右键，打开日历菜单。
3. 选择 `Google Calendar` 可在浏览器中打开预填好的日历事件。
4. 选择 `Apple / iCloud (.ics)` 或 `下载 ICS 文件`，可导入到支持 ICS 的日历应用。

---

## 数据来源与隐私

- **主数据源**：[`ccfddl/ccf-deadlines`](https://github.com/ccfddl/ccf-deadlines)
- **回退数据源**：当 GitHub 数据不可用时，回退到 CCFDDL ICS
- **存储方式**：`chrome.storage.local`
- **隐私**：无账号、无云同步、无遥测

---

## 开发

- 仓库：<https://github.com/jaychempan/ccf-ddl-tracker>
- 网站源码：[website/](website/)
- GitHub Pages 地址：<https://jaychempan.github.io/ccf-ddl-tracker/>
- Chrome 扩展说明：[chrome/README.md](chrome/README.md)
- 技术栈：Manifest V3、Vanilla JavaScript、`chrome.storage.local`
- 共同开发：欢迎提交 Issue 和 Pull Request


## 更新日志

<details open>
  <summary><strong>v2.2</strong> - 右键日历菜单</summary>

  - 为 popup 中的截止日期卡片新增右键上下文菜单
  - 支持把保存或导入的条目直接添加到 Google Calendar
  - 支持导出适用于 Apple / iCloud 的 `.ics` 文件，并提供通用 ICS 下载
  - 修复列表排序后删除条目可能删错目标的问题
</details>

<details>
  <summary><strong>v2.1</strong> - 时区切换与导入时间处理增强</summary>

  - 新增 popup 时区选择器，默认显示时区为 `Asia/Shanghai`
  - 手动添加截止日期时，会按当前选中的时区解释并保存时间，而不是依赖浏览器本地时区
  - 从 CCFDDL 导入的截止日期会继续保留原始时区语义，再按当前显示时区渲染
  - 修复 ICS 回退数据源的 `TZID` 时间解析，避免 GitHub YAML 不可用时出现导入时间偏差
</details>

<details>
  <summary><strong>v2.0</strong> - 界面重构、导入优化、设置增强与版本标识</summary>

  - 重构 popup 布局，改为更紧凑的双入口卡片和底部工具栏
  - 导入面板默认常驻，搜索框点击后弹出悬浮推荐列表
  - 导入会议支持保留官网链接，加入“我的截止日期”后可点击卡片打开官网
  - 新增显示设置，支持 `24 小时 / 12 小时` 和 `年月日 / 月日年` 两组偏好
  - 弹窗右上角增加 `v2.0` 版本标记，并同步升级扩展版本号
</details>

<details>
  <summary><strong>v1.0.1</strong> - 刷新与剩余天数修复</summary>

  - 修复日期无法自动更新的问题
  - 新增手动刷新按钮
  - 修正当天截止任务显示为 `0 天`
</details>

---

## License

MIT License
