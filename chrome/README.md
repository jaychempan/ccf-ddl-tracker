# CCF DDL Tracker (Chrome Extension)

当前源码版本为 **v2.5**（manifest：`2.5.0`），新增角标按需更新、首屏减重、异步主题加载和会议搜索恢复；保留原版工具栏小闹钟、夜间模式、加载重试和标签页备用入口。可按下方步骤加载体验；GitHub 更新不会自动更新商店安装包，商店发布需单独提交审核。/ This source checkout is **v2.5** (manifest: `2.5.0`), adding on-demand badge updates, smaller first-view resources, asynchronous theme loading, and conference-search recovery. It retains the original toolbar clock, dark mode, loading retries, and tab fallback. Load it unpacked below; Web Store distribution requires a separate submission and review.

## 使用方法 / Usage

1. 打开 Chrome，进入 `chrome://extensions/`。/ Open Chrome and go to `chrome://extensions/`.
2. 打开右上角的“开发者模式”。/ Enable “Developer mode”.
3. 点击“加载已解压的扩展程序”，选择本仓库的 `chrome/` 目录。/ Click “Load unpacked” and select `chrome/`.
4. 安装完成后，点击浏览器工具栏的“CCF DDL Tracker”图标。/ Click the toolbar icon.

Edge 用户可在 `edge://extensions/` 按相同步骤加载。从 v2.4 起，可右键图标 →“选项”，在普通标签页中打开同一工具和同一份本地数据。/ In Edge, use the same steps at `edge://extensions/`. Since v2.4, right-click icon → Options opens the same tracker and local data in a regular tab.

## 功能说明 / Features

- **当前版本**：扩展版本已更新为 `v2.5`，弹窗右上角会显示版本标记。/ The extension is now `v2.5`, and the popup header shows the current version.
- **添加 DDL**：填写标题、日期、时间，点击“添加”。/ Add title/date/time and click “Add”.
- **查看详情**：弹窗中会按时间排序展示多个 DDL，并显示剩余天数。/ Sorted list with remaining days.
- **会议标签**：“我的截止日期”默认显示已有的 CCF 等级和分类，可在设置 → 会议标签中开关显示或选择 CORE、TH-CPL、地点。此前关闭显示的选择会保留。旧条目缺少标签时，点击导入区搜索框加载推荐会议，会补全标题与截止时间唯一匹配的条目。/ My DDLs shows available CCF rank and category tags by default. Settings → Conference Tags controls visibility and optional CORE, TH-CPL, and place fields; saved opt-outs are preserved. Loading recommendations via the import search field fills missing tags only for unique title-and-deadline matches.
- **徽标提示**：工具栏图标显示最近一个 DDL 的剩余天数；增删改后立即更新，并在天数变化或到期时安排下一次更新，没有未来 DDL 时不设置定时任务。/ The badge shows the nearest days left, updates immediately when deadlines change, and schedules its next update when the day count changes or the deadline expires. No alarm is scheduled without upcoming deadlines.
- **删除 DDL**：在条目右侧点击“删除”。/ Delete from the list.
- **右键日历菜单**：在已保存或导入的条目上右键，可添加到 Google Calendar，或导出适用于 Apple / iCloud 的 `.ics` 文件。/ Right-click any saved or imported item to add it to Google Calendar or export an Apple / iCloud compatible `.ics` file.
- **双入口卡片**：新增截止日期和从 CCFDDL 导入改为一行两个入口卡片，点击后切换下方面板。/ Add DDL and Import from CCFDDL now appear as two side-by-side entry cards that switch the panel below.
- **导入推荐会议**：导入面板默认常驻显示，会优先显示已缓存会议，并在点击搜索框时获取最新推荐。/ The import panel stays visible by default, shows cached conferences first, and refreshes recommendations when the search field is focused.
- **官网直达**：从 CCFDDL 导入的会议会保留官网链接，加入“我的截止日期”后可直接点击卡片打开会议官网。/ Imported CCFDDL conferences retain their homepage links, and once added to "My DDLs" the card can be clicked to open the conference website.
- **底部工具栏**：中英切换和 CCFDDL 官网入口已移动到底部工具栏，右上角不再放操作项。/ Language switching and the CCFDDL website shortcut now live in the bottom toolbar instead of the top-right corner.
- **协作入口**：底部工具栏新增 GitHub 仓库链接，可直接打开项目主页参与开发。/ The bottom toolbar now includes a GitHub repository link so you can open the project page and contribute directly.
- **显示设置**：底部新增设置入口，可切换时间显示为 24 小时制或上午/下午 12 小时制。/ A new settings entry in the bottom bar lets you switch time display between 24-hour and 12-hour formats.
- **夜间模式**：设置 → 外观提供“跟随系统 / 浅色 / 深色”，默认跟随系统，系统外观变化时立即切换；手动选择会保存在本机。卡片、输入框、下拉列表和日历菜单均适配深色。/ Settings → Appearance offers System (default), Light, and Dark. System mode updates immediately with your system appearance; manual choices are saved locally. Cards, inputs, dropdowns, and calendar menus all support dark mode.
- **日期顺序**：设置面板新增日期顺序选项，可在“年月日”和“月日年”之间切换。/ The settings panel now includes a date-order option for switching between year/month/day and month/day/year.
- **底部贴边**：底部工具栏已固定贴到底边，去掉其下方的空白区域。/ The bottom utility bar is now anchored to the popup edge, removing the empty area beneath it.
- **底部更轻量**：底部工具栏进一步压缩为接近单行文字的样式，语言切换不再保留按钮感。/ The bottom utility bar is further compressed into a near single-line text-style row, and the language toggle no longer looks like a button.
- **启动误触保护**：弹窗刚打开时会短暂忽略导入入口的误触，避免工具栏点击把“从 CCFDDL 导入”意外点开。/ When the popup first opens, the import entry briefly ignores accidental clicks so the toolbar click does not unintentionally open "Import from CCFDDL".
- **原生弹窗**：点击工具栏图标会打开 Chrome 原生 popup，而不是独立窗口。/ Clicking the toolbar icon opens the native Chrome popup instead of a separate window.
- **原生日期选择器**：中英文界面都使用 Chrome 原生日期选择器，日期显示格式遵循浏览器或系统本地化设置。/ Both languages use Chrome's native date picker, and the displayed format follows browser or system localization.
- **界面微调**：压缩了顶栏高度，并优化了导入区的搜索与提示布局。/ The header is more compact, and the import panel now uses a cleaner search-and-hint layout.
- **DDL 标题行调整**：数量显示在标题右侧，刷新按钮保持右对齐。/ The DDL header keeps the count beside the title while the Refresh button stays right-aligned.
- **弹窗图标更新**：顶部 28×28 图标使用 84×84 的 `chrome/icons/logo-popup.png`，兼顾高清屏；原始 logo 保留。/ The 28×28 header icon uses the 84×84 `chrome/icons/logo-popup.png` for high-density screens; the original logo is retained.
- **整体更紧凑**：统一压缩了表单、卡片、列表项和按钮的纵向间距。/ The form, cards, list rows, and buttons now use tighter vertical spacing overall.
- **操作更轻量**：新增表单提交成功后会自动收起，导入面板默认常驻，而推荐会议只在点击搜索框时自动加载。/ The add form closes after a successful submission, the import panel stays visible by default, and recommendations only auto-load when the search field is focused.
- **内部滚动优先**：尽量避免外层弹窗滚动，“我的 DDL”和推荐会议列表各自在内部滚动。/ The popup avoids outer scrolling as much as possible, with "My DDLs" and recommendations scrolling inside their own areas.
- **入口卡片稳定切换**：导入面板默认展开，再次点击导入卡片会收起它，点击新增卡片会先关闭导入面板。/ The import panel starts expanded, clicking the import card again collapses it, and clicking the add card closes the import panel first.
- **悬浮搜索选择器**：点击搜索会议输入框时，会自动加载并弹出悬浮的推荐会议列表。/ Clicking the conference search input auto-loads and opens a floating recommendation picker.
- **入口文案更紧凑**：顶部两个入口卡片的标题和说明文字现在居中显示，并进一步压缩了行高。/ The two top entry cards now center their title and helper text with tighter line height.
- **入口角标图标**：顶部两个入口卡片的图标移动到左上角，不再额外占用行高。/ The two top entry card icons now sit in the top-left corner without adding extra line height.
- **导入图标优化**：从 CCFDDL 导入入口的角标改为更简洁的搜索图标。/ The CCFDDL import entry badge now uses a cleaner search icon.
- **英文文案微调**：英文入口卡片的标题和说明文字做了缩短，减少不自然换行。/ The English entry-card title and helper copy were shortened to reduce awkward wrapping.
- **中文标题调整**：中文界面的“我的 DDL”改为“我的截止日期”。/ The Chinese "My DDLs" title was renamed to "我的截止日期".
- **导入提示文案**：搜索框下方增加了一行小字，提示点击搜索框可获取最新会议列表。/ A small helper line below the import search field explains that clicking it loads the latest conference list.
- **提示与刷新按钮微调**：导入区提示文字改为居中显示，“我的截止日期”的刷新按钮改为图标按钮。/ The import helper text is now centered, and the "My DDLs" refresh control now uses an icon button.
- **刷新图标与动效**：刷新按钮改为更常见的无底框 SVG 图标，并增加旋转动效表示已触发刷新。/ The refresh control now uses a more standard frameless SVG icon and spins briefly to indicate that refresh was triggered.

注：导入直接读取 CCFDDL 的 HTTPS YAML 数据源，失败时回退到中英文 ICS；任一 ICS 可用即可加载。每个请求最多等待 10 秒，避免数据源卡住时无法回退。

Note: Imports read the CCFDDL YAML dataset over HTTPS, then fall back to the Chinese and English ICS feeds. Either working feed is sufficient. Each request has a 10-second timeout so a stalled source can reach fallback.

## 数据存储 / Data

所有数据保存在 `chrome.storage.local` 中，仅在本机可见。/ Stored locally in `chrome.storage.local`.

## 弹窗卡顿 / Popup troubleshooting

从 v2.4 起，时区设置按需初始化，日期格式器复用，并一次读取首屏所需的本地数据。读取超过 3 秒或失败时显示重试入口，不会自动清空截止日期。升级本地源码后，需要重新加载已解压的扩展程序才会生效；商店版本不会随源码修改自动更新。

Since v2.4, time-zone settings initialize on demand, date formatters are reused, and first-view data loads in one local-storage call. A read failure or 3-second timeout offers Retry without clearing saved deadlines. Reload an unpacked extension to apply source changes; the store build does not update automatically.

v2.5 将主题脚本延后执行，移除了首屏前同步读写的 `localStorage` 缓存；主题偏好通过 `chrome.storage.local` 异步加载，期间使用系统配色。这消除了一个可能的加载阻塞点，但尚未证明解决了长期运行后弹窗打不开的问题。

v2.5 defers the theme script and removes its synchronous `localStorage` cache. Theme preferences load asynchronously from `chrome.storage.local`, with system colors used while pending. This removes a possible loading blocker; it does not establish that the long-running popup failure is fixed.

角标已取消每分钟轮询，改为按下一次显示变化设置单次 alarm；安装、浏览器启动和 DDL 数据变化时会立即重算。工具栏小闹钟保留原版图标资源和绘制方式，大小与线条不变。[Chrome 可能延后 alarm，且 alarm 不会唤醒休眠设备](https://developer.chrome.com/docs/extensions/reference/api/alarms#device_sleep)；恢复后按当前时间重算角标。

后台本地读取超过 3 秒会判为失败；当前更新失败后安排 5 分钟后的单次重试，过时结果和过时错误不能覆盖新的角标或调度。

Badge updates now use a one-shot alarm at the next display change instead of one-minute polling. Installation, browser startup, and deadline changes trigger an immediate recalculation. The toolbar clock retains its original icon assets and drawing method, preserving its size and strokes. [Chrome may delay alarms, and alarms do not wake sleeping devices](https://developer.chrome.com/docs/extensions/reference/api/alarms#device_sleep); an alarm after resume recalculates using the current time.

Background local reads time out after 3 seconds. A failed current update schedules a one-shot retry after 5 minutes; stale results and errors cannot overwrite a newer badge or schedule.

首屏 logo 从 91,632 字节缩小为 5,745 字节；YAML/ICS 解析器移至本地 `conference-parser.js`，仅在首次请求会议数据时加载。此轮修改将首屏 HTML、CSS、页面脚本和 logo 的合计大小从约 203 KB 降为 109 KB（减少约 46%）。这是文件体积统计，不代表实际启动耗时缩短了相同比例。

The first-view logo shrank from 91,632 to 5,745 bytes. YAML/ICS parsing moved to local `conference-parser.js`, loaded only on the first conference-data request. Together, these changes reduce the HTML, CSS, page scripts, and logo loaded on startup from about 203 KB to 109 KB (about 46%). File-size savings do not imply the same reduction in startup time.

页面内的分钟倒计时仍在可见时刷新；隐藏的备用标签页跳过定时读取，重新显示时立即刷新。/ Minute-level countdowns still refresh while the page is visible. A hidden fallback tab skips scheduled reads and refreshes immediately when shown again.

回归测试 / Regression tests (Node.js, no dependencies):

```sh
node chrome/tests/popup.test.mjs
node chrome/tests/theme.test.mjs
node chrome/tests/background.test.mjs
node chrome/tests/release.test.mjs
```

弹窗开发者工具的 Console 中可查看各阶段计时 / In the popup DevTools Console, inspect startup timings:

```js
performance.getEntriesByType("measure")
  .filter(({ name }) => name.startsWith("ccf-popup-"))
  .map(({ name, duration }) => ({ name, durationMs: Math.round(duration) }))
```

`document-to-script` 和 `document-to-dom` 从页面导航开始计时；`storage-read` 测量本地数据读取；`initialization` 测量初始化至数据渲染完成；`ready-to-frame` 记录就绪后的首次动画帧回调。它们不包含工具栏点击至导航开始的等待，也不能证明 Chrome 已显示弹窗。动画帧不会阻塞就绪，隐藏页面可能暂时没有该记录；超时提示也需要 JavaScript 能运行。

`document-to-script` and `document-to-dom` start at document navigation. `storage-read` measures the local data read; `initialization` ends after data rendering; `ready-to-frame` records the first animation-frame callback after readiness. These do not cover the wait between the toolbar click and navigation or prove that Chrome has shown the popup. Frames do not gate readiness and may be absent for hidden pages. The timeout UI also requires JavaScript to be running.

Edge 或 Chrome 点击图标无反应时，请查看[排查指南](POPUP-TROUBLESHOOTING.md#中文)。macOS 上的 Chrome 已有浏览器官方修复，优先在 `chrome://settings/help` 更新并重新启动，再测试闲置后的首次点击。指南同时提供标签页备用入口和错误收集步骤。

If the popup stops opening in Edge or Chrome, see the [troubleshooting guide](POPUP-TROUBLESHOOTING.md#english). For Chrome on macOS, first apply the official browser fix by updating at `chrome://settings/help` and relaunching, then test the first click after an idle period. The guide also covers the tab fallback and error collection.
