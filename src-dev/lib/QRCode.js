import RSBlock from './RSBlock';
import BitBuffer from './BitBuffer';
import QR8BitByte from './QR8BitByte';
import QRData from './QRData';
import * as QRUtil from './QRUtil';
import Polynomial from './Polynomial';

export default function QRCode(version, level) {
  var context = this;

  context.version = version;
  context.level = level;
  context.data = [];
  context.modules = [];
  context.count = 0;
}

var PAD0 = 0xEC;
var PAD1 = 0x11;

QRCode.getMaxLength = QRUtil.getMaxLength;

QRCode.createData = function(version, level, dataArray) {
  var i;
  var data;
  var buffer = new BitBuffer();
  var rsBlocks = RSBlock.getRSBlocks(version, level);

  for (i = 0; i < dataArray.length; i += 1) {
    data = dataArray[i];

    buffer.put(data.getMode(), 4);
    buffer.put(data.getLength(), data.getLengthInBits(version));
    data.write(buffer);
  }

  // calc max data count
  var totalDataCount = 0;

  for (i = 0; i < rsBlocks.length; i += 1) {
    totalDataCount += rsBlocks[i].getDataCount();
  }

  if (buffer.getLengthInBits() > totalDataCount * 8) {
    throw 'code length overflow. (' +
      buffer.getLengthInBits() +
      '>' +
      totalDataCount * 8 +
      ')';
  }

  // end
  if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }

  // padding
  while (buffer.getLengthInBits() % 8 != 0) {
    buffer.putBit(false);
  }

  // padding
  while (true) {
    if (buffer.getLengthInBits() >= totalDataCount * 8) {
      break;
    }

    buffer.put(PAD0, 8);

    if (buffer.getLengthInBits() >= totalDataCount * 8) {
      break;
    }

    buffer.put(PAD1, 8);
  }

  return QRCode.createBytes(buffer, rsBlocks);
};

QRCode.createBytes = function(buffer, rsBlocks) {
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

  for (r = 0; r < rsBlocks.length; r += 1) {
    dcData.push([]);
    ecData.push([]);
  }

  function createNumArray(len) {
    var a = [];

    for (var i = 0; i < len; i += 1) {
      a.push(0);
    }

    return a;
  }

  for (r = 0; r < rsBlocks.length; r += 1) {
    dcCount = rsBlocks[r].getDataCount();
    ecCount = rsBlocks[r].getTotalCount() - dcCount;

    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    dcData[r] = createNumArray(dcCount);

    for (i = 0; i < dcData[r].length; i += 1) {
      dcData[r][i] = 0xff & buffer.getBuffer()[i + offset];
    }

    offset += dcCount;

    rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
    rawPoly = new Polynomial(dcData[r], rsPoly.getLength() - 1);

    modPoly = rawPoly.mod(rsPoly);
    ecData[r] = createNumArray(rsPoly.getLength() - 1);

    for (i = 0; i < ecData[r].length; i += 1) {
      modIndex = i + modPoly.getLength() - ecData[r].length;
      ecData[r][i] = (modIndex >= 0) ? modPoly.getAt(modIndex) : 0;
    }
  }

  var totalCodeCount = 0;

  for (i = 0; i < rsBlocks.length; i += 1) {
    totalCodeCount += rsBlocks[i].getTotalCount();
  }

  var data = createNumArray(totalCodeCount);
  var index = 0;

  for (i = 0; i < maxDcCount; i += 1) {
    for (r = 0; r < rsBlocks.length; r += 1) {
      if (i < dcData[r].length) {
        data[index] = dcData[r][i];
        index += 1;
      }
    }
  }

  for (i = 0; i < maxEcCount; i += 1) {
    for (r = 0; r < rsBlocks.length; r += 1) {
      if (i < ecData[r].length) {
        data[index] = ecData[r][i];
        index += 1;
      }
    }
  }

  return data;
};

QRCode.stringToBytes = function(str) {
  var charcode;
  var utf8 = [];

  for (var i = 0; i < str.length; i++) {
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
};

QRCode.prototype = {
  getVersion: function() {
    return this.version;
  },
  setVersion: function(version) {
    this.version = version;
  },
  getErrorLevel: function() {
    return this.level;
  },
  setErrorLevel: function(level) {
    this.level = level;
  },
  clearData: function() {
    this.data = [];
  },
  addData: function(qrData) {
    var dataList = this.data;

    if (qrData instanceof QRData) {
      dataList.push(qrData);
    } else if (typeof qrData === 'string') {
      dataList.push(new QR8BitByte(qrData));
    } else {
      throw typeof qrData;
    }
  },
  getDataCount: function() {
    return this.data.length;
  },
  getData: function(index) {
    return this.data[index];
  },
  isDark: function(row, col) {
    var modules = this.modules;

    if (modules[row][col] !== null) {
      return modules[row][col];
    } else {
      return false;
    }
  },
  getModules: function() {
    return this.modules;
  },
  getModuleCount: function() {
    return this.count;
  },
  make: function() {
    var context = this;

    context.makeImpl(false, context.getBestMaskPattern());

    return context.modules;
  },
  getBestMaskPattern: function() {
    var lostPoint;
    var pattern = 0;
    var context = this;
    var minLostPoint = 0;

    for (var i = 0; i < 8; i += 1) {
      context.makeImpl(true, i);

      lostPoint = QRUtil.getLostPoint(context);

      if (i == 0 || minLostPoint > lostPoint) {
        pattern = i;
        minLostPoint = lostPoint;
      }
    }

    return pattern;
  },
  makeImpl: function(test, maskPattern) {
    var context = this;

    // initialize modules
    context.count = context.version * 4 + 17;
    context.modules = [];

    var j;

    for (var i = 0; i < context.count; i += 1) {
      context.modules.push([]);
      for (j = 0; j < context.count; j += 1) {
        context.modules[i].push(null);
      }
    }

    context.setupPositionProbePattern(0, 0);
    context.setupPositionProbePattern(context.count - 7, 0);
    context.setupPositionProbePattern(0, context.count - 7);

    context.setupPositionAdjustPattern();
    context.setupTimingPattern();

    context.setupVersionInfo(test, maskPattern);

    if (context.version >= 7) {
      context.setupVersion(test);
    }

    var data = QRCode.createData(
      context.version,
      context.level,
      context.data
    );

    context.mapData(data, maskPattern);
  },
  mapData: function(data, maskPattern) {
    var c;
    var dark;
    var mask;
    var inc = -1;
    var context = this;
    var row = context.count - 1;
    var bitIndex = 7;
    var byteIndex = 0;
    var maskFunc = QRUtil.getMaskFunc(maskPattern);

    for (var col = context.count - 1; col > 0; col -= 2) {
      if (col == 6) {
        col -= 1;
      }

      while (true) {
        for (c = 0; c < 2; c += 1) {
          if (context.modules[row][col - c] == null) {
            dark = false;

            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) == 1);
            }

            mask = maskFunc(row, col - c);

            if (mask) {
              dark = !dark;
            }

            context.modules[row][col - c] = dark;
            bitIndex -= 1;

            if (bitIndex == -1) {
              byteIndex += 1;
              bitIndex = 7;
            }
          }
        }

        row += inc;

        if (row < 0 || context.count <= row) {
          row -= inc;
          inc = -inc;
          break;
        }
      }
    }
  },
  setupPositionAdjustPattern: function() {
    var r;
    var c;
    var row;
    var col;
    var context = this;
    var pos = QRUtil.getPatternPosition(context.version);

    var j;

    for (var i = 0; i < pos.length; i += 1) {
      for (j = 0; j < pos.length; j += 1) {
        row = pos[i];
        col = pos[j];

        if (context.modules[row][col] != null) {
          continue;
        }

        for (r = -2; r <= 2; r += 1) {
          for (c = -2; c <= 2; c += 1) {
            context.modules[row + r][col + c] = !!(r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0));
          }
        }
      }
    }
  },
  setupPositionProbePattern: function(row, col) {
    var c;
    var context = this;

    for (var r = -1; r <= 7; r += 1) {
      for (c = -1; c <= 7; c += 1) {
        if (row + r <= -1 || context.count <= row + r ||
          col + c <= -1 || context.count <= col + c) {
          continue;
        }

        context.modules[row + r][col + c] = !!((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
          (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4));
      }
    }
  },
  setupTimingPattern: function() {
    var context = this;

    for (var r = 8; r < context.count - 8; r += 1) {
      if (context.modules[r][6] != null) {
        continue;
      }

      context.modules[r][6] = r % 2 == 0;
    }

    for (var c = 8; c < context.count - 8; c += 1) {
      if (context.modules[6][c] != null) {
        continue;
      }

      context.modules[6][c] = c % 2 == 0;
    }
  },
  setupVersion: function(test) {
    var i;
    var context = this;
    var bits = QRUtil.getBCHVersion(context.version);

    for (i = 0; i < 18; i += 1) {
      context.modules[~~(i / 3)][i % 3 + context.count - 8 - 3] = !test && ((bits >> i) & 1) == 1;
    }

    for (i = 0; i < 18; i += 1) {
      context.modules[i % 3 + context.count - 8 - 3][~~(i / 3)] = !test && ((bits >> i) & 1) == 1;
    }
  },
  setupVersionInfo: function(test, maskPattern) {
    var i;
    var mod;
    var context = this;
    var data = (context.level << 3) | maskPattern;
    var bits = QRUtil.getBCHTypeInfo(data);

    // vertical
    for (i = 0; i < 15; i += 1) {
      mod = !test && ((bits >> i) & 1) == 1;

      if (i < 6) {
        context.modules[i][8] = mod;
      } else if (i < 8) {
        context.modules[i + 1][8] = mod;
      } else {
        context.modules[context.count - 15 + i][8] = mod;
      }
    }

    // horizontal
    for (i = 0; i < 15; i += 1) {
      mod = !test && ((bits >> i) & 1) == 1;

      if (i < 8) {
        context.modules[8][context.count - i - 1] = mod;
      } else if (i < 9) {
        context.modules[8][15 - i - 1 + 1] = mod;
      } else {
        context.modules[8][15 - i - 1] = mod;
      }
    }

    // fixed
    context.modules[context.count - 8][8] = !test;
  }
};
