import checj from './checj.json';
import cj5 from './cj5.json';
import simplex from './simplex.json';
import simplex5 from './simplex5.json';
import dayi3 from './dayi3.json';
import dayi4 from './dayi4.json';
import array30 from './array30.json';
import array40 from './array40.json';

export default class Candidate {
  readonly displayText: string;
  readonly description: string;

  constructor(displayText: string, description: string) {
    this.displayText = displayText;
    this.description = description;
  }
}

export interface InputTable {
  cname: string;
  ename: string | undefined;
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
  chardefs: { [key: string]: string[] };
  keynames: { [key: string]: string };
  privateuse: { [key: string]: string[] };
  selkey: string;
}

export interface InputTableSettings {
  maxRadicals: number;
}

export class InputTableWrapper {
  constructor(public id: string, public table: InputTable, public settings: InputTableSettings) {}

  lookupForCandidate(radicals: string): Candidate[] | [] {
    let founds = this.table.chardefs[radicals];
    let candidates: Candidate[] = [];
    if (founds) {
      for (let found of founds) {
        candidates.push(new Candidate(found, ''));
      }
    }
    return candidates;
  }

  lookUpForDisplayedKeyName(key: string): string {
    return this.table.keynames[key] || key;
  }
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

  getTables(): [string, string][] {
    return this.tables.map((table) => [table.id, table.table.cname]);
  }

  readonly tables: Array<InputTableWrapper> = [
    new InputTableWrapper('checj', checj, { maxRadicals: 5 }),
    new InputTableWrapper('cj5', cj5, { maxRadicals: 5 }),
    new InputTableWrapper('simplex', simplex, { maxRadicals: 2 }),
    new InputTableWrapper('simplex5', simplex5, { maxRadicals: 2 }),
    new InputTableWrapper('dayi3', dayi3, { maxRadicals: 3 }),
    new InputTableWrapper('dayi4', dayi4, { maxRadicals: 4 }),
    new InputTableWrapper('array30', array30, { maxRadicals: 3 }),
    new InputTableWrapper('array40', array40, { maxRadicals: 4 }),
  ];
}
