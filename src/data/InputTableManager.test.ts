import { InputTableManager } from './InputTableManager';

describe('InputTableManager', () => {
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
    manager.setInputTableById('invalid_id');
    expect(manager.currentTable.id).toBe('checj');
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
    expect(manager.tables[index][0]).toBe('dayi3');
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
    const tables = manager.tables;
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
  it('should return the same instance from getInstance()', () => {
    const instance1 = InputTableManager.getInstance();
    const instance2 = InputTableManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should return the correct selectedTable based on selectedIndexValue', () => {
    const manager = InputTableManager.getInstance();
    manager.selectedIndexValue = 0;
    expect(manager.currentTable.id).toBe('checj');
  });

  it('should return associatedPhrases as an object', () => {
    const manager = InputTableManager.getInstance();
    const phrases = manager.associatedPhrases;
    expect(phrases).toBeDefined();
    expect(typeof phrases).toBe('object');
  });

  it('should return an array of phrases for lookUpForAssociatedPhrases', () => {
    const manager = InputTableManager.getInstance();
    const phrases = manager.lookUpForAssociatedPhrases('a');
    expect(Array.isArray(phrases)).toBe(true);
  });

  it('should return an array of radicals for reverseLookupForRadicals', () => {
    const manager = InputTableManager.getInstance();
    const radicals = manager.reverseLookupForRadicals('我');
    expect(Array.isArray(radicals)).toBe(true);
  });

  it('should return an array of strings for lookupBpmfReadings', () => {
    const manager = InputTableManager.getInstance();
    const readings = manager.lookupBpmfReadings('中');
    expect(Array.isArray(readings)).toBe(true);
  });
});
