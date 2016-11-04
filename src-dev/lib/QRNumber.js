import QRData from './QRData';
import * as QRUtil from './QRUtil';
import { Mode } from './Mode';

export default function QRNumber(data) {
  QRData.call(this, Mode.MODE_NUMBER, data);
}

function strToNum(s) {
  var num = 0;

  for (var i = 0; i < s.length; i += 1) {
    num = num * 10 + chatToNum(s.charAt(i));
  }

  return num;
}

function chatToNum(c) {
  if ('0' <= c && c <= '9') {
    return c.charCodeAt(0) - '0'.charCodeAt(0);
  }

  throw 'illegal char: ' + c;
}

QRUtil.inherits(QRNumber, QRData, {
  write: function(buffer) {
    var data = this.getData();

    var i = 0;

    while (i + 2 < data.length) {
      buffer.put(strToNum(data.substring(i, i + 3)), 10);

      i += 3;
    }

    if (i < data.length) {
      if (data.length - i == 1) {
        buffer.put(strToNum(data.substring(i, i + 1)), 4);
      } else if (data.length - i == 2) {
        buffer.put(strToNum(data.substring(i, i + 2)), 7);
      }
    }
  }
});
