import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {apiManager, createSelfLink} from '../../../client';
import {storeables} from '../../../client/object-store-wrap';
import {DialAction, Panel, PanelProps} from '../../template';
import Notifications from '../../template/notification';
import {withRouter} from '../../withRouter';
import ServiceDetails from './services.details';
import {Service, serviceApi, serviceStore} from './services.store';

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
    name: 'type',
    header: '类型',
    defaultFlex: 1,
  },
  {
    name: 'clusterIP',
    header: '虚拟 IP',
    defaultFlex: 1,
  },
  {
    name: 'ports',
    header: '端口',
    defaultFlex: 1,
  },
  {
    name: 'externalIP',
    header: '外部 IP',
    defaultFlex: 1,
  },
  {
    name: 'selector',
    header: '选择器',
    defaultFlex: 1,
  },
  {
    name: 'age',
    header: 'age',
    defaultFlex: 1,
  },
  {
    name: 'status',
    header: '状态',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['services']))
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
    {
      label: '类型',
      field: 'type',
      type: 'text',
    },
    {
      label: '虚拟 IP',
      field: 'clusterIP',
      type: 'text',
    },
    {
      label: '端口',
      field: 'ports',
      type: 'text',
    },
    {
      label: '外部 IP',
      field: 'externalIP',
      type: 'text',
    },
    {
      label: '状态',
      field: 'status',
      type: 'radio', // TODO: 改为下拉列表
      options: [
        {
          label: 'Active',
          value: 'Active',
        },
        {
          label: 'Pending',
          value: 'Pending',
        },
      ],
    },
  ];
  @computed get title(): string {
    return 'Services';
  }

  delete = object => {
    serviceStore
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
    return serviceStore.isLoading;
  }

  @computed get allItems() {
    return serviceStore.items;
  }

  @computed get selectedItem() {
    return serviceStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Service) => this.renderTableContents(item));
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

  renderPorts = (item: Service) => {
    let portStr: string = '';
    item.getPorts().map(port => {
      let thisPort = '';
      if (port.port == port.targetPort) {
        thisPort = `${port.port}/${port.protocol}`;
      } else {
        thisPort = `${port.port}:${port.targetPort}/${port.protocol}`;
      }
      if (portStr == ``) {
        portStr = thisPort;
        return;
      }
      portStr = `${portStr},${thisPort}`;
    });
    return portStr;
  };

  renderExternalIP = (item: Service) => {
    let ips: string = '';
    item.getExternalIps().map(ip => {
      if (ips == '') {
        ips = ip;
        return;
      }
      ips = `${ips}/${ip}`;
    });
    if (ips == '') {
      return '-';
    }
    return ips;
  };

  renderTableContents(item: Service) {
    return {
      id: item.getId(),
      name: item.getName(),
      namespace: item.getNs(),
      type: item.getType(),
      clusterIP: item.getClusterIp(),
      ports: this.renderPorts(item),
      externalIP: this.renderExternalIP(item),
      selector: item.getSelector(),
      status: item.getStatus(),
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
                serviceApi,
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

apiManager.registerViews(serviceApi, {Details: ServiceDetails});
