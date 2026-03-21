(function () {
  const calculateFunctionPosition = ({
    caretRect,
    mirrorRect,
    textAreaRect,
    containerRect,
    lineHeight,
    scrollTop,
    scrollLeft,
  }) => {
    const relativeTop = caretRect.top - mirrorRect.top;
    const relativeLeft = caretRect.left - mirrorRect.left;

    return {
      top:
        textAreaRect.top -
        containerRect.top +
        relativeTop +
        lineHeight -
        scrollTop,
      left: textAreaRect.left - containerRect.left + relativeLeft - scrollLeft,
    };
  };

  const FEATURES = {
    feature_input: '輸入功能',
    feature_user_data: '自訂符號表管理',
    feature_lookup: '字根反查',
    feature_table_help: '輸入法表格說明',
  };
  const TITLE_PREFIX = 'McTabIM 小麥他命輸入法 - ';

  const $ = (id) => document.getElementById(id);
  const setVisibility = (id, visible) => {
    $(id).style.visibility = visible ? 'visible' : 'hidden';
  };
  const focusTextArea = () => {
    $('text_area').focus();
  };

  function toggleFeature(id) {
    for (const featureId of Object.keys(FEATURES)) {
      $(featureId).style.display = featureId === id ? 'flex' : 'none';
    }
    document.title = TITLE_PREFIX + (FEATURES[id] ?? FEATURES.feature_input);
    if (id === 'feature_input') {
      focusTextArea();
    }
  }

  function insertTextAtSelection(text) {
    const textArea = $('text_area');
    const selectionStart = textArea.selectionStart;
    const selectionEnd = textArea.selectionEnd;
    const currentText = textArea.value;
    const head = currentText.substring(0, selectionStart);
    const tail = currentText.substring(selectionEnd);

    textArea.value = head + text + tail;
    const cursorPosition = head.length + text.length;
    textArea.setSelectionRange(cursorPosition, cursorPosition);
  }

  function removeTextBeforeSelection() {
    const textArea = $('text_area');
    const selectionStart = textArea.selectionStart;
    const selectionEnd = textArea.selectionEnd;
    const currentText = textArea.value;
    const head = currentText.substring(0, selectionStart);
    const tail = currentText.substring(selectionEnd);

    textArea.value = head.substring(0, head.length - 1) + tail;
    const cursorPosition = Math.max(0, head.length - 1);
    textArea.setSelectionRange(cursorPosition, cursorPosition);
  }

  function buildComposingBufferHtml(state) {
    const buffer = state.composingBuffer;
    if (!buffer.length) {
      composingBuffer = '';
      return '';
    }

    let html = '<p>';
    let plainText = '';
    let index = 0;
    for (const item of buffer) {
      if (item.style === 'highlighted') {
        html += '<span class="marking">';
      }
      plainText += item.text;
      for (const char of item.text) {
        if (index === state.cursorIndex) {
          html += "<span class='cursor'>|</span>";
        }
        html += char;
        index++;
      }
      if (item.style === 'highlighted') {
        html += '</span>';
      }
    }
    if (index === state.cursorIndex) {
      html += "<span class='cursor'>|</span>";
    }
    html += '</p>';
    composingBuffer = plainText;
    return html;
  }

  function buildCandidatesHtml(state) {
    if (!state.candidates.length) {
      return '';
    }

    let html = '<table>';
    for (const candidate of state.candidates) {
      html += candidate.selected ? '<tr class="highlighted_candidate">' : '<tr>';
      html += `<td class="keycap">${candidate.keyCap}</td>`;
      html += `<td class="candidate">${candidate.candidate.displayText}</td>`;
      html += `<td class="description">${candidate.candidate.description}</td>`;
      html += '</tr>';
    }
    html += '<tr class="page_info">';
    html += `<td colspan="2">${state.candidateAnnotation ?? ''}</td>`;
    html += `<td colspan="1">${state.candidatePageIndex + 1} / ${state.candidatePageCount}</td>`;
    html += '</tr>';
    html += '</table>';
    return html;
  }

  function positionFunctionPanel() {
    const textArea = $('text_area');
    const functionDiv = $('function');
    const textAreaRect = textArea.getBoundingClientRect();
    const containerRect = $('edit_area').getBoundingClientRect();
    const textAreaStyle = window.getComputedStyle(textArea);
    const lineHeight = parseInt(textAreaStyle.lineHeight, 10) || 20;

    const mirror = document.createElement('div');
    const mirroredStyles = [
      'fontFamily',
      'fontSize',
      'fontWeight',
      'letterSpacing',
      'overflowWrap',
      'whiteSpace',
      'lineHeight',
      'padding',
      'border',
      'boxSizing',
      'width',
    ];
    for (const style of mirroredStyles) {
      mirror.style[style] = textAreaStyle[style];
    }
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.overflowWrap = 'break-word';

    const caretSpan = document.createElement('span');
    caretSpan.id = 'caret-span';
    caretSpan.textContent = '|';
    const caretPos = textArea.selectionStart;
    const textBeforeCaret = textArea.value.substring(0, caretPos);
    mirror.textContent = textBeforeCaret;
    mirror.appendChild(caretSpan);

    document.body.appendChild(mirror);
    const caretRect = caretSpan.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();
    const scrollTop = textArea.scrollTop;
    const scrollLeft = textArea.scrollLeft;
    const { top, left } = calculateFunctionPosition({
      caretRect,
      mirrorRect,
      textAreaRect,
      containerRect,
      lineHeight,
      scrollTop,
      scrollLeft,
    });
    document.body.removeChild(mirror);

    functionDiv.style.position = 'absolute';
    functionDiv.style.top = `${top}px`;
    functionDiv.style.left = `${left}px`;
  }

  const ui = (() => {
    const api = {};

    api.beep = () => {
      const snd = new Audio(
        'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=',
      );
      snd.play();
    };

    api.reset = () => {
      setVisibility('function', false);
      setVisibility('candidates', false);
      $('composing_buffer').innerHTML = '';
      $('candidates').innerHTML = '';
      $('tooltip').innerText = '';
      setVisibility('tooltip', false);
      const caretSpan = $('caret-span');
      if (caretSpan) {
        caretSpan.remove();
      }
      composingBuffer = '';
    };

    api.commitString = (text) => {
      insertTextAtSelection(text);
      composingBuffer = '';
    };

    api.backspace = () => {
      removeTextBeforeSelection();
      composingBuffer = '';
    };

    api.updateByAlphabetMode = () => {
      $('status').innerHTML = globalUi.alphabetMode
        ? '<a href="" onclick="example.globalUi.enterChineseMode(); return false;">【英文】</a>'
        : '<a href="" onclick="example.globalUi.enterAlphabetMode(); return false;">【中文】</a>';
    };

    api.update = (jsonString) => {
      api.updateByAlphabetMode();
      const state = JSON.parse(jsonString);
      const composingBufferElement = $('composing_buffer');
      const candidatesElement = $('candidates');
      const tooltipElement = $('tooltip');

      const composingHtml = buildComposingBufferHtml(state);
      composingBufferElement.innerHTML = composingHtml;
      setVisibility('composing_buffer', Boolean(composingHtml));

      candidatesElement.innerHTML = buildCandidatesHtml(state);
      setVisibility('candidates', state.candidates.length > 0);

      tooltipElement.innerText = state.tooltip ?? '';
      setVisibility('tooltip', Boolean(state.tooltip && state.tooltip.length > 0));

      setVisibility('function', true);
      positionFunctionPanel();
    };

    return api;
  })();

  const globalUi = (() => {
    const api = {
      alphabetMode: false,
      keyboardVisible: false,
    };

    api.enterAlphabetMode = () => {
      api.alphabetMode = true;
      ui.updateByAlphabetMode();
      inputMethod.controller.reset();
      focusTextArea();
    };

    api.enterChineseMode = () => {
      api.alphabetMode = false;
      ui.updateByAlphabetMode();
      inputMethod.controller.reset();
      focusTextArea();
    };

    return api;
  })();

  function createUserDataStore(storageKey, defaultDataGetter, textAreaId, apply) {
    return {
      data: '',
      load() {
        const saved = window.localStorage.getItem(storageKey);
        this.data = saved ?? defaultDataGetter();
      },
      save() {
        window.localStorage.setItem(storageKey, this.data);
      },
      applyToUi() {
        $(textAreaId).value = this.data;
      },
      applyToInputMethod() {
        apply(this.data);
      },
    };
  }

  const settings = (() => {
    const cloneSettings = (value) => {
      if (typeof structuredClone === 'function') {
        return structuredClone(value);
      }
      return JSON.parse(JSON.stringify(value));
    };

    const defaultSettings = {
      selectedInputMethodId: 'checj',
      inputSettings: {
        chineseConversionEnabled: false,
        associatedPhrasesEnabled: false,
        shiftPunctuationForSymbolsEnabled: true,
        shiftLetterForSymbolsEnabled: true,
        wildcardMatchingEnabled: false,
        clearOnErrors: false,
        beepOnErrors: false,
        reverseRadicalLookupEnabled: false,
        homophoneLookupEnabled: true,
      },
    };

    const api = {
      defaultSettings,
      settings: cloneSettings(defaultSettings),
    };

    api.load = () => {
      const saved = window.localStorage.getItem('settings');
      api.settings = saved ? JSON.parse(saved) : cloneSettings(defaultSettings);
    };

    api.save = () => {
      window.localStorage.setItem('settings', JSON.stringify(api.settings));
    };

    api.applyToInputMethod = () => {
      const selectedId = api.settings.selectedId ?? api.settings.selectedInputMethodId;
      if (selectedId) {
        inputMethod.tableManager.setInputTableById(selectedId);
      }
      inputMethod.controller.settings = api.settings.inputSettings;
      inputMethod.controller.reset();
    };

    api.applyToUi = () => {
      const selectedId = api.settings.selectedId ?? api.settings.selectedInputMethodId;
      if (selectedId) {
        $('input-table-select').value = selectedId;
      }

      const inputSettings = api.settings.inputSettings;
      $('associated_phrases_enabled').checked = inputSettings.associatedPhrasesEnabled;
      $('chinese_convert_simp').checked = inputSettings.chineseConversionEnabled;
      $('chinese_convert_trad').checked = !inputSettings.chineseConversionEnabled;
      $('shift_punctuation_for_symbols_enabled').checked =
        inputSettings.shiftPunctuationForSymbolsEnabled;
      $('shift_letter_for_symbols_enabled').checked = inputSettings.shiftLetterForSymbolsEnabled;
      $('clean_on_error').checked = inputSettings.clearOnErrors;
      $('beep_on_error').checked = inputSettings.beepOnErrors;
      $('wildcard_matching_enabled').checked = inputSettings.wildcardMatchingEnabled;
      $('reverse_radical_lookup_enabled').checked = inputSettings.reverseRadicalLookupEnabled;
      $('homophone_lookup_enabled').checked = inputSettings.homophoneLookupEnabled;
    };

    return api;
  })();

  const inputMethod = (() => {
    const { InputController, InputTableManager } = window.mctabim;
    const api = {};

    api.controller = (() => {
      const controller = new InputController(ui);
      controller.onSettingChanged = (newSettings) => {
        settings.settings.inputSettings = newSettings;
        settings.save();
        settings.applyToUi();
        screenKeyboard.loadLayout();
      };
      controller.onError = () => {
        ui.beep();
      };
      return controller;
    })();

    api.tableManager = InputTableManager.getInstance();

    api.populateInputMethodTableSelect = () => {
      const tables = api.tableManager.tables;
      const select = $('input-table-select');
      select.innerHTML = '';

      for (const [id, name] of tables) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        select.appendChild(option);
      }

      select.value = api.tableManager.currentTable.id;
      select.addEventListener('change', (event) => {
        settings.settings.selectedId = event.target.value;
        settings.save();
        settings.applyToInputMethod();
        screenKeyboard.loadLayout();
        focusTextArea();
      });
    };

    api.populateInputMethodTableSelect();
    return api;
  })();

  const symbolTableUserData = createUserDataStore(
    'symbolTableUserData',
    () => inputMethod.tableManager.customSymbolTable.sourceData,
    'user_data_symbol_area',
    (value) => {
      inputMethod.tableManager.customSymbolTable.sourceData = value;
    },
  );

  const foreignLanguageUserData = createUserDataStore(
    'foreignLanguageUserData',
    () => inputMethod.tableManager.foreignLanguage.sourceData,
    'user_data_foreign_language_area',
    (value) => {
      inputMethod.tableManager.foreignLanguage.sourceData = value;
    },
  );

  const screenKeyboard = (() => {
    const api = {
      isLock: false,
      isShift: false,
      isCtrl: false,
    };

    const Keyboard = window.SimpleKeyboard.default;
    const keyboard = new Keyboard({
      onKeyPress: (button) => handleKeyPress(button),
    });

    const defaultLayout = [
      '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
      '{tab} q w e r t y u i o p [ ] \\',
      "{lock} a s d f g h j k l ; ' {enter}",
      '{shift} z x c v b n m , . / {shift}',
      '{ctrl} {space}',
    ];
    const shiftLayout = [
      '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
      '{tab} Q W E R T Y U I O P { } |',
      '{lock} A S D F G H J K L : " {enter}',
      '{shift} Z X C V B N M < > ? {shift}',
      '{ctrl} {space}',
    ];

    function handleModifierButton(button) {
      if (button === '{lock}') {
        api.isLock = !api.isLock;
      } else if (button === '{shift}') {
        api.isShift = !api.isShift;
      } else if (button === '{ctrl}') {
        api.isCtrl = !api.isCtrl;
      } else {
        return false;
      }
      api.loadLayout();
      return true;
    }

    function handleFallbackButton(button) {
      if (button === '{enter}') {
        ui.commitString('\n');
      } else if (button === '{space}') {
        ui.commitString(' ');
      } else if (button === '{bksp}') {
        ui.backspace();
      }
    }

    function handleKeyPress(button) {
      if (handleModifierButton(button)) {
        return;
      }

      const handled = inputMethod.controller.handleSimpleKeyboardEvent(
        button,
        api.isShift || api.isLock,
        api.isCtrl,
      );
      focusTextArea();

      if (api.isShift) {
        api.isShift = false;
        api.loadLayout();
      }
      if (api.isCtrl) {
        api.isCtrl = false;
        api.loadLayout();
      }
      if (!handled) {
        handleFallbackButton(button);
      }
    }

    function buildKeyboardDisplay() {
      const manager = inputMethod.tableManager;
      const names = manager.currentTable.table.keynames;
      const display = {
        '{tab}': '⇥',
        '{lock}': 'Lock',
        '{shift}': '⇧ Shift',
        '{bksp}': '⌫',
        '{enter}': '↵',
        '{space}': 'Space',
        '{ctrl}': '⌃',
      };

      if (!api.isCtrl) {
        for (const key in names) {
          if (key !== '`') {
            display[key] = names[key];
          }
        }
      }

      if (api.isShift || api.isLock) {
        const inputSettings = settings.settings.inputSettings;
        if (inputSettings.shiftPunctuationForSymbolsEnabled) {
          for (const key in manager.shiftPunctuationsSymbols) {
            if (display[key] === undefined) {
              display[key] = manager.shiftPunctuationsSymbols[key];
            }
          }
        }
        if (inputSettings.shiftLetterForSymbolsEnabled) {
          for (const key in manager.shiftLetterSymbols) {
            if (display[key] === undefined) {
              display[key] = manager.shiftLetterSymbols[key];
            }
          }
        }
      }

      return display;
    }

    function buildButtonTheme() {
      const buttonTheme = [];
      if (api.isLock) {
        buttonTheme.push({ class: 'hg-button-active', buttons: '{lock}' });
      }
      if (api.isShift) {
        buttonTheme.push({ class: 'hg-button-active', buttons: '{shift}' });
      }
      if (api.isCtrl) {
        buttonTheme.push({ class: 'hg-button-active', buttons: '{ctrl}' });
      }
      return buttonTheme;
    }

    api.loadLayout = () => {
      keyboard.setOptions({
        display: buildKeyboardDisplay(),
        layout: {
          default: api.isShift || api.isLock ? shiftLayout : defaultLayout,
        },
        buttonTheme: buildButtonTheme(),
      });
    };

    return api;
  })();

  function syncSettingCheckbox(settingKey, { reloadKeyboard = false } = {}) {
    return (event) => {
      settings.settings.inputSettings[settingKey] = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      if (reloadKeyboard) {
        screenKeyboard.loadLayout();
      }
      focusTextArea();
    };
  }

  function bindSettingsControls() {
    $('chinese_convert_trad').onchange = () => {
      settings.settings.inputSettings.chineseConversionEnabled = false;
      settings.save();
      settings.applyToInputMethod();
      focusTextArea();
    };

    $('chinese_convert_simp').onchange = () => {
      settings.settings.inputSettings.chineseConversionEnabled = true;
      settings.save();
      settings.applyToInputMethod();
      focusTextArea();
    };

    $('associated_phrases_enabled').onchange = syncSettingCheckbox('associatedPhrasesEnabled');
    $('shift_punctuation_for_symbols_enabled').onchange = syncSettingCheckbox(
      'shiftPunctuationForSymbolsEnabled',
      { reloadKeyboard: true },
    );
    $('shift_letter_for_symbols_enabled').onchange = syncSettingCheckbox(
      'shiftLetterForSymbolsEnabled',
      { reloadKeyboard: true },
    );
    $('wildcard_matching_enabled').onchange = syncSettingCheckbox('wildcardMatchingEnabled');
    $('reverse_radical_lookup_enabled').onchange = syncSettingCheckbox(
      'reverseRadicalLookupEnabled',
    );
    $('homophone_lookup_enabled').onchange = syncSettingCheckbox('homophoneLookupEnabled');
    $('clean_on_error').onchange = syncSettingCheckbox('clearOnErrors');
    $('beep_on_error').onchange = syncSettingCheckbox('beepOnErrors');
  }

  function bindTextAreaEvents() {
    const textarea = $('text_area');
    const warning = $('ime_warning');
    const imeCompositionGuard = window.imeCompositionGuard;
    let shiftKeyIsPressed = false;
    let isComposing = false;

    textarea.addEventListener('compositionstart', () => {
      isComposing = true;
      imeCompositionGuard.showImeWarning(warning);
    });

    textarea.addEventListener('compositionend', () => {
      isComposing = false;
      imeCompositionGuard.hideImeWarning(warning);
    });

    textarea.addEventListener('keyup', (event) => {
      if (imeCompositionGuard.shouldSkipKeyboardEvent(isComposing, event)) {
        return;
      }

      if (event.key === 'Shift' && shiftKeyIsPressed) {
        globalUi.alphabetMode = !globalUi.alphabetMode;
        ui.updateByAlphabetMode();
        inputMethod.controller.reset();
      }
    });

    textarea.addEventListener('keydown', (event) => {
      if (imeCompositionGuard.shouldSkipKeyboardEvent(isComposing, event)) {
        return;
      }

      if (event.metaKey || event.altKey) {
        inputMethod.controller.reset();
        return;
      }

      shiftKeyIsPressed = event.key === 'Shift';
      if (globalUi.alphabetMode) {
        return;
      }

      const accepted = inputMethod.controller.handleKeyboardEvent(event);
      if (accepted) {
        event.preventDefault();
      }
    });
  }

  function initializeFeatureRouting() {
    window.addEventListener('hashchange', () => {
      toggleFeature(window.location.hash.substring(1));
    });

    if (window.location.hash.length > 1) {
      toggleFeature(window.location.hash.substring(1));
    } else {
      toggleFeature('feature_input');
    }
  }

  function initializeUserDataStores() {
    symbolTableUserData.load();
    symbolTableUserData.applyToUi();
    symbolTableUserData.applyToInputMethod();

    foreignLanguageUserData.load();
    foreignLanguageUserData.applyToUi();
    foreignLanguageUserData.applyToInputMethod();
  }

  function bindUserDataButtons() {
    $('load_user_data_button').onclick = $('save_user_data_button').onclick = () => {
      symbolTableUserData.data = $('user_data_symbol_area').value;
      symbolTableUserData.applyToInputMethod();
      symbolTableUserData.save();
      $('user_data_symbol_area').focus();
    };

    $('load_user_data_foreign_language_button').onclick = $(
      'save_user_data_foreign_language_button',
    ).onclick = () => {
      foreignLanguageUserData.data = $('user_data_foreign_language_area').value;
      foreignLanguageUserData.applyToInputMethod();
      foreignLanguageUserData.save();
      $('user_data_foreign_language_area').focus();
    };
  }

  function bindFullscreenButton() {
    $('fullscreen').onclick = () => {
      const editArea = $('edit_area');
      if (editArea.requestFullscreen) {
        editArea.requestFullscreen();
      } else if (editArea.msRequestFullscreen) {
        editArea.msRequestFullscreen();
      } else if (editArea.mozRequestFullScreen) {
        editArea.mozRequestFullScreen();
      } else if (editArea.webkitRequestFullscreen) {
        editArea.webkitRequestFullscreen();
      }
      focusTextArea();
      return false;
    };
  }

  function renderLookupResult(character, entries) {
    if (!entries.length) {
      return `<h3>${character}</h3><p>找不到對應的字根</p>`;
    }

    return [
      `<h3>${character}</h3>`,
      '<table border="1" style="border-collapse: collapse; margin-top: 10px;">',
      '<thead><tr><th style="padding: 4px 8px;">輸入法</th><th style="padding: 4px 8px;">字根</th></tr></thead>',
      '<tbody>',
      entries
        .map((item) => {
          return `<tr><td style="padding: 4px 8px;">${item.inputTableName}</td><td style="padding: 4px 8px;">${item.radicals.join(', ')}</td></tr>`;
        })
        .join(''),
      '</tbody></table>',
    ].join('');
  }

  function bindLookupControls() {
    function lookUp() {
      const text = $('lookup_input').value.trim();
      if (!text.length) {
        return;
      }
      const resultHtml = text
        .split('')
        .map((char) =>
          renderLookupResult(char, inputMethod.tableManager.reverseLookupForRadicals(char)),
        )
        .join('');
      $('lookup_result').innerHTML = resultHtml;
    }

    $('lookup_input').onkeydown = (event) => {
      if (event.key === 'Enter') {
        lookUp();
      }
    };
    $('lookup_button').onclick = lookUp;
  }

  function initializeIndexedDbAutosave() {
    const DB_NAME = 'McTabimUserData';
    const STORE_NAME = 'textAreaContent';
    const CONTENT_KEY = 'main_text_area';
    let db = null;

    function openDb() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
          const database = event.target.result;
          if (!database.objectStoreNames.contains(STORE_NAME)) {
            database.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = (event) => {
          db = event.target.result;
          resolve(db);
        };
        request.onerror = (event) => {
          console.error('IndexedDB error:', event.target.error);
          reject(event.target.error);
        };
      });
    }

    function saveContent(content) {
      if (!db) {
        return;
      }
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        transaction.objectStore(STORE_NAME).put(content, CONTENT_KEY);
      } catch (error) {
        console.error('Failed to save content to IndexedDB', error);
      }
    }

    function loadContent() {
      if (!db) {
        return Promise.resolve(null);
      }
      return new Promise((resolve, reject) => {
        try {
          const request = db
            .transaction([STORE_NAME], 'readonly')
            .objectStore(STORE_NAME)
            .get(CONTENT_KEY);
          request.onsuccess = () => resolve(request.result);
          request.onerror = (event) => reject(event.target.error);
        } catch (error) {
          console.error('Failed to load content from IndexedDB', error);
          reject(error);
        }
      });
    }

    const textArea = $('text_area');
    openDb()
      .then(() => loadContent())
      .then((savedContent) => {
        if (typeof savedContent === 'string') {
          textArea.value = savedContent;
        }
      })
      .catch((error) => {
        console.error('IndexedDB init/load failed:', error);
      });

    let debounceTimeout;
    textArea.addEventListener('input', () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        saveContent(textArea.value);
      }, 500);
    });
  }

  function finalizeLoading() {
    $('loading').innerText = '載入完畢！';
    setTimeout(() => {
      $('loading').style.display = 'none';
    }, 2000);
  }

  (function initialize() {
    ui.updateByAlphabetMode();
    bindTextAreaEvents();
    bindSettingsControls();
    initializeFeatureRouting();

    settings.load();
    settings.applyToUi();
    settings.applyToInputMethod();

    initializeUserDataStores();
    screenKeyboard.loadLayout();
    bindUserDataButtons();
    bindFullscreenButton();
    bindLookupControls();
    initializeIndexedDbAutosave();
    finalizeLoading();
    focusTextArea();
  })();

  const api = {
    ui,
    globalUi,
    inputMethod,
    settings,
    symbolTableUserData,
    foreignLanguageUserData,
    keyboard: screenKeyboard,
  };

  window.example = api;
})();
