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

const encoder = new TextEncoder();

export function encode(content: string, charset: Charset): Uint8Array {
  if (charset !== Charset.UTF_8) {
    throw Error('built-in encode only support utf-8 charset');
  }

  return encoder.encode(content);
}

export function decode(bytes: Uint8Array, charset: Charset): string {
  const decoder = new TextDecoder(charset.label);

  return decoder.decode(bytes);
}
