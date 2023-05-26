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
  TERMINATOR = 0x0,
  NUMERIC = 0x1,
  ALPHANUMERIC = 0x2,
  STRUCTURED_APPEND = 0x3,
  BYTE = 0x4,
  KANJI = 0x8,
  ECI = 0x7,
  FNC1_FIRST_POSITION = 0x5,
  FNC1_SECOND_POSITION = 0x9,
  // HANZI 0xD is defined in GBT 18284-2000, may not be supported in foreign country
  HANZI = 0xd
}
