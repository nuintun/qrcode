/**
 * @module MaskPattern
 * @author nuintun
 * @author Cosmo Wolfe
 * @author Kazuhiko Arase
 */

const enum MaskPattern {
  // Mask pattern 000
  PATTERN000 = 0b000,
  // Mask pattern 001
  PATTERN001 = 0b001,
  // Mask pattern 010
  PATTERN010 = 0b010,
  // Mask pattern 011
  PATTERN011 = 0b011,
  // Mask pattern 100
  PATTERN100 = 0b100,
  // Mask pattern 101
  PATTERN101 = 0b101,
  // Mask pattern 110
  PATTERN110 = 0b110,
  // Mask pattern 111
  PATTERN111 = 0b111
}

export type MaskFunc = (x: number, y: number) => boolean;

export function getMaskFunc(maskPattern: number): MaskFunc {
  switch (maskPattern) {
    case MaskPattern.PATTERN000:
      return (x: number, y: number): boolean => ((x + y) & 0x1) === 0;
    case MaskPattern.PATTERN001:
      return (_x: number, y: number): boolean => (y & 0x1) === 0;
    case MaskPattern.PATTERN010:
      return (x: number, _y: number): boolean => x % 3 === 0;
    case MaskPattern.PATTERN011:
      return (x: number, y: number): boolean => (x + y) % 3 === 0;
    case MaskPattern.PATTERN100:
      return (x: number, y: number): boolean => ((((x / 3) >> 0) + ((y / 2) >> 0)) & 0x1) === 0;
    case MaskPattern.PATTERN101:
      return (x: number, y: number): boolean => ((x * y) & 0x1) + ((x * y) % 3) === 0;
    case MaskPattern.PATTERN110:
      return (x: number, y: number): boolean => ((((x * y) & 0x1) + ((x * y) % 3)) & 0x1) === 0;
    case MaskPattern.PATTERN111:
      return (x: number, y: number): boolean => ((((x * y) % 3) + ((x + y) & 0x1)) & 0x1) === 0;
    default:
      throw new Error(`illegal mask: ${maskPattern}`);
  }
}
