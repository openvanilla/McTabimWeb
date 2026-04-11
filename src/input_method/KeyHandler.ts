import type { InputTableWrapper } from '../data';
import { Candidate, InputTableManager, MenuCandidate } from '../data';
import NumberInputHelper from './HelperNumberInput';
import {
  AssociatedPhrasesState,
  BasicInputtingState,
  CommittingState,
  CtrlSymbolInputtingState,
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
   * @param {Key} [nextKey=undefined] - Optional key to be processed immediately
   *     after committing. Only used when allowAssociatedPhrases is false.
   *     Enables seamless continuous input by passing the key to
   *     CommittingState.
   *
   * Note: The next key parameter is designed for the phonetic tables, where
   * pressing a radical key while candidates are displayed should commit the
   * current selection and immediately process the next key without showing
   * associated phrases. In other states, or when allowAssociatedPhrases is
   * true, the nextKey is ignored and the flow proceeds as usual.
   */
  handleCandidate(
    state: InputtingState,
    selectedCandidate: Candidate,
    stateCallback: (state: InputState) => void,
    allowAssociatedPhrases: boolean = true,
    nextKey: Key | undefined = undefined,
  ): void {
    if (selectedCandidate instanceof MenuCandidate) {
      const newState = selectedCandidate.nextState();
      stateCallback(newState);
      return;
    }
    const commitString = selectedCandidate.displayText;
    const newState = new CommittingState(commitString, nextKey);
    stateCallback(newState);

    // if next key appears, it means a user does not like to choose a candidate
    // from the list but to input another combination. In this case we commit
    // the current candidate and immediately process the next key without
    // showing associated phrases.
    //
    // This is particularly useful for phonetic tables.
    if (nextKey) {
      return;
    }
    const tooltip = (() => {
      if (this.onRequestSettings().reverseRadicalLookupEnabled) {
        const radicalsArray = this.onRequestTable().reverseLookupForRadicals(commitString);
        let joined = radicalsArray.join(', ');
        if (joined.length > 0) {
          if (joined.length > 10) {
            joined = joined.substring(0, 10) + '...';
          }
          return `字根反查: ${joined}`;
        }
      }
      return undefined;
    })();

    if (allowAssociatedPhrases && this.onRequestSettings().associatedPhrasesEnabled) {
      // Commit immediately without nextKey so associated phrases can be displayed

      const phrases = InputTableManager.getInstance().lookUpForAssociatedPhrases(commitString);
      if (phrases && phrases.length > 0) {
        const selectionKeys = state.selectionKeys;
        let exactSelectionKeys = state.selectionKeys;
        let useShiftedKeyCap = false;
        if (selectionKeys === KeyHandler.COMMON_SELECTION_KEYS) {
          exactSelectionKeys = KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS;
          useShiftedKeyCap = true;
        } else if (selectionKeys === KeyHandler.COMMON_SELECTION_KEYS2) {
          exactSelectionKeys = KeyHandler.ASSOCIATED_PHRASES_SELECTION_KEYS2;
          useShiftedKeyCap = true;
        }

        const associatedPhrasesState = new AssociatedPhrasesState({
          selectionKeys: selectionKeys,
          exactSelectionKeys: exactSelectionKeys,
          candidates: phrases,
          tooltip: tooltip,
          useShiftedKeyCap: useShiftedKeyCap,
        });
        stateCallback(associatedPhrasesState);
      }
    } else if (tooltip && !nextKey) {
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

  private handleCtrlPressed(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
  ): boolean | undefined {
    const ctrlKeySymbols = InputTableManager.getInstance().ctrlKeySymbols;
    let ascii = key.ascii.toLowerCase();
    if (key.shiftPressed) {
      const map: { [key: string]: string } = {
        '1': '!',
        '2': '@',
        '3': '#',
        '4': '$',
        '5': '%',
        '6': '^',
        '7': '&',
        '8': '*',
        '9': '(',
        '0': ')',
        '-': '_',
        '=': '+',
        '[': '{',
        ']': '}',
        '\\': '|',
        ';': ':',
        "'": '"',
        ',': '<',
        '.': '>',
        '/': '?',
      };
      if (map.hasOwnProperty(ascii)) {
        ascii = map[ascii];
      }
    }

    if (ctrlKeySymbols.keynames.includes(ascii)) {
      if (state instanceof CtrlSymbolInputtingState) {
        const symbol = state.candidates[0].displayText;
        stateCallback(new CommittingState(symbol));
      }
      {
        const condidates = ctrlKeySymbols.chardefs[ascii];
        const newState = new CtrlSymbolInputtingState({
          radicals: ascii,
          selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
          candidates: condidates.map((chr) => new Candidate(chr, '')),
        });
        stateCallback(newState);
        return true;
      }
    }
    if (!(state instanceof EmptyState)) {
      return true;
    }
    return false;
  }

  private handleAssociatedPhraseSelection(
    key: Key,
    state: AssociatedPhrasesState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean | undefined {
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
    return undefined;
  }

  private handleEmptyOrUnfocusedState(
    key: Key,
    state: EmptyState | AssociatedPhrasesState | TooltipOnlyState | CommittingState,
    inputKeys: string[],
    stateCallback: (state: InputState) => void,
  ): boolean | undefined {
    const settings = this.onRequestSettings();
    const table = this.onRequestTable();
    const shiftLetterSymbols = InputTableManager.getInstance().shiftLetterSymbols;
    const shiftPunctuationsSymbols = InputTableManager.getInstance().shiftPunctuationsSymbols;

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
      const radical = key.ascii;
      const displayedRadicals = (() => {
        const syllable = table.createSyllable(radical);
        if (syllable) {
          return syllable.reading.split('');
        }
        return [table.lookUpForDisplayedKeyName(radical) || radical];
      })();
      let selectionKeys = table.table.selkey;
      if (selectionKeys === undefined || selectionKeys.length === 0) {
        selectionKeys = KeyHandler.COMMON_SELECTION_KEYS;
      }

      const candidates = (() => {
        if (table.isPhoneticTable) {
          return [];
        } else {
          return table.lookupForCandidate(radical) || [];
        }
      })();

      const newState = new BasicInputtingState({
        radicals: radical,
        displayedRadicals: displayedRadicals,
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
            displayedRadicals: ['[符]' + components[0]],
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
    return undefined;
  }

  private handleReturnOrSpace(
    key: Key,
    state: InputtingState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean | undefined {
    const table = this.onRequestTable();

    if (state instanceof AssociatedPhrasesState) {
      if (key.name === KeyName.RETURN) {
        if (state.candidates.length > 0) {
          const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
          this.handleCandidate(state, selectedCandidate, stateCallback);
          return true;
        }
      } else if (key.name === KeyName.SPACE) {
        const newState = new CommittingState(' ');
        stateCallback(newState);
        return true;
      }
      return true;
    }

    if (state instanceof BasicInputtingState && table.isPhoneticTable) {
      if (state.candidates.length > 0) {
        if (key.name === KeyName.RETURN) {
          const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
          this.handleCandidate(state, selectedCandidate, stateCallback);
          return true;
        }
        if (key.name === KeyName.SPACE) {
          // page down
          const candidatesPerPage = state.selectionKeys.length;
          const newIndex = Math.min(
            (Math.floor((state.selectedCandidateIndex ?? 0) / candidatesPerPage) + 1) *
              candidatesPerPage,
            state.candidates.length - 1,
          );
          const newState = state.copyWithArgs({
            selectedCandidateIndex: newIndex,
          });
          stateCallback(newState);
          return true;
        }
      }

      const syllable = table.createSyllable(state.radicals);
      if (syllable === undefined) {
        return true;
      }
      const radicals = syllable.keys;
      const candidates = table.lookupForCandidate(radicals);
      if (candidates.length === 0) {
        if (this.onRequestSettings().clearOnErrors) {
          errorCallback();
          stateCallback(new EmptyState('reset after error'));
          return true;
        }
      }
      const newState = new BasicInputtingState({
        radicals: radicals,
        displayedRadicals: syllable.reading.split(''),
        selectionKeys: KeyHandler.COMMON_SELECTION_KEYS,
        candidates: candidates,
      });
      stateCallback(newState);
      return true;
    }

    // non-bpmf

    if (state.candidates.length > 0) {
      const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
      const allowAssociatedPhrases = !(state instanceof AssociatedPhrasesState);
      this.handleCandidate(state, selectedCandidate, stateCallback, allowAssociatedPhrases);
    } else {
      errorCallback();
      if (this.onRequestSettings().clearOnErrors) {
        stateCallback(new EmptyState('reset after error'));
      }
    }
    return true;
  }

  private handleCandidateSelection(
    key: Key,
    state: InputtingState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean | undefined {
    const table = this.onRequestTable();

    if (!(state instanceof AssociatedPhrasesState) && state.candidates.length > 0) {
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
      } else if (state instanceof BasicInputtingState && table.isPhoneticTable) {
        if (key.name === KeyName.ESC) {
          stateCallback(new EmptyState('reset from ESC key'));
          return true;
        }
        if (key.name === KeyName.BACKSPACE) {
          stateCallback(new EmptyState('reset from BACKSPACE key'));
          return true;
        }
        if (key.ascii.length === 1) {
          if (!Object.keys(table.table?.keynames || {}).includes(key.ascii)) {
            errorCallback();
            return true;
          }
          const candidates = state.candidatesInCurrentPage;
          if (candidates === undefined || candidates.length === 0) {
            errorCallback();
            return true;
          }
          const index = state.selectedCandidateIndex ?? 0;
          if (index > candidates.length - 1) {
            errorCallback();
            return true;
          }
          const selectedCandidate = candidates[index];
          this.handleCandidate(state, selectedCandidate, stateCallback, true, key);
          return true;
        }
      }
    }
    return undefined;
  }

  private handleSymbolOrNumberOrBasic(
    key: Key,
    state: InputtingState,
    inputKeys: string[],
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean | undefined {
    const table = this.onRequestTable();

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
    } else if (
      state instanceof BasicInputtingState ||
      state instanceof AssociatedPhrasesState ||
      state instanceof CtrlSymbolInputtingState
    ) {
      if (key.ascii && inputKeys.includes(key.ascii)) {
        if (state instanceof CtrlSymbolInputtingState) {
          const symbol = state.candidates[0].displayText;
          stateCallback(new CommittingState(symbol));
        }

        let selectionKeys = table.table.selkey;
        if (selectionKeys === undefined || selectionKeys.length === 0) {
          selectionKeys = KeyHandler.COMMON_SELECTION_KEYS;
        }

        if (!table.isPhoneticTable && state.radicals.length >= table.settings.maxRadicals) {
          errorCallback();
          return true;
        }

        const chr = key.ascii;
        let joined = state.radicals + chr;

        if (state instanceof BasicInputtingState && table.isPhoneticTable) {
          const newSyllable = table.createSyllable(joined);
          if (newSyllable === undefined) {
            return true;
          }
          let candidates: Candidate[] = [];
          if (newSyllable.tone !== undefined) {
            let shouldClear = !newSyllable.isValid;
            if (!shouldClear) {
              const keys = newSyllable.keys;
              candidates = table.lookupForCandidate(keys);
              if (candidates.length === 0) {
                shouldClear = true;
              }
            }
            if (shouldClear) {
              if (this.onRequestSettings().clearOnErrors) {
                errorCallback();
                stateCallback(new EmptyState('Invalid input'));
                return true;
              }
            }
          }

          const newState = new BasicInputtingState({
            radicals: newSyllable.keys,
            displayedRadicals: newSyllable.reading.split(''),
            selectionKeys: state.selectionKeys,
            candidates: candidates,
          });
          stateCallback(newState);
          return true;
        }

        let currentDisplayed = state.displayedRadicals;
        if (state instanceof AssociatedPhrasesState || state instanceof CtrlSymbolInputtingState) {
          joined = chr;
          currentDisplayed = [];
        }

        const displayedChr = table.lookUpForDisplayedKeyName(chr) || chr;
        const displayedConcat = currentDisplayed.concat([displayedChr]);
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
        key.ascii === '`' &&
        !table.isPhoneticTable &&
        this.onRequestSettings().homophoneLookupEnabled &&
        state.candidates.length > 0;

      if (useHomophone) {
        let selectedWord = state.candidates[state.selectedCandidateIndex ?? 0];
        let bpmfReadings = InputTableManager.getInstance().lookupBpmfReadings(
          selectedWord.displayText,
        );
        if (bpmfReadings.length === 1) {
          let bpmfRadical = bpmfReadings[0][1];
          let displayedReading = bpmfReadings[0][0];

          let words = InputTableManager.getInstance().lookupCandidatesForBpmfRadicals(bpmfRadical);

          let newState = new SelectingHomophoneWordState({
            displayedBpmf: displayedReading,
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
            let bpmfRadical = bpmfReading[1];
            let displayedReading = bpmfReading[0];
            let candidates =
              InputTableManager.getInstance().lookupCandidatesForBpmfRadicals(bpmfRadical);
            let menu = new MenuCandidate(displayedReading, '', () => {
              let newState = new SelectingHomophoneWordState({
                displayedBpmf: displayedReading,
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
            displayedBpmf: '',
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
    return undefined;
  }

  private handleBackspace(
    key: Key,
    state: InputtingState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    const table = this.onRequestTable();

    if (state instanceof AssociatedPhrasesState) {
      stateCallback(new EmptyState('reset after pressing backspace in associated phrases state'));
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
      if (table.isPhoneticTable) {
        const newSyllable = table.createSyllable(newRadicals);
        if (newSyllable === undefined) {
          return true;
        }
        const newDisplayedRadicals = newSyllable.reading.split('');
        const newState = new BasicInputtingState({
          radicals: newRadicals,
          displayedRadicals: newDisplayedRadicals,
          selectionKeys: state.selectionKeys,
          candidates: [],
        });
        stateCallback(newState);
        return true;
      }

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

  private handleNavigation(
    key: Key,
    state: InputtingState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean | undefined {
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
          (Math.floor((state.selectedCandidateIndex ?? 0) / candidatesPerPage) + 1) *
            candidatesPerPage,
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
    return undefined;
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
    const table = this.onRequestTable();
    const settings = this.onRequestSettings();

    if (key.ctrlPressed) {
      const res = this.handleCtrlPressed(key, state, stateCallback);
      if (res !== undefined) return res;
    }

    if (state instanceof AssociatedPhrasesState) {
      const res = this.handleAssociatedPhraseSelection(key, state, stateCallback, errorCallback);
      if (res !== undefined) return res;
    }

    let inputKeys = Object.keys(table.table?.keynames || {});
    if (settings.wildcardMatchingEnabled) {
      inputKeys = inputKeys.concat(['*']);
    }

    if (
      state instanceof EmptyState ||
      state instanceof AssociatedPhrasesState ||
      state instanceof TooltipOnlyState ||
      state instanceof CommittingState
    ) {
      const res = this.handleEmptyOrUnfocusedState(key, state, inputKeys, stateCallback);
      if (res !== undefined) return res;
    }

    if (state instanceof InputtingState) {
      if (key.name === KeyName.RETURN || key.name === KeyName.SPACE) {
        const res = this.handleReturnOrSpace(key, state, stateCallback, errorCallback);
        if (res !== undefined) return res;
      }

      let res = this.handleCandidateSelection(key, state, stateCallback, errorCallback);
      if (res !== undefined) return res;

      res = this.handleSymbolOrNumberOrBasic(key, state, inputKeys, stateCallback, errorCallback);
      if (res !== undefined) return res;

      if (key.name === KeyName.ESC) {
        stateCallback(new EmptyState('reset from ESC key'));
        return true;
      }

      if (key.name === KeyName.BACKSPACE) {
        return this.handleBackspace(key, state, stateCallback, errorCallback);
      }

      res = this.handleNavigation(key, state, stateCallback, errorCallback);
      if (res !== undefined) return res;

      if (state instanceof AssociatedPhrasesState) {
        if (key.ascii === 'Shift' || key.ascii === 'Ctrl' || key.ascii === 'Alt') {
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
