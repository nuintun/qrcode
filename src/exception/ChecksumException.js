import Exception from './ReaderException';
import * as Utils from '../common/Utils';

export default function ChecksumException() {
  Exception.apply(this, arguments);

  this.name = 'ChecksumException';
}

Utils.inherits(ChecksumException, ReaderException);
