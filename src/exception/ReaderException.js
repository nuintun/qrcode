import Exception from './Exception';
import * as Utils from '../common/Utils';

export default function ReaderException() {
  Exception.apply(this, arguments);

  this.name = 'ReaderException';
}

Utils.inherits(ReaderException, Exception);
