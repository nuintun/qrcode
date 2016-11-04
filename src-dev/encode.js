import { Mode } from './lib/Mode';
import QRCode from './lib/QRCode';
import QRKanji from './lib/QRKanji';
import QRNumber from './lib/QRNumber';
import QRAlphaNum from './lib/QRAlphaNum';
import QR8BitByte from './lib/QR8BitByte';
import { ErrorCorrectLevel } from './lib/ErrorCorrectLevel';

export default {
  MODE: {
    NUMBER: Mode.MODE_NUMBER,
    ALPHANUM: Mode.ALPHA_NUM,
    EIGHTBIT: Mode.MODE_8BIT_BYTE,
    KANJI: Mode.MODE_KANJI
  },
  ECLEVEL: {
    L: ErrorCorrectLevel.L,
    M: ErrorCorrectLevel.M,
    Q: ErrorCorrectLevel.Q,
    H: ErrorCorrectLevel.H
  },
  Encode: QRCode,
  QRKanji: QRKanji,
  QRNumber: QRNumber,
  QRAlphaNum: QRAlphaNum,
  QR8BitByte: QR8BitByte
}
