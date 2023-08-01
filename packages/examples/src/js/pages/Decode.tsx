import styles from '/css/Decode.module.scss';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Icon from '@ant-design/icons';
import useLazyState from '/js/hooks/useLazyState';
import ImagePicker from '/js/components/ImagePicker';
import { DecodedItem, DecodeMessage, DecodeResultMessage } from '/js/workers/decode';
import { Alert, Button, Col, Collapse, CollapseProps, Form, Image, Row, Switch } from 'antd';

import qrcode from '/images/qrcode.jpg';
import DncodeIcon from '/images/decode.svg';
import LocateIcon from '/images/locate.svg';
import UploadIcon from '/images/upload.svg';

const { Item: FormItem, useForm, useWatch } = Form;
const worker = new Worker(new URL('/js/workers/decode', import.meta.url));

interface LocateProps {
  item: DecodedItem;
  image: ImageBitmap;
}

const Locate = memo(function Locate({ item, image }: LocateProps) {
  const [visible, setVisible] = useState(false);

  const onClick = useCallback(() => {
    console.log(item, image);

    setVisible(visible => !visible);
  }, []);

  const onVisibleChange = useCallback((visible: boolean) => {
    setVisible(visible);
  }, []);

  const onStageClick = useCallback<React.MouseEventHandler>(e => {
    e.stopPropagation();
  }, []);

  return (
    <div onClick={onStageClick}>
      <Icon title="查看位置" component={LocateIcon} onClick={onClick} />
      <Image src={qrcode} style={{ display: 'none' }} preview={{ visible, onVisibleChange }} />
    </div>
  );
});

interface ResultProps {
  value?: DecodeResultMessage;
}

const Result = memo(function Result({ value }: ResultProps) {
  const items = useMemo<CollapseProps['items']>(() => {
    if (value && value.type === 'ok') {
      const { uid, items } = value.payload;

      return items.map((item, index) => {
        return {
          key: `${uid}-${index}`,
          label: `解码结果【${index + 1}】`,
          children: <pre>{item.content}</pre>,
          extra: <Locate item={item} image={value.payload.image} />
        };
      });
    }
  }, [value]);

  if (value) {
    switch (value.type) {
      case 'ok':
        return (
          <Collapse
            size="small"
            items={items}
            key={value.payload.uid}
            className={styles.contents}
            defaultActiveKey={`${value.payload.uid}-0`}
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

      const { image: src } = values;
      const image = new self.Image();

      image.crossOrigin = 'anonymous';

      image.onerror = () => {
        setLoading(false);
      };

      image.onload = () => {
        createImageBitmap(image).then(image => {
          const message: DecodeMessage = { ...values, image, uid: src };

          worker.postMessage(message, [image]);
        });
      };

      image.src = src;
    }
  }, []);

  const previewRender = useCallback((value?: string) => {
    if (value) {
      return <Image className={styles.preview} src={value} alt="preview" />;
    }

    return null;
  }, []);

  useEffect(() => {
    const onMessage = ({ data }: MessageEvent<DecodeResultMessage>) => {
      setState(data);
      setLoading(false);

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
              <ImagePicker preview={previewRender}>
                <Button icon={<Icon component={UploadIcon} />}>选择图片</Button>
              </ImagePicker>
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem name="strict" label="严格模式" valuePropName="checked" tooltip="可增加扫描速度，但会降低识别率">
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem name="invert" label="图片反色" valuePropName="checked">
              <Switch checkedChildren="开" unCheckedChildren="关" />
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
