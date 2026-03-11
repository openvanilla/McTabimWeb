import { Candidate } from './Candidate';
import { InputTable } from './InputTable';

export enum InputTableType {
  Regular = 'regular',
  Bopomofo = 'bopomofo',
  Wsl = 'WSL',
}

export interface InputTableSettings {
  maxRadicals: number;
  type?: InputTableType | undefined;
}

/**
 * A wrapper class for InputTable that provides additional functionality such as
 * reverse lookup and candidate lookup.
 */
export class InputTableWrapper {
  private reverseLookUpTable_: { [key: string]: string[] } | undefined = undefined;

  /**
   * Creates a new InputTableWrapper instance.
   * @param id The ID of the input table.
   * @param jsonSource The JSON source of the input table.
   * @param settings The settings for the input table.
   * @param additionalSource Optional additional JSON sources for the input table.
   */
  constructor(
    public id: string,
    public jsonSource: string,
    public settings: InputTableSettings,
    public additionalSource?: string[] | undefined,
  ) {}

  table_: InputTable | undefined;
  get table(): InputTable {
    if (!this.table_) {
      this.table_ = JSON.parse(this.jsonSource) as InputTable;
      if (this.additionalSource) {
        for (const source of this.additionalSource) {
          const additionalTable = JSON.parse(source) as InputTable;
          this.table_.chardefs = { ...this.table_.chardefs, ...additionalTable.chardefs };
        }
      }
    }
    return this.table_;
  }

  private buildReverseLookUpTable__(): void {
    this.reverseLookUpTable_ = {};
    for (const radicals in this.table.chardefs) {
      const founds = this.table.chardefs[radicals];
      for (const found of founds) {
        if (!this.reverseLookUpTable_[found]) {
          this.reverseLookUpTable_[found] = [];
        }
        this.reverseLookUpTable_[found].push(radicals);
      }
    }
  }

  reverseLookupForRadicals(character: string): string[] {
    if (!this.reverseLookUpTable_) {
      this.buildReverseLookUpTable__();
    }

    const founds = this.reverseLookUpTable_![character] || [];
    const remapped: string[] = [];
    for (const found of founds) {
      var displayedRadicals = [];
      for (const char of found) {
        const translate = this.table.keynames[char];
        if (translate) {
          displayedRadicals.push(translate);
        } else {
          displayedRadicals.push(char);
        }
      }
      remapped.push(displayedRadicals.join(''));
    }
    remapped.sort((a, b) => a.length - b.length);
    return remapped;
  }

  reverseLookupForTranslatedAndOriginalRadicals(character: string): string[][] {
    if (!this.reverseLookUpTable_) {
      this.buildReverseLookUpTable__();
    }

    const founds = this.reverseLookUpTable_![character] || [];
    const remapped: string[][] = [];
    for (const found of founds) {
      var displayedRadicals = [];
      for (const char of found) {
        const translate = this.table.keynames[char];
        if (translate) {
          displayedRadicals.push(translate);
        } else {
          displayedRadicals.push(char);
        }
      }
      remapped.push([displayedRadicals.join(''), found]);
    }
    remapped.sort((a, b) => a.length - b.length);
    return remapped;
  }

  lookupForCandidate(radicals: string): Candidate[] | [] {
    if (radicals.includes('*')) {
      // Support wildcard '*' in radicals: match any single character at '*'
      // Build a regex: replace '*' with '.', escape other regex chars
      const pattern = radicals.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.');
      const regex = new RegExp(`^${pattern}$`);
      const candidates: Candidate[] = [];
      for (const key in this.table.chardefs) {
        if (regex.test(key)) {
          const founds = this.table.chardefs[key];
          for (const found of founds) {
            candidates.push(new Candidate(found, ''));
          }
        }
      }
      return candidates;
    }

    const founds = this.table.chardefs[radicals];
    const candidates: Candidate[] = [];
    if (founds) {
      for (const found of founds) {
        candidates.push(new Candidate(found, ''));
      }
    }
    return candidates;
  }

  lookUpForDisplayedKeyName(key: string): string {
    return this.table.keynames[key] || key;
  }
}
