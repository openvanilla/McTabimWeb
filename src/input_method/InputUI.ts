/**
 * Interface representing the user interface for the input method.
 * Implement this interface to provide a custom UI for the input controller.
 */
export interface InputUI {
  /**
   * Resets the UI to its initial empty state.
   */
  reset(): void;

  /**
   * Commits the given text to the application.
   * @param text The string to commit.
   */
  commitString(text: string): void;

  /**
   * Updates the UI with a new state represented as a JSON string.
   * @param state The JSON string representing the new UI state.
   */
  update(state: string): void;
}
