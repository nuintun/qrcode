/**
 * @module source
 */

import { FNC1 } from '/common/interface';
import { Version } from '/common/Version';
import { BitSource } from '/common/BitSource';
import { TextDecode } from '/common/encoding';
import { fromModeBits, Mode } from '/common/Mode';
import { Charset, fromCharsetValue } from '/common/Charset';
import { ALPHANUMERIC_CHARACTERS, NUMERIC_CHARACTERS } from '/common/encoding/mapping';

export interface Structured {
  readonly index: number;
  readonly count: number;
  readonly parity: number;
}

export interface DecodeSource {
  readonly content: string;
  readonly symbology: string;
  readonly fnc1: FNC1 | false;
  readonly codewords: Uint8Array;
  readonly structured: Structured | false;
}

function parseECIValue(source: BitSource): number {
  const firstByte = source.read(8);

  if ((firstByte & 0x80) === 0) {
    // Just one byte.
    return firstByte & 0x7f;
  }

  if ((firstByte & 0xc0) === 0x80) {
    // Two bytes.
    const secondByte = source.read(8);

    return ((firstByte & 0x3f) << 8) | secondByte;
  }

  if ((firstByte & 0xe0) === 0xc0) {
    // Three bytes.
    const secondThirdBytes = source.read(16);

    return ((firstByte & 0x1f) << 16) | secondThirdBytes;
  }

  throw new Error('illegal extended channel interpretation value');
}

const GS = String.fromCharCode(0x1d);

function processGSCharacter(content: string): string {
  return content.replace(/%+/g, match => {
    const isOdd = match.length & 0x01;

    match = match.replace(/%%/g, '%');

    return isOdd ? match.replace(/%$/, GS) : match;
  });
}

function decodeAlphanumericSegment(source: BitSource, count: number, fnc1: boolean): string {
  let content = '';

  while (count > 1) {
    if (source.available() < 11) {
      throw new Error('illegal bits length');
    }

    const nextTwoCharsBits = source.read(11);

    content += ALPHANUMERIC_CHARACTERS.charAt(nextTwoCharsBits / 45);
    content += ALPHANUMERIC_CHARACTERS.charAt(nextTwoCharsBits % 45);

    count -= 2;
  }

  if (count === 1) {
    // Special case: one character left.
    if (source.available() < 6) {
      throw new Error('illegal bits length');
    }

    content += ALPHANUMERIC_CHARACTERS.charAt(source.read(6));
  }

  return fnc1 ? processGSCharacter(content) : content;
}

function decodeByteSegment(source: BitSource, count: number, decode: TextDecode, fnc1: boolean, eciValue?: number): string {
  // Don't crash trying to read more bits than we have available.
  if (source.available() < 8 * count) {
    throw new Error('illegal bits length');
  }

  const bytes = new Uint8Array(count);
  const charset = eciValue != null ? fromCharsetValue(eciValue) : Charset.ISO_8859_1;

  for (let i = 0; i < count; i++) {
    bytes[i] = source.read(8);
  }

  const content = decode(bytes, charset);

  return fnc1 ? processGSCharacter(content) : content;
}

function decodeHanziSegment(source: BitSource, count: number): string {
  if (source.available() < 13 * count) {
    throw new Error('illegal bits length');
  }

  let offset = 0;

  const bytes = new Uint8Array(2 * count);

  while (count > 0) {
    const twoBytes = source.read(13);

    let assembledTwoBytes = ((twoBytes / 0x060) << 8) | (twoBytes % 0x060);

    if (assembledTwoBytes < 0x00a00) {
      // In the 0xA1A1 to 0xAAFE range.
      assembledTwoBytes += 0x0a1a1;
    } else {
      // In the 0xB0A1 to 0xFAFE range.
      assembledTwoBytes += 0x0a6a1;
    }

    bytes[offset] = (assembledTwoBytes >> 8) & 0xff;
    bytes[offset + 1] = assembledTwoBytes & 0xff;

    count--;
    offset += 2;
  }

  return new TextDecoder('gb2312').decode(bytes);
}

function decodeKanjiSegment(source: BitSource, count: number): string {
  if (source.available() < 13 * count) {
    throw new Error('illegal bits length');
  }

  let offset = 0;

  const bytes = new Uint8Array(2 * count);

  while (count > 0) {
    const twoBytes = source.read(13);

    let assembledTwoBytes = ((twoBytes / 0x0c0) << 8) | (twoBytes % 0x0c0);

    if (assembledTwoBytes < 0x01f00) {
      // In the 0x8140 to 0x9FFC range.
      assembledTwoBytes += 0x08140;
    } else {
      // In the 0xE040 to 0xEBBF range.
      assembledTwoBytes += 0x0c140;
    }

    bytes[offset] = (assembledTwoBytes >> 8) & 0xff;
    bytes[offset + 1] = assembledTwoBytes & 0xff;

    count--;
    offset += 2;
  }

  return new TextDecoder('shift-jis').decode(bytes);
}

function decodeNumericSegment(source: BitSource, count: number): string {
  let content = '';

  // Read three digits at a time.
  while (count >= 3) {
    // Each 10 bits encodes three digits.
    if (source.available() < 10) {
      throw new Error('illegal bits length');
    }

    const threeDigitsBits = source.read(10);

    if (threeDigitsBits >= 1000) {
      throw new Error('illegal numeric codeword');
    }

    content += NUMERIC_CHARACTERS.charAt(threeDigitsBits / 100);
    content += NUMERIC_CHARACTERS.charAt((threeDigitsBits / 10) % 10);
    content += NUMERIC_CHARACTERS.charAt(threeDigitsBits % 10);

    count -= 3;
  }

  if (count === 2) {
    // Two digits left over to read, encoded in 7 bits.
    if (source.available() < 7) {
      throw new Error('illegal bits length');
    }

    const twoDigitsBits = source.read(7);

    if (twoDigitsBits >= 100) {
      throw new Error('illegal numeric codeword');
    }

    content += NUMERIC_CHARACTERS.charAt(twoDigitsBits / 10);
    content += NUMERIC_CHARACTERS.charAt(twoDigitsBits % 10);
  } else if (count === 1) {
    // One digit left over to read.
    if (source.available() < 4) {
      throw new Error('illegal bits length');
    }

    const digitBits = source.read(4);

    if (digitBits >= 10) {
      throw new Error('illegal numeric codeword');
    }

    content += NUMERIC_CHARACTERS.charAt(digitBits);
  }

  return content;
}

export function decode(codewords: Uint8Array, version: Version, decode: TextDecode): DecodeSource {
  let content = '';
  let indicator = -1;
  let modifier: number;
  let hasFNC1First = false;
  let hasFNC1Second = false;
  let mode: Mode | undefined;
  let fnc1: FNC1 | false = false;
  let currentECIValue: number | undefined;
  let structured: Structured | false = false;

  const source = new BitSource(codewords);

  do {
    // While still another segment to read...
    if (source.available() < 4) {
      // OK, assume we're done. Really, a TERMINATOR mode should have been recorded here.
      mode = Mode.TERMINATOR;
    } else {
      mode = fromModeBits(source.read(4));
    }

    switch (mode) {
      case Mode.TERMINATOR:
        break;
      case Mode.FNC1_FIRST_POSITION:
        hasFNC1First = true;
        break;
      case Mode.FNC1_SECOND_POSITION:
        hasFNC1Second = true;
        indicator = source.read(8);
        break;
      case Mode.STRUCTURED_APPEND:
        if (source.available() < 16) {
          throw new Error('illegal structured append');
        }

        structured = Object.freeze<Structured>({
          index: source.read(4),
          count: source.read(4) + 1,
          parity: source.read(8)
        });
        break;
      case Mode.ECI:
        currentECIValue = parseECIValue(source);
        break;
      default:
        if (mode === Mode.HANZI) {
          const subset = source.read(4);

          if (subset !== 1) {
            throw new Error('illegal hanzi subset');
          }
        }

        const count = source.read(mode.getCharacterCountBits(version));

        switch (mode) {
          case Mode.ALPHANUMERIC:
            content += decodeAlphanumericSegment(source, count, hasFNC1First || hasFNC1Second);
            break;
          case Mode.BYTE:
            content += decodeByteSegment(source, count, decode, hasFNC1First || hasFNC1Second, currentECIValue);
            break;
          case Mode.HANZI:
            content += decodeHanziSegment(source, count);
            break;
          case Mode.KANJI:
            content += decodeKanjiSegment(source, count);
            break;
          case Mode.NUMERIC:
            content += decodeNumericSegment(source, count);
            break;
          default:
            throw new Error('illegal mode');
        }
    }
  } while (mode !== Mode.TERMINATOR);

  if (hasFNC1First) {
    fnc1 = Object.freeze<FNC1>(['GS1']);
  } else if (hasFNC1Second) {
    fnc1 = Object.freeze<FNC1>(['AIM', indicator]);
  }

  if (currentECIValue != null) {
    if (hasFNC1First) {
      modifier = 4;
    } else if (hasFNC1Second) {
      modifier = 6;
    } else {
      modifier = 2;
    }
  } else {
    if (hasFNC1First) {
      modifier = 3;
    } else if (hasFNC1Second) {
      modifier = 5;
    } else {
      modifier = 1;
    }
  }

  return { content, codewords, structured, symbology: `]Q${modifier}`, fnc1 };
}
