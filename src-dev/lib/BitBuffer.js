export default function BitBuffer() {
  var context = this;

  context.buffer = [];
  context.length = 0;
}

BitBuffer.prototype = {
  getBuffer: function() {
    return this.buffer;
  },
  getLengthInBits: function() {
    return this.length;
  },
  toString: function() {
    var buffer = '';
    var context = this;
    var length = context.getLengthInBits();

    for (var i = 0; i < length; i++) {
      buffer += context.getBit(i) ? '1' : '0';
    }

    return buffer;
  },
  getBit: function(index) {
    return (this.buffer[~~(index / 8)] >>> (7 - index % 8)) & 1 === 1;
  },
  put: function(num, length) {
    for (var i = 0; i < length; i++) {
      this.putBit((num >>> (length - i - 1)) & 1 === 1);
    }
  },
  putBit: function(bit) {
    var context = this;
    var length = context.getLengthInBits();

    if (length === context.buffer.length * 8) {
      context.buffer.push(0);
    }

    if (bit) {
      context.buffer[~~(length / 8)] |= (0x80 >>> (length % 8));
    }

    context.length++;
  }
};
