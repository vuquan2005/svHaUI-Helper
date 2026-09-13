<p align="center">
  <img src="../assets/logo.png" alt="Logo" width="80" height="80">
  <h1 align="center">SV HaUI Helper</h1>
  <p align="center">
    🎓 Enhancing the experience for HaUI students
    <br />
    <a href="https://github.com/vuquan2005/svHaUI-Helper/issues">Report Bug</a>
    ·
    <a href="https://github.com/vuquan2005/svHaUI-Helper/issues">Request Feature</a>
  </p>
</p>

<p align="center">
  <strong>English</strong> | <a href="../README.md">Tiếng Việt</a>
</p>

<p align="center">
  <a href="https://github.com/vuquan2005/svHaUI-Helper/releases">
    <img src="https://img.shields.io/github/v/release/vuquan2005/svHaUI-Helper?style=flat-square" alt="Release">
  </a>
  <a href="https://github.com/vuquan2005/svHaUI-Helper/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/vuquan2005/svHaUI-Helper?style=flat-square" alt="License">
  </a>
  <a href="https://github.com/vuquan2005/svHaUI-Helper/stargazers">
    <img src="https://img.shields.io/github/stars/vuquan2005/svHaUI-Helper?style=flat-square" alt="Stars">
  </a>
  <a href="https://greasyfork.org/en/scripts/562762-sv-haui-helper">
    <img src="https://img.shields.io/badge/Greasy%20Fork-Script-black?style=flat-square&logo=greasyfork" alt="Greasy Fork">
  </a>
</p>

---

## 📖 Introduction

**SV HaUI Helper** is a browser Web Extension designed to improve the user experience on the student portal [sv.haui.edu.vn](https://sv.haui.edu.vn) of Hanoi University of Industry (HaUI).

It operates **100% offline**, bundling a localized ONNX AI model for captcha recognition and a responsive popup dashboard for per-feature configuration.

## ✨ Features

| Feature            | Description                                                | Status |
| ------------------ | ---------------------------------------------------------- | -----: |
| 🏷️ Dynamic Title   | Changes tab title based on the page context                |     ✅ |
| 🔐 Captcha Helper  | Auto-solve (PP-OCRv4 Mobile ONNX) and fill captcha         |     ✅ |
| 📊 Grade Helper    | Grade highlighting, in-place GPA simulation & target goals |     ✅ |
| 🚀 Quick Nav       | Quick switch between Study Results and Exam Results pages  |     ✅ |
| 📝 Survey Auto     | Quick evaluation (select 1-5 score for all questions)      |     ✅ |
| 📅 Calendar Export | Export timetable to ICS format, auto-check for updates     |     ✅ |
| 📋 Exam Helper     | Exam countdown, consolidated exam plan & export to ICS     |     ✅ |
| ❄️ Remove Snowfall | Hide snowfall animation on the website                     |     ✅ |
| 🎛️ Popup Menu      | Quick control panel, toggle features live, exam countdown  |     ✅ |

## 🚀 Installation

### Install via GitHub Releases (Recommended)

#### 🌐 Microsoft Edge / Google Chrome / Brave

1. Download the latest `svhaui-helper-<version>-chrome.zip` from [GitHub Releases](https://github.com/vuquan2005/svHaUI-Helper/releases/latest).
2. Unpack the `.zip` archive into a local folder.
3. Open your browser and navigate to:
   - Edge: `edge://extensions`
   - Chrome / Brave: `chrome://extensions`
4. Enable **Developer mode** in the top right corner or side menu.
5. Click **Load unpacked** and select the extracted folder.
6. Visit [sv.haui.edu.vn](https://sv.haui.edu.vn) and enjoy!

#### 🦊 Mozilla Firefox

1. Download `svhaui-helper-<version>-firefox.zip` from [GitHub Releases](https://github.com/vuquan2005/svHaUI-Helper/releases/latest).
2. Navigate to `about:debugging#/runtime/this-firefox` in Firefox.
3. Click **Load Temporary Add-on...** and pick the downloaded zip file.

---

## 🛠️ Development

### Requirements

- [Node.js](https://nodejs.org/) >= 24
- [pnpm](https://pnpm.io/) >= 9

### Environment Setup

```bash
# Clone repository
git clone https://github.com/vuquan2005/svHaUI-Helper.git
cd svHaUI-Helper

# Install dependencies
pnpm install

# Start extension in development mode (Chromium / Edge)
pnpm dev

# Or start in Firefox
pnpm dev:firefox
```

### Build & Package

```bash
# Run tests
pnpm test

# Type check
pnpm compile

# Build for Chromium / Edge
pnpm build

# Build for Firefox
pnpm build:firefox

# Package zip for all platforms
pnpm zip:all
```
