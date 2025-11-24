import { Candidate, InputTableManager, MenuCandidate, SymbolCategory } from '../data';
import HelperDataInput from './HelperDataInput';
import { Settings } from './Settings';

export abstract class InputState {}

export class EmptyState extends InputState {
  constructor(public reason: string = 'Initial State') {
    super();
  }

  toString(): string {
    return 'EmptyState (reason=' + this.reason + ')';
  }
}

export class CommittingState extends InputState {
  constructor(readonly commitString: string) {
    super();
  }
  toString(): string {
    return `CommittingState(commitString='${this.commitString}')`;
  }
}

export class TooltipOnlyState extends InputState {
  constructor(readonly tooltip: string) {
    super();
  }
  toString(): string {
    return `TooltipOnlyState(tooltip='${this.tooltip}')`;
  }
}

export class InputtingState extends InputState {
  readonly radicals: string;
  readonly displayedRadicals: string[];
  readonly selectionKeys: string;
  readonly exactSelectionKeys?: string | undefined;
  readonly candidates: Candidate[];
  readonly tooltip?: string | undefined;
  readonly candidateAnnotation?: string | undefined;

  readonly selectedCandidateIndex?: number | undefined;
  readonly candidatesInCurrentPage?: Candidate[];
  readonly selectedCandidateIndexInCurrentPage?: number | undefined;
  readonly candidatePageIndex?: number | undefined;
  readonly candidatePageCount?: number | undefined;

  constructor(args: {
    radicals: string;
    displayedRadicals: string[];
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    exactSelectionKeys?: string | undefined;
    tooltip?: string | undefined;
    readonly candidateAnnotation?: string | undefined;
  }) {
    super();
    this.radicals = args.radicals;
    this.displayedRadicals = args.displayedRadicals;
    this.selectionKeys = args.selectionKeys;
    this.exactSelectionKeys = args.exactSelectionKeys;
    this.candidates = args.candidates;
    this.selectedCandidateIndex = args.selectedCandidateIndex;
    this.tooltip = args.tooltip;
    this.candidateAnnotation = args.candidateAnnotation;

    const candidatesPerPage = Math.max(this.selectionKeys.length, 1);
    if (this.candidates.length > 0) {
      this.selectedCandidateIndex = args.selectedCandidateIndex ?? 0;
      this.candidatePageCount = Math.ceil(this.candidates.length / candidatesPerPage);

      const pageIndex = Math.floor(this.selectedCandidateIndex / candidatesPerPage);
      const startIndex = pageIndex * candidatesPerPage;
      const endIndex = Math.min(startIndex + candidatesPerPage, this.candidates.length);
      this.candidatesInCurrentPage = this.candidates.slice(startIndex, endIndex);
      this.selectedCandidateIndexInCurrentPage = this.selectedCandidateIndex % candidatesPerPage;
      this.candidatePageIndex = pageIndex;
    }
  }

  copyWithArgs(args: { selectedCandidateIndex?: number }): InputtingState {
    return new InputtingState({
      radicals: this.radicals,
      displayedRadicals: this.displayedRadicals,
      selectionKeys: this.selectionKeys,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      // tooltip: this.tooltip,
    });
  }
  toString(): string {
    return `InputtingState(radicals='${this.radicals}', candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

export class BasicInputtingState extends InputtingState {
  copyWithArgs(args: { selectedCandidateIndex?: number }): BasicInputtingState {
    return new BasicInputtingState({
      radicals: this.radicals,
      displayedRadicals: this.displayedRadicals,
      selectionKeys: this.selectionKeys,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      // tooltip: this.tooltip,
      candidateAnnotation: this.candidateAnnotation,
    });
  }
  toString(): string {
    return `BasicInputtingState(radicals='${this.radicals}', candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

export class AssociatedPhrasesState extends InputtingState {
  constructor(args: {
    selectionKeys: string;
    exactSelectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    tooltip?: string | undefined;
    candidateAnnotation?: string | undefined;
  }) {
    super({
      radicals: '',
      displayedRadicals: [],
      selectionKeys: args.selectionKeys,
      exactSelectionKeys: args.exactSelectionKeys,
      candidates: args.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
      tooltip: args.tooltip,
      candidateAnnotation: args.candidateAnnotation,
    });
  }

  copyWithArgs(args: { selectedCandidateIndex?: number | undefined }): InputtingState {
    return new AssociatedPhrasesState({
      selectionKeys: this.selectionKeys,
      exactSelectionKeys: this.exactSelectionKeys!,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      candidateAnnotation: this.candidateAnnotation,
      // tooltip: this.tooltip,
    });
  }
  toString(): string {
    return `AssociatedPhrasesState(candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

export class NumberInputtingState extends InputtingState {
  constructor(args: {
    radicals: string;
    selectionKeys: string;
    exactSelectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    candidateAnnotation?: string | undefined;
  }) {
    super({
      radicals: args.radicals,
      displayedRadicals: [`[數字]${args.radicals}`],
      selectionKeys: args.selectionKeys,
      exactSelectionKeys: args.exactSelectionKeys,
      candidates: args.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
      candidateAnnotation: args.candidateAnnotation,
    });
  }

  copyWithArgs(args: { selectedCandidateIndex?: number | undefined }): InputtingState {
    return new NumberInputtingState({
      radicals: this.radicals,
      selectionKeys: this.selectionKeys,
      candidates: this.candidates,
      exactSelectionKeys: this.exactSelectionKeys!,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      candidateAnnotation: this.candidateAnnotation,
    });
  }
  toString(): string {
    return `NumberInputtingState(radicals='${this.radicals}', candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

export class SymbolInputtingState extends InputtingState {
  constructor(args: {
    radicals: string;
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
  }) {
    super({
      radicals: args.radicals,
      displayedRadicals: [`[符]${args.radicals}`],
      selectionKeys: args.selectionKeys,
      candidates: args.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
    });
  }

  copyWithArgs(args: { selectedCandidateIndex?: number | undefined }): InputtingState {
    return new SymbolInputtingState({
      radicals: this.radicals,
      selectionKeys: this.selectionKeys,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
    });
  }
  toString(): string {
    return `SymbolInputtingState(radicals='${this.radicals}', candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

export class SymbolCategoryState extends InputtingState {
  nodes: (SymbolCategory | string)[];
  previousState: InputState;

  constructor(args: {
    title: string;
    displayedRadicals: string[];
    previousState: InputState;
    nodes: (SymbolCategory | string)[];
    selectionKeys: string;
    selectedCandidateIndex?: number | undefined;
  }) {
    var candidates = args.nodes.map((singleNode) => {
      if (singleNode instanceof SymbolCategory) {
        const name = singleNode.name;
        const newDisplayedRadicals = [args.displayedRadicals.join('') + '/' + name];
        return new MenuCandidate(name, '', () => {
          return new SymbolCategoryState({
            title: name,
            displayedRadicals: newDisplayedRadicals,
            selectionKeys: args.selectionKeys,
            previousState: this,
            nodes: singleNode.nodes,
          });
        });
      } else {
        return new Candidate(singleNode, '');
      }
    });

    super({
      radicals: '',
      displayedRadicals: args.displayedRadicals,
      selectionKeys: args.selectionKeys,
      candidates: candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
    });
    this.previousState = args.previousState;
    this.nodes = args.nodes;
  }

  copyWithArgs(args: { selectedCandidateIndex?: number | undefined }): InputtingState {
    return new SymbolCategoryState({
      title: this.displayedRadicals.join(''),
      displayedRadicals: this.displayedRadicals,
      selectionKeys: this.selectionKeys,
      previousState: this.previousState,
      nodes: this.nodes,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
    });
  }
  toString(): string {
    return `SymbolCategoryState(nodes=${this.nodes.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

export class SettingsState extends InputtingState {
  previousState: InputState;
  settings: Settings;
  onSettingsChanged: ((settings: Settings) => void) | undefined;

  constructor(args: {
    previousState: InputState;
    settings: Settings;
    selectionKeys: string;
    onSettingsChanged?: ((settings: Settings) => void) | undefined;
    readonly selectedCandidateIndex?: number | undefined;
  }) {
    const mapping: [string, boolean, () => void][] = [
      [
        '使用聯想詞',
        args.settings.associatedPhrasesEnabled,
        () => {
          this.settings.associatedPhrasesEnabled = !this.settings.associatedPhrasesEnabled;
        },
      ],
      [
        '使用 Shift + 字母輸入全形符號',
        args.settings.shiftLetterForSymbolsEnabled,
        () => {
          this.settings.shiftLetterForSymbolsEnabled = !this.settings.shiftLetterForSymbolsEnabled;
        },
      ],
      [
        '使用 Shift + 標點符號輸入全形符號',
        args.settings.shiftPunctuationForSymbolsEnabled,
        () => {
          this.settings.shiftPunctuationForSymbolsEnabled =
            !this.settings.shiftPunctuationForSymbolsEnabled;
        },
      ],

      [
        '組字錯誤時清除字根',
        args.settings.clearOnErrors,
        () => {
          this.settings.clearOnErrors = !this.settings.clearOnErrors;
        },
      ],
      [
        '錯誤時發出提示音',
        args.settings.beepOnErrors,
        () => {
          this.settings.beepOnErrors = !this.settings.beepOnErrors;
        },
      ],
      [
        '使用萬用字元 (*)',
        args.settings.wildcardMatchingEnabled,
        () => {
          this.settings.wildcardMatchingEnabled = !this.settings.wildcardMatchingEnabled;
        },
      ],
      [
        '使用字根反查',
        args.settings.reverseRadicalLookupEnabled,
        () => {
          this.settings.reverseRadicalLookupEnabled = !this.settings.reverseRadicalLookupEnabled;
        },
      ],
    ];
    const candidates = mapping.map((item) => {
      const name = item[0];
      const status = item[1] ? '■' : '□';
      const joined = `${status} ${name}`;
      return new MenuCandidate(joined, '', () => {
        item[2]();
        this.onSettingsChanged?.(this.settings);
        return new SettingsState({
          previousState: this.previousState,
          settings: this.settings,
          selectionKeys: args.selectionKeys,
          onSettingsChanged: this.onSettingsChanged,
          selectedCandidateIndex: mapping.indexOf(item),
        });
      }); // Toggle the setting
    });

    super({
      radicals: '',
      displayedRadicals: ['功能開關'],
      selectionKeys: args.selectionKeys,
      candidates: candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
    });
    this.previousState = args.previousState;
    this.settings = args.settings;
    this.onSettingsChanged = args.onSettingsChanged;
  }

  copyWithArgs(args: { selectedCandidateIndex?: number }): InputtingState {
    return new SettingsState({
      previousState: this.previousState,
      settings: this.settings,
      selectionKeys: this.selectionKeys,
      onSettingsChanged: this.onSettingsChanged,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
    });
  }
  toString(): string {
    return `SettingsState(selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

export class MenuState extends InputtingState {
  settings: Settings;
  onSettingsChanged: ((settings: Settings) => void) | undefined;

  constructor(args: {
    settings: Settings;
    selectionKeys: string;
    onSettingsChanged: ((settings: Settings) => void) | undefined;
    selectedCandidateIndex?: number | undefined;
  }) {
    const candidates = [];

    var title = args.settings.chineseConversionEnabled ? '简体中文' : '繁體中文';

    candidates.push(
      new MenuCandidate(title, '', () => {
        this.settings.chineseConversionEnabled = !this.settings.chineseConversionEnabled;
        this.onSettingsChanged?.(this.settings);
        return new MenuState({
          settings: this.settings,
          selectionKeys: args.selectionKeys,
          onSettingsChanged: this.onSettingsChanged,
          selectedCandidateIndex: 0,
        });
      }),
    );

    candidates.push(
      new MenuCandidate('功能開關', '', () => {
        return new SettingsState({
          previousState: this,
          settings: args.settings,
          onSettingsChanged: args.onSettingsChanged,
          selectionKeys: args.selectionKeys,
        });
      }),
    );

    const customSymbolTable = InputTableManager.getInstance().customSymbolTable;
    if (customSymbolTable.tables.length > 0) {
      candidates.push(
        new MenuCandidate('特殊符號', '', () => {
          return new SymbolCategoryState({
            title: '特殊符號',
            displayedRadicals: ['特殊符號'],
            selectionKeys: args.selectionKeys,
            previousState: this,
            nodes: customSymbolTable.tables,
          });
        }),
      );
    }

    candidates.push(
      new MenuCandidate('注音符號', '', () => {
        return new SymbolCategoryState({
          title: '注音符號',
          displayedRadicals: ['注音符號'],
          selectionKeys: args.selectionKeys,
          previousState: this,
          nodes: InputTableManager.getInstance().bopomofoSymbols,
        });
      }),
    );

    const foreignLanguage = InputTableManager.getInstance().foreignLanguage;
    if (foreignLanguage.tables.length > 0) {
      candidates.push(
        new MenuCandidate('外語符號', '', () => {
          return new SymbolCategoryState({
            title: '外語符號',
            displayedRadicals: ['外語符號'],
            selectionKeys: args.selectionKeys,
            previousState: this,
            nodes: foreignLanguage.tables,
          });
        }),
      );
    }

    candidates.push(
      new MenuCandidate('表情符號', '', () => {
        return new SymbolCategoryState({
          title: '表情符號',
          displayedRadicals: ['表情符號'],
          selectionKeys: args.selectionKeys,
          previousState: this,
          nodes: InputTableManager.getInstance().emojiTable.tables,
        });
      }),
    );

    candidates.push(
      new MenuCandidate('數字輸入', '', () => {
        return new NumberInputtingState({
          radicals: '',
          selectionKeys: '123456789',
          exactSelectionKeys: '!@#$%^&*(',
          candidates: [],
          candidateAnnotation: '(Shift + 數字按鍵)',
        });
      }),
    );

    candidates.push(
      new MenuCandidate('日期與時間', '', () => {
        const candidates = HelperDataInput.fillDateEntries();
        return new SymbolCategoryState({
          title: '日期與時間',
          displayedRadicals: ['日期與時間'],
          selectionKeys: args.selectionKeys,
          previousState: this,
          nodes: candidates,
        });
      }),
    );

    // HelperDataInput.test;

    super({
      radicals: '',
      displayedRadicals: ['主選單'],
      selectionKeys: args.selectionKeys,
      candidates: candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
    });
    this.settings = args.settings;
    this.onSettingsChanged = args.onSettingsChanged;
  }

  copyWithArgs(args: { selectedCandidateIndex?: number }): InputtingState {
    return new MenuState({
      settings: this.settings,
      selectionKeys: this.selectionKeys,
      onSettingsChanged: this.onSettingsChanged,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
    });
  }
  toString(): string {
    return `MenuState(selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}
