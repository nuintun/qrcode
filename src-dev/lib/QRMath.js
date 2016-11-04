export var EXP_TABLE = [];
export var LOG_TABLE = [];

(function() {
  for (var i = 0; i < 256; i += 1) {
    EXP_TABLE.push(
      i < 8 ? 1 << i :
      EXP_TABLE[i - 4] ^
      EXP_TABLE[i - 5] ^
      EXP_TABLE[i - 6] ^
      EXP_TABLE[i - 8]
    );
    LOG_TABLE.push(0);
  }

  for (var i = 0; i < 255; i += 1) {
    LOG_TABLE[EXP_TABLE[i]] = i;
  }
}());

export function glog(n) {
  if (n < 1) {
    throw 'log(' + n + ')';
  }

  return QRMath.LOG_TABLE[n];
};

export function gexp(n) {
  while (n < 0) {
    n += 255;
  }

  while (n >= 256) {
    n -= 255;
  }

  return QRMath.EXP_TABLE[n];
};
