import QRError from './error';
import Pixels from './pixels';
import * as QRCONST from './const';
import * as QRCommon from './common';
import ReedSolomon from './reedsolomon';

export default function QREncode() {
  var context = this;

  context.pixels = null;

  context.mask = 0;
  context.version = 0;
  context.modules = 0;
  context.module_size = 0;
  context.functional_grade = 0;
  context.error_correction_level = 0;

  context.data_codewords = 0;
  context.block_ec_words = 0;
  context.block_indices = [];
  context.block_data_lengths = [];
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
  encodeToPixArray: function(mode, text, version, ec_level) {
    var i;
    var context = this;
    var modules = context.modulesFromVersion(version);
    var pixels = new Pixels(mode, version, ec_level);

    for (i = 0; i < modules; i++) {
      pixels.push([]);
    }

    context.encodeInit(ec_level, pixels);
    context.encodeAddText(mode, text);
    context.encode();

    return pixels;
  },
  /** Prepare for encoding text to QR Code
   *
   *  @param ec_level      Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
   *  @param pixels           pixel object
   */
  encodeInit: function(ec_level, pixels) {
    var i;
    var context = this;

    // set pixels
    context.pixels = pixels;
    // Version according to ISO/IEC 18004:2006(E) Section 5.3.1
    context.version = pixels.version;
    context.modules = pixels.length;
    context.module_size = pixels.size;
    context.error_correction_level = ec_level;

    // set background
    context.setBackground();

    // set bit idx
    context.bit_idx = 0;

    // set blocks
    context.setBlocks();

    // set data
    context.data = [];

    for (i = 0; i < context.data_codewords; i++) {
      context.data[i] = 0;
    }
  },
  /** Add text to a QR code
   *
   *  @param mode  Mode according to ISO/IEC 18004:2006(E) Section 6.3
   *  @param text  The text to be encoded
   */
  encodeAddText: function(mode, text) {
    this.addTextImplementation(mode, text);
  },
  /**
   * Encode this class to an image/canvas.
   */
  encode: function() {
    var context = this;

    context.addTextImplementation(context.MODE.Terminator, null);
    context.appendPadding();
    context.addErrorCorrection();
    context.encodeBestMask();
    context.pixelsToImage();
  },
  //
  // QRCodeDecode internal encoding functions
  //
  /**
   * addTextImplementation
   * @param mode
   * @param text
   */
  addTextImplementation: function(mode, text) {
    var context = this;

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

    function getAlphaNum(context, ch) {
      if (!context.ALPHANUM_REV.hasOwnProperty(ch)) {
        throw new QRError('QREncode.InvalidChar4Alphanumeric', { char: ch });
      }

      return context.ALPHANUM_REV[ch];
    }

    function addAlphaNum(context, text) {
      var n = text.length;
      var count_bits = context.countBits(context.MODE.AlphaNumeric, context.version);

      appendBits(context.data, context.bit_idx, count_bits, n);

      context.bit_idx += count_bits;

      var i;

      for (i = 0; i < n - 1; i += 2) {
        var val = 45 * getAlphaNum(context, text[i]) + getAlphaNum(context, text[i + 1]);

        appendBits(context.data, context.bit_idx, 11, val);

        context.bit_idx += 11;
      }

      if (n % 2) {
        appendBits(context.data, context.bit_idx, 6, getAlphaNum(context, text[n - 1]));

        context.bit_idx += 6;
      }
    }

    function add8bit(context, text) {
      var count_bits = context.countBits(context.MODE.EightBit, context.version);

      appendBits(context.data, context.bit_idx, count_bits, text.length);

      context.bit_idx += count_bits;

      var i;

      for (i = 0; i < text.length; i++) {
        appendBits(context.data, context.bit_idx, 8, text[i].charCodeAt());

        context.bit_idx += 8;
      }
    }

    function addNumeric(context, text) {
      var n = text.length;
      var count_bits = context.countBits(context.MODE.Numeric, context.version);

      appendBits(context.data, context.bit_idx, count_bits, n);

      context.bit_idx += count_bits;

      var num = [];
      var val;
      var i;

      for (i = 0; i < n; i++) {
        var ch = text[i].charCodeAt() - 48;

        if ((ch < 0) || (ch > 9)) {
          throw new QRError('QREncode.InvalidChar4Numeric', { char: text[i] });
        }

        num.push(ch);
      }

      for (i = 0; i < n - 2; i += 3) {
        val = 100 * num[i] + 10 * num[i + 1] + num[i + 2];

        appendBits(context.data, context.bit_idx, 10, val);

        context.bit_idx += 10;

      }

      if (n % 3 === 1) {
        val = num[n - 1];

        appendBits(context.data, context.bit_idx, 4, val);

        context.bit_idx += 4;
      } else if (n % 3 === 2) {
        val = 10 * num[n - 2] + num[n - 1];

        appendBits(context.data, context.bit_idx, 7, val);

        context.bit_idx += 7;
      }
    }

    appendBits(context.data, context.bit_idx, 4, mode);

    context.bit_idx += 4;

    if (mode === context.MODE.AlphaNumeric) {
      addAlphaNum(context, text);
    } else if (mode === context.MODE.EightBit) {
      add8bit(context, text);
    } else if (mode === context.MODE.Numeric) {
      addNumeric(context, text);
    } else if (mode === context.MODE.Terminator) {
      return;
    } else {
      throw new QRError('QRCode.UnsupportedECI', { mode: mode });
    }

    if (context.bit_idx / 8 > context.data_codewords) {
      throw new QRError('QREncode.TextTooLong4TargetVersion');
    }
  },
  appendPadding: function() {
    var i;
    var context = this;

    for (i = Math.floor((context.bit_idx - 1) / 8) + 1; i < context.data_codewords; i += 2) {
      context.data[i] = 0xEC;
      context.data[i + 1] = 0x11;
    }
  },
  addErrorCorrection: function() {
    var b, i;
    var n = 0;
    var bytes = [];
    var context = this;
    var rs = new ReedSolomon(context.block_ec_words);

    for (b = 0; b < context.block_data_lengths.length; b++) {
      var m = context.block_data_lengths[b];
      var bytes_in = context.data.slice(n, n + m);

      n += m;

      for (i = 0; i < m; i++) {
        bytes[context.block_indices[b][i]] = bytes_in[i];
      }

      var bytes_out = rs.encode(bytes_in);

      for (i = 0; i < bytes_out.length; i++) {
        bytes[context.block_indices[b][m + i]] = bytes_out[i];
      }
    }

    context.bytes = bytes;
  },
  calculatePenalty: function() {
    var context = this;

    function penaltyAdjacent(context) {
      var i, j;
      var rc, p = 0;
      var dark, light;

      for (i = 0; i < context.modules; i++) {
        dark = [0, 0];
        light = [0, 0];

        for (rc = 0; rc <= 1; rc++) {
          for (j = 0; j < context.modules; j++) {
            if (context.pixels[rc * i + (1 - rc) * j][(1 - rc) * i + rc * j]) {
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

    function penaltyBlocks(context) {
      // Not clear from ISO standard, if blocks have to be rectangular?
      // Here we give 3 penalty to every 2x2 block, so odd shaped areas will have penalties as well as rectangles
      var p = 0;
      var i, j, b;

      for (i = 0; i < context.modules - 1; i++) {
        for (j = 0; j < context.modules - 1; j++) {
          b = 0;

          if (context.pixels[i][j]) {
            b++;
          }

          if (context.pixels[i + 1][j]) {
            b++;
          }

          if (context.pixels[i][j + 1]) {
            b++;
          }

          if (context.pixels[i + 1][j + 1]) {
            b++;
          }

          if ((b === 0) || (b === 4)) {
            p += 3;
          }
        }
      }

      return p;
    }

    function penaltyDarkLight(context) {
      // we shift bits in one by one, and see if the resulting pattern match the bad one
      var p = 0;
      var i, j;
      var rc, pat;
      var bad = (128 - 1 - 2 - 32) << 4; // 4_ : 1D : 1L : 3D : 1L : 1D : 4x
      var badmask1 = 2048 - 1; // 4_ : 1D : 1L : 3D : 1L : 1D : 4L
      var badmask2 = badmask1 << 4; // 4L : 1D : 1L : 3D : 1L : 1D : 4_
      var patmask = 32768 - 1; // 4  +           7            + 4
      for (i = 0; i < context.modules - 1; i++) {
        pat = [0, 0];

        for (j = 0; j < context.modules - 1; j++) {
          for (rc = 0; rc <= 1; rc++) {
            pat[rc] = (pat[rc] << 1) & patmask;

            if (context.pixels[rc * i + (1 - rc) * j][(1 - rc) * i + rc * j]) {
              pat[rc]++;
            }

            if (j >= 7 + 4) {
              if ((pat[rc] & badmask1) === bad) {
                p += 40;
              } else {
                if (j < context.modules - 4 - 7) {
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

    function penaltyDark(context) {
      var i, j;
      var dark = 0;

      for (i = 0; i < context.modules - 1; i++) {
        for (j = 0; j < context.modules - 1; j++) {
          if (context.pixels[i][j]) {
            dark++;
          }
        }
      }

      return 10 * Math.floor(Math.abs(dark / (context.modules * context.modules) - 0.5) / 0.05);
    }

    // calculate penalty
    var p_adjacent = penaltyAdjacent(context);
    var p_blocks = penaltyBlocks(context);
    var p_darkLight = penaltyDarkLight(context);
    var p_dark = penaltyDark(context);

    return p_adjacent + p_blocks + p_darkLight + p_dark;
  },
  encodeBestMask: function() {
    var best_mask = 0;
    var context = this;
    var best_penalty = 999999;

    context.setFunctionalPattern();

    var i, j;
    var mask;
    var penalty;

    for (mask = 0; mask < 8; mask++) {
      for (i = 0; i < context.modules; i++) {
        for (j = 0; j < context.modules; j++) {
          context.pixels[i][j] = false;
        }
      }

      context.encodeFunctionalPatterns(mask);
      context.encodeData(mask);

      penalty = context.calculatePenalty();

      if (penalty < best_penalty) {
        best_penalty = penalty;
        best_mask = mask;
      }
    }

    context.mask = best_mask;

    if (context.mask !== 7) {
      for (i = 0; i < context.modules; i++) {
        for (j = 0; j < context.modules; j++) {
          context.pixels[i][j] = false;
        }
      }

      context.encodeFunctionalPatterns(context.mask);
      context.encodeData(context.mask);
    }
  },
  encodeFunctionalPatterns: function(mask) {
    var context = this;

    function encodeFinderPattern(context, x, y) {
      var i, j;

      // Outer 7x7 black boundary
      for (i = 0; i <= 5; i++) {
        context.pixels[x + i][y] = true;
        context.pixels[x + 6][y + i] = true;
        context.pixels[x + 6 - i][y + 6] = true;
        context.pixels[x][y + 6 - i] = true;
      }

      // Inner 3*3 black box
      for (i = 2; i <= 4; i++) {
        for (j = 2; j <= 4; j++) {
          context.pixels[x + i][y + j] = true;
        }
      }
    }

    function encodeVersionTopright(context) {
      var x, y;
      var pattern = context.VERSION_INFO[context.version];

      for (y = 0; y < 6; y++) {
        for (x = context.modules - 11; x < context.modules - 11 + 3; x++) {
          if (pattern & 1) {
            context.pixels[x][y] = true;
          }

          pattern /= 2;
        }
      }
    }

    function encodeVersionBottomleft(context) {
      var x, y;
      var pattern = context.VERSION_INFO[context.version];

      for (x = 0; x < 6; x++) {
        for (y = context.modules - 11; y < context.modules - 11 + 3; y++) {
          if (pattern & 1) {
            context.pixels[x][y] = true;
          }

          pattern /= 2;
        }
      }
    }

    function encodeTimingPattern(context, horizontal) {
      var i;

      for (i = 8; i < context.modules - 8; i += 2) {
        if (horizontal) {
          context.pixels[i][6] = true;
        } else {
          context.pixels[6][i] = true;
        }
      }

    }

    function encodeOneAlignmentPattern(context, x, y) {
      // Outer 5x5 black boundary
      var i;

      for (i = 0; i <= 3; i++) {
        context.pixels[x + i][y] = true;
        context.pixels[x + 4][y + i] = true;
        context.pixels[x + 4 - i][y + 4] = true;
        context.pixels[x][y + 4 - i] = true;
      }

      // center black
      context.pixels[x + 2][y + 2] = true;
    }

    function encodeAlignmentPatterns(context) {
      var i, j;
      var n = context.ALIGNMENT_PATTERNS[context.version].length;

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
            continue;
          }

          encodeOneAlignmentPattern(context, context.ALIGNMENT_PATTERNS[context.version][i] - 2, context.ALIGNMENT_PATTERNS[context.version][j] - 2);
        }
      }
    }

    function encodeFormatNW(context, code) {
      var x, y;

      for (y = 0; y <= 5; y++) {
        if (code & 1) {
          context.pixels[8][y] = true;
        }

        code /= 2;
      }

      if (code & 1) {
        context.pixels[8][7] = true;
      }

      code /= 2;

      if (code & 1) {
        context.pixels[8][8] = true;
      }

      code /= 2;

      if (code & 1) {
        context.pixels[7][8] = true;
      }

      code /= 2;

      for (x = 5; x >= 0; x--) {
        if (code & 1) {
          context.pixels[x][8] = true;
        }

        code /= 2;
      }
    }

    function encodeFormatNESW(context, code) {
      var x, y;

      for (x = context.modules - 1; x > context.modules - 1 - 8; x--) {
        if (code & 1) {
          context.pixels[x][8] = true;
        }

        code /= 2;
      }

      for (y = context.modules - 7; y < context.modules - 1; y++) {
        if (code & 1) {
          context.pixels[8][y] = true;
        }

        code /= 2;
      }
    }

    // encode functional patterns
    encodeFinderPattern(context, 0, 0);
    encodeFinderPattern(context, 0, context.modules - 7);
    encodeFinderPattern(context, context.modules - 7, 0);

    if (context.version >= 7) {
      encodeVersionTopright(context);
      encodeVersionBottomleft(context);
    }

    encodeTimingPattern(context, true);
    encodeTimingPattern(context, false);

    if (context.version > 1) {
      encodeAlignmentPatterns(context);
    }

    var code = context.FORMAT_INFO[mask + 8 * context.error_correction_level];

    encodeFormatNW(context, code);
    encodeFormatNESW(context, code);
  },
  encodeData: function(qrmask) {
    var context = this;

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

    // encode data
    var i, j;
    var col;
    var count;
    var n = 0;
    var v = context.bytes[n];
    var bitsWritten = 0;
    var mask = (1 << 7);
    var writingUp = true;

    // Write columns in pairs, from right to left
    for (j = context.modules - 1; j > 0; j -= 2) {
      if (j === 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }

      // Read alternatingly from bottom to top then top to bottom
      for (count = 0; count < context.modules; count++) {
        i = writingUp ? context.modules - 1 - count : count;

        for (col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!context.functional_pattern[j - col][i]) {
            setMasked(context.pixels, qrmask, j - col, i, v & mask);

            mask = (mask >>> 1);
            bitsWritten++;

            if (bitsWritten === 8) {
              bitsWritten = 0;
              mask = (1 << 7);
              n++;
              v = context.bytes[n];
            }
          }
        }
      }

      writingUp ^= true; // writingUp = !writingUp; // switch directions
    }
  },
  pixelsToImage: function() {
    var i, j;
    var context = this;

    for (i = 0; i < context.modules; i++) {
      for (j = 0; j < context.modules; j++) {
        if (context.pixels[i][j]) {
          context.setDark(i, j);
        }
      }
    }
  },
  getDataCapacity: function(mode, version, ec_level) {
    var context = this;
    var codewords = context.CODEWORDS[version];
    var ec_codewords = context.EC_CODEWORDS[version][ec_level];
    var data_codewords = codewords - ec_codewords;
    var bits = 8 * data_codewords;

    bits -= 4; // mode
    bits -= context.countBits(mode, version);

    var cap = 0;

    if (mode === context.MODE.AlphaNumeric) {
      cap = Math.floor(bits / 11) * 2;

      if (bits >= (cap / 2) * 11 + 6) {
        cap++;
      }
    } else if (mode === context.MODE.EightBit) {
      cap = Math.floor(bits / 8);
    } else if (mode === context.MODE.Numeric) {
      cap = Math.floor(bits / 10) * 3;

      if (bits >= (cap / 3) * 10 + 4) {
        if (bits >= (cap / 3) * 10 + 7) {
          cap++;
        }

        cap++;
      }
    } else {
      throw new QRError('QRCode.UnsupportedECI', { mode: mode });
    }

    return cap;
  },
  getVersionFromLength: function(mode, text, ec_level) {
    var v;
    var length = text.length;

    for (v = 1; v <= 40; v++) {
      if (this.getDataCapacity(mode, v, ec_level) >= length) {
        return v;
      }
    }

    throw new QRError('QREncode.TextTooLong4AllVersion');
  }
};
