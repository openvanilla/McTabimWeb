import { Candidate, MenuCandidate, InputTableManager, InputTableWrapper } from '../data';
import {
  AssociatedPhrasesState,
  CommittingState,
  SymbolCategoryState,
  EmptyState,
  InputState,
  InputtingState,
  MenuState,
  SettingsState,
  SymbolInputtingState,
} from './InputState';
import { Key, KeyName } from './Key';
import { Settings } from './Settings';

export class KeyHandler {
  static readonly COMMON_SELECTION_KEYS = '1234567890';
  static readonly ASSOCIATED_PHRASES_SELECTION_KEYS = '!@#$%^&*()';

  onRequestTable: () => InputTableWrapper;
  onRequestSettings: () => Settings;
  onSettingChanged: (settings: Settings) => void;

  constructor(
    onRequestTable: () => InputTableWrapper,
    onRequestSettings: () => Settings,
    onSettingChanged: (settings: Settings) => void,
  ) {
    this.onRequestTable = onRequestTable;
    this.onRequestSettings = onRequestSettings;
    this.onSettingChanged = onSettingChanged;
  }

  handleCandidate(
    state: InputtingState,
    selectedCandidate: Candidate,
    stateCallback: (state: InputState) => void,
    allowAssociatedPhrases: boolean = true,
  ): void {
    if (selectedCandidate instanceof MenuCandidate) {
      const newState = selectedCandidate.nextState();
      stateCallback(newState);
      return;
    }
    const commitString = selectedCandidate.displayText;
    const newState = new CommittingState(commitString);
    stateCallback(newState);

    if (allowAssociatedPhrases && this.onRequestSettings().associatedPhrasesEnabled) {
      const phrases = InputTableManager.getInstance().lookUpForAssociatedPhrases(commitString);
      if (phrases && phrases.length > 0) {
        let selectionKeys = state.selectionKeys;
        let exactSelectionKeys = state.selectionKeys;
        if (selectionKeys === KeyHandler.COMMON_SELECTION_KEYS) {
          exactSelectionKeys = KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS;
        }
        const associatedPhrasesState = new AssociatedPhrasesState({
          selectionKeys: selectionKeys,
          exactSelectionKeys: exactSelectionKeys,
          candidates: phrases,
        });
        stateCallback(associatedPhrasesState);
      }
    }
  }

  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    const settings = this.onRequestSettings();
    const table = this.onRequestTable();
    let inputKeys = Object.keys(table.table.keynames);
    if (settings.wildcardMatchingEnabled) {
      inputKeys = inputKeys.concat(['*', '#']);
    }

    const shiftLetterSymbols = InputTableManager.getInstance().shiftLetterSymbols;
    const shiftPunctuationsSymbols = InputTableManager.getInstance().shiftPunctuationsSymbols;

    if (state instanceof AssociatedPhrasesState) {
      const selectionKeys = state.exactSelectionKeys;
      if (selectionKeys !== undefined && key.ascii && selectionKeys.includes(key.ascii)) {
        const candidates = state.candidatesInCurrentPage;
        if (candidates === undefined || candidates.length === 0) {
          errorCallback();
          return true;
        }
        const index = selectionKeys.indexOf(key.ascii);
        if (index > candidates.length - 1) {
          errorCallback();
          return true;
        }

        const selectedCandidate = candidates[index];
        this.handleCandidate(state, selectedCandidate, stateCallback, false);
        return true;
      }
    }

    /// Empty State
    if (state instanceof EmptyState || state instanceof AssociatedPhrasesState) {
      if (key.ascii === '`') {
        /// Enter Symbol Inputting State
        const selectionKeys = KeyHandler.COMMON_SELECTION_KEYS;
        const newState = new SymbolInputtingState({
          radicals: '',
          selectionKeys: selectionKeys,
          candidates: [],
        });
        stateCallback(newState);
        return true;
      } else if (inputKeys.includes(key.ascii)) {
        /// Enter radical inputting state
        const chr = key.ascii;
        const displayedChr = table.lookUpForDisplayedKeyName(chr) || chr;
        let selectionKeys = table.table.selkey;
        if (selectionKeys === undefined || selectionKeys.length === 0) {
          selectionKeys = KeyHandler.COMMON_SELECTION_KEYS;
        }

        const candidates = table.lookupForCandidate(chr) || [];
        const newState = new InputtingState({
          radicals: chr,
          displayedRadicals: [displayedChr],
          selectionKeys: selectionKeys,
          candidates: candidates,
        });
        stateCallback(newState);
        return true;
      }
      if (settings.shiftPunctuationForSymbolsEnabled) {
        if (shiftPunctuationsSymbols.hasOwnProperty(key.ascii)) {
          const chr = shiftPunctuationsSymbols[key.ascii];
          const components = chr.split('');
          if (components.length > 1) {
            const inputtingState = new SymbolCategoryState({
              displayedRadicals: ['[符]' + key.ascii],
              nodes: components,
              selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
              previousState: state,
              title: chr,
            });
            stateCallback(inputtingState);
          } else {
            const newState = new CommittingState(chr);
            stateCallback(newState);
          }
          return true;
        }
      }

      if (settings.shiftLetterForSymbolsEnabled) {
        if (shiftLetterSymbols.hasOwnProperty(key.ascii)) {
          const chr = shiftLetterSymbols[key.ascii];
          const newState = new CommittingState(chr);
          stateCallback(newState);
          return true;
        }
      }

      if (!(state instanceof AssociatedPhrasesState)) {
        return false;
      }
    }

    ///  Inputting State
    if (state instanceof InputtingState) {
      if (key.name === KeyName.RETURN || key.name === KeyName.SPACE) {
        if (key.name === KeyName.RETURN && state instanceof AssociatedPhrasesState) {
          stateCallback(new EmptyState());
          return true;
        }

        if (state.candidates.length > 0) {
          const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
          const allowAssociatedPhrases = !(state instanceof AssociatedPhrasesState);
          this.handleCandidate(state, selectedCandidate, stateCallback, allowAssociatedPhrases);
        } else {
          errorCallback();
        }
        return true;
      }

      if (!(state instanceof AssociatedPhrasesState)) {
        const selectionKeys = state.selectionKeys;
        if (key.ascii && selectionKeys.includes(key.ascii)) {
          const candidates = state.candidatesInCurrentPage;
          if (candidates === undefined || candidates.length === 0) {
            errorCallback();
            return true;
          }
          const index = selectionKeys.indexOf(key.ascii);
          if (index > candidates.length - 1) {
            errorCallback();
            return true;
          }

          const selectedCandidate = candidates[index];
          this.handleCandidate(state, selectedCandidate, stateCallback);
          return true;
        }
      }

      /// Symbol Inputting State
      if (state instanceof SymbolInputtingState) {
        if (state.radicals.length === 0) {
          if (key.ascii === 'e') {
            const newState = new SymbolCategoryState({
              title: '表情符號',
              displayedRadicals: ['表情符號'],
              selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
              previousState: state,
              nodes: InputTableManager.getInstance().emojiTable.tables,
            });
            stateCallback(newState);
            return true;
          }

          if (key.ascii === 's') {
            const newState = new SettingsState({
              previousState: state,
              settings: this.onRequestSettings(),
              selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
              onSettingsChanged: this.onSettingChanged,
            });
            stateCallback(newState);
            return true;
          }

          if (key.ascii === 'm') {
            const newState = new MenuState({
              settings: this.onRequestSettings(),
              selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
              onSettingsChanged: this.onSettingChanged,
            });
            stateCallback(newState);
            return true;
          }
        } else if (state.radicals === '`') {
          if (key.ascii === '`') {
            const newState = new MenuState({
              settings: this.onRequestSettings(),
              selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
              onSettingsChanged: this.onSettingChanged,
            });
            stateCallback(newState);
            return true;
          }
        }
        const symbolTable = InputTableManager.getInstance().symbolTable;
        if (symbolTable.keynames.includes(state.radicals + key.ascii)) {
          const chr = key.ascii;
          if (state.radicals.length >= 2) {
            errorCallback();
            return true;
          }
          const joined = state.radicals + chr;
          const founds = symbolTable.chardefs[joined];
          const candidates: Candidate[] = [];
          if (founds) {
            for (const found of founds) {
              candidates.push(new Candidate(found, ''));
            }
          }
          const newState = new SymbolInputtingState({
            radicals: joined,
            selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
            candidates: candidates,
          });
          stateCallback(newState);
          return true;
        }
      } else if (
        state instanceof SymbolCategoryState ||
        state instanceof SettingsState ||
        state instanceof MenuState ||
        state instanceof AssociatedPhrasesState
      ) {
        // pass
        // Note: `AssociatedPhrasesState` shall not reach here because it is handled above
      } else if (inputKeys.includes(key.ascii)) {
        // associated phrase state also reach here, and start to input a new radical
        const chr = key.ascii;
        const displayedChr = table.lookUpForDisplayedKeyName(chr) || chr;
        let selectionKeys = table.table.selkey;
        if (selectionKeys === undefined || selectionKeys.length === 0) {
          selectionKeys = KeyHandler.COMMON_SELECTION_KEYS;
        }

        if (state.radicals.length >= table.settings.maxRadicals) {
          errorCallback();
          return true;
        }
        const joined = state.radicals + chr;
        const displayedConcat = state.displayedRadicals.concat([displayedChr]);
        const candidates = table.lookupForCandidate(joined) || [];
        const newState = new InputtingState({
          radicals: joined,
          displayedRadicals: displayedConcat,
          selectionKeys: selectionKeys,
          candidates: candidates,
        });
        stateCallback(newState);
        return true;
      }

      // Ignore ESC key in inputting state
      if (key.name === KeyName.ESC) {
        stateCallback(new EmptyState());
        return true;
      }

      if (key.name === KeyName.BACKSPACE) {
        if (state instanceof AssociatedPhrasesState) {
          stateCallback(new EmptyState());
          return true;
        } else if (state instanceof SymbolCategoryState) {
          stateCallback(state.previousState);
          return true;
        } else if (state instanceof SettingsState) {
          stateCallback(state.previousState);
          return true;
        }

        if (state.radicals.length === 0) {
          stateCallback(new EmptyState());
          return true;
        }
        const newRadicals = state.radicals.slice(0, -1);
        if (newRadicals.length === 0) {
          stateCallback(new EmptyState());
          return true;
        }

        if (state instanceof SymbolInputtingState) {
          const symbolTable = InputTableManager.getInstance().symbolTable;
          const found = symbolTable.chardefs[newRadicals];
          const candidates = found?.map((chr) => new Candidate(chr, '')) || [];
          const newState = new SymbolInputtingState({
            radicals: newRadicals,
            selectionKeys: state.selectionKeys,
            candidates: candidates,
          });
          stateCallback(newState);
          return true;
        }

        const newDisplayedRadicals = state.displayedRadicals.slice(0, -1);
        const candidates = table.lookupForCandidate(newRadicals) || [];
        const newState = new InputtingState({
          radicals: newRadicals,
          displayedRadicals: newDisplayedRadicals,
          selectionKeys: state.selectionKeys,
          candidates: candidates,
        });
        stateCallback(newState);
        return true;
      }

      if (key.name === KeyName.UP) {
        if (state.candidates.length > 0) {
          const newIndex =
            ((state.selectedCandidateIndex ?? 0) - 1 + state.candidates.length) %
            state.candidates.length;
          const newState = state.copyWithArgs({
            selectedCandidateIndex: newIndex,
          });

          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.DOWN) {
        if (state.candidates.length > 0) {
          const newIndex = ((state.selectedCandidateIndex ?? 0) + 1) % state.candidates.length;
          const newState = state.copyWithArgs({
            selectedCandidateIndex: newIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.PAGE_DOWN) {
        if (state.candidates.length > 0) {
          const candidatesPerPage = state.selectionKeys.length;
          const newIndex = Math.min(
            ((state.selectedCandidateIndex ?? 0) / candidatesPerPage + 1) * candidatesPerPage,
            state.candidates.length - 1,
          );
          const newState = state.copyWithArgs({
            selectedCandidateIndex: newIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }

      if (key.name === KeyName.PAGE_UP) {
        if (state.candidates.length > 0) {
          const candidatesPerPage = state.selectionKeys.length;
          const newIndex = Math.max(
            Math.floor((state.selectedCandidateIndex ?? 0) / candidatesPerPage - 1) *
              candidatesPerPage,
            0,
          );
          const newState = state.copyWithArgs({
            selectedCandidateIndex: newIndex,
          });
          stateCallback(newState);
          return true;
        } else {
          errorCallback();
          return true;
        }
      }
      if (state instanceof AssociatedPhrasesState) {
        if (key.ascii === 'Shift') {
          return true;
        }
        stateCallback(new EmptyState());
        return false;
      }

      return true; // Printable characters other than input keys are ignored
    }

    errorCallback();
    return true;
  }
}
