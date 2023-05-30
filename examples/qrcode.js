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
   * @module Reader
   */
  class Reader {}

  /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
  /* global Reflect, Promise */

  function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a getter');
    if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError('Cannot read private member from an object whose class did not declare it');
    return kind === 'm' ? f : kind === 'a' ? f.call(receiver) : f ? f.value : state.get(receiver);
  }

  function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === 'm') throw new TypeError('Private method is not writable');
    if (kind === 'a' && !f) throw new TypeError('Private accessor was defined without a setter');
    if (typeof state === 'function' ? receiver !== state || !f : !state.has(receiver))
      throw new TypeError('Cannot write private member to an object whose class did not declare it');
    return kind === 'a' ? f.call(receiver, value) : f ? (f.value = value) : state.set(receiver, value), value;
  }

  /**
   * @module math
   * @author nuintun
   * @author Kazuhiko Arase
   */
  const EXP_TABLE = [];
  const LOG_TABLE = [];
  for (let i = 0; i < 256; i++) {
    LOG_TABLE[i] = 0;
    EXP_TABLE[i] = i < 8 ? 1 << i : EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
  }
  for (let i = 0; i < 255; i++) {
    LOG_TABLE[EXP_TABLE[i]] = i;
  }
  function glog(n) {
    if (n < 1) {
      throw new Error(`illegal log: ${n}`);
    }
    return LOG_TABLE[n];
  }
  function gexp(n) {
    while (n < 0) {
      n += 255;
    }
    while (n >= 256) {
      n -= 255;
    }
    return EXP_TABLE[n];
  }

  /**
   * @module Mode
   * @author nuintun
   * @author Cosmo Wolfe
   * @author Kazuhiko Arase
   */
  /**
   * @readonly
   */
  exports.Mode = void 0;
  (function (Mode) {
    Mode[(Mode['TERMINATOR'] = 0)] = 'TERMINATOR';
    Mode[(Mode['NUMERIC'] = 1)] = 'NUMERIC';
    Mode[(Mode['ALPHANUMERIC'] = 2)] = 'ALPHANUMERIC';
    Mode[(Mode['STRUCTURED_APPEND'] = 3)] = 'STRUCTURED_APPEND';
    Mode[(Mode['BYTE'] = 4)] = 'BYTE';
    Mode[(Mode['KANJI'] = 8)] = 'KANJI';
    Mode[(Mode['ECI'] = 7)] = 'ECI';
    Mode[(Mode['FNC1_FIRST_POSITION'] = 5)] = 'FNC1_FIRST_POSITION';
    Mode[(Mode['FNC1_SECOND_POSITION'] = 9)] = 'FNC1_SECOND_POSITION';
    // HANZI 0xD is defined in GBT 18284-2000, may not be supported in foreign country
    Mode[(Mode['HANZI'] = 13)] = 'HANZI';
  })(exports.Mode || (exports.Mode = {}));

  /**
   * @module Polynomial
   * @author nuintun
   * @author Kazuhiko Arase
   */
  class Polynomial {
    constructor(num, shift = 0) {
      let offset = 0;
      let { length } = num;
      while (offset < length && num[offset] === 0) {
        offset++;
      }
      length -= offset;
      const numbers = [];
      for (let i = 0; i < length; i++) {
        numbers.push(num[offset + i]);
      }
      for (let i = 0; i < shift; i++) {
        numbers.push(0);
      }
      this.numbers = numbers;
    }
    get length() {
      return this.numbers.length;
    }
    at(index) {
      const { numbers } = this;
      return numbers[index < 0 ? numbers.length + index : index];
    }
    multiply(e) {
      const eLength = e.length;
      const tLength = this.length;
      const numbers = [];
      const dLength = tLength + eLength - 1;
      for (let i = 0; i < dLength; i++) {
        numbers.push(0);
      }
      for (let i = 0; i < tLength; i++) {
        for (let j = 0; j < eLength; j++) {
          numbers[i + j] ^= gexp(glog(this.at(i)) + glog(e.at(j)));
        }
      }
      return new Polynomial(numbers);
    }
    mod(e) {
      const eLength = e.length;
      const tLength = this.length;
      if (tLength - eLength < 0) {
        return this;
      }
      const ratio = glog(this.at(0)) - glog(e.at(0));
      // Create copy
      const numbers = [];
      for (let i = 0; i < tLength; i++) {
        numbers.push(this.at(i));
      }
      // Subtract and calc rest.
      for (let i = 0; i < eLength; i++) {
        numbers[i] ^= gexp(glog(e.at(i)) + ratio);
      }
      // Call recursively
      return new Polynomial(numbers).mod(e);
    }
  }

  /**
   * @module Matrix
   */
  var _Matrix_size, _Matrix_matrix;
  class Matrix {
    constructor(size) {
      _Matrix_size.set(this, void 0);
      _Matrix_matrix.set(this, void 0);
      __classPrivateFieldSet(this, _Matrix_matrix, [], 'f');
      __classPrivateFieldSet(this, _Matrix_size, size, 'f');
    }
    get size() {
      return __classPrivateFieldGet(this, _Matrix_size, 'f');
    }
    get(x, y) {
      return __classPrivateFieldGet(this, _Matrix_matrix, 'f')[y * __classPrivateFieldGet(this, _Matrix_size, 'f') + x];
    }
    set(x, y, value) {
      __classPrivateFieldGet(this, _Matrix_matrix, 'f')[y * __classPrivateFieldGet(this, _Matrix_size, 'f') + x] = value;
    }
  }
  (_Matrix_size = new WeakMap()), (_Matrix_matrix = new WeakMap());
  function isDark(matrix, x, y) {
    return matrix.get(x, y) === 1;
  }
  function isEmpty(matrix, x, y) {
    return matrix.get(x, y) === undefined;
  }

  /**
   * @module utils
   * @author nuintun
   * @author Kazuhiko Arase
   */
  const N1 = 3;
  const N2 = 3;
  const N3 = 40;
  const N4 = 10;
  const ALIGNMENT_PATTERN_TABLE = [
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
    [6, 30, 58, 86, 114, 142, 170]
  ];
  const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
  const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
  const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
  function getAlignmentPattern(version) {
    return ALIGNMENT_PATTERN_TABLE[version - 1];
  }
  function getECPolynomial(level) {
    let e = new Polynomial([1]);
    for (let i = 0; i < level; i++) {
      e = e.multiply(new Polynomial([1, gexp(i)]));
    }
    return e;
  }
  function getBCHDigit(data) {
    let digit = 0;
    while (data !== 0) {
      digit++;
      data >>>= 1;
    }
    return digit;
  }
  const G18_BCH = getBCHDigit(G18);
  function getBCHVersion(data) {
    let offset = data << 12;
    while (getBCHDigit(offset) - G18_BCH >= 0) {
      offset ^= G18 << (getBCHDigit(offset) - G18_BCH);
    }
    return (data << 12) | offset;
  }
  const G15_BCH = getBCHDigit(G15);
  function getBCHVersionInfo(data) {
    let offset = data << 10;
    while (getBCHDigit(offset) - G15_BCH >= 0) {
      offset ^= G15 << (getBCHDigit(offset) - G15_BCH);
    }
    return ((data << 10) | offset) ^ G15_MASK;
  }
  function applyMaskPenaltyRule1Internal(matrix, isHorizontal) {
    let penalty = 0;
    const { size } = matrix;
    for (let i = 0; i < size; i++) {
      let prevBit = false;
      let numSameBitCells = 0;
      for (let j = 0; j < size; j++) {
        const bit = isHorizontal ? isDark(matrix, j, i) : isDark(matrix, i, j);
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
  function applyMaskPenaltyRule1(matrix) {
    return applyMaskPenaltyRule1Internal(matrix, true) + applyMaskPenaltyRule1Internal(matrix, false);
  }
  function applyMaskPenaltyRule2(matrix) {
    let penalty = 0;
    const { size } = matrix;
    for (let i = 0; i < size - 1; i++) {
      for (let j = 0; j < size - 1; j++) {
        const value = isDark(matrix, j, i);
        if (
          value === isDark(matrix, j + 1, i) &&
          value === isDark(matrix, j, i + 1) &&
          value === isDark(matrix, j + 1, i + 1)
        ) {
          penalty += N2;
        }
      }
    }
    return penalty;
  }
  function isFourWhite(matrix, index, from, to, isHorizontal) {
    from = Math.max(from, 0);
    to = Math.min(to, matrix.size);
    for (let i = from; i < to; i++) {
      const value = isHorizontal ? isDark(matrix, i, index) : isDark(matrix, index, i);
      if (value) {
        return false;
      }
    }
    return true;
  }
  function applyMaskPenaltyRule3(matrix) {
    let numPenalties = 0;
    const { size } = matrix;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (
          j + 6 < size &&
          isDark(matrix, j, i) &&
          !isDark(matrix, j + 1, i) &&
          isDark(matrix, j + 2, i) &&
          isDark(matrix, j + 3, i) &&
          isDark(matrix, j + 4, i) &&
          !isDark(matrix, j + 5, i) &&
          isDark(matrix, j + 6, i) &&
          (isFourWhite(matrix, i, j - 4, j, true) || isFourWhite(matrix, i, j + 7, j + 11, true))
        ) {
          numPenalties++;
        }
        if (
          i + 6 < size &&
          isDark(matrix, j, i) &&
          !isDark(matrix, j, i + 1) &&
          isDark(matrix, j, i + 2) &&
          isDark(matrix, j, i + 3) &&
          isDark(matrix, j, i + 4) &&
          !isDark(matrix, j, i + 5) &&
          isDark(matrix, j, i + 6) &&
          (isFourWhite(matrix, j, i - 4, i, false) || isFourWhite(matrix, j, i + 7, i + 11, false))
        ) {
          numPenalties++;
        }
      }
    }
    return numPenalties * N3;
  }
  function applyMaskPenaltyRule4(matrix) {
    let numDarkCells = 0;
    const { size } = matrix;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (isDark(matrix, j, i)) {
          numDarkCells++;
        }
      }
    }
    const numTotalCells = size * size;
    const fivePercentVariances = (Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells;
    return fivePercentVariances * N4;
  }
  /**
   * @function calculateMaskPenalty
   * @param {Matrix} matrix
   * @see https://www.thonky.com/qr-code-tutorial/data-masking
   * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/MaskUtil.java
   */
  function calculateMaskPenalty(matrix) {
    return (
      applyMaskPenaltyRule1(matrix) +
      applyMaskPenaltyRule2(matrix) +
      applyMaskPenaltyRule3(matrix) +
      applyMaskPenaltyRule4(matrix)
    );
  }
  function getCharacterCountBits(mode, version) {
    const error = new Error(`illegal mode: ${mode}`);
    if (1 <= version && version < 10) {
      // 1 - 9
      switch (mode) {
        case exports.Mode.NUMERIC:
          return 10;
        case exports.Mode.ALPHANUMERIC:
          return 9;
        case exports.Mode.BYTE:
          return 8;
        case exports.Mode.KANJI:
          return 8;
        default:
          throw error;
      }
    } else if (version < 27) {
      // 10 - 26
      switch (mode) {
        case exports.Mode.NUMERIC:
          return 12;
        case exports.Mode.ALPHANUMERIC:
          return 11;
        case exports.Mode.BYTE:
          return 16;
        case exports.Mode.KANJI:
          return 10;
        default:
          throw error;
      }
    } else if (version < 41) {
      // 27 - 40
      switch (mode) {
        case exports.Mode.NUMERIC:
          return 14;
        case exports.Mode.ALPHANUMERIC:
          return 13;
        case exports.Mode.BYTE:
          return 16;
        case exports.Mode.KANJI:
          return 12;
        default:
          throw error;
      }
    } else {
      throw new Error(`illegal version: ${version}`);
    }
  }

  /**
   * @module ECLevel
   * @author nuintun
   * @author Cosmo Wolfe
   * @author Kazuhiko Arase
   */
  /**
   * @readonly
   */
  exports.ECLevel = void 0;
  (function (ECLevel) {
    // 7%
    ECLevel[(ECLevel['L'] = 1)] = 'L';
    // 15%
    ECLevel[(ECLevel['M'] = 0)] = 'M';
    // 25%
    ECLevel[(ECLevel['Q'] = 3)] = 'Q';
    // 30%
    ECLevel[(ECLevel['H'] = 2)] = 'H';
  })(exports.ECLevel || (exports.ECLevel = {}));

  /**
   * @module RSBlock
   * @author nuintun
   * @author Kazuhiko Arase
   */
  class RSBlock {
    constructor(totalCount, dataCount) {
      this.dataCount = dataCount;
      this.totalCount = totalCount;
    }
    getDataCount() {
      return this.dataCount;
    }
    getTotalCount() {
      return this.totalCount;
    }
    static getRSBlocks(version, level) {
      const rsBlocks = [];
      const rsBlock = RSBlock.getRSBlockTable(version, level);
      const length = rsBlock.length / 3;
      for (let i = 0; i < length; i++) {
        const count = rsBlock[i * 3];
        const totalCount = rsBlock[i * 3 + 1];
        const dataCount = rsBlock[i * 3 + 2];
        for (let j = 0; j < count; j++) {
          rsBlocks.push(new RSBlock(totalCount, dataCount));
        }
      }
      return rsBlocks;
    }
    static getRSBlockTable(version, level) {
      switch (level) {
        case exports.ECLevel.L:
          return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 0];
        case exports.ECLevel.M:
          return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 1];
        case exports.ECLevel.Q:
          return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 2];
        case exports.ECLevel.H:
          return RSBlock.RS_BLOCK_TABLE[(version - 1) * 4 + 3];
        default:
          throw new Error(`illegal error correction level: ${level}`);
      }
    }
  }
  RSBlock.RS_BLOCK_TABLE = [
    // L
    // M
    // Q
    // H
    // 1
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    // 2
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    // 3
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    // 4
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    // 5
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    // 6
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    // 7
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    // 8
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    // 9
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    // 10
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    // 11
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    // 12
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    // 13
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    // 14
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    // 15
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12, 7, 37, 13],
    // 16
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    // 17
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    // 18
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    // 19
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    // 20
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    // 21
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    // 22
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    // 23
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    // 24
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    // 25
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    // 26
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    // 27
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    // 28
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    // 29
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    // 30
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    // 31
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    // 32
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    // 33
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    // 34
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    // 35
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    // 36
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    // 37
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    // 38
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    // 39
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    // 40
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16]
  ];

  /**
   * @module Segment
   * @author nuintun
   * @author Kazuhiko Arase
   */
  var _Segment_mode, _Segment_bytes;
  class Segment {
    constructor(mode, bytes = []) {
      _Segment_mode.set(this, void 0);
      _Segment_bytes.set(this, void 0);
      __classPrivateFieldSet(this, _Segment_mode, mode, 'f');
      __classPrivateFieldSet(this, _Segment_bytes, bytes, 'f');
    }
    get mode() {
      return __classPrivateFieldGet(this, _Segment_mode, 'f');
    }
    get length() {
      return __classPrivateFieldGet(this, _Segment_bytes, 'f').length;
    }
    get bytes() {
      return __classPrivateFieldGet(this, _Segment_bytes, 'f');
    }
  }
  (_Segment_mode = new WeakMap()), (_Segment_bytes = new WeakMap());

  /**
   * @module UTF8
   * @author nuintun
   */
  /**
   * @function encode
   * @param {string} text
   * @returns {number[]}
   * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
   */
  function encode$3(text) {
    let pos = 0;
    const { length } = text;
    const bytes = [];
    for (let i = 0; i < length; i++) {
      let code = text.charCodeAt(i);
      if (code < 128) {
        bytes[pos++] = code;
      } else if (code < 2048) {
        bytes[pos++] = (code >> 6) | 192;
        bytes[pos++] = (code & 63) | 128;
      } else if ((code & 0xfc00) === 0xd800 && i + 1 < length && (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
        // Surrogate Pair
        code = 0x10000 + ((code & 0x03ff) << 10) + (text.charCodeAt(++i) & 0x03ff);
        bytes[pos++] = (code >> 18) | 240;
        bytes[pos++] = ((code >> 12) & 63) | 128;
        bytes[pos++] = ((code >> 6) & 63) | 128;
        bytes[pos++] = (code & 63) | 128;
      } else {
        bytes[pos++] = (code >> 12) | 224;
        bytes[pos++] = ((code >> 6) & 63) | 128;
        bytes[pos++] = (code & 63) | 128;
      }
    }
    return bytes;
  }

  /**
   * @module Byte
   * @author nuintun
   * @author Kazuhiko Arase
   */
  var _Byte_encoding;
  class Byte extends Segment {
    /**
     * @constructor
     * @param {string} text
     * @param {TextEncode} [encode]
     */
    constructor(text, encode) {
      let bytes;
      let encoding;
      if (typeof encode === 'function') {
        ({ bytes, encoding } = encode(text));
      } else {
        bytes = encode$3(text);
        encoding = 26 /* ECI.UTF8 */;
      }
      super(exports.Mode.BYTE, bytes);
      _Byte_encoding.set(this, -1);
      __classPrivateFieldSet(this, _Byte_encoding, encoding, 'f');
    }
    get encoding() {
      return __classPrivateFieldGet(this, _Byte_encoding, 'f');
    }
    /**
     * @public
     * @method writeTo
     * @param {BitBuffer} buffer
     */
    writeTo(buffer) {
      const { bytes } = this;
      for (const byte of bytes) {
        buffer.put(byte, 8);
      }
    }
  }
  _Byte_encoding = new WeakMap();

  /**
   * @module BitBuffer
   * @author nuintun
   * @author Kazuhiko Arase
   */
  class BitBuffer {
    constructor() {
      this.length = 0;
      this.buffer = [];
    }
    putBit(bit) {
      const { buffer, length } = this;
      if (buffer.length * 8 === length) {
        buffer.push(0);
      }
      if (bit) {
        buffer[(length / 8) >>> 0] |= 0x80 >>> length % 8;
      }
      this.length++;
    }
    put(num, length) {
      for (let i = 0; i < length; i++) {
        this.putBit(((num >>> (length - i - 1)) & 1) === 1);
      }
    }
    at(index) {
      const { buffer } = this;
      return buffer[index < 0 ? buffer.length + index : index];
    }
    getBit(index) {
      return ((this.buffer[(index / 8) >>> 0] >>> (7 - (index % 8))) & 1) === 1;
    }
  }

  exports.EncodeHint = void 0;
  (function (EncodeHint) {
    EncodeHint[(EncodeHint['GS1_FORMAT'] = 0)] = 'GS1_FORMAT';
    EncodeHint[(EncodeHint['CHARACTER_SET'] = 1)] = 'CHARACTER_SET';
  })(exports.EncodeHint || (exports.EncodeHint = {}));

  /**
   * @module MaskPattern
   * @author nuintun
   * @author Cosmo Wolfe
   * @author Kazuhiko Arase
   */
  function getMaskFunc(maskPattern) {
    switch (maskPattern) {
      case 0 /* MaskPattern.PATTERN000 */:
        return (x, y) => ((x + y) & 0x1) === 0;
      case 1 /* MaskPattern.PATTERN001 */:
        return (_x, y) => (y & 0x1) === 0;
      case 2 /* MaskPattern.PATTERN010 */:
        return (x, _y) => x % 3 === 0;
      case 3 /* MaskPattern.PATTERN011 */:
        return (x, y) => (x + y) % 3 === 0;
      case 4 /* MaskPattern.PATTERN100 */:
        return (x, y) => ((((x / 3) >> 0) + ((y / 2) >> 0)) & 0x1) === 0;
      case 5 /* MaskPattern.PATTERN101 */:
        return (x, y) => ((x * y) & 0x1) + ((x * y) % 3) === 0;
      case 6 /* MaskPattern.PATTERN110 */:
        return (x, y) => ((((x * y) & 0x1) + ((x * y) % 3)) & 0x1) === 0;
      case 7 /* MaskPattern.PATTERN111 */:
        return (x, y) => ((((x * y) % 3) + ((x + y) & 0x1)) & 0x1) === 0;
      default:
        throw new Error(`illegal mask: ${maskPattern}`);
    }
  }

  /**
   * @module QRCode
   * @author nuintun
   * @author Kazuhiko Arase
   */
  var _Encoder_level, _Encoder_version, _Encoder_hints, _Encoder_segments;
  const PAD0 = 0xec;
  const PAD1 = 0x11;
  const { toString } = Object.prototype;
  /**
   * @function appendECI
   * @param {number} encoding
   * @param {BitBuffer} buffer
   * @see https://github.com/nayuki/QR-Code-generator/blob/master/typescript-javascript/qrcodegen.ts
   * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/Encoder.java
   */
  function appendECI(encoding, buffer) {
    if (encoding < 0 || encoding >= 1000000) {
      throw new Error('eci assignment value out of range');
    }
    buffer.put(exports.Mode.ECI, 4);
    if (encoding < 1 << 7) {
      buffer.put(encoding, 8);
    } else if (encoding < 1 << 14) {
      buffer.put(2, 2);
      buffer.put(encoding, 14);
    } else {
      buffer.put(6, 3);
      buffer.put(encoding, 21);
    }
  }
  function prepareData(version, level, hints, segments) {
    const buffer = new BitBuffer();
    const rsBlocks = RSBlock.getRSBlocks(version, level);
    for (const segment of segments) {
      const mode = segment.mode;
      // Append ECI segment if applicable
      if (mode === exports.Mode.BYTE && hints.indexOf(exports.EncodeHint.CHARACTER_SET) >= 0) {
        appendECI(segment.encoding, buffer);
      }
      // Append the FNC1 mode header for GS1 formatted data if applicable
      if (hints.indexOf(exports.EncodeHint.GS1_FORMAT) >= 0) {
        // GS1 formatted codes are prefixed with a FNC1 in first position mode header
        buffer.put(exports.Mode.FNC1_FIRST_POSITION, 4);
      }
      // (With ECI in place,) Write the mode marker
      buffer.put(mode, 4);
      // Find "length" of segment and write it
      buffer.put(segment.length, getCharacterCountBits(mode, version));
      // Put data together into the overall payload
      segment.writeTo(buffer);
    }
    // Calc max data count
    let maxDataCount = 0;
    for (const rsBlock of rsBlocks) {
      maxDataCount += rsBlock.getDataCount();
    }
    maxDataCount *= 8;
    return [buffer, rsBlocks, maxDataCount];
  }
  function createBytes(buffer, rsBlocks) {
    let offset = 0;
    let maxDcCount = 0;
    let maxEcCount = 0;
    const dcData = [];
    const ecData = [];
    const rsLength = rsBlocks.length;
    for (let i = 0; i < rsLength; i++) {
      const rsBlock = rsBlocks[i];
      const dcCount = rsBlock.getDataCount();
      const ecCount = rsBlock.getTotalCount() - dcCount;
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);
      dcData[i] = [];
      for (let j = 0; j < dcCount; j++) {
        dcData[i][j] = 0xff & buffer.at(j + offset);
      }
      offset += dcCount;
      const rsPoly = getECPolynomial(ecCount);
      const ecLength = rsPoly.length - 1;
      const rawPoly = new Polynomial(dcData[i], ecLength);
      const modPoly = rawPoly.mod(rsPoly);
      const mpLength = modPoly.length;
      ecData[i] = [];
      for (let j = 0; j < ecLength; j++) {
        const modIndex = j + mpLength - ecLength;
        ecData[i][j] = modIndex >= 0 ? modPoly.at(modIndex) : 0;
      }
    }
    buffer = new BitBuffer();
    for (let i = 0; i < maxDcCount; i++) {
      for (let j = 0; j < rsLength; j++) {
        if (i < dcData[j].length) {
          buffer.put(dcData[j][i], 8);
        }
      }
    }
    for (let i = 0; i < maxEcCount; i++) {
      for (let j = 0; j < rsLength; j++) {
        if (i < ecData[j].length) {
          buffer.put(ecData[j][i], 8);
        }
      }
    }
    return buffer;
  }
  function createData(buffer, rsBlocks, maxDataCount) {
    // End
    if (buffer.length + 4 <= maxDataCount) {
      buffer.put(0, 4);
    }
    // Padding
    while (buffer.length % 8 !== 0) {
      buffer.putBit(false);
    }
    // Padding
    while (true) {
      if (buffer.length >= maxDataCount) {
        break;
      }
      buffer.put(PAD0, 8);
      if (buffer.length >= maxDataCount) {
        break;
      }
      buffer.put(PAD1, 8);
    }
    return createBytes(buffer, rsBlocks);
  }
  function setupFinderPattern(matrix, x, y) {
    const { size } = matrix;
    for (let i = -1; i <= 7; i++) {
      for (let j = -1; j <= 7; j++) {
        if (y + i <= -1 || size <= y + i || x + j <= -1 || size <= x + j) {
          continue;
        }
        if (
          (0 <= i && i <= 6 && (j === 0 || j === 6)) ||
          (0 <= j && j <= 6 && (i === 0 || i === 6)) ||
          (2 <= i && i <= 4 && 2 <= j && j <= 4)
        ) {
          matrix.set(x + j, y + i, 1);
        } else {
          matrix.set(x + j, y + i, 0);
        }
      }
    }
  }
  function setupAlignmentPattern(matrix, version) {
    const points = getAlignmentPattern(version);
    const { length } = points;
    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        const x = points[j];
        const y = points[i];
        if (isEmpty(matrix, x, y)) {
          for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
              if (i === -2 || i === 2 || j === -2 || j === 2 || (i === 0 && j === 0)) {
                matrix.set(x + j, y + i, 1);
              } else {
                matrix.set(x + j, y + i, 0);
              }
            }
          }
        }
      }
    }
  }
  function setupTimingPattern(matrix) {
    const length = matrix.size - 8;
    for (let i = 8; i < length; i++) {
      const bit = (i & 1) >>> 0;
      // Vertical
      if (isEmpty(matrix, i, 6)) {
        matrix.set(i, 6, bit);
      }
      // Horizontal
      if (isEmpty(matrix, 6, i)) {
        matrix.set(6, i, bit);
      }
    }
  }
  function setupFormatInfo(matrix, level, mask) {
    const { size } = matrix;
    const bits = getBCHVersionInfo((level << 3) | mask);
    for (let i = 0; i < 15; i++) {
      const bit = (bits >> i) & 1;
      // Vertical
      if (i < 6) {
        matrix.set(8, i, bit);
      } else if (i < 8) {
        matrix.set(8, i + 1, bit);
      } else {
        matrix.set(8, size - 15 + i, bit);
      }
      // Horizontal
      if (i < 8) {
        matrix.set(size - i - 1, 8, bit);
      } else if (i < 9) {
        matrix.set(15 - i - 1 + 1, 8, bit);
      } else {
        matrix.set(15 - i - 1, 8, bit);
      }
    }
    // Fixed point
    matrix.set(8, size - 8, 1);
  }
  function setupVersionInfo(matrix, version) {
    if (version >= 7) {
      const { size } = matrix;
      const bits = getBCHVersion(version);
      for (let i = 0; i < 18; i++) {
        const x = (i / 3) >> 0;
        const y = (i % 3) + size - 8 - 3;
        const bit = (bits >> i) & 1;
        matrix.set(x, y, bit);
        matrix.set(y, x, bit);
      }
    }
  }
  function setupCodewords(matrix, buffer, mask) {
    const { size } = matrix;
    const bitLength = buffer.length;
    const maskFunc = getMaskFunc(mask);
    // Bit index into the data
    let bitIndex = 0;
    // Do the funny zigzag scan
    for (let right = size - 1; right >= 1; right -= 2) {
      // Index of right column in each column pair
      if (right === 6) {
        right = 5;
      }
      for (let vert = 0; vert < size; vert++) {
        // Vertical counter
        for (let j = 0; j < 2; j++) {
          // Actual x coordinate
          const x = right - j;
          const upward = ((right + 1) & 2) === 0;
          // Actual y coordinate
          const y = upward ? size - 1 - vert : vert;
          if (isEmpty(matrix, x, y)) {
            let bit = false;
            if (bitIndex < bitLength) {
              bit = buffer.getBit(bitIndex++);
            }
            const invert = maskFunc(x, y);
            if (invert) {
              bit = !bit;
            }
            matrix.set(x, y, bit ? 1 : 0);
          }
        }
      }
    }
  }
  function buildMatrix(buffer, version, level, mask) {
    // Size of matrix
    const size = version * 4 + 17;
    // Initialize matrix
    const matrix = new Matrix(size);
    // Setup finder pattern
    setupFinderPattern(matrix, 0, 0);
    setupFinderPattern(matrix, 0, size - 7);
    setupFinderPattern(matrix, size - 7, 0);
    // Setup alignment pattern
    setupAlignmentPattern(matrix, version);
    // Setup timing pattern
    setupTimingPattern(matrix);
    // Setup format info
    setupFormatInfo(matrix, level, mask);
    // Setup version info
    setupVersionInfo(matrix, version);
    // Setup codewords
    setupCodewords(matrix, buffer, mask);
    return matrix;
  }
  class Encoder {
    constructor(options = {}) {
      var _a, _b, _c;
      _Encoder_level.set(this, void 0);
      _Encoder_version.set(this, void 0);
      _Encoder_hints.set(this, void 0);
      _Encoder_segments.set(this, []);
      this.hints = (_a = options.hints) !== null && _a !== void 0 ? _a : [];
      this.version = (_b = options.version) !== null && _b !== void 0 ? _b : 0;
      this.level = (_c = options.level) !== null && _c !== void 0 ? _c : exports.ECLevel.L;
    }
    /**
     * @public
     * @property level
     * @return {ECLevel}
     */
    get level() {
      return __classPrivateFieldGet(this, _Encoder_level, 'f');
    }
    /**
     * @public
     * @property level
     * @param {ECLevel} level
     */
    set level(level) {
      switch (level) {
        case exports.ECLevel.L:
        case exports.ECLevel.M:
        case exports.ECLevel.Q:
        case exports.ECLevel.H:
          __classPrivateFieldSet(this, _Encoder_level, level, 'f');
          break;
        default:
          throw new Error('illegal error correction level');
      }
    }
    /**
     * @public
     * @property hints
     * @return {boolean}
     */
    get hints() {
      return __classPrivateFieldGet(this, _Encoder_hints, 'f');
    }
    /**
     * @public
     * @property hints
     */
    set hints(hints) {
      __classPrivateFieldSet(this, _Encoder_hints, hints, 'f');
    }
    /**
     * @public
     * @property version
     * @return {number}
     */
    get version() {
      return __classPrivateFieldGet(this, _Encoder_version, 'f');
    }
    /**
     * @public
     * @property version
     * @param {number} version
     */
    set version(version) {
      version = version >> 0;
      if (version < 0 || version > 40) {
        throw new RangeError('illegal version, must be in range [0 - 40]');
      }
      __classPrivateFieldSet(this, _Encoder_version, version, 'f');
    }
    /**
     * @public
     * @method write
     * @param {QRData} data
     * @returns {Encoder}
     */
    write(data) {
      const segments = __classPrivateFieldGet(this, _Encoder_segments, 'f');
      if (data instanceof Segment) {
        segments.push(data);
      } else {
        const type = toString.call(data);
        if (type === '[object String]') {
          segments.push(new Byte(data));
        } else {
          throw new Error(`illegal data: ${data}`);
        }
      }
      return this;
    }
    /**
     * @public
     * @method encode
     * @returns {Matrix}
     */
    encode() {
      let buffer;
      let rsBlocks;
      let maxDataCount;
      let version = __classPrivateFieldGet(this, _Encoder_version, 'f');
      const hints = __classPrivateFieldGet(this, _Encoder_hints, 'f');
      const level = __classPrivateFieldGet(this, _Encoder_level, 'f');
      const segments = __classPrivateFieldGet(this, _Encoder_segments, 'f');
      if (version === 0) {
        for (version = 1; version <= 40; version++) {
          [buffer, rsBlocks, maxDataCount] = prepareData(version, level, hints, segments);
          if (buffer.length <= maxDataCount) {
            break;
          }
        }
        const dataBitLength = buffer.length;
        if (dataBitLength > maxDataCount) {
          throw new Error(`data overflow: ${dataBitLength} > ${maxDataCount}`);
        }
      } else {
        [buffer, rsBlocks, maxDataCount] = prepareData(version, level, hints, segments);
      }
      const matrices = [];
      const data = createData(buffer, rsBlocks, maxDataCount);
      let bestMaskPattern = -1;
      let minPenalty = Number.MAX_VALUE;
      // Choose best mask pattern
      for (let mask = 0; mask < 8; mask++) {
        const matrix = buildMatrix(data, version, this.level, mask);
        const penalty = calculateMaskPenalty(matrix);
        if (penalty < minPenalty) {
          minPenalty = penalty;
          bestMaskPattern = mask;
        }
        matrices.push(matrix);
      }
      const matrix = matrices[bestMaskPattern];
      return matrix;
    }
    /**
     * @public
     * @method flush
     */
    flush() {
      __classPrivateFieldSet(this, _Encoder_segments, [], 'f');
    }
  }
  (_Encoder_level = new WeakMap()),
    (_Encoder_version = new WeakMap()),
    (_Encoder_hints = new WeakMap()),
    (_Encoder_segments = new WeakMap());

  /**
   * @module OutputStream
   * @author nuintun
   * @author Kazuhiko Arase
   */
  class OutputStream {
    writeBytes(bytes, offset = 0, length = bytes.length) {
      for (let i = 0; i < length; i++) {
        this.writeByte(bytes[i + offset]);
      }
    }
    flush() {
      // The flush method
    }
    close() {
      this.flush();
    }
  }

  /**
   * @module ByteArrayOutputStream
   * @author nuintun
   * @author Kazuhiko Arase
   */
  class ByteArrayOutputStream extends OutputStream {
    constructor() {
      super(...arguments);
      this.bytes = [];
    }
    writeByte(byte) {
      this.bytes.push(byte);
    }
    writeInt16(byte) {
      this.bytes.push(byte, byte >>> 8);
    }
    toByteArray() {
      return this.bytes;
    }
  }

  /**
   * @module Base64EncodeOutputStream
   * @author nuintun
   * @author Kazuhiko Arase
   */
  function encode$2(ch) {
    if (ch >= 0) {
      if (ch < 26) {
        // A
        return 0x41 + ch;
      } else if (ch < 52) {
        // a
        return 0x61 + (ch - 26);
      } else if (ch < 62) {
        // 0
        return 0x30 + (ch - 52);
      } else if (ch === 62) {
        // +
        return 0x2b;
      } else if (ch === 63) {
        // /
        return 0x2f;
      }
    }
    throw new Error(`illegal char: ${String.fromCharCode(ch)}`);
  }
  class Base64EncodeOutputStream extends OutputStream {
    constructor(stream) {
      super();
      this.buffer = 0;
      this.length = 0;
      this.bufLength = 0;
      this.stream = stream;
    }
    writeByte(byte) {
      this.buffer = (this.buffer << 8) | (byte & 0xff);
      this.bufLength += 8;
      this.length++;
      while (this.bufLength >= 6) {
        this.writeEncoded(this.buffer >>> (this.bufLength - 6));
        this.bufLength -= 6;
      }
    }
    /**
     * @override
     */
    flush() {
      if (this.bufLength > 0) {
        this.writeEncoded(this.buffer << (6 - this.bufLength));
        this.buffer = 0;
        this.bufLength = 0;
      }
      const { stream } = this;
      if (this.length % 3 != 0) {
        // Padding
        const pad = 3 - (this.length % 3);
        for (let i = 0; i < pad; i++) {
          // =
          stream.writeByte(0x3d);
        }
      }
    }
    writeEncoded(byte) {
      this.stream.writeByte(encode$2(byte & 0x3f));
    }
  }

  /**
   * @module GIF Image (B/W)
   * @author nuintun
   * @author Kazuhiko Arase
   */
  function encodeToBase64(data) {
    const output = new ByteArrayOutputStream();
    const stream = new Base64EncodeOutputStream(output);
    stream.writeBytes(data);
    stream.close();
    output.close();
    return output.toByteArray();
  }
  class LZWTable {
    constructor() {
      this.size = 0;
      this.map = {};
    }
    add(key) {
      if (!this.contains(key)) {
        this.map[key] = this.size++;
      }
    }
    getSize() {
      return this.size;
    }
    indexOf(key) {
      return this.map[key];
    }
    contains(key) {
      return this.map[key] >= 0;
    }
  }
  class BitOutputStream {
    constructor(output) {
      this.output = output;
      this.bitLength = 0;
      this.bitBuffer = 0;
    }
    write(data, length) {
      if (data >>> length !== 0) {
        throw new Error('length overflow');
      }
      const { output } = this;
      while (this.bitLength + length >= 8) {
        output.writeByte(0xff & ((data << this.bitLength) | this.bitBuffer));
        length -= 8 - this.bitLength;
        data >>>= 8 - this.bitLength;
        this.bitBuffer = 0;
        this.bitLength = 0;
      }
      this.bitBuffer = (data << this.bitLength) | this.bitBuffer;
      this.bitLength = this.bitLength + length;
    }
    flush() {
      const { output } = this;
      if (this.bitLength > 0) {
        output.writeByte(this.bitBuffer);
      }
      output.flush();
    }
    close() {
      this.flush();
      this.output.close();
    }
  }
  class GIFImage {
    constructor(width, height) {
      this.pixels = [];
      this.width = width;
      this.height = height;
      const size = width * height;
      for (let i = 0; i < size; i++) {
        this.pixels[i] = 0;
      }
    }
    getLZWRaster(lzwMinCodeSize) {
      // Setup LZWTable
      const table = new LZWTable();
      const { fromCharCode } = String;
      const clearCode = 1 << lzwMinCodeSize;
      const endCode = (1 << lzwMinCodeSize) + 1;
      for (let i = 0; i < clearCode; i++) {
        table.add(fromCharCode(i));
      }
      table.add(fromCharCode(clearCode));
      table.add(fromCharCode(endCode));
      let bitLength = lzwMinCodeSize + 1;
      const byteOutput = new ByteArrayOutputStream();
      const bitOutput = new BitOutputStream(byteOutput);
      try {
        const { pixels } = this;
        const { length } = pixels;
        const { fromCharCode } = String;
        // Clear code
        bitOutput.write(clearCode, bitLength);
        let dataIndex = 0;
        let words = fromCharCode(pixels[dataIndex++]);
        while (dataIndex < length) {
          const char = fromCharCode(pixels[dataIndex++]);
          if (table.contains(words + char)) {
            words += char;
          } else {
            bitOutput.write(table.indexOf(words), bitLength);
            if (table.getSize() < 0xfff) {
              if (table.getSize() === 1 << bitLength) {
                bitLength++;
              }
              table.add(words + char);
            }
            words = char;
          }
        }
        bitOutput.write(table.indexOf(words), bitLength);
        // End code
        bitOutput.write(endCode, bitLength);
      } finally {
        bitOutput.close();
      }
      return byteOutput.toByteArray();
    }
    /**
     * @function set
     * @description set pixel of point
     * @param x x point
     * @param y y point
     * @param color pixel color 0: Black 1: White
     */
    set(x, y, color) {
      this.pixels[y * this.width + x] = color;
    }
    write(output) {
      const { width, height } = this;
      // GIF Signature
      output.writeByte(0x47); // G
      output.writeByte(0x49); // I
      output.writeByte(0x46); // F
      output.writeByte(0x38); // 8
      output.writeByte(0x37); // 7
      output.writeByte(0x61); // a
      // Screen Descriptor
      output.writeInt16(width);
      output.writeInt16(height);
      output.writeByte(0x80); // 2bit
      output.writeByte(0);
      output.writeByte(0);
      // Global Color Map
      // Black
      output.writeByte(0x00);
      output.writeByte(0x00);
      output.writeByte(0x00);
      // White
      output.writeByte(0xff);
      output.writeByte(0xff);
      output.writeByte(0xff);
      // Image Descriptor
      output.writeByte(0x2c); // ,
      output.writeInt16(0);
      output.writeInt16(0);
      output.writeInt16(width);
      output.writeInt16(height);
      output.writeByte(0);
      // Local Color Map
      // Raster Data
      const lzwMinCodeSize = 2;
      const raster = this.getLZWRaster(lzwMinCodeSize);
      const raLength = raster.length;
      output.writeByte(lzwMinCodeSize);
      let offset = 0;
      while (raLength - offset > 255) {
        output.writeByte(255);
        output.writeBytes(raster, offset, 255);
        offset += 255;
      }
      const length = raLength - offset;
      output.writeByte(length);
      output.writeBytes(raster, offset, length);
      output.writeByte(0x00);
      // GIF Terminator
      output.writeByte(0x3b); // ;
    }
    toDataURL() {
      const output = new ByteArrayOutputStream();
      this.write(output);
      const bytes = encodeToBase64(output.toByteArray());
      output.close();
      const { length } = bytes;
      const { fromCharCode } = String;
      let url = 'data:image/gif;base64,';
      for (let i = 0; i < length; i++) {
        url += fromCharCode(bytes[i]);
      }
      return url;
    }
  }

  /**
   * @module Writer
   */
  class Writer extends Encoder {
    /**
     * @public
     * @method toDataURL
     * @param {number} moduleSize
     * @param {number} margin
     * @returns {string}
     */
    toDataURL(moduleSize = 2, margin = moduleSize * 4) {
      moduleSize = Math.max(1, moduleSize >> 0);
      margin = Math.max(0, margin >> 0);
      const matrix = this.encode();
      const matrixSize = matrix.size;
      const size = moduleSize * matrixSize + margin * 2;
      const min = margin;
      const max = size - margin;
      const gif = new GIFImage(size, size);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (min <= j && j < max && min <= i && i < max) {
            const x = ((j - min) / moduleSize) >> 0;
            const y = ((i - min) / moduleSize) >> 0;
            gif.set(j, i, isDark(matrix, x, y) ? 0 : 1);
          } else {
            gif.set(j, i, 1);
          }
        }
      }
      return gif.toDataURL();
    }
  }

  /**
   * @module SJIS
   * @author nuintun
   * @author soldair
   * @author Kazuhiko Arase
   * @see https://github.com/soldair/node-qrcode/blob/master/helper/to-sjis.js
   */
  // prettier-ignore
  const SJIS_UTF8_TABLE = [
        [0x8140, '　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈〉《》「」『』【】＋－±×'],
        [0x8180, '÷＝≠＜＞'],
        [0x818f, '￥＄￠￡％＃＆＊＠§☆★'],
        [0x81a6, '※〒→←↑↓〓'],
        [0x81ca, '￢'],
        [0x824f, '０１２３４５６７８９'],
        [0x8260, 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ'],
        [0x8281, 'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ'],
        [0x829f, 'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをん'],
        [0x8340, 'ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミ'],
        [0x8380, 'ムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶ'],
        [0x839f, 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ'],
        [0x83bf, 'αβγδεζηθικλμνξοπρστυφχψω'],
        [0x8440, 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'],
        [0x8470, 'абвгдеёжзийклмн'],
        [0x8480, 'опрстуфхцчшщъыьэюя'],
        [0x8780, '〝〟'],
        [0x8940, '院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円'],
        [0x8980, '園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改'],
        [0x8a40, '魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫'],
        [0x8a80, '橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄'],
        [0x8b40, '機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救'],
        [0x8b80, '朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈'],
        [0x8c40, '掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨'],
        [0x8c80, '劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向'],
        [0x8d40, '后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降'],
        [0x8d80, '項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷'],
        [0x8e40, '察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止'],
        [0x8e80, '死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周'],
        [0x8f40, '宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳'],
        [0x8f80, '準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾'],
        [0x9040, '拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨'],
        [0x9080, '逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線'],
        [0x9140, '繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻'],
        [0x9180, '操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只'],
        [0x9240, '叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄'],
        [0x9280, '逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓'],
        [0x9340, '邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬'],
        [0x9380, '凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入'],
        [0x9440, '如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅'],
        [0x9480, '楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美'],
        [0x9540, '鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷'],
        [0x9580, '斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋'],
        [0x9640, '法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆'],
        [0x9680, '摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒'],
        [0x9740, '諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲'],
        [0x9780, '沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯'],
        [0x9840, '蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕'],
        [0x989f, '弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲'],
        [0x9940, '僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭'],
        [0x9980, '凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨'],
        [0x9a40, '咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸'],
        [0x9a80, '噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩'],
        [0x9b40, '奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀'],
        [0x9b80, '它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏'],
        [0x9c40, '廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠'],
        [0x9c80, '怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛'],
        [0x9d40, '戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫'],
        [0x9d80, '捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼'],
        [0x9e40, '曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎'],
        [0x9e80, '梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣'],
        [0x9f40, '檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯'],
        [0x9f80, '麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌'],
        [0xe040, '漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝'],
        [0xe080, '烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱'],
        [0xe140, '瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿'],
        [0xe180, '痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬'],
        [0xe240, '磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰'],
        [0xe280, '窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆'],
        [0xe340, '紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷'],
        [0xe380, '縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋'],
        [0xe440, '隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤'],
        [0xe480, '艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈'],
        [0xe540, '蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬'],
        [0xe580, '蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞'],
        [0xe640, '襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧'],
        [0xe680, '諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊'],
        [0xe740, '蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜'],
        [0xe780, '轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮'],
        [0xe840, '錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙'],
        [0xe880, '閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰'],
        [0xe940, '顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃'],
        [0xe980, '騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈'],
        [0xea40, '鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯'],
        [0xea80, '黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙']
    ];
  let tables;
  /**
   * @function getTables
   * @returns {SJISTables}
   */
  function getTables() {
    if (!tables) {
      const UTF8_TO_SJIS = {};
      const SJIS_TO_UTF8 = {};
      const tLength = SJIS_UTF8_TABLE.length;
      for (let i = 0; i < tLength; i++) {
        const mapItem = SJIS_UTF8_TABLE[i];
        const kanji = mapItem[1];
        const kLength = kanji.length;
        for (var j = 0; j < kLength; j++) {
          const kCode = mapItem[0] + j;
          const uCode = kanji.charAt(j).charCodeAt(0);
          UTF8_TO_SJIS[uCode] = kCode;
          SJIS_TO_UTF8[kCode] = uCode;
        }
      }
      tables = { UTF8_TO_SJIS, SJIS_TO_UTF8 };
    }
    return tables;
  }
  /**
   * @function encode
   * @param {string} text
   * @returns {number[]}
   */
  function encode$1(text) {
    const { length } = text;
    const bytes = [];
    const { fromCharCode } = String;
    const { UTF8_TO_SJIS } = getTables();
    for (let i = 0; i < length; i++) {
      const code = text.charCodeAt(i);
      const byte = UTF8_TO_SJIS[code];
      if (byte != null) {
        // 2 bytes
        bytes.push(byte >> 8, byte & 0xff);
      } else {
        throw new Error(`illegal char: ${fromCharCode(code)}`);
      }
    }
    return bytes;
  }

  /**
   * @module Kanji
   * @author nuintun
   * @author Kazuhiko Arase
   * @description SJIS only
   */
  class Kanji extends Segment {
    /**
     * @constructor
     * @param {string} text
     */
    constructor(text) {
      super(exports.Mode.KANJI, encode$1(text));
    }
    /**
     * @public
     * @method getLength
     * @returns {number}
     */
    get length() {
      return Math.floor(this.bytes.length / 2);
    }
    /**
     * @public
     * @method writeTo
     * @param {BitBuffer} buffer
     */
    writeTo(buffer) {
      let index = 0;
      const { bytes } = this;
      const { length } = bytes;
      while (index + 1 < length) {
        let code = ((0xff & bytes[index]) << 8) | (0xff & bytes[index + 1]);
        if (0x8140 <= code && code <= 0x9ffc) {
          code -= 0x8140;
        } else if (0xe040 <= code && code <= 0xebbf) {
          code -= 0xc140;
        }
        code = ((code >> 8) & 0xff) * 0xc0 + (code & 0xff);
        buffer.put(code, 13);
        index += 2;
      }
    }
  }

  /**
   * @module UTF16
   * @author nuintun
   */
  /**
   * @function encode
   * @param {string} text
   * @returns {number[]}
   */
  function encode(text) {
    const { length } = text;
    const bytes = [];
    for (let i = 0; i < length; i++) {
      bytes.push(text.charCodeAt(i));
    }
    return bytes;
  }

  /**
   * @module Numeric
   * @author nuintun
   * @author Kazuhiko Arase
   */
  function getByte$1(byte) {
    // 0 - 9
    if (0x30 <= byte && byte <= 0x39) {
      return byte - 0x30;
    }
    throw new Error(`illegal char: ${String.fromCharCode(byte)}`);
  }
  function getBytes(bytes) {
    let num = 0;
    for (const byte of bytes) {
      num = num * 10 + getByte$1(byte);
    }
    return num;
  }
  class Numeric extends Segment {
    /**
     * @constructor
     * @param {string} text
     */
    constructor(text) {
      super(exports.Mode.NUMERIC, encode(text));
    }
    /**
     * @public
     * @method writeTo
     * @param {BitBuffer} buffer
     */
    writeTo(buffer) {
      let i = 0;
      const { bytes } = this;
      const { length } = bytes;
      while (i + 2 < length) {
        buffer.put(getBytes([bytes[i], bytes[i + 1], bytes[i + 2]]), 10);
        i += 3;
      }
      if (i < length) {
        if (length - i === 1) {
          buffer.put(getBytes([bytes[i]]), 4);
        } else if (length - i === 2) {
          buffer.put(getBytes([bytes[i], bytes[i + 1]]), 7);
        }
      }
    }
  }

  /**
   * @module Alphanumeric
   * @author nuintun
   * @author Kazuhiko Arase
   */
  function getByte(byte) {
    if (0x30 <= byte && byte <= 0x39) {
      // 0 - 9
      return byte - 0x30;
    } else if (0x41 <= byte && byte <= 0x5a) {
      // A - Z
      return byte - 0x41 + 10;
    } else {
      switch (byte) {
        // space
        case 0x20:
          return 36;
        // $
        case 0x24:
          return 37;
        // %
        case 0x25:
          return 38;
        // *
        case 0x2a:
          return 39;
        // +
        case 0x2b:
          return 40;
        // -
        case 0x2d:
          return 41;
        // .
        case 0x2e:
          return 42;
        // /
        case 0x2f:
          return 43;
        // :
        case 0x3a:
          return 44;
        default:
          throw new Error(`illegal char: ${String.fromCharCode(byte)}`);
      }
    }
  }
  class Alphanumeric extends Segment {
    /**
     * @constructor
     * @param {string} text
     */
    constructor(text) {
      super(exports.Mode.ALPHANUMERIC, encode(text));
    }
    /**
     * @public
     * @method writeTo
     * @param {BitBuffer} buffer
     */
    writeTo(buffer) {
      let i = 0;
      const { bytes } = this;
      const { length } = bytes;
      while (i + 1 < length) {
        buffer.put(getByte(bytes[i]) * 45 + getByte(bytes[i + 1]), 11);
        i += 2;
      }
      if (i < length) {
        buffer.put(getByte(bytes[i]), 6);
      }
    }
  }

  exports.Alphanumeric = Alphanumeric;
  exports.Byte = Byte;
  exports.Kanji = Kanji;
  exports.Numeric = Numeric;
  exports.Reader = Reader;
  exports.Writer = Writer;
});
