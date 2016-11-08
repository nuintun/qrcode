/**
 * <p>A simple, fast array of bits, represented compactly by an array of ints internally.</p>
 */

import * as Utils from './Utils';
import IllegalArgumentException from '../exception/IllegalArgumentException';

/**
 * BitArray
 *
 * @param {any} bits
 * @param {any} size
 */
export default function BitArray(bits, size) {
  switch (arguments.length) {
    case 0:
      size = 0;
      bits = new Array(1);
      break;
    case 1:
      size = bits;
      bits = makeArray(size);
      break;
  }

  this.size = size;
  this.bits = bits;
}

BitArray.prototype = {
  getSize: function() {
    return this.size;
  },
  getSizeInBytes: function() {
    return (this.size + 7) / 8;
  },
  ensureCapacity: function(size) {
    var context = this;
    var size = context.size;
    var bits = context.bits;
    var length = bits.length;

    if (size > length * 32) {
      var newBits = makeArray(size);

      Utils.arrayCopy(bits, 0, newBits, 0, length);
    }
  },
  /**
   * @param i bit to get
   * @return true iff bit i is set
   */
  get: function(i) {
    return (this.bits[i / 32] & (1 << (i & 0x1F))) != 0;
  },
  /**
   * Sets bit i.
   *
   * @param i bit to set
   */
  set: function(i) {
    this.bits[i / 32] |= 1 << (i & 0x1F);
  },
  /**
   * Flips bit i.
   *
   * @param i bit to set
   */
  flip: function(i) {
    this.bits[i / 32] ^= 1 << (i & 0x1F);
  },
  /**
   * @param from first bit to check
   * @return index of first bit that is set, starting from the given index, or size if none are set
   *  at or beyond this given index
   * @see #getNextUnset(int)
   */
  getNextSet: function(from) {
    var context = this;
    var size = context.size;
    var bits = context.bits;

    if (from >= size) {
      return size;
    }

    var bitsOffset = from / 32;
    var currentBits = bits[bitsOffset];

    // mask off lesser bits first
    currentBits &= ~((1 << (from & 0x1F)) - 1);

    var length = bits.length;

    while (currentBits === 0) {
      if (++bitsOffset === length) {
        return size;
      }

      currentBits = bits[bitsOffset];
    }

    var result = (bitsOffset * 32) + Utils.numberOfTrailingZeros(currentBits);

    return result > size ? size : result;
  },
  /**
   * @param from index to start looking for unset bit
   * @return index of next unset bit, or {@code size} if none are unset until the end
   * @see #getNextSet(int)
   */
  getNextUnset: function(from) {
    var context = this;
    var size = context.size;
    var bits = context.bits;

    if (from >= size) {
      return size;
    }

    var bitsOffset = from / 32;
    var currentBits = ~bits[bitsOffset];

    // mask off lesser bits first
    currentBits &= ~((1 << (from & 0x1F)) - 1);

    var length = bits.length;

    while (currentBits === 0) {
      if (++bitsOffset === length) {
        return size;
      }

      currentBits = ~bits[bitsOffset];
    }

    var result = (bitsOffset * 32) + Utils.numberOfTrailingZeros(currentBits);

    return result > size ? size : result;
  },
  /**
   * Sets a block of 32 bits, starting at bit i.
   *
   * @param i first bit to set
   * @param newBits the new value of the next 32 bits. Note again that the least-significant bit
   * corresponds to bit i, the next-least-significant to i+1, and so on.
   */
  setBulk: function(i, newBits) {
    this.bits[i / 32] = newBits;
  },
  /**
   * Sets a range of bits.
   *
   * @param start start of range, inclusive.
   * @param end end of range, exclusive
   */
  setRange: function(start, end) {
    if (end < start || start < 0 || end > size) {
      throw new IllegalArgumentException('Params start and end range error');
    }

    if (end === start) {
      return;
    }

    end--; // will be easier to treat this as the last actually set bit -- inclusive

    var firstInt = start / 32;
    var lastInt = end / 32;
    var bits = this.bits;

    for (var i = firstInt; i <= lastInt; i++) {
      var firstBit = i > firstInt ? 0 : start & 0x1F;
      var lastBit = i < lastInt ? 31 : end & 0x1F;
      // Ones from firstBit to lastBit, inclusive
      var mask = (2 << lastBit) - (1 << firstBit);

      bits[i] |= mask;
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
   * Efficient method to check if a range of bits is set, or not set.
   *
   * @param start start of range, inclusive.
   * @param end end of range, exclusive
   * @param value if true, checks that bits in range are set, otherwise checks that they are not set
   * @return true iff all bits are set or not set in range, according to value argument
   * @throws IllegalArgumentException if end is less than start or the range is not contained in the array
   */
  isRange: function(start, end, value) {
    if (end < start || start < 0 || end > size) {
      throw new IllegalArgumentException('Params start and end range error');
    }

    if (end == start) {
      return true; // empty range matches
    }

    end--; // will be easier to treat this as the last actually set bit -- inclusive

    var firstInt = start / 32;
    var lastInt = end / 32;
    var bits = this.bits;

    for (var i = firstInt; i <= lastInt; i++) {
      var firstBit = i > firstInt ? 0 : start & 0x1F;
      var lastBit = i < lastInt ? 31 : end & 0x1F;
      // Ones from firstBit to lastBit, inclusive
      var mask = (2 << lastBit) - (1 << firstBit);

      // Return false if we're looking for 1s and the masked bits[i] isn't all 1s (that is,
      // equals the mask, or we're looking for 0s and the masked portion is not all 0s
      if ((bits[i] & mask) != (value ? mask : 0)) {
        return false;
      }
    }

    return true;
  },
  appendBit: function(bit) {
    var context = this;
    var size = context.size;
    var bits = context.bits;

    context.ensureCapacity(size + 1);

    if (bit) {
      bits[size / 32] |= 1 << (size & 0x1F);
    }

    size++;

    context.size = size;
  },
  /**
   * Appends the least-significant bits, from value, in order from most-significant to
   * least-significant. For example, appending 6 bits from 0x000001E will append the bits
   * 0, 1, 1, 1, 1, 0 in that order.
   *
   * @param value {@code int} containing bits to append
   * @param numBits bits from value to append
   */
  appendBits: function(value, numBits) {
    if (numBits < 0 || numBits > 32) {
      throw new IllegalArgumentException('Num bits must be between 0 and 32');
    }

    var context = this;

    context.ensureCapacity(context.size + numBits);

    for (var numBitsLeft = numBits; numBitsLeft > 0; numBitsLeft--) {
      context.appendBit(((value >> (numBitsLeft - 1)) & 0x01) == 1);
    }
  },
  appendBitArray: function(other) {
    var context = this;
    var otherSize = other.size;

    context.ensureCapacity(context.size + otherSize);

    for (var i = 0; i < otherSize; i++) {
      context.appendBit(other.get(i));
    }
  },
  xor: function(other) {
    var context = this;
    var size = context.size;

    if (size != other.size) {
      throw new IllegalArgumentException('Sizes don\'t match');
    }

    var bits = context.bits;

    for (var i = 0, length = bits.length; i < length; i++) {
      // The last int could be incomplete (i.e. not have 32 bits in
      // it) but there is no problem since 0 XOR 0 == 0.
      bits[i] ^= other.bits[i];
    }
  },
  /**
   *
   * @param bitOffset first bit to start writing
   * @param array array to write into. Bytes are written most-significant byte first. This is the opposite
   *  of the internal representation, which is exposed by {@link #getBitArray()}
   * @param offset position in array to start writing
   * @param numBytes how many bytes to write
   */
  toBytes: function(bitOffset, array, offset, numBytes) {
    for (var i = 0; i < numBytes; i++) {
      var theByte = 0;

      for (var j = 0; j < 8; j++) {
        if (this.get(bitOffset)) {
          theByte |= 1 << (7 - j);
        }

        bitOffset++;
      }

      array[offset + i] = theByte;
    }
  },
  /**
   * @return underlying array of ints. The first element holds the first 32 bits, and the least
   *         significant bit is bit 0.
   */
  getBitArray: function() {
    return this.bits;
  },
  /**
   * Reverses all bits in the array.
   */
  reverse: function() {
    var context = this;
    var size = context.size;
    var bits = context.bits;
    var newBits = new Array[bits.length];
    // reverse all int's first
    var len = (size - 1) / 32;
    var oldBitsLen = len + 1;

    for (var i = 0; i < oldBitsLen; i++) {
      var x = bits[i];

      x = ((x >> 1) & 0x55555555) | ((x & 0x55555555) << 1);
      x = ((x >> 2) & 0x33333333) | ((x & 0x33333333) << 2);
      x = ((x >> 4) & 0x0f0f0f0f) | ((x & 0x0f0f0f0f) << 4);
      x = ((x >> 8) & 0x00ff00ff) | ((x & 0x00ff00ff) << 8);
      x = ((x >> 16) & 0x0000ffff) | ((x & 0x0000ffff) << 16);

      newBits[len - i] = x;
    }

    // now correct the int's if the bit size isn't a multiple of 32
    if (size !== oldBitsLen * 32) {
      var leftOffset = oldBitsLen * 32 - size;
      var currentInt = newBits[0] >>> leftOffset;

      for (var i = 1; i < oldBitsLen; i++) {
        var nextInt = newBits[i];

        currentInt |= nextInt << (32 - leftOffset);
        newBits[i - 1] = currentInt;
        currentInt = nextInt >>> leftOffset;
      }

      newBits[oldBitsLen - 1] = currentInt;
    }

    bits = newBits;

    context.bits = bits;
  },
  equals: function(o) {
    if (!(o instanceof BitArray)) {
      return false;
    }

    var context = this;
    var size = context.size;
    var bits = context.bits;

    return size == other.size && Utils.equals(bits, o.bits);
  },
  hashCode: function() {
    return 31 * size + Utils.hashCode(bits);
  },
  toString: function() {
    var result = '';
    var context = this;
    var size = context.size;

    for (var i = 0; i < size; i++) {
      if ((i & 0x07) == 0) {
        result += ' ';
      }

      result += context.get(i) ? 'X' : '.';
    }

    return result;
  },
  clone: function() {
    return new BitArray(this.bits.slice(), this.size);
  }
};

function makeArray(size) {
  return new Array((size + 31) / 32);
}
