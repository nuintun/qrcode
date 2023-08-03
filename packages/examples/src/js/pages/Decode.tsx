import styles from '/css/Decode.module.scss';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import useLazyState from '/js/hooks/useLazyState';
import ImagePicker from '/js/components/ImagePicker';
import Icon, { LoadingOutlined } from '@ant-design/icons';
import { LocateMessage, LocateResultMessage } from '/js/workers/locate';
import { DecodedItem, DecodeMessage, DecodeResultMessage } from '/js/workers/decode';
import { Alert, App, Button, Col, Collapse, CollapseProps, Form, Image, ImageProps, Row, Switch } from 'antd';

import qrcode from '/images/qrcode.jpg';
import favicon from '/images/favicon.ico';
import DncodeIcon from '/images/decode.svg';
import LocateIcon from '/images/locate.svg';
import UploadIcon from '/images/upload.svg';

const { useApp } = App;
const { Item: FormItem, useForm, useWatch } = Form;

interface LocateProps {
  uid: string;
  name: string;
  item: DecodedItem;
  image: ImageBitmap;
  currentRef: React.MutableRefObject<string | undefined>;
}

function cloneImageBitmap(image: ImageBitmap): ImageBitmap {
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  return canvas.transferToImageBitmap();
}

const Locate = memo(function Locate({ uid, name, item, image, currentRef }: LocateProps) {
  const lockRef = useRef(false);
  const { message: info } = useApp();
  const [src, setSrc] = useState<string>();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useLazyState(false);
  const worker = useMemo(() => new Worker(new URL('/js/workers/locate', import.meta.url)), []);

  const preview = useMemo<ImageProps['preview']>(() => {
    return {
      src,
      visible,
      onVisibleChange(visible) {
        setVisible(visible);
      },
      toolbarRender(node) {
        return (
          <div className={styles.locatedToolbar}>
            <p>{name}</p>
            {node}
          </div>
        );
      }
    };
  }, [src, name, visible]);

  const onClick = useCallback(() => {
    currentRef.current = uid;

    if (src == null) {
      if (!lockRef.current) {
        setLoading(true);

        lockRef.current = true;

        const newImage = cloneImageBitmap(image);

        worker.addEventListener('message', ({ data }: MessageEvent<LocateResultMessage>) => {
          setLoading(false);

          switch (data.type) {
            case 'ok':
              setSrc(data.payload);

              const { current } = currentRef;

              if (current === uid) {
                setVisible(visible => !visible);
              }
              break;
            case 'error':
              info.error(data.message);
              break;
            default:
              info.error('发生未知错误');
          }
        });

        const message: LocateMessage = {
          image: newImage,
          finder: item.finder,
          timing: item.timing,
          corners: item.corners,
          alignment: item.alignment
        };

        worker.postMessage(message, [newImage]);
      }
    } else {
      setVisible(visible => !visible);
    }
  }, [src]);

  const onStageClick = useCallback<React.MouseEventHandler>(e => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    return () => {
      worker.terminate();
    };
  }, []);

  return (
    <div className={styles.locate} onClick={onStageClick}>
      <Image hidden src={favicon} preview={preview} />
      {loading ? <LoadingOutlined /> : <Icon title="查看位置" component={LocateIcon} onClick={onClick} />}
    </div>
  );
});

interface ResultProps {
  value?: DecodeResultMessage;
}

const Result = memo(function Result({ value }: ResultProps) {
  const currentRef = useRef<string>();

  const items = useMemo<CollapseProps['items']>(() => {
    if (value && value.type === 'ok') {
      const { uid, items } = value.payload;

      return items.map((item, index) => {
        const key = `${uid}-${index}`;
        const label = `解码结果【${index + 1}】`;

        return {
          key,
          label,
          children: <pre>{item.content}</pre>,
          extra: <Locate uid={key} name={label} item={item} currentRef={currentRef} image={value.payload.image} />
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
  const worker = useMemo(() => new Worker(new URL('/js/workers/decode', import.meta.url)), []);

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
      return <Image src={value} alt="preview" className={styles.preview} />;
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
      worker.terminate();
    };
  }, []);

  return (
    <div className="ui-page">
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
