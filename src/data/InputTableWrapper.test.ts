import { Candidate } from './Candidate';
import { InputTable } from './InputTable';
import { InputTableSettings, InputTableWrapper } from './InputTableWrapper';

const mockTable = `{
  "chardefs": {
    "a": ["你", "呢"],
    "b": ["好"],
    "ab": ["嗎"]
  },
  "cname": "test",
  "ename": "test",
  "cincount": null,
  "privateuse": {},
  "keynames": {
    "a": "ㄅ",
    "b": "ㄆ"
  },
  "selkey": "1234567890"
}`;

const settings: InputTableSettings = { maxRadicals: 2 };

describe('InputTableWrapper', () => {
  let wrapper: InputTableWrapper;

  beforeEach(() => {
    wrapper = new InputTableWrapper('test', mockTable, settings);
  });

  describe('lookupForCandidate', () => {
    it('returns candidates for existing radicals', () => {
      const candidates = wrapper.lookupForCandidate('a');
      expect(candidates).toHaveLength(2);
      expect(candidates[0]).toBeInstanceOf(Candidate);
      expect(candidates[0].displayText).toBe('你');
      expect(candidates[1].displayText).toBe('呢');
    });

    it('returns empty array for non-existing radicals', () => {
      expect(wrapper.lookupForCandidate('z')).toEqual([]);
    });
  });

  describe('lookUpForDisplayedKeyName', () => {
    it('returns mapped key name if exists', () => {
      expect(wrapper.lookUpForDisplayedKeyName('a')).toBe('ㄅ');
    });

    it('returns original key if mapping does not exist', () => {
      expect(wrapper.lookUpForDisplayedKeyName('z')).toBe('z');
    });
  });

  describe('reverseLookupForRadicals', () => {
    it('returns radicals for a character', () => {
      // '你' is mapped from 'a'
      const radicals = wrapper.reverseLookupForRadicals('你');
      // Should map 'a' to ['ㄅ']
      expect(radicals).toEqual(['ㄅ']);
    });

    it('returns empty array for character not in table', () => {
      expect(wrapper.reverseLookupForRadicals('無')).toEqual([]);
    });

    it('returns radicals with keynames mapping', () => {
      // '嗎' is mapped from 'ab'
      const radicals = wrapper.reverseLookupForRadicals('嗎');
      // Should map 'ab' to ['ㄅ', 'ㄆ']
      expect(radicals).toEqual(['ㄅㄆ']);
    });
  });

  it('does not mutate input objects', () => {
    const parsedTable = JSON.parse(mockTable);
    const originalChardefs = JSON.parse(JSON.stringify(parsedTable.chardefs));
    wrapper.lookupForCandidate('a');
    expect(JSON.parse(mockTable).chardefs).toEqual(originalChardefs);
  });

  it('does not mutate input objects', () => {
    const parsedTable = JSON.parse(mockTable);
    const originalChardefs = JSON.parse(JSON.stringify(parsedTable.chardefs));
    const result = wrapper.lookupForCandidate('a*');
    expect(result).toHaveLength(1);
    expect(result[0].displayText).toBe('嗎');
    expect(JSON.parse(mockTable).chardefs).toEqual(originalChardefs);
  });
  describe('reverseLookupForTranslatedAndOriginalRadicals', () => {
    it('returns translated and original radicals for a character', () => {
      const result = wrapper.reverseLookupForTranslatedAndOriginalRadicals('你');
      expect(result).toEqual([['ㄅ', 'a']]);
    });

    it('returns translated and original radicals for a character with multiple keys', () => {
      const result = wrapper.reverseLookupForTranslatedAndOriginalRadicals('嗎');
      expect(result).toEqual([['ㄅㄆ', 'ab']]);
    });

    it('returns empty array for character not in table', () => {
      expect(wrapper.reverseLookupForTranslatedAndOriginalRadicals('無')).toEqual([]);
    });
  });
});
