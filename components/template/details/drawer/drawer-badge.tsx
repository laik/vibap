import {styled} from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import React from 'react';

interface Props extends React.HTMLAttributes<any> {
  label: React.ReactNode;
}

export class DrawerBadge extends React.Component<Props> {
  render() {
    const {label, children, ...elemProps} = this.props;
    return (
      <SpanBadge {...elemProps}>
        <Tooltip title={label}>
          <span>{label}</span>
        </Tooltip>
        {children}
      </SpanBadge>
    );
  }
}

const SpanBadge = styled('div')(({theme}) => ({
  display: 'inline-block',
  background: '#ededed',
  // color: `${theme.palette['textColorSecondary']}`,
  borderRadius: '.3rem',
  padding: '.2rem .4rem',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  margin: '.2rem',
  marginLeft: 0,
  '&:last-child': {
    marginRight: 0,
  },
}));
