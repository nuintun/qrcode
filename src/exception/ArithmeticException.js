import Exception from './ReaderException';
import * as Utils from '../common/Utils';

export default function ArithmeticException() {
  Exception.apply(this, arguments);

  this.name = 'ArithmeticException';
}

Utils.inherits(ArithmeticException, ReaderException);
