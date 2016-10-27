/**
 * QRDecode
 */
'use strict';

(function ($, window, document, undefined){
  /**
   * 二维码解码
   * @param canvas
   * @param error
   * @constructor
   */
  function Decode(canvas, error){
    this.text = this._init(this.getImageData(canvas), error);
  }

  Decode.prototype = {
    _init: function (imageData, error){
      var text = '';
      var qr = new QRDecode();

      try {
        text = qr.decodeImageData(imageData, this.width, this.height);
      } catch (e) {
        $.isFunction(error) && error(e);
      }

      return text;
    },
    getImageData: function (canvas){
      var ctx;

      if (canvas.nodeName.toLowerCase() !== 'canvas') {
        canvas = $(canvas).find('canvas').get(0);

        if (!canvas) return null;
      }

      ctx = canvas.getContext('2d');
      this.width = canvas.width;
      this.height = canvas.height;

      return ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
  };

  /**
   * 二维码解码
   * @param error
   * @returns {string}
   * @constructor
   */
  $.fn.QRDecode = function (error){
    var text = '';

    if (this.length) {
      text = (new Decode(this[0], error)).text;
    }

    return text;
  };
})(jQuery, window, document);
