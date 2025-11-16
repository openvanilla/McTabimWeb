import { InputTable, InputTableWrapper } from '../data';
import { CommittingState, EmptyState, InputState, InputtingState } from './InputState';
import { Key, KeyName } from './Key';

export class KeyHandler {
  onGetTable: () => InputTableWrapper;

  constructor(onGetTable: () => InputTableWrapper) {
    this.onGetTable = onGetTable;
  }

  handle(
    key: Key,
    state: InputState,
    stateCallback: (state: InputState) => void,
    errorCallback: () => void,
  ): boolean {
    const table = this.onGetTable();
    const inputKeys = Object.keys(table.table.keynames);
    // console.log('Handling key:', key, 'in state:', state);
    // console.log('inputKeys:', inputKeys);

    if (state instanceof EmptyState) {
      if (!inputKeys.includes(key.ascii)) {
        return false;
      } else {
        let chr = key.ascii;
        let displayedChr = table.lookUpForDisplayedKeyName(chr) || chr;
        let selectionKeys = table.table.selkey;
        if (selectionKeys === undefined || selectionKeys.length === 0) {
          selectionKeys = '1234567890';
        }
        if (state instanceof EmptyState) {
          let candidates = table.lookupForCandidate(chr) || [];
          const newState = new InputtingState({
            radicals: chr,
            displayedRadicals: displayedChr,
            selectionKeys: selectionKeys,
            candidates: candidates,
          });
          stateCallback(newState);
          return true;
        }
      }
    }

    if (state instanceof InputtingState) {
      // Perhaps handle tab key to commit the current candidate
      if (key.name === KeyName.RETURN) {
        if (state.candidates.length > 0) {
          const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
          const newState = new CommittingState(selectedCandidate.displayText);
          stateCallback(newState);
        } else {
          errorCallback;
        }
        return true;
      }

      let selectionKeys = state.selectionKeys;
      if (selectionKeys.includes(key.ascii)) {
        let candidates = state.candidatesInCurrentPage;
        if (candidates === undefined || candidates.length === 0) {
          errorCallback();
        } else {
          const index = selectionKeys.indexOf(key.ascii);
          if (index > candidates.length - 1) {
            errorCallback();
            return true;
          }
          const selectedCandidate = candidates[index];
          const newState = new CommittingState(selectedCandidate.displayText);
          stateCallback(newState);
        }
        return true;
      }

      if (inputKeys.includes(key.ascii)) {
        let chr = key.ascii;
        let displayedChr = table.lookUpForDisplayedKeyName(chr) || chr;
        let selectionKeys = table.table.selkey;
        if (selectionKeys === undefined || selectionKeys.length === 0) {
          selectionKeys = '1234567890';
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

      if (key.name === KeyName.SPACE) {
        if (state.candidates.length === 0) {
          return true;
        }
        const selectedCandidate = state.candidates[state.selectedCandidateIndex ?? 0];
        const newState = new CommittingState(selectedCandidate.displayText);
        stateCallback(newState);
        return true;
      }

      // Ignore ESC key in inputting state
      if (key.name === KeyName.ESC) {
        stateCallback(new EmptyState());
        return true;
      }

      if (key.name === KeyName.BACKSPACE) {
        if (state.radicals.length === 0) {
          stateCallback(new EmptyState());
          return true;
        }
        let newRadicals = state.radicals.slice(0, -1);
        if (newRadicals.length === 0) {
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
          const newState = new InputtingState({
            radicals: state.radicals,
            displayedRadicals: state.displayedRadicals,
            selectionKeys: state.selectionKeys,
            candidates: state.candidates,
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
          const newState = new InputtingState({
            radicals: state.radicals,
            displayedRadicals: state.displayedRadicals,
            selectionKeys: state.selectionKeys,
            candidates: state.candidates,
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
          const newState = new InputtingState({
            radicals: state.radicals,
            displayedRadicals: state.displayedRadicals,
            selectionKeys: state.selectionKeys,
            candidates: state.candidates,
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
          const newState = new InputtingState({
            radicals: state.radicals,
            displayedRadicals: state.displayedRadicals,
            selectionKeys: state.selectionKeys,
            candidates: state.candidates,
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
