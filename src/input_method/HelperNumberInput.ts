import { Case, ChineseNumbers } from '../ChineseNumbers';
import { Candidate } from '../data';
import { RomanNumbers, RomanNumbersStyle } from '../RomanNumbers';

/**
 * A utility class for number-related operations including Chinese number
 * conversions and Roman numeral conversions.
 */
export default class NumberInputHelper {
  /**
   * A map of number keys to their corresponding symbol strings.
   */
  static readonly NUMBER_SYMBOLS = new Map<string, string>([
    ['_number_0', '０ 0 🄁 0 ⓿ 0 ⓪ 0 ⓿ 0 𝟎 0 𝟢 0 𝟬 0 𝟶 0 0️⃣ 0'],
    ['_number_1', '１ 0 ⒈ 0 🄂 0 ⑴ 0 ❶ 0 ① 0 ⓵ 0 ㈠ 0 ㊀ 0 Ⅰ 0 ⅰ 0 𝟏 0 𝟣 0 𝟭 0 𝟷 0 1️⃣ 0'],
    ['_number_10', '⒑ 0 ⑽ 0 ❿ 0 ⑩ 0 ⓾ 0 ㈩ 0 ㊉ 0 Ⅹ 0 ⅹ 0 🔟 0'],
    ['_number_11', '⒒ 0 ⑾ 0 ⑪ 0 ⓫ 0 Ⅺ 0 ⅺ 0'],
    ['_number_12', '⒓ 0 ⑿ 0 ⑫ 0 ⓬ 0 Ⅻ 0 ⅻ 0'],
    ['_number_13', '⒔ 0 ⒀ 0 ⑬ 0 ⓭ 0'],
    ['_number_14', '⒕ 0 ⒁ 0 ⑭ 0 ⓮ 0'],
    ['_number_15', '⒖ 0 ⒂ 0 ⑮ 0 ⓯ 0'],
    ['_number_16', '⒗ 0 ⒃ 0 ⑯ 0 ⓰ 0'],
    ['_number_17', '⒘ 0 ⒄ 0 ⑰ 0 ⓱ 0'],
    ['_number_18', '⒙ 0 ⒅ 0 ⑱ 0 ⓲ 0'],
    ['_number_19', '⒚ 0 ⒆ 0 ⑲ 0 ⓳ 0'],
    ['_number_2', '２ 0 ⒉ 0 🄃 0 ⑵ 0 ❷ 0 ② 0 ⓶ 0 ㈡ 0 ㊁ 0 Ⅱ 0 ⅱ 0 𝟐 0 𝟤 0 𝟮 0 𝟸 0 2️⃣ 0'],
    ['_number_20', '⒛ 0 ⒇ 0 ⑳ 0'],
    ['_number_21', '㉑ 0'],
    ['_number_22', '㉒ 0'],
    ['_number_23', '㉓ 0'],
    ['_number_24', '㉔ 0'],
    ['_number_25', '㉕ 0'],
    ['_number_26', '㉖ 0'],
    ['_number_27', '㉗ 0'],
    ['_number_28', '㉘ 0'],
    ['_number_29', '㉙ 0 ⓴ 0'],
    ['_number_3', '３ 0 ⒊ 0 🄄 0 ⑶ 0 ❸ 0 ③ 0 ⓷ 0 ㈢ 0 ㊂ 0 Ⅲ 0 ⅲ 0 𝟑 0 𝟥 0 𝟯 0 𝟹 0 3️⃣ 0'],
    ['_number_30', '㉚ 0'],
    ['_number_31', '㉛ 0'],
    ['_number_32', '㉜ 0'],
    ['_number_33', '㉝ 0'],
    ['_number_34', '㉞ 0'],
    ['_number_35', '㉟ 0'],
    ['_number_36', '㊱ 0'],
    ['_number_37', '㊲ 0'],
    ['_number_38', '㊳ 0'],
    ['_number_39', '㊴ 0'],
    ['_number_4', '４ 0 ⒋ 0 🄅 0 ⑷ 0 ❹ 0 ④ 0 ⓸ 0 ㈣ 0 ㊃ 0 Ⅳ 0 ⅳ 0 𝟒 0 𝟦 0 𝟰 0 𝟺 0 4️⃣ 0'],
    ['_number_40', '㊵ 0'],
    ['_number_41', '㊶ 0'],
    ['_number_42', '㊷ 0'],
    ['_number_43', '㊸ 0'],
    ['_number_44', '㊹ 0'],
    ['_number_45', '㊺ 0'],
    ['_number_46', '㊻ 0'],
    ['_number_47', '㊼ 0'],
    ['_number_48', '㊽ 0'],
    ['_number_49', '㊾ 0'],
    ['_number_5', '５ 0 ⒌ 0 🄆 0 ⑸ 0 ❺ 0 ⑤ 0 ⓹ 0 ㈤ 0 ㊄ 0 Ⅴ 0 ⅴ 0 𝟓 0 𝟧 0 𝟱 0 𝟻 0 5️⃣ 0'],
    ['_number_50', '㊿ 0'],
    ['_number_6', '６ 0 ⒍ 0 🄇 0 ⑹ 0 ❻ 0 ⑥ 0 ⓺ 0 ㈥ 0 ㊅ 0 Ⅵ 0 ⅵ 0 𝟔 0 𝟨 0 𝟲 0 𝟼 0 6️⃣ 0'],
    ['_number_7', '７ 0 ⒎ 0 🄈 0 ⑺ 0 ❼ 0 ⑦ 0 ⓻ 0 ㈦ 0 ㊆ 0 Ⅶ 0 ⅶ 0 𝟕 0 𝟩 0 𝟳 0 𝟽 0 7️⃣ 0'],
    ['_number_8', '８ 0 ⒏ 0 🄉 0 ⑻ 0 ❽ 0 ⑧ 0 ⓼ 0 ㈧ 0 ㊇ 0 Ⅷ 0 ⅷ 0 𝟖 0 𝟪 0 𝟴 0 𝟾 0 8️⃣ 0'],
    ['_number_9', '９ 0 ⒐ 0 🄊 0 ⑼ 0 ❾ 0 ⑨ 0 ⓽ 0 ㈨ 0 ㊈ 0 Ⅸ 0 ⅸ 0 𝟗 0 𝟫 0 𝟵 0 𝟿 0 9️⃣ 0'],
  ]);

  /**
   * Fills the candidate list with number-related entries based on the input
   * string.
   * @param inputString The input string to process.
   * @returns An array of Candidate objects.
   */
  static fillCandidates(inputString: string): Candidate[] {
    if (inputString.trim().length === 0) {
      return [];
    }
    const candidates: string[] = NumberInputHelper.fillCandidatesStrings(inputString);
    return candidates.map((text) => {
      return new Candidate(text, '');
    });
  }

  /**
   * Fills the candidate list with number-related entries based on the input
   * string.
   * @param inputString The input string to process.
   * @returns An array of strings containing various number formats.
   */
  static fillCandidatesStrings(inputString: string): string[] {
    const input = inputString.trim();
    if (input.length === 0) {
      return [];
    }

    const result: string[] = [];

    let intPart = '';
    let decPart = '';
    const parts = input.split('.');
    if (parts.length >= 1) {
      intPart = parts[0];
    }
    if (parts.length >= 2) {
      decPart = parts[1];
    }
    let line = ChineseNumbers.generate(intPart, decPart, Case.lowercase);
    if (line.length > 0) {
      result.push(line);
    }
    line = ChineseNumbers.generate(intPart, decPart, Case.uppercase);
    if (line.length > 0) {
      result.push(line);
    }
    const intNumber = parseInt(intPart, 10);
    if (intNumber > 0 && intNumber <= 3999) {
      line = RomanNumbers.convert(intNumber, RomanNumbersStyle.Alphabets);
      result.push(line);
      line = RomanNumbers.convert(intNumber, RomanNumbersStyle.FullWidthUpper);
      result.push(line);
      line = RomanNumbers.convert(intNumber, RomanNumbersStyle.FullWidthLower);
      result.push(line);
    }
    if (intNumber > 0 && intNumber <= 50) {
      const key = `_number_${intNumber}`;
      const symbolString = NumberInputHelper.NUMBER_SYMBOLS.get(key);
      if (symbolString) {
        const symbols = symbolString.split(' ');
        for (let symbol of symbols) {
          symbol = symbol.trim();
          if (symbol.length > 0 && symbol !== '0' && result.indexOf(symbol) === -1) {
            result.push(symbol);
          }
        }
      }
    }
    return result;
  }
}
