/**
 * @module Clipboard
 */

import copy from 'copy-to-clipboard';
import { theme, Tooltip } from 'antd';
import { useI18n } from '/js/hooks/useI18n';
import { memo, useCallback, useState } from 'react';
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
  const { translate } = useI18n();
  const [state, setState] = useState(State.initial);

  const onClick = useCallback(async () => {
    if (await copy(text, { debug, format, message })) {
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
      return (
        <Tooltip title={translate('clipboard.copied')}>
          <CheckOutlined style={{ color: token.colorSuccessActive }} />
        </Tooltip>
      );
    case State.failure:
      return (
        <Tooltip title={translate('clipboard.failed')}>
          <CloseOutlined style={{ color: token.colorErrorActive }} />
        </Tooltip>
      );
    default:
      return (
        <Tooltip title={translate('clipboard.copy')}>
          <CopyOutlined onClick={onClick} />
        </Tooltip>
      );
  }
});
