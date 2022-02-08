import {styled} from '@mui/material/styles';
import { observer } from 'mobx-react';
import React from 'react';

export interface DrawerItemProps extends React.HTMLAttributes<any> {
  name: React.ReactNode;
  className?: string;
  title?: string;
  labelsOnly?: boolean;
  hidden?: boolean;
}

@observer
export class DrawerItem extends React.Component<DrawerItemProps> {
  render() {
    const {name, title, labelsOnly, children, hidden, ...elemProps} =
      this.props;
    if (hidden) return null;
    return (
      <Content {...elemProps} title={title}>
        <SpanName className='name'>{name}</SpanName>
        <SpanValue className='value'>{children}</SpanValue>
      </Content>
    );
  }
}

const Content = styled('div')(({theme}) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(30%, min-content) auto',
  borderBottom: `1px solid #ededed`,
  padding: `.5rem 0`,
  margin: 'auto 2%',
}));
const SpanName = styled('span')(({theme}) => ({
  color: '#727272',
  paddingRight: `.6rem`,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));
const SpanValue = styled('span')(({theme}) => ({
  color: '#727272',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
}));
