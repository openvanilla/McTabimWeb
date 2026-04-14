import { HakkaSyllable } from './HakkaSyllable';

describe('HakkaSyllable', () => {
  it('parses lowercase letters and tone keys from input', () => {
    let syllable = HakkaSyllable.fromKeys('ngi');
    expect(syllable.letters).toBe('ngi');
    expect(syllable.tone).toBeUndefined();

    syllable = HakkaSyllable.fromKeys('ngi4');
    expect(syllable.letters).toBe('ngi');
    expect(syllable.tone).toBe('4');

    syllable = HakkaSyllable.fromKeys("vud'-");
    expect(syllable.letters).toBe('vud');
    expect(syllable.tone).toBe('-');
  });

  it('ignores non-lowercase letters and keeps the last recognized tone', () => {
    const syllable = HakkaSyllable.fromKeys("Ngi4.'9");
    expect(syllable.letters).toBe('gi');
    expect(syllable.tone).toBe("'");
  });

  it('is invalid when no letters are present', () => {
    let syllable = HakkaSyllable.fromKeys('4');
    expect(syllable.isValid).toBe(false);

    syllable = HakkaSyllable.fromKeys("`.-'");
    expect(syllable.isValid).toBe(false);

    syllable = HakkaSyllable.fromKeys('ngi');
    expect(syllable.isValid).toBe(true);
  });

  it('returns parsed keys and reading as letters plus tone', () => {
    let syllable = HakkaSyllable.fromKeys('ngi7');
    expect(syllable.keys).toBe('ngi7');
    expect(syllable.reading).toBe('ngi7');

    syllable = HakkaSyllable.fromKeys('ngiX');
    expect(syllable.keys).toBe('ngi');
    expect(syllable.reading).toBe('ngi');
  });
});
