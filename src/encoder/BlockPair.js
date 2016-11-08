export default function BlockPair(dataBytes, errorCorrectionBytes) {
  this.dataBytes = dataBytes;
  this.errorCorrectionBytes = errorCorrectionBytes;
}

BlockPair.prototype = {
  getDataBytes: function() {
    return this.dataBytes;
  },
  getErrorCorrectionBytes: function() {
    return this.errorCorrectionBytes;
  }
};
