# Changelog

## [2.11.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.10.0...v2.11.0) (2026-08-23)


### Features

* **exam-helper:** enable full background plan sync on home sync button click ([#89](https://github.com/vuquan2005/svHaUI-Helper/issues/89)) ([a785fe3](https://github.com/vuquan2005/svHaUI-Helper/commit/a785fe3d603940d37c209b5db07d480b3d55242f))


### Bug Fixes

* **exam-helper:** prevent injecting home widget on login page ([#92](https://github.com/vuquan2005/svHaUI-Helper/issues/92)) ([1b29b0c](https://github.com/vuquan2005/svHaUI-Helper/commit/1b29b0cc0a9e5e5aba736464cdda4552d14ae187))


### Performance Improvements

* **captcha:** optimize inpainting with inpaintFast and fix vite dev environment ([#91](https://github.com/vuquan2005/svHaUI-Helper/issues/91)) ([59ff699](https://github.com/vuquan2005/svHaUI-Helper/commit/59ff699ab40e9ed38517bc752fbece26a49c5300))

## [2.10.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.9.0...v2.10.0) (2026-08-23)


### Features

* **exam-helper:** add exam plan streaming, schedule countdown, home widget, and unified ICS export ([#35](https://github.com/vuquan2005/svHaUI-Helper/issues/35)) ([0aa9bf4](https://github.com/vuquan2005/svHaUI-Helper/commit/0aa9bf4bea9550703f50f3b3bbfa0029020db277))

## [2.9.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.8.0...v2.9.0) (2026-08-22)


### Features

* **home:** add more shortcuts and compact dashboard action grid ([#86](https://github.com/vuquan2005/svHaUI-Helper/issues/86)) ([c86084d](https://github.com/vuquan2005/svHaUI-Helper/commit/c86084d0840d4a9bd28a993a7c98be7dfb8d067c))

## [2.8.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.7.1...v2.8.0) (2026-08-22)


### Features

* **grade:** add grade prediction and gpa simulation feature ([#85](https://github.com/vuquan2005/svHaUI-Helper/issues/85)) ([8eb6c16](https://github.com/vuquan2005/svHaUI-Helper/commit/8eb6c160c58d710309405644acaf11df068ba37e))


### Bug Fixes

* **captcha:** prevent auto-submitting hidden captcha elements ([#83](https://github.com/vuquan2005/svHaUI-Helper/issues/83)) ([e183702](https://github.com/vuquan2005/svHaUI-Helper/commit/e1837027e842dfddb0eeb3b45716dc38e6d2c0f3))

## [2.7.1](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.7.0...v2.7.1) (2026-08-22)


### Performance Improvements

* **captcha:** cache ONNX model and WASM binaries ([#81](https://github.com/vuquan2005/svHaUI-Helper/issues/81)) ([b6eebb1](https://github.com/vuquan2005/svHaUI-Helper/commit/b6eebb1882c3ea98a76117f0b85f9e854d132e53))

## [2.7.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.6.1...v2.7.0) (2026-07-20)


### Features

* **captcha:** auto submit captcha ([#76](https://github.com/vuquan2005/svHaUI-Helper/issues/76)) ([e4cc687](https://github.com/vuquan2005/svHaUI-Helper/commit/e4cc6879012c2fb40d6bab0692ff4d8217c8d058))

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
