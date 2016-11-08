/**
 * <p>See ISO 18004:2006, 6.5.1. This enum encapsulates the four error correction levels
 * defined by the QR code standard.</p>
 */

import IllegalArgumentException from '../exception/IllegalArgumentException';

function ErrorCorrectionLevel(bits) {
  this.bits = bits;
}

ErrorCorrectionLevel.prototype = {
  getBits: function() {
    return this.bits;
  }
};

// /** L = ~7% correction */
//   L(0x01),
//   /** M = ~15% correction */
//   M(0x00),
//   /** Q = ~25% correction */
//   Q(0x03),
//   /** H = ~30% correction */
//   H(0x02);

// L = ~7% correction
var L = new ErrorCorrectionLevel(0x01);
// M = ~15% correction
var M = new ErrorCorrectionLevel(0x00);
// Q = ~25% correction
var Q = new ErrorCorrectionLevel(0x03);
// H = ~30% correction
var H = new ErrorCorrectionLevel(0x02);

/**
 * @param bits int containing the two bits encoding a QR Code's error correction level
 * @return ErrorCorrectionLevel representing the encoded error correction level
 */
function forBits(bits) {
  switch (bits) {
    case 0x01:
      return L;
    case 0x00:
      return M;
    case 0x03:
      return Q;
    case 0x02:
      return H;
    default:
      throw new IllegalArgumentException('Unkown error correction level');
  }
}

export {
  L,
  M,
  Q,
  H,
  forBits
}
