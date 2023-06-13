/**
 * @module encoding
 */

import { Charset } from './Charset';

export interface TextEncode {
  (content: string, charset: Charset): Uint8Array;
}

export interface TextDecode {
  (bytes: Uint8Array, charset: Charset): string;
}

function getCharCodes(content: string, maxCode: number): Uint8Array {
  const bytes: number[] = [];

  for (const character of content) {
    const code = character.charCodeAt(0);

    // If gt max code, pust ?
    bytes.push(code > maxCode ? 63 : code);
  }

  return new Uint8Array(bytes);
}

export function encode(content: string, charset: Charset): Uint8Array {
  switch (charset) {
    case Charset.ASCII:
      return getCharCodes(content, 0x7f);
    case Charset.ISO_8859_1:
      return getCharCodes(content, 0xff);
    case Charset.UTF_8:
      return new TextEncoder().encode(content);
    default:
      throw Error('built-in encode only support ascii, utf-8 and iso-8859-1 charset');
  }
}

export function decode(bytes: Uint8Array, charset: Charset): string {
  return new TextDecoder(charset.label).decode(bytes);
}
