/**
 * Represents a single Bopomofo (Zhuyin) syllable, consisting of an optional
 * consonant, middle vowel, final vowel, and tone.
 */
export class BopomofoWslSyllable {
  /**
   * Maps keyboard keys to Bopomofo consonants.
   */
  static consonants = new Map<string, string>([
    ['1', 'ㄅ'],
    ['!', 'ㆠ'],
    ['q', 'ㄆ'],
    ['a', 'ㄇ'],
    ['A', 'ㆬ'],
    ['z', 'ㄈ'],
    ['2', 'ㄉ'],
    ['@', '.ㄉ'],
    ['w', 'ㄊ'],
    ['s', 'ㄋ'],
    ['x', 'ㄌ'],
    ['e', 'ㄍ'],
    ['E', 'ㆣ'],
    ['d', 'ㄎ'],
    ['\\', 'ㄫ'],
    ['c', 'ㄏ'],
    ['C', 'ㄬ'],
    ['r', 'ㄐ'],
    ['R', 'ㆢ'],
    ['f', 'ㄑ'],
    ['v', 'ㄒ'],
    ['5', 'ㄓ'],
    ['t', 'ㄔ'],
    ['g', 'ㄕ'],
    ['b', 'ㄖ'],
    ['y', 'ㄗ'],
    ['Y', 'ㆡ'],
    ['h', 'ㄘ'],
    ['n', 'ㄙ'],
  ]);

  /**
   * Maps keyboard keys to Bopomofo middle vowels (ㄧ, ㄨ, ㄩ).
   */
  static middleVowels = new Map<string, string>([
    ['u', 'ㄧ'],
    ['U', 'ㆪ'],
    ['j', 'ㄨ'],
    ['J', 'ㆫ'],
    ['`', 'ㆨ'],
    ['m', 'ㄩ'],
  ]);

  /**
   * Maps keyboard keys to Bopomofo final vowels.
   */
  static finalVowels = new Map<string, string>([
    ['8', 'ㄚ'],
    ['*', 'ㆩ'],
    ['i', 'ㄛ'],
    ['k', 'ㄜ'],
    [',', 'ㄝ'],
    ['<', 'ㆥ'],
    ['9', 'ㄞ'],
    ['o', 'ㄟ'],
    ['l', 'ㄠ'],
    ['L', 'ㆯ'],
    ['.', 'ㄡ'],
    ['0', 'ㄢ'],
    ['p', 'ㄣ'],
    [';', 'ㄤ'],
    ['/', 'ㄥ'],
    ['-', 'ㄦ'],
    ['=', 'ㆦ'],
    ['+', 'ㆧ'],
    ['|', 'ㆭ'],
    ['[', 'ㆰ'],
    [']', 'ㆱ'],
    ["'", 'ㆲ'],
  ]);

  /**
   * Maps keyboard keys to Bopomofo tones.
   *
   * - 第一、二、三、五聲對應華音一、四、三、二聲輸入鍵
   * - 第四聲為 $
   * - 第八聲為 ^
   * - 第六聲與第二聲相同
   * - 第七聲為 7
   * - 輕聲為 &
   */
  static tones = new Map<string, string>([
    ['3', '˪'],
    ['4', 'ˋ'],
    ['6', 'ˊ'],
    ['7', '˫'],
    ['$', 'ㄅ, ㄉ, ㄍ, ㄏ'],
    ['^', 'ㄅ̇, ㄉ̇, ㄍ̇, ㄏ̇'],
    ['7', '˫'],
    ['&', '˙'],
  ]);

  private constructor(
    public consonant?: string | undefined,
    public middleVowel?: string[] | undefined,
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
    let middleVowel: string[] | undefined = undefined;
    let finalVowel: string | undefined = undefined;
    let tone: string | undefined = undefined;
    for (const char of keys) {
      if (BopomofoWslSyllable.consonants.has(char)) {
        consonant = char;
      } else if (BopomofoWslSyllable.middleVowels.has(char)) {
        if (middleVowel === undefined) {
          middleVowel = [];
        }
        middleVowel.push(char);
      } else if (BopomofoWslSyllable.finalVowels.has(char)) {
        finalVowel = char;
      } else if (BopomofoWslSyllable.tones.has(char)) {
        tone = char;
      }
    }

    return new BopomofoWslSyllable(consonant, middleVowel, finalVowel, tone);
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
      ['5', 't', 'g', 'b', 'Y', 'y', 'h', 'n'].includes(this.consonant)
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
      for (const middleVowel of this.middleVowel) {
        output += middleVowel;
      }
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
      output += BopomofoWslSyllable.consonants.get(this.consonant);
    }
    if (this.middleVowel) {
      for (const middleVowel of this.middleVowel) {
        output += BopomofoWslSyllable.middleVowels.get(middleVowel);
      }
    }
    if (this.finalVowel) {
      output += BopomofoWslSyllable.finalVowels.get(this.finalVowel);
    }
    if (this.tone) {
      output += BopomofoWslSyllable.tones.get(this.tone);
    }
    return output;
  }
}
