import ReactDataGrid from '@inovua/reactdatagrid-community';
import '@inovua/reactdatagrid-community/base.css';
import '@inovua/reactdatagrid-community/index.css';
import '@inovua/reactdatagrid-community/theme/blue-light.css';
import {
  TypeCellProps,
  TypeColumn,
  TypeComputedProps,
  TypeDataSource,
  TypeEditInfo,
  TypeFilterValue,
  TypeRowProps,
  TypeRowSelection,
  TypeSortInfo,
} from '@inovua/reactdatagrid-community/types';
import {TypeOnSelectionChangeArg} from '@inovua/reactdatagrid-community/types/TypeDataGridProps';
import React, {MutableRefObject, useEffect, useState} from 'react';

export type TypeGridPublicAPI = any;

const i18n = Object.assign({}, ReactDataGrid.defaultProps.i18n, {
  pageText: '',
  ofText: '/',
  perPageText: '展示',
  showingText: '条',
  clearAll: '清除所有',
  clear: '清除',
  showFilteringRow: '显示过滤行',
  hideFilteringRow: '隐藏过滤行',
  enable: '开启',
  disable: '禁用',
  sortAsc: '正序',
  sortDesc: '倒序',
  unsort: '取消排序',
  group: '组',
  ungroup: '取消分组',
  lockStart: '开始锁定',
  lockEnd: '结束锁定',
  unlock: '解锁',
  columns: '列',
  contains: '包含',
  startsWith: '以...开始',
  endsWith: '以...结束',
  notContains: '不包含',
  inlist: '列入',
  notinlist: '不在名单上',
  neq: '不相等',
  inrange: '在范围内',
  notinrange: '不在范围内',
  eq: '相等',
  notEmpty: '非空',
  empty: '空',
  lt: '小于',
  lte: '小于等于',
  gt: '大于',
  gte: '大于等于',
  before: '之前',
  beforeOrOn: '之前或之后',
  afterOrOn: '之后或开启',
  after: '之后',
  start: '开始',
  end: '结尾',
  dragHeaderToGroup: '拖动标题到组',
  noRecords: '无记录',
});

export const defaultTheme = 'blue-light';

export type Theme =
  | 'default-light'
  | 'default-dark'
  | 'amber-light'
  | 'amber-dark'
  | 'blue-light'
  | 'blue-dark'
  | 'green-light'
  | 'green-dark'
  | 'pink-light'
  | 'pink-dark';

export interface ThemeInterface {
  [key: string]: Theme;
}

export const Themes: ThemeInterface = {
  '黄-白色主题': 'amber-light',
  '黄-黑色主题': 'amber-dark',
  '蓝-白色主题': 'blue-light',
  '蓝-黑色主题': 'blue-dark',
  '绿-白色主题': 'green-light',
  '绿-黑色主题': 'green-dark',
  '粉-白色主题': 'pink-light',
  '粉-黑色主题': 'pink-dark',
};

export const gridStyle = {minHeight: 720};

type TypeExpandColumn = TypeColumn & {
  valueType?: 'tag' | 'select' | 'label';
  valueEnum?: {
    [key in string]: {
      text: string;
      color?: string;
      /** 预设 "success" | "error" | "default" | "processing" | "warning" */
      status?: string;
    };
  };
};

export interface DataGridProps {
  columns: TypeExpandColumn[];
  dataSource: TypeDataSource;
  idProperty?: '';
  theme?: Theme;
  loading?: boolean;
  selected?: TypeRowSelection;
  renderRowContextMenu?: (
    menuProps: any,
    details: {
      rowProps: TypeRowProps;
      cellProps: TypeCellProps;
      grid: TypeGridPublicAPI;
      computedProps: TypeComputedProps;
      computedPropsRef: MutableRefObject<TypeComputedProps>;
    }
  ) => any;
  onReady?: (computedPropsRef: any) => void;
  onCellClick?: (event: MouseEvent, cellProps: TypeCellProps) => void;
  onRowClick?: (rowProps: TypeRowProps, event: MouseEvent) => void;
  onRowContextMenu?: (rowProps: TypeRowProps, event: MouseEvent) => void;
  handle?: (gridApiRef: MutableRefObject<TypeComputedProps>) => void;
  onSelectionChange?: (config: TypeOnSelectionChangeArg) => void;
  onEditComplete?: (editInfo: TypeEditInfo) => void;
  onEditValueChange?: (editInfo: TypeEditInfo) => void;
  autoFocusOnEditComplete?: boolean;
  defaultFilterValue?: TypeFilterValue;
  style?: {[key: string]: string | number};
  editable?: boolean;
  defaultLimit?: number;
  enableSelection?: boolean;
  activeCell?: [number, number];
  enableFiltering?: boolean;
  sortable?: boolean;
  toolBarRender?: boolean;
  checkboxColumn?: boolean;
  showZebraRows?: boolean;
  // sort
  defaultSortInfo?: TypeSortInfo;
  // pagation
  pagination?: boolean;
  pageSizes?: number[];
  limit?: number;
  skip?: number;
  onLimitChange?: (limit: number) => void;
  onSkipChange?: (skip: number) => void;
}

export function DataGrid(props: DataGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);

  if (mounted) {
    switch (props.theme) {
      case 'default-light':
        require(`@inovua/reactdatagrid-community/theme/blue-light.css`);
      case 'default-dark':
        require(`@inovua/reactdatagrid-community/theme/default-dark.css`);
      case 'amber-light':
        require(`@inovua/reactdatagrid-community/theme/amber-light.css`);
      case 'amber-dark':
        require(`@inovua/reactdatagrid-community/theme/amber-dark.css`);
      case 'blue-light':
        require(`@inovua/reactdatagrid-community/theme/blue-light.css`);
      case 'blue-dark':
        require(`@inovua/reactdatagrid-community/theme/blue-dark.css`);
      case 'green-light':
        require(`@inovua/reactdatagrid-community/theme/green-light.css`);
      case 'green-dark':
        require(`@inovua/reactdatagrid-community/theme/green-dark.css`);
      case 'pink-light':
        require(`@inovua/reactdatagrid-community/theme/pink-light.css`);
      case 'pink-dark':
        require(`@inovua/reactdatagrid-community/theme/pink-dark.css`);
    }
  }

  return (
    <ReactDataGrid
      key={'data-grid'}
      i18n={i18n}
      theme={defaultTheme}
      enableKeyboardNavigation={false}
      showCellBorders={'horizontal'}
      updateMenuPositionOnColumnsChange={true} // Columns菜单定位
      virtualized={true} // 虚拟滚动
      virtualizeColumns={true}
      columnUserSelect
      {...props}
    />
  );
}

DataGrid.defaultProps = {
  idProperty: 'id',
  dataSource: [],
  theme: defaultTheme,
  editable: false,
  autoFocusOnEditComplete: true,
  // style: gridStyle,
  sortable: false,
  checkboxColumn: true,
  showZebraRows: false,
};
