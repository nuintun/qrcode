/**
 * @module App
 */

import '/css/global.scss';
import styles from '/css/App.module.scss';

import React, { lazy, memo, Suspense, useMemo } from 'react';

import Icon from '@ant-design/icons';
import zh_CN from 'antd/locale/zh_CN';
import { App, ConfigProvider, Tabs } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '/js/components/ErrorFallback';
import SuspenseFallback from '/js/components/SuspenseFallback';

import favicon from '/images/favicon.ico';
import EncodeIcon from '/images/encode.svg';
import DecodeIcon from '/images/decode.svg';

const Encode = lazy(() => import('/js/pages/Encode'));
const Decode = lazy(() => import('/js/pages/Decode'));

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
          <Suspense fallback={<SuspenseFallback />}>
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
          <Suspense fallback={<SuspenseFallback />}>
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
