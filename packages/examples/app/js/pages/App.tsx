/**
 * @module App
 */

import '/css/global.scss';
import * as styles from '/css/App.module.scss';

import Icon from '@ant-design/icons';
import { useI18n } from '/js/hooks/useI18n';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '/js/components/Fallback/Error';
import SuspenseFallback from '/js/components/Fallback/Loading';
import { App, AppProps, ConfigProvider, Select, Tabs, TabsProps } from 'antd';
import React, { lazy, memo, Suspense, useCallback, useEffect, useMemo } from 'react';

import favicon from '/images/favicon.ico';
import EncodeIcon from '/images/encode.svg';
import DecodeIcon from '/images/decode.svg';
import GithubIcon from '/images/github.svg';

const Encode = lazy(() => import('/js/pages/Encode'));
const Decode = lazy(() => import('/js/pages/Decode'));

// Language names are shown in their own language, so they are not translated.
const LanguageSelect = memo(function LanguageSelect() {
  const { lang, setLang } = useI18n();

  return (
    <Select
      size="small"
      value={lang}
      options={[
        {
          label: '中文',
          value: 'zh-CN'
        },
        {
          label: 'English',
          value: 'en-US'
        }
      ]}
      onChange={value => {
        setLang(value);
      }}
      className={styles.language}
    />
  );
});

const Page = memo(function Page() {
  const defaultActiveKey = useMemo(() => {
    if (location.hash === '#/decode') {
      return 'decode';
    }

    location.hash = '#/encode';

    return 'encode';
  }, []);

  const { lang, translate } = useI18n();

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
            <span>{translate('tabs.encode')}</span>
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
            <span>{translate('tabs.decode')}</span>
          </div>
        ),
        children: (
          <Suspense fallback={<SuspenseFallback />}>
            <Decode />
          </Suspense>
        )
      }
    ],
    [lang]
  );

  const tabBarExtraContent = useMemo<TabsProps['tabBarExtraContent']>(() => {
    return {
      left: <img title="QRCode" className={styles.logo} src={favicon} alt="logo" />,
      right: (
        <div className={styles.actions}>
          <LanguageSelect />
          <a title="GitHub" className={styles.source} href="https://github.com/nuintun/qrcode" target="_blank">
            <Icon className={styles.github} component={GithubIcon} />
          </a>
        </div>
      )
    };
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
  const { antdLocale, lang, translate } = useI18n();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translate('app.title');
  }, [lang, translate]);

  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        hashed: false,
        token: {
          borderRadius: 4
        }
      }}
    >
      <Page />
    </ConfigProvider>
  );
});
