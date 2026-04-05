

<div align="center">
<img src="assets/ccf-ddl-tracker-logo.png" alt="Image" width="100">

# CCF DDL Tracker 🚀

A Lightweight Chrome Extension for Tracking CCF Deadlines

[English](#english) · [中文](#中文)

</div>

---

## Quick Start
<div align="center" style="margin:24px 0;">
  <a href="https://chromewebstore.google.com/detail/fnnpcnlkehcbickmdmepjpjimgcleidd?utm_source=item-share-cb"
     target="_blank" rel="noopener"
     style="
       display:inline-flex;
       align-items:center;
       gap:14px;
       padding:14px 18px;
       border-radius:16px;
       background:linear-gradient(135deg,#f8fafc,#eef2ff);
       border:1px solid #e5e7eb;
       text-decoration:none;
       box-shadow:0 6px 20px rgba(0,0,0,0.06);
     ">
    <img
      src="https://fonts.gstatic.com/s/i/productlogos/chrome_store/v7/192px.svg"
      alt="Chrome Web Store"
      width="48"
      height="48"
      style="display:block;"
    />
    <div style="text-align:left;">
      <div style="font-size:16px;font-weight:700;color:#111827;">
        Available on Chrome Web Store
      </div>
      <div style="font-size:13px;color:#4f46e5;font-weight:500;">
        Install Extension →
      </div>
    </div>
  </a>
</div>



## 更新日志 / Changelog

### v2.0

**中文**
- 恢复为 Chrome 原生扩展弹窗，点击工具栏图标时使用贴靠图标的默认 popup 体验
- 优化弹窗界面：压缩顶栏高度，移除导入区说明文案，调整滚动条为仅保留滑块、去除轨道
- 恢复英文界面的原生日期选择器，日期显示样式继续遵循 Chrome / 系统本地化设置
- 将“新增截止日期”和“从 CCFDDL 导入”重构为一行两个入口卡片，点击后在下方切换对应面板
- 调整“我的 DDL”标题布局：数量显示在标题右侧，刷新按钮单独靠右
- 将弹窗顶部图标替换为 `chrome/icons/logo.png`
- 进一步压缩弹窗整体行高与卡片间距，提升信息密度
- 进一步压缩“加载 / 收起”和“刷新”按钮尺寸
- 新增表单提交成功后会自动收起；导入面板默认常驻显示，点击搜索框后会自动加载推荐会议
- 控制外层弹窗尽量不出现滚动条，“我的 DDL”和推荐会议列表分别在内部滚动
- 顶部两个入口卡片现在负责稳定开关面板：导入面板默认展开，再次点击导入卡片会收起它，点击新增卡片会先关闭导入面板
- 导入面板的搜索框改为自动展开的悬浮选择层：点击搜索框会自动加载并弹出推荐会议列表
- 顶部两个入口卡片的标题与说明文字改为居中，并进一步压缩行高
- 顶部两个入口卡片增加了左上角角标图标，且不再额外占用行高
- 将“从 CCFDDL 导入”入口卡片的角标换成了更简洁的搜索图标
- 微调英文入口卡片文案，缩短标题与说明文字以减少不自然换行
- 中文标题“我的 DDL”改为“我的截止日期”
- 导入搜索框下方增加了一行小字，提示点击搜索框可获取最新会议列表
- 将导入区提示文字改为居中，并把“我的截止日期”区域的刷新文字按钮换成图标按钮
- 将刷新图标换成更常见的无底框 SVG，并增加旋转动效表示刷新已触发
- 将语言切换和 CCFDDL 官网入口移到底部工具栏，移除右上角操作区
- 将底部工具栏贴近弹窗底边，去掉多余留白
- 继续压缩底部工具栏高度，将语言切换收成单行文字感
- 将底部工具栏固定贴到底边，消除其下方空白区域
- 增加弹窗启动瞬间的误触保护，避免打开时误触发“从 CCFDDL 导入”
- 将“从 CCFDDL 导入”面板改为默认常驻显示，但推荐列表仍只在点击搜索框后弹出
- 从 CCFDDL 导入的会议现在会保留官网链接，加入“我的截止日期”后可点击卡片直接打开会议官网
- 底部工具栏新增 GitHub 协作入口，可直接打开项目仓库参与开发
- 底部新增设置入口，可切换时间显示为 24 小时制或上午/下午 12 小时制
- 设置面板新增日期顺序选项，可在“年月日”和“月日年”两种显示顺序之间切换
- 扩展版本更新为 `v2.0`，并在弹窗右上角新增当前版本标记

**English**
- Restored the native Chrome extension popup so the toolbar icon opens the default anchored popup experience
- Refined the popup UI: compressed the header, removed the import hint text, and changed scrolling visuals to keep only the thumb without the track
- Restored the native date picker in English mode, with date display continuing to follow Chrome / system localization
- Reworked "Add DDL" and "Import from CCFDDL" into two side-by-side entry cards that switch the corresponding panel below
- Adjusted the "My DDLs" header so the item count sits next to the title while the Refresh button stays right-aligned
- Replaced the popup header icon with `chrome/icons/logo.png`
- Further tightened row height and card spacing across the popup to increase information density
- Further reduced the size of the Load / Collapse and Refresh buttons
- The add form now closes after a successful submit, and the import panel stays visible by default while the search field auto-loads recommendations when clicked
- Kept the outer popup from scrolling as much as possible by moving scrolling into "My DDLs" and the recommendation list
- The two top entry cards now control panel visibility directly: the import panel starts expanded, clicking the import card again collapses it, and clicking the add card closes the import panel first
- The import search field now opens a floating picker: clicking the search box auto-loads and shows recommended conferences in an overlay dropdown
- Centered the title and helper text inside the two top entry cards and tightened their line height further
- Replaced the CCFDDL import entry card badge with a cleaner search icon
- Moved the two top entry card icons into the top-left corner so they do not add extra line height
- Tightened the English entry-card copy to reduce awkward wrapping in the two top cards
- Renamed the Chinese "My DDLs" section title to "我的截止日期"
- Added a small helper line below the import search field explaining that clicking it loads the latest conference list
- Centered the import helper text and replaced the "My DDLs" refresh text button with an icon button
- Replaced the refresh icon with a more standard frameless SVG and added a spin animation to signal refresh
- Moved the language switcher and CCFDDL website shortcut into a bottom utility bar and removed the top-right actions
- Tightened the bottom utility bar so it sits closer to the popup edge without extra blank space
- Further compressed the bottom utility bar into a lighter single-line text-style control row
- Made the "Import from CCFDDL" panel stay visible by default, while keeping the recommendation picker lazy-opened from the search field
- Anchored the bottom utility bar to the popup edge so there is no empty area beneath it
- Added a short startup click guard to prevent accidental opening of "Import from CCFDDL" when the popup first appears
- Imported CCFDDL conferences now retain their homepage links, and added deadline cards can be clicked to open the conference website
- Added a GitHub contribution link to the bottom utility bar for opening the project repository directly
- Added a settings entry to the bottom bar so time display can switch between 24-hour and 12-hour formats
- Added a date-order option in settings so displayed dates can switch between year/month/day and month/day/year
- Updated the extension to `v2.0` and added a version label in the popup header

### v1.0.1

**中文**
- 修复了日期无法自动更新的问题  
- 新增手动刷新按钮，支持用户主动触发更新  
- 优化剩余天数的计算逻辑，使**当日截止的任务正确显示为 0 天**

**English**
- Fixed an issue where dates could not be updated automatically  
- Added a manual refresh button to allow users to trigger updates manually  
- Improved the remaining days calculation logic so that **tasks due today are correctly displayed as 0 days**<div align="center">

## English README

### 📌 Overview

**CCF DDL Tracker** is a lightweight and practical Chrome extension for tracking and managing **CCF conference deadlines (DDL)**.
It is designed for researchers, students, and developers who want a simple, distraction-free deadline reminder tool.

Conference data is synchronized from the official **CCFDDL** repository to ensure accuracy and timely updates.

📌 Data source synced from the official CCFDDL repository:
[https://github.com/ccfddl/ccf-deadlines](https://github.com/ccfddl/ccf-deadlines)

<img width="399" height="643" alt="111" src="https://github.com/user-attachments/assets/4e8f42bb-f0c1-4333-8886-cec648cae39c" />
<img width="356" height="602" alt="222" src="https://github.com/user-attachments/assets/7b7ba68f-3afd-4d80-80ee-0e6a78af8332" />

---

### ✨ Features

* 📝 **Quick DDL Creation**
  Manually add conference titles, dates, and times with one click.

* 📅 **Sorted Timeline View**
  All deadlines are automatically sorted by time and display remaining days in real time.

* 🔔 **Toolbar Countdown Badge**
  The Chrome toolbar icon shows the remaining days for the nearest upcoming deadline.

* 🗑 **One-Click Removal**
  Easily remove completed or unnecessary deadlines.

* 🔄 **Import from Official CCFDDL**

  * Primary source: GitHub CCFDDL repository
  * Fallback: CCFDDL ICS feed if GitHub access fails
  * Clicking the search field loads the latest recommendations in a floating picker

* 🌐 **Bilingual Interface (EN / 中文)**
  Switch languages instantly from the bottom toolbar.

* 🗓 **Native Date Picker**
  The date field uses Chrome's native date picker in both languages, and its visual format follows browser or system locale settings.

---

### 📦 Installation

#### Developer Mode (Recommended)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `chrome/` directory in this repository
5. Click the toolbar icon to start using CCF DDL Tracker

---

### 🔐 Data & Privacy

* All data is stored locally using `chrome.storage.local`
* No cloud sync
* No account, no tracking, no data collection

---

### 🛠 Tech Stack

* Chrome Extension (Manifest V3)
* Vanilla JavaScript
* `chrome.storage.local`
* GitHub API + ICS parsing

---

### 📄 License

MIT License

---

## 中文 README

### 📌 项目简介

**CCF DDL Tracker** 是一个轻量、实用的 Chrome 浏览器插件，用于集中管理和提醒 **CCF 相关会议 / 截止日期（DDL）**，适合科研人员、学生和开发者日常使用。

📌 数据来源同步自官方 CCFDDL 仓库：
[https://github.com/ccfddl/ccf-deadlines](https://github.com/ccfddl/ccf-deadlines)

<img width="442" height="653" alt="Snipaste_2026-02-08_12-51-14" src="https://github.com/user-attachments/assets/df9dd755-0d3e-476d-902c-36ef460837e6" />
<img width="381" height="614" alt="Snipaste_2026-02-08_12-51-54" src="https://github.com/user-attachments/assets/b0537a5c-ce59-4f53-81bb-4dce5547d29d" />

<div align="center">
<video width="400" controls>
<source src="assets/demo.mp4" type="video/mp4">
您的浏览器不支持视频标签。
</video>
</div>

* 📅 **清晰的时间排序视图**
  所有 DDL 按截止时间自动排序，并实时显示剩余天数。

* 🔔 **徽标倒计时提醒**
  浏览器工具栏图标显示最近一个 DDL 的剩余天数。

* 🗑 **一键删除**
  支持在列表中直接移除已完成或不需要的 DDL。

* 🔄 **从 CCFDDL 官方仓库导入**

  * 优先从 GitHub 仓库获取最新会议信息
  * GitHub 访问失败时自动回退到 CCFDDL 的 ICS 数据源
  * 点击搜索框即可加载最新推荐会议，并在悬浮选择层中展示

* 🌐 **中英双语界面**
  点击底部工具栏中的 EN / 中文 按钮即可切换语言。

* 🗓 **原生日期选择器**
  中英文界面都使用 Chrome 原生日期选择器，日期显示格式遵循浏览器或系统本地化设置。

---

### 📦 安装方式

#### 开发者模式安装（推荐）

1. 打开 Chrome，进入 `chrome://extensions/`
2. 打开右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择本仓库下的 `chrome/` 目录
5. 点击工具栏中的 CCF DDL Tracker 图标即可使用

---

### 🔐 数据与隐私

* 所有数据均存储在本地：`chrome.storage.local`
* 不上传云端
* 不收集任何个人信息

---

### 📄 开源协议

MIT License
