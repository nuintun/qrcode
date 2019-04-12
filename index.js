const { Encoder, ErrorCorrectLevel } = require('./es5');

const qrcode = new Encoder();

qrcode.addData('hello world !');

qrcode.setVersion(1);
qrcode.setErrorCorrectLevel(ErrorCorrectLevel.L);
qrcode.make();

console.log(qrcode.toDataURL());
