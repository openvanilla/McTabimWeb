import { Candidate } from '../data';
import NumberInputHelper from './HelperNumberInput';

describe('NumberInputHelper', () => {
  describe('fillCandidatesStrings', () => {
    it('should generate Chinese numbers for integer input', () => {
      const result = NumberInputHelper.fillCandidatesStrings('123');
      expect(result.some((s) => s.includes('一百二十三'))).toBe(true);
      expect(result.some((s) => s.includes('壹佰貳拾參'))).toBe(true);
    });

    it('should generate Chinese numbers for decimal input', () => {
      const result = NumberInputHelper.fillCandidatesStrings('45.67');
      expect(result.some((s) => s.includes('四十五點六七'))).toBe(true);
      expect(result.some((s) => s.includes('肆拾伍點陸柒'))).toBe(true);
    });

    it('should generate Roman numerals for valid input', () => {
      const result = NumberInputHelper.fillCandidatesStrings('12');
      expect(result).toContain('XII');
      expect(result).toContain('Ⅻ');
      expect(result).toContain('ⅻ');
    });

    it('should generate full-width Roman numerals for valid input', () => {
      const result = NumberInputHelper.fillCandidatesStrings('3');
      expect(result.some((s) => /Ⅲ|ⅲ/.test(s))).toBe(true);
    });

    it('should generate symbol variants for numbers <= 50', () => {
      const result = NumberInputHelper.fillCandidatesStrings('5');
      expect(result).toContain('５');
      expect(result).toContain('⑤');
      expect(result).toContain('5️⃣');
    });

    it('should not generate symbol variants for numbers > 50', () => {
      const result = NumberInputHelper.fillCandidatesStrings('51');
      expect(result.some((s) => /５|⑤|5️⃣/.test(s))).toBe(false);
    });

    it('should handle input with leading/trailing spaces', () => {
      const result = NumberInputHelper.fillCandidatesStrings(' 7 ');
      expect(result).toContain('７');
      expect(result).toContain('⑦');
    });

    it('should return empty array for empty input', () => {
      const result = NumberInputHelper.fillCandidatesStrings('');
      expect(result.length).toBe(0);
    });

    it('should not duplicate symbols', () => {
      const result = NumberInputHelper.fillCandidatesStrings('1');
      const unique = Array.from(new Set(result));
      expect(result.length).toBe(unique.length);
    });

    it('should ignore symbol "0" in symbol variants', () => {
      const result = NumberInputHelper.fillCandidatesStrings('2');
      expect(result).not.toContain('0');
    });
  });

  describe('fillCandidates', () => {
    it('should return Candidate objects for valid input', () => {
      const candidates = NumberInputHelper.fillCandidates('8');
      expect(candidates.length).toBeGreaterThan(0);
      candidates.forEach((c) => {
        expect(c).toBeInstanceOf(Candidate);
        expect(typeof c.displayText).toBe('string');
      });
    });

    it('should return empty array for invalid input', () => {
      const candidates = NumberInputHelper.fillCandidates('');
      expect(candidates.length).toBe(0);
    });
  });
});
