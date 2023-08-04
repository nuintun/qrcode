/**
 * @module Clipboard
 */

import { memo, useCallback, useState } from 'react';

import { theme } from 'antd';
import copy from 'copy-to-clipboard';
import { CheckOutlined, CloseOutlined, CopyOutlined } from '@ant-design/icons';

const { useToken } = theme;

const enum State {
  initial,
  success,
  failure
}

export interface ClipboardProps {
  text: string;
  debug?: boolean;
  format?: string;
  message?: string;
}

export default memo(function Clipboard({ text, debug, format, message }: ClipboardProps) {
  const { token } = useToken();
  const [state, setState] = useState(State.initial);

  const onClick = useCallback(() => {
    if (copy(text, { debug, format, message })) {
      setState(State.success);
    } else {
      setState(State.failure);
    }

    setTimeout(() => {
      setState(State.initial);
    }, 3000);
  }, [text, debug, format, message]);

  switch (state) {
    case State.success:
      return <CheckOutlined style={{ color: token.colorSuccessActive }} title="复制成功" />;
    case State.failure:
      return <CloseOutlined style={{ color: token.colorErrorActive }} title="复制失败" />;
    default:
      return <CopyOutlined title="复制" onClick={onClick} />;
  }
});
