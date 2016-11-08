import EncodeHintType from '../common/EncodeHintType';
import BitArray from '../common/BitArray';
import CharacterSetECI from '../common/CharacterSetECI';
import GenericGF from '../common/reedsolomon/GenericGF';
import ReedSolomonEncoder from '../common/reedsolomon/ReedSolomonEncoder';
import ErrorCorrectionLevel from '../common/ErrorCorrectionLevel';
import * as Mode from '../common/Mode';
import Version from '../common/Version';
import * as MaskUtil from './MaskUtil';
import QRCode from './QRCode';
import WriterException from '../exception/WriterException';
import UnsupportedEncodingException from '../exception/UnsupportedOperationException';

// The original table is defined in the table 5 of JISX0510:2004 (p.19).
var ALPHANUMERIC_TABLE = [
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 0x00-0x0f
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, // 0x10-0x1f
  36, -1, -1, -1, 37, 38, -1, -1, -1, -1, 39, 40, -1, 41, 42, 43, // 0x20-0x2f
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 44, -1, -1, -1, -1, -1, // 0x30-0x3f
  -1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, // 0x40-0x4f
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, -1, -1, -1, -1, -1, // 0x50-0x5f
];

var DEFAULT_BYTE_MODE_ENCODING = 'ISO-8859-1';

// The mask penalty calculation is complicated.  See Table 21 of JISX0510:2004 (p.45) for details.
// Basically it applies four rules and summate all penalties.
function calculateMaskPenalty(matrix) {
  return MaskUtil.applyMaskPenaltyRule1(matrix) +
    MaskUtil.applyMaskPenaltyRule2(matrix) +
    MaskUtil.applyMaskPenaltyRule3(matrix) +
    MaskUtil.applyMaskPenaltyRule4(matrix);
}

/**
 * @param content text to encode
 * @param ecLevel error correction level to use
 * @return {@link QRCode} representing the encoded QR code
 * @throws WriterException if encoding can't succeed, because of for example invalid content
 *   or configuration
 */
export function encode(content, ecLevel) {
  return encode(content, ecLevel, null);
}

export function encode(content, ecLevel, hints) {
  hints = hints || null;

  // Determine what character encoding has been specified by the caller, if any
  var encoding = DEFAULT_BYTE_MODE_ENCODING;
  var hasEncodingHint = hints !== null && hints.containsKey(EncodeHintType.CHARACTER_SET);

  if (hasEncodingHint) {
    encoding = hints.get(EncodeHintType.CHARACTER_SET).toString();
  }

  // Pick an encoding mode appropriate for the content. Note that this will not attempt to use
  // multiple modes / segments even if that were more efficient. Twould be nice.
  var mode = chooseMode(content, encoding);
  // This will store the header information, like mode and
  // length, as well as "header" segments like an ECI segment.
  var headerBits = new BitArray();

  // Append ECI segment if applicable
  if (mode == Mode.BYTE && (hasEncodingHint || !DEFAULT_BYTE_MODE_ENCODING.equals(encoding))) {
    var eci = CharacterSetECI.getCharacterSetECIByName(encoding);

    if (eci !== null) {
      appendECI(eci, headerBits);
    }
  }

  // (With ECI in place,) Write the mode marker
  appendModeInfo(mode, headerBits);

  // Collect data within the main segment, separately, to count its size if needed. Don't add it to
  // main payload yet.
  var dataBits = new BitArray();

  appendBytes(content, mode, dataBits, encoding);

  var version;

  if (hints !== null && hints.containsKey(EncodeHintType.QR_VERSION)) {
    var versionNumber = Integer.parseInt(hints.get(EncodeHintType.QR_VERSION).toString());

    version = Version.getVersionForNumber(versionNumber);

    var bitsNeeded = calculateBitsNeeded(mode, headerBits, dataBits, version);

    if (!willFit(bitsNeeded, version, ecLevel)) {
      throw new WriterException("Data too big for requested version");
    }
  } else {
    version = recommendVersion(ecLevel, mode, headerBits, dataBits);
  }

  var headerAndDataBits = new BitArray();

  headerAndDataBits.appendBitArray(headerBits);

  // Find "length" of main segment and write it
  var numLetters = mode == Mode.BYTE ? dataBits.getSizeInBytes() : content.length();

  appendLengthInfo(numLetters, version, mode, headerAndDataBits);
  // Put data together into the overall payload
  headerAndDataBits.appendBitArray(dataBits);

  var ecBlocks = version.getECBlocksForLevel(ecLevel);
  var numDataBytes = version.getTotalCodewords() - ecBlocks.getTotalECCodewords();

  // Terminate the bits properly.
  terminateBits(numDataBytes, headerAndDataBits);

  // Interleave data bits with error correction code.
  var finalBits = interleaveWithECBytes(headerAndDataBits, version.getTotalCodewords(), numDataBytes, ecBlocks.getNumBlocks());

  var qrCode = new QRCode();

  qrCode.setECLevel(ecLevel);
  qrCode.setMode(mode);
  qrCode.setVersion(version);

  //  Choose the mask pattern and set to "qrCode".
  var dimension = version.getDimensionForVersion();
  var matrix = new ByteMatrix(dimension, dimension);
  var maskPattern = chooseMaskPattern(finalBits, ecLevel, version, matrix);

  qrCode.setMaskPattern(maskPattern);

  // Build the matrix and set it to "qrCode".
  MatrixUtil.buildMatrix(finalBits, ecLevel, version, maskPattern, matrix);
  qrCode.setMatrix(matrix);

  return qrCode;
}

/**
 * Decides the smallest version of QR code that will contain all of the provided data.
 *
 * @throws WriterException if the data cannot fit in any version
 */
function recommendVersion(ecLevel, mode, headerBits, dataBits) {
  // Hard part: need to know version to know how many bits length takes. But need to know how many
  // bits it takes to know version. First we take a guess at version by assuming version will be
  // the minimum, 1:
  var provisionalBitsNeeded = calculateBitsNeeded(mode, headerBits, dataBits, Version.getVersionForNumber(1));
  var provisionalVersion = chooseVersion(provisionalBitsNeeded, ecLevel);
  // Use that guess to calculate the right version. I am still not sure this works in 100% of cases.
  var bitsNeeded = calculateBitsNeeded(mode, headerBits, dataBits, provisionalVersion);

  return chooseVersion(bitsNeeded, ecLevel);
}

function calculateBitsNeeded(mode, headerBits, dataBits, version) {
  return headerBits.getSize() + mode.getCharacterCountBits(version) + dataBits.getSize();
}

/**
 * @return the code point of the table used in alphanumeric mode or
 *  -1 if there is no corresponding code in the table.
 */
export function getAlphanumericCode(code) {
  if (code < ALPHANUMERIC_TABLE.length) {
    return ALPHANUMERIC_TABLE[code];
  }

  return -1;
}

/**
 * Choose the best mode by examining the content. Note that 'encoding' is used as a hint;
 * if it is Shift_JIS, and the input is only double-byte Kanji, then we return {@link Mode#KANJI}.
 */
export function chooseMode(content, encoding) {
  encoding = encoding || null;

  if ('Shift_JIS' === encoding && isOnlyDoubleByteKanji(content)) {
    // Choose Kanji mode if all input are double-byte characters
    return Mode.KANJI;
  }

  var hasNumeric = false;
  var hasAlphanumeric = false;

  for (var i = 0; i < content.length(); ++i) {
    var c = content.charAt(i);

    if (c >= '0' && c <= '9') {
      hasNumeric = true;
    } else if (getAlphanumericCode(c) != -1) {
      hasAlphanumeric = true;
    } else {
      return Mode.BYTE;
    }
  }

  if (hasAlphanumeric) {
    return Mode.ALPHANUMERIC;
  }

  if (hasNumeric) {
    return Mode.NUMERIC;
  }

  return Mode.BYTE;
}

// TODO Shift_JIS encoding
function isOnlyDoubleByteKanji(content) {
  var bytes;

  try {
    bytes = content.getBytes('Shift_JIS');
  } catch (ignored) {
    return false;
  }

  var length = bytes.length;

  if (length % 2 != 0) {
    return false;
  }

  for (var i = 0; i < length; i += 2) {
    var byte1 = bytes[i] & 0xFF;

    if ((byte1 < 0x81 || byte1 > 0x9F) && (byte1 < 0xE0 || byte1 > 0xEB)) {
      return false;
    }
  }

  return true;
}

function chooseMaskPattern(bits, ecLevel, version, matrix) {
  var minPenalty = Number.MAX_VALUE; // Lower penalty is better.
  var bestMaskPattern = -1;

  // We try all mask patterns to choose the best one.
  for (var maskPattern = 0; maskPattern < QRCode.NUM_MASK_PATTERNS; maskPattern++) {
    MatrixUtil.buildMatrix(bits, ecLevel, version, maskPattern, matrix);

    var penalty = calculateMaskPenalty(matrix);

    if (penalty < minPenalty) {
      minPenalty = penalty;
      bestMaskPattern = maskPattern;
    }
  }

  return bestMaskPattern;
}

function chooseVersion(numInputBits, ecLevel) {
  for (var versionNum = 1; versionNum <= 40; versionNum++) {
    var version = Version.getVersionForNumber(versionNum);

    if (willFit(numInputBits, version, ecLevel)) {
      return version;
    }
  }

  throw new WriterException('Data too big');
}

/**
 * @return true if the number of input bits will fit in a code with the specified version and
 * error correction level.
 */
function willFit(numInputBits, version, ecLevel) {
  // In the following comments, we use numbers of Version 7-H.
  // numBytes = 196
  var numBytes = version.getTotalCodewords();
  // getNumECBytes = 130
  var ecBlocks = version.getECBlocksForLevel(ecLevel);
  var numEcBytes = ecBlocks.getTotalECCodewords();
  // getNumDataBytes = 196 - 130 = 66
  var numDataBytes = numBytes - numEcBytes;
  var totalInputBytes = (numInputBits + 7) / 8;

  return numDataBytes >= totalInputBytes;
}

/**
 * Terminate bits as described in 8.4.8 and 8.4.9 of JISX0510:2004 (p.24).
 */
export function terminateBits(numDataBytes, bits) {
  var capacity = numDataBytes * 8;

  if (bits.getSize() > capacity) {
    throw new WriterException('data bits cannot fit in the QR Code' + bits.getSize() + ' > ' + capacity);
  }

  for (var i = 0; i < 4 && bits.getSize() < capacity; ++i) {
    bits.appendBit(false);
  }

  // Append termination bits. See 8.4.8 of JISX0510:2004 (p.24) for details.
  // If the last byte isn't 8-bit aligned, we'll add padding bits.
  var numBitsInLastByte = bits.getSize() & 0x07;

  if (numBitsInLastByte > 0) {
    for (var i = numBitsInLastByte; i < 8; i++) {
      bits.appendBit(false);
    }
  }

  // If we have more space, we'll fill the space with padding patterns defined in 8.4.9 (p.24).
  var numPaddingBytes = numDataBytes - bits.getSizeInBytes();

  for (var i = 0; i < numPaddingBytes; ++i) {
    bits.appendBits((i & 0x01) == 0 ? 0xEC : 0x11, 8);
  }

  if (bits.getSize() != capacity) {
    throw new WriterException('Bits size does not equal capacity');
  }
}

/**
 * Get number of data bytes and number of error correction bytes for block id "blockID". Store
 * the result in "numDataBytesInBlock", and "numECBytesInBlock". See table 12 in 8.5.1 of
 * JISX0510:2004 (p.30)
 */
export function getNumDataBytesAndNumECBytesForBlockID(numTotalBytes, numDataBytes, numRSBlocks, blockID, numDataBytesInBlock, numECBytesInBlock) {
  if (blockID >= numRSBlocks) {
    throw new WriterException('Block ID too large');
  }

  // numRsBlocksInGroup2 = 196 % 5 = 1
  var numRsBlocksInGroup2 = numTotalBytes % numRSBlocks;
  // numRsBlocksInGroup1 = 5 - 1 = 4
  var numRsBlocksInGroup1 = numRSBlocks - numRsBlocksInGroup2;
  // numTotalBytesInGroup1 = 196 / 5 = 39
  var numTotalBytesInGroup1 = numTotalBytes / numRSBlocks;
  // numTotalBytesInGroup2 = 39 + 1 = 40
  var numTotalBytesInGroup2 = numTotalBytesInGroup1 + 1;
  // numDataBytesInGroup1 = 66 / 5 = 13
  var numDataBytesInGroup1 = numDataBytes / numRSBlocks;
  // numDataBytesInGroup2 = 13 + 1 = 14
  var numDataBytesInGroup2 = numDataBytesInGroup1 + 1;
  // numEcBytesInGroup1 = 39 - 13 = 26
  var numEcBytesInGroup1 = numTotalBytesInGroup1 - numDataBytesInGroup1;
  // numEcBytesInGroup2 = 40 - 14 = 26
  var numEcBytesInGroup2 = numTotalBytesInGroup2 - numDataBytesInGroup2;

  // Sanity checks.
  // 26 = 26
  if (numEcBytesInGroup1 != numEcBytesInGroup2) {
    throw new WriterException('EC bytes mismatch');
  }

  // 5 = 4 + 1.
  if (numRSBlocks != numRsBlocksInGroup1 + numRsBlocksInGroup2) {
    throw new WriterException('RS blocks mismatch');
  }

  // 196 = (13 + 26) * 4 + (14 + 26) * 1
  if (numTotalBytes !== ((numDataBytesInGroup1 + numEcBytesInGroup1) * numRsBlocksInGroup1) +
    ((numDataBytesInGroup2 + numEcBytesInGroup2) * numRsBlocksInGroup2)) {
    throw new WriterException('Total bytes mismatch');
  }

  if (blockID < numRsBlocksInGroup1) {
    numDataBytesInBlock[0] = numDataBytesInGroup1;
    numECBytesInBlock[0] = numEcBytesInGroup1;
  } else {
    numDataBytesInBlock[0] = numDataBytesInGroup2;
    numECBytesInBlock[0] = numEcBytesInGroup2;
  }
}

/**
 * Interleave "bits" with corresponding error correction bytes. On success, store the result in
 * "result". The interleave rule is complicated. See 8.6 of JISX0510:2004 (p.37) for details.
 */
export function interleaveWithECBytes(bits, numTotalBytes, numDataBytes, numRSBlocks) {
  // "bits" must have "getNumDataBytes" bytes of data.
  if (bits.getSizeInBytes() !== numDataBytes) {
    throw new WriterException('Number of bits and data bytes does not match');
  }

  // Step 1.  Divide data bytes into blocks and generate error correction bytes for them. We'll
  // store the divided data bytes blocks and error correction bytes blocks into "blocks".
  var dataBytesOffset = 0;
  var maxNumDataBytes = 0;
  var maxNumEcBytes = 0;

  // Since, we know the number of reedsolmon blocks, we can initialize the vector with the number.
  var blocks = new ArrayList < > (numRSBlocks);

  for (var i = 0; i < numRSBlocks; ++i) {
    var numDataBytesInBlock = new Array(1);
    var numEcBytesInBlock = new Array(1);

    getNumDataBytesAndNumECBytesForBlockID(numTotalBytes, numDataBytes, numRSBlocks, i, numDataBytesInBlock, numEcBytesInBlock);

    var size = numDataBytesInBlock[0];
    var dataBytes = new byte[size];

    bits.toBytes(8 * dataBytesOffset, dataBytes, 0, size);

    var ecBytes = generateECBytes(dataBytes, numEcBytesInBlock[0]);

    blocks.add(new BlockPair(dataBytes, ecBytes));

    maxNumDataBytes = Math.max(maxNumDataBytes, size);
    maxNumEcBytes = Math.max(maxNumEcBytes, ecBytes.length);
    dataBytesOffset += numDataBytesInBlock[0];
  }
  if (numDataBytes != dataBytesOffset) {
    throw new WriterException("Data bytes does not match offset");
  }

  var result = new BitArray();

  // First, place data blocks.
  for (var i = 0; i < maxNumDataBytes; ++i) {
    for (var j = 0, length = blocks.length; j < length; j++) {
      var block = blocks[j];
      var dataBytes = block.getDataBytes();

      if (i < dataBytes.length) {
        result.appendBits(dataBytes[i], 8);
      }
    }
  }

  // Then, place error correction blocks.
  for (var i = 0; i < maxNumEcBytes; ++i) {
    for (var j = 0, length = blocks.length; j < length; j++) {
      var block = blocks[j];
      var ecBytes = block.getErrorCorrectionBytes();

      if (i < ecBytes.length) {
        result.appendBits(ecBytes[i], 8);
      }
    }
  }

  if (numTotalBytes !== result.getSizeInBytes()) { // Should be same.
    throw new WriterException('Interleaving error: ' + numTotalBytes + ' and ' + result.getSizeInBytes() + ' differ.');
  }

  return result;
}

export function generateECBytes(dataBytes, numEcBytesInBlock) {
  var numDataBytes = dataBytes.length;
  var toEncode = new Array(numDataBytes + numEcBytesInBlock);

  for (var i = 0; i < numDataBytes; i++) {
    toEncode[i] = dataBytes[i] & 0xFF;
  }

  new ReedSolomonEncoder(GenericGF.QR_CODE_FIELD_256).encode(toEncode, numEcBytesInBlock);

  // TODO byte[] ecBytes = new byte[numEcBytesInBlock];
  var ecBytes = new Array(numEcBytesInBlock);

  for (var i = 0; i < numEcBytesInBlock; i++) {
    ecBytes[i] = toEncode[numDataBytes + i];
  }

  return ecBytes;
}

/**
 * Append mode info. On success, store the result in "bits".
 */
export function appendModeInfo(mode, bits) {
  bits.appendBits(mode.getBits(), 4);
}

/**
 * Append length info. On success, store the result in "bits".
 */
export function appendLengthInfo(numLetters, version, mode, bits) {
  var numBits = mode.getCharacterCountBits(version);

  if (numLetters >= (1 << numBits)) {
    throw new WriterException(numLetters + ' is bigger than ' + ((1 << numBits) - 1));
  }

  bits.appendBits(numLetters, numBits);
}

/**
 * Append "bytes" in "mode" mode (encoding) into "bits". On success, store the result in "bits".
 */
export function appendBytes(content, mode, bits, encoding) {
  switch (mode) {
    case NUMERIC:
      appendNumericBytes(content, bits);
      break;
    case ALPHANUMERIC:
      appendAlphanumericBytes(content, bits);
      break;
    case BYTE:
      append8BitBytes(content, bits, encoding);
      break;
    case KANJI:
      appendKanjiBytes(content, bits);
      break;
    default:
      throw new WriterException('Invalid mode: ' + mode);
  }
}

export function appendNumericBytes(content, bits) {
  var length = content.length();
  var i = 0;

  while (i < length) {
    var num1 = content.charAt(i) - '0';

    if (i + 2 < length) {
      // Encode three numeric letters in ten bits.
      var num2 = content.charAt(i + 1) - '0';
      var num3 = content.charAt(i + 2) - '0';

      bits.appendBits(num1 * 100 + num2 * 10 + num3, 10);

      i += 3;
    } else if (i + 1 < length) {
      // Encode two numeric letters in seven bits.
      var num2 = content.charAt(i + 1) - '0';

      bits.appendBits(num1 * 10 + num2, 7);

      i += 2;
    } else {
      // Encode one numeric letter in four bits.
      bits.appendBits(num1, 4);

      i++;
    }
  }
}

export function appendAlphanumericBytes(content, bits) {
  var length = content.length();
  var i = 0;

  while (i < length) {
    var code1 = getAlphanumericCode(content.charAt(i));

    if (code1 == -1) {
      throw new WriterException();
    }

    if (i + 1 < length) {
      var code2 = getAlphanumericCode(content.charAt(i + 1));

      if (code2 == -1) {
        throw new WriterException();
      }

      // Encode two alphanumeric letters in 11 bits.
      bits.appendBits(code1 * 45 + code2, 11);
      i += 2;
    } else {
      // Encode one alphanumeric letter in six bits.
      bits.appendBits(code1, 6);

      i++;
    }
  }
}

export function append8BitBytes(content, bits, encoding) {
  var bytes;

  try {
    bytes = content.getBytes(encoding);
  } catch (uee) {
    throw new WriterException(uee);
  }
  for (var i = 0, length = bytes.length; i < length; i++) {
    var b = bytes[i]

    bits.appendBits(b, 8);
  }
}

export function appendKanjiBytes(content, bits) {
  var bytes;

  try {
    // TODO Shift_JIS
    bytes = content.getBytes('Shift_JIS');
  } catch (uee) {
    throw new WriterException(uee);
  }

  var length = bytes.length;

  for (var i = 0; i < length; i += 2) {
    var byte1 = bytes[i] & 0xFF;
    var byte2 = bytes[i + 1] & 0xFF;
    var code = (byte1 << 8) | byte2;
    var subtracted = -1;

    if (code >= 0x8140 && code <= 0x9ffc) {
      subtracted = code - 0x8140;
    } else if (code >= 0xe040 && code <= 0xebbf) {
      subtracted = code - 0xc140;
    }

    if (subtracted == -1) {
      throw new WriterException('Invalid byte sequence');
    }

    var encoded = ((subtracted >> 8) * 0xc0) + (subtracted & 0xff);

    bits.appendBits(encoded, 13);
  }
}

function appendECI(eci, bits) {
  bits.appendBits(Mode.ECI.getBits(), 4);
  // This is correct for values up to 127, which is all we need now.
  bits.appendBits(eci.getValue(), 8);
}
