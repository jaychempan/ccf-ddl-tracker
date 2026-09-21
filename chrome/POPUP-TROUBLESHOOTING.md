# Popup opening delays on macOS / macOS 弹窗打开延迟

[English](#english) · [中文](#中文)

## English

### Symptoms and scope

Clicking the toolbar icon may leave it pressed without showing the popup for a long time. **Inspect popup** may also fail to open during the same episode. Chromium tracks similar reports in [issue 549552319](https://issues.chromium.org/issues/549552319).

The issue discussion includes a trace where the popup renderer runs at background priority while its document loads, then receives higher priority only after the popup is shown. This can amplify loading delays. It is a plausible explanation for this extension's symptoms, not a confirmed root cause on every affected machine.

The grey **Can't read or change site's data** entry describes website access permissions; it does not disable the extension's own popup. The popup's brief import-click guard runs inside an already opened popup and does not control Chrome's toolbar action.

### Temporary workaround

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

### 现象与适用范围

点击工具栏图标后，图标可能呈按下状态，但弹窗长时间不出现；同一次卡顿中，“审查弹出内容”也可能打不开。Chromium 的 [issue 549552319](https://issues.chromium.org/issues/549552319) 记录了类似问题。

讨论中的一份跟踪记录发现：弹窗文档加载期间，渲染进程以后台优先级运行，直到弹窗显示后才获得更高优先级。这可能放大加载延迟。它能解释本扩展的类似现象，但尚不能确定是每台受影响电脑的根因。

右键菜单里灰色的“无法读取或更改网站的数据”是在说明网站访问权限，并不禁止打开扩展自己的弹窗。代码中短暂的导入点击保护发生在弹窗内部，不控制 Chrome 工具栏图标能否打开弹窗。

### 临时缓解方法

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
