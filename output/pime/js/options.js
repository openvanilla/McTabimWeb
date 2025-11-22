window.onload = () => {
  const app = (() => {
    const settings = (() => {
      let that = {};

      that.defaults = {
        candidateFontSize: 16,
        selectedInputMethodId: 'checj',
        shiftKeyToToggleAlphabetMode: true,
        inputSettings: {
          chineseConversionEnabled: false,
          associatedPhrasesEnabled: false,
          shiftPunctuationForSymbolsEnabled: true,
          shiftLetterForSymbolsEnabled: true,
          wildcardMatchingEnabled: false,
          clearOnErrors: false,
          beepOnErrors: true,
          reverseRadicalLookupEnabled: false,
        },
      };

      that.settings = that.defaults;
      that.load = (callback) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
          try {
            that.settings = JSON.parse(this.responseText);
            if (that.settings === undefined) {
              that.settings = that.defaults;
              that.save();
            }
            console.log('settings loaded: ' + settings);
            callback();
          } catch {
            that.settings = that.defaults;
            callback();
          }
        };
        xhttp.open('GET', '/config');
        xhttp.send('');
      };
      that.save = () => {
        console.log('saving settings: ' + settings);
        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/config');
        let string = JSON.stringify(settings);
        xhttp.send(string); // debug(JSON.stringify(settings));
      };
      that.applyToUI = () => {
        console.log('Applying settings to UI:', that.settings);
        document.getElementById('shift-punctuation').checked =
          that.settings.inputSettings.shiftPunctuationForSymbolsEnabled;
        document.getElementById('shift-letter').checked =
          that.settings.inputSettings.shiftLetterForSymbolsEnabled;
        document.getElementById('associated-phrases').checked =
          that.settings.inputSettings.associatedPhrasesEnabled;
        document.getElementById('wildcard-matching').checked =
          that.settings.inputSettings.wildcardMatchingEnabled;
        document.getElementById('clear-on-errors').checked =
          that.settings.inputSettings.clearOnErrors;
        document.getElementById('beep-on-errors').checked =
          that.settings.inputSettings.beepOnErrors;
        document.getElementById('reverse-radical-lookup').checked =
          that.settings.inputSettings.reverseRadicalLookupEnabled;
        document.getElementById('shift-toggle-alphabet-mode').checked =
          that.settings.shiftKeyToToggleAlphabetMode;

        const fontSizeInput = document.getElementById('font_size');
        let options = fontSizeInput.getElementsByTagName('option');
        console.log('Setting font size to:', that.settings.candidateFontSize);
        console.log('Options available:', options);
        if (fontSizeInput) {
          for (let option of options) {
            if (+option.value === settings.candidateFontSize) {
              option.selected = 'selected';
              break;
            }
          }
        }
        fontSizeInput.value = that.settings.candidateFontSize + '';
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
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
          try {
            const text = this.responseText;
            document.getElementById('symbols-table').value = text;
          } catch {
            document.getElementById('symbols-table').value = that.defaults;
          }
        };
        xhttp.open('GET', '/symbol_table');
        xhttp.send('');
      };
      that.save = () => {
        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/symbol_table');
        let string = document.getElementById('symbols-table').value;
        xhttp.send(string);
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
        const xhttp = new XMLHttpRequest();
        xhttp.onload = function () {
          try {
            const text = this.responseText;
            document.getElementById('foreign-languages-symbols-table').value = text;
          } catch {
            document.getElementById('foreign-languages-symbols-table').value = that.defaults;
          }
        };
        xhttp.open('GET', '/foreign_languages_symbols_table');
        xhttp.send('');
      };
      that.save = () => {
        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', '/foreign_languages_symbols_table');
        let string = document.getElementById('foreign-languages-symbols-table').value;
        xhttp.send(string);
      };
      return that;
    })();

    const setupBinding = () => {
      document.getElementById('shift-punctuation').onchange = (e) => {
        settings.settings.inputSettings.shiftPunctuationForSymbolsEnabled = e.target.checked;
        settings.save();
      };
      document.getElementById('shift-letter').onchange = (e) => {
        settings.settings.inputSettings.shiftLetterForSymbolsEnabled = e.target.checked;
        settings.save();
      };
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
      document.getElementById('font_size').onchange = (event) => {
        let value = document.getElementById('font_size').value;
        settings.candidateFontSize = +value;
        settings.save();
      };
    };
    return {
      settings,
      symbolsTableSettings,
      foreignLanguagesSymbolsTableSettings,
      setupBinding,
    };
  })();

  app.settings.load(() => {
    app.settings.applyToUI();
  });
  app.symbolsTableSettings.load();
  app.foreignLanguagesSymbolsTableSettings.load();
  app.setupBinding();
};
