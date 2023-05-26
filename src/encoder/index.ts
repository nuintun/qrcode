/**
 * @module QRCode
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { QRByte } from './QRByte';
import { QRData } from './QRData';
import * as QRUtil from './QRUtil';
import { Mode } from '/common/Mode';
import { RSBlock } from './RSBlock';
import { BitBuffer } from './BitBuffer';
import { ECLevel } from '/common/ECLevel';
import { Polynomial } from './Polynomial';
import { getMaskFunc } from '/common/MaskPattern';

const PAD0 = 0xec;
const PAD1 = 0x11;
const { toString } = Object.prototype;

type PrepareData = [BitBuffer, RSBlock[], number];

/**
 * @function appendECI
 * @param {number} encoding
 * @param {BitBuffer} buffer
 * @see https://github.com/nayuki/QR-Code-generator/blob/master/typescript-javascript/qrcodegen.ts
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/Encoder.java
 */
function appendECI(encoding: number, buffer: BitBuffer) {
  if (encoding < 0 || encoding >= 1000000) {
    throw new Error('byte mode encoding hint out of range');
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

function prepareData(version: number, level: ECLevel, hint: boolean, chunks: QRData[]): PrepareData {
  const buffer = new BitBuffer();
  const rsBlocks = RSBlock.getRSBlocks(version, level);

  for (const data of chunks) {
    const mode = data.mode;

    // Default set encoding UTF-8 when has encoding hint
    if (hint && mode === Mode.Byte) {
      appendECI((data as QRByte).encoding, buffer);
    }

    buffer.put(mode, 4);
    buffer.put(data.getLength(), data.getLengthInBits(version));

    data.writeTo(buffer);
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
  const bufferData = buffer.getBuffer();

  for (let i = 0; i < rsLength; i++) {
    const rsBlock = rsBlocks[i];
    const dcCount = rsBlock.getDataCount();
    const ecCount = rsBlock.getTotalCount() - dcCount;

    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    dcData[i] = [];

    for (let j = 0; j < dcCount; j++) {
      dcData[i][j] = 0xff & bufferData[j + offset];
    }

    offset += dcCount;

    const rsPoly = QRUtil.getECPolynomial(ecCount);
    const ecLength = rsPoly.getLength() - 1;
    const rawPoly = new Polynomial(dcData[i], ecLength);
    const modPoly = rawPoly.mod(rsPoly);
    const mpLength = modPoly.getLength();

    ecData[i] = [];

    for (let j = 0; j < ecLength; j++) {
      const modIndex = j + mpLength - ecLength;

      ecData[i][j] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
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
  if (buffer.getLengthInBits() + 4 <= maxDataCount) {
    buffer.put(0, 4);
  }

  // Padding
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }

  // Padding
  while (true) {
    if (buffer.getLengthInBits() >= maxDataCount) {
      break;
    }

    buffer.put(PAD0, 8);

    if (buffer.getLengthInBits() >= maxDataCount) {
      break;
    }

    buffer.put(PAD1, 8);
  }

  return createBytes(buffer, rsBlocks);
}

export interface Options {
  hint?: boolean;
  level?: ECLevel;
  version?: number;
}

export class Encoder {
  #size = 0;
  #hint!: boolean;
  #level!: ECLevel;
  #semver!: number;
  #version!: number;
  #chunks: QRData[] = [];
  #matrix: boolean[][] = [];

  constructor(options: Options = {}) {
    this.hint = options.hint || false;
    this.version = options.version || 0;
    this.level = options.level || ECLevel.L;
  }

  /**
   * @public
   * @property matrix
   * @returns {boolean[][]}
   */
  public get matrix(): boolean[][] {
    return this.#matrix;
  }

  /**
   * @public
   * @property size
   * @return {number}
   */
  public get size(): number {
    return this.#size;
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
      throw new RangeError('version invalid, must be in range [0 - 40]');
    }

    this.#semver = version;
    this.#version = version;
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
    }
  }

  /**
   * @public
   * @property hint
   * @return {boolean}
   */
  public get hint(): boolean {
    return this.#hint;
  }

  /**
   * @public
   * @property hint
   */
  public set hint(hint: boolean) {
    this.#hint = hint;
  }

  /**
   * @public
   * @method write
   * @param {QRData} data
   * @returns {Encoder}
   */
  public write(data: QRData | string): Encoder {
    const chunks = this.#chunks;

    if (data instanceof QRData) {
      chunks.push(data);
    } else {
      const type = toString.call(data);

      if (type === '[object String]') {
        chunks.push(new QRByte(data));
      } else {
        throw new Error(`illegal data: ${data}`);
      }
    }

    return this;
  }

  /**
   * @public
   * @method isDark
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  public isDark(x: number, y: number): boolean {
    return this.#matrix[y][x] === true;
  }

  private setupFinderPattern(x: number, y: number): void {
    const size = this.#size;
    const matrix = this.#matrix;

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
          matrix[y + i][x + j] = true;
        } else {
          matrix[y + i][x + j] = false;
        }
      }
    }
  }

  private setupAlignmentPattern(): void {
    const matrix = this.#matrix;
    const pos = QRUtil.getAlignmentPattern(this.#version);

    const { length } = pos;

    for (let i = 0; i < length; i++) {
      for (let j = 0; j < length; j++) {
        const x = pos[j];
        const y = pos[i];

        if (matrix[y][x] !== null) {
          continue;
        }

        for (let i = -2; i <= 2; i++) {
          for (let j = -2; j <= 2; j++) {
            if (i === -2 || i === 2 || j === -2 || j === 2 || (i === 0 && j === 0)) {
              matrix[y + i][x + j] = true;
            } else {
              matrix[y + i][x + j] = false;
            }
          }
        }
      }
    }
  }

  private setupTimingPattern(): void {
    const matrix = this.#matrix;
    const count = this.#size - 8;

    for (let i = 8; i < count; i++) {
      const bit = i % 2 === 0;

      // vertical
      if (matrix[i][6] === null) {
        matrix[i][6] = bit;
      }

      // horizontal
      if (matrix[6][i] === null) {
        matrix[6][i] = bit;
      }
    }
  }

  private setupFormatInfo(maskPattern: number): void {
    const size = this.#size;
    const matrix = this.#matrix;
    const bits = QRUtil.getBCHVersionInfo((this.#level << 3) | maskPattern);

    for (let i = 0; i < 15; i++) {
      const bit = ((bits >> i) & 1) === 1;

      // Vertical
      if (i < 6) {
        matrix[i][8] = bit;
      } else if (i < 8) {
        matrix[i + 1][8] = bit;
      } else {
        matrix[size - 15 + i][8] = bit;
      }

      // Horizontal
      if (i < 8) {
        matrix[8][size - i - 1] = bit;
      } else if (i < 9) {
        matrix[8][15 - i - 1 + 1] = bit;
      } else {
        matrix[8][15 - i - 1] = bit;
      }
    }

    // Fixed point
    matrix[size - 8][8] = true;
  }

  private setupVersionInfo(): void {
    if (this.#version >= 7) {
      const size = this.#size;
      const matrix = this.#matrix;
      const bits = QRUtil.getBCHVersion(this.version);

      for (let i = 0; i < 18; i++) {
        const bit = ((bits >> i) & 1) === 1;

        matrix[(i / 3) >> 0][(i % 3) + size - 8 - 3] = bit;
        matrix[(i % 3) + size - 8 - 3][(i / 3) >> 0] = bit;
      }
    }
  }

  private setupCodewords(data: BitBuffer, maskPattern: number): void {
    const size = this.#size;
    const matrix = this.#matrix;
    const bitLength = data.getLengthInBits();
    const maskFunc = getMaskFunc(maskPattern);

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

          if (matrix[y][x] !== null) {
            continue;
          }

          let bit = false;

          if (bitIndex < bitLength) {
            bit = data.getBit(bitIndex++);
          }

          const invert = maskFunc(x, y);

          if (invert) {
            bit = !bit;
          }

          matrix[y][x] = bit;
        }
      }
    }
  }

  private build(data: BitBuffer, maskPattern: number): void {
    const size = this.#size;
    // Initialize matrix
    const matrix: boolean[][] = [];

    for (let i = 0; i < size; i++) {
      matrix[i] = [];

      for (let j = 0; j < size; j++) {
        matrix[i][j] = null as any;
      }
    }

    this.#matrix = matrix;

    // Setup finder pattern
    this.setupFinderPattern(0, 0);
    this.setupFinderPattern(0, size - 7);
    this.setupFinderPattern(size - 7, 0);

    // Setup alignment pattern
    this.setupAlignmentPattern();

    // Setup timing pattern
    this.setupTimingPattern();

    // Setup format info
    this.setupFormatInfo(maskPattern);

    // Setup version info
    this.setupVersionInfo();

    // Setup codewords
    this.setupCodewords(data, maskPattern);
  }

  /**
   * @public
   * @method encode
   * @returns {Encoder}
   */
  public encode(): boolean[][] {
    let buffer!: BitBuffer;
    let rsBlocks!: RSBlock[];
    let maxDataCount!: number;

    const level = this.#level;
    const chunks = this.#chunks;

    if (this.#semver === 0) {
      let version = 1;

      for (; version <= 40; version++) {
        [buffer, rsBlocks, maxDataCount] = prepareData(version, level, this.#hint, chunks);

        if (buffer.getLengthInBits() <= maxDataCount) break;
      }

      const dataLengthInBits = buffer.getLengthInBits();

      if (dataLengthInBits > maxDataCount) {
        throw new Error(`data overflow: ${dataLengthInBits} > ${maxDataCount}`);
      }

      this.version = version;
    } else {
      [buffer, rsBlocks, maxDataCount] = prepareData(this.version, level, this.#hint, chunks);
    }

    // Calc module count
    this.#size = this.#version * 4 + 17;

    const matrices: boolean[][][] = [];
    const data = createData(buffer, rsBlocks, maxDataCount);

    let bestMaskPattern = -1;
    let minPenalty = Number.MAX_VALUE;

    // Choose best mask pattern
    for (let maskPattern = 0; maskPattern < 8; maskPattern++) {
      this.build(data, maskPattern);

      matrices.push(this.#matrix);

      const penalty = QRUtil.calculateMaskPenalty(this);

      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestMaskPattern = maskPattern;
      }
    }

    const matrix = matrices[bestMaskPattern];

    this.#matrix = matrix;

    return matrix;
  }

  /**
   * @public
   * @method flush
   */
  public flush() {
    this.#size = 0;
    this.#chunks = [];
    this.#matrix = [];
    this.#version = this.#semver;
  }
}
