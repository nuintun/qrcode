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
  image: ImageBitmap;
  items: DecodedItem[];
  currentRef: React.MutableRefObject<string | undefined>;
  trigger: (loading: boolean, onClick: () => void) => React.ReactNode;
}

function cloneImageBitmap(image: ImageBitmap): ImageBitmap {
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  return canvas.transferToImageBitmap();
}

const Locate = memo(function Locate({ uid, name, items, image, trigger, currentRef }: LocateProps) {
  const lockRef = useRef(false);
  const workerRef = useRef<Worker>();
  const { message: info } = useApp();
  const prevUidRef = useRef<string>();
  const [src, setSrc] = useState<string>();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useLazyState(false);

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

    if (prevUidRef.current !== uid) {
      const worker = workerRef.current;

      if (worker && !lockRef.current) {
        setLoading(true);

        lockRef.current = true;
        prevUidRef.current = uid;

        const newImage = cloneImageBitmap(image);

        const message: LocateMessage = {
          image: newImage,
          items: items.map(item => {
            return {
              finder: item.finder,
              timing: item.timing,
              corners: item.corners,
              alignment: item.alignment
            };
          })
        };

        worker.postMessage(message, [newImage]);
      }
    } else {
      setVisible(visible => !visible);
    }
  }, [uid, image, items]);

  const onStageClick = useCallback<React.MouseEventHandler>(e => {
    e.stopPropagation();
  }, []);

  useEffect(() => {
    const worker = new Worker(new URL('/js/workers/locate', import.meta.url));

    worker.addEventListener('message', ({ data }: MessageEvent<LocateResultMessage>) => {
      setLoading(false);

      lockRef.current = false;

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

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, [uid]);

  return (
    <div className={styles.locate} onClick={onStageClick}>
      {trigger(loading, onClick)}
      <Image hidden src={favicon} preview={preview} />
    </div>
  );
});

interface OverviewLocateProps {
  state?: DecodeResultMessage;
  currentRef: React.MutableRefObject<string | undefined>;
}

const OverviewLocate = memo(function Overview({ state, currentRef }: OverviewLocateProps) {
  if (state && state.type === 'ok') {
    const { payload } = state;
    const { uid, image, items } = payload;

    return (
      <Locate
        key={uid}
        uid={uid}
        name="概览"
        image={image}
        items={items}
        currentRef={currentRef}
        trigger={(loading, onClick) => {
          return (
            <Button
              loading={loading}
              onClick={onClick}
              className={styles.overviewLocate}
              icon={<Icon component={LocateIcon} />}
            >
              概览
            </Button>
          );
        }}
      />
    );
  }

  return null;
});

interface ResultProps {
  state?: DecodeResultMessage;
  currentRef: React.MutableRefObject<string | undefined>;
}

const Result = memo(function Result({ state, currentRef }: ResultProps) {
  const items = useMemo<CollapseProps['items']>(() => {
    if (state && state.type === 'ok') {
      const { uid, items } = state.payload;

      return items.map((item, index) => {
        const key = `${uid}-${index}`;
        const label = `解码结果【${index + 1}】`;

        return {
          key,
          label,
          children: <pre>{item.content}</pre>,
          extra: (
            <Locate
              key={key}
              uid={key}
              name={label}
              items={[item]}
              currentRef={currentRef}
              image={state.payload.image}
              trigger={(loading, onClick) => {
                if (loading) {
                  return <LoadingOutlined />;
                }

                return <Icon title="查看位置" component={LocateIcon} onClick={onClick} />;
              }}
            />
          )
        };
      });
    }
  }, [state]);

  if (state) {
    switch (state.type) {
      case 'ok':
        return (
          <Collapse
            size="small"
            items={items}
            key={state.payload.uid}
            className={styles.contents}
            defaultActiveKey={`${state.payload.uid}-0`}
          />
        );
      case 'error':
        return <Alert type="error" message={state.message} showIcon />;
      default:
        return <Alert type="error" message="发生未知错误" showIcon />;
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
  const workerRef = useRef<Worker>();
  const [form] = useForm<FormValues>();
  const image = useWatch(['image'], form);
  const currentLocateRef = useRef<string>();
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
    const worker = workerRef.current;

    if (worker && !lockRef.current) {
      setLoading(true);

      lockRef.current = true;

      const { image: src } = values;
      const image = new self.Image();

      image.crossOrigin = 'anonymous';

      image.addEventListener('error', () => {
        setLoading(false);
      });

      image.addEventListener('load', () => {
        createImageBitmap(image).then(image => {
          const message: DecodeMessage = { ...values, image, uid: src };

          worker.postMessage(message, [image]);
        });
      });

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
    const worker = new Worker(new URL('/js/workers/decode', import.meta.url));

    worker.addEventListener('message', ({ data }: MessageEvent<DecodeResultMessage>) => {
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
            <OverviewLocate state={state} currentRef={currentLocateRef} />
          </Col>
        </Row>
      </Form>
      <div className={styles.result}>
        <Result state={state} currentRef={currentLocateRef} />
      </div>
    </div>
  );
});
