import Exception from './Exception';
import * as Utils from '../common/Utils';

export default function IllegalStateException() {
  Exception.apply(this, arguments);

  this.name = 'IllegalStateException';
}

Utils.inherits(IllegalStateException, Exception);
