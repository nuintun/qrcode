/**
 * @module Loading
 */

import React, { memo } from 'react';
import { Spin, SpinProps } from 'antd';

export interface LoadingFallBackProps extends Pick<SpinProps, 'delay'>, Pick<React.CSSProperties, 'width' | 'height'> {}

export default memo(function LoadingFallBack({ delay = 128, width, height = 360 }: LoadingFallBackProps): React.ReactElement {
  return (
    <Spin delay={delay}>
      <div style={{ width, height }} />
    </Spin>
  );
});
