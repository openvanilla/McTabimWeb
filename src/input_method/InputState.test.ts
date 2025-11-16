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

  describe('Test SettingsState', () => {
    // Mock Settings and MenuCandidate
    class MockSettings {
      associatedPhrasesEnabled = true;
      shiftKeyForSymbolsEnabled = false;
    }

    it('should initialize with correct candidates and settings', () => {
      const settings = new MockSettings();
      const onSettingsChanged = jest.fn();
      const previousState = new EmptyState();
      const selectionKeys = '12';

      const state = new (require('./InputState').SettingsState)({
        previousState,
        settings,
        selectionKeys,
        onSettingsChanged,
      });

      expect(state.previousState).toBe(previousState);
      expect(state.settings).toBe(settings);
      expect(state.selectionKeys).toBe(selectionKeys);
      expect(state.displayedRadicals).toBe('設定');
      expect(state.candidates.length).toBe(2);
      expect(state.candidates[0].displayText).toContain('開');
      expect(state.candidates[1].displayText).toContain('關');
    });

    it('should call onSettingsChanged and toggle setting when candidate action is invoked', () => {
      const settings = new MockSettings();
      const onSettingsChanged = jest.fn();
      const previousState = new EmptyState();
      const selectionKeys = '12';

      const state = new (require('./InputState').SettingsState)({
        previousState,
        settings,
        selectionKeys,
        onSettingsChanged,
      });

      // The first candidate toggles associatedPhrasesEnabled
      const candidate = state.candidates[0];
      expect(settings.associatedPhrasesEnabled).toBe(true);
      candidate.nextState();
      expect(settings.associatedPhrasesEnabled).toBe(false);
      expect(onSettingsChanged).toHaveBeenCalledWith(settings);

      // The second candidate toggles shiftKeyForSymbolsEnabled
      const candidate2 = state.candidates[1];
      expect(settings.shiftKeyForSymbolsEnabled).toBe(false);
      candidate2.nextState();
      expect(settings.shiftKeyForSymbolsEnabled).toBe(true);
      expect(onSettingsChanged).toHaveBeenCalledWith(settings);
    });

    it('should not throw if onSettingsChanged is undefined', () => {
      const settings = new MockSettings();
      const previousState = new EmptyState();
      const selectionKeys = '12';

      const state = new (require('./InputState').SettingsState)({
        previousState,
        settings,
        selectionKeys,
      });

      expect(() => state.candidates[0].nextState()).not.toThrow();
      expect(() => state.candidates[1].nextState()).not.toThrow();
    });
  });
});
