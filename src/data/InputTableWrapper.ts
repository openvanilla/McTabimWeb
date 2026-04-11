import { BopomofoSyllable } from './BopomofoSyllable';
import { BopomofoWslSyllable } from './BopomofoWslSyllable';
import { Candidate } from './Candidate';
import { HakkaSyllable } from './HakkaSyllable';
import { InputTable } from './InputTable';

export interface InputTableSettings {
  maxRadicals: number;
}

export interface InputTableSyllable {
  readonly isValid: boolean;
  readonly keys: string;
  readonly reading: string;
  readonly tone?: string | undefined;
}

export interface InputTableWrapper {
  readonly id: string;
  readonly jsonSource: string;
  readonly settings: InputTableSettings;
  readonly additionalSource?: string[] | undefined;
  readonly table: InputTable;
  readonly isPhoneticTable: boolean;

  reverseLookupForRadicals(character: string): string[];
  reverseLookupForTranslatedAndOriginalRadicals(character: string): string[][];
  lookupForCandidate(radicals: string): Candidate[] | [];
  lookUpForDisplayedKeyName(key: string): string;
  createSyllable(keys: string): InputTableSyllable | undefined;
}

/**
 * A wrapper class for InputTable that provides additional functionality such as
 * reverse lookup and candidate lookup.
 */
export class GeneralInputTableWrapper implements InputTableWrapper {
  private static readonly WILDCARD_CACHE_LIMIT = 128;
  private reverseLookUpTable_: { [key: string]: string[] } | undefined = undefined;
  private keysByLength_: Map<number, string[]> | undefined = undefined;
  private wildcardCandidateCache_: Map<string, Candidate[]> | undefined = undefined;

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

  private get keysByLength(): Map<number, string[]> {
    if (!this.keysByLength_) {
      this.keysByLength_ = new Map<number, string[]>();
      for (const key of Object.keys(this.table.chardefs)) {
        const bucket = this.keysByLength_.get(key.length) ?? [];
        bucket.push(key);
        this.keysByLength_.set(key.length, bucket);
      }
    }
    return this.keysByLength_;
  }

  private get wildcardCandidateCache(): Map<string, Candidate[]> {
    if (!this.wildcardCandidateCache_) {
      this.wildcardCandidateCache_ = new Map<string, Candidate[]>();
    }
    return this.wildcardCandidateCache_;
  }

  private wildcardMatch(pattern: string, key: string): boolean {
    if (pattern.length !== key.length) {
      return false;
    }
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== '*' && pattern[i] !== key[i]) {
        return false;
      }
    }
    return true;
  }

  private setWildcardCache(key: string, candidates: Candidate[]): Candidate[] {
    const cache = this.wildcardCandidateCache;
    if (cache.has(key)) {
      cache.delete(key);
    }
    cache.set(key, candidates);
    if (cache.size > GeneralInputTableWrapper.WILDCARD_CACHE_LIMIT) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) {
        cache.delete(oldestKey);
      }
    }
    return candidates;
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
    remapped.sort((a, b) => a[0].length - b[0].length);
    return remapped;
  }

  lookupForCandidate(radicals: string): Candidate[] | [] {
    if (radicals.includes('*')) {
      const cached = this.wildcardCandidateCache.get(radicals);
      if (cached) {
        return cached;
      }

      const candidates: Candidate[] = [];
      const bucket = this.keysByLength.get(radicals.length) ?? [];
      for (const key of bucket) {
        if (this.wildcardMatch(radicals, key)) {
          const founds = this.table.chardefs[key];
          for (const found of founds) {
            candidates.push(new Candidate(found, ''));
          }
        }
      }
      return this.setWildcardCache(radicals, candidates);
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

  get isPhoneticTable(): boolean {
    return false;
  }

  createSyllable(keys: string): InputTableSyllable | undefined {
    return undefined;
  }
}

export class BopomofoInputTableWrapper extends GeneralInputTableWrapper {
  constructor(
    id: string,
    jsonSource: string,
    settings: InputTableSettings,
    additionalSource?: string[] | undefined,
  ) {
    super(id, jsonSource, settings, additionalSource);
  }

  override get isPhoneticTable(): boolean {
    return true;
  }

  override createSyllable(keys: string): InputTableSyllable {
    return BopomofoSyllable.fromKeys(keys);
  }
}

export class WslInputTableWrapper extends GeneralInputTableWrapper {
  constructor(
    id: string,
    jsonSource: string,
    settings: InputTableSettings,
    additionalSource?: string[] | undefined,
  ) {
    super(id, jsonSource, settings, additionalSource);
  }

  override get isPhoneticTable(): boolean {
    return true;
  }

  override createSyllable(keys: string): InputTableSyllable {
    return BopomofoWslSyllable.fromKeys(keys);
  }
}

export class HakkaInputTableWrapper extends GeneralInputTableWrapper {
  constructor(
    id: string,
    jsonSource: string,
    settings: InputTableSettings,
    additionalSource?: string[] | undefined,
  ) {
    super(id, jsonSource, settings, additionalSource);
  }

  override get isPhoneticTable(): boolean {
    return true;
  }

  override createSyllable(keys: string): InputTableSyllable {
    return HakkaSyllable.fromKeys(keys);
  }
}
