# McTabimWeb 小麥他命輸入法 Web/Chrome OS/PIME 版本

![Static Badge](https://img.shields.io/badge/platform-web-green)
![ChromeOS](https://img.shields.io/badge/platform-chome_os-yellow) ![Static Badge](https://img.shields.io/badge/platform-windows-blue) [![CI](https://github.com/openvanilla/McTabimWeb/actions/workflows/ci.yml/badge.svg)](https://github.com/openvanilla/McTabimWeb/actions/workflows/ci.yml) [![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/openvanilla/McTabimWeb) [![codecov](https://codecov.io/github/openvanilla/McTabimWeb/graph/badge.svg?token=AYMEtERjWM)](https://codecov.io/github/openvanilla/McTabimWeb)

小麥他命輸入法（MacTabimWeb）是一套基於網頁技術打造的表格類中文輸入法，支援倉頡、速成、大易、行列等表格類輸入法。可以嵌入到網頁中，也可以在 Chrome OS、Windows 上的 PIME 輸入法框架中執行。

![banner](resource/preview.png)

<!-- TOC -->

- [McTabimWeb 小麥他命輸入法 Web/Chrome OS/PIME 版本](#mctabimweb-小麥他命輸入法-webchrome-ospime-版本)
  - [支援平台](#支援平台)
  - [輸入功能](#輸入功能)
  - [編譯方式](#編譯方式)
    - [Web 版](#web-版)
    - [Chrome OS 版](#chrome-os-版)
    - [Windows (PIME)](#windows-pime)
  - [開發](#開發)
  - [社群公約](#社群公約)
  - [常見問題](#常見問題)
    - [Q: 我可以新增輸入法表格嗎？](#q-我可以新增輸入法表格嗎)
    - [Q: McTabimWeb 跟「小麥他命」這個名字是怎麼來的？](#q-mctabimweb-跟小麥他命這個名字是怎麼來的)

<!-- /TOC -->

## 支援平台

- Web 平台
- Chrome OS
- Windows (透過 [PIME 輸入法框架](https://github.com/EasyIME/))

## 輸入功能

目前內建以下輸入法表格：

- 倉頡
- 速成
- 大易三碼
- 大易四碼
- 行列 30 （包括行列詞彙表、簡碼與特別碼）
- 行列 40

小麥他命在開發的過程中，大量參考了 PIME 平台的 cin based 當中的功能，一定程度上，可以說是使用網頁技術移植 PIME 的功能。包括以下功能：

- 支援使用 Shift + 字母或標點符號，輸入全形符號
- 使用 `M 按鍵顯示額外功能選單
- 在功能選單中，可以切換簡繁輸入
- 在功能選單中，快速切換設定
- 在功能選單中，快速輸入額外的特殊符號，以及 emoji
- 支援字根反查與查詢結果提示
- 支援螢幕虛擬鍵盤（範例網頁版）
- 提供輸入法表格幫助說明頁面（Chrome OS 與 PIME 版）

還有來自小麥注音輸入法的功能

- 中文數字輸入：打 123 出現 一百二十三
- 日期功能：可以從 `M 選單中，選擇現在的日期與時間

由於與 PIME 平台功能重複，在 PIME 上使用比較沒有意義。這套輸入法主要是讓網頁與 Chrome OS 上，有相對功能更豐富的倉頡、速成…等輸入法。

## 編譯方式

這套輸入法使用 Type Script 語言開發，所以在 Windows、macOS、Linux 平台上都可以編譯。請先安裝 [Node.js](https://nodejs.org/) 以及 [Git](https://git-scm.com/)，然後在終端機中執行編譯命令。

大部分的 Node.js 版本應該都可以成功編譯這個專案，您也可以查看我們在 CI/CD 中使用的 Node.js 版本。

### Web 版

您可以在 [這裡](https://openvanilla.github.io/McTabimWeb/)，體驗小麥他命的輸入功能。建議使用電腦而非手機打開這個網頁。

請輸入：

```bash
npm install
npm run build
```

用瀏覽器打開 output/example/index.html 就可以使用了。

您也可以透過參考 output/example/index.html 裡頭的方式，將小麥他命輸入法，嵌入到您的網頁中。

### Chrome OS 版

您可以從 [Chrome Web Store](https://chromewebstore.google.com/detail/mctabim/fkmgjlpcofgddlpbjggglpnfgfeaibhg) 下載安裝。

如果要要自行編譯，請在終端機中執行：

```bash
npm install
npm run build:chromeos
```

然後在 Chrome OS 上開啟「chrome://extensions/」，並啟用「開發人員模式」，接著按下「載入已解壓縮的擴充功能」，選擇 `output/chromeos` 目錄，就可以安裝輸入法。您可以選擇將 `output/chromeos` 傳到你的 Chrome OS 裝置上，或是直接在 Chrome OS 上使用 Linux 子系統（Crostini）編譯。

### Windows (PIME)

首先您要在您的 Windows 系統上安裝 PIME，請前往 PIME 的專案頁面下載。請注意，在安裝的過程中，**務必要勾選 Node.js 支援**，否則無法使用這個輸入法— PIME 預設是不安裝 Node.js 支援。另外，如果您用的不是中文版的 Windows，也需要先在 Windows 的語言設定中，加入繁體中文語系，小麥他命輸入法必須在安裝了繁體中文語系才會出現。

請在 Windows 的命令提示字元（Command Prompt）或 PowerShell 中執行：

```bash
npm install
npm run build:pime
```

然後將 `output/pime` 目錄下的所有檔案複製到 PIME 安裝目錄下的 `node\input_methods\mctabim` 目錄中（通常是 `C:\Program Files (x86)\PIME\node\input_methods\mctabim`），您會需要用到系統管理員權限。第一次使用時，請在這個目錄中，執行一次 `run_register_ime.bat`，將小麥他命輸入法註冊到 Windows 系統中。接著重新啟動 PIME 啟動器（PIME Launcher），就可以在輸入法清單中選擇小麥他命輸入法了。

如果 `run_register_ime.bat` 這一步不成功，通常是因為並沒有使用系統管理員權限。另外，就是可能用了沒有 code sign 的 DLL，請確定是否安裝了官方有簽名的 PIME 版本。

如果在系統清單中，沒有看到小麥他命輸入法，請進入 Windows 的系統設定中，確認「語言」設定中已經加入了小麥他命輸入法。

## 開發

由於專案使用 TypeScript 等網頁技術開發，因此除了必須安裝 Node.js 之外，其餘可以使用各種順手的網頁開發工具，像是 Visual Studio Code 等等。

## 社群公約

我們採用了 GitHub 的[通用社群公約](CODE_OF_CONDUCT.md)。公約的中文版請參考[這裡的翻譯](https://www.contributor-covenant.org/zh-tw/version/1/4/code-of-conduct/)。

## 常見問題

### Q: 我可以新增輸入法表格嗎？

A: 目前的設計中，沒有讓使用者自行手動加入輸入表格的設計，而是一開始挑遠了一些表格之後，一起用 webpack 打包，方便在讓被嵌入的網頁載入。不過，如果您自己能夠開發網頁，熟悉 npm 套件的使用方式，是可以自行修改程式碼，加入您想要的輸入法表格，然後重新編譯。

小麥他命使用的不是 .cin 格式，而是來自於 PIME 的 JSON 格式。如果要加入新的表格，請將符合規格的 JSON 檔案，放到 `src/data/cin` 目錄下（雖然目錄叫做 cin，但其實是 JSON 格式）。接下來修改 `src/data/InputTableManager.ts` ，請注意以下這段：

```typescript
  private readonly tables_: Array<InputTableWrapper> = [
    new GeneralInputTableWrapper('checj', checj, { maxRadicals: 5 }),
    new GeneralInputTableWrapper('cj5', cj5, { maxRadicals: 5 }),
    new GeneralInputTableWrapper('simplex', simplex, { maxRadicals: 2 }),
    .....
  ]
```

`InputTableWrapper` 現在是一個介面，常見的實作有：

- `GeneralInputTableWrapper`：一般表格輸入法
- `BopomofoInputTableWrapper`：標準注音表格
- `WslInputTableWrapper`：吳守禮音標表格

新增一般表格時，通常只需要建立 `GeneralInputTableWrapper`。如果是注音或吳守禮類型的表格，則使用對應 subclass，讓音節解析由多型處理，而不是靠額外的 type 欄位判斷。

這些 wrapper 的主要建構參數有：

- 這個輸入法表格的代號
- 對應的 JSON 檔案，像是 checj，其實是透過 `import checj from './cin/checj.json?raw';` 引入的
- 一些額外的設定，目前只有 `maxRadicals`，代表這個輸入法的最大字根長度
- （選擇性）可以傳入一個陣列，包含其他的 JSON 字串，這些字串會被當成額外的表格內容，與主表格合併（例如可以將詞庫、特別碼等表格合併到主表格中）

### Q: McTabimWeb 跟「小麥他命」這個名字是怎麼來的？

A: Mc 代表的是香草/小麥社群的作品，Tabim 則是 Table 與 IM (Input Method Editor) 的合成詞。小麥他命輸入法，代表的是香草/小麥社群單獨的表格輸入法引擎。至於「小麥他命」則是 Tabim 的諧音。
