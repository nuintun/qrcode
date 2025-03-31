/**
 * @module Error
 */

import React, { memo } from 'react';
import { Button, Result } from 'antd';
import { FallbackProps } from 'react-error-boundary';

export default memo(function ErrorFallback({ error, resetErrorBoundary }: FallbackProps): React.ReactElement {
  if (__DEV__) {
    return (
      <Result
        status="error"
        title="页面错误"
        extra={
          <Button type="primary" onClick={resetErrorBoundary}>
            重试页面
          </Button>
        }
        subTitle={
          <div style={{ display: 'flex', margin: '24px 0 0', justifyContent: 'center' }}>
            <pre
              style={{
                margin: 0,
                padding: 0,
                color: '#f00',
                textAlign: 'left',
                fontFamily: 'Consolas, "Lucida Console", monospace'
              }}
            >
              {error.stack?.replace(/(\r?\n)\s{2,}/gm, '$1  ') || error.message}
            </pre>
          </div>
        }
      />
    );
  }

  return (
    <Result
      status="error"
      title="页面错误"
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          重试页面
        </Button>
      }
      subTitle="抱歉，发生错误，无法渲染页面，请联系系统管理员或者重试页面！"
    />
  );
});
