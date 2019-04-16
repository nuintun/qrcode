import { Decoder } from '../../esnext';

var decoder = new Decoder();

decoder
  .scan('./qrcode.gif')
  .then(function(data) {
    var pre = document.createElement('pre');

    pre.appendChild(document.createTextNode(data.data));

    document.body.appendChild(pre);
  })
  .catch(function(error) {
    console.error(error);
  });
