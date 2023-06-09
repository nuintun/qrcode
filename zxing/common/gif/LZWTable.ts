/**
 * @module LZWTable
 */

export class LZWTable {
  #size = 0;
  #table: Record<string, number> = {};

  public get size(): number {
    return this.#size;
  }

  public add(key: string): void {
    if (!this.has(key)) {
      this.#table[key] = this.#size++;
    }
  }

  public has(key: string): boolean {
    return this.#table[key] >= 0;
  }

  public indexOf(key: string): number {
    return this.#table[key];
  }
}
