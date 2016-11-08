/**
 * <p>Represents a 2D matrix of bits. In function arguments below, and throughout the common
 * module, x is the column position, and y is the row position. The ordering is always x, y.
 * The origin is at the top-left.</p>
 *
 * <p>Internally the bits are represented in a 1-D array of 32-bit ints. However, each row begins
 * with a new int. This is done intentionally so that we can copy out a row into a BitArray very
 * efficiently.</p>
 *
 * <p>The ordering of bits is row-major. Within each int, the least significant bits are used first,
 * meaning they represent lower x values. This is compatible with BitArray's implementation.</p>
 */

import * as Utils from './Utils';
import BitArray from './BitArray';

/**
 * BitMatrix
 * BitMatrix(dimension)
 * BitMatrix(width, height)
 * BitMatrix(width, height, rowSize, bits)
 * @param {any} width
 * @param {any} height
 * @param {any} rowSize
 * @param {any} bits
 */
export default function BitMatrix(width, height, rowSize, bits) {
  if (arguments.length === 1) {
    height = width;
  }

  if (width < 1 || height < 1) {
    throw new RangeError('IllegalArgumentException: both dimensions must be greater than 0');
  }

  var context = this;

  context.width = width;
  context.height = height;
  context.rowSize = rowSize || (width + 31) / 32;
  context.bits = ~~rowSize * height;
}

BitMatrix.prototype = {
  /**
   * <p>Gets the requested bit, where true means black.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   * @return value of given bit in matrix
   */
  get: function(x, y) {
    var context = this;
    var offset = y * context.rowSize + (x / 32);

    return ((context.bits[offset] >>> (x & 0x1f)) & 1) !== 0;
  },
  /**
   * <p>Sets the given bit to true.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   */
  set: function(x, y) {
    var context = this;
    var offset = y * context.rowSize + (x / 32);

    context.bits[offset] |= 1 << (x & 0x1f);
  },
  unset: function(x, y) {
    var context = this;
    var offset = y * context.rowSize + (x / 32);

    context.bits[offset] &= ~(1 << (x & 0x1f));
  },
  /**
   * <p>Flips the given bit.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   */
  flip: function(x, y) {
    var context = this;
    var offset = y * context.rowSize + (x / 32);

    context.bits[offset] ^= 1 << (x & 0x1f);
  },
  /**
   * Exclusive-or (XOR): Flip the bit in this {@code BitMatrix} if the corresponding
   * mask bit is set.
   *
   * @param mask XOR mask
   */
  xor: function(mask) {
    var context = this;
    var bits = context.bits;
    var width = context.width;
    var height = context.height;
    var rowSize = context.rowSize;

    if (width !== mask.getWidth() || height !== mask.getHeight() || rowSize !== mask.getRowSize()) {
      throw new RangeError('IllegalArgumentException: input matrix dimensions do not match');
    }

    var rowArray = new BitArray(width / 32 + 1);

    for (var y = 0; y < height; y++) {
      var offset = y * rowSize;
      var row = mask.getRow(y, rowArray).getBitArray();

      for (var x = 0; x < rowSize; x++) {
        bits[offset + x] ^= row[x];
      }
    }
  },
  /**
   * Clears all bits (sets to false).
   */
  clear: function() {
    var bits = this.bits;
    var max = bits.length;

    for (var i = 0; i < max; i++) {
      bits[i] = 0;
    }
  },
  /**
   * <p>Sets a square region of the bit matrix to true.</p>
   *
   * @param left The horizontal position to begin at (inclusive)
   * @param top The vertical position to begin at (inclusive)
   * @param width The width of the region
   * @param height The height of the region
   */
  setRegion: function(left, top, width, height) {
    if (top < 0 || left < 0) {
      throw new RangeError('IllegalArgumentException: left and top must be nonnegative');
    }

    if (height < 1 || width < 1) {
      throw new RangeError("IllegalArgumentException: height and width must be at least 1");
    }

    var right = left + width;
    var bottom = top + height;

    if (bottom > this.height || right > this.width) {
      throw new RangeError("IllegalArgumentException: the region must fit inside the matrix");
    }

    for (var y = top; y < bottom; y++) {
      var offset = y * rowSize;

      for (var x = left; x < right; x++) {
        bits[offset + (x / 32)] |= 1 << (x & 0x1f);
      }
    }
  },
  /**
   * A fast method to retrieve one row of data from the matrix as a BitArray.
   *
   * @param y The row to retrieve
   * @param row An optional caller-allocated BitArray, will be allocated if null or too small
   * @return The resulting BitArray - this reference should always be used even when passing
   *         your own row
   */
  getRow: function(y, row) {
    if (row === null || row.getSize() < width) {
      row = new BitArray(width);
    } else {
      row.clear();
    }

    var offset = y * rowSize;

    for (var x = 0; x < rowSize; x++) {
      row.setBulk(x * 32, bits[offset + x]);
    }

    return row;
  },
  /**
   * @param y row to set
   * @param row {@link BitArray} to copy from
   */
  setRow: function(y, row) {
    var context = this;
    var bits = context.bits;
    var rowSize = context.rowSize;

    Utils.arrayCopy(row.getBitArray(), 0, bits, y * rowSize, rowSize);
  },
  /**
   * Modifies this {@code BitMatrix} to represent the same but rotated 180 degrees
   */
  rotate180: function() {
    var context = this;
    var width = context.width;
    var height = context.height;
    var topRow = new BitArray(width);
    var bottomRow = new BitArray(width);

    for (var i = 0; i < (height + 1) / 2; i++) {
      topRow = context.getRow(i, topRow);
      bottomRow = context.getRow(height - 1 - i, bottomRow);

      topRow.reverse();
      bottomRow.reverse();
      context.setRow(i, bottomRow);
      context.setRow(height - 1 - i, topRow);
    }
  },
  /**
   * This is useful in detecting the enclosing rectangle of a 'pure' barcode.
   *
   * @return {@code left,top,width,height} enclosing rectangle of all 1 bits, or null if it is all white
   */
  getEnclosingRectangle: function() {
    var context = this;
    var left = context.width;
    var top = context.height;
    var right = -1;
    var bottom = -1;

    for (var y = 0; y < height; y++) {
      for (var x32 = 0; x32 < rowSize; x32++) {
        var theBits = bits[y * rowSize + x32];

        if (theBits != 0) {
          if (y < top) {
            top = y;
          }

          if (y > bottom) {
            bottom = y;
          }

          if (x32 * 32 < left) {
            var bit = 0;

            while ((theBits << (31 - bit)) === 0) {
              bit++;
            }

            if ((x32 * 32 + bit) < left) {
              left = x32 * 32 + bit;
            }
          }

          if (x32 * 32 + 31 > right) {
            var bit = 31;

            while ((theBits >>> bit) === 0) {
              bit--;
            }

            if ((x32 * 32 + bit) > right) {
              right = x32 * 32 + bit;
            }
          }
        }
      }
    }

    if (right < left || bottom < top) {
      return null;
    }

    return [left, top, right - left + 1, bottom - top + 1];
  },
  /**
   * This is useful in detecting a corner of a 'pure' barcode.
   *
   * @return {@code x,y} coordinate of top-left-most 1 bit, or null if it is all white
   */
  getTopLeftOnBit: function() {
    var bitsOffset = 0;
    var context = this;
    var bits = context.bits;
    var rowSize = context.rowSize;

    while (bitsOffset < bits.length && bits[bitsOffset] === 0) {
      bitsOffset++;
    }

    if (bitsOffset === bits.length) {
      return null;
    }

    var y = bitsOffset / rowSize;
    var x = (bitsOffset % rowSize) * 32;

    var theBits = bits[bitsOffset];
    var bit = 0;

    while ((theBits << (31 - bit)) === 0) {
      bit++;
    }

    x += bit;

    return [x, y];
  },
  getBottomRightOnBit: function() {
    var context = this;
    var bits = context.bits;
    var rowSize = context.rowSize;
    var bitsOffset = bits.length - 1;

    while (bitsOffset >= 0 && bits[bitsOffset] === 0) {
      bitsOffset--;
    }

    if (bitsOffset < 0) {
      return null;
    }

    var y = bitsOffset / rowSize;
    var x = (bitsOffset % rowSize) * 32;

    var theBits = bits[bitsOffset];
    var bit = 31;

    while ((theBits >>> bit) === 0) {
      bit--;
    }

    x += bit;

    return [x, y];
  },
  /**
   * @return The width of the matrix
   */
  getWidth: function() {
    return this.width;
  },
  /**
   * @return The height of the matrix
   */
  getHeight: function() {
    return this.height;
  },
  /**
   * @return The row size of the matrix
   */
  getRowSize: function() {
    return this.rowSize;
  },
  equals: function(o) {
    if (!(o instanceof BitMatrix)) {
      return false;
    }

    var context = this;
    var bits = context.bits;
    var width = context.width;
    var height = context.height;
    var rowSize = context.rowSize;

    return width === o.width && height === o.height && rowSize === o.rowSize && Utils.arrayEquals(bits, o.bits);
  },
  hashCode: function() {
    var context = this;
    var bits = context.bits;
    var hash = context.width;

    hash = 31 * hash + context.width;
    hash = 31 * hash + context.height;
    hash = 31 * hash + context.rowSize;
    hash = 31 * hash + Utils.hashCode(bits);

    return hash;
  },
  toString: function() {
    var result = '';
    var context = this;
    var width = context.width;
    var height = context.height;

    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        result += context.get(x, y) ? 'X ' : '  ';
      }

      result += '\n';
    }

    return result;
  },
  clone: function() {
    var context = this;

    return new BitMatrix(context.width, context.height, context.rowSize, context.bits.slice());
  }
};
