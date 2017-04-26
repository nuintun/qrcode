/**
 * BitBuffer
 * @author Kazuhiko Arase
 * @link https://github.com/1w2w3y/qrcode-generator-ts/blob/master/src/qrcode/BitBuffer.ts?ts=2
 */

export default function BitBuffer() {
  this.buffer = [];
  this.length = 0;
}

BitBuffer.prototype = {
  getBuffer: function() {
    return this.buffer;
  },
  getLengthInBits: function() {
    return this.length;
  },
  getBit: function(index) {
    return ((this.buffer[~~(index / 8)] >>> (7 - index % 8)) & 1) === 1;
  },
  put: function(num, length) {
    for (var i = 0; i < length; i += 1) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  },
  putBit: function(bit) {
    var context = this;

    if (context.length == context.buffer.length * 8) {
      context.buffer.push(0);
    }

    if (bit) {
      context.buffer[~~(context.length / 8)] |= (0x80 >>> (context.length % 8));
    }

    context.length += 1;
  },
  toString: function() {
    var buffer = '';

    for (var i = 0, length = this.getLengthInBits(); i < length; i += 1) {
      buffer += this.getBit(i) ? '1' : '0';
    }

    return buffer;
  }
};
