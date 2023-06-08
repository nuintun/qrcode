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

export function getMaskBit(maskPattern: number, x: number, y: number): boolean {
  let temp: number;
  let intermediate: number;

  switch (maskPattern) {
    case MaskPattern.PATTERN000:
      intermediate = (y + x) & 0x1;
      break;
    case MaskPattern.PATTERN001:
      intermediate = y & 0x1;
      break;
    case MaskPattern.PATTERN010:
      intermediate = x % 3;
      break;
    case MaskPattern.PATTERN011:
      intermediate = (y + x) % 3;
      break;
    case MaskPattern.PATTERN100:
      intermediate = (Math.floor(y / 2) + Math.floor(x / 3)) & 0x1;
      break;
    case MaskPattern.PATTERN101:
      temp = y * x;
      intermediate = (temp & 0x1) + (temp % 3);
      break;
    case MaskPattern.PATTERN110:
      temp = y * x;
      intermediate = ((temp & 0x1) + (temp % 3)) & 0x1;
      break;
    case MaskPattern.PATTERN111:
      intermediate = (((y * x) % 3) + ((y + x) & 0x1)) & 0x1;
      break;
    default:
      throw new Error(`illegal mask: ${maskPattern}`);
  }

  return intermediate === 0;
}
