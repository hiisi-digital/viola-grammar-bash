/**
 * Minimal assertion helpers for testing without external dependencies.
 * 
 * @module
 */

/**
 * Assert that two values are equal.
 */
export function assertEquals<T>(actual: T, expected: T, msg?: string): void {
  if (actual !== expected) {
    const message = msg || `Expected ${expected}, got ${actual}`;
    throw new AssertionError(message);
  }
}

/**
 * Assert that a value is truthy.
 */
export function assert(value: unknown, msg?: string): asserts value {
  if (!value) {
    const message = msg || "Assertion failed";
    throw new AssertionError(message);
  }
}

/**
 * Assertion error class.
 */
export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssertionError";
  }
}
