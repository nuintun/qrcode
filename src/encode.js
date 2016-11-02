/**
 * QRCode Encode
 */

import QRBase from './base';
import ReedSolomon from './reedsolomon';

/**
 * QREncode
 */
function QREncode() {
  this.logger = null; // 调试接口
  this.image = null; // 二维码画布
  this.nModules = 0; // 二维码大小
  this.version = 0; // 二维码版本
  this.functionalGrade = 0;
  this.ECLevel = 0; // 二维码错误等级
  this.mask = 0; // 掩码图片类型
  // this.maskPattern = []; // 掩码图片画布
  this.nDataCodewords = 0; // 数据区
  this.nBlockEcWords = 0; // 不知道怎么命名
  this.blockIndices = []; // 纠错码转换 Map
  this.blockDataLengths = []; // 不知道怎么命名
}

/**
 * QREncode prototype
 */
QREncode.prototype = {
  // 调用入口文件
  encodeToPix: function(mode, text, version, ECLevel) {
    var nModules = QRBase.nModulesFromVersion(version);
    var pix = {};
    var i;

    this.nModules = nModules;

    pix.width = nModules;
    pix.height = nModules;
    pix.arr = [];

    for (i = 0; i < nModules; i++) {
      pix.arr[i] = [];
    }

    pix.setBackground = function() {
      for (i = 0; i < nModules; i++) {
        var j;

        for (j = 0; j < nModules; j++) {
          this.arr[i][j] = false;
        }
      }
    };
    pix.setDark = function(x, y) {
      if (x > nModules - 1 || y > nModules - 1) {
        return;
      }

      this.arr[x][y] = true;
    };
    pix.isDark = function(x, y) {
      if (x > nModules - 1 || y > nModules - 1) {
        return false;
      }

      return pix.arr[x][y];
    };

    this.encodeInit(version, ECLevel, pix);
    this.encodeAddText(mode, text);
    this.encode();

    return pix.arr;
  },
  encodeInit: function(version, ECLevel, canvas) {
    this.version = version;
    this.ECLevel = ECLevel;
    this.image = canvas;
    this.image.setBackground();
    this.bitIdx = 0;

    QRBase.setBlocks(this);

    this.data = [];

    var i;

    for (i = 0; i < this.nDataCodewords; i++) {
      this.data[i] = 0;
    }

    this.pixels = [];

    for (i = 0; i < this.nModules; i++) {
      this.pixels[i] = [];
    }
  },
  encodeAddText: function(mode, text) {
    this.addTextImplementation(mode, text);
  },
  encode: function() {
    // 添加结束符
    this.addTextImplementation(QRBase.MODE.Terminator, null);
    this.appendPadding();
    this.addErrorCorrection();
    this.encodeBestMask();
    this.pixelsToImage();
  },
  addTextImplementation: function(mode, text) {
    // 字符编码
    function appendBits(bytes, pos, len, value) {
      var byteIndex = pos >>> 3;
      var shift = 24 - (pos & 7) - len;
      var v = value << shift;

      bytes[byteIndex + 2] = v & 0xFF;
      v = v >>> 8;
      bytes[byteIndex + 1] = v & 0xFF;
      v = v >>> 8;
      bytes[byteIndex] += v & 0xFF;
    }

    function getAlphaNum(qr, ch) {
      ch = ch.toUpperCase();

      if (!qr.alphanumRev.hasOwnProperty(ch)) {
        QRBase.errorThrow('Invalid character for Alphanumeric encoding [' + ch + ']');
      }

      return qr.alphanumRev[ch];
    }

    function addAlphaNum(qr, text) {
      var n = text.length;
      var nCountBits = QRBase.nCountBits(QRBase.MODE.AlphaNumeric, qr.version);
      var i, val;

      appendBits(qr.data, qr.bitIdx, nCountBits, n);

      qr.bitIdx += nCountBits;

      for (i = 0; i < n - 1; i += 2) {
        val = 45 * getAlphaNum(qr, text[i]) + getAlphaNum(qr, text[i + 1]);

        appendBits(qr.data, qr.bitIdx, 11, val);

        qr.bitIdx += 11;
      }

      if (n % 2) {
        appendBits(qr.data, qr.bitIdx, 6, getAlphaNum(qr, text[n - 1]));

        qr.bitIdx += 6;
      }
    }

    function add8bit(qr, text) {
      var nCountBits = QRBase.nCountBits(QRBase.MODE.EightBit, qr.version);
      var i;

      appendBits(qr.data, qr.bitIdx, nCountBits, text.length);

      qr.bitIdx += nCountBits;

      for (i = 0; i < text.length; i++) {
        appendBits(qr.data, qr.bitIdx, 8, text.charCodeAt(i));

        qr.bitIdx += 8;
      }
    }

    function addNumeric(qr, text) {
      var n = text.length;
      var nCountBits = QRBase.nCountBits(QRBase.MODE.Numeric, qr.version);
      var num = [];
      var val, i, ch;

      appendBits(qr.data, qr.bitIdx, nCountBits, n);

      qr.bitIdx += nCountBits;

      for (i = 0; i < n; i++) {
        ch = text.charCodeAt(i) - 48;

        if ((ch < 0) || (ch > 9)) {
          QRBase.errorThrow('Invalid character for Numeric encoding [' + text[i] + ']');
        }

        num.push(ch);
      }

      for (i = 0; i < n - 2; i += 3) {
        val = 100 * num[i] + 10 * num[i + 1] + num[i + 2];

        appendBits(qr.data, qr.bitIdx, 10, val);

        qr.bitIdx += 10;
      }

      if (n % 3 === 1) {
        val = num[n - 1];

        appendBits(qr.data, qr.bitIdx, 4, val);

        qr.bitIdx += 4;
      } else if (n % 3 === 2) {
        val = 10 * num[n - 2] + num[n - 1];

        appendBits(qr.data, qr.bitIdx, 7, val);

        qr.bitIdx += 7;
      }
    }

    appendBits(this.data, this.bitIdx, 4, mode);

    this.bitIdx += 4;

    if (mode === QRBase.MODE.AlphaNumeric) {
      addAlphaNum(this, text);
    } else if (mode === QRBase.MODE.EightBit) {
      add8bit(this, QRBase.unicodeToUtf8(text));
    } else if (mode === QRBase.MODE.Numeric) {
      addNumeric(this, text);
    } else if (mode === QRBase.MODE.Terminator) {
      return;
    } else {
      QRBase.errorThrow('Unsupported ECI mode: ' + mode);
    }

    if (this.bitIdx / 8 > this.nDataCodewords) {
      QRBase.errorThrow('Text too long for this EC version');
    }
  },
  appendPadding: function() {
    // 添加补齐码
    var i;

    for (i = Math.floor((this.bitIdx - 1) / 8) + 1; i < this.nDataCodewords; i += 2) {
      this.data[i] = 0xEC;
      this.data[i + 1] = 0x11;
    }
  },
  addErrorCorrection: function() {
    // 添加纠错码
    var rs = new ReedSolomon(this.nBlockEcWords);
    var bytes = [];
    var n = 0;
    var b, i, m, bytesIn, bytesOut;

    rs.logger = this.logger;

    for (b = 0; b < this.blockDataLengths.length; b++) {
      m = this.blockDataLengths[b];
      bytesIn = this.data.slice(n, n + m);
      n += m;

      for (i = 0; i < m; i++) {
        bytes[this.blockIndices[b][i]] = bytesIn[i];
      }

      bytesOut = rs.encode(bytesIn);

      for (i = 0; i < bytesOut.length; i++) {
        bytes[this.blockIndices[b][m + i]] = bytesOut[i];
      }
    }

    this.bytes = bytes;
  },

  calculatePenalty: function() {
    // TODO: Verify all penalty calculations
    function penaltyAdjacent(qr) {
      var p = 0;
      var i, j, nDark, nLight, rc;

      for (i = 0; i < qr.nModules; i++) {
        nDark = [0, 0];
        nLight = [0, 0];

        for (rc = 0; rc <= 1; rc++) {
          for (j = 0; j < qr.nModules; j++) {
            if (qr.pixels[rc * i + (1 - rc) * j][(1 - rc) * i + rc * j]) {
              if (nLight[rc] > 5) {
                p += (3 + nLight[rc] - 5);
              }

              nLight[rc] = 0;
              nDark[rc]++;
            } else {
              if (nDark[rc] > 5) {
                p += (3 + nDark[rc] - 5);
              }

              nLight[rc]++;
              nDark[rc] = 0;
            }
          }

          if (nLight[rc] > 5) {
            p += (3 + nLight[rc] - 5);
          }

          if (nDark[rc] > 5) {
            p += (3 + nDark[rc] - 5);
          }
        }
      }

      return p;
    }

    function penaltyBlocks(qr) {
      var p = 0;
      var i, j, b;

      for (i = 0; i < qr.nModules - 1; i++) {
        for (j = 0; j < qr.nModules - 1; j++) {
          b = 0;

          if (qr.pixels[i][j]) {
            b++;
          }

          if (qr.pixels[i + 1][j]) {
            b++;
          }

          if (qr.pixels[i][j + 1]) {
            b++;
          }

          if (qr.pixels[i + 1][j + 1]) {
            b++;
          }

          if ((b === 0) || (b === 4)) {
            p += 3;
          }
        }
      }

      return p;
    }

    function penaltyDarkLight(qr) {
      // We shift bits in one by one, and see if the resulting pattern match the bad one
      var p = 0;
      var bad = (128 - 1 - 2 - 32) << 4; // 4_ : 1D : 1L : 3D : 1L : 1D : 4x
      var badmask1 = 2048 - 1; // 4_ : 1D : 1L : 3D : 1L : 1D : 4L
      var badmask2 = badmask1 << 4; // 4L : 1D : 1L : 3D : 1L : 1D : 4_
      var patmask = 32768 - 1; // 4  +           7            + 4
      var i, j, pat, rc;

      for (i = 0; i < qr.nModules - 1; i++) {
        pat = [0, 0];

        for (j = 0; j < qr.nModules - 1; j++) {
          for (rc = 0; rc <= 1; rc++) {
            pat[rc] = (pat[rc] << 1) & patmask;

            if (qr.pixels[rc * i + (1 - rc) * j][(1 - rc) * i + rc * j]) {
              pat[rc]++;
            }

            if (j >= 7 + 4) {
              if ((pat[rc] & badmask1) === bad) {
                p += 40;
              } else {
                if (j < qr.nModules - 4 - 7) {
                  if ((pat[rc] & badmask2) === bad) {
                    p += 40;
                  }
                }
              }
            }
          }
        }
      }

      return p;
    }

    function penaltyDark(qr) {
      var dark = 0;
      var i, j;

      for (i = 0; i < qr.nModules - 1; i++) {
        for (j = 0; j < qr.nModules - 1; j++) {
          if (qr.pixels[i][j]) {
            dark++;
          }
        }
      }

      return 10 * Math.floor(Math.abs(dark / (qr.nModules * qr.nModules) - 0.5) / 0.05);
    }

    // Calculate penalty
    var pAdjacent = penaltyAdjacent(this);
    var pBlocks = penaltyBlocks(this);
    var pDarkLight = penaltyDarkLight(this);
    var pDark = penaltyDark(this);

    return pAdjacent + pBlocks + pDarkLight + pDark;
  },
  encodeBestMask: function() {
    var bestMask = 0;
    var bestPenalty = 999999;
    var mask, i, j, penalty;

    QRBase.setFunctionalPattern(this);

    for (mask = 0; mask < 8; mask++) {
      for (i = 0; i < this.nModules; i++) {
        for (j = 0; j < this.nModules; j++) {
          this.pixels[i][j] = false;
        }
      }

      this.encodeFunctionalPatterns(mask);
      this.encodeData(mask);

      penalty = this.calculatePenalty(mask);

      if (penalty < bestPenalty) {
        bestPenalty = penalty;
        bestMask = mask;
      }
    }

    this.mask = bestMask;

    if (this.mask !== 7) {
      for (i = 0; i < this.nModules; i++) {
        for (j = 0; j < this.nModules; j++) {
          this.pixels[i][j] = false;
        }
      }

      this.encodeFunctionalPatterns(this.mask);
      this.encodeData(this.mask);
    }
  },

  /**
   * 定位
   */
  encodeFunctionalPatterns: function(mask) {
    function encodeFinderPattern(qr, x, y) {
      var i, j;

      // Outer 7x7 black boundary
      for (i = 0; i <= 5; i++) {
        qr.pixels[x + i][y] = true;
        qr.pixels[x + 6][y + i] = true;
        qr.pixels[x + 6 - i][y + 6] = true;
        qr.pixels[x][y + 6 - i] = true;
      }

      // Inner 3*3 black box
      for (i = 2; i <= 4; i++) {
        for (j = 2; j <= 4; j++) {
          qr.pixels[x + i][y + j] = true;
        }
      }
    }

    function encodeVersionTopright(qr) {
      var pattern = QRBase.versionInfo[qr.version];
      var x, y;

      for (y = 0; y < 6; y++) {
        for (x = qr.nModules - 11; x < qr.nModules - 11 + 3; x++) {
          if (pattern & 1) {
            qr.pixels[x][y] = true;
          }

          pattern /= 2;
        }
      }
    }

    function encodeVersionBottomleft(qr) {
      var pattern = QRBase.versionInfo[qr.version];
      var x, y;

      for (x = 0; x < 6; x++) {
        for (y = qr.nModules - 11; y < qr.nModules - 11 + 3; y++) {
          if (pattern & 1) {
            qr.pixels[x][y] = true;
          }

          pattern /= 2;
        }
      }
    }

    function encodeTimingPattern(qr, horizontal) {
      var i;

      for (i = 8; i < qr.nModules - 8; i += 2) {
        if (horizontal) {
          qr.pixels[i][6] = true;
        } else {
          qr.pixels[6][i] = true;
        }
      }

    }

    function encodeOneAlignmentPattern(qr, x, y) {
      // Outer 5x5 black boundary
      var i;

      for (i = 0; i <= 3; i++) {
        qr.pixels[x + i][y] = true;
        qr.pixels[x + 4][y + i] = true;
        qr.pixels[x + 4 - i][y + 4] = true;
        qr.pixels[x][y + 4 - i] = true;
      }

      // Center black
      qr.pixels[x + 2][y + 2] = true;
    }

    function encodeAlignmentPatterns(qr) {
      var n = QRBase.alignmentPatterns[qr.version].length;
      var i, j;

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
            continue;
          }

          encodeOneAlignmentPattern(
            qr,
            QRBase.alignmentPatterns[qr.version][i] - 2,
            QRBase.alignmentPatterns[qr.version][j] - 2
          );
        }
      }
    }

    function encodeFormatNW(qr, code) {
      var x = 8;
      var y;

      for (y = 0; y <= 5; y++) {
        if (code & 1) {
          qr.pixels[x][y] = true;
        }

        code /= 2;
      }

      if (code & 1) {
        qr.pixels[8][7] = true;
      }

      code /= 2;

      if (code & 1) {
        qr.pixels[8][8] = true;
      }

      code /= 2;

      if (code & 1) {
        qr.pixels[7][8] = true;
      }

      code /= 2;
      y = 8;

      for (x = 5; x >= 0; x--) {
        if (code & 1) {
          qr.pixels[x][y] = true;
        }

        code /= 2;
      }
    }

    function encodeFormatNESW(qr, code) {
      var y = 8;
      var x;

      for (x = qr.nModules - 1; x > qr.nModules - 1 - 8; x--) {
        if (code & 1) {
          qr.pixels[x][y] = true;
        }

        code /= 2;
      }

      x = 8;

      for (y = qr.nModules - 7; y < qr.nModules - 1; y++) {
        if (code & 1) {
          qr.pixels[x][y] = true;
        }

        code /= 2;
      }
    }

    // Encode functional patterns
    encodeFinderPattern(this, 0, 0);
    encodeFinderPattern(this, 0, this.nModules - 7);
    encodeFinderPattern(this, this.nModules - 7, 0);

    if (this.version >= 7) {
      encodeVersionTopright(this);
      encodeVersionBottomleft(this);
    }

    encodeTimingPattern(this, true);
    encodeTimingPattern(this, false);

    if (this.version > 1) {
      encodeAlignmentPatterns(this);
    }

    var code = QRBase.formatInfo[mask + 8 * this.ECLevel];

    // 版本信息
    encodeFormatNW(this, code);
    encodeFormatNESW(this, code);
  },
  encodeData: function(qrmask) {
    function setMasked(pixels, mask, j, i, f) {
      var m;

      switch (mask) {
        case 0:
          m = (i + j) % 2;
          break;
        case 1:
          m = i % 2;
          break;
        case 2:
          m = j % 3;
          break;
        case 3:
          m = (i + j) % 3;
          break;
        case 4:
          m = (Math.floor(i / 2) + Math.floor(j / 3)) % 2;
          break;
        case 5:
          m = (i * j) % 2 + (i * j) % 3;
          break;
        case 6:
          m = ((i * j) % 2 + (i * j) % 3) % 2;
          break;
        case 7:
          m = ((i + j) % 2 + (i * j) % 3) % 2;
          break;
      }

      if (m === 0) {
        pixels[j][i] = !f;
      } else {
        pixels[j][i] = f;
      }
    }

    // Encode data
    var writingUp = true;
    var n = 0;
    var v = this.bytes[n];
    var bitsWritten = 0;
    var mask = (1 << 7);
    var i, j;
    var count;
    var col;

    // Write columns in pairs, from right to left
    for (j = this.nModules - 1; j > 0; j -= 2) {
      if (j === 6) {
        // Skip whole column with vertical alignment pattern;
        // Saves time and makes the other code proceed more cleanly
        j--;
      }

      // Read alternatingly from bottom to top then top to bottom
      for (count = 0; count < this.nModules; count++) {
        i = writingUp ? this.nModules - 1 - count : count;

        for (col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!this.functionalPattern[j - col][i]) {
            setMasked(this.pixels, qrmask, j - col, i, v & mask);

            mask = (mask >>> 1);
            bitsWritten++;

            if (bitsWritten === 8) {
              bitsWritten = 0;
              mask = (1 << 7);
              n++;
              v = this.bytes[n];
            }
          }
        }
      }

      // writingUp = !writingUp; // switch directions
      writingUp ^= true;
    }
  },
  pixelsToImage: function() {
    var i, j;

    for (i = 0; i < this.nModules; i++) {
      for (j = 0; j < this.nModules; j++) {
        if (this.pixels[i][j]) { this.setDark(i, j); }
      }
    }
  },
  getDataCapacity: function(version, ECLevel, mode) {
    var nCodewords = QRBase.nCodewords[version];
    var nECCodewords = QRBase.nECCodewords[version][ECLevel];
    var nDataCodewords = nCodewords - nECCodewords;
    var bits = 8 * nDataCodewords;
    var cap = 0;

    // Mode
    bits -= 4;
    bits -= QRBase.nCountBits(mode, version);

    if (mode === QRBase.MODE.AlphaNumeric) {
      cap = Math.floor(bits / 11) * 2;

      if (bits >= (cap / 2) * 11 + 6) {
        cap++;
      }
    } else if (mode === QRBase.MODE.EightBit) {
      cap = Math.floor(bits / 8);
    } else if (mode === QRBase.MODE.Numeric) {
      cap = Math.floor(bits / 10) * 3;
      if (bits >= (cap / 3) * 10 + 4) {
        if (bits >= (cap / 3) * 10 + 7) {
          cap++;
        }

        cap++;
      }
    } else {
      QRBase.errorThrow('Unsupported ECI mode: ' + mode);
    }

    return cap;
  },

  getVersionFromLength: function(ECLevel, mode, text) {
    var v;
    var length = QRBase.unicodeToUtf8(text).length;

    for (v = 1; v <= 40; v++) {
      if (this.getDataCapacity(v, ECLevel, mode) >= length) {
        return v;
      }
    }

    QRBase.errorThrow('Text is too long, even for a version 40 QR Code');
  },
  setDark: function(x, y) {
    this.image.setDark(x, y);
  },
  alphanumRev: {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    'A': 10,
    'B': 11,
    'C': 12,
    'D': 13,
    'E': 14,
    'F': 15,
    'G': 16,
    'H': 17,
    'I': 18,
    'J': 19,
    'K': 20,
    'L': 21,
    'M': 22,
    'N': 23,
    'O': 24,
    'P': 25,
    'Q': 26,
    'R': 27,
    'S': 28,
    'T': 29,
    'U': 30,
    'V': 31,
    'W': 32,
    'X': 33,
    'Y': 34,
    'Z': 35,
    ' ': 36,
    '$': 37,
    '%': 38,
    '*': 39,
    '+': 40,
    '-': 41,
    '.': 42,
    '/': 43,
    ':': 44
  }
};

export default { Encode: QREncode }
