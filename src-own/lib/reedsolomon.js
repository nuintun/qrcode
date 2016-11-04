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
export default function ReedSolomon(n_ec_bytes) {
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
  encode: function(msg) {
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
  decode: function(bytes_in) {
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
  genPoly: function(nbytes) {
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
      tp[0] = context.gexp[i]; // set up x+a^n
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
  calculateSyndroms: function() {
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
  correctErrors: function() {
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
  berlekampMassey: function() {
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
  findRoots: function() {
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
  computeDiscrepancy: function(lambda, S, L, n) {
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
  copyPoly: function(src) {
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
  zeroPoly: function() {
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
  mulZPoly: function(poly) {
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
  multPolys: function(p1, p2) {
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
  initGaloisTables: function() {
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
  gmult: function(a, b) {
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
  ginv: function(elt) {
    return (this.gexp[255 - this.glog[elt]]);
  }
};
