/**
 * @module Encoder
 */

import {
  appendECI,
  appendLengthInfo,
  appendModeInfo,
  appendTerminateBits,
  calculateBitsNeeded,
  chooseMask,
  EncodeHint,
  injectECBytes,
  isByteMode,
  recommendVersion,
  Segment,
  SegmentBlock,
  willFit
} from './utils/encoder';
import { QRCode } from './QRCode';
import { Mode } from '/common/Mode';
import { ECLevel } from '/common/ECLevel';
import { BitArray } from '/common/BitArray';
import { buildMatrix } from './utils/matrix';
import { ByteMatrix } from '/common/ByteMatrix';
import { Version, VERSIONS } from '/common/Version';
import { encode as contentEncode, TextEncode } from '/common/encoding';
import { assertHints, assertLevel, assertVersion } from './utils/asserts';

export interface Options {
  encode?: TextEncode;
  hints?: EncodeHint[];
  version?: number | 'auto';
  level?: 'L' | 'M' | 'Q' | 'H';
}

export class Encoder {
  #level: ECLevel;
  #hints: EncodeHint[];
  #encode: TextEncode;
  #version: number | 'auto';

  constructor({ level = 'L', hints = [], version = 'auto', encode = contentEncode }: Options = {}) {
    assertHints(hints);
    assertLevel(level);
    assertVersion(version);

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

    // Only append FNC1 in first segment once
    let isGS1FormatHintAppended = false;

    // Init segments
    for (const segment of segments) {
      const { mode } = segment;
      const headerBits = new BitArray();
      const isByte = isByteMode(segment);
      const dataBits = isByte ? segment.encode(encode) : segment.encode();

      // Append ECI segment if applicable
      if (isByte && hasEncodingHint) {
        appendECI(headerBits, segment.charset);
      }

      // Append the FNC1 mode header for GS1 formatted data if applicable
      if (hasGS1FormatHint && !isGS1FormatHintAppended) {
        // Lock gs1 format append
        isGS1FormatHintAppended = true;

        // GS1 formatted codes are prefixed with a FNC1 in first position mode header
        appendModeInfo(headerBits, Mode.FNC1_FIRST_POSITION);
      }

      // (With ECI in place,) Write the mode marker
      appendModeInfo(headerBits, mode);

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
