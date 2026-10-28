import * as styles from '/css/Decode.module.scss';

import Icon from '@ant-design/icons';
import { useI18n } from '/js/hooks/useI18n';
import Clipboard from '/js/components/Clipboard';
import useLazyState from '/js/hooks/useLazyState';
import JSONViewer from '/js/components/JSONViewer';
import { normalizeLinefeed } from '/js/utils/utils';
import ImagePicker from '/js/components/ImagePicker';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { LocateMessage, LocateResultMessage } from '/js/workers/locate';
import { DecodedItem, DecodeMessage, DecodeResultMessage } from '/js/workers/decode';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, App, Button, Col, Collapse, CollapseProps, Form, Image, ImageProps, Modal, Row, Switch, Tooltip } from 'antd';

import qrcode from '/images/qrcode.jpg';
import favicon from '/images/favicon.ico';
import DncodeIcon from '/images/decode.svg';
import LocateIcon from '/images/locate.svg';
import UploadIcon from '/images/upload.svg';

const { useApp } = App;
const { Item: FormItem, useForm, useWatch } = Form;

interface OverviewLocateProps {
  state?: DecodeResultMessage;
  currentRef: React.RefObject<string | null>;
}

const OverviewLocate = memo(function OverviewLocate({ state, currentRef }: OverviewLocateProps) {
  const { translate } = useI18n();

  if (state && state.type === 'ok') {
    const { payload } = state;
    const { uid, image, items } = payload;

    return (
      <Locate
        key={uid}
        uid={uid}
        name={translate('decode.overview')}
        image={image}
        items={items}
        currentRef={currentRef}
        trigger={(loading, onClick) => {
          return (
            <Button loading={loading} onClick={onClick} icon={<Icon component={LocateIcon} />}>
              {translate('decode.overview')}
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
  currentRef: React.RefObject<string | null>;
  trigger: (loading: boolean, onClick: () => void) => React.ReactNode;
}

function cloneImageBitmap(image: ImageBitmap): ImageBitmap {
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  return canvas.transferToImageBitmap();
}

const Locate = memo(function Locate({ uid, name, items, image, trigger, currentRef }: LocateProps) {
  const { translate } = useI18n();
  const lockRef = useRef(false);
  const { message: info } = useApp();
  const workerRef = useRef<Worker>(null);
  const [open, setOpen] = useState(false);
  const prevUidRef = useRef<string>(null);
  const [src, setSrc] = useState<string>();
  const [loading, setLoading] = useLazyState(false);

  const preview = useMemo<ImageProps['preview']>(() => {
    return {
      src,
      open,
      onOpenChange(open) {
        setOpen(open);
      },
      actionsRender(node) {
        return (
          <div className={styles.locatedToolbar}>
            <p>{name}</p>
            {node}
          </div>
        );
      }
    };
  }, [src, name, open]);

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
      setOpen(open => !open);
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
            setOpen(open => !open);
          }
          break;
        case 'error':
          info.error(translate(`worker.${data.code}`));
          break;
        default:
          info.error(translate('common.unknownError'));
      }
    });

    workerRef.current = worker;

    return () => {
      worker.terminate();
    };
  }, [uid, translate]);

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
  const { translate } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const onCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const details = useMemo(() => {
    const { content, ...details } = item;

    return details;
  }, [item]);

  return (
    <>
      <Tooltip title={translate('decode.details')}>
        <InfoCircleOutlined onClick={onClick} />
      </Tooltip>
      <Modal
        centered
        title={name}
        destroyOnHidden
        open={isModalOpen}
        onCancel={onCancel}
        footer={() => (
          <Button type="primary" onClick={onCancel}>
            {translate('common.confirm')}
          </Button>
        )}
      >
        <JSONViewer data={details} className={styles.details} />
      </Modal>
    </>
  );
});

interface ResultProps {
  state?: DecodeResultMessage;
  currentRef: React.RefObject<string | null>;
}

const Result = memo(function Result({ state, currentRef }: ResultProps) {
  const { lang, translate } = useI18n();
  const items = useMemo<CollapseProps['items']>(() => {
    if (state && state.type === 'ok') {
      const { uid, image, items } = state.payload;

      return items.map((item, index) => {
        const { content } = item;
        const key = `${uid}-${index}`;
        const label = translate('decode.result', { n: index + 1 });

        return {
          key,
          label,
          children: <pre>{normalizeLinefeed(content)}</pre>,
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
                name={translate('decode.locateTitle', { n: index + 1 })}
                currentRef={currentRef}
                trigger={(loading, onClick) => {
                  if (loading) {
                    return <LoadingOutlined />;
                  }

                  return (
                    <Tooltip title={translate('decode.locate')}>
                      <Icon component={LocateIcon} onClick={onClick} />
                    </Tooltip>
                  );
                }}
              />
              <Details name={translate('decode.detailsTitle', { n: index + 1 })} item={item} />
            </div>
          )
        };
      });
    }
  }, [state, lang]);

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
        return <Alert type="error" title={translate(`worker.${state.code}`)} showIcon />;
      default:
        return <Alert type="error" title={translate('common.unknownError')} showIcon />;
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
  const workerRef = useRef<Worker>(null);
  const currentLocateRef = useRef<string>(null);
  const [loading, setLoading] = useLazyState(false);
  const [state, setState] = useState<DecodeResultMessage>();
  const { translate } = useI18n();

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
                <Button icon={<Icon component={UploadIcon} />}>{translate('decode.selectImage')}</Button>
              </ImagePicker>
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem
              name="strict"
              label={translate('decode.strict')}
              valuePropName="checked"
              tooltip={translate('decode.strictTip')}
            >
              <Switch checkedChildren={translate('common.on')} unCheckedChildren={translate('common.off')} />
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem name="invert" label={translate('decode.invert')} valuePropName="checked">
              <Switch checkedChildren={translate('common.on')} unCheckedChildren={translate('common.off')} />
            </FormItem>
          </Col>
          <Col span={24} className={styles.actions}>
            <Button type="primary" htmlType="submit" loading={loading} disabled={!image} icon={<Icon component={DncodeIcon} />}>
              {translate('decode.submit')}
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
