/**
 * @module utils
 */

export function toBit(value: number): 0 | 1 {
  return (value & 0x01) as 0 | 1;
}

export function toUint32(value: number): number {
  return value >>> 0;
}

export function round(value: number): number {
  return (value + (value < 0 ? -0.5 : 0.5)) | 0;
}

export function getBitMask(value: number): number {
  return 1 << getBitOffset(value);
}

export function getBitOffset(value: number): number {
  return value & 0x1f;
}

export function charAt(value: string, index: number): string {
  const character = value.at(index);

  return character != null ? character : '';
}

// Get hamming weight of int32.
export function hammingWeight(value: number): number {
  // HD, Figure 5-2.
  value = value - ((value >> 1) & 0x55555555);
  value = (value & 0x33333333) + ((value >> 2) & 0x33333333);

  return (((value + (value >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
}

// Return the position of the most significant bit set (to one) in the "value". The most
// significant bit is position 32. If there is no bit set, return 0. Examples:
// - findMSBSet(0) => 0
// - findMSBSet(1) => 1
// - findMSBSet(255) => 8
export function findMSBSet(value: number): number {
  return 32 - Math.clz32(value);
}

// Calculate BCH (Bose-Chaudhuri-Hocquenghem) code for "value" using polynomial "poly". The BCH
// code is used for encoding type information and version information.
// Example: Calculation of version information of 7.
// f(x) is created from 7.
//   - 7 = 000111 in 6 bits
//   - f(x) = x^2 + x^1 + x^0
// g(x) is given by the standard (p. 67)
//   - g(x) = x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1
// Multiply f(x) by x^(18 - 6)
//   - f'(x) = f(x) * x^(18 - 6)
//   - f'(x) = x^14 + x^13 + x^12
// Calculate the remainder of f'(x) / g(x)
//         x^2
//         __________________________________________________
//   g(x) )x^14 + x^13 + x^12
//         x^14 + x^13 + x^12 + x^11 + x^10 + x^7 + x^4 + x^2
//         --------------------------------------------------
//                              x^11 + x^10 + x^7 + x^4 + x^2
//
// The remainder is x^11 + x^10 + x^7 + x^4 + x^2
// Encode it in binary: 110010010100
// The return value is 0xc94 (1100 1001 0100)
//
// Since all coefficients in the polynomials are 1 or 0, we can do the calculation by bit
// operations. We don't care if coefficients are positive or negative.
export function calculateBCHCode(value: number, poly: number): number {
  // If poly is "1 1111 0010 0101" (version info poly), msbSetInPoly is 13. We'll subtract 1
  // from 13 to make it 12.
  const msbSetInPoly = findMSBSet(poly);

  value <<= msbSetInPoly - 1;

  // Do the division business using exclusive-or operations.
  while (findMSBSet(value) >= msbSetInPoly) {
    value ^= poly << (findMSBSet(value) - msbSetInPoly);
  }

  // Now the "value" is the remainder (i.e. the BCH code).
  return value;
}

export function accumulate(array: ArrayLike<number>, start: number = 0, end: number = array.length): number {
  let total = 0;

  for (let i = start; i < end; i++) {
    total += array[i];
  }

  return total;
}
