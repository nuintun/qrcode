//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/classes/binary-parser [rev. #1]

function BinaryParser(bigEndian, allowExceptions) {
  this.bigEndian = bigEndian;
  this.allowExceptions = allowExceptions;
}
BinaryParser.prototype = {
  encodeFloat: function(number, precisionBits, exponentBits) {
    var bias = Math.pow(2, exponentBits - 1) - 1;
    var minExp = -bias + 1;
    var maxExp = bias;
    var minUnnormExp = minExp - precisionBits;
    var status = isNaN(n = parseFloat(number)) || n == -Infinity || n == +Infinity ? n : 0;
    var exp = 0;
    var len = 2 * bias + 1 + precisionBits + 3;
    var bin = new Array(len);
    var signal = (n = status !== 0 ? 0 : n) < 0;
    var n = Math.abs(n);
    var intPart = Math.floor(n);
    var floatPart = n - intPart;
    var i, lastBit, rounded, j, result;

    for (i = len; i; bin[--i] = 0);
    for (i = bias + 2; intPart && i; bin[--i] = intPart % 2, intPart = Math.floor(intPart / 2));
    for (i = bias + 1; floatPart > 0 && i;
      (bin[++i] = ((floatPart *= 2) >= 1) - 0) && --floatPart);
    for (i = -1; ++i < len && !bin[i];);

    if (bin[(lastBit = precisionBits - 1 + (i = (exp = bias + 1 - i) >= minExp && exp <= maxExp ? i + 1 : bias + 1 - (exp = minExp - 1))) + 1]) {
      if (!(rounded = bin[lastBit])) {
        for (j = lastBit + 2; !rounded && j < len; rounded = bin[j++]);
      }

      for (j = lastBit + 1; rounded && --j >= 0;
        (bin[j] = !bin[j] - 0) && (rounded = 0));
    }

    for (i = i - 2 < 0 ? -1 : i - 3; ++i < len && !bin[i];);

    (exp = bias + 1 - i) >= minExp && exp <= maxExp ? ++i : exp < minExp &&
      (exp != bias + 1 - len && exp < minUnnormExp && this.warn("encodeFloat::float underflow"), i = bias + 1 - (exp = minExp - 1));
    (intPart || status !== 0) && (this.warn(intPart ? "encodeFloat::float overflow" : "encodeFloat::" + status),
      exp = maxExp + 1, i = bias + 2, status == -Infinity ? signal = 1 : isNaN(status) && (bin[i] = 1));
    for (n = Math.abs(exp + bias), j = exponentBits + 1, result = ""; --j; result = (n % 2) + result, n = n >>= 1);
    for (n = 0, j = 0, i = (result = (signal ? "1" : "0") + result + bin.slice(i, i + precisionBits).join("")).length, r = []; i; n += (1 << j) * result.charAt(--i), j == 7 && (r[r.length] = String.fromCharCode(n), n = 0), j = (j + 1) % 8);

    r[r.length] = n ? String.fromCharCode(n) : "";

    return (this.bigEndian ? r.reverse() : r).join("");
  },
  encodeInt: function(number, bits, signed) {
    var max = Math.pow(2, bits);
    var r = [];

    (number >= max || number < -(max >> 1)) && this.warn("encodeInt::overflow") && (number = 0);
    number < 0 && (number += max);

    for (; number; r[r.length] = String.fromCharCode(number % 256), number = Math.floor(number / 256));
    for (bits = -(-bits >> 3) - r.length; bits--; r[r.length] = "\0");

    return (this.bigEndian ? r.reverse() : r).join("");
  },
  decodeFloat: function(data, precisionBits, exponentBits) {
    var b = ((b = new this.Buffer(this.bigEndian, data)).checkBuffer(precisionBits + exponentBits + 1), b);
    var bias = Math.pow(2, exponentBits - 1) - 1;
    var signal = b.readBits(precisionBits + exponentBits, 1);
    var exponent = b.readBits(precisionBits, exponentBits);
    var significand = 0;
    var divisor = 2;
    var curByte = b.buffer.length + (-precisionBits >> 3) - 1;
    var byteValue, startBit, mask;

    do {
      for (byteValue = b.buffer[++curByte], startBit = precisionBits % 8 || 8, mask = 1 << startBit; mask >>= 1;
        (byteValue & mask) && (significand += 1 / divisor), divisor *= 2);
    } while (precisionBits -= startBit);

    return exponent == (bias << 1) + 1 ? significand ? NaN : signal ? -Infinity : +Infinity :
      (1 + signal * -2) * (exponent || significand ? !exponent ? Math.pow(2, -bias + 1) * significand :
        Math.pow(2, exponent - bias) * (1 + significand) : 0);
  },
  decodeInt: function(data, bits, signed) {
    var b = new this.Buffer(this.bigEndian, data);
    var x = b.readBits(0, bits);
    var max = Math.pow(2, bits);

    return signed && x >= max / 2 ? x - max : x;
  },
  warn: function(msg) {
    if (this.allowExceptions) {
      throw new Error(msg);
    }

    return 1;
  },
  Buffer: Buffer,
  toSmall: function(data) { return this.decodeInt(data, 8, true); },
  fromSmall: function(number) { return this.encodeInt(number, 8, true); },
  toByte: function(data) { return this.decodeInt(data, 8, false); },
  fromByte: function(number) { return this.encodeInt(number, 8, false); },
  toShort: function(data) { return this.decodeInt(data, 16, true); },
  fromShort: function(number) { return this.encodeInt(number, 16, true); },
  toWord: function(data) { return this.decodeInt(data, 16, false); },
  fromWord: function(number) { return this.encodeInt(number, 16, false); },
  toInt: function(data) { return this.decodeInt(data, 32, true); },
  fromInt: function(number) { return this.encodeInt(number, 32, true); },
  toDWord: function(data) { return this.decodeInt(data, 32, false); },
  fromDWord: function(number) { return this.encodeInt(number, 32, false); },
  toFloat: function(data) { return this.decodeFloat(data, 23, 8); },
  fromFloat: function(number) { return this.encodeFloat(number, 23, 8); },
  toDouble: function(data) { return this.decodeFloat(data, 52, 11); },
  fromDouble: function(number) { return this.encodeFloat(number, 52, 11); }
};

//shl fix: Henri Torgemane ~1996 (compressed by Jonas Raoni)
function shl(a, b) {
  for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) == 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1);

  return a;
}

function Buffer(bigEndian, buffer) {
  this.bigEndian = bigEndian || 0, this.buffer = [], this.setBuffer(buffer);
}

Buffer.prototype = {
  readBits: function(start, length) {
    if (start < 0 || length <= 0) {
      return 0;
    }

    this.checkBuffer(start + length);

    for (var offsetLeft, offsetRight = start % 8, curByte = this.buffer.length - (start >> 3) - 1,
        lastByte = this.buffer.length + (-(start + length) >> 3), diff = curByte - lastByte,
        sum = ((this.buffer[curByte] >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1)) +
        (diff && (offsetLeft = (start + length) % 8) ? (this.buffer[lastByte++] & ((1 << offsetLeft) - 1)) <<
          (diff-- << 3) - offsetRight : 0); diff; sum += shl(this.buffer[lastByte++], (diff-- << 3) - offsetRight));

    return sum;
  },
  setBuffer: function(data) {
    if (data) {
      for (var l, i = l = data.length, b = this.buffer = new Array(l); i; b[l - i] = data.charCodeAt(--i));

      this.bigEndian && b.reverse();
    }
  },
  hasNeededBits: function(neededBits) {
    return this.buffer.length >= -(-neededBits >> 3);
  },
  checkBuffer: function(neededBits) {
    if (!this.hasNeededBits(neededBits)) {
      throw new Error("checkBuffer::missing bytes");
    }
  }
}
