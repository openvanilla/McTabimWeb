import { Candidate, InputTableManager, MenuCandidate, SymbolCategory } from '../data';
import HelperDataInput from './HelperDataInput';
import { Settings } from './Settings';

/**
 * The abstract base class for all input states.
 *
 * This class provides a common interface for the various states that the input
 * method can be in, such as "empty", "inputting", or "committing". Each state
 * represents a different stage in the user's interaction with the input method.
 *
 * The input controller (`InputController`) manages the transitions between these
 * states in response to user input. Each state class is responsible for
 * handling a specific set of user actions and for determining the next state.
 */
export abstract class InputState {}

/**
 * Represents the state where there is no active input.
 *
 * This is the default state of the input method, and it is returned to after an
 * input has been committed or cancelled. In this state, the input method is
 * ready to accept a new input from the user.
 *
 * @param {string} reason - An optional description of why the empty state was
 *     entered. This can be useful for debugging.
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
 * Represents the state where a string is being committed.
 *
 * This state is entered after the user has selected a candidate from the list
 * of suggestions. The input method will then commit the selected string to the
 * text field and return to the `EmptyState`.
 *
 * @param {string} commitString - The string to be committed.
 */
export class CommittingState extends InputState {
  constructor(readonly commitString: string) {
    super();
  }
  toString(): string {
    return `CommittingState(commitString='${this.commitString}')`;
  }
}

/**
 * A state that only displays a tooltip.
 *
 * This state is used to show a temporary message to the user, such as an error
 * message or a hint. The input method will remain in this state until the user
t
 * akes some action, at which point it will transition to another state.
 *
 * @param {string} tooltip - The message to be displayed in the tooltip.
 */
export class TooltipOnlyState extends InputState {
  constructor(readonly tooltip: string) {
    super();
  }
  toString(): string {
    return `TooltipOnlyState(tooltip='${this.tooltip}')`;
  }
}

/**
 * Represents the state where the user is actively inputting characters.
 *
 * This is the main state of the input method, and it is where most of the user's
 * interaction takes place. In this state, the user can type characters, select
 * candidates from a list of suggestions, and perform other actions.
 *
 * @param {string} radicals - The current input radicals.
 * @param {string[]} displayedRadicals - The radicals as they are displayed to the
 *     user. This may be different from the actual radicals, for example if the
 *     user is using a phonetic input method.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {Candidate[]} candidates - The list of suggested candidates.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
 * @param {string} [exactSelectionKeys] - The exact keys that are used to
 *     select candidates. This is used for input methods that have a fixed set
 *     of selection keys.
 * @param {string} [tooltip] - A tooltip to be displayed to the user.
 * @param {string} [candidateAnnotation] - An annotation to be displayed next to
 *     the candidates.
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

  constructor(args: {
    radicals: string;
    displayedRadicals: string[];
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    exactSelectionKeys?: string | undefined;
    tooltip?: string | undefined;
    readonly candidateAnnotation?: string | undefined;
    readonly useShiftedKeyCap?: boolean | undefined;
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

/**
 * A basic inputting state that handles character input and candidate selection.
 *
 * This is the default inputting state, and it is used for most input methods.
 * It provides basic functionality for handling user input, such as adding and
 * removing characters, selecting candidates, and navigating through the
 * candidate list.
 */
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

/**
 * A state for selecting associated phrases.
 *
 * This state is entered after the user has selected a candidate, and it allows
 * them to select an associated phrase from a list of suggestions.
 *
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {string} exactSelectionKeys - The exact keys that are used to select
 *     candidates.
 * @param {Candidate[]} candidates - The list of suggested candidates.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
 * @param {string} [tooltip] - A tooltip to be displayed to the user.
 * @param {string} [candidateAnnotation] - An annotation to be displayed next to
 *     the candidates.
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

  copyWithArgs(args: { selectedCandidateIndex?: number | undefined }): InputtingState {
    return new AssociatedPhrasesState({
      selectionKeys: this.selectionKeys,
      exactSelectionKeys: this.exactSelectionKeys!,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      useShiftedKeyCap: this.useShiftedKeyCap,
    });
  }
  toString(): string {
    return `AssociatedPhrasesState(candidates=${this.candidates.length}, selectedCandidateIndex=${this.selectedCandidateIndex})`;
  }
}

/**
 * A state for inputting numbers.
 *
 * This state is used to handle numeric input, and it provides a list of
 * suggestions for different number formats, such as full-width and half-width
 * numbers, as well as Chinese numerals.
 *
 * @param {string} radicals - The current input radicals.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {string} exactSelectionKeys - The exact keys that are used to select
 *     candidates.
 * @param {Candidate[]} candidates - The list of suggested candidates.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
 * @param {string} [candidateAnnotation] - An annotation to be displayed next to
 *     the candidates.
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

/**
 * A state for inputting symbols.
 *
 * This state is used to handle symbol input, and it provides a list of
 * suggestions for different symbols, such as punctuation marks, emojis, and
 * other special characters.
 *
 * @param {string} radicals - The current input radicals.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {Candidate[]} candidates - The list of suggested candidates.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
 */
export class CtrlSymbolInputtingState extends InputtingState {
  constructor(args: {
    radicals: string;
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
  }) {
    super({
      ...args,
      displayedRadicals: [`[符]${args.candidates[0].displayText}`],
    });
  }

  copyWithArgs(args: { selectedCandidateIndex?: number | undefined }): InputtingState {
    return new CtrlSymbolInputtingState({
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

/**
 * A state for inputting symbols.
 *
 * This state is used to handle symbol input, and it provides a list of
 * suggestions for different symbols, such as punctuation marks, emojis, and
 * other special characters.
 *
 * @param {string} radicals - The current input radicals.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {Candidate[]} candidates - The list of suggested candidates.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
 */
export class SymbolInputtingState extends InputtingState {
  constructor(args: {
    radicals: string;
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
  }) {
    super({
      ...args,
      displayedRadicals: [`[符]${args.radicals}`],
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

/**
 * A state for selecting a symbol from a category.
 *
 * This state is used to display a list of symbols from a specific category,
 * such as "emojis" or "punctuation". The user can then select a symbol from
 * the list to be inserted into the text field.
 *
 * @param {string} title - The title of the symbol category.
 * @param {string[]} displayedRadicals - The radicals as they are displayed to the
 *     user.
 * @param {InputState} previousState - The previous state of the input method.
 * @param {(SymbolCategory | string)[]} nodes - The list of symbols in the
 *     category.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
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

/**
 * A state for managing the input method's settings.
 *
 * This state is used to display a list of settings that the user can modify,
 * such as the input method's language, the layout of the keyboard, and other
 * preferences.
 *
 * @param {InputState} previousState - The previous state of the input method.
 * @param {Settings} settings - The current settings of the input method.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {function} [onSettingsChanged] - A callback function that is called
 *     when the settings are changed.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
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

/**
 * A state that displays a menu of options.
 *
 * This state is used to show a list of commands or options to the user, such as
 * "Settings", "Help", or "About". The user can then select an option from the
 * list to be executed.
 *
 * @param {Settings} settings - The current settings of the input method.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {function} onSettingsChanged - A callback function that is called when
 *     the settings are changed.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
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

/**
 * A state for selecting the reading of a homophone.
 *
 * This state is entered when the user has entered a word that has multiple
 * possible readings. It allows the user to select the correct reading from a
 * list of suggestions.
 *
 * @param {string} radicals - The current input radicals.
 * @param {string[]} displayedRadicals - The radicals as they are displayed to the
 *     user.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {Candidate[]} candidates - The list of suggested candidates.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
 * @param {string} [exactSelectionKeys] - The exact keys that are used to
 *     select candidates.
 * @param {string} [tooltip] - A tooltip to be displayed to the user.
 * @param {InputState} previousState - The previous state of the input method.
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

  copyWithArgs(args: { selectedCandidateIndex?: number }): InputtingState {
    return new SelectingHomophoneReadingsState({
      radicals: this.radicals,
      displayedRadicals: this.displayedRadicals,
      selectionKeys: this.selectionKeys,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      exactSelectionKeys: this.exactSelectionKeys,
      tooltip: this.tooltip,
      previousState: this.previousState,
    });
  }

  toString(): string {
    return `SelectingHomophoneReadingsState >>` + this.candidates;
  }
}

/**
 * A state for selecting a homophone word.
 *
 * This state is entered after the user has selected a reading for a homophone.
 * It allows the user to select the correct word from a list of suggestions.
 *
 * @param {string} radicals - The current input radicals.
 * @param {string[]} displayedRadicals - The radicals as they are displayed to the
 *     user.
 * @param {string} selectionKeys - The keys that are used to select candidates.
 * @param {Candidate[]} candidates - The list of suggested candidates.
 * @param {number} [selectedCandidateIndex] - The index of the currently
 *     selected candidate.
 * @param {string} [exactSelectionKeys] - The exact keys that are used to
 *     select candidates.
 * @param {string} [tooltip] - A tooltip to be displayed to the user.
 * @param {InputState} previousState - The previous state of the input method.
 */
export class SelectingHomophoneWordState extends InputtingState {
  readonly previousState: InputState;
  constructor(args: {
    radicals: string;
    displayedRadicals: string[];
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    exactSelectionKeys?: string | undefined;
    tooltip?: string | undefined;
    readonly previousState: InputState;
  }) {
    const copy = { ...args, candidateAnnotation: '同音字查詢' };
    super(copy);
    this.previousState = args.previousState;
  }

  copyWithArgs(args: { selectedCandidateIndex?: number }): InputtingState {
    return new SelectingHomophoneWordState({
      radicals: this.radicals,
      displayedRadicals: this.displayedRadicals,
      selectionKeys: this.selectionKeys,
      candidates: this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      exactSelectionKeys: this.exactSelectionKeys,
      tooltip: this.tooltip,
      previousState: this.previousState,
    });
  }

  toString(): string {
    return `SelectingHomophoneWordState >>` + this.candidates;
  }
}
