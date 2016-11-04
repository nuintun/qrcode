import * as util from './util';
import EN from '../i18n/en.json';

/**
 * QRError
 * @param type
 * @param data
 * @constructor
 */
export default function QRError(type, data){
  var context = this;

  context.type = type;
  context.data = data || null;

  context.localize(EN);
}

// inherits
util.inherits(QRError, Error, {
  name: 'QRError',
  /**
   * localize
   * @param local
   * @returns {*}
   */
  localize: function (local){
    var context = this;
    var type = context.type;
    var tmpl = util.isString(local[type]) ? local[type] : EN[type];

    return context.message = util.template(tmpl, context.data);
  }
});
