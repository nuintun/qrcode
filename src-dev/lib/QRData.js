import { Mode } from './Mode';

export default function QRData(mode, data) {
  this.mode = mode;
  this.data = data;
}

QRData.prototype = {
  getMode: function() {
    return this.mode;
  },
  getData: function() {
    return this.data;
  },
  getLengthInBits: function(version) {
    var mode = this.mode;

    if (1 <= version && version < 10) {
      // 1 - 9
      switch (mode) {
        case Mode.MODE_NUMBER:
          return 10;
        case Mode.MODE_ALPHA_NUM:
          return 9;
        case Mode.MODE_8BIT_BYTE:
          return 8;
        case Mode.MODE_KANJI:
          return 8;
        default:
          throw 'mode:' + mode;
      }
    } else if (version < 27) {
      // 10 - 26
      switch (mode) {
        case Mode.MODE_NUMBER:
          return 12;
        case Mode.MODE_ALPHA_NUM:
          return 11;
        case Mode.MODE_8BIT_BYTE:
          return 16;
        case Mode.MODE_KANJI:
          return 10;
        default:
          throw 'mode:' + mode;
      }
    } else if (version < 41) {
      // 27 - 40
      switch (mode) {
        case Mode.MODE_NUMBER:
          return 14;
        case Mode.MODE_ALPHA_NUM:
          return 13;
        case Mode.MODE_8BIT_BYTE:
          return 16;
        case Mode.MODE_KANJI:
          return 12;
        default:
          throw 'mode:' + mode;
      }
    } else {
      throw 'version:' + version;
    }
  }
};
