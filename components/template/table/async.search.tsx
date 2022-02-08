import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Select, {SelectChangeEvent} from '@mui/material/Select';

export interface AsyncSearchProps {
  field: string;
  options?: {label: string; value: string}[];
  onAsyncSearchChange?: (data: {field: string; value: string}) => void;
}

export const AsyncSearch: React.FC<AsyncSearchProps> = ({
  field: defaultField,
  options,
  onAsyncSearchChange,
}) => {
  const [field, setField] = React.useState(defaultField);
  const [text, setText] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setField(event.target.value as string);
  };

  return (
    <Stack spacing={1} direction='row' sx={{alignItems: 'center'}}>
      {Array.isArray(options) && (
        <Box sx={{minWidth: 120}}>
          <FormControl size='small' fullWidth>
            <InputLabel id='dimension-label'>字段</InputLabel>
            <Select
              labelId='dimension-label'
              id='dimension-select'
              value={field}
              label='字段'
              onChange={handleChange}
            >
              {options.map((item, i) => (
                <MenuItem key={i} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      <TextField
        size='small'
        id='dimension-text'
        label='搜索内容'
        variant='outlined'
        value={text}
        onChange={e => {
          setText(e.target.value);
        }}
        onKeyUp={e => {
          if (e.key === 'Enter' && typeof onAsyncSearchChange === 'function') {
            onAsyncSearchChange({field, value: text});
          }
        }}
      />
    </Stack>
  );
};
