/**
 * @module ECLevel
 */

export const enum Level {
  L = 'L',
  M = 'M',
  Q = 'Q',
  H = 'H'
}

const VALUES_TO_ECLEVEL = new Map<number, ECLevel>();

export function fromECLevelBits(bits: number): ECLevel {
  const ecLevel = VALUES_TO_ECLEVEL.get(bits);

  if (ecLevel != null) {
    return ecLevel;
  }

  throw new Error('illegal error correction bits');
}

export class ECLevel {
  #bits: number;
  #level: number;
  #name: `${Level}`;

  // L = ~7% correction.
  public static readonly L = new ECLevel(Level.L, 0, 0x01);
  // M = ~15% correction.
  public static readonly M = new ECLevel(Level.M, 1, 0x00);
  // Q = ~25% correction.
  public static readonly Q = new ECLevel(Level.Q, 2, 0x03);
  // H = ~30% correction.
  public static readonly H = new ECLevel(Level.H, 3, 0x02);

  constructor(name: `${Level}`, level: number, bits: number) {
    this.#bits = bits;
    this.#name = name;
    this.#level = level;

    VALUES_TO_ECLEVEL.set(bits, this);
  }

  public get bits(): number {
    return this.#bits;
  }

  public get level(): number {
    return this.#level;
  }

  public get name(): `${Level}` {
    return this.#name;
  }
}
