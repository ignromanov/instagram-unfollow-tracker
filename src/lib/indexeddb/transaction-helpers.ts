/**
 * IndexedDB Transaction Helpers
 * Reusable utilities for working with IndexedDB transactions and promises
 */

/**
 * Execute a read operation on a store and return result as Promise
 */
export function executeRead<T>(
  store: IDBObjectStore,
  key: IDBValidKey | IDBKeyRange
): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Execute a write operation (put) on a store
 */
export function executeWrite<T>(store: IDBObjectStore, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = store.put(value);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Execute a delete operation on a store
 */
export function executeDelete(store: IDBObjectStore, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all keys matching a range from an index
 */
export function getAllKeysFromIndex(index: IDBIndex, range: IDBKeyRange): Promise<IDBValidKey[]> {
  return new Promise((resolve, reject) => {
    const request = index.getAllKeys(range);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all records from a store
 */
export function getAllRecords<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Wait for a transaction to complete
 */
export function waitForTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
