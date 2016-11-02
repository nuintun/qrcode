const rollup = require('rollup');

const I18N = {
  ALL: [
    'QRBase.UnknownMode',
    'QREncode.InvalidChar4Alphanumeric',
    'QREncode.InvalidChar4Numeric',
    'QREncode.UnsupportedECI',
    'QREncode.TextTooLong4TargetVersion',
    'QREncode.TextTooLong4AllVersion'
  ],
  ENCODE: [
    'QRBase.UnknownMode',
    'QREncode.InvalidChar4Alphanumeric',
    'QREncode.InvalidChar4Numeric',
    'QREncode.UnsupportedECI',
    'QREncode.TextTooLong4TargetVersion',
    'QREncode.TextTooLong4AllVersion'
  ],
  DECODE: [
    'QRBase.UnknownMode'
  ]
}

function isI18N(id) {
  return /[/\\]i18n[/\\]/i.test(id);
}

function build(entry, dest, i18n) {
  rollup.rollup({
    legacy: true,
    entry: entry,
    plugins: [{
      name: 'i18n',
      transform: function transform(code, id) {
        if (isI18N(id)) {
          var lang = {};
          var code = JSON.parse(code);

          i18n.forEach(function(key) {
            lang[key] = code[key] || `Locales error: ${ key } no localization.`;
          });

          code = JSON
            .stringify(lang, null, 2)
            .replace(/'/g, '\\\'')
            .replace(/([^\\])"/g, '$1\'');

          return `export default ${ code }`;
        }
      }
    }]
  }).then(function(bundle) {
    bundle.write({
      dest: dest,
      format: 'umd',
      indent: true,
      useStrict: true,
      moduleId: 'qrcode',
      moduleName: 'QRCode'
    });

    console.log(`  Build ${dest} success!`);
  }).catch(function(error) {
    console.log(error);
  });
}

build('src/index.js', 'dist/qrcode.all.js', I18N.ALL);
build('src/encode.js', 'dist/qrcode.encode.js', I18N.ENCODE);
build('src/decode.js', 'dist/qrcode.decode.js', I18N.DECODE);
