import * as util from './util';

/**
 * QRError
 * @param type
 * @param data
 * @param message
 * @constructor
 */
export default function QRError(type, data, message){
  this.type = type;
  this.data = data;
  this.message = message;
}

// inherits
util.inherits(QRError, Error, {
  name: 'QRError'
});
