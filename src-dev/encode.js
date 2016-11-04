import { Mode } from './lib/Mode';
import QRCode from './lib/QRCode';
import * as QRUtil from './lib/QRUtil';
import { ErrorCorrectLevel } from './lib/ErrorCorrectLevel';

export default {
  MODE: Mode,
  ECLEVEL: ErrorCorrectLevel,
  Encode: QRCode,
  autoVersion: function() {
    QRUtil.getMaxLength;
  }
}
