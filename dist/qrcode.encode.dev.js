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
    getLength: function() {
      return this.getData().length;
    },
    write: function() {
      throw new Error('abstract interface write must be implemented.');
    },
    getLengthInBits: function(version) {
      var mode = this.mode;

      if (1 <= version && version < 10) {
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
            throw new Error('illegal mode: ' + mode);
        }
      } else if (version < 27) {
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
            throw new Error('illegal mode: ' + mode);
        }
      } else if (version < 41) {
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
            throw new Error('illegal mode: ' + mode);
        }
      } else {
        throw new Error('illegal version: ' + version);
      }
    }
  };

  var ErrorCorrectLevel = {
    L: 1, // 7%
    M: 0, // 15%
    Q: 3, // 25%
    H: 2 // 30%
  };

  function RSBlock(totalCount, dataCount) {
    this.totalCount = totalCount;
    this.dataCount = dataCount;
  }

  var RS_BLOCK_TABLE = [
    // L
    // M
    // Q
    // H

    // 1
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],

    // 2
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],

    // 3
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],

    // 4
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],

    // 5
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],

    // 6
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],

    // 7
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],

    // 8
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],

    // 9
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],

    // 10
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],

    // 11
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],

    // 12
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],

    // 13
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],

    // 14
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],

    // 15
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12, 7, 37, 13],

    // 16
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],

    // 17
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],

    // 18
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],

    // 19
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],

    // 20
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],

    // 21
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],

    // 22
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],

    // 23
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],

    // 24
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],

    // 25
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],

    // 26
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],

    // 27
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],

    // 28
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],

    // 29
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],

    // 30
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],

    // 31
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],

    // 32
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],

    // 33
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],

    // 34
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],

    // 35
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],

    // 36
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],

    // 37
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],

    // 38
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],

    // 39
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],

    // 40
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16]
  ];

  function getRsBlockTable(version, level) {
    switch (level) {
      case ErrorCorrectLevel.L:
        return RS_BLOCK_TABLE[(version - 1) * 4];
      case ErrorCorrectLevel.M:
        return RS_BLOCK_TABLE[(version - 1) * 4 + 1];
      case ErrorCorrectLevel.Q:
        return RS_BLOCK_TABLE[(version - 1) * 4 + 2];
      case ErrorCorrectLevel.H:
        return RS_BLOCK_TABLE[(version - 1) * 4 + 3];
      default:
        break;
    }

    throw new Error('illegal error correct level: ' + level);
  }

  RSBlock.getRSBlocks = function(version, level) {
    var rsBlock = getRsBlockTable(version, level);
    var length = rsBlock.length / 3;
    var list = [];
    var count;
    var totalCount;
    var dataCount;
    var j;

    for (var i = 0; i < length; i++) {
      count = rsBlock[i * 3];
      totalCount = rsBlock[i * 3 + 1];
      dataCount = rsBlock[i * 3 + 2];

      for (j = 0; j < count; j++) {
        list.push(new RSBlock(totalCount, dataCount));
      }
    }

    return list;
  };

  RSBlock.prototype = {
    getDataCount: function() {
      return this.dataCount;
    },
    getTotalCount: function() {
      return this.totalCount;
    }
  };

  var EXP_TABLE = [];
  var LOG_TABLE = [];

  (function() {
    var i;

    for (i = 0; i < 256; i++) {
      EXP_TABLE.push(
        i < 8 ? 1 << i :
        EXP_TABLE[i - 4] ^
        EXP_TABLE[i - 5] ^
        EXP_TABLE[i - 6] ^
        EXP_TABLE[i - 8]
      );
      LOG_TABLE.push(0);
    }

    for (i = 0; i < 255; i++) {
      LOG_TABLE[EXP_TABLE[i]] = i;
    }
  }());

  function glog(n) {
    if (n < 1) {
      throw new Error('illegal mode log table: ' + n);
    }

    return LOG_TABLE[n];
  }

  function gexp(n) {
    while (n < 0) {
      n += 255;
    }

    while (n >= 256) {
      n -= 255;
    }

    return EXP_TABLE[n];
  }

  function BitBuffer() {
    var context = this;

    context.buffer = [];
    context.length = 0;
  }

  BitBuffer.prototype = {
    getBuffer: function() {
      return this.buffer;
    },
    getLengthInBits: function() {
      return this.length;
    },
    toString: function() {
      var buffer = '';
      var context = this;
      var length = context.getLengthInBits();

      for (var i = 0; i < length; i++) {
        buffer += context.getBit(i) ? '1' : '0';
      }

      return buffer;
    },
    getBit: function(index) {
      return (this.buffer[~~(index / 8)] >>> (7 - index % 8)) & 1 === 1;
    },
    put: function(num, length) {
      for (var i = 0; i < length; i++) {
        this.putBit((num >>> (length - i - 1)) & 1 === 1);
      }
    },
    putBit: function(bit) {
      var context = this;
      var length = context.getLengthInBits();

      if (length === context.buffer.length * 8) {
        context.buffer.push(0);
      }

      if (bit) {
        context.buffer[~~(length / 8)] |= (0x80 >>> (length % 8));
      }

      context.length++;
    }
  };

  function Polynomial(num, shift) {
    shift = shift || 0;

    var offset = 0;
    var context = this;

    while (offset < num.length && num[offset] === 0) {
      offset++;
    }

    context.num = [];

    var i;
    var len = num.length - offset;

    for (i = 0; i < len; i++) {
      context.num.push(num[offset + i]);
    }

    for (i = 0; i < shift; i++) {
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

      for (var i = 0; i < length; i++) {
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

      for (var i = 0; i < length; i++) {
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
      var length = context.getLength() + e.getLength() - 1;

      var i;

      for (i = 0; i < length; i++) {
        num.push(0);
      }

      var j;

      length = context.getLength();

      for (i = 0; i < length; i++) {
        for (j = 0; j < e.getLength(); j++) {
          num[i + j] ^= gexp(glog(context.getAt(i)) + glog(e.getAt(j)));
        }
      }

      return new Polynomial(num);
    },
    mod: function(e) {
      var context = this;
      var length = context.getLength();
      var eLength = e.getLength();

      if (length - eLength < 0) {
        return context;
      }

      var ratio = glog(context.getAt(0)) - glog(e.getAt(0));

      // create copy
      var i;
      var num = [];

      for (i = 0; i < length; i++) {
        num.push(context.getAt(i));
      }

      // subtract and calc rest.
      for (i = 0; i < eLength; i++) {
        num[i] ^= gexp(glog(e.getAt(i)) + ratio);
      }

      // call recursively
      return new Polynomial(num).mod(e);
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
  function inherits(ctor, superCtor, proto) {
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

  function getPatternPosition(version) {
    if (version < 1 || version > PATTERN_POSITION_TABLE.length) {
      throw new Error('illegal version: ' + version);
    }

    return PATTERN_POSITION_TABLE[version - 1];
  }

  function getMaxLength(mode, version, level) {
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
        throw new Error('illegal level:' + level);
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
        throw new Error('illegal mode:' + mode);
    }

    return MAX_LENGTH[t][e][m];
  }

  function getMaskFunc(maskPattern) {
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

  function getLostPoint(qrCode) {
    var row;
    var col;
    var sameCount;
    var dark;
    var r;
    var c;
    var lostPoint = 0;
    var moduleCount = qrCode.getModuleCount();

    // LEVEL1
    for (row = 0; row < moduleCount; row++) {
      for (col = 0; col < moduleCount; col++) {
        sameCount = 0;
        dark = qrCode.isDark(row, col);

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

            if (dark === qrCode.isDark(row + r, col + c)) {
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

        if (qrCode.isDark(row, col)) {
          count++;
        }

        if (qrCode.isDark(row + 1, col)) {
          count++;
        }

        if (qrCode.isDark(row, col + 1)) {
          count++;
        }

        if (qrCode.isDark(row + 1, col + 1)) {
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

    for (col = 0; col < moduleCount; col++) {
      for (row = 0; row < moduleCount - 6; row++) {
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

    for (col = 0; col < moduleCount; col++) {
      for (row = 0; row < moduleCount; row++) {
        if (qrCode.isDark(row, col)) {
          darkCount++;
        }
      }
    }

    var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;

    lostPoint += ratio * 10;

    return lostPoint;
  }

  function getBCHDigit(data) {
    var digit = 0;

    while (data !== 0) {
      digit++;
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

  function getBCHVersion(data) {
    var d = data << 12;

    while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
      d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18)));
    }

    return (data << 12) | d;
  }

  var PAD0 = 0xEC;
  var PAD1 = 0x11;

  function getErrorCorrectPolynomial(errorCorrectLength) {
    var a = new Polynomial([1]);

    for (var i = 0; i < errorCorrectLength; i++) {
      a = a.multiply(new Polynomial([1, gexp(i)]));
    }

    return a;
  }

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

    var data = createNumArray(totalCodeCount);
    var index = 0;

    for (i = 0; i < maxDcCount; i++) {
      for (r = 0; r < rsLength; r++) {
        if (i < dcData[r].length) {
          data[index] = dcData[r][i];
          index++;
        }
      }
    }

    for (i = 0; i < maxEcCount; i++) {
      for (r = 0; r < rsLength; r++) {
        if (i < ecData[r].length) {
          data[index] = ecData[r][i];
          index++;
        }
      }
    }

    return data;
  }

  function createData(version, level, dataArray) {
    var i;
    var data;
    var buffer = new BitBuffer();
    var rsBlocks = RSBlock.getRSBlocks(version, level);

    for (i = 0; i < dataArray.length; i++) {
      data = dataArray[i];

      buffer.put(data.getMode(), 4);
      buffer.put(data.getLength(), data.getLengthInBits(version));
      data.write(buffer);
    }

    // calc max data count
    var totalDataCount = 0;
    var rsLength = rsBlocks.length;

    for (i = 0; i < rsLength; i++) {
      totalDataCount += rsBlocks[i].getDataCount();
    }

    if (buffer.getLengthInBits() > totalDataCount * 8) {
      throw new Error('data length overflow: ' + buffer.getLengthInBits() + ' > ' + totalDataCount * 8);
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

      buffer.put(PAD0, 8);

      if (buffer.getLengthInBits() >= totalDataCount * 8) {
        break;
      }

      buffer.put(PAD1, 8);
    }

    return createBytes(buffer, rsBlocks);
  }

  function stringToUtf8ByteArray(str) {
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

  function QR8BitByte(data) {
    this.source = data;

    QRData.call(this, Mode.MODE_8BIT_BYTE, stringToUtf8ByteArray(data));
  }

  inherits(QR8BitByte, QRData, {
    write: function(buffer) {
      var data = this.getData();
      var length = data.length;

      for (var i = 0; i < length; i++) {
        buffer.put(data[i], 8);
      }
    }
  });

  function QRCode(version, level) {
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

        lostPoint = getLostPoint(context);

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
      context.count = context.version * 4 + 17;
      context.modules = [];

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

      var data = createData(
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
      var maskFunc = getMaskFunc(maskPattern);

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
      var pos = getPatternPosition(context.version);

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
      var bits = getBCHVersion(context.version);

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
      var bits = getBCHTypeInfo(data);

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

  function QRKanji(data) {
    this.source = data;

    QRData.call(this, Mode.MODE_KANJI, stringToUtf8ByteArray(data));
  }

  inherits(QRKanji, QRData, {
    write: function(buffer) {
      var context = this;
      var data = context.getData();

      var c;
      var i = 0;
      var length = data.length;

      while (i + 1 < length) {
        c = ((0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw new Error('illegal char at: ' + (i + 1) + '/' + c);
        }

        c = ((c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < length) {
        throw new Error('illegal char at: ' + (i + 1));
      }
    },
    getLength: function() {
      return this.getData().length / 2;
    }
  });

  function QRNumber(data) {
    this.source = data;

    QRData.call(this, Mode.MODE_NUMBER, data);
  }

  function strToNum(s) {
    var num = 0;

    for (var i = 0; i < s.length; i++) {
      num = num * 10 + chatToNum(s.charAt(i));
    }

    return num;
  }

  function chatToNum(c) {
    if ('0' <= c && c <= '9') {
      return c.charCodeAt(0) - '0'.charCodeAt(0);
    }

    throw new Error('illegal char: ' + c);
  }

  inherits(QRNumber, QRData, {
    write: function(buffer) {
      var data = this.getData();

      var i = 0;
      var length = data.length;

      while (i + 2 < length) {
        buffer.put(strToNum(data.substring(i, i + 3)), 10);

        i += 3;
      }

      if (i < length) {
        if (length - i === 1) {
          buffer.put(strToNum(data.substring(i, i + 1)), 4);
        } else if (length - i === 2) {
          buffer.put(strToNum(data.substring(i, i + 2)), 7);
        }
      }
    }
  });

  function QRAlphaNum(data) {
    this.source = data;

    QRData.call(this, Mode.MODE_8BIT_BYTE, data);
  }

  function getCode(c) {
    if ('0' <= c && c <= '9') {
      return c.charCodeAt(0) - '0'.charCodeAt(0);
    } else if ('A' <= c && c <= 'Z') {
      return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    } else {
      switch (c) {
        case ' ':
          return 36;
        case '$':
          return 37;
        case '%':
          return 38;
        case '*':
          return 39;
        case '+':
          return 40;
        case '-':
          return 41;
        case '.':
          return 42;
        case '/':
          return 43;
        case ':':
          return 44;
        default:
          throw new Error('illegal char: ' + c);
      }
    }
  }

  inherits(QRAlphaNum, QRData, {
    write: function(buffer) {
      var i = 0;
      var s = this.getData();
      var length = s.length;

      while (i + 1 < length) {
        buffer.put(getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)), 11);

        i += 2;
      }

      if (i < length) {
        buffer.put(getCode(s.charAt(i)), 6);
      }
    }
  });

  var encode = {
    MODE: {
      NUMBER: Mode.MODE_NUMBER,
      ALPHANUM: Mode.MODE_ALPHA_NUM,
      EIGHTBIT: Mode.MODE_8BIT_BYTE,
      KANJI: Mode.MODE_KANJI
    },
    ECLEVEL: {
      L: ErrorCorrectLevel.L,
      M: ErrorCorrectLevel.M,
      Q: ErrorCorrectLevel.Q,
      H: ErrorCorrectLevel.H
    },
    Encode: QRCode,
    QRKanji: QRKanji,
    QRNumber: QRNumber,
    QRAlphaNum: QRAlphaNum,
    QR8BitByte: QR8BitByte,
    getMaxLength: getMaxLength
  };

  return encode;

})));
