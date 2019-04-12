/**
 * @module Mode
 * @author nuintun
 * @author Kazuhiko Arase
 */

enum Mode {
  // number
  Numeric = 0x1,
  // alphabet and number
  Alphanumeric = 0x2,
  // 8bit byte
  Byte = 0x4,
  // KANJI
  Kanji = 0x8
}

export default Mode;
