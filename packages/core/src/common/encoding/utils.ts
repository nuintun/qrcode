/**
 * @module utils
 */

export type EncodingRange = [start: number, end: number];

export function getMappingFromCharacters(characters: string): Map<string, number> {
  let code = 0;

  const mapping = new Map<string, number>();

  for (const character of characters) {
    mapping.set(character, code++);
  }

  return mapping;
}

export function getMappingFromEncodingRanges(label: string, ...ranges: EncodingRange[]): Map<string, number> {
  const bytes: number[] = [];
  const codes: number[] = [];
  const mapping: Map<string, number> = new Map();
  const decoder = new TextDecoder(label, { fatal: true });

  for (const [start, end] of ranges) {
    for (let code = start; code <= end; code++) {
      // Now only support two bytes characters.
      bytes.push((code >> 8) & 0xff, code & 0xff);
      // Cache the codes.
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

export function getSerialEncodinRanges(start: number, end: number, offsets: number[], delta: number = 256): EncodingRange[] {
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
