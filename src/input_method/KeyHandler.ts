import { Candidate, InputTableManager, InputTableWrapper, MenuCandidate } from '../data';
import NumberInputHelper from './HelperNumberInput';
import {
  AssociatedPhrasesState,
  BasicInputtingState,
  CommittingState,
  EmptyState,
  InputState,
  InputtingState,
  MenuState,
  NumberInputtingState,
  SelectingHomophoneReadingsState,
  SelectingHomophoneWordState,
  SettingsState,
  SymbolCategoryState,
  SymbolInputtingState,
  TooltipOnlyState,
} from './InputState';
import { Key, KeyName } from './Key';
import { Settings } from './Settings';

/**
 * Handles key events and transitions between input states.
 *
 * This class is responsible for processing user input, such as key presses,
 * and for determining the appropriate next state for the input method. It
 * works in conjunction with the `InputController` to manage the overall
 * state of the input method.
 *
 * The `KeyHandler` receives key events from the `InputController`, and then
 * uses the current state to determine how to handle the event. For example,
 * if the input method is in the `InputtingState`, the `KeyHandler` will
- * append the new character to the current input, and then update the
- * candidate list.
+ * append the new character to the current input, and then update the candidate
+ * list.
 *
 * The `KeyHandler` also handles special keys, such as the backspace key, the
 * enter key, and the arrow keys. These keys are used to perform actions such
 * as deleting characters, committing the current input, and navigating the
 * candidate list.
 */
export class KeyHandler {
  static readonly COMMON_SELECTION_KEYS = '1234567890';
  static readonly ASSOCIATED_PHRASES_SELECTION_KEYS = '!@#$%^&*()';
  static readonly COMMON_SELECTION_KEYS2 = '123456789';
  static readonly ASSOCIATED_PHRASES_SELECTION_KEYS2 = '!@#$%^&*(';
  static readonly NUMBER_INPUT_KEYS = '0123456789.';

  constructor(
    readonly onRequestTable: () => InputTableWrapper,
    readonly onRequestSettings: () => Settings,
    readonly onSettingChanged: (settings: Settings) => void,
  ) {}

  /**
   * Handles the selection of a candidate.
   *
   * @param {InputtingState} state - The current inputting state.
   * @param {Candidate} selectedCandidate - The candidate that was selected.
   * @param {function} stateCallback - A callback function to be called with the
   *     new state.
   * @param {boolean} [allowAssociatedPhrases=true] - Whether to allow
   *     associated phrases to be displayed.
   */
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

    const tooltip = (() => {
      if (this.onRequestSettings().reverseRadicalLookupEnabled) {
        const radicalsArray = this.onRequestTable().reverseLookupForRadicals(commitString);
        const joined = radicalsArray.join(', ');
        if (joined.length > 0) {
          return `字根反查: ${joined}`;
        }
      }
      return undefined;
    })();

    if (allowAssociatedPhrases && this.onRequestSettings().associatedPhrasesEnabled) {
      const phrases = InputTableManager.getInstance().lookUpForAssociatedPhrases(commitString);
      if (phrases && phrases.length > 0) {
        const selectionKeys = state.selectionKeys;
        let exactSelectionKeys = state.selectionKeys;
        let annotation = '';
        if (selectionKeys === KeyHandler.COMMON_SELECTION_KEYS) {
          exactSelectionKeys = KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS;
          annotation = '(Shift + 數字按鍵)';
        } else if (selectionKeys === KeyHandler.COMMON_SELECTION_KEYS2) {
          exactSelectionKeys = KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS2;
          annotation = '(Shift + 數字按鍵)';
        }

        const associatedPhrasesState = new AssociatedPhrasesState({
          selectionKeys: selectionKeys,
          exactSelectionKeys: exactSelectionKeys,
          candidates: phrases,
          candidateAnnotation: annotation,
          tooltip: tooltip,
        });
        stateCallback(associatedPhrasesState);
      }
    } else if (tooltip) {
      const newState = new TooltipOnlyState(tooltip);
      stateCallback(newState);
    }
  }

  /**
   * Handles a key event.
   *
   * @param {Key} key - The key that was pressed.
   * @param {InputState} state - The current state of the input method.
   * @param {function} stateCallback - A callback function to be called with the
   *     new state.
   * @param {function} errorCallback - A callback function to be called when an
   *     error occurs.
   * @returns {boolean} Whether the key event was handled.
   */
  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    const settings = this.onRequestSettings();
    const table = this.onRequestTable();
    let inputKeys = Object.keys(table.table?.keynames || {});
    if (settings.wildcardMatchingEnabled) {
      inputKeys = inputKeys.concat(['*']);
    }

    const shiftLetterSymbols = InputTableManager.getInstance().shiftLetterSymbols;
    const shiftPunctuationsSymbols = InputTableManager.getInstance().shiftPunctuationsSymbols;

    // Check if the user selects an associated phrase.
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
      // Note: so we can try to see if it is page up/down and so on for associated phrase state
    }

    /// Empty State
    if (
      state instanceof EmptyState ||
      state instanceof AssociatedPhrasesState ||
      state instanceof TooltipOnlyState ||
      state instanceof CommittingState
    ) {
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
        const newState = new BasicInputtingState({
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

      if (state instanceof EmptyState) {
        return false;
      }

      if (state instanceof TooltipOnlyState) {
        stateCallback(new EmptyState('reset from tooltip only state'));
        return false;
      }
      // Note: so we can try to see if it is page up/down and so on for associated phrase state
    }

    ///  Inputting State
    if (state instanceof InputtingState) {
      if (key.name === KeyName.RETURN || key.name === KeyName.SPACE) {
        if (key.name === KeyName.RETURN && state instanceof AssociatedPhrasesState) {
          stateCallback(new EmptyState('reset after pressing enter in associated phrases state'));
          return true;
        }

        if (state.candidates.length > 0) {
          const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
          const allowAssociatedPhrases = !(state instanceof AssociatedPhrasesState);
          this.handleCandidate(state, selectedCandidate, stateCallback, allowAssociatedPhrases);
        } else {
          errorCallback();
          if (settings.clearOnErrors) {
            stateCallback(new EmptyState('reset after error'));
          }
        }
        return true;
      }

      if (!(state instanceof AssociatedPhrasesState)) {
        let selectionKeys = state.selectionKeys;
        if (state instanceof NumberInputtingState) {
          if (state.exactSelectionKeys) {
            selectionKeys = state.exactSelectionKeys;
          }
        }

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
              onSettingsChanged: (settings: Settings) => {
                this.onSettingChanged(settings);
              },
            });
            stateCallback(newState);
            return true;
          }
        }

        if (state.radicals === '`' && key.ascii === '`') {
          const newState = new MenuState({
            settings: this.onRequestSettings(),
            selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
            onSettingsChanged: this.onSettingChanged,
          });
          stateCallback(newState);
          return true;
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
      } else if (state instanceof NumberInputtingState) {
        if (key.ascii && KeyHandler.NUMBER_INPUT_KEYS.includes(key.ascii)) {
          const chr = key.ascii;
          if (state.radicals.length >= 20) {
            errorCallback();
            return true;
          }
          const candidates = NumberInputHelper.fillCandidates(state.radicals + chr);
          const joined = state.radicals + chr;
          const newState = new NumberInputtingState({
            radicals: joined,
            selectionKeys: state.selectionKeys,
            exactSelectionKeys: state.exactSelectionKeys!,
            candidates: candidates,
            candidateAnnotation: state.candidateAnnotation,
          });
          stateCallback(newState);
          return true;
        }
      } else if (state instanceof BasicInputtingState || state instanceof AssociatedPhrasesState) {
        if (key.ascii && inputKeys.includes(key.ascii)) {
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
          let joined = state.radicals + chr;
          if (state instanceof AssociatedPhrasesState) {
            joined = chr;
          }

          const displayedConcat = state.displayedRadicals.concat([displayedChr]);
          const candidates = table.lookupForCandidate(joined) || [];
          const newState = new BasicInputtingState({
            radicals: joined,
            displayedRadicals: displayedConcat,
            selectionKeys: selectionKeys,
            candidates: candidates,
          });
          stateCallback(newState);
          return true;
        }
      }

      if (state instanceof BasicInputtingState) {
        let useHomophone =
          this.onRequestSettings().homophoneLookupEnabled &&
          key.ascii === '`' &&
          state.candidates.length > 0;
        if (useHomophone) {
          let selectedWord = state.candidates[state.selectedCandidateIndex ?? 0];
          let bpmfReadings = InputTableManager.getInstance().lookupBpmfReadings(
            selectedWord.displayText,
          );
          if (bpmfReadings.length === 1) {
            let bpmf = bpmfReadings[0][1];
            let words = InputTableManager.getInstance().lookupCandidatesForBpmfRadicals(bpmf);
            let newState = new SelectingHomophoneWordState({
              previousState: state,
              radicals: state.radicals,
              displayedRadicals: state.displayedRadicals,
              selectionKeys: state.selectionKeys,
              candidates: words,
            });
            stateCallback(newState);
            return true;
          } else if (bpmfReadings.length > 1) {
            let menuCandidates: MenuCandidate[] = [];
            for (let bpmfReading of bpmfReadings) {
              let bpmf = bpmfReading[1];
              let candidates =
                InputTableManager.getInstance().lookupCandidatesForBpmfRadicals(bpmf);
              let menu = new MenuCandidate(bpmfReading[0], '', () => {
                let newState = new SelectingHomophoneWordState({
                  previousState: state,
                  radicals: state.radicals,
                  displayedRadicals: state.displayedRadicals,
                  selectionKeys: state.selectionKeys,
                  candidates: candidates,
                });
                stateCallback(newState);
                return true;
              });
              menuCandidates.push(menu);
            }
            let newState = new SelectingHomophoneWordState({
              previousState: state,
              radicals: state.radicals,
              displayedRadicals: state.displayedRadicals,
              selectionKeys: state.selectionKeys,
              candidates: menuCandidates,
            });
            stateCallback(newState);
            return true;
          }
        }
      }

      // Ignore ESC key in inputting state
      if (key.name === KeyName.ESC) {
        stateCallback(new EmptyState('reset from ESC key'));
        return true;
      }

      if (key.name === KeyName.BACKSPACE) {
        if (state instanceof AssociatedPhrasesState) {
          stateCallback(
            new EmptyState('reset after pressing backspace in associated phrases state'),
          );
          return true;
        } else if (state instanceof SymbolCategoryState) {
          stateCallback(state.previousState);
          return true;
        } else if (state instanceof SettingsState) {
          stateCallback(state.previousState);
          return true;
        } else if (state instanceof SelectingHomophoneReadingsState) {
          stateCallback(state.previousState);
          return true;
        } else if (state instanceof SelectingHomophoneWordState) {
          stateCallback(state.previousState);
          return true;
        }

        if (state.radicals.length === 0) {
          stateCallback(new EmptyState('reset after pressing backspace with no radicals'));
          return true;
        }
        const newRadicals = state.radicals.slice(0, -1);
        if (newRadicals.length === 0) {
          stateCallback(new EmptyState('reset after pressing backspace to remove all radicals'));
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
        if (state instanceof NumberInputtingState) {
          const candidates = NumberInputHelper.fillCandidates(newRadicals);
          const newState = new NumberInputtingState({
            radicals: newRadicals,
            selectionKeys: state.selectionKeys,
            exactSelectionKeys: state.exactSelectionKeys!,
            candidates: candidates,
            candidateAnnotation: state.candidateAnnotation,
          });
          stateCallback(newState);
          return true;
        }
        if (state instanceof BasicInputtingState) {
          const newDisplayedRadicals = state.displayedRadicals.slice(0, -1);
          const candidates = table.lookupForCandidate(newRadicals) || [];
          const newState = new BasicInputtingState({
            radicals: newRadicals,
            displayedRadicals: newDisplayedRadicals,
            selectionKeys: state.selectionKeys,
            candidates: candidates,
          });
          stateCallback(newState);
          return true;
        }
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
        stateCallback(new EmptyState('reset after pressing enter in associated phrases state'));
        return false;
      }

      return true; // Printable characters other than input keys are ignored
    }

    errorCallback();
    return true;
  }
}
