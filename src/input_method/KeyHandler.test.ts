import { Candidate, InputTableManager, MenuCandidate } from '../data';
import {
  AssociatedPhrasesState,
  BasicInputtingState,
  CommittingState,
  EmptyState,
  InputState,
  InputtingState,
  MenuState,
  SettingsState,
  SymbolCategoryState,
  SymbolInputtingState,
  TooltipOnlyState,
} from './InputState';
import { Key, KeyName } from './Key';
import { KeyHandler } from './KeyHandler';
import { Settings } from './Settings';

describe('Test KeyHandler', () => {
  const keyHandler = new KeyHandler(
    () => InputTableManager.getInstance().currentTable,
    () => {
      return {
        chineseConversionEnabled: false,
        associatedPhrasesEnabled: false,
        shiftLetterForSymbolsEnabled: false,
        shiftPunctuationForSymbolsEnabled: false,
        wildcardMatchingEnabled: false,
        clearOnErrors: false,
        beepOnErrors: false,
        reverseRadicalLookupEnabled: false,
      };
    },
    (settings) => {},
  );
  it('test a in cj', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new EmptyState();
    const keyZ = new Key('a', KeyName.UNKNOWN);
    const handled = keyHandler.handle(
      keyZ,
      state,
      (newState) => {
        state = newState as InputtingState;
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(state).toBeInstanceOf(InputtingState);
    if (state instanceof InputtingState) {
      expect(state.radicals).toBe('a');
      expect(state.candidates.length).toBeGreaterThan(0);
    }
  });

  it('test a in cj', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new EmptyState();
    const keys = ['a', 'z'];
    var handled = false;
    for (let key of keys) {
      const keyZ = new Key(key, KeyName.UNKNOWN);
      handled = keyHandler.handle(
        keyZ,
        state,
        (newState) => {
          state = newState as InputtingState;
        },
        () => {
          throw new Error('Should not call errorCallback');
        },
      );
    }
    expect(handled).toBe(true);
    expect(state).toBeInstanceOf(InputtingState);
    if (state instanceof InputtingState) {
      expect(state.radicals).toBe('az');
      expect(state.candidates.length).toBe(0);
    }
  });

  it('should not handle non-input key in EmptyState', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new EmptyState();
    const keyQ = new Key('?', KeyName.UNKNOWN);
    const handled = keyHandler.handle(
      keyQ,
      state,
      () => {
        throw new Error('Should not call stateCallback');
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(false);
    expect(state).toBeInstanceOf(EmptyState);
  });

  it('enters SymbolInputtingState when pressing backtick in EmptyState', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    const stateCallback = jest.fn();
    const handled = keyHandler.handle(
      new Key('`', KeyName.UNKNOWN),
      new EmptyState(),
      stateCallback,
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(stateCallback).toHaveBeenCalledTimes(1);
    expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(SymbolInputtingState);
  });

  it('should commit candidate on RETURN in InputtingState', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '1234567890',
      candidates: [new Candidate('中', '')],
    });
    const keyReturn = new Key('', KeyName.RETURN);
    let committed = false;
    const handled = keyHandler.handle(
      keyReturn,
      state,
      (newState) => {
        expect(newState).toBeInstanceOf(CommittingState);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('中');
          committed = true;
        }
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(committed).toBe(true);
  });

  it('should select candidate by selection key', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '1234567890',
      candidates: [new Candidate('中', ''), new Candidate('文', '')],
    });
    const key2 = new Key('2', KeyName.UNKNOWN);
    let committed = false;
    const handled = keyHandler.handle(
      key2,
      state,
      (newState) => {
        expect(newState).toBeInstanceOf(CommittingState);
        if (newState instanceof CommittingState) {
          expect(newState.commitString).toBe('文');
          committed = true;
        }
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(committed).toBe(true);
  });

  it('should handle BACKSPACE in InputtingState to EmptyState', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '1234567890',
      candidates: [new Candidate('中', '')],
    });
    const keyBackspace = new Key('backspace', KeyName.BACKSPACE);
    let called = false;
    const handled = keyHandler.handle(
      keyBackspace,
      state,
      (newState) => {
        expect(newState).toBeInstanceOf(EmptyState);
        called = true;
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(called).toBe(true);
  });

  it('should handle ESC in InputtingState to EmptyState', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '1234567890',
      candidates: [new Candidate('中', '')],
    });
    const keyEsc = new Key('escape', KeyName.ESC);
    let called = false;
    const handled = keyHandler.handle(
      keyEsc,
      state,
      (newState) => {
        expect(newState).toBeInstanceOf(EmptyState);
        called = true;
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(called).toBe(true);
  });

  it('should jump to the matching slot on the next page when PAGE_DOWN is pressed', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    const state = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '123',
      candidates: [
        new Candidate('中', ''),
        new Candidate('文', ''),
        new Candidate('測', ''),
        new Candidate('試', ''),
        new Candidate('台', ''),
      ],
      selectedCandidateIndex: 1,
    });
    const states: InputState[] = [];
    const handled = keyHandler.handle(
      new Key('', KeyName.PAGE_DOWN),
      state,
      (newState) => states.push(newState),
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(states[0]).toBeInstanceOf(InputtingState);
    if (states[0] instanceof InputtingState) {
      expect(states[0].selectedCandidateIndex).toBe(4);
    }
  });

  it('should jump to the first slot of the previous page when PAGE_UP is pressed', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    const state = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '123',
      candidates: [
        new Candidate('中', ''),
        new Candidate('文', ''),
        new Candidate('測', ''),
        new Candidate('試', ''),
        new Candidate('台', ''),
      ],
      selectedCandidateIndex: 4,
    });
    const states: InputState[] = [];
    const handled = keyHandler.handle(
      new Key('', KeyName.PAGE_UP),
      state,
      (newState) => states.push(newState),
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(states[0]).toBeInstanceOf(InputtingState);
    if (states[0] instanceof InputtingState) {
      expect(states[0].selectedCandidateIndex).toBe(0);
    }
  });

  it('should cycle candidates with UP and DOWN keys', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '1234567890',
      candidates: [new Candidate('中', ''), new Candidate('文', ''), new Candidate('測', '')],
      selectedCandidateIndex: 0,
    });
    // DOWN
    const keyDown = new Key('down', KeyName.DOWN);
    keyHandler.handle(
      keyDown,
      state,
      (newState) => {
        expect(newState).toBeInstanceOf(InputtingState);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBe(1);
        }
        state = newState;
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    // UP
    const keyUp = new Key('up', KeyName.UP);
    keyHandler.handle(
      keyUp,
      state,
      (newState) => {
        expect(newState).toBeInstanceOf(InputtingState);
        if (newState instanceof InputtingState) {
          expect(newState.selectedCandidateIndex).toBe(0);
        }
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
  });

  it('should call errorCallback if radicals exceed maxRadicals', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    const table = InputTableManager.getInstance().currentTable;
    let state: InputtingState | EmptyState = new BasicInputtingState({
      radicals: 'a'.repeat(table.settings.maxRadicals),
      displayedRadicals: Array(table.settings.maxRadicals).fill('a'),
      selectionKeys: '1234567890',
      candidates: [],
    });
    const keyA = new Key('a', KeyName.UNKNOWN);
    let errorCalled = false;
    const handled = keyHandler.handle(
      keyA,
      state,
      () => {
        throw new Error('Should not call stateCallback');
      },
      () => {
        errorCalled = true;
      },
    );
    expect(handled).toBe(true);
    expect(errorCalled).toBe(true);
  });
});

describe('Test Associated Phrases', () => {
  const keyHandler = new KeyHandler(
    () => InputTableManager.getInstance().currentTable,
    () => {
      return {
        chineseConversionEnabled: false,
        associatedPhrasesEnabled: true,
        shiftLetterForSymbolsEnabled: false,
        shiftPunctuationForSymbolsEnabled: false,
        wildcardMatchingEnabled: false,
        clearOnErrors: false,
        beepOnErrors: false,
        reverseRadicalLookupEnabled: false,
      };
    },
    (settings) => {},
  );
  it('should enter AssociatedPhrasesState after committing if associatedPhrasesEnabled', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    // Mock lookUpForAssociatedPhrases to return some phrases
    const spy = jest
      .spyOn(InputTableManager.getInstance(), 'lookUpForAssociatedPhrases')
      .mockReturnValue([new Candidate('聯想1', ''), new Candidate('聯想2', '')]);
    let state: InputtingState | EmptyState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '1234567890',
      candidates: [new Candidate('中', '')],
    });
    const keyReturn = new Key('', KeyName.RETURN);
    const states: any[] = [];
    const handled = keyHandler.handle(
      keyReturn,
      state,
      (newState) => {
        states.push(newState);
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    // First state should be CommittingState, second should be AssociatedPhrasesState
    expect(states[0]).toBeInstanceOf(CommittingState);
    expect(states[1]?.constructor.name).toBe('AssociatedPhrasesState');
    if (states[1]?.constructor.name === 'AssociatedPhrasesState') {
      expect(states[1].candidates.length).toBe(2);
      expect(states[1].candidates[0].displayText).toBe('聯想1');
    }
    spy.mockRestore();
  });

  it('should not enter AssociatedPhrasesState if no associated phrases found', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    const spy = jest
      .spyOn(InputTableManager.getInstance(), 'lookUpForAssociatedPhrases')
      .mockReturnValue([]);
    let state: InputtingState | EmptyState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['a'],
      selectionKeys: '1234567890',
      candidates: [new Candidate('中', '')],
    });
    const keyReturn = new Key('', KeyName.RETURN);
    const states: any[] = [];
    const handled = keyHandler.handle(
      keyReturn,
      state,
      (newState) => {
        states.push(newState);
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    // Only CommittingState should be pushed
    expect(states.length).toBe(1);
    expect(states[0]).toBeInstanceOf(CommittingState);
    spy.mockRestore();
  });

  it('should exit AssociatedPhrasesState on RETURN', () => {
    // Simulate entering AssociatedPhrasesState
    let state = new AssociatedPhrasesState({
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      exactSelectionKeys: KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS,
      candidates: [new Candidate('聯想1', ''), new Candidate('聯想2', '')],
    });
    const keyReturn = new Key('', KeyName.RETURN);
    let called = false;
    const handled = keyHandler.handle(
      keyReturn,
      state,
      (newState) => {
        expect(newState).toBeInstanceOf(EmptyState);
        called = true;
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(called).toBe(true);
  });

  it('should exit AssociatedPhrasesState on BACKSPACE', () => {
    let state = new AssociatedPhrasesState({
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      exactSelectionKeys: KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS,
      candidates: [new Candidate('聯想1', ''), new Candidate('聯想2', '')],
    });
    const keyBackspace = new Key('backspace', KeyName.BACKSPACE);
    let called = false;
    const handled = keyHandler.handle(
      keyBackspace,
      state,
      (newState) => {
        expect(newState).toBeInstanceOf(EmptyState);
        called = true;
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(called).toBe(true);
  });

  it('should select associated phrase by selection key', () => {
    const phrases = [new Candidate('聯想1', ''), new Candidate('聯想2', '')];
    let state = new AssociatedPhrasesState({
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      exactSelectionKeys: KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS,
      candidates: phrases,
    });
    const key2 = new Key('@', KeyName.UNKNOWN);
    let committed = false;
    const keyHandler2 = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => ({
        chineseConversionEnabled: false,
        associatedPhrasesEnabled: true,
        shiftLetterForSymbolsEnabled: false,
        shiftPunctuationForSymbolsEnabled: false,
        wildcardMatchingEnabled: false,
        clearOnErrors: false,
        beepOnErrors: false,
        reverseRadicalLookupEnabled: false,
      }),
      () => {},
    );
    const handleCandidateSpy = jest.spyOn(keyHandler2, 'handleCandidate');
    const handled = keyHandler2.handle(
      key2,
      state,
      (newState) => {
        // Should call handleCandidate with the correct candidate
        committed = true;
      },
      () => {
        throw new Error('Should not call errorCallback');
      },
    );
    expect(handled).toBe(true);
    expect(committed).toBe(true);
    expect(handleCandidateSpy).toHaveBeenCalledWith(
      expect.any(InputState),
      phrases[1],
      expect.any(Function),
      false,
    );
    handleCandidateSpy.mockRestore();
  });
});

describe('KeyHandler edge cases', () => {
  const buildSettings = (overrides: Partial<Settings> = {}): Settings => ({
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

  const createStubTable = () => ({
    table: { keynames: { a: 'A' }, selkey: KeyHandler.COMMON_SELECTION_KEYS, chardefs: {} },
    lookupForCandidate: jest.fn(() => []),
    lookUpForDisplayedKeyName: jest.fn((key: string) => key.toUpperCase()),
    reverseLookupForRadicals: jest.fn(() => ['Ａ']),
    settings: { maxRadicals: 5 },
  });

  it('handleCandidate should return the next state for MenuCandidate', () => {
    const keyHandler = new KeyHandler(
      () => createStubTable() as any,
      () => buildSettings(),
      jest.fn(),
    );
    const menuState = new MenuState({
      settings: buildSettings(),
      selectionKeys: '123',
      onSettingsChanged: jest.fn(),
    });
    const candidate = new MenuCandidate('主選單', '', () => menuState);
    const currentState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['A'],
      selectionKeys: '1',
      candidates: [candidate],
    });
    const stateCallback = jest.fn();
    keyHandler.handleCandidate(currentState, candidate, stateCallback);
    expect(stateCallback).toHaveBeenCalledWith(menuState);
  });

  it('handleCandidate emits TooltipOnlyState when reverse lookup has matches', () => {
    const keyHandler = new KeyHandler(
      () => createStubTable() as any,
      () => buildSettings({ reverseRadicalLookupEnabled: true }),
      jest.fn(),
    );
    const currentState = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['A'],
      selectionKeys: '1',
      candidates: [new Candidate('測', '')],
    });
    const states: InputState[] = [];
    keyHandler.handleCandidate(
      currentState,
      new Candidate('測', ''),
      (state) => states.push(state),
      false,
    );
    expect(states[0]).toBeInstanceOf(CommittingState);
    expect(states[1]).toBeInstanceOf(TooltipOnlyState);
    expect((states[1] as TooltipOnlyState).tooltip).toContain('字根反查');
  });

  it('handleCandidate remaps selection keys when using the shorter layout', () => {
    const spy = jest
      .spyOn(InputTableManager.getInstance(), 'lookUpForAssociatedPhrases')
      .mockReturnValue([new Candidate('聯想', '')]);
    const keyHandler = new KeyHandler(
      () => createStubTable() as any,
      () => buildSettings({ associatedPhrasesEnabled: true }),
      jest.fn(),
    );
    const state = new BasicInputtingState({
      radicals: 'a',
      displayedRadicals: ['A'],
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS2,
      candidates: [new Candidate('測', '')],
    });
    const states: InputState[] = [];
    keyHandler.handleCandidate(state, state.candidates[0], (s) => states.push(s));
    expect(states[1]).toBeInstanceOf(AssociatedPhrasesState);
    expect((states[1] as AssociatedPhrasesState).exactSelectionKeys).toBe(
      KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS2,
    );
    spy.mockRestore();
  });

  it('opens a symbol menu when shift punctuation maps to multiple symbols', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    const keyHandler = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => buildSettings({ shiftPunctuationForSymbolsEnabled: true }),
      jest.fn(),
    );
    const stateCallback = jest.fn();
    const handled = keyHandler.handle(
      new Key('+', KeyName.UNKNOWN),
      new EmptyState(),
      stateCallback,
      jest.fn(),
    );
    expect(handled).toBe(true);
    expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(SymbolCategoryState);
  });

  it('commits a single symbol when shift punctuation maps to one character', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    const keyHandler = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => buildSettings({ shiftPunctuationForSymbolsEnabled: true }),
      jest.fn(),
    );
    const stateCallback = jest.fn();
    keyHandler.handle(new Key('~', KeyName.UNKNOWN), new EmptyState(), stateCallback, jest.fn());
    expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(CommittingState);
  });

  it('commits mapped symbols when shift + letter is enabled', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    const keyHandler = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => buildSettings({ shiftLetterForSymbolsEnabled: true }),
      jest.fn(),
    );
    const stateCallback = jest.fn();
    keyHandler.handle(new Key('Q', KeyName.UNKNOWN), new EmptyState(), stateCallback, jest.fn());
    expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(CommittingState);
  });

  it('errors when associated phrase page is empty', () => {
    const keyHandler = new KeyHandler(
      () => createStubTable() as any,
      () => buildSettings(),
      jest.fn(),
    );
    const state = new AssociatedPhrasesState({
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      exactSelectionKeys: KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS,
      candidates: [],
    });
    const errorCallback = jest.fn();
    keyHandler.handle(new Key('!', KeyName.UNKNOWN), state, jest.fn(), errorCallback);
    expect(errorCallback).toHaveBeenCalled();
  });

  it('errors when associated phrase selection exceeds candidates', () => {
    const keyHandler = new KeyHandler(
      () => createStubTable() as any,
      () => buildSettings(),
      jest.fn(),
    );
    const state = new AssociatedPhrasesState({
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      exactSelectionKeys: '!@',
      candidates: [new Candidate('聯想', '')],
    });
    const errorCallback = jest.fn();
    keyHandler.handle(new Key('@', KeyName.UNKNOWN), state, jest.fn(), errorCallback);
    expect(errorCallback).toHaveBeenCalled();
  });

  it('navigates to emoji menu from SymbolInputtingState', () => {
    const keyHandler = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => buildSettings(),
      jest.fn(),
    );
    const state = new SymbolInputtingState({
      radicals: '',
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      candidates: [],
    });
    const stateCallback = jest.fn();
    keyHandler.handle(new Key('e', KeyName.UNKNOWN), state, stateCallback, jest.fn());
    expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(SymbolCategoryState);
  });

  it('navigates to the menu from SymbolInputtingState and wires callbacks', () => {
    const onSettingsChanged = jest.fn();
    const keyHandler = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => buildSettings(),
      onSettingsChanged,
    );
    const state = new SymbolInputtingState({
      radicals: '',
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      candidates: [],
    });
    const states: InputState[] = [];
    keyHandler.handle(new Key('m', KeyName.UNKNOWN), state, (s) => states.push(s), jest.fn());
    const menuState = states[0] as MenuState;
    expect(menuState).toBeInstanceOf(MenuState);
    (menuState.candidates[0] as MenuCandidate).nextState();
    expect(onSettingsChanged).toHaveBeenCalled();
  });

  it('opens in-menu settings state from SymbolInputtingState', () => {
    const keyHandler = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => buildSettings(),
      jest.fn(),
    );
    const state = new SymbolInputtingState({
      radicals: '',
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      candidates: [],
    });
    const stateCallback = jest.fn();
    keyHandler.handle(new Key('s', KeyName.UNKNOWN), state, stateCallback, jest.fn());
    expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(SettingsState);
  });

  it('opens menu when backtick is pressed twice in symbol mode', () => {
    const keyHandler = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => buildSettings(),
      jest.fn(),
    );
    const state = new SymbolInputtingState({
      radicals: '`',
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      candidates: [],
    });
    const stateCallback = jest.fn();
    keyHandler.handle(new Key('`', KeyName.UNKNOWN), state, stateCallback, jest.fn());
    expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(MenuState);
  });

  it('updates symbol radicals when a valid symbol key is typed', () => {
    const keyHandler = new KeyHandler(
      () => InputTableManager.getInstance().currentTable,
      () => buildSettings(),
      jest.fn(),
    );
    const state = new SymbolInputtingState({
      radicals: '',
      selectionKeys: 'abcdef',
      candidates: [],
    });
    const states: InputState[] = [];
    keyHandler.handle(new Key('0', KeyName.UNKNOWN), state, (s) => states.push(s), jest.fn());
    expect(states[0]).toBeInstanceOf(SymbolInputtingState);
    expect((states[0] as SymbolInputtingState).radicals).toBe('0');
  });

  it('BACKSPACE returns to previous state for symbol/category specific states', () => {
    const keyHandler = new KeyHandler(
      () => createStubTable() as any,
      () => buildSettings(),
      jest.fn(),
    );
    const prevState = new SymbolInputtingState({
      radicals: '',
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      candidates: [],
    });
    const symbolState = new SymbolCategoryState({
      title: 'cat',
      displayedRadicals: ['cat'],
      previousState: prevState,
      nodes: ['★'],
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
    });
    const stateCallback = jest.fn();
    keyHandler.handle(Key.namedKey(KeyName.BACKSPACE), symbolState, stateCallback, jest.fn());
    expect(stateCallback.mock.calls[0][0]).toBe(prevState);

    const settingsState = new SettingsState({
      previousState: prevState,
      settings: buildSettings(),
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
    });
    const stateCallback2 = jest.fn();
    keyHandler.handle(Key.namedKey(KeyName.BACKSPACE), settingsState, stateCallback2, jest.fn());
    expect(stateCallback2.mock.calls[0][0]).toBe(prevState);
  });

  it('handles Shift presses gracefully inside associated phrases', () => {
    const keyHandler = new KeyHandler(
      () => createStubTable() as any,
      () => buildSettings(),
      jest.fn(),
    );
    const state = new AssociatedPhrasesState({
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      exactSelectionKeys: KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS,
      candidates: [new Candidate('聯想', '')],
    });
    const handled = keyHandler.handle(
      new Key('Shift', KeyName.UNKNOWN),
      state,
      jest.fn(),
      jest.fn(),
    );
    expect(handled).toBe(true);
  });

  it('exits associated phrases when other printable keys are pressed', () => {
    const keyHandler = new KeyHandler(
      () => createStubTable() as any,
      () => buildSettings(),
      jest.fn(),
    );
    const state = new AssociatedPhrasesState({
      selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
      exactSelectionKeys: KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS,
      candidates: [new Candidate('聯想', '')],
    });
    const stateCallback = jest.fn();
    const handled = keyHandler.handle(
      new Key('x', KeyName.UNKNOWN),
      state,
      stateCallback,
      jest.fn(),
    );
    expect(handled).toBe(false);
    expect(stateCallback.mock.calls[0][0]).toBeInstanceOf(EmptyState);
  });
});
