import styles from '/css/Decode.module.scss';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Icon from '@ant-design/icons';
import Clipboard from '/js/components/Clipboard';
import useLazyState from '/js/hooks/useLazyState';
import ImagePicker from '/js/components/ImagePicker';
import { createMarkup, syntaxHighlight } from '/js/utils/utils';
import { LocateMessage, LocateResultMessage } from '/js/workers/locate';
import { DecodedItem, DecodeMessage, DecodeResultMessage } from '/js/workers/decode';
import { Alert, App, Button, Col, Collapse, CollapseProps, Form, Image, ImageProps, Modal, Row, Switch, Tooltip } from 'antd';

import qrcode from '/images/qrcode.jpg';
import favicon from '/images/favicon.ico';
import DncodeIcon from '/images/decode.svg';
import LocateIcon from '/images/locate.svg';
import UploadIcon from '/images/upload.svg';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { useApp } = App;
const { Item: FormItem, useForm, useWatch } = Form;

interface OverviewLocateProps {
  state?: DecodeResultMessage;
  currentRef: React.MutableRefObject<string | undefined>;
}

const OverviewLocate = memo(function OverviewLocate({ state, currentRef }: OverviewLocateProps) {
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
            <Button loading={loading} onClick={onClick} icon={<Icon component={LocateIcon} />}>
              概览
            </Button>
          );
        }}
      />
    );
  }

  return null;
});

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
    <div className={styles.locate}>
      {trigger(loading, onClick)}
      <Image hidden src={favicon} preview={preview} />
    </div>
  );
});

interface DetailsProps {
  name: string;
  item: DecodedItem;
}

const Details = memo(function Details({ name, item }: DetailsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const onCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const details = useMemo(() => {
    const { content, ...details } = item;
    const json = JSON.stringify(details, null, 2);

    return syntaxHighlight(json, {
      key: styles.key,
      null: styles.null,
      number: styles.number,
      string: styles.string,
      boolean: styles.boolean
    });
  }, [item]);

  return (
    <>
      <Tooltip title="详情">
        <InfoCircleOutlined onClick={onClick} />
      </Tooltip>
      <Modal
        title={name}
        open={isModalOpen}
        onCancel={onCancel}
        footer={() => (
          <Button type="primary" onClick={onCancel}>
            确定
          </Button>
        )}
      >
        <code className={styles.details} dangerouslySetInnerHTML={createMarkup(details)} />
      </Modal>
    </>
  );
});

interface ResultProps {
  state?: DecodeResultMessage;
  currentRef: React.MutableRefObject<string | undefined>;
}

const Result = memo(function Result({ state, currentRef }: ResultProps) {
  const items = useMemo<CollapseProps['items']>(() => {
    if (state && state.type === 'ok') {
      const { uid, image, items } = state.payload;

      return items.map((item, index) => {
        const { content } = item;
        const key = `${uid}-${index}`;
        const label = `解码结果【${index + 1}】`;

        return {
          key,
          label,
          children: <pre>{content}</pre>,
          extra: (
            <div
              onClick={e => {
                e.stopPropagation();
              }}
              className={styles.extra}
            >
              <Clipboard text={content} />
              <Locate
                key={key}
                uid={key}
                image={image}
                items={[item]}
                name={`${label}定位`}
                currentRef={currentRef}
                trigger={(loading, onClick) => {
                  if (loading) {
                    return <LoadingOutlined />;
                  }

                  return (
                    <Tooltip title="定位">
                      <Icon component={LocateIcon} onClick={onClick} />
                    </Tooltip>
                  );
                }}
              />
              <Details name={`${label}详情`} item={item} />
            </div>
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

  const image = useWatch(['image'], form) ?? initialValues.image;

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
          <Col span={24} className={styles.actions}>
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
