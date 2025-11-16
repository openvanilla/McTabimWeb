import { Candidate, InputTableManager } from '../data';
import { CommittingState, EmptyState, InputtingState, AssociatedPhrasesState } from './InputState';
import { Key, KeyName } from './Key';
import { KeyHandler } from './KeyHandler';

describe('Test KeyHandler', () => {
  const keyHandler = new KeyHandler(
    () => InputTableManager.getInstance().currentTable,
    () => {
      return {
        chineseConversionEnabled: false,
        associatedPhrasesEnabled: false,
        shiftLetterForSymbolsEnabled: false,
        shiftPunctuationForSymbolsEnabled: false,
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

  it('should commit candidate on RETURN in InputtingState', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new InputtingState({
      radicals: 'a',
      displayedRadicals: 'a',
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
    let state: InputtingState | EmptyState = new InputtingState({
      radicals: 'a',
      displayedRadicals: 'a',
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
    let state: InputtingState | EmptyState = new InputtingState({
      radicals: 'a',
      displayedRadicals: 'a',
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
    let state: InputtingState | EmptyState = new InputtingState({
      radicals: 'a',
      displayedRadicals: 'a',
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

  it('should cycle candidates with UP and DOWN keys', () => {
    InputTableManager.getInstance().setInputTableById('cj5');
    let state: InputtingState | EmptyState = new InputtingState({
      radicals: 'a',
      displayedRadicals: 'a',
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
    let state: InputtingState | EmptyState = new InputtingState({
      radicals: 'a'.repeat(table.settings.maxRadicals),
      displayedRadicals: 'a'.repeat(table.settings.maxRadicals),
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
    let state: InputtingState | EmptyState = new InputtingState({
      radicals: 'a',
      displayedRadicals: 'a',
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
    let state: InputtingState | EmptyState = new InputtingState({
      radicals: 'a',
      displayedRadicals: 'a',
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
    expect(handleCandidateSpy).toHaveBeenCalledWith(phrases[1], expect.any(Function), false);
    handleCandidateSpy.mockRestore();
  });
});
