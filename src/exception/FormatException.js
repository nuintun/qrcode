import Exception from './ReaderException';
import * as Utils from '../common/Utils';

export default function FormatException() {
  Exception.apply(this, arguments);

  this.name = 'FormatException';
}

Utils.inherits(FormatException, ReaderException);
