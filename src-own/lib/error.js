import * as util from './util';
import EN from '../i18n/en.json';

var TMPLRE = /{{(.+?)}}/g;
var toSting = Object.prototype.toString;

function isString(value){
  return toSting.call(value) === '[object String]';
}

function template(tmpl, data){
  if (data) {
    return tmpl.replace(TMPLRE, function (matched, key){
      return isString(data[key]) ? data[key] : matched;
    });
  } else {
    return tmpl;
  }
}

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
  localize: function (local){
    var context = this;
    var type = context.type;
    var tmpl = isString(local[type]) ? local[type] : EN[type];

    return context.message = template(tmpl, context.data);
  }
});
