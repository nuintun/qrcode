/**
 * @module FormatInfo
 */

import { bitCount } from '/common/utils';
import { ECLevel, fromBits } from '/common/ECLevel';

const FORMAT_INFO_DECODE_TABLE = [
  [0x5412, 0x00],
  [0x5125, 0x01],
  [0x5e7c, 0x02],
  [0x5b4b, 0x03],
  [0x45f9, 0x04],
  [0x40ce, 0x05],
  [0x4f97, 0x06],
  [0x4aa0, 0x07],
  [0x77c4, 0x08],
  [0x72f3, 0x09],
  [0x7daa, 0x0a],
  [0x789d, 0x0b],
  [0x662f, 0x0c],
  [0x6318, 0x0d],
  [0x6c41, 0x0e],
  [0x6976, 0x0f],
  [0x1689, 0x10],
  [0x13be, 0x11],
  [0x1ce7, 0x12],
  [0x19d0, 0x13],
  [0x0762, 0x14],
  [0x0255, 0x15],
  [0x0d0c, 0x16],
  [0x083b, 0x17],
  [0x355f, 0x18],
  [0x3068, 0x19],
  [0x3f31, 0x1a],
  [0x3a06, 0x1b],
  [0x24b4, 0x1c],
  [0x2183, 0x1d],
  [0x2eda, 0x1e],
  [0x2bed, 0x1f]
];

export class FormatInfo {
  #mask: number;
  #level: ECLevel;

  constructor(formatInfo: number) {
    this.#mask = formatInfo & 0x07;
    this.#level = fromBits((formatInfo >> 3) & 0x03);
  }

  public get mask(): number {
    return this.#mask;
  }

  public get level(): ECLevel {
    return this.#level;
  }
}

export function decodeFormatInfo(formatInfo1: number, formatInfo2: number): FormatInfo {
  // Find the int in FORMAT_INFO_DECODE_TABLE with fewest bits differing
  let bestDiff = 32;
  let bestFormatInfo = 0;

  for (const [maskedFormatInfo, formatInfo] of FORMAT_INFO_DECODE_TABLE) {
    if (formatInfo1 === maskedFormatInfo || formatInfo2 === maskedFormatInfo) {
      // Found an exact match
      return new FormatInfo(formatInfo);
    }

    let bitsDiff = bitCount(formatInfo1 ^ maskedFormatInfo);

    if (bitsDiff < bestDiff) {
      bestDiff = bitsDiff;
      bestFormatInfo = formatInfo;
    }

    if (formatInfo1 !== formatInfo2) {
      // Also try the other option
      bitsDiff = bitCount(formatInfo2 ^ maskedFormatInfo);

      if (bitsDiff < bestDiff) {
        bestDiff = bitsDiff;
        bestFormatInfo = formatInfo;
      }
    }
  }

  // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits differing means we found a match
  if (bestDiff <= 3) {
    return new FormatInfo(bestFormatInfo);
  }

  throw new Error('unable to decode format information');
}
