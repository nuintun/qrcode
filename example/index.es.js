import { Encoder, ErrorCorrectLevel } from '../esnext';

var image = new Image();
var data = document.getElementById('data');
var holder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

image.src = holder;
image.style.width = 'auto';
image.style.height = 'auto';

document.body.appendChild(image);

function create() {
  if (data.value) {
    try {
      console.time('QRCode');

      var qrcode = new Encoder();

      qrcode.addData(data.value + '\n');
      qrcode.setErrorCorrectLevel(ErrorCorrectLevel.L);
      qrcode.make();

      console.timeEnd('QRCode');

      console.time('toDataURL');

      image.src = qrcode.toDataURL();

      console.timeEnd('toDataURL');
    } catch (error) {
      image.src = holder;

      console.timeEnd('QRCode');

      console.error(error);
    }
  } else {
    image.src = holder;
  }
}

var button = document.getElementById('create');

if (button.addEventListener) {
  button.addEventListener('click', create, false);
} else {
  button.attachEvent('onclick', create);
}
