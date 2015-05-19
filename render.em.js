'use strict';

(function ($, window, document, undefined){
  $.QREncode.Render.em = function (self, callback){
    var i;
    var j;
    var cfg = self.config;
    var modules = '';
    var mSize = cfg.moduleSize;
    var margin = cfg.margin * mSize;
    var size = self.pixArr.length;
    var outSize = 2 * cfg.margin + size;
    var panel = $('<div style="position:relative;display:inline-block;*zoom:1;margin:0;padding:0;border:0;"></div>');

    function renderLogo(callback){
      var img = new Image();

      img.onload = function (){
        var zoom;
        var logo;
        var top;
        var left;
        var imgW = img.width;
        var imgH = img.height;
        var imgSize = Math.max(imgW, imgH);

        if (imgSize > size * mSize * 0.3) {
          zoom = (size * mSize * 0.3) / imgSize;
          imgW = imgW * zoom;
          imgH = imgH * zoom;
        }

        top = Math.round((outSize * mSize - imgH) / 2);
        left = Math.round((outSize * mSize - imgW) / 2);
        logo = $('<img src="' + cfg.logo + '" height="' + imgH + '" width="' + imgW + '" alt="QRCode Logo" />');

        logo.css({ position: 'absolute', top: top, left: left });

        $.isFunction(callback) && callback(logo);

        img.onload = null;
      };

      img.src = cfg.logo;
    }

    for (i = 0; i < size; i++) {
      for (j = 0; j < size; j++) {
        if (self.pixArr[i][j]) {
          modules += '<em style="position:absolute;'
            + 'width:' + mSize + 'px;height:' + mSize + 'px;'
            + 'top:' + (j * mSize + margin) + 'px;'
            + 'left:' + (i * mSize + margin) + 'px;'
            + 'background-color:' + cfg.moduleColor
            + ';margin:0;padding:0;border:0;"></em>';
        }
      }
    }

    panel.css({
      width: size * mSize,
      height: size * mSize,
      backgroundColor: cfg.bgColor,
      padding: margin
    }).html(modules);

    if (cfg.logo) {
      renderLogo(function (logo){
        panel.append(logo);
        $.isFunction(callback) && callback(panel);
      });
    } else {
      $.isFunction(callback) && callback(panel);
    }
  };
})(jQuery, window, document);
