/**
 *QRCode Decode
 */

import QRBase from './base';
import ReedSolomon from './reedsolomon';

/**
 * QRDecode
 */
function QRDecode() {
  this.logger = null;
  this.image = null;
  this.imageTop = 0;
  this.imageBottom = 0;
  this.imageLeft = 0;
  this.imageRight = 0;
  this.nModules = 0;
  this.moduleSize = 0;
  this.version = 0;
  this.functionalGrade = 0;
  this.ECLevel = 0;
  this.mask = 0;
  // this.maskPattern = []; // 掩码图片画布
  this.nBlockEcWords = 0;
  this.blockIndices = [];
  this.blockDataLengths = [];
}

/**
 * QRDecode prototype
 */
QRDecode.prototype = {
  /**
   * 像素解码
   * @param pixel
   * @returns {*}
   */
  decodePixel: function(pixel) {
    this.image = pixel;

    return this.decode();
  },
  /**
   * 图片解码
   * @param imageData
   * @param imageWidth
   * @param imageHeight
   * @returns {*}
   */
  decodeImageData: function(imageData, imageWidth, imageHeight) {
    this.setImageData(imageData, imageWidth, imageHeight);

    return this.decode();
  },
  decodeImageDataInsideBordersWithMaxVersion: function(imageData, imageWidth, imageHeight, left, right, top, bottom, maxVersion) {
    this.setImageData(imageData, imageWidth, imageHeight);
    this.imageLeft = left;
    this.imageRight = right;
    this.imageTop = top;
    this.imageBottom = bottom;
    this.imageSize = ((this.imageRight - this.imageLeft + 1) + (this.imageBottom - this.imageTop + 1)) / 2.0;
    this.maxVersion = maxVersion;

    return this.decodeInsideBordersWithMaxVersion();
  },
  setImageData: function(imageData, imageWidth, imageHeight) {
    imageData.minCol = 255;
    imageData.maxCol = 0;

    var total = 0;
    var x, y, p, v;

    for (x = 0; x < imageWidth; x++) {
      for (y = 0; y < imageHeight; y++) {
        p = x * 4 + y * imageWidth * 4;
        v = 0.30 * imageData.data[p] + 0.59 * imageData.data[p + 1] + 0.11 * imageData.data[p + 2];
        total += v;

        if (v < imageData.minCol) {
          imageData.minCol = v;
        }

        if (v > imageData.maxCol) {
          imageData.maxCol = v;
        }
      }
    }

    if (imageData.maxCol - imageData.minCol < 255 / 10) {
      QRBase.errorThrow('Image does not have enough contrast (this.image_data.min_col=' + imageData.minCol + ' this.image_data.max_col=' + imageData.maxCol + ')');
    }

    imageData.threshold = total / (imageWidth * imageHeight);

    imageData.getGray = function(x, y, d) {
      var n = 0;
      var i, j, p;

      for (i = x; i < x + d; i++) {
        for (j = y; j < y + d; j++) {
          p = i * 4 + j * this.width * 4;
          n = n + 0.30 * this.data[p] + 0.59 * this.data[p + 1] + 0.11 * this.data[p + 2];
        }
      }

      return n / d / d;
    };

    imageData.isDark = function(x, y, d) {
      var g = this.getGray(x, y, d);

      return g < this.threshold;
    };

    this.image = imageData;
  },
  decode: function() {
    this.findImageBorders();
    this.maxVersion = 40;
    this.decodeInsideBordersWithMaxVersion();

    return this.data;
  },
  decodeInsideBordersWithMaxVersion: function() {
    this.findModuleSize();

    QRBase.setFunctionalPattern(this);

    this.extractCodewords();

    QRBase.setBlocks(this);

    this.correctErrors();
    this.extractData();

    return this.data;
  },
  findImageBorders: function() {
    var i, j, n;
    var limit = 7;
    var skewLimit = 2;

    for (i = 0; i < this.image.width; i++) {
      n = 0;

      for (j = 0; j < this.image.height; j++) {
        n = n + this.image.isDark(i, j, 1);
      }

      if (n >= limit) {
        break;
      }
    }

    this.imageLeft = i;

    for (i = this.image.width - 1; i >= 0; i--) {
      n = 0;

      for (j = 0; j < this.image.height; j++) {
        n = n + this.image.isDark(i, j, 1);
      }

      if (n >= limit) {
        break;
      }
    }

    this.imageRight = i;

    for (j = 0; j < this.image.height; j++) {
      n = 0;

      for (i = 0; i < this.image.width; i++) {
        n = n + this.image.isDark(i, j, 1);
      }

      if (n >= limit) {
        break;
      }
    }

    this.imageTop = j;

    for (j = this.image.height - 1; j >= 0; j--) {
      n = 0;

      for (i = 0; i < this.image.width; i++) {
        n = n + this.image.isDark(i, j, 1);
      }

      if (n >= limit) {
        break;
      }
    }

    this.imageBottom = j;

    if ((this.imageRight - this.imageLeft + 1 < 21) || (this.imageBottom - this.imageTop + 1 < 21)) {
      QRBase.errorThrow('Found no image data to decode');
    }

    if (Math.abs((this.imageRight - this.imageLeft) - (this.imageBottom - this.imageTop)) > skewLimit) {
      QRBase.errorThrow('Image data is not rectangular');
    }

    this.imageSize = ((this.imageRight - this.imageLeft + 1) + (this.imageBottom - this.imageTop + 1)) / 2.0;
  },
  findModuleSize: function() {
    /**
     * returns number of matches found
     * perferct is 8*8 = 64
     */
    function matchFinderPattern(qr, x, y, quietX, quietY, moduleSize) {
      var i, j;
      var n = 0;

      // Outer 7x7 black boundary
      for (i = 0; i <= 5; i++) {
        if (qr.isDarkWithSize(x + i, y, moduleSize)) {
          n = n + 1;
        }

        if (qr.isDarkWithSize(x + 6, y + i, moduleSize)) {
          n = n + 1;
        }

        if (qr.isDarkWithSize(x + 6 - i, y + 6, moduleSize)) {
          n = n + 1;
        }

        if (qr.isDarkWithSize(x, y + 6 - i, moduleSize)) {
          n = n + 1;
        }
      }

      // Intermediate 5*5 white
      for (i = 0; i <= 3; i++) {
        if (!qr.isDarkWithSize(x + i + 1, y + 1, moduleSize)) {
          n = n + 1;
        }

        if (!qr.isDarkWithSize(x + 5, y + i + 1, moduleSize)) {
          n = n + 1;
        }

        if (!qr.isDarkWithSize(x + 5 - i, y + 5, moduleSize)) {
          n = n + 1;
        }

        if (!qr.isDarkWithSize(x + 1, y + 5 - i, moduleSize)) {
          n = n + 1;
        }
      }

      // Inner 3*3 black box
      for (i = 0; i <= 2; i++) {
        for (j = 0; j <= 2; j++) {
          if (qr.isDarkWithSize(3 + x, 3 + y, moduleSize)) {
            n = n + 1;
          }
        }
      }

      // quiet area
      for (i = 0; i <= 6; i++) {
        if (!qr.isDarkWithSize(x + quietX, y + i, moduleSize)) {
          n = n + 1;
        }

        if (!qr.isDarkWithSize(x + i, y + quietY, moduleSize)) {
          n = n + 1;
        }
      }

      // "bottom right" quiet area
      if (!qr.isDarkWithSize(x + quietX, y + quietY, moduleSize)) {
        n = n + 1;
      }

      return n;
    }

    function matchTimingPattern(qr, horizontal, nModules, moduleSize) {
      var n = 0;
      var x0 = 6;
      var y0 = 8;
      var dx = 0;
      var dy = 1;
      var consecutive = 5;
      var ok = [];
      var c;
      var black = true;
      var i;
      var x, y;
      var last5;

      if (horizontal) {
        x0 = 8;
        y0 = 6;
        dx = 1;
        dy = 0;
      }

      for (c = 0; c < consecutive; c++) {
        ok.push(1);
      }

      for (i = 0; i < nModules - 8 - 8; i++) {
        x = x0 + i * dx;
        y = y0 + i * dy;

        if (black === qr.isDarkWithSize(x, y, moduleSize)) {
          n++;
          ok.push(1);
        } else {
          ok.push(0);
        }

        black = !black;
        last5 = 0;

        for (c = ok.length - consecutive; c < ok.length - 1; c++) {
          if (ok[c]) {
            last5 = last5 + 1;
          }
        }

        if (last5 < 3) {
          return 0;
        }
      }

      return n;
    }

    function matchOneAlignmentPattern(qr, x, y, moduleSize) {
      var n = 0;
      var i;

      // Outer 5x5 black boundary
      for (i = 0; i <= 3; i++) {
        if (qr.isDarkWithSize(x + i, y, moduleSize)) {
          n = n + 1;
        }

        if (qr.isDarkWithSize(x + 4, y + i, moduleSize)) {
          n = n + 1;
        }

        if (qr.isDarkWithSize(x + 4 - i, y + 4, moduleSize)) {
          n = n + 1;
        }

        if (qr.isDarkWithSize(x, y + 4 - i, moduleSize)) {
          n = n + 1;
        }
      }

      // Intermediate 3*3 white
      for (i = 0; i <= 1; i++) {
        if (!qr.isDarkWithSize(x + i + 1, y + 1, moduleSize)) {
          n = n + 1;
        }

        if (!qr.isDarkWithSize(x + 3, y + i + 1, moduleSize)) {
          n = n + 1;
        }

        if (!qr.isDarkWithSize(x + 3 - i, y + 3, moduleSize)) {
          n = n + 1;
        }

        if (!qr.isDarkWithSize(x + 1, y + 3 - i, moduleSize)) {
          n = n + 1;
        }
      }

      // center black
      if (qr.isDarkWithSize(x + 2, y + 2, moduleSize)) {
        n = n + 1;
      }

      return n;
    }

    function matchAlignmentPatterns(qr, version, moduleSize) {
      var a = 0;
      var n = QRBase.alignmentPatterns[version].length;
      var i, j, na;

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
            continue;
          }

          na = matchOneAlignmentPattern(
            qr,
            QRBase.alignmentPatterns[version][i] - 2,
            QRBase.alignmentPatterns[version][j] - 2,
            moduleSize
          );

          if (na > 24) {
            a++;
          }
        }
      }

      return a;
    }

    function matchVersionCode(qr, pattern) {
      var v, hd;

      for (v = 7; v <= 40; v++) {
        hd = qr.hammingDistance(pattern, QRBase.versionInfo[v]);

        if (hd <= 3) {
          return [v, hd];
        }
      }

      return [0, 4];
    }

    function matchVersionTopright(qr, nModules, moduleSize) {
      var factor = 1;
      var pattern = 0;
      var x, y;

      for (y = 0; y < 6; y++) {
        for (x = nModules - 11; x < nModules - 11 + 3; x++) {
          if (qr.isDarkWithSize(x, y, moduleSize)) {
            pattern += factor;
          }

          factor *= 2;
        }
      }

      return matchVersionCode(qr, pattern);
    }

    function matchVersionBottomleft(qr, nModules, moduleSize) {
      var factor = 1;
      var pattern = 0;
      var x, y;

      for (x = 0; x < 6; x++) {
        for (y = nModules - 11; y < nModules - 11 + 3; y++) {
          if (qr.isDarkWithSize(x, y, moduleSize)) {
            pattern += factor;
          }

          factor *= 2;
        }
      }

      return matchVersionCode(qr, pattern);
    }

    function matchFormatCode(qr, pattern) {
      var f, hd;

      for (f = 0; f < 32; f++) {
        hd = qr.hammingDistance(pattern, QRBase.formatInfo[f]);

        if (hd <= 3) {
          return [f, hd];
        }
      }

      return [0, 4];
    }

    function matchFormatNW(qr, moduleSize) {
      var factor = 1;
      var pattern = 0;
      var x = 8;
      var y;

      for (y = 0; y <= 5; y++) {
        if (qr.isDarkWithSize(x, y, moduleSize)) {
          pattern += factor;
        }

        factor *= 2;
      }

      if (qr.isDarkWithSize(8, 7, moduleSize)) {
        pattern += factor;
      }

      factor *= 2;

      if (qr.isDarkWithSize(8, 8, moduleSize)) {
        pattern += factor;
      }

      factor *= 2;

      if (qr.isDarkWithSize(7, 8, moduleSize)) {
        pattern += factor;
      }

      factor *= 2;
      y = 8;

      for (x = 5; x >= 0; x--) {
        if (qr.isDarkWithSize(x, y, moduleSize)) {
          pattern += factor;
        }

        factor *= 2;
      }

      return matchFormatCode(qr, pattern);
    }

    function matchFormatNESW(qr, nModules, moduleSize) {
      var factor = 1;
      var pattern = 0;
      var x;
      var y = 8;

      for (x = nModules - 1; x > nModules - 1 - 8; x--) {
        if (qr.isDarkWithSize(x, y, moduleSize)) {
          pattern += factor;
        }

        factor *= 2;
      }

      x = 8;

      for (y = nModules - 7; y < nModules - 1; y++) {
        if (qr.isDarkWithSize(x, y, moduleSize)) {
          pattern += factor;
        }

        factor *= 2;
      }

      return matchFormatCode(qr, pattern);
    }

    function gradeFinderPatterns(finderPattern) {
      var g = 4;
      var i;

      for (i = 0; i < 3; i++) {
        g = g - (64 - finderPattern[i]);
      }

      if (g < 0) {
        g = 0;
      }

      return g;
    }

    function gradeTimingPatterns(timingPattern, n) {
      var t = (timingPattern[0] + timingPattern[1]) / (2 * n);

      t = 1 - t;

      if (t >= 0.14) {
        return 0;
      }

      if (t >= 0.11) {
        return 1;
      }

      if (t >= 0.07) {
        return 2;
      }

      if (t >= 0.00001) {
        return 3;
      }

      return 4;
    }

    function gradeAlignmentPatterns(alignmentPatterns, n) {
      var a = alignmentPatterns / n;

      a = 1 - a;

      if (a >= 0.30) {
        return 0;
      }

      if (a >= 0.20) {
        return 1;
      }

      if (a >= 0.10) {
        return 2;
      }

      if (a >= 0.00001) {
        return 3;
      }

      return 4;
    }

    function matchVersion(qr, version) {
      var g;
      var grades = [];
      var nModules = QRBase.nModulesFromVersion(version);
      var moduleSize = qr.imageSize / nModules;
      var finderPattern = [0, 0, 0];
      var versionTopright = [0, 0];
      var versionBottomleft = [0, 0];
      var timingPattern = [0, 0];
      var alignmentPatterns = -3;
      var format = 0;
      var v1, formatNW, formatNESW;
      var ECLevel, mask, grade = 4;
      var i;

      finderPattern[0] = matchFinderPattern(qr, 0, 0, 7, 7, moduleSize);

      if (finderPattern[0] < 64 - 3) {
        // performance hack!
        return [version, 0];
      }

      finderPattern[1] = matchFinderPattern(qr, 0, nModules - 7, 7, -1, moduleSize);

      if (finderPattern[0] + finderPattern[1] < 64 + 64 - 3) {
        // performance hack!
        return [version, 0];
      }

      finderPattern[2] = matchFinderPattern(qr, nModules - 7, 0, -1, 7, moduleSize);
      g = gradeFinderPatterns(finderPattern);

      if (g < 1) {
        return [version, 0];
      } else {
        grades.push(g);
      }

      if (version >= 7) {
        versionTopright = matchVersionTopright(qr, nModules, moduleSize);
        versionBottomleft = matchVersionBottomleft(qr, nModules, moduleSize);
        v1 = version;

        if (versionTopright[1] < versionBottomleft[1]) {
          if (versionTopright[1] < 4) { v1 = versionTopright[0]; }
        } else {
          if (versionBottomleft[1] < 4) { v1 = versionBottomleft[0]; }
        }

        if (v1 !== version) {
          version = v1;
        }

        nModules = QRBase.nModulesFromVersion(version);
        moduleSize = qr.imageSize / nModules;
        g = Math.round(((4 - versionTopright[1]) + (4 - versionBottomleft[1])) / 2);

        if (g < 1) {
          return [version, 0];
        } else {
          grades.push(g);
        }
      }

      timingPattern[0] = matchTimingPattern(qr, true, nModules, moduleSize);
      timingPattern[1] = matchTimingPattern(qr, false, nModules, moduleSize);
      g = gradeTimingPatterns(timingPattern, nModules - 8 - 8);

      if (g < 1) {
        return [version, 0];
      } else {
        grades.push(g);
      }

      if (version > 1) {
        alignmentPatterns = matchAlignmentPatterns(qr, version, moduleSize);
      }

      g = gradeAlignmentPatterns(alignmentPatterns, QRBase.alignmentPatterns[version].length * QRBase.alignmentPatterns[version].length - 3);

      if (g < 1) {
        return [version, 0];
      } else {
        grades.push(g);
      }

      formatNW = matchFormatNW(qr, moduleSize);
      formatNESW = matchFormatNESW(qr, nModules, moduleSize);

      if (formatNW[1] < formatNESW[1]) {
        format = formatNW[0];
      } else {
        format = formatNESW[0];
      }

      ECLevel = Math.floor(format / 8);
      mask = format % 8;
      g = Math.round(((4 - formatNW[1]) + (4 - formatNESW[1])) / 2);

      if (g < 1) {
        return [version, 0];
      } else {
        grades.push(g);
      }

      for (i = 0; i < grades.length; i++) {
        if (grades[i] < grade) {
          grade = grades[i];
        }
      }

      return [version, grade, ECLevel, mask];
    }

    // findModuleSize
    var bestMatchSoFar = [0, 0];
    var version, match;

    for (version = 1; version <= this.maxVersion; version++) {
      match = matchVersion(this, version);

      if (match[1] > bestMatchSoFar[1]) {
        bestMatchSoFar = match;
      }

      if (match[1] === 4) {
        break;
      }
    }

    this.version = bestMatchSoFar[0];
    this.nModules = QRBase.nModulesFromVersion(this.version);
    this.moduleSize = this.imageSize / this.nModules;
    this.functionalGrade = bestMatchSoFar[1];
    this.ECLevel = bestMatchSoFar[2];
    this.mask = bestMatchSoFar[3];

    if (this.functionalGrade < 1) {
      QRBase.errorThrow('Unable to decode a function pattern');
    }
  },
  extractCodewords: function() {
    function getUnmasked(qr, j, i) {
      var m, u;

      switch (qr.mask) {
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
        u = !qr.isDark(j, i);
      } else {
        u = qr.isDark(j, i);
      }

      return u;
    }

    /**
     * extractCodewords
     * Original Java version by Sean Owen
     * Copyright 2007 ZXing authors
     */
    this.codewords = [];

    var readingUp = true;
    var currentByte = 0;
    var factor = 128;
    var bitsRead = 0;
    var i, j, col, count;

    // Read columns in pairs, from right to left
    for (j = this.nModules - 1; j > 0; j -= 2) {
      if (j === 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }

      // Read alternatingly from bottom to top then top to bottom
      for (count = 0; count < this.nModules; count++) {
        i = readingUp ? this.nModules - 1 - count : count;

        for (col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!this.functionalPattern[j - col][i]) {
            // Read a bit
            if (getUnmasked(this, j - col, i)) {
              currentByte += factor;
            }

            factor /= 2;

            // If we've made a whole byte, save it off
            if (factor < 1) {
              this.codewords.push(currentByte);

              bitsRead = 0;
              factor = 128;
              currentByte = 0;
            }
          }
        }
      }

      // readingUp = !readingUp; // switch directions
      readingUp ^= true;
    }
  },
  extractData: function() {
    function extract(bytes, pos, len) {
      // http://stackoverflow.com/questions/3846711/extract-bit-sequences-of-arbitrary-length-from-byte-array-efficiently
      var shift = 24 - (pos & 7) - len;
      var mask = (1 << len) - 1;
      var byteIndex = pos >>> 3;

      return (((bytes[byteIndex] << 16) | (bytes[++byteIndex] << 8) | bytes[++byteIndex]) >> shift) & mask;
    }

    function extract8bit(qr, bytes) {
      var nCountBits = QRBase.nCountBits(QRBase.MODE.EightBit, qr.version);
      var n = extract(bytes, qr.bitIdx, nCountBits);
      var data = '';
      var i, a;

      qr.bitIdx += nCountBits;

      for (i = 0; i < n; i++) {
        a = extract(bytes, qr.bitIdx, 8);
        data += String.fromCharCode(a);
        qr.bitIdx += 8;
      }

      return QRBase.utf8Tounicode(data);
    }

    function extractAlphanum(qr, bytes) {
      var nCountBits = QRBase.nCountBits(QRBase.MODE.AlphaNumeric, qr.version);
      var n = extract(bytes, qr.bitIdx, nCountBits);
      var data = '';
      var i, x;

      qr.bitIdx += nCountBits;

      for (i = 0; i < Math.floor(n / 2); i++) {
        x = extract(bytes, qr.bitIdx, 11);
        data += qr.alphanum[Math.floor(x / 45)];
        data += qr.alphanum[x % 45];
        qr.bitIdx += 11;
      }

      if (n % 2) {
        data += qr.alphanum[extract(bytes, qr.bitIdx, 6)];
        qr.bitIdx += 6;
      }

      return data;
    }

    function extractNumeric(qr, bytes) {
      var nCountBits = QRBase.nCountBits(QRBase.MODE.Numeric, qr.version);
      var n = extract(bytes, qr.bitIdx, nCountBits);
      var data = '';
      var x, c1, c2, c3;
      var i;

      qr.bitIdx += nCountBits;

      for (i = 0; i < Math.floor(n / 3); i++) {
        x = extract(bytes, qr.bitIdx, 10);
        qr.bitIdx += 10;
        c1 = Math.floor(x / 100);
        c2 = Math.floor((x % 100) / 10);
        c3 = x % 10;
        data += String.fromCharCode(48 + c1, 48 + c2, 48 + c3);
      }

      if (n % 3 === 1) {
        x = extract(bytes, qr.bitIdx, 4);
        qr.bitIdx += 4;
        data += String.fromCharCode(48 + x);
      } else if (n % 3 === 2) {
        x = extract(bytes, qr.bitIdx, 7);
        qr.bitIdx += 7;
        c1 = Math.floor(x / 10);
        c2 = x % 10;
        data += String.fromCharCode(48 + c1, 48 + c2);
      }

      return data;
    }

    // extractData
    var bytes = this.bytes;
    var nBits = bytes.length * 8;
    var i, mode;

    for (i = 0; i < 4; i++) {
      bytes.push(0);
    }

    this.data = '';
    this.bitIdx = 0;

    while (this.bitIdx < nBits - 4) {
      mode = extract(bytes, this.bitIdx, 4);
      this.bitIdx += 4;

      if (mode === QRBase.MODE.Terminator) {
        break;
      } else if (mode === QRBase.MODE.AlphaNumeric) {
        this.data += extractAlphanum(this, bytes);
      } else if (mode === QRBase.MODE.EightBit) {
        this.data += extract8bit(this, bytes);
      } else if (mode === QRBase.MODE.Numeric) {
        this.data += extractNumeric(this, bytes);
      } else {
        QRBase.errorThrow('Unsupported ECI mode: ' + mode);
      }
    }
  },
  correctErrors: function() {
    var rs = new ReedSolomon(this.nBlockEcWords);
    var errors = [];
    var bytes = [];
    var b;
    var bytesIn, bytesOut;
    var i;

    rs.logger = this.logger;

    for (b = 0; b < this.blockIndices.length; b++) {
      bytesIn = [];

      for (i = 0; i < this.blockIndices[b].length; i++) {
        bytesIn.push(this.codewords[this.blockIndices[b][i]]);
      }

      bytesOut = rs.decode(bytesIn);

      if (!rs.corrected) {
        QRBase.errorThrow('Unable to correct errors (' + rs.uncorrected_reason + ')');
      }

      bytes = bytes.concat(bytesOut);
      errors.push(rs.n_errors);
    }

    this.bytes = bytes;

    this.gradeErrors(errors);
  },
  gradeErrors: function(errors) {
    var ecw = this.nBlockEcWords;
    var max = 0;
    var grade = 4;
    var i;

    for (i = 0; i < errors.length; i++) {
      if (errors[i] > max) { max = errors[i]; }
    }

    if (max > ecw / 2 - 1) {
      grade = 0;
    } else if (max > ecw / 2 - 2) {
      grade = 1;
    } else if (max > ecw / 2 - 3) {
      grade = 2;
    } else if (max > ecw / 2 - 4) {
      grade = 3;
    }

    return grade;
  },
  hammingDistance: function(a, b) {
    function nBits(n) {
      var c;

      for (c = 0; n; c++) {
        // clear the least significant bit set
        n &= n - 1;
      }

      return c;
    }

    var d = a ^ b;

    return nBits(d);
  },
  /**
   * QRCodeDecode IMAGE FUNCTIONS
   */
  isDarkWithSize: function(x, y, moduleSize) {
    return this.image.isDark(Math.round(this.imageLeft + x * moduleSize), Math.round(this.imageTop + y * moduleSize), Math.round(moduleSize));
  },
  isDark: function(x, y) {
    return this.isDarkWithSize(x, y, this.moduleSize);
  },
  alphanum: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    ' ',
    '$',
    '%',
    '*',
    '+',
    '-',
    '.',
    '/',
    ':'
  ]
};

export default { Decode: QRDecode };
