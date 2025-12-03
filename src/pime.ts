/**
 * @license
 * Copyright (c) 2025 and onwards The McTabIM Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import child_process from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

import { InputTableManager } from './data';
import { InputController } from './input_method';
import { EmptyState } from './input_method/InputState';
import { InputUI } from './input_method/InputUI';
import { KeyFromKeyboardEvent, VK_Keys } from './pime_keys';

interface Settings {
  candidateFontSize: number;
  selectedInputMethodId: string;
  shiftKeyToToggleAlphabetMode: boolean;
  useNotification: boolean;
  inputSettings: {
    chineseConversionEnabled: boolean;
    associatedPhrasesEnabled: boolean;
    shiftPunctuationForSymbolsEnabled: boolean;
    shiftLetterForSymbolsEnabled: boolean;
    wildcardMatchingEnabled: boolean;
    clearOnErrors: boolean;
    beepOnErrors: boolean;
    reverseRadicalLookupEnabled: boolean;
    homophoneLookupEnabled: boolean;
  };
}

/**
 * A middle data structure between McTabim input controller and PIME.
 * @interface
 */
interface UiState {
  /** The string to be committed. */
  commitString: string;
  /** The composition string. */
  compositionString: string;
  /** The cursor position in the composition string. */
  compositionCursor: number;
  /** Whether to show the candidate window. */
  showCandidates: boolean;
  /** The list of candidates. */
  candidateList: string[];
  /** The cursor position in the candidate list. */
  candidateCursor: number;
  /** The message to be shown. */
  showMessage: any;
  /** Whether to hide the message. */
  hideMessage: boolean;
}

/**  The default settings. */
const defaultSettings: Settings = {
  candidateFontSize: 16,
  selectedInputMethodId: 'checj',
  shiftKeyToToggleAlphabetMode: true,
  useNotification: false,
  inputSettings: {
    chineseConversionEnabled: false,
    associatedPhrasesEnabled: false,
    shiftPunctuationForSymbolsEnabled: true,
    shiftLetterForSymbolsEnabled: true,
    wildcardMatchingEnabled: false,
    clearOnErrors: false,
    beepOnErrors: true,
    reverseRadicalLookupEnabled: false,
    homophoneLookupEnabled: true,
  },
};

/**
 * The commands for PIME McTabim.
 * @enum
 */
enum PimeMcTabimCommand {
  Separator = 0,
  ModeIcon = 1,
  SwitchLanguage = 2,
  OpenHomepage = 3,
  OpenBugReport = 4,
  OpenOptions = 5,
  Help = 5,
  InputTable = 10000,
}

/** Wraps InputController and required states.  */
class PimeMcTabim {
  /** The input controller. */
  readonly inputController: InputController;
  /** The UI state. */
  uiState: UiState = {
    commitString: '',
    compositionString: '',
    compositionCursor: 0,
    showCandidates: false,
    candidateList: [],
    candidateCursor: 0,
    showMessage: {},
    hideMessage: true,
  };
  settings: Settings = defaultSettings;
  constructor() {
    this.inputController = new InputController(this.makeUI(this));
    this.inputController.onError = () => {};
    this.inputController.onSettingChanged = (newSettings) => {
      this.settings.inputSettings = newSettings;
      this.writeSettings();
    };
    this.loadSettings(() => {});
  }

  /** Resets the UI state before handling a key. */
  public resetBeforeHandlingKey(): void {
    const copy = this.uiState;
    this.uiState = {
      commitString: '',
      compositionString: copy.compositionString,
      compositionCursor: copy.compositionCursor,
      showCandidates: copy.showCandidates,
      candidateList: copy.candidateList,
      candidateCursor: copy.candidateCursor,
      showMessage: copy.showMessage,
      hideMessage: copy.hideMessage,
    };
  }

  /** Resets the input controller. */
  public resetController(reason: string): void {
    this.inputController.reset(reason);
  }

  public toggleAlphabetMode(): void {
    // Changes the alphabet mode, also commits current composing buffer.
    this.isAlphabetMode = !this.isAlphabetMode;
    this.resetController('toggle alphabet mode');
  }

  /** Applies the settings to the input controller. */
  public applySettings(): void {
    const selectedTableIndex = this.settings.selectedInputMethodId;
    InputTableManager.getInstance().setInputTableById(selectedTableIndex);
    const inputSettings = this.settings.inputSettings;
    if (inputSettings !== undefined) {
      this.inputController.settings = inputSettings;
    }
  }

  readonly pimeUserDataPath: string = path.join(process.env.APPDATA || '', 'PIME');
  readonly mctabimUserDataPath: string = path.join(this.pimeUserDataPath, 'mctabim');
  readonly userSettingsPath: string = path.join(this.mctabimUserDataPath, 'config.json');
  readonly symbolTablePath: string = path.join(this.mctabimUserDataPath, 'symbols.txt');
  readonly foreignLanguagesSymbolsTablePath: string = path.join(
    this.mctabimUserDataPath,
    'foreign_languages_symbols.txt',
  );

  isAlphabetMode: boolean = false;
  isOpened: boolean = true;
  lastRequest: any = {};
  isLastFilterKeyDownHandled: boolean = false;
  isCapsLockHold: boolean = false;
  isShiftHold: boolean = false;
  isScheduledToUpdateUi = false;
  /** Whether the button has been added to the UI. */
  alreadyAddButton: boolean = false;
  /** Whether the OS is Windows 8 or above. */
  isWindows8Above: boolean = false;

  /**
   * Load settings from disk.
   * @param callback The callback function.
   */
  public loadSettings(callback: () => void): void {
    fs.readFile(this.userSettingsPath, (err, data) => {
      if (err) {
        console.log('Unable to read user settings from ' + this.userSettingsPath);
        this.writeSettings();
        return;
      }
      try {
        const newSettings = JSON.parse(data.toString());
        this.settings = Object.assign({}, defaultSettings, newSettings);
        this.applySettings();
      } catch {
        console.error('Failed to parse settings');
        this.writeSettings();
      }
    });
  }

  /** Write settings to disk */
  public writeSettings() {
    if (!fs.existsSync(this.mctabimUserDataPath)) {
      console.log('User data folder not found, creating ' + this.mctabimUserDataPath);
      console.log('Creating one');
      fs.mkdirSync(this.mctabimUserDataPath);
    }

    console.log('Writing user settings to ' + this.userSettingsPath);
    const string = JSON.stringify(this.settings, null, 2);
    fs.writeFile(this.userSettingsPath, string, (err) => {
      if (err) {
        console.error('Failed to write settings');
        console.error(err);
      }
    });
  }

  public loadSymbolsTable(): void {
    fs.readFile(this.symbolTablePath, (err, data) => {
      if (err) {
        console.log('Unable to read user settings from ' + this.symbolTablePath);
        this.createDefaultSymbolTable();
        return;
      }
      console.log(data);
      try {
        const text = data.toString();
        InputTableManager.getInstance().customSymbolTable.sourceData = text;
      } catch {}
    });
  }

  public createDefaultSymbolTable() {
    if (!fs.existsSync(this.mctabimUserDataPath)) {
      console.log('User data folder not found, creating ' + this.mctabimUserDataPath);
      console.log('Creating one');
      fs.mkdirSync(this.mctabimUserDataPath);
    }

    const defaultSymbolTable = InputTableManager.getInstance().customSymbolTable.sourceData;

    fs.writeFile(this.symbolTablePath, defaultSymbolTable, (err) => {
      if (err) {
        console.error('Failed to write settings');
        console.error(err);
      }
    });
  }

  /**
   * Creates an InputUI object.
   * @param instance The PimeMcTabim instance.
   * @returns The InputUI object.
   */
  public makeUI(instance: PimeMcTabim): InputUI {
    const that: InputUI = {
      reset: () => {
        const commitString = instance.uiState.commitString;
        instance.uiState = {
          commitString: commitString,
          compositionString: '',
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
          showMessage: {},
          hideMessage: true,
        };
      },
      commitString(text: string) {
        console.log('commitString: ' + text);
        instance.uiState = {
          commitString: text,
          compositionString: '',
          compositionCursor: 0,
          showCandidates: false,
          candidateList: [],
          candidateCursor: 0,
          showMessage: {},
          hideMessage: true,
        };
      },
      update(stateString: string) {
        // console.log('update stateString: ' + stateString);

        const state = JSON.parse(stateString);
        const composingBuffer = state.composingBuffer;
        const candidates = state.candidates;
        let selectedIndex = 0;
        let index = 0;
        const candidateList = [];
        for (const candidate of state.candidates) {
          if (candidate.selected) {
            selectedIndex = index;
          }
          const joined = candidate.candidate.displayText;
          candidateList.push(joined);
          index++;
        }

        // Note: McTabim's composing buffer are composed by segments so
        // it allows an input method framework to draw underlines
        let compositionString = '';
        for (const item of composingBuffer) {
          compositionString += item.text;
        }

        const tooltip = state.tooltip;
        let showMessage = {};
        let hideMessage = true;
        if (tooltip && tooltip.length > 0) {
          showMessage = { message: tooltip, duration: 3 };
          hideMessage = false;
        }
        const commitString = instance.uiState.commitString;
        instance.uiState = {
          commitString: commitString,
          compositionString: compositionString,
          compositionCursor: state.cursorIndex,
          showCandidates: candidates.length > 0,
          candidateList: candidateList,
          candidateCursor: selectedIndex,
          showMessage: showMessage,
          hideMessage: hideMessage,
        };
      },
    };
    return that;
  }

  /**
   * Creates the button UI response.
   * @returns The button UI response.
   */
  public buttonUiResponse(): any {
    let windowsModeIcon = 'close.ico';
    if (this.isOpened) {
      if (this.isAlphabetMode) {
        windowsModeIcon = 'eng.ico';
      } else {
        if (this.settings.inputSettings.chineseConversionEnabled) {
          windowsModeIcon = 'simC.ico';
        } else {
          windowsModeIcon = 'traC.ico';
        }
      }
    }
    const windowsModeIconPath = path.join(__dirname, 'icons', windowsModeIcon);
    const settingsIconPath = path.join(__dirname, 'icons', 'config.ico');
    const object: any = {};
    const changeButton: any[] = [];
    if (this.isWindows8Above) {
      changeButton.push({ icon: windowsModeIconPath, id: 'windows-mode-icon' });
    }
    changeButton.push({ icon: windowsModeIconPath, id: 'switch-lang' });
    object.changeButton = changeButton;

    if (!this.alreadyAddButton) {
      const addButton: any[] = [];
      if (this.isWindows8Above) {
        addButton.push({
          id: 'windows-mode-icon',
          icon: windowsModeIconPath,
          commandId: PimeMcTabimCommand.ModeIcon,
          tooltip: '輸入模式切換',
        });
      }

      addButton.push({
        id: 'switch-lang',
        icon: windowsModeIconPath,
        commandId: PimeMcTabimCommand.SwitchLanguage,
        tooltip: '輸入模式切換',
      });
      addButton.push({
        id: 'settings',
        icon: settingsIconPath,
        type: 'menu',
        tooltip: '設定',
      });
      object.addButton = addButton;
      this.alreadyAddButton = true;
    }
    return object;
  }

  /**
   * Creates the custom UI response.
   * @returns The custom UI response.
   */
  public customUiResponse(): any {
    let fontSize = this.settings.candidateFontSize;
    if (fontSize === undefined) {
      fontSize = 16;
    } else if (fontSize < 10) {
      fontSize = 10;
    } else if (fontSize > 32) {
      fontSize = 32;
    }

    return {
      openKeyboard: this.isOpened,
      customizeUI: {
        candPerRow: 1,
        candFontSize: fontSize,
        candFontName: 'Microsoft YaHei',
        candUseCursor: true,
      },
      setSelKeys: '123456789',
      keyboardOpen: this.isOpened,
    };
  }

  /**
   * Handles a command.
   * @param id The command ID.
   */
  public handleCommand(id: PimeMcTabimCommand): void {
    if (id > PimeMcTabimCommand.InputTable) {
      const inputMethodIndex = id - PimeMcTabimCommand.InputTable;
      const tables = InputTableManager.getInstance().getTables();
      const tableId = tables[inputMethodIndex][0]; // 0 - id, 1 - name
      InputTableManager.getInstance().setInputTableById(tableId);
      this.settings.selectedInputMethodId = tableId;
      this.writeSettings();
      return;
    }

    switch (id) {
      case PimeMcTabimCommand.ModeIcon:
      case PimeMcTabimCommand.SwitchLanguage:
        {
          if (this.isOpened === false) {
            return;
          }
          this.toggleAlphabetMode();
        }
        break;
      case PimeMcTabimCommand.OpenHomepage:
        {
          const url = 'https://openvanilla.org/';
          const command = `start ${url}`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;
      case PimeMcTabimCommand.OpenBugReport:
        {
          const url = 'https://github.com/openvanilla/McTabimWeb/issues';
          const command = `start ${url}`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;
      case PimeMcTabimCommand.OpenOptions:
        {
          const python3 = path.join(__dirname, '..', '..', '..', 'python', 'python3', 'python.exe');
          const script = path.join(__dirname, 'config_tool.py');
          const command = `"${python3}" "${script}"`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;

      case PimeMcTabimCommand.Help:
        {
          const python3 = path.join(__dirname, '..', '..', '..', 'python', 'python3', 'python.exe');
          const script = path.join(__dirname, 'config_tool.py');
          const command = `"${python3}" "${script}" help`;
          console.log('Run ' + command);
          child_process.exec(command);
        }
        break;
      default:
        break;
    }
  }
}

const pimeMcTabim = new PimeMcTabim();

try {
  if (!fs.existsSync(pimeMcTabim.userSettingsPath)) {
    fs.writeFileSync(pimeMcTabim.userSettingsPath, JSON.stringify(defaultSettings));
  }

  fs.watch(pimeMcTabim.userSettingsPath, (event, filename) => {
    if (filename) {
      pimeMcTabim.loadSettings(() => {});
    }
  });
} catch (e) {
  console.error(e);
}

module.exports = {
  textReducer(_: any, preState: any) {
    // Note: textReducer and response are the pattern of NIME. Actually, PIME
    // only care about the response. Since we let pimeMcTabim to do
    // everything, we just left textReducer as an empty implementation to let
    // NIME to call it.
    return preState;
  },

  response(request: any, _: any) {
    const lastRequest = pimeMcTabim.lastRequest;
    pimeMcTabim.lastRequest = request;
    const responseTemplate = {
      return: false,
      success: true,
      seqNum: request.seqNum,
    };
    if (request.method === 'init') {
      const { isWindows8Above } = request;
      pimeMcTabim.isWindows8Above = isWindows8Above;
      const customUi = pimeMcTabim.customUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, {
        removeButton: ['windows-mode-icon', 'switch-lang', 'settings'],
      });
      return response;
    }
    if (request.method === 'close') {
      const response = Object.assign({}, responseTemplate, {
        removeButton: ['windows-mode-icon', 'switch-lang', 'settings'],
      });
      pimeMcTabim.alreadyAddButton = false;
      return response;
    }

    if (request.method === 'onActivate') {
      pimeMcTabim.resetController('onActivate');
      const customUi = pimeMcTabim.customUiResponse();
      const buttonUi = pimeMcTabim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    if (request.method === 'onDeactivate') {
      pimeMcTabim.resetController('onDeactivate');
      const response = Object.assign({}, responseTemplate, {
        removeButton: ['windows-mode-icon', 'switch-lang', 'settings'],
      });
      pimeMcTabim.alreadyAddButton = false;
      return response;
    }

    if (request.method === 'onPreservedKey') {
      console.log(request);
      const response = Object.assign({}, responseTemplate);
      return response;
    }

    if (request.method === 'filterKeyUp') {
      if (
        lastRequest &&
        lastRequest.method === 'filterKeyUp' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key up event.
        // We should ignore such events.
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      }

      const isEmpty = pimeMcTabim.inputController.state instanceof EmptyState;
      let rtn = false;
      // Single Shift to toggle alphabet mode.
      if (isEmpty && pimeMcTabim.isShiftHold) {
        pimeMcTabim.isScheduledToUpdateUi = true;
        pimeMcTabim.toggleAlphabetMode();
        rtn = true;
      }
      const response = Object.assign({}, responseTemplate, { return: rtn });
      return response;
    }

    // In most cases, we just return false in key up event. However, we still
    // need it to detect the single shift press to toggle alphabet mode.
    if (request.method === 'onKeyUp') {
      if (pimeMcTabim.isScheduledToUpdateUi) {
        pimeMcTabim.isScheduledToUpdateUi = false;
        const uiState = pimeMcTabim.uiState;
        const customUi = pimeMcTabim.customUiResponse();
        const buttonUi = pimeMcTabim.buttonUiResponse();
        const response = Object.assign(responseTemplate, uiState, customUi, buttonUi, {
          return: true,
        });
        return response;
      } else {
        const response = Object.assign({}, responseTemplate, { return: false });
        return response;
      }
    }

    if (request.method === 'filterKeyDown') {
      if (
        lastRequest &&
        lastRequest.method === 'filterKeyDown' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key down event.
        // We should ignore such events.
        const response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }

      const { keyCode, charCode, keyStates } = request;

      if ((keyStates[VK_Keys.VK_CAPITAL] & 1) !== 0) {
        // Ignores caps lock.
        pimeMcTabim.resetBeforeHandlingKey();
        pimeMcTabim.resetController('caps lock pressed');
        pimeMcTabim.isCapsLockHold = true;
        pimeMcTabim.isLastFilterKeyDownHandled = false;
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      } else {
        pimeMcTabim.isCapsLockHold = false;
      }

      const key = KeyFromKeyboardEvent(keyCode, keyStates, String.fromCharCode(charCode), charCode);
      // console.log('filterKeyDown key: ' + ey.ascii);

      const shouldHandleShift = pimeMcTabim.settings.shiftKeyToToggleAlphabetMode === true;

      const isPressingShiftOnly = key.ascii === 'Shift';

      // Note: The way we detect if a user is trying to press a single Shift key
      // to toggle Alphabet/Chinese mode, is to check if there is any key other
      // than the Shift key is received before the key up event.
      //
      // We set isShiftHold to true here. It means the user is pressing Shift
      // key only. Then, if there is any other key coming, we will reset
      // isShiftHold. Finally, if isShiftHold is still true in the key up event,
      // we will toggle Alphabet/Chinese.
      const state = pimeMcTabim.inputController.state;
      if (shouldHandleShift && isPressingShiftOnly && state instanceof EmptyState) {
        pimeMcTabim.isShiftHold = true;
        pimeMcTabim.isLastFilterKeyDownHandled = true;
        const response = Object.assign({}, responseTemplate, {
          return: true,
        });
        console.log('filterKeyDown response with shift: ' + response);
        console.log(response);
        return response;
      } else {
        pimeMcTabim.isShiftHold = false;
      }

      pimeMcTabim.resetBeforeHandlingKey();

      if ((keyStates[VK_Keys.VK_CAPITAL] & 1) !== 0) {
        // Ignores caps lock.
        pimeMcTabim.resetController('caps lock pressed');
        pimeMcTabim.isCapsLockHold = true;
        pimeMcTabim.isLastFilterKeyDownHandled = false;
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      } else {
        pimeMcTabim.isCapsLockHold = false;
      }

      if (key.ctrlPressed) {
        pimeMcTabim.resetController('control key pressed');
        pimeMcTabim.isLastFilterKeyDownHandled = false;
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      }

      if (pimeMcTabim.isAlphabetMode) {
        const response = Object.assign({}, responseTemplate, { return: false });
        return response;
      }

      const handled = pimeMcTabim.inputController.handle(key);
      pimeMcTabim.isLastFilterKeyDownHandled = handled;
      const response = Object.assign({}, responseTemplate, {
        return: handled,
      });
      console.log('filterKeyDown response: ' + response);
      return response;
    }

    if (request.method === 'onKeyDown') {
      // Ignore caps lock.
      if (pimeMcTabim.isCapsLockHold) {
        pimeMcTabim.resetController('caps lock pressed');
        const response = Object.assign({}, responseTemplate, {
          return: false,
        });
        return response;
      }

      if (
        lastRequest &&
        lastRequest.method === 'onKeyDown' &&
        lastRequest.keyCode === request.keyCode
      ) {
        // NOTE: Some app, like MS Word, may send repeated key up event.
        // We should ignore such events.
        const response = Object.assign({}, responseTemplate, {
          return: true,
        });
        return response;
      }
      const uiState: any = pimeMcTabim.uiState;
      let response = Object.assign({}, responseTemplate, uiState, {
        return: pimeMcTabim.isLastFilterKeyDownHandled,
      });
      if (pimeMcTabim.isScheduledToUpdateUi) {
        pimeMcTabim.isScheduledToUpdateUi = false;
        const customUi = pimeMcTabim.customUiResponse();
        const buttonUi = pimeMcTabim.buttonUiResponse();
        response = Object.assign({}, response, customUi, buttonUi);
      }
      return response;
    }

    if (request.method === 'onKeyboardStatusChanged') {
      const { opened } = request;
      pimeMcTabim.isOpened = opened;
      pimeMcTabim.resetController('keyboard status changed');
      const customUi = pimeMcTabim.customUiResponse();
      const buttonUi = pimeMcTabim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, buttonUi);
      return response;
    }

    // Please note that the message maybe sent to use when we commit a string.
    // We ddo not reset our internal state, since it may effect the associate
    // phrases feature.
    if (request.method === 'onCompositionTerminated') {
      // pimeMcTabim.resetController('composition terminated');
      // pimeMcTabim.resetBeforeHandlingKey();
      const customUi = pimeMcTabim.customUiResponse();
      const buttonUi = pimeMcTabim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, customUi, buttonUi, {
        compositionString: '',
        compositionCursor: 0,
      });
      return response;
    }

    if (request.method === 'onCommand') {
      const { id } = request;
      pimeMcTabim.handleCommand(id);
      const uiState = pimeMcTabim.uiState;
      const customUi = pimeMcTabim.customUiResponse();
      const buttonUi = pimeMcTabim.buttonUiResponse();
      const response = Object.assign({}, responseTemplate, uiState, customUi, buttonUi);
      return response;
    }

    if (request.method === 'onMenu') {
      const menu: any[] = [
        {
          text: '小麥他命輸入法網站',
          id: PimeMcTabimCommand.OpenHomepage,
        },
        {
          text: '問題回報',
          id: PimeMcTabimCommand.OpenBugReport,
        },
        {
          text: '輔助說明',
          id: PimeMcTabimCommand.Help,
        },
      ];
      menu.push({});

      const tables = InputTableManager.getInstance().getTables();
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const tableId = table[0];
        const text = table[1];
        menu.push({
          text: text,
          checked: tableId === pimeMcTabim.settings.selectedInputMethodId,
          id: PimeMcTabimCommand.InputTable + i,
        });
      }
      menu.push({});
      menu.push({
        text: '偏好設定 (&O)',
        id: PimeMcTabimCommand.OpenOptions,
      });
      const response = Object.assign({}, responseTemplate, { return: menu });
      return response;
    }

    return responseTemplate;
  },
};
