/**
 * QRCode Encode
 */
'use strict';

function QREncode(){
  this.image = null; // 二维码画布
  this.nModules = 0; // 二维码大小
  this.version = 0; // 二维码版本
  this.functionalGrade = 0;
  this.ECLevel = 0; // 二维码错误等级
  this.mask = 0; // 掩码图片类型
  this.maskPattern = []; // 掩码图片画布
  this.nDataCodewords = 0; // 数据区
  this.nBlockEcWords = 0;
  this.blockIndices = []; // 纠错码转换 Map
  this.blockDataLengths = [];
}

QREncode.prototype = {
  /**
   * 调用入口文件
   * Encode text into a QR Code in a pixel array
   * @param mode      Mode according to ISO/IEC 18004:2006(E) Section 6.3
   * @param text      The text to be encoded
   * @param version   Version according to ISO/IEC 18004:2006(E) Section 5.3.1
   * @param ECLevel  Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
   */
  encodeToPix: function (mode, text, version, ECLevel){
    var nModules = QRBase.nModulesFromVersion(version),
      pix = {},
      i;

    this.nModules = nModules;
    pix.width = nModules;
    pix.height = nModules;
    pix.arr = [];

    for (i = 0; i < nModules; i++) {
      pix.arr[i] = [];
    }

    pix.setBackground = function (){
      for (i = 0; i < nModules; i++) {
        var j;

        for (j = 0; j < nModules; j++) {
          this.arr[i][j] = false;
        }
      }
    };

    pix.setDark = function (x, y){
      if (x > nModules - 1 || y > nModules - 1) {
        return;
      }

      this.arr[x][y] = true;
    };

    pix.isDark = function (x, y){
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
  /**
   * Prepare for encoding text to QR Code
   * @param version       Version according to ISO/IEC 18004:2006(E) Section 5.3.1
   * @param ECLevel      Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
   * @param canvas        Canvas or pixel array
   */
  encodeInit: function (version, ECLevel, canvas){
    var i;

    this.version = version;
    this.ECLevel = ECLevel;
    this.image = canvas;
    this.image.setBackground();
    this.bitIdx = 0;

    QRBase.setBlocks(this);

    this.data = [];

    for (i = 0; i < this.nDataCodewords; i++) {
      this.data[i] = 0;
    }

    this.pixels = [];

    for (i = 0; i < this.nModules; i++) {
      this.pixels[i] = [];
    }
  },
  /**
   * Add text to a QR code
   * @param mode  Mode according to ISO/IEC 18004:2006(E) Section 6.3
   * @param text  The text to be encoded
   */
  encodeAddText: function (mode, text){
    this.addTextImplementation(mode, text);
  },
  /**
   * Encode this class to an image/canvas.
   */
  encode: function (){
    this.addTextImplementation(QRBase.MODE.Terminator, null); // 添加结束符
    this.appendPadding();
    this.addErrorCorrection();
    this.encodeBestMask();
    this.pixelsToImage();
  },
  /**
   * QRCode internal encoding functions
   */
  addTextImplementation: function (mode, text){
    // 字符编码
    function appendBits(bytes, pos, len, value){
      var byteIndex = pos >>> 3,
        shift = 24 - (pos & 7) - len,
        v = value << shift;

      bytes[byteIndex + 2] = v & 0xFF;
      v = v >>> 8;
      bytes[byteIndex + 1] = v & 0xFF;
      v = v >>> 8;
      bytes[byteIndex] += v & 0xFF;
    }

    function getAlphaNum(qr, ch){
      ch = ch.toUpperCase();

      if (!qr.alphanumRev.hasOwnProperty(ch)) {
        throw new QRBase.QRError('Invalid character for Alphanumeric encoding [' + ch + ']', 3, ch);
      }

      return qr.alphanumRev[ch];
    }

    function addAlphaNum(qr, text){
      var n = text.length,
        nCountBits = QRBase.nCountBits(QRBase.MODE.AlphaNumeric, qr.version),
        i, val;

      appendBits(qr.data, qr.bitIdx, nCountBits, n);
      qr.bitIdx += nCountBits;

      for (i = 0; i < n - 1; i += 2) {
        val = 45 * getAlphaNum(qr, text.substr(i, 1)) + getAlphaNum(qr, text.substr(i + 1, 1));
        appendBits(qr.data, qr.bitIdx, 11, val);
        qr.bitIdx += 11;
      }

      if (n % 2) {
        appendBits(qr.data, qr.bitIdx, 6, getAlphaNum(qr, text.substr(n - 1, 1)));
        qr.bitIdx += 6;
      }
    }

    function add8bit(qr, text){
      var nCountBits = QRBase.nCountBits(QRBase.MODE.EightBit, qr.version),
        i;

      appendBits(qr.data, qr.bitIdx, nCountBits, text.length);
      qr.bitIdx += nCountBits;

      for (i = 0; i < text.length; i++) {
        appendBits(qr.data, qr.bitIdx, 8, text.substr(i, 1).charCodeAt());
        qr.bitIdx += 8;
      }
    }

    function addNumeric(qr, text){
      var item,
        n = text.length,
        nCountBits = QRBase.nCountBits(QRBase.MODE.Numeric, qr.version),
        num = [], val, i, ch;

      appendBits(qr.data, qr.bitIdx, nCountBits, n);
      qr.bitIdx += nCountBits;

      for (i = 0; i < n; i++) {
        item = text.substr(i, 1);
        ch = item.charCodeAt() - 48;

        if ((ch < 0) || (ch > 9)) {
          throw new QRBase.QRError('Invalid character for Numeric encoding [' + item + ']', 4, item);
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

    // addTextImplementation
    appendBits(this.data, this.bitIdx, 4, mode);
    this.bitIdx += 4;

    if (mode === QRBase.MODE.AlphaNumeric) { addAlphaNum(this, text); }
    else if (mode === QRBase.MODE.EightBit) { add8bit(this, QRBase.unicodeToUtf8(text)); }
    else if (mode === QRBase.MODE.Numeric) { addNumeric(this, text); }
    else if (mode === QRBase.MODE.Terminator) { return; }
    else { throw new QRBase.QRError('Unsupported ECI mode: ' + mode, 1, mode); }

    if (this.bitIdx / 8 > this.nDataCodewords) {
      throw new QRBase.QRError('Text too long for this EC version', 5);
    }
  },
  appendPadding: function (){
    // 添加补齐码
    var i;

    for (i = Math.floor((this.bitIdx - 1) / 8) + 1; i < this.nDataCodewords; i += 2) {
      this.data[i] = 0xEC;
      this.data[i + 1] = 0x11;
    }
  },
  addErrorCorrection: function (){
    // 添加纠错码
    var rs = new ReedSolomon(this.nBlockEcWords),
      bytes = [],
      n = 0,
      b, i, m, bytesIn, bytesOut;

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
  calculatePenalty: function (){
    // TODO: Verify all penalty calculations
    function penaltyAdjacent(qr){
      var p = 0,
        i, j, nDark, nLight, rc;

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

    function penaltyBlocks(qr){
      // Not clear from ISO standard, if blocks have to be rectangular?
      // Here we give 3 penalty to every 2x2 block, so odd shaped areas will have penalties as well as rectangles
      var p = 0,
        i, j, b;

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

    function penaltyDarkLight(qr){
      // we shift bits in one by one, and see if the resulting pattern match the bad one
      var p = 0,
        bad = (128 - 1 - 2 - 32) << 4, // 4_ : 1D : 1L : 3D : 1L : 1D : 4x
        badmask1 = 2048 - 1,           // 4_ : 1D : 1L : 3D : 1L : 1D : 4L
        badmask2 = badmask1 << 4,      // 4L : 1D : 1L : 3D : 1L : 1D : 4_
        patmask = 32768 - 1,           // 4  +           7            + 4
        i, j, pat, rc;

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

    function penaltyDark(qr){
      var dark = 0,
        i, j;

      for (i = 0; i < qr.nModules - 1; i++) {
        for (j = 0; j < qr.nModules - 1; j++) {
          if (qr.pixels[i][j]) {
            dark++;
          }
        }
      }

      return 10 * Math.floor(Math.abs(dark / (qr.nModule * qr.nModules) - 0.5) / 0.05);
    }

    // calculatePenalty
    var pAdjacent = penaltyAdjacent(this),
      pBlocks = penaltyBlocks(this),
      pDarkLight = penaltyDarkLight(this),
      pDark = penaltyDark(this);

    return pAdjacent + pBlocks + pDarkLight + pDark;
  },
  encodeBestMask: function (){
    var bestMask = 0,
      bestPenalty = 999999,
      mask, i, j, penalty;

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
  encodeFunctionalPatterns: function (mask){
    function encodeFinderPattern(qr, x, y){
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

    function encodeVersionTopright(qr){
      var pattern = QRBase.versionInfo[qr.version],
        x, y;

      for (y = 0; y < 6; y++) {
        for (x = qr.nModules - 11; x < qr.nModules - 11 + 3; x++) {
          if (pattern & 1) {
            qr.pixels[x][y] = true;
          }

          pattern /= 2;
        }
      }
    }

    function encodeVersionBottomleft(qr){
      var pattern = QRBase.versionInfo[qr.version],
        x, y;

      for (x = 0; x < 6; x++) {
        for (y = qr.nModules - 11; y < qr.nModules - 11 + 3; y++) {
          if (pattern & 1) {
            qr.pixels[x][y] = true;
          }

          pattern /= 2;
        }
      }
    }

    function encodeTimingPattern(qr, horizontal){
      var i;

      for (i = 8; i < qr.nModules - 8; i += 2) {
        if (horizontal) {
          qr.pixels[i][6] = true;
        } else {
          qr.pixels[6][i] = true;
        }
      }

    }

    function encodeOneAlignmentPattern(qr, x, y){
      // Outer 5x5 black boundary
      var i;

      for (i = 0; i <= 3; i++) {
        qr.pixels[x + i][y] = true;
        qr.pixels[x + 4][y + i] = true;
        qr.pixels[x + 4 - i][y + 4] = true;
        qr.pixels[x][y + 4 - i] = true;
      }

      // center black
      qr.pixels[x + 2][y + 2] = true;
    }

    function encodeAlignmentPatterns(qr){
      var n = QRBase.alignmentPatterns[qr.version].length,
        i, j;

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

    function encodeFormatNW(qr, code){
      var x = 8,
        y;

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

    function encodeFormatNESW(qr, code){
      var y = 8,
        x;

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

    // encodeFunctionalPatterns
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
    encodeFormatNW(this, code); // 版本信息
    encodeFormatNESW(this, code);
  },
  encodeData: function (qrmask){
    function setMasked(pixels, mask, j, i, f){
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

    // encodeData
    var writingUp = true,
      n = 0,
      v = this.bytes[n],
      bitsWritten = 0,
      mask = (1 << 7),
      i, j,
      count,
      col;

    // Write columns in pairs, from right to left
    for (j = this.nModules - 1; j > 0; j -= 2) {
      if (j === 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
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

      writingUp ^= true; // switch directions, or can use: writingUp = !writingUp;
    }

  },
  pixelsToImage: function (){
    var i, j;

    for (i = 0; i < this.nModules; i++) {
      for (j = 0; j < this.nModules; j++) {
        if (this.pixels[i][j]) { this.setDark(i, j); }
      }
    }
  },
  getDataCapacity: function (version, ECLevel, mode){
    var nCodewords = QRBase.nCodewords[version],
      nECCodewords = QRBase.nECCodewords[version][ECLevel],
      nDataCodewords = nCodewords - nECCodewords,
      bits = 8 * nDataCodewords,
      cap = 0;

    bits -= 4;    // mode
    bits -= QRBase.nCountBits(mode, version);

    if (mode === QRBase.MODE.AlphaNumeric) {
      cap = Math.floor(bits / 11) * 2;

      if (bits >= (cap / 2) * 11 + 6) { cap++; }
    } else if (mode === QRBase.MODE.EightBit) {
      cap = Math.floor(bits / 8);
    } else if (mode === QRBase.MODE.Numeric) {
      cap = Math.floor(bits / 10) * 3;

      if (bits >= (cap / 3) * 10 + 4) {
        if (bits >= (cap / 3) * 10 + 7) { cap++; }
        cap++;
      }
    } else {
      throw new QRBase.QRError('Unsupported ECI mode: ' + mode, 1, mode);
    }

    return cap;
  },
  getVersionFromLength: function (ECLevel, mode, text){
    var v,
      length = QRBase.unicodeToUtf8(text).length;

    for (v = 1; v <= 40; v++) {
      if (this.getDataCapacity(v, ECLevel, mode) >= length) {
        return v;
      }
    }

    throw new QRBase.QRError('Text is too long, even for a version 40 QR Code', 2);
  },
  setDark: function (x, y){
    this.image.setDark(x, y);
  },
  /**
   * QRCode encode constants
   */
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