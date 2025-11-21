/**
 * @license
 * Copyright (c) 2025 and onwards The McTabIM Authors.
 * This code is released under the MIT license.
 * SPDX-License-Identifier: MIT
 * The main entrance of the IME for ChromeOS.
 */

import { InputTableManager } from './data';
import { InputController } from './input_method';
import { Key, KeyName } from './input_method/Key';

/**
 * Represents the settings for the mctabim IME on ChromeOS.
 */
type ChromeMcTabimSettings = {
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
  };
};

/**
 * The main class for the mctabim IME on ChromeOS.
 */
class ChromeMcTabim {
  // The ID of the current input engine.
  engineID: string | undefined = undefined;

  // The current input context.
  context: chrome.input.ime.InputContext | undefined = undefined;

  beep = () => {};

  // The default settings.
  readonly defaultSettings: ChromeMcTabimSettings = {
    selectedInputMethodId: 'checj',
    shiftKeyToToggleAlphabetMode: true,
    useNotification: true,
    inputSettings: {
      chineseConversionEnabled: false,
      associatedPhrasesEnabled: false,
      shiftPunctuationForSymbolsEnabled: true,
      shiftLetterForSymbolsEnabled: true,
      wildcardMatchingEnabled: false,
      clearOnErrors: false,
      beepOnErrors: false,
      reverseRadicalLookupEnabled: false,
    },
  };
  settings: ChromeMcTabimSettings = {
    selectedInputMethodId: 'checj',
    shiftKeyToToggleAlphabetMode: true,
    useNotification: true,
    inputSettings: {
      chineseConversionEnabled: false,
      associatedPhrasesEnabled: false,
      shiftPunctuationForSymbolsEnabled: true,
      shiftLetterForSymbolsEnabled: true,
      wildcardMatchingEnabled: false,
      clearOnErrors: false,
      beepOnErrors: false,
      reverseRadicalLookupEnabled: false,
    },
  };
  inputController: InputController;
  isShiftHold = false;
  isAlphabetMode = false;
  constructor() {
    this.inputController = new InputController(this.makeUI());
    this.inputController.onError = () => {
      this.beep();
    };
    this.inputController.onSettingChanged = (settings) => {
      this.settings.inputSettings = settings;
      this.saveSettings();
    };
  }

  toggleAlphabetMode() {
    this.isAlphabetMode = !this.isAlphabetMode;

    if (this.settings.useNotification) {
      const notificationId = 'mctabim-alphabet-mode';
      chrome.notifications.clear(notificationId, () => {
        chrome.notifications.create(notificationId, {
          title: this.isAlphabetMode
            ? chrome.i18n.getMessage('alphabet_mode')
            : chrome.i18n.getMessage('chinese_mode'),
          message: '',
          type: 'basic',
          iconUrl: 'icons/icon48.png',
        });
      });
    }
  }

  /**
   * Loads the settings from chrome.storage.sync.
   */
  loadSettings() {
    chrome.storage.sync.get('settings', (value) => {
      this.settings = value.settings;
      if (this.settings === undefined) {
        this.settings = this.defaultSettings;
      }

      const selectedInputMethodId = this.settings.selectedInputMethodId;
      if (selectedInputMethodId !== undefined) {
        InputTableManager.getInstance().setInputTableById(selectedInputMethodId);
      }
      const inputSettings = this.settings.inputSettings;
      if (inputSettings !== undefined) {
        this.inputController.settings = inputSettings;
      }
    });
  }

  saveSettings() {
    chrome.storage.sync.set({ settings: this.settings });
  }

  /**
   * Updates the menu items.
   */
  updateMenu() {
    if (this.engineID === undefined) return;
    let menus: chrome.input.ime.MenuItem[] = [
      {
        id: 'mctabim-toggle-alphabet-mode',
        label: chrome.i18n.getMessage('menuAlphabetMode'),
        style: 'check' as const,
        checked: this.isAlphabetMode === true,
      },
      {
        id: 'mctabim-chinese-conversion',
        label: chrome.i18n.getMessage('menuChineseConversion'),
        style: 'check' as const,
        checked: this.settings.inputSettings.chineseConversionEnabled === true,
      },
      {
        id: 'mctabim-options',
        label: chrome.i18n.getMessage('menuOptions'),
        style: 'check' as const,
      },
      {
        id: 'mctabim-help',
        label: chrome.i18n.getMessage('menuHelp'),
        style: 'check' as const,
      },
      {
        id: 'mctabim-separator-1',
        style: 'separator' as const,
        enabled: false,
      },
    ];

    const selectedId = this.settings.selectedInputMethodId || 0;
    const inputTables = InputTableManager.getInstance().getTables();
    let selectedTableSet = false;

    const inputTableMenus: chrome.input.ime.MenuItem[] = [];

    for (let i = 0; i < inputTables.length; i++) {
      const table = inputTables[i];
      const checked = table[0] === selectedId;
      if (checked) {
        selectedTableSet = true;
      }
      const item = {
        id: `mctabim-select-table-${table[0]}`,
        label: table[1],
        style: 'radio' as const,
        checked: checked,
      };
      inputTableMenus.push(item);
    }

    if (!selectedTableSet) {
      let item = inputTableMenus[0];
      let id = item.id.split('-').pop();
      InputTableManager.getInstance().setInputTableById(id || 'checj');
      this.settings.selectedInputMethodId = id || 'checj';
    }

    menus = menus.concat(inputTableMenus);
    chrome.input.ime.setMenuItems({ engineID: this.engineID, items: menus });
  }

  tryOpen(url: string) {
    chrome.windows.getCurrent({}, (win) => {
      if (win === undefined) {
        chrome.windows.create({ url: url, focused: true });
        return;
      }

      chrome.tabs.query({ url: url }).then((tabs) => {
        if (tabs.length === 0) {
          chrome.tabs.create({ active: true, url: url });
          return;
        }

        const tabId = tabs[0].id;
        if (tabId !== undefined) {
          chrome.tabs.update(tabId, { selected: true });
        }
      });
    });
  }

  deferredResetTimeout?: NodeJS.Timeout | null = null;

  // Sometimes onBlur is called unexpectedly. It might be called and then a
  // onFocus comes suddenly when a user is typing contents continuously. Such
  // behaviour causes the input to be interrupted.
  //
  // To prevent the issue, we ignore such event if an onFocus comes very quickly.
  deferredReset() {
    if (this.deferredResetTimeout !== null) {
      clearTimeout(this.deferredResetTimeout);
      this.deferredResetTimeout = null;
    }

    this.deferredResetTimeout = setTimeout(() => {
      this.inputController.reset();
      this.deferredResetTimeout = null;
    }, 5000);
  }

  /**
   * Creates the UI object for the input controller.
   * @returns The UI object.
   */
  makeUI() {
    return {
      reset: () => {
        if (this.context === undefined) return;
        if (this.engineID === undefined) return;
        try {
          // The context might be destroyed by the time we reset it, so we use a
          // try/catch block here.
          chrome.input.ime.clearComposition({
            contextID: this.context.contextID,
          });
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: '',
              auxiliaryTextVisible: false,
              visible: false,
            },
          });
        } catch (e) {}
      },

      commitString: (text: string) => {
        if (this.context === undefined) return;
        chrome.input.ime.commitText({
          contextID: this.context.contextID,
          text: text,
        });
      },

      update: (stateString: string) => {
        if (this.context === undefined) return;
        if (this.engineID === undefined) return;

        const state = JSON.parse(stateString);
        const buffer = state.composingBuffer;
        const candidates = state.candidates;
        const tooltip = state.tooltip;

        const segments = [];
        let text = '';
        let selectionStart: number | undefined = undefined;
        let selectionEnd: number | undefined = undefined;
        let index = 0;
        for (let item of buffer) {
          text += item.text;
          if (item.style === 'highlighted') {
            selectionStart = index;
            selectionEnd = index + item.text.length;
            const segment = {
              start: index,
              end: index + item.text.length,
              style: 'doubleUnderline' as const,
            };
            segments.push(segment);
          } else {
            const segment = {
              start: index,
              end: index + item.text.length,
              style: 'underline' as const,
            };
            segments.push(segment);
          }
          index += item.text.length;
        }

        // This shall not happen, but we make sure the cursor index to be not
        // larger than the text length.
        let localCursorIndex = state.cursorIndex;
        if (localCursorIndex > text.length) {
          localCursorIndex = text.length;
        }

        chrome.input.ime.setComposition({
          contextID: this.context.contextID,
          cursor: localCursorIndex,
          segments: segments,
          text: text,
          selectionStart: selectionStart,
          selectionEnd: selectionEnd,
        });

        if (candidates.length) {
          const chromeCandidates = [];
          let index = 0;
          let selectedIndex = 0;
          for (let candidate of state.candidates) {
            if (candidate.selected) {
              selectedIndex = index;
            }
            const item = {
              candidate: candidate.candidate.displayText,
              annotation: candidate.candidate.description,
              id: index++,
              label: candidate.keyCap,
            };
            chromeCandidates.push(item);
          }

          const candidatePageCount = state.candidatePageCount;
          const candidatePageIndex = state.candidatePageIndex + 1;
          let candidateAnnotation = state.candidateAnnotation || '';
          if (candidateAnnotation.length > 0) {
            candidateAnnotation = candidateAnnotation + ' ';
          }

          let auxiliaryText = '';
          if (tooltip && tooltip.length > 0) {
            auxiliaryText += tooltip + '\n';
          }

          auxiliaryText += candidateAnnotation + candidatePageIndex + '/' + candidatePageCount;

          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: auxiliaryText,
              auxiliaryTextVisible: true,
              visible: true,
              cursorVisible: true,
              vertical: true,
              pageSize: candidates.length,
              windowPosition: 'cursor' as const,
            },
          });

          chrome.input.ime.setCandidates({
            contextID: this.context.contextID,
            candidates: chromeCandidates,
          });

          chrome.input.ime.setCursorPosition({
            contextID: this.context.contextID,
            candidateID: selectedIndex,
          });
        } else if (tooltip && tooltip.length > 0) {
          chrome.input.ime.setCandidates({
            contextID: this.context.contextID,
            candidates: [
              {
                candidate: tooltip,
                annotation: '',
                id: -1,
                label: '-',
              },
            ],
          });
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: '',
              auxiliaryTextVisible: false,
              visible: true,
              cursorVisible: false,
              vertical: true,
              pageSize: 1,
              totalCandidates: 1,
              windowPosition: 'cursor' as const,
            },
          });
        } else {
          chrome.input.ime.setCandidateWindowProperties({
            engineID: this.engineID,
            properties: {
              auxiliaryText: '',
              auxiliaryTextVisible: false,
              visible: false,
            },
          });
        }
      },
    };
  }
}

const chromeMcTabim = new ChromeMcTabim();

chrome.input?.ime.onActivate.addListener((engineID) => {
  chromeMcTabim.engineID = engineID;
  chromeMcTabim.loadSettings();
  chromeMcTabim.updateMenu();
});

// Called when the current text input are loses the focus.
chrome.input?.ime.onBlur.addListener((context) => {
  chromeMcTabim.deferredReset();
});

chrome.input?.ime.onReset.addListener((context) => {
  chromeMcTabim.deferredReset();
});

// Called when the user switch to another input method.
chrome.input?.ime.onDeactivated.addListener((context) => {
  if (chromeMcTabim.deferredResetTimeout !== null) {
    clearTimeout(chromeMcTabim.deferredResetTimeout);
  }
  chromeMcTabim.context = undefined;
  chromeMcTabim.inputController.reset();
  chromeMcTabim.deferredResetTimeout = null;
});

// Called when the current text input is focused. We reload the settings this
// time.
chrome.input?.ime.onFocus.addListener((context) => {
  chromeMcTabim.context = context;
  if (chromeMcTabim.deferredResetTimeout !== null) {
    clearTimeout(chromeMcTabim.deferredResetTimeout);
  } else {
    chromeMcTabim.loadSettings();
  }
});

// The main keyboard event handler.
chrome.input?.ime.onKeyEvent.addListener((engineID, keyData) => {
  chromeMcTabim.engineID = engineID;

  if (keyData.type === 'keyup') {
    // If we have a shift in a key down event, then a key up event with the
    // shift key, and there is no other key down event between them, it means it
    // is a single shift down/up, and we can let some users to use this to
    // toggle between Bopomofo mode and alphabet mode.
    if (keyData.key === 'Shift' && chromeMcTabim.isShiftHold) {
      chromeMcTabim.isShiftHold = false;
      chromeMcTabim.inputController.reset();
      chromeMcTabim.toggleAlphabetMode();
      return true;
    }
    return false;
  }

  if (keyData.type !== 'keydown') {
    return false;
  }

  // We always prevent handling Ctrl + Space so we can switch input methods.
  if (keyData.ctrlKey) {
    chromeMcTabim.inputController.reset();
    return false;
  }

  const shouldHandleShift = chromeMcTabim.settings.shiftKeyToToggleAlphabetMode === true;

  if (shouldHandleShift) {
    chromeMcTabim.isShiftHold = keyData.key === 'Shift';
  }

  if (keyData.altKey || keyData.altgrKey || keyData.capsLock) {
    chromeMcTabim.inputController.reset();
    return false;
  }

  if (chromeMcTabim.isAlphabetMode) {
    return false;
  }

  const keyEvent = KeyFromKeyboardEvent(keyData);
  return chromeMcTabim.inputController.handle(keyEvent);
});

chrome.input.ime.onCandidateClicked.addListener((engineID, candidateID, button) => {
  if (candidateID < 0) {
    return;
  }
  chromeMcTabim.inputController.selectCandidateAtIndex(candidateID);
});

chrome.input?.ime.onMenuItemActivated.addListener((engineID, name) => {
  if (name.search('mctabim-select-table-') === 0) {
    const id = name.split('-').pop();
    InputTableManager.getInstance().setInputTableById(id || '');
    chromeMcTabim.settings.selectedInputMethodId = id || '';
    chromeMcTabim.saveSettings();
    chromeMcTabim.updateMenu();
    return;
  }

  switch (name) {
    case 'mctabim-options':
      chromeMcTabim.tryOpen(chrome.runtime.getURL('options.html'));
      break;
    case 'mctabim-help':
      chromeMcTabim.tryOpen(chrome.runtime.getURL('help/index.html'));
      break;
    case 'mctabim-homepage':
      chromeMcTabim.tryOpen('https://openvanilla.org/');
      break;
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);

  if (request.command === 'get_table_names_and_settings') {
    const tables = InputTableManager.getInstance().getTables();
    sendResponse({ status: 'ok', tables });
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

// A workaround to prevent Chrome to kill the service worker.
let lifeline: chrome.runtime.Port | undefined = undefined;

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = undefined;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      const args = {
        target: { tabId: tab.id ?? 9 },
        func: () => chrome.runtime.connect({ name: 'keepAlive' }),
      };
      await chrome.scripting.executeScript(args);
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(
  tabId: number,
  info: chrome.tabs.OnUpdatedInfo,
  tab: chrome.tabs.Tab,
) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

chromeMcTabim.loadSettings();
keepAlive();

/**
 * Converts a keyboard event to a Key object.
 * @param event The keyboard event.
 * @returns The Key object.
 */
function KeyFromKeyboardEvent(event: chrome.input.ime.KeyboardEvent) {
  let keyName = KeyName.UNKNOWN;
  switch (event.code) {
    case 'ArrowLeft':
      keyName = KeyName.LEFT;
      break;
    case 'ArrowRight':
      keyName = KeyName.RIGHT;
      break;
    case 'ArrowUp':
      keyName = KeyName.UP;
      break;
    case 'ArrowDown':
      keyName = KeyName.DOWN;
      break;
    case 'Home':
      keyName = KeyName.HOME;
      break;
    case 'End':
      keyName = KeyName.END;
      break;
    case 'Backspace':
      keyName = KeyName.BACKSPACE;
      break;
    case 'Delete':
      keyName = KeyName.DELETE;
      break;
    case 'Enter':
      keyName = KeyName.RETURN;
      break;
    case 'Escape':
      keyName = KeyName.ESC;
      break;
    case 'Space':
      keyName = KeyName.SPACE;
      break;
    case 'Tab':
      keyName = KeyName.TAB;
      break;
    case 'PageUp':
      keyName = KeyName.PAGE_UP;
      break;
    case 'PageDown':
      keyName = KeyName.PAGE_DOWN;
      break;
    default:
      keyName = KeyName.ASCII;
      break;
  }
  const key = new Key(event.key, keyName, event.shiftKey, event.ctrlKey);
  return key;
}
