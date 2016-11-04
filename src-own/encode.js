import * as util from './lib/util';
import * as QRCONST from './lib/const';
import QREncode from './lib/encode';

export default {
  MODE: {
    Numeric: QRCONST.MODE.Numeric,
    EightBit: QRCONST.MODE.EightBit,
    AlphaNumeric: QRCONST.MODE.AlphaNumeric
  },
  ECLEVEL: {
    L: QRCONST.ERROR_CORRECTION_LEVEL.L,
    M: QRCONST.ERROR_CORRECTION_LEVEL.M,
    Q: QRCONST.ERROR_CORRECTION_LEVEL.Q,
    H: QRCONST.ERROR_CORRECTION_LEVEL.H
  },
  Encode: function (mode, text, version, ec_level){
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
