import Exception from './Exception';
import * as Utils from '../common/Utils';

export default function WriterException() {
  Exception.apply(this, arguments);

  this.name = 'WriterException';
}

Utils.inherits(WriterException, Exception);
