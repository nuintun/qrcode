/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import ErrorCorrectionLevel from './ErrorCorrectionLevel';
import Integer from '../../util/Integer';

/**
 * <p>Encapsulates a QR Code's format information, including the data mask used and
 * error correction level.</p>
 *
 * @author Sean Owen
 * @see DataMask
 * @see ErrorCorrectionLevel
 */
export default class FormatInformation {
  private static FORMAT_INFO_MASK_QR = 0x5412;

  /**
   * See ISO 18004:2006, Annex C, Table C.1
   */
  private static FORMAT_INFO_DECODE_LOOKUP = [
    Int32Array.from([0x5412, 0x00]),
    Int32Array.from([0x5125, 0x01]),
    Int32Array.from([0x5e7c, 0x02]),
    Int32Array.from([0x5b4b, 0x03]),
    Int32Array.from([0x45f9, 0x04]),
    Int32Array.from([0x40ce, 0x05]),
    Int32Array.from([0x4f97, 0x06]),
    Int32Array.from([0x4aa0, 0x07]),
    Int32Array.from([0x77c4, 0x08]),
    Int32Array.from([0x72f3, 0x09]),
    Int32Array.from([0x7daa, 0x0a]),
    Int32Array.from([0x789d, 0x0b]),
    Int32Array.from([0x662f, 0x0c]),
    Int32Array.from([0x6318, 0x0d]),
    Int32Array.from([0x6c41, 0x0e]),
    Int32Array.from([0x6976, 0x0f]),
    Int32Array.from([0x1689, 0x10]),
    Int32Array.from([0x13be, 0x11]),
    Int32Array.from([0x1ce7, 0x12]),
    Int32Array.from([0x19d0, 0x13]),
    Int32Array.from([0x0762, 0x14]),
    Int32Array.from([0x0255, 0x15]),
    Int32Array.from([0x0d0c, 0x16]),
    Int32Array.from([0x083b, 0x17]),
    Int32Array.from([0x355f, 0x18]),
    Int32Array.from([0x3068, 0x19]),
    Int32Array.from([0x3f31, 0x1a]),
    Int32Array.from([0x3a06, 0x1b]),
    Int32Array.from([0x24b4, 0x1c]),
    Int32Array.from([0x2183, 0x1d]),
    Int32Array.from([0x2eda, 0x1e]),
    Int32Array.from([0x2bed, 0x1f])
  ];

  private errorCorrectionLevel: ErrorCorrectionLevel;
  private dataMask: number; /*byte*/

  private constructor(formatInfo: number /*int*/) {
    // Bits 3,4
    this.errorCorrectionLevel = ErrorCorrectionLevel.forBits((formatInfo >> 3) & 0x03);
    // Bottom 3 bits
    this.dataMask = /*(byte) */ formatInfo & 0x07;
  }

  public static numBitsDiffering(a: number /*int*/, b: number /*int*/): number /*int*/ {
    return Integer.bitCount(a ^ b);
  }

  /**
   * @param maskedFormatInfo1 format info indicator, with mask still applied
   * @param maskedFormatInfo2 second copy of same info; both are checked at the same time
   *  to establish best match
   * @return information about the format it specifies, or {@code null}
   *  if doesn't seem to match any known pattern
   */
  public static decodeFormatInformation(
    maskedFormatInfo1: number /*int*/,
    maskedFormatInfo2: number /*int*/
  ): FormatInformation {
    const formatInfo = FormatInformation.doDecodeFormatInformation(maskedFormatInfo1, maskedFormatInfo2);

    if (formatInfo !== null) {
      return formatInfo;
    }

    // Should return null, but, some QR codes apparently
    // do not mask this info. Try again by actually masking the pattern
    // first
    return FormatInformation.doDecodeFormatInformation(
      maskedFormatInfo1 ^ FormatInformation.FORMAT_INFO_MASK_QR,
      maskedFormatInfo2 ^ FormatInformation.FORMAT_INFO_MASK_QR
    );
  }

  private static doDecodeFormatInformation(
    maskedFormatInfo1: number /*int*/,
    maskedFormatInfo2: number /*int*/
  ): FormatInformation {
    // Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
    let bestDifference = Number.MAX_SAFE_INTEGER;
    let bestFormatInfo = 0;

    for (const decodeInfo of FormatInformation.FORMAT_INFO_DECODE_LOOKUP) {
      const targetInfo = decodeInfo[0];

      if (targetInfo === maskedFormatInfo1 || targetInfo === maskedFormatInfo2) {
        // Found an exact match
        return new FormatInformation(decodeInfo[1]);
      }

      let bitsDifference = FormatInformation.numBitsDiffering(maskedFormatInfo1, targetInfo);

      if (bitsDifference < bestDifference) {
        bestFormatInfo = decodeInfo[1];
        bestDifference = bitsDifference;
      }

      if (maskedFormatInfo1 !== maskedFormatInfo2) {
        // also try the other option
        bitsDifference = FormatInformation.numBitsDiffering(maskedFormatInfo2, targetInfo);

        if (bitsDifference < bestDifference) {
          bestFormatInfo = decodeInfo[1];
          bestDifference = bitsDifference;
        }
      }
    }

    // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
    // differing means we found a match
    if (bestDifference <= 3) {
      return new FormatInformation(bestFormatInfo);
    }

    return null;
  }

  public getErrorCorrectionLevel(): ErrorCorrectionLevel {
    return this.errorCorrectionLevel;
  }

  public getDataMask(): number /*byte*/ {
    return this.dataMask;
  }

  /*@Override*/
  public hashCode(): number /*int*/ {
    return (this.errorCorrectionLevel.getBits() << 3) | this.dataMask;
  }

  /*@Override*/
  public equals(o: Object): boolean {
    if (!(o instanceof FormatInformation)) {
      return false;
    }

    const other = <FormatInformation>o;

    return this.errorCorrectionLevel === other.errorCorrectionLevel && this.dataMask === other.dataMask;
  }
}
