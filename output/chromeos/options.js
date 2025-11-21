window.onload = () => {
  const settings = (() => {
    let that = {};
    that.defaults = {
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
    that.settings = that.defaults;
    that.load = () => {
      chrome.storage.sync.get('settings', (value) => {
        if (value.settings) {
          that.settings = value.settings;
        } else {
          that.settings = that.defaults;
        }
      });
    };
    that.save = () => {
      chrome.storage.sync.set({ settings: that.settings }, () => {
        // debug(JSON.stringify(settings));
      });
    };
    that.applyToUI = () => {
      document.getElementById('associated-phrases').checked =
        that.settings.inputSettings.associatedPhrasesEnabled;
      document.getElementById('wildcard-matching').checked =
        that.settings.inputSettings.wildcardMatchingEnabled;
      document.getElementById('clear-on-errors').checked =
        that.settings.inputSettings.clearOnErrors;
      document.getElementById('beep-on-errors').checked = that.settings.inputSettings.beepOnErrors;
      document.getElementById('reverse-radical-lookup').checked =
        that.settings.inputSettings.reverseRadicalLookupEnabled;
      document.getElementById('shift-toggle-alphabet-mode').checked =
        that.settings.shiftKeyToToggleAlphabetMode;
      document.getElementById('use-notification').checked = that.settings.useNotification;
    };
    return that;
  })();

  const symbolsTableSettings = (() => {
    let that = {};
    that.defaults = `
…
※
常用符號=，、。．？！；︰‧‥﹐﹒˙·“”〝〞‵′〃～＄％＠＆＃＊
左右括號=（）「」〔〕｛｝〈〉『』《》【】﹙﹚﹝﹞﹛﹜
上下括號=︵︶﹁﹂︹︺︷︸︿﹀﹃﹄︽︾︻︼
希臘字母=αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ
數學符號=＋－＝≠≒√＜＞﹤﹥≦≧∩∪ˇ⊥∠∟⊿㏒㏑∫∮∵∴╳﹢
特殊圖形=↑↓←→↖↗↙↘㊣◎○●⊕⊙○●△▲☆★◇◆□■▽▼§￥〒￠￡※♀♂
Unicode=♨☀☁☂☃♠♥♣♦♩♪♫♬☺☻
單線框=├─┼┴┬┤┌┐╞═╪╡│▕└┘╭╮╰╯
雙線框=╔╦╗╠═╬╣╓╥╖╒╤╕║╚╩╝╟╫╢╙╨╜╞╪╡╘╧╛
填色方塊=＿ˍ▁▂▃▄▅▆▇█▏▎▍▌▋▊▉◢◣◥◤
線段=﹣﹦≡｜∣∥–︱—︳╴¯￣﹉﹊﹍﹎﹋﹌﹏︴∕﹨╱╲／＼`;
    that.load = () => {
      chrome.storage.sync.get('symbolsTable', (value) => {
        if (value.symbolsTable) {
          document.getElementById('symbols-table').value = value.symbolsTable;
        } else {
          document.getElementById('symbols-table').value = '';
        }
      });
    };
    that.save = () => {
      chrome.storage.sync.set(
        { symbolsTable: document.getElementById('symbols-table').value },
        () => {
          // debug(JSON.stringify(settings));
        },
      );
    };
    return that;
  })();

  const foreignLanguagesSymbolsTableSettings = (() => {
    let that = {};
    that.defaults = `
日語(平假名)=あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん
日語(平濁音)=がぎぐげござじずぜぞだぢづでどばぱびぴぶぷべぺぼぽ
日語(平小字)=ぁぃぅぇぉっゃゅょゎ
日語(片假名)=アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン
日語(片濁音)=ガギグゲゴザジズゼゾダヂヅデドバパビピブプベペボポヴ
日語(片小字)=ァィゥェォヵヶッャュョヮ
日語(片半角)=ｧｨｩｪｫｯｬｭｮｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦ`.trim();
    that.load = () => {
      chrome.storage.sync.get('foreignLanguagesSymbolsTable', (value) => {
        if (value.foreignLanguagesSymbolsTable) {
          document.getElementById('foreign-languages-symbols-table').value =
            value.foreignLanguagesSymbolsTable;
        } else {
          document.getElementById('foreign-languages-symbols-table').value = that.defaults;
        }
      });
    };
    that.save = () => {
      chrome.storage.sync.set(
        {
          foreignLanguagesSymbolsTable: document.getElementById('foreign-languages-symbols-table')
            .value,
        },
        () => {
          // debug(JSON.stringify(settings));
        },
      );
    };
    return that;
  })();

  const setupBinding = () => {
    document.getElementById('associated-phrases').onchange = (e) => {
      settings.settings.inputSettings.associatedPhrasesEnabled = e.target.checked;
      settings.save();
    };
    document.getElementById('wildcard-matching').onchange = (e) => {
      settings.settings.inputSettings.wildcardMatchingEnabled = e.target.checked;
      settings.save();
    };
    document.getElementById('clear-on-errors').onchange = (e) => {
      settings.settings.inputSettings.clearOnErrors = e.target.checked;
      settings.save();
    };
    document.getElementById('beep-on-errors').onchange = (e) => {
      settings.settings.inputSettings.beepOnErrors = e.target.checked;
      settings.save();
    };
    document.getElementById('reverse-radical-lookup').onchange = (e) => {
      settings.settings.inputSettings.reverseRadicalLookupEnabled = e.target.checked;
      settings.save();
    };
    document.getElementById('save-symbols-table').onclick = () => {
      symbolsTableSettings.save();
    };
    document.getElementById('load-symbols-table').onclick = () => {
      symbolsTableSettings.load();
    };
    document.getElementById('save-foreign-languages-symbols-table').onclick = () => {
      foreignLanguagesSymbolsTableSettings.save();
    };
    document.getElementById('load-foreign-languages-symbols-table').onclick = () => {
      foreignLanguagesSymbolsTableSettings.load();
    };
    document.getElementById('shift-toggle-alphabet-mode').onchange = (e) => {
      settings.settings.shiftKeyToToggleAlphabetMode = e.target.checked;
      settings.save();
    };
    document.getElementById('use-notification').onchange = (e) => {
      settings.settings.useNotification = e.target.checked;
      settings.save();
    };
  };

  const setUpLocalization = () => {
    //    document.getElementById("title").innerText =
    //     chrome.i18n.getMessage("optionsTitle");
    document.getElementById('main-title').innerText = chrome.i18n.getMessage('mainTitle');
    document.getElementById('input-options-title').innerText =
      chrome.i18n.getMessage('inputOptionsTitle');
    document.getElementById('label-shift-punctuation').innerText =
      chrome.i18n.getMessage('labelShiftPunctuation');
    document.getElementById('shift-punctuation-description').innerText = chrome.i18n.getMessage(
      'shiftPunctuationDescription',
    );
    document.getElementById('label-shift-letter').innerText =
      chrome.i18n.getMessage('labelShiftLetter');
    document.getElementById('shift-letter-description').innerText =
      chrome.i18n.getMessage('shiftLetterDescription');
    document.getElementById('label-associated-phrases').innerText =
      chrome.i18n.getMessage('labelAssociatedPhrases');
    document.getElementById('associated-phrases-description').innerText = chrome.i18n.getMessage(
      'associatedPhrasesDescription',
    );
    document.getElementById('label-wildcard-matching').innerText =
      chrome.i18n.getMessage('labelWildcardMatching');
    document.getElementById('wildcard-matching-description').innerText = chrome.i18n.getMessage(
      'wildcardMatchingDescription',
    );
    document.getElementById('label-clear-on-errors').innerText =
      chrome.i18n.getMessage('labelClearOnErrors');
    document.getElementById('clear-on-errors-description').innerText = chrome.i18n.getMessage(
      'clearOnErrorsDescription',
    );
    document.getElementById('label-beep-on-errors').innerText =
      chrome.i18n.getMessage('labelBeepOnErrors');
    document.getElementById('beep-on-errors-description').innerText =
      chrome.i18n.getMessage('beepOnErrorsDescription');
    document.getElementById('label-reverse-radical-lookup').innerText = chrome.i18n.getMessage(
      'labelReverseRadicalLookup',
    );
    document.getElementById('reverse-radical-lookup-description').innerText =
      chrome.i18n.getMessage('reverseRadicalLookupDescription');
    document.getElementById('label-shift-toggle-alphabet-mode').innerText = chrome.i18n.getMessage(
      'labelShiftToggleAlphabetMode',
    );

    document.getElementById('label-shift-toggle-alphabet-mode').innerText =
      chrome.i18n.getMessage('shiftToggleAlphabetMode');
    document.getElementById('shift-toggle-alphabet-mode-description').innerText =
      chrome.i18n.getMessage('shiftToggleAlphabetModeDescription');
    document.getElementById('label-use-notification').innerText =
      chrome.i18n.getMessage('useNotification');
    document.getElementById('use-notification-description').innerText = chrome.i18n.getMessage(
      'useNotificationDescription',
    );

    document.getElementById('symbols-table-title').innerText =
      chrome.i18n.getMessage('symbolsTableTitle');
    document.getElementById('load-symbols-table').innerText =
      chrome.i18n.getMessage('loadSymbolsTable');
    document.getElementById('save-symbols-table').innerText =
      chrome.i18n.getMessage('saveSymbolsTable');

    document.getElementById('foreign-languages-symbols-table').innerText = chrome.i18n.getMessage(
      'foreignLanguagesSymbolsTableTitle',
    );
    document.getElementById('load-foreign-languages-symbols-table').innerText =
      chrome.i18n.getMessage('loadForeignLanguagesSymbolsTable');
    document.getElementById('save-foreign-languages-symbols-table').innerText =
      chrome.i18n.getMessage('saveForeignLanguagesSymbolsTable');
  };

  settings.load();
  settings.applyToUI();
  symbolsTableSettings.load();
  foreignLanguagesSymbolsTableSettings.load();
  setupBinding();
  setUpLocalization();
};
