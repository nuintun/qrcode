(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define('qrcode', factory) :
  (global.QRCode = factory());
}(this, (function () { 'use strict';

  /**
   * inherits
   * @param ctor
   * @param super_ctor
   * @param proto
   */
  function inherits(ctor, super_ctor, proto){
    function F(){
      // constructor
    }

    // prototype
    F.prototype = super_ctor.prototype;

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

  /**
   * Unicode转UTF-8
   * @param {string} string
   * @returns {string}
   */
  function toUTF8(string){
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
  }

  /**
   * UTF-8转Unicode
   * @param {string} string
   * @returns {string}
   */
  function toUnicode(string){
    var i = 0;
    var out = '';
    var len = string.length;
    var mark, char1, char2, char3;

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
  }

  /**
   * QRError
   * @param type
   * @param data
   * @param message
   * @constructor
   */
  function QRError(type, data, message){
    var context = this;

    context.type = type;
    context.data = data;
    context.message = message;
  }

  // inherits
  inherits(QRError, Error, {
    name: 'QRError'
  });

  /*!
   * QRCode constants
   */
  // Mode according to ISO/IEC 18004:2006(E) Section 6.3
  var MODE = {
    Numeric: 1,
    AlphaNumeric: 2,
    EightBit: 4,
    Terminator: 0
  };

  // Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
  var ERROR_CORRECTION_LEVEL = {
    L: 1,	//  7%
    M: 0,	// 15%
    Q: 3,	// 25%
    H: 2	// 30%
  };

  var ALIGNMENT_PATTERNS = [
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
  ];

  var VERSION_INFO = [
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
  ];

  var FORMAT_INFO = [
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
  ];

  var CODEWORDS = [
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
  ];

  var EC_CODEWORDS = [
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
  ];

  var EC_BLOCKS = [
    [],
    [[1], [1], [1], [1]],
    [[1], [1], [1], [1]],
    [[1], [1], [2], [2]],
    [[2], [1], [4], [2]],
    [[2], [1], [2, 2], [2, 2]],
    [[4], [2], [4], [4]],
    [[4], [2], [4, 1], [2, 4]],
    [[2, 2], [2], [4, 2], [4, 2]],
    [[3, 2], [2], [4, 4], [4, 4]],
    [[4, 1], [2, 2], [6, 2], [6, 2]],
    [[1, 4], [4], [3, 8], [4, 4]],
    [[6, 2], [2, 2], [7, 4], [4, 6]],
    [[8, 1], [4], [12, 4], [8, 4]],
    [[4, 5], [3, 1], [11, 5], [11, 5]],
    [[5, 5], [5, 1], [11, 7], [5, 7]],
    [[7, 3], [5, 1], [3, 13], [15, 2]],
    [[10, 1], [1, 5], [2, 17], [1, 15]],
    [[9, 4], [5, 1], [2, 19], [17, 1]],
    [[3, 11], [3, 4], [9, 16], [17, 4]],
    [[3, 13], [3, 5], [15, 10], [15, 5]],
    [[17], [4, 4], [19, 6], [17, 6]],
    [[17], [2, 7], [34], [7, 16]],
    [[4, 14], [4, 5], [16, 14], [11, 14]],
    [[6, 14], [6, 4], [30, 2], [11, 16]],
    [[8, 13], [8, 4], [22, 13], [7, 22]],
    [[19, 4], [10, 2], [33, 4], [28, 6]],
    [[22, 3], [8, 4], [12, 28], [8, 26]],
    [[3, 23], [3, 10], [11, 31], [4, 31]],
    [[21, 7], [7, 7], [19, 26], [1, 37]],
    [[19, 10], [5, 10], [23, 25], [15, 25]],
    [[2, 29], [13, 3], [23, 28], [42, 1]],
    [[10, 23], [17], [19, 35], [10, 35]],
    [[14, 21], [17, 1], [11, 46], [29, 19]],
    [[14, 23], [13, 6], [59, 1], [44, 7]],
    [[12, 26], [12, 7], [22, 41], [39, 14]],
    [[6, 34], [6, 14], [2, 64], [46, 10]],
    [[29, 14], [17, 4], [24, 46], [49, 10]],
    [[13, 32], [4, 18], [42, 32], [48, 14]],
    [[40, 7], [20, 4], [10, 67], [43, 22]],
    [[18, 31], [19, 6], [20, 61], [34, 34]]
  ];

  var ALPHANUM_REV = {
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
  };

  function mapping(table){
    var map = {};

    for (var key in table) {
      if (table.hasOwnProperty(key)) {
        map[table[key]] = key;
      }
    }

    return map;
  }

  var MODE_MAP = mapping(MODE);
  var EC_LEVEL_MAP = mapping(ERROR_CORRECTION_LEVEL);

  function Pixels(mode, version, ec_level){
    var context = this;

    context.mode = MODE_MAP[mode];
    context.version = version;
    context.level = EC_LEVEL_MAP[ec_level];
  }

  inherits(Pixels, Array, {
    setBackground: function (){
      var i, j;
      var context = this;
      var modules = context.length;

      for (i = 0; i < modules; i++) {
        for (j = 0; j < modules; j++) {
          context[i][j] = false;
        }
      }

      return true;
    },
    setDark: function (x, y){
      var context = this;
      var modules = context.length;

      // Ignoring d, since a pixel array has d=1
      if (x > modules - 1 || y > modules - 1) {
        return false;
      }

      context[x][y] = true;

      return true;
    },
    isDark: function (x, y){
      var context = this;
      var modules = context.length;

      // Ignoring d, since a pixel array has d=1
      if (x > modules - 1 || y > modules - 1) {
        return false;
      }

      return context[x][y];
    }
  });

  function setBlocks(){
    var context = this;
    var codewords = context.CODEWORDS[context.version];
    var ec_codewords = context.EC_CODEWORDS[context.version][context.error_correction_level];

    context.data_codewords = codewords - ec_codewords;

    var ec_blocks = context.EC_BLOCKS[context.version][context.error_correction_level];

    var blocks;
    var blocks_first;
    var blocks_second = 0;
    var block_words_first;
    var block_words_second;

    var i, b;

    if (ec_blocks.length === 1) {
      blocks_first = ec_blocks[0];
      // set blocks_second = 0;
      blocks = blocks_first;
      block_words_first = context.data_codewords / blocks;
      block_words_second = 0;
    } else {
      blocks_first = ec_blocks[0];
      blocks_second = ec_blocks[1];
      blocks = blocks_first + blocks_second;
      block_words_first = Math.floor(context.data_codewords / blocks);
      block_words_second = block_words_first + 1;
    }

    context.block_ec_words = ec_codewords / blocks;
    context.block_data_lengths = [];

    for (b = 0; b < blocks_first; b++) {
      context.block_data_lengths[b] = block_words_first;
    }

    for (b = blocks_first; b < blocks; b++) {
      context.block_data_lengths[b] = block_words_second;
    }

    context.block_indices = [];

    for (b = 0; b < blocks; b++) {
      context.block_indices[b] = [];
    }

    var w = 0;

    for (i = 0; i < block_words_first; i++) {
      for (b = 0; b < blocks; b++) {
        context.block_indices[b].push(w++);
      }
    }

    for (b = blocks_first; b < blocks; b++) {
      context.block_indices[b].push(w++);
    }

    for (i = 0; i < context.block_ec_words; i++) {
      for (b = 0; b < blocks; b++) {
        context.block_indices[b].push(w++);
      }
    }
  }

  function setFunctionalPattern(){
    var context = this;

    function markSquare(context, x, y, w, h){
      var i, j;

      for (i = x; i < x + w; i++) {
        for (j = y; j < y + h; j++) {
          context.functional_pattern[i][j] = true;
        }
      }
    }

    function markAlignment(context){
      var i, j;
      var n = context.ALIGNMENT_PATTERNS[context.version].length;

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
            continue;
          }

          markSquare(
            context,
            context.ALIGNMENT_PATTERNS[context.version][i] - 2,
            context.ALIGNMENT_PATTERNS[context.version][j] - 2,
            5,
            5
          );
        }
      }
    }

    context.functional_pattern = [];

    var x, y;

    for (x = 0; x < context.modules; x++) {
      context.functional_pattern[x] = [];

      for (y = 0; y < context.modules; y++) {
        context.functional_pattern[x][y] = false;
      }
    }

    // Finder and Format
    markSquare(context, 0, 0, 9, 9);
    markSquare(context, context.modules - 8, 0, 8, 9);
    markSquare(context, 0, context.modules - 8, 9, 8);

    // Timing
    markSquare(context, 8, 6, context.modules - 8 - 8, 1);
    markSquare(context, 6, 8, 1, context.modules - 8 - 8);

    // Alignment
    markAlignment(context);

    // Version
    if (context.version >= 7) {
      markSquare(context, 0, context.modules - 11, 6, 3);
      markSquare(context, context.modules - 11, 0, 3, 6);
    }
  }

  function countBits(mode, version){
    var context = this;

    if (mode === context.MODE.EightBit) {
      if (version < 10) {
        return 8;
      } else {
        return 16;
      }
    } else if (mode === context.MODE.AlphaNumeric) {
      if (version < 10) {
        return 9;
      } else if (version < 27) {
        return 11;
      } else {
        return 13;
      }
    } else if (mode === context.MODE.Numeric) {
      if (version < 10) {
        return 10;
      } else if (version < 27) {
        return 12;
      } else {
        return 14;
      }
    }

    throw new QRError('QRCode.UnknownMode', { mode: mode }, 'Internal error: Unknown mode: ' + mode + '.');
  }

  function modulesFromVersion(version){
    return 17 + 4 * version;
  }

  function setBackground(){
    var context = this;

    return context.pixels.setBackground.apply(context.pixels, arguments);
  }

  function setDark(){
    var context = this;

    return context.pixels.setDark.apply(context.pixels, arguments);
  }

  function isDark(){
    var context = this;

    return context.pixels.isDark.apply(context.pixels, arguments);
  }

  /*!
   * QR-Logo: http://qrlogo.kaarposoft.dk
   *
   * Copyright (C) 2011 Henrik Kaare Poulsen
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   *Parts of the Reed Solomon decoding algorithms have been inspired by
   *http://rscode.sourceforge.net
   * Original version Copyright (C) by Henry Minsky
   */

  /**
   * ReedSolomon
   * @param n_ec_bytes
   * @constructor
   */
  function ReedSolomon(n_ec_bytes){
    var context = this;

    context.n_ec_bytes = n_ec_bytes;
    context.n_degree_max = 2 * n_ec_bytes;
    context.syndroms = [];
    context.gen_poly = null;

    context.initGaloisTables();
  }

  /**
   * ReedSolomon prototype
   */
  ReedSolomon.prototype = {
    //
    // ReedSolomon main functions to be called by clients
    //
    /**
     * encode
     * @param msg
     * @returns {Array}
     */
    encode: function (msg){
      var context = this;

      // Return parity bytes
      // Simulate a LFSR with generator polynomial for n byte RS code.
      if (context.gen_poly == null) {
        context.gen_poly = context.genPoly(context.n_ec_bytes);
      }

      var i;
      var LFSR = new Array(context.n_ec_bytes + 1);

      for (i = 0; i < context.n_ec_bytes + 1; i++) {
        LFSR[i] = 0;
      }

      for (i = 0; i < msg.length; i++) {
        var j;
        var dbyte = msg[i] ^ LFSR[context.n_ec_bytes - 1];

        for (j = context.n_ec_bytes - 1; j > 0; j--) {
          LFSR[j] = LFSR[j - 1] ^ context.gmult(context.gen_poly[j], dbyte);
        }

        LFSR[0] = context.gmult(context.gen_poly[0], dbyte);
      }

      var parity = [];

      for (i = context.n_ec_bytes - 1; i >= 0; i--) {
        parity.push(LFSR[i]);
      }

      return parity;
    },
    /**
     * decode
     * @param bytes_in
     * @returns {Blob|string|ArrayBuffer}
     */
    decode: function (bytes_in){
      var context = this;

      context.bytes_in = bytes_in;
      context.bytes_out = bytes_in.slice();

      var n_err = context.calculateSyndroms();

      if (n_err > 0) {
        context.correctErrors();
      } else {
        context.corrected = true;
      }

      return context.bytes_out.slice(0, context.bytes_out.length - context.n_ec_bytes);
    },
    //
    // ReedSolomon implementation
    //
    /**
     *
     * genPoly
     * @param nbytes
     * @returns {*}
     */
    genPoly: function (nbytes){
      var tp;
      var tp1;
      var genpoly;
      var context = this;

      // multiply (x + a^n) for n = 1 to nbytes
      tp1 = context.zeroPoly();
      tp1[0] = 1;

      var i;

      for (i = 0; i < nbytes; i++) {
        tp = context.zeroPoly();
        tp[0] = context.gexp[i];		// set up x+a^n
        tp[1] = 1;
        genpoly = context.multPolys(tp, tp1);
        tp1 = context.copyPoly(genpoly);
      }

      return genpoly;
    },
    /**
     * calculateSyndroms
     * @returns {number}
     */
    calculateSyndroms: function (){
      var sum;
      var n_err = 0;
      var i, j;
      var context = this;

      context.syndroms = [];

      for (j = 0; j < context.n_ec_bytes; j++) {
        sum = 0;

        for (i = 0; i < context.bytes_in.length; i++) {
          sum = context.bytes_in[i] ^ context.gmult(context.gexp[j], sum);
        }

        context.syndroms.push(sum);

        if (sum > 0) {
          n_err++;
        }
      }

      return n_err;
    },
    /**
     * correctErrors
     */
    correctErrors: function (){
      var context = this;

      context.berlekampMassey();
      context.findRoots();

      context.corrected = false;

      if (2 * context.n_errors > context.n_ec_bytes) {
        context.uncorrected_reason = "too many errors";

        return;
      }

      var e;

      for (e = 0; e < context.n_errors; e++) {
        if (context.error_locs[e] >= context.bytes_in.length) {
          context.uncorrected_reason = "corrections out of scope";

          return;
        }
      }

      if (context.n_errors === 0) {
        context.uncorrected_reason = "could not identify errors";

        return;
      }

      var r;

      for (r = 0; r < context.n_errors; r++) {
        var i = context.error_locs[r];

        // evaluate omega at alpha^(-i)
        var j;
        var num = 0;

        for (j = 0; j < context.n_degree_max; j++) {
          num ^= context.gmult(context.omega[j], context.gexp[((255 - i) * j) % 255]);
        }

        // evaluate psi' (derivative) at alpha^(-i) ; all odd powers disappear
        var denom = 0;

        for (j = 0; j < context.n_degree_max; j += 2) {
          denom ^= context.gmult(context.psi[j], context.gexp[((255 - i) * (j)) % 255]);
        }

        context.bytes_out[context.bytes_out.length - i - 1] ^= context.gmult(num, context.ginv(denom));
      }

      context.corrected = true;
    },
    /**
     * berlekampMassey
     */
    berlekampMassey: function (){
      var context = this;
      // initialize Gamma, the erasure locator polynomial
      var gamma = context.zeroPoly();

      gamma[0] = 1;

      // initialize to z
      var D = context.copyPoly(gamma);

      context.mulZPoly(D);

      context.psi = context.copyPoly(gamma);

      var psi2 = new Array(context.n_degree_max);
      var k = -1;
      var L = 0;
      var i;
      var n;

      for (n = 0; n < context.n_ec_bytes; n++) {
        var d = context.computeDiscrepancy(context.psi, context.syndroms, L, n);

        if (d !== 0) {
          // psi2 = psi - d*D
          for (i = 0; i < context.n_degree_max; i++) {
            psi2[i] = context.psi[i] ^ context.gmult(d, D[i]);
          }

          if (L < (n - k)) {
            var L2 = n - k;

            k = n - L;
            // D = scale_poly(ginv(d), psi);
            for (i = 0; i < context.n_degree_max; i++) {
              D[i] = context.gmult(context.psi[i], context.ginv(d));
            }

            L = L2;
          }

          // psi = psi2
          context.psi = context.copyPoly(psi2);
        }

        context.mulZPoly(D);
      }

      // omega
      var om = context.multPolys(context.psi, context.syndroms);

      context.omega = context.zeroPoly();

      for (i = 0; i < context.n_ec_bytes; i++) {
        context.omega[i] = om[i];
      }
    },
    /**
     * findRoots
     */
    findRoots: function (){
      var context = this;

      context.n_errors = 0;
      context.error_locs = [];

      var r;
      var sum;

      for (r = 1; r < 256; r++) {
        sum = 0;

        // evaluate psi at r
        var k;

        for (k = 0; k < context.n_ec_bytes + 1; k++) {
          sum ^= context.gmult(context.gexp[(k * r) % 255], context.psi[k]);
        }

        if (sum === 0) {
          context.error_locs.push(255 - r);
          context.n_errors++;
        }
      }
    },
    //
    // Polynome functions
    //
    /**
     * computeDiscrepancy
     * @param lambda
     * @param S
     * @param L
     * @param n
     * @returns {number}
     */
    computeDiscrepancy: function (lambda, S, L, n){
      var i;
      var sum = 0;

      for (i = 0; i <= L; i++) {
        sum ^= this.gmult(lambda[i], S[n - i]);
      }

      return sum;
    },
    /**
     * copyPoly
     * @param src
     * @returns {Array}
     */
    copyPoly: function (src){
      var i;
      var context = this;
      var dst = new Array(context.n_degree_max);

      for (i = 0; i < context.n_degree_max; i++) {
        dst[i] = src[i];
      }

      return dst;
    },
    /**
     * zeroPoly
     * @returns {Array}
     */
    zeroPoly: function (){
      var i;
      var context = this;
      var poly = new Array(context.n_degree_max);

      for (i = 0; i < context.n_degree_max; i++) {
        poly[i] = 0;
      }

      return poly;
    },
    /**
     * mulZPoly
     * @param poly
     */
    mulZPoly: function (poly){
      var i;

      for (i = this.n_degree_max - 1; i > 0; i--) {
        poly[i] = poly[i - 1];
      }

      poly[0] = 0;
    },
    //
    // polynomial multiplication
    //
    /**
     * multPolys
     * @param p1
     * @param p2
     * @returns {Array}
     */
    multPolys: function (p1, p2){
      var i;
      var context = this;
      var dst = new Array(context.n_degree_max);
      var tmp1 = new Array(context.n_degree_max * 2);

      for (i = 0; i < (context.n_degree_max * 2); i++) {
        dst[i] = 0;
      }

      for (i = 0; i < context.n_degree_max; i++) {
        var j;

        for (j = context.n_degree_max; j < (context.n_degree_max * 2); j++) {
          tmp1[j] = 0;
        }

        // scale tmp1 by p1[i]
        for (j = 0; j < context.n_degree_max; j++) {
          tmp1[j] = context.gmult(p2[j], p1[i]);
        }

        // and mult (shift) tmp1 right by i
        for (j = (context.n_degree_max * 2) - 1; j >= i; j--) {
          tmp1[j] = tmp1[j - i];
        }

        for (j = 0; j < i; j++) {
          tmp1[j] = 0;
        }

        // add into partial product
        for (j = 0; j < (context.n_degree_max * 2); j++) {
          dst[j] ^= tmp1[j];
        }
      }

      return dst;
    },
    //
    // Galois Field functions
    //
    /**
     * initGaloisTables
     */
    initGaloisTables: function (){
      var pinit = 0;
      var p1 = 1;
      var p2 = 0;
      var p3 = 0;
      var p4 = 0;
      var p5 = 0;
      var p6 = 0;
      var p7 = 0;
      var p8 = 0;
      var context = this;

      context.gexp = new Array(512);
      context.glog = new Array(256);

      context.gexp[0] = 1;
      context.gexp[255] = context.gexp[0];
      context.glog[0] = 0;

      var i;

      for (i = 1; i < 256; i++) {
        pinit = p8;
        p8 = p7;
        p7 = p6;
        p6 = p5;
        p5 = p4 ^ pinit;
        p4 = p3 ^ pinit;
        p3 = p2 ^ pinit;
        p2 = p1;
        p1 = pinit;

        context.gexp[i] = p1 + p2 * 2 + p3 * 4 + p4 * 8 + p5 * 16 + p6 * 32 + p7 * 64 + p8 * 128;
        context.gexp[i + 255] = context.gexp[i];
      }

      for (i = 1; i < 256; i++) {
        var z;

        for (z = 0; z < 256; z++) {
          if (context.gexp[z] === i) {
            context.glog[i] = z;
            break;
          }
        }
      }

    },
    /**
     * gmult
     * @param a
     * @param b
     * @returns {*}
     */
    gmult: function (a, b){
      var context = this;

      if (a === 0 || b === 0) {
        return (0);
      }

      var i = context.glog[a];
      var j = context.glog[b];

      return context.gexp[i + j];
    },
    /**
     * ginv
     * @param elt
     * @returns {*}
     */
    ginv: function (elt){
      return (this.gexp[255 - this.glog[elt]]);
    }
  };

  function QREncode(){
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
    MODE: MODE,
    ERROR_CORRECTION_LEVEL: ERROR_CORRECTION_LEVEL,
    ALIGNMENT_PATTERNS: ALIGNMENT_PATTERNS,
    VERSION_INFO: VERSION_INFO,
    FORMAT_INFO: FORMAT_INFO,
    CODEWORDS: CODEWORDS,
    EC_CODEWORDS: EC_CODEWORDS,
    EC_BLOCKS: EC_BLOCKS,
    ALPHANUM_REV: ALPHANUM_REV,
    setBlocks: setBlocks,
    setFunctionalPattern: setFunctionalPattern,
    countBits: countBits,
    modulesFromVersion: modulesFromVersion,
    setBackground: setBackground,
    setDark: setDark,
    isDark: isDark,
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
    encodeInit: function (ec_level, pixels){
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
    encodeAddText: function (mode, text){
      this.addTextImplementation(mode, text);
    },
    /**
     * Encode this class to an image/canvas.
     */
    encode: function (){
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
    addTextImplementation: function (mode, text){
      var context = this;

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

      function getAlphaNum(context, ch){
        if (!context.ALPHANUM_REV.hasOwnProperty(ch)) {
          throw new QRError('QREncode.InvalidChar4Alphanumeric', { char: ch }, 'Invalid character for Alphanumeric encoding [' + ch + '].');
        }

        return context.ALPHANUM_REV[ch];
      }

      function addAlphaNum(context, text){
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

      function add8bit(context, text){
        var count_bits = context.countBits(context.MODE.EightBit, context.version);

        appendBits(context.data, context.bit_idx, count_bits, text.length);

        context.bit_idx += count_bits;

        var i;

        for (i = 0; i < text.length; i++) {
          appendBits(context.data, context.bit_idx, 8, text[i].charCodeAt());

          context.bit_idx += 8;
        }
      }

      function addNumeric(context, text){
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
            throw new QRError('QREncode.InvalidChar4Numeric', { char: text[i] }, 'Invalid character for Numeric encoding [' + text[i] + '].');
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
        throw new QRError('QRCode.UnsupportedECI', { mode: mode }, 'Unsupported ECI mode: ' + mode + '.');
      }

      if (context.bit_idx / 8 > context.data_codewords) {
        throw new QRError('QREncode.TextTooLong4TargetVersion', null, 'Text too long for this EC version.');
      }
    },
    appendPadding: function (){
      var i;
      var context = this;

      for (i = Math.floor((context.bit_idx - 1) / 8) + 1; i < context.data_codewords; i += 2) {
        context.data[i] = 0xEC;
        context.data[i + 1] = 0x11;
      }
    },
    addErrorCorrection: function (){
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
    calculatePenalty: function (){
      var context = this;

      function penaltyAdjacent(context){
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

      function penaltyBlocks(context){
        // Not clear from ISO standard, if blocks have to be rectangular?
        // Here we give 3 penalty to every 2x2 block, so odd shaped areas will have penalties as well as rectangles
        var p = 0;
        var i, j, b;

        for (i = 0; i < context.modules - 1; i++) {
          for (j = 0; j < context.modules - 1; j++) {
            b = 0;

            if (context.pixels[i]  [j]) {
              b++;
            }

            if (context.pixels[i + 1][j]) {
              b++;
            }

            if (context.pixels[i]  [j + 1]) {
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

      function penaltyDarkLight(context){
        // we shift bits in one by one, and see if the resulting pattern match the bad one
        var p = 0;
        var i, j;
        var rc, pat;
        var bad = ( 128 - 1 - 2 - 32 ) << 4;	// 4_ : 1D : 1L : 3D : 1L : 1D : 4x
        var badmask1 = 2048 - 1;		// 4_ : 1D : 1L : 3D : 1L : 1D : 4L
        var badmask2 = badmask1 << 4;		// 4L : 1D : 1L : 3D : 1L : 1D : 4_
        var patmask = 32768 - 1;		// 4  +           7            + 4
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

      function penaltyDark(context){
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
    encodeBestMask: function (){
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
    encodeFunctionalPatterns: function (mask){
      var context = this;

      function encodeFinderPattern(context, x, y){
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

      function encodeVersionTopright(context){
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

      function encodeVersionBottomleft(context){
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

      function encodeTimingPattern(context, horizontal){
        var i;

        for (i = 8; i < context.modules - 8; i += 2) {
          if (horizontal) {
            context.pixels[i][6] = true;
          } else {
            context.pixels[6][i] = true;
          }
        }

      }

      function encodeOneAlignmentPattern(context, x, y){
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

      function encodeAlignmentPatterns(context){
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

      function encodeFormatNW(context, code){
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

      function encodeFormatNESW(context, code){
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
    encodeData: function (qrmask){
      var context = this;

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
    pixelsToImage: function (){
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
    getDataCapacity: function (mode, version, ec_level){
      var context = this;
      var codewords = context.CODEWORDS[version];
      var ec_codewords = context.EC_CODEWORDS[version][ec_level];
      var data_codewords = codewords - ec_codewords;
      var bits = 8 * data_codewords;

      bits -= 4;	// mode
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
        throw new QRError('QRCode.UnsupportedECI', { mode: mode }, 'Unsupported ECI mode: ' + mode + '.');
      }

      return cap;
    },
    getVersionFromLength: function (mode, text, ec_level){
      var v;
      var length = text.length;

      for (v = 1; v <= 40; v++) {
        if (this.getDataCapacity(mode, v, ec_level) >= length) {
          return v;
        }
      }

      throw new QRError('QREncode.TextTooLong4AllVersion', null, 'Text is too long, even for a version 40 QR Code.');
    }
  };

  var encode = {
    toUTF8: toUTF8,
    toUnicode: toUnicode,
    Encode: QREncode
  };

  return encode;

})));
