/**
 * Mock localStorage and sessionStorage implementation
 * Provides full Storage interface with Map-based backend
 */
class LocalStorageMock implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

/**
 * Setup localStorage and sessionStorage mocks for testing
 */
export function setupStorageMocks() {
  // Replace global localStorage and sessionStorage
  global.localStorage = new LocalStorageMock();
  global.sessionStorage = new LocalStorageMock();
}
