import * as util from './util';

/**
 * Pixels
 * @param mode
 * @param version
 * @param ec_level
 * @constructor
 */
export default function Pixels(mode, version, ec_level){
  var context = this;

  context.mode = mode;
  context.version = version;
  context.level = ec_level;
}

util.inherits(Pixels, Array, {
  setBackground: function (){
    var i, j;
    var context = this;
    var modules = context.length;

    for (i = 0; i < modules; i++) {
      for (j = 0; j < modules; j++) {
        context[i][j] = false;
      }
    }

    return true;
  },
  setDark: function (x, y){
    var context = this;
    var modules = context.length;

    // Ignoring d, since a pixel array has d=1
    if (x > modules - 1 || y > modules - 1) {
      return false;
    }

    context[x][y] = true;

    return true;
  },
  isDark: function (x, y){
    var context = this;
    var modules = context.length;

    // Ignoring d, since a pixel array has d=1
    if (x > modules - 1 || y > modules - 1) {
      return false;
    }

    return context[x][y];
  }
});
