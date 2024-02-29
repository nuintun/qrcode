/**
 * @module decoder
 */

import { ECLevel } from '/common/ECLevel';
import { Version } from '/common/Version';
import { DataBlock } from '/decoder/DataBlock';
import { Decoder as ReedSolomonDecoder } from '/common/reedsolomon/Decoder';

export function correctErrors(
  codewords: Uint8Array,
  numDataCodewords: number
): [codewords: Int32Array, errorsCorrected: number] {
  const buffer = new Int32Array(codewords);
  const numECCodewords = codewords.length - numDataCodewords;
  // Reed solomon encode.
  const errorsCorrected = new ReedSolomonDecoder().decode(buffer, numECCodewords);

  return [buffer, errorsCorrected];
}

export function getDataBlocks(codewords: Uint8Array, version: Version, ecLevel: ECLevel): DataBlock[] {
  const { ecBlocks, numTotalCodewords, numECCodewordsPerBlock } = version.getECBlocks(ecLevel);

  if (codewords.length !== numTotalCodewords) {
    throw new Error('failed to get data blocks');
  }

  const blocks: DataBlock[] = [];

  // Now establish DataBlocks of the appropriate size and number of data codewords.
  for (const { count, numDataCodewords } of ecBlocks) {
    for (let i = 0; i < count; i++) {
      const numBlockCodewords = numECCodewordsPerBlock + numDataCodewords;

      blocks.push(new DataBlock(new Uint8Array(numBlockCodewords), numDataCodewords));
    }
  }

  const { length } = blocks;

  // All blocks have the same amount of data, except that the last n
  // (where n may be 0) have 1 more byte. Figure out where these start.
  let longerBlocksStartAt = length - 1;

  const shorterBlocksTotalCodewords = blocks[0].codewords.length;

  while (longerBlocksStartAt >= 0) {
    const numCodewords = blocks[longerBlocksStartAt].codewords.length;

    if (numCodewords === shorterBlocksTotalCodewords) {
      break;
    }

    longerBlocksStartAt--;
  }

  longerBlocksStartAt++;

  // The last elements of result may be 1 element longer;
  // first fill out as many elements as all of them have.
  let codewordsOffset = 0;

  const shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - numECCodewordsPerBlock;

  for (let i = 0; i < shorterBlocksNumDataCodewords; i++) {
    for (let j = 0; j < length; j++) {
      blocks[j].codewords[i] = codewords[codewordsOffset++];
    }
  }

  // Fill out the last data block in the longer ones.
  for (let j = longerBlocksStartAt; j < length; j++) {
    blocks[j].codewords[shorterBlocksNumDataCodewords] = codewords[codewordsOffset++];
  }

  // Now add in error correction blocks.
  const max = blocks[0].codewords.length;

  for (let i = shorterBlocksNumDataCodewords; i < max; i++) {
    for (let j = 0; j < length; j++) {
      const offset = j < longerBlocksStartAt ? i : i + 1;

      blocks[j].codewords[offset] = codewords[codewordsOffset++];
    }
  }

  return blocks;
}
