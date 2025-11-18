import { Candidate } from '../data';
import { InputtingState } from './InputState';
import { InputUIStateBuilder } from './InputUIElements';

describe('InputUIStateBuilder', () => {
  const makeCandidate = (text: string, desc = ''): Candidate => new Candidate(text, desc);

  const baseState = {
    displayedRadicals: ['a', 'b'],
    selectionKeys: ['1', '2', '3'],
    candidatesInCurrentPage: [
      makeCandidate('候選1', 'desc1'),
      makeCandidate('候選2', 'desc2'),
      makeCandidate('候選3', 'desc3'),
    ],
    selectedCandidateIndexInCurrentPage: 1,
    candidatePageCount: 2,
    candidatePageIndex: 0,
  } as unknown as InputtingState;

  it('builds InputUIState with correct composing buffer and candidates', () => {
    const builder = new InputUIStateBuilder(baseState);
    const uiState = builder.build();

    expect(uiState.composingBuffer).toHaveLength(2);
    expect(uiState.composingBuffer[0].text).toBe('a');
    expect(uiState.composingBuffer[1].text).toBe('b');
    expect(uiState.cursorIndex).toBe(2);

    expect(uiState.candidates).toHaveLength(3);
    expect(uiState.candidates[0].keyCap).toBe('1');
    expect(uiState.candidates[1].keyCap).toBe('2');
    expect(uiState.candidates[2].keyCap).toBe('3');
    expect(uiState.candidates[1].selected).toBe(true);
    expect(uiState.candidates[0].selected).toBe(false);

    expect(uiState.candidatePageCount).toBe(2);
    expect(uiState.candidatePageIndex).toBe(0);
  });

  it('returns correct JSON string', () => {
    const builder = new InputUIStateBuilder(baseState);
    const json = builder.buildJsonString();
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed.composingBuffer[0].text).toBe('a');
    expect(parsed.candidates[1].selected).toBe(true);
  });

  it('handles empty candidates and composing buffer', () => {
    const emptyState = {
      displayedRadicals: [],
      selectionKeys: [],
      candidatesInCurrentPage: [],
      selectedCandidateIndexInCurrentPage: undefined,
      candidatePageCount: 0,
      candidatePageIndex: 0,
    } as unknown as InputtingState;

    const builder = new InputUIStateBuilder(emptyState);
    const uiState = builder.build();
    expect(uiState.composingBuffer).toHaveLength(0);
    expect(uiState.candidates).toHaveLength(0);
    expect(uiState.cursorIndex).toBe(0);
    expect(uiState.candidatePageCount).toBe(0);
    expect(uiState.candidatePageIndex).toBe(0);
  });

  it('marks no candidate as selected if selectedCandidateIndexInCurrentPage is undefined', () => {
    const state = {
      ...baseState,
      selectedCandidateIndexInCurrentPage: undefined,
    } as unknown as InputtingState;
    const builder = new InputUIStateBuilder(state);
    const uiState = builder.build();
    expect(uiState.candidates.every((c) => !c.selected)).toBe(true);
  });

  it('handles fewer candidates than selection keys', () => {
    const state = {
      ...baseState,
      candidatesInCurrentPage: [makeCandidate('A')],
      selectionKeys: ['a', 'b', 'c'],
      selectedCandidateIndexInCurrentPage: 0,
    } as unknown as InputtingState;
    const builder = new InputUIStateBuilder(state);
    const uiState = builder.build();
    expect(uiState.candidates).toHaveLength(1);
    expect(uiState.candidates[0].keyCap).toBe('a');
    expect(uiState.candidates[0].selected).toBe(true);
    expect(uiState.cursorIndex).toBe(2);
  });
});
