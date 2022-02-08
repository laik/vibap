import {computed} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {providerStore} from '../+provider/store';
import {workspaceStore} from '../+workspace/store';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import Notifications from '../../template/notification';
import {DialAction, Panel, PanelProps} from '../../template/panel';
import {withRouter} from '../../withRouter';
import {AddDialog} from './add-license-dialog';
import LicenseDetails from './license.details';
import {License, licenseApi, licenseStore} from './license.store';

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
    name: 'vendor',
    header: '供应商',
    defaultFlex: 1,
  },
  {
    name: 'region',
    header: '地区',
    defaultFlex: 1,
  },
  {
    name: 'availablezone',
    header: '可用区',
    defaultFlex: 1,
  },
  {
    name: 'sshtype',
    header: 'ssh方式',
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
@storeables(apiManager.getStores(['license', 'provider', 'workspace']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '供应商',
      field: 'vendor',
      type: 'text',
    },
    {
      label: '地区',
      field: 'region',
      type: 'text',
    },
    {
      label: '可用区',
      field: 'availablezone',
      type: 'text',
    },
  ];

  componentDidMount(): void {
    // provider
    providerStore.loadAll();
    providerStore.watch();

    workspaceStore.loadAll();
    workspaceStore.watch();
  }

  componentWillUnmount(): void {
    providerStore.stop();
    workspaceStore.stop();
  }

  @computed get title(): string {
    return '许可';
  }

  delete = object => {
    licenseStore
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
    return licenseStore.isLoading;
  }

  @computed get allItems() {
    return licenseStore.items;
  }

  @computed get selectedItem() {
    return licenseStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: License) => this.renderTableContents(item));
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

  renderTableContents(item: License) {
    return {
      id: item.getId(),
      name: item.getName(),
      vendor: item.spec.vendor,
      region: item.spec.region,
      availablezone: item.spec.available_zone,
      sshtype: item.spec.ssh_type,
      key: item.spec.key,
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
                licenseApi,
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

apiManager.registerViews(licenseApi, {Details: LicenseDetails});
