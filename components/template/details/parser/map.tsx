import Masonry from '@mui/lab/Masonry';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import styled from '@mui/system/styled';
import React from 'react';
import {Statistic} from '../../../statistic';
import {DataGridTable} from '../../table/datagridtable';
import {Descriptions} from './descriptions';
import {Panel} from './panel';
import {Tabs} from './tabs';
import {Tag} from './tag';

const select = props => {
  return (
    <Autocomplete
      size='small'
      disablePortal
      options={props.options}
      sx={{width: 300}}
      value={props.value}
      onChange={props.onChange}
      renderInput={params => <TextField {...params} label={props.label} />}
    />
  );
};

const button = ({label, ...rest}, index) => {
  return (
    <Button key={index} {...rest}>
      {label}
    </Button>
  );
};

const buttonGroup = ({items, ...rest}) => {
  return (
    <ButtonGroup variant='outlined' size='small' {...rest}>
      {items.map(button)}
    </ButtonGroup>
  );
};

const descriptions = (props, i) => {
  return <Descriptions key={i} {...props} />;
};

const table = (props, i) => {
  return (
    <DataGridTable toolBarRender={false} overflowYauto={false} key={i} {...props} />
  );
};

const statistic = (props, i) => {
  return <Statistic key={i} {...props} />;
};

const masonry = ({items, ...rest}, i) => {
  return (
    <Masonry key={i} {...rest} spacing={1}>
      {items.map(renderField)}
    </Masonry>
  );
};

const tabsContent = (items, direction = 'column') => {
  return (
    <Stack
      spacing={2}
      direction={
        direction as 'row' | 'column' | 'row-reverse' | 'column-reverse'
      }
    >
      {items.map(renderField)}
    </Stack>
  );
};

const tabs = ({items, ...rest}, i) => {
  return (
    <Tabs
      key={i}
      {...rest}
      items={items.map(item => {
        return {
          ...item,
          content: tabsContent(item.content, item.direction),
        };
      })}
    />
  );
};

const panel = ({title, extra, content, direction, ...rest}, i) => {
  return (
    <Panel
      key={i}
      {...rest}
      title={title}
      extra={
        Array.isArray(extra) && extra.length > 0 ? (
          <Stack spacing={1} direction='row'>
            {extra.map((item, i) => {
              if (item.type === 'button') {
                return renderField(
                  {...item, size: 'small', variant: 'contained'},
                  i
                );
              }
              return renderField(item, i);
            })}
          </Stack>
        ) : null
      }
    >
      <Stack
        spacing={1}
        direction={
          direction as 'row' | 'column' | 'row-reverse' | 'column-reverse'
        }
      >
        {content.map(renderField)}
      </Stack>
    </Panel>
  );
};

const tag = (props, i) => {
  return <Tag key={i} {...props} />;
};

const tags = ({items}, i) => {
  return <Tags key={i}>{items.map((item, j) => tag(item, j))}</Tags>;
};

const divider = ({text, ...rest}, i) => {
  return (
    <Divider key={i} textAlign='left' {...rest}>
      {text}
    </Divider>
  );
};

const grid = ({spacing, itemsLayout, items}, i) => {
  return (
    <Grid container spacing={spacing || 1}>
      {items.map(({type, ...item}, i) => {
        return (
          <Grid key={i} item xs={12} {...(itemsLayout[i] || {})}>
            {renderField({type, ...item}, 0)}
          </Grid>
        );
      })}
    </Grid>
  );
};

const Tags = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  '& > *': {
    marginTop: '10px',
    marginRight: '10px',
  },
}));

const map = {
  select,
  button,
  buttonGroup,
  descriptions,
  table,
  statistic,
  masonry,
  tabs,
  panel,
  tag,
  tags,
  divider,
  grid,
};

export default function renderField({type, ...rest}, index?: number) {
  if (map[type]) {
    return map[type](rest, index);
  }
  return null;
}
