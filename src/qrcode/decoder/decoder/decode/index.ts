/**
 * @module index
 * @author nuintun
 * @author Cosmo Wolfe
 */

import BitStream from './BitStream';
import { UTF2SJISTable } from '../../../../encoding/SJIS';

export interface Chunk {
  type: Mode;
  text: string;
}

export interface ByteChunk {
  type: Mode.Byte | Mode.Kanji;
  bytes: number[];
}

export interface ECIChunk {
  type: Mode.ECI;
  assignmentNumber: number;
}

export type Chunks = Array<Chunk | ByteChunk | ECIChunk>;

export interface DecodedQR {
  text: string;
  bytes: number[];
  chunks: Chunks;
}

export interface DecodeResult {
  text: string;
  bytes: number[];
}

export enum Mode {
  Numeric = 'numeric',
  Alphanumeric = 'alphanumeric',
  Byte = 'byte',
  Kanji = 'kanji',
  ECI = 'eci'
}

enum ModeByte {
  Terminator = 0x0,
  Numeric = 0x1,
  Alphanumeric = 0x2,
  Byte = 0x4,
  Kanji = 0x8,
  ECI = 0x7
  // StructuredAppend = 0x3,
  // FNC1FirstPosition = 0x5,
  // FNC1SecondPosition = 0x9
}

function decodeNumeric(stream: BitStream, size: number): DecodeResult {
  let text: string = '';
  const bytes: number[] = [];

  const characterCountSize: number = [10, 12, 14][size];
  let length: number = stream.readBits(characterCountSize);

  // Read digits in groups of 3
  while (length >= 3) {
    const num: number = stream.readBits(10);

    if (num >= 1000) {
      throw new Error('Invalid numeric value above 999');
    }

    const a: number = Math.floor(num / 100);
    const b: number = Math.floor(num / 10) % 10;
    const c: number = num % 10;

    bytes.push(48 + a, 48 + b, 48 + c);

    text += a.toString() + b.toString() + c.toString();

    length -= 3;
  }

  // If the number of digits aren't a multiple of 3, the remaining digits are special cased.
  if (length === 2) {
    const num: number = stream.readBits(7);

    if (num >= 100) {
      throw new Error('Invalid numeric value above 99');
    }

    const a: number = Math.floor(num / 10);
    const b: number = num % 10;

    bytes.push(48 + a, 48 + b);

    text += a.toString() + b.toString();
  } else if (length === 1) {
    const num: number = stream.readBits(4);

    if (num >= 10) {
      throw new Error('Invalid numeric value above 9');
    }

    bytes.push(48 + num);

    text += num.toString();
  }

  return { bytes, text };
}

// prettier-ignore
const AlphanumericCharacterCodes: string[]= [
  '0', '1', '2', '3', '4', '5', '6', '7', '8',
  '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
  'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ' ', '$', '%', '*', '+', '-', '.', '/', ':'
];

function decodeAlphanumeric(stream: BitStream, size: number): DecodeResult {
  let text: string = '';
  const bytes: number[] = [];

  const characterCountSize: number = [9, 11, 13][size];
  let length: number = stream.readBits(characterCountSize);

  while (length >= 2) {
    const v: number = stream.readBits(11);

    const a: number = Math.floor(v / 45);
    const b: number = v % 45;

    bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0), AlphanumericCharacterCodes[b].charCodeAt(0));

    text += AlphanumericCharacterCodes[a] + AlphanumericCharacterCodes[b];

    length -= 2;
  }

  if (length === 1) {
    const a: number = stream.readBits(6);

    bytes.push(AlphanumericCharacterCodes[a].charCodeAt(0));

    text += AlphanumericCharacterCodes[a];
  }

  return { bytes, text };
}

function decodeByte(stream: BitStream, size: number): DecodeResult {
  let text: string = '';
  const bytes: number[] = [];

  const characterCountSize: number = [8, 16, 16][size];
  const length: number = stream.readBits(characterCountSize);

  for (let i: number = 0; i < length; i++) {
    const b: number = stream.readBits(8);

    bytes.push(b);
  }

  try {
    text += decodeURIComponent(bytes.map(b => `%${('0' + b.toString(16)).substr(-2)}`).join(''));
  } catch {
    // failed to decode
  }

  return { bytes, text };
}

function decodeKanji(stream: BitStream, size: number): DecodeResult {
  let text: string = '';
  const bytes: number[] = [];

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

    text += String.fromCharCode(UTF2SJISTable[c]);
  }

  return { bytes, text };
}

export function decode(data: Uint8ClampedArray, version: number): DecodedQR {
  const stream: BitStream = new BitStream(data);

  // There are 3 'sizes' based on the version. 1-9 is small (0), 10-26 is medium (1) and 27-40 is large (2).
  const size: number = version <= 9 ? 0 : version <= 26 ? 1 : 2;

  const result: DecodedQR = {
    text: '',
    bytes: [],
    chunks: []
  };

  while (stream.available() >= 4) {
    const mode: number = stream.readBits(4);

    if (mode === ModeByte.Terminator) {
      return result;
    } else if (mode === ModeByte.ECI) {
      if (stream.readBits(1) === 0) {
        result.chunks.push({
          type: Mode.ECI,
          assignmentNumber: stream.readBits(7)
        });
      } else if (stream.readBits(1) === 0) {
        result.chunks.push({
          type: Mode.ECI,
          assignmentNumber: stream.readBits(14)
        });
      } else if (stream.readBits(1) === 0) {
        result.chunks.push({
          type: Mode.ECI,
          assignmentNumber: stream.readBits(21)
        });
      } else {
        // ECI data seems corrupted
        result.chunks.push({
          type: Mode.ECI,
          assignmentNumber: -1
        });
      }
    } else if (mode === ModeByte.Numeric) {
      const numericResult: DecodeResult = decodeNumeric(stream, size);

      result.text += numericResult.text;

      result.bytes.push(...numericResult.bytes);
      result.chunks.push({
        type: Mode.Numeric,
        text: numericResult.text
      });
    } else if (mode === ModeByte.Alphanumeric) {
      const alphanumericResult: DecodeResult = decodeAlphanumeric(stream, size);

      result.text += alphanumericResult.text;

      result.bytes.push(...alphanumericResult.bytes);
      result.chunks.push({
        type: Mode.Alphanumeric,
        text: alphanumericResult.text
      });
    } else if (mode === ModeByte.Byte) {
      const byteResult: DecodeResult = decodeByte(stream, size);

      result.text += byteResult.text;

      result.bytes.push(...byteResult.bytes);
      result.chunks.push({
        type: Mode.Byte,
        bytes: byteResult.bytes,
        text: byteResult.text
      });
    } else if (mode === ModeByte.Kanji) {
      const kanjiResult: DecodeResult = decodeKanji(stream, size);

      result.text += kanjiResult.text;

      result.bytes.push(...kanjiResult.bytes);
      result.chunks.push({
        type: Mode.Kanji,
        bytes: kanjiResult.bytes,
        text: kanjiResult.text
      });
    }
  }

  // If there is no data left, or the remaining bits are all 0, then that counts as a termination marker
  if (stream.available() === 0 || stream.readBits(stream.available()) === 0) {
    return result;
  }
}
