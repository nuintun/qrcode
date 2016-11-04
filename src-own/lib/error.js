import * as util from './util';

/**
 * QRError
 * @param type
 * @param data
 * @param message
 * @constructor
 */
export default function QRError(type, data, message){
  var context = this;

  context.type = type;
  context.data = data;
  context.message = message;
}

// inherits
util.inherits(QRError, Error, {
  name: 'QRError'
});
