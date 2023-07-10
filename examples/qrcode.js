/**
 * @module QRCode
 * @package @nuintun/qrcode
 * @license MIT
 * @version 3.3.5
 * @author nuintun <nuintun@qq.com>
 * @description A pure JavaScript QRCode encode and decode library.
 * @see https://github.com/nuintun/qrcode#readme
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define('qrcode', ['exports'], factory)
    : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self), factory((global.QRCode = {})));
})(this, function (exports) {
  'use strict';

  /**
   * @module Charset
   */
  const VALUES_TO_CHARSET = new Map();
  function fromCharsetValue(value) {
    const charset = VALUES_TO_CHARSET.get(value);
    if (charset) {
      return charset;
    }
    throw Error('illegal charset value');
  }
  class Charset {
    #label;
    #values;
    static CP437 = new Charset('cp437', 0, 2);
    static ISO_8859_1 = new Charset('iso-8859-1', 1, 3);
    static ISO_8859_2 = new Charset('iso-8859-2', 4);
    static ISO_8859_3 = new Charset('iso-8859-3', 5);
    static ISO_8859_4 = new Charset('iso-8859-4', 6);
    static ISO_8859_5 = new Charset('iso-8859-5', 7);
    static ISO_8859_6 = new Charset('iso-8859-6', 8);
    static ISO_8859_7 = new Charset('iso-8859-7', 9);
    static ISO_8859_8 = new Charset('iso-8859-8', 10);
    static ISO_8859_9 = new Charset('iso-8859-9', 11);
    static ISO_8859_10 = new Charset('iso-8859-10', 12);
    static ISO_8859_11 = new Charset('iso-8859-11', 13);
    static ISO_8859_13 = new Charset('iso-8859-13', 15);
    static ISO_8859_14 = new Charset('iso-8859-14', 16);
    static ISO_8859_15 = new Charset('iso-8859-15', 17);
    static ISO_8859_16 = new Charset('iso-8859-16', 18);
    static SJIS = new Charset('sjis', 20);
    static CP1250 = new Charset('cp1250', 21);
    static CP1251 = new Charset('cp1251', 22);
    static CP1252 = new Charset('cp1252', 23);
    static CP1256 = new Charset('cp1256', 24);
    static UTF_16BE = new Charset('utf-16be', 25);
    static UTF_8 = new Charset('utf-8', 26);
    static ASCII = new Charset('ascii', 27, 170);
    static BIG5 = new Charset('big5', 28);
    static GB18030 = new Charset('gb18030', 29);
    static EUC_KR = new Charset('euc-kr', 30);
    constructor(label, ...values) {
      this.#label = label;
      this.#values = values;
      for (const value of values) {
        VALUES_TO_CHARSET.set(value, this);
      }
    }
    get label() {
      return this.#label;
    }
    get values() {
      return this.#values;
    }
  }

  /**
   * @module QRCode
   */
  let QRCode$1 = class QRCode {
    #mask;
    #level;
    #mirror;
    #version;
    #metadata;
    constructor(metadata, version, { mask, level }, mirror) {
      this.#mask = mask;
      this.#level = level;
      this.#mirror = mirror;
      this.#version = version;
      this.#metadata = metadata;
    }
    /**
     * @property mask
     * @description Get the mask of qrcode
     */
    get mask() {
      return this.#mask;
    }
    /**
     * @property level
     * @description Get the error correction level of qrcode
     */
    get level() {
      return this.#level.name;
    }
    /**
     * @property version
     * @description Get the version of qrcode
     */
    get version() {
      return this.#version.version;
    }
    /**
     * @property mirror
     * @description Get the mirror of qrcode
     */
    get mirror() {
      return this.#mirror;
    }
    /**
     * @property content
     * @description Get the content of qrcode
     */
    get content() {
      return this.#metadata.content;
    }
    /**
     * @property symbology
     * @description Get the symbology of qrcode
     */
    get symbology() {
      return this.#metadata.symbology;
    }
    /**
     * @property fnc1
     * @description Get the fnc1 of qrcode
     */
    get fnc1() {
      return this.#metadata.fnc1;
    }
    /**
     * @property codewords
     * @description Get the codewords of qrcode
     */
    get codewords() {
      return this.#metadata.codewords;
    }
    /**
     * @property structured
     * @description Get the structured of qrcode
     */
    get structured() {
      return this.#metadata.structured;
    }
  };

  /**
   * @module BitSource
   */
  class BitSource {
    #bytes;
    #bitOffset;
    #byteOffset;
    constructor(bytes) {
      this.#bytes = bytes;
      this.#bitOffset = 0;
      this.#byteOffset = 0;
    }
    get bitOffset() {
      return this.#bitOffset;
    }
    get byteOffset() {
      return this.#byteOffset;
    }
    read(length) {
      let result = 0;
      let bitOffset = this.#bitOffset;
      let byteOffset = this.#byteOffset;
      const bytes = this.#bytes;
      // First, read remainder from current byte
      if (bitOffset > 0) {
        const bitsLeft = 8 - bitOffset;
        const toRead = Math.min(length, bitsLeft);
        const bitsToNotRead = bitsLeft - toRead;
        const mask = (0xff >> (8 - toRead)) << bitsToNotRead;
        length -= toRead;
        bitOffset += toRead;
        result = (bytes[byteOffset] & mask) >> bitsToNotRead;
        if (bitOffset === 8) {
          byteOffset++;
          bitOffset = 0;
        }
      }
      // Next read whole bytes
      if (length > 0) {
        while (length >= 8) {
          length -= 8;
          result = (result << 8) | (bytes[byteOffset++] & 0xff);
        }
        // Finally read a partial byte
        if (length > 0) {
          const bitsToNotRead = 8 - length;
          const mask = (0xff >> bitsToNotRead) << bitsToNotRead;
          bitOffset += length;
          result = (result << length) | ((bytes[byteOffset] & mask) >> bitsToNotRead);
        }
      }
      this.#bitOffset = bitOffset;
      this.#byteOffset = byteOffset;
      return result;
    }
    available() {
      return 8 * (this.#bytes.length - this.#byteOffset) - this.#bitOffset;
    }
  }

  /**
   * @module Mode
   */
  const VALUES_TO_MODE = new Map();
  function fromModeBits(bits) {
    const mode = VALUES_TO_MODE.get(bits);
    if (mode != null) {
      return mode;
    }
    throw new Error('illegal mode bits');
  }
  class Mode {
    #bits;
    #characterCountBitsSet;
    static TERMINATOR = new Mode([0, 0, 0], 0x00);
    static NUMERIC = new Mode([10, 12, 14], 0x01);
    static ALPHANUMERIC = new Mode([9, 11, 13], 0x02);
    static STRUCTURED_APPEND = new Mode([0, 0, 0], 0x03);
    static BYTE = new Mode([8, 16, 16], 0x04);
    static ECI = new Mode([0, 0, 0], 0x07);
    static KANJI = new Mode([8, 10, 12], 0x08);
    static FNC1_FIRST_POSITION = new Mode([0, 0, 0], 0x05);
    static FNC1_SECOND_POSITION = new Mode([0, 0, 0], 0x09);
    static HANZI = new Mode([8, 10, 12], 0x0d);
    constructor(characterCountBitsSet, bits) {
      this.#bits = bits;
      this.#characterCountBitsSet = new Int32Array(characterCountBitsSet);
      VALUES_TO_MODE.set(bits, this);
    }
    get bits() {
      return this.#bits;
    }
    getCharacterCountBits({ version }) {
      let offset;
      if (version <= 9) {
        offset = 0;
      } else if (version <= 26) {
        offset = 1;
      } else {
        offset = 2;
      }
      return this.#characterCountBitsSet[offset];
    }
  }

  /**
   * @module encoding
   */
  function getCharCodes(content, maxCode) {
    const bytes = [];
    for (const character of content) {
      const code = character.charCodeAt(0);
      // If gt max code, push ?
      bytes.push(code > maxCode ? 63 : code);
    }
    return new Uint8Array(bytes);
  }
  function encode$1(content, charset) {
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
  function decode$1(bytes, charset) {
    return new TextDecoder(charset.label).decode(bytes);
  }
  const NUMERIC_CHARACTERS = '0123456789';
  const ALPHANUMERIC_CHARACTERS = `${NUMERIC_CHARACTERS}ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:`;
  function getCharactersMapping(characters) {
    let code = 0;
    const mapping = new Map();
    for (const character of characters) {
      mapping.set(character, code++);
    }
    return mapping;
  }
  function getEncodingMapping(label, ...ranges) {
    const bytes = [];
    const codes = [];
    const mapping = new Map();
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
  function getSerialRanges(start, end, offsets, delta = 256) {
    const count = offsets.length - 1;
    const ranges = [];
    for (let i = start; i < end; ) {
      for (let j = 0; j < count; j += 2) {
        ranges.push([i + offsets[j], i + offsets[j + 1]]);
      }
      i += delta;
    }
    return ranges;
  }

  /**
   * @module source
   */
  function parseECIValue(source) {
    const firstByte = source.read(8);
    if ((firstByte & 0x80) == 0) {
      // just one byte
      return firstByte & 0x7f;
    }
    if ((firstByte & 0xc0) == 0x80) {
      // two bytes
      const secondByte = source.read(8);
      return ((firstByte & 0x3f) << 8) | secondByte;
    }
    if ((firstByte & 0xe0) == 0xc0) {
      // three bytes
      const secondThirdBytes = source.read(16);
      return ((firstByte & 0x1f) << 16) | secondThirdBytes;
    }
    throw new Error('');
  }
  const GS = String.fromCharCode(0x1d);
  function processGSCharacter(content) {
    return content.replace(/%+/g, match => {
      const isOdd = match.length & 0x01;
      match = match.replace(/%%/g, '%');
      return isOdd ? match.replace(/%$/, GS) : match;
    });
  }
  function decodeAlphanumericSegment(source, count, fnc1) {
    let content = '';
    while (count > 1) {
      if (source.available() < 11) {
        throw new Error('');
      }
      const nextTwoCharsBits = source.read(11);
      content += ALPHANUMERIC_CHARACTERS.charAt(nextTwoCharsBits / 45);
      content += ALPHANUMERIC_CHARACTERS.charAt(nextTwoCharsBits % 45);
      count -= 2;
    }
    if (count == 1) {
      // special case: one character left
      if (source.available() < 6) {
        throw new Error('');
      }
      content += ALPHANUMERIC_CHARACTERS.charAt(source.read(6));
    }
    return fnc1 ? processGSCharacter(content) : content;
  }
  function decodeByteSegment(source, count, decode, fnc1, eciValue) {
    // Don't crash trying to read more bits than we have available.
    if (source.available() < 8 * count) {
      throw new Error('');
    }
    const bytes = new Uint8Array(count);
    const charset = eciValue != null ? fromCharsetValue(eciValue) : Charset.ISO_8859_1;
    for (let i = 0; i < count; i++) {
      bytes[i] = source.read(8);
    }
    const content = decode(bytes, charset);
    return fnc1 ? processGSCharacter(content) : content;
  }
  function decodeHanziSegment(source, count) {
    if (source.available() < 13 * count) {
      throw new Error('');
    }
    let offset = 0;
    const bytes = new Uint8Array(2 * count);
    while (count > 0) {
      const twoBytes = source.read(13);
      let assembledTwoBytes = ((twoBytes / 0x060) << 8) | twoBytes % 0x060;
      if (assembledTwoBytes < 0x00a00) {
        // In the 0xA1A1 to 0xAAFE range
        assembledTwoBytes += 0x0a1a1;
      } else {
        // In the 0xB0A1 to 0xFAFE range
        assembledTwoBytes += 0x0a6a1;
      }
      bytes[offset] = (assembledTwoBytes >> 8) & 0xff;
      bytes[offset + 1] = assembledTwoBytes & 0xff;
      count--;
      offset += 2;
    }
    return new TextDecoder('gb2312').decode(bytes);
  }
  function decodeKanjiSegment(source, count) {
    if (source.available() < 13 * count) {
      throw new Error('');
    }
    let offset = 0;
    const bytes = new Uint8Array(2 * count);
    while (count > 0) {
      const twoBytes = source.read(13);
      let assembledTwoBytes = ((twoBytes / 0x0c0) << 8) | twoBytes % 0x0c0;
      if (assembledTwoBytes < 0x01f00) {
        // In the 0x8140 to 0x9FFC range
        assembledTwoBytes += 0x08140;
      } else {
        // In the 0xE040 to 0xEBBF range
        assembledTwoBytes += 0x0c140;
      }
      bytes[offset] = (assembledTwoBytes >> 8) & 0xff;
      bytes[offset + 1] = assembledTwoBytes & 0xff;
      count--;
      offset += 2;
    }
    return new TextDecoder('shift-jis').decode(bytes);
  }
  function decodeNumericSegment(source, count) {
    let content = '';
    // Read three digits at a time
    while (count >= 3) {
      // Each 10 bits encodes three digits
      if (source.available() < 10) {
        throw new Error('');
      }
      const threeDigitsBits = source.read(10);
      if (threeDigitsBits >= 1000) {
        throw new Error('');
      }
      content += NUMERIC_CHARACTERS.charAt(threeDigitsBits / 100);
      content += NUMERIC_CHARACTERS.charAt((threeDigitsBits / 10) % 10);
      content += NUMERIC_CHARACTERS.charAt(threeDigitsBits % 10);
      count -= 3;
    }
    if (count === 2) {
      // Two digits left over to read, encoded in 7 bits
      if (source.available() < 7) {
        throw new Error('illegal numeric');
      }
      const twoDigitsBits = source.read(7);
      if (twoDigitsBits >= 100) {
        throw new Error('illegal numeric codeword');
      }
      content += NUMERIC_CHARACTERS.charAt(twoDigitsBits / 10);
      content += NUMERIC_CHARACTERS.charAt(twoDigitsBits % 10);
    } else if (count === 1) {
      // One digit left over to read
      if (source.available() < 4) {
        throw new Error('illegal numeric');
      }
      const digitBits = source.read(4);
      if (digitBits >= 10) {
        throw new Error('illegal numeric codeword');
      }
      content += NUMERIC_CHARACTERS.charAt(digitBits);
    }
    return content;
  }
  function decode(codewords, version, {}, decode) {
    let content = '';
    let indicator = -1;
    let modifier;
    let hasFNC1First = false;
    let hasFNC1Second = false;
    let mode;
    let fnc1 = false;
    let currentECIValue;
    let structured = false;
    const source = new BitSource(codewords);
    do {
      // While still another segment to read...
      if (source.available() < 4) {
        // OK, assume we're done. Really, a TERMINATOR mode should have been recorded here
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
          structured = {
            index: source.read(4),
            count: source.read(4) + 1,
            parity: source.read(8)
          };
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
              throw new Error('');
          }
      }
    } while (mode !== Mode.TERMINATOR);
    if (hasFNC1First) {
      fnc1 = ['GS1'];
    } else if (hasFNC1Second) {
      fnc1 = ['AIM', indicator];
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

  /**
   * @module utils
   */
  function toInt32(value) {
    return value | 0;
  }
  function round(value) {
    return toInt32(value + (value < 0 ? -0.5 : 0.5));
  }
  function sumArray(array) {
    let total = 0;
    for (const value of array) {
      total += value;
    }
    return total;
  }
  // Get bit count of int32
  function bitCount(value) {
    // HD, Figure 5-2
    value = value - ((value >>> 1) & 0x55555555);
    value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
    value = (value + (value >>> 4)) & 0x0f0f0f0f;
    value = value + (value >>> 8);
    value = value + (value >>> 16);
    return value & 0x3f;
  }
  // Return the position of the most significant bit set (to one) in the "value". The most
  // significant bit is position 32. If there is no bit set, return 0. Examples:
  // - findMSBSet(0) => 0
  // - findMSBSet(1) => 1
  // - findMSBSet(255) => 8
  function findMSBSet(value) {
    return 32 - Math.clz32(value);
  }
  // Calculate BCH (Bose-Chaudhuri-Hocquenghem) code for "value" using polynomial "poly". The BCH
  // code is used for encoding type information and version information.
  // Example: Calculation of version information of 7.
  // f(x) is created from 7.
  //   - 7 = 000111 in 6 bits
  //   - f(x) = x^2 + x^1 + x^0
  // g(x) is given by the standard (p. 67)
  //   - g(x) = x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1
  // Multiply f(x) by x^(18 - 6)
  //   - f'(x) = f(x) * x^(18 - 6)
  //   - f'(x) = x^14 + x^13 + x^12
  // Calculate the remainder of f'(x) / g(x)
  //         x^2
  //         __________________________________________________
  //   g(x) )x^14 + x^13 + x^12
  //         x^14 + x^13 + x^12 + x^11 + x^10 + x^7 + x^4 + x^2
  //         --------------------------------------------------
  //                              x^11 + x^10 + x^7 + x^4 + x^2
  //
  // The remainder is x^11 + x^10 + x^7 + x^4 + x^2
  // Encode it in binary: 110010010100
  // The return value is 0xc94 (1100 1001 0100)
  //
  // Since all coefficients in the polynomials are 1 or 0, we can do the calculation by bit
  // operations. We don't care if coefficients are positive or negative.
  function calculateBCHCode(value, poly) {
    // If poly is "1 1111 0010 0101" (version info poly), msbSetInPoly is 13. We'll subtract 1
    // from 13 to make it 12.
    const msbSetInPoly = findMSBSet(poly);
    value <<= msbSetInPoly - 1;
    // Do the division business using exclusive-or operations.
    while (findMSBSet(value) >= msbSetInPoly) {
      value ^= poly << (findMSBSet(value) - msbSetInPoly);
    }
    // Now the "value" is the remainder (i.e. the BCH code)
    return value;
  }

  /**
   * @module mask
   */
  // Penalty weights from section 6.8.2.1
  const N1 = 3;
  const N2 = 3;
  const N3 = 40;
  const N4 = 10;
  // Is dark point.
  function isDark(matrix, x, y) {
    return matrix.get(x, y) === 1;
  }
  // Helper function for applyMaskPenaltyRule1. We need this for doing this calculation in both
  // horizontal and vertical orders respectively.
  function applyMaskPenaltyRule1Internal(matrix, isVertical) {
    let penalty = 0;
    const { size } = matrix;
    for (let y = 0; y < size; y++) {
      let prevBit = -1;
      let numSameBitCells = 0;
      for (let x = 0; x < size; x++) {
        const bit = isVertical ? matrix.get(y, x) : matrix.get(x, y);
        if (bit === prevBit) {
          numSameBitCells++;
        } else {
          if (numSameBitCells >= 5) {
            penalty += N1 + (numSameBitCells - 5);
          }
          // set prev bit
          prevBit = bit;
          // include the cell itself
          numSameBitCells = 1;
        }
      }
      if (numSameBitCells >= 5) {
        penalty += N1 + (numSameBitCells - 5);
      }
    }
    return penalty;
  }
  // Apply mask penalty rule 1 and return the penalty. Find repetitive cells with the same color and
  // give penalty to them. Example: 00000 or 11111.
  function applyMaskPenaltyRule1(matrix) {
    return applyMaskPenaltyRule1Internal(matrix) + applyMaskPenaltyRule1Internal(matrix, true);
  }
  // Apply mask penalty rule 2 and return the penalty. Find 2x2 blocks with the same color and give
  // penalty to them. This is actually equivalent to the spec's rule, which is to find MxN blocks and give a
  // penalty proportional to (M-1)x(N-1), because this is the number of 2x2 blocks inside such a block.
  function applyMaskPenaltyRule2(matrix) {
    let penalty = 0;
    const size = matrix.size - 1;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const bit = matrix.get(x, y);
        if (
          // Find 2x2 blocks with the same color
          bit === matrix.get(x + 1, y) &&
          bit === matrix.get(x, y + 1) &&
          bit === matrix.get(x + 1, y + 1)
        ) {
          penalty += N2;
        }
      }
    }
    return penalty;
  }
  // Is is four white, check on horizontal and vertical.
  function isFourWhite(matrix, offset, from, to, isVertical) {
    if (from < 0 || to > matrix.size) {
      return false;
    }
    for (let i = from; i < to; i++) {
      if (isVertical ? isDark(matrix, offset, i) : isDark(matrix, i, offset)) {
        return false;
      }
    }
    return true;
  }
  // Apply mask penalty rule 3 and return the penalty. Find consecutive runs of 1:1:3:1:1:4
  // starting with black, or 4:1:1:3:1:1 starting with white, and give penalty to them. If we
  // find patterns like 000010111010000, we give penalty once.
  function applyMaskPenaltyRule3(matrix) {
    let numPenalties = 0;
    const { size } = matrix;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (
          // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000
          x + 6 < size &&
          isDark(matrix, x, y) &&
          !isDark(matrix, x + 1, y) &&
          isDark(matrix, x + 2, y) &&
          isDark(matrix, x + 3, y) &&
          isDark(matrix, x + 4, y) &&
          !isDark(matrix, x + 5, y) &&
          isDark(matrix, x + 6, y) &&
          (isFourWhite(matrix, y, x - 4, x) || isFourWhite(matrix, y, x + 7, x + 11))
        ) {
          numPenalties++;
        }
        if (
          // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000
          y + 6 < size &&
          isDark(matrix, x, y) &&
          !isDark(matrix, x, y + 1) &&
          isDark(matrix, x, y + 2) &&
          isDark(matrix, x, y + 3) &&
          isDark(matrix, x, y + 4) &&
          !isDark(matrix, x, y + 5) &&
          isDark(matrix, x, y + 6) &&
          (isFourWhite(matrix, x, y - 4, y, true) || isFourWhite(matrix, x, y + 7, y + 11, true))
        ) {
          numPenalties++;
        }
      }
    }
    return numPenalties * N3;
  }
  // Apply mask penalty rule 4 and return the penalty. Calculate the ratio of dark cells and give
  // penalty if the ratio is far from 50%. It gives 10 penalty for 5% distance.
  function applyMaskPenaltyRule4(matrix) {
    let numDarkCells = 0;
    const { size } = matrix;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (isDark(matrix, x, y)) {
          numDarkCells++;
        }
      }
    }
    const numTotalCells = size * size;
    const fivePercentVariances = toInt32((Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells);
    return fivePercentVariances * N4;
  }
  // The mask penalty calculation is complicated.  See Table 21 of JISX0510:2004 (p.45) for details.
  // Basically it applies four rules and summate all penalties.
  function calculateMaskPenalty(matrix) {
    return (
      applyMaskPenaltyRule1(matrix) +
      applyMaskPenaltyRule2(matrix) +
      applyMaskPenaltyRule3(matrix) +
      applyMaskPenaltyRule4(matrix)
    );
  }
  // Return is apply mask at "x" and "y". See 8.8 of JISX0510:2004 for mask pattern conditions.
  function isApplyMask(mask, x, y) {
    let temporary;
    let intermediate;
    switch (mask) {
      case 0:
        intermediate = (y + x) & 0x01;
        break;
      case 1:
        intermediate = y & 0x01;
        break;
      case 2:
        intermediate = x % 3;
        break;
      case 3:
        intermediate = (y + x) % 3;
        break;
      case 4:
        intermediate = (toInt32(y / 2) + toInt32(x / 3)) & 0x01;
        break;
      case 5:
        temporary = y * x;
        intermediate = (temporary & 0x01) + (temporary % 3);
        break;
      case 6:
        temporary = y * x;
        intermediate = ((temporary & 0x01) + (temporary % 3)) & 0x01;
        break;
      case 7:
        intermediate = (((y * x) % 3) + ((y + x) & 0x01)) & 0x01;
        break;
      default:
        throw new Error(`illegal mask: ${mask}`);
    }
    return intermediate === 0;
  }

  /**
   * @module ECLevel
   */
  const VALUES_TO_ECLEVEL = new Map();
  function fromECLevelBits(bits) {
    const ecLevel = VALUES_TO_ECLEVEL.get(bits);
    if (ecLevel != null) {
      return ecLevel;
    }
    throw new Error('illegal error correction bits');
  }
  class ECLevel {
    #name;
    #bits;
    #level;
    // L = ~7% correction
    static L = new ECLevel('L', 0, 0x01);
    // L = ~15% correction
    static M = new ECLevel('M', 1, 0x00);
    // L = ~25% correction
    static Q = new ECLevel('Q', 2, 0x03);
    // L = ~30% correction
    static H = new ECLevel('H', 3, 0x02);
    constructor(name, level, bits) {
      this.#bits = bits;
      this.#name = name;
      this.#level = level;
      VALUES_TO_ECLEVEL.set(bits, this);
    }
    get bits() {
      return this.#bits;
    }
    get name() {
      return this.#name;
    }
    get level() {
      return this.#level;
    }
  }

  /**
   * @module FormatInfo
   */
  const FORMAT_INFO_DECODE_TABLE = [
    [0x5412, 0x00],
    [0x5125, 0x01],
    [0x5e7c, 0x02],
    [0x5b4b, 0x03],
    [0x45f9, 0x04],
    [0x40ce, 0x05],
    [0x4f97, 0x06],
    [0x4aa0, 0x07],
    [0x77c4, 0x08],
    [0x72f3, 0x09],
    [0x7daa, 0x0a],
    [0x789d, 0x0b],
    [0x662f, 0x0c],
    [0x6318, 0x0d],
    [0x6c41, 0x0e],
    [0x6976, 0x0f],
    [0x1689, 0x10],
    [0x13be, 0x11],
    [0x1ce7, 0x12],
    [0x19d0, 0x13],
    [0x0762, 0x14],
    [0x0255, 0x15],
    [0x0d0c, 0x16],
    [0x083b, 0x17],
    [0x355f, 0x18],
    [0x3068, 0x19],
    [0x3f31, 0x1a],
    [0x3a06, 0x1b],
    [0x24b4, 0x1c],
    [0x2183, 0x1d],
    [0x2eda, 0x1e],
    [0x2bed, 0x1f]
  ];
  class FormatInfo {
    #mask;
    #level;
    constructor(formatInfo) {
      this.#mask = formatInfo & 0x07;
      this.#level = fromECLevelBits((formatInfo >> 3) & 0x03);
    }
    get mask() {
      return this.#mask;
    }
    get level() {
      return this.#level;
    }
  }
  function decodeFormatInfo(formatInfo1, formatInfo2) {
    // Find the int in FORMAT_INFO_DECODE_TABLE with fewest bits differing
    let bestDiff = 32;
    let bestFormatInfo = 0;
    for (const [maskedFormatInfo, formatInfo] of FORMAT_INFO_DECODE_TABLE) {
      if (formatInfo1 === maskedFormatInfo || formatInfo2 === maskedFormatInfo) {
        // Found an exact match
        return new FormatInfo(formatInfo);
      }
      let bitsDiff = bitCount(formatInfo1 ^ maskedFormatInfo);
      if (bitsDiff < bestDiff) {
        bestDiff = bitsDiff;
        bestFormatInfo = formatInfo;
      }
      if (formatInfo1 !== formatInfo2) {
        // Also try the other option
        bitsDiff = bitCount(formatInfo2 ^ maskedFormatInfo);
        if (bitsDiff < bestDiff) {
          bestDiff = bitsDiff;
          bestFormatInfo = formatInfo;
        }
      }
    }
    // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits differing means we found a match
    if (bestDiff <= 3) {
      return new FormatInfo(bestFormatInfo);
    }
    throw new Error('unable to decode format information');
  }

  /**
   * @module ECB
   */
  class ECB {
    #count;
    #numDataCodewords;
    constructor(count, numDataCodewords) {
      this.#count = count;
      this.#numDataCodewords = numDataCodewords;
    }
    get count() {
      return this.#count;
    }
    get numDataCodewords() {
      return this.#numDataCodewords;
    }
  }

  /**
   * @module ECBlocks
   */
  class ECBlocks {
    #ecBlocks;
    #numTotalCodewords;
    #numTotalECCodewords;
    #numTotalDataCodewords;
    #numECCodewordsPerBlock;
    constructor(numECCodewordsPerBlock, ...ecBlocks) {
      let numBlocks = 0;
      let numTotalDataCodewords = 0;
      for (const { count, numDataCodewords } of ecBlocks) {
        numBlocks += count;
        numTotalDataCodewords += numDataCodewords * count;
      }
      const numTotalECCodewords = numECCodewordsPerBlock * numBlocks;
      this.#ecBlocks = ecBlocks;
      this.#numTotalECCodewords = numTotalECCodewords;
      this.#numTotalDataCodewords = numTotalDataCodewords;
      this.#numECCodewordsPerBlock = numECCodewordsPerBlock;
      this.#numTotalCodewords = numTotalDataCodewords + numTotalECCodewords;
    }
    get ecBlocks() {
      return this.#ecBlocks;
    }
    get numTotalCodewords() {
      return this.#numTotalCodewords;
    }
    get numTotalECCodewords() {
      return this.#numTotalECCodewords;
    }
    get numTotalDataCodewords() {
      return this.#numTotalDataCodewords;
    }
    get numECCodewordsPerBlock() {
      return this.#numECCodewordsPerBlock;
    }
  }

  /**
   * @module BitMatrix
   */
  class BitMatrix {
    #width;
    #height;
    #rowSize;
    #bits;
    constructor(width, height, bits) {
      const rowSize = Math.ceil(width / 32);
      const bitsCapacity = rowSize * height;
      this.#width = width;
      this.#height = height;
      this.#rowSize = rowSize;
      if (bits instanceof Int32Array) {
        if (bits.length !== bitsCapacity) {
          throw new Error(`matrix bits capacity mismatch: ${bitsCapacity}`);
        }
        this.#bits = bits;
      } else {
        this.#bits = new Int32Array(bitsCapacity);
      }
    }
    #offset(x, y) {
      return y * this.#rowSize + toInt32(x / 32);
    }
    get width() {
      return this.#width;
    }
    get height() {
      return this.#height;
    }
    set(x, y) {
      const offset = this.#offset(x, y);
      this.#bits[offset] |= 1 << (x & 0x1f);
    }
    get(x, y) {
      const offset = this.#offset(x, y);
      return (this.#bits[offset] >>> (x & 0x1f)) & 0x01;
    }
    flip(x, y) {
      if (x != null && y != null) {
        const offset = this.#offset(x, y);
        this.#bits[offset] ^= 1 << (x & 0x1f);
      } else {
        const bits = this.#bits;
        const { length } = bits;
        for (let i = 0; i < length; i++) {
          bits[i] = ~bits[i];
        }
      }
    }
    clone() {
      return new BitMatrix(this.#width, this.#height, new Int32Array(this.#bits));
    }
    setRegion(left, top, width, height) {
      const bits = this.#bits;
      const right = left + width;
      const bottom = top + height;
      const rowSize = this.#rowSize;
      for (let y = top; y < bottom; y++) {
        const offset = y * rowSize;
        for (let x = left; x < right; x++) {
          bits[offset + toInt32(x / 32)] |= 1 << (x & 0x1f);
        }
      }
    }
  }

  /**
   * @module Version
   */
  const VERSION_DECODE_TABLE = [
    // Version 7 - 11
    0x07c94, 0x085bc, 0x09a99, 0x0a4d3, 0x0bbf6,
    // Version 12 - 16
    0x0c762, 0x0d847, 0x0e60d, 0x0f928, 0x10b78,
    // Version 17 - 21
    0x1145d, 0x12a17, 0x13532, 0x149a6, 0x15683,
    // Version 22 - 26
    0x168c9, 0x177ec, 0x18ec4, 0x191e1, 0x1afab,
    // Version 27 - 31
    0x1b08e, 0x1cc1a, 0x1d33f, 0x1ed75, 0x1f250,
    // Version 32 - 36
    0x209d5, 0x216f0, 0x228ba, 0x2379f, 0x24b0b,
    // Version 37 - 40
    0x2542e, 0x26a64, 0x27541, 0x28c69
  ];
  class Version {
    #size;
    #version;
    #ecBlocks;
    #alignmentPatterns;
    constructor(version, alignmentPatterns, ...ecBlocks) {
      this.#version = version;
      this.#ecBlocks = ecBlocks;
      this.#size = 17 + 4 * version;
      this.#alignmentPatterns = alignmentPatterns;
    }
    get size() {
      return this.#size;
    }
    get version() {
      return this.#version;
    }
    get alignmentPatterns() {
      return this.#alignmentPatterns;
    }
    getECBlocks({ level }) {
      return this.#ecBlocks[level];
    }
  }
  const VERSIONS = [
    new Version(
      1,
      [],
      new ECBlocks(7, new ECB(1, 19)),
      new ECBlocks(10, new ECB(1, 16)),
      new ECBlocks(13, new ECB(1, 13)),
      new ECBlocks(17, new ECB(1, 9))
    ),
    new Version(
      2,
      [6, 18],
      new ECBlocks(10, new ECB(1, 34)),
      new ECBlocks(16, new ECB(1, 28)),
      new ECBlocks(22, new ECB(1, 22)),
      new ECBlocks(28, new ECB(1, 16))
    ),
    new Version(
      3,
      [6, 22],
      new ECBlocks(15, new ECB(1, 55)),
      new ECBlocks(26, new ECB(1, 44)),
      new ECBlocks(18, new ECB(2, 17)),
      new ECBlocks(22, new ECB(2, 13))
    ),
    new Version(
      4,
      [6, 26],
      new ECBlocks(20, new ECB(1, 80)),
      new ECBlocks(18, new ECB(2, 32)),
      new ECBlocks(26, new ECB(2, 24)),
      new ECBlocks(16, new ECB(4, 9))
    ),
    new Version(
      5,
      [6, 30],
      new ECBlocks(26, new ECB(1, 108)),
      new ECBlocks(24, new ECB(2, 43)),
      new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)),
      new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))
    ),
    new Version(
      6,
      [6, 34],
      new ECBlocks(18, new ECB(2, 68)),
      new ECBlocks(16, new ECB(4, 27)),
      new ECBlocks(24, new ECB(4, 19)),
      new ECBlocks(28, new ECB(4, 15))
    ),
    new Version(
      7,
      [6, 22, 38],
      new ECBlocks(20, new ECB(2, 78)),
      new ECBlocks(18, new ECB(4, 31)),
      new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)),
      new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))
    ),
    new Version(
      8,
      [6, 24, 42],
      new ECBlocks(24, new ECB(2, 97)),
      new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)),
      new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)),
      new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))
    ),
    new Version(
      9,
      [6, 26, 46],
      new ECBlocks(30, new ECB(2, 116)),
      new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)),
      new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)),
      new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))
    ),
    new Version(
      10,
      [6, 28, 50],
      new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)),
      new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)),
      new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)),
      new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))
    ),
    new Version(
      11,
      [6, 30, 54],
      new ECBlocks(20, new ECB(4, 81)),
      new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)),
      new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)),
      new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))
    ),
    new Version(
      12,
      [6, 32, 58],
      new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)),
      new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)),
      new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)),
      new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))
    ),
    new Version(
      13,
      [6, 34, 62],
      new ECBlocks(26, new ECB(4, 107)),
      new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)),
      new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)),
      new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))
    ),
    new Version(
      14,
      [6, 26, 46, 66],
      new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)),
      new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)),
      new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)),
      new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))
    ),
    new Version(
      15,
      [6, 26, 48, 70],
      new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)),
      new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)),
      new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)),
      new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))
    ),
    new Version(
      16,
      [6, 26, 50, 74],
      new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)),
      new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)),
      new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)),
      new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))
    ),
    new Version(
      17,
      [6, 30, 54, 78],
      new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)),
      new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)),
      new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)),
      new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))
    ),
    new Version(
      18,
      [6, 30, 56, 82],
      new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)),
      new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)),
      new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)),
      new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))
    ),
    new Version(
      19,
      [6, 30, 58, 86],
      new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)),
      new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)),
      new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)),
      new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))
    ),
    new Version(
      20,
      [6, 34, 62, 90],
      new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)),
      new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)),
      new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)),
      new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))
    ),
    new Version(
      21,
      [6, 28, 50, 72, 94],
      new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)),
      new ECBlocks(26, new ECB(17, 42)),
      new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)),
      new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))
    ),
    new Version(
      22,
      [6, 26, 50, 74, 98],
      new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)),
      new ECBlocks(28, new ECB(17, 46)),
      new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)),
      new ECBlocks(24, new ECB(34, 13))
    ),
    new Version(
      23,
      [6, 30, 54, 78, 102],
      new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)),
      new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)),
      new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)),
      new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))
    ),
    new Version(
      24,
      [6, 28, 54, 80, 106],
      new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)),
      new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)),
      new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)),
      new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))
    ),
    new Version(
      25,
      [6, 32, 58, 84, 110],
      new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)),
      new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)),
      new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)),
      new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))
    ),
    new Version(
      26,
      [6, 30, 58, 86, 114],
      new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)),
      new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)),
      new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)),
      new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))
    ),
    new Version(
      27,
      [6, 34, 62, 90, 118],
      new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)),
      new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)),
      new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)),
      new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))
    ),
    new Version(
      28,
      [6, 26, 50, 74, 98, 122],
      new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)),
      new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)),
      new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)),
      new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))
    ),
    new Version(
      29,
      [6, 30, 54, 78, 102, 126],
      new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)),
      new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)),
      new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)),
      new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))
    ),
    new Version(
      30,
      [6, 26, 52, 78, 104, 130],
      new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)),
      new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)),
      new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)),
      new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))
    ),
    new Version(
      31,
      [6, 30, 56, 82, 108, 134],
      new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)),
      new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)),
      new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)),
      new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))
    ),
    new Version(
      32,
      [6, 34, 60, 86, 112, 138],
      new ECBlocks(30, new ECB(17, 115)),
      new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)),
      new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)),
      new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))
    ),
    new Version(
      33,
      [6, 30, 58, 86, 114, 142],
      new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)),
      new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)),
      new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)),
      new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))
    ),
    new Version(
      34,
      [6, 34, 62, 90, 118, 146],
      new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)),
      new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)),
      new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)),
      new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))
    ),
    new Version(
      35,
      [6, 30, 54, 78, 102, 126, 150],
      new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)),
      new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)),
      new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)),
      new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))
    ),
    new Version(
      36,
      [6, 24, 50, 76, 102, 128, 154],
      new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)),
      new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)),
      new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)),
      new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))
    ),
    new Version(
      37,
      [6, 28, 54, 80, 106, 132, 158],
      new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)),
      new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)),
      new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)),
      new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))
    ),
    new Version(
      38,
      [6, 32, 58, 84, 110, 136, 162],
      new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)),
      new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)),
      new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)),
      new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))
    ),
    new Version(
      39,
      [6, 26, 54, 82, 110, 138, 166],
      new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)),
      new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)),
      new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)),
      new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))
    ),
    new Version(
      40,
      [6, 30, 58, 86, 114, 142, 170],
      new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)),
      new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)),
      new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)),
      new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))
    )
  ];
  const MIN_VERSION_SIZE = VERSIONS[0].size;
  const MAX_VERSION_SIZE = VERSIONS[39].size;
  function fromVersionSize(size) {
    if ((size & 0x03) !== 1) {
      throw new Error('');
    }
    const version = VERSIONS[toInt32((size - 17) / 4) - 1];
    if (version != null) {
      return version;
    }
    throw new Error('');
  }
  function decodeVersion(version1, version2) {
    let bestDiff = 32;
    let bestVersion = 0;
    const { length } = VERSION_DECODE_TABLE;
    for (let i = 0; i < length; i++) {
      const maskedVersion = VERSION_DECODE_TABLE[i];
      // Do the version info bits match exactly done ?
      if (version1 === maskedVersion || version2 === maskedVersion) {
        return VERSIONS[i + 6];
      }
      // Otherwise see if this is the closest to a real version info bit string we have seen so far
      let bitsDiff = bitCount(version1 ^ maskedVersion);
      if (bitsDiff < bestDiff) {
        bestDiff = bitsDiff;
        bestVersion = i + 7;
      }
      if (version1 !== version2) {
        // Also try the other option
        bitsDiff = bitCount(version2 ^ maskedVersion);
        if (bitsDiff < bestDiff) {
          bestDiff = bitsDiff;
          bestVersion = i + 7;
        }
      }
    }
    // We can tolerate up to 3 bits of error since no two version info codewords will differ in less than 8 bits
    if (bestDiff <= 3 && bestVersion >= 7) {
      return VERSIONS[bestVersion - 1];
    }
    // If we didn't find a close enough match, fail
    throw new Error('unable to decode version');
  }
  // See ISO 18004:2006 Annex E
  function buildFunctionPattern({ size, version, alignmentPatterns }) {
    // Alignment patterns
    const { length } = alignmentPatterns;
    const matrix = new BitMatrix(size, size);
    const max = length - 1;
    // Top left finder pattern + separator + format
    matrix.setRegion(0, 0, 9, 9);
    // Top right finder pattern + separator + format
    matrix.setRegion(size - 8, 0, 8, 9);
    // Bottom left finder pattern + separator + format
    matrix.setRegion(0, size - 8, 9, 8);
    for (let x = 0; x < length; x++) {
      const top = alignmentPatterns[x] - 2;
      for (let y = 0; y < length; y++) {
        if ((x !== 0 || (y !== 0 && y !== max)) && (x !== max || y !== 0)) {
          matrix.setRegion(alignmentPatterns[y] - 2, top, 5, 5);
        }
        // Else no o alignment patterns near the three finder patterns
      }
    }
    // Vertical timing pattern
    matrix.setRegion(6, 9, 1, size - 17);
    // Horizontal timing pattern
    matrix.setRegion(9, 6, size - 17, 1);
    if (version > 6) {
      // Version info, top right
      matrix.setRegion(size - 11, 0, 3, 6);
      // Version info, bottom left
      matrix.setRegion(0, size - 11, 6, 3);
    }
    return matrix;
  }

  /**
   * @module BitMatrixParser
   */
  class BitMatrixParser {
    #size;
    #matrix;
    constructor(matrix) {
      const { width, height } = matrix;
      if (width !== height || width < MIN_VERSION_SIZE || width > MAX_VERSION_SIZE || (width - 17) & 0x03) {
        throw new Error('illegal qrcode size');
      }
      this.#size = width;
      this.#matrix = matrix.clone();
    }
    #copyBit(x, y, bits) {
      return this.#matrix.get(x, y) ? (bits << 1) | 0x01 : bits << 1;
    }
    readVersion() {
      const size = this.#size;
      let version = toInt32((size - 17) / 4);
      if (version >= 1 && version <= 6) {
        return VERSIONS[version - 1];
      }
      // Hmm, failed. Try bottom left: 6 wide by 3 tall
      let version1 = 0;
      let version2 = 0;
      const min = size - 11;
      for (let y = 5; y >= 0; y--) {
        for (let x = size - 9; x >= min; x--) {
          version1 = this.#copyBit(x, y, version1);
        }
      }
      for (let x = 5; x >= 0; x--) {
        for (let y = size - 9; y >= min; y--) {
          version2 = this.#copyBit(x, y, version2);
        }
      }
      return decodeVersion(version1, version2);
    }
    readFormatInfo() {
      let formatInfo1 = 0;
      let formatInfo2 = 0;
      const size = this.#size;
      const max = size - 7;
      // Read top-left format info bits
      for (let x = 0; x <= 8; x++) {
        if (x !== 6) {
          // Skip timing pattern bit
          formatInfo1 = this.#copyBit(x, 8, formatInfo1);
        }
      }
      for (let y = 7; y >= 0; y--) {
        if (y !== 6) {
          // Skip timing pattern bit
          formatInfo1 = this.#copyBit(8, y, formatInfo1);
        }
      }
      for (let y = size - 1; y >= max; y--) {
        formatInfo2 = this.#copyBit(8, y, formatInfo2);
      }
      for (let x = size - 8; x < size; x++) {
        formatInfo2 = this.#copyBit(x, 8, formatInfo2);
      }
      return decodeFormatInfo(formatInfo1, formatInfo2);
    }
    readCodewords(version, ecLevel) {
      let bitsRead = 0;
      let byteOffset = 0;
      let currentByte = 0;
      let readingUp = true;
      const size = this.#size;
      const matrix = this.#matrix;
      const ecBlocks = version.getECBlocks(ecLevel);
      const functionPattern = buildFunctionPattern(version);
      const codewords = new Uint8Array(ecBlocks.numTotalCodewords);
      // Read columns in pairs, from right to left
      for (let x = size - 1; x > 0; x -= 2) {
        if (x === 6) {
          // Skip whole column with vertical alignment pattern
          // saves time and makes the other code proceed more cleanly
          x--;
        }
        // Read alternatingly from bottom to top then top to bottom
        for (let count = 0; count < size; count++) {
          const y = readingUp ? size - 1 - count : count;
          for (let col = 0; col < 2; col++) {
            const offsetX = x - col;
            // Ignore bits covered by the function pattern
            if (!functionPattern.get(offsetX, y)) {
              // Read a bit
              bitsRead++;
              currentByte <<= 1;
              if (matrix.get(offsetX, y)) {
                currentByte |= 1;
              }
              // If we've made a whole byte, save it off
              if (bitsRead === 8) {
                codewords[byteOffset++] = currentByte;
                bitsRead = 0;
                currentByte = 0;
              }
            }
          }
        }
        // Switch directions
        readingUp = !readingUp;
      }
      // TODO 重写错误消息
      if (byteOffset !== ecBlocks.numTotalCodewords) {
        throw new Error('byteOffset !== ecBlocks.numTotalCodewords');
      }
      return codewords;
    }
    unmask(mask) {
      const size = this.#size;
      const matrix = this.#matrix;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (isApplyMask(mask, x, y)) {
            matrix.flip(x, y);
          }
        }
      }
    }
    remask(mask) {
      this.unmask(mask);
    }
    mirror() {
      const size = this.#size;
      const matrix = this.#matrix;
      for (let x = 0; x < size; x++) {
        for (let y = x + 1; y < size; y++) {
          if (matrix.get(x, y) !== matrix.get(y, x)) {
            matrix.flip(x, y);
            matrix.flip(y, x);
          }
        }
      }
    }
  }

  /**
   * @module DataBlock
   */
  class DataBlock {
    #codewords;
    #numDataCodewords;
    constructor(codewords, numDataCodewords) {
      this.#codewords = codewords;
      this.#numDataCodewords = numDataCodewords;
    }
    get codewords() {
      return this.#codewords;
    }
    get numDataCodewords() {
      return this.#numDataCodewords;
    }
  }

  /**
   * @module Polynomial
   */
  class Polynomial {
    #field;
    #coefficients;
    constructor(field, coefficients) {
      const { length } = coefficients;
      if (length <= 0) {
        throw new Error('polynomial coefficients cannot empty');
      }
      this.#field = field;
      if (length > 1 && coefficients[0] === 0) {
        // Leading term must be non-zero for anything except the constant polynomial "0"
        let firstNonZero = 1;
        while (firstNonZero < length && coefficients[firstNonZero] === 0) {
          firstNonZero++;
        }
        if (firstNonZero === length) {
          this.#coefficients = new Int32Array([0]);
        } else {
          const array = new Int32Array(length - firstNonZero);
          array.set(coefficients.subarray(firstNonZero));
          this.#coefficients = array;
        }
      } else {
        this.#coefficients = coefficients;
      }
    }
    get coefficients() {
      return this.#coefficients;
    }
    isZero() {
      return this.#coefficients[0] === 0;
    }
    getDegree() {
      return this.#coefficients.length - 1;
    }
    getCoefficient(degree) {
      const coefficients = this.#coefficients;
      return coefficients[coefficients.length - 1 - degree];
    }
    evaluate(a) {
      if (a === 0) {
        // Just return the x^0 coefficient
        return this.getCoefficient(0);
      }
      let result;
      const coefficients = this.#coefficients;
      if (a === 1) {
        // Just the sum of the coefficients
        result = 0;
        for (const coefficient of coefficients) {
          result ^= coefficient;
        }
        return result;
      }
      [result] = coefficients;
      const field = this.#field;
      const { length } = coefficients;
      for (let i = 1; i < length; i++) {
        result = field.multiply(a, result) ^ coefficients[i];
      }
      return result;
    }
    multiply(other) {
      const field = this.#field;
      const coefficients = this.#coefficients;
      const { length } = coefficients;
      if (other instanceof Polynomial) {
        if (this.isZero() || other.isZero()) {
          return field.zero;
        }
        const otherCoefficients = other.#coefficients;
        const otherLength = otherCoefficients.length;
        const product = new Int32Array(length + otherLength - 1);
        for (let i = 0; i < length; i++) {
          const coefficient = coefficients[i];
          for (let j = 0; j < otherLength; j++) {
            product[i + j] ^= field.multiply(coefficient, otherCoefficients[j]);
          }
        }
        return new Polynomial(field, product);
      }
      if (other === 0) {
        return field.zero;
      }
      if (other === 1) {
        return this;
      }
      const product = new Int32Array(length);
      for (let i = 0; i < length; i++) {
        product[i] = field.multiply(coefficients[i], other);
      }
      return new Polynomial(field, product);
    }
    multiplyByMonomial(degree, coefficient) {
      const field = this.#field;
      if (coefficient === 0) {
        return field.zero;
      }
      const coefficients = this.#coefficients;
      const { length } = coefficients;
      const product = new Int32Array(length + degree);
      for (let i = 0; i < length; i++) {
        product[i] = field.multiply(coefficients[i], coefficient);
      }
      return new Polynomial(field, product);
    }
    addOrSubtract(other) {
      if (this.isZero()) {
        return other;
      }
      if (other.isZero()) {
        return this;
      }
      let largerCoefficients = other.#coefficients;
      let largerLength = largerCoefficients.length;
      let smallerCoefficients = this.#coefficients;
      let smallerLength = smallerCoefficients.length;
      if (largerLength < smallerLength) {
        [largerLength, smallerLength] = [smallerLength, largerLength];
        [largerCoefficients, smallerCoefficients] = [smallerCoefficients, largerCoefficients];
      }
      // Diff index offset
      const offset = largerLength - smallerLength;
      const coefficients = new Int32Array(largerLength);
      // Copy high-order terms only found in higher-degree polynomial's coefficients
      coefficients.set(largerCoefficients.subarray(0, offset));
      for (let i = offset; i < largerLength; i++) {
        coefficients[i] = smallerCoefficients[i - offset] ^ largerCoefficients[i];
      }
      return new Polynomial(this.#field, coefficients);
    }
    divide(other) {
      const field = this.#field;
      let quotient = field.zero;
      let remainder = this;
      const denominatorLeadingTerm = other.getCoefficient(other.getDegree());
      const invertDenominatorLeadingTerm = field.invert(denominatorLeadingTerm);
      while (remainder.getDegree() >= other.getDegree() && !remainder.isZero()) {
        const remainderDegree = remainder.getDegree();
        const degreeDiff = remainderDegree - other.getDegree();
        const scale = field.multiply(remainder.getCoefficient(remainderDegree), invertDenominatorLeadingTerm);
        const term = other.multiplyByMonomial(degreeDiff, scale);
        const iterationQuotient = field.buildPolynomial(degreeDiff, scale);
        quotient = quotient.addOrSubtract(iterationQuotient);
        remainder = remainder.addOrSubtract(term);
      }
      return [quotient, remainder];
    }
  }

  /**
   * @module GaloisField
   */
  class GaloisField {
    #size;
    #one;
    #zero;
    #generator;
    #expTable;
    #logTable;
    constructor(primitive, size, generator) {
      let x = 1;
      const expTable = new Int32Array(size);
      for (let i = 0; i < size; i++) {
        expTable[i] = x;
        // We're assuming the generator alpha is 2
        x *= 2;
        if (x >= size) {
          x ^= primitive;
          x &= size - 1;
        }
      }
      const logTable = new Int32Array(size);
      for (let i = 0, length = size - 1; i < length; i++) {
        logTable[expTable[i]] = i;
      }
      this.#size = size;
      this.#expTable = expTable;
      this.#logTable = logTable;
      this.#generator = generator;
      this.#one = new Polynomial(this, new Int32Array([1]));
      this.#zero = new Polynomial(this, new Int32Array([0]));
    }
    get size() {
      return this.#size;
    }
    get one() {
      return this.#one;
    }
    get zero() {
      return this.#zero;
    }
    get generator() {
      return this.#generator;
    }
    exp(a) {
      return this.#expTable[a];
    }
    log(a) {
      return this.#logTable[a];
    }
    invert(a) {
      return this.#expTable[this.#size - this.#logTable[a] - 1];
    }
    multiply(a, b) {
      if (a === 0 || b === 0) {
        return 0;
      }
      const logTable = this.#logTable;
      return this.#expTable[(logTable[a] + logTable[b]) % (this.#size - 1)];
    }
    buildPolynomial(degree, coefficient) {
      if (coefficient === 0) {
        return this.#zero;
      }
      const coefficients = new Int32Array(degree + 1);
      coefficients[0] = coefficient;
      return new Polynomial(this, coefficients);
    }
  }
  const QR_CODE_FIELD_256 = new GaloisField(0x011d, 256, 0);

  /**
   * @module Decoder
   */
  let Decoder$1 = class Decoder {
    #field;
    constructor(field = QR_CODE_FIELD_256) {
      this.#field = field;
    }
    #findErrorLocations(errorLocator) {
      // This is a direct application of Chien's search
      const numErrors = errorLocator.getDegree();
      if (numErrors === 1) {
        // Shortcut
        return new Int32Array([errorLocator.getCoefficient(1)]);
      }
      let e = 0;
      const field = this.#field;
      const { size } = field;
      const result = new Int32Array(numErrors);
      for (let i = 1; i < size && e < numErrors; i++) {
        if (errorLocator.evaluate(i) === 0) {
          result[e++] = field.invert(i);
        }
      }
      if (e !== numErrors) {
        throw new Error('error locator degree does not match number of roots');
      }
      return result;
    }
    #findErrorMagnitudes(errorEvaluator, errorLocations) {
      // This is directly applying Forney's Formula
      const field = this.#field;
      const { length } = errorLocations;
      const result = new Int32Array(length);
      for (let i = 0; i < length; i++) {
        let denominator = 1;
        const invert = field.invert(errorLocations[i]);
        for (let j = 0; j < length; j++) {
          if (i !== j) {
            // denominator = field.multiply(
            //   denominator,
            //   1 ^ field.multiply(errorLocations[j], invert)
            // )
            // Above should work but fails on some Apple and Linux JDKs due to a Hotspot bug.
            // Below is a funny-looking workaround from Steven Parkes
            const term = field.multiply(errorLocations[j], invert);
            const termPlus1 = (term & 0x01) === 0 ? term | 1 : term & ~1;
            denominator = field.multiply(denominator, termPlus1);
          }
        }
        result[i] = field.multiply(errorEvaluator.evaluate(invert), field.invert(denominator));
        if (field.generator !== 0) {
          result[i] = field.multiply(result[i], invert);
        }
      }
      return result;
    }
    #runEuclideanAlgorithm(a, b, ecLength) {
      // Assume a's degree is >= b's
      if (a.getDegree() < b.getDegree()) {
        [a, b] = [b, a];
      }
      const field = this.#field;
      let remainder = b;
      let term = field.one;
      let remainderLast = a;
      let termLast = field.zero;
      // Run Euclidean algorithm until r's degree is less than ecLength/2
      while (2 * remainder.getDegree() >= ecLength) {
        let termLastLast = termLast;
        let remainderLastLast = remainderLast;
        termLast = term;
        remainderLast = remainder;
        // Divide remainder last last by remainder last, with quotient in quotient and remainder in remainder
        if (remainderLast.isZero()) {
          // Oops, euclidean algorithm already terminated ?
          throw new Error('remainder last was zero');
        }
        remainder = remainderLastLast;
        let quotient = field.zero;
        let remainderDegree = remainder.getDegree();
        const remainderLastDegree = remainderLast.getDegree();
        const denominatorLeadingTerm = remainderLast.getCoefficient(remainderLastDegree);
        const dltInverse = field.invert(denominatorLeadingTerm);
        while (remainderDegree >= remainderLastDegree && !remainder.isZero()) {
          const degreeDiff = remainder.getDegree() - remainderLastDegree;
          const scale = field.multiply(remainder.getCoefficient(remainderDegree), dltInverse);
          quotient = quotient.addOrSubtract(field.buildPolynomial(degreeDiff, scale));
          remainder = remainder.addOrSubtract(remainderLast.multiplyByMonomial(degreeDiff, scale));
          remainderDegree = remainder.getDegree();
        }
        term = quotient.multiply(termLast).addOrSubtract(termLastLast);
        if (remainderDegree >= remainderLastDegree) {
          throw new Error('division algorithm failed to reduce polynomial');
        }
      }
      const sigmaTildeAtZero = term.getCoefficient(0);
      if (sigmaTildeAtZero === 0) {
        throw new Error('sigma tilde(0) was zero');
      }
      const invert = field.invert(sigmaTildeAtZero);
      const sigma = term.multiply(invert);
      const omega = remainder.multiply(invert);
      return [sigma, omega];
    }
    decode(received, ecLength) {
      let noError = true;
      const field = this.#field;
      const { generator } = field;
      const poly = new Polynomial(field, received);
      const syndromeCoefficients = new Int32Array(ecLength);
      for (let i = 0; i < ecLength; i++) {
        const evaluate = poly.evaluate(field.exp(i + generator));
        syndromeCoefficients[ecLength - 1 - i] = evaluate;
        if (evaluate !== 0) {
          noError = false;
        }
      }
      if (!noError) {
        const syndrome = new Polynomial(field, syndromeCoefficients);
        const [sigma, omega] = this.#runEuclideanAlgorithm(field.buildPolynomial(ecLength, 1), syndrome, ecLength);
        const errorLocations = this.#findErrorLocations(sigma);
        const errorMagnitudes = this.#findErrorMagnitudes(omega, errorLocations);
        const errorLength = errorLocations.length;
        const receivedLength = received.length;
        for (let i = 0; i < errorLength; i++) {
          const position = receivedLength - 1 - field.log(errorLocations[i]);
          if (position < 0) {
            throw new Error('bad error location');
          }
          received[position] = received[position] ^ errorMagnitudes[i];
        }
        return errorLength;
      }
      return 0;
    }
  };

  /**
   * @module decoder
   */
  function correctErrors(codewords, numDataCodewords) {
    const buffer = new Int32Array(codewords);
    const numECCodewords = codewords.length - numDataCodewords;
    // Reed solomon encode.
    const errorsCorrected = new Decoder$1().decode(buffer, numECCodewords);
    return [buffer, errorsCorrected];
  }
  function getDataBlocks(codewords, version, ecLevel) {
    const { ecBlocks, numTotalCodewords, numECCodewordsPerBlock } = version.getECBlocks(ecLevel);
    if (codewords.length !== numTotalCodewords) {
      throw new Error('failed to get data blocks');
    }
    const blocks = [];
    // Now establish DataBlocks of the appropriate size and number of data codewords
    for (const { count, numDataCodewords } of ecBlocks) {
      for (let i = 0; i < count; i++) {
        const numBlockCodewords = numECCodewordsPerBlock + numDataCodewords;
        blocks.push(new DataBlock(new Uint8Array(numBlockCodewords), numDataCodewords));
      }
    }
    const { length } = blocks;
    // All blocks have the same amount of data, except that the last n
    // (where n may be 0) have 1 more byte. Figure out where these start.
    let longerBlocksStartAt = length - 1;
    const shorterBlocksTotalCodewords = blocks[0].codewords.length;
    while (longerBlocksStartAt >= 0) {
      const numCodewords = blocks[longerBlocksStartAt].codewords.length;
      if (numCodewords === shorterBlocksTotalCodewords) {
        break;
      }
      longerBlocksStartAt--;
    }
    longerBlocksStartAt++;
    // The last elements of result may be 1 element longer;
    // first fill out as many elements as all of them have
    let codewordsOffset = 0;
    const shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - numECCodewordsPerBlock;
    for (let i = 0; i < shorterBlocksNumDataCodewords; i++) {
      for (let j = 0; j < length; j++) {
        blocks[j].codewords[i] = codewords[codewordsOffset++];
      }
    }
    // Fill out the last data block in the longer ones
    for (let j = longerBlocksStartAt; j < length; j++) {
      blocks[j].codewords[shorterBlocksNumDataCodewords] = codewords[codewordsOffset++];
    }
    // Now add in error correction blocks
    const max = blocks[0].codewords.length;
    for (let i = shorterBlocksNumDataCodewords; i < max; i++) {
      for (let j = 0; j < length; j++) {
        const offset = j < longerBlocksStartAt ? i : i + 1;
        blocks[j].codewords[offset] = codewords[codewordsOffset++];
      }
    }
    return blocks;
  }

  /**
   * @module Decoder
   */
  class Decoder {
    #decode;
    constructor({ decode = decode$1 } = {}) {
      this.#decode = decode;
    }
    #parse(parser, version, { mask, level }) {
      let offset = 0;
      parser.unmask(mask);
      const ecBlocks = version.getECBlocks(level);
      const codewords = parser.readCodewords(version, level);
      const blocks = getDataBlocks(codewords, version, level);
      const buffer = new Uint8Array(ecBlocks.numTotalDataCodewords);
      for (const { codewords, numDataCodewords } of blocks) {
        const [bytes, errors] = correctErrors(codewords, numDataCodewords);
        buffer.set(bytes.subarray(0, numDataCodewords), offset);
        offset += numDataCodewords;
      }
      return buffer;
    }
    decode(matrix) {
      let mirror = false;
      let version;
      let codewords;
      let formatInfo;
      const parser = new BitMatrixParser(matrix);
      try {
        version = parser.readVersion();
        formatInfo = parser.readFormatInfo();
        codewords = this.#parse(parser, version, formatInfo);
      } catch {
        if (formatInfo != null) {
          parser.remask(formatInfo.mask);
        }
        parser.mirror();
        mirror = true;
        version = parser.readVersion();
        formatInfo = parser.readFormatInfo();
        codewords = this.#parse(parser, version, formatInfo);
      }
      return new QRCode$1(decode(codewords, version, formatInfo, this.#decode), version, formatInfo, mirror);
    }
  }

  /**
   * @module BitArray
   */
  const LOAD_FACTOR = 0.75;
  function offset(index) {
    return toInt32(index / 32);
  }
  function makeArray(length) {
    return new Int32Array(Math.ceil(length / 32));
  }
  class BitArray {
    #length;
    #bits;
    constructor(length = 0) {
      this.#length = length;
      this.#bits = makeArray(length);
    }
    #alloc(length) {
      const bits = this.#bits;
      if (length > bits.length * 32) {
        const array = makeArray(Math.ceil(length / LOAD_FACTOR));
        array.set(bits);
        this.#bits = array;
      }
      this.#length = length;
    }
    get length() {
      return this.#length;
    }
    get byteLength() {
      return Math.ceil(this.#length / 8);
    }
    set(index) {
      this.#bits[offset(index)] |= 1 << (index & 0x1f);
    }
    get(index) {
      return (this.#bits[offset(index)] >>> (index & 0x1f)) & 0x01;
    }
    xor(mask) {
      const bits = this.#bits;
      const maskBits = mask.#bits;
      const length = Math.min(this.#length, mask.#length);
      for (let i = 0; i < length; i++) {
        // The last int could be incomplete (i.e. not have 32 bits in
        // it) but there is no problem since 0 XOR 0 == 0.
        bits[i] ^= maskBits[i];
      }
    }
    append(value, length = 1) {
      let index = this.#length;
      if (value instanceof BitArray) {
        length = value.#length;
        this.#alloc(index + length);
        for (let i = 0; i < length; i++) {
          if (value.get(i)) {
            this.set(index);
          }
          index++;
        }
      } else {
        this.#alloc(index + length);
        for (let i = length - 1; i >= 0; i--) {
          if ((value >>> i) & 0x01) {
            this.set(index);
          }
          index++;
        }
      }
    }
    toUint8Array(bitOffset, array, offset, byteLength) {
      for (let i = 0; i < byteLength; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
          if (this.get(bitOffset++)) {
            byte |= 1 << (7 - j);
          }
        }
        array[offset + i] = byte;
      }
    }
    clear() {
      this.#bits.fill(0);
    }
  }

  /**
   * @module matrix
   */
  // Format information poly: 101 0011 0111
  const FORMAT_INFO_POLY = 0x537;
  // Format information mask
  const FORMAT_INFO_MASK = 0x5412;
  // Version information poly: 1 1111 0010 0101
  const VERSION_INFO_POLY = 0x1f25;
  // Format information coordinates
  const FORMAT_INFO_COORDINATES = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8]
  ];
  // Position detection pattern
  const POSITION_DETECTION_PATTERN = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ];
  // Position adjustment pattern
  const POSITION_ADJUSTMENT_PATTERN = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
  ];
  // Is empty point.
  function isEmpty(matrix, x, y) {
    return matrix.get(x, y) === -1;
  }
  function embedPositionDetectionPattern(matrix, x, y) {
    for (let i = 0; i < 7; i++) {
      const pattern = POSITION_DETECTION_PATTERN[i];
      for (let j = 0; j < 7; j++) {
        matrix.set(x + j, y + i, pattern[j]);
      }
    }
  }
  function embedHorizontalSeparationPattern(matrix, x, y) {
    for (let j = 0; j < 8; j++) {
      matrix.set(x + j, y, 0);
    }
  }
  function embedVerticalSeparationPattern(matrix, x, y) {
    for (let i = 0; i < 7; i++) {
      matrix.set(x, y + i, 0);
    }
  }
  function embedPositionAdjustmentPattern(matrix, x, y) {
    for (let i = 0; i < 5; i++) {
      const pattern = POSITION_ADJUSTMENT_PATTERN[i];
      for (let j = 0; j < 5; j++) {
        matrix.set(x + j, y + i, pattern[j]);
      }
    }
  }
  // Embed the lonely dark dot at left bottom corner. JISX0510:2004 (p.46)
  function embedDarkDotAtLeftBottomCorner(matrix) {
    matrix.set(8, matrix.size - 8, 1);
  }
  // Embed position detection patterns and surrounding vertical/horizontal separators.
  function embedPositionDetectionPatternsAndSeparators(matrix) {
    // Embed three big squares at corners.
    const pdpWidth = 7;
    // Embed horizontal separation patterns around the squares.
    const hspWidth = 8;
    // Embed vertical separation patterns around the squares.
    const vspHeight = 7;
    // Matrix width
    const { size } = matrix;
    // Left top corner.
    embedPositionDetectionPattern(matrix, 0, 0);
    // Right top corner.
    embedPositionDetectionPattern(matrix, size - pdpWidth, 0);
    // Left bottom corner.
    embedPositionDetectionPattern(matrix, 0, size - pdpWidth);
    // Left top corner.
    embedHorizontalSeparationPattern(matrix, 0, hspWidth - 1);
    // Right top corner.
    embedHorizontalSeparationPattern(matrix, size - hspWidth, hspWidth - 1);
    // Left bottom corner.
    embedHorizontalSeparationPattern(matrix, 0, size - hspWidth);
    // Left top corner.
    embedVerticalSeparationPattern(matrix, vspHeight, 0);
    // Right top corner.
    embedVerticalSeparationPattern(matrix, size - vspHeight - 1, 0);
    // Left bottom corner.
    embedVerticalSeparationPattern(matrix, vspHeight, size - vspHeight);
  }
  function embedTimingPatterns(matrix) {
    const size = matrix.size - 8;
    // -8 is for skipping position detection patterns (7: size)
    // separation patterns (1: size). Thus, 8 = 7 + 1.
    for (let x = 8; x < size; x++) {
      const bit = (x + 1) & 0x01;
      // Horizontal line.
      if (isEmpty(matrix, x, 6)) {
        matrix.set(x, 6, bit);
      }
    }
    // -8 is for skipping position detection patterns (7: size)
    // separation patterns (1: size). Thus, 8 = 7 + 1.
    for (let y = 8; y < size; y++) {
      const bit = (y + 1) & 0x01;
      // Vertical line.
      if (isEmpty(matrix, 6, y)) {
        matrix.set(6, y, bit);
      }
    }
  }
  // Embed position adjustment patterns if need be.
  function embedPositionAdjustmentPatterns(matrix, { version }) {
    if (version >= 2) {
      const { alignmentPatterns } = VERSIONS[version - 1];
      const { length } = alignmentPatterns;
      for (let i = 0; i < length; i++) {
        const y = alignmentPatterns[i];
        for (let j = 0; j < length; j++) {
          const x = alignmentPatterns[j];
          if (isEmpty(matrix, x, y)) {
            // If the cell is unset, we embed the position adjustment pattern here.
            // -2 is necessary since the x/y coordinates point to the center of the pattern, not the
            // left top corner.
            embedPositionAdjustmentPattern(matrix, x - 2, y - 2);
          }
        }
      }
    }
  }
  // Embed basic patterns. On success, modify the matrix.
  // The basic patterns are:
  // - Position detection patterns
  // - Timing patterns
  // - Dark dot at the left bottom corner
  // - Position adjustment patterns, if need be
  function embedBasicPatterns(matrix, version) {
    // Let's get started with embedding big squares at corners.
    embedPositionDetectionPatternsAndSeparators(matrix);
    // Then, embed the dark dot at the left bottom corner.
    embedDarkDotAtLeftBottomCorner(matrix);
    // Position adjustment patterns appear if version >= 2.
    embedPositionAdjustmentPatterns(matrix, version);
    // Timing patterns should be embedded after position adj. patterns.
    embedTimingPatterns(matrix);
  }
  // Make bit vector of format information. On success, store the result in "bits".
  // Encode error correction level and mask pattern. See 8.9 of
  // JISX0510:2004 (p.45) for details.
  function makeFormatInfoBits(bits, ecLevel, mask) {
    const formatInfo = (ecLevel.bits << 3) | mask;
    bits.append(formatInfo, 5);
    const bchCode = calculateBCHCode(formatInfo, FORMAT_INFO_POLY);
    bits.append(bchCode, 10);
    const maskBits = new BitArray();
    maskBits.append(FORMAT_INFO_MASK, 15);
    bits.xor(maskBits);
  }
  // Embed format information. On success, modify the matrix.
  function embedFormatInfo(matrix, ecLevel, mask) {
    const formatInfoBits = new BitArray();
    makeFormatInfoBits(formatInfoBits, ecLevel, mask);
    const { size } = matrix;
    const { length } = formatInfoBits;
    for (let i = 0; i < length; i++) {
      // Type info bits at the left top corner. See 8.9 of JISX0510:2004 (p.46).
      const [x, y] = FORMAT_INFO_COORDINATES[i];
      // Place bits in LSB to MSB order. LSB (least significant bit) is the last value in formatInfoBits.
      const bit = formatInfoBits.get(length - 1 - i);
      matrix.set(x, y, bit);
      if (i < 8) {
        // Right top corner.
        matrix.set(size - i - 1, 8, bit);
      } else {
        // Left bottom corner.
        matrix.set(8, size - 7 + (i - 8), bit);
      }
    }
  }
  // Make bit vector of version information. On success, store the result in "bits".
  // See 8.10 of JISX0510:2004 (p.45) for details.
  function makeVersionInfoBits(bits, version) {
    bits.append(version, 6);
    const bchCode = calculateBCHCode(version, VERSION_INFO_POLY);
    bits.append(bchCode, 12);
  }
  // Embed version information if need be. On success, modify the matrix.
  // See 8.10 of JISX0510:2004 (p.47) for how to embed version information.
  function embedVersionInfo(matrix, { version }) {
    if (version >= 7) {
      const versionInfoBits = new BitArray();
      makeVersionInfoBits(versionInfoBits, version);
      // It will decrease from 17 to 0.
      let bitIndex = 6 * 3 - 1;
      const { size } = matrix;
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
          // Place bits in LSB (least significant bit) to MSB order.
          const bit = versionInfoBits.get(bitIndex--);
          // Left bottom corner.
          matrix.set(i, size - 11 + j, bit);
          // Right bottom corner.
          matrix.set(size - 11 + j, i, bit);
        }
      }
    }
  }
  // Embed "dataBits" using "getMaskPattern". On success, modify the matrix.
  // See 8.7 of JISX0510:2004 (p.38) for how to embed data bits.
  function embedDataBits(matrix, dataBits, mask) {
    let bitIndex = 0;
    const { size } = matrix;
    const { length } = dataBits;
    // Start from the right bottom cell.
    for (let x = size - 1; x >= 1; x -= 2) {
      // Skip the vertical timing pattern.
      if (x === 6) {
        x = 5;
      }
      for (let y = 0; y < size; y++) {
        for (let i = 0; i < 2; i++) {
          const offsetX = x - i;
          const upward = ((x + 1) & 2) === 0;
          const offsetY = upward ? size - 1 - y : y;
          // Skip the cell if it's not empty.
          if (isEmpty(matrix, offsetX, offsetY)) {
            // Padding bit. If there is no bit left, we'll fill the left cells with 0,
            // as described in 8.4.9 of JISX0510:2004 (p. 24).
            let bit = 0;
            if (bitIndex < length) {
              bit = dataBits.get(bitIndex++);
            }
            // Is apply mask.
            if (isApplyMask(mask, offsetX, offsetY)) {
              bit ^= 1;
            }
            matrix.set(offsetX, offsetY, bit);
          }
        }
      }
    }
  }
  // Build 2D matrix of QR Code from "dataBits" with "ecLevel", "version" and "getMaskPattern". On
  // success, store the result in "matrix".
  function buildMatrix(matrix, dataBits, version, ecLevel, mask) {
    // Clear matrix
    matrix.clear(-1);
    // Embed basic patterns
    embedBasicPatterns(matrix, version);
    // Type information appear with any version.
    embedFormatInfo(matrix, ecLevel, mask);
    // Version info appear if version >= 7.
    embedVersionInfo(matrix, version);
    // Data should be embedded at end.
    embedDataBits(matrix, dataBits, mask);
  }

  /**
   * @module BlockPair
   */
  class BlockPair {
    #ecCodewords;
    #dataCodewords;
    constructor(dataCodewords, ecCodewords) {
      this.#ecCodewords = ecCodewords;
      this.#dataCodewords = dataCodewords;
    }
    get ecCodewords() {
      return this.#ecCodewords;
    }
    get dataCodewords() {
      return this.#dataCodewords;
    }
  }

  /**
   * @module Encoder
   */
  let Encoder$1 = class Encoder {
    #field;
    #generators;
    constructor(field = QR_CODE_FIELD_256) {
      this.#field = field;
      this.#generators = [new Polynomial(field, new Int32Array([1]))];
    }
    #buildGenerator(degree) {
      const generators = this.#generators;
      const { length } = generators;
      if (degree >= length) {
        const field = this.#field;
        const { generator } = field;
        let lastGenerator = generators[length - 1];
        for (let i = length; i <= degree; i++) {
          const coefficients = new Int32Array([1, field.exp(i - 1 + generator)]);
          const nextGenerator = lastGenerator.multiply(new Polynomial(field, coefficients));
          generators.push(nextGenerator);
          lastGenerator = nextGenerator;
        }
      }
      return generators[degree];
    }
    encode(received, ecLength) {
      const dataBytes = received.length - ecLength;
      const generator = this.#buildGenerator(ecLength);
      const infoCoefficients = new Int32Array(dataBytes);
      infoCoefficients.set(received.subarray(0, dataBytes));
      const base = new Polynomial(this.#field, infoCoefficients);
      const info = base.multiplyByMonomial(ecLength, 1);
      const [, remainder] = info.divide(generator);
      const { coefficients } = remainder;
      const numZeroCoefficients = ecLength - coefficients.length;
      const zeroCoefficientsOffset = dataBytes + numZeroCoefficients;
      received.fill(0, dataBytes, zeroCoefficientsOffset);
      received.set(coefficients, zeroCoefficientsOffset);
    }
  };

  /**
   * @module encoder
   */
  function generateECCodewords(codewords, numECCodewords) {
    const numDataCodewords = codewords.length;
    const buffer = new Int32Array(numDataCodewords + numECCodewords);
    // Copy data codewords.
    buffer.set(codewords);
    // Reed solomon encode.
    new Encoder$1().encode(buffer, numECCodewords);
    // Get ec codewords.
    return new Uint8Array(buffer.subarray(numDataCodewords));
  }
  function injectECCodewords(bits, { ecBlocks, numECCodewordsPerBlock }) {
    // Step 1.  Divide data bytes into blocks and generate error correction bytes for them. We'll
    // store the divided data bytes blocks and error correction bytes blocks into "blocks".
    let maxNumECCodewords = 0;
    let maxNumDataCodewords = 0;
    let dataCodewordsOffset = 0;
    // Block pair.
    const blocks = [];
    for (const { count, numDataCodewords } of ecBlocks) {
      for (let i = 0; i < count; i++) {
        const dataCodewords = new Uint8Array(numDataCodewords);
        bits.toUint8Array(dataCodewordsOffset * 8, dataCodewords, 0, numDataCodewords);
        const ecCodewords = generateECCodewords(dataCodewords, numECCodewordsPerBlock);
        blocks.push(new BlockPair(dataCodewords, ecCodewords));
        dataCodewordsOffset += numDataCodewords;
        maxNumECCodewords = Math.max(maxNumECCodewords, ecCodewords.length);
        maxNumDataCodewords = Math.max(maxNumDataCodewords, numDataCodewords);
      }
    }
    const codewords = new BitArray();
    // First, place data blocks.
    for (let i = 0; i < maxNumDataCodewords; i++) {
      for (const { dataCodewords } of blocks) {
        if (i < dataCodewords.length) {
          codewords.append(dataCodewords[i], 8);
        }
      }
    }
    // Then, place error correction blocks.
    for (let i = 0; i < maxNumECCodewords; i++) {
      for (const { ecCodewords } of blocks) {
        if (i < ecCodewords.length) {
          codewords.append(ecCodewords[i], 8);
        }
      }
    }
    return codewords;
  }
  function appendTerminateBits(bits, numDataCodewords) {
    const capacity = numDataCodewords * 8;
    // Append Mode.TERMINATE if there is enough space (value is 0000).
    for (let i = 0; i < 4 && bits.length < capacity; i++) {
      bits.append(0);
    }
    // Append termination bits. See 8.4.8 of JISX0510:2004 (p.24) for details.
    // If the last byte isn't 8-bit aligned, we'll add padding bits.
    const numBitsInLastByte = bits.length & 0x07;
    if (numBitsInLastByte > 0) {
      for (let i = numBitsInLastByte; i < 8; i++) {
        bits.append(0);
      }
    }
    // If we have more space, we'll fill the space with padding patterns defined in 8.4.9 (p.24).
    const numPaddingCodewords = numDataCodewords - bits.byteLength;
    for (let i = 0; i < numPaddingCodewords; i++) {
      bits.append(i & 0x01 ? 0x11 : 0xec, 8);
    }
  }
  function isByteMode(segment) {
    return segment.mode === Mode.BYTE;
  }
  function isHanziMode(segment) {
    return segment.mode === Mode.HANZI;
  }
  function appendModeInfo(bits, mode) {
    bits.append(mode.bits, 4);
  }
  function appendECI(bits, segment, currentECIValue) {
    if (isByteMode(segment)) {
      const [value] = segment.charset.values;
      if (value !== currentECIValue) {
        bits.append(Mode.ECI.bits, 4);
        if (value < 1 << 7) {
          bits.append(value, 8);
        } else if (value < 1 << 14) {
          bits.append(2, 2);
          bits.append(value, 14);
        } else {
          bits.append(6, 3);
          bits.append(value, 21);
        }
        return value;
      }
    }
    return currentECIValue;
  }
  function appendFNC1Info(bits, fnc1) {
    const [mode, indicator] = fnc1;
    // Append FNC1 if applicable.
    switch (mode) {
      case 'GS1':
        // GS1 formatted codes are prefixed with a FNC1 in first position mode header.
        appendModeInfo(bits, Mode.FNC1_FIRST_POSITION);
        break;
      case 'AIM':
        // AIM formatted codes are prefixed with a FNC1 in first position mode header.
        appendModeInfo(bits, Mode.FNC1_SECOND_POSITION);
        // Append AIM application indicator.
        bits.append(indicator, 8);
        break;
    }
  }
  function appendLengthInfo(bits, mode, version, numLetters) {
    bits.append(numLetters, mode.getCharacterCountBits(version));
  }
  function willFit(numInputBits, version, ecLevel) {
    // In the following comments, we use numbers of Version 7-H.
    const ecBlocks = version.getECBlocks(ecLevel);
    const numInputCodewords = Math.ceil(numInputBits / 8);
    return ecBlocks.numTotalDataCodewords >= numInputCodewords;
  }
  function chooseVersion(numInputBits, ecLevel) {
    for (const version of VERSIONS) {
      if (willFit(numInputBits, version, ecLevel)) {
        return version;
      }
    }
    throw new Error('data too big for all versions');
  }
  function calculateBitsNeeded(segmentBlocks, version) {
    let bitsNeeded = 0;
    for (const { mode, head, data } of segmentBlocks) {
      bitsNeeded += head.length + mode.getCharacterCountBits(version) + data.length;
    }
    return bitsNeeded;
  }
  function recommendVersion(segmentBlocks, ecLevel) {
    // Hard part: need to know version to know how many bits length takes. But need to know how many
    // bits it takes to know version. First we take a guess at version by assuming version will be
    // the minimum, 1:
    const provisionalBitsNeeded = calculateBitsNeeded(segmentBlocks, VERSIONS[0]);
    const provisionalVersion = chooseVersion(provisionalBitsNeeded, ecLevel);
    // Use that guess to calculate the right version. I am still not sure this works in 100% of cases.
    const bitsNeeded = calculateBitsNeeded(segmentBlocks, provisionalVersion);
    return chooseVersion(bitsNeeded, ecLevel);
  }
  function chooseMask(matrix, bits, version, ecLevel) {
    let bestMask = -1;
    // Lower penalty is better.
    let minPenalty = Number.MAX_VALUE;
    // We try all mask patterns to choose the best one.
    for (let mask = 0; mask < 8; mask++) {
      buildMatrix(matrix, bits, version, ecLevel, mask);
      const penalty = calculateMaskPenalty(matrix);
      if (penalty < minPenalty) {
        bestMask = mask;
        minPenalty = penalty;
      }
    }
    return bestMask;
  }

  /**
   * @module Dict
   * @see https://github.com/google/dart-gif-encoder
   */
  // The highest code that can be defined in the CodeBook.
  const MAX_CODE = (1 << 12) - 1;
  /**
   * A dict contains codes defined during LZW compression. It's a mapping from a string
   * of pixels to the code that represents it. The codes are stored in a trie which is
   * represented as a map. Codes may be up to 12 bits. The size of the codebook is always
   * the minimum power of 2 needed to represent all the codes and automatically increases
   * as new codes are defined.
   */
  class Dict {
    #bof;
    #eof;
    #bits;
    #depth;
    #size;
    #unused;
    #codes;
    constructor(depth) {
      const bof = 1 << depth;
      const eof = bof + 1;
      this.#bof = bof;
      this.#eof = eof;
      this.#depth = depth;
      this.reset();
    }
    get bof() {
      return this.#bof;
    }
    get eof() {
      return this.#eof;
    }
    get bits() {
      return this.#bits;
    }
    get depth() {
      return this.#depth;
    }
    reset() {
      const bits = this.#depth + 1;
      this.#bits = bits;
      this.#size = 1 << bits;
      this.#codes = new Map();
      this.#unused = this.#eof + 1;
    }
    add(code, index) {
      let unused = this.#unused;
      if (unused > MAX_CODE) {
        return false;
      }
      this.#codes.set((code << 8) | index, unused++);
      let bits = this.#bits;
      let size = this.#size;
      if (unused > size) {
        size = 1 << ++bits;
      }
      this.#bits = bits;
      this.#size = size;
      this.#unused = unused;
      return true;
    }
    get(code, index) {
      return this.#codes.get((code << 8) | index);
    }
  }

  /**
   * @module BookStream
   * @see https://github.com/google/dart-gif-encoder
   */
  class DictStream {
    #bits = 0;
    #dict;
    #buffer = 0;
    #bytes = [];
    constructor(dict) {
      this.#dict = dict;
    }
    write(code) {
      let bits = this.#bits;
      let buffer = this.#buffer | (code << bits);
      bits += this.#dict.bits;
      const bytes = this.#bytes;
      while (bits >= 8) {
        bytes.push(buffer & 0xff);
        buffer >>= 8;
        bits -= 8;
      }
      this.#bits = bits;
      this.#buffer = buffer;
    }
    pipe(stream) {
      const bytes = this.#bytes;
      // Add the remaining bits. (Unused bits are set to zero.)
      if (this.#bits > 0) {
        bytes.push(this.#buffer);
      }
      stream.writeByte(this.#dict.depth);
      // Divide it up into blocks with a size in front of each block.
      const { length } = bytes;
      for (let i = 0; i < length; ) {
        const remain = length - i;
        if (remain >= 255) {
          stream.writeByte(0xff);
          stream.writeBytes(bytes, i, 255);
          i += 255;
        } else {
          stream.writeByte(remain);
          stream.writeBytes(bytes, i, remain);
          i = length;
        }
      }
      stream.writeByte(0);
    }
  }

  /**
   * @module index
   * @see https://github.com/google/dart-gif-encoder
   */
  function compress(pixels, depth, stream) {
    const dict = new Dict(depth);
    const buffer = new DictStream(dict);
    buffer.write(dict.bof);
    if (pixels.length > 0) {
      let code = pixels[0];
      const { length } = pixels;
      for (let i = 1; i < length; i++) {
        const pixelIndex = pixels[i];
        const nextCode = dict.get(code, pixelIndex);
        if (nextCode != null) {
          code = nextCode;
        } else {
          buffer.write(code);
          // Reset dict when full
          if (!dict.add(code, pixelIndex)) {
            buffer.write(dict.bof);
            dict.reset();
          }
          code = pixelIndex;
        }
      }
      buffer.write(code);
    }
    buffer.write(dict.eof);
    buffer.pipe(stream);
  }

  /**
   * @module ByteStream
   */
  class ByteStream {
    #bytes = [];
    get bytes() {
      return this.#bytes;
    }
    writeByte(value) {
      this.#bytes.push(value & 0xff);
    }
    writeInt16(value) {
      this.#bytes.push(value & 0xff, (value >> 8) & 0xff);
    }
    writeBytes(bytes, offset = 0, length = bytes.length) {
      const buffer = this.#bytes;
      for (let i = 0; i < length; i++) {
        buffer.push(bytes[offset + i] & 0xff);
      }
    }
  }

  /**
   * @module Base64Stream
   */
  const { fromCharCode } = String;
  function encode(byte) {
    byte &= 0x3f;
    if (byte >= 0) {
      if (byte < 26) {
        // A
        return 0x41 + byte;
      } else if (byte < 52) {
        // a
        return 0x61 + (byte - 26);
      } else if (byte < 62) {
        // 0
        return 0x30 + (byte - 52);
      } else if (byte === 62) {
        // +
        return 0x2b;
      } else if (byte === 63) {
        // /
        return 0x2f;
      }
    }
    throw new Error(`illegal char: ${fromCharCode(byte)}`);
  }
  class Base64Stream {
    #bits = 0;
    #buffer = 0;
    #length = 0;
    #stream = new ByteStream();
    get bytes() {
      return this.#stream.bytes;
    }
    write(byte) {
      let bits = this.#bits + 8;
      const stream = this.#stream;
      const buffer = (this.#buffer << 8) | (byte & 0xff);
      while (bits >= 6) {
        stream.writeByte(encode(buffer >>> (bits - 6)));
        bits -= 6;
      }
      this.#length++;
      this.#bits = bits;
      this.#buffer = buffer;
    }
    close() {
      const bits = this.#bits;
      const stream = this.#stream;
      if (bits > 0) {
        stream.writeByte(encode(this.#buffer << (6 - bits)));
        this.#bits = 0;
        this.#buffer = 0;
      }
      const length = this.#length;
      if (length % 3 != 0) {
        // Padding
        const pad = 3 - (length % 3);
        for (let i = 0; i < pad; i++) {
          // =
          stream.writeByte(0x3d);
        }
      }
    }
  }

  /**
   * @module index
   */
  class GIFImage {
    #width;
    #height;
    #foreground;
    #background;
    #pixels = [];
    constructor(width, height, { foreground = [0x00, 0x00, 0x00], background = [0xff, 0xff, 0xff] } = {}) {
      this.#width = width;
      this.#height = height;
      this.#foreground = foreground;
      this.#background = background;
    }
    #encode() {
      const stream = new ByteStream();
      const width = this.#width;
      const height = this.#height;
      const foreground = this.#foreground;
      const background = this.#background;
      // GIF signature: GIF89a
      stream.writeBytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
      // Logical screen descriptor
      stream.writeInt16(width);
      stream.writeInt16(height);
      stream.writeBytes([0x80, 0, 0]);
      // Global background color palette
      stream.writeBytes([background[0], background[1], background[2]]);
      // Global background color palette
      stream.writeBytes([foreground[0], foreground[1], foreground[2]]);
      // Image descriptor
      stream.writeByte(0x2c);
      stream.writeInt16(0);
      stream.writeInt16(0);
      stream.writeInt16(width);
      stream.writeInt16(height);
      stream.writeByte(0);
      compress(this.#pixels, 2, stream);
      // GIF terminator
      stream.writeByte(0x3b);
      return stream.bytes;
    }
    set(x, y, color) {
      this.#pixels[y * this.#width + x] = color;
    }
    toDataURL() {
      const bytes = this.#encode();
      const stream = new Base64Stream();
      for (const byte of bytes) {
        stream.write(byte);
      }
      stream.close();
      const base64 = stream.bytes;
      let url = 'data:image/gif;base64,';
      for (const byte of base64) {
        url += fromCharCode(byte);
      }
      return url;
    }
  }

  /**
   * @module QRCode
   */
  class QRCode {
    #mask;
    #level;
    #version;
    #matrix;
    constructor(matrix, version, level, mask) {
      this.#mask = mask;
      this.#level = level;
      this.#matrix = matrix;
      this.#version = version;
    }
    /**
     * @property mask
     * @description Get the mask of qrcode
     */
    get mask() {
      return this.#mask;
    }
    /**
     * @property level
     * @description Get the error correction level of qrcode
     */
    get level() {
      return this.#level.name;
    }
    /**
     * @property version
     * @description Get the version of qrcode
     */
    get version() {
      return this.#version.version;
    }
    /**
     * @property matrix
     * @description Get the matrix of qrcode
     */
    get matrix() {
      return this.#matrix;
    }
    /**
     * @method toDataURL
     * @param moduleSize The size of one qrcode module
     * @param options Set rest options of gif, like margin, foreground and background
     */
    toDataURL(moduleSize = 2, { margin = moduleSize * 4, ...colors } = {}) {
      moduleSize = Math.max(1, moduleSize >> 0);
      margin = Math.max(0, margin >> 0);
      const matrix = this.#matrix;
      const matrixSize = matrix.size;
      const size = moduleSize * matrixSize + margin * 2;
      const gif = new GIFImage(size, size, colors);
      const max = size - margin;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (x >= margin && x < max && y >= margin && y < max) {
            const offsetX = toInt32((x - margin) / moduleSize);
            const offsetY = toInt32((y - margin) / moduleSize);
            gif.set(x, y, matrix.get(offsetX, offsetY));
          } else {
            // Margin pixels
            gif.set(x, y, 0);
          }
        }
      }
      return gif.toDataURL();
    }
  }

  /**
   * @module ByteMatrix
   */
  class ByteMatrix {
    #size;
    #bytes;
    constructor(size) {
      this.#size = size;
      this.#bytes = new Int8Array(size * size);
    }
    /**
     * @property size
     * @description Get the size of matrix
     */
    get size() {
      return this.#size;
    }
    /**
     * @method set
     * @description Set the matrix value of position
     */
    set(x, y, value) {
      this.#bytes[y * this.#size + x] = value;
    }
    /**
     * @method get
     * @description Get the matrix value of position
     */
    get(x, y) {
      return this.#bytes[y * this.#size + x];
    }
    /**
     * @method clear
     * @description Clear the matrix with value
     */
    clear(value) {
      this.#bytes.fill(value);
    }
  }

  /**
   * @module asserts
   */
  function assertContent(content) {
    if (!content) {
      throw new Error('segment content should be at least 1 character');
    }
  }
  function assertCharset(charset) {
    if (!(charset instanceof Charset)) {
      throw new Error('illegal charset');
    }
  }
  function assertHints(hints) {
    const { fnc1 } = hints;
    // FNC1
    if (fnc1 != null) {
      const [mode] = fnc1;
      if (mode !== 'GS1' && mode !== 'AIM') {
        throw new Error('illegal fn1 hint');
      }
      if (mode === 'AIM') {
        const [, indicator] = fnc1;
        if (indicator < 0 || indicator > 0xff || !Number.isInteger(indicator)) {
          throw new Error('illegal fn1 application indicator');
        }
      }
    }
  }
  function assertLevel(level) {
    if (['L', 'M', 'Q', 'H'].indexOf(level) < 0) {
      throw new Error('illegal error correction level');
    }
  }
  function assertVersion(version) {
    if (version !== 'auto') {
      if (version < 1 || version > 40 || !Number.isInteger(version)) {
        throw new Error('version must be "auto" or an integer in [1 - 40]');
      }
    }
  }

  /**
   * @module Encoder
   */
  class Encoder {
    #hints;
    #level;
    #encode;
    #version;
    constructor({
      // Encode hints
      hints = {},
      // Error correction level
      level = 'L',
      // Version number or auto
      version = 'auto',
      // Content encode function
      encode = encode$1
    } = {}) {
      assertHints(hints);
      assertLevel(level);
      assertVersion(version);
      this.#hints = hints;
      this.#encode = encode;
      this.#version = version;
      this.#level = ECLevel[level];
    }
    encode(...segments) {
      const ecLevel = this.#level;
      const encode = this.#encode;
      const { fnc1 } = this.#hints;
      const versionNumber = this.#version;
      const segmentBlocks = [];
      // Only append FNC1 once.
      let isFNC1Appended = false;
      // Current ECI value.
      let [currentECIValue] = Charset.ISO_8859_1.values;
      // Init segments.
      for (const segment of segments) {
        const { mode } = segment;
        const head = new BitArray();
        const isByte = isByteMode(segment);
        const data = isByte ? segment.encode(encode) : segment.encode();
        const length = isByte ? data.byteLength : segment.content.length;
        // Append ECI segment if applicable.
        currentECIValue = appendECI(head, segment, currentECIValue);
        // Append FNC1 if applicable.
        if (fnc1 != null && !isFNC1Appended) {
          isFNC1Appended = true;
          appendFNC1Info(head, fnc1);
        }
        // With ECI in place, Write the mode marker.
        appendModeInfo(head, mode);
        // If is Hanzi mode append GB2312 subset.
        if (isHanziMode(segment)) {
          head.append(1, 4);
        }
        // Push segment block.
        segmentBlocks.push({ mode, head, data, length });
      }
      let version;
      if (versionNumber === 'auto') {
        version = recommendVersion(segmentBlocks, ecLevel);
      } else {
        version = VERSIONS[versionNumber - 1];
        const bitsNeeded = calculateBitsNeeded(segmentBlocks, version);
        if (!willFit(bitsNeeded, version, ecLevel)) {
          throw new Error('data too big for requested version');
        }
      }
      const headAndDataBits = new BitArray();
      for (const { mode, head, data, length } of segmentBlocks) {
        headAndDataBits.append(head);
        appendLengthInfo(headAndDataBits, mode, version, length);
        headAndDataBits.append(data);
      }
      const ecBlocks = version.getECBlocks(ecLevel);
      // Append terminate the bits properly.
      appendTerminateBits(headAndDataBits, ecBlocks.numTotalDataCodewords);
      const matrix = new ByteMatrix(version.size);
      const finalBits = injectECCodewords(headAndDataBits, ecBlocks);
      const mask = chooseMask(matrix, finalBits, version, ecLevel);
      buildMatrix(matrix, finalBits, version, ecLevel, mask);
      return new QRCode(matrix, version, ecLevel, mask);
    }
  }

  /**
   * @module binarizer
   */
  const REGION_SIZE = 8;
  const MIN_DYNAMIC_RANGE = 24;
  function between(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }
  function binarize({ data, width, height }) {
    if (data.length !== width * height * 4) {
      throw new Error('malformed data passed to binarizer');
    }
    // Convert image to greyscale
    const greyscale = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      const offset = y * width;
      for (let x = 0; x < width; x++) {
        const index = offset + x;
        const colorIndex = index * 4;
        const r = data[colorIndex + 0];
        const g = data[colorIndex + 1];
        const b = data[colorIndex + 2];
        greyscale[offset + x] = r * 0.2126 + g * 0.7152 + b * 0.0722;
      }
    }
    const blackPointsWidth = Math.ceil(width / REGION_SIZE);
    const blackPointsHeight = Math.ceil(height / REGION_SIZE);
    const blackPoints = new Uint8Array(blackPointsWidth * blackPointsHeight);
    for (let blackPointsY = 0; blackPointsY < blackPointsHeight; blackPointsY++) {
      const offset = blackPointsY * blackPointsWidth;
      const prevOffset = offset - blackPointsWidth;
      for (let blackPointsX = 0; blackPointsX < blackPointsWidth; blackPointsX++) {
        let sum = 0;
        let max = 0;
        let min = Infinity;
        for (let y = 0; y < REGION_SIZE; y++) {
          const offset = (blackPointsY * REGION_SIZE + y) * width;
          for (let x = 0; x < REGION_SIZE; x++) {
            const pixelLumosity = greyscale[offset + blackPointsX * REGION_SIZE + x];
            sum += pixelLumosity;
            min = Math.min(min, pixelLumosity);
            max = Math.max(max, pixelLumosity);
          }
        }
        let average = sum / REGION_SIZE ** 2;
        if (max - min <= MIN_DYNAMIC_RANGE) {
          // If variation within the block is low, assume this is a block with only light or only
          // dark pixels. In that case we do not want to use the average, as it would divide this
          // low contrast area into black and white pixels, essentially creating data out of noise.
          //
          // Default the blackpoint for these blocks to be half the min - effectively white them out
          average = min / 2;
          if (blackPointsX > 0 && blackPointsY > 0) {
            // Correct the "white background" assumption for blocks that have neighbors by comparing
            // the pixels in this block to the previously calculated black points. This is based on
            // the fact that dark barcode symbology is always surrounded by some amount of light
            // background for which reasonable black point estimates were made. The bp estimated at
            // the boundaries is used for the interior.
            // The (min < bp) is arbitrary but works better than other heuristics that were tried.
            const topRightPoint = blackPoints[prevOffset + blackPointsX];
            const bottomLeftPoint = blackPoints[offset + blackPointsX - 1];
            const topLeftPoint = blackPoints[prevOffset + blackPointsX - 1];
            const averageNeighborBlackPoint = (topRightPoint + 2 * bottomLeftPoint + topLeftPoint) / 4;
            if (min < averageNeighborBlackPoint) {
              average = averageNeighborBlackPoint;
            }
          }
        }
        blackPoints[offset + blackPointsX] = average;
      }
    }
    const binarized = new BitMatrix(width, height);
    for (let blackPointsY = 0; blackPointsY < blackPointsHeight; blackPointsY++) {
      const top = between(blackPointsY, 2, blackPointsHeight - 3);
      for (let blackPointsX = 0; blackPointsX < blackPointsWidth; blackPointsX++) {
        let sum = 0;
        const left = between(blackPointsX, 2, blackPointsWidth - 3);
        for (let regionY = -2; regionY <= 2; regionY++) {
          const offset = (top + regionY) * blackPointsWidth;
          for (let regionX = -2; regionX <= 2; regionX++) {
            sum += blackPoints[offset + left + regionX];
          }
        }
        const threshold = sum / 25;
        for (let regionY = 0; regionY < REGION_SIZE; regionY++) {
          const y = blackPointsY * REGION_SIZE + regionY;
          const offset = y * width;
          for (let regionX = 0; regionX < REGION_SIZE; regionX++) {
            const x = blackPointsX * REGION_SIZE + regionX;
            const lumina = greyscale[offset + x];
            if (lumina <= threshold) {
              binarized.set(x, y);
            }
          }
        }
      }
    }
    return binarized;
  }

  /**
   * @module Byte
   */
  class Byte {
    #content;
    #charset;
    constructor(content, charset = Charset.ISO_8859_1) {
      assertContent(content);
      assertCharset(charset);
      this.#content = content;
      this.#charset = charset;
    }
    get mode() {
      return Mode.BYTE;
    }
    get content() {
      return this.#content;
    }
    get charset() {
      return this.#charset;
    }
    encode(encode) {
      const bits = new BitArray();
      const bytes = encode(this.#content, this.#charset);
      for (const byte of bytes) {
        bits.append(byte, 8);
      }
      return bits;
    }
  }

  /**
   * @module GridSampler
   */
  class GridSampler {
    #matrix;
    constructor(matrix) {
      this.#matrix = matrix;
    }
    #checkAndNudgePoints(points) {
      let nudged = true;
      const { length } = points;
      const matrix = this.#matrix;
      const maxOffset = length - 1;
      const { width, height } = matrix;
      // Check and nudge points from start until we see some that are OK:
      for (let offset = 0; offset < maxOffset && nudged; offset += 2) {
        nudged = false;
        const x = toInt32(points[offset]);
        const y = toInt32(points[offset + 1]);
        if (x === -1) {
          nudged = true;
          points[offset] = 0;
        } else if (x === width) {
          nudged = true;
          points[offset] = width - 1;
        }
        if (y === -1) {
          nudged = true;
          points[offset + 1] = 0;
        } else if (y === height) {
          nudged = true;
          points[offset + 1] = height - 1;
        }
      }
      nudged = true;
      // Check and nudge points from end
      for (let offset = length - 2; offset >= 0 && nudged; offset -= 2) {
        nudged = false;
        const x = toInt32(points[offset]);
        const y = toInt32(points[offset + 1]);
        if (x === -1) {
          nudged = true;
          points[offset] = 0;
        } else if (x === width) {
          nudged = true;
          points[offset] = width - 1;
        }
        if (y === -1) {
          nudged = true;
          points[offset + 1] = 0;
        } else if (y === height) {
          nudged = true;
          points[offset + 1] = height - 1;
        }
      }
    }
    sampleGrid(width, height, transform) {
      const maxX = 2 * width;
      const matrix = this.#matrix;
      const points = [];
      const matrixWidth = matrix.width;
      const matrixHeight = matrix.height;
      const bits = new BitMatrix(width, height);
      for (let y = 0; y < height; y++) {
        const value = y + 0.5;
        for (let x = 0; x < maxX; x += 2) {
          points[x] = x / 2 + 0.5;
          points[x + 1] = value;
        }
        transform.transformPoints(points);
        this.#checkAndNudgePoints(points);
        for (let x = 0; x < maxX; x += 2) {
          const offsetX = toInt32(points[x]);
          const offsetY = toInt32(points[x + 1]);
          if (
            // Check coordinate range
            offsetX >= 0 &&
            offsetY >= 0 &&
            offsetX < matrixWidth &&
            offsetY < matrixHeight &&
            matrix.get(offsetX, offsetY)
          ) {
            // Black(-ish) pixel
            bits.set(x / 2, y);
          }
        }
      }
      return bits;
    }
  }

  /**
   * @module PerspectiveTransform
   */
  class PerspectiveTransform {
    #a11;
    #a12;
    #a13;
    #a21;
    #a22;
    #a23;
    #a31;
    #a32;
    #a33;
    constructor(a11, a21, a31, a12, a22, a32, a13, a23, a33) {
      this.#a11 = a11;
      this.#a12 = a12;
      this.#a13 = a13;
      this.#a21 = a21;
      this.#a22 = a22;
      this.#a23 = a23;
      this.#a31 = a31;
      this.#a32 = a32;
      this.#a33 = a33;
    }
    buildAdjoint() {
      // Adjoint is the transpose of the cofactor matrix:
      const a11 = this.#a11;
      const a12 = this.#a12;
      const a13 = this.#a13;
      const a21 = this.#a21;
      const a22 = this.#a22;
      const a23 = this.#a23;
      const a31 = this.#a31;
      const a32 = this.#a32;
      const a33 = this.#a33;
      return new PerspectiveTransform(
        a22 * a33 - a23 * a32,
        a23 * a31 - a21 * a33,
        a21 * a32 - a22 * a31,
        a13 * a32 - a12 * a33,
        a11 * a33 - a13 * a31,
        a12 * a31 - a11 * a32,
        a12 * a23 - a13 * a22,
        a13 * a21 - a11 * a23,
        a11 * a22 - a12 * a21
      );
    }
    transformPoints(points) {
      const a11 = this.#a11;
      const a12 = this.#a12;
      const a13 = this.#a13;
      const a21 = this.#a21;
      const a22 = this.#a22;
      const a23 = this.#a23;
      const a31 = this.#a31;
      const a32 = this.#a32;
      const a33 = this.#a33;
      const maxI = points.length - 1;
      for (let i = 0; i < maxI; i += 2) {
        const x = points[i];
        const y = points[i + 1];
        const denominator = a13 * x + a23 * y + a33;
        points[i] = (a11 * x + a21 * y + a31) / denominator;
        points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
      }
    }
    times(other) {
      const a11 = this.#a11;
      const a12 = this.#a12;
      const a13 = this.#a13;
      const a21 = this.#a21;
      const a22 = this.#a22;
      const a23 = this.#a23;
      const a31 = this.#a31;
      const a32 = this.#a32;
      const a33 = this.#a33;
      const b11 = other.#a11;
      const b12 = other.#a12;
      const b13 = other.#a13;
      const b21 = other.#a21;
      const b22 = other.#a22;
      const b23 = other.#a23;
      const b31 = other.#a31;
      const b32 = other.#a32;
      const b33 = other.#a33;
      return new PerspectiveTransform(
        a11 * b11 + a21 * b12 + a31 * b13,
        a11 * b21 + a21 * b22 + a31 * b23,
        a11 * b31 + a21 * b32 + a31 * b33,
        a12 * b11 + a22 * b12 + a32 * b13,
        a12 * b21 + a22 * b22 + a32 * b23,
        a12 * b31 + a22 * b32 + a32 * b33,
        a13 * b11 + a23 * b12 + a33 * b13,
        a13 * b21 + a23 * b22 + a33 * b23,
        a13 * b31 + a23 * b32 + a33 * b33
      );
    }
  }
  function squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3) {
    const dx3 = x0 - x1 + x2 - x3;
    const dy3 = y0 - y1 + y2 - y3;
    if (dx3 === 0 && dy3 === 0) {
      return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0, 0, 1);
    } else {
      const dx1 = x1 - x2;
      const dx2 = x3 - x2;
      const dy1 = y1 - y2;
      const dy2 = y3 - y2;
      const denominator = dx1 * dy2 - dx2 * dy1;
      const a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
      const a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
      return new PerspectiveTransform(
        x1 - x0 + a13 * x1,
        x3 - x0 + a23 * x3,
        x0,
        y1 - y0 + a13 * y1,
        y3 - y0 + a23 * y3,
        y0,
        a13,
        a23,
        1
      );
    }
  }
  function quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3) {
    // Here, the adjoint serves as the inverse:
    return squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
  }
  function quadrilateralToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {
    const qToS = quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
    const sToQ = squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
    return sToQ.times(qToS);
  }

  /**
   * @module transform
   */
  function createTransform({ size, topLeft, topRight, bottomLeft }, alignmentPattern) {
    let bottomRightX;
    let bottomRightY;
    let sourceBottomRightX;
    let sourceBottomRightY;
    const sizeMinusThree = size - 3.5;
    const { x: topLeftX, y: topLeftY } = topLeft;
    const { x: topRightX, y: topRightY } = topRight;
    const { x: bottomLeftX, y: bottomLeftY } = bottomLeft;
    if (alignmentPattern != null) {
      bottomRightX = alignmentPattern.x;
      bottomRightY = alignmentPattern.y;
      sourceBottomRightX = sizeMinusThree - 3;
      sourceBottomRightY = sourceBottomRightX;
    } else {
      // Don't have an alignment pattern, just make up the bottom-right point
      bottomRightX = topRightX + bottomLeftX - topLeftX;
      bottomRightY = topRightY + bottomLeftY - topLeftY;
      sourceBottomRightX = sizeMinusThree;
      sourceBottomRightY = sizeMinusThree;
    }
    return quadrilateralToQuadrilateral(
      3.5,
      3.5,
      sizeMinusThree,
      3.5,
      sourceBottomRightX,
      sourceBottomRightY,
      3.5,
      sizeMinusThree,
      topLeftX,
      topLeftY,
      topRightX,
      topRightY,
      bottomRightX,
      bottomRightY,
      bottomLeftX,
      bottomLeftY
    );
  }

  /**
   * @module Detect
   */
  class Detect {
    #matrix;
    #alignment;
    #extract;
    #finder;
    constructor(matrix, finder, alignment) {
      this.#finder = finder;
      this.#matrix = matrix;
      this.#alignment = alignment;
    }
    get finder() {
      return this.#finder;
    }
    get alignment() {
      return this.#alignment;
    }
    get matrix() {
      let extract = this.#extract;
      if (extract) {
        return extract;
      }
      const sampler = new GridSampler(this.#matrix);
      const finder = this.#finder;
      const { size } = finder;
      extract = sampler.sampleGrid(size, size, createTransform(finder, this.#alignment));
      this.#extract = extract;
      return extract;
    }
  }

  /**
   * @module matcher
   */
  const DIFF_EDGE_RATIO = 0.5;
  const DIFF_MODULE_SIZE_RATIO = 0.5;
  const DIFF_FINDER_PATTERN_RATIO = 0.5;
  const DIFF_ALIGNMENT_PATTERN_RATIO = 0.8;
  function sumScanlineNonzero(scanline) {
    let scanlineTotal = 0;
    for (const count of scanline) {
      if (count === 0) {
        return NaN;
      }
      scanlineTotal += count;
    }
    return scanlineTotal;
  }
  function scanlineUpdate(scanline, count) {
    const { length } = scanline;
    const lastIndex = length - 1;
    for (let i = 0; i < lastIndex; i++) {
      scanline[i] = scanline[i + 1];
    }
    scanline[lastIndex] = count;
  }
  function centerFromEnd(scanline, end) {
    const { length } = scanline;
    const middleIndex = toInt32(length / 2);
    let center = end - scanline[middleIndex] / 2;
    for (let i = middleIndex + 1; i < length; i++) {
      center -= scanline[i];
    }
    return center;
  }
  function isMatchFinderPattern(scanline) {
    const modules = 7;
    const { length } = scanline;
    const scanlineTotal = sumScanlineNonzero(scanline);
    if (scanlineTotal >= modules) {
      const moduleSize = scanlineTotal / modules;
      if (moduleSize >= 1) {
        const middleIndex = toInt32(length / 2);
        const threshold = moduleSize * DIFF_FINDER_PATTERN_RATIO;
        // Allow less than DIFF_FINDER_MODULE_SIZE_RATIO variance from 1-1-3-1-1 proportions
        for (let i = 0; i < length; i++) {
          const count = scanline[i];
          const ratio = i !== middleIndex ? 1 : 3;
          const moduleSizeDiff = Math.abs(count - moduleSize * ratio);
          if (moduleSizeDiff > 1 && moduleSizeDiff > threshold * ratio) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
  function isMatchAlignmentPattern(scanline) {
    const modules = scanline.length;
    const scanlineTotal = sumScanlineNonzero(scanline);
    if (scanlineTotal >= modules) {
      const moduleSize = scanlineTotal / modules;
      if (moduleSize >= 1) {
        const threshold = moduleSize * DIFF_ALIGNMENT_PATTERN_RATIO;
        // Allow less than DIFF_ALIGNMENT_MODULE_SIZE_RATIO variance from 1-1-1 or 1-1-1-1-1 proportions
        for (const count of scanline) {
          const moduleSizeDiff = Math.abs(count - moduleSize);
          if (moduleSizeDiff > 1 && moduleSizeDiff > threshold) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
  function isEqualsSize(size1, size2, ratio) {
    if (size1 > size2) {
      [size1, size2] = [size2, size1];
    }
    return size2 - size1 <= size2 * ratio;
  }
  function alignCrossPattern(matrix, x, y, overscan, checker, isVertical) {
    let offset = isVertical ? y : x;
    const scanline = [0, 0, 0, 0, 0];
    const size = isVertical ? matrix.height : matrix.width;
    const isBlackPixel = () => {
      return isVertical ? matrix.get(x, offset) : matrix.get(offset, y);
    };
    while (offset >= 0 && isBlackPixel()) {
      offset--;
      scanline[2]++;
    }
    while (offset >= 0 && !isBlackPixel()) {
      offset--;
      scanline[1]++;
    }
    while (offset >= 0 && scanline[0] < overscan && isBlackPixel()) {
      offset--;
      scanline[0]++;
    }
    offset = (isVertical ? y : x) + 1;
    while (offset < size && isBlackPixel()) {
      offset++;
      scanline[2]++;
    }
    while (offset < size && !isBlackPixel()) {
      offset++;
      scanline[3]++;
    }
    while (offset < size && scanline[4] < overscan && isBlackPixel()) {
      offset++;
      scanline[4]++;
    }
    return [checker(scanline) ? centerFromEnd(scanline, offset) : NaN, scanline];
  }
  function checkDiagonalPattern(matrix, x, y, overscan, checker, isBackslash) {
    let step = -1;
    let offsetX = x;
    let offsetY = y;
    const scanline = [0, 0, 0, 0, 0];
    const { width, height } = matrix;
    const slope = isBackslash ? -1 : 1;
    const updateAxis = () => {
      offsetX += step;
      offsetY -= step * slope;
    };
    const isBlackPixel = () => {
      return matrix.get(offsetX, offsetY);
    };
    // Start counting left from center finding black center mass
    while (offsetX >= 0 && offsetY >= 0 && offsetY < height && isBlackPixel()) {
      updateAxis();
      scanline[2]++;
    }
    // Start counting left from center finding black center mass
    while (offsetX >= 0 && offsetY >= 0 && offsetY < height && !isBlackPixel()) {
      updateAxis();
      scanline[1]++;
    }
    // Start counting left from center finding black center mass
    while (offsetX >= 0 && offsetY >= 0 && offsetY < height && scanline[0] < overscan && isBlackPixel()) {
      updateAxis();
      scanline[0]++;
    }
    step = 1;
    offsetX = x + step;
    offsetY = y - step * slope;
    // Start counting right from center finding black center mass
    while (offsetX < width && offsetY >= 0 && offsetY < height && isBlackPixel()) {
      updateAxis();
      scanline[2]++;
    }
    // Start counting right from center finding black center mass
    while (offsetX < width && offsetY >= 0 && offsetY < height && !isBlackPixel()) {
      updateAxis();
      scanline[3]++;
    }
    // Start counting right from center finding black center mass
    while (offsetX < width && offsetY >= 0 && offsetY < height && scanline[4] < overscan && isBlackPixel()) {
      updateAxis();
      scanline[4]++;
    }
    return checker(scanline);
  }

  /**
   * @module Point
   */
  class Point {
    #x;
    #y;
    constructor(x, y) {
      this.#x = x;
      this.#y = y;
    }
    get x() {
      return this.#x;
    }
    get y() {
      return this.#y;
    }
  }
  function distance(a, b) {
    const xDiff = a.x - b.x;
    const yDiff = a.y - b.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }
  function calcTriangleArea(a, b, c) {
    const { x: ax, y: ay } = a;
    const { x: bx, y: by } = b;
    const { x: cx, y: cy } = c;
    return Math.abs((ax * by + bx * cy + cx * ay - bx * ay - cx * by - ax * cy) / 2);
  }
  function isPointInQuadrangle(p, a, b, c, d) {
    return (
      round(calcTriangleArea(a, b, c) + calcTriangleArea(c, d, a)) ===
      round(calcTriangleArea(a, b, p) + calcTriangleArea(b, c, p) + calcTriangleArea(c, d, p) + calcTriangleArea(d, a, p))
    );
  }

  /**
   * @module Pattern
   */
  class Pattern extends Point {
    #width;
    #height;
    #modules;
    #rect;
    #combined = 1;
    #moduleSize;
    constructor(x, y, width, height, modules) {
      super(x, y);
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      const xModuleSize = width / modules;
      const yModuleSize = height / modules;
      const xModuleSizeHalf = xModuleSize / 2;
      const yModuleSizeHalf = yModuleSize / 2;
      this.#width = width;
      this.#height = height;
      this.#modules = modules;
      this.#rect = [
        y - halfHeight + yModuleSizeHalf,
        x + halfWidth - xModuleSizeHalf,
        y + halfHeight - yModuleSizeHalf,
        x - halfWidth + xModuleSizeHalf
      ];
      this.#moduleSize = [xModuleSize, yModuleSize];
    }
    get width() {
      return this.#width;
    }
    get height() {
      return this.#height;
    }
    get combined() {
      return this.#combined;
    }
    get rect() {
      return this.#rect;
    }
    get moduleSize() {
      return this.#moduleSize;
    }
    equals(x, y, width, height) {
      const modules = this.#modules;
      const xModuleSize = width / modules;
      if (Math.abs(x - this.x) <= xModuleSize) {
        const moduleSize = this.#moduleSize;
        const [xModuleSizeThis] = moduleSize;
        const xModuleSizeDiff = Math.abs(xModuleSize - xModuleSizeThis);
        if (xModuleSizeDiff >= 1 && xModuleSizeDiff > xModuleSizeThis) {
          return false;
        }
        const yModuleSize = height / modules;
        if (Math.abs(y - this.y) <= yModuleSize) {
          const [, yModuleSizeThis] = moduleSize;
          const yModuleSizeDiff = Math.abs(yModuleSize - yModuleSizeThis);
          if (yModuleSizeDiff < 1 || yModuleSizeDiff <= yModuleSizeThis) {
            return true;
          }
        }
      }
      return false;
    }
    combine(x, y, width, height) {
      const combined = this.#combined;
      const nextCombined = combined + 1;
      const combinedX = (combined * this.x + x) / nextCombined;
      const combinedY = (combined * this.y + y) / nextCombined;
      const combinedWidth = (combined * this.#width + width) / nextCombined;
      const combinedHeight = (combined * this.#height + height) / nextCombined;
      const pattern = new Pattern(combinedX, combinedY, combinedWidth, combinedHeight, this.#modules);
      pattern.#combined = nextCombined;
      return pattern;
    }
  }

  /**
   * @module PatternMatcher
   */
  class PatternMatcher {
    #strict;
    #matcher;
    #matrix;
    #modules;
    #patterns = [];
    constructor(matrix, modules, matcher, strict) {
      this.#matrix = matrix;
      this.#strict = strict;
      this.#matcher = matcher;
      this.#modules = modules;
    }
    #isDiagonalPassed(x, y, overscan) {
      const matrix = this.#matrix;
      const strict = this.#strict;
      const matcher = this.#matcher;
      if (checkDiagonalPattern(matrix, x, y, overscan, matcher)) {
        if (strict) {
          return checkDiagonalPattern(matrix, x, y, overscan, matcher, true);
        }
        return true;
      }
      return false;
    }
    #alignVerticalPattern(x, y, overscan) {
      return alignCrossPattern(this.#matrix, x, y, overscan, this.#matcher, true);
    }
    #alignHorizontalPattern(x, y, overscan) {
      return alignCrossPattern(this.#matrix, x, y, overscan, this.#matcher);
    }
    get matcher() {
      return this.#matcher;
    }
    get matrix() {
      return this.#matrix;
    }
    get patterns() {
      return this.#patterns;
    }
    match(x, y, scanline, overscan) {
      if (this.#matcher(scanline)) {
        let scanlineHorizontal;
        let offsetX = centerFromEnd(scanline, x);
        const [offsetY, scanlineVertical] = this.#alignVerticalPattern(toInt32(offsetX), y, overscan);
        if (offsetY >= 0) {
          // Re-cross check
          [offsetX, scanlineHorizontal] = this.#alignHorizontalPattern(toInt32(offsetX), toInt32(offsetY), overscan);
          if (offsetX >= 0 && this.#isDiagonalPassed(toInt32(offsetX), toInt32(offsetY), overscan)) {
            const width = sumArray(scanlineHorizontal);
            const height = sumArray(scanlineVertical);
            const patterns = this.#patterns;
            const { length } = patterns;
            for (let i = 0; i < length; i++) {
              const pattern = patterns[i];
              // Look for about the same center and module size
              if (pattern.equals(offsetX, offsetY, width, height)) {
                patterns[i] = pattern.combine(offsetX, offsetY, width, height);
                return true;
              }
            }
            // Hadn't found this before; save it
            patterns.push(new Pattern(offsetX, offsetY, width, height, this.#modules));
            return true;
          }
        }
      }
      return false;
    }
  }

  /**
   * @module PlotLine
   */
  // Mild variant of Bresenham's algorithm
  // see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
  class PlotLine {
    #to;
    #from;
    #limit;
    #steep;
    #diff;
    #delta;
    constructor(from, to) {
      let toX = toInt32(to.x);
      let toY = toInt32(to.y);
      let fromX = toInt32(from.x);
      let fromY = toInt32(from.y);
      const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
      // Steep line
      if (steep) {
        [fromX, fromY, toX, toY] = [fromY, fromX, toY, toX];
      }
      const deltaX = fromX < toX ? 1 : -1;
      this.#steep = steep;
      this.#limit = toX + deltaX;
      this.#to = new Point(toX, toY);
      this.#from = new Point(fromX, fromY);
      this.#delta = [deltaX, fromY < toY ? 1 : -1];
      this.#diff = [Math.abs(toX - fromX), Math.abs(toY - fromY)];
    }
    get to() {
      return this.#to;
    }
    get from() {
      return this.#from;
    }
    get steep() {
      return this.#steep;
    }
    get delta() {
      return this.#delta;
    }
    *points() {
      const limit = this.#limit;
      const steep = this.#steep;
      const { y: toY } = this.#to;
      const [xDiff, yDiff] = this.#diff;
      const [deltaX, deltaY] = this.#delta;
      const { x: fromX, y: fromY } = this.#from;
      let error = toInt32(-xDiff / 2);
      // Loop up until x === toX, but not beyond
      for (let x = fromX, y = fromY; x !== limit; x += deltaX) {
        yield [steep ? y : x, steep ? x : y];
        error += yDiff;
        if (error > 0) {
          if (y === toY) {
            break;
          }
          y += deltaY;
          error -= xDiff;
        }
      }
    }
  }

  /**
   * @module timing
   */
  function calculateTimingRatio(axis, control) {
    return control > axis ? 1 : control < axis ? -1 : 0;
  }
  function getTimingPointXAxis({ x, rect }, ratio) {
    const [, right, , left] = rect;
    return ratio > 0 ? right : ratio < 0 ? left : x;
  }
  function getTimingPointYAxis({ y, rect }, ratio) {
    const [top, , bottom] = rect;
    return ratio > 0 ? bottom : ratio < 0 ? top : y;
  }
  function calculateTimingLine(start, end, control, isVertical) {
    const { x: endX, y: endY } = end;
    const { x: startX, y: startY } = start;
    const { x: controlX, y: controlY } = control;
    const xRatio = calculateTimingRatio(endX, controlX);
    const yRatio = calculateTimingRatio(endY, controlY);
    const endXTranslate = getTimingPointXAxis(end, xRatio);
    const endYTranslate = getTimingPointYAxis(end, yRatio);
    const startXTranslate = getTimingPointXAxis(start, xRatio);
    const startYTranslate = getTimingPointYAxis(start, yRatio);
    if (xRatio === 0 || yRatio === 0) {
      return [new Point(startXTranslate, startYTranslate), new Point(endXTranslate, endYTranslate)];
    }
    if (isVertical ? xRatio === yRatio : xRatio !== yRatio) {
      return [new Point(startX, startYTranslate), new Point(endX, endYTranslate)];
    }
    return [new Point(startXTranslate, startY), new Point(endXTranslate, endY)];
  }
  function checkPixelsInTimingLine(matrix, { topLeft, topRight, bottomLeft, moduleSize }, isVertical) {
    const [start, end] = isVertical
      ? calculateTimingLine(topLeft, bottomLeft, topRight, true)
      : calculateTimingLine(topLeft, topRight, bottomLeft);
    const points = new PlotLine(start, end).points();
    const maxRepeatPixels = Math.ceil(moduleSize[isVertical ? 1 : 0] * 3);
    let count = 0;
    let modules = 0;
    let lastBit = matrix.get(toInt32(start.x), toInt32(start.y));
    for (const [x, y] of points) {
      const bit = matrix.get(x, y);
      if (bit === lastBit) {
        count++;
      } else {
        modules++;
        if ((modules > 1 && count > maxRepeatPixels) || modules > 165) {
          return false;
        }
        count = 1;
        lastBit = bit;
      }
    }
    return modules >= 7;
  }

  /**
   * @module module
   */
  function calculateModuleSize(moduleSize) {
    return (moduleSize[0] + moduleSize[1]) / 2;
  }
  function sizeOfBlackWhiteBlackRun(matrix, from, to) {
    const line = new PlotLine(from, to);
    const points = line.points();
    // In black pixels, looking for white, first or second time.
    let state = 0;
    for (const [x, y] of points) {
      // Does current pixel mean we have moved white to black or vice versa?
      // Scanning black in state 0,2 and white in state 1, so if we find the wrong
      // color, advance to next state or end if we are in state 2 already
      if ((state === 1) === (matrix.get(x, y) === 1)) {
        if (state === 2) {
          return distance(new Point(x, y), from);
        }
        state++;
      }
    }
    to = line.to;
    from = line.from;
    const [deltaX] = line.delta;
    // Found black-white-black; give the benefit of the doubt that the next pixel outside the image
    // is "white" so this last point at (toX+xStep,toY) is the right ending. This is really a
    // small approximation; (toX+xStep,toY+yStep) might be really correct. Ignore this.
    if (state === 2) {
      return distance(new Point(to.x + deltaX, to.y), from);
    }
    return NaN;
  }
  function sizeOfBlackWhiteBlackRunBothWays(matrix, from, to) {
    // Now count other way -- don't run off image though of course
    const { x: toX, y: toY } = to;
    const { width, height } = matrix;
    const { x: fromX, y: fromY } = from;
    let scale = 1;
    let otherToX = fromX - (toX - fromX);
    let size = sizeOfBlackWhiteBlackRun(matrix, from, to);
    if (Number.isNaN(size)) {
      return NaN;
    }
    if (otherToX < 0) {
      scale = fromX / (fromX - otherToX);
      otherToX = 0;
    } else if (otherToX >= width) {
      scale = (width - 1 - fromX) / (otherToX - fromX);
      otherToX = width - 1;
    }
    let otherToY = toInt32(fromY - (toY - fromY) * scale);
    scale = 1;
    if (otherToY < 0) {
      scale = fromY / (fromY - otherToY);
      otherToY = 0;
    } else if (otherToY >= height) {
      scale = (height - 1 - fromY) / (otherToY - fromY);
      otherToY = height - 1;
    }
    otherToX = toInt32(fromX + (otherToX - fromX) * scale);
    // Middle pixel is double-counted this way; subtract 1
    size += sizeOfBlackWhiteBlackRun(matrix, from, new Point(otherToX, otherToY));
    return size - 1;
  }
  function calculateModuleSizeOneWay(matrix, pattern1, pattern2) {
    const point1 = new Point(toInt32(pattern1.x), toInt32(pattern1.y));
    const point2 = new Point(toInt32(pattern2.x), toInt32(pattern2.y));
    const expectModuleSize1 = sizeOfBlackWhiteBlackRunBothWays(matrix, point1, point2);
    const expectModuleSize2 = sizeOfBlackWhiteBlackRunBothWays(matrix, point2, point1);
    if (Number.isNaN(expectModuleSize1)) {
      return expectModuleSize2 / 7;
    }
    if (Number.isNaN(expectModuleSize2)) {
      return expectModuleSize1 / 7;
    }
    // Average them, and divide by 7 since we've counted the width of 3 black modules,
    // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
    return (expectModuleSize1 + expectModuleSize2) / 14;
  }

  /**
   * @module FinderPatternGroup
   */
  class FinderPatternGroup {
    #size;
    #patterns;
    #moduleSize;
    constructor(matrix, patterns) {
      const ordered = orderFinderPatterns(patterns);
      const [topLeft, topRight, bottomLeft] = ordered;
      this.#patterns = ordered;
      this.#moduleSize = [
        calculateModuleSizeOneWay(matrix, topLeft, topRight),
        calculateModuleSizeOneWay(matrix, topLeft, bottomLeft)
      ];
      this.#size = calculateSymbolSize(ordered, this.#moduleSize);
    }
    get size() {
      return this.#size;
    }
    get topLeft() {
      return this.#patterns[0];
    }
    get topRight() {
      return this.#patterns[1];
    }
    get bottomLeft() {
      return this.#patterns[2];
    }
    get moduleSize() {
      return this.#moduleSize;
    }
  }
  function crossProductZ(pattern1, pattern2, pattern3) {
    const { x, y } = pattern2;
    return (pattern3.x - x) * (pattern1.y - y) - (pattern3.y - y) * (pattern1.x - x);
  }
  function orderFinderPatterns(patterns) {
    let topLeft;
    let topRight;
    let bottomLeft;
    // Find distances between pattern centers
    const [pattern1, pattern2, pattern3] = patterns;
    const oneTwoDistance = distance(pattern1, pattern2);
    const twoThreeDistance = distance(pattern2, pattern3);
    const oneThreeDistance = distance(pattern1, pattern3);
    // Assume one closest to other two is B; A and C will just be guesses at first
    if (twoThreeDistance >= oneTwoDistance && twoThreeDistance >= oneThreeDistance) {
      [topLeft, bottomLeft, topRight] = patterns;
    } else if (oneThreeDistance >= twoThreeDistance && oneThreeDistance >= oneTwoDistance) {
      [bottomLeft, topLeft, topRight] = patterns;
    } else {
      [bottomLeft, topRight, topLeft] = patterns;
    }
    // Use cross product to figure out whether A and C are correct or flipped.
    // This asks whether BC x BA has a positive z component, which is the arrangement
    // we want for A, B, C. If it's negative, then we've got it flipped around and
    // should swap A and C.
    if (crossProductZ(bottomLeft, topLeft, topRight) < 0) {
      [bottomLeft, topRight] = [topRight, bottomLeft];
    }
    return [topLeft, topRight, bottomLeft];
  }
  function calculateSymbolSize([topLeft, topRight, bottomLeft], moduleSize) {
    const width = distance(topLeft, topRight);
    const height = distance(topLeft, bottomLeft);
    const moduleSizeAvg = calculateModuleSize(moduleSize);
    const size = round((width + height) / 2 / moduleSizeAvg) + 7;
    // mod 4
    switch (size & 0x03) {
      case 0:
        return size + 1;
      case 2:
        return size - 1;
      case 3:
        if (size + 2 <= MAX_VERSION_SIZE) {
          return size + 2;
        }
        if (size - 2 >= MIN_VERSION_SIZE) {
          return size - 2;
        }
        return NaN;
    }
    return size;
  }

  /**
   * @module FinderPatternMatcher
   */
  class FinderPatternMatcher extends PatternMatcher {
    constructor(matrix, strict) {
      super(matrix, 7, isMatchFinderPattern, strict);
    }
    match(x, y, scanline) {
      return super.match(x, y, scanline, scanline[2]);
    }
    groups() {
      const patterns = this.patterns.filter(({ combined }) => combined >= 3);
      const finderPatternGroups = [];
      const { length } = patterns;
      // Find enough finder patterns
      if (length >= 3) {
        // Max i1
        const maxI1 = length - 2;
        // Max i2
        const maxI2 = length - 1;
        // Sort patterns
        patterns.sort((pattern1, pattern2) => pattern2.width - pattern1.width);
        for (let i1 = 0; i1 < maxI1; i1++) {
          const pattern1 = patterns[i1];
          const width1 = pattern1.width;
          const height1 = pattern1.height;
          for (let i2 = i1 + 1; i2 < maxI2; i2++) {
            const pattern2 = patterns[i2];
            const width2 = pattern2.width;
            const height2 = pattern2.height;
            if (!isEqualsSize(width1, width2, DIFF_EDGE_RATIO)) {
              break;
            }
            if (!isEqualsSize(height1, height2, DIFF_EDGE_RATIO)) {
              continue;
            }
            for (let i3 = i2 + 1; i3 < length; i3++) {
              const pattern3 = patterns[i3];
              if (!isEqualsSize(width2, pattern3.width, DIFF_EDGE_RATIO)) {
                break;
              }
              if (!isEqualsSize(height2, pattern3.height, DIFF_EDGE_RATIO)) {
                continue;
              }
              const { matrix } = this;
              const finderPatternGroup = new FinderPatternGroup(matrix, [pattern1, pattern2, pattern3]);
              const { size, moduleSize } = finderPatternGroup;
              if (Number.isNaN(size) || size < MIN_VERSION_SIZE || size > MAX_VERSION_SIZE) {
                continue;
              }
              const [moduleSize1, moduleSize2] = moduleSize;
              // Invalid module size
              if (Number.isNaN(moduleSize1) || Number.isNaN(moduleSize2) || moduleSize1 < 1 || moduleSize2 < 1) {
                continue;
              }
              if (
                checkPixelsInTimingLine(matrix, finderPatternGroup) &&
                checkPixelsInTimingLine(matrix, finderPatternGroup, true)
              ) {
                // All tests passed!
                finderPatternGroups.push(finderPatternGroup);
              }
            }
          }
        }
      }
      return finderPatternGroups;
    }
  }

  /**
   * @module AlignmentPatternMatcher
   */
  class AlignmentPatternMatcher extends PatternMatcher {
    constructor(matrix, strict) {
      super(matrix, 5, isMatchAlignmentPattern, strict);
    }
    match(x, y, scanline) {
      scanline = scanline.slice(-3);
      return super.match(x, y, scanline, scanline[1]);
    }
    filter({ size, moduleSize, topLeft, topRight, bottomLeft }) {
      const { matrix } = this;
      const { x, y } = topLeft;
      // Look for an alignment pattern (10 modules in size) around where it should be
      const correctionToTopLeft = 1 - 3 / (size - 7);
      const bottomRightX = topRight.x - x + bottomLeft.x;
      const bottomRightY = topRight.y - y + bottomLeft.y;
      const moduleSizeAvg = calculateModuleSize(moduleSize);
      const alignmentAreaAllowance = Math.ceil(moduleSizeAvg * 10);
      const expectAlignmentX = x + correctionToTopLeft * (bottomRightX - x);
      const expectAlignmentY = y + correctionToTopLeft * (bottomRightY - y);
      const alignmentAreaTopY = Math.max(0, expectAlignmentY - alignmentAreaAllowance);
      const alignmentAreaLeftX = Math.max(0, expectAlignmentX - alignmentAreaAllowance);
      const alignmentAreaRightX = Math.min(matrix.width - 1, expectAlignmentX + alignmentAreaAllowance);
      const alignmentAreaBottomY = Math.min(matrix.height - 1, expectAlignmentY + alignmentAreaAllowance);
      const alignmentAreaTopLeft = new Point(alignmentAreaLeftX, alignmentAreaTopY);
      const alignmentAreaTopRight = new Point(alignmentAreaRightX, alignmentAreaTopY);
      const alignmentAreaBottomRight = new Point(alignmentAreaRightX, alignmentAreaBottomY);
      const alignmentAreaBottomLeft = new Point(alignmentAreaLeftX, alignmentAreaBottomY);
      const patterns = this.patterns.filter(pattern => {
        const [xModuleSize, yModuleSize] = pattern.moduleSize;
        return (
          isEqualsSize(xModuleSize, moduleSizeAvg, DIFF_MODULE_SIZE_RATIO) &&
          isEqualsSize(yModuleSize, moduleSizeAvg, DIFF_MODULE_SIZE_RATIO) &&
          isPointInQuadrangle(
            pattern,
            alignmentAreaTopLeft,
            alignmentAreaTopRight,
            alignmentAreaBottomRight,
            alignmentAreaBottomLeft
          )
        );
      });
      if (patterns.length > 1) {
        const expectAlignment = new Point(expectAlignmentX, expectAlignmentX);
        patterns.sort((pattern1, pattern2) => {
          return distance(pattern1, expectAlignment) - distance(pattern2, expectAlignment);
        });
      }
      return patterns;
    }
  }

  /**
   * @module Detector
   */
  class Detector {
    #options;
    constructor(options = {}) {
      this.#options = options;
    }
    detect(matrix) {
      const { strict } = this.#options;
      const { width, height } = matrix;
      const finderMatcher = new FinderPatternMatcher(matrix, strict);
      const alignmentMatcher = new AlignmentPatternMatcher(matrix, strict);
      const match = (x, y, lastBit, scanline, count) => {
        scanlineUpdate(scanline, count);
        // Match pattern
        if (lastBit) {
          finderMatcher.match(x, y, scanline);
        } else {
          alignmentMatcher.match(x, y, scanline);
        }
      };
      for (let y = 0; y < height; y++) {
        let x = 0;
        // Burn off leading white pixels before anything else; if we start in the middle of
        // a white run, it doesn't make sense to count its length, since we don't know if the
        // white run continued to the left of the start point
        while (x < width && !matrix.get(x, y)) {
          x++;
        }
        let count = 0;
        let lastBit = matrix.get(x, y);
        const scanline = [0, 0, 0, 0, 0];
        while (x < width) {
          const bit = matrix.get(x, y);
          if (bit === lastBit) {
            count++;
          } else {
            match(x, y, lastBit, scanline, count);
            count = 1;
            lastBit = bit;
          }
          x++;
        }
        match(x, y, lastBit, scanline, count);
      }
      return detect(matrix, finderMatcher, alignmentMatcher);
    }
  }
  function detect(matrix, finderMatcher, alignmentMatcher) {
    const detected = [];
    const finderPatternGroups = finderMatcher.groups();
    for (const finderPatternGroup of finderPatternGroups) {
      const { size } = finderPatternGroup;
      const version = fromVersionSize(size);
      // Find alignment
      if (version.alignmentPatterns.length > 0) {
        // Kind of arbitrary -- expand search radius before giving up
        // If we didn't find alignment pattern... well try anyway without it
        const alignmentPatterns = alignmentMatcher.filter(finderPatternGroup);
        // Founded alignment
        for (const alignmentPattern of alignmentPatterns) {
          detected.push(new Detect(matrix, finderPatternGroup, alignmentPattern));
        }
      }
      // No alignment version and fallback
      detected.push(new Detect(matrix, finderPatternGroup));
    }
    return detected;
  }

  /**
   * @module Hanzi
   */
  const GB2312_MAPPING = getEncodingMapping(
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
  function getHanziCode(character) {
    const code = GB2312_MAPPING.get(character);
    return code != null ? code : -1;
  }
  class Hanzi {
    #content;
    constructor(content) {
      assertContent(content);
      this.#content = content;
    }
    get mode() {
      return Mode.HANZI;
    }
    get content() {
      return this.#content;
    }
    encode() {
      const bits = new BitArray();
      const content = this.#content;
      // GB/T 18284-2000.
      for (const character of content) {
        let code = getHanziCode(character);
        // For characters with GB2312 values from 0xa1a1 to 0xaafe.
        if (code >= 0xa1a1 && code <= 0xaafe) {
          // Subtract 0xa1a1 from GB2312 value.
          code -= 0xa1a1;
          // For characters with GB2312 values from 0xb0a1 to 0xfafe.
        } else if (code >= 0xb0a1 && code <= 0xfafe) {
          // Subtract 0xa6a1 from GB2312 value.
          code -= 0xa6a1;
        } else {
          throw new Error(`illegal hanzi character: ${character}`);
        }
        // Multiply most significant byte of result by 0x60 and add least significant byte to product.
        code = (code >> 8) * 0x60 + (code & 0xff);
        // Convert result to a 13-bit binary string.
        bits.append(code, 13);
      }
      return bits;
    }
  }

  /**
   * @module Kanji
   */
  const SHIFT_JIS_MAPPING = getEncodingMapping(
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
  function getKanjiCode(character) {
    const code = SHIFT_JIS_MAPPING.get(character);
    return code != null ? code : -1;
  }
  class Kanji {
    #content;
    constructor(content) {
      assertContent(content);
      this.#content = content;
    }
    get mode() {
      return Mode.KANJI;
    }
    get content() {
      return this.#content;
    }
    encode() {
      const bits = new BitArray();
      const content = this.#content;
      for (const character of content) {
        let code = getKanjiCode(character);
        // For characters with Shift JIS values from 0x8140 to 0x9ffc.
        if (code >= 0x8140 && code <= 0x9ffc) {
          // Subtract 0x8140 from Shift JIS value.
          code -= 0x8140;
          // For characters with Shift JIS values from 0xe040 to 0xebbf.
        } else if (code >= 0xe040 && code <= 0xebbf) {
          // Subtract 0xc140 from Shift JIS value.
          code -= 0xc140;
        } else {
          throw new Error(`illegal kanji character: ${character}`);
        }
        // Multiply most significant byte of result by 0xc0 and add least significant byte to product.
        code = (code >> 8) * 0xc0 + (code & 0xff);
        // Convert result to a 13-bit binary string.
        bits.append(code, 13);
      }
      return bits;
    }
  }

  /**
   * @module Numeric
   */
  const NUMERIC_MAPPING = getCharactersMapping(NUMERIC_CHARACTERS);
  function getNumericCode(character) {
    const code = NUMERIC_MAPPING.get(character);
    if (code != null) {
      return code;
    }
    throw new Error(`illegal numeric character: ${character}`);
  }
  class Numeric {
    #content;
    constructor(content) {
      assertContent(content);
      this.#content = content;
    }
    get mode() {
      return Mode.NUMERIC;
    }
    get content() {
      return this.#content;
    }
    encode() {
      const bits = new BitArray();
      const content = this.#content;
      const { length } = content;
      for (let i = 0; i < length; ) {
        const code1 = getNumericCode(content.charAt(i));
        if (i + 2 < length) {
          // Encode three numeric letters in ten bits.
          const code2 = getNumericCode(content.charAt(i + 1));
          const code3 = getNumericCode(content.charAt(i + 2));
          bits.append(code1 * 100 + code2 * 10 + code3, 10);
          i += 3;
        } else if (i + 1 < length) {
          // Encode two numeric letters in seven bits.
          const code2 = getNumericCode(content.charAt(i + 1));
          bits.append(code1 * 10 + code2, 7);
          i += 2;
        } else {
          // Encode one numeric letter in four bits.
          bits.append(code1, 4);
          i++;
        }
      }
      return bits;
    }
  }

  /**
   * @module Alphanumeric
   */
  const ALPHANUMERIC_MAPPING = getCharactersMapping(ALPHANUMERIC_CHARACTERS);
  function getAlphanumericCode(character) {
    const code = ALPHANUMERIC_MAPPING.get(character);
    if (code != null) {
      return code;
    }
    throw new Error(`illegal alphanumeric character: ${character}`);
  }
  class Alphanumeric {
    #content;
    constructor(content) {
      assertContent(content);
      this.#content = content;
    }
    get mode() {
      return Mode.ALPHANUMERIC;
    }
    get content() {
      return this.#content;
    }
    encode() {
      const bits = new BitArray();
      const content = this.#content;
      const { length } = content;
      for (let i = 0; i < length; ) {
        const code1 = getAlphanumericCode(content.charAt(i));
        if (i + 1 < length) {
          const code2 = getAlphanumericCode(content.charAt(i + 1));
          // Encode two alphanumeric letters in 11 bits.
          bits.append(code1 * 45 + code2, 11);
          i += 2;
        } else {
          // Encode one alphanumeric letter in six bits.
          bits.append(code1, 6);
          i++;
        }
      }
      return bits;
    }
  }

  // /**
  //  * @module binarize
  //  * @see https://github.com/FujiHaruka/node-adaptive-threshold
  //  */
  function grayscale(colors, width, height) {
    const pixels = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      const offset = y * width;
      for (let x = 0; x < width; x++) {
        const index = offset + x;
        const colorIndex = index * 4;
        const r = colors[colorIndex];
        const g = colors[colorIndex + 1];
        const b = colors[colorIndex + 2];
        pixels[index] = r * 0.2126 + g * 0.7152 + b * 0.0722;
      }
    }
    return pixels;
  }
  function calcLocalAverages(pixels, width, height, size) {
    const sums = [];
    for (let y = 0; y < height; y++) {
      const offset = y * width;
      const sum = new Float32Array(width);
      for (let x = 0; x < size; x++) {
        sum[0] += pixels[offset + x];
      }
      for (let end = size; end < width; end++) {
        const start = end - size + 1;
        sum[start] = sum[start - 1] + pixels[offset + end] - pixels[offset + start - 1];
      }
      sums[y] = sum;
    }
    const averagesWidth = width - size + 1;
    const averagesHeight = height - size + 1;
    const averages = new Float32Array(averagesWidth * averagesHeight);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < averagesWidth; x++) {
        // Set x, 0
        averages[x] += sums[y][x];
      }
    }
    for (let y = 1; y < averagesHeight; y++) {
      const offset = y * averagesWidth;
      const prevOffset = offset - averagesWidth;
      for (let x = 0; x < averagesWidth; x++) {
        averages[offset + x] = averages[prevOffset + x] - sums[y - 1][x] + sums[y + size - 1][x];
      }
    }
    // Devide
    for (let y = 0; y < averagesHeight; y++) {
      const offset = y * averagesWidth;
      for (let x = 0; x < averagesWidth; x++) {
        averages[offset + x] /= size * size;
      }
    }
    return [averages, averagesWidth, averagesHeight];
  }
  function binarizer({ width, height, data }, { size = 24, compensation = 8 } = {}) {
    const middleSize = toInt32(size / 2);
    const binarized = new BitMatrix(width, height);
    const grayscaled = grayscale(data, width, height);
    const [averages, averagesWidth, averagesHeight] = calcLocalAverages(grayscaled, width, height, size);
    for (let y = 0; y < height; y++) {
      const offset = y * width;
      for (let x = 0; x < width; x++) {
        let averageX = x - middleSize;
        let averageY = y - middleSize;
        const pixel = grayscaled[offset + x];
        if (x - middleSize < 0) {
          averageX = 0;
        } else if (x - middleSize >= averagesWidth) {
          averageX = averagesWidth - 1;
        } else if (y - middleSize < 0) {
          averageY = 0;
        } else if (y - middleSize > averagesHeight) {
          averageY = averagesHeight - 1;
        }
        const average = averages[averageY * averagesWidth + averageX];
        if (pixel < average - compensation) {
          binarized.set(x, y);
        }
      }
    }
    return binarized;
  }

  exports.Alphanumeric = Alphanumeric;
  exports.BitMatrix = BitMatrix;
  exports.Byte = Byte;
  exports.Charset = Charset;
  exports.Decoder = Decoder;
  exports.Detector = Detector;
  exports.Encoder = Encoder;
  exports.Hanzi = Hanzi;
  exports.Kanji = Kanji;
  exports.Numeric = Numeric;
  exports.binarize = binarize;
  exports.binarizer = binarizer;
});
