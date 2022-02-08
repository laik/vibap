import {computed} from 'mobx';
import {observer} from 'mobx-react';
import {apiManager, createSelfLink} from '../../../client';
import {OwnerReferences} from '../../../client/kube/kube-object';
import {storeables} from '../../../client/object-store-wrap';
import {DialAction, Panel, PanelProps} from '../../template';
import Notifications from '../../template/notification';
import {withRouter} from '../../withRouter';
import PodDetails from './pods.details';
import {IPodContainerStatus, Pod, podApi, podStore} from './pods.store';

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
    name: 'containers',
    header: '容器',
    defaultFlex: 1,
  },
  {
    name: 'restarts',
    header: '重启次数',
    defaultFlex: 1,
  },
  {
    name: 'controlled',
    header: '控制器',
    defaultFlex: 1,
  },
  {
    name: 'node',
    header: '节点',
    defaultFlex: 1,
  },
  {
    name: 'qos',
    header: 'QoS',
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
  {
    name: 'provider',
    header: '供应商',
    defaultFlex: 1,
  },
  {
    name: 'region',
    header: '区域',
    defaultFlex: 1,
  },
  {
    name: 'az',
    header: '可用区',
    defaultFlex: 1,
  },
  {
    name: 'cluster',
    header: '集群',
    defaultFlex: 1,
  },
];

@withRouter
@observer
@storeables(apiManager.getStores(['pods']))
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
      label: '容器',
      field: 'containers',
      type: 'text',
    },
    {
      label: '供应商',
      field: 'provider',
      type: 'text',
    },
    {
      label: '区域',
      field: 'region',
      type: 'text',
    },
    {
      label: '命名空间',
      field: 'namespace',
      type: 'text',
    },
    {
      label: '可用区',
      field: 'az',
      type: 'text',
    },
    {
      label: '集群',
      field: 'cluster',
      type: 'text',
    },
  ];
  @computed get title(): string {
    return 'Pods';
  }

  delete = object => {
    podStore
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
    return podStore.isLoading;
  }

  @computed get allItems() {
    return podStore.items;
  }

  @computed get selectedItem() {
    return podStore.getAllByNs([]);
  }

  @computed get columns() {
    return columns;
  }

  @computed get rows() {
    return this.allItems.map((item: Pod) => this.renderTableContents(item));
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

  handleWebShell = async (
    namespace: string,
    pod: string,
    container: string,
    shellType: string,
    cluster: string
  ) => {
    const {terminalStore} = await import(
      '../../template/dock/terminal/terminal.store'
    );
    terminalStore.startTerminal(namespace, pod, container, shellType, cluster, {
      newTab: true,
    });
  };

  renderContainers = (item: Pod) => {
    //TODO: 容器数量渲染
    const containerStatus: IPodContainerStatus[] = item.getContainerStatuses();
    let containers: string = '';

    for (let index = 0; index < containerStatus.length; index++) {
      const thisContainer = containerStatus[index];
      let name: string = item.spec.containers[index]?.name;

      Object.keys(thisContainer.state).forEach(prop => {
        if (containers == '') {
          name = `${name}(${prop})`;
          containers = name;
          return;
        }
        name = `${name}(${prop})`;
        containers = `${containers},${name}`;
      });
    }
    return containers;
  };

  renderTableContents(item: Pod) {
    const ownerReferences: OwnerReferences[] = item.getOwnerReferences();

    let controlled: string = '';
    if (ownerReferences.length > 0) {
      controlled = ownerReferences[0]?.kind;
    }

    return {
      id: item.getId(),
      name: item.getName(),
      namespace: item.getNs(),
      area: item.metadata.area,
      containers: this.renderContainers(item),
      restarts: item.getRestartsCount(),
      node: item.getNodeName(),
      qos: item.getQosClass(),
      controlled: controlled,
      age: item.getAge(),
      status: item.getStatus(),
      // default field
      provider: item.getProvider(),
      region: item.getRegion(),
      az: item.getAz(),
      cluster: item.getCluster(),
      //
      IObject: item,
    };
  }

  customRowContextMenu = cellProps => {
    let items = [
      {
        label: '详情',
        onClick: () => {
          this.props.router.push({
            query: {
              details: createSelfLink(
                podApi,
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

    const containerStatus: IPodContainerStatus[] =
      cellProps.data.IObject.getContainerStatuses();
    containerStatus.map(item =>
      items.push({
        label: `Terminal - ${item.name || cellProps.data.IObject.getName()}`,
        onClick: () => {
          this.handleWebShell(
            cellProps.data.IObject.getNs(),
            cellProps.data.IObject.getName(),
            item.name || cellProps.data.IObject.getName(),
            'default',
            'default'
          );
        },
      })
    );
    return items;
  };
}

apiManager.registerViews(podApi, {Details: PodDetails});
