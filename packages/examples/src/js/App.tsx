/**
 * @module App
 */

import '/css/global.scss';

import React, { memo, Suspense, useMemo } from 'react';

import zh_CN from 'antd/locale/zh_CN';
import { Encoder, Hanzi } from '@nuintun/qrcode';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { App, Button, ConfigProvider, Image, Result, theme } from 'antd';

const { useToken } = theme;

const ErrorFallback = memo(function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
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

const Page = memo(function Page() {
  const { token } = useToken();
  const { colorBgContainer } = token;
  const qrcode = useMemo<string>(() => {
    const encoder = new Encoder({
      level: 'H'
    });

    const qrcode = encoder.encode(new Hanzi('你好啊'));

    return qrcode.toDataURL(4);
  }, []);

  return (
    <App className="ui-app" style={{ backgroundColor: colorBgContainer }} message={{ maxCount: 3 }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback="loading">
          <Image src={qrcode} alt="qrcode" />
        </Suspense>
      </ErrorBoundary>
    </App>
  );
});

export default memo(function App() {
  return (
    <ConfigProvider locale={zh_CN}>
      <Page />
    </ConfigProvider>
  );
});
