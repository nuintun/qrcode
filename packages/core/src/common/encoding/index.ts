/**
 * @module index
 */

import { Charset } from '/common/Charset';
import { GB2312_MAPPING } from './mapping';

export interface TextEncode {
  (content: string, charset: Charset): Uint8Array;
}

export interface TextDecode {
  (bytes: Uint8Array, charset: Charset): string;
}

function getGB2312Codes(content: string): Uint8Array {
  const bytes: number[] = [];

  for (const character of content) {
    let code = GB2312_MAPPING.get(character);

    // If not found, push "？".
    code = code != null ? code : 41919;

    // Write with big endian.
    bytes.push((code >> 8) & 0xff, code & 0xff);
  }

  return new Uint8Array(bytes);
}

function getASCIICodes(content: string, maxCode: number): Uint8Array {
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
      return getASCIICodes(content, 0x7f);
    case Charset.ISO_8859_1:
      return getASCIICodes(content, 0xff);
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
