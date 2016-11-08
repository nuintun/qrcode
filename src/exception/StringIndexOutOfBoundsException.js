import Exception from './Exception';
import * as Utils from '../common/Utils';

export default function StringIndexOutOfBoundsException() {
  Exception.apply(this, arguments);

  this.name = 'StringIndexOutOfBoundsException';
}

Utils.inherits(StringIndexOutOfBoundsException, Exception);
