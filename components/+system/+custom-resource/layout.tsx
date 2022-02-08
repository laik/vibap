import { computed } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';
import { apiManager, createSelfLink } from '../../../client';
import { storeables } from '../../../client/object-store-wrap';
import { DialAction, Panel, PanelProps } from '../../template';
import Notifications from '../../template/notification';
import { withRouter } from '../../withRouter';
import { Add } from './add-dialog';
import Details from './details';
import { Edit } from './edit-dialog';
import { CustomResource, customResourceApi, customResourceStore } from './store';

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
    name: 'workspace',
    header: '工作空间',
    defaultFlex: 1,
  },
  {
    name: 'custom',
    header: '资源格式',
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
@storeables(apiManager.getStores(['customresource']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '工作空间',
      field: 'workspace',
      type: 'text',
    },
  ];

  ref = [customResourceStore];

  @computed get title(): string {
    return '自定义数据结构';
  }

  @computed get isLoading(): boolean {
    return customResourceStore.isLoading;
  }

  @computed get allItems() {
    return customResourceStore.items;
  }

  @computed get selectedItem() {
    return customResourceStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: CustomResource) =>
      this.renderTableContents(item)
    );
  }

  delete = object => {
    customResourceStore
      .remove(object)
      .then(() => Notifications.ok(`${object.getName()} delete succeeded`))
      .catch(err => Notifications.error(`${object.getName()} delete ` + err));
  };

  patchDelete = () => {
    this.selected_list.map(item => this.delete(item.IObject));
    this.selected_objs = {};
  };

  @computed get dial(): DialAction[] {
    var items = [
      {
        key: 'add',
        title: '新增',
        icon: 'add',
        action: () => Add.open(),
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

  renderTableContents(item: CustomResource) {
    var custom: string = '';
    item.spec.custom_resource &&
      Object.entries(item.spec.custom_resource).forEach((value, key) => {
        custom += `${value[0]} : ${value[1]} `;
      });

    return {
      id: item.getId(),
      name: item.getName(),
      workspace: item.getWorkspace(),
      custom: custom,
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
                customResourceApi,
                cellProps.data.IObject.getName(),
                cellProps.data.IObject.getNs()
              ),
            },
          });
        },
      },
      {
        label: '编辑',
        onClick: () => Edit.open(cellProps.data.IObject),
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
        <Add />
        <Edit />
      </>
    );
  };
}

apiManager.registerViews(customResourceApi, {Details: Details});
