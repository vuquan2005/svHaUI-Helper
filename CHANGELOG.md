# Changelog

## [4.0.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v3.1.0...v4.0.0) (2026-09-14)


### ⚠ BREAKING CHANGES

* migrate from userscript to browser extension with WXT ([#105](https://github.com/vuquan2005/svHaUI-Helper/issues/105))

### Features

* add build time to log banner ([fb3447a](https://github.com/vuquan2005/svHaUI-Helper/commit/fb3447a21b405333479804137474af592bffcc16))
* add dynamic title feature ([fec5a5f](https://github.com/vuquan2005/svHaUI-Helper/commit/fec5a5f894fb22903d69ec3c2457a0e5942bac03))
* add export timetable ([#13](https://github.com/vuquan2005/svHaUI-Helper/issues/13)) ([892ae64](https://github.com/vuquan2005/svHaUI-Helper/commit/892ae64c7507670f5ebc476aaa57b4367af10c03))
* add minified build and GitHub Actions CI/CD ([b44bc3e](https://github.com/vuquan2005/svHaUI-Helper/commit/b44bc3e8ac6953be6bbd4820a21763aeb0b7fa89))
* add quick evaluation survey feature ([b5deeb3](https://github.com/vuquan2005/svHaUI-Helper/commit/b5deeb39bda9f76baea6c216d06c20ed90fca94f))
* add quick navigation feature v2.1.0 ([a49a2c2](https://github.com/vuquan2005/svHaUI-Helper/commit/a49a2c2cb013594a124e98dda9bcfceac8299158))
* **brand:** redesign extension logo with 3D origami concept ([#112](https://github.com/vuquan2005/svHaUI-Helper/issues/112)) ([1d0b4d6](https://github.com/vuquan2005/svHaUI-Helper/commit/1d0b4d6ecaeed938f16c6d57b83378afaecb5e08))
* **captcha-helper:** integrate OpenCV and refactor captcha-helper ([7531d83](https://github.com/vuquan2005/svHaUI-Helper/commit/7531d83bb5a91d9d84a615599fcae1dd29cbc76f))
* **captcha-helper:** integrate Tesseract.js and implement captcha recognition logic ([91a0e86](https://github.com/vuquan2005/svHaUI-Helper/commit/91a0e867c1173efe9ba14c5ba3594fc4f38742a2))
* **captcha:** add captcha helper feature ([2495de4](https://github.com/vuquan2005/svHaUI-Helper/commit/2495de483b08d13bd76489ee1de612f338ac1250))
* **captcha:** add captchaUndoTelex setting to SettingsManager ([862dbc4](https://github.com/vuquan2005/svHaUI-Helper/commit/862dbc460ffa7c784445843b7cb010345f79191c))
* **captcha:** auto submit captcha ([#76](https://github.com/vuquan2005/svHaUI-Helper/issues/76)) ([e4cc687](https://github.com/vuquan2005/svHaUI-Helper/commit/e4cc6879012c2fb40d6bab0692ff4d8217c8d058))
* **captcha:** improve input normalization logic ([70f3628](https://github.com/vuquan2005/svHaUI-Helper/commit/70f3628b709aeb8fb484d09d03b08a1ef0142e4e))
* **captcha:** replace Tesseract.js with PP-OCRv4 Mobile ONNX engine ([#72](https://github.com/vuquan2005/svHaUI-Helper/issues/72)) ([26065f2](https://github.com/vuquan2005/svHaUI-Helper/commit/26065f2f21d93a78178bff511e6a5c2165bd4c84))
* **core:** enhance FeatureManager with lifecycle control and SPA support ([411b549](https://github.com/vuquan2005/svHaUI-Helper/commit/411b5499b5e42eaab3d36c12bec75af4ac66a4b0))
* **core:** implement feature priority system ([2c011d6](https://github.com/vuquan2005/svHaUI-Helper/commit/2c011d6e689e37e17368cf922eed6cd6b4019dbe))
* **core:** update feature system and storage integration, remove obsolete settings manager ([b60afd4](https://github.com/vuquan2005/svHaUI-Helper/commit/b60afd47298ba42182382985b91d922494ce65ca))
* **dynamic-title:** add title for survey view page, and updateuser ([0bddbce](https://github.com/vuquan2005/svHaUI-Helper/commit/0bddbce7dfebfb8928ee4adb9831df18559b996b))
* **dynamic-title:** auto-stop observer when title found ([e6337df](https://github.com/vuquan2005/svHaUI-Helper/commit/e6337df03dc574e596e8a0bd257d48f2adeb695d))
* enhance captcha helper and update title map ([a615ef9](https://github.com/vuquan2005/svHaUI-Helper/commit/a615ef9361a06aca6ca926c158a091bf613ecef7))
* **exam-helper:** add exam plan streaming, schedule countdown, home widget, and unified ICS export ([#35](https://github.com/vuquan2005/svHaUI-Helper/issues/35)) ([0aa9bf4](https://github.com/vuquan2005/svHaUI-Helper/commit/0aa9bf4bea9550703f50f3b3bbfa0029020db277))
* **exam-helper:** enable full background plan sync on home sync button click ([#89](https://github.com/vuquan2005/svHaUI-Helper/issues/89)) ([a785fe3](https://github.com/vuquan2005/svHaUI-Helper/commit/a785fe3d603940d37c209b5db07d480b3d55242f))
* **grade-prediction:** add simple rule syntax  for non-credit ([#96](https://github.com/vuquan2005/svHaUI-Helper/issues/96)) ([b0b42a3](https://github.com/vuquan2005/svHaUI-Helper/commit/b0b42a3f2421b2a939882dc940c1c21ab0055d74))
* **grade-prediction:** highlight retaken courses and improve input ([#99](https://github.com/vuquan2005/svHaUI-Helper/issues/99)) ([6679f48](https://github.com/vuquan2005/svHaUI-Helper/commit/6679f48a3907543c5e5abaacce1e11144d896275))
* **grade:** add grade prediction and gpa simulation feature ([#85](https://github.com/vuquan2005/svHaUI-Helper/issues/85)) ([8eb6c16](https://github.com/vuquan2005/svHaUI-Helper/commit/8eb6c160c58d710309405644acaf11df068ba37e))
* **home:** add more shortcuts and compact dashboard action grid ([#86](https://github.com/vuquan2005/svHaUI-Helper/issues/86)) ([c86084d](https://github.com/vuquan2005/svHaUI-Helper/commit/c86084d0840d4a9bd28a993a7c98be7dfb8d067c))
* improve ics file content ([#18](https://github.com/vuquan2005/svHaUI-Helper/issues/18)) ([e9a711e](https://github.com/vuquan2005/svHaUI-Helper/commit/e9a711e945682341da284d8e45430d44dc1a6c61))
* logo flight trail ([#114](https://github.com/vuquan2005/svHaUI-Helper/issues/114)) ([03fb282](https://github.com/vuquan2005/svHaUI-Helper/commit/03fb282ae306a57879205e634cba74390342b6ff))
* migrate from userscript to browser extension with WXT ([#105](https://github.com/vuquan2005/svHaUI-Helper/issues/105)) ([4480689](https://github.com/vuquan2005/svHaUI-Helper/commit/4480689055b23c111dddf7d3ea48409c318e7229))
* **migration-notice:** display extension migration banner and deprecate userscript ([#106](https://github.com/vuquan2005/svHaUI-Helper/issues/106)) ([38a5665](https://github.com/vuquan2005/svHaUI-Helper/commit/38a5665ed6d619e1662f0d65a45fb284bf814406))
* **misc:** add remove snowfall feature ([5f5c2aa](https://github.com/vuquan2005/svHaUI-Helper/commit/5f5c2aae9f70fbf0638f1452f8869df4aad95a16))
* **quick-nav:** add descriptions to navigation links and improve styling ([0617063](https://github.com/vuquan2005/svHaUI-Helper/commit/0617063c9200df1ce2ec7124b281d7700f777844))
* setup project structure with modular feature architecture ([e769060](https://github.com/vuquan2005/svHaUI-Helper/commit/e7690602e3c78d11e1198664f77d89cde84dc27a))
* **utils:** add browser location wrapper ([a61cd5c](https://github.com/vuquan2005/svHaUI-Helper/commit/a61cd5c06d538655f6241dd0b5549f51466d7d8b))


### Bug Fixes

* **calendar-export:** use css module for flex layout to prevent verti… ([#26](https://github.com/vuquan2005/svHaUI-Helper/issues/26)) ([8fdad7d](https://github.com/vuquan2005/svHaUI-Helper/commit/8fdad7db8ac6e6b83ce1a974f9f2b90a5ae96cbe))
* **captcha:** prevent auto-submitting hidden captcha elements ([#83](https://github.com/vuquan2005/svHaUI-Helper/issues/83)) ([e183702](https://github.com/vuquan2005/svHaUI-Helper/commit/e1837027e842dfddb0eeb3b45716dc38e6d2c0f3))
* **exam-helper:** fix 1-day offset in countdown badges using calendar ([#103](https://github.com/vuquan2005/svHaUI-Helper/issues/103)) ([476f4b7](https://github.com/vuquan2005/svHaUI-Helper/commit/476f4b71856a48d43c03ec79907b8abefdcbc9c8))
* **exam-helper:** prevent injecting home widget on login page ([#92](https://github.com/vuquan2005/svHaUI-Helper/issues/92)) ([1b29b0c](https://github.com/vuquan2005/svHaUI-Helper/commit/1b29b0cc0a9e5e5aba736464cdda4552d14ae187))
* **export-timetable:** not downloaded button behavior ([#33](https://github.com/vuquan2005/svHaUI-Helper/issues/33)) ([a787db2](https://github.com/vuquan2005/svHaUI-Helper/commit/a787db20fe6ca9fc3a7ede231136c819fbc8db9c))
* **firefox:** declare data_collection_permissions in gecko manifest ([#109](https://github.com/vuquan2005/svHaUI-Helper/issues/109)) ([901acb3](https://github.com/vuquan2005/svHaUI-Helper/commit/901acb33359d3cd461ffbe00c9edc3e61fd3dea1))
* fix WASM out of memory by using single-threaded ONNX Runtime ([#74](https://github.com/vuquan2005/svHaUI-Helper/issues/74)) ([a98ff85](https://github.com/vuquan2005/svHaUI-Helper/commit/a98ff852d7aaad2a3fa1eaea5d7fdf93e43e3f2f))
* **grade-nav:** remove unnecessary z-index to fix UI issues ([d5faf06](https://github.com/vuquan2005/svHaUI-Helper/commit/d5faf067fb5429354348635d9561231bdc55cea9))
* **timetable:** resolve online class schedule data parsing issue ([#41](https://github.com/vuquan2005/svHaUI-Helper/issues/41)) ([bba40f4](https://github.com/vuquan2005/svHaUI-Helper/commit/bba40f43a984595d57f94e4463e03e3c52a902c0))
* use official GPL-3.0 license text from GNU ([2c663ad](https://github.com/vuquan2005/svHaUI-Helper/commit/2c663ad69c9108315541f4cb4a9a8babe79defb7))


### Performance Improvements

* **captcha:** cache ONNX model and WASM binaries ([#81](https://github.com/vuquan2005/svHaUI-Helper/issues/81)) ([b6eebb1](https://github.com/vuquan2005/svHaUI-Helper/commit/b6eebb1882c3ea98a76117f0b85f9e854d132e53))
* **captcha:** optimize inpainting with inpaintFast and fix vite dev environment ([#91](https://github.com/vuquan2005/svHaUI-Helper/issues/91)) ([59ff699](https://github.com/vuquan2005/svHaUI-Helper/commit/59ff699ab40e9ed38517bc752fbece26a49c5300))

## [3.1.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v3.0.1...v3.1.0) (2026-09-13)


### Features

* **brand:** redesign extension logo with 3D origami concept ([#112](https://github.com/vuquan2005/svHaUI-Helper/issues/112)) ([1d0b4d6](https://github.com/vuquan2005/svHaUI-Helper/commit/1d0b4d6ecaeed938f16c6d57b83378afaecb5e08))
* logo flight trail ([#114](https://github.com/vuquan2005/svHaUI-Helper/issues/114)) ([03fb282](https://github.com/vuquan2005/svHaUI-Helper/commit/03fb282ae306a57879205e634cba74390342b6ff))

## [3.0.1](https://github.com/vuquan2005/svHaUI-Helper/compare/v3.0.0...v3.0.1) (2026-09-13)


### Bug Fixes

* **firefox:** declare data_collection_permissions in gecko manifest ([#109](https://github.com/vuquan2005/svHaUI-Helper/issues/109)) ([901acb3](https://github.com/vuquan2005/svHaUI-Helper/commit/901acb33359d3cd461ffbe00c9edc3e61fd3dea1))

## [3.0.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.14.0...v3.0.0) (2026-09-13)


### ⚠ BREAKING CHANGES

* migrate from userscript to browser extension with WXT ([#105](https://github.com/vuquan2005/svHaUI-Helper/issues/105))

### Features

* migrate from userscript to browser extension with WXT ([#105](https://github.com/vuquan2005/svHaUI-Helper/issues/105)) ([4480689](https://github.com/vuquan2005/svHaUI-Helper/commit/4480689055b23c111dddf7d3ea48409c318e7229))

## [2.14.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.13.1...v2.14.0) (2026-09-13)


### Features

* **migration-notice:** display extension migration banner and deprecate userscript ([#106](https://github.com/vuquan2005/svHaUI-Helper/issues/106)) ([38a5665](https://github.com/vuquan2005/svHaUI-Helper/commit/38a5665ed6d619e1662f0d65a45fb284bf814406))

## [2.13.1](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.13.0...v2.13.1) (2026-09-08)


### Bug Fixes

* **exam-helper:** fix 1-day offset in countdown badges using calendar ([#103](https://github.com/vuquan2005/svHaUI-Helper/issues/103)) ([476f4b7](https://github.com/vuquan2005/svHaUI-Helper/commit/476f4b71856a48d43c03ec79907b8abefdcbc9c8))

## [2.13.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.12.0...v2.13.0) (2026-09-03)


### Features

* **grade-prediction:** highlight retaken courses and improve input ([#99](https://github.com/vuquan2005/svHaUI-Helper/issues/99)) ([6679f48](https://github.com/vuquan2005/svHaUI-Helper/commit/6679f48a3907543c5e5abaacce1e11144d896275))

## [2.12.0](https://github.com/vuquan2005/svHaUI-Helper/compare/v2.11.0...v2.12.0) (2026-08-25)


### Features

* **grade-prediction:** add simple rule syntax  for non-credit ([#96](https://github.com/vuquan2005/svHaUI-Helper/issues/96)) ([b0b42a3](https://github.com/vuquan2005/svHaUI-Helper/commit/b0b42a3f2421b2a939882dc940c1c21ab0055d74))

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
