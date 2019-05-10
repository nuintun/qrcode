/**
 * @module index
 * @author nuintun
 * @author Cosmo Wolfe
 */

import { BitStream } from './BitStream';
import { Mode } from '../../../common/Mode';
import { EncodingHint } from '../../../common/EncodingHint';
import { getTables, SJISTables } from '../../../../encoding/SJIS';
import { ErrorCorrectionLevel } from '../../../common/ErrorCorrectionLevel';

interface ByteChunk {
  mode: Mode.Numeric | Mode.Alphanumeric | Mode.Byte | Mode.Kanji;
  data: string;
  bytes: number[];
}

interface ECIChunk {
  mode: Mode.ECI;
  encoding: number;
}

interface StructuredAppend {
  symbols: number[];
  parity: number;
}

interface StructuredAppendChunk extends StructuredAppend {
  mode: Mode.StructuredAppend;
}

interface DecodeData {
  data: string;
  bytes: number[];
}

type Chunks = Array<ByteChunk | ECIChunk | StructuredAppendChunk>;

export interface DecodeResult extends DecodeData {
  chunks: Chunks;
  version: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

function decodeNumeric(stream: BitStream, size: number): DecodeData {
  let data: string = '';
  const bytes: number[] = [];
  const characterCountSize: number = [10, 12, 14][size];
  let length: number = stream.readBits(characterCountSize);

  // Read digits in groups of 3
  while (length >= 3) {
    const num: number = stream.readBits(10);

    if (num >= 1000) {
      throw 'invalid numeric value above 999';
    }

    const a: number = Math.floor(num / 100);
    const b: number = Math.floor(num / 10) % 10;
    const c: number = num % 10;

    bytes.push(48 + a, 48 + b, 48 + c);

    data += a.toString() + b.toString() + c.toString();

    length -= 3;
  }

  // If the number of digits aren't a multiple of 3, the remaining digits are special cased.
  if (length === 2) {
    const num: number = stream.readBits(7);

    if (num >= 100) {
      throw 'invalid numeric value above 99';
    }

    const a: number = Math.floor(num / 10);
    const b: number = num % 10;

    bytes.push(48 + a, 48 + b);

    data += a.toString() + b.toString();
  } else if (length === 1) {
    const num: number = stream.readBits(4);

    if (num >= 10) {
      throw 'invalid numeric value above 9';
    }

    bytes.push(48 + num);

    data += num.toString();
  }

  return { bytes, data };
}

// prettier-ignore
const AlphanumericCharacterCodes: string[]= [
  '0', '1', '2', '3', '4', '5', '6', '7', '8',
  '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
  'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ' ', '$', '%', '*', '+', '-', '.', '/', ':'
];

function decodeAlphanumeric(stream: BitStream, size: number): DecodeData {
  let data: string = '';
  const bytes: number[] = [];
  const characterCountSize: number = [9, 11, 13][size];
  let length: number = stream.readBits(characterCountSize);

  while (length >= 2) {
    const v: number = stream.readBits(11);

    const a: number = Math.floor(v / 45);
    const b: number = v % 45;

    bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0), AlphanumericCharacterCodes[b].charCodeAt(0));

    data += AlphanumericCharacterCodes[a] + AlphanumericCharacterCodes[b];

    length -= 2;
  }

  if (length === 1) {
    const a: number = stream.readBits(6);

    bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0));

    data += AlphanumericCharacterCodes[a];
  }

  return { bytes, data };
}

/**
 * @function decodeByteAsUTF8
 * @param {number[]} bytes
 * @returns {string}
 * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
 */
function decodeByteAsUTF8(bytes: number[]): string {
  // TODO(user): Use native implementations if/when available
  let pos: number = 0;
  let output: string = '';
  const length: number = bytes.length;

  while (pos < length) {
    const c1: number = bytes[pos++];

    if (c1 < 128) {
      output += String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c2: number = bytes[pos++];

      output += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
    } else if (c1 > 239 && c1 < 365) {
      // Surrogate Pair
      const c2: number = bytes[pos++];
      const c3: number = bytes[pos++];
      const c4: number = bytes[pos++];
      const u: number = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;

      output += String.fromCharCode(0xd800 + (u >> 10));
      output += String.fromCharCode(0xdc00 + (u & 1023));
    } else {
      const c2: number = bytes[pos++];
      const c3: number = bytes[pos++];

      output += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
    }
  }

  return output;
}

/**
 * @function decodeByteAsUTF8
 * @param {number[]} bytes
 * @returns {string}
 * @see https://github.com/narirou/jconv/blob/master/jconv.js
 */
function decodeByteAsSJIS(bytes: number[]): string {
  let pos: number = 0;
  let output: string = '';
  const length: number = bytes.length;
  const { SJIS_TO_UTF8 }: SJISTables = getTables();

  while (pos < length) {
    const byte: number = bytes[pos++];

    if (byte < 0x80) {
      // ASCII
      output += String.fromCharCode(byte);
    } else if (0xa0 <= byte && byte <= 0xdf) {
      // HALFWIDTH_KATAKANA
      output += String.fromCharCode(byte + 0xfec0);
    } else {
      // KANJI
      let code: number = (byte << 8) + bytes[pos++];

      code = SJIS_TO_UTF8[code];

      output += code != null ? String.fromCharCode(code) : '?';
    }
  }

  return output;
}

function decodeByte(stream: BitStream, size: number, encoding: number): DecodeData {
  const bytes: number[] = [];
  const characterCountSize: number = [8, 16, 16][size];
  const length: number = stream.readBits(characterCountSize);

  for (let i: number = 0; i < length; i++) {
    bytes.push(stream.readBits(8));
  }

  return { bytes, data: encoding === EncodingHint.SJIS ? decodeByteAsSJIS(bytes) : decodeByteAsUTF8(bytes) };
}

function decodeKanji(stream: BitStream, size: number): DecodeData {
  let data: string = '';
  const bytes: number[] = [];
  const { SJIS_TO_UTF8 }: SJISTables = getTables();
  const characterCountSize: number = [8, 10, 12][size];
  const length: number = stream.readBits(characterCountSize);

  for (let i: number = 0; i < length; i++) {
    const k: number = stream.readBits(13);

    let c: number = (Math.floor(k / 0xc0) << 8) | k % 0xc0;

    if (c < 0x1f00) {
      c += 0x8140;
    } else {
      c += 0xc140;
    }

    bytes.push(c >> 8, c & 0xff);

    const b: number = SJIS_TO_UTF8[c];

    data += String.fromCharCode(b != null ? b : c);
  }

  return { bytes, data };
}

export function bytesDecode(
  data: Uint8ClampedArray,
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel
): DecodeResult {
  let encoding: number = EncodingHint.UTF8;
  const stream: BitStream = new BitStream(data);
  // There are 3 'sizes' based on the version. 1-9 is small (0), 10-26 is medium (1) and 27-40 is large (2).
  const size: number = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  const result: DecodeResult = { data: '', bytes: [], chunks: [], version, errorCorrectionLevel };

  while (stream.available() >= 4) {
    const mode: number = stream.readBits(4);

    if (mode === Mode.Terminator) {
      return result;
    } else if (mode === Mode.ECI) {
      if (stream.readBits(1) === 0) {
        encoding = stream.readBits(7);

        result.chunks.push({ mode: Mode.ECI, encoding });
      } else if (stream.readBits(1) === 0) {
        encoding = stream.readBits(14);

        result.chunks.push({ mode: Mode.ECI, encoding });
      } else if (stream.readBits(1) === 0) {
        encoding = stream.readBits(21);

        result.chunks.push({ mode: Mode.ECI, encoding });
      } else {
        // ECI data seems corrupted
        result.chunks.push({ mode: Mode.ECI, encoding: -1 });
      }
    } else if (mode === Mode.Numeric) {
      const numericResult: DecodeData = decodeNumeric(stream, size);

      result.data += numericResult.data;

      result.chunks.push({
        mode: Mode.Numeric,
        data: numericResult.data,
        bytes: numericResult.bytes
      });
      result.bytes.push(...numericResult.bytes);
    } else if (mode === Mode.Alphanumeric) {
      const alphanumericResult: DecodeData = decodeAlphanumeric(stream, size);

      result.data += alphanumericResult.data;

      result.chunks.push({
        mode: Mode.Alphanumeric,
        data: alphanumericResult.data,
        bytes: alphanumericResult.bytes
      });
      result.bytes.push(...alphanumericResult.bytes);
    } else if (mode === Mode.StructuredAppend) {
      // QR Standard section 9.2
      const structuredAppend: StructuredAppend = {
        // [current, total]
        symbols: [stream.readBits(4), stream.readBits(4)],
        parity: stream.readBits(8)
      };

      result.chunks.push({ mode: Mode.StructuredAppend, ...structuredAppend });
    } else if (mode === Mode.Byte) {
      const byteResult: DecodeData = decodeByte(stream, size, encoding);

      result.data += byteResult.data;

      result.chunks.push({
        mode: Mode.Byte,
        data: byteResult.data,
        bytes: byteResult.bytes
      });
      result.bytes.push(...byteResult.bytes);
    } else if (mode === Mode.Kanji) {
      const kanjiResult: DecodeData = decodeKanji(stream, size);

      result.data += kanjiResult.data;

      result.chunks.push({
        mode: Mode.Kanji,
        data: kanjiResult.data,
        bytes: kanjiResult.bytes
      });
      result.bytes.push(...kanjiResult.bytes);
    }
  }

  // If there is no data left, or the remaining bits are all 0, then that counts as a termination marker
  if (stream.available() === 0 || stream.readBits(stream.available()) === 0) {
    return result;
  }
}
