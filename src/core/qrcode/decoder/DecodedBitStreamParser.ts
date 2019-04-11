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

import Mode from './Mode';
import Version from './Version';
import BitSource from '../../common/BitSource';
import DecodeHintType from '../../DecodeHintType';
import StringUtils from '../../common/StringUtils';
import FormatException from '../../FormatException';
import StringBuilder from '../../util/StringBuilder';
import DecoderResult from '../../common/DecoderResult';
import StringEncoding from '../../util/StringEncoding';
import ErrorCorrectionLevel from './ErrorCorrectionLevel';
import CharacterSetECI from '../../common/CharacterSetECI';

/**
 * <p>QR Codes can encode text as bits in one of several modes, and can use multiple modes
 * in one QR Code. This class decodes the bits back into text.</p>
 *
 * <p>See ISO 18004:2006, 6.4.3 - 6.4.7</p>
 *
 * @author Sean Owen
 */
export default class DecodedBitStreamParser {
  /**
   * See ISO 18004:2006, 6.4.4 Table 5
   */
  private static ALPHANUMERIC_CHARS: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
  private static GB2312_SUBSET: number = 1;

  public static decode(
    bytes: Uint8Array,
    version: Version,
    ecLevel: ErrorCorrectionLevel,
    hints: Map<DecodeHintType, any>
  ): DecoderResult {
    const bits: BitSource = new BitSource(bytes);
    const result: StringBuilder = new StringBuilder();
    const byteSegments: Uint8Array[] = new Array<Uint8Array>(); // 1
    // TYPESCRIPTPORT: I do not use constructor with size 1 as in original Java means capacity and the array length is checked below
    let symbolSequence: number = -1;
    let parityData: number = -1;

    try {
      let currentCharacterSetECI: CharacterSetECI = null;
      let fc1InEffect: boolean = false;
      let mode: Mode;

      do {
        // While still another segment to read...
        if (bits.available() < 4) {
          // OK, assume we're done. Really, a TERMINATOR mode should have been recorded here
          mode = Mode.TERMINATOR;
        } else {
          const modeBits: number = bits.readBits(4);

          mode = Mode.forBits(modeBits); // mode is encoded by 4 bits
        }

        switch (mode) {
          case Mode.TERMINATOR:
            break;
          case Mode.FNC1_FIRST_POSITION:
          case Mode.FNC1_SECOND_POSITION:
            // We do little with FNC1 except alter the parsed result a bit according to the spec
            fc1InEffect = true;
            break;
          case Mode.STRUCTURED_APPEND:
            if (bits.available() < 16) {
              throw new FormatException();
            }

            // sequence number and parity is added later to the result metadata
            // Read next 8 bits (symbol sequence #) and 8 bits (data: parity), then continue
            symbolSequence = bits.readBits(8);
            parityData = bits.readBits(8);
            break;
          case Mode.ECI:
            // Count doesn't apply to ECI
            const value: number = DecodedBitStreamParser.parseECIValue(bits);

            currentCharacterSetECI = CharacterSetECI.getCharacterSetECIByValue(value);

            if (currentCharacterSetECI == null) {
              throw new FormatException();
            }
            break;
          case Mode.HANZI:
            // First handle Hanzi mode which does not start with character count
            // Chinese mode contains a sub set indicator right after mode indicator
            const subset: number = bits.readBits(4);
            const countHanzi: number = bits.readBits(mode.getCharacterCountBits(version));

            if (subset === DecodedBitStreamParser.GB2312_SUBSET) {
              DecodedBitStreamParser.decodeHanziSegment(bits, result, countHanzi);
            }
            break;
          default:
            // "Normal" QR code modes:
            // How many characters will follow, encoded in this mode?
            const count: number = bits.readBits(mode.getCharacterCountBits(version));

            switch (mode) {
              case Mode.NUMERIC:
                DecodedBitStreamParser.decodeNumericSegment(bits, result, count);
                break;
              case Mode.ALPHANUMERIC:
                DecodedBitStreamParser.decodeAlphanumericSegment(bits, result, count, fc1InEffect);
                break;
              case Mode.BYTE:
                DecodedBitStreamParser.decodeByteSegment(bits, result, count, currentCharacterSetECI, byteSegments, hints);
                break;
              case Mode.KANJI:
                DecodedBitStreamParser.decodeKanjiSegment(bits, result, count);
                break;
              default:
                throw new FormatException();
            }
            break;
        }
      } while (mode !== Mode.TERMINATOR);
    } catch (iae /*: IllegalArgumentException*/) {
      // from readBits() calls
      throw new FormatException();
    }

    return new DecoderResult(
      bytes,
      result.toString(),
      byteSegments.length === 0 ? null : byteSegments,
      ecLevel == null ? null : ecLevel.toString(),
      symbolSequence,
      parityData
    );
  }

  /**
   * See specification GBT 18284-2000
   */
  private static decodeHanziSegment(bits: BitSource, result: StringBuilder, count: number): void {
    // Don't crash trying to read more bits than we have available.
    if (count * 13 > bits.available()) {
      throw new FormatException();
    }

    // Each character will require 2 bytes. Read the characters as 2-byte pairs
    // and decode as GB2312 afterwards
    const buffer: Uint8Array = new Uint8Array(2 * count);
    let offset: number = 0;

    while (count > 0) {
      // Each 13 bits encodes a 2-byte character
      const twoBytes: number = bits.readBits(13);
      let assembledTwoBytes: number = (((twoBytes / 0x060) << 8) & 0xffffffff) | twoBytes % 0x060;

      if (assembledTwoBytes < 0x003bf) {
        // In the 0xA1A1 to 0xAAFE range
        assembledTwoBytes += 0x0a1a1;
      } else {
        // In the 0xB0A1 to 0xFAFE range
        assembledTwoBytes += 0x0a6a1;
      }

      buffer[offset] = /*(byte) */ (assembledTwoBytes >> 8) & 0xff;
      buffer[offset + 1] = /*(byte) */ assembledTwoBytes & 0xff;
      offset += 2;
      count--;
    }

    try {
      result.append(StringEncoding.decode(buffer, StringUtils.GB2312));
      // TYPESCRIPTPORT: TODO: implement GB2312 decode. StringView from MDN could be a starting point
    } catch (ignored /*: UnsupportedEncodingException*/) {
      throw new FormatException(ignored);
    }
  }

  private static decodeKanjiSegment(bits: BitSource, result: StringBuilder, count: number): void {
    // Don't crash trying to read more bits than we have available.
    if (count * 13 > bits.available()) {
      throw new FormatException();
    }

    // Each character will require 2 bytes. Read the characters as 2-byte pairs
    // and decode as Shift_JIS afterwards
    const buffer: Uint8Array = new Uint8Array(2 * count);
    let offset: number = 0;

    while (count > 0) {
      // Each 13 bits encodes a 2-byte character
      const twoBytes: number = bits.readBits(13);
      let assembledTwoBytes: number = (((twoBytes / 0x0c0) << 8) & 0xffffffff) | twoBytes % 0x0c0;

      if (assembledTwoBytes < 0x01f00) {
        // In the 0x8140 to 0x9FFC range
        assembledTwoBytes += 0x08140;
      } else {
        // In the 0xE040 to 0xEBBF range
        assembledTwoBytes += 0x0c140;
      }

      buffer[offset] = /*(byte) */ assembledTwoBytes >> 8;
      buffer[offset + 1] = /*(byte) */ assembledTwoBytes;
      offset += 2;
      count--;
    }

    // Shift_JIS may not be supported in some environments:
    try {
      result.append(StringEncoding.decode(buffer, StringUtils.SHIFT_JIS));
      // TYPESCRIPTPORT: TODO: implement SHIFT_JIS decode. StringView from MDN could be a starting point
    } catch (ignored /*: UnsupportedEncodingException*/) {
      throw new FormatException(ignored);
    }
  }

  private static decodeByteSegment(
    bits: BitSource,
    result: StringBuilder,
    count: number,
    currentCharacterSetECI: CharacterSetECI,
    byteSegments: Uint8Array[],
    hints: Map<DecodeHintType, any>
  ): void {
    // Don't crash trying to read more bits than we have available.
    if (8 * count > bits.available()) {
      throw new FormatException();
    }

    const readBytes: Uint8Array = new Uint8Array(count);

    for (let i: number = 0; i < count; i++) {
      readBytes[i] = bits.readBits(8);
    }

    let encoding: string;

    if (currentCharacterSetECI == null) {
      // The spec isn't clear on this mode; see
      // section 6.4.5: t does not say which encoding to assuming
      // upon decoding. I have seen ISO-8859-1 used as well as
      // Shift_JIS -- without anything like an ECI designator to
      // give a hint.
      encoding = StringUtils.guessEncoding(readBytes, hints);
    } else {
      encoding = currentCharacterSetECI.getName();
    }

    try {
      result.append(StringEncoding.decode(readBytes, encoding));
    } catch (ignored) {
      throw new FormatException(ignored);
    }

    byteSegments.push(readBytes);
  }

  private static toAlphaNumericChar(value: number): string {
    if (value >= DecodedBitStreamParser.ALPHANUMERIC_CHARS.length) {
      throw new FormatException();
    }

    return DecodedBitStreamParser.ALPHANUMERIC_CHARS[value];
  }

  private static decodeAlphanumericSegment(bits: BitSource, result: StringBuilder, count: number, fc1InEffect: boolean): void {
    // Read two characters at a time
    const start: number = result.length();

    while (count > 1) {
      if (bits.available() < 11) {
        throw new FormatException();
      }

      const nextTwoCharsBits: number = bits.readBits(11);

      result.append(DecodedBitStreamParser.toAlphaNumericChar(Math.floor(nextTwoCharsBits / 45)));
      result.append(DecodedBitStreamParser.toAlphaNumericChar(nextTwoCharsBits % 45));
      count -= 2;
    }

    if (count === 1) {
      // special case: one character left
      if (bits.available() < 6) {
        throw new FormatException();
      }
      result.append(DecodedBitStreamParser.toAlphaNumericChar(bits.readBits(6)));
    }

    // See section 6.4.8.1, 6.4.8.2
    if (fc1InEffect) {
      // We need to massage the result a bit if in an FNC1 mode:
      for (let i: number = start; i < result.length(); i++) {
        if (result.charAt(i) === '%') {
          if (i < result.length() - 1 && result.charAt(i + 1) === '%') {
            // %% is rendered as %
            result.deleteCharAt(i + 1);
          } else {
            // In alpha mode, % should be converted to FNC1 separator 0x1D
            result.setCharAt(i, String.fromCharCode(0x1d));
          }
        }
      }
    }
  }

  private static decodeNumericSegment(bits: BitSource, result: StringBuilder, count: number): void {
    // Read three digits at a time
    while (count >= 3) {
      // Each 10 bits encodes three digits
      if (bits.available() < 10) {
        throw new FormatException();
      }

      const threeDigitsBits: number = bits.readBits(10);

      if (threeDigitsBits >= 1000) {
        throw new FormatException();
      }

      result.append(DecodedBitStreamParser.toAlphaNumericChar(Math.floor(threeDigitsBits / 100)));
      result.append(DecodedBitStreamParser.toAlphaNumericChar(Math.floor(threeDigitsBits / 10) % 10));
      result.append(DecodedBitStreamParser.toAlphaNumericChar(threeDigitsBits % 10));

      count -= 3;
    }

    if (count === 2) {
      // Two digits left over to read, encoded in 7 bits
      if (bits.available() < 7) {
        throw new FormatException();
      }

      const twoDigitsBits: number = bits.readBits(7);

      if (twoDigitsBits >= 100) {
        throw new FormatException();
      }

      result.append(DecodedBitStreamParser.toAlphaNumericChar(Math.floor(twoDigitsBits / 10)));
      result.append(DecodedBitStreamParser.toAlphaNumericChar(twoDigitsBits % 10));
    } else if (count === 1) {
      // One digit left over to read
      if (bits.available() < 4) {
        throw new FormatException();
      }

      const digitBits: number = bits.readBits(4);

      if (digitBits >= 10) {
        throw new FormatException();
      }

      result.append(DecodedBitStreamParser.toAlphaNumericChar(digitBits));
    }
  }

  private static parseECIValue(bits: BitSource): number {
    const firstByte: number = bits.readBits(8);

    if ((firstByte & 0x80) === 0) {
      // just one byte
      return firstByte & 0x7f;
    }

    if ((firstByte & 0xc0) === 0x80) {
      // two bytes
      const secondByte: number = bits.readBits(8);

      return (((firstByte & 0x3f) << 8) & 0xffffffff) | secondByte;
    }

    if ((firstByte & 0xe0) === 0xc0) {
      // three bytes
      const secondThirdBytes: number = bits.readBits(16);

      return (((firstByte & 0x1f) << 16) & 0xffffffff) | secondThirdBytes;
    }

    throw new FormatException();
  }
}
