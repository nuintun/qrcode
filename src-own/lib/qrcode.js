/* ************************************************************

 QR-Logo: http://qrlogo.kaarposoft.dk

 Copyright (C) 2011 Henrik Kaare Poulsen

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */


/* ************************************************************ */
/* Settings for http://www.jslint.com/
 */

/*jslint browser: true */
/*jslint bitwise: true */
/*jslint vars: true */
/*jslint white: true */
/*jslint plusplus: true */
/*jslint continue: true */
/*global alert: true */
/*global ReedSolomon: true */


/* ************************************************************ */
/* JavaScript STRICT mode
 */
"use strict";

/* ************************************************************
 * QRCodeDecode CONSTRUCTOR
 * ************************************************************
 */

/** @class
 *  Encode or decode QR Code
 */

function QRCodeDecode(){

  this.logger = null;

  this.debug_addText = true;
  this.debug_encodeBestMask = true;
  this.debug_addErrorCorrection = true;
  this.debug_setBlocks = true;
  this.debug_findModuleSize = true;
  this.debug_extractCodewords = true;
  this.debug_extractData = true;
  this.debug_correctErrors = true;

  this.debug_insane = false;

  this.image = null;
  this.image_top = 0;
  this.image_bottom = 0;
  this.image_left = 0;
  this.image_right = 0;

  this.mask = 0;
  this.modules = 0;
  this.module_size = 0;
  this.version = 0;
  this.functional_grade = 0;
  this.error_correction_level = 0;

  this.block_ec_words = 0;
  this.block_indices = [];
  this.block_data_lengths = [];
}

/* ************************************************************
 * QRCodeDecode PROTOTYPE
 * ************************************************************
 */

QRCodeDecode.prototype = {

  /* ************************************************************
   * QRCodeDecode CONSTANTS
   * ************************************************************
   */

  /** Mode according to ISO/IEC 18004:2006(E) Section 6.3 */
  MODE: {
    Numeric: 1,
    AlphaNumeric: 2,
    EightBit: 4,
    Terminator: 0
  },

  /** Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1 */
  ERROR_CORRECTION_LEVEL: {
    L: 1,	//  7%
    M: 0,	// 15%
    Q: 3,	// 25%
    H: 2	// 30%
  },

  /* ************************************************************
   * QRCodeDecode main encode functions to be called by clients
   * ************************************************************
   */

  /**  Encode a text into a QR Code in a canvas
   *
   * @param mode          Mode according to ISO/IEC 18004:2006(E) Section 6.3
   * @param text          The text to be encoded
   * @param version       Version according to ISO/IEC 18004:2006(E) Section 5.3.1
   * @param ec_level      Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
   * @param module_size   Number of pixels per module
   * @param canvas        The canvas to encode into
   * @param bg_rgb        Array [r, g, b] where 0<=color<=255
   * @param module_rgb    Array [r, g, b] where 0<=color<=255
   */
  encodeToCanvas: function (mode, text, version, ec_level, module_size, canvas, bg_rgb, module_rgb){

    if (!bg_rgb) { bg_rgb = [0.98, 0.98, 1.0]; }
    if (!module_rgb) { module_rgb = [0.3, 0.05, 0.05]; }

    var ctx = canvas.getContext('2d');

    canvas.setBackground = function (){
      ctx.fillStyle = "rgb(" + Math.round(bg_rgb[0] * 255) + "," + Math.round(bg_rgb[1] * 255) + "," + Math.round(bg_rgb[2] * 255) + ")";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgb(" + Math.round(module_rgb[0] * 255) + "," + Math.round(module_rgb[1] * 255) + "," + Math.round(module_rgb[2] * 255) + ")";
    };

    canvas.setDark = function (x, y, d){
      ctx.fillRect(x, y, d, d);
    };

    this.encodeInit(version, ec_level, module_size, canvas);
    this.encodeAddText(mode, text);
    this.encode();
  },

  /*  ************************************************************ */
  /** Encode text into a QR Code in a pixel array
   *
   *  @param mode      Mode according to ISO/IEC 18004:2006(E) Section 6.3
   *  @param text      The text to be encoded
   *  @param version   Version according to ISO/IEC 18004:2006(E) Section 5.3.1
   *  @param ec_level  Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
   */

  encodeToPixarray: function (mode, text, version, ec_level){

    var modules = this.modulesFromVersion(version) + 4 + 4;

    var pix = {};
    pix.width = modules;
    pix.height = modules;
    pix.arr = [];
    var i;
    for (i = 0; i < modules; i++) {
      pix.arr[i] = [];
    }

    pix.setBackground = function (){
      for (i = 0; i < modules; i++) {
        var j;
        for (j = 0; j < modules; j++) {
          this.arr[i][j] = false;
        }
      }
    };

    pix.setDark = function (x, y, d){
      // Ignoring d, since a pixel array has d=1
      if (x > modules - 1) { return; }
      this.arr[x][y] = true;
    };

    pix.isDark = function (x, y, d){
      // Ignoring d, since a pixel array has d=1

      if (x > this.modules - 1) { return false; }

      return pix.arr[x][y];
    };

    this.encodeInit(version, ec_level, 1, pix);
    this.encodeAddText(mode, text);
    this.encode();

    return pix;
  },

  /*  ************************************************************ */
  /** Prepare for encoding text to QR Code
   *
   *  @param version       Version according to ISO/IEC 18004:2006(E) Section 5.3.1
   *  @param ec_level      Error correction level according to ISO/IEC 18004:2006(E) Section 6.5.1
   *  @param module_size   Number of pixels per module
   *  @param canvas        Canvas or pixel array
   */
  encodeInit: function (version, ec_level, module_size, canvas){

    this.version = version;
    this.error_correction_level = ec_level;
    this.module_size = module_size;
    this.modules = this.modulesFromVersion(version);

    this.image = canvas;
    this.image_top = 4 * module_size;
    this.image_left = 4 * module_size;
    this.image.width = (4 + 4 + this.modules) * module_size;
    this.image.height = (4 + 4 + this.modules) * module_size;
    this.image.setBackground();

    this.bit_idx = 0;
    this.setBlocks();

    this.data = [];
    var i;
    for (i = 0; i < this.data_codewords; i++) { this.data[i] = 0; }

    this.pixels = [];
    for (i = 0; i < this.modules; i++) { this.pixels[i] = []; }

  },

  /*  ************************************************************ */
  /** Add text to a QR code
   *
   *  @param mode  Mode according to ISO/IEC 18004:2006(E) Section 6.3
   *  @param text  The text to be encoded
   */
  encodeAddText: function (mode, text){
    this.addTextImplementation(mode, text);
  },

  /*  ************************************************************ */
  /** Encode this class to an image/canvas.
   */
  encode: function (){
    this.addTextImplementation(this.MODE.Terminator, null);
    this.appendPadding();
    this.addErrorCorrection();
    this.encodeBestMask();
    this.pixelsToImage();
  },

  /* ************************************************************
   * QRCodeDecode MAIN DECODE FUNCTIONS TO BE CALLED BY CLIENTS
   * ************************************************************
   */

  /**  Decode a pixel array */
  decodePixarray: function (pix){
    return this.decodeImage(pix);
  },

  /*  ************************************************************ */
  /** Decode image data as QR Code
   *
   *  @param image_data    The image data (canvas.getContext('2d').getImageData, pixel array or similar)
   *  @param image_width   The pixel width of the image
   *  @param image_height  The pixel height of the image
   */
  decodeImageData: function (image_data, image_width, image_height){
    this.setImageData(image_data, image_width, image_height);
    return this.decode();
  },

  /*  ************************************************************ */
  /** Decode image data as QR Code
   *
   *  @param image_data    The image data (canvas.getContext('2d').getImageData, pixel array or similar)
   *  @param image_width   The pixel width of the image
   *  @param image_height  The pixel height of the image
   *  @param left          Leftmost pixel of image
   *  @param right         Rightmost pixel of image
   *  @param top           Top pixel of image
   *  @param bottom        Bottom pixel of image
   *  @param max_version   Do not try to decode with version higher than this
   */
  decodeImageDataInsideBordersWithMaxVersion: function (image_data, image_width, image_height, left, right, top, bottom, max_version){
    this.setImageData(image_data, image_width, image_height);
    this.image_left = left;
    this.image_right = right;
    this.image_top = top;
    this.image_bottom = bottom;
    this.image_size = ( (this.image_right - this.image_left + 1) + (this.image_bottom - this.image_top + 1) ) / 2.0;
    this.max_version = max_version;
    return this.decodeInsideBordersWithMaxVersion();
  },

  /*  ************************************************************ */
  /** Set image data in preparation for decoding QR Code
   *
   *  @param image_data    The image data (canvas.getContext('2d').getImageData, pixel array or similar)
   *  @param image_width   The pixel width of the image
   *  @param image_height  The pixel height of the image
   */

  setImageData: function (image_data, image_width, image_height){

    image_data.min_col = 255;
    image_data.max_col = 0;
    var total = 0;
    var x, y;
    for (x = 0; x < image_width; x++) {
      for (y = 0; y < image_height; y++) {
        var p = x * 4 + y * image_width * 4;
        var v = 0.30 * image_data.data[p] + 0.59 * image_data.data[p + 1] + 0.11 * image_data.data[p + 2];
        total += v;
        if (v < image_data.min_col) { image_data.min_col = v; }
        if (v > image_data.max_col) { image_data.max_col = v; }
      }
    }

    if (image_data.max_col - image_data.min_col < 255 / 10) {
      throw ("Image does not have enough contrast (this.image_data.min_col=" + image_data.min_col + " this.image_data.max_col=" + image_data.max_col + ")");
    }
    image_data.threshold = total / (image_width * image_height);
    //image_data.threshold = (image_data.max_col+image_data.min_col)/2;

    image_data.getGray = function (x, y, d){
      var n = 0;
      var i;
      for (i = x; i < x + d; i++) {
        var j;
        for (j = y; j < y + d; j++) {
          var p = i * 4 + j * this.width * 4;
          n = n + 0.30 * this.data[p] + 0.59 * this.data[p + 1] + 0.11 * this.data[p + 2];
        }
      }
      return n / d / d;
    };

    image_data.isDark = function (x, y, d){
      var g = this.getGray(x, y, d);
      return g < this.threshold;
    };

    this.image = image_data;
  },

  /*  ************************************************************ */
  /** Decode a QR Code in an image.
   *  The image MUST already have .getGray set
   */
  decodeImage: function (image){
    this.image = image;
    return this.decode();
  },

  /*  ************************************************************ */
  /** Decode a QR Code in an image which has already been set.
   */
  decode: function (){
    this.findImageBorders();
    this.max_version = 40;
    this.decodeInsideBordersWithMaxVersion();
    return this.data;
  },

  /*  ************************************************************ */
  /** Decode a QR Code in an image which has already been set -
   *  inside borders already defined
   */
  decodeInsideBordersWithMaxVersion: function (){
    this.findModuleSize();
    this.setFunctionalPattern();
    this.extractCodewords();
    this.setBlocks();
    this.correctErrors();
    this.extractData();
    return this.data;
  },

  /* ************************************************************
   * QRCodeDecode INTERNAL ENCODING FUNCTIONS
   * ************************************************************
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

    /* ************************************************************ */
    function getAlphaNum(qr, ch){
      if (!qr.ALPHANUM_REV.hasOwnProperty(ch)) {
        throw ("Invalid character for Alphanumeric encoding [" + ch + "]");
      }
      return qr.ALPHANUM_REV[ch];
    }

    /* ************************************************************ */
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

    /* ************************************************************ */
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

    /* ************************************************************ */
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
          throw ("Invalid character for Numeric encoding [" + text[i] + "]");
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

    /* ************************************************************
     * addTextImplementation
     */

    appendBits(this.data, this.bit_idx, 4, mode);
    this.bit_idx += 4;

    if (mode === this.MODE.AlphaNumeric) { addAlphaNum(this, text); }
    else if (mode === this.MODE.EightBit) { add8bit(this, text); }
    else if (mode === this.MODE.Numeric) { addNumeric(this, text); }
    else if (mode === this.MODE.Terminator) { return; }
    else { throw ("Unsupported ECI mode: " + mode); }

    if (this.debug_addText) {
      if (this.logger) {
        this.logger.debug("addTextImplementation data = " + this.data.join(","));
      }
    }

    if (this.debug_addText) {
      if (this.logger) {
        this.logger.debug("addTextImplementation bit_idx/8=" + this.bit_idx / 8 + " n=" + this.data_codewords);
      }
    }

    if (this.bit_idx / 8 > this.data_codewords) {
      throw ("Text too long for this EC version");
    }

  },

  /* ************************************************************ */
  appendPadding: function (){
    var i;
    for (i = Math.floor((this.bit_idx - 1) / 8) + 1; i < this.data_codewords; i += 2) {
      this.data[i] = 0xEC;
      this.data[i + 1] = 0x11;
    }
  },

  /* ************************************************************ */
  addErrorCorrection: function (){
    if (this.debug_addText) {
      if (this.logger) {
        this.logger.debug("addErrorCorrection data = " + this.data.join(","));
      }
    }

    var rs = new ReedSolomon(this.block_ec_words);
    if (this.debug_addErrorCorrection) { rs.logger = this.logger; }

    var bytes = [];

    var n = 0;
    var b;
    for (b = 0; b < this.block_data_lengths.length; b++) {

      var m = this.block_data_lengths[b];
      var bytes_in = this.data.slice(n, n + m);
      n += m;

      var i;
      for (i = 0; i < m; i++) {
        bytes[this.block_indices[b][i]] = bytes_in[i];
      }

      var bytes_out = rs.encode(bytes_in);

      for (i = 0; i < bytes_out.length; i++) {
        bytes[this.block_indices[b][m + i]] = bytes_out[i];
      }

    }

    if (this.debug_addErrorCorrection) {
      if (this.logger) {
        this.logger.debug("addErrorCorrection bytes = " + bytes.join(","));
      }
    }

    this.bytes = bytes;

  },

  /* ************************************************************ */
  calculatePenalty: function (mask){
    /* ************************************************************ */
    function penaltyAdjacent(qr){
      var p = 0;
      var i;
      for (i = 0; i < qr.modules; i++) {
        var dark = [0, 0];
        var light = [0, 0];
        var rc;
        for (rc = 0; rc <= 1; rc++) {
          var j;
          for (j = 0; j < qr.modules; j++) {
            if (qr.pixels[rc * i + (1 - rc) * j][(1 - rc) * i + rc * j]) {
              if (light[rc] > 5) { p += (3 + light[rc] - 5); }
              light[rc] = 0;
              dark[rc]++;
            } else {
              if (dark[rc] > 5) { p += (3 + dark[rc] - 5); }
              light[rc]++;
              dark[rc] = 0;
            }
          }
          if (light[rc] > 5) { p += (3 + light[rc] - 5); }
          if (dark[rc] > 5) { p += (3 + dark[rc] - 5); }
        }
      }
      return p;
    }

    /* ************************************************************ */
    function penaltyBlocks(qr){
      // Not clear from ISO standard, if blocks have to be rectangular?
      // Here we give 3 penalty to every 2x2 block, so odd shaped areas will have penalties as well as rectangles
      var p = 0;
      var i;
      for (i = 0; i < qr.modules - 1; i++) {
        var j;
        for (j = 0; j < qr.modules - 1; j++) {
          var b = 0;
          if (qr.pixels[i]  [j]) { b++; }
          if (qr.pixels[i + 1][j]) { b++; }
          if (qr.pixels[i]  [j + 1]) { b++; }
          if (qr.pixels[i + 1][j + 1]) { b++; }
          if ((b === 0) || (b === 4)) { p += 3; }
        }
      }
      return p;
    }

    /* ************************************************************ */
    function binFormat(b){
      return ("00000000000000" + b.toString(2)).slice(-15);
    }

    /* ************************************************************ */
    function penaltyDarkLight(qr){
      // we shift bits in one by one, and see if the resulting pattern match the bad one
      var p = 0;
      var bad = ( 128 - 1 - 2 - 32 ) << 4;	// 4_ : 1D : 1L : 3D : 1L : 1D : 4x
      var badmask1 = 2048 - 1;		// 4_ : 1D : 1L : 3D : 1L : 1D : 4L
      var badmask2 = badmask1 << 4;		// 4L : 1D : 1L : 3D : 1L : 1D : 4_
      var patmask = 32768 - 1;		// 4  +           7            + 4
      var i;
      for (i = 0; i < qr.modules - 1; i++) {
        var pat = [0, 0];
        var j;
        for (j = 0; j < qr.modules - 1; j++) {
          var rc;
          for (rc = 0; rc <= 1; rc++) {
            pat[rc] = (pat[rc] << 1) & patmask;
            if (qr.pixels[rc * i + (1 - rc) * j][(1 - rc) * i + rc * j]) { pat[rc]++; }
            if (qr.debug_insane) {
              qr.logger.debug(
                "PENALTY p=" + p +
                " x=" + (rc * i + (1 - rc) * j) +
                " y=" + ((1 - rc) * i + rc * j) +
                " pat=" + binFormat(pat[rc]) +
                " b1=" + binFormat(pat[rc] & badmask1) +
                " p2=" + binFormat(pat[rc] & badmask2) +
                " bad=" + binFormat(bad));
            }
            if (j >= 7 + 4) {
              if ((pat[rc] & badmask1) === bad) {
                p += 40;
              } else {
                if (j < qr.modules - 4 - 7) {
                  if ((pat[rc] & badmask2) === bad) { p += 40; }
                }
              }
            }
          }
        }
      }
      return p;
    }

    /* ************************************************************ */
    function penaltyDark(qr){
      var dark = 0;
      var i;
      for (i = 0; i < qr.modules - 1; i++) {
        var j;
        for (j = 0; j < qr.modules - 1; j++) {
          if (qr.pixels[i][j]) { dark++; }
        }
      }
      return 10 * Math.floor(Math.abs(dark / (qr.modules * qr.modules) - 0.5) / 0.05);
    }

    /* ************************************************************ */
    /* calculatePenalty
     */

    var p_adjacent = penaltyAdjacent(this);
    var p_blocks = penaltyBlocks(this);
    var p_darkLight = penaltyDarkLight(this);
    var p_dark = penaltyDark(this);
    var p_total = p_adjacent + p_blocks + p_darkLight + p_dark;

    if (this.debug_encodeBestMask) {
      if (this.logger) {
        this.logger.debug("mask=" + mask + " penalty=" + p_total + " (" + p_adjacent + ", " + p_blocks + ", " + p_darkLight + ", " + p_dark + ")");
      }
    }

    return p_total;
  },

  /* ************************************************************ */
  encodeBestMask: function (){
    var best_mask = 0;
    var best_penalty = 999999;

    this.setFunctionalPattern();
    var mask;
    var i;
    var j;
    for (mask = 0; mask < 8; mask++) {
      for (i = 0; i < this.modules; i++) {
        for (j = 0; j < this.modules; j++) {
          this.pixels[i][j] = false;
        }
      }
      this.encodeFunctionalPatterns(mask);
      this.encodeData(mask);
      var penalty = this.calculatePenalty(mask);
      if (penalty < best_penalty) {
        best_penalty = penalty;
        best_mask = mask;
      }
    }

    if (this.debug_encodeBestMask) {
      if (this.logger) {
        this.logger.debug("best_mask=" + best_mask + " best_penalty=" + best_penalty);
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

  /* ************************************************************ */
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

    /* ************************************************************ */
    function encodeVersionTopright(qr){
      var pattern = qr.VERSION_INFO[qr.version];
      var y;
      for (y = 0; y < 6; y++) {
        var x;
        for (x = qr.modules - 11; x < qr.modules - 11 + 3; x++) {
          if (pattern & 1) { qr.pixels[x][y] = true; }
          pattern /= 2;
        }
      }
    }

    /* ************************************************************ */
    function encodeVersionBottomleft(qr){
      var pattern = qr.VERSION_INFO[qr.version];
      var x;
      for (x = 0; x < 6; x++) {
        var y;
        for (y = qr.modules - 11; y < qr.modules - 11 + 3; y++) {
          if (pattern & 1) { qr.pixels[x][y] = true; }
          pattern /= 2;
        }
      }
    }

    /* ************************************************************ */
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

    /* ************************************************************ */
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

    /* ************************************************************ */
    function encodeAlignmentPatterns(qr){
      var n = qr.ALIGNMENT_PATTERNS[qr.version].length;
      var i;
      for (i = 0; i < n; i++) {
        var j;
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) { continue; }
          encodeOneAlignmentPattern(qr, qr.ALIGNMENT_PATTERNS[qr.version][i] - 2, qr.ALIGNMENT_PATTERNS[qr.version][j] - 2);
        }
      }
    }

    /* ************************************************************ */
    function encodeFormatNW(qr, code){
      var x = 8;
      var y;
      for (y = 0; y <= 5; y++) {
        if (code & 1) { qr.pixels[x][y] = true; }
        code /= 2;
      }
      if (code & 1) { qr.pixels[8][7] = true; }
      code /= 2;
      if (code & 1) { qr.pixels[8][8] = true; }
      code /= 2;
      if (code & 1) { qr.pixels[7][8] = true; }
      code /= 2;

      y = 8;
      for (x = 5; x >= 0; x--) {
        if (code & 1) { qr.pixels[x][y] = true; }
        code /= 2;
      }
    }

    /* ************************************************************ */
    function encodeFormatNESW(qr, code){
      var y = 8;
      var x;
      for (x = qr.modules - 1; x > qr.modules - 1 - 8; x--) {
        if (code & 1) { qr.pixels[x][y] = true; }
        code /= 2;
      }
      x = 8;
      for (y = qr.modules - 7; y < qr.modules - 1; y++) {
        if (code & 1) { qr.pixels[x][y] = true; }
        code /= 2;
      }
    }

    /* ************************************************************
     * encodeFunctionalPatterns
     */

    encodeFinderPattern(this, 0, 0);
    encodeFinderPattern(this, 0, this.modules - 7);
    encodeFinderPattern(this, this.modules - 7, 0);

    if (this.version >= 7) {
      encodeVersionTopright(this);
      encodeVersionBottomleft(this);
    }
    encodeTimingPattern(this, true);
    encodeTimingPattern(this, false);
    if (this.version > 1) { encodeAlignmentPatterns(this); }
    var code = this.FORMAT_INFO[mask + 8 * this.error_correction_level];
    encodeFormatNW(this, code);
    encodeFormatNESW(this, code);
  },

  /* ************************************************************ */
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

    /* ************************************************************ */
    /* encodeData
     */

    var writingUp = true;
    var n = 0;
    var v = this.bytes[n];
    var bitsWritten = 0;
    var mask = (1 << 7);
    var j;

    // Write columns in pairs, from right to left
    for (j = this.modules - 1; j > 0; j -= 2) {
      if (j === 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }
      // Read alternatingly from bottom to top then top to bottom
      var count;
      for (count = 0; count < this.modules; count++) {
        var i = writingUp ? this.modules - 1 - count : count;
        var col;
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

  /* ************************************************************ */
  pixelsToImage: function (){
    var i, j;
    for (i = 0; i < this.modules; i++) {
      for (j = 0; j < this.modules; j++) {
        if (this.pixels[i][j]) { this.setDark(i, j); }
      }
    }
  },

  /* ************************************************************
   * QRCodeDecode INTERNAL DECODING FUNCTIONS
   * ************************************************************
   */

  findImageBorders: function (){
    var i, j, n;
    var limit = 7;
    var skew_limit = 2;

    for (i = 0; i < this.image.width; i++) {
      n = 0;
      for (j = 0; j < this.image.height; j++) {
        n = n + this.image.isDark(i, j, 1);
      }
      if (n >= limit) { break; }
    }
    this.image_left = i;

    for (i = this.image.width - 1; i >= 0; i--) {
      n = 0;
      for (j = 0; j < this.image.height; j++) {
        n = n + this.image.isDark(i, j, 1);
      }
      if (n >= limit) { break; }
    }
    this.image_right = i;

    for (j = 0; j < this.image.height; j++) {
      n = 0;
      for (i = 0; i < this.image.width; i++) {
        n = n + this.image.isDark(i, j, 1);
      }
      if (n >= limit) { break; }
    }
    this.image_top = j;

    for (j = this.image.height - 1; j >= 0; j--) {
      n = 0;
      for (i = 0; i < this.image.width; i++) {
        n = n + this.image.isDark(i, j, 1);
      }
      if (n >= limit) { break; }
    }
    this.image_bottom = j;

    if (this.logger) {
      this.logger.debug("left=" + this.image_left + " right=" + this.image_right + " top=" + this.image_top + " bottom=" + this.image_bottom);
    }

    if ((this.image_right - this.image_left + 1 < 21) || (this.image_bottom - this.image_top + 1 < 21)) {
      throw ("Found no image data to decode");
    }

    if (Math.abs((this.image_right - this.image_left) - (this.image_bottom - this.image_top)) > skew_limit) {
      throw ("Image data is not rectangular");
    }

    this.image_size = ( (this.image_right - this.image_left + 1) + (this.image_bottom - this.image_top + 1) ) / 2.0;
    if (this.logger) {
      this.logger.debug("size=" + this.image_size);
    }
  },

  /* ************************************************************ */
  findModuleSize: function (){

    /* returns number of matches found
     * perferct is 8*8 = 64
     */
    function matchFinderPattern(qr, x, y, quiet_x, quiet_y, module_size){
      var i, j;
      var n = 0;

      // Outer 7x7 black boundary
      for (i = 0; i <= 5; i++) {
        if (qr.isDarkWithSize(x + i, y, module_size)) { n = n + 1; }
        if (qr.isDarkWithSize(x + 6, y + i, module_size)) { n = n + 1; }
        if (qr.isDarkWithSize(x + 6 - i, y + 6, module_size)) { n = n + 1; }
        if (qr.isDarkWithSize(x, y + 6 - i, module_size)) { n = n + 1; }
      }

      // Intermediate 5*5 white
      for (i = 0; i <= 3; i++) {
        if (!qr.isDarkWithSize(x + i + 1, y + 1, module_size)) { n = n + 1; }
        if (!qr.isDarkWithSize(x + 5, y + i + 1, module_size)) { n = n + 1; }
        if (!qr.isDarkWithSize(x + 5 - i, y + 5, module_size)) { n = n + 1; }
        if (!qr.isDarkWithSize(x + 1, y + 5 - i, module_size)) { n = n + 1; }
      }

      // Inner 3*3 black box
      for (i = 0; i <= 2; i++) {
        for (j = 0; j <= 2; j++) {
          if (qr.isDarkWithSize(3 + x, 3 + y, module_size)) { n = n + 1; }
        }
      }

      // quiet area
      for (i = 0; i <= 6; i++) {
        if (!qr.isDarkWithSize(x + quiet_x, y + i, module_size)) { n = n + 1; }
        if (!qr.isDarkWithSize(x + i, y + quiet_y, module_size)) { n = n + 1; }
      }

      // "bottom right" quiet area
      if (!qr.isDarkWithSize(x + quiet_x, y + quiet_y, module_size)) { n = n + 1; }

      return n;
    }

    /* ************************************************************ */
    function matchTimingPattern(qr, horizontal, modules, module_size){
      var n = 0;
      var x0 = 6;
      var y0 = 8;
      var dx = 0;
      var dy = 1;
      if (horizontal) {
        x0 = 8;
        y0 = 6;
        dx = 1;
        dy = 0;
      }
      var consecutive = 5;
      var ok = [];
      var c;
      for (c = 0; c < consecutive; c++) { ok.push(1); }
      var black = true;
      var i;
      for (i = 0; i < modules - 8 - 8; i++) {
        var x = x0 + i * dx;
        var y = y0 + i * dy;
        //qr.logger.debug("matchTimingPattern x=" + x + " y=" + y);
        if (black === qr.isDarkWithSize(x, y, module_size)) {
          n++;
          ok.push(1);
        } else {
          ok.push(0);
        }
        black = !black;
        var last5 = 0;
        for (c = ok.length - consecutive; c < ok.length - 1; c++) {
          if (ok[c]) { last5 = last5 + 1; }
        }
        if (last5 < 3) {
          //if (qr.logger) qr.logger.debug("matchTimingPattern i=" + i + " no 3 correct in last 5");
          return 0;
        }
      }
      return n;
    }

    /* ************************************************************ */
    function matchOneAlignmentPattern(qr, x, y, module_size){
      var n = 0;
      var i;

      // Outer 5x5 black boundary
      for (i = 0; i <= 3; i++) {
        if (qr.isDarkWithSize(x + i, y, module_size)) { n = n + 1; }
        if (qr.isDarkWithSize(x + 4, y + i, module_size)) { n = n + 1; }
        if (qr.isDarkWithSize(x + 4 - i, y + 4, module_size)) { n = n + 1; }
        if (qr.isDarkWithSize(x, y + 4 - i, module_size)) { n = n + 1; }
      }

      // Intermediate 3*3 white
      for (i = 0; i <= 1; i++) {
        if (!qr.isDarkWithSize(x + i + 1, y + 1, module_size)) { n = n + 1; }
        if (!qr.isDarkWithSize(x + 3, y + i + 1, module_size)) { n = n + 1; }
        if (!qr.isDarkWithSize(x + 3 - i, y + 3, module_size)) { n = n + 1; }
        if (!qr.isDarkWithSize(x + 1, y + 3 - i, module_size)) { n = n + 1; }
      }

      // center black
      if (qr.isDarkWithSize(x + 2, y + 2, module_size)) { n = n + 1; }

      return n;
    }

    /* ************************************************************ */
    function matchAlignmentPatterns(qr, version, module_size){
      var a = 0;
      var n = qr.ALIGNMENT_PATTERNS[version].length;
      var i, j;
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) { continue; }
          var na = matchOneAlignmentPattern(qr, qr.ALIGNMENT_PATTERNS[version][i] - 2, qr.ALIGNMENT_PATTERNS[version][j] - 2, module_size);
          if (na > 24) { a++; }
        }
      }
      return a;
    }

    /* ************************************************************ */
    function matchVersionCode(qr, pattern){
      var v;
      for (v = 7; v <= 40; v++) {
        var hd = qr.hammingDistance(pattern, qr.VERSION_INFO[v]);
        if (hd <= 3) { return [v, hd]; }
      }
      return [0, 4];
    }

    /* ************************************************************ */
    function matchVersionTopright(qr, modules, module_size){
      var factor = 1;
      var pattern = 0;
      var x, y;
      for (y = 0; y < 6; y++) {
        for (x = modules - 11; x < modules - 11 + 3; x++) {
          if (qr.isDarkWithSize(x, y, module_size)) { pattern += factor; }
          factor *= 2;
        }
      }
      return matchVersionCode(qr, pattern);
    }

    /* ************************************************************ */
    function matchVersionBottomleft(qr, modules, module_size){
      var factor = 1;
      var pattern = 0;
      var x, y;
      for (x = 0; x < 6; x++) {
        for (y = modules - 11; y < modules - 11 + 3; y++) {
          if (qr.isDarkWithSize(x, y, module_size)) { pattern += factor; }
          factor *= 2;
        }
      }
      return matchVersionCode(qr, pattern);
    }

    /* ************************************************************ */
    function matchFormatCode(qr, pattern){
      var f;
      for (f = 0; f < 32; f++) {
        var hd = qr.hammingDistance(pattern, qr.FORMAT_INFO[f]);
        if (hd <= 3) { return [f, hd]; }
      }
      return [0, 4];
    }

    /* ************************************************************ */
    function matchFormatNW(qr, modules, module_size){
      var factor = 1;
      var pattern = 0;
      var x = 8;
      var y;
      for (y = 0; y <= 5; y++) {
        if (qr.isDarkWithSize(x, y, module_size)) { pattern += factor; }
        factor *= 2;
      }
      if (qr.isDarkWithSize(8, 7, module_size)) { pattern += factor; }
      factor *= 2;
      if (qr.isDarkWithSize(8, 8, module_size)) { pattern += factor; }
      factor *= 2;
      if (qr.isDarkWithSize(7, 8, module_size)) { pattern += factor; }
      factor *= 2;
      y = 8;
      for (x = 5; x >= 0; x--) {
        if (qr.isDarkWithSize(x, y, module_size)) { pattern += factor; }
        factor *= 2;
      }
      return matchFormatCode(qr, pattern);
    }

    /* ************************************************************ */
    function matchFormatNESW(qr, modules, module_size){
      var factor = 1;
      var pattern = 0;
      var x;
      var y = 8;
      for (x = modules - 1; x > modules - 1 - 8; x--) {
        if (qr.isDarkWithSize(x, y, module_size)) { pattern += factor; }
        factor *= 2;
      }
      x = 8;
      for (y = modules - 7; y < modules - 1; y++) {
        if (qr.isDarkWithSize(x, y, module_size)) { pattern += factor; }
        factor *= 2;
      }
      return matchFormatCode(qr, pattern);
    }

    /* ************************************************************ */
    function gradeFinderPatterns(finder_pattern){
      var g = 4;
      var i;
      for (i = 0; i < 3; i++) {
        g = g - (64 - finder_pattern[i]);
      }
      if (g < 0) { g = 0; }
      return g;
    }

    /* ************************************************************ */
    function gradeTimingPatterns(timing_pattern, n){
      var t = (timing_pattern[0] + timing_pattern[1]) / (2 * n);
      t = 1 - t;
      if (t >= 0.14) { return 0; }
      if (t >= 0.11) { return 1; }
      if (t >= 0.07) { return 2; }
      if (t >= 0.00001) { return 3; }
      return 4;
    }

    /* ************************************************************ */
    function gradeTimingPatterns(alignment_patterns, n){
      var a = alignment_patterns / n;
      a = 1 - a;
      if (a >= 0.30) { return 0; }
      if (a >= 0.20) { return 1; }
      if (a >= 0.10) { return 2; }
      if (a >= 0.00001) { return 3; }
      return 4;
    }

    /* ************************************************************ */
    function matchVersion(qr, version){
      var g;
      var grades = [];
      var modules = qr.modulesFromVersion(version);
      var module_size = qr.image_size / modules;
      var finder_pattern = [0, 0, 0];
      finder_pattern[0] = matchFinderPattern(qr, 0, 0, 7, 7, module_size);
      if (finder_pattern[0] < 64 - 3) {
        return [version, 0]; // performance hack!
      }
      finder_pattern[1] = matchFinderPattern(qr, 0, modules - 7, 7, -1, module_size);
      if (finder_pattern[0] + finder_pattern[1] < 64 + 64 - 3) {
        return [version, 0]; // performance hack!
      }
      finder_pattern[2] = matchFinderPattern(qr, modules - 7, 0, -1, 7, module_size);
      if (qr.debug_findModuleSize) {
        if (qr.logger) {
          qr.logger.debug("matchVersion version=" + version +
            " finder0=" + finder_pattern[0] +
            " finder1=" + finder_pattern[1] +
            " finder2=" + finder_pattern[2]);
        }
      }

      g = gradeFinderPatterns(finder_pattern);
      if (g < 1) {
        return [version, 0];
      } else {
        grades.push(g);
      }

      var version_topright = [0, 0];
      var version_bottomleft = [0, 0];
      if (version >= 7) {
        version_topright = matchVersionTopright(qr, modules, module_size);
        version_bottomleft = matchVersionBottomleft(qr, modules, module_size);

        if (qr.debug_findModuleSize) {
          if (qr.logger) {
            qr.logger.debug("matchVersion version=" + version +
              " version topright = " + version_topright[0] + " " + version_topright[1] +
              " version bottomleft = " + version_bottomleft[0] + " " + version_bottomleft[1]);
          }
        }

        var v1 = version;
        if (version_topright[1] < version_bottomleft[1]) {
          if (version_topright[1] < 4) { v1 = version_topright[0]; }
        } else {
          if (version_bottomleft[1] < 4) { v1 = version_bottomleft[0]; }
        }

        if (Math.abs(v1 - version) > 2) {
          if (qr.debug_findModuleSize) {
            if (qr.logger) {
              qr.logger.debug("matchVersion: format info " + v1 + " is very different from original version info " + version);
            }
          }
        }
        if (v1 !== version) {
          if (qr.debug_findModuleSize) {
            if (qr.logger) {
              qr.logger.debug("matchVersion: revising version to " + v1 + " from " + version);
            }
          }
          version = v1;
        }
        modules = qr.modulesFromVersion(version);
        module_size = qr.image_size / modules;

        g = Math.round(( (4 - version_topright[1]) + (4 - version_bottomleft[1]) ) / 2);
        if (g < 1) {
          return [version, 0];
        } else {
          grades.push(g);
        }
      }

      var timing_pattern = [0, 0];
      timing_pattern[0] = matchTimingPattern(qr, true, modules, module_size);
      timing_pattern[1] = matchTimingPattern(qr, false, modules, module_size);

      g = gradeTimingPatterns(timing_pattern, modules - 8 - 8);
      if (g < 1) {
        return [version, 0];
      } else {
        grades.push(g);
      }

      var alignment_patterns = -3;
      if (version > 1) {
        alignment_patterns = matchAlignmentPatterns(qr, version, module_size);
      }

      if (qr.debug_findModuleSize) {
        if (qr.logger) {
          var fraction_alignment_patterns = 1;
          if (version > 1) {
            fraction_alignment_patterns = alignment_patterns /
              (qr.ALIGNMENT_PATTERNS[version].length * qr.ALIGNMENT_PATTERNS[version].length - 3);
          }
          qr.logger.debug("matchVersion version=" + version +
            " timing0=" + (timing_pattern[0] / (modules - 8 - 8)) +
            " timing1=" + (timing_pattern[1] / (modules - 8 - 8)) +
            " alignment=" + fraction_alignment_patterns);

        }
      }

      g = gradeTimingPatterns(alignment_patterns, qr.ALIGNMENT_PATTERNS[version].length * qr.ALIGNMENT_PATTERNS[version].length - 3);
      if (g < 1) {
        return [version, 0];
      } else {
        grades.push(g);
      }

      var format_NW = matchFormatNW(qr, modules, module_size);
      var format_NESW = matchFormatNESW(qr, modules, module_size);

      var format = 0;
      if (format_NW[1] < format_NESW[1]) {
        format = format_NW[0];
      } else {
        format = format_NESW[0];
      }

      var error_correction_level = Math.floor(format / 8);
      var mask = format % 8;

      if (qr.debug_findModuleSize) {
        if (qr.logger) {
          qr.logger.debug("matchVersion version=" + version +
            " format_NW =" + format_NW[0] + " " + format_NW[1] +
            " format_NESW =" + format_NESW[0] + " " + format_NESW[1] +
            " format = " + format +
            " ecl = " + error_correction_level +
            " mask = " + mask);
        }
      }

      g = Math.round(( (4 - format_NW[1]) + (4 - format_NESW[1]) ) / 2);
      if (g < 1) {
        return [version, 0];
      } else {
        grades.push(g);
      }

      var grade = 4;
      var i;
      for (i = 0; i < grades.length; i++) {
        if (grades[i] < grade) { grade = grades[i]; }
      }

      if (qr.debug_findModuleSize) {
        if (qr.logger) {
          var s = "";
          for (i = 0; i < grades.length; i++) { s = s + grades[i]; }
          s = s + "->" + "<b>" + grade + "</b>";
          qr.logger.debug("matchVersion version=" + "<b>" + version + "</b>" + " grades(F(V)TAF): " + s);
        }
      }
      return [version, grade, error_correction_level, mask];
    }

    /* **************************************************
     * findModuleSize
     */

    var best_match_so_far = [0, 0];
    var version;
    for (version = 1; version <= this.max_version; version++) {
      var match = matchVersion(this, version);
      if (match[1] > best_match_so_far[1]) { best_match_so_far = match; }
      if (match[1] === 4) { break; }
    }

    this.version = best_match_so_far[0];
    this.modules = this.modulesFromVersion(this.version);
    this.module_size = this.image_size / this.modules;
    this.functional_grade = best_match_so_far[1];
    this.error_correction_level = best_match_so_far[2];
    this.mask = best_match_so_far[3];

    if (this.logger) {
      this.logger.debug(
        "findModuleSize<b>" +
        " version=" + this.version +
        " grade=" + this.functional_grade +
        " error_correction_level=" + this.error_correction_level +
        " mask=" + this.mask +
        "</b>");
    }

    if (this.functional_grade < 1) {
      throw ("Unable to decode a function pattern");
    }
  },

  /* ************************************************************ */
  extractCodewords: function (){

    function getUnmasked(qr, j, i){

      var m;
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

      var u;
      if (m === 0) {
        u = !qr.isDark(j, i);
      } else {
        u = qr.isDark(j, i);
      }
      if (qr.debug_insane) {
        if (qr.logger) {
          qr.logger.debug("getUnmasked i=" + i + " j=" + j + " m=" + m + " u=" + u);
        }
      }
      return u;
    }

    /* ************************************************************ */
    /* extractCodewords
     */

    /*	Original Java version by Sean Owen
     Copyright 2007 ZXing authors
     */

    this.codewords = [];
    var readingUp = true;
    var currentByte = 0;
    var factor = 128;
    var bitsRead = 0;
    var i, j, col, count;
    // Read columns in pairs, from right to left
    for (j = this.modules - 1; j > 0; j -= 2) {
      if (j === 6) {
        // Skip whole column with vertical alignment pattern;
        // saves time and makes the other code proceed more cleanly
        j--;
      }
      // Read alternatingly from bottom to top then top to bottom
      for (count = 0; count < this.modules; count++) {
        i = readingUp ? this.modules - 1 - count : count;
        for (col = 0; col < 2; col++) {
          // Ignore bits covered by the function pattern
          if (!this.functional_pattern[j - col][i]) {
            // Read a bit
            if (getUnmasked(this, j - col, i)) {
              currentByte += factor;
            }
            factor /= 2;
            // If we've made a whole byte, save it off
            if (factor < 1) {
              //if (this.logger) this.logger.debug("getUnmasked byte[" + this.codewords.length + "]=" + currentByte);
              this.codewords.push(currentByte);
              bitsRead = 0;
              factor = 128;
              currentByte = 0;
            }
          }
        }
      }
      readingUp ^= true; // readingUp = !readingUp; // switch directions
    }

    if (this.debug_extractCodewords) {
      if (this.logger) {
        this.logger.debug("getCodewords mask=" + this.mask + " length=" + this.codewords.length);
        this.logger.debug("getCodewords = " + this.codewords.join(","));
      }
    }

  },

  /* ************************************************************ */
  extractData: function (){

    var bits;

    function extract(qr, bytes, pos, len){
      // http://stackoverflow.com/questions/3846711/extract-bit-sequences-of-arbitrary-length-from-byte-array-efficiently
      var shift = 24 - (pos & 7) - len;
      var mask = (1 << len) - 1;
      var byteIndex = pos >>> 3;

      return ((  (bytes[byteIndex] << 16) |
          (bytes[++byteIndex] << 8) |
          bytes[++byteIndex]
        ) >> shift) & mask;
    }

    /* ************************************************************ */
    function extract8bit(qr, bytes){

      var count_bits = qr.countBits(qr.MODE.EightBit, qr.version);

      var n = extract(qr, bytes, qr.bit_idx, count_bits);
      qr.bit_idx += count_bits;

      if (qr.debug_extractData) {
        if (qr.logger) {
          qr.logger.debug("extract charcount = " + n);
        }
      }

      var data = "";
      var i;
      for (i = 0; i < n; i++) {
        data += String.fromCharCode(extract(qr, bytes, qr.bit_idx, 8));
        qr.bit_idx += 8;
      }
      return data;
    }

    /* ************************************************************ */
    function extractAlphanum(qr, bytes){
      var count_bits = qr.countBits(qr.MODE.AlphaNumeric, qr.version);
      var n = extract(qr, bytes, qr.bit_idx, count_bits);
      qr.bit_idx += count_bits;

      if (qr.debug_extractData) {
        if (qr.logger) {
          qr.logger.debug("extractAlphanum charcount = " + n);
        }
      }

      var data = "";
      var i;
      for (i = 0; i < Math.floor(n / 2); i++) {
        var x = extract(qr, bytes, qr.bit_idx, 11);
        data += qr.ALPHANUM[Math.floor(x / 45)];
        data += qr.ALPHANUM[x % 45];
        qr.bit_idx += 11;
      }
      if (n % 2) {
        data += qr.ALPHANUM[extract(qr, bytes, qr.bit_idx, 6)];
        qr.bit_idx += 6;
      }
      return data;
    }

    /* ************************************************************ */
    function extractNumeric(qr, bytes){
      var count_bits = qr.countBits(qr.MODE.Numeric, qr.version);
      var n = extract(qr, bytes, qr.bit_idx, count_bits);
      qr.bit_idx += count_bits;

      if (qr.debug_extractData) {
        if (qr.logger) {
          qr.logger.debug("extractNumeric charcount = " + n);
        }
      }

      var data = "";
      var x, c1, c2, c3;
      var i;
      for (i = 0; i < Math.floor(n / 3); i++) {
        x = extract(qr, bytes, qr.bit_idx, 10);
        qr.bit_idx += 10;
        c1 = Math.floor(x / 100);
        c2 = Math.floor((x % 100) / 10);
        c3 = x % 10;
        data += String.fromCharCode(48 + c1, 48 + c2, 48 + c3);
      }

      if (n % 3 === 1) {
        x = extract(qr, bytes, qr.bit_idx, 4);
        qr.bit_idx += 4;
        data += String.fromCharCode(48 + x);
      } else if (n % 3 === 2) {
        x = extract(qr, bytes, qr.bit_idx, 7);
        qr.bit_idx += 7;
        c1 = Math.floor(x / 10);
        c2 = x % 10;
        data += String.fromCharCode(48 + c1, 48 + c2);
      }
      return data;
    }

    /* **************************************************
     * extractData
     */

    var bytes = this.bytes;
    bits = bytes.length * 8;

    if (this.debug_extractData) {
      if (this.logger) {
        this.logger.debug("extractData bytes in (" + bytes.length + ") = " + bytes.join(","));
      }
    }

    var i;
    for (i = 0; i < 4; i++) { bytes.push(0); }

    this.data = "";
    this.bit_idx = 0;

    while (this.bit_idx < bits - 4) {
      var mode = extract(this, bytes, this.bit_idx, 4);
      this.bit_idx += 4;
      if (this.debug_extractData) {
        if (this.logger) {
          this.logger.debug("extractData mode = " + mode);
        }
      }

      if (mode === this.MODE.Terminator) { break; }
      else if (mode === this.MODE.AlphaNumeric) { this.data += extractAlphanum(this, bytes); }
      else if (mode === this.MODE.EightBit) { this.data += extract8bit(this, bytes); }
      else if (mode === this.MODE.Numeric) { this.data += extractNumeric(this, bytes); }
      else { throw ("Unsupported ECI mode: " + mode); }
    }

    if (this.debug_extractData) {
      if (this.logger) {
        var b = [];
        for (i = 0; i < this.data.length; i++) {
          b.push(this.data[i].charCodeAt());
        }
        this.logger.debug("extractData data(" + b.length + ") = " + b.join(","));
      }
    }

  },

  /* ************************************************************ */
  correctErrors: function (){

    var rs = new ReedSolomon(this.block_ec_words);
    if (this.debug_correctErrors) { rs.logger = this.logger; }

    var errors = [];
    var bytes = [];
    var error_grade = 4;

    var b;
    for (b = 0; b < this.block_indices.length; b++) {
      var bytes_in = [];
      var i;
      for (i = 0; i < this.block_indices[b].length; i++) {
        bytes_in.push(this.codewords[this.block_indices[b][i]]);
      }
      var bytes_out = rs.decode(bytes_in);
      if (this.debug_correctErrors) {
        if (this.logger) {
          this.logger.debug("correctErrors in  = " + bytes_in.join(","));
          this.logger.debug("correctErrors out = " + bytes_out.join(","));
        }
      }
      if (!rs.corrected) {
        this.error_grade = 0;
        throw("Unable to correct errors (" + rs.uncorrected_reason + ")");
      }
      bytes = bytes.concat(bytes_out);
      errors.push(rs.n_errors);
    }
    this.errors = errors;
    this.bytes = bytes;
    this.error_grade = this.gradeErrors(errors);
    if (this.logger) {
      this.logger.debug("error_grade=" + error_grade);
    }

  },

  /* ************************************************************ */
  gradeErrors: function (errors){
    var ecw = this.block_ec_words;

    var max = 0;
    var i;
    for (i = 0; i < errors.length; i++) {
      if (errors[i] > max) { max = errors[i]; }
    }

    var grade = 4;
    if (max > ecw / 2 - 1) { grade = 0; }
    else if (max > ecw / 2 - 2) { grade = 1; }
    else if (max > ecw / 2 - 3) { grade = 2; }
    else if (max > ecw / 2 - 4) { grade = 3; }

    return grade;
  },

  /* ************************************************************
   * QRCodeDecode internal encoding / decoding helper functions
   * ************************************************************
   */

  getDataCapacity: function (version, error_correction_level, mode){

    var codewords = this.CODEWORDS[version];
    var ec_codewords = this.EC_CODEWORDS[version][error_correction_level];
    var data_codewords = codewords - ec_codewords;

    var bits = 8 * data_codewords;
    bits -= 4;	// mode
    bits -= this.countBits(mode, version);

    var cap = 0;
    if (mode === this.MODE.AlphaNumeric) {
      cap = Math.floor(bits / 11) * 2;
      if (bits >= (cap / 2) * 11 + 6) { cap++; }
    } else if (mode === this.MODE.EightBit) {
      cap = Math.floor(bits / 8);
    } else if (mode === this.MODE.Numeric) {
      cap = Math.floor(bits / 10) * 3;
      if (bits >= (cap / 3) * 10 + 4) {
        if (bits >= (cap / 3) * 10 + 7) { cap++; }
        cap++;
      }
    } else {
      throw ("Unsupported ECI mode: " + mode);
    }
    return cap;

  },

  /* ************************************************************ */
  getVersionFromLength: function (error_correction_level, mode, length){
    var v;
    for (v = 1; v <= 40; v++) {
      if (this.getDataCapacity(v, error_correction_level, mode) >= length) {
        return v;
      }
    }
    throw("Text is too long, even for a version 40 QR Code");
  },

  /* ************************************************************ */
  setBlocks: function (){

    var codewords = this.CODEWORDS[this.version];
    var ec_codewords = this.EC_CODEWORDS[this.version][this.error_correction_level];
    this.data_codewords = codewords - ec_codewords;
    var ec_blocks = this.EC_BLOCKS[this.version][this.error_correction_level];

    var blocks;
    var blocks_first;
    var blocks_second;
    var block_words_first;
    var block_words_second;

    var i, b;

    if (ec_blocks.length === 1) {
      blocks_first = ec_blocks[0];
      blocks_second = 0;
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

    if (this.debug_setBlocks) {
      if (this.logger) {
        this.logger.debug("setBlocks" +
          " blocks_first=" + blocks_first +
          " blocks_second=" + blocks_second +
          " blocks=" + blocks +
          " block_words_first=" + block_words_first +
          " block_words_second=" + block_words_second +
          " block_ec_words=" + this.block_ec_words +
          " total=" + (blocks_first * block_words_first + blocks_second * block_words_second + blocks * this.block_ec_words));
      }
    }

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
        this.block_indices[b].push(w);
        w++;
      }
    }

    for (b = blocks_first; b < blocks; b++) {
      this.block_indices[b].push(w);
      w++;
    }

    for (i = 0; i < this.block_ec_words; i++) {
      for (b = 0; b < blocks; b++) {
        this.block_indices[b].push(w);
        w++;
      }
    }

    if (this.debug_setBlocks) {
      if (this.logger) {
        for (b = 0; b < blocks; b++) {
          this.logger.debug("setBlocks block " + b + " (" + this.block_indices[b].length + "): " + this.block_indices[b].join(","));
        }
      }
    }
  },

  /* ************************************************************ */
  setFunctionalPattern: function (){

    function markSquare(qr, x, y, w, h){
      var i, j;
      for (i = x; i < x + w; i++) {
        for (j = y; j < y + h; j++) {
          qr.functional_pattern[i][j] = true;
        }
      }
    }

    /* ************************************************************ */
    function markAlignment(qr){
      var n = qr.ALIGNMENT_PATTERNS[qr.version].length;
      var i, j;
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) { continue; }

          markSquare(qr,
            qr.ALIGNMENT_PATTERNS[qr.version][i] - 2,
            qr.ALIGNMENT_PATTERNS[qr.version][j] - 2,
            5, 5);
        }
      }
    }

    /* **************************************************
     * setFunctionalPattern
     */

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

    if (this.debug_insane) {
      if (this.logger) {
        for (y = 0; y < this.modules; y++) {
          var s = "";
          for (x = 0; x < this.modules; x++) {
            s += this.functional_pattern[x][y] ? "X" : "O";
          }
          this.logger.debug(s);
        }
      }
    }
  },

  /* ************************************************************ */
  countBits: function (mode, version){
    if (mode === this.MODE.EightBit) {
      if (version < 10) { return 8; }
      else { return 16; }
    } else if (mode === this.MODE.AlphaNumeric) {
      if (version < 10) { return 9; }
      else if (version < 27) { return 11; }
      else { return 13; }
    } else if (mode === this.MODE.Numeric) {
      if (version < 10) { return 10; }
      else if (version < 27) { return 12; }
      else { return 14; }
    }
    throw ("Internal error: Unknown mode: " + mode);
  },

  /* ************************************************************ */
  modulesFromVersion: function (version){
    return 17 + 4 * version;
  },

  /* ************************************************************ */
  hammingDistance: function (a, b){

    function nBits(n){
      var c;
      for (c = 0; n; c++) {
        n &= n - 1; // clear the least significant bit set
      }
      return c;
    }

    var d = a ^ b;
    return nBits(d);
  },

  /* ************************************************************
   * QRCodeDecode image functions
   * ************************************************************
   */

  isDarkWithSize: function (x, y, module_size){
    return this.image.isDark(Math.round(this.image_left + x * module_size), Math.round(this.image_top + y * module_size), Math.round(module_size));
  },

  /* ************************************************************ */
  isDark: function (x, y){
    return this.isDarkWithSize(x, y, this.module_size);

  },

  /* ************************************************************ */
  setDark: function (x, y){
    this.image.setDark(this.image_left + x * this.module_size, this.image_top + y * this.module_size, this.module_size);

  }
};
