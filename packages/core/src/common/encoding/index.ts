/**
 * @module index
 */

import { Charset } from '/common/Charset';
import { getEncodingMapping, getSerialRanges } from './utils';

export interface TextEncode {
  (content: string, charset: Charset): Uint8Array;
}

export interface TextDecode {
  (bytes: Uint8Array, charset: Charset): string;
}

export const GB2312_MAPPING = getEncodingMapping(
  'gb2312',
  [0xa1a1, 0xa1fe],
  [0xa2b1, 0xa2e2],
  [0xa2e5, 0xa2ee],
  [0xa2f1, 0xa2fc],
  [0xa3a1, 0xa3fe],
  [0xa4a1, 0xa4f3],
  [0xa5a1, 0xa5f6],
  [0xa6a1, 0xa6b8],
  [0xa6c1, 0xa6d8],
  [0xa7a1, 0xa7c1],
  [0xa7d1, 0xa7f1],
  [0xa8a1, 0xa8ba],
  [0xa8c5, 0xa8e9],
  [0xa9a4, 0xa9ef],
  ...getSerialRanges(0xb0a1, 0xd6fe, [0, 93]),
  [0xd7a1, 0xd7f9],
  ...getSerialRanges(0xd8a1, 0xf7fe, [0, 93])
);

export const SHIFT_JIS_MAPPING = getEncodingMapping(
  'shift-jis',
  [0x8140, 0x817e],
  [0x8180, 0x81ac],
  [0x81b8, 0x81bf],
  [0x81c8, 0x81ce],
  [0x81da, 0x81e8],
  [0x81f0, 0x81f7],
  [0x81fc, 0x81fc],
  [0x824f, 0x8258],
  [0x8260, 0x8279],
  [0x8281, 0x829a],
  [0x829f, 0x82f1],
  [0x8340, 0x837e],
  [0x8380, 0x8396],
  [0x839f, 0x83b6],
  [0x83bf, 0x83d6],
  [0x8440, 0x8460],
  [0x8470, 0x847e],
  [0x8480, 0x8491],
  [0x849f, 0x84be],
  [0x889f, 0x88fc],
  ...getSerialRanges(0x8940, 0x97fc, [0, 62, 64, 188]),
  [0x9840, 0x9872],
  [0x989f, 0x98fc],
  ...getSerialRanges(0x9940, 0x9ffc, [0, 62, 64, 188]),
  ...getSerialRanges(0xe040, 0xe9fc, [0, 62, 64, 188]),
  [0xea40, 0xea7e],
  [0xea80, 0xeaa4]
);

export const NUMERIC_CHARACTERS = '0123456789';

export const ALPHANUMERIC_CHARACTERS = `${NUMERIC_CHARACTERS}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;

function getGB2312Codes(content: string): Uint8Array {
  const bytes: number[] = [];

  for (const character of content) {
    const code = GB2312_MAPPING.get(character);

    bytes.push(code != null ? code : 63);
  }

  return new Uint8Array(bytes);
}

function getUnicodeCodes(content: string, maxCode: number): Uint8Array {
  const bytes: number[] = [];

  for (const character of content) {
    const code = character.charCodeAt(0);

    // If gt max code, push "?".
    bytes.push(code > maxCode ? 63 : code);
  }

  return new Uint8Array(bytes);
}

export function encode(content: string, charset: Charset): Uint8Array {
  switch (charset) {
    case Charset.GB2312:
      return getGB2312Codes(content);
    case Charset.ASCII:
    case Charset.ISO_646_INV:
      return getUnicodeCodes(content, 0x7f);
    case Charset.ISO_8859_1:
      return getUnicodeCodes(content, 0xff);
    case Charset.UTF_8:
      return new TextEncoder().encode(content);
    default:
      throw Error(`built-in encode not support charset: ${charset.label}`);
  }
}

export function decode(bytes: Uint8Array, charset: Charset): string {
  switch (charset) {
    case Charset.BINARY:
    case Charset.UTF_32BE:
    case Charset.UTF_32LE:
      throw Error(`built-in decode not support charset: ${charset.label}`);
    default:
      return new TextDecoder(charset.label).decode(bytes);
  }
}
