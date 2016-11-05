import { ErrorCorrectLevel } from './ErrorCorrectLevel';
import Polynomial from './Polynomial';
import * as QRMath from './QRMath';
import { Mode } from './Mode';
import { MaskPattern } from './MaskPattern';

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

var MAX_LENGTH = [
  [[41, 25, 17, 10], [34, 20, 14, 8], [27, 16, 11, 7], [17, 10, 7, 4]],
  [[77, 47, 32, 20], [63, 38, 26, 16], [48, 29, 20, 12], [34, 20, 14, 8]],
  [[127, 77, 53, 32], [101, 61, 42, 26], [77, 47, 32, 20], [58, 35, 24, 15]],
  [[187, 114, 78, 48], [149, 90, 62, 38], [111, 67, 46, 28], [82, 50, 34, 21]],
  [[255, 154, 106, 65], [202, 122, 84, 52], [144, 87, 60, 37], [106, 64, 44, 27]],
  [[322, 195, 134, 82], [255, 154, 106, 65], [178, 108, 74, 45], [139, 84, 58, 36]],
  [[370, 224, 154, 95], [293, 178, 122, 75], [207, 125, 86, 53], [154, 93, 64, 39]],
  [[461, 279, 192, 118], [365, 221, 152, 93], [259, 157, 108, 66], [202, 122, 84, 52]],
  [[552, 335, 230, 141], [432, 262, 180, 111], [312, 189, 130, 80], [235, 143, 98, 60]],
  [[652, 395, 271, 167], [513, 311, 213, 131], [364, 221, 151, 93], [288, 174, 119, 74]]
];

var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

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

export function getPatternPosition(version) {
  if (version < 1 || version > PATTERN_POSITION_TABLE.length) {
    throw new Error('illegal version: ' + version);
  }

  return PATTERN_POSITION_TABLE[version - 1];
}

export function getMaxLength(version, mode, level) {
  var t = version - 1;
  var e = 0;
  var m = 0;

  switch (level) {
    case ErrorCorrectLevel.L:
      e = 0;
      break;
    case ErrorCorrectLevel.M:
      e = 1;
      break;
    case ErrorCorrectLevel.Q:
      e = 2;
      break;
    case ErrorCorrectLevel.H:
      e = 3;
      break;
    default:
      throw new Error('invalid level:' + level);
  }

  switch (mode) {
    case Mode.MODE_NUMBER:
      m = 0;
      break;
    case Mode.MODE_ALPHA_NUM:
      m = 1;
      break;
    case Mode.MODE_8BIT_BYTE:
      m = 2;
      break;
    case Mode.MODE_KANJI:
      m = 3;
      break;
    default:
      throw new Error('invalid mode:' + mode);
  }

  return MAX_LENGTH[t][e][m];
}

export function getErrorCorrectPolynomial(errorCorrectLength) {
  var a = new Polynomial([1]);

  for (var i = 0; i < errorCorrectLength; i += 1) {
    a = a.multiply(new Polynomial([1, QRMath.gexp(i)]));
  }

  return a;
}

export function getMaskFunc(maskPattern) {
  switch (maskPattern) {
    case MaskPattern.PATTERN000:
      return function(x, y) {
        return (x + y) % 2 === 0;
      };
    case MaskPattern.PATTERN001:
      return function(x, y) {
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
        return (x / 2 + y / 3) % 2 === 0;
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
      throw new Error('invalid mask:' + maskPattern);
  }
}

export function getLostPoint(qrCode) {
  var row;
  var col;
  var sameCount;
  var dark;
  var r;
  var c;
  var lostPoint = 0;
  var moduleCount = qrCode.getModuleCount();

  // LEVEL1
  for (row = 0; row < moduleCount; row += 1) {
    for (col = 0; col < moduleCount; col += 1) {
      sameCount = 0;
      dark = qrCode.isDark(row, col);

      for (r = -1; r <= 1; r += 1) {

        if (row + r < 0 || moduleCount <= row + r) {
          continue;
        }

        for (c = -1; c <= 1; c += 1) {

          if (col + c < 0 || moduleCount <= col + c) {
            continue;
          }

          if (r == 0 && c == 0) {
            continue;
          }

          if (dark == qrCode.isDark(row + r, col + c)) {
            sameCount += 1;
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
  for (row = 0; row < moduleCount - 1; row += 1) {
    for (col = 0; col < moduleCount - 1; col += 1) {
      count = 0;

      if (qrCode.isDark(row, col)) {
        count += 1;
      }

      if (qrCode.isDark(row + 1, col)) {
        count += 1;
      }

      if (qrCode.isDark(row, col + 1)) {
        count += 1;
      }

      if (qrCode.isDark(row + 1, col + 1)) {
        count += 1;
      }

      if (count == 0 || count == 4) {
        lostPoint += 3;
      }
    }
  }

  // LEVEL3
  for (row = 0; row < moduleCount; row += 1) {
    for (col = 0; col < moduleCount - 6; col += 1) {
      if (qrCode.isDark(row, col) &&
        !qrCode.isDark(row, col + 1) &&
        qrCode.isDark(row, col + 2) &&
        qrCode.isDark(row, col + 3) &&
        qrCode.isDark(row, col + 4) &&
        !qrCode.isDark(row, col + 5) &&
        qrCode.isDark(row, col + 6)) {
        lostPoint += 40;
      }
    }
  }

  for (col = 0; col < moduleCount; col += 1) {
    for (row = 0; row < moduleCount - 6; row += 1) {
      if (qrCode.isDark(row, col) &&
        !qrCode.isDark(row + 1, col) &&
        qrCode.isDark(row + 2, col) &&
        qrCode.isDark(row + 3, col) &&
        qrCode.isDark(row + 4, col) &&
        !qrCode.isDark(row + 5, col) &&
        qrCode.isDark(row + 6, col)) {
        lostPoint += 40;
      }
    }
  }

  // LEVEL4
  var darkCount = 0;

  for (col = 0; col < moduleCount; col += 1) {
    for (row = 0; row < moduleCount; row += 1) {
      if (qrCode.isDark(row, col)) {
        darkCount += 1;
      }
    }
  }

  var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;

  lostPoint += ratio * 10;

  return lostPoint;
}

export function getBCHDigit(data) {
  var digit = 0;

  while (data !== 0) {
    digit += 1;
    data >>>= 1;
  }

  return digit;
}

export function getBCHTypeInfo(data) {
  var d = data << 10;

  while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
    d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15)));
  }

  return ((data << 10) | d) ^ G15_MASK;
}

export function getBCHVersion(data) {
  var d = data << 12;

  while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
    d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
  }

  return (data << 12) | d;
}

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
