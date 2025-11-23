import { InputState } from '../input_method/InputState';
import { Candidate, MenuCandidate } from './Candidate';

describe('Candidate', () => {
  it('should create a Candidate with displayText and description', () => {
    const candidate = new Candidate('候選字', '描述');
    expect(candidate.displayText).toBe('候選字');
    expect(candidate.description).toBe('描述');
  });
});

describe('MenuCandidate', () => {
  it('should create a MenuCandidate with displayText, description, and nextState', () => {
    const mockState = {} as InputState;
    const nextState = () => mockState;
    const menuCandidate = new MenuCandidate('選單', '描述', nextState);

    expect(menuCandidate.displayText).toBe('選單');
    expect(menuCandidate.description).toBe('描述');
    expect(menuCandidate.nextState()).toBe(mockState);
  });

  it('should inherit from Candidate', () => {
    const menuCandidate = new MenuCandidate('A', 'B', () => ({} as InputState));
    expect(menuCandidate instanceof Candidate).toBe(true);
  });
});
