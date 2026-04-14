import { InputTableManager } from '../data';
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
 * Coordinates key handling, input-state transitions, and UI updates.
 *
 * `InputController` is the runtime entry point used by host integrations such
 * as the web demo, ChromeOS IME bridge, and PIME adapter. It owns the current
 * {@link InputState}, forwards normalized keys to {@link KeyHandler}, applies
 * committed text conversion settings, and keeps the configured {@link InputUI}
 * synchronized with the latest composition state.
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

  /**
   * Invoked after the controller accepts a new settings object.
   *
   * A platform-specific host should implement this callback to persist the
   * updated settings.
   */
  onSettingChanged?: ((settings: Settings) => void) | undefined;

  /**
   * Invoked when input handling reports an error and beeps are enabled.
   */
  onError?: (() => void) | undefined;

  /**
   * Returns the active controller settings.
   */
  get settings(): Settings {
    return this.settings_;
  }

  /**
   * Replaces the active controller settings.
   *
   * @param value - The settings object to use for subsequent input handling.
   */
  set settings(value: Settings) {
    if (this.settings_ !== value) {
      this.settings_ = value;
    }
  }

  /**
   * Returns the current input-method state.
   */
  get state(): InputState {
    return this.state_;
  }

  /**
   * Creates an input controller.
   *
   * @param ui_ - The UI bridge that receives reset, update, and commit events.
   * @param keyHandler - Optional key-handler override used primarily by tests.
   */
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
   * Clears any active composition and returns to an empty state.
   *
   * @param reason - A short reason recorded in the resulting {@link EmptyState}.
   */
  reset(reason: string): void {
    this.enterState(this.state_, new EmptyState(reason));
  }

  /**
   * Maps a DOM keyboard event into an internal key and processes it.
   *
   * @param event - The keyboard event raised by the host environment.
   * @returns `true` when the input method consumes the event.
   */
  handleKeyboardEvent(event: KeyboardEvent): boolean {
    const key = KeyMapping.keyFromKeyboardEvent(event);
    return this.handle(key);
  }

  /**
   * Maps a button press from the SimpleKeyboard on-screen keyboard library into
   * an internal key and processes it.
   *
   * @param button - The button label emitted by the SimpleKeyboard web library.
   * @param isShift - Whether the virtual keyboard is currently in shift mode.
   * @param isCtrl - Whether the event should be treated as ctrl-modified input.
   * @returns `true` when the input method consumes the generated key.
   */
  handleSimpleKeyboardEvent(button: string, isShift: boolean, isCtrl: boolean): boolean {
    const key = KeyMapping.keyFromSimpleKeyboardEvent(button, isShift, isCtrl);
    return this.handle(key);
  }

  /**
   * Processes a normalized internal key.
   *
   * @param key - The internal key abstraction produced by a platform mapper.
   * @returns `true` when the key was handled by the input method.
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
   * Chooses a candidate from the currently displayed page.
   *
   * @param index - Zero-based index within the current candidate page.
   */
  selectCandidateAtIndex(index: number): void {
    const oldState = this.state_;
    if (oldState instanceof InputtingState) {
      const candidates = oldState.candidatesInCurrentPage ?? [];
      if (index >= 0 && index < candidates.length) {
        const candidate = candidates[index];
        this.keyHandler_.handleCandidate(oldState, candidate, (state) =>
          this.enterState(oldState, state),
        );
      }
    }
  }

  private enterState(oldState: InputState, newState: InputState): void {
    if (newState instanceof EmptyState) {
      this.handleEmptyState(oldState, newState);
    } else if (newState instanceof CommittingState) {
      this.handleCommittingState(oldState, newState);
      const nextKey = newState.nextKey;
      if (nextKey) {
        this.handle(nextKey);
      }
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
    this.state_ = new EmptyState('reset after committing');
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
