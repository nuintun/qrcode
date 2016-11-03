import * as util from './util';

export default function Pixels(version){
  this.version = version;
}

util.inherits(Pixels, Array, {
  setBackground: function (){
    var i, j;
    var modules = this.length;

    for (i = 0; i < modules; i++) {
      for (j = 0; j < modules; j++) {
        this[i][j] = false;
      }
    }

    return true;
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
});
