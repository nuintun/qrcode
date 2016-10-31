var slice = [].slice;

export default function QRError() {
  this.code = arguments[0];

  Error.apply(this, slice.call(arguments, 1));
}

QRError.prototype.name = 'QRError';
QRError.prototype = Error.prototype;
QRError.prototype.constructor = QRBase.QRError;
