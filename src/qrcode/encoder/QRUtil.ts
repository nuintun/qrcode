/**
 * @module QRUtil
 * @author nuintun
 * @author Kazuhiko Arase
 */

import QRCode from './QRCode';
import * as QRMath from './QRMath';
import Polynomial from './Polynomial';
import MaskPattern from './MaskPattern';

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

export type maskFunc = (x: number, y: number) => boolean;

export const G15_MASK: number = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

export const G15: number = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);

export const G18: number = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);

export function getPatternPosition(version: number): number[] {
  return PATTERN_POSITION_TABLE[version - 1];
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

/**
 * @function getLostPoint
 * @param {QRCode} qrcode
 * @see https://www.jianshu.com/p/cfa2bae198ea
 */
export function getLostPoint(qrcode: QRCode): number {
  let lostPoint: number = 0;
  const moduleCount: number = qrcode.getModuleCount();

  // LEVEL1
  for (let row: number = 0; row < moduleCount; row++) {
    for (let col: number = 0; col < moduleCount; col++) {
      let sameCount: number = 0;
      const dark: boolean = qrcode.isDark(row, col);

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

          if (dark === qrcode.isDark(row + r, col + c)) {
            sameCount++;
          }
        }
      }

      if (sameCount > 5) {
        lostPoint += 3 + sameCount - 5;
      }
    }
  }

  // LEVEL2
  for (let row: number = 0; row < moduleCount - 1; row++) {
    for (let col: number = 0; col < moduleCount - 1; col++) {
      let count: number = 0;

      if (qrcode.isDark(row, col)) count++;

      if (qrcode.isDark(row + 1, col)) count++;

      if (qrcode.isDark(row, col + 1)) count++;

      if (qrcode.isDark(row + 1, col + 1)) count++;

      if (count === 0 || count === 4) lostPoint += 3;
    }
  }

  // LEVEL3
  for (let row: number = 0; row < moduleCount; row++) {
    for (let col: number = 0; col < moduleCount - 10; col++) {
      // vertical
      const [r0, r1, r2, r3, r4, r5, r6, r7, r8, r9, r10]: boolean[] = [
        qrcode.isDark(row, col),
        qrcode.isDark(row, col + 1),
        qrcode.isDark(row, col + 2),
        qrcode.isDark(row, col + 3),
        qrcode.isDark(row, col + 4),
        qrcode.isDark(row, col + 5),
        qrcode.isDark(row, col + 6),
        qrcode.isDark(row, col + 7),
        qrcode.isDark(row, col + 8),
        qrcode.isDark(row, col + 9),
        qrcode.isDark(row, col + 10)
      ];

      // dark - light - dark - dark - dark - light - dark - light - light - light - light
      // light - light - light - light - dark - light - dark - dark - dark - light - dark
      if (
        (r0 && !r1 && r1 && r3 && r4 && !r5 && r6 && !r7 && !r8 && !r9 && !r10) ||
        (!r0 && !r1 && !r2 && !r3 && r4 && !r5 && r6 && r7 && r8 && !r9 && r10)
      ) {
        lostPoint += 40;
      }

      // horizontal
      const [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10]: boolean[] = [
        qrcode.isDark(col, row),
        qrcode.isDark(col + 1, row),
        qrcode.isDark(col + 2, row),
        qrcode.isDark(col + 3, row),
        qrcode.isDark(col + 4, row),
        qrcode.isDark(col + 5, row),
        qrcode.isDark(col + 6, row),
        qrcode.isDark(col + 7, row),
        qrcode.isDark(col + 8, row),
        qrcode.isDark(col + 9, row),
        qrcode.isDark(col + 10, row)
      ];

      // dark - light - dark - dark - dark - light - dark - light - light - light - light
      // light - light - light - light - dark - light - dark - dark - dark - light - dark
      if (
        (c0 && !c1 && c1 && c3 && c4 && !c5 && c6 && !c7 && !c8 && !c9 && !c10) ||
        (!c0 && !c1 && !c2 && !c3 && c4 && !c5 && c6 && c7 && c8 && !c9 && c10)
      ) {
        lostPoint += 40;
      }
    }
  }

  // LEVEL4
  let darkCount = 0;

  for (let col: number = 0; col < moduleCount; col++) {
    for (let row: number = 0; row < moduleCount; row++) {
      if (qrcode.isDark(row, col)) {
        darkCount++;
      }
    }
  }

  const div: number = (((darkCount / (moduleCount * moduleCount)) * 100) / 5) >>> 0;
  const ratio: number = Math.min(Math.abs(div * 5 - 50) / 5, Math.abs((div + 1) * 5 - 50) / 5);

  lostPoint += ratio * 10;

  return lostPoint;
}

function getBCHDigit(data: number): number {
  let digit = 0;

  while (data !== 0) {
    digit++;
    data >>>= 1;
  }

  return digit;
}

export function getBCHVersion(data: number): number {
  let offset: number = data << 12;

  while (getBCHDigit(offset) - getBCHDigit(G18) >= 0) {
    offset ^= G18 << (getBCHDigit(offset) - getBCHDigit(G18));
  }

  return (data << 12) | offset;
}

export function getBCHVersionInfo(data: number): number {
  let offset: number = data << 10;

  while (getBCHDigit(offset) - getBCHDigit(G15) >= 0) {
    offset ^= G15 << (getBCHDigit(offset) - getBCHDigit(G15));
  }

  return ((data << 10) | offset) ^ G15_MASK;
}
