import { Candidate } from '../data';
import { InputController } from './InputController';
import { BasicInputtingState, EmptyState } from './InputState';
import { InputUI } from './InputUI';
import { Key } from './Key';
import { KeyHandler } from './KeyHandler';
import { KeyMapping } from './KeyMapping';
import { Settings } from './Settings';

describe('InputController', () => {
  let ui: InputUI;
  let controller: InputController;
  let mockKeyHandler: jest.Mocked<KeyHandler>;

  beforeEach(() => {
    // Create a simple mock object for KeyHandler.
    mockKeyHandler = {
      isPime: false,
      handle: jest.fn(),
    } as unknown as jest.Mocked<KeyHandler>;

    ui = {
      reset: jest.fn(),
      update: jest.fn(),
      commitString: jest.fn(),
    } as unknown as InputUI;

    // Inject the mock KeyHandler into the InputController.
    controller = new InputController(ui, mockKeyHandler);
  });

  it('should get and set isPime correctly', () => {
    expect(controller.isPime).toBe(false);
    controller.isPime = true;
    expect(mockKeyHandler.isPime).toBe(true);
    expect(controller.isPime).toBe(true);
  });

  it('should reset the controller to EmptyState and reset UI', () => {
    const reason = 'test reset';
    controller.reset(reason);
    expect(ui.reset).toHaveBeenCalledTimes(1);
    expect(controller.state).toBeInstanceOf(EmptyState);
    expect((controller.state as EmptyState).reason).toBe(reason);
  });

  it('should get and set settings correctly', () => {
    const defaultSettings: Settings = {
      chineseConversionEnabled: false,
      associatedPhrasesEnabled: false,
      shiftPunctuationForSymbolsEnabled: true,
      shiftLetterForSymbolsEnabled: true,
      wildcardMatchingEnabled: false,
      clearOnErrors: false,
      beepOnErrors: false,
      reverseRadicalLookupEnabled: false,
    };
    expect(controller.settings).toEqual(defaultSettings);

    const newSettings: Settings = { ...defaultSettings, chineseConversionEnabled: true };
    controller.settings = newSettings;
    expect(controller.settings).toEqual(newSettings);
  });

  it('should not update settings if they are the same', () => {
    const onSettingChangedMock = jest.fn();
    controller.onSettingChanged = onSettingChangedMock;

    const currentSettings: Settings = controller.settings;
    controller.settings = currentSettings;

    expect(onSettingChangedMock).not.toHaveBeenCalled();
  });

  describe('state transitions', () => {
    it('should handle EmptyState correctly', () => {
      const oldState = {} as any;
      const newState = new EmptyState('reason');
      // Access private method for testing.
      (controller as any).enterState(oldState, newState);
      expect(ui.reset).toHaveBeenCalledTimes(1);
      expect(controller.state).toBe(newState);
    });

    it('should handle CommittingState with chineseConversionEnabled = true', () => {
      const oldState = {} as any;
      const commitString = '測試';
      const convertedString = '测试';
      const newState = { commitString } as any;

      // Mock chinese_convert
      const ChineseConvert = require('chinese_convert');
      jest.spyOn(ChineseConvert, 'tw2cn').mockReturnValue(convertedString);
      jest.spyOn(ChineseConvert, 'cn2tw');

      controller.settings = { ...controller.settings, chineseConversionEnabled: true };

      (controller as any).handleCommittingState(oldState, newState);

      expect(ChineseConvert.tw2cn).toHaveBeenCalledWith(commitString);
      expect(ChineseConvert.cn2tw).not.toHaveBeenCalled();
      expect(ui.commitString).toHaveBeenCalledWith(convertedString);
      expect(ui.reset).toHaveBeenCalledTimes(1);
      expect(controller.state).toBeInstanceOf(EmptyState);

      // Restore mocks
      jest.restoreAllMocks();
    });

    it('should handle CommittingState with chineseConversionEnabled = false', () => {
      const oldState = {} as any;
      const commitString = '测试';
      const convertedString = '測試';
      const newState = { commitString } as any;

      // Mock chinese_convert
      const ChineseConvert = require('chinese_convert');
      jest.spyOn(ChineseConvert, 'cn2tw').mockReturnValue(convertedString);
      jest.spyOn(ChineseConvert, 'tw2cn');

      controller.settings = { ...controller.settings, chineseConversionEnabled: false };

      (controller as any).handleCommittingState(oldState, newState);

      expect(ChineseConvert.cn2tw).toHaveBeenCalledWith(commitString);
      expect(ChineseConvert.tw2cn).not.toHaveBeenCalled();
      expect(ui.commitString).toHaveBeenCalledWith(convertedString);
      expect(ui.reset).toHaveBeenCalledTimes(1);
      expect(controller.state).toBeInstanceOf(EmptyState);

      // Restore mocks
      jest.restoreAllMocks();
    });
  });

  describe('keyboard event handling', () => {
    it('should call KeyHandler.handle with a key from KeyMapping', () => {
      const mockEvent = { key: 'a', code: 'KeyA' } as KeyboardEvent;
      const expectedKey = KeyMapping.keyFromKeyboardEvent(mockEvent);

      controller.handleKeyboardEvent(mockEvent);

      // Verify that handle was called with a key object that matches what KeyMapping would produce.
      expect(mockKeyHandler.handle).toHaveBeenCalledWith(
        expect.objectContaining({ ascii: expectedKey.ascii, name: expectedKey.name }),
        expect.any(Object),
        expect.any(Function),
        expect.any(Function),
      );
    });

    it('should reset UI if KeyHandler.handle returns false', () => {
      mockKeyHandler.handle.mockReturnValue(false);
      const key = new Key('a');
      const handled = controller.handle(key);
      expect(ui.reset).toHaveBeenCalledTimes(1);
      expect(handled).toBe(false);
    });

    it('should not reset UI if KeyHandler.handle returns true', () => {
      mockKeyHandler.handle.mockReturnValue(true);
      const key = new Key('a');
      const handled = controller.handle(key);
      expect(ui.reset).not.toHaveBeenCalled();
      expect(handled).toBe(true);
    });
  });

  describe('candidate selection', () => {
    it('should select candidate and commit string if in InputtingState with valid index', () => {
      const mockCandidate = new Candidate('候選詞', '');
      const inputtingState = new BasicInputtingState({
        radicals: 'a',
        displayedRadicals: ['a'],
        selectionKeys: '1',
        candidates: [mockCandidate],
      });
      (controller as any).state_ = inputtingState;

      controller.selectCandidateAtIndex(0);

      expect(ui.commitString).toHaveBeenCalledWith(mockCandidate.displayText);
      expect(ui.reset).toHaveBeenCalledTimes(1);
      expect(controller.state).toBeInstanceOf(EmptyState);
    });

    it('should do nothing if in InputtingState with invalid index', () => {
      const mockCandidate = new Candidate('候選詞', '');
      const inputtingState = new BasicInputtingState({
        radicals: 'a',
        displayedRadicals: ['a'],
        selectionKeys: '1',
        candidates: [mockCandidate],
      });
      (controller as any).state_ = inputtingState;

      controller.selectCandidateAtIndex(1);

      expect(ui.commitString).not.toHaveBeenCalled();
      expect(ui.reset).not.toHaveBeenCalled();
      expect(controller.state).toBe(inputtingState);
    });

    it('should do nothing if not in InputtingState', () => {
      const emptyState = new EmptyState();
      (controller as any).state_ = emptyState;

      controller.selectCandidateAtIndex(0);

      expect(ui.commitString).not.toHaveBeenCalled();
      expect(ui.reset).not.toHaveBeenCalled();
      expect(controller.state).toBe(emptyState);
    });
  });
});
