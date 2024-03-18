/**
 * @module index
 */

import { Charset } from '/common/Charset';

export interface TextEncode {
  (content: string, charset: Charset): Uint8Array;
}

export interface TextDecode {
  (bytes: Uint8Array, charset: Charset): string;
}

function getUnicodeCodes(content: string, maxCode: number): Uint8Array {
  const bytes: number[] = [];

  for (const character of content) {
    const code = character.codePointAt(0);

    // If gt max code, push "?".
    bytes.push(code == null || code > maxCode ? 63 : code);
  }

  return new Uint8Array(bytes);
}

export function encode(content: string, charset: Charset): Uint8Array {
  switch (charset) {
    case Charset.ASCII:
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
  try {
    return new TextDecoder(charset.label).decode(bytes);
  } catch {
    throw Error(`built-in decode not support charset: ${charset.label}`);
  }
}
