/**
 * BitSet - Wrapper around FastBitSet.js for optimized bitwise operations
 *
 * Uses FastBitSet.js library by Daniel Lemire for maximum performance
 * Reference: https://github.com/lemire/FastBitSet.js/
 */

import FastBitSet from 'fastbitset';

export class BitSet {
  private bitset: FastBitSet;

  constructor(_size?: number) {
    this.bitset = new FastBitSet();
  }

  /**
   * Create BitSet from Uint8Array (for IndexedDB storage)
   */
  static fromUint8Array(arr: Uint8Array): BitSet {
    const wrapper = new BitSet();
    // FastBitSet uses Uint32Array internally
    const uint32Array = new Uint32Array(arr.buffer, arr.byteOffset, arr.byteLength / 4);
    wrapper.bitset.words = uint32Array;
    return wrapper;
  }

  /**
   * Create BitSet from array of indices
   */
  static fromIndices(indices: number[], _totalSize?: number): BitSet {
    const bitset = new BitSet();
    for (const index of indices) {
      bitset.set(index);
    }
    return bitset;
  }

  /**
   * Set bit at index to 1
   */
  set(index: number): void {
    this.bitset.add(index);
  }

  /**
   * Check if bit at index is 1
   */
  has(index: number): boolean {
    return this.bitset.has(index);
  }

  /**
   * Clear bit at index (set to 0)
   */
  clear(index: number): void {
    this.bitset.remove(index);
  }

  /**
   * Intersect with another bitset (AND operation)
   * Returns new BitSet with bits set where BOTH have bits
   */
  intersect(other: BitSet): BitSet {
    const result = new BitSet();
    result.bitset = this.bitset.new_intersection(other.bitset);
    return result;
  }

  /**
   * Intersect in place (mutates this bitset)
   */
  intersectInPlace(other: BitSet): void {
    this.bitset.intersection(other.bitset);
  }

  /**
   * Union with another bitset (OR operation)
   * Returns new BitSet with bits set where EITHER has bits
   */
  union(other: BitSet): BitSet {
    const result = new BitSet();
    result.bitset = this.bitset.new_union(other.bitset);
    return result;
  }

  /**
   * Union in place (mutates this bitset)
   */
  unionInPlace(other: BitSet): void {
    this.bitset.union(other.bitset);
  }

  /**
   * Convert bitset to array of indices where bits are set
   * Used to get list of matching account indices
   */
  toIndices(): number[] {
    return this.bitset.array();
  }

  /**
   * Count number of set bits (population count)
   */
  count(): number {
    return this.bitset.size();
  }

  /**
   * Convert to Uint8Array for IndexedDB storage
   */
  toUint8Array(): Uint8Array {
    const words = this.bitset.words;
    // Handle empty bitsets (FastBitSet initializes with empty array)
    if (!words || words.length === 0) {
      return new Uint8Array(0);
    }

    // FastBitSet.words is a regular JavaScript array, not Uint32Array
    // We need to convert it to Uint32Array first
    const uint32Array = new Uint32Array(words);
    return new Uint8Array(uint32Array.buffer, uint32Array.byteOffset, uint32Array.byteLength);
  }

  /**
   * Get size in bytes
   */
  get byteLength(): number {
    // FastBitSet.words is a regular array, calculate size manually
    return this.bitset.words.length * 4; // 4 bytes per 32-bit word
  }

  /**
   * Get number of bits (capacity)
   */
  get size(): number {
    return this.bitset.words.length * 32;
  }

  /**
   * Check if bitset is empty
   */
  isEmpty(): boolean {
    return this.bitset.isEmpty();
  }

  /**
   * Clone bitset
   */
  clone(): BitSet {
    const result = new BitSet();
    result.bitset = this.bitset.clone();
    return result;
  }
}

/**
 * Helper for building columnar string data
 * Packs strings into a single buffer with offset table
 */
export class StringColumnBuilder {
  private strings: string[] = [];
  private encoder = new TextEncoder();

  push(value: string): void {
    this.strings.push(value);
  }

  build(): { data: Uint8Array; offsets: Uint32Array; length: number } {
    const length = this.strings.length;
    const offsets = new Uint32Array(length + 1); // +1 for final offset

    // Calculate total size and build offsets
    let totalBytes = 0;
    for (let i = 0; i < length; i++) {
      offsets[i] = totalBytes;
      totalBytes += this.encoder.encode(this.strings[i]).byteLength;
    }
    offsets[length] = totalBytes;

    // Pack all strings into single buffer
    const data = new Uint8Array(totalBytes);
    let writePos = 0;

    for (const str of this.strings) {
      const encoded = this.encoder.encode(str);
      data.set(encoded, writePos);
      writePos += encoded.byteLength;
    }

    return { data, offsets, length };
  }
}

/**
 * Helper for reading columnar string data
 */
export class StringColumnReader {
  private decoder = new TextDecoder();
  private data: Uint8Array;
  private offsets: Uint32Array;

  constructor(data: Uint8Array, offsets: Uint32Array) {
    this.data = data;
    this.offsets = offsets;
  }

  get(index: number): string {
    const start = this.offsets[index];
    const end = this.offsets[index + 1];
    const slice = this.data.subarray(start, end);
    return this.decoder.decode(slice);
  }

  getRange(start: number, end: number): string[] {
    const result: string[] = [];
    for (let i = start; i < end; i++) {
      result.push(this.get(i));
    }
    return result;
  }

  get length(): number {
    return this.offsets.length - 1;
  }
}
