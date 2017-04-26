import * as Mode from './mode';

/**
 * string to utf8 byte array
 * @param string
 * @returns {Array}
 */
function stringToUtf8ByteArray(string) {
  var charcode;
  var utf8 = [];
  var length = string.length;

  for (var i = 0; i < length; i++) {
    charcode = string.charCodeAt(i);

    if (charcode < 0x80) {
      utf8.push(charcode);
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    } else {
      // surrogate pair
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (string.charCodeAt(i) & 0x3ff));

      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  return utf8;
}

export default function ByteData(data) {
  this.mode = Mode.BYTE;
  this.data = stringToUtf8ByteArray(data);
}

ByteData.getBitsLength = function(length) {
  return length * 8;
}

ByteData.prototype = {
  getLength: function() {
    return this.data.length;
  },
  getBitsLength: function() {
    return ByteData.getBitsLength(this.data.length);
  },
  write: function(bitBuffer) {
    for (var i = 0, l = this.data.length; i < l; i++) {
      bitBuffer.put(this.data[i], 8);
    }
  }
};
