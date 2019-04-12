/**
 * @module QRCode
 * @author nuintun
 * @author Kazuhiko Arase
 */

import QRData from './QRData';
import RSBlock from './RSBlock';
import * as QRUtil from './QRUtil';
import BitBuffer from './BitBuffer';
import Polynomial from './Polynomial';
import QR8BitByte from './QR8BitByte';
import GIFImage from '../../image/GIFImage';
import ErrorCorrectLevel from './ErrorCorrectLevel';

const toString = Object.prototype.toString;

function createNumArray(length: number): number[] {
  const array: number[] = [];

  for (let i: number = 0; i < length; i++) {
    array.push(0);
  }

  return array;
}

export default class QRCode {
  private static PAD0: number = 0xec;
  private static PAD1: number = 0x11;

  private dataList: QRData[];
  private typeNumber: number;
  private moduleCount: number;
  private modules: boolean[][];
  private errorCorrectLevel: ErrorCorrectLevel;

  public constructor() {
    this.typeNumber = 1;
    this.dataList = [];
    this.errorCorrectLevel = ErrorCorrectLevel.L;
  }

  public getTypeNumber(): number {
    return this.typeNumber;
  }

  public setTypeNumber(typeNumber: number): void {
    this.typeNumber = typeNumber;
  }

  public getErrorCorrectLevel(): ErrorCorrectLevel {
    return this.errorCorrectLevel;
  }

  public setErrorCorrectLevel(errorCorrectLevel: ErrorCorrectLevel) {
    this.errorCorrectLevel = errorCorrectLevel;
  }

  public clearData(): void {
    this.dataList = [];
  }

  public addData(data: QRData | string): void {
    if (data instanceof QRData) {
      this.dataList.push(data);
    } else {
      const type: string = toString.call(data);

      if (type === '[object String]') {
        this.dataList.push(new QR8BitByte(data));
      } else {
        throw `unknow qrcode data: ${data}`;
      }
    }
  }

  public isDark(row: number, col: number): boolean {
    if (this.modules[row][col] != null) {
      return this.modules[row][col];
    } else {
      return false;
    }
  }

  public getModuleCount(): number {
    return this.moduleCount;
  }

  public make(): void {
    this.makeImpl(false, this.getBestMaskPattern());
  }

  private getBestMaskPattern(): number {
    let pattern: number = 0;
    let minLostPoint: number = 0;

    for (let i: number = 0; i < 8; i++) {
      this.makeImpl(true, i);

      const lostPoint: number = QRUtil.getLostPoint(this);

      if (i === 0 || minLostPoint > lostPoint) {
        pattern = i;
        minLostPoint = lostPoint;
      }
    }

    return pattern;
  }

  private makeImpl(test: boolean, maskPattern: number): void {
    // initialize modules
    this.modules = [];
    this.moduleCount = this.typeNumber * 4 + 17;

    for (let i: number = 0; i < this.moduleCount; i++) {
      this.modules.push([]);

      for (let j: number = 0; j < this.moduleCount; j++) {
        this.modules[i].push(null);
      }
    }

    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);

    this.setupPositionAdjustPattern();
    this.setupTimingPattern();

    this.setupTypeInfo(test, maskPattern);

    if (this.typeNumber >= 7) {
      this.setupTypeNumber(test);
    }

    const data: number[] = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);

    this.mapData(data, maskPattern);
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
          if (this.modules[row][col - c] == null) {
            let dark: boolean = false;

            if (byteIndex < data.length) {
              dark = ((data[byteIndex] >>> bitIndex) & 1) === 1;
            }

            const mask: boolean = maskFunc(row, col - c);

            if (mask) {
              dark = !dark;
            }

            this.modules[row][col - c] = dark;
            bitIndex -= 1;

            if (bitIndex === -1) {
              byteIndex += 1;
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

  private setupPositionAdjustPattern(): void {
    const pos: number[] = QRUtil.getPatternPosition(this.typeNumber);
    const length: number = pos.length;

    for (let i: number = 0; i < length; i++) {
      for (let j: number = 0; j < length; j++) {
        const row: number = pos[i];
        const col: number = pos[j];

        if (this.modules[row][col] != null) {
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

  private setupPositionProbePattern(row: number, col: number): void {
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

  private setupTimingPattern(): void {
    for (let r: number = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] != null) {
        continue;
      }

      this.modules[r][6] = r % 2 === 0;
    }

    for (let c: number = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] != null) {
        continue;
      }

      this.modules[6][c] = c % 2 === 0;
    }
  }

  private setupTypeNumber(test: boolean): void {
    const bits: number = QRUtil.getBCHTypeNumber(this.typeNumber);

    for (let i: number = 0; i < 18; i++) {
      this.modules[~~(i / 3)][(i % 3) + this.moduleCount - 8 - 3] = !test && ((bits >> i) & 1) === 1;
    }

    for (let i: number = 0; i < 18; i++) {
      this.modules[(i % 3) + this.moduleCount - 8 - 3][~~(i / 3)] = !test && ((bits >> i) & 1) === 1;
    }
  }

  private setupTypeInfo(test: boolean, maskPattern: number): void {
    const data: number = (this.errorCorrectLevel << 3) | maskPattern;
    const bits: number = QRUtil.getBCHTypeInfo(data);

    // vertical
    for (let i: number = 0; i < 15; i++) {
      const mod: boolean = !test && ((bits >> i) & 1) === 1;

      if (i < 6) {
        this.modules[i][8] = mod;
      } else if (i < 8) {
        this.modules[i + 1][8] = mod;
      } else {
        this.modules[this.moduleCount - 15 + i][8] = mod;
      }
    }

    // horizontal
    for (let i: number = 0; i < 15; i++) {
      const mod: boolean = !test && ((bits >> i) & 1) === 1;

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

  public static createData(typeNumber: number, errorCorrectLevel: ErrorCorrectLevel, dataArray: QRData[]): number[] {
    const buffer: BitBuffer = new BitBuffer();
    const rsBlocks: RSBlock[] = RSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

    const dLength: number = dataArray.length;

    for (let i: number = 0; i < dLength; i++) {
      const data: QRData = dataArray[i];

      buffer.put(data.getMode(), 4);
      buffer.put(data.getLength(), data.getLengthInBits(typeNumber));
      data.write(buffer);
    }

    // calc max data count
    let totalDataCount: number = 0;
    const rLength: number = rsBlocks.length;

    for (let i: number = 0; i < rLength; i++) {
      totalDataCount += rsBlocks[i].getDataCount();
    }

    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw `code length overflow: ${buffer.getLengthInBits()} > ${totalDataCount * 8}`;
    }

    // end
    if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
      buffer.put(0, 4);
    }

    // padding
    while (buffer.getLengthInBits() % 8 !== 0) {
      buffer.putBit(false);
    }

    // padding
    while (true) {
      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }

      buffer.put(QRCode.PAD0, 8);

      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }

      buffer.put(QRCode.PAD1, 8);
    }

    return QRCode.createBytes(buffer, rsBlocks);
  }

  private static createBytes(buffer: BitBuffer, rsBlocks: RSBlock[]): number[] {
    let offset: number = 0;
    let maxDcCount: number = 0;
    let maxEcCount: number = 0;
    const dcdata: number[][] = [];
    const ecdata: number[][] = [];
    const rLength: number = rsBlocks.length;

    for (let r: number = 0; r < rLength; r++) {
      dcdata.push([]);
      ecdata.push([]);
    }

    for (let r: number = 0; r < rLength; r++) {
      const dcCount: number = rsBlocks[r].getDataCount();
      const ecCount: number = rsBlocks[r].getTotalCount() - dcCount;

      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcdata[r] = createNumArray(dcCount);

      for (let i: number = 0; i < dcCount; i++) {
        dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
      }

      offset += dcCount;

      const rsPoly: Polynomial = QRUtil.getErrorCorrectPolynomial(ecCount);
      const rawPoly: Polynomial = new Polynomial(dcdata[r], rsPoly.getLength() - 1);
      const modPoly: Polynomial = rawPoly.mod(rsPoly);
      const ecLength: number = rsPoly.getLength() - 1;

      ecdata[r] = createNumArray(ecLength);

      for (let i: number = 0; i < ecLength; i++) {
        const modIndex: number = i + modPoly.getLength() - ecdata[r].length;

        ecdata[r][i] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
      }
    }

    let totalCodeCount: number = 0;

    for (let i: number = 0; i < rLength; i++) {
      totalCodeCount += rsBlocks[i].getTotalCount();
    }

    let index: number = 0;
    const data: number[] = createNumArray(totalCodeCount);

    for (let i: number = 0; i < maxDcCount; i++) {
      for (let r: number = 0; r < rLength; r++) {
        if (i < dcdata[r].length) {
          data[index] = dcdata[r][i];
          index += 1;
        }
      }
    }

    for (let i: number = 0; i < maxEcCount; i++) {
      for (let r: number = 0; r < rLength; r++) {
        if (i < ecdata[r].length) {
          data[index] = ecdata[r][i];
          index += 1;
        }
      }
    }

    return data;
  }

  public toDataURL(cellSize: number = 2, margin: number = cellSize * 4): string {
    const mods: number = this.getModuleCount();
    const size: number = cellSize * mods + margin * 2;
    const gif: GIFImage = new GIFImage(size, size);

    for (let y: number = 0; y < size; y++) {
      for (let x: number = 0; x < size; x++) {
        if (
          margin <= x &&
          x < size - margin &&
          margin <= y &&
          y < size - margin &&
          this.isDark(~~((y - margin) / cellSize), ~~((x - margin) / cellSize))
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
