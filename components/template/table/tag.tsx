import React from 'react';
import styled from '@mui/system/styled';

interface Props {
  color: string;
}

const preset = {
  magenta: {
    color: '#c41d7f',
    background: '#fff0f6',
    borderColor: ' #ffadd2',
  },
  default: {
    color: '#000000d9',
    background: '#fafafa',
    borderColor: ' #d9d9d9',
  }
  // ...
};

export const Tag: React.FC<Props> = ({color, children}) => {
  return (
    <TagComp style={preset[color] || {backgroundColor: color}}>
      {children}
    </TagComp>
  );
};

const TagComp = styled('span')(({theme}) => ({
  boxSizing: 'border-box',
  margin: '0 8px 0 0',
  color: '#fff',
  fontVariant: 'tabular-nums',
  listStyle: 'none',
  fontFeatureSettings: '"tnum"',
  display: 'inline-block',
  height: 'auto',
  padding: '0 7px',
  fontSize: '12px',
  lineHeight: '20px',
  whiteSpace: 'nowrap',
  background: '#fafafa',
  border: '1px solid #d9d9d9',
  borderRadius: '2px',
  opacity: 1,
  transition: 'all .3s',
}));
