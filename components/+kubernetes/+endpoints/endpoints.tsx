import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import {DialAction, Panel, PanelProps} from '../../template';
import Notifications from '../../template/notification';
import {withRouter} from '../../withRouter';
import EndpointsDetails from './endpoints.details';
import {Endpoints, endpointsApi, endpointStore} from './endpoints.store';

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
    name: 'namespace',
    header: '命名空间',
    defaultFlex: 1,
  },
  {
    name: 'endpoints',
    header: 'Endpoints',
    defaultFlex: 1,
  },
  {
    name: 'age',
    header: 'age',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['endpoints']))
export default class Layout extends Panel<PanelProps> {
  filterColumns = [
    {
      label: '名称',
      field: 'name',
      type: 'text',
    },
    {
      label: '命名空间',
      field: 'namespace',
      type: 'text',
    },
  ];

  @computed get title(): string {
    return 'Endpoints';
  }

  delete = object => {
    endpointStore
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
    return endpointStore.isLoading;
  }

  @computed get allItems() {
    return endpointStore.items;
  }

  @computed get selectedItem() {
    return endpointStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Endpoints) =>
      this.renderTableContents(item)
    );
  }

  @computed get dial(): DialAction[] {
    var items = [].concat(
      this.selected_list.length
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

  renderTableContents(item: Endpoints) {
    let endpoints = '';
    item.getEndpointSubsets().map(endpoint => {
      endpoint.addresses.map(address => {
        endpoint.ports.map(port => {
          const thisAddress = `${address.ip}:${port.port}`;
          if (endpoints == '') {
            endpoints = thisAddress;
            return;
          }
          endpoints = `${endpoints}, ${thisAddress}`;
        });
      });
    });

    return {
      id: item.getId(),
      name: item.getName(),
      namespace: item.getNs(),
      endpoints: endpoints,
      age: item.getAge(),
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
                endpointsApi,
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
}

apiManager.registerViews(endpointsApi, {Details: EndpointsDetails});
