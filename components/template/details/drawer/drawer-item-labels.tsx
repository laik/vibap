import React from 'react';
import {DrawerBadge} from './drawer-badge';
import {DrawerItem, DrawerItemProps} from './drawer-item';

interface Props extends DrawerItemProps {
  labels: string[];
}

export function DrawerItemLabels(props: Props) {
  const {labels, ...itemProps} = props;
  if (!labels || !labels.length) {
    return null;
  }
  return (
    <DrawerItem {...itemProps}>
      {labels.map(label => (
        <DrawerBadge label={label} key={label} />
      ))}
    </DrawerItem>
  );
}
