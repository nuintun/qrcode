import * as QRCONST from './const';
import * as QRCommon from './common';
import Pixels from  './pixels';
import ReedSolomon from './reedsolomon';

export default function QREncode(){
  this.image = null;

  this.mask = 0;
  this.version = 0;
  this.modules = 0;
  this.module_size = 0;
  this.functional_grade = 0;
  this.error_correction_level = 0;

  this.data_codewords = 0;
  this.block_ec_words = 0;
  this.block_indices = [];
  this.block_data_lengths = [];
}

QREncode.prototype = {
  MODE: QRCONST.MODE,
  ERROR_CORRECTION_LEVEL: QRCONST.ERROR_CORRECTION_LEVEL,
  ALIGNMENT_PATTERNS: QRCONST.ALIGNMENT_PATTERNS,
  VERSION_INFO: QRCONST.VERSION_INFO,
  FORMAT_INFO: QRCONST.FORMAT_INFO,
  CODEWORDS: QRCONST.CODEWORDS,
  EC_CODEWORDS: QRCONST.EC_CODEWORDS,
  EC_BLOCKS: QRCONST.EC_BLOCKS,
  ALPHANUM_REV: QRCONST.ALPHANUM_REV,
  setBlocks: QRCommon.setBlocks,
  setFunctionalPattern: QRCommon.setFunctionalPattern,
  countBits: QRCommon.countBits,
  modulesFromVersion: QRCommon.modulesFromVersion,
  setBackground: QRCommon.setBackground,
  setDark: QRCommon.setDark,
  isDark: QRCommon.isDark,
  //
  // QRCodeDecode main encode functions to be called by clients
  //
  /** Encode text into a QR Code in a pixel array
   *
   *  @param mode      Mode according to ISO/IEC 18004:2006(E) Section 6.3
   *  @param text      The text to be encoded
   *  @param version   Version according to ISO/IEC 18004:2006(E) Section 5.3.1
   *  @param ec_level  Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
   */
  encodeToPixArray: function (mode, text, version, ec_level){
    var i;
    var pixels = new Pixels(version);
    var modules = this.modulesFromVersion(version);

    for (i = 0; i < modules; i++) {
      pixels.push([]);
    }

    this.encodeInit(ec_level, pixels);
    this.encodeAddText(mode, text);
    this.encode();

    return pixels;
  },
  /** Prepare for encoding text to QR Code
   *
   *  @param ec_level      Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
   *  @param pix           pixel object
   */
  encodeInit: function (ec_level, pix){
    this.image = pix;
    // Version according to ISO/IEC 18004:2006(E) Section 5.3.1
    this.version = pix.version;
    this.module_size = pix.size;
    this.error_correction_level = ec_level;
    this.modules = this.modulesFromVersion(pix.version);

    this.setBackground();

    this.bit_idx = 0;

    this.setBlocks();

    this.data = [];

    var i;

    for (i = 0; i < this.data_codewords; i++) {
      this.data[i] = 0;
    }

    this.pixels = [];

    for (i = 0; i < this.modules; i++) {
      this.pixels[i] = [];
    }
  },
  /** Add text to a QR code
   *
   *  @param mode  Mode according to ISO/IEC 18004:2006(E) Section 6.3
   *  @param text  The text to be encoded
   */
  encodeAddText: function (mode, text){
    this.addTextImplementation(mode, text);
  },
  /**
   * Encode this class to an image/canvas.
   */
  encode: function (){
    this.addTextImplementation(this.MODE.Terminator, null);
    this.appendPadding();
    this.addErrorCorrection();
    this.encodeBestMask();
    this.pixelsToImage();
  },
  //
  // QRCodeDecode internal encoding functions
  //
  /**
   * addTextImplementation
   * @param mode
   * @param text
   */
  addTextImplementation: function (mode, text){
    function appendBits(bytes, pos, len, value){
      var byteIndex = pos >>> 3;
      var shift = 24 - (pos & 7) - len;
      var v = value << shift;

      bytes[byteIndex + 2] = v & 0xFF;
      v = v >>> 8;
      bytes[byteIndex + 1] = v & 0xFF;
      v = v >>> 8;
      bytes[byteIndex] += v & 0xFF;
    }

    function getAlphaNum(qr, ch){
      if (!qr.ALPHANUM_REV.hasOwnProperty(ch)) {
        throw ('Invalid character for Alphanumeric encoding [' + ch + ']');
      }

      return qr.ALPHANUM_REV[ch];
    }

    function addAlphaNum(qr, text){
      var n = text.length;
      var count_bits = qr.countBits(qr.MODE.AlphaNumeric, qr.version);

      appendBits(qr.data, qr.bit_idx, count_bits, n);

      qr.bit_idx += count_bits;

      var i;

      for (i = 0; i < n - 1; i += 2) {
        var val = 45 * getAlphaNum(qr, text[i]) + getAlphaNum(qr, text[i + 1]);

        appendBits(qr.data, qr.bit_idx, 11, val);

        qr.bit_idx += 11;
      }

      if (n % 2) {
        appendBits(qr.data, qr.bit_idx, 6, getAlphaNum(qr, text[n - 1]));

        qr.bit_idx += 6;
      }
    }

    function add8bit(qr, text){
      var count_bits = qr.countBits(qr.MODE.EightBit, qr.version);

      appendBits(qr.data, qr.bit_idx, count_bits, text.length);

      qr.bit_idx += count_bits;

      var i;

      for (i = 0; i < text.length; i++) {
        appendBits(qr.data, qr.bit_idx, 8, text[i].charCodeAt());

        qr.bit_idx += 8;
      }
    }

    function addNumeric(qr, text){
      var n = text.length;
      var count_bits = qr.countBits(qr.MODE.Numeric, qr.version);

      appendBits(qr.data, qr.bit_idx, count_bits, n);

      qr.bit_idx += count_bits;

      var num = [];
      var val;
      var i;

      for (i = 0; i < n; i++) {
        var ch = text[i].charCodeAt() - 48;

        if ((ch < 0) || (ch > 9)) {
          throw ('Invalid character for Numeric encoding [' + text[i] + ']');
        }

        num.push(ch);
      }

      for (i = 0; i < n - 2; i += 3) {
        val = 100 * num[i] + 10 * num[i + 1] + num[i + 2];

        appendBits(qr.data, qr.bit_idx, 10, val);

        qr.bit_idx += 10;

      }

      if (n % 3 === 1) {
        val = num[n - 1];

        appendBits(qr.data, qr.bit_idx, 4, val);

        qr.bit_idx += 4;
      } else if (n % 3 === 2) {
        val = 10 * num[n - 2] + num[n - 1];

        appendBits(qr.data, qr.bit_idx, 7, val);

        qr.bit_idx += 7;
      }
    }

    appendBits(this.data, this.bit_idx, 4, mode);

    this.bit_idx += 4;

    if (mode === this.MODE.AlphaNumeric) {
      addAlphaNum(this, text);
    } else if (mode === this.MODE.EightBit) {
      add8bit(this, this.unicodeToUTF8(text));
    } else if (mode === this.MODE.Numeric) {
      addNumeric(this, text);
    } else if (mode === this.MODE.Terminator) {
      return;
    } else {
      throw ('Unsupported ECI mode: ' + mode);
    }

    if (this.bit_idx / 8 > this.data_codewords) {
      throw ('Text too long for this EC version');
    }
  },
  appendPadding: function (){
    var i;

    for (i = Math.floor((this.bit_idx - 1) / 8) + 1; i < this.data_codewords; i += 2) {
      this.data[i] = 0xEC;
      this.data[i + 1] = 0x11;
    }
  },
  addErrorCorrection: function (){
    var b, i;
    var n = 0;
    var bytes = [];
    var rs = new ReedSolomon(this.block_ec_words);

    for (b = 0; b < this.block_data_lengths.length; b++) {
      var m = this.block_data_lengths[b];
      var bytes_in = this.data.slice(n, n + m);

      n += m;

      for (i = 0; i < m; i++) {
        bytes[this.block_indices[b][i]] = bytes_in[i];
      }

      var bytes_out = rs.encode(bytes_in);

      for (i = 0; i < bytes_out.length; i++) {
        bytes[this.block_indices[b][m + i]] = bytes_out[i];
      }
    }

    this.bytes = bytes;
  },
  calculatePenalty: function (mask){
    function penaltyAdjacent(qr){
      var i, j;
      var rc, p = 0;
      var dark, light;

      for (i = 0; i < qr.modules; i++) {
        dark = [0, 0];
        light = [0, 0];

        for (rc = 0; rc <= 1; rc++) {
          for (j = 0; j < qr.modules; j++) {
            if (qr.pixels[rc * i + (1 - rc) * j][(1 - rc) * i + rc * j]) {
              if (light[rc] > 5) {
                p += (3 + light[rc] - 5);
              }

              light[rc] = 0;
              dark[rc]++;
            } else {
              if (dark[rc] > 5) {
                p += (3 + dark[rc] - 5);
              }

              light[rc]++;
              dark[rc] = 0;
            }
          }

          if (light[rc] > 5) {
            p += (3 + light[rc] - 5);
          }

          if (dark[rc] > 5) {
            p += (3 + dark[rc] - 5);
          }
        }
      }

      return p;
    }

    function penaltyBlocks(qr){
      // Not clear from ISO standard, if blocks have to be rectangular?
      // Here we give 3 penalty to every 2x2 block, so odd shaped areas will have penalties as well as rectangles
      var p = 0;
      var i, j, b;

      for (i = 0; i < qr.modules - 1; i++) {
        for (j = 0; j < qr.modules - 1; j++) {
          b = 0;

          if (qr.pixels[i]  [j]) {
            b++;
          }

          if (qr.pixels[i + 1][j]) {
            b++;
          }

          if (qr.pixels[i]  [j + 1]) {
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
      var p = 0;
      var i, j;
      var rc, pat;
      var bad = ( 128 - 1 - 2 - 32 ) << 4;	// 4_ : 1D : 1L : 3D : 1L : 1D : 4x
      var badmask1 = 2048 - 1;		// 4_ : 1D : 1L : 3D : 1L : 1D : 4L
      var badmask2 = badmask1 << 4;		// 4L : 1D : 1L : 3D : 1L : 1D : 4_
      var patmask = 32768 - 1;		// 4  +           7            + 4
      for (i = 0; i < qr.modules - 1; i++) {
        pat = [0, 0];

        for (j = 0; j < qr.modules - 1; j++) {
          for (rc = 0; rc <= 1; rc++) {
            pat[rc] = (pat[rc] << 1) & patmask;

            if (qr.pixels[rc * i + (1 - rc) * j][(1 - rc) * i + rc * j]) {
              pat[rc]++;
            }

            if (j >= 7 + 4) {
              if ((pat[rc] & badmask1) === bad) {
                p += 40;
              } else {
                if (j < qr.modules - 4 - 7) {
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
      var i, j;
      var dark = 0;

      for (i = 0; i < qr.modules - 1; i++) {
        for (j = 0; j < qr.modules - 1; j++) {
          if (qr.pixels[i][j]) {
            dark++;
          }
        }
      }

      return 10 * Math.floor(Math.abs(dark / (qr.modules * qr.modules) - 0.5) / 0.05);
    }

    // calculate penalty
    var p_adjacent = penaltyAdjacent(this);
    var p_blocks = penaltyBlocks(this);
    var p_darkLight = penaltyDarkLight(this);
    var p_dark = penaltyDark(this);

    return p_adjacent + p_blocks + p_darkLight + p_dark;
  },
  encodeBestMask: function (){
    var best_mask = 0;
    var best_penalty = 999999;

    this.setFunctionalPattern();

    var i, j;
    var mask;
    var penalty;

    for (mask = 0; mask < 8; mask++) {
      for (i = 0; i < this.modules; i++) {
        for (j = 0; j < this.modules; j++) {
          this.pixels[i][j] = false;
        }
      }

      this.encodeFunctionalPatterns(mask);
      this.encodeData(mask);

      penalty = this.calculatePenalty(mask);

      if (penalty < best_penalty) {
        best_penalty = penalty;
        best_mask = mask;
      }
    }

    this.mask = best_mask;

    if (this.mask !== 7) {
      for (i = 0; i < this.modules; i++) {
        for (j = 0; j < this.modules; j++) {
          this.pixels[i][j] = false;
        }
      }

      this.encodeFunctionalPatterns(this.mask);
      this.encodeData(this.mask);
    }
  },
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
      var x, y;
      var pattern = qr.VERSION_INFO[qr.version];

      for (y = 0; y < 6; y++) {
        for (x = qr.modules - 11; x < qr.modules - 11 + 3; x++) {
          if (pattern & 1) {
            qr.pixels[x][y] = true;
          }

          pattern /= 2;
        }
      }
    }

    function encodeVersionBottomleft(qr){
      var x, y;
      var pattern = qr.VERSION_INFO[qr.version];

      for (x = 0; x < 6; x++) {
        for (y = qr.modules - 11; y < qr.modules - 11 + 3; y++) {
          if (pattern & 1) {
            qr.pixels[x][y] = true;
          }

          pattern /= 2;
        }
      }
    }

    function encodeTimingPattern(qr, horizontal){
      var i;

      for (i = 8; i < qr.modules - 8; i += 2) {
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
      var i, j;
      var n = qr.ALIGNMENT_PATTERNS[qr.version].length;

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
            continue;
          }

          encodeOneAlignmentPattern(qr, qr.ALIGNMENT_PATTERNS[qr.version][i] - 2, qr.ALIGNMENT_PATTERNS[qr.version][j] - 2);
        }
      }
    }

    function encodeFormatNW(qr, code){
      var x, y;

      for (y = 0; y <= 5; y++) {
        if (code & 1) {
          qr.pixels[8][y] = true;
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

      for (x = 5; x >= 0; x--) {
        if (code & 1) {
          qr.pixels[x][8] = true;
        }

        code /= 2;
      }
    }

    function encodeFormatNESW(qr, code){
      var x, y;

      for (x = qr.modules - 1; x > qr.modules - 1 - 8; x--) {
        if (code & 1) {
          qr.pixels[x][8] = true;
        }

        code /= 2;
      }

      for (y = qr.modules - 7; y < qr.modules - 1; y++) {
        if (code & 1) {
          qr.pixels[8][y] = true;
        }

        code /= 2;
      }
    }

    // encode functional patterns
    encodeFinderPattern(this, 0, 0);
    encodeFinderPattern(this, 0, this.modules - 7);
    encodeFinderPattern(this, this.modules - 7, 0);

    if (this.version >= 7) {
      encodeVersionTopright(this);
      encodeVersionBottomleft(this);
    }

    encodeTimingPattern(this, true);
    encodeTimingPattern(this, false);

    if (this.version > 1) {
      encodeAlignmentPatterns(this);
    }

    var code = this.FORMAT_INFO[mask + 8 * this.error_correction_level];

    encodeFormatNW(this, code);
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

    // encode data
    var i, j;
    var col;
    var count;
    var n = 0;
    var v = this.bytes[n];
    var bitsWritten = 0;
    var mask = (1 << 7);
    var writingUp = true;

    // Write columns in pairs, from right to left
    for (j = this.modules - 1; j > 0; j -= 2) {
      if (j === 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }

      // Read alternatingly from bottom to top then top to bottom
      for (count = 0; count < this.modules; count++) {
        i = writingUp ? this.modules - 1 - count : count;

        for (col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!this.functional_pattern[j - col][i]) {
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

      writingUp ^= true; // writingUp = !writingUp; // switch directions
    }
  },
  pixelsToImage: function (){
    var i, j;

    for (i = 0; i < this.modules; i++) {
      for (j = 0; j < this.modules; j++) {
        if (this.pixels[i][j]) {
          this.setDark(i, j);
        }
      }
    }
  },
  /**
   * UTF-8 和 Unicode 的相互转换
   * @param {string} string
   * @returns {string}
   */
  unicodeToUTF8: function (string){
    var out = '';
    var len = string.length;
    var i, c;

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
  getDataCapacity: function (mode, version, ec_level){
    var codewords = this.CODEWORDS[version];
    var ec_codewords = this.EC_CODEWORDS[version][ec_level];
    var data_codewords = codewords - ec_codewords;
    var bits = 8 * data_codewords;

    bits -= 4;	// mode
    bits -= this.countBits(mode, version);

    var cap = 0;

    if (mode === this.MODE.AlphaNumeric) {
      cap = Math.floor(bits / 11) * 2;

      if (bits >= (cap / 2) * 11 + 6) {
        cap++;
      }
    } else if (mode === this.MODE.EightBit) {
      cap = Math.floor(bits / 8);
    } else if (mode === this.MODE.Numeric) {
      cap = Math.floor(bits / 10) * 3;

      if (bits >= (cap / 3) * 10 + 4) {
        if (bits >= (cap / 3) * 10 + 7) {
          cap++;
        }

        cap++;
      }
    } else {
      throw ('Unsupported ECI mode: ' + mode);
    }

    return cap;
  },
  getVersionFromLength: function (mode, text, ec_level){
    var v;
    var length = this
      .unicodeToUTF8(text)
      .length;

    for (v = 1; v <= 40; v++) {
      if (this.getDataCapacity(mode, v, ec_level) >= length) {
        return v;
      }
    }

    throw('Text is too long, even for a version 40 QR Code');
  }
};
