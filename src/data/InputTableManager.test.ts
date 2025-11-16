import { InputTableManager, InputTable } from './InputTableManager';

describe('InputTableManager', () => {
  it('test get keynames', () => {
    const manager = InputTableManager.getInstance();
    manager.setInputTableById('cj5');
    const table: InputTable = manager.currentTable.table;
    expect(table.keynames['z']).toBe('重');
    expect(table.keynames['a']).toBe('日');
  });

  it('should return the same instance (singleton)', () => {
    const manager1 = InputTableManager.getInstance();
    const manager2 = InputTableManager.getInstance();
    expect(manager1).toBe(manager2);
  });

  it('should change input table when setInputTableById is called', () => {
    const manager = InputTableManager.getInstance();
    manager.setInputTableById('cj5');
    const table1 = manager.currentTable.table;
    manager.setInputTableById('simplex');
    const table2 = manager.currentTable.table;
    expect(table1).not.toBe(table2);
  });

  it('should throw or handle invalid table id gracefully', () => {
    const manager = InputTableManager.getInstance();
    expect(() => manager.setInputTableById('invalid_id')).toThrow();
    // Optionally, check fallback or error state
  });

  it('should have keynames property in current table', () => {
    const manager = InputTableManager.getInstance();
    manager.setInputTableById('cj5');
    const table: InputTable = manager.currentTable.table;
    expect(table).toHaveProperty('keynames');
    expect(typeof table.keynames).toBe('object');
  });

  it('should return correct table id after switching', () => {
    const manager = InputTableManager.getInstance();
    manager.setInputTableById('simplex');
    expect(manager.currentTable.id).toBe('simplex');
    manager.setInputTableById('cj5');
    expect(manager.currentTable.id).toBe('cj5');
  });

  it('should return the correct selectedIndexValue', () => {
    const manager = InputTableManager.getInstance();
    manager.setInputTableById('dayi3');
    const index = manager.selectedIndexValue;
    expect(manager.currentTable.id).toBe('dayi3');
    expect(manager.getTables()[index][0]).toBe('dayi3');
  });

  it('should set selectedIndexValue and update currentTable', () => {
    const manager = InputTableManager.getInstance();
    manager.selectedIndexValue = 2;
    expect(manager.currentTable.id).toBe('simplex');
    expect(manager.selectedIndexValue).toBe(2);
  });

  it('should throw when setting selectedIndexValue out of bounds', () => {
    const manager = InputTableManager.getInstance();
    expect(() => {
      manager.selectedIndexValue = -1;
    }).toThrow();
    expect(() => {
      manager.selectedIndexValue = 100;
    }).toThrow();
  });

  it('should return all tables with getTables()', () => {
    const manager = InputTableManager.getInstance();
    const tables = manager.getTables();
    expect(Array.isArray(tables)).toBe(true);
    expect(tables.length).toBeGreaterThan(0);
    expect(tables[0][0]).toBe('checj');
  });

  it('should return symbolTable with chardefs and keynames', () => {
    const manager = InputTableManager.getInstance();
    const symbolTable = manager.symbolTable;
    expect(symbolTable).toHaveProperty('chardefs');
    expect(symbolTable).toHaveProperty('keynames');
    expect(Array.isArray(symbolTable.keynames)).toBe(true);
  });

  it('should return shiftLetterSymbols as an object', () => {
    const manager = InputTableManager.getInstance();
    const shiftSymbols = manager.shiftLetterSymbols;
    expect(typeof shiftSymbols).toBe('object');
    expect(Object.keys(shiftSymbols).length).toBeGreaterThan(0);
  });

  it('should return an EmojiTable instance for emojiTable', () => {
    const manager = InputTableManager.getInstance();
    expect(manager.emojiTable).toBeDefined();
    expect(typeof manager.emojiTable).toBe('object');
  });
});
