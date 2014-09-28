(function ($, window, document, undefined){
    'use strict';

    if (!$.QREncode) {
        return;
    }

    $.QREncode.Render.table = function (self, callback){
        var cfg = self.config,
            table, i = 0, j = 0,
            mSize = cfg.moduleSize,
            margin = cfg.margin * mSize,
            size = self.pixArr.length,
            outSize = 2 * cfg.margin + size,
            panel = $('<div style="position:relative;display:inline-block;*zoom:1;margin:0;padding:0;"></div>');

        function renderLogo(callback){
            var img = new Image();

            img.onload = function (){
                var imgW = img.width,
                    imgH = img.height,
                    imgSize = Math.max(imgW, imgH),
                    zoom, logo;

                if (imgSize > size * mSize * 0.3) {
                    zoom = (size * mSize * 0.3) / imgSize;
                    imgW = imgW * zoom;
                    imgH = imgH * zoom;
                }

                logo = $('<img src="' + cfg.logo + '" height="' + imgH + '" width="' + imgW + '"/>');

                logo.css({position: 'absolute', top: (outSize * mSize - imgH) / 2, left: (outSize * mSize - imgW) / 2});

                $.isFunction(callback) && callback(logo);

                img.onload = null;
            };

            img.src = cfg.logo;
        }

        table = '<table style="width: 100%;height:100%;border:0;border-collapse:collapse;'
            + 'font-size:0;line-height:0;margin:0;padding:0;background-color:transparent;">';

        for (; i < size; i++) {
            j = 0;
            table += '<tr>';

            for (; j < size; j++) {
                if (self.pixArr[j][i]) {
                    table += '<td style="background-color:' + cfg.moduleColor + ';margin:0;padding:0;">&nbsp;</td>';
                } else {
                    table += '<td style="background-color:transparent;margin:0;padding:0;">&nbsp;</td>';
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
