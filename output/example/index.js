let example = (function () {
  function toggle_feature(id) {
    let features = ['feature_input', 'feature_user_data'];
    for (let feature of features) {
      document.getElementById(feature).style.display = 'none';
    }
    document.getElementById(id).style.display = 'block';
    const prefix = 'McTabIM 小麥他命輸入法 - ';
    if (id === 'feature_input') {
      document.getElementById('text_area').focus();
      document.title = prefix + '輸入功能';
    } else if (id === 'feature_user_data') {
      document.title = prefix + '自訂符號表管理';
    }
  }

  const ui = (function () {
    let that = {};
    that.beep = () => {
      const snd = new Audio(
        'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=',
      );
      snd.play();
    };

    that.reset = () => {
      document.getElementById('function').style.visibility = 'hidden';
      document.getElementById('candidates').style.visibility = 'hidden';
      let renderText = '';
      // renderText += "<span class='cursor'>|</span>";
      document.getElementById('composing_buffer').innerHTML = renderText;
      document.getElementById('candidates').innerHTML = '';
      composingBuffer = '';
      document.getElementById('tooltip').innerText = '';
      document.getElementById('tooltip').style.visibility = 'hidden';
      const caretSpan = document.getElementById('caret-span');
      if (caretSpan) {
        caretSpan.remove();
      }
    };

    that.commitString = (string) => {
      var selectionStart = document.getElementById('text_area').selectionStart;
      var selectionEnd = document.getElementById('text_area').selectionEnd;
      var text = document.getElementById('text_area').value;
      var head = text.substring(0, selectionStart);
      var tail = text.substring(selectionEnd);
      document.getElementById('text_area').value = head + string + tail;
      let cursorPosition = head.length + string.length;
      document.getElementById('text_area').setSelectionRange(cursorPosition, cursorPosition);
      composingBuffer = '';
    };

    that.backspace = () => {
      var selectionStart = document.getElementById('text_area').selectionStart;
      var selectionEnd = document.getElementById('text_area').selectionEnd;
      var text = document.getElementById('text_area').value;
      var head = text.substring(0, selectionStart);
      var tail = text.substring(selectionEnd);
      document.getElementById('text_area').value = head.substring(0, head.length - 1) + tail;
      let cursorPosition = head.length - 1;
      document.getElementById('text_area').setSelectionRange(cursorPosition, cursorPosition);
      composingBuffer = '';
    };

    that.updateByAlphabetMode = () => {
      document.getElementById('status').innerHTML = globalUi.alphabetMode
        ? '<a href="" onclick="example.globalUi.enterChineseMode(); return false;">【英文】</a>'
        : '<a href="" onclick="example.globalUi.enterAlphabetMode(); return false;">【中文】</a>';
    };

    that.updateByKeyboardVisible = () => {
      document.getElementById('keyboard').style.height = '30%';
    };

    that.update = (string) => {
      that.updateByAlphabetMode();
      let state = JSON.parse(string);
      {
        let buffer = state.composingBuffer;
        if (buffer.length === 0) {
          document.getElementById('composing_buffer').innerHTML = '';
          document.getElementById('composing_buffer').style.visibility = 'hidden';
        } else {
          let renderText = '<p>';
          let plainText = '';
          let i = 0;
          for (let item of buffer) {
            if (item.style === 'highlighted') {
              renderText += '<span class="marking">';
            }
            let text = item.text;
            plainText += text;
            for (let c of text) {
              if (i === state.cursorIndex) {
                renderText += "<span class='cursor'>|</span>";
              }
              renderText += c;
              i++;
            }
            if (item.style === 'highlighted') {
              renderText += '</span>';
            }
          }
          if (i === state.cursorIndex) {
            renderText += "<span class='cursor'>|</span>";
          }
          renderText += '</p>';
          document.getElementById('composing_buffer').innerHTML = renderText;
          composingBuffer = plainText;
          document.getElementById('composing_buffer').style.visibility = 'visible';
        }
      }

      if (state.candidates.length) {
        let s = '<table>';
        for (let candidate of state.candidates) {
          if (candidate.selected) {
            s += '<tr class="highlighted_candidate"> ';
          } else {
            s += '<tr>';
          }
          s += '<td class="keycap">';
          s += candidate.keyCap;
          s += '</td>';
          s += '<td class="candidate">';
          s += candidate.candidate.displayText;
          s += '</td>';
          s += '<td class="description">';
          s += candidate.candidate.description;
          s += '</td>';
          s += '</tr>';
        }
        const annotation = state.candidateAnnotation ?? '';
        s += '<tr class="page_info"> ';
        s += '<td colspan="2">';
        s += annotation;
        s += '</td>';
        s += '<td colspan="1">';
        s += '' + (state.candidatePageIndex + 1) + ' / ' + state.candidatePageCount;
        s += '</td>';
        s += '</tr>';
        s += '</table>';

        document.getElementById('candidates').innerHTML = s;
      }

      document.getElementById('candidates').style.visibility = state.candidates.length
        ? 'visible'
        : 'hidden';

      if (state.tooltip && state.tooltip.length > 0) {
        document.getElementById('tooltip').innerText = state.tooltip;
        document.getElementById('tooltip').style.visibility = 'visible';
      } else {
        document.getElementById('tooltip').innerText = '';
        document.getElementById('tooltip').style.visibility = 'hidden';
      }

      document.getElementById('function').style.visibility = 'visible';
      const textArea = document.getElementById('text_area');
      const functionDiv = document.getElementById('function');
      const rect = textArea.getBoundingClientRect();
      const textAreaStyle = window.getComputedStyle(textArea);
      const lineHeight = parseInt(textAreaStyle.lineHeight) || 20;

      // Create a temporary mirror div to measure actual caret position
      const mirror = document.createElement('div');
      const styles = [
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
      styles.forEach((style) => {
        mirror.style[style] = textAreaStyle[style];
      });
      mirror.style.position = 'absolute';
      mirror.style.visibility = 'hidden';
      mirror.style.whiteSpace = 'pre-wrap';
      mirror.style.overflowWrap = 'break-word';

      const caretPos = textArea.selectionStart;
      const textBeforeCaret = textArea.value.substring(0, caretPos);
      mirror.textContent = textBeforeCaret;

      const caretSpan = document.createElement('span');
      caretSpan.id = 'caret-span';
      caretSpan.textContent = '|';
      mirror.appendChild(caretSpan);

      document.body.appendChild(mirror);

      const caretRect = caretSpan.getBoundingClientRect();
      const mirrorRect = mirror.getBoundingClientRect();

      const relativeTop = caretRect.top - mirrorRect.top;
      const relativeLeft = caretRect.left - mirrorRect.left;

      document.body.removeChild(mirror);

      // Account for textarea scroll position
      const scrollTop = textArea.scrollTop;
      const scrollLeft = textArea.scrollLeft;

      functionDiv.style.position = 'absolute';
      functionDiv.style.top = rect.top + relativeTop + lineHeight - scrollTop + 'px';
      functionDiv.style.left = rect.left + relativeLeft - scrollLeft + 'px';
    };

    return that;
  })();

  const globalUi = (() => {
    let that = {};
    that.alphabetMode = false;
    that.keyboardVisible = false;

    that.enterAlphabetMode = () => {
      that.alphabetMode = true;
      ui.updateByAlphabetMode();
      inputMethod.controller.reset();
      document.getElementById('text_area').focus();
    };

    that.enterChineseMode = () => {
      that.alphabetMode = false;
      ui.updateByAlphabetMode();
      inputMethod.controller.reset();
      document.getElementById('text_area').focus();
    };

    that.toggleKeyboard = () => {
      that.keyboardVisible = !that.keyboardVisible;
      ui.updateByKeyboardVisible();
    };

    return that;
  })();

  let symbolTableUserData = (() => {
    let that = {};
    that.data = '';
    that.load = () => {
      var saved = window.localStorage.getItem('symbolTableUserData');
      if (saved) {
        that.data = saved;
      } else {
        that.data = inputMethod.tableManager.customSymbolTable.sourceData;
      }
    };
    that.save = () => {
      window.localStorage.setItem('symbolTableUserData', that.data);
    };
    that.applyToUi = () => {
      document.getElementById('user_data_symbol_area').value = that.data;
    };
    that.applyToInputMethod = () => {
      inputMethod.tableManager.customSymbolTable.sourceData = that.data;
    };
    return that;
  })();

  let foreignLanguageUserData = (() => {
    let that = {};
    that.data = '';
    that.load = () => {
      var saved = window.localStorage.getItem('foreignLanguageUserData');
      if (saved) {
        that.data = saved;
      } else {
        that.data = inputMethod.tableManager.foreignLanguage.sourceData;
      }
    };
    that.save = () => {
      window.localStorage.setItem('foreignLanguageUserData', that.data);
    };
    that.applyToUi = () => {
      document.getElementById('user_data_foreign_language_area').value = that.data;
    };
    that.applyToInputMethod = () => {
      inputMethod.tableManager.foreignLanguage.sourceData = that.data;
    };
    return that;
  })();

  let settings = (() => {
    let that = {};
    that.defaultSettings = {
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
    that.settings = {
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
    that.load = () => {
      var saved = window.localStorage.getItem('settings');
      if (saved) {
        that.settings = JSON.parse(saved);
      } else {
        that.settings = that.defaultSettings;
      }
    };
    that.save = () => {
      window.localStorage.setItem('settings', JSON.stringify(that.settings));
    };
    that.applyToInputMethod = () => {
      const selectedId = that.settings.selectedId;
      if (selectedId) {
        inputMethod.tableManager.setInputTableById(selectedId);
      }
      const inputSettings = that.settings.inputSettings;
      inputMethod.controller.settings = inputSettings;
      inputMethod.controller.reset();
    };
    that.applyToUi = () => {
      const selectedId = that.settings.selectedId;
      const select = document.getElementById('input-table-select');
      if (selectedId) {
        select.value = selectedId;
      }
      const inputSettings = that.settings.inputSettings;
      document.getElementById('associated_phrases_enabled').checked =
        inputSettings.associatedPhrasesEnabled;

      const chineseConversionEnabled = that.settings.inputSettings.chineseConversionEnabled;
      if (chineseConversionEnabled) {
        document.getElementById('chinese_convert_simp').checked = true;
      } else {
        document.getElementById('chinese_convert_trad').checked = true;
      }

      document.getElementById('shift_punctuation_for_symbols_enabled').checked =
        inputSettings.shiftPunctuationForSymbolsEnabled;
      document.getElementById('shift_letter_for_symbols_enabled').checked =
        inputSettings.shiftLetterForSymbolsEnabled;
      document.getElementById('clean_on_error').checked = inputSettings.clearOnErrors;
      document.getElementById('beep_on_error').checked = inputSettings.beepOnErrors;
      document.getElementById('wildcard_matching_enabled').checked =
        inputSettings.wildcardMatchingEnabled;
      document.getElementById('reverse_radical_lookup_enabled').checked =
        inputSettings.reverseRadicalLookupEnabled;
      document.getElementById('homophone_lookup_enabled').checked =
        inputSettings.homophoneLookupEnabled;
    };
    return that;
  })();

  const inputMethod = (() => {
    const { InputController, InputTableManager } = window.mctabim;
    let that = {};
    that.controller = (() => {
      let controller = new InputController(ui);
      controller.onSettingChanged = (newSettings) => {
        console.log('onSettingChanged');
        settings.settings.inputSettings = newSettings;
        settings.save();
        settings.applyToUi();
      };
      controller.onError = () => {
        ui.beep();
      };
      return controller;
    })();
    that.tableManager = InputTableManager.getInstance();
    that.populateInputMethodTableSelect = () => {
      const tables = that.tableManager.tables;
      const selectedIndexValue = that.tableManager.selectedIndexValue;
      const select = document.getElementById('input-table-select');
      select.innerHTML = '';
      for (const table of tables) {
        const option = document.createElement('option');
        option.value = table[0];
        option.textContent = table[1];
        if (tables.indexOf(table) === selectedIndexValue) {
          option.selected = true;
        }
        select.appendChild(option);
      }
      // console.log('Selected table id:', manager.currentTable);
      select.value = that.tableManager.currentTable.id;
      select.addEventListener('change', (event) => {
        let value = event.target.value;
        settings.settings.selectedId = value;
        settings.save();
        settings.applyToInputMethod();
        keyboard.loadLayout();
        document.getElementById('text_area').focus();
      });
    };
    that.populateInputMethodTableSelect();
    return that;
  })();

  (() => {
    ui.updateByAlphabetMode();
    const textarea = document.getElementById('text_area');
    let shiftKeyIsPressed = false;
    textarea.addEventListener('keyup', (event) => {
      if (event.key === 'Shift' && shiftKeyIsPressed) {
        globalUi.alphabetMode = !globalUi.alphabetMode;
        ui.updateByAlphabetMode();
        inputMethod.controller.reset();
        return;
      }
    });

    textarea.addEventListener('keydown', (event) => {
      if (event.metaKey || event.altKey) {
        inputMethod.controller.reset();
        return;
      }

      shiftKeyIsPressed = event.key === 'Shift';
      if (globalUi.alphabetMode) {
        return;
      }

      let accepted = inputMethod.controller.handleKeyboardEvent(event);
      if (accepted) {
        event.preventDefault();
      }
    });

    // textarea.addEventListener('blur', () => {
    //   inputMethod.controller.reset();
    //   ui.reset();
    // });

    document.getElementById('chinese_convert_trad').onchange = function (event) {
      settings.settings.inputSettings.chineseConversionEnabled = false;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('chinese_convert_simp').onchange = function (event) {
      settings.settings.inputSettings.chineseConversionEnabled = true;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('associated_phrases_enabled').onchange = (event) => {
      settings.settings.inputSettings.associatedPhrasesEnabled = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('shift_punctuation_for_symbols_enabled').onchange = (event) => {
      settings.settings.inputSettings.shiftPunctuationForSymbolsEnabled = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('shift_letter_for_symbols_enabled').onchange = (event) => {
      settings.settings.inputSettings.shiftLetterForSymbolsEnabled = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('wildcard_matching_enabled').onchange = (event) => {
      settings.settings.inputSettings.wildcardMatchingEnabled = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('reverse_radical_lookup_enabled').onchange = (event) => {
      settings.settings.inputSettings.reverseRadicalLookupEnabled = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('homophone_lookup_enabled').onchange = (event) => {
      settings.settings.inputSettings.homophoneLookupEnabled = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('clean_on_error').onchange = (event) => {
      settings.settings.inputSettings.clearOnErrors = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    document.getElementById('beep_on_error').onchange = (event) => {
      settings.settings.inputSettings.beepOnErrors = event.target.checked;
      settings.save();
      settings.applyToInputMethod();
      document.getElementById('text_area').focus();
    };
    window.addEventListener('hashchange', () => {
      let hash = window.location.hash;
      toggle_feature(hash.substring(1));
    });

    let hash = window.location.hash;
    if (hash.length > 1) {
      toggle_feature(hash.substring(1));
    } else {
      toggle_feature('feature_input');
    }

    settings.load();
    settings.applyToUi();
    settings.applyToInputMethod();
    symbolTableUserData.load();
    symbolTableUserData.applyToUi();
    symbolTableUserData.applyToInputMethod();
    foreignLanguageUserData.load();
    foreignLanguageUserData.applyToUi();
    foreignLanguageUserData.applyToInputMethod();

    document.getElementById('loading').innerText = '載入完畢！';
    setTimeout(function () {
      document.getElementById('loading').style.display = 'none';
    }, 2000);

    document.getElementById('load_user_data_button').onclick = () => {
      symbolTableUserData.data = document.getElementById('user_data_symbol_area').value;
      symbolTableUserData.applyToInputMethod();
      symbolTableUserData.save();
      document.getElementById('user_data_symbol_area').focus();
    };

    document.getElementById('save_user_data_button').onclick = () => {
      symbolTableUserData.data = document.getElementById('user_data_symbol_area').value;
      symbolTableUserData.applyToInputMethod();
      symbolTableUserData.save();
      document.getElementById('user_data_symbol_area').focus();
    };

    document.getElementById('load_user_data_foreign_language_button').onclick = () => {
      foreignLanguageUserData.data = document.getElementById(
        'user_data_foreign_language_area',
      ).value;
      foreignLanguageUserData.applyToInputMethod();
      foreignLanguageUserData.save();
      document.getElementById('user_data_foreign_language_area').focus();
    };

    document.getElementById('save_user_data_foreign_language_button').onclick = () => {
      foreignLanguageUserData.data = document.getElementById(
        'user_data_foreign_language_area',
      ).value;
      foreignLanguageUserData.applyToInputMethod();
      foreignLanguageUserData.save();
      document.getElementById('user_data_foreign_language_area').focus();
    };

    document.getElementById('fullscreen').onclick = (event) => {
      const elem = document.getElementById('edit_area');
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
      document.getElementById('text_area').focus();
      return false;
    };

    // IndexedDB logic for saving text area content.
    (() => {
      const DB_NAME = 'McTabimUserData';
      const STORE_NAME = 'textAreaContent';
      const CONTENT_KEY = 'main_text_area';
      let db = null;

      function openDB() {
        return new Promise((resolve, reject) => {
          const request = indexedDB.open(DB_NAME, 1);
          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME);
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
        if (!db) return;
        try {
          const transaction = db.transaction([STORE_NAME], 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          store.put(content, CONTENT_KEY);
        } catch (e) {
          console.error('Failed to save content to IndexedDB', e);
        }
      }

      function loadContent() {
        if (!db) return Promise.resolve(null);
        return new Promise((resolve, reject) => {
          try {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(CONTENT_KEY);
            request.onsuccess = () => {
              resolve(request.result);
            };
            request.onerror = (event) => {
              reject(event.target.error);
            };
          } catch (e) {
            console.error('Failed to load content from IndexedDB', e);
            reject(e);
          }
        });
      }

      const textArea = document.getElementById('text_area');
      if (!textArea) {
        console.error('Text area not found');
        return;
      }

      openDB()
        .then(() => {
          loadContent()
            .then((savedContent) => {
              if (typeof savedContent === 'string') {
                textArea.value = savedContent;
              }
            })
            .catch((err) => {
              console.error('Failed to load content:', err);
            });
        })
        .catch((err) => {
          console.error('Failed to open DB:', err);
        });

      let debounceTimeout;
      textArea.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
          saveContent(textArea.value);
        }, 500);
      });
    })();

    document.getElementById('text_area').focus();
  })();

  let example = {};
  example.ui = ui;
  example.globalUi = globalUi;
  example.inputMethod = inputMethod;
  example.settings = settings;
  example.symbolTableUserData = symbolTableUserData;
  example.foreignLanguageUserData = foreignLanguageUserData;

  const keyboard = (() => {
    const that = {};
    that.isLock = false;
    that.isShift = false;
    that.isCtrl = false;

    const Keyboard = window.SimpleKeyboard.default;

    const keyboard = new Keyboard({
      onKeyPress: (button) => onKeyPress(button),
    });

    function onKeyPress(button) {
      console.log('Button pressed', button);
      if (button === '{lock}') {
        that.isLock = !that.isLock;
        that.loadLayout();
        return;
      } else if (button === '{shift}') {
        that.isShift = !that.isShift;
        that.loadLayout();
        return;
      } else if (button === '{ctrl}') {
        that.isCtrl = !that.isCtrl;
        that.loadLayout();
        return;
      }
      const result = inputMethod.controller.handleSimpleKeyboardEvent(
        button,
        that.isShift || that.isLock,
        that.isCtrl,
      );
      const textArea = document.getElementById('text_area');
      textArea.focus();
      if (that.isShift) {
        that.isShift = false;
        that.loadLayout();
      }
      if (that.isCtrl) {
        that.isCtrl = false;
        that.loadLayout();
      }
      if (!result) {
        if (button === '{enter}') {
          ui.commitString('\n');
        } else if (button === '{space}') {
          ui.commitString(' ');
        } else if (button === '{bksp}') {
          ui.backspace();
        }
      }
      // textArea.focus();
    }

    function loadLayout() {
      const { InputTableManager } = window.mctabim;
      const manager = InputTableManager.getInstance();
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

      if (!that.isCtrl) {
        for (const key in names) {
          if (key === '`') {
            continue;
          }
          display[key] = names[key];
        }
      }

      let defaultLayout = [
        '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
        '{tab} q w e r t y u i o p [ ] \\',
        "{lock} a s d f g h j k l ; ' {enter}",
        '{shift} z x c v b n m , . / {shift}',
        '{ctrl} {space}',
      ];
      let shiftLayout = [
        '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
        '{tab} Q W E R T Y U I O P { } |',
        '{lock} A S D F G H J K L : " {enter}',
        '{shift} Z X C V B N M < > ? {shift}',
        '{ctrl} {space}',
      ];
      let layout = that.isShift || that.isLock ? shiftLayout : defaultLayout;

      const buttonTheme = [];
      if (that.isLock) {
        buttonTheme.push({
          class: 'hg-button-active',
          buttons: '{lock}',
        });
      }
      if (that.isShift) {
        buttonTheme.push({
          class: 'hg-button-active',
          buttons: '{shift}',
        });
      }
      if (that.isCtrl) {
        buttonTheme.push({
          class: 'hg-button-active',
          buttons: '{ctrl}',
        });
      }

      keyboard.setOptions({
        display: display,
        layout: {
          default: layout,
        },
        buttonTheme: buttonTheme,
      });
    }

    that.loadLayout = loadLayout;
    loadLayout();
    return that;
  })();

  example.keyboard = keyboard;
  window.example = example;
  return example;
})();
