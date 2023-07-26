import { memo, useMemo } from 'react';

import { Image } from 'antd';
import { Encoder, Hanzi } from '@nuintun/qrcode';

const worker = new Worker(new URL('/js/workers/encode.ts', import.meta.url));

console.log(worker);

export default memo(function Encode() {
  const qrcode = useMemo<string>(() => {
    const encoder = new Encoder({
      level: 'H'
    });

    const qrcode = encoder.encode(new Hanzi('你好啊'));

    return qrcode.toDataURL(4);
  }, []);

  return (
    <div className="page">
      <Image src={qrcode} alt="qrcode" />
    </div>
  );
});
