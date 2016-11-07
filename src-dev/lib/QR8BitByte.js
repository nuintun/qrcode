import { Mode } from './Mode';
import QRData from './QRData';
import * as QRUtil from './QRUtil';
import UTF8 from './encoding/UTF8';

export default function QR8BitByte(data) {
  this.source = data;

  QRData.call(this, Mode.MODE_8BIT_BYTE, UTF8(data));
}

QRUtil.inherits(QR8BitByte, QRData, {
  write: function(buffer) {
    var data = this.getData();
    var length = data.length;

    for (var i = 0; i < length; i++) {
      buffer.put(data[i], 8);
    }
  }
});
