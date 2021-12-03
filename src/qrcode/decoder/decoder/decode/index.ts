/**
 * @module index
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

import { BitStream } from './BitStream';
import { Mode } from '../../../common/Mode';
import { EncodingHint } from '../../../common/EncodingHint';
import { decode as decodeUTF8 } from '../../../../encoding/UTF8';
import { ErrorCorrectionLevel } from '../../../common/ErrorCorrectionLevel';
import { decode as decodeSJIS, getTables } from '../../../../encoding/SJIS';

interface ByteChunk {
  mode: Mode.Numeric | Mode.Alphanumeric | Mode.Byte | Mode.Kanji;
  data: string;
  bytes: number[];
  encoding?: number;
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

type Chunks = Array<ByteChunk | StructuredAppendChunk>;

export interface DecodeResult extends DecodeData {
  chunks: Chunks;
  version: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

function decodeNumeric(stream: BitStream, size: number): DecodeData {
  let data = '';
  const bytes: number[] = [];
  const characterCountSize = [10, 12, 14][size];
  let length = stream.readBits(characterCountSize);

  // Read digits in groups of 3
  while (length >= 3) {
    const num = stream.readBits(10);

    if (num >= 1000) {
      throw new Error('invalid numeric value above 999');
    }

    const a = Math.floor(num / 100);
    const b = Math.floor(num / 10) % 10;
    const c = num % 10;

    bytes.push(48 + a, 48 + b, 48 + c);

    data += a.toString() + b.toString() + c.toString();

    length -= 3;
  }

  // If the number of digits aren't a multiple of 3, the remaining digits are special cased.
  if (length === 2) {
    const num = stream.readBits(7);

    if (num >= 100) {
      throw new Error('invalid numeric value above 99');
    }

    const a = Math.floor(num / 10);
    const b = num % 10;

    bytes.push(48 + a, 48 + b);

    data += a.toString() + b.toString();
  } else if (length === 1) {
    const num = stream.readBits(4);

    if (num >= 10) {
      throw new Error('invalid numeric value above 9');
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
  const bytes: number[] = [];
  const characterCountSize = [9, 11, 13][size];

  let data = '';
  let length = stream.readBits(characterCountSize);

  while (length >= 2) {
    const v = stream.readBits(11);
    const a = Math.floor(v / 45);
    const b = v % 45;

    bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0), AlphanumericCharacterCodes[b].charCodeAt(0));

    data += AlphanumericCharacterCodes[a] + AlphanumericCharacterCodes[b];

    length -= 2;
  }

  if (length === 1) {
    const a = stream.readBits(6);

    bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0));

    data += AlphanumericCharacterCodes[a];
  }

  return { bytes, data };
}

function decodeByte(stream: BitStream, size: number, encoding: number): DecodeData {
  const bytes: number[] = [];
  const characterCountSize = [8, 16, 16][size];
  const length = stream.readBits(characterCountSize);

  for (let i = 0; i < length; i++) {
    bytes.push(stream.readBits(8));
  }

  return { bytes, data: encoding === EncodingHint.SJIS ? decodeSJIS(bytes) : decodeUTF8(bytes) };
}

function decodeKanji(stream: BitStream, size: number): DecodeData {
  let data = '';

  const bytes: number[] = [];
  const { fromCharCode } = String;
  const { SJIS_TO_UTF8 } = getTables();
  const characterCountSize = [8, 10, 12][size];
  const length = stream.readBits(characterCountSize);

  for (let i = 0; i < length; i++) {
    const k = stream.readBits(13);

    let c = (Math.floor(k / 0xc0) << 8) | k % 0xc0;

    if (c < 0x1f00) {
      c += 0x8140;
    } else {
      c += 0xc140;
    }

    bytes.push(c >> 8, c & 0xff);

    const b = SJIS_TO_UTF8[c];

    data += fromCharCode(b != null ? b : c);
  }

  return { bytes, data };
}

export function bytesDecode(
  data: Uint8ClampedArray,
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel
): DecodeResult | null {
  let encoding = -1;

  const stream = new BitStream(data);
  // There are 3 'sizes' based on the version. 1-9 is small (0), 10-26 is medium (1) and 27-40 is large (2).
  const size = version <= 9 ? 0 : version <= 26 ? 1 : 2;
  const result: DecodeResult = { data: '', bytes: [], chunks: [], version, errorCorrectionLevel };

  while (stream.available() >= 4) {
    const mode = stream.readBits(4);

    if (mode === Mode.Terminator) {
      return result;
    } else if (mode === Mode.ECI) {
      if (stream.readBits(1) === 0) {
        encoding = stream.readBits(7);
      } else if (stream.readBits(1) === 0) {
        encoding = stream.readBits(14);
      } else if (stream.readBits(1) === 0) {
        encoding = stream.readBits(21);
      } else {
        // ECI data seems corrupted
        encoding = -1;
      }
    } else if (mode === Mode.Numeric) {
      const numericResult = decodeNumeric(stream, size);

      result.data += numericResult.data;

      result.chunks.push({
        mode: Mode.Numeric,
        data: numericResult.data,
        bytes: numericResult.bytes
      });
      result.bytes.push(...numericResult.bytes);
    } else if (mode === Mode.Alphanumeric) {
      const alphanumericResult = decodeAlphanumeric(stream, size);

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
      const byteResult = decodeByte(stream, size, encoding);

      result.data += byteResult.data;

      result.chunks.push({
        encoding,
        mode: Mode.Byte,
        data: byteResult.data,
        bytes: byteResult.bytes
      });
      result.bytes.push(...byteResult.bytes);
    } else if (mode === Mode.Kanji) {
      const kanjiResult = decodeKanji(stream, size);

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

  return null;
}
