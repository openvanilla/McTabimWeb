import associatedPhrasesJson from './associated_phrases/phrase.json?raw';
import { Candidate } from './Candidate';
import arrayphrase from './cin/array-phrase.json?raw';
import arrayshortcode from './cin/array-shortcode.json?raw';
import arraySpecial from './cin/array-special.json?raw';
import array30 from './cin/array30.json?raw';
import array40 from './cin/array40.json?raw';
import bpmf from './cin/bpmf.json?raw';
import checj from './cin/checj.json?raw';
import cj5 from './cin/cj5.json?raw';
import dayi3 from './cin/dayi3.json?raw';
import dayi4 from './cin/dayi4.json?raw';
import simplex from './cin/simplex.json?raw';
import simplex5 from './cin/simplex5.json?raw';
import tpHakkaHl from './cin/tp_hakka_hl.json?raw';
import tpHakkaSy from './cin/tp_hakka_sy.json?raw';
import wsl from './cin/wsl.json?raw';
import { CustomSymbolTable } from './CustomSymbolTable';
import { EmojiTable } from './Emoji';
import { ForeignLanguage } from './ForeignLanguage';
import type { InputTableWrapper } from './InputTableWrapper';
import {
  BopomofoInputTableWrapper,
  GeneralInputTableWrapper,
  HakkaInputTableWrapper,
  WslInputTableWrapper,
} from './InputTableWrapper';
import ctrlSymbols from './symbols/dsymbols.json';
import shiftPunctuations from './symbols/fsymbols.json';
import symbols from './symbols/msymbols.json';
import shiftLetters from './symbols/swkb.json';

type AssociatedPhrases_ = {
  chardefs: { [key: string]: string[] };
};

const shiftLetterSymbols_: { [key: string]: string } = shiftLetters;

/**
 * Represents a table of symbols and their corresponding characters.
 */
export interface SymbolTable {
  chardefs: { [key: string]: string[] };
  keynames: string[];
}

/**
 * Represents an entry for looking up radicals in a specific input table.
 */
export class RadicalLookupEntry {
  constructor(public inputTableName: string, public radicals: string[]) {}
}

/**
 * The `InputTableManager` class is responsible for managing and providing
 * access to various input tables, symbols, and associated phrases used for
 * character input. It follows the singleton pattern to ensure a single point of
 * access throughout the application.
 */
export class InputTableManager {
  private static instance: InputTableManager;
  private internalIndex_: number = 0;
  private tablesMetadata_: [string, string][] | undefined = undefined;

  private constructor() {}

  /**
   * Gets the singleton instance of the `InputTableManager`.
   * @returns The singleton instance.
   */
  public static getInstance(): InputTableManager {
    if (!InputTableManager.instance) {
      InputTableManager.instance = new InputTableManager();
    }
    return InputTableManager.instance;
  }

  /**
   * Gets the currently active input table.
   */
  get currentTable(): InputTableWrapper {
    return this.tables_[this.internalIndex_];
  }

  /**
   * Gets the index of the currently active input table.
   */
  get selectedIndexValue(): number {
    return this.internalIndex_;
  }

  /**
   * Sets the index of the currently active input table.
   * @param index The index to set.
   * @throws {Error} If the index is out of bounds.
   */
  set selectedIndexValue(index: number) {
    if (index >= 0 && index < this.tables_.length) {
      this.internalIndex_ = index;
    } else {
      throw new Error('Index out of bounds');
    }
  }

  /**
   * Sets the currently active input table by its ID.
   * If the ID is not found, it defaults to the first table.
   * @param id The ID of the input table to activate.
   */
  setInputTableById(id: string): void {
    const index = this.tables_.findIndex((table) => table.id === id);
    if (index === this.internalIndex_) {
      return;
    }

    if (index !== -1) {
      this.internalIndex_ = index;
    } else {
      this.internalIndex_ = 0;
      // throw new Error(`Input table with id ${id} not found`);
    }
  }

  /**
   * The emoji table instance providing access to emoji characters.
   */
  readonly emojiTable: EmojiTable = new EmojiTable();

  /**
   * The symbols that are used when a user triggers the "`" key.
   */
  get symbolTable(): SymbolTable {
    return symbols;
  }

  /**
   * The symbols that are used when a user triggers the "Shift + Letter" keys.
   */
  get shiftLetterSymbols(): { [key: string]: string } {
    return shiftLetterSymbols_;
  }
  /**
   * The symbols that are used when a user triggers the "Shift + Punctuation" keys.
   */
  get shiftPunctuationsSymbols(): { [key: string]: string } {
    return shiftPunctuations;
  }

  /**
   * The symbols that are used when a user triggers the "Ctrl + Punctuation" keys.
   */
  get ctrlKeySymbols(): { chardefs: { [key: string]: string[] }; keynames: string[] } {
    return ctrlSymbols;
  }

  /**
   * The custom symbol table used in the main function menu.
   */
  readonly customSymbolTable: CustomSymbolTable = new CustomSymbolTable();

  /**
   * The foreign language symbol table used in the main function menu.
   */
  readonly foreignLanguage: ForeignLanguage = new ForeignLanguage();

  private bopomofoSymbols_: string[] = (() => {
    const bopomofolist: string[] = [];
    for (let i = 0x3105; i < 0x311a; i++) {
      bopomofolist.push(String.fromCharCode(i));
    }
    for (let i = 0x3127; i < 0x312a; i++) {
      bopomofolist.push(String.fromCharCode(i));
    }
    for (let i = 0x311a; i < 0x3127; i++) {
      bopomofolist.push(String.fromCharCode(i));
    }
    bopomofolist.push(String.fromCharCode(0x02d9));
    bopomofolist.push(String.fromCharCode(0x02ca));
    bopomofolist.push(String.fromCharCode(0x02c7));
    bopomofolist.push(String.fromCharCode(0x02cb));
    return bopomofolist;
  })();

  /**
   * The list of Bopomofo symbols.
   */
  get bopomofoSymbols(): string[] {
    return this.bopomofoSymbols_;
  }

  /**
   * Returns all available input tables as an array of tuples `[id, cname][]`.
   */
  get tables(): [string, string][] {
    if (!this.tablesMetadata_) {
      this.tablesMetadata_ = this.tables_.map((table) => [table.id, table.table.cname]);
    }
    return this.tablesMetadata_;
  }

  private readonly tables_: Array<InputTableWrapper> = [
    new GeneralInputTableWrapper('checj', checj, { maxRadicals: 5 }),
    new GeneralInputTableWrapper('cj5', cj5, { maxRadicals: 5 }),
    new GeneralInputTableWrapper('simplex', simplex, { maxRadicals: 2 }),
    new GeneralInputTableWrapper('simplex5', simplex5, { maxRadicals: 2 }),
    new GeneralInputTableWrapper('dayi3', dayi3, { maxRadicals: 3 }),
    new GeneralInputTableWrapper('dayi4', dayi4, { maxRadicals: 4 }),
    new GeneralInputTableWrapper('array30', array30, { maxRadicals: 4 }, [
      arrayphrase,
      arrayshortcode,
      arraySpecial,
    ]),
    new GeneralInputTableWrapper('array40', array40, { maxRadicals: 4 }),
    this.bmpfTable,
    new WslInputTableWrapper('wsl', wsl, { maxRadicals: 4 }),
    new HakkaInputTableWrapper('tp_hakka_hl', tpHakkaHl, { maxRadicals: 8 }),
    new HakkaInputTableWrapper('tp_hakka_sy', tpHakkaSy, { maxRadicals: 8 }),
  ];

  /**
   * Performs a reverse lookup for a character across all available input tables.
   * @param character The character to look up.
   * @returns An array of `RadicalLookupEntry` objects containing the input table name and its radicals.
   */
  reverseLookupForRadicals(character: string): RadicalLookupEntry[] {
    const result = [];
    for (const tableWrapper of this.tables_) {
      const radicals = tableWrapper.reverseLookupForRadicals(character);
      if (radicals.length > 0) {
        result.push(new RadicalLookupEntry(tableWrapper.table.cname, radicals));
      }
    }
    return result;
  }

  associatedPhrases_: AssociatedPhrases_ | undefined = undefined;
  /**
   * Retrieves the associated phrases data, lazily loading it if necessary.
   */
  get associatedPhrases(): AssociatedPhrases_ {
    if (!this.associatedPhrases_) {
      const parsed = JSON.parse(associatedPhrasesJson);
      this.associatedPhrases_ = {
        chardefs: parsed.chardefs as { [key: string]: string[] },
      };
    }
    return this.associatedPhrases_;
  }

  /**
   * Looks up associated phrases for a given prefix.
   * @param prefix The prefix string to search for.
   * @returns An array of candidate phrases matching the prefix, or an empty array if not found.
   */
  lookUpForAssociatedPhrases(prefix: string): Candidate[] | [] {
    try {
      const founds = this.associatedPhrases.chardefs[prefix];
      return founds ? founds.map((found) => new Candidate(found, '')) : [];
    } catch (error) {
      return [];
    }
  }

  private bmpfTable_: InputTableWrapper | undefined = undefined;
  private get bmpfTable(): InputTableWrapper {
    if (!this.bmpfTable_) {
      this.bmpfTable_ = new BopomofoInputTableWrapper('bpmf', bpmf, {
        maxRadicals: 4,
      });
    }
    return this.bmpfTable_;
  }

  /**
   * Looks up Bopomofo readings for a given key string.
   * @param key The key string containing radicals.
   * @returns An array of arrays containing translated and original radicals.
   */
  lookupBpmfReadings(key: string): string[][] {
    return this.bmpfTable.reverseLookupForTranslatedAndOriginalRadicals(key);
  }

  /**
   * Looks up Bopomofo candidates matching the given radicals.
   * @param radicals The radicals string to look up.
   * @returns An array of candidates matching the given Bopomofo radicals.
   */
  lookupCandidatesForBpmfRadicals(radicals: string): Candidate[] {
    return this.bmpfTable.lookupForCandidate(radicals);
  }
}
