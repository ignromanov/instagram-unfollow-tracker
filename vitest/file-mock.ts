/**
 * Mock File implementation for testing file uploads
 * Includes: arrayBuffer(), text(), stream() methods
 */
export function setupFileMock() {
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
      const content = this.content;
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(content));
          controller.close();
        },
      });
    }
  } as any;
}
