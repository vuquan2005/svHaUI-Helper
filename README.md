<p align="center">
  <img src="assets/logo.png" alt="Logo" width="80" height="80">
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
  <strong>English</strong> | <a href="README.vi.md">Tiếng Việt</a>
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

| Feature | Description | Status |
|---|---|---:|
| 🏷️ Dynamic Title | Changes tab title based on the page context | ✅ |
| 🔐 Captcha Helper | Auto-fill captcha (lowercase, remove diacritics, auto-submit) | ✅ |

## 🚀 Installation

### Requirements

- Browser: Chrome, Firefox, Edge, or Safari
- Userscript manager extension:
  - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
  - [Violentmonkey](https://violentmonkey.github.io/)
  - [Greasemonkey](https://www.greasespot.net/) (Firefox)

### Quick Install

1. Install Tampermonkey or Violentmonkey from your browser's extension store.
2. [Click here to install the userscript](https://github.com/vuquan2005/svHaUI-Helper/releases/latest/download/svhaui-helper.user.js).
3. Confirm the installation in the Tampermonkey popup.
4. Visit [sv.haui.edu.vn](https://sv.haui.edu.vn) and enjoy!

### ⚠️ Note for Chrome (Manifest V3)

From Chrome 127+, Google requires **Developer Mode** to be enabled to use userscript extensions.

#### How to enable Developer Mode:

1. Open `chrome://extensions` in the address bar.
2. Enable **Developer mode** (top right corner).
3. Find **Tampermonkey** → Click **Details**.
4. Enable **Allow access to file URLs** (if available).
5. Restart your browser.
6. When you see the "Disable developer mode extensions" warning popup, choose **Keep**.

#### Why is this necessary?

- Chrome Manifest V3 limits the capabilities of extensions.
- Tampermonkey needs Developer Mode to inject scripts.
- This is a Google requirement, not a fault of the extension.

#### Alternative Browsers (No Developer Mode needed):

| Browser | Support | Notes |
|---|---|---|
| Firefox | ✅ | Recommended - no restrictions |
| Edge | ⚠️ | Similar to Chrome |
| Brave | ⚠️ | Similar to Chrome |
| Opera | ⚠️ | Similar to Chrome |


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

The development server will run at `http://localhost:5173/`. Open this URL in your browser to install the development version of the userscript.

### Build production

```bash
# Build readable (for Greasy Fork)
pnpm build

# Build minified (lighter, for GitHub Releases)
pnpm build:minify

# Build both
pnpm build:all
```

| Output | Size | Usage |
|---|---|---|
| `dist/svhaui-helper.user.js` | ~14 KB | Greasy Fork, development |
| `dist/svhaui-helper.min.user.js` | ~9 KB | GitHub Releases |

### Release

When pushing a tag `v*`, GitHub Actions will automatically:
1. Build both versions.
2. Create a GitHub Release with attached assets.

```bash
git tag v1.2.0
git push origin main --tags
```


## 📁 Project Structure

```
svHaUI-Helper/
├── src/
│   ├── main.ts              # Main entry point
│   ├── vite-env.d.ts        # Type definitions
│   │
│   ├── core/                # Core modules
│   │   ├── feature.ts       # Base class for features
│   │   ├── feature-manager.ts
│   │   ├── settings.ts      # Settings management
│   │   └── index.ts
│   │
│   │   ├── dynamic-title/   # Dynamic Title
│   │   ├── captcha-helper/  # Captcha Helper
│   │   └── index.ts         # Registry
│   │
│   └── utils/               # Utilities
│       ├── dom.ts           # DOM helpers
│       ├── text-utils.ts    # Text processing
│       └── index.ts
│
├── dist/                    # Build output
├── vite.config.ts           # Vite + monkey config
├── tsconfig.json
└── package.json
```

## 🔧 Adding a New Feature

### 1. Create a feature class

```typescript
// src/features/my-feature/index.ts
import { Feature } from '../../core';
import { addStyles } from '../../utils';

export class MyFeature extends Feature {
    constructor() {
        super({
            id: 'my-feature',
            name: 'My Feature',
            description: 'Feature description',
            urlMatch: /sv\.haui\.edu\.vn\/some-page/,  // Optional
        });
    }

    init(): void {
        // Initialization logic
        console.log('My Feature initialized!');
    }

    destroy(): void {
        // Cleanup when disabled
    }
}
```

### 2. Register feature

```typescript
// src/features/index.ts
import { MyFeature } from './my-feature';

export const allFeatures: Feature[] = [
    // ... existing features
    new MyFeature(),
];
```

### 3. Test and build

```bash
pnpm dev    # Development
pnpm build  # Production
```

## 📚 Documentation

| Document | Description |
|---|---|
| [Creating Features Guide](docs/creating-features.md) | Details on how to create a new feature |
| [API Reference](docs/api-reference.md) | Reference for available APIs |
| [Contributing](CONTRIBUTING.md) | Contribution guidelines |

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for more details.

### Contribution Process

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License

Distributed under the GPL-3.0 License. See [LICENSE](LICENSE) for more information.

## 👤 Author

**VuQuan**

- GitHub: [@vuquan2005](https://github.com/vuquan2005)

## 🙏 Acknowledgements

- [vite-plugin-monkey](https://github.com/lisonge/vite-plugin-monkey) - Vite plugin for building userscripts
- [Tampermonkey](https://www.tampermonkey.net/) - Userscript manager
- HaUI - Hanoi University of Industry

---

<p align="center">
  Made with ❤️ for HaUI Students
</p>
