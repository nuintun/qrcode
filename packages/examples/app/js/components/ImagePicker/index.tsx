import * as styles from './scss/index.module.scss';

import { App } from 'antd';
import { fileOpen } from 'browser-fs-access';
import React, { memo, useCallback, useRef } from 'react';
import useControllableValue from '/js/hooks/useControllableValue';

const { useApp } = App;

export interface ImageUploadProps {
  value?: string;
  disabled?: boolean;
  defaultValue?: string;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  preview?: (value?: string) => React.ReactNode;
}

export default memo(function ImageUpload(props: ImageUploadProps) {
  const { message } = useApp();
  const urlRef = useRef<string>();
  const { children, disabled, preview } = props;
  const [value, setValue] = useControllableValue<string>(props);

  const onClick = useCallback(() => {
    if (!disabled) {
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
            message.error('请选择图片格式文件');
          }
        },
        () => {
          // 读出文件失败
        }
      );
    }
  }, [disabled]);

  return (
    <div className={styles.upload}>
      <div onClick={onClick}>{children}</div>
      {preview && preview(value)}
    </div>
  );
});
