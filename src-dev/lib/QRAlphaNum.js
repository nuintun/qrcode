import * as QRUtil from './QRUtil';
import { Mode } from './Mode';
import QRData from './QRData';

export default function QRAlphaNum(data) {
  QRData.call(this, Mode.MODE_8BIT_BYTE, data);
}

function getCode(c) {
  if ('0' <= c && c <= '9') {
    return c.charCodeAt(0) - '0'.charCodeAt(0);
  } else if ('A' <= c && c <= 'Z') {
    return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  } else {
    switch (c) {
      case ' ':
        return 36;
      case '$':
        return 37;
      case '%':
        return 38;
      case '*':
        return 39;
      case '+':
        return 40;
      case '-':
        return 41;
      case '.':
        return 42;
      case '/':
        return 43;
      case ':':
        return 44;
      default:
        throw new Error('illegal char: ' + c);
    }
  }
};

QRUtil.inherits(QRAlphaNum, QRData, {
  write: function(buffer) {
    var i = 0;
    var s = this.getData();
    var length = s.length;

    while (i + 1 < length) {
      buffer.put(getCode(s.charAt(i)) * 45 + getCode(s.charAt(i + 1)), 11);

      i += 2;
    }

    if (i < length) {
      buffer.put(getCode(s.charAt(i)), 6);
    }
  }
});
