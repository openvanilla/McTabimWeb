import { Candidate, MenuCandidate, SymbolCategory } from '../data';
import {
  AssociatedPhrasesState,
  BasicInputtingState,
  CommittingState,
  EmptyState,
  InputtingState,
  MenuState,
  NumberInputtingState,
  SettingsState,
  SymbolCategoryState,
  SymbolInputtingState,
  TooltipOnlyState,
} from './InputState';
import { Settings } from './Settings';

const createSettings = (overrides: Partial<Settings> = {}): Settings => ({
  chineseConversionEnabled: false,
  associatedPhrasesEnabled: false,
  shiftLetterForSymbolsEnabled: false,
  shiftPunctuationForSymbolsEnabled: false,
  wildcardMatchingEnabled: false,
  clearOnErrors: false,
  beepOnErrors: false,
  reverseRadicalLookupEnabled: false,
  ...overrides,
});

// Helper for test candidates
const makeCandidate = (text: string) => new Candidate(text, '');

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
    // Removed unused mockCandidate
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
  // Removed unused mockCandidate
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

  it('should toggle advanced settings options and emit callbacks', () => {
    const settings = createSettings({
      clearOnErrors: false,
      beepOnErrors: false,
      wildcardMatchingEnabled: false,
      reverseRadicalLookupEnabled: false,
    });
    const onSettingsChanged = jest.fn();
    const previousState = new EmptyState();
    const state = new (require('./InputState').SettingsState)({
      previousState,
      settings,
      selectionKeys: '1234567',
      onSettingsChanged,
    });

    state.candidates[3].nextState();
    expect(settings.clearOnErrors).toBe(true);
    state.candidates[4].nextState();
    expect(settings.beepOnErrors).toBe(true);
    state.candidates[5].nextState();
    expect(settings.wildcardMatchingEnabled).toBe(true);
    state.candidates[6].nextState();
    expect(settings.reverseRadicalLookupEnabled).toBe(true);
    expect(onSettingsChanged).toHaveBeenCalledTimes(4);
  });
});

describe('TooltipOnlyState', () => {
  it('stores the tooltip text', () => {
    const state = new TooltipOnlyState('提示');
    expect(state.tooltip).toBe('提示');
  });
});

describe('InputtingState helper behavior', () => {
  const candidates = [new Candidate('一', ''), new Candidate('二', '')];

  it('copyWithArgs clones state with updated index', () => {
    const state = new InputtingState({
      radicals: 'ab',
      displayedRadicals: ['A'],
      selectionKeys: '12',
      candidates,
      selectedCandidateIndex: 0,
    });
    const copied = state.copyWithArgs({ selectedCandidateIndex: 1 });
    expect(copied).toBeInstanceOf(InputtingState);
    expect(copied.selectedCandidateIndex).toBe(1);
    expect(copied.displayedRadicals).toEqual(['A']);
  });

  it('BasicInputtingState copyWithArgs preserves annotations', () => {
    const state = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['A'],
      selectionKeys: '1',
      candidates,
      candidateAnnotation: '注解',
    });
    const copied = state.copyWithArgs({ selectedCandidateIndex: 1 });
    expect(copied).toBeInstanceOf(BasicInputtingState);
    expect(copied.selectedCandidateIndex).toBe(1);
    expect(copied.candidateAnnotation).toBe('注解');
  });
});

describe('SymbolCategoryState deeper navigation', () => {
  it('creates MenuCandidates for nested SymbolCategory nodes', () => {
    const inner = new SymbolCategory({
      name: '子層',
      id: 'child',
      nodes: ['★'],
    });
    const root = new SymbolCategory({
      name: '主分類',
      id: 'root',
      nodes: [inner],
    });
    const previousState = new EmptyState();
    const state = new SymbolCategoryState({
      title: 'Symbols',
      displayedRadicals: ['符號'],
      previousState,
      nodes: [root, '☆'],
      selectionKeys: '12',
    });
    expect(state.candidates[0]).toBeInstanceOf(MenuCandidate);
    const nextState = (state.candidates[0] as MenuCandidate).nextState();
    expect(nextState).toBeInstanceOf(SymbolCategoryState);
    if (nextState instanceof SymbolCategoryState) {
      expect(nextState.displayedRadicals).toEqual(['符號/主分類']);
      const copy = nextState.copyWithArgs({ selectedCandidateIndex: 0 });
      expect(copy.selectedCandidateIndex).toBe(0);
    }
    expect(state.candidates[1]).toBeInstanceOf(Candidate);
  });
});

describe('MenuState', () => {
  const baseSettings = () =>
    createSettings({
      associatedPhrasesEnabled: false,
    });

  it('toggles Chinese conversion and calls the callback', () => {
    const settings = baseSettings();
    const onSettingsChanged = jest.fn();
    const state = new MenuState({
      settings,
      selectionKeys: '1234567890',
      onSettingsChanged,
    });
    expect(state.displayedRadicals).toEqual(['主選單']);
    const nextState = (state.candidates[0] as MenuCandidate).nextState();
    expect(settings.chineseConversionEnabled).toBe(true);
    expect(onSettingsChanged).toHaveBeenCalledWith(settings);
    expect(nextState).toBeInstanceOf(MenuState);
    expect((nextState as MenuState).candidates[0].displayText).toBe('简体中文');
  });

  it('exposes menu entries for settings and symbol categories', () => {
    const settings = baseSettings();
    const state = new MenuState({
      settings,
      selectionKeys: '1234567890',
      onSettingsChanged: jest.fn(),
    });
    const settingsCandidate = state.candidates.find(
      (candidate) => candidate.displayText === '功能開關',
    ) as MenuCandidate;
    expect(settingsCandidate).toBeDefined();
    const settingsState = settingsCandidate.nextState();
    expect(settingsState).toBeInstanceOf(SettingsState);

    const symbolCandidate = state.candidates.find(
      (candidate) => candidate.displayText === '特殊符號',
    ) as MenuCandidate;
    expect(symbolCandidate).toBeDefined();
    const symbolState = symbolCandidate.nextState() as SymbolCategoryState;
    expect(symbolState).toBeInstanceOf(SymbolCategoryState);
    expect(symbolState.displayedRadicals).toEqual(['特殊符號']);

    const copied = state.copyWithArgs({ selectedCandidateIndex: 2 });
    expect(copied.selectedCandidateIndex).toBe(2);
  });
});

describe('State toString()', () => {
  it('CommittingState toString returns details', () => {
    const state = new CommittingState('hello');
    expect(state.toString()).toBe("CommittingState(commitString='hello')");
  });

  it('TooltipOnlyState toString returns details', () => {
    const state = new TooltipOnlyState('tip');
    expect(state.toString()).toBe("TooltipOnlyState(tooltip='tip')");
  });

  it('InputtingState toString returns details', () => {
    const state = new InputtingState({
      radicals: 'xyz',
      displayedRadicals: ['X', 'Y', 'Z'],
      selectionKeys: '123',
      candidates: [makeCandidate('A'), makeCandidate('B')],
    });
    expect(state.toString()).toBe(
      "InputtingState(radicals='xyz', candidates=2, selectedCandidateIndex=0)",
    );
  });

  it('BasicInputtingState toString returns details', () => {
    const state = new BasicInputtingState({
      radicals: 'abc',
      displayedRadicals: ['A', 'B', 'C'],
      selectionKeys: '12',
      candidates: [makeCandidate('A')],
    });
    expect(state.toString()).toBe(
      "BasicInputtingState(radicals='abc', candidates=1, selectedCandidateIndex=0)",
    );
  });

  it('AssociatedPhrasesState toString returns details', () => {
    const state = new AssociatedPhrasesState({
      selectionKeys: '12',
      exactSelectionKeys: '12',
      candidates: [makeCandidate('A'), makeCandidate('B')],
    });
    expect(state.toString()).toBe('AssociatedPhrasesState(candidates=2, selectedCandidateIndex=0)');
  });

  it('SymbolInputtingState toString returns details', () => {
    const state = new SymbolInputtingState({
      radicals: 'sym',
      selectionKeys: '1',
      candidates: [makeCandidate('A')],
    });
    expect(state.toString()).toBe(
      "SymbolInputtingState(radicals='sym', candidates=1, selectedCandidateIndex=0)",
    );
  });

  it('SymbolCategoryState toString returns details', () => {
    const state = new SymbolCategoryState({
      title: 'cat',
      displayedRadicals: ['cat'],
      previousState: new EmptyState(),
      nodes: ['A', 'B'],
      selectionKeys: '1',
    });
    expect(state.toString()).toBe('SymbolCategoryState(nodes=2, selectedCandidateIndex=0)');
  });

  it('SettingsState toString returns details', () => {
    const state = new SettingsState({
      previousState: new EmptyState(),
      settings: createSettings(),
      selectionKeys: '1',
    });
    expect(state.toString()).toBe('SettingsState(selectedCandidateIndex=0)');
  });

  it('MenuState toString returns details', () => {
    const state = new MenuState({
      settings: createSettings(),
      selectionKeys: '1',
      onSettingsChanged: undefined,
    });
    expect(state.toString()).toBe('MenuState(selectedCandidateIndex=0)');
  });
});

describe('NumberInputtingState', () => {
  const mockCandidates = [new Candidate('1', ''), new Candidate('2', ''), new Candidate('3', '')];

  it('should set displayedRadicals with [數字]', () => {
    const state = new NumberInputtingState({
      radicals: '123',
      selectionKeys: '12',
      exactSelectionKeys: '!@#$%',
      candidates: mockCandidates,
      selectedCandidateIndex: 1,
    });
    expect(state.displayedRadicals).toStrictEqual(['[數字]123']);
    expect(state.candidates).toEqual(mockCandidates);
    expect(state.selectedCandidateIndex).toBe(1);
  });

  it('copyWithArgs should return SymbolInputtingState with updated selectedCandidateIndex', () => {
    const state = new NumberInputtingState({
      radicals: '456',
      selectionKeys: '12',
      exactSelectionKeys: '!@#$%',
      candidates: mockCandidates,
      selectedCandidateIndex: 0,
    });
    const newState = state.copyWithArgs({ selectedCandidateIndex: 2 });
    expect(newState).toBeInstanceOf(NumberInputtingState);
    expect(newState.selectedCandidateIndex).toBe(2);
    expect(newState.candidates).toEqual(mockCandidates);
    expect(newState.displayedRadicals).toStrictEqual(['[數字]456']);
  });

  it('toString returns correct details', () => {
    const state = new NumberInputtingState({
      radicals: '789',
      selectionKeys: '1',
      exactSelectionKeys: '!',
      candidates: [new Candidate('7', '')],
    });
    expect(state.toString()).toBe(
      "NumberInputtingState(radicals='789', candidates=1, selectedCandidateIndex=0)",
    );
  });
});
