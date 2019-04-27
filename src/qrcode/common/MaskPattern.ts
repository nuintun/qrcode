/**
 * @module MaskPattern
 * @author nuintun
 * @author Cosmo Wolfe
 * @author Kazuhiko Arase
 */

const enum MaskPattern {
  // mask pattern 000
  PATTERN000 = 0b000,
  // mask pattern 001
  PATTERN001 = 0b001,
  // mask pattern 010
  PATTERN010 = 0b010,
  // mask pattern 011
  PATTERN011 = 0b011,
  // mask pattern 100
  PATTERN100 = 0b100,
  // mask pattern 101
  PATTERN101 = 0b101,
  // mask pattern 110
  PATTERN110 = 0b110,
  // mask pattern 111
  PATTERN111 = 0b111
}

export type maskFunc = (x: number, y: number) => boolean;

export default function getMaskFunc(maskPattern: number): maskFunc {
  switch (maskPattern) {
    case MaskPattern.PATTERN000:
      return (x: number, y: number): boolean => (x + y) % 2 === 0;
    case MaskPattern.PATTERN001:
      return (x: number, y: number): boolean => x % 2 === 0;
    case MaskPattern.PATTERN010:
      return (x: number, y: number): boolean => y % 3 === 0;
    case MaskPattern.PATTERN011:
      return (x: number, y: number): boolean => (x + y) % 3 === 0;
    case MaskPattern.PATTERN100:
      return (x: number, y: number): boolean => (((x / 2) >>> 0) + ((y / 3) >>> 0)) % 2 === 0;
    case MaskPattern.PATTERN101:
      return (x: number, y: number): boolean => ((x * y) % 2) + ((x * y) % 3) === 0;
    case MaskPattern.PATTERN110:
      return (x: number, y: number): boolean => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case MaskPattern.PATTERN111:
      return (x: number, y: number): boolean => (((x * y) % 3) + ((x + y) % 2)) % 2 === 0;
    default:
      throw `illegal mask: ${maskPattern}`;
  }
}
