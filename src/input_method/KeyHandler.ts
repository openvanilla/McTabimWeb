import { Candidate, MenuCandidate } from '../data';
import { InputTableManager, InputTableWrapper } from '../data/InputTableManager';
import {
  AssociatedPhrasesState,
  CommittingState,
  EmojiInputtingState,
  EmojiMenuState,
  EmptyState,
  InputState,
  InputtingState,
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
        const associatedPhrasesState = new AssociatedPhrasesState({
          selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
          exactSelectionKeys: KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS,
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
    const table = this.onRequestTable();
    const inputKeys = Object.keys(table.table.keynames);

    /// Empty State
    if (state instanceof EmptyState) {
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
          displayedRadicals: displayedChr,
          selectionKeys: selectionKeys,
          candidates: candidates,
        });
        stateCallback(newState);
        return true;
      }
      return false;
    }

    ///  Inputting State
    if (state instanceof InputtingState) {
      // Perhaps handle tab key to commit the current candidate
      if (key.name === KeyName.RETURN || key.name === KeyName.SPACE) {
        if (state instanceof AssociatedPhrasesState) {
          stateCallback(new EmptyState());
          return true;
        }

        if (state.candidates.length > 0) {
          const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
          this.handleCandidate(selectedCandidate, stateCallback);
        } else {
          errorCallback();
        }
        return true;
      }

      let selectionKeys = state.selectionKeys;
      if (state instanceof AssociatedPhrasesState) {
        selectionKeys = KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS;
      }

      if (selectionKeys.includes(key.ascii)) {
        let candidates = state.candidatesInCurrentPage;
        if (candidates === undefined || candidates.length === 0) {
          errorCallback();
          return true;
        }
        const index = selectionKeys.indexOf(key.ascii);
        if (index > candidates.length - 1) {
          errorCallback();
          return true;
        }

        var allowAssociatedPhrases = !(state instanceof AssociatedPhrasesState);
        const selectedCandidate = candidates[index];
        this.handleCandidate(selectedCandidate, stateCallback, allowAssociatedPhrases);
        return true;
      }

      if (state instanceof SymbolInputtingState) {
        if (state.radicals.length === 0) {
          if (key.ascii === 'e') {
            const newState = new EmojiMenuState({
              title: 'Emoji',
              displayedRadicals: 'Emoji',
              selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
              previousState: state,
              nodes: InputTableManager.getInstance().emojiTable.tables,
            });
            stateCallback(newState);
            return true;
          }
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

        const symbolTable = InputTableManager.getInstance().symbolTable;

        if (symbolTable.keynames.includes(key.ascii)) {
          let chr = key.ascii;
          let selectionKeys = symbolTable.keynames.join('');
          if (selectionKeys === undefined || selectionKeys.length === 0) {
            selectionKeys = KeyHandler.COMMON_SELECTION_KEYS;
          }

          if (state.radicals.length >= 10) {
            errorCallback();
            return true;
          }
          let joined = state.radicals + chr;
          let founds = symbolTable.chardefs[joined];
          let candidates: Candidate[] = [];
          if (founds) {
            for (let found of founds) {
              candidates.push(new Candidate(found, ''));
            }
          }
          const newState = new SymbolInputtingState({
            radicals: joined,
            selectionKeys: selectionKeys,
            candidates: candidates,
          });
          stateCallback(newState);
          return true;
        }
      } else if (
        state instanceof EmojiMenuState ||
        state instanceof EmojiInputtingState ||
        state instanceof SettingsState
      ) {
        // pass
      } else if (inputKeys.includes(key.ascii)) {
        // associated phrase state also reach here, and start to input a new radical
        let chr = key.ascii;
        let displayedChr = table.lookUpForDisplayedKeyName(chr) || chr;
        let selectionKeys = table.table.selkey;
        if (selectionKeys === undefined || selectionKeys.length === 0) {
          selectionKeys = KeyHandler.COMMON_SELECTION_KEYS;
        }

        if (state.radicals.length >= table.settings.maxRadicals) {
          errorCallback();
          return true;
        }
        let joined = state.radicals + chr;
        let displayedJoined = state.displayedRadicals + displayedChr;
        let candidates = table.lookupForCandidate(joined) || [];
        const newState = new InputtingState({
          radicals: joined,
          displayedRadicals: displayedJoined,
          selectionKeys: selectionKeys,
          candidates: candidates,
        });
        stateCallback(newState);
        return true;
      }

      // Ignore ESC key in inputting state
      if (key.name === KeyName.ESC) {
        if (state instanceof EmojiMenuState) {
          stateCallback(state.previousState);
          return true;
        }
        if (state instanceof EmojiInputtingState) {
          stateCallback(state.previousState);
          return true;
        }

        stateCallback(new EmptyState());
        return true;
      }

      if (key.name === KeyName.BACKSPACE) {
        if (state instanceof AssociatedPhrasesState) {
          stateCallback(new EmptyState());
          return true;
        }
        if (state instanceof EmojiMenuState) {
          stateCallback(state.previousState);
          return true;
        }
        if (state instanceof EmojiInputtingState) {
          stateCallback(state.previousState);
          return true;
        }

        if (state.radicals.length === 0) {
          stateCallback(new EmptyState());
          return true;
        }
        let newRadicals = state.radicals.slice(0, -1);
        if (newRadicals.length === 0) {
          if (state instanceof SymbolInputtingState) {
            let newState = new SymbolInputtingState({
              radicals: '',
              selectionKeys: state.selectionKeys,
              candidates: [],
            });
            stateCallback(newState);
            return true;
          }
          stateCallback(new EmptyState());
          return true;
        }

        let newDisplayedRadicals = state.displayedRadicals.slice(0, -1);
        let candidates = table.lookupForCandidate(newRadicals) || [];
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
      return true; // Printable characters other than input keys are ignored
    }

    errorCallback();
    return false;
  }
}
