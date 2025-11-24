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
  };

  onSettingChanged?: ((settings: Settings) => void) | undefined;
  onError?: (() => void) | undefined;

  get isPime(): boolean {
    return this.keyHandler_.isPime;
  }

  set isPime(value: boolean) {
    this.keyHandler_.isPime = value;
  }

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

  reset(reason: string): void {
    this.enterState(this.state_, new EmptyState(reason));
  }

  handleKeyboardEvent(event: KeyboardEvent): boolean {
    const key = KeyMapping.keyFromKeyboardEvent(event);
    return this.handle(key);
  }

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
    const builder = new InputUIStateBuilder(newState, this.isPime);
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
