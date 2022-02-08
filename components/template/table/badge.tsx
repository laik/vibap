import React from 'react';
import styled from '@mui/system/styled';

interface Props {
  /** 预设 "success" | "error" | "default" | "processing" | "warning" */
  status?: string;
  text?: string;
  color?: string;
}

const preset = {
  success: '#52c41a',
  error: '#ff4d4f',
  default: '#d9d9d9',
  processing: '#1890ff',
  warning: '#faad14',
};

// 徽章
export const Badge: React.FC<Props> = ({color, status, text}) => {
  return (
    <BadgeComp>
      <BadgeDot
        style={{backgroundColor: preset[status] || color || preset.default}}
      ></BadgeDot>
      {text && <BadgeText style={{color: preset[status] || color}}>{text}</BadgeText>}
    </BadgeComp>
  );
};

const BadgeDot = styled('span')(({theme}) => ({
  position: 'relative',
  top: '-1px',
  display: 'inline-block',
  width: '6px',
  height: '6px',
  verticalAlign: 'middle',
  borderRadius: '50%',
}));

const BadgeText = styled('span')(({theme}) => ({
  marginLeft: '8px',
  color: '#000000d9',
  fontSize: '14px',
}));

const BadgeComp = styled('span')(({theme}) => ({
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  color: '#000000d9',
  fontsize: '14px',
  fontVariant: 'tabular-nums',
  listStyle: 'none',
  fontFeatureSettings: '"tnum"',
  position: 'relative',
  display: 'inline-block',
  lineHeight: 1,
}));
