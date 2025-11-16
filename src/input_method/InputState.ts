import Candidate from '../data';

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
