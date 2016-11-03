import * as util from './util';

// slice
var slice = [].slice;

/**
 * QRError
 */
export default function QRError(){
  this.code = arguments[0];

  Error.apply(this, slice.call(arguments, 1));
}

util.inherits(QRError, Error, {
  name: 'QRError'
});
