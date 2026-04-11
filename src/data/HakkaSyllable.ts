export class HakkaSyllable {
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
   * Creates a HakkaSyllable from a string of keys.
   * @param keys A string containing the keyboard keys for the syllable.
   * @returns A new HakkaSyllable instance.
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

  get isValid(): boolean {
    if (this.letters === undefined) {
      return false;
    }
    return true;
  }

  /**
   * Returns the string of keys representing this syllable.
   */
  get keys(): string {
    return (this.letters ?? '') + (this.tone ?? '');
  }

  /**
   * Returns the Hakka reading of this syllable.
   */
  get reading(): string {
    return (this.letters ?? '') + (this.tone ?? '');
  }
}
