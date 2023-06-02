/**
 * @module ECLevel
 */

export class ECLevel {
  #bits: number;
  #level: number;

  // L = ~7% correction
  public static L = new ECLevel(0, 0x01);
  // L = ~15% correction
  public static M = new ECLevel(1, 0x00);
  // L = ~25% correction
  public static Q = new ECLevel(2, 0x03);
  // L = ~30% correction
  public static H = new ECLevel(3, 0x02);

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
