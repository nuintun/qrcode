import Exception from './Exception';
import * as Utils from '../common/Utils';

export default function UnsupportedOperationException() {
  Exception.apply(this, arguments);

  this.name = 'UnsupportedOperationException';
}

Utils.inherits(UnsupportedOperationException, Exception);
