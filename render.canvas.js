(function ($, window, document, undefined){
    'use strict';

    if (!$.QREncode) {
        return;
    }

    $.QREncode.Render.canvas = function (self, callback){
        var cfg = self.config,
            i = cfg.margin,
            j = cfg.margin,
            mSize = cfg.moduleSize,
            size = self.pixArr.length,
            outSize = 2 * cfg.margin + size,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d');

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
                var zoom,
                    imgW = img.width,
                    imgH = img.height,
                    imgSize = Math.max(imgW, imgH);

                if (imgSize > size * mSize * 0.3) {
                    zoom = (size * mSize * 0.3) / imgSize;
                    imgW = imgW * zoom;
                    imgH = imgH * zoom;
                }

                ctx.drawImage(img, (outSize * mSize - imgW) / 2, (outSize * mSize - imgH) / 2, imgW, imgH);

                $.isFunction(callback) && callback();

                img.onload = null;
            };

            img.src = cfg.logo;
        }

        init(size);

        for (; i < size + cfg.margin; i++) {
            j = cfg.margin;

            for (; j < size + cfg.margin; j++) {
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
