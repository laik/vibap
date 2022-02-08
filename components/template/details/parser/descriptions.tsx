import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import styled from '@mui/system/styled';
import React from 'react';

type DescriptionsItem = {
  label: string;
  value: React.ReactNode;
  status?: 'success' | 'error' | 'default' | 'processing' | 'warning';
  color?: string;
};

const preset = {
  success: '#52c41a',
  error: '#ff4d4f',
  default: '#d9d9d9',
  processing: '#1890ff',
  warning: '#faad14',
};

export interface DescriptionsProps {
  column: number;
  items: DescriptionsItem[];
  title?: React.ReactNode;
  layout?: 'horizontal' | 'vertical';
}

export const Descriptions: React.FC<DescriptionsProps> = ({
  column,
  title,
  layout = 'horizontal',
  items,
}) => {
  return (
    <Box sx={{flexGrow: 1}}>
      {title && (
        <Typography
          sx={{fontSize: 18}}
          noWrap
          gutterBottom
          color='text.secondary'
          align='justify'
        >
          {title}
        </Typography>
      )}
      <Grid container spacing={{xs: 1}}>
        {items &&
          items.map((item, i) => (
            <Grid item xs={12 / column} key={i}>
              <Item
                sx={{...(layout === 'vertical' && {flexDirection: 'column'})}}
              >
                  <Tooltip title={item.value} arrow>
                    <Typography
                      sx={{
                        fontSize: 14.5,
                        ...(((item.status && preset[item.status]) ||
                          item.color) && {
                          color: preset[item.status] || item.color,
                        }),
                      }}
                      noWrap
                      gutterBottom
                      color='text.secondary'
                      align='left'
                    >
                      {item.label}: {item.value}
                    </Typography>
                  </Tooltip>
              </Item>
            </Grid>
          ))}
      </Grid>
    </Box>
  );
};

const Item = styled('div')(({theme}) => ({
  display: 'flex',
}));
