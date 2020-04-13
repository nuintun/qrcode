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
  Terminator = 0x0,
  Numeric = 0x1,
  Alphanumeric = 0x2,
  StructuredAppend = 0x3,
  Byte = 0x4,
  Kanji = 0x8,
  ECI = 0x7
  // FNC1FirstPosition = 0x5,
  // FNC1SecondPosition = 0x9
}
