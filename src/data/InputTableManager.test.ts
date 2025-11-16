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
});
