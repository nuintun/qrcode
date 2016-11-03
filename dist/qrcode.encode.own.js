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

  function setBlocks(){
    var codewords = this.CODEWORDS[this.version];
    var ec_codewords = this.EC_CODEWORDS[this.version][this.error_correction_level];

    this.data_codewords = codewords - ec_codewords;

    var ec_blocks = this.EC_BLOCKS[this.version][this.error_correction_level];

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
      block_words_first = this.data_codewords / blocks;
      block_words_second = 0;
    } else {
      blocks_first = ec_blocks[0];
      blocks_second = ec_blocks[1];
      blocks = blocks_first + blocks_second;
      block_words_first = Math.floor(this.data_codewords / blocks);
      block_words_second = block_words_first + 1;
    }

    this.block_ec_words = ec_codewords / blocks;
    this.block_data_lengths = [];

    for (b = 0; b < blocks_first; b++) {
      this.block_data_lengths[b] = block_words_first;
    }

    for (b = blocks_first; b < blocks; b++) {
      this.block_data_lengths[b] = block_words_second;
    }

    this.block_indices = [];

    for (b = 0; b < blocks; b++) {
      this.block_indices[b] = [];
    }

    var w = 0;

    for (i = 0; i < block_words_first; i++) {
      for (b = 0; b < blocks; b++) {
        this.block_indices[b].push(w++);
      }
    }

    for (b = blocks_first; b < blocks; b++) {
      this.block_indices[b].push(w++);
    }

    for (i = 0; i < this.block_ec_words; i++) {
      for (b = 0; b < blocks; b++) {
        this.block_indices[b].push(w++);
      }
    }
  }

  function setFunctionalPattern(){
    function markSquare(qr, x, y, w, h){
      var i, j;

      for (i = x; i < x + w; i++) {
        for (j = y; j < y + h; j++) {
          qr.functional_pattern[i][j] = true;
        }
      }
    }

    function markAlignment(qr){
      var i, j;
      var n = qr.ALIGNMENT_PATTERNS[qr.version].length;

      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
            continue;
          }

          markSquare(
            qr,
            qr.ALIGNMENT_PATTERNS[qr.version][i] - 2,
            qr.ALIGNMENT_PATTERNS[qr.version][j] - 2,
            5,
            5
          );
        }
      }
    }

    this.functional_pattern = [];

    var x, y;

    for (x = 0; x < this.modules; x++) {
      this.functional_pattern[x] = [];

      for (y = 0; y < this.modules; y++) {
        this.functional_pattern[x][y] = false;
      }
    }

    // Finder and Format
    markSquare(this, 0, 0, 9, 9);
    markSquare(this, this.modules - 8, 0, 8, 9);
    markSquare(this, 0, this.modules - 8, 9, 8);

    // Timing
    markSquare(this, 8, 6, this.modules - 8 - 8, 1);
    markSquare(this, 6, 8, 1, this.modules - 8 - 8);

    // Alignment
    markAlignment(this);

    // Version
    if (this.version >= 7) {
      markSquare(this, 0, this.modules - 11, 6, 3);
      markSquare(this, this.modules - 11, 0, 3, 6);
    }
  }

  function countBits(mode, version){
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
      }
      else { return 13; }
    } else if (mode === this.MODE.Numeric) {
      if (version < 10) {
        return 10;
      } else if (version < 27) {
        return 12;
      } else {
        return 14;
      }
    }

    throw 'Internal error: Unknown mode: ' + mode;
  }

  function modulesFromVersion(version){
    return 17 + 4 * version;
  }

  function setBackground(){
    return this.image.setBackground.apply(this.image, arguments);
  }

  function setDark(){
    return this.image.setDark.apply(this.image, arguments);
  }

  function isDark(){
    return this.image.isDark.apply(this.image, arguments);
  }

  function Pixels(version){
    this.version = version;
  }

  inherits(Pixels, Array, {
    setBackground: function (){
      var i, j;
      var modules = this.length;

      for (i = 0; i < modules; i++) {
        for (j = 0; j < modules; j++) {
          this[i][j] = false;
        }
      }
    },
    setDark: function (x, y){
      var modules = this.length;

      // Ignoring d, since a pixel array has d=1
      if (x > modules - 1 || y > modules - 1) {
        return false;
      }

      this[x][y] = true;

      return true;
    },
    isDark: function (x, y){
      var modules = this.length;

      // Ignoring d, since a pixel array has d=1
      if (x > modules - 1 || y > modules - 1) {
        return false;
      }

      return this[x][y];
    }
  });

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
    this.n_ec_bytes = n_ec_bytes;
    this.n_degree_max = 2 * n_ec_bytes;
    this.syndroms = [];
    this.gen_poly = null;

    this.initGaloisTables();
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
      // Return parity bytes
      // Simulate a LFSR with generator polynomial for n byte RS code.
      if (this.gen_poly == null) {
        this.gen_poly = this.genPoly(this.n_ec_bytes);
      }

      var i;
      var LFSR = new Array(this.n_ec_bytes + 1);

      for (i = 0; i < this.n_ec_bytes + 1; i++) {
        LFSR[i] = 0;
      }

      for (i = 0; i < msg.length; i++) {
        var j;
        var dbyte = msg[i] ^ LFSR[this.n_ec_bytes - 1];

        for (j = this.n_ec_bytes - 1; j > 0; j--) {
          LFSR[j] = LFSR[j - 1] ^ this.gmult(this.gen_poly[j], dbyte);
        }

        LFSR[0] = this.gmult(this.gen_poly[0], dbyte);
      }

      var parity = [];

      for (i = this.n_ec_bytes - 1; i >= 0; i--) {
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
      this.bytes_in = bytes_in;
      this.bytes_out = bytes_in.slice();

      var n_err = this.calculateSyndroms();

      if (n_err > 0) {
        this.correctErrors();
      } else {
        this.corrected = true;
      }

      return this.bytes_out.slice(0, this.bytes_out.length - this.n_ec_bytes);
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

      // multiply (x + a^n) for n = 1 to nbytes
      tp1 = this.zeroPoly();
      tp1[0] = 1;

      var i;

      for (i = 0; i < nbytes; i++) {
        tp = this.zeroPoly();
        tp[0] = this.gexp[i];		// set up x+a^n
        tp[1] = 1;
        genpoly = this.multPolys(tp, tp1);
        tp1 = this.copyPoly(genpoly);
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

      this.syndroms = [];

      for (j = 0; j < this.n_ec_bytes; j++) {
        sum = 0;

        for (i = 0; i < this.bytes_in.length; i++) {
          sum = this.bytes_in[i] ^ this.gmult(this.gexp[j], sum);
        }

        this.syndroms.push(sum);

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
      this.berlekampMassey();
      this.findRoots();

      this.corrected = false;

      if (2 * this.n_errors > this.n_ec_bytes) {
        this.uncorrected_reason = "too many errors";

        return;
      }

      var e;

      for (e = 0; e < this.n_errors; e++) {
        if (this.error_locs[e] >= this.bytes_in.length) {
          this.uncorrected_reason = "corrections out of scope";

          return;
        }
      }

      if (this.n_errors === 0) {
        this.uncorrected_reason = "could not identify errors";

        return;
      }

      var r;

      for (r = 0; r < this.n_errors; r++) {
        var i = this.error_locs[r];

        // evaluate omega at alpha^(-i)
        var j;
        var num = 0;

        for (j = 0; j < this.n_degree_max; j++) {
          num ^= this.gmult(this.omega[j], this.gexp[((255 - i) * j) % 255]);
        }

        // evaluate psi' (derivative) at alpha^(-i) ; all odd powers disappear
        var denom = 0;

        for (j = 0; j < this.n_degree_max; j += 2) {
          denom ^= this.gmult(this.psi[j], this.gexp[((255 - i) * (j)) % 255]);
        }

        this.bytes_out[this.bytes_out.length - i - 1] ^= this.gmult(num, this.ginv(denom));
      }

      this.corrected = true;
    },
    /**
     * berlekampMassey
     */
    berlekampMassey: function (){

      // initialize Gamma, the erasure locator polynomial
      var gamma = this.zeroPoly();

      gamma[0] = 1;

      // initialize to z
      var D = this.copyPoly(gamma);

      this.mulZPoly(D);

      this.psi = this.copyPoly(gamma);

      var psi2 = new Array(this.n_degree_max);
      var k = -1;
      var L = 0;
      var i;
      var n;

      for (n = 0; n < this.n_ec_bytes; n++) {
        var d = this.computeDiscrepancy(this.psi, this.syndroms, L, n);

        if (d !== 0) {
          // psi2 = psi - d*D
          for (i = 0; i < this.n_degree_max; i++) {
            psi2[i] = this.psi[i] ^ this.gmult(d, D[i]);
          }

          if (L < (n - k)) {
            var L2 = n - k;

            k = n - L;
            // D = scale_poly(ginv(d), psi);
            for (i = 0; i < this.n_degree_max; i++) {
              D[i] = this.gmult(this.psi[i], this.ginv(d));
            }

            L = L2;
          }

          // psi = psi2
          this.psi = this.copyPoly(psi2);
        }

        this.mulZPoly(D);
      }

      // omega
      var om = this.multPolys(this.psi, this.syndroms);

      this.omega = this.zeroPoly();

      for (i = 0; i < this.n_ec_bytes; i++) {
        this.omega[i] = om[i];
      }
    },
    /**
     * findRoots
     */
    findRoots: function (){
      this.n_errors = 0;
      this.error_locs = [];

      var r;
      var sum;

      for (r = 1; r < 256; r++) {
        sum = 0;

        // evaluate psi at r
        var k;

        for (k = 0; k < this.n_ec_bytes + 1; k++) {
          sum ^= this.gmult(this.gexp[(k * r) % 255], this.psi[k]);
        }

        if (sum === 0) {
          this.error_locs.push(255 - r);
          this.n_errors++;
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
      var dst = new Array(this.n_degree_max);

      for (i = 0; i < this.n_degree_max; i++) {
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
      var poly = new Array(this.n_degree_max);

      for (i = 0; i < this.n_degree_max; i++) {
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
      var dst = new Array(this.n_degree_max);
      var tmp1 = new Array(this.n_degree_max * 2);

      for (i = 0; i < (this.n_degree_max * 2); i++) {
        dst[i] = 0;
      }

      for (i = 0; i < this.n_degree_max; i++) {
        var j;

        for (j = this.n_degree_max; j < (this.n_degree_max * 2); j++) {
          tmp1[j] = 0;
        }

        // scale tmp1 by p1[i]
        for (j = 0; j < this.n_degree_max; j++) {
          tmp1[j] = this.gmult(p2[j], p1[i]);
        }

        // and mult (shift) tmp1 right by i
        for (j = (this.n_degree_max * 2) - 1; j >= i; j--) {
          tmp1[j] = tmp1[j - i];
        }

        for (j = 0; j < i; j++) {
          tmp1[j] = 0;
        }

        // add into partial product
        for (j = 0; j < (this.n_degree_max * 2); j++) {
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

      this.gexp = new Array(512);
      this.glog = new Array(256);

      this.gexp[0] = 1;
      this.gexp[255] = this.gexp[0];
      this.glog[0] = 0;

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

        this.gexp[i] = p1 + p2 * 2 + p3 * 4 + p4 * 8 + p5 * 16 + p6 * 32 + p7 * 64 + p8 * 128;
        this.gexp[i + 255] = this.gexp[i];
      }

      for (i = 1; i < 256; i++) {
        var z;

        for (z = 0; z < 256; z++) {
          if (this.gexp[z] === i) {
            this.glog[i] = z;
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
      if (a === 0 || b === 0) {
        return (0);
      }

      var i = this.glog[a];
      var j = this.glog[b];

      return this.gexp[i + j];
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
        add8bit(this, text);
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
      var length = text.length;

      for (v = 1; v <= 40; v++) {
        if (this.getDataCapacity(mode, v, ec_level) >= length) {
          return v;
        }
      }

      throw('Text is too long, even for a version 40 QR Code');
    }
  };

  var encode = {
    toUTF8: toUTF8,
    toUnicode: toUnicode,
    Encode: QREncode
  };

  return encode;

})));
