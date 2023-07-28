import styles from './scss/index.module.scss';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Image, Upload, UploadProps } from 'antd';
import useControllableValue from '/js/hooks/useControllableValue';

export interface ImageUploadProps {
  value?: string;
  defaultValue?: string;
  accept?: `image/${string}`;
  children?: React.ReactNode;
  onChange?: (value: string) => void;
}

type FileList = NonNullable<UploadProps['fileList']>;
type BeforeUpload = NonNullable<UploadProps['beforeUpload']>;

function getFileList(value?: string): FileList {
  if (!value) {
    return [];
  }

  return [{ uid: value, url: value, name: value, status: 'done', thumbUrl: value }];
}

export default memo(function ImageUpload(props: ImageUploadProps) {
  const { children, value: propsValue, accept = 'image/*' } = props;

  const urlRef = useRef<string>();
  const [value, setValue] = useControllableValue<string>(props);
  const [fileList, setFileList] = useState<FileList>(() => getFileList(value));

  const beforeUpload = useCallback<BeforeUpload>(file => {
    setValue(() => {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
      }

      urlRef.current = URL.createObjectURL(file);

      return urlRef.current;
    });

    return false;
  }, []);

  useEffect(() => {
    if (propsValue) {
      setFileList(getFileList(propsValue));
    }
  }, [propsValue]);

  return (
    <div className={styles.upload}>
      <Upload
        maxCount={1}
        accept={accept}
        listType="picture"
        fileList={fileList}
        showUploadList={false}
        beforeUpload={beforeUpload}
      >
        {children}
      </Upload>
      {value && <Image src={value} className={styles.preview} />}
    </div>
  );
});
