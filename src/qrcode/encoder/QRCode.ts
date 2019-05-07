/**
 * @module QRCode
 * @author nuintun
 * @author Kazuhiko Arase
 */

import QRByte from './QRByte';
import QRData from './QRData';
import RSBlock from './RSBlock';
import Mode from '../common/Mode';
import * as QRUtil from './QRUtil';
import BitBuffer from './BitBuffer';
import Polynomial from './Polynomial';
import GIFImage from '../../image/GIFImage';
import getMaskFunc, { maskFunc } from '../common/MaskPattern';
import ErrorCorrectionLevel from '../common/ErrorCorrectionLevel';

const PAD0: number = 0xec;
const PAD1: number = 0x11;
const toString: () => string = Object.prototype.toString;

type prepareData = [BitBuffer, RSBlock[], number];

/**
 * @function appendECI
 * @param {number} encoding
 * @param {BitBuffer} buffer
 * @see https://github.com/nayuki/QR-Code-generator/blob/master/typescript/qrcodegen.ts
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/Encoder.java
 */
function appendECI(encoding: number, buffer: BitBuffer) {
  if (encoding < 0 || encoding >= 1000000) {
    throw 'byte mode encoding hint out of range';
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

function prepareData(
  version: number,
  errorCorrectionLevel: ErrorCorrectionLevel,
  hasEncodingHint: boolean,
  chunks: QRData[]
): prepareData {
  const dLength: number = chunks.length;
  const buffer: BitBuffer = new BitBuffer();
  const rsBlocks: RSBlock[] = RSBlock.getRSBlocks(version, errorCorrectionLevel);

  for (let i: number = 0; i < dLength; i++) {
    const data: QRData = chunks[i];
    const mode: Mode = data.getMode();

    // default set encoding UTF-8 when has encoding hint
    if (hasEncodingHint && mode === Mode.Byte) {
      appendECI((data as QRByte).encoding, buffer);
    }

    buffer.put(mode, 4);
    buffer.put(data.getLength(), data.getLengthInBits(version));
    data.write(buffer);
  }

  // calc max data count
  let maxDataCount: number = 0;
  const rLength: number = rsBlocks.length;

  for (let i: number = 0; i < rLength; i++) {
    maxDataCount += rsBlocks[i].getDataCount();
  }

  maxDataCount *= 8;

  return [buffer, rsBlocks, maxDataCount];
}

function createBytes(buffer: BitBuffer, rsBlocks: RSBlock[]): BitBuffer {
  let offset: number = 0;
  let maxDcCount: number = 0;
  let maxEcCount: number = 0;
  const dcData: number[][] = [];
  const ecData: number[][] = [];
  const rsLength: number = rsBlocks.length;
  const bufferData: number[] = buffer.getBuffer();

  for (let r: number = 0; r < rsLength; r++) {
    const rsBlock: RSBlock = rsBlocks[r];
    const dcCount: number = rsBlock.getDataCount();
    const ecCount: number = rsBlock.getTotalCount() - dcCount;

    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    dcData[r] = [];

    for (let i: number = 0; i < dcCount; i++) {
      dcData[r][i] = 0xff & bufferData[i + offset];
    }

    offset += dcCount;

    const rsPoly: Polynomial = QRUtil.getErrorCorrectionPolynomial(ecCount);
    const ecLength: number = rsPoly.getLength() - 1;
    const rawPoly: Polynomial = new Polynomial(dcData[r], ecLength);
    const modPoly: Polynomial = rawPoly.mod(rsPoly);
    const mpLength: number = modPoly.getLength();

    ecData[r] = [];

    for (let i: number = 0; i < ecLength; i++) {
      const modIndex: number = i + mpLength - ecLength;

      ecData[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
    }
  }

  buffer = new BitBuffer();

  for (let i: number = 0; i < maxDcCount; i++) {
    for (let r: number = 0; r < rsLength; r++) {
      if (i < dcData[r].length) {
        buffer.put(dcData[r][i], 8);
      }
    }
  }

  for (let i: number = 0; i < maxEcCount; i++) {
    for (let r: number = 0; r < rsLength; r++) {
      if (i < ecData[r].length) {
        buffer.put(ecData[r][i], 8);
      }
    }
  }

  return buffer;
}

function createData(buffer: BitBuffer, rsBlocks: RSBlock[], maxDataCount: number): BitBuffer {
  if (buffer.getLengthInBits() > maxDataCount) {
    throw `data overflow: ${buffer.getLengthInBits()} > ${maxDataCount}`;
  }

  // end
  if (buffer.getLengthInBits() + 4 <= maxDataCount) {
    buffer.put(0, 4);
  }

  // padding
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }

  // padding
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

export default class QRCode {
  private version: number = 0;
  private chunks: QRData[] = [];
  private moduleCount: number = 0;
  private modules: boolean[][] = [];
  private hasEncodingHint: boolean = false;
  private autoVersion: boolean = this.version === 0;
  private errorCorrectionLevel: ErrorCorrectionLevel = ErrorCorrectionLevel.L;

  /**
   * @public
   * @method getModules
   * @returns {boolean[][]}
   */
  public getModules(): boolean[][] {
    return this.modules;
  }

  /**
   * @public
   * @method getModuleCount
   */
  public getModuleCount(): number {
    return this.moduleCount;
  }

  /**
   * @public
   * @method getVersion
   * @returns {number}
   */
  public getVersion(): number {
    return this.version;
  }

  /**
   * @public
   * @method setVersion
   * @param {number} version
   */
  public setVersion(version: number): void {
    this.version = Math.min(40, Math.max(0, version >> 0));
    this.autoVersion = this.version === 0;
  }

  /**
   * @public
   * @method getErrorCorrectionLevel
   * @returns {ErrorCorrectionLevel}
   */
  public getErrorCorrectionLevel(): ErrorCorrectionLevel {
    return this.errorCorrectionLevel;
  }

  /**
   * @public
   * @method setErrorCorrectionLevel
   * @param {ErrorCorrectionLevel} errorCorrectionLevel
   */
  public setErrorCorrectionLevel(errorCorrectionLevel: ErrorCorrectionLevel): void {
    switch (errorCorrectionLevel) {
      case ErrorCorrectionLevel.L:
      case ErrorCorrectionLevel.M:
      case ErrorCorrectionLevel.Q:
      case ErrorCorrectionLevel.H:
        this.errorCorrectionLevel = errorCorrectionLevel;
    }
  }

  /**
   * @public
   * @method getEncodingHint
   * @returns {boolean}
   */
  public getEncodingHint(): boolean {
    return this.hasEncodingHint;
  }

  /**
   * @public
   * @method setEncodingHint
   * @param {boolean} hasEncodingHint
   */
  public setEncodingHint(hasEncodingHint: boolean): void {
    this.hasEncodingHint = hasEncodingHint;
  }

  /**
   * @public
   * @method write
   * @param {QRData} data
   */
  public write(data: QRData | string): void {
    if (data instanceof QRData) {
      this.chunks.push(data);
    } else {
      const type: string = toString.call(data);

      if (type === '[object String]') {
        this.chunks.push(new QRByte(data));
      } else {
        throw `illegal data: ${data}`;
      }
    }
  }

  /**
   * @public
   * @method isDark
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  public isDark(row: number, col: number): boolean {
    if (this.modules[row][col] !== null) {
      return this.modules[row][col];
    } else {
      return false;
    }
  }

  private setupFinderPattern(row: number, col: number): void {
    const moduleCount: number = this.moduleCount;

    for (let r: number = -1; r <= 7; r++) {
      for (let c: number = -1; c <= 7; c++) {
        if (row + r <= -1 || moduleCount <= row + r || col + c <= -1 || moduleCount <= col + c) {
          continue;
        }

        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }

  private setupAlignmentPattern(): void {
    const pos: number[] = QRUtil.getAlignmentPattern(this.version);
    const length: number = pos.length;

    for (let i: number = 0; i < length; i++) {
      for (let j: number = 0; j < length; j++) {
        const row: number = pos[i];
        const col: number = pos[j];

        if (this.modules[row][col] !== null) {
          continue;
        }

        for (let r: number = -2; r <= 2; r++) {
          for (let c: number = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              this.modules[row + r][col + c] = true;
            } else {
              this.modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  private setupTimingPattern(): void {
    const count: number = this.moduleCount - 8;

    for (let i: number = 8; i < count; i++) {
      const bit: boolean = i % 2 === 0;

      // vertical
      if (this.modules[i][6] === null) {
        this.modules[i][6] = bit;
      }

      // horizontal
      if (this.modules[6][i] === null) {
        this.modules[6][i] = bit;
      }
    }
  }

  private setupFormatInfo(maskPattern: number): void {
    const data: number = (this.errorCorrectionLevel << 3) | maskPattern;
    const bits: number = QRUtil.getBCHVersionInfo(data);
    const moduleCount: number = this.moduleCount;

    for (let i: number = 0; i < 15; i++) {
      const bit: boolean = ((bits >> i) & 1) === 1;

      // vertical
      if (i < 6) {
        this.modules[i][8] = bit;
      } else if (i < 8) {
        this.modules[i + 1][8] = bit;
      } else {
        this.modules[moduleCount - 15 + i][8] = bit;
      }

      // horizontal
      if (i < 8) {
        this.modules[8][moduleCount - i - 1] = bit;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = bit;
      } else {
        this.modules[8][15 - i - 1] = bit;
      }
    }

    // fixed point
    this.modules[moduleCount - 8][8] = true;
  }

  private setupVersionInfo(): void {
    if (this.version >= 7) {
      const moduleCount: number = this.moduleCount;
      const bits: number = QRUtil.getBCHVersion(this.version);

      for (let i: number = 0; i < 18; i++) {
        const bit: boolean = ((bits >> i) & 1) === 1;

        this.modules[(i / 3) >> 0][(i % 3) + moduleCount - 8 - 3] = bit;
        this.modules[(i % 3) + moduleCount - 8 - 3][(i / 3) >> 0] = bit;
      }
    }
  }

  private setupCodewords(data: BitBuffer, maskPattern: number): void {
    // bit index into the data
    let bitIndex: number = 0;
    const moduleCount: number = this.moduleCount;
    const bitLength: number = data.getLengthInBits();

    // do the funny zigzag scan
    for (let right: number = moduleCount - 1; right >= 1; right -= 2) {
      // index of right column in each column pair
      if (right === 6) {
        right = 5;
      }

      for (let vert: number = 0; vert < moduleCount; vert++) {
        // vertical counter
        for (let j: number = 0; j < 2; j++) {
          // actual x coordinate
          const x: number = right - j;
          const upward: boolean = ((right + 1) & 2) === 0;
          // actual y coordinate
          const y: number = upward ? moduleCount - 1 - vert : vert;

          if (this.modules[y][x] !== null) {
            continue;
          }

          let bit: boolean = false;

          if (bitIndex < bitLength) {
            bit = data.getBit(bitIndex++);
          }

          const maskFunc: maskFunc = getMaskFunc(maskPattern);
          const invert: boolean = maskFunc(x, y);

          if (invert) {
            bit = !bit;
          }

          this.modules[y][x] = bit;
        }
      }
    }
  }

  private buildMatrix(data: BitBuffer, maskPattern: number): void {
    // initialize modules
    this.modules = [];

    const moduleCount: number = this.moduleCount;

    for (let row: number = 0; row < moduleCount; row++) {
      this.modules[row] = [];

      for (let col: number = 0; col < moduleCount; col++) {
        this.modules[row][col] = null;
      }
    }

    // setup finder pattern
    this.setupFinderPattern(0, 0);
    this.setupFinderPattern(moduleCount - 7, 0);
    this.setupFinderPattern(0, moduleCount - 7);

    // setup alignment pattern
    this.setupAlignmentPattern();

    // setup timing pattern
    this.setupTimingPattern();

    // setup format info
    this.setupFormatInfo(maskPattern);

    // setup version info
    this.setupVersionInfo();

    // setup codewords
    this.setupCodewords(data, maskPattern);
  }

  /**
   * @public
   * @method make
   */
  public make(): void {
    let buffer: BitBuffer;
    let rsBlocks: RSBlock[];
    let maxDataCount: number;

    const chunks: QRData[] = this.chunks;
    const errorCorrectionLevel: ErrorCorrectionLevel = this.errorCorrectionLevel;

    if (this.autoVersion) {
      for (this.version = 1; this.version <= 40; this.version++) {
        [buffer, rsBlocks, maxDataCount] = prepareData(this.version, errorCorrectionLevel, this.hasEncodingHint, chunks);

        if (buffer.getLengthInBits() <= maxDataCount) break;
      }
    } else {
      [buffer, rsBlocks, maxDataCount] = prepareData(this.version, errorCorrectionLevel, this.hasEncodingHint, chunks);
    }

    // calc module count
    this.moduleCount = this.version * 4 + 17;

    const matrices: boolean[][][] = [];
    const data: BitBuffer = createData(buffer, rsBlocks, maxDataCount);

    let bestMaskPattern: number = -1;
    let minPenalty: number = Number.MAX_VALUE;

    // choose best mask pattern
    for (let maskPattern: number = 0; maskPattern < 8; maskPattern++) {
      this.buildMatrix(data, maskPattern);

      matrices.push(this.modules);

      const penalty: number = QRUtil.calculateMaskPenalty(this);

      if (penalty < minPenalty) {
        minPenalty = penalty;
        bestMaskPattern = maskPattern;
      }
    }

    this.modules = matrices[bestMaskPattern];
  }

  /**
   * @public
   * @method toDataURL
   * @param {number} moduleSize
   * @param {number} margin
   * @returns {string}
   */
  public toDataURL(moduleSize: number = 2, margin: number = moduleSize * 4): string {
    moduleSize = Math.max(1, moduleSize >> 0);
    margin = Math.max(0, margin >> 0);

    const moduleCount: number = this.moduleCount;
    const size: number = moduleSize * moduleCount + margin * 2;
    const gif: GIFImage = new GIFImage(size, size);

    for (let y: number = 0; y < size; y++) {
      for (let x: number = 0; x < size; x++) {
        if (
          margin <= x &&
          x < size - margin &&
          margin <= y &&
          y < size - margin &&
          this.isDark(((y - margin) / moduleSize) >> 0, ((x - margin) / moduleSize) >> 0)
        ) {
          gif.setPixel(x, y, 0);
        } else {
          gif.setPixel(x, y, 1);
        }
      }
    }

    return gif.toDataURL();
  }
}
