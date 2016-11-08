import * as Utils from '../common/Utils';

export default function Exception() {
  Error.apply(this, arguments);

  this.name = 'Exception';
}

Utils.inherits(Exception, Error);
