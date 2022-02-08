import React from 'react';

export interface HomeGridCardProps {
  title: React.ReactNode;
  extra?: React.ReactNode;
}

export interface WidgetHomeResourcesOverviewProps {
  title: React.ReactNode;
  items: ResourceListItemProps[];
  feedbackHint?: React.ReactNode;
}

interface CommonItem {
  label: string;
  value: string | number;
}

interface OverlayItem extends CommonItem {
  onClick?: (item: CommonItem) => void;
}

export interface ResourceListItemProps extends CommonItem {
  icon: React.ReactNode;
  onClick?: () => void;
  overlay?: {
    items: OverlayItem[];
    title?: string;
  };
}
