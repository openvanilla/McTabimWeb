/**
 * Represents a Hakka syllable parsed from keyboard input.
 *
 * The model separates the alphabetic body from the optional tone marker and
 * exposes helpers for validation and for reconstructing the original key
 * sequence.
 */
export class HakkaSyllable {
  /**
   * Tone-marker keys recognized by the parser.
   */
  static tones = new Map<string, string>([
    ['4', '4'],
    ['6', '6'],
    ['7', '7'],
    ['`', '`'],
    ["'", "'"],
    ['-', '-'],
    ['.', '.'],
  ]);

  private constructor(public letters?: string | undefined, public tone?: string | undefined) {}

  /**
   * Parses a Hakka syllable from a sequence of keyboard keys.
   *
   * Non-letter characters are ignored unless they match a supported tone key.
   *
   * @param keys - The keyboard input to interpret as a Hakka syllable.
   * @returns A parsed syllable instance.
   */
  static fromKeys(keys: string) {
    let letters: string | undefined = undefined;
    let tone: string | undefined = undefined;
    for (const char of keys) {
      if (HakkaSyllable.tones.has(char)) {
        tone = char;
        continue;
      }
      if (char >= 'a' && char <= 'z') {
        if (letters === undefined) {
          letters = char;
        } else {
          letters += char;
        }
      }
    }

    return new HakkaSyllable(letters, tone);
  }

  /**
   * Returns whether the parsed syllable contains a letter sequence.
   */
  get isValid(): boolean {
    if (this.letters === undefined) {
      return false;
    }
    return true;
  }

  /**
   * Returns the normalized key sequence for this syllable.
   */
  get keys(): string {
    return (this.letters ?? '') + (this.tone ?? '');
  }

  /**
   * Returns the rendered Hakka reading for this syllable.
   */
  get reading(): string {
    return (this.letters ?? '') + (this.tone ?? '');
  }
}
