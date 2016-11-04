import { Mode } from './Mode';
import QRCode from './QRCode';
import QRData from './QRData';
import * as QRUtil from './QRUtil';

export default function QRKanji() {
  QRData.call(this, Mode.MODE_KANJI, data);
}

QRUtil.inherits(QRKanji, QRData, {
  write: function(buffer) {
    var context = this;
    var data = QRCode.stringToBytes(context.getData());

    var c;
    var i = 0;

    while (i + 1 < data.length) {
      c = ((0xff & data[i]) << 8) | (0xff & data[i + 1]);

      if (0x8140 <= c && c <= 0x9FFC) {
        c -= 0x8140;
      } else if (0xE040 <= c && c <= 0xEBBF) {
        c -= 0xC140;
      } else {
        throw 'illegal char at ' + (i + 1) + '/' + c;
      }

      c = ((c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

      buffer.put(c, 13);

      i += 2;
    }

    if (i < data.length) {
      throw 'illegal char at ' + (i + 1);
    }
  },
  getLength: function() {
    return QRCode.stringToBytes(this.getData()).length / 2;
  }
});
