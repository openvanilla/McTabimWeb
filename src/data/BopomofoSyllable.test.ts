
import { BopomofoSyllable } from './BopomofoSyllable';

describe('BopomofoSyllable', () => {
  it('test fromKeys', () => {
    let syllable = BopomofoSyllable.fromKeys('1');
    expect(syllable.consonant).toBe('1');
    expect(syllable.middleVowel).toBe(undefined);
    expect(syllable.finalVowel).toBe(undefined);
    expect(syllable.tone).toBe(undefined);

    syllable = BopomofoSyllable.fromKeys('u');
    expect(syllable.consonant).toBe(undefined);
    expect(syllable.middleVowel).toBe('u');
    expect(syllable.finalVowel).toBe(undefined);
    expect(syllable.tone).toBe(undefined);

    syllable = BopomofoSyllable.fromKeys('8');
    expect(syllable.consonant).toBe(undefined);
    expect(syllable.middleVowel).toBe(undefined);
    expect(syllable.finalVowel).toBe('8');
    expect(syllable.tone).toBe(undefined);

    syllable = BopomofoSyllable.fromKeys('3');
    expect(syllable.consonant).toBe(undefined);
    expect(syllable.middleVowel).toBe(undefined);
    expect(syllable.finalVowel).toBe(undefined);
    expect(syllable.tone).toBe('3');

    syllable = BopomofoSyllable.fromKeys('1u83');
    expect(syllable.consonant).toBe('1');
    expect(syllable.middleVowel).toBe('u');
    expect(syllable.finalVowel).toBe('8');
    expect(syllable.tone).toBe('3');
  });

  it('test isValid', () => {
    let syllable = BopomofoSyllable.fromKeys('1');
    expect(syllable.isValid).toBe(false);

    syllable = BopomofoSyllable.fromKeys('u');
    expect(syllable.isValid).toBe(true);

    syllable = BopomofoSyllable.fromKeys('8');
    expect(syllable.isValid).toBe(true);

    syllable = BopomofoSyllable.fromKeys('3');
    expect(syllable.isValid).toBe(false);

    syllable = BopomofoSyllable.fromKeys('1u83');
    expect(syllable.isValid).toBe(true);

    syllable = BopomofoSyllable.fromKeys('5');
    expect(syllable.isValid).toBe(true);
  });

  it('test keys', () => {
    let syllable = BopomofoSyllable.fromKeys('1u83');
    expect(syllable.keys).toBe('1u83');
  });

  it('test reading', () => {
    let syllable = BopomofoSyllable.fromKeys('1u83');
    expect(syllable.reading).toBe('ㄅㄧㄚˇ');
  });
});
