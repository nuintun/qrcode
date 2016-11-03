import QRError from './error';

export function setBlocks(){
  var codewords = this.CODEWORDS[this.version];
  var ec_codewords = this.EC_CODEWORDS[this.version][this.error_correction_level];

  this.data_codewords = codewords - ec_codewords;

  var ec_blocks = this.EC_BLOCKS[this.version][this.error_correction_level];

  var blocks;
  var blocks_first;
  var blocks_second = 0;
  var block_words_first;
  var block_words_second;

  var i, b;

  if (ec_blocks.length === 1) {
    blocks_first = ec_blocks[0];
    // set blocks_second = 0;
    blocks = blocks_first;
    block_words_first = this.data_codewords / blocks;
    block_words_second = 0;
  } else {
    blocks_first = ec_blocks[0];
    blocks_second = ec_blocks[1];
    blocks = blocks_first + blocks_second;
    block_words_first = Math.floor(this.data_codewords / blocks);
    block_words_second = block_words_first + 1;
  }

  this.block_ec_words = ec_codewords / blocks;
  this.block_data_lengths = [];

  for (b = 0; b < blocks_first; b++) {
    this.block_data_lengths[b] = block_words_first;
  }

  for (b = blocks_first; b < blocks; b++) {
    this.block_data_lengths[b] = block_words_second;
  }

  this.block_indices = [];

  for (b = 0; b < blocks; b++) {
    this.block_indices[b] = [];
  }

  var w = 0;

  for (i = 0; i < block_words_first; i++) {
    for (b = 0; b < blocks; b++) {
      this.block_indices[b].push(w++);
    }
  }

  for (b = blocks_first; b < blocks; b++) {
    this.block_indices[b].push(w++);
  }

  for (i = 0; i < this.block_ec_words; i++) {
    for (b = 0; b < blocks; b++) {
      this.block_indices[b].push(w++);
    }
  }
}

export function setFunctionalPattern(){
  function markSquare(qr, x, y, w, h){
    var i, j;

    for (i = x; i < x + w; i++) {
      for (j = y; j < y + h; j++) {
        qr.functional_pattern[i][j] = true;
      }
    }
  }

  function markAlignment(qr){
    var i, j;
    var n = qr.ALIGNMENT_PATTERNS[qr.version].length;

    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
          continue;
        }

        markSquare(
          qr,
          qr.ALIGNMENT_PATTERNS[qr.version][i] - 2,
          qr.ALIGNMENT_PATTERNS[qr.version][j] - 2,
          5,
          5
        );
      }
    }
  }

  this.functional_pattern = [];

  var x, y;

  for (x = 0; x < this.modules; x++) {
    this.functional_pattern[x] = [];

    for (y = 0; y < this.modules; y++) {
      this.functional_pattern[x][y] = false;
    }
  }

  // Finder and Format
  markSquare(this, 0, 0, 9, 9);
  markSquare(this, this.modules - 8, 0, 8, 9);
  markSquare(this, 0, this.modules - 8, 9, 8);

  // Timing
  markSquare(this, 8, 6, this.modules - 8 - 8, 1);
  markSquare(this, 6, 8, 1, this.modules - 8 - 8);

  // Alignment
  markAlignment(this);

  // Version
  if (this.version >= 7) {
    markSquare(this, 0, this.modules - 11, 6, 3);
    markSquare(this, this.modules - 11, 0, 3, 6);
  }
}

export function countBits(mode, version){
  if (mode === this.MODE.EightBit) {
    if (version < 10) {
      return 8;
    } else {
      return 16;
    }
  } else if (mode === this.MODE.AlphaNumeric) {
    if (version < 10) {
      return 9;
    } else if (version < 27) {
      return 11;
    } else {
      return 13;
    }
  } else if (mode === this.MODE.Numeric) {
    if (version < 10) {
      return 10;
    } else if (version < 27) {
      return 12;
    } else {
      return 14;
    }
  }

  throw new QRError('QRCode.UnknownMode', { mode: mode }, 'Internal error: Unknown mode: ' + mode + '.');
}

export function modulesFromVersion(version){
  return 17 + 4 * version;
}

export function setBackground(){
  return this.image.setBackground.apply(this.image, arguments);
}

export function setDark(){
  return this.image.setDark.apply(this.image, arguments);
}

export function isDark(){
  return this.image.isDark.apply(this.image, arguments);
}
