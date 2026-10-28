import * as styles from './scss/index.module.scss';

import { App } from 'antd';
import classNames from 'classnames';
import { useI18n } from '/js/hooks/useI18n';
import { fileOpen } from 'browser-fs-access';
import useControllableValue from '/js/hooks/useControllableValue';
import React, { memo, useCallback, useRef, useState } from 'react';

const { useApp } = App;

type DivDragEvent = React.DragEvent<HTMLDivElement>;

export interface ImageUploadProps {
  value?: string;
  defaultValue?: string;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  preview?: (value?: string) => React.ReactNode;
}

export default memo(function ImageUpload(props: ImageUploadProps) {
  const { message } = useApp();
  const { translate } = useI18n();
  const urlRef = useRef<string>(null);
  const { children, preview } = props;
  const [dragging, setDragging] = useState(false);
  const [value, setValue] = useControllableValue<string>(props);

  const onClick = useCallback(() => {
    fileOpen({ mimeTypes: ['image/*'] }).then(
      file => {
        if (/^image\/.+$/i.test(file.type)) {
          setValue(() => {
            if (urlRef.current) {
              URL.revokeObjectURL(urlRef.current);
            }

            urlRef.current = URL.createObjectURL(file);

            return urlRef.current;
          });
        } else {
          message.error(translate('imagePicker.invalidType'));
        }
      },
      (error: Error) => {
        if (error.name !== 'AbortError') {
          // 读取文件失败
          message.error(translate('imagePicker.readFailed'));
        }
      }
    );
  }, [message, translate]);

  const onDragOver = useCallback((event: DivDragEvent) => {
    event.preventDefault();

    setDragging(true);
  }, []);

  const onDrop = useCallback(
    (event: DivDragEvent) => {
      event.preventDefault();

      const { files } = event.dataTransfer;
      const { length } = files;

      let passed = false;

      for (let i = 0; i < length; i++) {
        const file = files[i];

        if (/^image\/.+$/i.test(file.type)) {
          setValue(() => {
            if (urlRef.current) {
              URL.revokeObjectURL(urlRef.current);
            }

            urlRef.current = URL.createObjectURL(file);

            return urlRef.current;
          });

          passed = true;

          break;
        }
      }

      setDragging(false);

      if (!passed) {
        message.error(translate('imagePicker.invalidType'));
      }
    },
    [message, setValue, translate]
  );

  const onDragLeave = useCallback((event: DivDragEvent) => {
    event.preventDefault();

    setDragging(false);
  }, []);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={classNames(styles.upload, {
        [styles.dragging]: dragging
      })}
    >
      <div onClick={onClick}>{children}</div>
      {preview && preview(value)}
    </div>
  );
});
