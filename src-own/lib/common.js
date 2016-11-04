import QRError from './error';

export function setBlocks() {
  var context = this;
  var codewords = context.CODEWORDS[context.version];
  var ec_codewords = context.EC_CODEWORDS[context.version][context.error_correction_level];

  context.data_codewords = codewords - ec_codewords;

  var ec_blocks = context.EC_BLOCKS[context.version][context.error_correction_level];

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
    block_words_first = context.data_codewords / blocks;
    block_words_second = 0;
  } else {
    blocks_first = ec_blocks[0];
    blocks_second = ec_blocks[1];
    blocks = blocks_first + blocks_second;
    block_words_first = Math.floor(context.data_codewords / blocks);
    block_words_second = block_words_first + 1;
  }

  context.block_ec_words = ec_codewords / blocks;
  context.block_data_lengths = [];

  for (b = 0; b < blocks_first; b++) {
    context.block_data_lengths[b] = block_words_first;
  }

  for (b = blocks_first; b < blocks; b++) {
    context.block_data_lengths[b] = block_words_second;
  }

  context.block_indices = [];

  for (b = 0; b < blocks; b++) {
    context.block_indices[b] = [];
  }

  var w = 0;

  for (i = 0; i < block_words_first; i++) {
    for (b = 0; b < blocks; b++) {
      context.block_indices[b].push(w++);
    }
  }

  for (b = blocks_first; b < blocks; b++) {
    context.block_indices[b].push(w++);
  }

  for (i = 0; i < context.block_ec_words; i++) {
    for (b = 0; b < blocks; b++) {
      context.block_indices[b].push(w++);
    }
  }
}

export function setFunctionalPattern() {
  var context = this;

  function markSquare(context, x, y, w, h) {
    var i, j;

    for (i = x; i < x + w; i++) {
      for (j = y; j < y + h; j++) {
        context.functional_pattern[i][j] = true;
      }
    }
  }

  function markAlignment(context) {
    var i, j;
    var n = context.ALIGNMENT_PATTERNS[context.version].length;

    for (i = 0; i < n; i++) {
      for (j = 0; j < n; j++) {
        if (((i === 0) && (j === 0)) || ((i === 0) && (j === n - 1)) || ((i === n - 1) && (j === 0))) {
          continue;
        }

        markSquare(
          context,
          context.ALIGNMENT_PATTERNS[context.version][i] - 2,
          context.ALIGNMENT_PATTERNS[context.version][j] - 2,
          5,
          5
        );
      }
    }
  }

  context.functional_pattern = [];

  var x, y;

  for (x = 0; x < context.modules; x++) {
    context.functional_pattern[x] = [];

    for (y = 0; y < context.modules; y++) {
      context.functional_pattern[x][y] = false;
    }
  }

  // Finder and Format
  markSquare(context, 0, 0, 9, 9);
  markSquare(context, context.modules - 8, 0, 8, 9);
  markSquare(context, 0, context.modules - 8, 9, 8);

  // Timing
  markSquare(context, 8, 6, context.modules - 8 - 8, 1);
  markSquare(context, 6, 8, 1, context.modules - 8 - 8);

  // Alignment
  markAlignment(context);

  // Version
  if (context.version >= 7) {
    markSquare(context, 0, context.modules - 11, 6, 3);
    markSquare(context, context.modules - 11, 0, 3, 6);
  }
}

export function countBits(mode, version) {
  var context = this;

  if (mode === context.MODE.EightBit) {
    if (version < 10) {
      return 8;
    } else {
      return 16;
    }
  } else if (mode === context.MODE.AlphaNumeric) {
    if (version < 10) {
      return 9;
    } else if (version < 27) {
      return 11;
    } else {
      return 13;
    }
  } else if (mode === context.MODE.Numeric) {
    if (version < 10) {
      return 10;
    } else if (version < 27) {
      return 12;
    } else {
      return 14;
    }
  }

  throw new QRError('QRCode.UnknownMode', { mode: mode });
}

export function modulesFromVersion(version) {
  return 17 + 4 * version;
}

export function setBackground() {
  var context = this;

  return context.pixels.setBackground.apply(context.pixels, arguments);
}

export function setDark() {
  var context = this;

  return context.pixels.setDark.apply(context.pixels, arguments);
}

export function isDark() {
  var context = this;

  return context.pixels.isDark.apply(context.pixels, arguments);
}
