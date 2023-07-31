import styles from './scss/index.module.scss';

import React, { memo, useCallback, useRef } from 'react';

import { fileOpen } from 'browser-fs-access';
import useControllableValue from '/js/hooks/useControllableValue';

export interface ImageUploadProps {
  value?: string;
  disabled?: boolean;
  defaultValue?: string;
  accept?: `image/${string}`;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
  preview?: (value?: string) => React.ReactNode;
}

export default memo(function ImageUpload(props: ImageUploadProps) {
  const urlRef = useRef<string>();
  const [value, setValue] = useControllableValue<string>(props);
  const { children, disabled, preview, accept = 'image/*' } = props;

  const onClick = useCallback(() => {
    if (!disabled) {
      fileOpen({ mimeTypes: [accept] }).then(file => {
        setValue(() => {
          if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
          }

          urlRef.current = URL.createObjectURL(file);

          return urlRef.current;
        });
      });
    }
  }, [accept, disabled]);

  return (
    <div className={styles.upload}>
      <div onClick={onClick}>{children}</div>
      {preview && preview(value)}
    </div>
  );
});
