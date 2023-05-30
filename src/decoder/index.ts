/**
 * @module decoder
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

import { ECLevel } from '/common/ECLevel';
import { Version, VERSIONS } from './version';
import { BitMatrix } from '/decoder/BitMatrix';
import { getMaskBit } from '/common/MaskPattern';
import { DecodeResult, decodeText } from './decode';
import { Decoder as ReedSolomonDecoder } from '/decoder/reedsolomon';

function numBitsDiffering(x: number, y: number): number {
  let z = x ^ y;
  let bitCount = 0;

  while (z) {
    bitCount++;
    z &= z - 1;
  }

  return bitCount;
}

function pushBit(bit: boolean, byte: number): number {
  return (byte << 1) | +bit;
}

interface FormatInformation {
  mask: number;
  level: ECLevel;
}

interface FormatItem {
  bits: number;
  formatInfo: FormatInformation;
}

const FORMAT_INFO_TABLE: FormatItem[] = [
  { bits: 0x5412, formatInfo: { level: 0, mask: 0 } },
  { bits: 0x5125, formatInfo: { level: 0, mask: 1 } },
  { bits: 0x5e7c, formatInfo: { level: 0, mask: 2 } },
  { bits: 0x5b4b, formatInfo: { level: 0, mask: 3 } },
  { bits: 0x45f9, formatInfo: { level: 0, mask: 4 } },
  { bits: 0x40ce, formatInfo: { level: 0, mask: 5 } },
  { bits: 0x4f97, formatInfo: { level: 0, mask: 6 } },
  { bits: 0x4aa0, formatInfo: { level: 0, mask: 7 } },
  { bits: 0x77c4, formatInfo: { level: 1, mask: 0 } },
  { bits: 0x72f3, formatInfo: { level: 1, mask: 1 } },
  { bits: 0x7daa, formatInfo: { level: 1, mask: 2 } },
  { bits: 0x789d, formatInfo: { level: 1, mask: 3 } },
  { bits: 0x662f, formatInfo: { level: 1, mask: 4 } },
  { bits: 0x6318, formatInfo: { level: 1, mask: 5 } },
  { bits: 0x6c41, formatInfo: { level: 1, mask: 6 } },
  { bits: 0x6976, formatInfo: { level: 1, mask: 7 } },
  { bits: 0x1689, formatInfo: { level: 2, mask: 0 } },
  { bits: 0x13be, formatInfo: { level: 2, mask: 1 } },
  { bits: 0x1ce7, formatInfo: { level: 2, mask: 2 } },
  { bits: 0x19d0, formatInfo: { level: 2, mask: 3 } },
  { bits: 0x0762, formatInfo: { level: 2, mask: 4 } },
  { bits: 0x0255, formatInfo: { level: 2, mask: 5 } },
  { bits: 0x0d0c, formatInfo: { level: 2, mask: 6 } },
  { bits: 0x083b, formatInfo: { level: 2, mask: 7 } },
  { bits: 0x355f, formatInfo: { level: 3, mask: 0 } },
  { bits: 0x3068, formatInfo: { level: 3, mask: 1 } },
  { bits: 0x3f31, formatInfo: { level: 3, mask: 2 } },
  { bits: 0x3a06, formatInfo: { level: 3, mask: 3 } },
  { bits: 0x24b4, formatInfo: { level: 3, mask: 4 } },
  { bits: 0x2183, formatInfo: { level: 3, mask: 5 } },
  { bits: 0x2eda, formatInfo: { level: 3, mask: 6 } },
  { bits: 0x2bed, formatInfo: { level: 3, mask: 7 } }
];

function buildFunctionPatternMask({ version, alignmentPatternCenters }: Version): BitMatrix {
  const dimension = 17 + 4 * version;
  const matrix = BitMatrix.createEmpty(dimension, dimension);

  matrix.setRegion(0, 0, 9, 9, true); // Top left finder pattern + separator + format
  matrix.setRegion(dimension - 8, 0, 8, 9, true); // Top right finder pattern + separator + format
  matrix.setRegion(0, dimension - 8, 9, 8, true); // Bottom left finder pattern + separator + format

  // Alignment patterns
  for (const x of alignmentPatternCenters) {
    for (const y of alignmentPatternCenters) {
      if (!((x === 6 && y === 6) || (x === 6 && y === dimension - 7) || (x === dimension - 7 && y === 6))) {
        matrix.setRegion(x - 2, y - 2, 5, 5, true);
      }
    }
  }

  matrix.setRegion(6, 9, 1, dimension - 17, true); // Vertical timing pattern
  matrix.setRegion(9, 6, dimension - 17, 1, true); // Horizontal timing pattern

  if (version > 6) {
    matrix.setRegion(dimension - 11, 0, 3, 6, true); // Version info, top right
    matrix.setRegion(0, dimension - 11, 6, 3, true); // Version info, bottom left
  }

  return matrix;
}

function readCodewords(matrix: BitMatrix, version: Version, formatInfo: FormatInformation): number[] {
  const { mask } = formatInfo;
  const dimension = matrix.height;
  const functionPatternMask = buildFunctionPatternMask(version);

  let bitsRead = 0;
  let currentByte = 0;

  const codewords: number[] = [];

  // Read columns in pairs, from right to left
  let readingUp = true;

  for (let columnIndex = dimension - 1; columnIndex > 0; columnIndex -= 2) {
    if (columnIndex === 6) {
      // Skip whole column with vertical alignment pattern;
      columnIndex--;
    }

    for (let i = 0; i < dimension; i++) {
      const y = readingUp ? dimension - 1 - i : i;

      for (let columnOffset = 0; columnOffset < 2; columnOffset++) {
        const x = columnIndex - columnOffset;

        if (!functionPatternMask.get(x, y)) {
          bitsRead++;

          let bit = matrix.get(x, y);

          if (getMaskBit(mask, x, y)) {
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

function readVersion(matrix: BitMatrix): Version | never {
  const dimension = matrix.height;
  const provisionalVersion = Math.floor((dimension - 17) / 4);

  if (provisionalVersion <= 6) {
    // 6 and under dont have version info in the QR code
    return VERSIONS[provisionalVersion - 1];
  }

  let topRightVersionBits = 0;

  for (let y = 5; y >= 0; y--) {
    for (let x = dimension - 9; x >= dimension - 11; x--) {
      topRightVersionBits = pushBit(matrix.get(x, y), topRightVersionBits);
    }
  }

  let bottomLeftVersionBits = 0;

  for (let x = 5; x >= 0; x--) {
    for (let y = dimension - 9; y >= dimension - 11; y--) {
      bottomLeftVersionBits = pushBit(matrix.get(x, y), bottomLeftVersionBits);
    }
  }

  let bestDifference = Infinity;
  let bestVersion: Version | null = null;

  for (const version of VERSIONS) {
    const { bits } = version;

    if (bits === topRightVersionBits || bits === bottomLeftVersionBits) {
      return version;
    }

    let difference = numBitsDiffering(topRightVersionBits, bits);

    if (difference < bestDifference) {
      bestVersion = version;
      bestDifference = difference;
    }

    difference = numBitsDiffering(bottomLeftVersionBits, bits);

    if (difference < bestDifference) {
      bestVersion = version;
      bestDifference = difference;
    }
  }

  // We can tolerate up to 3 bits of error since no two version info codewords will
  // differ in less than 8 bits.
  if (bestVersion !== null && bestDifference <= 3) {
    return bestVersion;
  }

  throw new Error('failed to read version');
}

function readFormatInformation(matrix: BitMatrix): FormatInformation | never {
  let topLeftFormatInfoBits = 0;

  for (let x = 0; x <= 8; x++) {
    if (x !== 6) {
      // Skip timing pattern bit
      topLeftFormatInfoBits = pushBit(matrix.get(x, 8), topLeftFormatInfoBits);
    }
  }

  for (let y = 7; y >= 0; y--) {
    if (y !== 6) {
      // Skip timing pattern bit
      topLeftFormatInfoBits = pushBit(matrix.get(8, y), topLeftFormatInfoBits);
    }
  }

  const dimension = matrix.height;

  let topRightBottomRightFormatInfoBits = 0;

  for (let y = dimension - 1; y >= dimension - 7; y--) {
    // bottom left
    topRightBottomRightFormatInfoBits = pushBit(matrix.get(8, y), topRightBottomRightFormatInfoBits);
  }

  for (let x = dimension - 8; x < dimension; x++) {
    // top right
    topRightBottomRightFormatInfoBits = pushBit(matrix.get(x, 8), topRightBottomRightFormatInfoBits);
  }

  let bestDifference = Infinity;
  let bestFormatInfo: FormatInformation | null = null;

  for (const { bits, formatInfo } of FORMAT_INFO_TABLE) {
    if (bits === topLeftFormatInfoBits || bits === topRightBottomRightFormatInfoBits) {
      return formatInfo;
    }

    let difference = numBitsDiffering(topLeftFormatInfoBits, bits);

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
  if (bestFormatInfo !== null && bestDifference <= 3) {
    return bestFormatInfo;
  }

  throw new Error('failed to read format information');
}

interface DataBlock {
  codewords: number[];
  numDataCodewords: number;
}

function getDataBlocks(codewords: number[], version: Version, level: number): DataBlock[] | never {
  let totalCodewords = 0;

  const dataBlocks: DataBlock[] = [];
  const { ecBlocks, ecCodewordsPerBlock } = version.ecLevels[level];

  ecBlocks.forEach(({ numBlocks, dataCodewordsPerBlock }) => {
    for (let i = 0; i < numBlocks; i++) {
      dataBlocks.push({ numDataCodewords: dataCodewordsPerBlock, codewords: [] });

      totalCodewords += dataCodewordsPerBlock + ecCodewordsPerBlock;
    }
  });

  // In some cases the QR code will be malformed enough that we pull off more or less than we should.
  // If we pull off less there's nothing we can do.
  // If we pull off more we can safely truncate
  if (codewords.length < totalCodewords) {
    throw new Error('failed to get data blocks');
  }

  codewords = codewords.slice(0, totalCodewords);

  const shortBlockSize = ecBlocks[0].dataCodewordsPerBlock;

  // Pull codewords to fill the blocks up to the minimum size
  for (let i = 0; i < shortBlockSize; i++) {
    for (const dataBlock of dataBlocks) {
      dataBlock.codewords.push(codewords.shift() as number);
    }
  }

  // If there are any large blocks, pull codewords to fill the last element of those
  if (ecBlocks.length > 1) {
    const smallBlockCount = ecBlocks[0].numBlocks;
    const largeBlockCount = ecBlocks[1].numBlocks;

    for (let i = 0; i < largeBlockCount; i++) {
      dataBlocks[smallBlockCount + i].codewords.push(codewords.shift() as number);
    }
  }

  // Add the rest of the codewords to the blocks. These are the error correction codewords.
  while (codewords.length > 0) {
    for (const dataBlock of dataBlocks) {
      dataBlock.codewords.push(codewords.shift() as number);
    }
  }

  return dataBlocks;
}

const rsDecoder = new ReedSolomonDecoder();

function decodeMatrix(matrix: BitMatrix): DecodeResult | never {
  const version = readVersion(matrix);
  const formatInfo = readFormatInformation(matrix);
  const codewords = readCodewords(matrix, version, formatInfo);
  const dataBlocks = getDataBlocks(codewords, version, formatInfo.level);
  const totalBytes = dataBlocks.reduce((a, b) => a + b.numDataCodewords, 0);

  let resultIndex = 0;

  const resultBytes = new Uint8ClampedArray(totalBytes);

  for (const { codewords, numDataCodewords } of dataBlocks) {
    const correctedBytes = rsDecoder.decode(codewords, codewords.length - numDataCodewords);

    for (let i = 0; i < numDataCodewords; i++) {
      resultBytes[resultIndex++] = correctedBytes[i];
    }
  }

  return decodeText(resultBytes, version.version, formatInfo.level);
}

export function decode(matrix: BitMatrix): DecodeResult | never {
  try {
    return decodeMatrix(matrix);
  } catch {
    // Decoding didn't work, try mirroring the QR across the topLeft -> bottomRight line.
    for (let x = 0; x < matrix.width; x++) {
      for (let y = x + 1; y < matrix.height; y++) {
        if (matrix.get(x, y) !== matrix.get(y, x)) {
          matrix.set(x, y, !matrix.get(x, y));
          matrix.set(y, x, !matrix.get(y, x));
        }
      }
    }

    return decodeMatrix(matrix);
  }
}

export { DecodeResult };
