import QR8BitByte from './QR8BitByte';
import QRData from './QRData';
import * as QRUtil from './QRUtil';

export default function QRCode(version, level) {
  var context = this;

  context.version = version;
  context.level = level;
  context.data = [];
  context.modules = [];
  context.count = 0;
}

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
  addData: function(data) {
    var dataList = this.data;

    if (data instanceof QRData) {
      dataList.push(data);
    } else if (typeof data === 'string') {
      dataList.push(new QR8BitByte(data));
    } else {
      throw new Error('illegal type of data.');
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

    for (var i = 0; i < 8; i++) {
      context.makeImpl(true, i);

      lostPoint = QRUtil.getLostPoint(context);

      if (i === 0 || minLostPoint > lostPoint) {
        pattern = i;
        minLostPoint = lostPoint;
      }
    }

    return pattern;
  },
  makeImpl: function(test, maskPattern) {
    var context = this;

    // initialize modules
    context.modules = [];
    context.count = context.version * 4 + 17;

    var j;

    for (var i = 0; i < context.count; i++) {
      context.modules.push([]);

      for (j = 0; j < context.count; j++) {
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

    var data = QRUtil.createData(
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
      if (col === 6) {
        col -= 1;
      }

      while (true) {
        for (c = 0; c < 2; c++) {
          if (context.modules[row][col - c] === null) {
            dark = false;

            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) === 1);
            }

            mask = maskFunc(row, col - c);

            if (mask) {
              dark = !dark;
            }

            context.modules[row][col - c] = dark;
            bitIndex -= 1;

            if (bitIndex == -1) {
              byteIndex++;
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

    for (var i = 0; i < pos.length; i++) {
      for (j = 0; j < pos.length; j++) {
        row = pos[i];
        col = pos[j];

        if (context.modules[row][col] !== null) {
          continue;
        }

        for (r = -2; r <= 2; r++) {
          for (c = -2; c <= 2; c++) {
            context.modules[row + r][col + c] = !!(r == -2 || r === 2 || c == -2 || c === 2 || (r === 0 && c === 0));
          }
        }
      }
    }
  },
  setupPositionProbePattern: function(row, col) {
    var c;
    var context = this;

    for (var r = -1; r <= 7; r++) {
      for (c = -1; c <= 7; c++) {
        if (row + r <= -1 || context.count <= row + r ||
          col + c <= -1 || context.count <= col + c) {
          continue;
        }

        context.modules[row + r][col + c] = !!((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4));
      }
    }
  },
  setupTimingPattern: function() {
    var context = this;

    for (var r = 8; r < context.count - 8; r++) {
      if (context.modules[r][6] !== null) {
        continue;
      }

      context.modules[r][6] = r % 2 === 0;
    }

    for (var c = 8; c < context.count - 8; c++) {
      if (context.modules[6][c] !== null) {
        continue;
      }

      context.modules[6][c] = c % 2 === 0;
    }
  },
  setupVersion: function(test) {
    var i;
    var context = this;
    var bits = QRUtil.getBCHVersion(context.version);

    for (i = 0; i < 18; i++) {
      context.modules[~~(i / 3)][i % 3 + context.count - 8 - 3] = !test && ((bits >> i) & 1) === 1;
    }

    for (i = 0; i < 18; i++) {
      context.modules[i % 3 + context.count - 8 - 3][~~(i / 3)] = !test && ((bits >> i) & 1) === 1;
    }
  },
  setupVersionInfo: function(test, maskPattern) {
    var i;
    var mod;
    var context = this;
    var data = (context.level << 3) | maskPattern;
    var bits = QRUtil.getBCHTypeInfo(data);

    // vertical
    for (i = 0; i < 15; i++) {
      mod = !test && ((bits >> i) & 1) === 1;

      if (i < 6) {
        context.modules[i][8] = mod;
      } else if (i < 8) {
        context.modules[i + 1][8] = mod;
      } else {
        context.modules[context.count - 15 + i][8] = mod;
      }
    }

    // horizontal
    for (i = 0; i < 15; i++) {
      mod = !test && ((bits >> i) & 1) === 1;

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
