import { SymbolCategory } from './SymbolCategory';

export class SymbolTableParser {
  private constructor() {}

  static parse(text: string): SymbolCategory[] {
    let categories: SymbolCategory[] = [];
    let lines = text.split('\n');
    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        continue;
      }
      const parts = trimmed.split('=');
      if (parts.length < 2) {
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
