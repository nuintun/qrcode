var TMPLRE = /{{(.+?)}}/g;
var toSting = Object.prototype.toString;

/**
 * inherits
 * @param ctor
 * @param super_ctor
 * @param proto
 */
export function inherits(ctor, super_ctor, proto) {
  function F() {
    // constructor
  }

  // prototype
  F.prototype = super_ctor.prototype;

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
 * Unicode转UTF-8
 * @param {string} string
 * @returns {string}
 */
export function toUTF8(string) {
  var i, c;
  var out = '';
  var len = string.length;

  for (i = 0; i < len; i++) {
    c = string.charCodeAt(i);

    if ((c >= 0x0001) && (c <= 0x007F)) {
      out += string.charAt(i);
    } else if (c > 0x07FF) {
      out += String.fromCharCode(
        0xE0 | ((c >> 12) & 0x0F),
        0x80 | ((c >> 6) & 0x3F),
        0x80 | ((c >> 0) & 0x3F)
      );
    } else {
      out += String.fromCharCode(
        0xC0 | ((c >> 6) & 0x1F),
        0x80 | ((c >> 0) & 0x3F)
      );
    }
  }

  return out;
}

/**
 * UTF-8转Unicode
 * @param {string} string
 * @returns {string}
 */
export function toUnicode(string) {
  var i = 0;
  var out = '';
  var len = string.length;
  var mark, char1, char2, char3;

  while (i < len) {
    char1 = string.charCodeAt(i++);
    mark = char1 >> 4;

    if (mark <= 7) {
      // 0xxxxxxx
      out += string.charAt(i - 1);
    } else if (mark === 12 || mark === 13) {
      // 110x xxxx   10xx xxxx
      char2 = string.charCodeAt(i++);
      out += String.fromCharCode(((char1 & 0x1F) << 6) | (char2 & 0x3F));
    } else if (mark === 14) {
      // 1110 xxxx  10xx xxxx  10xx xxxx
      char2 = string.charCodeAt(i++);
      char3 = string.charCodeAt(i++);
      out += String.fromCharCode(((char1 & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
    }
  }

  return out;
}

/**
 * Sting judge
 * @param value
 * @returns {boolean}
 */
export function isString(value) {
  return toSting.call(value) === '[object String]';
}

/**
 * Simple template engine
 * @param tmpl
 * @param data
 * @returns {*}
 */
export function template(tmpl, data) {
  if (data) {
    return tmpl.replace(TMPLRE, function(matched, key) {
      return data.hasOwnProperty(key) ? data[key] : matched;
    });
  } else {
    return tmpl;
  }
}
