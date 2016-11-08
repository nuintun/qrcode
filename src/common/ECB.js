/**
 * <p>Encapsulates the parameters for one error-correction block in one symbol version.
 * This includes the number of data codewords, and the number of times a block with these
 * parameters is used consecutively in the QR code version's format.</p>
 */
export default function ECB(count, dataCodewords) {
  this.count = count;
  this.dataCodewords = dataCodewords;
}

ECB.prototype = {
  getCount: function() {
    return this.count;
  },
  getDataCodewords: function() {
    return this.dataCodewords;
  }
};
