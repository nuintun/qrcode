/**
 * @module ErrorCorrectionLevel
 * @author nuintun
 * @author Cosmo Wolfe
 * @author Kazuhiko Arase
 */

/**
 * @readonly
 * @enum {L, M, Q, H}
 */
enum ErrorCorrectionLevel {
  // 7%
  L = 1,
  // 15%
  M = 0,
  // 25%
  Q = 3,
  // 30%
  H = 2
}

export default ErrorCorrectionLevel;
