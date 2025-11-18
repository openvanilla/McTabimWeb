(function () {
  function toggle_feature(id) {
    let features = ['feature_input', 'feature_user_data'];
    for (let feature of features) {
      document.getElementById(feature).style.display = 'none';
    }
    document.getElementById(id).style.display = 'block';
    if (id === 'feature_input') {
      document.getElementById('text_area').focus();
      document.title = '輸入功能';
    } else if (id === 'feature_user_data') {
      document.title = '自訂符號表管理';
    }
  }

  const ui = (function () {
    let that = {};
    that.reset = () => {
      document.getElementById('function').style.visibility = 'hidden';
      document.getElementById('candidates').style.visibility = 'hidden';
      let renderText = '';
      renderText += "<span class='cursor'>|</span>";
      document.getElementById('composing_buffer').innerHTML = renderText;
      document.getElementById('candidates').innerHTML = '';
      composingBuffer = '';
    };

    that.commitString = (string) => {
      var selectionStart = document.getElementById('text_area').selectionStart;
      var selectionEnd = document.getElementById('text_area').selectionEnd;
      var text = document.getElementById('text_area').value;
      var head = text.substring(0, selectionStart);
      var tail = text.substring(selectionEnd);
      document.getElementById('text_area').value = head + string + tail;
      let start = selectionStart + string.length;
      document.getElementById('text_area').setSelectionRange(start, start);
      composingBuffer = '';
    };

    that.update = (string) => {
      let state = JSON.parse(string);
      {
        let buffer = state.composingBuffer;
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
        s += '<tr class="page_info"> ';
        s += '<td colspan="2">';
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

  let settings = (() => {
    let that = {};
    that.defaultSettings = {
      selectedInputMethodId: '',
      inputSettings: {
        chineseConversionEnabled: false,
        associatedPhrasesEnabled: true,
        shiftPunctuationForSymbolsEnabled: true,
        shiftLetterForSymbolsEnabled: true,
        wildcardMatchingEnabled: false,
      },
    };
    that.settings = {
      selectedInputMethodId: '',
      inputSettings: {
        chineseConversionEnabled: false,
        associatedPhrasesEnabled: true,
        shiftPunctuationForSymbolsEnabled: true,
        shiftLetterForSymbolsEnabled: true,
        wildcardMatchingEnabled: false,
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
      const associatedPhrasesEnabled = that.settings.inputSettings.associatedPhrasesEnabled;
      document.getElementById('associated_phrases_enabled').checked = associatedPhrasesEnabled;

      const chineseConversionEnabled = that.settings.inputSettings.chineseConversionEnabled;
      if (chineseConversionEnabled) {
        document.getElementById('chinese_convert_simp').checked = true;
      } else {
        document.getElementById('chinese_convert_trad').checked = true;
      }

      const shiftPunctuationForSymbolsEnabled =
        that.settings.inputSettings.shiftPunctuationForSymbolsEnabled;
      document.getElementById('shift_punctuation_for_symbols_enabled').checked =
        shiftPunctuationForSymbolsEnabled;

      const shiftLetterForSymbolsEnabled = that.settings.inputSettings.shiftLetterForSymbolsEnabled;
      document.getElementById('shift_letter_for_symbols_enabled').checked =
        shiftLetterForSymbolsEnabled;

      const wildcardMatchingEnabled = that.settings.inputSettings.wildcardMatchingEnabled;
      document.getElementById('wildcard_matching_enabled').checked = wildcardMatchingEnabled;
    };
    return that;
  })();

  const inputMethod = (() => {
    const { InputController, InputTableManager } = window.mctabim;
    let that = {};
    that.controller = new InputController(ui);
    that.controller.onSettingChanged = (newSettings) => {
      console.log('onSettingChanged');
      settings.settings.inputSettings = newSettings;
      settings.save();
      settings.applyToUi();
    };
    that.tableManager = InputTableManager.getInstance();
    that.populateInputMethodTableSelect = () => {
      const tables = that.tableManager.getTables();
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
        document.getElementById('text_area').focus();
      });
    };
    that.populateInputMethodTableSelect();
    return that;
  })();

  (() => {
    const textarea = document.getElementById('text_area');
    textarea.addEventListener('keydown', (event) => {
      if (event.metaKey || event.altKey || event.ctrlKey) {
        inputMethod.controller.reset();
        return;
      }

      let accepted = inputMethod.controller.handleKeyboardEvent(event);
      if (accepted) {
        event.preventDefault();
      }
    });

    textarea.addEventListener('blur', () => {
      inputMethod.controller.reset();
      ui.reset();
    });

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

    window.addEventListener('hashchange', () => {
      let hash = window.location.hash;
      toggle_feature(hash.substring(1));
    });

    settings.load();
    settings.applyToUi();
    settings.applyToInputMethod();

    document.getElementById('loading').innerText = '載入完畢！';
    setTimeout(function () {
      document.getElementById('loading').style.display = 'none';
    }, 2000);

    document.getElementById('text_area').focus();
  })();
})();
