/**
 * @module Encoder
 */

import {
  appendECI,
  appendFNC1Info,
  appendLengthInfo,
  appendModeInfo,
  appendTerminator,
  calculateBitsNeeded,
  chooseBestMaskAndMatrix,
  chooseRecommendVersion,
  Hints,
  injectECCodewords,
  isByteMode,
  isHanziMode,
  Segment,
  SegmentBlock,
  willFit
} from './utils/encoder';
import { Encoded } from './Encoded';
import { Charset } from '/common/Charset';
import { ECLevel } from '/common/ECLevel';
import { BitArray } from '/common/BitArray';
import { Version, VERSIONS } from '/common/Version';
import { encode as contentEncode, TextEncode } from '/common/encoding';
import { assertHints, assertLevel, assertVersion } from './utils/asserts';

export interface Options {
  hints?: Hints;
  encode?: TextEncode;
  version?: 'Auto' | number;
  level?: 'L' | 'M' | 'Q' | 'H';
}

export class Encoder {
  #hints: Hints;
  #level: ECLevel;
  #encode: TextEncode;
  #version: 'Auto' | number;

  constructor({
    // Encode hints
    hints = {},
    // Error correction level
    level = 'L',
    // Version number or auto
    version = 'Auto',
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

  public encode(...segments: Segment[]): Encoded {
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
      const head = new BitArray();
      const data = segment.encode(encode);
      const length = isByteMode(segment) ? data.byteLength : segment.content.length;

      // Append ECI segment if applicable.
      currentECIValue = appendECI(head, segment, currentECIValue);

      // Append FNC1 if applicable.
      if (fnc1 != null && !isFNC1Appended) {
        isFNC1Appended = true;

        appendFNC1Info(head, fnc1);
      }

      // With ECI in place, Write the mode marker.
      appendModeInfo(head, mode);

      // If is Hanzi mode append GB2312 subset.
      if (isHanziMode(segment)) {
        head.append(1, 4);
      }

      // Push segment block.
      segmentBlocks.push({ mode, head, data, length });
    }

    let version: Version;

    if (versionNumber === 'Auto') {
      version = chooseRecommendVersion(segmentBlocks, ecLevel);
    } else {
      version = VERSIONS[versionNumber - 1];

      const bitsNeeded = calculateBitsNeeded(segmentBlocks, version);

      if (!willFit(bitsNeeded, version, ecLevel)) {
        throw new Error('data too big for requested version');
      }
    }

    const headAndDataBits = new BitArray();

    for (const { mode, head, data, length } of segmentBlocks) {
      headAndDataBits.append(head);

      appendLengthInfo(headAndDataBits, mode, version, length);

      headAndDataBits.append(data);
    }

    const ecBlocks = version.getECBlocks(ecLevel);

    appendTerminator(headAndDataBits, ecBlocks.numTotalDataCodewords);

    const codewords = injectECCodewords(headAndDataBits, ecBlocks);
    const [mask, matrix] = chooseBestMaskAndMatrix(codewords, version, ecLevel);

    return new Encoded(matrix, version, ecLevel, mask);
  }
}
