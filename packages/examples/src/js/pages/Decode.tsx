import styles from '/css/Decode.module.scss';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useLazyState from '/js/hooks/useLazyState';
import ImageUpload from '/js/components/ImageUpload';
import Icon, { UploadOutlined } from '@ant-design/icons';
import { EncodeResultMessage } from '/js/workers/encode';
import { Alert, Button, Col, Form, Image, Row, Switch } from 'antd';

import qrcode from '/images/qrcode.jpg';
import DncodeIcon from '/images/decode.svg';

const { Item: FormItem, useForm, useWatch } = Form;
const worker = new Worker(new URL('/js/workers/decode', import.meta.url));

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
        return <Alert type="error" message={data} showIcon />;
      default:
        return <Alert type="error" message="unknown error" showIcon />;
    }
  }

  return null;
});

interface FormValues {
  image: string;
  strict: boolean;
  invert: boolean;
}

export default memo(function Encode() {
  const [form] = useForm<FormValues>();

  const initialValues = useMemo<FormValues>(() => {
    return {
      image: qrcode,
      strict: false,
      invert: false
    };
  }, []);

  const image = useWatch(['image'], form);

  const lockRef = useRef(false);
  const [loading, setLoading] = useLazyState(false);
  const [state, setState] = useState<EncodeResultMessage>();

  useEffect(() => {
    const onMessage = ({ data }: MessageEvent<EncodeResultMessage>) => {
      setState(data);
      setLoading(false);

      lockRef.current = false;
    };

    worker.addEventListener('message', onMessage);

    return () => {
      worker.removeEventListener('message', onMessage);
    };
  }, []);

  const onFinish = useCallback((values: FormValues) => {
    if (!lockRef.current) {
      setLoading(true);

      lockRef.current = true;

      const image = new self.Image();

      image.crossOrigin = 'anonymous';

      image.onerror = () => {
        setLoading(false);
      };

      image.onload = () => {
        createImageBitmap(image).then(image => {
          worker.postMessage({ ...values, image }, [image]);
        });
      };

      image.src = values.image;
    }
  }, []);

  return (
    <div className="page">
      <Form form={form} onFinish={onFinish} layout="vertical" initialValues={initialValues}>
        <Row gutter={24}>
          <Col span={24}>
            <FormItem name="image">
              <ImageUpload>
                <Button icon={<UploadOutlined />}>选择图片</Button>
              </ImageUpload>
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem name="strict" label="严格模式" valuePropName="checked">
              <Switch />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem name="invert" label="图片反色" valuePropName="checked">
              <Switch />
            </FormItem>
          </Col>
          <Col span={24}>
            <Button type="primary" htmlType="submit" loading={loading} disabled={!image} icon={<Icon component={DncodeIcon} />}>
              解码
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
