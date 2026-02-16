

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

* 🌐 **Bilingual Interface (EN / 中文)**
  Switch languages instantly via the top-right button.

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

* 🌐 **中英双语界面**
  点击右上角 EN / 中文 按钮即可切换语言。

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
