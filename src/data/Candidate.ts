import { InputState } from '../input_method/InputState';

export class Candidate {
  readonly displayText: string;
  readonly description: string;

  constructor(displayText: string, description: string) {
    this.displayText = displayText;
    this.description = description;
  }
}

export class MenuCandidate extends Candidate {
  readonly nextState: () => InputState;

  constructor(displayText: string, description: string, nextState: () => InputState) {
    super(displayText, description);
    this.nextState = nextState;
  }
}
