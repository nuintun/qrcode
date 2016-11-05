import { Mode } from './Mode';
import QRData from './QRData';
import * as QRUtil from './QRUtil';

export default function QR8BitByte(data) {
  this.source = data;

  QRData.call(this, Mode.MODE_8BIT_BYTE, QRUtil.stringToUtf8ByteArray(data));
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
