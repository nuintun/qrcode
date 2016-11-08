import Exception from './Exception';
import * as Utils from '../common/Utils';

export default function IllegalArgumentException() {
  Exception.apply(this, arguments);

  this.name = 'IllegalArgumentException';
}

Utils.inherits(IllegalArgumentException, Exception);
