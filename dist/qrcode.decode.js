/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	/**
	 * QRDecode
	 */
	'use strict';

	(function ($, window, document, undefined) {
	  /**
	   * 二维码解码
	   * @param canvas
	   * @param error
	   * @constructor
	   */
	  function Decode(canvas, error) {
	    this.text = this._init(this.getImageData(canvas), error);
	  }

	  Decode.prototype = {
	    _init: function _init(imageData, error) {
	      var text = '';
	      var qr = new QRDecode();

	      try {
	        text = qr.decodeImageData(imageData, this.width, this.height);
	      } catch (e) {
	        $.isFunction(error) && error(e);
	      }

	      return text;
	    },
	    getImageData: function getImageData(canvas) {
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
	  $.fn.QRDecode = function (error) {
	    var text = '';

	    if (this.length) {
	      text = new Decode(this[0], error).text;
	    }

	    return text;
	  };
	})(jQuery, window, document);

/***/ }
/******/ ]);