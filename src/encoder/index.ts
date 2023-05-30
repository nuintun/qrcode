/**
 * @module QRCode
 * @author nuintun
 * @author Kazuhiko Arase
 */

import {
  calculateMaskPenalty,
  getAlignmentPattern,
  getBCHVersion,
  getBCHVersionInfo,
  getCharacterCountBits,
  getECPolynomial
} from './utils';
import { Mode } from '/common/Mode';
import { RSBlock } from './RSBlock';
import { Segment } from './Segment';
import { Byte } from './segments/Byte';
import { BitBuffer } from './BitBuffer';
import { ECLevel } from '/common/ECLevel';
import { EncodeHint } from './EncodeHint';
import { Polynomial } from './Polynomial';
import { isEmpty, Matrix } from './Matrix';
import { getMaskFunc } from '/common/MaskPattern';

const PAD0 = 0xec;
const PAD1 = 0x11;
const { toString } = Object.prototype;

type PrepareData = [buffer: BitBuffer, rsBlocks: RSBlock[], maxDataCount: number];

/**
 * @function appendECI
 * @param {number} encoding
 * @param {BitBuffer} buffer
 * @see https://github.com/nayuki/QR-Code-generator/blob/master/typescript-javascript/qrcodegen.ts
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/Encoder.java
 */
function appendECI(encoding: number, buffer: BitBuffer) {
  if (encoding < 0 || encoding >= 1000000) {
    throw new Error('eci assignment value out of range');
  }

  buffer.put(Mode.ECI, 4);

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

function prepareData(version: number, level: ECLevel, hints: EncodeHint[], segments: Segment[]): PrepareData {
  const buffer = new BitBuffer();
  const rsBlocks = RSBlock.getRSBlocks(version, level);

  for (const segment of segments) {
    const mode = segment.mode;

    // Append ECI segment if applicable
    if (mode === Mode.BYTE && hints.indexOf(EncodeHint.CHARACTER_SET) >= 0) {
      appendECI((segment as Byte).encoding, buffer);
    }

    // Append the FNC1 mode header for GS1 formatted data if applicable
    if (hints.indexOf(EncodeHint.GS1_FORMAT) >= 0) {
      // GS1 formatted codes are prefixed with a FNC1 in first position mode header
      buffer.put(Mode.FNC1_FIRST_POSITION, 4);
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

function createBytes(buffer: BitBuffer, rsBlocks: RSBlock[]): BitBuffer {
  let offset = 0;
  let maxDcCount = 0;
  let maxEcCount = 0;

  const dcData: number[][] = [];
  const ecData: number[][] = [];
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

function createData(buffer: BitBuffer, rsBlocks: RSBlock[], maxDataCount: number): BitBuffer {
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

function setupFinderPattern(matrix: Matrix, x: number, y: number): void {
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

function setupAlignmentPattern(matrix: Matrix, version: number): void {
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

function setupTimingPattern(matrix: Matrix): void {
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

function setupFormatInfo(matrix: Matrix, level: ECLevel, mask: number): void {
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

function setupVersionInfo(matrix: Matrix, version: number): void {
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

function setupCodewords(matrix: Matrix, buffer: BitBuffer, mask: number): void {
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

function buildMatrix(buffer: BitBuffer, version: number, level: ECLevel, mask: number): Matrix {
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

export interface Options {
  level?: ECLevel;
  version?: number;
  hints?: EncodeHint[];
}

export class Encoder {
  #level!: ECLevel;
  #version!: number;
  #hints!: EncodeHint[];
  #segments: Segment[] = [];

  constructor(options: Options = {}) {
    this.hints = options.hints ?? [];
    this.version = options.version ?? 0;
    this.level = options.level ?? ECLevel.L;
  }

  /**
   * @public
   * @property level
   * @return {ECLevel}
   */
  public get level(): ECLevel {
    return this.#level;
  }

  /**
   * @public
   * @property level
   * @param {ECLevel} level
   */
  public set level(level: ECLevel) {
    switch (level) {
      case ECLevel.L:
      case ECLevel.M:
      case ECLevel.Q:
      case ECLevel.H:
        this.#level = level;
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
  public get hints(): EncodeHint[] {
    return this.#hints;
  }

  /**
   * @public
   * @property hints
   */
  public set hints(hints: EncodeHint[]) {
    this.#hints = hints;
  }

  /**
   * @public
   * @property version
   * @return {number}
   */
  public get version(): number {
    return this.#version;
  }

  /**
   * @public
   * @property version
   * @param {number} version
   */
  public set version(version: number) {
    version = version >> 0;

    if (version < 0 || version > 40) {
      throw new RangeError('illegal version, must be in range [0 - 40]');
    }

    this.#version = version;
  }

  /**
   * @public
   * @method write
   * @param {QRData} data
   * @returns {Encoder}
   */
  public write(data: Segment | string): Encoder {
    const segments = this.#segments;

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
  public encode(): Matrix {
    let buffer!: BitBuffer;
    let rsBlocks!: RSBlock[];
    let maxDataCount!: number;
    let version = this.#version;

    const hints = this.#hints;
    const level = this.#level;
    const segments = this.#segments;

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

    const matrices: Matrix[] = [];
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
  public flush() {
    this.#segments = [];
  }
}
