'use strict';

(function ($, window, document, undefined){
  $.QREncode.Render.canvas = function (self, callback){
    var i;
    var j;
    var cfg = self.config;
    var mSize = cfg.moduleSize;
    var size = self.pixArr.length;
    var outSize = 2 * cfg.margin + size;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    function getRGB(color){
      var red, green, blue;

      if (color.indexOf('#') === 0) {
        color = color.substr(1);
      }

      if (color.length === 6) {
        red = color.substr(0, 2);
        green = color.substr(2, 2);
        blue = color.substr(4, 2);
      } else if (color.length === 3) {
        red = color.substr(0, 1);
        red += red;
        green = color.substr(1, 1);
        green += green;
        blue = color.substr(2, 1);
        blue += blue;
      } else {
        throw new Error('Error color');
      }

      return 'rgb(' + parseInt(red, 16) + ', ' + parseInt(green, 16) + ', ' + parseInt(blue, 16) + ')';
    }

    // 初始化画布
    function init(size){
      size = cfg.margin * 2 + size;
      canvas.width = size * mSize;
      canvas.height = size * mSize;
      ctx.fillStyle = getRGB(cfg.bgColor);

      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 设置色块
    function setBlock(i, j){
      ctx.fillStyle = getRGB(cfg.moduleColor);
      ctx.fillRect(i * mSize, j * mSize, mSize, mSize);
    }

    // 渲染logo
    function renderLogo(callback){
      var img = new Image();

      img.onload = function (){
        var x;
        var y;
        var zoom;
        var imgW = img.width;
        var imgH = img.height;
        var imgSize = Math.max(imgW, imgH);

        if (imgSize > size * mSize * 0.3) {
          zoom = (size * mSize * 0.3) / imgSize;
          imgW = imgW * zoom;
          imgH = imgH * zoom;
        }

        x = Math.round((outSize * mSize - imgW) / 2);
        y = Math.round((outSize * mSize - imgH) / 2);

        ctx.drawImage(img, x, y, imgW, imgH);

        $.isFunction(callback) && callback();

        img.onload = null;
      };

      img.src = cfg.logo;
    }

    init(size);

    for (i = cfg.margin; i < size + cfg.margin; i++) {
      for (j = cfg.margin; j < size + cfg.margin; j++) {
        if (self.pixArr[i - cfg.margin][j - cfg.margin]) {
          setBlock(i, j, getRGB(cfg.moduleColor));
        }
      }
    }

    if (cfg.logo) {
      renderLogo(function (){
        $.isFunction(callback) && callback(canvas);
      });
    } else {
      $.isFunction(callback) && callback(canvas);
    }
  };
})(jQuery, window, document);
