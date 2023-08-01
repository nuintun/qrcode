/**
 * @module App
 */

import '/css/global.scss';
import styles from '/css/App.module.scss';

import React, { lazy, memo, Suspense, useCallback, useMemo } from 'react';

import Icon from '@ant-design/icons';
import zh_CN from 'antd/locale/zh_CN';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '/js/components/ErrorFallback';
import SuspenseFallback from '/js/components/SuspenseFallback';
import { App, AppProps, ConfigProvider, Tabs, TabsProps } from 'antd';

import favicon from '/images/favicon.ico';
import EncodeIcon from '/images/encode.svg';
import DecodeIcon from '/images/decode.svg';

const Encode = lazy(() => import('/js/pages/Encode'));
const Decode = lazy(() => import('/js/pages/Decode'));

const Page = memo(function Page() {
  const defaultActiveKey = useMemo(() => {
    if (location.hash === '#/decode') {
      return 'decode';
    }

    location.hash = '#/encode';

    return 'encode';
  }, []);

  const onChange = useCallback((key: string) => {
    location.hash = `#/${key}`;
  }, []);

  const message = useMemo<AppProps['message']>(() => {
    return { maxCount: 3 };
  }, []);

  const tabBarStyle = useMemo<React.CSSProperties>(() => {
    return { margin: 0 };
  }, []);

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

  const tabBarExtraContent = useMemo<TabsProps['tabBarExtraContent']>(() => {
    return { left: <img className={styles.logo} src={favicon} alt="logo" /> };
  }, []);

  return (
    <App className="ui-app" message={message}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Tabs
          centered
          items={items}
          onChange={onChange}
          className={styles.tabs}
          tabBarStyle={tabBarStyle}
          defaultActiveKey={defaultActiveKey}
          tabBarExtraContent={tabBarExtraContent}
        />
      </ErrorBoundary>
    </App>
  );
});

export default memo(function App() {
  return (
    <ConfigProvider locale={zh_CN} theme={{ token: { borderRadius: 4 } }}>
      <Page />
    </ConfigProvider>
  );
});
