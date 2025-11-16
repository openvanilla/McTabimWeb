import checj from './cin/checj.json';
import cj5 from './cin/cj5.json';
import simplex from './cin/simplex.json';
import simplex5 from './cin/simplex5.json';
import dayi3 from './cin/dayi3.json';
import dayi4 from './cin/dayi4.json';
import array30 from './cin/array30.json';
import array40 from './cin/array40.json';
import associatedPhrasesJson from './associated_phrases/phrase.json';

import symbols from './symbols/msymbols.json';
import shiftLetters from './symbols/swkb.json';
import shiftPunctuations from './symbols/fsymbols.json';

import { Candidate } from './Candidate';
import { EmojiTable } from './Emoji';
import { ForeignLanguage } from './ForeignLanguage';
import { CustomSymbolTable } from './CustomSymbolTable';
import { InputTableWrapper } from './InputTableWrapper';

type AssociatedPhrases = {
  chardefs: { [key: string]: string[] };
};

const associatedPhrases: AssociatedPhrases = {
  chardefs: associatedPhrasesJson.chardefs as { [key: string]: string[] },
};

const shiftLetterSymbols: { [key: string]: string } = shiftLetters;

export interface SymbolTable {
  chardefs: { [key: string]: string[] };
  keynames: string[];
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
    return this.tables[this.internalIndex_];
  }

  get selectedIndexValue(): number {
    return this.internalIndex_;
  }

  set selectedIndexValue(index: number) {
    if (index >= 0 && index < this.tables.length) {
      this.internalIndex_ = index;
    } else {
      throw new Error('Index out of bounds');
    }
  }

  setInputTableById(id: string): void {
    const index = this.tables.findIndex((table) => table.id === id);
    if (index !== -1) {
      this.internalIndex_ = index;
    } else {
      throw new Error(`Input table with id ${id} not found`);
    }
  }

  readonly emojiTable: EmojiTable = new EmojiTable();

  get symbolTable(): SymbolTable {
    return symbols;
  }

  get shiftLetterSymbols(): { [key: string]: string } {
    return shiftLetterSymbols;
  }

  get shiftPunctuationsSymbols(): { [key: string]: string } {
    return shiftPunctuations;
  }

  readonly customSymbolTable: CustomSymbolTable = new CustomSymbolTable();
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

  get bopomofoSymbols(): string[] {
    return this.bopomofoSymbols_;
  }

  getTables(): [string, string][] {
    return this.tables.map((table) => [table.id, table.table.cname]);
  }

  private readonly tables: Array<InputTableWrapper> = [
    new InputTableWrapper('checj', checj, { maxRadicals: 5 }),
    new InputTableWrapper('cj5', cj5, { maxRadicals: 5 }),
    new InputTableWrapper('simplex', simplex, { maxRadicals: 2 }),
    new InputTableWrapper('simplex5', simplex5, { maxRadicals: 2 }),
    new InputTableWrapper('dayi3', dayi3, { maxRadicals: 3 }),
    new InputTableWrapper('dayi4', dayi4, { maxRadicals: 4 }),
    new InputTableWrapper('array30', array30, { maxRadicals: 4 }),
    new InputTableWrapper('array40', array40, { maxRadicals: 4 }),
  ];

  lookUpForAssociatedPhrases(prefix: string): Candidate[] | [] {
    const founds = associatedPhrases.chardefs[prefix];
    const candidates: Candidate[] = [];
    if (founds) {
      for (const found of founds) {
        candidates.push(new Candidate(found, ''));
      }
    }
    return candidates;
  }
}
