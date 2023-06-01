/**
 * @module ECLevel
 */

export class ECLevel {
  #bits: number;
  #level: number;

  constructor(level: number, bits: number) {
    this.#bits = bits;
    this.#level = level;
  }

  public get bits(): number {
    return this.#bits;
  }

  public get level(): number {
    return this.#level;
  }
}

// L = ~7% correction
export const L = new ECLevel(0, 0x01);
// L = ~15% correction
export const M = new ECLevel(1, 0x00);
// L = ~25% correction
export const Q = new ECLevel(2, 0x03);
// L = ~30% correction
export const H = new ECLevel(3, 0x02);
