import Typography from '@mui/material/Typography';
import {styled} from '@mui/material/styles';
import React from 'react';

interface Props {
  title?: React.ReactNode;
}

export class DrawerTitle extends React.Component<Props> {
  render() {
    const {title} = this.props;
    return (
      <Background>
        <Typography variant='subtitle1'>{title}</Typography>
      </Background>
    );
  }
}

const Background = styled('div')(({theme}) => ({
  padding: '0.5% 2%',
  margin: '2% auto 1%',
  background: '#f1f1f1',
}));
