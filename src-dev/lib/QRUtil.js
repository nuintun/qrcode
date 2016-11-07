import RSBlock from './RSBlock';
import * as QRMath from './QRMath';
import BitBuffer from './BitBuffer';
import Polynomial from './Polynomial';
import { MaskPattern } from './MaskPattern';
import { ErrorCorrectLevel } from './ErrorCorrectLevel';

var PATTERN_POSITION_TABLE = [
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
  [6, 30, 58, 86, 114, 142, 170]
];

var MAX_LENGTH = (function() {
  var j;
  var level;
  var buffer;
  var version;
  var rsLength;
  var rsBlocks;
  var dataCount;
  var maps = [];
  var vLength = PATTERN_POSITION_TABLE.length;

  for (var i = 0; i < vLength; i++) {
    maps[i] = {};
    version = i + 1;
    buffer = new BitBuffer();

    for (level in ErrorCorrectLevel) {
      if (ErrorCorrectLevel.hasOwnProperty(level)) {
        dataCount = 0;
        rsBlocks = RSBlock.getRSBlocks(version, ErrorCorrectLevel[level]);
        rsLength = rsBlocks.length;

        for (j = 0; j < rsLength; j++) {
          dataCount += rsBlocks[j].getDataCount() * 8;
        }

        maps[i][ErrorCorrectLevel[level]] = dataCount;
      }
    }
  }

  return maps;
}());

var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

var toString = Object.prototype.toString;

/**
 * create buffer
 * @param version
 * @param dataArray
 * @returns {BitBuffer}
 */
function createBuffer(version, dataArray) {
  var data;
  var buffer = new BitBuffer();

  for (var i = 0; i < dataArray.length; i++) {
    data = dataArray[i];

    buffer.put(data.getMode(), 4);
    buffer.put(data.getLength(), data.getLengthInBits(version));
    data.write(buffer);
  }

  return buffer;
}

/**
 * string judge
 * @param string
 * @returns {boolean}
 */
export function isString(string) {
  return toString.call(string) === '[object String]';
}

/**
 * inherits
 * @param ctor
 * @param superCtor
 * @param proto
 */
export function inherits(ctor, superCtor, proto) {
  function F() {
    // constructor
  }

  // prototype
  F.prototype = superCtor.prototype;

  ctor.prototype = new F();
  ctor.prototype.constructor = ctor;

  if (proto) {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        ctor.prototype[key] = proto[key];
      }
    }
  }
}

/**
 * get pattern position
 * @param version
 * @returns {*}
 */
export function getPatternPosition(version) {
  if (version < 1 || version > PATTERN_POSITION_TABLE.length) {
    throw new Error('illegal version: ' + version);
  }

  return PATTERN_POSITION_TABLE[version - 1];
}

/**
 * get max length from version and level
 * @param version
 * @param level
 */
export function getMaxLength(version, level) {
  return MAX_LENGTH[version - 1][level];
}

/**
 * get best version
 * @param version
 * @param level
 * @param dataArray
 * @returns {*}
 */
export function getBestVersion(version, level, dataArray) {
  var vLength = PATTERN_POSITION_TABLE.length;
  var dataCount = createBuffer(version, dataArray).getLengthInBits();

  for (var i = 0; i < vLength; i++) {
    version = i + 1;

    if (dataCount <= getMaxLength(version, level)) {
      return version;
    }
  }

  return vLength;
}

/**
 * get best mask function
 * @param maskPattern
 * @returns {Function}
 */
export function getMaskFunc(maskPattern) {
  switch (maskPattern) {
    case MaskPattern.PATTERN000:
      return function(x, y) {
        return (x + y) % 2 === 0;
      };
    case MaskPattern.PATTERN001:
      return function(x) {
        return x % 2 === 0;
      };
    case MaskPattern.PATTERN010:
      return function(x, y) {
        return y % 3 === 0;
      };
    case MaskPattern.PATTERN011:
      return function(x, y) {
        return (x + y) % 3 === 0;
      };
    case MaskPattern.PATTERN100:
      return function(x, y) {
        return (~~(x / 2) + ~~(y / 3)) % 2 === 0;
      };
    case MaskPattern.PATTERN101:
      return function(x, y) {
        return x * y % 2 + x * y % 3 === 0;
      };
    case MaskPattern.PATTERN110:
      return function(x, y) {
        return (x * y % 2 + x * y % 3) % 2 === 0;
      };
    case MaskPattern.PATTERN111:
      return function(x, y) {
        return (x * y % 3 + (x + y) % 2) % 2 === 0;
      };
    default:
      throw new Error('illegal mask:' + maskPattern);
  }
}

/**
 * get lost point
 * @param qrcode
 * @returns {number}
 */
export function getLostPoint(qrcode) {
  var row;
  var col;
  var sameCount;
  var dark;
  var r;
  var c;
  var lostPoint = 0;
  var moduleCount = qrcode.getModuleCount();

  // LEVEL1
  for (row = 0; row < moduleCount; row++) {
    for (col = 0; col < moduleCount; col++) {
      sameCount = 0;
      dark = qrcode.isDark(row, col);

      for (r = -1; r <= 1; r++) {
        if (row + r < 0 || moduleCount <= row + r) {
          continue;
        }

        for (c = -1; c <= 1; c++) {
          if (col + c < 0 || moduleCount <= col + c) {
            continue;
          }

          if (r === 0 && c === 0) {
            continue;
          }

          if (dark === qrcode.isDark(row + r, col + c)) {
            sameCount++;
          }
        }
      }

      if (sameCount > 5) {
        lostPoint += (3 + sameCount - 5);
      }
    }
  }

  var count;

  // LEVEL2
  for (row = 0; row < moduleCount - 1; row++) {
    for (col = 0; col < moduleCount - 1; col++) {
      count = 0;

      if (qrcode.isDark(row, col)) {
        count++;
      }

      if (qrcode.isDark(row + 1, col)) {
        count++;
      }

      if (qrcode.isDark(row, col + 1)) {
        count++;
      }

      if (qrcode.isDark(row + 1, col + 1)) {
        count++;
      }

      if (count === 0 || count === 4) {
        lostPoint += 3;
      }
    }
  }

  // LEVEL3
  for (row = 0; row < moduleCount; row++) {
    for (col = 0; col < moduleCount - 6; col++) {
      if (qrcode.isDark(row, col) &&
        !qrcode.isDark(row, col + 1) &&
        qrcode.isDark(row, col + 2) &&
        qrcode.isDark(row, col + 3) &&
        qrcode.isDark(row, col + 4) &&
        !qrcode.isDark(row, col + 5) &&
        qrcode.isDark(row, col + 6)) {
        lostPoint += 40;
      }
    }
  }

  for (col = 0; col < moduleCount; col++) {
    for (row = 0; row < moduleCount - 6; row++) {
      if (qrcode.isDark(row, col) &&
        !qrcode.isDark(row + 1, col) &&
        qrcode.isDark(row + 2, col) &&
        qrcode.isDark(row + 3, col) &&
        qrcode.isDark(row + 4, col) &&
        !qrcode.isDark(row + 5, col) &&
        qrcode.isDark(row + 6, col)) {
        lostPoint += 40;
      }
    }
  }

  // LEVEL4
  var darkCount = 0;

  for (col = 0; col < moduleCount; col++) {
    for (row = 0; row < moduleCount; row++) {
      if (qrcode.isDark(row, col)) {
        darkCount++;
      }
    }
  }

  var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;

  lostPoint += ratio * 10;

  return lostPoint;
}

/**
 * get BCH digit
 * @param data
 * @returns {number}
 */
function getBCHDigit(data) {
  var digit = 0;

  while (data !== 0) {
    digit++;
    data >>>= 1;
  }

  return digit;
}

/**
 * get BCH type info
 * @param data
 * @returns {number}
 */
export function getBCHTypeInfo(data) {
  var d = data << 10;

  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15)));
  }

  return ((data << 10) | d) ^ G15_MASK;
}

/**
 * get BCH version
 * @param data
 * @returns {number}
 */
export function getBCHVersion(data) {
  var d = data << 12;

  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
  }

  return (data << 12) | d;
}

var PAD0 = 0xEC;
var PAD1 = 0x11;

/**
 * get error correct polynomial
 * @param errorCorrectLength
 * @returns {Polynomial}
 */
function getErrorCorrectPolynomial(errorCorrectLength) {
  var a = new Polynomial([1]);

  for (var i = 0; i < errorCorrectLength; i++) {
    a = a.multiply(new Polynomial([1, QRMath.gexp(i)]));
  }

  return a;
}

/**
 * create bytes
 * @param buffer
 * @param rsBlocks
 * @returns {*}
 */
function createBytes(buffer, rsBlocks) {
  var offset = 0;

  var maxDcCount = 0;
  var maxEcCount = 0;

  var i;
  var r;
  var modIndex;
  var modPoly;
  var rsPoly;
  var rawPoly;
  var dcCount;
  var ecCount;
  var dcData = [];
  var ecData = [];
  var rsLength = rsBlocks.length;

  for (r = 0; r < rsLength; r++) {
    dcData.push([]);
    ecData.push([]);
  }

  function createNumArray(len) {
    var a = [];

    for (var i = 0; i < len; i++) {
      a.push(0);
    }

    return a;
  }

  var dcLength;
  var ecLength;

  for (r = 0; r < rsLength; r++) {
    dcCount = rsBlocks[r].getDataCount();
    ecCount = rsBlocks[r].getTotalCount() - dcCount;

    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    dcData[r] = createNumArray(dcCount);

    dcLength = dcData[r].length;

    for (i = 0; i < dcLength; i++) {
      dcData[r][i] = 0xff & buffer.getBuffer()[i + offset];
    }

    offset += dcCount;

    rsPoly = getErrorCorrectPolynomial(ecCount);
    rawPoly = new Polynomial(dcData[r], rsPoly.getLength() - 1);

    modPoly = rawPoly.mod(rsPoly);
    ecData[r] = createNumArray(rsPoly.getLength() - 1);

    ecLength = ecData[r].length;

    for (i = 0; i < ecLength; i++) {
      modIndex = i + modPoly.getLength() - ecLength;
      ecData[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0;
    }
  }

  var totalCodeCount = 0;

  for (i = 0; i < rsLength; i++) {
    totalCodeCount += rsBlocks[i].getTotalCount();
  }

  var index = 0;
  var data = createNumArray(totalCodeCount);

  for (i = 0; i < maxDcCount; i++) {
    for (r = 0; r < rsLength; r++) {
      if (i < dcData[r].length) {
        data[index++] = dcData[r][i];
      }
    }
  }

  for (i = 0; i < maxEcCount; i++) {
    for (r = 0; r < rsLength; r++) {
      if (i < ecData[r].length) {
        data[index++] = ecData[r][i];
      }
    }
  }

  return data;
}

/**
 * create data
 * @param version
 * @param level
 * @param dataArray
 * @returns {*}
 */
export function createData(version, level, dataArray) {
  var buffer = createBuffer(version, dataArray);
  var maxDataCount = getMaxLength(version, level);

  if (buffer.getLengthInBits() > maxDataCount) {
    throw new Error('data length overflow: ' + buffer.getLengthInBits() + ' > ' + maxDataCount);
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

  return createBytes(buffer, RSBlock.getRSBlocks(version, level));
}

/**
 * string to utf8 byte array
 * @param str
 * @returns {Array}
 */
export function stringToUtf8ByteArray(str) {
  var charcode;
  var utf8 = [];
  var length = str.length;

  for (var i = 0; i < length; i++) {
    charcode = str.charCodeAt(i);

    if (charcode < 0x80) {
      utf8.push(charcode);
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    } else {
      // surrogate pair
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));

      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  return utf8;
}
