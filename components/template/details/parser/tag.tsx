import React from 'react';
import styled from '@mui/system/styled';
import ClearIcon from '@mui/icons-material/Clear';

export interface TagProps {
  label: React.ReactNode;
  closeIcon?: boolean;
  onClose?: (e) => void;
  value?: any;
}

export const Tag: React.FC<TagProps> = ({closeIcon, onClose, label}) => {
  return (
    <TagWrap>
      <span>{label}</span>
      {closeIcon && (
        <TagIcon onClick={onClose}>
          <ClearIcon sx={{fontSize: 14, lineHeight: '22px'}} />
        </TagIcon>
      )}
    </TagWrap>
  );
};

const TagIcon = styled('div')(({theme}) => ({
  marginLeft: 3,
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
}));

const TagWrap = styled('div')(({theme}) => ({
  boxSizing: 'border-box',
  margin: '0 8px 0 0',
  color: '#000000d9',
  fontSize: '14px',
  fontVariant: 'tabular-nums',
  lineHeight: '1.5715',
  listStyle: 'none',
  fontFeatureSettings: '"tnum"',
  //   display: 'inline-block',
  height: 'auto',
  padding: '0 7px',
  whiteSpace: 'nowrap',
  background: '#fafafa',
  border: '1px solid #d9d9d9',
  borderRadius: '2px',
  opacity: 1,
  transition: 'all .3s',
  display: 'flex',
  // justifyContent: 'center',
  alignItems: 'center',
}));
