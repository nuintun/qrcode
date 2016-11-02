import EN from './i18n/en.json';

var toSrting = {}.toString;

function isString(value) {
  return toString.call(value) === '[object String]';
}

export default function Locales(name, locale) {
  var locales = {};

  name = name || 'en';
  locale = locale || EN;

  locales[name] = locale;

  this.active = name;
  this.locales = locales;
}

Locales.prototype = {
  locale: function(name, locale) {
    if (arguments.length === 0) {
      return this;
    }

    if (arguments.length >= 2) {
      if (locale) {
        for (var key in EN) {
          if (!isString(locale[key])) {
            locale[key] = EN[key];
          }
        }
      } else {
        locale = EN;
      }

      this.locales[name] = locale;
    }

    if (this.locales[name]) {
      this.active = name;
    }

    return this;
  },
  render: function(code, data) {

  }
}
