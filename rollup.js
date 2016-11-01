const rollup = require('rollup');

function build(entry, dest) {
  rollup.rollup({
    legacy: true,
    entry: entry
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

build('src/index.js', 'dist/qrcode.all.js');
build('src/encode.js', 'dist/qrcode.encode.js');
build('src/decode.js', 'dist/qrcode.decode.js');
