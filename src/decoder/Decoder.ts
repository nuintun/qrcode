/**
 * @module Decoder
 */

import { QRCode } from './QRCode';
import { decode } from './utils/source';
import { FormatInfo } from './FormatInfo';
import { Version } from '/common/Version';
import { BitMatrix } from '/common/BitMatrix';
import { BitMatrixParser } from './BitMatrixParser';
import { correctErrors, getDataBlocks } from './utils/decoder';
import { decode as textDecode, TextDecode } from '/common/encoding';

export interface Options {
  decode?: TextDecode;
}

export class Decoder {
  #decode: TextDecode;

  constructor({ decode = textDecode }: Options = {}) {
    this.#decode = decode;
  }

  #parse(parser: BitMatrixParser, version: Version, { mask, level }: FormatInfo): [codewords: Uint8Array, corrected: number] {
    let offset = 0;
    let corrected = 0;

    parser.unmask(mask);

    const ecBlocks = version.getECBlocks(level);
    const codewords = parser.readCodewords(version, level);
    const blocks = getDataBlocks(codewords, version, level);
    const buffer = new Uint8Array(ecBlocks.numTotalDataCodewords);

    for (const { codewords, numDataCodewords } of blocks) {
      const [bytes, errors] = correctErrors(codewords, numDataCodewords);

      buffer.set(bytes.subarray(0, numDataCodewords), offset);

      corrected += errors;
      offset += numDataCodewords;
    }

    return [buffer, corrected];
  }

  decode(matrix: BitMatrix): QRCode {
    let corrected = 0;
    let mirror = false;
    let version: Version;
    let codewords: Uint8Array;
    let formatInfo: FormatInfo | undefined;

    const parser = new BitMatrixParser(matrix);

    try {
      version = parser.readVersion();
      formatInfo = parser.readFormatInfo();
      [codewords, corrected] = this.#parse(parser, version, formatInfo);
    } catch {
      if (formatInfo != null) {
        parser.remask(formatInfo.mask);
      }

      parser.mirror();

      mirror = true;
      version = parser.readVersion();
      formatInfo = parser.readFormatInfo();
      [codewords, corrected] = this.#parse(parser, version, formatInfo);
    }

    return new QRCode(decode(codewords, version, formatInfo, this.#decode), version, formatInfo, corrected, mirror);
  }
}