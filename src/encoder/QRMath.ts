/**
 * @module QRMath
 * @author nuintun
 * @author Kazuhiko Arase
 */

const EXP_TABLE: number[] = [];
const LOG_TABLE: number[] = [];

for (let i = 0; i < 256; i++) {
  LOG_TABLE[i] = 0;
  EXP_TABLE[i] = i < 8 ? 1 << i : EXP_TABLE[i - 4] ^ EXP_TABLE[i - 5] ^ EXP_TABLE[i - 6] ^ EXP_TABLE[i - 8];
}

for (let i = 0; i < 255; i++) {
  LOG_TABLE[EXP_TABLE[i]] = i;
}

export function glog(n: number): number {
  if (n < 1) {
    throw new Error(`illegal log: ${n}`);
  }

  return LOG_TABLE[n];
}

export function gexp(n: number): number {
  while (n < 0) {
    n += 255;
  }

  while (n >= 256) {
    n -= 255;
  }

  return EXP_TABLE[n];
}
