import {computed} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import {DialAction, Panel, PanelProps} from '../../template';
import Notifications from '../../template/notification';
import {withRouter} from '../../withRouter';
import {AddOperationDialog} from './add-dialog';
import OperationDetails from './details';
import {Operation, operationApi, operationStore} from './store';

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    defaultFlex: 1,
  },
  {
    name: 'name',
    header: '名称',
    defaultFlex: 1,
  },
  {
    name: 'op',
    header: '操作码',
    defaultFlex: 1,
  },
  {
    name: 'method',
    header: '方法',
    defaultFlex: 1,
  },
  {
    name: 'updatetime',
    header: '更新时间',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['operation']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '操作码',
      field: 'op',
      type: 'text',
    },
    {
      label: '方法',
      field: 'method',
      type: 'text',
    },
  ];

  @computed get title(): string {
    return '操作';
  }

  delete = object => {
    operationStore
      .remove(object)
      .then(() => Notifications.ok(`${object.getName()} delete succeeded`))
      .catch(err => Notifications.error(`${object.getName()} delete ` + err));
  };

  patchDelete = () => {
    this.selected_list.map(item => this.delete(item.IObject));
    this.selected_objs = {};
  };

  // table
  @computed get isLoading(): boolean {
    return operationStore.isLoading;
  }

  @computed get allItems() {
    return operationStore.items;
  }

  @computed get selectedItem() {
    return operationStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Operation) =>
      this.renderTableContents(item)
    );
  }

  @computed get dial(): DialAction[] {
    var items = [
      {
        key: 'add',
        title: '新增',
        icon: 'add',
        action: () => AddOperationDialog.open(),
      },
    ].concat(
      this.selected_list.length > 0
        ? [
            {
              key: 'delete',
              title: '删除',
              icon: 'delete',
              action: this.patchDelete,
            },
          ]
        : []
    );
    return items;
  }

  renderTableContents(item: Operation) {
    return {
      id: item.getId(),
      name: item.getName(),
      op: item.spec.op,
      method: item.spec.method,
      updatetime: item.getUpdateTime(),
      IObject: item,
    };
  }

  customRowContextMenu = cellProps => {
    return [
      {
        label: '详情',
        onClick: () => {
          this.props.router.push({
            query: {
              details: createSelfLink(
                operationApi,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '删除',
        onClick: () => this.delete(cellProps.data.IObject),
      },
    ];
  };

  dialog = () => {
    return (
      <>
        <AddOperationDialog />
      </>
    );
  };
}

apiManager.registerViews(operationApi, {Details: OperationDetails});
