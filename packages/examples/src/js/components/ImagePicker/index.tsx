import styles from './scss/index.module.scss';

import React, { memo, useCallback, useRef } from 'react';

import { Image } from 'antd';
import { fileOpen } from 'browser-fs-access';
import useControllableValue from '/js/hooks/useControllableValue';

export interface ImageUploadProps {
  value?: string;
  defaultValue?: string;
  accept?: `image/${string}`;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
}

export default memo(function ImageUpload(props: ImageUploadProps) {
  const { children, accept = 'image/*' } = props;

  const urlRef = useRef<string>();
  const [value, setValue] = useControllableValue<string>(props);

  const onClick = useCallback(() => {
    fileOpen({ mimeTypes: [accept] }).then(file => {
      setValue(() => {
        if (urlRef.current) {
          URL.revokeObjectURL(urlRef.current);
        }

        urlRef.current = URL.createObjectURL(file);

        return urlRef.current;
      });
    });
  }, [accept]);

  return (
    <div className={styles.upload}>
      <div onClick={onClick}>{children}</div>
      {value && <Image src={value} className={styles.preview} />}
    </div>
  );
});
