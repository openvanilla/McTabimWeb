import { InputTableManager, MenuCandidate } from '../data';
import {
  CommittingState,
  EmptyState,
  InputState,
  InputtingState,
  TooltipOnlyState,
} from './InputState';
import { InputUI } from './InputUI';
import { InputUIStateBuilder, TooltipOnlyStateBuilder } from './InputUIElements';
import { Key } from './Key';
import { KeyHandler } from './KeyHandler';
import { KeyMapping } from './KeyMapping';
import { Settings } from './Settings';

const ChineseConvert = require('chinese_convert');

/**
 * The main controller for the input method.
 *
 * This class is responsible for managing the state of the input method,
 * handling user input, and interacting with the UI. It acts as the central
 * hub of the input method, coordinating the activities of the other
 * components.
 *
 * The `InputController` maintains the current state of the input method, which
 * can be one of several states, such as "empty", "inputting", or
 * "committing". It receives user input in the form of keyboard events, and
 * then passes them to the `KeyHandler` to be processed. The `KeyHandler`
 * then determines the next state of the input method, and the
 * `InputController` transitions to that state.
 *
 * The `InputController` also interacts with the UI to display the current
 * state of the input method, such as the current input, the list of
 * candidates, and any error messages.
 */
export class InputController {
  private state_: InputState = new EmptyState();
  private keyHandler_: KeyHandler;
  private settings_: Settings = {
    chineseConversionEnabled: false,
    associatedPhrasesEnabled: false,
    shiftPunctuationForSymbolsEnabled: true,
    shiftLetterForSymbolsEnabled: true,
    wildcardMatchingEnabled: false,
    clearOnErrors: false,
    beepOnErrors: false,
    reverseRadicalLookupEnabled: false,
    homophoneLookupEnabled: true,
  };

  onSettingChanged?: ((settings: Settings) => void) | undefined;
  onError?: (() => void) | undefined;

  get settings(): Settings {
    return this.settings_;
  }

  set settings(value: Settings) {
    if (this.settings_ !== value) {
      this.settings_ = value;
    }
  }

  get state(): InputState {
    return this.state_;
  }

  constructor(private ui_: InputUI, keyHandler?: KeyHandler) {
    this.keyHandler_ =
      keyHandler ??
      new KeyHandler(
        () => InputTableManager.getInstance().currentTable,
        () => this.settings_ as Settings,
        (settings) => {
          this.settings_ = settings;
          this.onSettingChanged?.(this.settings_);
        },
      );
  }

  /**
   * Resets the input controller to its initial state.
   *
   * @param {string} reason - The reason for resetting the controller.
   */
  reset(reason: string): void {
    this.enterState(this.state_, new EmptyState(reason));
  }

  /**
   * Handles a keyboard event.
   *
   * @param {KeyboardEvent} event - The keyboard event to handle.
   * @returns {boolean} - True if the event was handled, false otherwise.
   */
  handleKeyboardEvent(event: KeyboardEvent): boolean {
    const key = KeyMapping.keyFromKeyboardEvent(event);
    return this.handle(key);
  }

  /**
   * Handles a key.
   *
   * @param {Key} key - The key to handle.
   * @returns {boolean} - True if the key was handled, false otherwise.
   */
  handle(key: Key): boolean {
    const handled = this.keyHandler_.handle(
      key,
      this.state_,
      (state) => this.enterState(this.state_, state),
      () => {
        if (this.onError && this.settings_.beepOnErrors) {
          this.onError();
        }
      },
    );
    if (!handled) {
      this.ui_.reset();
    }
    return handled;
  }

  /**
   * Selects a candidate at the given index.
   *
   * @param {number} index - The index of the candidate to select.
   */
  selectCandidateAtIndex(index: number): void {
    const oldState = this.state_;
    if (oldState instanceof InputtingState) {
      const candidates = oldState.candidatesInCurrentPage ?? [];
      if (index >= 0 && index < candidates.length) {
        const candidate = candidates[index];
        if (candidate instanceof MenuCandidate) {
          const newState = candidate.nextState();
          this.enterState(oldState, newState);
        } else {
          this.ui_.commitString(candidate.displayText);
          // this.ui_.reset();
          const newState = new EmptyState('reset after candidate selection');
          this.enterState(oldState, newState);
        }
      }
    }
  }

  private enterState(oldState: InputState, newState: InputState): void {
    if (newState instanceof EmptyState) {
      this.handleEmptyState(oldState, newState);
    } else if (newState instanceof CommittingState) {
      this.handleCommittingState(oldState, newState);
    } else if (newState instanceof InputtingState) {
      this.handleInputtingState(oldState, newState);
    } else if (newState instanceof TooltipOnlyState) {
      this.handleTooltipOnlyState(oldState, newState);
    }
  }

  private handleEmptyState(oldState: InputState, newState: EmptyState): void {
    this.ui_.reset();
    this.state_ = newState;
  }

  private handleCommittingState(oldState: InputState, newState: CommittingState): void {
    let commitString = newState.commitString;
    if (this.settings_.chineseConversionEnabled) {
      commitString = ChineseConvert.tw2cn(commitString);
    } else {
      commitString = ChineseConvert.cn2tw(commitString);
    }
    this.ui_.commitString(commitString);
    this.ui_.reset();
    this.state_ = new EmptyState();
  }

  private handleInputtingState(oldState: InputState, newState: InputtingState): void {
    const builder = new InputUIStateBuilder(newState);
    const uiState = builder.buildJsonString();
    this.ui_.reset();
    this.ui_.update(uiState);
    this.state_ = newState;
  }

  private handleTooltipOnlyState(oldState: InputState, newState: TooltipOnlyState) {
    const builder = new TooltipOnlyStateBuilder(newState);
    const uiState = builder.buildJsonString();
    this.ui_.reset();
    this.ui_.update(uiState);
    this.state_ = newState;
  }
}
