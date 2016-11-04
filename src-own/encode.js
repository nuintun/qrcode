import * as util from './lib/util';
import * as QRCONST from './lib/const';
import QREncode from './lib/encode';

export default {
  MODE: QRCONST.MODE,
  ECLEVEL: QRCONST.ERROR_CORRECTION_LEVEL,
  Encode: function(mode, text, version, ec_level) {
    text += '';
    text = mode === QRCONST.MODE.EightBit ? util.toUTF8(text) : text;

    var qrcode = new QREncode();

    version = isNaN(version) ? 0 : version;

    if (version <= 0 || version > 40) {
      version = qrcode.getVersionFromLength(mode, text, ec_level);
    }

    return qrcode.encodeToPixArray(mode, text, version, ec_level);
  }
}
