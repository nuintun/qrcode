const rollup = require('rollup');

rollup.rollup({
  entry: 'src/index.js',
  legacy: false
}).then(function(bundle) {
  bundle.write({
    format: 'umd',
    indent: true,
    useStrict: true,
    moduleId: 'qrcode',
    moduleName: 'QRCode',
    dest: 'dist/bundle.js'
  });
}).catch(function(error) {
  console.log(error);
});
