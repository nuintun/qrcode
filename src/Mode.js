/**
 * <p>See ISO 18004:2006, 6.4.1, Tables 2 and 3. This enum encapsulates the various modes in which
 * data can be encoded to bits in the QR code standard.</p>
 */
function Mode(bits, characterCountBitsForVersions) {
  this.bits = bits;
  this.characterCountBitsForVersions = characterCountBitsForVersions;
}

Mode.prototype = {
  getCharacterCountBits: function(version) {
    var offset;
    var number = version.getVersionNumber();

    if (number <= 9) {
      offset = 0;
    } else if (number <= 26) {
      offset = 1;
    } else {
      offset = 2;
    }

    return this.characterCountBitsForVersions[offset];
  },
  getBits: function() {
    return this.bits;
  }
};

var TERMINATOR = new Mode(0x00, [0, 0, 0]); // Not really a mode...
var NUMERIC = new Mode(0x01, [10, 12, 14]);
var ALPHANUMERIC = new Mode(0x02, [9, 11, 13]);
var STRUCTURED_APPEND = new Mode(0x03, [0, 0, 0]); // Not supported
var BYTE = new Mode(0x04, [8, 16, 16]);
var ECI = new Mode(0x07, [0, 0, 0]); // character counts don't apply
var KANJI = new Mode(0x08, [8, 10, 12]);
var FNC1_FIRST_POSITION = new Mode(0x05, [0, 0, 0]);
var FNC1_SECOND_POSITION = new Mode(0x09, [0, 0, 0]);
var HANZI = new Mode(0x0D, [8, 10, 12]); // See GBT 18284-2000; "Hanzi" is a transliteration of this mode name.

function forBits(bits) {
  switch (bits) {
    case 0x0:
      return TERMINATOR;
    case 0x1:
      return NUMERIC;
    case 0x2:
      return ALPHANUMERIC;
    case 0x3:
      return STRUCTURED_APPEND;
    case 0x4:
      return BYTE;
    case 0x5:
      return FNC1_FIRST_POSITION;
    case 0x7:
      return ECI;
    case 0x8:
      return KANJI;
    case 0x9:
      return FNC1_SECOND_POSITION;
    case 0xD:
      // 0xD is defined in GBT 18284-2000, may not be supported in foreign country
      return HANZI;
    default:
      throw new TypeError('IllegalArgumentException: unknow mode');
  }
}

export {
  TERMINATOR,
  NUMERIC,
  ALPHANUMERIC,
  STRUCTURED_APPEND,
  BYTE,
  ECI,
  KANJI,
  FNC1_FIRST_POSITION,
  FNC1_SECOND_POSITION,
  HANZI,
  forBits
};
