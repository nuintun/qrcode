/**
 * @module App
 */

import '/css/global.scss';
import styles from '/css/App.module.scss';

import React, { lazy, memo, Suspense, useMemo } from 'react';

import Icon from '@ant-design/icons';
import zh_CN from 'antd/locale/zh_CN';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { App, Button, ConfigProvider, Result, Spin, Tabs } from 'antd';

import favicon from '/images/favicon.ico';
import EncodeIcon from '/images/encode.svg';
import DecodeIcon from '/images/decode.svg';

const Encode = lazy(() => import('/js/pages/Encode'));
const Decode = lazy(() => import('/js/pages/Decode'));

const Loading = memo(function Loading() {
  return (
    <Spin delay={120}>
      <div style={{ height: 360 }} />
    </Spin>
  );
});

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
  const items = useMemo(
    () => [
      {
        key: 'encode',
        label: (
          <div className={styles.tabBarItem}>
            <Icon className={styles.icon} component={EncodeIcon} />
            <span>二维码编码</span>
          </div>
        ),
        children: (
          <Suspense fallback={<Loading />}>
            <Encode />
          </Suspense>
        )
      },
      {
        key: 'decode',
        label: (
          <div className={styles.tabBarItem}>
            <Icon className={styles.icon} component={DecodeIcon} />
            <span>二维码解码</span>
          </div>
        ),
        children: (
          <Suspense fallback={<Loading />}>
            <Decode />
          </Suspense>
        )
      }
    ],
    []
  );

  return (
    <App className="ui-app" message={{ maxCount: 3 }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Tabs
          centered
          items={items}
          className={styles.tabs}
          tabBarStyle={{ margin: 0 }}
          tabBarExtraContent={{
            left: <img className={styles.logo} src={favicon} alt="logo" />
          }}
        />
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
