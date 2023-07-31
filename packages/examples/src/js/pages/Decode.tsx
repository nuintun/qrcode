import styles from '/css/Decode.module.scss';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Icon from '@ant-design/icons';
import useLazyState from '/js/hooks/useLazyState';
import ImagePicker from '/js/components/ImagePicker';
import { DecodeResultMessage } from '/js/workers/decode';
import { Alert, Button, Col, Collapse, CollapseProps, Form, Image, Row, Switch } from 'antd';

import qrcode from '/images/qrcode.jpg';
import DncodeIcon from '/images/decode.svg';
import UploadIcon from '/images/upload.svg';

const { Item: FormItem, useForm, useWatch } = Form;
const worker = new Worker(new URL('/js/workers/decode', import.meta.url));

interface ResultProps {
  value?: DecodeResultMessage;
}

const Result = memo(function Result({ value }: ResultProps) {
  const items = useMemo<CollapseProps['items']>(() => {
    if (value && value.type === 'ok') {
      const { image, contents } = value.payload;

      return contents.map((content, index) => {
        return {
          key: `${image}-${index}`,
          label: `解码结果【${index + 1}】`,
          children: <pre>{content}</pre>
        };
      });
    }
  }, [value]);

  if (value) {
    switch (value.type) {
      case 'ok':
        const { image } = value.payload;
        const defaultActiveKey = `${image}-0`;

        return (
          <Collapse
            bordered
            key={image}
            size="small"
            items={items}
            className={styles.contents}
            defaultActiveKey={defaultActiveKey}
          />
        );
      case 'error':
        return <Alert type="error" message={value.message} showIcon />;
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
  const lockRef = useRef(false);
  const [form] = useForm<FormValues>();
  const image = useWatch(['image'], form);
  const [loading, setLoading] = useLazyState(false);
  const [state, setState] = useState<DecodeResultMessage>();

  const onSwitchChange = useCallback(() => {
    setPreview(image);
    setState(undefined);
  }, [image]);

  const initialValues = useMemo<FormValues>(() => {
    return {
      image: qrcode,
      strict: false,
      invert: false
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

  const [preview, setPreview] = useState(initialValues.image);

  const onImagePackerChange = useCallback((value: string) => {
    setPreview(value);
    setState(undefined);
  }, []);

  const previewRender = useCallback(() => {
    return <Image title={preview} className={styles.preview} src={preview} alt="preview" />;
  }, [preview]);

  useEffect(() => {
    return () => {
      if (state && state.type === 'ok') {
        URL.revokeObjectURL(state.payload.image);
      }
    };
  }, [state]);

  useEffect(() => {
    const onMessage = ({ data }: MessageEvent<DecodeResultMessage>) => {
      setState(data);
      setLoading(false);

      if (data.type === 'ok') {
        setPreview(data.payload.image);
      }

      lockRef.current = false;
    };

    worker.addEventListener('message', onMessage);

    return () => {
      worker.removeEventListener('message', onMessage);
    };
  }, []);

  return (
    <div className="page">
      <Form form={form} onFinish={onFinish} layout="vertical" initialValues={initialValues}>
        <Row gutter={24}>
          <Col span={24}>
            <FormItem name="image">
              <ImagePicker disabled={lockRef.current} preview={previewRender} onChange={onImagePackerChange}>
                <Button disabled={loading} icon={<Icon component={UploadIcon} />}>
                  选择图片
                </Button>
              </ImagePicker>
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem name="strict" label="严格模式" valuePropName="checked">
              <Switch onChange={onSwitchChange} />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem name="invert" label="图片反色" valuePropName="checked">
              <Switch onChange={onSwitchChange} />
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
