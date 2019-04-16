import Point from '../Point';
import rsDecode from './reedsolomon';
import BitMatrix from '../BitMatrix';
import { Version, VERSIONS, ECLevel } from './version';
import { decode as decodeBytes, DecodeResult } from './decode';

function numBitsDiffering(x: number, y: number): number {
  let z: number = x ^ y;
  let bitCount: number = 0;

  while (z) {
    bitCount++;
    z &= z - 1;
  }

  return bitCount;
}

function pushBit(bit: any, byte: number): number {
  return (byte << 1) | bit;
}

interface FormatInformation {
  dataMask: number;
  errorCorrectionLevel: number;
}

interface FormatItem {
  bits: number;
  formatInfo: FormatInformation;
}

const FORMAT_INFO_TABLE: FormatItem[] = [
  { bits: 0x5412, formatInfo: { errorCorrectionLevel: 1, dataMask: 0 } },
  { bits: 0x5125, formatInfo: { errorCorrectionLevel: 1, dataMask: 1 } },
  { bits: 0x5e7c, formatInfo: { errorCorrectionLevel: 1, dataMask: 2 } },
  { bits: 0x5b4b, formatInfo: { errorCorrectionLevel: 1, dataMask: 3 } },
  { bits: 0x45f9, formatInfo: { errorCorrectionLevel: 1, dataMask: 4 } },
  { bits: 0x40ce, formatInfo: { errorCorrectionLevel: 1, dataMask: 5 } },
  { bits: 0x4f97, formatInfo: { errorCorrectionLevel: 1, dataMask: 6 } },
  { bits: 0x4aa0, formatInfo: { errorCorrectionLevel: 1, dataMask: 7 } },
  { bits: 0x77c4, formatInfo: { errorCorrectionLevel: 0, dataMask: 0 } },
  { bits: 0x72f3, formatInfo: { errorCorrectionLevel: 0, dataMask: 1 } },
  { bits: 0x7daa, formatInfo: { errorCorrectionLevel: 0, dataMask: 2 } },
  { bits: 0x789d, formatInfo: { errorCorrectionLevel: 0, dataMask: 3 } },
  { bits: 0x662f, formatInfo: { errorCorrectionLevel: 0, dataMask: 4 } },
  { bits: 0x6318, formatInfo: { errorCorrectionLevel: 0, dataMask: 5 } },
  { bits: 0x6c41, formatInfo: { errorCorrectionLevel: 0, dataMask: 6 } },
  { bits: 0x6976, formatInfo: { errorCorrectionLevel: 0, dataMask: 7 } },
  { bits: 0x1689, formatInfo: { errorCorrectionLevel: 3, dataMask: 0 } },
  { bits: 0x13be, formatInfo: { errorCorrectionLevel: 3, dataMask: 1 } },
  { bits: 0x1ce7, formatInfo: { errorCorrectionLevel: 3, dataMask: 2 } },
  { bits: 0x19d0, formatInfo: { errorCorrectionLevel: 3, dataMask: 3 } },
  { bits: 0x0762, formatInfo: { errorCorrectionLevel: 3, dataMask: 4 } },
  { bits: 0x0255, formatInfo: { errorCorrectionLevel: 3, dataMask: 5 } },
  { bits: 0x0d0c, formatInfo: { errorCorrectionLevel: 3, dataMask: 6 } },
  { bits: 0x083b, formatInfo: { errorCorrectionLevel: 3, dataMask: 7 } },
  { bits: 0x355f, formatInfo: { errorCorrectionLevel: 2, dataMask: 0 } },
  { bits: 0x3068, formatInfo: { errorCorrectionLevel: 2, dataMask: 1 } },
  { bits: 0x3f31, formatInfo: { errorCorrectionLevel: 2, dataMask: 2 } },
  { bits: 0x3a06, formatInfo: { errorCorrectionLevel: 2, dataMask: 3 } },
  { bits: 0x24b4, formatInfo: { errorCorrectionLevel: 2, dataMask: 4 } },
  { bits: 0x2183, formatInfo: { errorCorrectionLevel: 2, dataMask: 5 } },
  { bits: 0x2eda, formatInfo: { errorCorrectionLevel: 2, dataMask: 6 } },
  { bits: 0x2bed, formatInfo: { errorCorrectionLevel: 2, dataMask: 7 } }
];

type maskFunc = (point: Point) => boolean;

const DATA_MASKS: maskFunc[] = [
  (p: Point): boolean => (p.y + p.x) % 2 === 0,
  (p: Point): boolean => p.y % 2 === 0,
  (p: Point): boolean => p.x % 3 === 0,
  (p: Point): boolean => (p.y + p.x) % 3 === 0,
  (p: Point): boolean => (Math.floor(p.y / 2) + Math.floor(p.x / 3)) % 2 === 0,
  (p: Point): boolean => ((p.x * p.y) % 2) + ((p.x * p.y) % 3) === 0,
  (p: Point): boolean => (((p.y * p.x) % 2) + ((p.y * p.x) % 3)) % 2 === 0,
  (p: Point): boolean => (((p.y + p.x) % 2) + ((p.y * p.x) % 3)) % 2 === 0
];

function buildFunctionPatternMask(version: Version): BitMatrix {
  const dimension: number = 17 + 4 * version.versionNumber;
  const matrix: BitMatrix = BitMatrix.createEmpty(dimension, dimension);

  matrix.setRegion(0, 0, 9, 9, true); // Top left finder pattern + separator + format
  matrix.setRegion(dimension - 8, 0, 8, 9, true); // Top right finder pattern + separator + format
  matrix.setRegion(0, dimension - 8, 9, 8, true); // Bottom left finder pattern + separator + format

  // Alignment patterns
  for (const x of version.alignmentPatternCenters) {
    for (const y of version.alignmentPatternCenters) {
      if (!((x === 6 && y === 6) || (x === 6 && y === dimension - 7) || (x === dimension - 7 && y === 6))) {
        matrix.setRegion(x - 2, y - 2, 5, 5, true);
      }
    }
  }

  matrix.setRegion(6, 9, 1, dimension - 17, true); // Vertical timing pattern
  matrix.setRegion(9, 6, dimension - 17, 1, true); // Horizontal timing pattern

  if (version.versionNumber > 6) {
    matrix.setRegion(dimension - 11, 0, 3, 6, true); // Version info, top right
    matrix.setRegion(0, dimension - 11, 6, 3, true); // Version info, bottom left
  }

  return matrix;
}

function readCodewords(matrix: BitMatrix, version: Version, formatInfo: FormatInformation): number[] {
  const dimension: number = matrix.height;
  const dataMask: maskFunc = DATA_MASKS[formatInfo.dataMask];
  const functionPatternMask: BitMatrix = buildFunctionPatternMask(version);

  let bitsRead: number = 0;
  let currentByte: number = 0;
  const codewords: number[] = [];

  // Read columns in pairs, from right to left
  let readingUp: boolean = true;

  for (let columnIndex: number = dimension - 1; columnIndex > 0; columnIndex -= 2) {
    if (columnIndex === 6) {
      // Skip whole column with vertical alignment pattern;
      columnIndex--;
    }

    for (let i: number = 0; i < dimension; i++) {
      const y: number = readingUp ? dimension - 1 - i : i;

      for (let columnOffset: number = 0; columnOffset < 2; columnOffset++) {
        const x: number = columnIndex - columnOffset;

        if (!functionPatternMask.get(x, y)) {
          bitsRead++;

          let bit: boolean = matrix.get(x, y);

          if (dataMask({ y, x })) {
            bit = !bit;
          }

          currentByte = pushBit(bit, currentByte);

          if (bitsRead === 8) {
            // Whole bytes
            codewords.push(currentByte);

            bitsRead = 0;
            currentByte = 0;
          }
        }
      }
    }

    readingUp = !readingUp;
  }

  return codewords;
}

function readVersion(matrix: BitMatrix): Version {
  const dimension: number = matrix.height;
  const provisionalVersion: number = Math.floor((dimension - 17) / 4);

  if (provisionalVersion <= 6) {
    // 6 and under dont have version info in the QR code
    return VERSIONS[provisionalVersion - 1];
  }

  let topRightVersionBits: number = 0;

  for (let y: number = 5; y >= 0; y--) {
    for (let x: number = dimension - 9; x >= dimension - 11; x--) {
      topRightVersionBits = pushBit(matrix.get(x, y), topRightVersionBits);
    }
  }

  let bottomLeftVersionBits: number = 0;

  for (let x: number = 5; x >= 0; x--) {
    for (let y: number = dimension - 9; y >= dimension - 11; y--) {
      bottomLeftVersionBits = pushBit(matrix.get(x, y), bottomLeftVersionBits);
    }
  }

  let bestVersion: Version;
  let bestDifference: number = Infinity;

  for (const version of VERSIONS) {
    if (version.infoBits === topRightVersionBits || version.infoBits === bottomLeftVersionBits) {
      return version;
    }

    let difference: number = numBitsDiffering(topRightVersionBits, version.infoBits);

    if (difference < bestDifference) {
      bestVersion = version;
      bestDifference = difference;
    }

    difference = numBitsDiffering(bottomLeftVersionBits, version.infoBits);

    if (difference < bestDifference) {
      bestVersion = version;
      bestDifference = difference;
    }
  }

  // We can tolerate up to 3 bits of error since no two version info codewords will
  // differ in less than 8 bits.
  if (bestDifference <= 3) {
    return bestVersion;
  }
}

function readFormatInformation(matrix: BitMatrix): FormatInformation {
  let topLeftFormatInfoBits: number = 0;

  for (let x: number = 0; x <= 8; x++) {
    if (x !== 6) {
      // Skip timing pattern bit
      topLeftFormatInfoBits = pushBit(matrix.get(x, 8), topLeftFormatInfoBits);
    }
  }

  for (let y: number = 7; y >= 0; y--) {
    if (y !== 6) {
      // Skip timing pattern bit
      topLeftFormatInfoBits = pushBit(matrix.get(8, y), topLeftFormatInfoBits);
    }
  }

  const dimension: number = matrix.height;
  let topRightBottomRightFormatInfoBits: number = 0;

  for (let y: number = dimension - 1; y >= dimension - 7; y--) {
    // bottom left
    topRightBottomRightFormatInfoBits = pushBit(matrix.get(8, y), topRightBottomRightFormatInfoBits);
  }

  for (let x: number = dimension - 8; x < dimension; x++) {
    // top right
    topRightBottomRightFormatInfoBits = pushBit(matrix.get(x, 8), topRightBottomRightFormatInfoBits);
  }

  let bestDifference: number = Infinity;
  let bestFormatInfo: FormatInformation = null;

  for (const { bits, formatInfo } of FORMAT_INFO_TABLE) {
    if (bits === topLeftFormatInfoBits || bits === topRightBottomRightFormatInfoBits) {
      return formatInfo;
    }

    let difference: number = numBitsDiffering(topLeftFormatInfoBits, bits);

    if (difference < bestDifference) {
      bestFormatInfo = formatInfo;
      bestDifference = difference;
    }

    if (topLeftFormatInfoBits !== topRightBottomRightFormatInfoBits) {
      // also try the other option
      difference = numBitsDiffering(topRightBottomRightFormatInfoBits, bits);

      if (difference < bestDifference) {
        bestFormatInfo = formatInfo;
        bestDifference = difference;
      }
    }
  }

  // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits differing means we found a match
  if (bestDifference <= 3) {
    return bestFormatInfo;
  }

  return null;
}

interface DataBlock {
  codewords: number[];
  numDataCodewords: number;
}

function getDataBlocks(codewords: number[], version: Version, ecLevel: number): DataBlock[] {
  const dataBlocks: DataBlock[] = [];
  const ecInfo: ECLevel = version.errorCorrectionLevels[ecLevel];

  let totalCodewords: number = 0;

  ecInfo.ecBlocks.forEach(block => {
    for (let i: number = 0; i < block.numBlocks; i++) {
      dataBlocks.push({ numDataCodewords: block.dataCodewordsPerBlock, codewords: [] });

      totalCodewords += block.dataCodewordsPerBlock + ecInfo.ecCodewordsPerBlock;
    }
  });

  // In some cases the QR code will be malformed enough that we pull off more or less than we should.
  // If we pull off less there's nothing we can do.
  // If we pull off more we can safely truncate
  if (codewords.length < totalCodewords) {
    return null;
  }

  codewords = codewords.slice(0, totalCodewords);

  const shortBlockSize: number = ecInfo.ecBlocks[0].dataCodewordsPerBlock;

  // Pull codewords to fill the blocks up to the minimum size
  for (let i: number = 0; i < shortBlockSize; i++) {
    for (const dataBlock of dataBlocks) {
      dataBlock.codewords.push(codewords.shift());
    }
  }

  // If there are any large blocks, pull codewords to fill the last element of those
  if (ecInfo.ecBlocks.length > 1) {
    const smallBlockCount: number = ecInfo.ecBlocks[0].numBlocks;
    const largeBlockCount: number = ecInfo.ecBlocks[1].numBlocks;

    for (let i: number = 0; i < largeBlockCount; i++) {
      dataBlocks[smallBlockCount + i].codewords.push(codewords.shift());
    }
  }

  // Add the rest of the codewords to the blocks. These are the error correction codewords.
  while (codewords.length > 0) {
    for (const dataBlock of dataBlocks) {
      dataBlock.codewords.push(codewords.shift());
    }
  }

  return dataBlocks;
}

function decodeMatrix(matrix: BitMatrix): DecodeResult {
  const version: Version = readVersion(matrix);

  if (!version) {
    return null;
  }

  const formatInfo: FormatInformation = readFormatInformation(matrix);

  if (!formatInfo) {
    return null;
  }

  const codewords: number[] = readCodewords(matrix, version, formatInfo);
  const dataBlocks: DataBlock[] = getDataBlocks(codewords, version, formatInfo.errorCorrectionLevel);

  if (!dataBlocks) {
    return null;
  }

  // Count total number of data bytes
  const totalBytes: number = dataBlocks.reduce((a, b) => a + b.numDataCodewords, 0);
  const resultBytes: Uint8ClampedArray = new Uint8ClampedArray(totalBytes);

  let resultIndex: number = 0;

  for (const dataBlock of dataBlocks) {
    const correctedBytes: Uint8ClampedArray = rsDecode(
      dataBlock.codewords,
      dataBlock.codewords.length - dataBlock.numDataCodewords
    );

    if (!correctedBytes) {
      return null;
    }

    for (let i: number = 0; i < dataBlock.numDataCodewords; i++) {
      resultBytes[resultIndex++] = correctedBytes[i];
    }
  }

  try {
    return decodeBytes(resultBytes, version.versionNumber);
  } catch {
    return null;
  }
}

export default function decode(matrix: BitMatrix): DecodeResult {
  if (matrix == null) {
    return null;
  }

  const result: DecodeResult = decodeMatrix(matrix);

  if (result) {
    return result;
  }

  // Decoding didn't work, try mirroring the QR across the topLeft -> bottomRight line.
  for (let x: number = 0; x < matrix.width; x++) {
    for (let y: number = x + 1; y < matrix.height; y++) {
      if (matrix.get(x, y) !== matrix.get(y, x)) {
        matrix.set(x, y, !matrix.get(x, y));
        matrix.set(y, x, !matrix.get(y, x));
      }
    }
  }

  return decodeMatrix(matrix);
}
