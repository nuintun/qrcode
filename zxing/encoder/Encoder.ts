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
  Hints,
  injectECBytes,
  isByteMode,
  recommendVersion,
  Segment,
  SegmentBlock,
  willFit
} from './utils/encoder';
import { QRCode } from './QRCode';
import { Mode } from '/common/Mode';
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
    const hints = this.#hints;
    const ecLevel = this.#level;
    const encode = this.#encode;
    const versionNumber = this.#version;
    const segmentBlocks: SegmentBlock[] = [];

    // Only append FNC1 in first position once.
    let isGS1HintAppended = false;
    // Only append FFNC1 in second position once.
    let isAIMHintAppended = false;
    // Current ECI value.
    let [currentECIValue] = Charset.ISO_8859_1.values;

    // Init segments.
    for (const segment of segments) {
      const { mode } = segment;
      const headerBits = new BitArray();
      const isByte = isByteMode(segment);
      const dataBits = isByte ? segment.encode(encode) : segment.encode();

      // Append ECI segment if applicable.
      if (isByte) {
        const { charset } = segment;
        const [value] = charset.values;

        // Append ECI if it changed.
        if (value !== currentECIValue) {
          // Update ECI value.
          currentECIValue = value;

          // Append ECI value.
          appendECI(headerBits, currentECIValue);
        }
      }

      // FNC1 hint.
      const { fnc1 } = hints;

      // Process FNC1.
      if (fnc1 != null) {
        const [fnc1Mode, indicator] = fnc1;

        // Append FNC1 if applicable.
        switch (fnc1Mode) {
          case 'GS1':
            if (!isGS1HintAppended) {
              // Lock GS1 format append.
              isGS1HintAppended = true;

              // GS1 formatted codes are prefixed with a FNC1 in first position mode header.
              appendModeInfo(headerBits, Mode.FNC1_FIRST_POSITION);
            }
            break;
          case 'AIM':
            if (!isAIMHintAppended) {
              // Lock AIM format append.
              isAIMHintAppended = true;

              // AIM formatted codes are prefixed with a FNC1 in first position mode header.
              appendModeInfo(headerBits, Mode.FNC1_SECOND_POSITION);

              // Append AIM application indicator.
              headerBits.append(indicator, 8);
            }
            break;
        }
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
