import * as QRMath from './QRMath';

export default function Polynomial(num, shift) {
  shift = shift || 0;

  var offset = 0;
  var context = this;

  while (offset < num.length && num[offset] == 0) {
    offset += 1;
  }

  context.num = [];

  var len = num.length - offset;

  for (var i = 0; i < len; i += 1) {
    context.num.push(num[offset + i]);
  }

  for (var i = 0; i < shift; i += 1) {
    context.num.push(0);
  }
}

Polynomial.prototype = {
  getAt: function(index) {
    return this.num[index];
  },
  getLength: function() {
    return this.num.length;
  },
  toString: function() {
    var buffer = '';
    var context = this;
    var length = context.getLength();

    for (var i = 0; i < length; i += 1) {
      if (i > 0) {
        buffer += ',';
      }

      buffer += context.getAt(i);
    }

    return buffer.toString();
  },
  toLogString: function() {
    var buffer = '';
    var context = this;
    var length = context.getLength();

    for (var i = 0; i < length; i += 1) {
      if (i > 0) {
        buffer += ',';
      }

      buffer += QRMath.glog(context.getAt(i));
    }

    return buffer.toString();
  },
  multiply: function(e) {
    var num = [];
    var context = this;
    var len = context.getLength() + e.getLength() - 1;

    for (var i = 0; i < len; i += 1) {
      num.push(0);
    }

    for (var i = 0; i < context.getLength(); i += 1) {
      for (var j = 0; j < e.getLength(); j += 1) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(context.getAt(i)) + QRMath.glog(e.getAt(j)));
      }
    }

    return new Polynomial(num);
  }
};
