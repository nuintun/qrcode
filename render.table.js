'use strict';

(function ($, window, document, undefined){
  $.QREncode.Render.table = function (self, callback){
    var i;
    var j;
    var table;
    var cfg = self.config;
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

    table = '<table style="width: 100%;height:100%;border:0;border-collapse:collapse;'
      + 'font-size:0;line-height:0;margin:0;padding:0;background-color:transparent;">';

    for (i = 0; i < size; i++) {
      table += '<tr>';

      for (j = 0; j < size; j++) {
        if (self.pixArr[j][i]) {
          table += '<td style="background-color:' + cfg.moduleColor + ';margin:0;padding:0;border:0;">&nbsp;</td>';
        } else {
          table += '<td style="background-color:transparent;margin:0;padding:0;border:0;">&nbsp;</td>';
        }
      }

      table += '</tr>';
    }

    table += '</table>';

    panel.css({
      width: size * mSize,
      height: size * mSize,
      backgroundColor: cfg.bgColor,
      padding: margin
    }).html(table);

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
