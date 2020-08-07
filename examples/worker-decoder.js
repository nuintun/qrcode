importScripts('./qrcode.js');

if (self.Uint8ClampedArray) {
  if (!Uint8ClampedArray.from) {
    Uint8ClampedArray.from = function (array) {
      return new Uint8ClampedArray(array);
    };
  }

  if (!Uint8ClampedArray.prototype.forEach) {
    var APForEach = Array.prototype.forEach;

    Uint8ClampedArray.prototype.forEach = function (callback, context) {
      return APForEach.call(this, callback, context);
    };
  }
}

function getModuleSize(location, version) {
  var topLeft = location.topLeft;
  var topRight = location.topRight;
  var a = Math.abs(topRight.x - topLeft.x);
  var b = Math.abs(topRight.y - topLeft.y);
  var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

  return c / (version * 4 + 17);
}

self.onmessage = function (e) {
  var data = e.data;
  var result = new QRCode.Decoder().setOptions({ canOverwriteImage: false }).decode(data.image, data.width, data.height);

  if (result) {
    self.postMessage({
      ok: true,
      text: result.data,
      location: result.location,
      moduleSize: getModuleSize(result.location, result.version)
    });

    console.log(result);
  } else {
    self.postMessage({
      ok: false,
      message: '二维码解码失败'
    });
  }
};
