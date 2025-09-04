import { describe, it, expect, beforeEach } from 'vitest';
import { BitSet, StringColumnBuilder, StringColumnReader } from '@/lib/indexeddb/bitset';

describe('BitSet', () => {
  describe('constructor', () => {
    it('should create empty bitset', () => {
      const bitset = new BitSet();
      expect(bitset.isEmpty()).toBe(true);
      expect(bitset.count()).toBe(0);
    });

    it('should create bitset with size parameter (ignored)', () => {
      const bitset = new BitSet(1000);
      expect(bitset.isEmpty()).toBe(true);
      expect(bitset.count()).toBe(0);
    });
  });

  describe('static methods', () => {
    describe('fromUint8Array', () => {
      it('should create bitset from Uint8Array', () => {
        // Create a bitset with some data
        const original = new BitSet();
        original.set(0);
        original.set(1);
        original.set(32);
        original.set(100);

        const uint8Array = original.toUint8Array();
        const restored = BitSet.fromUint8Array(uint8Array);

        expect(restored.has(0)).toBe(true);
        expect(restored.has(1)).toBe(true);
        expect(restored.has(32)).toBe(true);
        expect(restored.has(100)).toBe(true);
        expect(restored.count()).toBe(4);
      });

      it('should handle empty Uint8Array', () => {
        const empty = new Uint8Array(0);
        const bitset = BitSet.fromUint8Array(empty);
        expect(bitset.isEmpty()).toBe(true);
      });
    });

    describe('fromIndices', () => {
      it('should create bitset from array of indices', () => {
        const indices = [0, 1, 5, 10, 100];
        const bitset = BitSet.fromIndices(indices);

        expect(bitset.has(0)).toBe(true);
        expect(bitset.has(1)).toBe(true);
        expect(bitset.has(5)).toBe(true);
        expect(bitset.has(10)).toBe(true);
        expect(bitset.has(100)).toBe(true);
        expect(bitset.count()).toBe(5);
      });

      it('should handle empty array', () => {
        const bitset = BitSet.fromIndices([]);
        expect(bitset.isEmpty()).toBe(true);
        expect(bitset.count()).toBe(0);
      });

      it('should handle duplicate indices', () => {
        const indices = [1, 1, 2, 2, 3];
        const bitset = BitSet.fromIndices(indices);
        expect(bitset.count()).toBe(3); // Duplicates should be ignored
      });
    });
  });

  describe('basic operations', () => {
    let bitset: BitSet;

    beforeEach(() => {
      bitset = new BitSet();
    });

    describe('set', () => {
      it('should set bit at index', () => {
        bitset.set(0);
        expect(bitset.has(0)).toBe(true);
        expect(bitset.count()).toBe(1);
      });

      it('should set multiple bits', () => {
        bitset.set(0);
        bitset.set(1);
        bitset.set(100);
        expect(bitset.has(0)).toBe(true);
        expect(bitset.has(1)).toBe(true);
        expect(bitset.has(100)).toBe(true);
        expect(bitset.count()).toBe(3);
      });

      it('should handle large indices', () => {
        bitset.set(1000000);
        expect(bitset.has(1000000)).toBe(true);
        expect(bitset.count()).toBe(1);
      });
    });

    describe('has', () => {
      it('should return false for unset bits', () => {
        expect(bitset.has(0)).toBe(false);
        expect(bitset.has(100)).toBe(false);
      });

      it('should return true for set bits', () => {
        bitset.set(5);
        expect(bitset.has(5)).toBe(true);
      });
    });

    describe('clear', () => {
      it('should clear set bit', () => {
        bitset.set(5);
        expect(bitset.has(5)).toBe(true);

        bitset.clear(5);
        expect(bitset.has(5)).toBe(false);
        expect(bitset.count()).toBe(0);
      });

      it('should handle clearing unset bit', () => {
        bitset.clear(5);
        expect(bitset.has(5)).toBe(false);
        expect(bitset.count()).toBe(0);
      });
    });
  });

  describe('bitwise operations', () => {
    let bitset1: BitSet;
    let bitset2: BitSet;

    beforeEach(() => {
      bitset1 = new BitSet();
      bitset2 = new BitSet();
    });

    describe('intersect', () => {
      it('should return intersection of two bitsets', () => {
        bitset1.set(0);
        bitset1.set(1);
        bitset1.set(2);

        bitset2.set(1);
        bitset2.set(2);
        bitset2.set(3);

        const result = bitset1.intersect(bitset2);

        expect(result.has(0)).toBe(false);
        expect(result.has(1)).toBe(true);
        expect(result.has(2)).toBe(true);
        expect(result.has(3)).toBe(false);
        expect(result.count()).toBe(2);
      });

      it('should handle empty intersection', () => {
        bitset1.set(0);
        bitset1.set(1);
        bitset2.set(2);
        bitset2.set(3);

        const result = bitset1.intersect(bitset2);
        expect(result.isEmpty()).toBe(true);
      });

      it('should not mutate original bitsets', () => {
        bitset1.set(0);
        bitset1.set(1);
        bitset2.set(1);
        bitset2.set(2);

        const original1Count = bitset1.count();
        const original2Count = bitset2.count();

        bitset1.intersect(bitset2);

        expect(bitset1.count()).toBe(original1Count);
        expect(bitset2.count()).toBe(original2Count);
      });
    });

    describe('intersectInPlace', () => {
      it('should intersect in place', () => {
        bitset1.set(0);
        bitset1.set(1);
        bitset1.set(2);

        bitset2.set(1);
        bitset2.set(2);
        bitset2.set(3);

        bitset1.intersectInPlace(bitset2);

        expect(bitset1.has(0)).toBe(false);
        expect(bitset1.has(1)).toBe(true);
        expect(bitset1.has(2)).toBe(true);
        expect(bitset1.has(3)).toBe(false);
        expect(bitset1.count()).toBe(2);
      });

      it('should not affect other bitset', () => {
        bitset1.set(0);
        bitset1.set(1);
        bitset2.set(1);
        bitset2.set(2);

        const original2Count = bitset2.count();

        bitset1.intersectInPlace(bitset2);

        expect(bitset2.count()).toBe(original2Count);
      });
    });

    describe('union', () => {
      it('should return union of two bitsets', () => {
        bitset1.set(0);
        bitset1.set(1);

        bitset2.set(1);
        bitset2.set(2);

        const result = bitset1.union(bitset2);

        expect(result.has(0)).toBe(true);
        expect(result.has(1)).toBe(true);
        expect(result.has(2)).toBe(true);
        expect(result.count()).toBe(3);
      });

      it('should handle empty union', () => {
        const result = bitset1.union(bitset2);
        expect(result.isEmpty()).toBe(true);
      });

      it('should not mutate original bitsets', () => {
        bitset1.set(0);
        bitset2.set(1);

        const original1Count = bitset1.count();
        const original2Count = bitset2.count();

        bitset1.union(bitset2);

        expect(bitset1.count()).toBe(original1Count);
        expect(bitset2.count()).toBe(original2Count);
      });
    });

    describe('unionInPlace', () => {
      it('should union in place', () => {
        bitset1.set(0);
        bitset1.set(1);

        bitset2.set(1);
        bitset2.set(2);

        bitset1.unionInPlace(bitset2);

        expect(bitset1.has(0)).toBe(true);
        expect(bitset1.has(1)).toBe(true);
        expect(bitset1.has(2)).toBe(true);
        expect(bitset1.count()).toBe(3);
      });

      it('should not affect other bitset', () => {
        bitset1.set(0);
        bitset2.set(1);

        const original2Count = bitset2.count();

        bitset1.unionInPlace(bitset2);

        expect(bitset2.count()).toBe(original2Count);
      });
    });
  });

  describe('utility methods', () => {
    let bitset: BitSet;

    beforeEach(() => {
      bitset = new BitSet();
    });

    describe('toIndices', () => {
      it('should return array of set indices', () => {
        bitset.set(0);
        bitset.set(5);
        bitset.set(100);

        const indices = bitset.toIndices();
        expect(indices).toContain(0);
        expect(indices).toContain(5);
        expect(indices).toContain(100);
        expect(indices).toHaveLength(3);
      });

      it('should return empty array for empty bitset', () => {
        const indices = bitset.toIndices();
        expect(indices).toEqual([]);
      });

      it('should return indices in ascending order', () => {
        bitset.set(100);
        bitset.set(0);
        bitset.set(50);

        const indices = bitset.toIndices();
        expect(indices).toEqual([0, 50, 100]);
      });
    });

    describe('count', () => {
      it('should return number of set bits', () => {
        expect(bitset.count()).toBe(0);

        bitset.set(0);
        expect(bitset.count()).toBe(1);

        bitset.set(1);
        bitset.set(2);
        expect(bitset.count()).toBe(3);
      });
    });

    describe('toUint8Array', () => {
      it('should convert to Uint8Array', () => {
        bitset.set(0);
        bitset.set(1);
        bitset.set(32);

        const uint8Array = bitset.toUint8Array();
        expect(uint8Array).toBeInstanceOf(Uint8Array);
        expect(uint8Array.length).toBeGreaterThan(0);
      });

      it('should handle empty bitset', () => {
        const uint8Array = bitset.toUint8Array();
        expect(uint8Array).toBeInstanceOf(Uint8Array);
        expect(uint8Array.length).toBe(0);
      });

      it('should be reversible with fromUint8Array', () => {
        bitset.set(0);
        bitset.set(1);
        bitset.set(32);
        bitset.set(100);

        const uint8Array = bitset.toUint8Array();
        const restored = BitSet.fromUint8Array(uint8Array);

        expect(restored.has(0)).toBe(true);
        expect(restored.has(1)).toBe(true);
        expect(restored.has(32)).toBe(true);
        expect(restored.has(100)).toBe(true);
        expect(restored.count()).toBe(4);
      });
    });

    describe('byteLength', () => {
      it('should return correct byte length', () => {
        expect(bitset.byteLength).toBe(0);

        bitset.set(0);
        expect(bitset.byteLength).toBe(4); // One 32-bit word

        bitset.set(32);
        expect(bitset.byteLength).toBe(8); // Two 32-bit words
      });
    });

    describe('size', () => {
      it('should return capacity in bits', () => {
        expect(bitset.size).toBe(0);

        bitset.set(0);
        expect(bitset.size).toBe(32); // One 32-bit word

        bitset.set(32);
        expect(bitset.size).toBe(64); // Two 32-bit words
      });
    });

    describe('isEmpty', () => {
      it('should return true for empty bitset', () => {
        expect(bitset.isEmpty()).toBe(true);
      });

      it('should return false for non-empty bitset', () => {
        bitset.set(0);
        expect(bitset.isEmpty()).toBe(false);
      });
    });

    describe('clone', () => {
      it('should create independent copy', () => {
        bitset.set(0);
        bitset.set(1);
        bitset.set(100);

        const clone = bitset.clone();

        // Both should have same data
        expect(clone.has(0)).toBe(true);
        expect(clone.has(1)).toBe(true);
        expect(clone.has(100)).toBe(true);
        expect(clone.count()).toBe(3);

        // Modifying one should not affect the other
        clone.clear(0);
        expect(clone.has(0)).toBe(false);
        expect(bitset.has(0)).toBe(true);

        bitset.set(200);
        expect(bitset.has(200)).toBe(true);
        expect(clone.has(200)).toBe(false);
      });
    });
  });

  describe('performance characteristics', () => {
    it('should handle large bitsets efficiently', () => {
      const bitset = new BitSet();
      const largeIndex = 1000000;

      bitset.set(largeIndex);
      expect(bitset.has(largeIndex)).toBe(true);
      expect(bitset.count()).toBe(1);
    });

    it('should handle many operations efficiently', () => {
      const bitset = new BitSet();
      const count = 10000;

      // Set many bits
      for (let i = 0; i < count; i++) {
        bitset.set(i);
      }

      expect(bitset.count()).toBe(count);

      // Clear half of them
      for (let i = 0; i < count; i += 2) {
        bitset.clear(i);
      }

      expect(bitset.count()).toBe(count / 2);
    });
  });
});

describe('StringColumnBuilder', () => {
  let builder: StringColumnBuilder;

  beforeEach(() => {
    builder = new StringColumnBuilder();
  });

  describe('push', () => {
    it('should add strings to builder', () => {
      builder.push('hello');
      builder.push('world');
      builder.push('test');

      const result = builder.build();
      expect(result.length).toBe(3);
    });

    it('should handle empty strings', () => {
      builder.push('');
      builder.push('hello');
      builder.push('');

      const result = builder.build();
      expect(result.length).toBe(3);
    });

    it('should handle unicode strings', () => {
      builder.push('hello');
      builder.push('привет');
      builder.push('🌍');

      const result = builder.build();
      expect(result.length).toBe(3);
    });
  });

  describe('build', () => {
    it('should build columnar data', () => {
      builder.push('hello');
      builder.push('world');
      builder.push('test');

      const result = builder.build();

      expect(result.data).toBeInstanceOf(Uint8Array);
      expect(result.offsets).toBeInstanceOf(Uint32Array);
      expect(result.length).toBe(3);
      expect(result.offsets.length).toBe(4); // length + 1
    });

    it('should handle empty builder', () => {
      const result = builder.build();

      expect(result.data).toBeInstanceOf(Uint8Array);
      expect(result.data.length).toBe(0);
      expect(result.offsets).toBeInstanceOf(Uint32Array);
      expect(result.offsets.length).toBe(1);
      expect(result.length).toBe(0);
    });

    it('should create correct offsets', () => {
      builder.push('a'); // 1 byte
      builder.push('hello'); // 5 bytes
      builder.push('test'); // 4 bytes

      const result = builder.build();

      expect(result.offsets[0]).toBe(0); // Start of first string
      expect(result.offsets[1]).toBe(1); // Start of second string
      expect(result.offsets[2]).toBe(6); // Start of third string
      expect(result.offsets[3]).toBe(10); // End (total bytes)
    });

    it('should handle many strings', () => {
      const count = 1000;
      for (let i = 0; i < count; i++) {
        builder.push(`string-${i}`);
      }

      const result = builder.build();
      expect(result.length).toBe(count);
      expect(result.offsets.length).toBe(count + 1);
    });
  });
});

describe('StringColumnReader', () => {
  let reader: StringColumnReader;

  describe('constructor', () => {
    it('should create reader with data and offsets', () => {
      const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
      const offsets = new Uint32Array([0, 5]);

      reader = new StringColumnReader(data, offsets);
      expect(reader.length).toBe(1);
    });
  });

  describe('get', () => {
    beforeEach(() => {
      // Create test data: ["hello", "world", "test"]
      const builder = new StringColumnBuilder();
      builder.push('hello');
      builder.push('world');
      builder.push('test');

      const result = builder.build();
      reader = new StringColumnReader(result.data, result.offsets);
    });

    it('should retrieve strings by index', () => {
      expect(reader.get(0)).toBe('hello');
      expect(reader.get(1)).toBe('world');
      expect(reader.get(2)).toBe('test');
    });

    it('should handle empty strings', () => {
      const builder = new StringColumnBuilder();
      builder.push('');
      builder.push('hello');
      builder.push('');

      const result = builder.build();
      const emptyReader = new StringColumnReader(result.data, result.offsets);

      expect(emptyReader.get(0)).toBe('');
      expect(emptyReader.get(1)).toBe('hello');
      expect(emptyReader.get(2)).toBe('');
    });

    it('should handle unicode strings', () => {
      const builder = new StringColumnBuilder();
      builder.push('hello');
      builder.push('привет');
      builder.push('🌍');

      const result = builder.build();
      const unicodeReader = new StringColumnReader(result.data, result.offsets);

      expect(unicodeReader.get(0)).toBe('hello');
      expect(unicodeReader.get(1)).toBe('привет');
      expect(unicodeReader.get(2)).toBe('🌍');
    });
  });

  describe('getRange', () => {
    beforeEach(() => {
      const builder = new StringColumnBuilder();
      builder.push('a');
      builder.push('b');
      builder.push('c');
      builder.push('d');
      builder.push('e');

      const result = builder.build();
      reader = new StringColumnReader(result.data, result.offsets);
    });

    it('should retrieve range of strings', () => {
      const range = reader.getRange(1, 4);
      expect(range).toEqual(['b', 'c', 'd']);
    });

    it('should handle single item range', () => {
      const range = reader.getRange(2, 3);
      expect(range).toEqual(['c']);
    });

    it('should handle empty range', () => {
      const range = reader.getRange(1, 1);
      expect(range).toEqual([]);
    });

    it('should handle full range', () => {
      const range = reader.getRange(0, reader.length);
      expect(range).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
  });

  describe('length', () => {
    it('should return correct length', () => {
      const builder = new StringColumnBuilder();
      builder.push('a');
      builder.push('b');
      builder.push('c');

      const result = builder.build();
      reader = new StringColumnReader(result.data, result.offsets);

      expect(reader.length).toBe(3);
    });

    it('should handle empty reader', () => {
      const data = new Uint8Array(0);
      const offsets = new Uint32Array([0]);
      reader = new StringColumnReader(data, offsets);

      expect(reader.length).toBe(0);
    });
  });

  describe('integration with builder', () => {
    it('should work with complex data', () => {
      const builder = new StringColumnBuilder();
      const testStrings = [
        'hello',
        'world',
        'привет',
        'мир',
        '🌍',
        'test',
        '',
        'unicode: 🚀',
        'numbers: 123',
        'symbols: !@#$%',
      ];

      for (const str of testStrings) {
        builder.push(str);
      }

      const result = builder.build();
      const reader = new StringColumnReader(result.data, result.offsets);

      expect(reader.length).toBe(testStrings.length);

      for (let i = 0; i < testStrings.length; i++) {
        expect(reader.get(i)).toBe(testStrings[i]);
      }

      const range = reader.getRange(0, reader.length);
      expect(range).toEqual(testStrings);
    });
  });
});
