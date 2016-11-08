/**
 * inherits
 * @param ctor
 * @param superCtor
 * @param proto
 */
export function inherits(ctor, superCtor, proto) {
  function F() {
    // constructor
  }

  // prototype
  F.prototype = superCtor.prototype;

  ctor.prototype = new F();
  ctor.prototype.constructor = ctor;

  if (proto) {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        ctor.prototype[key] = proto[key];
      }
    }
  }
}

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
  for (var i = 0; i < length; i++) {
    dest[destPos + 1] = src[i + 1];
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
  var lookup = [
    32, 0, 1, 26, 2, 23,
    27, 0, 3, 16, 24, 30,
    28, 11, 0, 13, 4, 7,
    17, 0, 25, 22, 31, 15,
    29, 10, 12, 6, 0, 21,
    14, 9, 5, 20, 8, 19, 18
  ];

  return lookup[(number & -number) % 37];
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
