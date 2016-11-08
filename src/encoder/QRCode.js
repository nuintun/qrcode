import * as Mode from '../common/Mode';
import Version from '../common/Version';
import ErrorCorrectionLevel from '../common/ErrorCorrectionLevel';

var NUM_MASK_PATTERNS = 8;

export default function QRCode() {
  var context = this;

  context.mode = null;
  context.ecLevel = null;
  context.version = null;
  context.matrix = null;
  context.maskPattern = -1;
}

QRCode.prototype = {
  getMode: function() {
    return this.mode;
  },
  getECLevel: function() {
    return this.ecLevel;
  },
  getVersion: function() {
    return this.version;
  },
  getMatrix: function() {
    return this.matrix;
  },
  toString: function() {
    var result = '';
    result += '<<\n';
    result += ' mode: ';
    result += mode;
    result += '\n ecLevel: ';
    result += ecLevel;
    result += '\n version: ';
    result += version;
    result += '\n maskPattern: ';
    result += maskPattern;

    if (matrix == null) {
      result += '\n matrix: null\n';
    } else {
      result += '\n matrix:\n';
      result += matrix;
    }

    result += '>>\n';

    return result;
  },
  setMode: function(value) {
    this.mode = value;
  },
  setECLevel: function(value) {
    this.ecLevel = value;
  },
  setVersion: function(version) {
    this.version = version;
  },
  setMaskPattern: function(value) {
    this.maskPattern = value;
  },
  setMatrix: function(value) {
    this.matrix = value;
  },
  // Check if "mask_pattern" is valid.
  isValidMaskPattern: function(maskPattern) {
    var maskPattern = this.maskPattern;

    return maskPattern >= 0 && maskPattern < NUM_MASK_PATTERNS;
  }
};

QRCode.NUM_MASK_PATTERNS = NUM_MASK_PATTERNS;
