const extend = require('extend');
const rollup = require('rollup');

function build(entry, dest, options) {
  options = extend(true, {
    legacy: true,
    format: 'umd',
    indent: true,
    useStrict: true,
    moduleId: options.moduleId,
    moduleName: options.moduleName
  }, options);

  options.entry = entry;
  options.dest = dest;

  rollup.rollup(options).then(function(bundle) {
    bundle.write(options);

    console.log(`  Build ${dest} success!`);
  }).catch(function(error) {
    console.log(error);
  });
}

build('src/index.js', 'dist/qrcode.all.js', {
  moduleId: 'qrcode',
  moduleName: 'QRCode'
});

build('src/encode.js', 'dist/qrcode.encode.js', {
  moduleId: 'qrencode',
  moduleName: 'QREncode'
});

build('src/decode.js', 'dist/qrcode.decode.js', {
  moduleId: 'qrdecode',
  moduleName: 'QRDecode'
});
