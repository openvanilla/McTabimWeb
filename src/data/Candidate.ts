import { InputState } from '../input_method/InputState';

/**
 * Represents a candidate for selection in the input method.
 */
export class Candidate {
  /**
   * @param displayText The text to display for the candidate.
   * @param description A description of the candidate.
   */
  constructor(readonly displayText: string, readonly description: string) {}
}

/**
 * Represents a candidate that transitions the input method to a new state upon
 * selection.
 */
export class MenuCandidate extends Candidate {
  /**
   * @param displayText The text to display for the candidate.
   * @param description A description of the candidate.
   * @param nextState A function that returns the next state of the input
   * method.
   */
  constructor(displayText: string, description: string, readonly nextState: () => InputState) {
    super(displayText, description);
  }
}
