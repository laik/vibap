import {computed} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import {DialAction, Panel, PanelProps} from '../../template/panel';
import {withRouter} from '../../withRouter';
import {AddDialog} from './add-dialog';
import RegionDetails from './details';
import {Region, regionApi, regionStore as store} from './store';

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
    name: 'localname',
    header: '本地名称',
    defaultFlex: 1,
  },
  {
    name: 'provider',
    header: '供应商',
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
@storeables(apiManager.getStores(['region']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '本地名称',
      field: 'localname',
      type: 'text',
    },
    {
      label: '供应商',
      field: 'provider',
      type: 'text',
    },
  ];

  @computed get title(): string {
    return '地区';
  }

  delete = object => {
    store
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
    return store.isLoading;
  }

  @computed get allItems() {
    return store.items;
  }

  @computed get selectedItem() {
    return store.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Region) => this.renderTableContents(item));
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

  renderTableContents(item: Region) {
    const userConfig = apiManager.userConfig;
    return {
      id: item.getId(),
      provider:
        userConfig.providers[item.getNamespace()].localName +
        ' ' +
        `(${item.getNamespace()})`,
      name: item.getName(),
      localname: item.spec.local_name,
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
                regionApi,
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

apiManager.registerViews(regionApi, {Details: RegionDetails});
