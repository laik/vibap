import {computed} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import {DialAction, Panel, PanelProps} from '../../template/panel';
import {withRouter} from '../../withRouter';
import {AddDialog} from './add-dialog';
import WorkspaceDetails from './details';
import {Workspace, workspaceApi, workspaceStore} from './store';

const columns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
  },
  {
    name: 'name',
    header: '名称',
    defaultFlex: 1,
  },
  {
    name: 'tenant',
    header: '租户',
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
@storeables(apiManager.getStores(['workspace']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '租户',
      field: 'tenant',
      type: 'text',
    },
  ];
  
  @computed get title(): string {
    return '工作空间';
  }

  delete = object => {
    workspaceStore
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
    return workspaceStore.isLoading;
  }

  @computed get allItems() {
    return workspaceStore.items;
  }

  @computed get selectedItem() {
    return workspaceStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Workspace) =>
      this.renderTableContents(item)
    );
  }

  @computed get dial(): DialAction[] {
    var items = [
      {
        key: 'add',
        title: '新增',
        icon: 'add',
        action: () => AddDialog.open(),
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
  renderTableContents(item: Workspace) {
    return {
      id: item.getId(),
      name: item.getName(),
      tenant: item.getWorkspace(),
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
                workspaceApi,
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
        <AddDialog />
      </>
    );
  };
}

apiManager.registerViews(workspaceApi, {Details: WorkspaceDetails});
