/**
 * @module ECLevel
 */

export class ECLevel {
  #name: string;
  #bits: number;
  #level: number;

  // L = ~7% correction
  public static readonly L = new ECLevel('L', 0, 0x01);
  // L = ~15% correction
  public static readonly M = new ECLevel('M', 1, 0x00);
  // L = ~25% correction
  public static readonly Q = new ECLevel('Q', 2, 0x03);
  // L = ~30% correction
  public static readonly H = new ECLevel('H', 3, 0x02);

  constructor(name: string, level: number, bits: number) {
    this.#bits = bits;
    this.#name = name;
    this.#level = level;
  }

  public get bits(): number {
    return this.#bits;
  }

  public get name(): string {
    return this.#name;
  }

  public get level(): number {
    return this.#level;
  }
}

export function fromBits(bits: number): ECLevel {
  switch (bits) {
    case 0x01:
      return ECLevel.L;
    case 0x00:
      return ECLevel.M;
    case 0x03:
      return ECLevel.Q;
    case 0x02:
      return ECLevel.H;
    default:
      throw new Error('illegal error correction bits');
  }
}
