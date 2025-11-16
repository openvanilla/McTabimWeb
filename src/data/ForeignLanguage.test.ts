import { ForeignLanguage } from './ForeignLanguage';
import { SymbolCategory } from './SymbolCategory';

describe('ForeignLanguage', () => {
  let foreignLanguage: ForeignLanguage;

  beforeEach(() => {
    foreignLanguage = new ForeignLanguage();
  });

  it('should have default sourceData matching static sourceData', () => {
    expect(foreignLanguage.sourceData).toBe(ForeignLanguage.sourceData.trim());
  });

  it('should parse tables from sourceData', () => {
    const tables = foreignLanguage.tables;
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);
    expect(tables[0]).toBeInstanceOf(SymbolCategory);
  });

  it('should update tables when sourceData is set', () => {
    const newSource = 'TestCategory=abc';
    foreignLanguage.sourceData = newSource;
    expect(foreignLanguage.sourceData).toBe(newSource);
    expect(foreignLanguage.tables.length).toBe(1);
    const table = foreignLanguage.tables[0];
    expect(table).toBeInstanceOf(SymbolCategory);
    if (table instanceof SymbolCategory) {
      expect(table.name).toBe('TestCategory');
      expect(table.nodes).toEqual(['a', 'b', 'c']);
    }
  });

  it('should trim sourceData on initialization', () => {
    const instance = new ForeignLanguage();
    expect(instance.sourceData.startsWith('\n')).toBe(false);
    expect(instance.sourceData.endsWith('\n')).toBe(false);
  });

  it('should not share tables between instances', () => {
    const instance1 = new ForeignLanguage();
    const instance2 = new ForeignLanguage();
    instance1.sourceData = 'A=1';
    instance2.sourceData = 'B=2';
    const table0 = instance1.tables[0];
    const table1 = instance2.tables[0];
    expect(table0).toBeInstanceOf(SymbolCategory);
    expect(table1).toBeInstanceOf(SymbolCategory);
    if (table0 instanceof SymbolCategory && table1 instanceof SymbolCategory) {
      expect(table0.name).toBe('A');
      expect(table1.name).toBe('B');
    }
  });
});
