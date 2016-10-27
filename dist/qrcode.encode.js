/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************************!*\
  !*** ./src/encode/qrcode.js ***!
  \******************************/
/***/ function(module, exports) {

	/**
	 * QREncode
	 */
	'use strict';
	
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
	
	      this.qr = new QREncode();
	
	      // 含有 Logo，使用最大容错
	      if (config.logo) {
	        config.ECLevel = 2;
	      }
	
	      try {
	        this.version = this.qr.getVersionFromLength(config.ECLevel, config.mode, config.text);
	        this.pixArr = this.qr.encodeToPix(config.mode, config.text, this.version, config.ECLevel);
	      } catch (e) {
	        $.isFunction(config.error) && config.error(e);
	      }
	
	      this.pixArr && $.QREncode.Render[config.render](this, callback);
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


/***/ }
/******/ ]);
//# sourceMappingURL=qrcode.encode.js.map