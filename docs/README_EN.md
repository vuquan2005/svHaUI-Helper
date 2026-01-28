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
  <a href="https://greasyfork.org/scripts/562762-sv-haui-helper">
    <img src="https://img.shields.io/badge/Greasy%20Fork-Script-black?style=flat-square&logo=greasyfork" alt="Greasy Fork">
  </a>
</p>

---

## 📖 Introduction

**SV HaUI Helper** is a userscript designed to improve the user experience on the student portal [sv.haui.edu.vn](https://sv.haui.edu.vn) of Hanoi University of Industry (HaUI).

The project is built with a modular architecture, making it easy to extend and maintain.

## ✨ Features

- 🚀 **Ready to use** - Works immediately after installation
- ⚙️ **Flexible settings** - Toggle individual features as needed
- 🎨 **Beautiful UI** - Modern, user-friendly interface
- 💾 **Local storage** - Settings are saved in your browser

### Current Features

| Feature           | Description                                                   | Status |
| ----------------- | ------------------------------------------------------------- | -----: |
| 🏷️ Dynamic Title  | Changes tab title based on the page context                   |     ✅ |
| 🔐 Captcha Helper | Auto-fill captcha (lowercase, remove diacritics, auto-submit) |     ✅ |
| 🚀 Quick Nav      | Quick switch between Study Results and Exam Results pages     |     ✅ |
| 📝 Survey Auto    | Quick evaluation (select 1-5 score for all questions)         |     ✅ |

## 🚀 Installation

### Requirements

- Browser: Chrome, Firefox, Edge, or Safari
- Userscript manager extension:
  - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
  - [Violentmonkey](https://violentmonkey.github.io/)

### Quick Install

1. Install **Tampermonkey** or **Violentmonkey** from your browser's extension store.
2. Choose **one of the sources** below to install the script:

| Source            | Link                                                                                                                        | Notes                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **Greasy Fork**   | [Install](https://greasyfork.org/scripts/562762-sv-haui-helper)                                                             | Recommended - Auto-updates |
| GitHub (readable) | [svhaui-helper.user.js](https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download/svhaui-helper.user.js)         | Easy to read, for devs     |
| GitHub (minified) | [svhaui-helper.min.user.js](https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download/svhaui-helper.min.user.js) | Smaller, auto-updates      |

3. Confirm the installation in the Tampermonkey/Violentmonkey popup.
4. Visit [sv.haui.edu.vn](https://sv.haui.edu.vn) and enjoy!

### ⚠️ Note for Chrome / Edge (Manifest V3)

Due to Google's new security policies, you **must manually grant permission** for the script to work:

1. Go to the Extensions Management page: type `chrome://extensions` in the address bar.
2. Toggle **Developer mode** on in the top right corner.
3. Find **Tampermonkey/Violentmonkey** → Click **Details**.
4. Scroll down and enable the toggle for:
   > **Allow user scripts**
   > _(This setting allows the extension to run code not reviewed by Google)_
5. If a "Disable developer mode extensions" warning appears when restarting the browser, simply choose **Keep**.

## 🛠️ Development

### Requirements

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) (recommended) or npm

### Environment Setup

```bash
# Clone repository
git clone https://github.com/vuquan2005/svHaUI-Helper.git
cd svHaUI-Helper

# Install dependencies
pnpm install

# Run development server
pnpm dev
```
