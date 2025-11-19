import { CustomSymbolTable } from './CustomSymbolTable';
import { SymbolCategory } from './SymbolCategory';

describe('CustomSymbolTable', () => {
  it('trims its default source data so lookups stay predictable', () => {
    const table = new CustomSymbolTable();
    expect(table.sourceData.startsWith('\n')).toBe(false);
    expect(table.tables.length).toBeGreaterThan(0);
  });

  it('re-parses and exposes tables when sourceData is updated', () => {
    const table = new CustomSymbolTable();
    const customData = `
自訂分類=★☆
單獨符號
`;
    table.sourceData = customData;
    expect(table.sourceData).toBe(customData);
    expect(table.tables[0]).toBeInstanceOf(SymbolCategory);
    if (table.tables[0] instanceof SymbolCategory) {
      expect(table.tables[0].name).toBe('自訂分類');
      expect(table.tables[0].nodes).toEqual(['★', '☆']);
    }
    expect(table.tables[1]).toBe('單獨符號');
  });
});
