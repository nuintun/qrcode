/**
 * @module Mode
 * @author nuintun
 * @author Cosmo Wolfe
 * @author Kazuhiko Arase
 */

/**
 * @readonly
 */
export enum Mode {
  Terminator = 0x00,
  Numeric = 0x01,
  Alphanumeric = 0x02,
  StructuredAppend = 0x03,
  Byte = 0x04,
  Kanji = 0x08,
  ECI = 0x07
  // FNC1FirstPosition = 0x05,
  // FNC1SecondPosition = 0x09
}
