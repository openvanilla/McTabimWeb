/**
 * Represents the configuration settings for the input method.
 *
 * @property chineseConversionEnabled - Enables or disables Chinese character
 * conversion.
 * @property associatedPhrasesEnabled - Enables or disables the use of
 * associated phrases.
 * @property shiftPunctuationForSymbolsEnabled - Enables or disables using the
 * Shift key to input punctuation as symbols.
 * @property shiftLetterForSymbolsEnabled - Enables or disables using the Shift
 * key to input letters as symbols.
 * @property wildcardMatchingEnabled - Enables or disables wildcard matching in
 * input.
 * @property clearOnErrors - Determines whether to clear input on errors.
 * @property beepOnErrors - Determines whether to play a beep sound on errors.
 * @property reverseRadicalLookupEnabled - Enables or disables reverse lookup
 * for radicals.
 */
export interface Settings {
  chineseConversionEnabled: boolean;
  associatedPhrasesEnabled: boolean;
  shiftPunctuationForSymbolsEnabled: boolean;
  shiftLetterForSymbolsEnabled: boolean;
  wildcardMatchingEnabled: boolean;
  clearOnErrors: boolean;
  beepOnErrors: boolean;
  reverseRadicalLookupEnabled: boolean;
}
