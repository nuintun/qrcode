/**
 * @module SuspenseFallback
 */

import { memo } from 'react';

import { Spin } from 'antd';

export default memo(function SuspenseFallback() {
  return (
    <Spin delay={120}>
      <div style={{ height: 360 }} />
    </Spin>
  );
});
