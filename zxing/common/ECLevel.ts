/**
 * @module ECLevel
 */

const VALUES_TO_ECLEVEL = new Map<number, ECLevel>();

export function fromECLevelBits(bits: number): ECLevel {
  const ecLevel = VALUES_TO_ECLEVEL.get(bits);

  if (ecLevel != null) {
    return ecLevel;
  }

  throw new Error('illegal error correction bits');
}

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

    VALUES_TO_ECLEVEL.set(bits, this);
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
