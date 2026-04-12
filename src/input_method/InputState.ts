import { Candidate, InputTableManager, MenuCandidate, SymbolCategory } from '../data';
import HelperDataInput from './HelperDataInput';
import { Key } from './Key';
import { Settings } from './Settings';

/**
 * Base type for all input-method runtime states.
 *
 * The controller moves between these states as keys are handled, candidates are
 * selected, and text is committed. Concrete subclasses describe the UI data and
 * transition context needed for a specific stage of the input flow.
 */
export abstract class InputState {}

/**
 * Represents the absence of an active composition.
 *
 * This is the default idle state entered after initialization, reset, commit,
 * or cancellation.
 *
 * @param reason - Optional context describing why the controller became empty.
 */
export class EmptyState extends InputState {
  constructor(public reason: string = 'Initial State') {
    super();
  }

  toString(): string {
    return 'EmptyState (reason=' + this.reason + ')';
  }
}

/**
 * Represents a pending text commit.
 *
 * The controller consumes this state by sending {@link commitString} to the UI,
 * applying Chinese conversion settings, and then returning to {@link EmptyState}.
 *
 * @param commitString - The text that should be committed.
 * @param nextKey - Optional key to re-process immediately after the commit.
 */
export class CommittingState extends InputState {
  constructor(readonly commitString: string, readonly nextKey?: Key | undefined) {
    super();
  }
  toString(): string {
    if (this.nextKey === undefined) {
      return `CommittingState(commitString='${this.commitString}')`;
    }
    return `CommittingState(commitString='${this.commitString}', nextKey='${this.nextKey}')`;
  }
}

/**
 * Displays a tooltip without an active composition.
 *
 * @param tooltip - The tooltip message to present in the UI.
 */
export class TooltipOnlyState extends InputState {
  constructor(readonly tooltip: string) {
    super();
  }
  toString(): string {
    return `TooltipOnlyState(tooltip='${this.tooltip}')`;
  }
}

type InputtingStateArgs = {
  radicals: string;
  displayedRadicals: string[];
  selectionKeys: string;
  candidates: Candidate[];
  selectedCandidateIndex?: number;
  exactSelectionKeys?: string;
  tooltip?: string;
  candidateAnnotation?: string;
  useShiftedKeyCap?: boolean;
};

type InputtingStateCopyArgs = {
  selectedCandidateIndex?: number;
};

/**
 * Base state for active composition with visible candidates.
 *
 * The state stores radicals, candidate metadata, and pagination details needed
 * to render the current composition UI.
 *
 * @param args - The inputting-state payload used to derive displayed radicals,
 * candidate paging, and the initial selection.
 */
export class InputtingState extends InputState {
  readonly radicals: string;
  readonly displayedRadicals: string[];
  readonly selectionKeys: string;
  readonly exactSelectionKeys?: string | undefined;
  readonly candidates: Candidate[];
  readonly tooltip?: string | undefined;
  readonly candidateAnnotation?: string | undefined;

  readonly useShiftedKeyCap: boolean | undefined;
  readonly selectedCandidateIndex?: number | undefined;
  readonly candidatesInCurrentPage?: Candidate[];
  readonly selectedCandidateIndexInCurrentPage?: number | undefined;
  readonly candidatePageIndex?: number | undefined;
  readonly candidatePageCount?: number | undefined;

  constructor(args: InputtingStateArgs) {
    super();
    this.radicals = args.radicals;
    this.displayedRadicals = args.displayedRadicals;
    this.selectionKeys = args.selectionKeys;
    this.exactSelectionKeys = args.exactSelectionKeys;
    this.candidates = args.candidates;
    this.selectedCandidateIndex = args.selectedCandidateIndex;
    this.tooltip = args.tooltip;
    this.candidateAnnotation = args.candidateAnnotation;
    this.useShiftedKeyCap = args.useShiftedKeyCap;

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

  protected buildArgs(args: InputtingStateCopyArgs): InputtingStateArgs {
    return {
      radicals: this.radicals,
      displayedRadicals: this.displayedRadicals,
      selectionKeys: this.selectionKeys,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      exactSelectionKeys: this.exactSelectionKeys,
      tooltip: this.tooltip,
      candidateAnnotation: this.candidateAnnotation,
      useShiftedKeyCap: this.useShiftedKeyCap,
    };
  }

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
    return new InputtingState(this.buildArgs(args));
  }
  toString(): string {
    return `InputtingState(radicals='${this.radicals}', candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

/**
 * Default composition state for regular table input.
 */
export class BasicInputtingState extends InputtingState {
  copyWithArgs(args: InputtingStateCopyArgs): BasicInputtingState {
    return new BasicInputtingState(this.buildArgs(args));
  }
  toString(): string {
    return `BasicInputtingState(radicals='${this.radicals}', candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

/**
 * Presents associated phrases after a candidate has been chosen.
 *
 * @param args - Candidate-list configuration for the associated-phrase menu.
 */
export class AssociatedPhrasesState extends InputtingState {
  constructor(args: {
    selectionKeys: string;
    exactSelectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    tooltip?: string | undefined;
    useShiftedKeyCap?: boolean | undefined;
  }) {
    super({
      ...args,
      radicals: '',
      displayedRadicals: [],
      candidateAnnotation: '聯想詞',
    });
  }

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
    return new AssociatedPhrasesState({
      selectionKeys: this.selectionKeys,
      exactSelectionKeys: this.exactSelectionKeys!,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      tooltip: this.tooltip,
      useShiftedKeyCap: this.useShiftedKeyCap,
    });
  }
  toString(): string {
    return `AssociatedPhrasesState(candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

/**
 * Represents the numeric-input helper flow.
 *
 * @param args - Numeric radicals and candidate-list configuration.
 */
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
      ...args,
      displayedRadicals: [`[數字]${args.radicals}`],
      useShiftedKeyCap: true,
    });
  }

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
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

/**
 * Shared base state for symbol candidate flows.
 */
export abstract class BaseSymbolInputtingState extends InputtingState {
  protected get copyArgs() {
    return {
      radicals: this.radicals,
      selectionKeys: this.selectionKeys,
      candidates: this.candidates,
    };
  }
}

/**
 * Symbol-selection state entered from a Ctrl-based shortcut.
 */
export class CtrlSymbolInputtingState extends BaseSymbolInputtingState {
  constructor(args: {
    radicals: string;
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
  }) {
    super({
      ...args,
      displayedRadicals: [
        `[符]${(() => {
          const index = args.selectedCandidateIndex;
          if (args.candidates.length > 0) {
            return args.candidates[index ?? 0].displayText;
          }
          return args.radicals;
        })()}`,
      ],
    });
  }

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
    return new CtrlSymbolInputtingState({
      ...this.copyArgs,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
    });
  }
  toString(): string {
    return `CtrlSymbolInputtingState(radicals='${this.radicals}', candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

/**
 * Symbol-selection state entered from regular symbol input.
 */
export class SymbolInputtingState extends BaseSymbolInputtingState {
  constructor(args: {
    radicals: string;
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
  }) {
    super({
      ...args,
      displayedRadicals: [
        `[符]${(() => {
          const index = args.selectedCandidateIndex;
          if (args.candidates.length > 0) {
            return args.candidates[index ?? 0].displayText;
          }
          return args.radicals;
        })()}`,
      ],
    });
  }

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
    return new SymbolInputtingState({
      ...this.copyArgs,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
    });
  }
  toString(): string {
    return `SymbolInputtingState(radicals='${this.radicals}', candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

/**
 * Displays the contents of a symbol category or submenu.
 *
 * `nodes` may contain terminal symbols or nested {@link SymbolCategory}
 * entries, which are exposed as menu candidates.
 *
 * @param args - Category metadata, navigation context, and candidate settings.
 */
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
      ...args,
      radicals: '',
      // displayedRadicals: args.displayedRadicals,
      // selectionKeys: args.selectionKeys,
      candidates: candidates,
      // selectedCandidateIndex: args.selectedCandidateIndex,
    });
    this.previousState = args.previousState;
    this.nodes = args.nodes;
  }

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
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

/**
 * Menu state for toggling runtime settings.
 *
 * @param args - The previous state, mutable settings object, and selection-key
 * configuration used to build the settings menu.
 */
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
        '使用萬用字元 (字根 + *)',
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
      [
        '使用同音字反查 (字根 + `)',
        args.settings.homophoneLookupEnabled,
        () => {
          this.settings.homophoneLookupEnabled = !this.settings.homophoneLookupEnabled;
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

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
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

/**
 * Top-level menu state for auxiliary commands and helper flows.
 *
 * @param args - Menu settings, selection keys, and callback context.
 */
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

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
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

/**
 * Lets the user choose a reading before showing matching homophone words.
 *
 * @param args - Candidate and navigation context for the reading-selection UI.
 */
export class SelectingHomophoneReadingsState extends InputtingState {
  readonly previousState: InputState;
  constructor(args: {
    radicals: string;
    displayedRadicals: string[];
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    exactSelectionKeys?: string | undefined;
    tooltip?: string | undefined;
    previousState: InputState;
  }) {
    const copy = { ...args, candidateAnnotation: '同音字查詢' };
    super(copy);
    this.previousState = args.previousState;
  }

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
    return new SelectingHomophoneReadingsState({
      ...this.buildArgs(args),
      previousState: this.previousState,
    });
  }

  toString(): string {
    return `SelectingHomophoneReadingsState(candidates=${this.candidates.length})`;
  }
}

/**
 * Lets the user choose a homophone word for a selected reading.
 *
 * @param args - Candidate data plus the selected reading and previous-state
 * context used by the homophone word picker.
 */
export class SelectingHomophoneWordState extends InputtingState {
  readonly previousState: InputState;
  readonly bpmf: string;

  constructor(args: {
    displayedBpmf: string;
    radicals: string;
    displayedRadicals: string[];
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    exactSelectionKeys?: string | undefined;
    tooltip?: string | undefined;
    readonly previousState: InputState;
  }) {
    const copy = { ...args, candidateAnnotation: '同音字查詢:' + args.displayedBpmf };
    super(copy);
    this.previousState = args.previousState;
    this.bpmf = args.displayedBpmf;
  }

  copyWithArgs(args: InputtingStateCopyArgs): InputtingState {
    return new SelectingHomophoneWordState({
      displayedBpmf: this.bpmf,
      ...this.buildArgs(args),
      previousState: this.previousState,
    });
  }

  toString(): string {
    return `SelectingHomophoneWordState(candidates=${this.candidates.length})`;
  }
}
