export default function ByteMatrix(width, height) {
  var context = this;
  var bytes = new Array(height);

  for (var i = 0, length = bytes.length; i < length; i++) {
    bytes[i] = new Array(width);
  }

  context.bytes = bytes;
  context.width = width;
  context.height = height;
}

ByteMatrix.prototype = {
  getHeight: function() {
    return this.height;
  },
  getWidth: function() {
    return this.width;
  },
  get: function(x, y) {
    return this.bytes[y][x];
  },
  /**
   * @return an internal representation as bytes, in row-major order. array[y][x] represents point (x,y)
   */
  getArray: function() {
    return this.bytes;
  },
  // TODO int to byte convert
  // Reference: http://jsfromhell.com/classes/binary-parser
  set(x, y, value) {
    if (typeof value === 'boolean') {
      this.bytes[y][x] = value ? 1 : 0;
    } else {
      this.bytes[y][x] = value;
    }
  }
};
