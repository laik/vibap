import React from 'react';
import styled from '@mui/system/styled';

export interface StatisticProps {
  label: React.ReactNode;
  value: React.ReactNode;
}

export const Statistic: React.FC<StatisticProps> = ({label, value}) => {
  return (
    <StatisticComp>
      <StatisticLabel>{label}</StatisticLabel>
      <StatisticContent>
        <StatisticValue>{value}</StatisticValue>
      </StatisticContent>
    </StatisticComp>
  );
};

const StatisticComp = styled('div')(({theme}) => ({
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
  color: 'rgba(0,0,0,.85)',
  fontSize: '14px',
  fontVariant: 'tabular-nums',
  lineHeight: '1.5715',
  listStyle: 'none',
  fontFeatureSettings: '"tnum","tnum"',
}));

const StatisticLabel = styled('div')(({theme}) => ({
  marginBottom: '4px',
  color: 'rgba(0,0,0,.45)',
  fontSize: '14px',
}));

const StatisticContent = styled('div')(({theme}) => ({
  color: 'rgba(0,0,0,.85)',
  fontSize: '24px',
}));

const StatisticValue = styled('span')(({theme}) => ({
  display: 'inline-block',
  direction: 'ltr',
}));
