/**
 * Represents the structure of an input method table, including its names,
 * character counts, definitions, and key mappings.
 */
export interface InputTable {
  /** The Chinese name of the input method. */
  cname: string;
  /** The English name of the input method. */
  ename: string | undefined;
  /** Statistics for character counts in various encoding sets. */
  cincount:
    | {
        big5F: number | undefined;
        big5LF: number | undefined;
        big5Other: number | undefined;
        big5S: number | undefined;
        bopomofo: number | undefined;
        cjk: number | undefined;
        cjkCI: number | undefined;
        cjkCIS: number | undefined;
        cjkExtA: number | undefined;
        cjkExtB: number | undefined;
        cjkExtC: number | undefined;
        cjkExtD: number | undefined;
        cjkExtE: number | undefined;
        cjkExtF: number | undefined;
        cjkOther: number | undefined;
        phrases: number | undefined;
        privateuse: number | undefined;
        totalchardefs: number | undefined;
      }
    | undefined;
  /**
   * A mapping of characters to their definitions, where each key is a character
   * and the value is an array of strings representing the possible definitions
   * for that character.
   */
  chardefs: { [key: string]: string[] };
  /**
   * A mapping of characters to their key names, where each key is a character
   * and the value is a string representing the key name for that character.
   */
  keynames: { [key: string]: string };
  /**
   * A mapping of private use characters to their definitions, where each key is
   * a private use character and the value is an array of strings representing
   * the possible definitions for that character.
   */
  privateuse: { [key: string]: string[] };
  /**
   * A string representing the selected key for the input method.
   */
  selkey: string;
}
