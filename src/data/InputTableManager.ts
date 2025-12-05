import associatedPhrasesJson from './associated_phrases/phrase.json?raw';
import { Candidate } from './Candidate';
import array30 from './cin/array30.json?raw';
import array40 from './cin/array40.json?raw';
import bpmf from './cin/bpmf.json?raw';
import checj from './cin/checj.json?raw';
import cj5 from './cin/cj5.json?raw';
import dayi3 from './cin/dayi3.json?raw';
import dayi4 from './cin/dayi4.json?raw';
import simplex from './cin/simplex.json?raw';
import simplex5 from './cin/simplex5.json?raw';
import { CustomSymbolTable } from './CustomSymbolTable';
import { EmojiTable } from './Emoji';
import { ForeignLanguage } from './ForeignLanguage';
import { InputTableWrapper } from './InputTableWrapper';
import ctrlSymbols from './symbols/dsymbols.json';
import shiftPunctuations from './symbols/fsymbols.json';
import symbols from './symbols/msymbols.json';
import shiftLetters from './symbols/swkb.json';

type AssociatedPhrases = {
  chardefs: { [key: string]: string[] };
};

// const shiftLetterSymbols: { [key: string]: string } = JSON.parse(shiftLetters);
const shiftLetterSymbols: { [key: string]: string } = shiftLetters;

export interface SymbolTable {
  chardefs: { [key: string]: string[] };
  keynames: string[];
}

export class RadicalLookupEntry {
  constructor(public inputTableName: string, public radicals: string[]) {}
}

export class InputTableManager {
  private static instance: InputTableManager;
  private internalIndex_: number = 0;

  private constructor() {}

  public static getInstance(): InputTableManager {
    if (!InputTableManager.instance) {
      InputTableManager.instance = new InputTableManager();
    }
    return InputTableManager.instance;
  }

  get currentTable(): InputTableWrapper {
    return this.tables_[this.internalIndex_];
  }

  get selectedIndexValue(): number {
    return this.internalIndex_;
  }

  set selectedIndexValue(index: number) {
    if (index >= 0 && index < this.tables_.length) {
      this.internalIndex_ = index;
    } else {
      throw new Error('Index out of bounds');
    }
  }

  setInputTableById(id: string): void {
    const index = this.tables_.findIndex((table) => table.id === id);
    if (index !== -1) {
      this.internalIndex_ = index;
    } else {
      this.internalIndex_ = 0;
      // throw new Error(`Input table with id ${id} not found`);
    }
  }

  readonly emojiTable: EmojiTable = new EmojiTable();

  /// The symbols that uses when a user triggers the "`" key.
  get symbolTable(): SymbolTable {
    return symbols;
  }

  /// The symbols that uses when a user triggers the "Shift + Letter" keys.
  get shiftLetterSymbols(): { [key: string]: string } {
    return shiftLetterSymbols;
  }
  /// The symbols that uses when a user triggers the "Shift + Punctuation" keys.
  get shiftPunctuationsSymbols(): { [key: string]: string } {
    return shiftPunctuations;
  }

  /// The symbols that uses when a user triggers the "Ctrl + Punctuation" keys.
  get ctrlKeySymbols(): { chardefs: { [key: string]: string[] }; keynames: string[] } {
    return ctrlSymbols;
  }

  /// The custom symbol table used in the main function menu.
  readonly customSymbolTable: CustomSymbolTable = new CustomSymbolTable();

  /// The foreign language symbol table used in the main function menu.
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

  /// The list of Bopomofo symbols.
  get bopomofoSymbols(): string[] {
    return this.bopomofoSymbols_;
  }

  /// Return all available input tables as [id, cname][].
  get tables(): [string, string][] {
    return this.tables_.map((table) => [table.id, table.table.cname]);
  }

  private readonly tables_: Array<InputTableWrapper> = [
    new InputTableWrapper('checj', checj, { maxRadicals: 5 }),
    new InputTableWrapper('cj5', cj5, { maxRadicals: 5 }),
    new InputTableWrapper('simplex', simplex, { maxRadicals: 2 }),
    new InputTableWrapper('simplex5', simplex5, { maxRadicals: 2 }),
    new InputTableWrapper('dayi3', dayi3, { maxRadicals: 3 }),
    new InputTableWrapper('dayi4', dayi4, { maxRadicals: 4 }),
    new InputTableWrapper('array30', array30, { maxRadicals: 4 }),
    new InputTableWrapper('array40', array40, { maxRadicals: 4 }),
    this.bmpfTable,
  ];

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

  associatedPhrases_: AssociatedPhrases | undefined = undefined;
  get associatedPhrases(): AssociatedPhrases {
    if (!this.associatedPhrases_) {
      const parsed = JSON.parse(associatedPhrasesJson);
      this.associatedPhrases_ = {
        chardefs: parsed.chardefs as { [key: string]: string[] },
      };
    }
    return this.associatedPhrases_;
  }

  lookUpForAssociatedPhrases(prefix: string): Candidate[] | [] {
    const founds = this.associatedPhrases.chardefs[prefix];
    const candidates: Candidate[] = [];
    if (founds) {
      for (const found of founds) {
        candidates.push(new Candidate(found, ''));
      }
    }
    return candidates;
  }

  private bmpfTable_: InputTableWrapper | undefined = undefined;
  private get bmpfTable(): InputTableWrapper {
    if (!this.bmpfTable_) {
      this.bmpfTable_ = new InputTableWrapper('bpmf', bpmf, { maxRadicals: 4, isBopomofo: true });
    }
    return this.bmpfTable_;
  }

  lookupBpmfReadings(key: string): string[][] {
    return this.bmpfTable.reverseLookupForTranslatedAndOriginalRadicals(key);
  }

  lookupCandidatesForBpmfRadicals(radicals: string): Candidate[] {
    return this.bmpfTable.lookupForCandidate(radicals);
  }
}
