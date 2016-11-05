import { Mode } from './Mode';
import QRData from './QRData';
import * as QRUtil from './QRUtil';

export default function QR8BitByte(data) {
  QRData.call(this, Mode.MODE_8BIT_BYTE, data);
}

QRUtil.inherits(QR8BitByte, QRData, {
  write: function(buffer) {
    var data = QRUtil.stringToUtf8ByteArray(this.getData());
    var length = data.length;

    for (var i = 0; i < length; i += 1) {
      buffer.put(data[i], 8);
    }
  },
  getLength: function() {
    return QRUtil.stringToUtf8ByteArray(this.getData()).length;
  }
});
