import Exception from './ReaderException';
import * as Utils from '../common/Utils';

export default function NotFoundException() {
  Exception.apply(this, arguments);

  this.name = 'NotFoundException';
}

Utils.inherits(NotFoundException, ReaderException);
