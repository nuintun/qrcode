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

export type EncodingRange = [start: number, end: number];

function getCharCodes(content: string, maxCode: number): Uint8Array {
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

export const NUMERIC_CHARACTERS = '0123456789';

export const ALPHANUMERIC_CHARACTERS = `${NUMERIC_CHARACTERS}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;

export function getCharactersMapping(characters: string): Map<string, number> {
  let code = 0;

  const mapping = new Map<string, number>();

  for (const character of characters) {
    mapping.set(character, code++);
  }

  return mapping;
}

export function getEncodingMapping(label: string, ...ranges: EncodingRange[]): Map<string, number> {
  const bytes: number[] = [];
  const codes: number[] = [];
  const mapping: Map<string, number> = new Map();
  const decoder = new TextDecoder(label, { fatal: true });

  for (const [start, end] of ranges) {
    for (let code = start; code <= end; code++) {
      bytes.push(code >> 8, code & 0xff);
      codes.push(code);
    }
  }

  const { length } = codes;
  const characters = decoder.decode(new Uint8Array(bytes));

  for (let i = 0; i < length; i++) {
    const character = characters.charAt(i);

    if (!mapping.has(character)) {
      mapping.set(character, codes[i]);
    }
  }

  return mapping;
}

export function getSerialRanges(start: number, end: number, offsets: number[], delta: number = 256): EncodingRange[] {
  const count = offsets.length - 1;
  const ranges: EncodingRange[] = [];

  for (let i = start; i < end; ) {
    for (let j = 0; j < count; j += 2) {
      ranges.push([i + offsets[j], i + offsets[j + 1]]);
    }

    i += delta;
  }

  return ranges;
}
