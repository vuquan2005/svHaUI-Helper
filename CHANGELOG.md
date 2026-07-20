# Changelog

## [2.6.1](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.6.0...v2.6.1) (2026-07-20)


### Bug Fixes

* fix WASM out of memory by using single-threaded ONNX Runtime ([#74](https://github.com/vuquan2005/svHaUI-Helper/issues/74)) ([a98ff85](https://github.com/vuquan2005/svHaUI-Helper/commit/a98ff852d7aaad2a3fa1eaea5d7fdf93e43e3f2f))

## [2.6.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.5.2...v2.6.0) (2026-07-20)


### Features

* **captcha:** replace Tesseract.js with PP-OCRv4 Mobile ONNX engine ([#72](https://github.com/vuquan2005/svHaUI-Helper/issues/72)) ([26065f2](https://github.com/vuquan2005/svHaUI-Helper/commit/26065f2f21d93a78178bff511e6a5c2165bd4c84))

## [2.5.4](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.5.3...v2.5.4) (2026-07-21)

### Features & Performance
* **captcha:** replace Tesseract.js with custom fine-tuned PP-OCRv4 Mobile ONNX engine via ONNX Runtime Web for ultra-fast (~20ms) and high-accuracy captcha recognition

## [2.5.3](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.5.2...v2.5.3) (2026-07-19)

### Refactoring & Performance
* **captcha:** remove heavy OpenCV.js library dependency and migrate to standard Web Canvas API with vanilla JS image utilities for instant initialization and lower memory usage ([#65](https://github.com/vuquan2005/svHaUI-Helper/issues/65))

### Chores
* **node:** upgrade project engines, local development environments, and CI workflows to Node.js 24 ([#66](https://github.com/vuquan2005/svHaUI-Helper/issues/66))

## [2.5.2](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.5.1...v2.5.2) (2026-03-02)


### Bug Fixes

* **export-timetable:** not downloaded button behavior ([#33](https://github.com/vuquan2005/svHaUI-Helper/issues/33)) ([a787db2](https://github.com/vuquan2005/svHaUI-Helper/commit/a787db20fe6ca9fc3a7ede231136c819fbc8db9c))
* **timetable:** resolve online class schedule data parsing issue ([#41](https://github.com/vuquan2005/svHaUI-Helper/issues/41)) ([bba40f4](https://github.com/vuquan2005/svHaUI-Helper/commit/bba40f43a984595d57f94e4463e03e3c52a902c0))

## [2.5.1](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.5.0...v2.5.1) (2026-02-24)

### Bug Fixes

- **calendar-export:** use css module for flex layout to prevent verti… ([#26](https://github.com/vuquan2005/svHaUI-Helper/issues/26)) ([8fdad7d](https://github.com/vuquan2005/svHaUI-Helper/commit/8fdad7db8ac6e6b83ce1a974f9f2b90a5ae96cbe))
