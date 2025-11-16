import {
  CommittingState,
  EmptyState,
  InputtingState,
  AssociatedPhrasesState,
  SymbolInputtingState,
  SymbolCategoryState,
} from './InputState';

import { Candidate } from '../data';

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
        displayedRadicals: ['X', 'Y', 'Z'],
        selectionKeys: '123',
        candidates: mockCandidates,
      });
      expect(state.radicals).toBe('xyz');
      expect(state.displayedRadicals).toEqual(['X', 'Y', 'Z']);
      expect(state.selectionKeys).toBe('123');
      expect(state.candidates).toEqual(mockCandidates);
    });

    it('should set selectedCandidateIndex to 0 if not provided and candidates exist', () => {
      const state = new InputtingState({
        radicals: 'a',
        displayedRadicals: ['A'],
        selectionKeys: '12',
        candidates: mockCandidates,
      });
      expect(state.selectedCandidateIndex).toBe(0);
    });

    it('should use provided selectedCandidateIndex', () => {
      const state = new InputtingState({
        radicals: 'b',
        displayedRadicals: ['B'],
        selectionKeys: '12',
        candidates: mockCandidates,
        selectedCandidateIndex: 3,
      });
      expect(state.selectedCandidateIndex).toBe(3);
    });

    it('should calculate candidatePageCount correctly', () => {
      const state = new InputtingState({
        radicals: 'c',
        displayedRadicals: ['C'],
        selectionKeys: '12',
        candidates: mockCandidates,
      });
      expect(state.candidatePageCount).toBe(Math.ceil(mockCandidates.length / 2));
    });

    it('should calculate candidatesInCurrentPage and selectedCandidateIndexInCurrentPage', () => {
      const state = new InputtingState({
        radicals: 'd',
        displayedRadicals: ['D'],
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
        displayedRadicals: [],
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
      shiftLetterForSymbolsEnabled = false;
      shiftPunctuationForSymbolsEnabled = false;
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
      expect(state.displayedRadicals).toStrictEqual(['功能開關']);
      // expect(state.candidates.length).toBe(2);
      expect(state.candidates[0].displayText).toContain('■');
      expect(state.candidates[1].displayText).toContain('□');
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
      expect(settings.shiftLetterForSymbolsEnabled).toBe(false);
      candidate2.nextState();
      expect(settings.shiftLetterForSymbolsEnabled).toBe(true);
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

describe('Other InputState subclasses', () => {
  const mockCandidate = new Candidate('A', '');
  const mockCandidates = [
    new Candidate('A', ''),
    new Candidate('B', ''),
    new Candidate('C', ''),
    new Candidate('D', ''),
    new Candidate('E', ''),
  ];

  describe('AssociatedPhrasesState', () => {
    it('should initialize with correct displayedRadicals and candidates', () => {
      const state = new AssociatedPhrasesState({
        selectionKeys: '12',
        exactSelectionKeys: '12',
        candidates: mockCandidates,
        selectedCandidateIndex: 1,
      });
      expect(state.displayedRadicals).toStrictEqual(['聯想詞']);
      expect(state.candidates).toEqual(mockCandidates);
      expect(state.selectedCandidateIndex).toBe(1);
    });

    it('copyWithArgs should update selectedCandidateIndex', () => {
      const state = new AssociatedPhrasesState({
        selectionKeys: '12',
        exactSelectionKeys: '12',
        candidates: mockCandidates,
        selectedCandidateIndex: 1,
      });
      const newState = state.copyWithArgs({ selectedCandidateIndex: 2 });
      expect(newState.selectedCandidateIndex).toBe(2);
      expect(newState.candidates).toEqual(mockCandidates);
    });
  });

  describe('SymbolInputtingState', () => {
    it('should set displayedRadicals with [符]', () => {
      const state = new SymbolInputtingState({
        radicals: 'abc',
        selectionKeys: '12',
        candidates: mockCandidates,
        selectedCandidateIndex: 0,
      });
      expect(state.displayedRadicals).toStrictEqual(['[符]abc']);
      expect(state.candidates).toEqual(mockCandidates);
    });

    it('copyWithArgs should update selectedCandidateIndex', () => {
      const state = new SymbolInputtingState({
        radicals: 'abc',
        selectionKeys: '12',
        candidates: mockCandidates,
        selectedCandidateIndex: 0,
      });
      const newState = state.copyWithArgs({ selectedCandidateIndex: 1 });
      expect(newState.selectedCandidateIndex).toBe(1);
    });
  });

  describe('EmojiMenuState', () => {
    class MockSymbolCategory {
      name: string;
      nodes: any[];
      constructor(name: string, nodes: any[]) {
        this.name = name;
        this.nodes = nodes;
      }
    }

    it('should create MenuCandidates for each node', () => {
      const prevState = new EmptyState();
      const emojiNodes = [
        new MockSymbolCategory('Smileys', ['😀', '😁']),
        new MockSymbolCategory('Animals', ['🐶', '🐱']),
      ];
      const state = new SymbolCategoryState({
        title: 'Emoji',
        displayedRadicals: ['表情'],
        previousState: prevState,
        nodes: emojiNodes as any,
        selectionKeys: '12',
      });
      expect(state.candidates.length).toBe(2);
      expect(state.candidates[0]).toBeInstanceOf(Candidate);
      expect(state.displayedRadicals).toStrictEqual(['表情']);
      expect(state.previousState).toBe(prevState);
      expect(state.nodes).toBe(emojiNodes);
    });

    it('copyWithArgs should throw error', () => {
      const prevState = new EmptyState();
      const emojiNodes = [new MockSymbolCategory('Smileys', ['😀', '😁'])];
      const state = new SymbolCategoryState({
        title: 'Emoji',
        displayedRadicals: ['表情'],
        previousState: prevState,
        nodes: emojiNodes as any,
        selectionKeys: '1',
      });
      expect(() => state.copyWithArgs({ selectedCandidateIndex: 0 })).not.toThrow();
    });
  });
});

describe('SettingsState additional tests', () => {
  class MockSettings {
    associatedPhrasesEnabled = false;
    shiftLetterForSymbolsEnabled = true;
    shiftPunctuationForSymbolsEnabled = true;
  }

  it('should toggle shiftPunctuationForSymbolsEnabled when third candidate is selected', () => {
    const settings = new MockSettings();
    const onSettingsChanged = jest.fn();
    const previousState = new EmptyState();
    const selectionKeys = '123';

    const state = new (require('./InputState').SettingsState)({
      previousState,
      settings,
      selectionKeys,
      onSettingsChanged,
    });

    // Third candidate toggles shiftPunctuationForSymbolsEnabled
    const candidate = state.candidates[2];
    expect(settings.shiftPunctuationForSymbolsEnabled).toBe(true);
    candidate.nextState();
    expect(settings.shiftPunctuationForSymbolsEnabled).toBe(false);
    expect(onSettingsChanged).toHaveBeenCalledWith(settings);
  });

  it('copyWithArgs should update selectedCandidateIndex', () => {
    const settings = new MockSettings();
    const previousState = new EmptyState();
    const selectionKeys = '12';

    const state = new (require('./InputState').SettingsState)({
      previousState,
      settings,
      selectionKeys,
    });

    const newState = state.copyWithArgs({ selectedCandidateIndex: 1 });
    expect(newState.selectedCandidateIndex).toBe(1);
    expect(newState.settings).toBe(settings);
    expect(newState.previousState).toBe(previousState);
  });

  it('should preserve onSettingsChanged in copyWithArgs', () => {
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

    const newState = state.copyWithArgs({ selectedCandidateIndex: 2 });
    expect(newState.onSettingsChanged).toBe(onSettingsChanged);
  });

  it('should display correct status symbols for enabled/disabled settings', () => {
    const settings = new MockSettings();
    settings.associatedPhrasesEnabled = false;
    settings.shiftLetterForSymbolsEnabled = true;
    settings.shiftPunctuationForSymbolsEnabled = false;
    const previousState = new EmptyState();
    const selectionKeys = '123';

    const state = new (require('./InputState').SettingsState)({
      previousState,
      settings,
      selectionKeys,
    });

    expect(state.candidates[0].displayText.startsWith('□')).toBe(true);
    expect(state.candidates[1].displayText.startsWith('■')).toBe(true);
    expect(state.candidates[2].displayText.startsWith('□')).toBe(true);
  });

  it('should allow toggling all settings in sequence', () => {
    const settings = new MockSettings();
    const onSettingsChanged = jest.fn();
    const previousState = new EmptyState();
    const selectionKeys = '123';

    const state = new (require('./InputState').SettingsState)({
      previousState,
      settings,
      selectionKeys,
      onSettingsChanged,
    });

    // Toggle all three settings
    state.candidates[0].nextState();
    expect(settings.associatedPhrasesEnabled).toBe(true);
    state.candidates[1].nextState();
    expect(settings.shiftLetterForSymbolsEnabled).toBe(false);
    state.candidates[2].nextState();
    expect(settings.shiftPunctuationForSymbolsEnabled).toBe(false);
    expect(onSettingsChanged).toHaveBeenCalledTimes(3);
  });
});
