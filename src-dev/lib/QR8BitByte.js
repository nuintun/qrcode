import * as QRUtil from './QRUtil';
import { Mode } from './Mode';
import QRData from './QRData';
import QRCode from './QRCode';

export default function QR8BitByte(data) {
  QRData.call(this, Mode.MODE_8BIT_BYTE, data);
}

QRUtil.inherits(QR8BitByte, QRData, {
  write: function(buffer) {
    var data = QRCode.stringToBytes(this.getData());

    for (var i = 0; i < data.length; i += 1) {
      buffer.put(data[i], 8);
    }
  },
  getLength: function() {
    return QRCode.stringToBytes(this.getData()).length;
  }
});
