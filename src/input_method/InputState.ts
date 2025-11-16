import { Candidate } from '../data';
import { MenuCandidate } from '../data/Candidate';
import { EmojiCategory } from '../data/Emoji';
import { Settings } from './Settings';

export abstract class InputState {}

export class EmptyState extends InputState {}

export class CommittingState extends InputState {
  readonly commitString: string;
  constructor(commitString: string) {
    super();
    this.commitString = commitString;
  }
}

export class InputtingState extends InputState {
  readonly radicals: string;
  readonly displayedRadicals: string;
  readonly selectionKeys: string;
  readonly candidates: Candidate[];

  readonly selectedCandidateIndex?: number | undefined;
  readonly candidatesInCurrentPage?: Candidate[];
  readonly selectedCandidateIndexInCurrentPage?: number | undefined;
  readonly candidatePageIndex?: number | undefined;
  readonly candidatePageCount?: number | undefined;

  constructor(args: {
    radicals: string;
    displayedRadicals: string;
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
  }) {
    super();
    this.radicals = args.radicals;
    this.displayedRadicals = args.displayedRadicals;
    this.selectionKeys = args.selectionKeys;
    this.candidates = args.candidates;
    this.selectedCandidateIndex = args.selectedCandidateIndex;

    let candidatesPerPage = Math.max(this.selectionKeys.length, 1);
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

  copyWithArgs(args: {
    radicals?: string;
    displayedRadicals?: string;
    selectionKeys?: string;
    candidates?: Candidate[];
    selectedCandidateIndex?: number;
  }): InputtingState {
    return new InputtingState({
      radicals: args.radicals ?? this.radicals,
      displayedRadicals: args.displayedRadicals ?? this.displayedRadicals,
      selectionKeys: args.selectionKeys ?? this.selectionKeys,
      candidates: args.candidates ?? this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
    });
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
      displayedRadicals: `[符]${args.radicals}`,
      selectionKeys: args.selectionKeys,
      candidates: args.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
    });
  }

  copyWithArgs(args: {
    radicals: string | undefined;
    displayedRadicals: string | undefined;
    selectionKeys: string | undefined;
    candidates: Candidate[] | undefined;
    selectedCandidateIndex?: number | undefined;
  }): InputtingState {
    return new SymbolInputtingState({
      radicals: args.radicals ?? this.radicals,
      selectionKeys: args.selectionKeys ?? this.selectionKeys,
      candidates: args.candidates ?? this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
    });
  }
}

export class EmojiInputtingState extends InputtingState {
  previousState: InputState;

  constructor(args: {
    categoryName: string;
    selectionKeys: string;
    candidates: Candidate[];
    selectedCandidateIndex?: number | undefined;
    previousState: InputState;
  }) {
    super({
      radicals: '',
      displayedRadicals: args.categoryName,
      selectionKeys: args.selectionKeys,
      candidates: args.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
    });
    this.previousState = args.previousState;
  }

  copyWithArgs(args: {
    categoryName?: string;
    selectionKeys?: string;
    candidates?: Candidate[];
    selectedCandidateIndex?: number | undefined;
  }): InputtingState {
    return new EmojiInputtingState({
      categoryName: args.categoryName ?? this.displayedRadicals,
      selectionKeys: args.selectionKeys ?? this.selectionKeys,
      candidates: args.candidates ?? this.candidates,
      selectedCandidateIndex: args.selectedCandidateIndex ?? this.selectedCandidateIndex,
      previousState: this.previousState,
    });
  }
}

export class EmojiMenuState extends InputtingState {
  nodes: EmojiCategory[];
  previousState: InputState;

  constructor(args: {
    title: string;
    displayedRadicals: string;
    previousState: InputState;
    nodes: EmojiCategory[];
    selectionKeys: string;
  }) {
    var candidates = args.nodes.map((singleNode) => {
      const name = singleNode.name;
      const newDisplayedRadicals = args.displayedRadicals + '/' + name;
      const subNodes = singleNode.nodes;

      return new MenuCandidate(name, '', () => {
        let nextState = new EmptyState();
        const first = subNodes[0];
        if (first instanceof EmojiCategory) {
          nextState = new EmojiMenuState({
            title: name,
            displayedRadicals: newDisplayedRadicals,
            selectionKeys: args.selectionKeys,
            previousState: this,
            nodes: subNodes as EmojiCategory[],
          });
        } else if (typeof first === 'string') {
          nextState = new EmojiInputtingState({
            categoryName: newDisplayedRadicals,
            selectionKeys: args.selectionKeys,
            candidates: subNodes.map((emoji) => new Candidate(emoji as string, '')),
            previousState: this,
          });
        }
        return nextState;
      });
    });

    super({
      radicals: '',
      displayedRadicals: args.displayedRadicals,
      selectionKeys: args.selectionKeys,
      candidates: candidates,
    });
    this.previousState = args.previousState;
    this.nodes = args.nodes;
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
          this.settings.associatedPhrasesEnabled = !args.settings.associatedPhrasesEnabled;
        },
      ],
      [
        '使用 Shift + 字母輸入全型符號',
        args.settings.shiftKeyForSymbolsEnabled,
        () => {
          this.settings.shiftKeyForSymbolsEnabled = !args.settings.shiftKeyForSymbolsEnabled;
        },
      ],
    ];
    const candidates = mapping.map((item) => {
      const name = item[0];
      const status = item[1] ? '開' : '關';
      const joined = `${status} - ${name}：`;
      return new MenuCandidate(joined, '', () => {
        item[2]();
        args.onSettingsChanged?.(args.settings);
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
      displayedRadicals: '設定',
      selectionKeys: args.selectionKeys,
      candidates: candidates,
      selectedCandidateIndex: args.selectedCandidateIndex,
    });
    this.previousState = args.previousState;
    this.settings = args.settings;
    this.onSettingsChanged = args.onSettingsChanged;
  }
}
