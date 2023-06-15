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
      for (const value of values) {
        VALUES_TO_CHARSET.set(value, this);
      }
      this.#label = label;
      this.#values = values;
    }
    get label() {
      return this.#label;
    }
    get values() {
      return this.#values;
    }
  }

  /**
   * @module Mode
   */
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
  // vertical and horizontal orders respectively.
  function applyMaskPenaltyRule1Internal(matrix, isHorizontal) {
    let penalty = 0;
    let { width, height } = matrix;
    width = isHorizontal ? width : height;
    height = isHorizontal ? height : width;
    for (let y = 0; y < height; y++) {
      let prevBit = -1;
      let numSameBitCells = 0;
      for (let x = 0; x < width; x++) {
        const bit = isHorizontal ? matrix.get(x, y) : matrix.get(y, x);
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
    return applyMaskPenaltyRule1Internal(matrix, true) + applyMaskPenaltyRule1Internal(matrix, false);
  }
  // Apply mask penalty rule 2 and return the penalty. Find 2x2 blocks with the same color and give
  // penalty to them. This is actually equivalent to the spec's rule, which is to find MxN blocks and give a
  // penalty proportional to (M-1)x(N-1), because this is the number of 2x2 blocks inside such a block.
  function applyMaskPenaltyRule2(matrix) {
    let penalty = 0;
    const width = matrix.width - 1;
    const height = matrix.height - 1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
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
  function isFourWhite(matrix, offset, from, to, isHorizontal) {
    if (from < 0 || to > (isHorizontal ? matrix.width : matrix.height)) {
      return false;
    }
    for (let i = from; i < to; i++) {
      if (isHorizontal ? isDark(matrix, i, offset) : isDark(matrix, offset, i)) {
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
    const { width, height } = matrix;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (
          // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000
          x + 6 < width &&
          isDark(matrix, x, y) &&
          !isDark(matrix, x + 1, y) &&
          isDark(matrix, x + 2, y) &&
          isDark(matrix, x + 3, y) &&
          isDark(matrix, x + 4, y) &&
          !isDark(matrix, x + 5, y) &&
          isDark(matrix, x + 6, y) &&
          (isFourWhite(matrix, y, x - 4, x, true) || isFourWhite(matrix, y, x + 7, x + 11, true))
        ) {
          numPenalties++;
        }
        if (
          // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000
          y + 6 < height &&
          isDark(matrix, x, y) &&
          !isDark(matrix, x, y + 1) &&
          isDark(matrix, x, y + 2) &&
          isDark(matrix, x, y + 3) &&
          isDark(matrix, x, y + 4) &&
          !isDark(matrix, x, y + 5) &&
          isDark(matrix, x, y + 6) &&
          (isFourWhite(matrix, x, y - 4, y, false) || isFourWhite(matrix, x, y + 7, y + 11, false))
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
    const { width, height } = matrix;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (isDark(matrix, x, y)) {
          numDarkCells++;
        }
      }
    }
    const numTotalCells = width * height;
    const fivePercentVariances = Math.floor((Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells);
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
        intermediate = (y + x) & 0x1;
        break;
      case 1:
        intermediate = y & 0x1;
        break;
      case 2:
        intermediate = x % 3;
        break;
      case 3:
        intermediate = (y + x) % 3;
        break;
      case 4:
        intermediate = (Math.floor(y / 2) + Math.floor(x / 3)) & 0x1;
        break;
      case 5:
        temporary = y * x;
        intermediate = (temporary & 0x1) + (temporary % 3);
        break;
      case 6:
        temporary = y * x;
        intermediate = ((temporary & 0x1) + (temporary % 3)) & 0x1;
        break;
      case 7:
        intermediate = (((y * x) % 3) + ((y + x) & 0x1)) & 0x1;
        break;
      default:
        throw new Error(`illegal mask: ${mask}`);
    }
    return intermediate === 0;
  }

  /**
   * @module BitArray
   */
  const LOAD_FACTOR = 0.75;
  function makeArray(length) {
    return new Int32Array(Math.floor((length + 31) / 32));
  }
  class BitArray {
    #length;
    #bits;
    constructor(length = 0) {
      this.#length = length;
      this.#bits = makeArray(length);
    }
    #offset(index) {
      return Math.floor(index / 32);
    }
    #alloc(length) {
      const bits = this.#bits;
      if (length > bits.length * 32) {
        const newBits = makeArray(Math.ceil(length / LOAD_FACTOR));
        newBits.set(bits);
        this.#bits = newBits;
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
      const offset = this.#offset(index);
      this.#bits[offset] |= 1 << (index & 0x1f);
    }
    get(index) {
      const offset = this.#offset(index);
      return (this.#bits[offset] >>> (index & 0x1f)) & 1;
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
          if ((value >>> i) & 1) {
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
  // From Appendix E. Table 1, JIS0510X:2004 (p 71).
  const POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170] // Version 40
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
    matrix.set(8, matrix.height - 8, 1);
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
    const { width, height } = matrix;
    // Left top corner.
    embedPositionDetectionPattern(matrix, 0, 0);
    // Right top corner.
    embedPositionDetectionPattern(matrix, width - pdpWidth, 0);
    // Left bottom corner.
    embedPositionDetectionPattern(matrix, 0, width - pdpWidth);
    // Left top corner.
    embedHorizontalSeparationPattern(matrix, 0, hspWidth - 1);
    // Right top corner.
    embedHorizontalSeparationPattern(matrix, width - hspWidth, hspWidth - 1);
    // Left bottom corner.
    embedHorizontalSeparationPattern(matrix, 0, width - hspWidth);
    // Left top corner.
    embedVerticalSeparationPattern(matrix, vspHeight, 0);
    // Right top corner.
    embedVerticalSeparationPattern(matrix, height - vspHeight - 1, 0);
    // Left bottom corner.
    embedVerticalSeparationPattern(matrix, vspHeight, height - vspHeight);
  }
  function embedTimingPatterns(matrix) {
    const width = matrix.width - 8;
    const height = matrix.height - 8;
    // -8 is for skipping position detection patterns (7: size)
    // separation patterns (1: size). Thus, 8 = 7 + 1.
    for (let x = 8; x < width; x++) {
      const bit = (x + 1) & 1;
      // Horizontal line.
      if (isEmpty(matrix, x, 6)) {
        matrix.set(x, 6, bit);
      }
    }
    // -8 is for skipping position detection patterns (7: size)
    // separation patterns (1: size). Thus, 8 = 7 + 1.
    for (let y = 8; y < height; y++) {
      const bit = (y + 1) & 1;
      // Vertical line.
      if (isEmpty(matrix, 6, y)) {
        matrix.set(6, y, bit);
      }
    }
  }
  // Embed position adjustment patterns if need be.
  function embedPositionAdjustmentPatterns(matrix, { version }) {
    if (version >= 2) {
      const coordinates = POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[version - 1];
      const { length } = coordinates;
      for (let i = 0; i < length; i++) {
        const y = coordinates[i];
        for (let j = 0; j < length; j++) {
          const x = coordinates[j];
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
    const { width, height } = matrix;
    const { length } = formatInfoBits;
    for (let i = 0; i < length; i++) {
      // Type info bits at the left top corner. See 8.9 of JISX0510:2004 (p.46).
      const [x, y] = FORMAT_INFO_COORDINATES[i];
      // Place bits in LSB to MSB order. LSB (least significant bit) is the last value in formatInfoBits.
      const bit = formatInfoBits.get(length - 1 - i);
      matrix.set(x, y, bit);
      if (i < 8) {
        // Right top corner.
        matrix.set(width - i - 1, 8, bit);
      } else {
        // Left bottom corner.
        matrix.set(8, height - 7 + (i - 8), bit);
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
      const { height } = matrix;
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
          // Place bits in LSB (least significant bit) to MSB order.
          const bit = versionInfoBits.get(bitIndex--);
          // Left bottom corner.
          matrix.set(i, height - 11 + j, bit);
          // Right bottom corner.
          matrix.set(height - 11 + j, i, bit);
        }
      }
    }
  }
  // Embed "dataBits" using "getMaskPattern". On success, modify the matrix.
  // See 8.7 of JISX0510:2004 (p.38) for how to embed data bits.
  function embedDataBits(matrix, dataBits, mask) {
    let bitIndex = 0;
    const { length } = dataBits;
    const { width, height } = matrix;
    // Start from the right bottom cell.
    for (let x = width - 1; x >= 1; x -= 2) {
      // Skip the vertical timing pattern.
      if (x === 6) {
        x = 5;
      }
      for (let y = 0; y < height; y++) {
        for (let i = 0; i < 2; i++) {
          const offsetX = x - i;
          const upward = ((x + 1) & 2) === 0;
          const offsetY = upward ? height - 1 - y : y;
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
    #ecBytes;
    #dataBytes;
    constructor(dataBytes, ecBytes) {
      this.#ecBytes = ecBytes;
      this.#dataBytes = dataBytes;
    }
    get ecBytes() {
      return this.#ecBytes;
    }
    get dataBytes() {
      return this.#dataBytes;
    }
  }

  /**
   * @module ECB
   */
  class ECB {
    #count;
    #dataCodewords;
    constructor(count, dataCodewords) {
      this.#count = count;
      this.#dataCodewords = dataCodewords;
    }
    get count() {
      return this.#count;
    }
    get dataCodewords() {
      return this.#dataCodewords;
    }
  }

  /**
   * @module ECBlocks
   */
  class ECBlocks {
    #ecBlocks;
    #numBlocks;
    #totalECCodewords;
    #totalDataCodewords;
    #ecCodewordsPerBlock;
    constructor(ecCodewordsPerBlock, ...ecBlocks) {
      let numBlocks = 0;
      let totalDataCodewords = 0;
      for (const { count, dataCodewords } of ecBlocks) {
        numBlocks += count;
        totalDataCodewords += count * dataCodewords;
      }
      this.#ecBlocks = ecBlocks;
      this.#numBlocks = numBlocks;
      this.#totalDataCodewords = totalDataCodewords;
      this.#ecCodewordsPerBlock = ecCodewordsPerBlock;
      this.#totalECCodewords = ecCodewordsPerBlock * numBlocks;
    }
    get ecBlocks() {
      return this.#ecBlocks;
    }
    get numBlocks() {
      return this.#numBlocks;
    }
    get totalECCodewords() {
      return this.#totalECCodewords;
    }
    get totalDataCodewords() {
      return this.#totalDataCodewords;
    }
    get ecCodewordsPerBlock() {
      return this.#ecCodewordsPerBlock;
    }
  }

  /**
   * @module Version
   */
  class Version {
    #version;
    #dimension;
    #ecBlocks;
    #totalCodewords;
    #alignmentPatterns;
    constructor(version, alignmentPatterns, ...ecBlocks) {
      const [ecBlock] = ecBlocks;
      this.#version = version;
      this.#ecBlocks = ecBlocks;
      this.#dimension = 17 + 4 * version;
      this.#alignmentPatterns = alignmentPatterns;
      // Version determines the Total codewords
      // All ecc level total codewords are equals
      this.#totalCodewords = ecBlock.totalECCodewords + ecBlock.totalDataCodewords;
    }
    get version() {
      return this.#version;
    }
    get dimension() {
      return this.#dimension;
    }
    get totalCodewords() {
      return this.#totalCodewords;
    }
    get alignmentPatterns() {
      return this.#alignmentPatterns;
    }
    getECBlocksForECLevel({ level }) {
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

  /**
   * @module GenericGFPoly
   */
  class GenericGFPoly {
    #field;
    #coefficients;
    constructor(field, coefficients) {
      const { length } = coefficients;
      if (length === 0) {
        throw new Error('coefficients cannot empty');
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
    getDegree() {
      return this.#coefficients.length - 1;
    }
    isZero() {
      return this.#coefficients[0] === 0;
    }
    getCoefficient(degree) {
      const coefficients = this.#coefficients;
      return coefficients[coefficients.length - 1 - degree];
    }
    evaluateAt(a) {
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
      if (smallerLength > largerLength) {
        [smallerLength, largerLength] = [largerLength, smallerLength];
        [smallerCoefficients, largerCoefficients] = [largerCoefficients, smallerCoefficients];
      }
      const sumDiff = new Int32Array(largerLength);
      const lengthDiff = largerLength - smallerLength;
      // Copy high-order terms only found in higher-degree polynomial's coefficients
      sumDiff.set(largerCoefficients.subarray(0, lengthDiff));
      for (let i = lengthDiff; i < largerLength; i++) {
        sumDiff[i] = smallerCoefficients[i - lengthDiff] ^ largerCoefficients[i];
      }
      return new GenericGFPoly(this.#field, sumDiff);
    }
    multiply(other) {
      const field = this.#field;
      if (other instanceof GenericGFPoly) {
        if (this.isZero() || other.isZero()) {
          return field.zero;
        }
        const aCoefficients = this.#coefficients;
        const aLength = aCoefficients.length;
        const bCoefficients = other.#coefficients;
        const bLength = bCoefficients.length;
        const product = new Int32Array(aLength + bLength - 1);
        for (let i = 0; i < aLength; i++) {
          const aCoefficient = aCoefficients[i];
          for (let j = 0; j < bLength; j++) {
            product[i + j] ^= field.multiply(aCoefficient, bCoefficients[j]);
          }
        }
        return new GenericGFPoly(field, product);
      }
      if (other === 0) {
        return field.zero;
      }
      if (other === 1) {
        return this;
      }
      const coefficients = this.#coefficients;
      const { length } = coefficients;
      const product = new Int32Array(length);
      for (let i = 0; i < length; i++) {
        product[i] = field.multiply(coefficients[i], other);
      }
      return new GenericGFPoly(field, product);
    }
    multiplyByMonomial(degree, coefficient) {
      if (degree < 0) {
        throw new Error('illegal monomial degree less than 0');
      }
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
      return new GenericGFPoly(field, product);
    }
    divide(other) {
      if (other.isZero()) {
        throw new Error('divide by 0');
      }
      const field = this.#field;
      let quotient = field.zero;
      let remainder = this;
      const denominatorLeadingTerm = other.getCoefficient(other.getDegree());
      const inverseDenominatorLeadingTerm = field.inverse(denominatorLeadingTerm);
      while (remainder.getDegree() >= other.getDegree() && !remainder.isZero()) {
        const degreeDifference = remainder.getDegree() - other.getDegree();
        const scale = field.multiply(remainder.getCoefficient(remainder.getDegree()), inverseDenominatorLeadingTerm);
        const term = other.multiplyByMonomial(degreeDifference, scale);
        const iterationQuotient = field.buildMonomial(degreeDifference, scale);
        quotient = quotient.addOrSubtract(iterationQuotient);
        remainder = remainder.addOrSubtract(term);
      }
      return [quotient, remainder];
    }
  }

  /**
   * @module GenericGF
   */
  class GenericGF {
    #size;
    #generator;
    #one;
    #zero;
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
      this.#one = new GenericGFPoly(this, new Int32Array([1]));
      this.#zero = new GenericGFPoly(this, new Int32Array([0]));
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
    buildMonomial(degree, coefficient) {
      if (degree < 0) {
        throw new Error('illegal monomial degree less than 0');
      }
      if (coefficient === 0) {
        return this.#zero;
      }
      const coefficients = new Int32Array(degree + 1);
      coefficients[0] = coefficient;
      return new GenericGFPoly(this, coefficients);
    }
    inverse(a) {
      if (a === 0) {
        throw new Error('illegal inverse argument equals 0');
      }
      return this.#expTable[this.#size - this.#logTable[a] - 1];
    }
    multiply(a, b) {
      if (a === 0 || b === 0) {
        return 0;
      }
      const logTable = this.#logTable;
      return this.#expTable[(logTable[a] + logTable[b]) % (this.#size - 1)];
    }
    exp(a) {
      return this.#expTable[a];
    }
    log(a) {
      if (a === 0) {
        throw new Error("can't take log(0)");
      }
      return this.#logTable[a];
    }
  }
  const QR_CODE_FIELD_256 = new GenericGF(0x011d, 256, 0);

  /**
   * @module Encoder
   */
  let Encoder$1 = class Encoder {
    #field;
    #generators;
    constructor(field = QR_CODE_FIELD_256) {
      this.#field = field;
      this.#generators = [new GenericGFPoly(field, new Int32Array([1]))];
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
          const nextGenerator = lastGenerator.multiply(new GenericGFPoly(field, coefficients));
          generators.push(nextGenerator);
          lastGenerator = nextGenerator;
        }
      }
      return generators[degree];
    }
    encode(received, ecBytes) {
      const dataBytes = received.length - ecBytes;
      const generator = this.#buildGenerator(ecBytes);
      const infoCoefficients = new Int32Array(dataBytes);
      infoCoefficients.set(received.subarray(0, dataBytes));
      const base = new GenericGFPoly(this.#field, infoCoefficients);
      const info = base.multiplyByMonomial(ecBytes, 1);
      const [, remainder] = info.divide(generator);
      const { coefficients } = remainder;
      const numZeroCoefficients = ecBytes - coefficients.length;
      const zeroCoefficientsOffset = dataBytes + numZeroCoefficients;
      received.fill(0, dataBytes, zeroCoefficientsOffset);
      received.set(coefficients, zeroCoefficientsOffset);
    }
  };

  /**
   * @module encoder
   */
  function getNumBytesInBlock(blockID, numRSBlocks, numDataBytes, numTotalBytes) {
    // numRSBlocksInGroup2 = 196 % 5 = 1
    const numRSBlocksInGroup2 = numTotalBytes % numRSBlocks;
    // numRSBlocksInGroup1 = 5 - 1 = 4
    const numRSBlocksInGroup1 = numRSBlocks - numRSBlocksInGroup2;
    // numTotalBytesInGroup1 = 196 / 5 = 39
    const numTotalBytesInGroup1 = Math.floor(numTotalBytes / numRSBlocks);
    // numTotalBytesInGroup2 = 39 + 1 = 40
    const numTotalBytesInGroup2 = numTotalBytesInGroup1 + 1;
    // numDataBytesInGroup1 = 66 / 5 = 13
    const numDataBytesInGroup1 = Math.floor(numDataBytes / numRSBlocks);
    // numDataBytesInGroup2 = 13 + 1 = 14
    const numDataBytesInGroup2 = numDataBytesInGroup1 + 1;
    // numECBytesInGroup1 = 39 - 13 = 26
    const numECBytesInGroup1 = numTotalBytesInGroup1 - numDataBytesInGroup1;
    // numECBytesInGroup2 = 40 - 14 = 26
    const numECBytesInGroup2 = numTotalBytesInGroup2 - numDataBytesInGroup2;
    // Sanity checks: /zxing/qrcode/encoder/Encoder.java -> getNumDataBytesAndNumECBytesForBlockID
    if (blockID < numRSBlocksInGroup1) {
      return [numECBytesInGroup1, numDataBytesInGroup1];
    } else {
      return [numECBytesInGroup2, numDataBytesInGroup2];
    }
  }
  function generateECBytes(dataBytes, numECBytesInBlock) {
    const numDataBytes = dataBytes.length;
    const ecBytes = new Uint8Array(numECBytesInBlock);
    const toEncode = new Int32Array(numDataBytes + numECBytesInBlock);
    // Append data bytes
    toEncode.set(dataBytes);
    // Append ec code
    new Encoder$1().encode(toEncode, numECBytesInBlock);
    // Get ec bytes
    ecBytes.set(toEncode.subarray(numDataBytes));
    return ecBytes;
  }
  function injectECBytes(bits, numRSBlocks, numDataBytes, numTotalBytes) {
    // Step 1.  Divide data bytes into blocks and generate error correction bytes for them. We'll
    // store the divided data bytes blocks and error correction bytes blocks into "blocks".
    let maxNumECBytes = 0;
    let maxNumDataBytes = 0;
    let dataBytesOffset = 0;
    // Since, we know the number of reedsolmon blocks, we can initialize the vector with the number.
    const blocks = [];
    for (let i = 0; i < numRSBlocks; i++) {
      const [numECBytesInBlock, numDataBytesInBlock] = getNumBytesInBlock(i, numRSBlocks, numDataBytes, numTotalBytes);
      const dataBytes = new Uint8Array(numDataBytesInBlock);
      bits.toUint8Array(8 * dataBytesOffset, dataBytes, 0, numDataBytesInBlock);
      const ecBytes = generateECBytes(dataBytes, numECBytesInBlock);
      blocks.push(new BlockPair(dataBytes, ecBytes));
      maxNumDataBytes = Math.max(maxNumDataBytes, numDataBytesInBlock);
      maxNumECBytes = Math.max(maxNumECBytes, ecBytes.length);
      dataBytesOffset += numDataBytesInBlock;
    }
    const result = new BitArray();
    // First, place data blocks.
    for (let i = 0; i < maxNumDataBytes; i++) {
      for (const { dataBytes } of blocks) {
        if (i < dataBytes.length) {
          result.append(dataBytes[i], 8);
        }
      }
    }
    // Then, place error correction blocks.
    for (let i = 0; i < maxNumECBytes; i++) {
      for (const { ecBytes } of blocks) {
        if (i < ecBytes.length) {
          result.append(ecBytes[i], 8);
        }
      }
    }
    return result;
  }
  function appendTerminateBits(bits, numDataBytes) {
    const capacity = numDataBytes * 8;
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
    const numPaddingBytes = numDataBytes - bits.byteLength;
    for (let i = 0; i < numPaddingBytes; i++) {
      bits.append(i & 1 ? 0x11 : 0xec, 8);
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
    // numBytes = 196
    const numBytes = version.totalCodewords;
    const ecBlocks = version.getECBlocksForECLevel(ecLevel);
    // numECBytes = 130
    const numECBytes = ecBlocks.totalECCodewords;
    // numDataBytes = 196 - 130 = 66
    const numDataBytes = numBytes - numECBytes;
    const totalInputBytes = Math.ceil(numInputBits / 8);
    return numDataBytes >= totalInputBytes;
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
  function encode$1(byte) {
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
        stream.writeByte(encode$1(buffer >>> (bits - 6)));
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
        stream.writeByte(encode$1(this.#buffer << (6 - bits)));
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
      const matrixSize = matrix.width;
      const size = moduleSize * matrixSize + margin * 2;
      const gif = new GIFImage(size, size, colors);
      const max = size - margin;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (margin <= j && j < max && margin <= i && i < max) {
            const x = Math.floor((j - margin) / moduleSize);
            const y = Math.floor((i - margin) / moduleSize);
            gif.set(j, i, matrix.get(x, y));
          } else {
            // Margin pixels
            gif.set(j, i, 0);
          }
        }
      }
      return gif.toDataURL();
    }
  }

  /**
   * @module ECLevel
   */
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
   * @module ByteMatrix
   */
  class ByteMatrix {
    #width;
    #height;
    #bytes;
    constructor(width, height = width) {
      this.#width = width;
      this.#height = height;
      this.#bytes = new Int8Array(width * height);
    }
    /**
     * @property width
     * @description Get the width of matrix
     */
    get width() {
      return this.#width;
    }
    /**
     * @property height
     * @description Get the height of matrix
     */
    get height() {
      return this.#height;
    }
    /**
     * @method set
     * @description Set the matrix value of position
     */
    set(x, y, value) {
      this.#bytes[y * this.#width + x] = value;
    }
    /**
     * @method get
     * @description Get the matrix value of position
     */
    get(x, y) {
      return this.#bytes[y * this.#width + x];
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
   * @module encoding
   */
  function getCharCodes(content, maxCode) {
    const bytes = [];
    for (const character of content) {
      const code = character.charCodeAt(0);
      // If gt max code, pust ?
      bytes.push(code > maxCode ? 63 : code);
    }
    return new Uint8Array(bytes);
  }
  function encode(content, charset) {
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
  function getEncodingMapping(label, ...ranges) {
    const bytes = [];
    const codes = [];
    const mapping = new Map();
    const decoder = new TextDecoder(label, { fatal: true });
    for (const [start, end] of ranges) {
      for (let code = start; code <= end; code++) {
        codes.push(code);
        bytes.push(code >> 8, code & 0xff);
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
  function getSerialRanges(start, end, offsets, step = 256) {
    const count = offsets.length - 1;
    const ranges = [];
    for (let i = start; i < end; ) {
      for (let j = 0; j < count; j += 2) {
        ranges.push([i + offsets[j], i + offsets[j + 1]]);
      }
      i += step;
    }
    return ranges;
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
        if (indicator < 0 || indicator > 0xff) {
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
        throw new Error('version must be an integer in [1 - 40] or "auto"');
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
      encode: encode$1 = encode
    } = {}) {
      assertHints(hints);
      assertLevel(level);
      assertVersion(version);
      this.#hints = hints;
      this.#encode = encode$1;
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
      const { totalCodewords, dimension } = version;
      const ecBlocks = version.getECBlocksForECLevel(ecLevel);
      const numDataBytes = totalCodewords - ecBlocks.totalECCodewords;
      // Append terminate the bits properly.
      appendTerminateBits(headAndDataBits, numDataBytes);
      const { numBlocks } = ecBlocks;
      const matrix = new ByteMatrix(dimension);
      const finalBits = injectECBytes(headAndDataBits, numBlocks, numDataBytes, totalCodewords);
      const mask = chooseMask(matrix, finalBits, version, ecLevel);
      buildMatrix(matrix, finalBits, version, ecLevel, mask);
      return new QRCode(matrix, version, ecLevel, mask);
    }
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
   * @module Hanzi
   */
  const GB2312 = getEncodingMapping(
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
    const code = GB2312.get(character);
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
  const SHIFT_JIS = getEncodingMapping(
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
    const code = SHIFT_JIS.get(character);
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
  function getNumericCode(code) {
    // 0 - 9
    if (48 <= code && code <= 57) {
      return code - 48;
    }
    throw new Error(`illegal numeric character: ${String.fromCharCode(code)}`);
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
        const code1 = getNumericCode(content.charCodeAt(i));
        if (i + 2 < length) {
          // Encode three numeric letters in ten bits.
          const code2 = getNumericCode(content.charCodeAt(i + 1));
          const code3 = getNumericCode(content.charCodeAt(i + 2));
          bits.append(code1 * 100 + code2 * 10 + code3, 10);
          i += 3;
        } else if (i + 1 < length) {
          // Encode two numeric letters in seven bits.
          const code2 = getNumericCode(content.charCodeAt(i + 1));
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
  const ALPHANUMERIC_TABLE = [
    // 0x20-0x2f
    36, -1, -1, -1, 37, 38, -1, -1, -1, -1, 39, 40, -1, 41, 42, 43,
    // 0x30-0x3f
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 44, -1, -1, -1, -1, -1,
    // 0x40-0x4f
    -1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
    // 0x50-0x5a
    25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
  ];
  function getAlphanumericCode(code) {
    const index = code - 32;
    if (index < ALPHANUMERIC_TABLE.length) {
      return ALPHANUMERIC_TABLE[index];
    }
    throw new Error(`illegal alphanumeric character: ${String.fromCharCode(code)}`);
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
        const code1 = getAlphanumericCode(content.charCodeAt(i));
        if (i + 1 < length) {
          const code2 = getAlphanumericCode(content.charCodeAt(i + 1));
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

  exports.Alphanumeric = Alphanumeric;
  exports.Byte = Byte;
  exports.Charset = Charset;
  exports.Encoder = Encoder;
  exports.Hanzi = Hanzi;
  exports.Kanji = Kanji;
  exports.Numeric = Numeric;
});
