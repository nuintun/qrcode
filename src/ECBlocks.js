/**
 * <p>Encapsulates a set of error-correction blocks in one symbol version. Most versions will
 * use blocks of differing sizes within one version, so, this encapsulates the parameters for
 * each set of blocks. It also holds the number of error-correction codewords per block since it
 * will be the same across all blocks within one version.</p>
 */
export default function ECBlocks(ecCodewordsPerBlock, ecBlocks) {
  ecBlocks = [].slice.call(arguments, 1);

  this.ecCodewordsPerBlock = ecCodewordsPerBlock;
  this.ecBlocks = ecBlocks;
}

ECBlocks.prototype = {
  getECCodewordsPerBlock: function() {
    return this.ecCodewordsPerBlock;
  },
  getNumBlocks: function() {
    var ecBlock;
    var total = 0;
    var ecBlocks = this.ecBlocks;

    for (var i = 0, length = ecBlocks.length; i < length; i++) {
      ecBlock = ECBlocks[i];
      total += ecBlock.getCount();
    }

    return total;
  },
  getTotalECCodewords: function() {
    return this.ecCodewordsPerBlock * this.getNumBlocks();
  },
  getECBlocks: function() {
    return this.ecBlocks;
  }
};
