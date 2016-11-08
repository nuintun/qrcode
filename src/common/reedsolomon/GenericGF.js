/**
 * <p>This class contains utility methods for performing mathematical operations over
 * the Galois Fields. Operations use a given primitive polynomial in calculations.</p>
 *
 * <p>Throughout this package, elements of the GF are represented as an {@code int}
 * for convenience and speed (but at the cost of memory).
 * </p>
 */
var AZTEC_DATA_12 = new GenericGF(0x1069, 4096, 1); // x^12 + x^6 + x^5 + x^3 + 1
var AZTEC_DATA_10 = new GenericGF(0x409, 1024, 1); // x^10 + x^3 + 1
var AZTEC_DATA_6 = new GenericGF(0x43, 64, 1); // x^6 + x + 1
var AZTEC_PARAM = new GenericGF(0x13, 16, 1); // x^4 + x + 1
var QR_CODE_FIELD_256 = new GenericGF(0x011D, 256, 0); // x^8 + x^4 + x^3 + x^2 + 1
var DATA_MATRIX_FIELD_256 = new GenericGF(0x012D, 256, 1); // x^8 + x^5 + x^3 + x^2 + 1
var AZTEC_DATA_8 = DATA_MATRIX_FIELD_256;
var MAXICODE_FIELD_64 = AZTEC_DATA_6;

/**
 * Create a representation of GF(size) using the given primitive polynomial.
 *
 * @param primitive irreducible polynomial whose coefficients are represented by
 *  the bits of an int, where the least-significant bit represents the constant
 *  coefficient
 * @param size the size of the field
 * @param generatorBase the factor b in the generator polynomial can be 0- or 1-based
 *  (g(x) = (x+a^b)(x+a^(b+1))...(x+a^(b+2t-1))).
 *  In most cases it should be 1, but for QR code it is 0.
 */
export default function GenericGF(primitive, size, generatorBase) {
  var context = this;

  context.primitive = primitive;
  context.size = size;
  context.generatorBase = generatorBase;

  context.expTable = new Array(size);
  context.logTable = new Array(size);

  var x = 1;

  for (var i = 0; i < size; i++) {
    expTable[i] = x;

    x *= 2; // we're assuming the generator alpha is 2

    if (x >= size) {
      x ^= primitive;
      x &= size - 1;
    }
  }

  for (var i = 0; i < size - 1; i++) {
    logTable[expTable[i]] = i;
  }

  // TODO new int[]{0}
  // logTable[0] == 0 but this should never be used
  context.zero = new GenericGFPoly(context, [0]);
  context.one = new GenericGFPoly(context, [1]);
}

GenericGF.prototype = {
  getZero: function() {
    return this.zero;
  },
  getOne: function() {
    return this.one;
  },
  /**
   * @return the monomial representing coefficient * x^degree
   */
  buildMonomial: function(degree, coefficient) {
    var context = this;

    if (degree < 0) {
      throw new IllegalArgumentException();
    }

    if (coefficient === 0) {
      return context.zero;
    }

    // TODO new int[degree + 1];
    var coefficients = new Array(degree + 1);

    coefficients[0] = coefficient;

    return new GenericGFPoly(context, coefficients);
  },
  /**
   * @return 2 to the power of a in GF(size)
   */
  exp: function(a) {
    return this.expTable[a];
  },
  /**
   * @return base 2 log of a in GF(size)
   */
  log: function(a) {
    if (a == 0) {
      throw new IllegalArgumentException();
    }

    return this.logTable[a];
  },
  /**
   * @return multiplicative inverse of a
   */
  inverse: function(a) {
    if (a == 0) {
      throw new ArithmeticException();
    }

    return this.expTable[size - this.logTable[a] - 1];
  },
  /**
   * @return product of a and b in GF(size)
   */
  multiply: function(a, b) {
    if (a == 0 || b == 0) {
      return 0;
    }

    var context = this;
    var size = context.size;
    var expTable = context.expTable;
    var logTable = context.logTable;

    return expTable[(logTable[a] + logTable[b]) % (size - 1)];
  },
  getSize: function() {
    return this.size;
  },
  getGeneratorBase: function() {
    return this.generatorBase;
  },
  toString: function() {
    return "GF(0x" + this.primitive.toString(16) + ',' + this.size + ')';
  }
}

/**
 * Implements both addition and subtraction -- they are the same in GF(size).
 *
 * @return sum/difference of a and b
 */
function addOrSubtract(a, b) {
  return a ^ b;
}

GenericGF.addOrSubtract = addOrSubtract;

GenericGF.AZTEC_DATA_12 = AZTEC_DATA_12; // x^12 + x^6 + x^5 + x^3 + 1
GenericGF.AZTEC_DATA_10 = AZTEC_DATA_10; // x^10 + x^3 + 1
GenericGF.AZTEC_DATA_6 = AZTEC_DATA_6; // x^6 + x + 1
GenericGF.AZTEC_PARAM = AZTEC_PARAM; // x^4 + x + 1
GenericGF.QR_CODE_FIELD_256 = QR_CODE_FIELD_256; // x^8 + x^4 + x^3 + x^2 + 1
GenericGF.DATA_MATRIX_FIELD_256 = DATA_MATRIX_FIELD_256; // x^8 + x^5 + x^3 + x^2 + 1
GenericGF.AZTEC_DATA_8 = AZTEC_DATA_8;
GenericGF.MAXICODE_FIELD_64 = MAXICODE_FIELD_64;
