import { InputController } from './InputController';
import { InputUI } from './InputUI';

describe('InputController', () => {
  let ui: InputUI;
  let controller: InputController;

  beforeEach(() => {
    ui = {
      reset: jest.fn(),
      update: jest.fn(),
      commitString: jest.fn(),
    } as unknown as InputUI;
    controller = new InputController(ui);
  });

  it('should get and set isPime correctly', () => {
    expect(controller.isPime).toBe(false);
    controller.isPime = true;
    expect(controller.isPime).toBe(true);
    controller.isPime = false;
    expect(controller.isPime).toBe(false);
  });
});

describe('InputController', () => {
  let ui: InputUI;
  let controller: InputController;

  beforeEach(() => {
    ui = {
      reset: jest.fn(),
      update: jest.fn(),
      commitString: jest.fn(),
    } as unknown as InputUI;
    controller = new InputController(ui);
  });

  it('should get and set isPime correctly', () => {
    expect(controller.isPime).toBe(false);
    controller.isPime = true;
    expect(controller.isPime).toBe(true);
    controller.isPime = false;
    expect(controller.isPime).toBe(false);
  });
});
