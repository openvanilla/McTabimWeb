import { BopomofoSyllable } from './BopomofoSyllable';
import { BopomofoWslSyllable } from './BopomofoWslSyllable';
import { Candidate } from './Candidate';
import { HakkaSyllable } from './HakkaSyllable';
import { InputTable } from './InputTable';

/**
 * Static configuration for an input table.
 */
export interface InputTableSettings {
  maxRadicals: number;
}

/**
 * Common shape returned by phonetic syllable parsers.
 */
export interface InputTableSyllable {
  /**
   * Indicates whether the parsed key sequence forms a valid syllable.
   */
  readonly isValid: boolean;

  /**
   * Returns the normalized key sequence that produced the syllable.
   */
  readonly keys: string;

  /**
   * Returns the rendered reading shown to the user for this syllable.
   */
  readonly reading: string;

  /**
   * Optional tone marker extracted from the key sequence.
   */
  readonly tone?: string | undefined;
}

/**
 * Polymorphic wrapper around a parsed input table.
 *
 * Implementations expose a shared API for candidate lookup, reverse lookup,
 * displayed key names, and optional phonetic syllable creation.
 */
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
 * Default wrapper for non-phonetic input tables.
 *
 * It lazily parses table JSON, merges optional supplemental tables, and
 * provides candidate lookup plus reverse-lookup helpers.
 */
export class GeneralInputTableWrapper implements InputTableWrapper {
  private static readonly WILDCARD_CACHE_LIMIT = 128;
  private reverseLookUpTable_: { [key: string]: string[] } | undefined = undefined;
  private keysByLength_: Map<number, string[]> | undefined = undefined;
  private wildcardCandidateCache_: Map<string, Candidate[]> | undefined = undefined;

  /**
   * Creates a general input-table wrapper.
   *
   * @param id - Stable identifier for the table.
   * @param jsonSource - Primary JSON payload for the table.
   * @param settings - Static table settings.
   * @param additionalSource - Optional supplemental table JSON payloads.
   */
  constructor(
    public id: string,
    public jsonSource: string,
    public settings: InputTableSettings,
    public additionalSource?: string[] | undefined,
  ) {}

  table_: InputTable | undefined;
  /**
   * Returns the lazily parsed table, including any merged supplemental sources.
   */
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

  /**
   * Looks up all radical strings that can produce the given character.
   *
   * Returned radicals are remapped through `keynames` for display.
   *
   * @param character - The committed character to reverse-lookup.
   * @returns Display-form radical strings sorted by length.
   */
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

  /**
   * Looks up both displayed and original radicals for a committed character.
   *
   * Each entry contains `[displayedRadicals, originalRadicals]`.
   *
   * @param character - The committed character to reverse-lookup.
   * @returns Display and source radical pairs sorted by displayed length.
   */
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

  /**
   * Returns candidates that match the provided radicals.
   *
   * Asterisks are treated as single-position wildcards and are cached.
   *
   * @param radicals - Exact radicals or a wildcard pattern.
   * @returns Matching candidates in table order.
   */
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

  /**
   * Returns the display label for a table key.
   *
   * @param key - Raw table key.
   * @returns The localized display name when available, otherwise the key.
   */
  lookUpForDisplayedKeyName(key: string): string {
    return this.table.keynames[key] || key;
  }

  /**
   * Indicates whether the table supports phonetic syllable parsing.
   */
  get isPhoneticTable(): boolean {
    return false;
  }

  /**
   * Creates a phonetic syllable model for the given keys when supported.
   *
   * General tables do not expose syllable parsing and therefore return
   * `undefined`.
   *
   * @param keys - Input keys to interpret as a syllable.
   */
  createSyllable(keys: string): InputTableSyllable | undefined {
    return undefined;
  }
}

/**
 * Wrapper for standard Bopomofo tables.
 */
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

  /**
   * Parses Bopomofo keys into a syllable model.
   *
   * @param keys - Keyboard keys representing a Bopomofo syllable.
   */
  override createSyllable(keys: string): InputTableSyllable {
    return BopomofoSyllable.fromKeys(keys);
  }
}

/**
 * Wrapper for Wu Shou-Li Bopomofo tables.
 */
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

  /**
   * Parses Wu Shou-Li Bopomofo keys into a syllable model.
   *
   * @param keys - Keyboard keys representing a Wu Shou-Li syllable.
   */
  override createSyllable(keys: string): InputTableSyllable {
    return BopomofoWslSyllable.fromKeys(keys);
  }
}

/**
 * Wrapper for Hakka phonetic tables.
 */
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

  /**
   * Parses Hakka keys into a syllable model.
   *
   * @param keys - Keyboard keys representing a Hakka syllable.
   */
  override createSyllable(keys: string): InputTableSyllable {
    return HakkaSyllable.fromKeys(keys);
  }
}
