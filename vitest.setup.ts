import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Fix for setimmediate package in test environment
if (typeof global.attachEvent === 'undefined') {
  global.attachEvent = () => {};
}

// Mock File with arrayBuffer method
global.File = class MockFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  content: string;

  constructor(chunks: string[], name: string, options: { type?: string } = {}) {
    this.name = name;
    this.size = chunks.join('').length;
    this.type = options.type || '';
    this.lastModified = Date.now();
    this.content = chunks.join('');
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    return encoder.encode(this.content).buffer;
  }

  async text(): Promise<string> {
    return this.content;
  }

  stream(): ReadableStream {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(this.content));
        controller.close();
      },
    });
  }
} as any;
