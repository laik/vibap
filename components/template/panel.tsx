import {
  TypeCellProps,
  TypeComputedProps,
  TypeFilterValue,
  TypeRowProps,
  TypeRowSelection,
  TypeSortInfo,
} from '@inovua/reactdatagrid-community/types';
import {TypeOnSelectionChangeArg} from '@inovua/reactdatagrid-community/types/TypeDataGridProps';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import {computed, observable, toJS} from 'mobx';
import {NextRouter} from 'next/router';
import React, {MutableRefObject} from 'react';
import {
  AsyncSearchProps,
  ConfirmBox,
  DataGridTable,
  TypeGridPublicAPI,
} from './table';

export type DialAction = {
  key: string;
  title: string;
  icon: React.ReactNode | string;
  action: () => void;
};
interface RouterProps {
  router: NextRouter;
}

export interface PanelProps extends RouterProps {}

export class Panel<P extends PanelProps> extends React.Component<P> {
  @observable selected_objs: TypeRowSelection = {};
  @observable columnsWithOperationMenu = [];
  @observable rowsWithOperationMenu = [];

  // 分页
  @observable static PanelLimit = 20;
  @observable static PanelSkip = 0;

  filterColumns: any[] = [];
  moreMenuButton: boolean = true; // 更多操作按钮
  tableSingleChoice: boolean = false; // 表格数据单选
  searchInput: boolean = true; // 搜索框
  showThemes: boolean = false; // 主题选项
  showOptions: boolean = true; // 表格功能选项
  showCardBackground: boolean = true; // 卡片背景 (列功能菜单如果出现展示项不全，可关闭)
  showExport: boolean = false; // 展示导出功能按钮
  dataGridExpandStyle: {[key: string]: string | number} = {}; // 表格样式

  asyncSearch: AsyncSearchProps | null = null;

  // 行为确认框
  okBox: boolean = true;
  okBoxKeys = ['删除', '批量删除']; // 确认框关键词

  // 开启分页
  pagination: boolean = true;

  // 排序
  defaultSortInfo = null;

  @computed get limit() {
    return Panel.PanelLimit;
  }
  @computed get skip() {
    return Panel.PanelSkip;
  }
  onLimitChange = (limit: number) => {
    Panel.PanelLimit = limit;
  };
  onSkipChange = (skip: number) => {
    Panel.PanelSkip = skip;
  };
  onAsyncSearchChange = (data: {field: string; value: string}) => {
    console.log('异步搜索', data);
  };

  // --- > 选择项
  @computed get selected_list() {
    return Object.values(toJS(this.selected_objs));
  }

  // --- > 标题
  @computed get title() {
    return '';
  }

  // ---> 搜索框
  filter = () => {
    return null;
  };

  // --- > 表格 https://reactdatagrid.io/docs/filtering#filtering
  filterValue: TypeFilterValue = [];

  // https://dreactdatagrid.io/docs/api-reference#props-columns
  @computed get columns() {
    return [];
  }

  @computed get rows() {
    return [];
  }

  @computed get isLoading(): boolean {
    return false;
  }

  @computed get dataGridStyle() {
    return Object.assign({height: '100%'}, this.dataGridExpandStyle);
  }

  // 顶栏扩展 (按钮 搜索框 ...)
  extends = gridRef => {
    return null;
  };

  // 右键 表格菜单
  renderRowContextMenu = (
    menuProps: any,
    details: {
      rowProps: TypeRowProps;
      cellProps: TypeCellProps;
      grid: TypeGridPublicAPI;
      computedProps: TypeComputedProps;
      computedPropsRef: MutableRefObject<TypeComputedProps>;
    }
  ) => {};

  customRowContextMenu = cellProps => {
    return [];
  };

  onSelectionChange = (config: TypeOnSelectionChangeArg) => {
    this.selected_objs = config.selected;
  };

  sortByPreference = () => {
    // 默认首选项为排序项
    if (this.defaultSortInfo) return;
    let sortName = '';
    if (this.columns.length > 0 && this.columns[0].name !== 'id') {
      sortName = this.columns[0].name;
    } else if (this.columns.length > 1) {
      sortName = this.columns[1].name;
    }
    this.defaultSortInfo = sortName ? [{name: sortName, dir: -1}] : null;
  };

  datagrid = () => {
    const newUrl = new URL(window.location.href);
    const defaultSearchText = newUrl.searchParams.get('search') || '';

    this.sortByPreference();

    return (
      <DataGridTable
        cardBackground={this.showCardBackground} // 背景卡片
        singleChoice={this.tableSingleChoice} // 单选 多选
        moreMenuButton={this.moreMenuButton} // 菜单更多操作 more button
        title={this.title}
        okBox={this.okBox}
        okBoxKeys={this.okBoxKeys}
        loading={this.isLoading}
        searchInput={this.searchInput}
        showThemes={this.showThemes}
        showOptions={this.showOptions}
        showExport={this.showExport}
        defaultFilterValue={this.filterValue}
        columns={this.columns}
        filterColumns={this.filterColumns}
        dataSource={this.rows}
        selected={this.selected_objs}
        onSelectionChange={this.onSelectionChange}
        renderRowContextMenu={this.renderRowContextMenu}
        customRowContextMenu={this.customRowContextMenu}
        extends={gridRef => {
          return this.extends(gridRef);
        }}
        style={this.dataGridStyle}
        // sort
        defaultSortInfo={this.defaultSortInfo as TypeSortInfo}
        // pagation
        pagination={this.pagination}
        limit={this.limit}
        skip={this.skip}
        onLimitChange={this.onLimitChange}
        onSkipChange={this.onSkipChange}
        asyncSearch={this.asyncSearch}
        onAsyncSearchChange={this.onAsyncSearchChange}
        defaultSearchText={defaultSearchText}
      />
    );
  };

  // --- > 拨号框
  @computed get dial(): DialAction[] {
    return [];
  }

  icon = (icon: string | React.ReactNode) => {
    if (typeof icon === 'string') {
      return <Icon baseClassName='material-icons-outlined'>{icon}</Icon>;
    }
    return icon;
  };

  speeddial = () => {
    return this.dial.length > 0 ? (
      <SpeedDial
        ariaLabel='SpeedDial'
        sx={{position: 'fixed', bottom: '3vw', right: '5vw'}}
        icon={<SpeedDialIcon icon={<BlurOnIcon />} openIcon={<EditIcon />} />}
      >
        {this.dial.map(item => {
          let action = item.action;
          if (this.okBoxKeys.indexOf(item.title) !== -1) {
            // 确认框操作
            action = () => ConfirmBox.open(item.title, item.action);
          }
          return (
            <SpeedDialAction
              key={item.key}
              icon={this.icon(item.icon)}
              tooltipTitle={item.title}
              onClick={action}
            />
          );
        })}
      </SpeedDial>
    ) : (
      false
    );
  };

  // --- > 注册操作模态框
  dialog = (): any => {
    return null;
  };

  render() {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            height: 'calc(100vh - var(--vale-nav-height))',
            overflow: 'hidden',
          }}
        >
          <Box
            component='main'
            sx={{
              flexGrow: 1,
              display: 'flex',
              height: 'calc(100vh - 80px)',
              overflowY: 'auto',
            }}
          >
            {this.datagrid()}
          </Box>
        </Box>
        {this.speeddial()}
        {this.dialog()}
        <ConfirmBox />
      </>
    );
  }
}
