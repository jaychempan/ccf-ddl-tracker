# Popup troubleshooting in Edge and Chrome / Edge 与 Chrome 弹窗排查

[English](#english) · [中文](#中文)

## English

### v2.6: adding or deleting fails after an unpacked upgrade

A new popup can be running alongside an old background worker until the extension is reloaded. v2.6 reports an unavailable background separately from storage-read failures and offers **Reload extension**. Reload the existing installation at `chrome://extensions/` (or `edge://extensions/`), reopen the popup, and retry the operation. Refresh existing ccfddl.com tabs before connecting stars. Keep the original installation to retain local data.

If the save result is uncertain, use **Refresh** to inspect the saved list before repeating the operation. The extension does not replay the uncertain write automatically. An actual local-read failure still offers **Retry**. This recovery is separate from a browser that does not display the popup at all.

### Chrome on macOS: apply the official browser fix first

As of 2026-09-30, [Chromium issue 549552319](https://issues.chromium.org/issues/549552319) is marked **Fixed**. The fix re-enables `UseMachVouchers`; it was also merged into the M154 and M155 branches. This replaces the older launch-flag workaround as the first recovery step:

1. Open `chrome://settings/help` and let Chrome finish updating.
2. Save unfinished browsing work, then click **Relaunch** to apply the update. Restarting also activates downloaded browser experiment settings.
3. Test the popup immediately, then close it and leave Chrome idle for at least two minutes before testing again. Close popup/background DevTools and any tracker tabs during this test.

This addresses the upstream macOS defect; another cause of popup failure may need separate investigation. The historical launch command below remains an optional workaround if the problem persists.

### Current local verification (2026-09-30)

On macOS 26.6.2 (25G83), we applied Chrome's built-in update from **153.0.8010.53** to **154.0.8037.93** and restarted. `chrome://version` then showed variation **`6bac6c05-c44077d`**, the identifier the upstream maintainer associates with the repair. The command line contained no explicit `PMLoadingPageVoter` override.

The installed store copy and the second installed tracker both opened after the update, at the first observation approximately 1.3 seconds after each click including automation overhead. After closing both popups and leaving Chrome idle for **143 seconds**, the store copy opened on the first click, again visible at the first observation approximately 1.3 seconds later. A subsequent click on the second tracker also opened normally. The store popup had also opened before updating, so these observations do not prove a before/after performance improvement or permanent recovery.

### Recurrence on the updated browser (2026-10-01)

The store build **2.4.0** failed again on Chrome **154.0.8037.93**, macOS **26.6.2**. At the first inspection, its toolbar button was in the pressed state (`Value: 1`) and no popup window was visible. Subsequent observations retained that state. The running browser had launched at **2026-09-30 11:13:30 +0800**, about **26 hours** before the failure was recorded. The time of the user's initial click was not captured, so these observations do not provide a precise click-to-popup duration.

A three-second sample of the browser main process at **2026-10-01 13:32:02 +0800** found `CrBrowserMain` in the native event-loop wait path for **2260 of 2338 observations**. It did not identify a sustained main-thread busy loop or mutex/semaphore wait during that sample. This does not exclude waiting for a renderer, a renderer-side stall, or a popup display failure. The tracker renderer was not mapped or sampled, and the failing popup's DOM and Console had not been inspected at this point. Inspection-tool input failures are not evidence that Chrome's **Inspect popup** command itself hangs.

By **13:38 +0800**, the user reported that another toolbar click opened the popup. The browser main process remained the same, confirming that Chrome had not restarted. The investigator had not reloaded the extension. The user described recovery after a new click, rather than the originally pending popup appearing by itself. The store popup's DevTools was then observed open with zero Console messages, but no navigation or initialization timing was captured. The recovered page may be a new document; its successful opening does not explain the previous failed attempt, and an empty recovered Console does not rule out earlier errors.

This recurrence means the previous update and short successful tests did **not** establish permanent recovery. The current source removes the synchronous theme cache and adds startup measurements, but the installed store package does not include those changes. Neither this recurrence nor the main-process sample identifies the exact root cause.

### Comparison with the installed Citation Tracker (2026-10-01)

We compared the actual store packages, CCF DDL Tracker **2.4.0** and Citation Tracker **1.4.0**. Both declare a native `action.default_popup` and a Manifest V3 service worker. Neither declares content scripts, and neither contains code for offscreen documents, WebSocket connections, or runtime Port connections. The code does not support a claim that Citation avoids this failure by keeping its background continuously active.

| Startup behavior | CCF DDL Tracker 2.4.0 | Citation Tracker 1.4.0 |
| --- | --- | --- |
| Before the body is parsed | Blocking `theme.js` reads and writes `localStorage`, then reads the saved theme asynchronously | Head contains CSS only; page scripts are at the end of the body, with no Web Storage access |
| Initial saved data | Popup reads `chrome.storage.local` directly, with a three-second timeout | After `DOMContentLoaded`, popup sends `getState`; the worker reads saved data and replies asynchronously |
| Network required to open | None; conference requests start when search is opened | None; `getState` returns saved data without fetching Scholar |
| Scheduled background work | One-minute badge alarm; worker startup also draws the toolbar icon and reads badge data | Thirty-minute citation alarm, plus citation refresh after browser startup |
| Local first-view resources¹ | About 199 KB, including a 92 KB PNG logo and 72 KB of page JavaScript | About 73 KB, including a 1 KB SVG logo and 38 KB of page JavaScript |

¹ Sum of the installed HTML, CSS, page scripts, and logo; not measured transfer time or decoded memory, and not including the background worker. Citation's CSS is larger, and its first render also builds hidden views; it is not uniformly less work.

The head-level synchronous theme access is a concrete additional blocking point in CCF 2.4.0. If it stalls, the body and startup timeout cannot run yet; Citation has no corresponding head storage step. However, CCF **2.3.0** already failed before that theme script existed. Resource-size differences can add loading work but do not establish the cause of a long hang. Alarm definitions also do not establish which worker or renderer was active during the failure. These comparisons identify candidates for measurement, not a confirmed root cause.

The table describes the installed store packages. The v2.5 source snapshot (manifest: `2.5.0`) separately removes synchronous theme caching, replaces minute-level badge polling with one-shot scheduling, shrinks the header logo to 5.7 KB, and loads conference parsers on demand. The toolbar clock retains its original assets and drawing method. Its first-view files total about 109 KB, down from 203 KB before this resource change. Reload the unpacked copy to test these changes; the installed store package is unchanged, and the long-running failure still needs validation.

### Start here: Microsoft Edge

If the popup stops opening after a while, collect the following information **while it is failing**, before restarting or reloading:

1. Open `edge://version`. Record the complete Edge version and your operating system. You do not need to share the profile path or the entire page.
2. Open `edge://extensions`, turn on **Developer mode**, and find **CCF DDL Tracker**. Record its version and ID, check that it is enabled, and copy any messages under **Errors** if that button appears. An absent Errors button does not rule out a browser hang. Keep the messages until they have been recorded.
3. Try opening the tracker in a regular tab. In v2.4, right-click the toolbar icon and select **Options**, or open **Details → Extension options**. This uses the same `popup.html` and the same saved deadlines. Older installed packages can use the address below instead. Replace `YOUR_EXTENSION_ID` with the ID from step 2, paste it into the address bar, and press Enter:

   ```text
   chrome-extension://YOUR_EXTENSION_ID/popup.html
   ```

   Edge also uses the `chrome-extension://` scheme. This must be the ID of the copy installed in your current browser profile. If the page loads, you can use it to manage deadlines while investigating the toolbar popup.

4. With Developer mode enabled, right-click the toolbar icon and try **Inspect popup**. If DevTools opens, select **Console** and copy red errors, including their file names and line numbers. If inspection hangs too, record that. If the tracker opens only in a tab, inspect that tab with `F12` (Windows/Linux) or `Cmd+Option+I` (macOS); label those messages as **tab console** rather than popup console.
5. On the extension's management card, click the **service worker** link under **Inspect views** and check its **Console** separately. Record any errors as **background console**. Close these DevTools windows and the tracker tab before repeating the idle test: inspecting the worker keeps it active and can change the behavior you are testing.
6. Record whether other installed extension popups also fail, roughly how long Edge was idle, and whether one click eventually opens the popup. There is no need to install other extensions for this comparison.

Microsoft documents the extension management and error controls in its [sideloading guide](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading). Chrome's [debugging guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/debug) explains the separate popup and background consoles, including the effect of inspecting a worker.

### How to interpret the result

| Observation | Next step |
| --- | --- |
| The tracker works in a tab, but the toolbar popup or Inspect popup hangs | Investigate the browser's popup path; the tab is a temporary way to keep using the tracker. This observation alone does not identify the browser defect. |
| The tab also fails or shows a JavaScript error | Share the error text, source file and line number so we can investigate startup or saved-data handling. |
| The tracker opens and saved deadlines work, but conference import stays loading or fails | Investigate the import requests in DevTools → Network. This is a different symptom from the toolbar popup never appearing. |

`service worker (inactive)` is normal for a Manifest V3 extension: the browser suspends an idle worker and wakes it for events. This extension declares a native popup in the manifest; its popup reads local storage directly and does not wait for a background message. It fetches conference data only when the import dropdown is opened. The 300 ms import-click guard runs inside the popup after its script starts; it cannot prevent the browser from opening the toolbar popup.

### Recovery and a useful bug report

After recording the failure, save unfinished browsing work, fully exit Edge (**Microsoft Edge → Quit Microsoft Edge** / `Cmd+Q` on macOS; **Settings and more → Close Microsoft Edge** on Windows/Linux where available), then start it again. Closing one browser window may leave background processes running. Test immediately and again after leaving the popup closed and the browser idle for at least two minutes. If it recovers, record how long it takes to recur.

Check for browser updates at `edge://settings/help` and complete any requested restart. Updates or a restart may help, but successful clicks immediately after restarting do not establish a permanent fix. You can also try disabling and re-enabling the extension, or **Reload** for an unpacked copy, after recording errors. Avoid removing/reinstalling it as the first step: saved deadlines are local and uninstalling can remove them.

Include this information in a report; console screenshots are fine if copying text is difficult:

```text
OS and version:
Edge version:
Extension version and install method (Chrome Web Store / unpacked):
What happens on one click (nothing / blank / delayed, approximate seconds):
Time idle before failure:
Tracker in a tab (works / fails):
Inspect popup (opens / hangs):
Errors from extension card, popup/tab console, and background console:
Other installed extension popups affected:
Effect of full restart or extension reload, and time until recurrence:
```

Review screenshots before sharing them so they do not include private tabs, profile paths, or deadline details. No complete storage dump is needed for the initial report.

### Known Chrome/macOS issue and its limits

Clicking the toolbar icon may leave it pressed without showing the popup for a long time. **Inspect popup** may also fail to open during the same episode. Chromium tracks similar reports in [issue 549552319](https://issues.chromium.org/issues/549552319).

The issue discussion includes a trace where the popup renderer runs at background priority while its document loads, then receives higher priority only after the popup is shown. This can amplify loading delays. It is a plausible explanation for this extension's symptoms, not a confirmed root cause on every affected machine.

The original report found its minimal reproducer slow in Chrome but fast in Edge on the same Mac. Consequently, this Chrome report does **not** establish the cause of an Edge failure. The workaround and historical verification below apply to Chrome on macOS; they have not been verified for Edge.

The grey **Can't read or change site's data** entry describes website access permissions; it does not disable the extension's own popup. The popup's brief import-click guard runs inside an already opened popup and does not control Chrome's toolbar action.

### Historical Chrome/macOS workaround

1. Save any unfinished work, then use **Chrome → Quit Google Chrome** (`Cmd+Q`) to fully quit Chrome. Closing a window alone may leave Chrome running.
2. Start Chrome normally and check the popup. A normal restart may already restore it.
3. If the problem recurs, fully quit Chrome again, then run this command in Terminal:

   ```sh
   open -na "Google Chrome" --args --enable-features=PMLoadingPageVoter --restore-last-session
   ```

4. Open `chrome://version` and check that **Command Line** contains `--enable-features=PMLoadingPageVoter`. Test the popup immediately and again after leaving it closed for at least two minutes.

The command requests restoration of the previous browsing session and enables the feature for that Chrome launch. It does not change a persistent setting. To stop explicitly enabling it, fully quit Chrome and launch Chrome normally. If Chrome is already running, do not assume another launch command has changed its startup flags.

`PMLoadingPageVoter` is a Chrome-wide feature flag, not an extension permission or a setting limited to CCF DDL Tracker. Chromium maintainers recommended trying it in the issue discussion; it is a workaround, not a guarantee that the problem is permanently fixed.

### What the flag changes

The flag enables an existing component in Chrome's **Performance Manager**. `LoadingPageVoter` submits a higher-priority vote for a page's frames while the page is loading and withdraws that vote when loading finishes. Chrome combines this with other priority votes to determine execution and process priority. The intention is to prevent loading work from remaining at the lowest background priority before a page becomes visible.

In Chromium **153.0.8010.48**, `AddVoters()` in `performance_manager_lifetime.cc` registers this component when the feature is enabled. For `kLoading` / `kLoadedBusy` pages, `LoadingPageVoter` votes `kUserBlocking` when the root page is the active tab, or `kUserVisible` otherwise. After vote aggregation, `ProcessPriorityPolicy` applies the process priority through `RenderProcessHost::SetPriorityOverride()`. The flag does not force every popup to `kUserBlocking`.

This changes Chrome's scheduling policy for the current launch. It does not patch this repository's `popup.js`, keep a popup permanently alive, or enable extra website access. The extension cannot turn this browser feature on through its manifest or JavaScript; updating the extension alone does not apply the workaround.

### Local verification and limits

On 2026-09-21, with Chrome **153.0.8010.48** on macOS and the installed extension **2.3.0**, we observed:

| Condition | Result |
| --- | --- |
| Before restarting | No popup after more than 28 seconds |
| Normal restart | Popup opened immediately after restart and after more than two minutes idle |
| Restart with `PMLoadingPageVoter` | Popup opened immediately after restart and after more than two minutes idle |
| Inspect popup after the flagged restart | DevTools opened; the console showed no messages at that point |

“Opened” means the complete popup was visible at the first UI observation, approximately 0.9–1.4 seconds after the click including automation overhead. These are not precise rendering benchmarks.

Because a normal restart also restored the popup, this test does **not** establish that the flag caused the recovery. Four successful clicks after restarting do not establish a permanent fix. If it recurs, record the Chrome version, whether the flag is present, idle duration, and whether other extensions are affected. If **Inspect popup** works, capture any console errors; if it also hangs, record that symptom.

## 中文

### v2.6：升级已解压版本后添加或删除失败

更新文件后，新弹窗可能仍连接旧后台，直到重新加载扩展。v2.6 将后台未连接与本地读取失败区分，并提供**重新加载扩展**入口。也可在 `chrome://extensions/`（或 `edge://extensions/`）重新加载原安装项，再打开弹窗重试。连接收藏前刷新已有 ccfddl.com 标签页；保留原安装项即可沿用本地数据。

保存结果不确定时，先点击**刷新**查看已保存列表，再决定是否重试。扩展不会自动重复不确定的写入操作。真正的本地读取失败仍提供**重试**。这与浏览器完全无法显示弹窗的问题分别处理。

### macOS 上的 Chrome：优先应用浏览器官方修复

截至 2026-09-30，[Chromium issue 549552319](https://issues.chromium.org/issues/549552319) 已标记为 **Fixed**。修复重新启用了 `UseMachVouchers`，并已合入 M154、M155 分支。优先按以下步骤恢复：

1. 打开 `chrome://settings/help`，等待 Chrome 完成更新。
2. 保存未完成的浏览工作，点击**重新启动**应用更新；重启也会使下载的浏览器实验配置生效。
3. 分别测试刚启动时，以及关闭弹窗、让 Chrome 闲置至少两分钟后的首次点击。测试期间关闭弹窗和后台的开发者工具，以及已打开的工具标签页。

这针对上游的 macOS 缺陷；其他原因导致的弹窗故障仍需单独排查。若问题持续，可再尝试下面保留的历史启动参数。

### 本次本机验证（2026-09-30）

在 macOS 26.6.2（25G83）上，通过 Chrome 自带更新从 **153.0.8010.53** 升级到 **154.0.8037.93** 并重启。随后 `chrome://version` 显示了上游维护者指出的修复配置标识 **`6bac6c05-c44077d`**；命令行没有显式指定 `PMLoadingPageVoter`。

更新后，已安装的商店版和另一份 Tracker 均能打开，首次检查到完整弹窗约为点击后 1.3 秒，包含自动化操作开销。关闭两份弹窗并让 Chrome 闲置 **143 秒**后，商店版首次点击正常打开，首次观察到完整弹窗同样约为点击后 1.3 秒；随后点击另一份 Tracker 也正常打开。更新前商店版也能打开，因此这些观察不能证明性能改善由更新造成，也不能证明不会复发。

### 更新后的浏览器仍然复发（2026-10-01）

在 Chrome **154.0.8037.93**、macOS **26.6.2** 上，商店版 **2.4.0** 再次无法打开。首次检查时，工具栏按钮处于按下状态（`Value: 1`），没有可见的弹窗窗口；后续观察仍是同一状态。当前浏览器启动于 **2026-09-30 11:13:30 +0800**，记录故障时已连续运行约 **26 小时**。没有捕获用户最初点击的时刻，因此这不能作为精确的点击至弹出耗时。

在 **2026-10-01 13:32:02 +0800** 对浏览器主进程进行的三秒采样中，`CrBrowserMain` 的 **2338 次观测有 2260 次**位于原生事件循环等待路径。采样期间没有定位到持续的主线程忙循环或 mutex/semaphore 等待。这不能排除等待渲染进程、渲染进程自身卡住或弹窗显示失败。此时还未映射和采样 Tracker 的渲染进程，也未检查故障弹窗的 DOM 和控制台。检查工具执行输入失败，不能被当作 Chrome 的“审查弹出内容”命令本身卡住的证据。

截至 **13:38 +0800**，用户报告重新点击工具栏图标后弹窗能够打开。浏览器主进程仍是同一个，确认 Chrome 没有重启；排查期间也未由检查者重新加载扩展。用户描述的是重新点击后恢复，并非原来等待的弹窗自行出现。随后观察到商店版弹窗的开发者工具已打开，Console 显示零条消息，但未取得导航或初始化计时。恢复后的页面可能是新建文档，正常打开不能解释前一次失败；恢复后的空控制台也不能排除之前出现过错误。

此次复发说明，前面的浏览器更新和短时间正常打开**没有证明长期问题已解决**。当前源码移除了同步主题缓存并增加启动计时，但已安装商店包没有这些改动；这次复发与主进程采样均不能确定具体根因。

### 与已安装 Citation Tracker 的对比（2026-10-01）

对比的是实际商店安装包：CCF DDL Tracker **2.4.0**、Citation Tracker **1.4.0**。两者都声明原生 `action.default_popup` 和 Manifest V3 service worker；均未声明内容脚本，也未发现 offscreen document、WebSocket 或 runtime Port 连接代码。源码不支持“Citation 靠后台一直活跃来避免该故障”的解释。

| 启动行为 | CCF DDL Tracker 2.4.0 | Citation Tracker 1.4.0 |
| --- | --- | --- |
| body 解析前 | 阻塞式 `theme.js` 同步读写 `localStorage`，再异步读取主题偏好 | head 只有 CSS；页面脚本在 body 尾部，没有 Web Storage 访问 |
| 首屏已存数据 | 弹窗直接异步读 `chrome.storage.local`，有三秒超时 | `DOMContentLoaded` 后发送 `getState`，后台异步读取数据并回复 |
| 打开是否依赖网络 | 不依赖；打开搜索才请求会议 | 不依赖；`getState` 只返回已存数据，不请求 Scholar |
| 定时后台工作 | 每分钟更新角标；worker 启动时还绘制工具栏图标、读取角标数据 | 每 30 分钟刷新引用，浏览器启动后也刷新引用 |
| 本地首屏资源¹ | 约 199 KB，其中 PNG logo 约 92 KB、页面脚本约 72 KB | 约 73 KB，其中 SVG logo 约 1 KB、页面脚本约 38 KB |

¹ 统计已安装 HTML、CSS、页面脚本和 logo 的文件大小，不代表实际传输时间或解码内存，也不包含后台。Citation 的 CSS 反而更大，首屏还会渲染隐藏视图，因此不能笼统说它处处更省工作。

head 中的同步主题访问是 CCF 2.4.0 确实多出的一个阻塞点：如果它卡住，body 和启动超时都还不能执行；Citation 没有对应步骤。但 **CCF 2.3.0 没有该主题脚本时就发生过故障**。资源量差异可能增加加载工作，不能证明长时间卡住的原因；定时器定义也不能证明故障时哪个 worker 或渲染进程活跃。这些对比用于确定测量对象，尚不能确定具体根因。

上表描述的是已安装商店包。v2.5 源码快照（manifest：`2.5.0`）当时另外移除了同步主题缓存，将每分钟角标轮询改为单次调度、顶部 logo 缩至 5.7 KB，并按需加载会议解析器；工具栏小闹钟保留原版资源和绘制方式。这轮资源修改将首屏文件合计从约 203 KB 降至 109 KB。重新加载已解压版本后可测试这些改动；已安装商店包没有变化，长期故障仍需验证。

### 先从这里开始：Microsoft Edge

如果使用一段时间后弹窗无法打开，请在**故障仍然发生时**收集以下信息，再重启浏览器或重新加载扩展：

1. 打开 `edge://version`，记录完整的 Edge 版本号和操作系统。无需提供个人资料路径或整页截图。
2. 打开 `edge://extensions`，开启**开发者模式**，找到 **CCF DDL Tracker**。记录版本号和 ID，确认已启用；若出现**错误**按钮，请复制其中的信息。没有错误按钮也不能排除浏览器卡顿。先记录，再清除错误。
3. 尝试在普通标签页中打开工具。v2.4 提供右键工具栏图标 → **选项**，或**详细信息 → 扩展选项**入口，使用同一个 `popup.html` 和同一份截止日期数据。旧安装包可使用下面的地址：把 `YOUR_EXTENSION_ID` 换成第 2 步中的 ID，粘贴到地址栏并回车。

   ```text
   chrome-extension://YOUR_EXTENSION_ID/popup.html
   ```

   Edge 也使用 `chrome-extension://` 地址协议；ID 必须对应当前浏览器个人资料中安装的那一份扩展。若能打开，可先用该标签页继续管理截止日期。

4. 开启开发者模式后，右键工具栏图标，尝试**审查弹出内容（Inspect popup）**。若能打开开发者工具，选择 **Console（控制台）**，复制红色错误及其文件名、行号。若审查也卡住，请记录。如果只有标签页能打开，可在该标签页按 `F12`（Windows/Linux）或 `Cmd+Option+I`（macOS）查看控制台；请注明这是**标签页控制台**。
5. 在扩展管理卡片的**检查视图（Inspect views）**中点击 **service worker**，单独查看其 **Console**，将错误标注为**后台控制台**。重复闲置测试前，关闭这些开发者工具和工具标签页：检查 worker 会使它保持运行，从而影响重现。
6. 记录其他已安装扩展的弹窗是否也失效、Edge 大约闲置多久后出问题，以及单击后是否最终弹出。不必为此安装其他扩展。

Microsoft 的[本地扩展测试指南](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading)说明了管理和错误入口。Chrome 的[扩展调试指南](https://developer.chrome.com/docs/extensions/get-started/tutorial/debug)解释了弹窗与后台的独立控制台，以及检查 worker 对运行状态的影响。

### 如何判断下一步

| 观察结果 | 下一步 |
| --- | --- |
| 标签页正常，但工具栏弹窗或审查弹出内容卡住 | 排查浏览器的弹窗路径；可先用标签页继续使用工具。仅凭此现象还不能确定具体浏览器缺陷。 |
| 标签页也失败或出现 JavaScript 错误 | 提供错误文本、文件名和行号，以便检查启动流程或存储数据处理。 |
| 工具及已保存截止日期正常，只有会议导入一直加载或失败 | 在开发者工具 → Network 中检查导入请求；这与工具栏弹窗完全不出现是不同的现象。 |

`service worker（inactive）` 对 Manifest V3 扩展属于正常休眠，浏览器会在事件发生时唤醒它。本扩展在 manifest 中声明原生弹窗；弹窗直接读取本地存储，不等待后台消息。会议数据只在打开导入下拉列表时获取。300 毫秒的导入误触保护在弹窗脚本启动后生效，不会阻止浏览器打开工具栏弹窗。

### 恢复使用与问题报告

记录故障后，先保存未完成的浏览工作，再完全退出 Edge（macOS：**Microsoft Edge → 退出 Microsoft Edge** / `Cmd+Q`；Windows/Linux：若菜单提供，可选**设置及更多 → 关闭 Microsoft Edge**），然后重新启动。只关闭一个窗口可能仍有后台进程运行。分别测试刚启动时，以及关闭弹窗并让浏览器闲置至少两分钟后的表现。若恢复，记录多久后复发。

在 `edge://settings/help` 检查浏览器更新，并完成提示的重启。更新或重启可能缓解，但刚重启后的成功点击不能证明永久修复。记录错误后，也可关闭再启用扩展，或对未打包版本点击**重新加载**。不建议一开始就卸载重装：截止日期保存在本机，卸载可能删除这些数据。

问题报告可包含以下信息；如果不方便复制错误文本，控制台截图也可以：

```text
操作系统及版本：
Edge 完整版本：
扩展版本及安装方式（Chrome 应用商店 / 未打包）：
单击后的现象（无弹窗 / 空白 / 延迟及大约秒数）：
故障前闲置时长：
标签页打开工具（正常 / 失败）：
审查弹出内容（可打开 / 卡住）：
扩展卡片、弹窗或标签页控制台、后台控制台中的错误：
其他已安装扩展是否同样受影响：
完全重启或重新加载扩展的效果，以及多久后复发：
```

分享前请检查截图中是否包含私人标签页、个人资料路径或截止日期详情。初步报告无需提供完整的存储数据。

### 已知 Chrome/macOS 问题与适用范围

点击工具栏图标后，图标可能呈按下状态，但弹窗长时间不出现；同一次卡顿中，“审查弹出内容”也可能打不开。Chromium 的 [issue 549552319](https://issues.chromium.org/issues/549552319) 记录了类似问题。

讨论中的一份跟踪记录发现：弹窗文档加载期间，渲染进程以后台优先级运行，直到弹窗显示后才获得更高优先级。这可能放大加载延迟。它能解释本扩展的类似现象，但尚不能确定是每台受影响电脑的根因。

原始报告中，同一台 Mac 上的最小重现扩展在 Chrome 中延迟，而 Edge 中正常。因此，该报告不能直接确定 Edge 故障的原因。下面的临时参数和历史验证针对 macOS 上的 Chrome，尚未在 Edge 中验证。

右键菜单里灰色的“无法读取或更改网站的数据”是在说明网站访问权限，并不禁止打开扩展自己的弹窗。代码中短暂的导入点击保护发生在弹窗内部，不控制 Chrome 工具栏图标能否打开弹窗。

### 历史 Chrome/macOS 缓解方法

1. 保存未完成的工作，通过 **Chrome → 退出 Google Chrome**（`Cmd+Q`）完全退出浏览器。只关闭窗口可能仍有 Chrome 进程在运行。
2. 正常启动 Chrome 并测试弹窗。普通重启就可能恢复。
3. 如果问题复发，再次完全退出 Chrome，然后在终端运行：

   ```sh
   open -na "Google Chrome" --args --enable-features=PMLoadingPageVoter --restore-last-session
   ```

4. 打开 `chrome://version`，确认“命令行”包含 `--enable-features=PMLoadingPageVoter`。分别测试刚启动时，以及关闭弹窗并闲置至少两分钟后能否打开。

这个命令会请求恢复上次浏览会话，并为本次 Chrome 启动启用该功能，不会修改持久设置。若要停止显式启用它，完全退出后正常启动 Chrome 即可。如果 Chrome 已在运行，不要认为再次执行启动命令就能改变现有进程的参数。

`PMLoadingPageVoter` 是作用于 Chrome 的功能开关，不是扩展权限，也不是只针对 CCF DDL Tracker 的设置。Chromium 维护者在上述讨论中建议尝试它，但这属于缓解方法，不保证永久解决问题。

### 参数具体改变了什么

它启用 Chrome **Performance Manager（性能管理器）**中的已有组件。页面加载期间，`LoadingPageVoter` 为页面中的 frame 提交较高优先级的“投票”；加载结束后撤销这项投票。Chrome 综合它和其他优先级投票，决定执行上下文和进程的优先级，目的是避免页面显示前的加载工作一直处于最低后台优先级。

在 Chromium **153.0.8010.48** 中，`performance_manager_lifetime.cc` 的 `AddVoters()` 根据开关注册该组件。页面处于 `kLoading` / `kLoadedBusy` 时，如果根页面是当前活动标签页，`LoadingPageVoter` 提交 `kUserBlocking`，否则提交 `kUserVisible`。投票汇总后，`ProcessPriorityPolicy` 通过 `RenderProcessHost::SetPriorityOverride()` 应用进程优先级。因此它并非把所有弹窗强制设为 `kUserBlocking`。

它改变的是本次启动的 Chrome 调度策略，不会修改本仓库的 `popup.js`、永久保活弹窗或增加网站访问权限。扩展无法通过 `manifest.json` 或 JavaScript 启用这个浏览器功能；仅更新扩展并不会自动应用此缓解办法。

### 本机验证与结论限制

2026-09-21，在 macOS、Chrome **153.0.8010.48** 和已安装扩展 **2.3.0** 上测试：

| 条件 | 结果 |
| --- | --- |
| 重启前 | 等待超过 28 秒，弹窗仍未出现 |
| 普通重启 | 刚启动时、闲置超过两分钟后，均能打开 |
| 带 `PMLoadingPageVoter` 重启 | 刚启动时、闲置超过两分钟后，均能打开 |
| 带参数重启后“审查弹出内容” | DevTools 能打开，当时 Console 没有消息 |

这里的“能打开”是指首次 UI 检查时已显示完整弹窗，点击到检查约 0.9–1.4 秒，包含自动化检测开销，不是精确的渲染耗时。

由于普通重启也有效，不能据此认定恢复由参数造成；重启后的四次成功点击也不能证明永久修复。如果复发，可记录 Chrome 版本、是否带参数、闲置时长，以及其他扩展是否同样受影响。如果“审查弹出内容”可用，记录 Console 错误；如果它也卡住，请一并记录。

## References / 参考

- [Chromium issue 549552319: Extension action popups take 2–60s to open on macOS](https://issues.chromium.org/issues/549552319)
- [Chromium 153.0.8010.48: Registering LoadingPageVoter](https://chromium.googlesource.com/chromium/src/+/refs/tags/153.0.8010.48/components/performance_manager/performance_manager_lifetime.cc)
- [Chromium 153.0.8010.48: LoadingPageVoter implementation](https://chromium.googlesource.com/chromium/src/+/refs/tags/153.0.8010.48/components/performance_manager/execution_context_priority/loading_page_voter.cc)
- [Chromium 153.0.8010.48: Applying process priorities](https://chromium.googlesource.com/chromium/src/+/refs/tags/153.0.8010.48/components/performance_manager/graph/policies/process_priority_policy.cc)
- [Chrome extension manifest reference](https://developer.chrome.com/docs/extensions/reference/manifest)
- [Microsoft Edge: Sideloading and extension errors](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading)
- [Chrome extension debugging](https://developer.chrome.com/docs/extensions/get-started/tutorial/debug)
- [Extension service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
- [Opening extension options in a tab](https://developer.chrome.com/docs/extensions/develop/ui/options-page)
