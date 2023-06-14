/**
 * @module Encoder
 */

import {
  appendECI,
  appendFNC1Info,
  appendLengthInfo,
  appendModeInfo,
  appendTerminateBits,
  calculateBitsNeeded,
  chooseMask,
  Hints,
  injectECBytes,
  isByteMode,
  recommendVersion,
  Segment,
  SegmentBlock,
  willFit
} from './utils/encoder';
import { QRCode } from './QRCode';
import { Charset } from '/common/Charset';
import { ECLevel } from '/common/ECLevel';
import { BitArray } from '/common/BitArray';
import { buildMatrix } from './utils/matrix';
import { ByteMatrix } from '/common/ByteMatrix';
import { Version, VERSIONS } from '/common/Version';
import { encode as contentEncode, TextEncode } from '/common/encoding';
import { assertHints, assertLevel, assertVersion } from './utils/asserts';

export interface Options {
  hints?: Hints;
  encode?: TextEncode;
  version?: number | 'auto';
  level?: 'L' | 'M' | 'Q' | 'H';
}

export class Encoder {
  #hints: Hints;
  #level: ECLevel;
  #encode: TextEncode;
  #version: number | 'auto';

  constructor({
    // Encode hints
    hints = {},
    // Error correction level
    level = 'L',
    // Version number or auto
    version = 'auto',
    // Content encode function
    encode = contentEncode
  }: Options = {}) {
    assertHints(hints);
    assertLevel(level);
    assertVersion(version);

    this.#hints = hints;
    this.#encode = encode;
    this.#version = version;
    this.#level = ECLevel[level];
  }

  public encode(...segments: Segment[]): QRCode {
    const ecLevel = this.#level;
    const encode = this.#encode;
    const { fnc1 } = this.#hints;
    const versionNumber = this.#version;
    const segmentBlocks: SegmentBlock[] = [];

    // Only append FNC1 once.
    let isFNC1Appended = false;
    // Current ECI value.
    let [currentECIValue] = Charset.ISO_8859_1.values;

    // Init segments.
    for (const segment of segments) {
      const { mode } = segment;
      const headerBits = new BitArray();
      const isByte = isByteMode(segment);
      const dataBits = isByte ? segment.encode(encode) : segment.encode();

      // Append ECI segment if applicable.
      currentECIValue = appendECI(headerBits, segment, currentECIValue);

      // Append FNC1 if applicable.
      if (fnc1 != null && !isFNC1Appended) {
        isFNC1Appended = true;

        appendFNC1Info(headerBits, fnc1);
      }

      // With ECI in place, Write the mode marker.
      appendModeInfo(headerBits, mode);

      // Push segment block.
      segmentBlocks.push({
        mode,
        dataBits,
        headerBits,
        length: isByte ? dataBits.byteLength : segment.content.length
      });
    }

    let version: Version;

    if (versionNumber === 'auto') {
      version = recommendVersion(segmentBlocks, ecLevel);
    } else {
      version = VERSIONS[versionNumber - 1];

      const bitsNeeded = calculateBitsNeeded(segmentBlocks, version);

      if (!willFit(bitsNeeded, version, ecLevel)) {
        throw new Error('data too big for requested version');
      }
    }

    const headerAndDataBits = new BitArray();

    for (const { mode, length, headerBits, dataBits } of segmentBlocks) {
      headerAndDataBits.append(headerBits);

      appendLengthInfo(headerAndDataBits, mode, version, length);

      headerAndDataBits.append(dataBits);
    }

    const { totalCodewords, dimension } = version;
    const ecBlocks = version.getECBlocksForECLevel(ecLevel);
    const numDataBytes = totalCodewords - ecBlocks.totalECCodewords;

    // Append terminate the bits properly.
    appendTerminateBits(headerAndDataBits, numDataBytes);

    const { numBlocks } = ecBlocks;
    const matrix = new ByteMatrix(dimension);
    const finalBits = injectECBytes(headerAndDataBits, numBlocks, numDataBytes, totalCodewords);
    const mask = chooseMask(matrix, finalBits, version, ecLevel);

    buildMatrix(matrix, finalBits, version, ecLevel, mask);

    return new QRCode(matrix, version, ecLevel, mask);
  }
}
