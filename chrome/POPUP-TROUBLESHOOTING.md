# Popup troubleshooting in Edge and Chrome / Edge 与 Chrome 弹窗排查

[English](#english) · [中文](#中文)

## English

### Chrome on macOS: apply the official browser fix first

As of 2026-09-30, [Chromium issue 549552319](https://issues.chromium.org/issues/549552319) is marked **Fixed**. The fix re-enables `UseMachVouchers`; it was also merged into the M154 and M155 branches. This replaces the older launch-flag workaround as the first recovery step:

1. Open `chrome://settings/help` and let Chrome finish updating.
2. Save unfinished browsing work, then click **Relaunch** to apply the update. Restarting also activates downloaded browser experiment settings.
3. Test the popup immediately, then close it and leave Chrome idle for at least two minutes before testing again. Close popup/background DevTools and any tracker tabs during this test.

This addresses the upstream macOS defect; another cause of popup failure may need separate investigation. The historical launch command below remains an optional workaround if the problem persists.

### Current local verification (2026-09-30)

On macOS 26.6.2 (25G83), we applied Chrome's built-in update from **153.0.8010.53** to **154.0.8037.93** and restarted. `chrome://version` then showed variation **`6bac6c05-c44077d`**, the identifier the upstream maintainer associates with the repair. The command line contained no explicit `PMLoadingPageVoter` override.

The installed store copy and the second installed tracker both opened after the update, at the first observation approximately 1.3 seconds after each click including automation overhead. After closing both popups and leaving Chrome idle for **143 seconds**, the store copy opened on the first click, again visible at the first observation approximately 1.3 seconds later. A subsequent click on the second tracker also opened normally. The store popup had also opened before updating, so these observations do not prove a before/after performance improvement or permanent recovery.

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

### macOS 上的 Chrome：优先应用浏览器官方修复

截至 2026-09-30，[Chromium issue 549552319](https://issues.chromium.org/issues/549552319) 已标记为 **Fixed**。修复重新启用了 `UseMachVouchers`，并已合入 M154、M155 分支。优先按以下步骤恢复：

1. 打开 `chrome://settings/help`，等待 Chrome 完成更新。
2. 保存未完成的浏览工作，点击**重新启动**应用更新；重启也会使下载的浏览器实验配置生效。
3. 分别测试刚启动时，以及关闭弹窗、让 Chrome 闲置至少两分钟后的首次点击。测试期间关闭弹窗和后台的开发者工具，以及已打开的工具标签页。

这针对上游的 macOS 缺陷；其他原因导致的弹窗故障仍需单独排查。若问题持续，可再尝试下面保留的历史启动参数。

### 本次本机验证（2026-09-30）

在 macOS 26.6.2（25G83）上，通过 Chrome 自带更新从 **153.0.8010.53** 升级到 **154.0.8037.93** 并重启。随后 `chrome://version` 显示了上游维护者指出的修复配置标识 **`6bac6c05-c44077d`**；命令行没有显式指定 `PMLoadingPageVoter`。

更新后，已安装的商店版和另一份 Tracker 均能打开，首次检查到完整弹窗约为点击后 1.3 秒，包含自动化操作开销。关闭两份弹窗并让 Chrome 闲置 **143 秒**后，商店版首次点击正常打开，首次观察到完整弹窗同样约为点击后 1.3 秒；随后点击另一份 Tracker 也正常打开。更新前商店版也能打开，因此这些观察不能证明性能改善由更新造成，也不能证明不会复发。

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
