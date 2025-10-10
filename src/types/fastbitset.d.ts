/**
 * Type definitions for fastbitset
 * Reference: https://github.com/lemire/FastBitSet.js/
 */

declare module 'fastbitset' {
  export default class FastBitSet {
    words: Uint32Array;

    constructor();

    /**
     * Add a value to the set
     */
    add(value: number): void;

    /**
     * Check if the set contains a value
     */
    has(value: number): boolean;

    /**
     * Remove a value from the set
     */
    remove(value: number): void;

    /**
     * Return the number of values in the set
     */
    size(): number;

    /**
     * Return true if the set is empty
     */
    isEmpty(): boolean;

    /**
     * Return an array of all values in the set
     */
    array(): number[];

    /**
     * In-place union (modifies this set)
     */
    union(other: FastBitSet): void;

    /**
     * Create new set with union
     */
    new_union(other: FastBitSet): FastBitSet;

    /**
     * In-place intersection (modifies this set)
     */
    intersection(other: FastBitSet): void;

    /**
     * Create new set with intersection
     */
    new_intersection(other: FastBitSet): FastBitSet;

    /**
     * In-place difference (modifies this set)
     */
    difference(other: FastBitSet): void;

    /**
     * Create new set with difference
     */
    new_difference(other: FastBitSet): FastBitSet;

    /**
     * Clone the set
     */
    clone(): FastBitSet;

    /**
     * Clear all values
     */
    clear(): void;

    /**
     * Trim internal storage to minimum size
     */
    trim(): void;
  }
}
