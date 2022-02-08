import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';

export interface PanelProps {
  title: React.ReactNode;
  extra?: React.ReactNode;
}

const HorizontalPanel: React.FC<PanelProps> = ({title, extra, children}) => {
  return (
    <Card variant='outlined'>
      <CardContent sx={{display: 'flex', flexDirection: 'row'}}>
        <Box
          sx={{
            minWidth: '110px',
            overflow: 'hidden',
            borderRight: '1px solid #f0f0f0',
            borderRadius: '2px 2px 0 0',
          }}
        >
          <Tooltip title={title}>
            <Typography sx={{fontSize: 15.5}} noWrap color='text.secondary'>
              {title}
            </Typography>
          </Tooltip>
        </Box>
        <Box sx={{minWidth: '85%', ml: 2}}>{children}</Box>
      </CardContent>
    </Card>
  );
};

const VerticalPanel: React.FC<PanelProps> = ({title, extra, children}) => {
  return (
    <Card variant='outlined'>
      <CardContent sx={{display: 'flex'}}>
        <Tooltip title={title}>
          <Typography
            sx={{fontSize: 18, flexGrow: 1}}
            noWrap
            color='text.secondary'
          >
            {title}
          </Typography>
        </Tooltip>
        {extra && <Box>{extra}</Box>}
      </CardContent>
      <Divider />
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export interface CardProps {
  title: React.ReactNode;
  extra?: React.ReactNode;
  layout?: 'vertical' | 'horizontal';
}

export const Panel: React.FC<CardProps> = ({
  layout = 'vertical',
  children,
  ...rest
}) => {
  if (layout === 'vertical') {
    return <VerticalPanel {...rest}>{children}</VerticalPanel>;
  } else if (layout === 'horizontal') {
    return <HorizontalPanel {...rest}>{children}</HorizontalPanel>;
  }
  return null;
};
