/**
 * QREncode
 */
'use strict';

var zh_cn = {
  "QRCode.UnknownMode": "Internal error: Unknown mode: {{mode}}.",
  "QRCode.UnsupportedECI": "Internal error: Unsupported ECI mode: {{mode}}.",
  "QREncode.InvalidChar4Alphanumeric": "Invalid character for Alphanumeric encoding [{{char}}].",
  "QREncode.InvalidChar4Numeric": "Invalid character for Numeric encoding [{{char}}].",
  "QREncode.TextTooLong4TargetVersion": "Text too long for this EC version.",
  "QREncode.TextTooLong4AllVersion": "Text is too long, even for a version 40 QR Code.",
  "QRDecode.ImageNoEnoughContrast": "Image does not have enough contrast (this.image_data.min_col={{min}} this.image_data.max_col={{max}}).",
  "QRDecode.NoImage": "Found no image data to decode.",
  "QRDecode.InvalidImage": "Image data is not rectangular.",
  "QRDecode.UnableDecodePattern": "Unable to decode a function pattern.",
  "QRDecode.UnableCorrectErrors": "Unable to correct errors ({{reason}})."
};

(function ($, window, document, undefined){
  $.QREncode = {
    /**
     * 配置
     */
    config: {
      text: 'QRCode', // 默认文字
      render: 'canvas',
      bgColor: '#FFF', // 背景色
      moduleColor: '#000', // 前景色
      moduleSize: 5, // 模块大小
      mode: 4, // 编码格式，默认8字节编码
      ECLevel: 2, // 纠错码等级，默认30%
      margin: 4, // 留白
      logo: '', // logo;
      error: $.noop
    },
    Render: {}
  };

  /**
   * 二维码编码
   * @param config
   * @param callback
   * @returns {*}
   * @constructor
   */
  function Encode(config, callback){
    this.config = config;

    // 初始化
    return this._init(callback);
  }

  Encode.prototype = {
    _init: function (callback){
      var config = this.config;

      config.mode = 0;

      // 含有 Logo，使用最大容错
      if (config.logo) {
        config.ECLevel = 2;
      }

      try {
        this.pixels = new QRCode.Encode(config.mode, config.text, 0, config.ECLevel);
      } catch (e) {
        e.localize(zh_cn);

        $.isFunction(config.error) && config.error(e);
      }

      this.pixels && $.QREncode.Render[config.render](this, callback);
    }
  };

  /**
   * 二维码编码
   * @param cfg
   * @constructor
   */
  $.fn.QREncode = function (cfg){
    var that = this;
    var config = {};

    if (typeof(cfg) === 'string') {
      config.text = cfg;
    } else {
      config = $.extend({}, $.QREncode.config, cfg);
    }

    config.moduleSize = Math.round(config.moduleSize);
    config.margin = Math.round(config.margin);
    config.moduleSize = config.moduleSize > 0 ? config.moduleSize : $.QREncode.config.moduleSize;
    config.margin = config.margin < 0 ? $.QREncode.config.margin : config.margin;

    new Encode(config, function (qrdom){
      that.each(function (i, item){
        $(item).empty().append(qrdom);
      });
    });
  };
})(jQuery, window, document);
