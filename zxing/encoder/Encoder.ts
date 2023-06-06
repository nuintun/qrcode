/**
 * @module Encoder
 */

import {
  appendECI,
  appendLengthInfo,
  appendModeInfo,
  calculateBitsNeeded,
  EncodeHint,
  interleaveWithECBytes,
  isByteMode,
  recommendVersion,
  Segment,
  SegmentBlock,
  terminateBits,
  willFit
} from './utils/encoder';
import { QRCode } from './QRCode';
import { Mode } from '/common/Mode';
import { ByteMatrix } from './ByteMatrix';
import { ECLevel } from '/common/ECLevel';
import { chooseMask } from './utils/mask';
import { BitArray } from '/common/BitArray';
import { TextEncode } from './segments/Byte';
import { buildMatrix } from './utils/matrix';
import { Version, VERSIONS } from '/common/Version';

export interface Options {
  version?: number;
  encode?: TextEncode;
  hints?: EncodeHint[];
  level?: 'L' | 'M' | 'Q' | 'H';
}

export class Encoder {
  #level: ECLevel;
  #version?: number;
  #encode?: TextEncode;
  #hints: EncodeHint[];

  constructor({ encode, version, hints = [], level = 'L' }: Options = {}) {
    this.#hints = hints;
    this.#encode = encode;
    this.#version = version;
    this.#level = ECLevel[level];
  }

  public encode(...segments: Segment[]): QRCode {
    const hints = this.#hints;
    const ecLevel = this.#level;
    const encode = this.#encode;
    const versionNumber = this.#version;
    const segmentBlocks: SegmentBlock[] = [];
    const hasGS1FormatHint = hints.indexOf('GS1_FORMAT') >= 0;
    const hasEncodingHint = hints.indexOf('CHARACTER_SET') >= 0;

    for (const segment of segments) {
      const { mode, content } = segment;
      const isByte = isByteMode(segment);
      // This will store the header information, like mode and
      // length, as well as "header" segments like an ECI segment.
      const headerBits = new BitArray();
      const dataBits = isByte ? segment.encode(encode) : segment.encode();

      // Append ECI segment if applicable
      if (hasEncodingHint && isByte) {
        appendECI(headerBits, mode, segment.charset);
      }

      // Append the FNC1 mode header for GS1 formatted data if applicable
      if (hasGS1FormatHint) {
        // GS1 formatted codes are prefixed with a FNC1 in first position mode header
        appendModeInfo(headerBits, Mode.FNC1_FIRST_POSITION);
      }

      // (With ECI in place,) Write the mode marker
      appendModeInfo(headerBits, mode);

      segmentBlocks.push({
        mode,
        dataBits,
        headerBits,
        length: isByte ? dataBits.byteLength : content.length
      });
    }

    let version: Version;

    if (versionNumber != null) {
      version = VERSIONS[versionNumber - 1];

      const bitsNeeded = calculateBitsNeeded(segmentBlocks, version);

      if (!willFit(bitsNeeded, version, ecLevel)) {
        throw new Error('data too big for requested version');
      }
    } else {
      version = recommendVersion(segmentBlocks, ecLevel);
    }

    const headerAndDataBits = new BitArray();

    for (const { mode, length, headerBits, dataBits } of segmentBlocks) {
      headerAndDataBits.append(headerBits);

      appendLengthInfo(headerAndDataBits, version, mode, length);

      headerAndDataBits.append(dataBits);
    }

    const { totalCodewords, dimension } = version;
    const ecBlocks = version.getECBlocksForECLevel(ecLevel);
    const numDataBytes = totalCodewords - ecBlocks.totalECCodewords;

    // Terminate the bits properly.
    terminateBits(headerAndDataBits, numDataBytes);

    const { numBlocks } = ecBlocks;
    const matrix = new ByteMatrix(dimension);
    const finalBits = interleaveWithECBytes(headerAndDataBits, numBlocks, numDataBytes, totalCodewords);
    const mask = chooseMask(matrix, finalBits, version, ecLevel);

    buildMatrix(matrix, finalBits, version, ecLevel, mask);

    return new QRCode(matrix);
  }
}

export { Byte } from '/encoder/segments/Byte';
export { Kanji } from '/encoder/segments/Kanji';
export { Numeric } from '/encoder/segments/Numeric';
export { Alphanumeric } from '/encoder/segments/Alphanumeric';
