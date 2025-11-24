import { Candidate } from '../data';
import { AssociatedPhrasesState, InputtingState, TooltipOnlyState } from './InputState';

class CandidateWrapper {
  constructor(readonly keyCap: string, readonly candidate: Candidate, readonly selected: boolean) {
    this.keyCap = keyCap;
    this.candidate = candidate;
    this.selected = selected;
  }

  /** Returns the reading of the candidate. */
  get reading(): string {
    return this.candidate.displayText;
  }

  /** Returns the value of the candidate. */
  get value(): string {
    return this.candidate.displayText;
  }

  /** Returns the description of the candidate. */
  get description(): string {
    return this.candidate.description;
  }
}

enum ComposingBufferTextStyle {
  Normal = 'normal',
  Highlighted = 'highlighted',
}

class ComposingBufferText {
  readonly text: string;
  readonly style: ComposingBufferTextStyle;

  constructor(text: string, style: ComposingBufferTextStyle = ComposingBufferTextStyle.Normal) {
    this.text = text;
    this.style = style;
  }
}

class InputUIState {
  constructor(
    readonly composingBuffer: ComposingBufferText[],
    readonly cursorIndex: number,
    readonly candidates: CandidateWrapper[],
    readonly candidatePageCount: number,
    readonly candidatePageIndex: number,
    readonly tooltip?: string,
    readonly candidateAnnotation?: string,
  ) {
    this.composingBuffer = composingBuffer;
    this.cursorIndex = cursorIndex;
    this.candidates = candidates;
    this.candidatePageCount = candidatePageCount;
    this.candidatePageIndex = candidatePageIndex;
    this.tooltip = tooltip;
    this.candidateAnnotation = candidateAnnotation;
  }
}

export class TooltipOnlyStateBuilder {
  state: TooltipOnlyState;

  constructor(state: TooltipOnlyState) {
    this.state = state;
  }

  buildJsonString(): string {
    return JSON.stringify(this.build());
  }

  build(): InputUIState {
    return new InputUIState(
      [],
      0,
      [],
      0,
      0, // candidates
      this.state.tooltip,
      undefined,
    );
  }
}

export class InputUIStateBuilder {
  constructor(private state: InputtingState) {}

  buildJsonString(): string {
    return JSON.stringify(this.build());
  }

  build(): InputUIState {
    const composingBufferTexts: ComposingBufferText[] = [];
    let displayedRadicals = this.state.displayedRadicals;
    if (this.state instanceof AssociatedPhrasesState) {
      // In PIME mode, we do not show the composing buffer in associated phrases state.
      displayedRadicals = [];
    }

    let cursorIndex = 0;
    for (const text of displayedRadicals) {
      composingBufferTexts.push(new ComposingBufferText(text));
      cursorIndex += text.length;
    }
    const selectionKeys = this.state.selectionKeys;
    const candidateWrappers: CandidateWrapper[] = [];
    if (this.state.candidatesInCurrentPage) {
      for (let i = 0; i < this.state.candidatesInCurrentPage.length; i++) {
        const candidate = this.state.candidatesInCurrentPage[i];
        const selected = i === (this.state.selectedCandidateIndexInCurrentPage ?? -1);
        candidateWrappers.push(new CandidateWrapper(selectionKeys[i], candidate, selected));
      }
    }
    return new InputUIState(
      composingBufferTexts,
      cursorIndex,
      candidateWrappers, // candidates
      this.state.candidatePageCount ?? 0,
      this.state.candidatePageIndex ?? 0,
      this.state.tooltip,
      this.state.candidateAnnotation,
    );
  }
}
