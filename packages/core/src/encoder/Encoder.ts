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
  getSegmentLength,
  Hints,
  injectECCodewords,
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
import { encode as textEncode, TextEncode } from '/common/encoding';
import { assertHints, assertLevel, assertVersion } from './utils/asserts';

export interface Options {
  /**
   * @property hints
   * @description Encode hints.
   */
  hints?: Hints;
  /**
   * @property encode
   * @description Text encode function.
   */
  encode?: TextEncode;
  /**
   * @property level
   * @description Error correction level.
   */
  version?: 'Auto' | number;
  /**
   * @property level
   * @description Error correction level.
   */
  level?: 'L' | 'M' | 'Q' | 'H';
}

export class Encoder {
  #hints: Hints;
  #level: ECLevel;
  #encode: TextEncode;
  #version: 'Auto' | number;

  /**
   * @constructor
   * @param options The options of encoder.
   */
  constructor({ hints = {}, level = 'L', version = 'Auto', encode = textEncode }: Options = {}) {
    assertHints(hints);
    assertLevel(level);
    assertVersion(version);

    this.#hints = hints;
    this.#encode = encode;
    this.#version = version;
    this.#level = ECLevel[level];
  }

  /**
   * @method encode
   * @description Encode the segments.
   * @param segments The segments.
   */
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
      const body = segment.encode(encode);
      const length = getSegmentLength(segment, body);

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
      segmentBlocks.push({ mode, head, body, length });
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

    const buffer = new BitArray();

    for (const { mode, head, body, length } of segmentBlocks) {
      buffer.append(head);

      appendLengthInfo(buffer, mode, version, length);

      buffer.append(body);
    }

    const ecBlocks = version.getECBlocks(ecLevel);

    appendTerminator(buffer, ecBlocks.numTotalDataCodewords);

    const codewords = injectECCodewords(buffer, ecBlocks);
    const [mask, matrix] = chooseBestMaskAndMatrix(codewords, version, ecLevel);

    return new Encoded(matrix, version, ecLevel, mask);
  }
}
