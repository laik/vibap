import React from 'react';
import styled from '@mui/system/styled';
import MuiTabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

export interface TabsProps {
  items: {label: string; content: JSX.Element}[];
  showType?: 'line' | 'radio';
  value?: any;
  onChange?: () => void;
}

export const Tabs: React.FC<TabsProps> = ({showType = 'line', items}) => {
  // TODO: value 和 onChange 需要移动到外面，使组件受控
  const [value, setValue] = React.useState(0);

  const onChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Box>
      <TabsHead>
        {(() => {
          if (showType === 'line') {
            return (
              <MuiTabs
                value={value}
                onChange={onChange}
                variant='scrollable'
                scrollButtons='auto'
                // aria-label='scrollable auto tabs example'
              >
                {items.map((item, i) => (
                  <Tab key={i} label={item.label} />
                ))}
              </MuiTabs>
            );
          } else if (showType === 'radio') {
            return (
              <FormControl component='fieldset'>
                <RadioGroup
                  row
                  value={value}
                  onChange={e => {
                    onChange(null, Number(e.target.value));
                  }}
                >
                  {items.map((item, i) => (
                    <FormControlLabel
                      key={i}
                      value={i}
                      control={<Radio />}
                      label={item.label}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            );
          }
        })()}
      </TabsHead>
      <TabsMain>
        {items.find((item, i) => i === value)?.content || null}
      </TabsMain>
    </Box>
  );
};

const TabsHead = styled('div')(({theme}) => ({
  backgroundColor: '#fff',
  padding: 12,
  paddingBottom: 0,
}));

const TabsMain = styled('div')(({theme}) => ({
  backgroundColor: '#fff',
  padding: 12,
}));
