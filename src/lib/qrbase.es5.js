/**
 * QRCode Base
 */
'use strict';

var QRBase = {
  /**
   * 编码格式
   */
  MODE: {
    Numeric: 1,
    AlphaNumeric: 2,
    EightBit: 4,
    Terminator: 0
  },
  /**
   * 纠错等级
   */
  ERROR_CORRECTION_LEVEL: {
    L: 1, //  7%
    M: 0, // 15%
    Q: 3, // 25%
    H: 2  // 30%
  },
  /**
   * 二维码异常
   * @param message 错误消息
   * @param errorCode 错误码
   * @param errorData 错误数据
   * @constructor QRError
   */
  QRError: function (message, errorCode, errorData){
    this.message = message;
    this.errorCode = errorCode;
    this.errorData = errorData;
  },
  setBlocks: function (qr){
    var nCodewords = this.nCodewords[qr.version],
      nECCodewords = this.nECCodewords[qr.version][qr.ECLevel],
      ECBlocks = this.ECBlocks[qr.version][qr.ECLevel],
      nBlocks,
      nBlocksFirst,
      nBlocksSecond,
      nBlockWordsFirst,
      nBlockWordsSecond,
      i, b, w = 0;

    qr.nDataCodewords = nCodewords - nECCodewords;

    if (ECBlocks.length === 1) {
      nBlocksFirst = ECBlocks[0];
      nBlocksSecond = 0;
      nBlocks = nBlocksFirst;
      nBlockWordsFirst = qr.nDataCodewords / nBlocks;
      nBlockWordsSecond = 0;
    } else {
      nBlocksFirst = ECBlocks[0];
      nBlocksSecond = ECBlocks[1];
      nBlocks = nBlocksFirst + nBlocksSecond;
      nBlockWordsFirst = Math.floor(qr.nDataCodewords / nBlocks);
      nBlockWordsSecond = nBlockWordsFirst + 1;
    }

    qr.nBlockEcWords = nECCodewords / nBlocks;
    qr.blockDataLengths = [];

    for (b = 0; b < nBlocksFirst; b++) {
      qr.blockDataLengths[b] = nBlockWordsFirst;
    }

    for (b = nBlocksFirst; b < nBlocks; b++) {
      qr.blockDataLengths[b] = nBlockWordsSecond;
    }

    qr.blockIndices = [];

    for (b = 0; b < nBlocks; b++) {
      qr.blockIndices[b] = [];
    }

    for (i = 0; i < nBlockWordsFirst; i++) {
      for (b = 0; b < nBlocks; b++) {
        qr.blockIndices[b].push(w);
        w++;
      }
    }

    for (b = nBlocksFirst; b < nBlocks; b++) {
      qr.blockIndices[b].push(w);
      w++;
    }

    for (i = 0; i < qr.nBlockEcWords; i++) {
      for (b = 0; b < nBlocks; b++) {
        qr.blockIndices[b].push(w);
        w++;
      }
    }
  },
  setFunctionalPattern: function (qr){
    var x, y;

    function markSquare(qr, x, y, w, h){
      var i, j;
      for (i = x; i < x + w; i++) {
        for (j = y; j < y + h; j++) {
          qr.functionalPattern[i][j] = true;
        }
      }
    }

    function markAlignment(qr, qrbase){
      var n = qrbase.alignmentPatterns[qr.version].length,
        i, j;
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
            continue;
          }

          markSquare(qr,
            qrbase.alignmentPatterns[qr.version][i] - 2,
            qrbase.alignmentPatterns[qr.version][j] - 2,
            5, 5);
        }
      }
    }

    // setFunctionalPattern
    qr.functionalPattern = [];

    for (x = 0; x < qr.nModules; x++) {
      qr.functionalPattern[x] = [];

      for (y = 0; y < qr.nModules; y++) {
        qr.functionalPattern[x][y] = false;
      }
    }

    // Finder and Format
    markSquare(qr, 0, 0, 9, 9);
    markSquare(qr, qr.nModules - 8, 0, 8, 9);
    markSquare(qr, 0, qr.nModules - 8, 9, 8);

    // Timing
    markSquare(qr, 8, 6, qr.nModules - 8 - 8, 1);
    markSquare(qr, 6, 8, 1, qr.nModules - 8 - 8);

    // Alignment
    markAlignment(qr, this);

    // Version
    if (qr.version >= 7) {
      markSquare(qr, 0, qr.nModules - 11, 6, 3);
      markSquare(qr, qr.nModules - 11, 0, 3, 6);
    }
  },
  /**
   * 计算数据长度的编码字节数
   */
  nCountBits: function (mode, version){
    if (mode === this.MODE.EightBit) {
      if (version < 10) {
        return 8;
      } else {
        return 16;
      }
    } else if (mode === this.MODE.AlphaNumeric) {
      if (version < 10) {
        return 9;
      } else if (version < 27) {
        return 11;
      } else {
        return 13;
      }
    } else if (mode === this.MODE.Numeric) {
      if (version < 10) {
        return 10;
      } else if (version < 27) {
        return 12;
      } else {
        return 14;
      }
    }

    throw new this.QRError('Internal error: Unknown mode: ' + mode, 0, mode);
  },
  /**
   * 从版本计算二维码宽度
   */
  nModulesFromVersion: function (version){
    return 17 + 4 * version;
  },
  /**
   * UTF-8 和 Unicode 的相互转换
   */
  unicodeToUtf8: function (string){
    var out = '',
      len = string.length,
      i, c;

    for (i = 0; i < len; i++) {
      c = string.charCodeAt(i);

      if ((c >= 0x0001) && (c <= 0x007F)) {
        out += string.charAt(i);
      } else if (c > 0x07FF) {
        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
      } else {
        out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
      }
    }

    return out;
  },
  utf8Tounicode: function (string){
    var out = '',
      len = string.length,
      i = 0,
      mark, char1, char2, char3;

    while (i < len) {
      char1 = string.charCodeAt(i++);
      mark = char1 >> 4;

      if (mark <= 7) {
        // 0xxxxxxx
        out += string.charAt(i - 1);
      } else if (mark === 12 || mark === 13) {
        // 110x xxxx   10xx xxxx
        char2 = string.charCodeAt(i++);
        out += String.fromCharCode(((char1 & 0x1F) << 6) | (char2 & 0x3F));
      } else if (mark === 14) {
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = string.charCodeAt(i++);
        char3 = string.charCodeAt(i++);
        out += String.fromCharCode(((char1 & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
      }
    }

    return out;
  },
  /**
   * QRCode constants
   */
  alignmentPatterns: [
    null,
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
  ],
  versionInfo: [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0x07C94,
    0x085BC,
    0x09A99,
    0x0A4D3,
    0x0BBF6,
    0x0C762,
    0x0D847,
    0x0E60D,
    0x0F928,
    0x10B78,
    0x1145D,
    0x12A17,
    0x13532,
    0x149A6,
    0x15683,
    0x168C9,
    0x177EC,
    0x18EC4,
    0x191E1,
    0x1AFAB,
    0x1B08E,
    0x1CC1A,
    0x1D33F,
    0x1ED75,
    0x1F250,
    0x209D5,
    0x216F0,
    0x228BA,
    0x2379F,
    0x24B0B,
    0x2542E,
    0x26A64,
    0x27541,
    0x28C69
  ],
  formatInfo: [
    0x5412,
    0x5125,
    0x5E7C,
    0x5B4B,
    0x45F9,
    0x40CE,
    0x4F97,
    0x4AA0,
    0x77C4,
    0x72F3,
    0x7DAA,
    0x789D,
    0x662F,
    0x6318,
    0x6C41,
    0x6976,
    0x1689,
    0x13BE,
    0x1CE7,
    0x19D0,
    0x0762,
    0x0255,
    0x0D0C,
    0x083B,
    0x355F,
    0x3068,
    0x3F31,
    0x3A06,
    0x24B4,
    0x2183,
    0x2EDA,
    0x2BED
  ],
  /**
   * 每个版本容纳的字节数
   */
  nCodewords: [
    0,
    26,
    44,
    70,
    100,
    134,
    172,
    196,
    242,
    292,
    346,
    404,
    466,
    532,
    581,
    655,
    733,
    815,
    901,
    991,
    1085,
    1156,
    1258,
    1364,
    1474,
    1588,
    1706,
    1828,
    1921,
    2051,
    2185,
    2323,
    2465,
    2611,
    2761,
    2876,
    3034,
    3196,
    3362,
    3532,
    3706
  ],
  nECCodewords: [
    null,
    [10, 7, 17, 13],
    [16, 10, 28, 22],
    [26, 15, 44, 36],
    [36, 20, 64, 52],
    [48, 26, 88, 72],
    [64, 36, 112, 96],
    [72, 40, 130, 108],
    [88, 48, 156, 132],
    [110, 60, 192, 160],
    [130, 72, 224, 192],
    [150, 80, 264, 224],
    [176, 96, 308, 260],
    [198, 104, 352, 288],
    [216, 120, 384, 320],
    [240, 132, 432, 360],
    [280, 144, 480, 408],
    [308, 168, 532, 448],
    [338, 180, 588, 504],
    [364, 196, 650, 546],
    [416, 224, 700, 600],
    [442, 224, 750, 644],
    [476, 252, 816, 690],
    [504, 270, 900, 750],
    [560, 300, 960, 810],
    [588, 312, 1050, 870],
    [644, 336, 1110, 952],
    [700, 360, 1200, 1020],
    [728, 390, 1260, 1050],
    [784, 420, 1350, 1140],
    [812, 450, 1440, 1200],
    [868, 480, 1530, 1290],
    [924, 510, 1620, 1350],
    [980, 540, 1710, 1440],
    [1036, 570, 1800, 1530],
    [1064, 570, 1890, 1590],
    [1120, 600, 1980, 1680],
    [1204, 630, 2100, 1770],
    [1260, 660, 2220, 1860],
    [1316, 720, 2310, 1950],
    [1372, 750, 2430, 2040]
  ],
  ECBlocks: [
    [],
    [
      [1],
      [1],
      [1],
      [1]
    ],
    [
      [1],
      [1],
      [1],
      [1]
    ],
    [
      [1],
      [1],
      [2],
      [2]
    ],
    [
      [2],
      [1],
      [4],
      [2]
    ],
    [
      [2],
      [1],
      [2, 2],
      [2, 2]
    ],
    [
      [4],
      [2],
      [4],
      [4]
    ],
    [
      [4],
      [2],
      [4, 1],
      [2, 4]
    ],
    [
      [2, 2],
      [2],
      [4, 2],
      [4, 2]
    ],
    [
      [3, 2],
      [2],
      [4, 4],
      [4, 4]
    ],
    [
      [4, 1],
      [2, 2],
      [6, 2],
      [6, 2]
    ],
    [
      [1, 4],
      [4],
      [3, 8],
      [4, 4]
    ],
    [
      [6, 2],
      [2, 2],
      [7, 4],
      [4, 6]
    ],
    [
      [8, 1],
      [4],
      [12, 4],
      [8, 4]
    ],
    [
      [4, 5],
      [3, 1],
      [11, 5],
      [11, 5]
    ],
    [
      [5, 5],
      [5, 1],
      [11, 7],
      [5, 7]
    ],
    [
      [7, 3],
      [5, 1],
      [3, 13],
      [15, 2]
    ],
    [
      [10, 1],
      [1, 5],
      [2, 17],
      [1, 15]
    ],
    [
      [9, 4],
      [5, 1],
      [2, 19],
      [17, 1]
    ],
    [
      [3, 11],
      [3, 4],
      [9, 16],
      [17, 4]
    ],
    [
      [3, 13],
      [3, 5],
      [15, 10],
      [15, 5]
    ],
    [
      [17],
      [4, 4],
      [19, 6],
      [17, 6]
    ],
    [
      [17],
      [2, 7],
      [34],
      [7, 16]
    ],
    [
      [4, 14],
      [4, 5],
      [16, 14],
      [11, 14]
    ],
    [
      [6, 14],
      [6, 4],
      [30, 2],
      [11, 16]
    ],
    [
      [8, 13],
      [8, 4],
      [22, 13],
      [7, 22]
    ],
    [
      [19, 4],
      [10, 2],
      [33, 4],
      [28, 6]
    ],
    [
      [22, 3],
      [8, 4],
      [12, 28],
      [8, 26]
    ],
    [
      [3, 23],
      [3, 10],
      [11, 31],
      [4, 31]
    ],
    [
      [21, 7],
      [7, 7],
      [19, 26],
      [1, 37]
    ],
    [
      [19, 10],
      [5, 10],
      [23, 25],
      [15, 25]
    ],
    [
      [2, 29],
      [13, 3],
      [23, 28],
      [42, 1]
    ],
    [
      [10, 23],
      [17],
      [19, 35],
      [10, 35]
    ],
    [
      [14, 21],
      [17, 1],
      [11, 46],
      [29, 19]
    ],
    [
      [14, 23],
      [13, 6],
      [59, 1],
      [44, 7]
    ],
    [
      [12, 26],
      [12, 7],
      [22, 41],
      [39, 14]
    ],
    [
      [6, 34],
      [6, 14],
      [2, 64],
      [46, 10]
    ],
    [
      [29, 14],
      [17, 4],
      [24, 46],
      [49, 10]
    ],
    [
      [13, 32],
      [4, 18],
      [42, 32],
      [48, 14]
    ],
    [
      [40, 7],
      [20, 4],
      [10, 67],
      [43, 22]
    ],
    [
      [18, 31],
      [19, 6],
      [20, 61],
      [34, 34]
    ]
  ]
};

// 二维码异常
QRBase.QRError.prototype = new Error();
QRBase.QRError.prototype.name = 'QRError';
QRBase.QRError.prototype.constructor = QRBase.QRError;
