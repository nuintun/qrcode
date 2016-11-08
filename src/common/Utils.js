/**
 * copy array
 *
 * @param {any} src
 * @param {any} srcPos
 * @param {any} dest
 * @param {any} destPos
 * @param {any} length
 * @returns { Array }
 */
export function arrayCopy(src, srcPos, dest, destPos, length) {
  for (var i = srcPos; i < length; i++) {
    dest[destPos++] = src[i];
  }

  return dest;
}

/**
 * number of trailing zeros
 *
 * @param {any} number
 * @returns
 */
export function numberOfTrailingZeros(number) {
  var zeros = number.toString(2).match(/0+$/);

  return zeros === null ? 0 : zeros[0].length;
}

/**
 * array equals
 *
 * @param {any} origin
 * @param {any} target
 * @returns
 */
export default function arrayEquals(origin, target) {
  if (origin.length !== target.length) {
    return false;
  }

  for (var i = 0, length = origin.length; i < length; i++) {
    if (origin[i] !== target[i]) {
      return false;
    }
  }

  return true;
}

/**
 * hash code
 * @export
 * @param {any} value
 * @returns
 */
export function hashCode(value) {
  if (typeof(value) === 'object') {
    value = JSON.stringify(value);
  }

  var h = 0;
  var len = value.length;
  var off = 0;

  for (var i = 0; i < len; i++) {
    h = 31 * h + value.charCodeAt(off++);
    /**
     * Cast to first 32 bits
     * Warning: only works for Big endian numbers
     */
    h = h & 0xFFFFFFFF;
  }

  return h;
}
