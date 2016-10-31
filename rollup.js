const rollup = require('rollup');

rollup.rollup({
  entry: 'src/index.js',
  legacy: false
}).then(function(bundle) {
  bundle.write({
    format: 'cjs',
    useStrict: true,
    dest: 'dist/bundle.js'
  });
}).catch(function(error) {
  console.log(error);
});
