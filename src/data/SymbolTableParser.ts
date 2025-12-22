import { SymbolCategory } from './SymbolCategory';

/**
 * Parses a string of symbol categories and symbols into an array of symbol
 * categories.
 */
export class SymbolTableParser {
  private constructor() {}

  /**
   * Parses a string of symbol categories and symbols into an array of symbol
   * categories.
   */
  static parse(text: string): (SymbolCategory | string)[] {
    const categories: (SymbolCategory | string)[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        continue;
      }
      const parts = trimmed.split('=');
      if (parts.length < 2) {
        categories.push(trimmed);
        continue;
      }
      const name = parts[0].trim();
      const symbols = parts.slice(1).join('=').trim().split('');
      const category = new SymbolCategory({ name: name, id: name, nodes: symbols });
      categories.push(category);
    }
    return categories;
  }
}
