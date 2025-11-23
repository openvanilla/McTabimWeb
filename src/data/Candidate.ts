import { InputState } from '../input_method/InputState';

export class Candidate {
  constructor(
    readonly displayText: string,
    readonly description: string,
  ) {}
}

export class MenuCandidate extends Candidate {
  constructor(
    displayText: string,
    description: string,
    readonly nextState: () => InputState,
  ) {
    super(displayText, description);
  }
}
