/**
 * @module QRUtil
 * @author nuintun
 * @author Kazuhiko Arase
 */

import Mode from './Mode';
import QRCode from './QRCode';
import * as QRMath from './QRMath';
import Polynomial from './Polynomial';
import MaskPattern from './MaskPattern';
import ErrorCorrectLevel from './ErrorCorrectLevel';

const PATTERN_POSITION_TABLE: number[][] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170]
];

const MAX_LENGTH: number[][][] = [
  [[41, 25, 17, 10], [34, 20, 14, 8], [27, 16, 11, 7], [17, 10, 7, 4]],
  [[77, 47, 32, 20], [63, 38, 26, 16], [48, 29, 20, 12], [34, 20, 14, 8]],
  [[127, 77, 53, 32], [101, 61, 42, 26], [77, 47, 32, 20], [58, 35, 24, 15]],
  [[187, 114, 78, 48], [149, 90, 62, 38], [111, 67, 46, 28], [82, 50, 34, 21]],
  [[255, 154, 106, 65], [202, 122, 84, 52], [144, 87, 60, 37], [106, 64, 44, 27]],
  [[322, 195, 134, 82], [255, 154, 106, 65], [178, 108, 74, 45], [139, 84, 58, 36]],
  [[370, 224, 154, 95], [293, 178, 122, 75], [207, 125, 86, 53], [154, 93, 64, 39]],
  [[461, 279, 192, 118], [365, 221, 152, 93], [259, 157, 108, 66], [202, 122, 84, 52]],
  [[552, 335, 230, 141], [432, 262, 180, 111], [312, 189, 130, 80], [235, 143, 98, 60]],
  [[652, 395, 271, 167], [513, 311, 213, 131], [364, 221, 151, 93], [288, 174, 119, 74]]
];

export type maskFunc = (x: number, y: number) => boolean;

export const G15_MASK: number = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

export const G15: number = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);

export const G18: number = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);

export function getPatternPosition(typeNumber: number): number[] {
  return PATTERN_POSITION_TABLE[typeNumber - 1];
}

export function getMaxLength(typeNumber: number, mode: Mode, errorCorrectLevel: ErrorCorrectLevel): number {
  let e: number = 0;
  let m: number = 0;
  const t: number = typeNumber - 1;

  switch (errorCorrectLevel) {
    case ErrorCorrectLevel.L:
      e = 0;
      break;
    case ErrorCorrectLevel.M:
      e = 1;
      break;
    case ErrorCorrectLevel.Q:
      e = 2;
      break;
    case ErrorCorrectLevel.H:
      e = 3;
      break;
    default:
      throw `unknow error correct level: ${errorCorrectLevel}`;
  }

  switch (mode) {
    case Mode.Numeric:
      m = 0;
      break;
    case Mode.Alphanumeric:
      m = 1;
      break;
    case Mode.Byte:
      m = 2;
      break;
    case Mode.Kanji:
      m = 3;
      break;
    default:
      throw `unknow mode: ${mode}`;
  }

  return MAX_LENGTH[t][e][m];
}

export function getErrorCorrectPolynomial(errorCorrectLength: number): Polynomial {
  let e: Polynomial = new Polynomial([1]);

  for (let i: number = 0; i < errorCorrectLength; i++) {
    e = e.multiply(new Polynomial([1, QRMath.gexp(i)]));
  }

  return e;
}

export function getMaskFunc(maskPattern: number): maskFunc {
  switch (maskPattern) {
    case MaskPattern.PATTERN000:
      return (x: number, y: number) => (x + y) % 2 === 0;
    case MaskPattern.PATTERN001:
      return (x: number, y: number) => x % 2 === 0;
    case MaskPattern.PATTERN010:
      return (x: number, y: number) => y % 3 === 0;
    case MaskPattern.PATTERN011:
      return (x: number, y: number) => (x + y) % 3 === 0;
    case MaskPattern.PATTERN100:
      return (x: number, y: number) => (~~(x / 2) + ~~(y / 3)) % 2 === 0;
    case MaskPattern.PATTERN101:
      return (x: number, y: number) => ((x * y) % 2) + ((x * y) % 3) === 0;
    case MaskPattern.PATTERN110:
      return (x: number, y: number) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    case MaskPattern.PATTERN111:
      return (x: number, y: number) => (((x * y) % 3) + ((x + y) % 2)) % 2 === 0;
    default:
      throw `unknow mask: ${maskPattern}`;
  }
}

export function getLostPoint(qrCode: QRCode): number {
  let lostPoint: number = 0;
  const moduleCount: number = qrCode.getModuleCount();

  // LEVEL1
  for (let row: number = 0; row < moduleCount; row++) {
    for (let col: number = 0; col < moduleCount; col++) {
      let sameCount: number = 0;
      const dark: boolean = qrCode.isDark(row, col);

      for (let r: number = -1; r <= 1; r++) {
        if (row + r < 0 || moduleCount <= row + r) {
          continue;
        }

        for (let c: number = -1; c <= 1; c++) {
          if (col + c < 0 || moduleCount <= col + c) {
            continue;
          }

          if (r === 0 && c === 0) {
            continue;
          }

          if (dark === qrCode.isDark(row + r, col + c)) {
            sameCount++;
          }
        }
      }

      if (sameCount > 5) {
        lostPoint += sameCount - 2;
      }
    }
  }

  // LEVEL2
  for (let row: number = 0; row < moduleCount - 1; row++) {
    for (let col: number = 0; col < moduleCount - 1; col++) {
      let count: number = 0;

      if (qrCode.isDark(row, col)) count++;

      if (qrCode.isDark(row + 1, col)) count++;

      if (qrCode.isDark(row, col + 1)) count++;

      if (qrCode.isDark(row + 1, col + 1)) count++;

      if (count === 0 || count === 4) lostPoint += 3;
    }
  }

  // LEVEL3
  for (let row: number = 0; row < moduleCount; row++) {
    for (let col: number = 0; col < moduleCount - 6; col++) {
      if (
        qrCode.isDark(row, col) &&
        !qrCode.isDark(row, col + 1) &&
        qrCode.isDark(row, col + 2) &&
        qrCode.isDark(row, col + 3) &&
        qrCode.isDark(row, col + 4) &&
        !qrCode.isDark(row, col + 5) &&
        qrCode.isDark(row, col + 6)
      ) {
        lostPoint += 40;
      }
    }
  }

  for (let col: number = 0; col < moduleCount; col++) {
    for (let row: number = 0; row < moduleCount - 6; row++) {
      if (
        qrCode.isDark(row, col) &&
        !qrCode.isDark(row + 1, col) &&
        qrCode.isDark(row + 2, col) &&
        qrCode.isDark(row + 3, col) &&
        qrCode.isDark(row + 4, col) &&
        !qrCode.isDark(row + 5, col) &&
        qrCode.isDark(row + 6, col)
      ) {
        lostPoint += 40;
      }
    }
  }

  // LEVEL4
  let darkCount = 0;

  for (let col: number = 0; col < moduleCount; col++) {
    for (let row: number = 0; row < moduleCount; row++) {
      if (qrCode.isDark(row, col)) {
        darkCount += 1;
      }
    }
  }

  const ratio: number = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;

  lostPoint += ratio * 10;

  return lostPoint;
}

export function getBCHDigit(data: number): number {
  let digit = 0;

  while (data !== 0) {
    digit += 1;
    data >>>= 1;
  }

  return digit;
}

export function getBCHVersion(data: number): number {
  let d: number = data << 12;

  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= G18 << (getBCHDigit(d) - getBCHDigit(G18));
  }

  return (data << 12) | d;
}

export function getBCHVersionInfo(data: number): number {
  let d: number = data << 10;

  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= G15 << (getBCHDigit(d) - getBCHDigit(G15));
  }

  return ((data << 10) | d) ^ G15_MASK;
}
