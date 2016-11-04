(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('qrcode', factory) :
  (global.QRCode = factory());
}(this, (function () { 'use strict';

  var Mode = {
    MODE_NUMBER: 1 << 0, // number
    MODE_ALPHA_NUM: 1 << 1, // alphabet and number
    MODE_8BIT_BYTE: 1 << 2, // 8bit byte
    MODE_KANJI: 1 << 3 // KANJI
  };

  function QRData(mode, data) {
    this.mode = mode;
    this.data = data;
  }

  QRData.prototype = {
    getMode: function() {
      return this.mode;
    },
    getData: function() {
      return this.data;
    },
    getLengthInBits: function(typeNumber) {
      var mode = this.mode;

      if (1 <= typeNumber && typeNumber < 10) {
        // 1 - 9
        switch (mode) {
          case Mode.MODE_NUMBER:
            return 10;
          case Mode.MODE_ALPHA_NUM:
            return 9;
          case Mode.MODE_8BIT_BYTE:
            return 8;
          case Mode.MODE_KANJI:
            return 8;
          default:
            throw 'mode:' + mode;
        }
      } else if (typeNumber < 27) {
        // 10 - 26
        switch (mode) {
          case Mode.MODE_NUMBER:
            return 12;
          case Mode.MODE_ALPHA_NUM:
            return 11;
          case Mode.MODE_8BIT_BYTE:
            return 16;
          case Mode.MODE_KANJI:
            return 10;
          default:
            throw 'mode:' + mode;
        }
      } else if (typeNumber < 41) {
        // 27 - 40
        switch (mode) {
          case Mode.MODE_NUMBER:
            return 14;
          case Mode.MODE_ALPHA_NUM:
            return 13;
          case Mode.MODE_8BIT_BYTE:
            return 16;
          case Mode.MODE_KANJI:
            return 12;
          default:
            throw 'mode:' + mode;
        }
      } else {
        throw 'typeNumber:' + typeNumber;
      }
    }
  };

  var ErrorCorrectLevel = {
    L: 1, // 7%
    M: 0, // 15%
    Q: 3, // 25%
    H: 2 // 30%
  };

  var EXP_TABLE = [];
  var LOG_TABLE = [];

  (function() {
    for (var i = 0; i < 256; i += 1) {
      EXP_TABLE.push(
        i < 8 ? 1 << i :
        EXP_TABLE[i - 4] ^
        EXP_TABLE[i - 5] ^
        EXP_TABLE[i - 6] ^
        EXP_TABLE[i - 8]
      );
      LOG_TABLE.push(0);
    }

    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i]] = i;
    }
  }());

  function glog(n) {
    if (n < 1) {
      throw 'log(' + n + ')';
    }

    return QRMath.LOG_TABLE[n];
  }

  function gexp(n) {
    while (n < 0) {
      n += 255;
    }

    while (n >= 256) {
      n -= 255;
    }

    return QRMath.EXP_TABLE[n];
  }

  function Polynomial(num, shift) {
    shift = shift || 0;

    var offset = 0;
    var context = this;

    while (offset < num.length && num[offset] == 0) {
      offset += 1;
    }

    context.num = [];

    var len = num.length - offset;

    for (var i = 0; i < len; i += 1) {
      context.num.push(num[offset + i]);
    }

    for (var i = 0; i < shift; i += 1) {
      context.num.push(0);
    }
  }

  Polynomial.prototype = {
    getAt: function(index) {
      return this.num[index];
    },
    getLength: function() {
      return this.num.length;
    },
    toString: function() {
      var buffer = '';
      var context = this;
      var length = context.getLength();

      for (var i = 0; i < length; i += 1) {
        if (i > 0) {
          buffer += ',';
        }

        buffer += context.getAt(i);
      }

      return buffer.toString();
    },
    toLogString: function() {
      var buffer = '';
      var context = this;
      var length = context.getLength();

      for (var i = 0; i < length; i += 1) {
        if (i > 0) {
          buffer += ',';
        }

        buffer += glog(context.getAt(i));
      }

      return buffer.toString();
    },
    multiply: function(e) {
      var num = [];
      var context = this;
      var len = context.getLength() + e.getLength() - 1;

      for (var i = 0; i < len; i += 1) {
        num.push(0);
      }

      for (var i = 0; i < context.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= gexp(glog(context.getAt(i)) + glog(e.getAt(j)));
        }
      }

      return new Polynomial(num);
    }
  };

  var MaskPattern = {
    PATTERN000: 0b000, // mask pattern 000
    PATTERN001: 0b001, // mask pattern 001
    PATTERN010: 0b010, // mask pattern 010
    PATTERN011: 0b011, // mask pattern 011
    PATTERN100: 0b100, // mask pattern 100
    PATTERN101: 0b101, // mask pattern 101
    PATTERN110: 0b110, // mask pattern 110
    PATTERN111: 0b111 // mask pattern 111
  };

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



  var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
  var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
  var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

  /**
   * inherits
   * @param ctor
   * @param superCtor
   * @param proto
   */


  function getPatternPosition(typeNumber) {
    return PATTERN_POSITION_TABLE[typeNumber - 1];
  }



  function getErrorCorrectPolynomial(errorCorrectLength) {
    var a = new Polynomial([1]);

    for (var i = 0; i < errorCorrectLength; i += 1) {
      a = a.multiply(new Polynomial([1, gexp(i)]));
    }

    return a;
  }

  function getMaskFunc(maskPattern) {
    switch (maskPattern) {
      case MaskPattern.PATTERN000:
        return function(i, j) { return (i + j) % 2 == 0; };
      case MaskPattern.PATTERN001:
        return function(i, j) { return i % 2 == 0; };
      case MaskPattern.PATTERN010:
        return function(i, j) { return j % 3 == 0; };
      case MaskPattern.PATTERN011:
        return function(i, j) { return (i + j) % 3 == 0; };
      case MaskPattern.PATTERN100:
        return function(i, j) { return (~~(i / 2) + ~~(j / 3)) % 2 == 0; };
      case MaskPattern.PATTERN101:
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case MaskPattern.PATTERN110:
        return function(i, j) { return ((i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case MaskPattern.PATTERN111:
        return function(i, j) { return ((i * j) % 3 + (i + j) % 2) % 2 == 0; };
      default:
        throw 'mask:' + maskPattern;
    }
  }

  function getLostPoint(qrCode) {
    var row;
    var rol;
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

  function getBCHDigit(data) {
    var digit = 0;

    while (data != 0) {
      digit += 1;
      data >>>= 1;
    }

    return digit;
  }

  function getBCHTypeInfo(data) {
    var d = data << 10;

    while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
      d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15)));
    }

    return ((data << 10) | d) ^ G15_MASK;
  }

  function getBCHTypeNumber(data) {
    var d = data << 12;

    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
      d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
    }

    return (data << 12) | d;
  }

  function QRCode() {
    var context = this;

    context.typeNumber = 1;
    context.errorCorrectLevel = ErrorCorrectLevel;
    context.qrDataList = [];
    context.modules = [];
    context.moduleCount = 0;
  }

  QRCode.PAD0 = 0xEC;
  QRCode.PAD1 = 0x11;

  QRCode.createData = function(typeNumber, errorCorrectLevel, dataArray) {
    var data;
    var buffer = new BitBuffer();
    var rsBlocks = RSBlock.getRSBlocks(typeNumber, errorCorrectLevel);

    for (var i = 0; i < dataArray.length; i += 1) {
      data = dataArray[i];

      buffer.put(data.getMode(), 4);
      buffer.put(data.getLength(), data.getLengthInBits(typeNumber));
      data.write(buffer);
    }

    // calc max data count
    var totalDataCount = 0;

    for (var i = 0; i < rsBlocks.length; i += 1) {
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

      buffer.put(QRCode.PAD0, 8);

      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }

      buffer.put(QRCode.PAD1, 8);
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

    for (var r = 0; r < rsBlocks.length; r += 1) {
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

    for (var r = 0; r < rsBlocks.length; r += 1) {
      dcCount = rsBlocks[r].getDataCount();
      ecCount = rsBlocks[r].getTotalCount() - dcCount;

      maxDcCount = Math.max(maxDcCount, dcCount);
      maxEcCount = Math.max(maxEcCount, ecCount);

      dcData[r] = createNumArray(dcCount);

      for (i = 0; i < dcData[r].length; i += 1) {
        dcData[r][i] = 0xff & buffer.getBuffer()[i + offset];
      }

      offset += dcCount;

      rsPoly = getErrorCorrectPolynomial(ecCount);
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

  QRCode.stringToBytes = function() {
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
    getTypeNumber: function() {
      return this.typeNumber;
    },
    setTypeNumber: function(typeNumber) {
      this.typeNumber = typeNumber;
    },
    getErrorCorrectLevel: function() {
      return this.errorCorrectLevel;
    },
    setErrorCorrectLevel: function(errorCorrectLevel) {
      this.errorCorrectLevel = errorCorrectLevel;
    },
    clearData: function() {
      this.qrDataList = [];
    },
    addData: function(qrData) {
      var qrDataList = this.qrDataList;

      if (qrData instanceof QRData) {
        qrDataList.push(qrData);
      } else if (typeof qrData === 'string') {
        qrDataList.push(new QR8BitByte(qrData));
      } else {
        throw typeof qrData;
      }
    },
    getDataCount: function() {
      return this.qrDataList.length;
    },
    getData: function(index) {
      return this.qrDataList[index];
    },
    isDark: function(row, col) {
      var modules = this.modules;

      if (modules[row][col] !== null) {
        return modules[row][col];
      } else {
        return false;
      }
    },
    getModuleCount: function() {
      return this.moduleCount;
    },
    make: function() {
      this.makeImpl(false, this.getBestMaskPattern());
    },
    getBestMaskPattern: function() {
      var lostPoint;
      var pattern = 0;
      var minLostPoint = 0;

      for (var i = 0; i < 8; i += 1) {
        this.makeImpl(true, i);

        lostPoint = getLostPoint(this);

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
      context.moduleCount = context.typeNumber * 4 + 17;
      context.modules = [];

      for (var i = 0; i < context.moduleCount; i += 1) {
        context.modules.push([]);
        for (var j = 0; j < context.moduleCount; j += 1) {
          context.modules[i].push(null);
        }
      }

      context.setupPositionProbePattern(0, 0);
      context.setupPositionProbePattern(context.moduleCount - 7, 0);
      context.setupPositionProbePattern(0, context.moduleCount - 7);

      context.setupPositionAdjustPattern();
      context.setupTimingPattern();

      context.setupTypeInfo(test, maskPattern);

      if (context.typeNumber >= 7) {
        context.setupTypeNumber(test);
      }

      var data = QRCode.createData(
        context.typeNumber,
        context.errorCorrectLevel,
        context.qrDataList
      );

      context.mapData(data, maskPattern);
    },
    mapData: function(data, maskPattern) {
      var c;
      var dark;
      var mask;
      var inc = -1;
      var context = this;
      var row = context.moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = getMaskFunc(maskPattern);

      for (var col = context.moduleCount - 1; col > 0; col -= 2) {
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

          if (row < 0 || context.moduleCount <= row) {
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
      var pos = getPatternPosition(context.typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          row = pos[i];
          col = pos[j];

          if (context.modules[row][col] != null) {
            continue;
          }

          for (r = -2; r <= 2; r += 1) {

            for (c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                context.modules[row + r][col + c] = true;
              } else {
                context.modules[row + r][col + c] = false;
              }
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
          if (row + r <= -1 || context.moduleCount <= row + r ||
            col + c <= -1 || context.moduleCount <= col + c) {
            continue;
          }

          if ((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
            (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
            context.modules[row + r][col + c] = true;
          } else {
            context.modules[row + r][col + c] = false;
          }
        }
      }
    },
    setupTimingPattern: function() {
      var context = this;

      for (var r = 8; r < context.moduleCount - 8; r += 1) {
        if (context.modules[r][6] != null) {
          continue;
        }

        context.modules[r][6] = r % 2 == 0;
      }
      for (var c = 8; c < context.moduleCount - 8; c += 1) {
        if (context.modules[6][c] != null) {
          continue;
        }

        context.modules[6][c] = c % 2 == 0;
      }
    },
    setupTypeNumber: function(test) {
      var context = this;
      var bits = getBCHTypeNumber(context.typeNumber);

      for (var i = 0; i < 18; i += 1) {
        context.modules[~~(i / 3)][i % 3 + context.moduleCount - 8 - 3] = !test && ((bits >> i) & 1) == 1;
      }

      for (var i = 0; i < 18; i += 1) {
        context.modules[i % 3 + context.moduleCount - 8 - 3][~~(i / 3)] = !test && ((bits >> i) & 1) == 1;
      }
    },
    setupTypeInfo: function(test, maskPattern) {
      var mod;
      var context = this;
      var data = (context.errorCorrectLevel << 3) | maskPattern;
      var bits = getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {
        mod = !test && ((bits >> i) & 1) == 1;

        if (i < 6) {
          context.modules[i][8] = mod;
        } else if (i < 8) {
          context.modules[i + 1][8] = mod;
        } else {
          context.modules[context.moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {
        mod = !test && ((bits >> i) & 1) == 1;

        if (i < 8) {
          context.modules[8][context.moduleCount - i - 1] = mod;
        } else if (i < 9) {
          context.modules[8][15 - i - 1 + 1] = mod;
        } else {
          context.modules[8][15 - i - 1] = mod;
        }
      }

      // fixed
      context.modules[context.moduleCount - 8][8] = !test;
    },
    toDataURL: function(cellSize, margin) {
      cellSize = cellSize || 2;
      margin = margin || 4;

      var context = this;
      var mods = context.getModuleCount();
      var size = cellSize * mods + margin * 2;
      var gif = new com.d_project.image.GIFImage(size, size);

      var x;

      for (var y = 0; y < size; y += 1) {
        for (x = 0; x < size; x += 1) {
          if (margin <= x && x < size - margin &&
            margin <= y && y < size - margin &&
            context.isDark(~~((y - margin) / cellSize), ~~((x - margin) / cellSize))) {
            gif.setPixel(x, y, 0);
          } else {
            gif.setPixel(x, y, 1);
          }
        }
      }

      return gif.toDataURL();
    }
  };

  var encode = {
    Encode: QRCode
  };

  return encode;

})));
