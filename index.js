const { Encoder } = require('./es5');

const qrcode = new Encoder();

qrcode.addData('hello world !');

qrcode.setVersion(3);
qrcode.make();

console.log(qrcode.toDataURL());
