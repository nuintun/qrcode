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
   * @module utils
   */
  const { toString } = Object.prototype;
  function toUInt32(uint32) {
    // 防止溢出 0-0xffffffff
    return uint32 >>> 0;
  }
  function isNumber(value) {
    return toString.call(value) === '[object Number]';
  }

  /**
   * @module BitArray
   */
  const LOAD_FACTOR = 0.75;
  function makeArray(length) {
    return new Int32Array(toUInt32((length + 31) / 32));
  }
  class BitArray {
    #length;
    #bits;
    constructor(length = 0) {
      this.#length = length;
      this.#bits = makeArray(length);
    }
    #offset(index) {
      return toUInt32(index / 32);
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
      return toUInt32((this.#length + 7) / 8);
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
    toBytes(bitOffset, array, offset, byteLength) {
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
        throw new Error('coefficients can not empty');
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
    #assertField(other) {
      if (this.#field !== other.#field) {
        throw new Error('polys do not have same field');
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
      this.#assertField(other);
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
      if (isNumber(other)) {
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
      this.#assertField(other);
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
      this.#assertField(other);
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
    #one;
    #zero;
    #expTable;
    #logTable;
    #generatorBase;
    constructor(primitive, size, generatorBase) {
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
      for (let i = 0; i < size - 1; i++) {
        logTable[expTable[i]] = i;
      }
      this.#size = size;
      this.#expTable = expTable;
      this.#logTable = logTable;
      this.#generatorBase = generatorBase;
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
    get generatorBase() {
      return this.#generatorBase;
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
      if (degree >= generators.length) {
        const field = this.#field;
        const { length } = generators;
        const { generatorBase } = field;
        let lastGenerator = generators[length - 1];
        for (let i = length; i <= degree; i++) {
          const coefficients = new Int32Array([1, field.exp(i - 1 + generatorBase)]);
          const nextGenerator = lastGenerator.multiply(new GenericGFPoly(field, coefficients));
          generators.push(nextGenerator);
          lastGenerator = nextGenerator;
        }
      }
      return generators[degree];
    }
    encode(received, ecBytes) {
      if (ecBytes === 0) {
        throw new Error('no error correction bytes');
      }
      const dataBytes = received.length - ecBytes;
      if (dataBytes <= 0) {
        throw new Error('no data bytes provided');
      }
      const generator = this.#buildGenerator(ecBytes);
      const infoCoefficients = new Int32Array(dataBytes);
      infoCoefficients.set(received.subarray(0, dataBytes));
      const base = new GenericGFPoly(this.#field, infoCoefficients);
      const info = base.multiplyByMonomial(ecBytes, 1);
      const [, remainder] = info.divide(generator);
      const { coefficients } = remainder;
      const numZeroCoefficients = ecBytes - coefficients.length;
      for (let i = 0; i < numZeroCoefficients; i++) {
        received[dataBytes + i] = 0;
      }
      received.set(coefficients, dataBytes + numZeroCoefficients);
    }
  };

  /**
   * @module encoder
   */
  function getNumBytesInBlock(blockID, numRSBlocks, numDataBytes, numTotalBytes) {
    if (blockID >= numRSBlocks) {
      throw new Error('block id too large');
    }
    // numRSBlocksInGroup2 = 196 % 5 = 1
    const numRSBlocksInGroup2 = numTotalBytes % numRSBlocks;
    // numRSBlocksInGroup1 = 5 - 1 = 4
    const numRSBlocksInGroup1 = numRSBlocks - numRSBlocksInGroup2;
    // numTotalBytesInGroup1 = 196 / 5 = 39
    const numTotalBytesInGroup1 = toUInt32(numTotalBytes / numRSBlocks);
    // numTotalBytesInGroup2 = 39 + 1 = 40
    const numTotalBytesInGroup2 = numTotalBytesInGroup1 + 1;
    // numDataBytesInGroup1 = 66 / 5 = 13
    const numDataBytesInGroup1 = toUInt32(numDataBytes / numRSBlocks);
    // numDataBytesInGroup2 = 13 + 1 = 14
    const numDataBytesInGroup2 = numDataBytesInGroup1 + 1;
    // numECBytesInGroup1 = 39 - 13 = 26
    const numECBytesInGroup1 = numTotalBytesInGroup1 - numDataBytesInGroup1;
    // numECBytesInGroup2 = 40 - 14 = 26
    const numECBytesInGroup2 = numTotalBytesInGroup2 - numDataBytesInGroup2;
    // Sanity checks.
    // 26 = 26
    if (numECBytesInGroup1 !== numECBytesInGroup2) {
      throw new Error('ec bytes mismatch');
    }
    // 5 = 4 + 1.
    if (numRSBlocks !== numRSBlocksInGroup1 + numRSBlocksInGroup2) {
      throw new Error('rs blocks mismatch');
    }
    // 196 = (13 + 26) * 4 + (14 + 26) * 1
    if (
      numTotalBytes !==
      (numDataBytesInGroup1 + numECBytesInGroup1) * numRSBlocksInGroup1 +
        (numDataBytesInGroup2 + numECBytesInGroup2) * numRSBlocksInGroup2
    ) {
      throw new Error('total bytes mismatch');
    }
    if (blockID < numRSBlocksInGroup1) {
      return [numECBytesInGroup1, numDataBytesInGroup1];
    } else {
      return [numECBytesInGroup2, numDataBytesInGroup2];
    }
  }
  function generateECBytes(dataBytes, numECBytesInBlock) {
    const numDataBytes = dataBytes.length;
    const ecBytes = new Int8Array(numECBytesInBlock);
    const toEncode = new Int32Array(numDataBytes + numECBytesInBlock);
    toEncode.set(dataBytes);
    new Encoder$1().encode(toEncode, numECBytesInBlock);
    ecBytes.set(toEncode.subarray(numDataBytes));
    return ecBytes;
  }
  function interleaveWithECBytes(bits, numRSBlocks, numDataBytes, numTotalBytes) {
    // "bits" must have "getNumDataBytes" bytes of data.
    if (bits.byteLength !== numDataBytes) {
      throw new Error('number of bits and data bytes does not match');
    }
    // Step 1.  Divide data bytes into blocks and generate error correction bytes for them. We'll
    // store the divided data bytes blocks and error correction bytes blocks into "blocks".
    let maxNumECBytes = 0;
    let maxNumDataBytes = 0;
    let dataBytesOffset = 0;
    // Since, we know the number of reedsolmon blocks, we can initialize the vector with the number.
    const blocks = [];
    for (let i = 0; i < numRSBlocks; i++) {
      const [numECBytesInBlock, numDataBytesInBlock] = getNumBytesInBlock(i, numRSBlocks, numDataBytes, numTotalBytes);
      const dataBytes = new Int8Array(numDataBytesInBlock);
      bits.toBytes(8 * dataBytesOffset, dataBytes, 0, numDataBytesInBlock);
      const ecBytes = generateECBytes(dataBytes, numECBytesInBlock);
      blocks.push(new BlockPair(dataBytes, ecBytes));
      maxNumDataBytes = Math.max(maxNumDataBytes, numDataBytesInBlock);
      maxNumECBytes = Math.max(maxNumECBytes, ecBytes.length);
      dataBytesOffset += numDataBytesInBlock;
    }
    if (numDataBytes !== dataBytesOffset) {
      throw new Error('data bytes does not match offset');
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
    if (numTotalBytes !== result.byteLength) {
      // Should be same.
      throw new Error(`interleaving error: ${numTotalBytes} and ${result.byteLength} differ`);
    }
    return result;
  }
  function terminateBits(bits, numDataBytes) {
    const capacity = numDataBytes * 8;
    if (bits.length > capacity) {
      throw new Error(`data bits cannot fit in the QRCode ${bits.length} > ${capacity}`);
    }
    // Append Mode.TERMINATE if there is enough space (value is 0000)
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
      bits.append((i & 0x01) === 0 ? 0xec : 0x11, 8);
    }
    if (bits.length !== capacity) {
      throw new Error('bits size does not equal capacity');
    }
  }
  function isByteMode(segment) {
    return segment.mode === Mode.BYTE;
  }
  function appendModeInfo(bits, mode) {
    bits.append(mode.bits, 4);
  }
  function appendECI(bits, charset) {
    bits.append(Mode.ECI.bits, 4);
    bits.append(charset.values[0], 8);
  }
  function appendLengthInfo(bits, version, mode, numLetters) {
    const numBits = mode.getCharacterCountBits(version);
    if (numLetters >= 1 << numBits) {
      throw new Error(`${numLetters} is bigger than ${(1 << numBits) - 1}`);
    }
    bits.append(numLetters, numBits);
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
    const totalInputBytes = (numInputBits + 7) / 8;
    return numDataBytes >= totalInputBytes;
  }
  function chooseVersion(numInputBits, ecLevel) {
    for (const version of VERSIONS) {
      if (willFit(numInputBits, version, ecLevel)) {
        return version;
      }
    }
    throw new Error('data too big');
  }
  function calculateBitsNeeded(segmentBlocks, version) {
    let bitsNeeded = 0;
    for (const { mode, headerBits, dataBits } of segmentBlocks) {
      bitsNeeded += headerBits.length + mode.getCharacterCountBits(version) + dataBits.length;
    }
    return bitsNeeded;
  }
  function recommendVersion(segmentBlocks, ecLevel) {
    // Hard part: need to know version to know how many bits length takes. But need to know how many
    // bits it takes to know version. First we take a guess at version by assuming version will be
    // the minimum, 1:
    const provisionalBitsNeeded = calculateBitsNeeded(segmentBlocks, VERSIONS[1]);
    const provisionalVersion = chooseVersion(provisionalBitsNeeded, ecLevel);
    // Use that guess to calculate the right version. I am still not sure this works in 100% of cases.
    const bitsNeeded = calculateBitsNeeded(segmentBlocks, provisionalVersion);
    return chooseVersion(bitsNeeded, ecLevel);
  }

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
    bytes = [];
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
  function encode$1(ch) {
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
    buffer = 0;
    length = 0;
    bufLength = 0;
    stream;
    constructor(stream) {
      super();
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
      this.stream.writeByte(encode$1(byte & 0x3f));
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
    size = 0;
    map = {};
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
    output;
    bitLength = 0;
    bitBuffer = 0;
    constructor(output) {
      this.output = output;
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
    width;
    height;
    pixels;
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
   * @module QRCode
   */
  class QRCode {
    #matrix;
    constructor(matrix) {
      this.#matrix = matrix;
    }
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
      const matrix = this.#matrix;
      const matrixSize = matrix.width;
      const size = moduleSize * matrixSize + margin * 2;
      const min = margin;
      const max = size - margin;
      const gif = new GIFImage(size, size);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (min <= j && j < max && min <= i && i < max) {
            const x = ((j - min) / moduleSize) >> 0;
            const y = ((i - min) / moduleSize) >> 0;
            gif.set(j, i, matrix.get(x, y) === 1 ? 0 : 1);
          } else {
            gif.set(j, i, 1);
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
    #width;
    #height;
    #bytes;
    constructor(width, height = width) {
      this.#width = width;
      this.#height = height;
      this.#bytes = new Int8Array(width * height);
    }
    get width() {
      return this.#width;
    }
    get height() {
      return this.#height;
    }
    set(x, y, value) {
      this.#bytes[y * this.#width + x] = value;
    }
    get(x, y) {
      return this.#bytes[y * this.#width + x];
    }
    clear(value) {
      this.#bytes.fill(value);
    }
  }

  /**
   * @module ECLevel
   */
  class ECLevel {
    #bits;
    #level;
    // L = ~7% correction
    static L = new ECLevel(0, 0x01);
    // L = ~15% correction
    static M = new ECLevel(1, 0x00);
    // L = ~25% correction
    static Q = new ECLevel(2, 0x03);
    // L = ~30% correction
    static H = new ECLevel(3, 0x02);
    constructor(level, bits) {
      this.#bits = bits;
      this.#level = level;
    }
    get bits() {
      return this.#bits;
    }
    get level() {
      return this.#level;
    }
  }

  /**
   * @module matrix
   */
  // Format information poly
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
    for (let i = 8; i < height; i++) {
      const bit = (i + 1) % 2;
      // Vertical line.
      if (isEmpty(matrix, 6, i)) {
        matrix.set(6, i, bit);
      }
    }
    // -8 is for skipping position detection patterns (7: size)
    // separation patterns (1: size). Thus, 8 = 7 + 1.
    for (let j = 8; j < width; j++) {
      const bit = (j + 1) % 2;
      // Horizontal line.
      if (isEmpty(matrix, j, 6)) {
        matrix.set(j, 6, bit);
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
    if (poly === 0) {
      throw new Error('0 polynomial');
    }
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
    if (bits.length !== 15) {
      // Just in case.
      throw new Error(`should not happen but we got: ${bits.length}`);
    }
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
    if (bits.length !== 18) {
      // Just in case.
      throw new Error(`should not happen but we got: ${bits.length}`);
    }
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
    const { length } = dataBits;
    const { width, height } = matrix;
    let bitIndex = 0;
    let direction = -1;
    // Start from the right bottom cell.
    let x = width - 1;
    let y = height - 1;
    while (x > 0) {
      // Skip the vertical timing pattern.
      if (x === 6) {
        x -= 1;
      }
      while (y >= 0 && y < height) {
        for (let i = 0; i < 2; i++) {
          const offsetX = x - i;
          // Skip the cell if it's not empty.
          if (isEmpty(matrix, offsetX, y)) {
            let bit;
            if (bitIndex < length) {
              bit = dataBits.get(bitIndex++);
            } else {
              // Padding bit. If there is no bit left, we'll fill the left cells with 0, as described
              // in 8.4.9 of JISX0510:2004 (p. 24).
              bit = 0;
            }
            // Is apply mask.
            if (isApplyMask(mask, offsetX, y)) {
              bit ^= 1;
            }
            matrix.set(offsetX, y, bit);
          }
        }
        y += direction;
      }
      // Reverse the direction.
      direction = -direction;
      // Update y.
      y += direction;
      // Move to the left.
      x -= 2;
    }
    // All bits should be consumed.
    if (bitIndex !== length) {
      throw new Error(`not all bits consumed: ${bitIndex}/${length}`);
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
      let prevBit = false;
      let numSameBitCells = 0;
      for (let x = 0; x < width; x++) {
        const bit = isHorizontal ? isDark(matrix, x, y) : isDark(matrix, y, x);
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
        const value = isDark(matrix, x, y);
        if (
          // Find 2x2 blocks with the same color
          value === isDark(matrix, x + 1, y) &&
          value === isDark(matrix, x, y + 1) &&
          value === isDark(matrix, x + 1, y + 1)
        ) {
          penalty += N2;
        }
      }
    }
    return penalty;
  }
  // Is is four white, check on horizontal and vertical.
  function isFourWhite(matrix, offset, from, to, isHorizontal) {
    from = Math.max(from, 0);
    to = Math.min(to, isHorizontal ? matrix.width : matrix.height);
    for (let i = from; i < to; i++) {
      const value = isHorizontal ? isDark(matrix, i, offset) : isDark(matrix, offset, i);
      if (value) {
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
    const fivePercentVariances = (Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells;
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
    let temp;
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
        intermediate = (y / 2 + x / 3) & 0x1;
        break;
      case 5:
        temp = y * x;
        intermediate = (temp & 0x1) + (temp % 3);
        break;
      case 6:
        temp = y * x;
        intermediate = ((temp & 0x1) + (temp % 3)) & 0x1;
        break;
      case 7:
        intermediate = (((y * x) % 3) + ((y + x) & 0x1)) & 0x1;
        break;
      default:
        throw new Error(`illegal mask: ${mask}`);
    }
    return intermediate === 0;
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
    static Big5 = new Charset('big5', 28);
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
   * @module Byte
   */
  const encoder = new TextEncoder();
  class Byte {
    #content;
    #charset;
    constructor(content, charset = Charset.UTF_8) {
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
    encode(encode = content => encoder.encode(content)) {
      const bits = new BitArray();
      const bytes = encode(this.#content, this.#charset);
      for (const byte of bytes) {
        bits.append(byte, 8);
      }
      return bits;
    }
  }

  /**
   * @module Kanji
   */
  // prettier-ignore
  // https://github.com/soldair/node-qrcode/blob/master/helper/to-sjis.js
  const SJIS_UTF8 = [
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
  const ENCODE_MAPPING = {};
  for (const [code, kanji] of SJIS_UTF8) {
    let i = 0;
    for (const character of kanji) {
      ENCODE_MAPPING[character.charCodeAt(0)] = code + i++;
    }
  }
  function encode(content) {
    const bytes = [];
    const { length } = content;
    for (let i = 0; i < length; i++) {
      const code = content.charCodeAt(i);
      const byte = ENCODE_MAPPING[code];
      if (byte != null) {
        // 2 bytes
        bytes.push(byte >> 8, byte & 0xff);
      } else {
        throw new Error(`illegal character: ${content.charAt(i)}`);
      }
    }
    return bytes;
  }
  class Kanji {
    #content;
    constructor(content) {
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
      const bytes = encode(this.#content);
      const length = bytes.length - 1;
      for (let i = 0; i < length; i += 2) {
        let subtracted = -1;
        const byte1 = bytes[i] & 0xff;
        const byte2 = bytes[i + 1] & 0xff;
        const code = (byte1 << 8) | byte2;
        if (code >= 0x8140 && code <= 0x9ffc) {
          subtracted = code - 0x8140;
        } else if (code >= 0xe040 && code <= 0xebbf) {
          subtracted = code - 0xc140;
        }
        if (subtracted === -1) {
          throw new Error('illegal byte sequence');
        }
        const encoded = (subtracted >> 8) * 0xc0 + (subtracted & 0xff);
        bits.append(encoded, 13);
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
    throw new Error(`illegal character: ${String.fromCharCode(code)}`);
  }
  class Numeric {
    #content;
    constructor(content) {
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
    throw new Error(`illegal character: ${String.fromCharCode(code)}`);
  }
  class Alphanumeric {
    #content;
    constructor(content) {
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

  /**
   * @module Encoder
   */
  class Encoder {
    #level;
    #version;
    #encode;
    #hints;
    constructor({ encode, version, hints = [], level = 'L' } = {}) {
      this.#hints = hints;
      this.#encode = encode;
      this.#version = version;
      this.#level = ECLevel[level];
    }
    encode(...segments) {
      const hints = this.#hints;
      const ecLevel = this.#level;
      const encode = this.#encode;
      const versionNumber = this.#version;
      const segmentBlocks = [];
      const hasGS1FormatHint = hints.indexOf('GS1_FORMAT') >= 0;
      const hasEncodingHint = hints.indexOf('CHARACTER_SET') >= 0;
      for (const segment of segments) {
        const { mode } = segment;
        const headerBits = new BitArray();
        const isByte = isByteMode(segment);
        const dataBits = isByte ? segment.encode(encode) : segment.encode();
        // Append ECI segment if applicable
        if (isByte && hasEncodingHint) {
          appendECI(headerBits, segment.charset);
        }
        // Append the FNC1 mode header for GS1 formatted data if applicable
        if (hasGS1FormatHint) {
          // GS1 formatted codes are prefixed with a FNC1 in first position mode header
          appendModeInfo(headerBits, Mode.FNC1_FIRST_POSITION);
        }
        // (With ECI in place,) Write the mode marker
        appendModeInfo(headerBits, mode);
        segmentBlocks.push({
          mode,
          dataBits,
          headerBits,
          length: isByte ? dataBits.byteLength : segment.content.length
        });
      }
      let version;
      if (versionNumber != null) {
        version = VERSIONS[versionNumber - 1];
        const bitsNeeded = calculateBitsNeeded(segmentBlocks, version);
        if (!willFit(bitsNeeded, version, ecLevel)) {
          throw new Error('data too big for requested version');
        }
      } else {
        version = recommendVersion(segmentBlocks, ecLevel);
      }
      const headerAndDataBits = new BitArray();
      for (const { mode, length, headerBits, dataBits } of segmentBlocks) {
        headerAndDataBits.append(headerBits);
        appendLengthInfo(headerAndDataBits, version, mode, length);
        headerAndDataBits.append(dataBits);
      }
      const { totalCodewords, dimension } = version;
      const ecBlocks = version.getECBlocksForECLevel(ecLevel);
      const numDataBytes = totalCodewords - ecBlocks.totalECCodewords;
      // Terminate the bits properly.
      terminateBits(headerAndDataBits, numDataBytes);
      const { numBlocks } = ecBlocks;
      const matrix = new ByteMatrix(dimension);
      const finalBits = interleaveWithECBytes(headerAndDataBits, numBlocks, numDataBytes, totalCodewords);
      const mask = chooseMask(matrix, finalBits, version, ecLevel);
      buildMatrix(matrix, finalBits, version, ecLevel, mask);
      return new QRCode(matrix);
    }
  }

  exports.Alphanumeric = Alphanumeric;
  exports.Byte = Byte;
  exports.Encoder = Encoder;
  exports.Kanji = Kanji;
  exports.Numeric = Numeric;
});
