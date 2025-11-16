import { CommittingState, EmptyState, InputtingState } from './InputState';

describe('Test EmptyState', () => {
  it('should create an instance of EmptyState', () => {
    const state = new EmptyState();
    expect(state).toBeInstanceOf(EmptyState);
    expect(state).toBeInstanceOf(Object);
  });

  describe('Test CommittingState', () => {
    it('should store the commit string', () => {
      const state = new CommittingState('hello');
      expect(state.commitString).toBe('hello');
      expect(state).toBeInstanceOf(CommittingState);
    });
  });

  describe('Test InputtingState', () => {
    const mockCandidate = { value: 'A' } as any;
    const mockCandidates = [
      { value: 'A' },
      { value: 'B' },
      { value: 'C' },
      { value: 'D' },
      { value: 'E' },
    ] as any[];

    it('should store radicals, displayedRadicals, selectionKeys, and candidates', () => {
      const state = new InputtingState({
        radicals: 'xyz',
        displayedRadicals: 'XYZ',
        selectionKeys: '123',
        candidates: mockCandidates,
      });
      expect(state.radicals).toBe('xyz');
      expect(state.displayedRadicals).toBe('XYZ');
      expect(state.selectionKeys).toBe('123');
      expect(state.candidates).toEqual(mockCandidates);
    });

    it('should set selectedCandidateIndex to 0 if not provided and candidates exist', () => {
      const state = new InputtingState({
        radicals: 'a',
        displayedRadicals: 'A',
        selectionKeys: '12',
        candidates: mockCandidates,
      });
      expect(state.selectedCandidateIndex).toBe(0);
    });

    it('should use provided selectedCandidateIndex', () => {
      const state = new InputtingState({
        radicals: 'b',
        displayedRadicals: 'B',
        selectionKeys: '12',
        candidates: mockCandidates,
        selectedCandidateIndex: 3,
      });
      expect(state.selectedCandidateIndex).toBe(3);
    });

    it('should calculate candidatePageCount correctly', () => {
      const state = new InputtingState({
        radicals: 'c',
        displayedRadicals: 'C',
        selectionKeys: '12',
        candidates: mockCandidates,
      });
      expect(state.candidatePageCount).toBe(Math.ceil(mockCandidates.length / 2));
    });

    it('should calculate candidatesInCurrentPage and selectedCandidateIndexInCurrentPage', () => {
      const state = new InputtingState({
        radicals: 'd',
        displayedRadicals: 'D',
        selectionKeys: '12',
        candidates: mockCandidates,
        selectedCandidateIndex: 3,
      });
      expect(state.candidatesInCurrentPage).toEqual([mockCandidates[2], mockCandidates[3]]);
      expect(state.selectedCandidateIndexInCurrentPage).toBe(1);
      expect(state.candidatePageIndex).toBe(1);
    });

    it('should not set paging properties if candidates is empty', () => {
      const state = new InputtingState({
        radicals: '',
        displayedRadicals: '',
        selectionKeys: '123',
        candidates: [],
      });
      expect(state.candidatePageCount).toBeUndefined();
      expect(state.candidatesInCurrentPage).toBeUndefined();
      expect(state.selectedCandidateIndexInCurrentPage).toBeUndefined();
      expect(state.candidatePageIndex).toBeUndefined();
    });
  });
});
