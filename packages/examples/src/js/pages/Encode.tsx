import styles from '/css/Encode.module.scss';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import useLazyState from '/js/hooks/useLazyState';
import { EncodeMessage, EncodeResultMessage } from '/js/workers/encode';
import { Alert, Button, Col, ColorPicker, Form, Image, Input, InputNumber, Row, Select } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Item: FormItem, useForm, useWatch } = Form;
const worker = new Worker(new URL('/js/workers/encode.ts', import.meta.url));

interface ResultProps {
  value?: EncodeResultMessage;
}

const Result = memo(function Result({ value }: ResultProps) {
  if (value) {
    const { data } = value;

    switch (value.type) {
      case 'ok':
        return <Image className={styles.qrcode} src={data} alt="qrcode" />;
      case 'error':
        return <Alert type="error" message={data} />;
      default:
        return <Alert type="error" message="unknown error" />;
    }
  }

  return null;
});

export default memo(function Encode() {
  const [form] = useForm();

  const fnc1 = useWatch(['fnc1'], form);

  const content = useWatch('content', form);

  const versions = useMemo<React.ReactElement[]>(() => {
    const options = [
      <Option key="auto" value="auto">
        Auto
      </Option>
    ];

    for (let version = 1; version <= 40; version++) {
      options.push(
        <Option key={version} value={version}>
          {version}
        </Option>
      );
    }

    return options;
  }, []);

  const initialValues = useMemo<EncodeMessage>(() => {
    return {
      level: 'M',
      fnc1: 'None',
      mode: 'Auto',
      moduleSize: 4,
      quietZone: 16,
      aimIndicator: 0,
      version: 'auto',
      charset: 'UTF_8',
      background: '#ffffff',
      foreground: '#000000',
      content: 'https://github.com/nuintun/qrcode'
    };
  }, []);

  const [loading, setLoading] = useLazyState(false);
  const [state, setState] = useState<EncodeResultMessage>();

  useEffect(() => {
    const onMessage = ({ data }: MessageEvent<EncodeResultMessage>) => {
      setState(data);
      setLoading(false);
    };

    worker.addEventListener('message', onMessage);

    return () => {
      worker.removeEventListener('message', onMessage);
    };
  }, []);

  const onFinish = useCallback((values: EncodeMessage) => {
    setLoading(true);

    worker.postMessage(values);
  }, []);

  return (
    <div className="page">
      <Form form={form} onFinish={onFinish} layout="vertical" initialValues={initialValues}>
        <Row gutter={24}>
          <Col span={24}>
            <FormItem name="content">
              <TextArea rows={8} allowClear />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="fnc1" label="支持 FNC1">
              <Select>
                <Option value="None">否</Option>
                <Option value="AIM">AIM</Option>
                <Option value="GS1">GS1</Option>
              </Select>
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="aimIndicator" label="AIM 标识">
              <InputNumber disabled={fnc1 !== 'AIM'} min={0} max={255} style={{ width: '100%' }} />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="version" label="版本大小">
              <Select>{versions}</Select>
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="level" label="纠错等级">
              <Select>
                <Option value="L">Level L (7%)</Option>
                <Option value="M">Level M (15%)</Option>
                <Option value="Q">Level Q (25%)</Option>
                <Option value="H">Level H (30%)</Option>
              </Select>
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="mode" label="编码方式">
              <Select>
                <Option value="Auto" selected>
                  Auto
                </Option>
                <Option value="Alphanumeric">Alphanumeric</Option>
                <Option value="Byte">Byte</Option>
                <Option value="Hanzi">Hanzi</Option>
                <Option value="Kanji">Kanji</Option>
                <Option value="Numeric">Numeric</Option>
              </Select>
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="charset" label="字符集">
              <Select>
                <Option value="ASCII">ASCII</Option>
                <Option value="UTF_8">UTF-8</Option>
                <Option value="ISO_8859_1">ISO-8859-1</Option>
              </Select>
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="moduleSize" label="模块大小">
              <InputNumber min={1} style={{ width: '100%' }} />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="quietZone" label="静区大小">
              <InputNumber min={0} style={{ width: '100%' }} />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="foreground" label="前景颜色">
              <ColorPicker showText />
            </FormItem>
          </Col>
          <Col md={6} sm={12} xs={24}>
            <FormItem name="background" label="背景颜色">
              <ColorPicker showText />
            </FormItem>
          </Col>
          <Col span={24}>
            <Button loading={loading} disabled={!content} htmlType="submit" type="primary">
              编码
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
