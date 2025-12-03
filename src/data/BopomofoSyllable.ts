export class BopomofoSyllable {
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

  static middleVowels = new Map<string, string>([
    ['u', 'ㄧ'],
    ['j', 'ㄨ'],
    ['m', 'ㄩ'],
  ]);

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
