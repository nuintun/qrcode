var array = [];
var slice = array.slice;
var concat = array.concat;
var push = array.push;
var indexOf = array.indexOf;
var sort = array.sort;
var splice = array.splice;

export default function Pixels(version){
  this.version = version;
}

Pixels.prototype = {
  length: 0,
  slice: slice,
  push: push,
  concat: concat,
  indexOf: indexOf,
  sort: sort,
  splice: splice,
  toArray: function (){
    return slice.call(this);
  },
  setBackground: function (){
    var i, j;
    var modules = this.length;

    for (i = 0; i < modules; i++) {
      for (j = 0; j < modules; j++) {
        this[i][j] = false;
      }
    }
  },
  setDark: function (x, y){
    var modules = this.length;

    // Ignoring d, since a pixel array has d=1
    if (x > modules - 1 || y > modules - 1) {
      return false;
    }

    this[x][y] = true;

    return true;
  },
  isDark: function (x, y){
    var modules = this.length;

    // Ignoring d, since a pixel array has d=1
    if (x > modules - 1 || y > modules - 1) {
      return false;
    }

    return this[x][y];
  }
};
