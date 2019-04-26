/**
 * @module QRCode
 * @author nuintun
 * @author Kazuhiko Arase
 */

import QRByte from './QRByte';
import QRData from './QRData';
import RSBlock from './RSBlock';
import * as QRUtil from './QRUtil';
import BitBuffer from './BitBuffer';
import Polynomial from './Polynomial';
import GIFImage from '../../image/GIFImage';
import ErrorCorrectionLevel from '../common/ErrorCorrectionLevel';

const toString = Object.prototype.toString;

type prepareData = [BitBuffer, RSBlock[], number];

function createNumArray(length: number): number[] {
  const array: number[] = [];

  for (let i: number = 0; i < length; i++) {
    array[i] = 0;
  }

  return array;
}

export default class QRCode {
  private static PAD0: number = 0xec;
  private static PAD1: number = 0x11;

  private version: number = 0;
  private moduleCount: number = 0;
  private dataList: QRData[] = [];
  private modules: boolean[][] = [];
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
    this.version = Math.min(40, Math.max(0, version >>> 0));
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
  public setErrorCorrectionLevel(errorCorrectionLevel: ErrorCorrectionLevel) {
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
   * @method write
   * @param {QRData} data
   */
  public write(data: QRData | string): void {
    if (data instanceof QRData) {
      this.dataList.push(data);
    } else {
      const type: string = toString.call(data);

      if (type === '[object String]') {
        this.dataList.push(new QRByte(data));
      } else {
        throw `illegal data: ${data}`;
      }
    }
  }

  /**
   * @public
   * @method reset
   */
  public reset(): void {
    this.modules = [];
    this.dataList = [];
    this.moduleCount = 0;

    if (this.autoVersion) {
      this.version = 0;
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
    for (let r: number = -1; r <= 7; r++) {
      for (let c: number = -1; c <= 7; c++) {
        if (row + r <= -1 || this.moduleCount <= row + r || col + c <= -1 || this.moduleCount <= col + c) {
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
    for (let i: number = 8; i < this.moduleCount - 8; i++) {
      const mod = i % 2 === 0;

      // vertical
      if (this.modules[i][6] === null) {
        this.modules[i][6] = mod;
      }

      // horizontal
      if (this.modules[6][i] === null) {
        this.modules[6][i] = mod;
      }
    }
  }

  private setupFormatInfo(test: boolean, maskPattern: number): void {
    const data: number = (this.errorCorrectionLevel << 3) | maskPattern;
    const bits: number = QRUtil.getBCHVersionInfo(data);

    for (let i: number = 0; i < 15; i++) {
      const mod: boolean = !test && ((bits >> i) & 1) === 1;

      // vertical
      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }

      // horizontal
      if (i < 8) {
        this.modules[8][this.moduleCount - i - 1] = mod;
      } else if (i < 9) {
        this.modules[8][15 - i - 1 + 1] = mod;
      } else {
        this.modules[8][15 - i - 1] = mod;
      }
    }

    // fixed
    this.modules[this.moduleCount - 8][8] = !test;
  }

  private setupVersionInfo(test: boolean): void {
    const bits: number = QRUtil.getBCHVersion(this.version);

    for (let i: number = 0; i < 18; i++) {
      const mod: boolean = !test && ((bits >> i) & 1) === 1;

      this.modules[(i / 3) >>> 0][(i % 3) + this.moduleCount - 8 - 3] = mod;
      this.modules[(i % 3) + this.moduleCount - 8 - 3][(i / 3) >>> 0] = mod;
    }
  }

  private static prepareData(version: number, errorCorrectionLevel: ErrorCorrectionLevel, dataList: QRData[]): prepareData {
    const dLength: number = dataList.length;
    const buffer: BitBuffer = new BitBuffer();
    const rsBlocks: RSBlock[] = RSBlock.getRSBlocks(version, errorCorrectionLevel);

    for (let i: number = 0; i < dLength; i++) {
      const data: QRData = dataList[i];

      buffer.put(data.getMode(), 4);
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

  private static createBytes(buffer: BitBuffer, rsBlocks: RSBlock[]): number[] {
    let offset: number = 0;
    let maxDcCount: number = 0;
    let maxEcCount: number = 0;
    let maxTotalCount: number = 0;
    const dcData: number[][] = [];
    const ecData: number[][] = [];
    const rLength: number = rsBlocks.length;

    for (let r: number = 0; r < rLength; r++) {
      const dcCount: number = rsBlocks[r].getDataCount();
      const ecCount: number = rsBlocks[r].getTotalCount() - dcCount;

      dcData[r] = [];
      ecData[r] = [];
      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcData[r] = createNumArray(dcCount);

      for (let i: number = 0; i < dcCount; i++) {
        dcData[r][i] = 0xff & buffer.getBuffer()[i + offset];
      }

      offset += dcCount;

      const rsPoly: Polynomial = QRUtil.getErrorCorrectionPolynomial(ecCount);
      const rawPoly: Polynomial = new Polynomial(dcData[r], rsPoly.getLength() - 1);
      const modPoly: Polynomial = rawPoly.mod(rsPoly);
      const ecLength: number = rsPoly.getLength() - 1;

      ecData[r] = createNumArray(ecLength);

      for (let i: number = 0; i < ecLength; i++) {
        const modIndex: number = i + modPoly.getLength() - ecData[r].length;

        ecData[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
      }

      maxTotalCount += rsBlocks[r].getTotalCount();
    }

    let index: number = 0;
    const data: number[] = createNumArray(maxTotalCount);

    for (let i: number = 0; i < maxDcCount; i++) {
      for (let r: number = 0; r < rLength; r++) {
        if (i < dcData[r].length) {
          data[index++] = dcData[r][i];
        }
      }
    }

    for (let i: number = 0; i < maxEcCount; i++) {
      for (let r: number = 0; r < rLength; r++) {
        if (i < ecData[r].length) {
          data[index++] = ecData[r][i];
        }
      }
    }

    return data;
  }

  private static createData(buffer: BitBuffer, rsBlocks: RSBlock[], maxDataCount: number): number[] {
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

      buffer.put(QRCode.PAD0, 8);

      if (buffer.getLengthInBits() >= maxDataCount) {
        break;
      }

      buffer.put(QRCode.PAD1, 8);
    }

    return QRCode.createBytes(buffer, rsBlocks);
  }

  private mapData(data: number[], maskPattern: number): void {
    let inc: number = -1;
    let bitIndex: number = 7;
    let byteIndex: number = 0;
    let row: number = this.moduleCount - 1;
    const maskFunc: QRUtil.maskFunc = QRUtil.getMaskFunc(maskPattern);

    for (let col: number = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) {
        col--;
      }

      while (true) {
        for (let c: number = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark: boolean = false;

            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }

            const mask: boolean = maskFunc(row, col - c);

            if (mask) {
              dark = !dark;
            }

            this.modules[row][col - c] = dark;

            if (--bitIndex === -1) {
              byteIndex++;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || this.moduleCount <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  }

  private makeImpl(test: boolean, data: number[], maskPattern: number): void {
    // initialize modules
    this.modules = [];

    for (let row: number = 0; row < this.moduleCount; row++) {
      this.modules[row] = [];

      for (let col: number = 0; col < this.moduleCount; col++) {
        this.modules[row][col] = null;
      }
    }

    // setup finder pattern
    this.setupFinderPattern(0, 0);
    this.setupFinderPattern(this.moduleCount - 7, 0);
    this.setupFinderPattern(0, this.moduleCount - 7);

    // setup alignment pattern
    this.setupAlignmentPattern();

    // setup timing pattern
    this.setupTimingPattern();

    // setup format info
    this.setupFormatInfo(test, maskPattern);

    // setup version info
    if (this.version >= 7) {
      this.setupVersionInfo(test);
    }

    this.mapData(data, maskPattern);
  }

  private getBestMaskPattern(data: number[]): number {
    let minimum: number = 0;
    let pattern: number = 0;

    for (let i: number = 0; i < 8; i++) {
      this.makeImpl(true, data, i);

      const score: number = QRUtil.getPenaltyScore(this);

      if (i === 0 || minimum > score) {
        pattern = i;
        minimum = score;
      }
    }

    return pattern;
  }

  /**
   * @public
   * @method make
   */
  public make(): void {
    let buffer: BitBuffer;
    let rsBlocks: RSBlock[];
    let maxDataCount: number;

    const dataList = this.dataList;
    const errorCorrectionLevel = this.errorCorrectionLevel;

    if (this.autoVersion) {
      for (this.version = 1; this.version <= 40; this.version++) {
        [buffer, rsBlocks, maxDataCount] = QRCode.prepareData(this.version, errorCorrectionLevel, dataList);

        if (buffer.getLengthInBits() <= maxDataCount) break;
      }
    } else {
      [buffer, rsBlocks, maxDataCount] = QRCode.prepareData(this.version, errorCorrectionLevel, dataList);
    }

    // calc module count
    this.moduleCount = this.version * 4 + 17;

    // create data
    const data: number[] = QRCode.createData(buffer, rsBlocks, maxDataCount);

    this.makeImpl(false, data, this.getBestMaskPattern(data));
  }

  /**
   * @public
   * @method toDataURL
   * @param {number} moduleSize
   * @param {number} margin
   * @returns {string}
   */
  public toDataURL(moduleSize: number = 2, margin: number = moduleSize * 4): string {
    moduleSize = Math.max(1, moduleSize >>> 0);
    margin = Math.max(0, margin >>> 0);

    const mods: number = this.moduleCount;
    const size: number = moduleSize * mods + margin * 2;
    const gif: GIFImage = new GIFImage(size, size);

    for (let y: number = 0; y < size; y++) {
      for (let x: number = 0; x < size; x++) {
        if (
          margin <= x &&
          x < size - margin &&
          margin <= y &&
          y < size - margin &&
          this.isDark(((y - margin) / moduleSize) >>> 0, ((x - margin) / moduleSize) >>> 0)
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
