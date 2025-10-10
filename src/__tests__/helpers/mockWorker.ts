import { vi } from 'vitest';

// Mock Web Worker API
export class MockWorker {
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: ErrorEvent) => void) | null = null;
  public onmessageerror: ((event: MessageEvent) => void) | null = null;

  private messageHandlers: Array<(event: MessageEvent) => void> = [];
  private errorHandlers: Array<(event: ErrorEvent) => void> = [];

  constructor(_scriptURL: string | URL, _options?: WorkerOptions) {
    // Simulate worker initialization
    setTimeout(() => {
      this.postMessage({ type: 'ready' });
    }, 0);
  }

  postMessage(message: any, _transfer?: Transferable[]): void {
    // Simulate message processing
    setTimeout(() => {
      if (message.type === 'filter') {
        const { accounts, filters, searchQuery } = message.data;

        // Simple filtering logic for testing
        let filteredAccounts = accounts;

        if (filters && filters.size > 0) {
          filteredAccounts = accounts.filter((account: any) => {
            return Array.from(filters).every(filter => {
              return account.badges[filter as keyof typeof account.badges];
            });
          });
        }

        if (searchQuery) {
          filteredAccounts = filteredAccounts.filter((account: any) => {
            return account.username.toLowerCase().includes(searchQuery.toLowerCase());
          });
        }

        this.dispatchMessage({
          data: {
            type: 'filter-result',
            data: {
              accounts: filteredAccounts,
              filters,
              searchQuery,
            },
          },
        } as MessageEvent);
      }
    }, 0);
  }

  terminate(): void {
    // Clean up
    this.messageHandlers = [];
    this.errorHandlers = [];
  }

  addEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.messageHandlers.push(listener as (event: MessageEvent) => void);
    } else if (type === 'error') {
      this.errorHandlers.push(listener as (event: ErrorEvent) => void);
    }
  }

  removeEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      const index = this.messageHandlers.indexOf(listener as (event: MessageEvent) => void);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    } else if (type === 'error') {
      const index = this.errorHandlers.indexOf(listener as (event: ErrorEvent) => void);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    }
  }

  private dispatchMessage(message: MessageEvent): void {
    if (this.onmessage) {
      this.onmessage(message);
    }
    this.messageHandlers.forEach(handler => handler(message));
  }

  private dispatchError(error: ErrorEvent): void {
    if (this.onerror) {
      this.onerror(error);
    }
    this.errorHandlers.forEach(handler => handler(error));
  }
}

// Mock the Worker constructor
export const mockWorker = () => {
  const originalWorker = global.Worker;

  global.Worker = MockWorker as any;

  return {
    restore: () => {
      global.Worker = originalWorker;
    },
  };
};

// Mock for vitest
export const setupWorkerMock = () => {
  vi.stubGlobal('Worker', MockWorker);
};

export const teardownWorkerMock = () => {
  vi.unstubAllGlobals();
};
