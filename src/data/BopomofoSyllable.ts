/**
 * Represents a single Bopomofo (Zhuyin) syllable, consisting of an optional
 * consonant, middle vowel, final vowel, and tone.
 */
export class BopomofoSyllable {
  /**
   * Maps keyboard keys to Bopomofo consonants.
   */
  static consonants = new Map<string, string>([
    ['1', 'ㄅ'],
    ['q', 'ㄆ'],
    ['a', 'ㄇ'],
    ['z', 'ㄈ'],
    ['2', 'ㄉ'],
    ['w', 'ㄊ'],
    ['s', 'ㄋ'],
    ['x', 'ㄌ'],
    ['e', 'ㄍ'],
    ['d', 'ㄎ'],
    ['c', 'ㄏ'],
    ['r', 'ㄐ'],
    ['f', 'ㄑ'],
    ['v', 'ㄒ'],
    ['5', 'ㄓ'],
    ['t', 'ㄔ'],
    ['g', 'ㄕ'],
    ['b', 'ㄖ'],
    ['y', 'ㄗ'],
    ['h', 'ㄘ'],
    ['n', 'ㄙ'],
  ]);

  /**
   * Maps keyboard keys to Bopomofo middle vowels (ㄧ, ㄨ, ㄩ).
   */
  static middleVowels = new Map<string, string>([
    ['u', 'ㄧ'],
    ['j', 'ㄨ'],
    ['m', 'ㄩ'],
  ]);

  /**
   * Maps keyboard keys to Bopomofo final vowels.
   */
  static finalVowels = new Map<string, string>([
    ['8', 'ㄚ'],
    ['i', 'ㄛ'],
    ['k', 'ㄜ'],
    [',', 'ㄝ'],
    ['9', 'ㄞ'],
    ['o', 'ㄟ'],
    ['l', 'ㄠ'],
    ['.', 'ㄡ'],
    ['0', 'ㄢ'],
    ['p', 'ㄣ'],
    [';', 'ㄤ'],
    ['/', 'ㄥ'],
    ['-', 'ㄦ'],
  ]);

  /**
   * Maps keyboard keys to Bopomofo tones.
   */
  static tones = new Map<string, string>([
    ['3', 'ˇ'],
    ['4', 'ˋ'],
    ['6', 'ˊ'],
    ['7', '˙'],
  ]);

  private constructor(
    public consonant?: string | undefined,
    public middleVowel?: string | undefined,
    public finalVowel?: string | undefined,
    public tone?: string | undefined,
  ) {}

  /**
   * Creates a BopomofoSyllable from a string of keys.
   * @param keys A string containing the keyboard keys for the syllable.
   * @returns A new BopomofoSyllable instance.
   */
  static fromKeys(keys: string) {
    let consonant: string | undefined = undefined;
    let middleVowel: string | undefined = undefined;
    let finalVowel: string | undefined = undefined;
    let tone: string | undefined = undefined;
    for (const char of keys) {
      if (BopomofoSyllable.consonants.has(char)) {
        consonant = char;
      } else if (BopomofoSyllable.middleVowels.has(char)) {
        middleVowel = char;
      } else if (BopomofoSyllable.finalVowels.has(char)) {
        finalVowel = char;
      } else if (BopomofoSyllable.tones.has(char)) {
        tone = char;
      }
    }
    return new BopomofoSyllable(consonant, middleVowel, finalVowel, tone);
  }

  /**
   * Checks if the current syllable is valid according to Bopomofo rules. A
   * syllable is valid if:
   * 1. It has a middle vowel.
   * 2. It has a final vowel.
   * 3. It has a specific consonant that can stand alone (e.g., ㄓ, ㄔ, ㄕ, ㄖ,
   *    ㄗ, ㄘ, ㄙ).
   */
  get isValid(): boolean {
    if (this.middleVowel !== undefined) {
      return true;
    }
    if (this.finalVowel !== undefined) {
      return true;
    }
    if (
      this.consonant !== undefined &&
      ['5', 't', 'g', 'b', 'y', 'h', 'n'].includes(this.consonant)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Returns the string of keys representing this syllable.
   */
  get keys(): string {
    let output = '';
    if (this.consonant) {
      output += this.consonant;
    }
    if (this.middleVowel) {
      output += this.middleVowel;
    }
    if (this.finalVowel) {
      output += this.finalVowel;
    }
    if (this.tone) {
      output += this.tone;
    }
    return output;
  }

  /**
   * Returns the Bopomofo reading of this syllable (e.g., "ㄅㄚˇ").
   */
  get reading(): string {
    let output = '';
    if (this.consonant) {
      output += BopomofoSyllable.consonants.get(this.consonant);
    }
    if (this.middleVowel) {
      output += BopomofoSyllable.middleVowels.get(this.middleVowel);
    }
    if (this.finalVowel) {
      output += BopomofoSyllable.finalVowels.get(this.finalVowel);
    }
    if (this.tone) {
      output += BopomofoSyllable.tones.get(this.tone);
    }
    return output;
  }
}
