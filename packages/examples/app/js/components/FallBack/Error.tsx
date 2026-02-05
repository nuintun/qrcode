/**
 * @module Error
 */

import { memo } from 'react';
import { Button, Result } from 'antd';
import { FallbackProps as ErrorFallbackProps } from 'react-error-boundary';

export type { ErrorFallbackProps };

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const { stack, message } = error;

    if (stack != null) {
      return stack?.replace(/(\r?\n)\s{2,}/gm, '$1  ');
    }

    return message;
  }

  return `${error}`;
}

export default memo(function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
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
              {getErrorMessage(error)}
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
