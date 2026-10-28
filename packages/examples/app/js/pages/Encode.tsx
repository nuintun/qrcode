import * as styles from '/css/Encode.module.scss';

import { useI18n } from '/js/hooks/useI18n';
import { Color } from 'antd/es/color-picker';
import useLazyState from '/js/hooks/useLazyState';
import Icon, { ThunderboltOutlined } from '@ant-design/icons';
import { EncodeMessage, EncodeResultMessage } from '/js/workers/encode';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Col, ColorPicker, Form, Image, Input, InputNumber, Row, Select, Space, Tooltip } from 'antd';

import EncodeIcon from '/images/encode.svg';

interface Option {
  label: string;
  value: unknown;
}

type FormValues = EncodeMessage;

const { Compact } = Space;
const { TextArea } = Input;
const { Item: FormItem, useForm, useWatch } = Form;

function convertColor(color: string | Color): string {
  if (typeof color === 'string') {
    return color;
  }

  return color.toHexString();
}

interface ResultProps {
  value?: EncodeResultMessage;
}

const Result = memo(function Result({ value }: ResultProps) {
  const { translate } = useI18n();

  if (value) {
    switch (value.type) {
      case 'ok':
        return <Image src={value.payload} alt="preview" className={styles.preview} />;
      case 'error':
        return <Alert type="error" title={value.message} showIcon />;
      default:
        return <Alert type="error" title={translate('common.unknownError')} showIcon />;
    }
  }

  return null;
});

export default memo(function Encode() {
  const lockRef = useRef(false);
  const [form] = useForm<FormValues>();
  const workerRef = useRef<Worker>(null);
  const [loading, setLoading] = useLazyState(false);
  const [state, setState] = useState<EncodeResultMessage>();
  const { translate } = useI18n();

  const initialValues = useMemo<FormValues>(() => {
    return {
      level: 'L',
      fnc1: 'None',
      mode: 'Auto',
      moduleSize: 4,
      quietZone: 16,
      aimIndicator: 0,
      version: 'Auto',
      charset: 'UTF_8',
      background: '#ffffff',
      foreground: '#000000',
      content: 'WIFI:S:Gadget Hacks;T:WPA;P:1234567890;;'
    };
  }, []);

  const versions = useMemo<Option[]>(() => {
    const options: Option[] = [
      {
        label: 'Auto',
        value: 'Auto'
      }
    ];

    for (let version = 1; version <= 40; version++) {
      options.push({
        label: `${version}`,
        value: version
      });
    }

    return options;
  }, []);

  const onFinish = useCallback((values: FormValues) => {
    const worker = workerRef.current;

    if (worker && !lockRef.current) {
      setLoading(true);

      lockRef.current = true;

      const message: EncodeMessage = {
        ...values,
        background: convertColor(values.background),
        foreground: convertColor(values.foreground)
      };

      worker.postMessage(message);
    }
  }, []);

  const onAutofillQuietZoneClick = useCallback(() => {
    const moduleSize: number = form.getFieldValue('moduleSize');

    form.setFieldsValue({ quietZone: moduleSize * 4 });
  }, []);

  const mode = useWatch('mode', form) ?? initialValues.mode;
  const fnc1 = useWatch(['fnc1'], form) ?? initialValues.fnc1;
  const content = useWatch('content', form) ?? initialValues.content;

  useEffect(() => {
    const worker = new Worker(new URL('/js/workers/encode', import.meta.url));

    worker.addEventListener('message', ({ data }: MessageEvent<EncodeResultMessage>) => {
      setState(data);
      setLoading(false);

      lockRef.current = false;
    });

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  return (
    <div className="ui-page">
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
        <Row gutter={24}>
          <Col span={24}>
            <FormItem name="content">
              <TextArea rows={8} allowClear />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="mode" label={translate('encode.mode')}>
              <Select
                options={[
                  {
                    label: 'Auto',
                    value: 'Auto'
                  },
                  {
                    label: 'Alphanumeric',
                    value: 'Alphanumeric'
                  },
                  {
                    label: 'Byte',
                    value: 'Byte'
                  },
                  {
                    label: 'Hanzi',
                    value: 'Hanzi'
                  },
                  {
                    label: 'Kanji',
                    value: 'Kanji'
                  },
                  {
                    label: 'Numeric',
                    value: 'Numeric'
                  }
                ]}
              />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="charset" label={translate('encode.charset')}>
              <Select
                options={[
                  {
                    label: 'ASCII',
                    value: 'ASCII'
                  },
                  {
                    label: 'UTF-8',
                    value: 'UTF_8'
                  },
                  {
                    label: 'ISO-8859-1',
                    value: 'ISO_8859_1'
                  }
                ]}
                disabled={mode !== 'Auto' && mode !== 'Byte'}
              />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="version" label={translate('encode.version')}>
              <Select options={versions} />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="level" label={translate('encode.level')}>
              <Select
                options={[
                  {
                    label: 'Level L (7%)',
                    value: 'L'
                  },
                  {
                    label: 'Level M (15%)',
                    value: 'M'
                  },
                  {
                    label: 'Level Q (25%)',
                    value: 'Q'
                  },
                  {
                    label: 'Level H (30%)',
                    value: 'H'
                  }
                ]}
              />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="fnc1" label={translate('encode.fnc1')}>
              <Select
                options={[
                  {
                    label: translate('encode.fnc1None'),
                    value: 'None'
                  },
                  {
                    label: 'AIM',
                    value: 'AIM'
                  },
                  {
                    label: 'GS1',
                    value: 'GS1'
                  }
                ]}
              />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="aimIndicator" label={translate('encode.aimIndicator')}>
              <InputNumber disabled={fnc1 !== 'AIM'} min={0} max={255} precision={0} style={{ width: '100%' }} />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="moduleSize" label={translate('encode.moduleSize')}>
              <InputNumber min={1} max={50} precision={0} style={{ width: '100%' }} />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem label={translate('encode.quietZone')} tooltip={translate('encode.quietZoneTip')}>
              <Compact block>
                <FormItem noStyle name="quietZone">
                  <InputNumber min={0} max={200} precision={0} style={{ width: '100%' }} />
                </FormItem>
                <Tooltip title={translate('encode.autoCalculate')}>
                  <Button icon={<ThunderboltOutlined />} onClick={onAutofillQuietZoneClick} />
                </Tooltip>
              </Compact>
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="foreground" label={translate('encode.foreground')}>
              <ColorPicker showText disabledAlpha />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="background" label={translate('encode.background')}>
              <ColorPicker showText disabledAlpha />
            </FormItem>
          </Col>
          <Col span={24}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!content}
              icon={<Icon component={EncodeIcon} />}
            >
              {translate('encode.submit')}
            </Button>
          </Col>
        </Row>
      </Form>
      <div className={styles.result}>
        <Result value={state} />
      </div>
    </div>
  );
});
