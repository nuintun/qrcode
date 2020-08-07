importScripts('./qrcode.js');

var TEST_NUMERIC = /^\d+$/;
var TEST_ALPHANUMERIC = /^[0-9A-Z$%*+-./: ]+$/;

function chooseBestModeData(mode, data) {
  if (mode !== 'Auto') {
    return new QRCode[mode](data);
  }

  if (TEST_NUMERIC.test(data)) {
    return new QRCode.QRNumeric(data);
  } else if (TEST_ALPHANUMERIC.test(data)) {
    return new QRCode.QRAlphanumeric(data);
  }

  try {
    return new QRCode.QRKanji(data);
  } catch (error) {
    return new QRCode.QRByte(data);
  }
}

self.onmessage = function (e) {
  var data = e.data;
  var qrcode = new QRCode.Encoder();
  var errorCorrectionLevel = QRCode.ErrorCorrectionLevel[data.ecLevel];

  qrcode.setEncodingHint(data.hasEncodingHint).setErrorCorrectionLevel(errorCorrectionLevel);

  try {
    qrcode.write(chooseBestModeData(data.mode, data.text)).make();

    self.postMessage({
      ok: true,
      src: qrcode.toDataURL(data.moduleSize, data.margin)
    });

    console.log(qrcode);
  } catch (error) {
    self.postMessage({
      ok: false,
      message: error.message
    });
  }
};
