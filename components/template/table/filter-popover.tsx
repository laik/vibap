import React, {useCallback, useState, useEffect} from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export type FieldType = 'text' | 'date' | 'radio';

export const comparisonEnum = {
  1: {label: '等于'},
  2: {label: '不等于'},
  3: {label: '包含'},
  4: {label: '不包含'},
  5: {label: '为空'},
  6: {label: '不为空'},
};

const comparisonMap = {
  text: [1, 2, 3, 4],
  date: [1, 2, 3, 4],
  radio: [1, 2],
};

export const comparisonCompute = {
  text_1: (target, value) => target === value,
  text_2: (target, value) => target !== value,
  text_3: (target: string, value) => target.includes(value),
  text_4: (target, value) => !target.includes(value),
  text_5: target => !target,
  text_6: target => !!target,
  radio_1: (target, value) => target === value,
  radio_2: (target, value) => target !== value,
  radio_3: (target: string, value) => target.includes(value),
  radio_4: (target, value) => !target.includes(value),
};

export const comparisonFormat = {
  text: value => value,
  date: value => value,
  radio: (value, f) => {
    if (Array.isArray(f?.options)) {
      return f?.options?.find(item => item.value === value)?.label;
    }
    return value;
  },
};

const comparisonDefaultValue = {
  text: '',
  date: [dayjs().startOf('day').format(), dayjs().endOf('day').format()],
  radio: '',
};
export interface Field {
  label: string;
  field: string;
  type: FieldType;
  options?: {
    label: string;
    value: string;
  }[];
}

interface Props {
  fields: Field[];
  values: any[];
  onSearch: (values: any[]) => void;
}

export const FilterPopover: React.FC<Props> = ({fields, values, onSearch}) => {
  const [valueStorage, setValueStorage] = useState(values);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  useEffect(() => {
    setValueStorage(values);
  }, [values]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const onAdd = useCallback(() => {
    if (fields[0]) {
      setValueStorage(pre => [
        ...pre,
        {
          field: fields[0].field,
          type: fields[0].type,
          value: comparisonDefaultValue[fields[0].type],
          condition: comparisonMap[fields[0].type][0],
        },
      ]);
    }
  }, [fields]);

  const onRemove = useCallback(index => {
    setValueStorage(pre => pre.filter((item, i) => i !== index));
  }, []);

  const onChange = useCallback((data, index) => {
    setValueStorage(pre => {
      pre[index] = {...pre[index], ...data};
      return [...pre];
    });
  }, []);

  const startSearch = useCallback(() => {
    onSearch(valueStorage);
    handleClose();
  }, [onSearch, valueStorage]);

  const button = () => {
    return (
      <Button
        startIcon={<FilterAltOutlinedIcon />}
        onClick={handleClick}
      >
        <span>
          {valueStorage?.length > 0 && (
            <span style={{marginRight: 4}}>{valueStorage?.length}</span>
          )}
          <span>组合筛选</span>
        </span>
      </Button>
    );
  }

  const popover = () => {
    return (
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div style={{padding: 20, width: 520}}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 4,
            }}
          >
            <div
              style={{
                fontWeight: 400,
                margin: '3px 0',
                color: '#646a73',
              }}
            >
              设置筛选条件
            </div>
          </div>
          <div>
            {valueStorage.map((item, i) => (
              <FilterCondition
                key={`${item.field}-${i}`}
                index={i}
                fields={fields}
                onChange={onChange}
                onRemove={onRemove}
                {...item}
              />
            ))}
          </div>
          <Stack direction='row' spacing={1} sx={{marginTop: '8px'}}>
            <Button
              size='small'
              variant='text'
              startIcon={<AddOutlinedIcon />}
              onClick={onAdd}
            >
              添加条件
            </Button>
            <Button size='small' variant='contained' onClick={startSearch}>
              搜索
            </Button>
          </Stack>
        </div>
      </Popover>
    );
  }

  return <>{button()}{popover()}</>;
};

interface FilterConditionProps {
  index: number;
  fields: Field[];
  field: string;
  type: FieldType;
  value: any;
  condition: number;
  onChange: (
    data: {field?: string; value?: any; condition?: number; type?: FieldType},
    index: number
  ) => void;
  onRemove: (index: number) => void;
}

export const FilterCondition: React.FC<FilterConditionProps> = props => {
  const {fields, field, condition, type, value, index, onChange, onRemove} =
    props;
  const cur = fields.find(item => item.field === field);

  return (
    <div
      style={{
        display: 'flex',
        marginBottom: 4,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          width: 156,
        }}
      >
        <Select
          value={field}
          onChange={event => {
            const v = event.target.value as string;
            const f = fields.find(item => item.field === v);
            onChange(
              {
                field: f.field,
                type: f.type,
                value: comparisonDefaultValue[f.type],
                condition: comparisonMap[f.type]?.[0],
              },
              index
            );
          }}
          size='small'
          sx={{width: 120}}
        >
          {fields.map((item, i) => (
            <MenuItem value={item.field} key={i}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Select
          value={condition}
          onChange={event => {
            onChange(
              {
                condition: event.target.value as number,
              },
              index
            );
          }}
          size='small'
          sx={{mr: 1, width: 95}}
        >
          {(() => {
            if (comparisonMap?.[type]?.length > 0) {
              return comparisonMap[type].map((item, i) => (
                <MenuItem key={i} value={item}>
                  {comparisonEnum[item]?.label || ''}
                </MenuItem>
              ));
            }
            return null;
          })()}
        </Select>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexGrow: 1,
          width: 0,
        }}
      >
        <FilterField
          field={cur}
          value={value}
          onChange={value => {
            onChange({value}, index);
          }}
        />
      </div>
      <div
        style={{
          marginLeft: 'auto',
          cursor: 'pointer',
          flexShrink: 0,
          width: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CloseOutlinedIcon
          fontSize='small'
          onClick={() => {
            onRemove(index);
          }}
        />
      </div>
    </div>
  );
};

interface FilterFieldProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

const FilterField: React.FC<FilterFieldProps> = ({
  field: {type, options},
  value,
  onChange,
}) => {
  switch (type) {
    case 'text':
      return (
        <TextField
          size='small'
          variant='outlined'
          value={value}
          onChange={event => {
            onChange(event.target.value as string);
          }}
          fullWidth
        />
      );
    case 'radio':
      return (
        <Select
          value={value}
          onChange={event => {
            const v = event.target.value as string;
            onChange(v);
          }}
          size='small'
          fullWidth
        >
          {options?.length > 0 &&
            options.map((item, i) => (
              <MenuItem value={item.value} key={i}>
                {item.label}
              </MenuItem>
            ))}
        </Select>
      );
    default:
      return null;
  }

};
