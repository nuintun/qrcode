/**
 * @module ErrorCorrectLevel
 * @author nuintun
 * @author Kazuhiko Arase
 */

/**
 * @readonly
 * @enum {L, M, Q, H}
 */
enum ErrorCorrectLevel {
  // 7%
  L = 1,
  // 15%
  M = 0,
  // 25%
  Q = 3,
  // 30%
  H = 2
}

export default ErrorCorrectLevel;
