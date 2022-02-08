import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { computed } from 'mobx';
import { observer } from 'mobx-react';
import { withRouter } from '../../withRouter';
import { customResourceStore } from '../../+system/+custom-resource/store';
import Notifications from '../../template/notification';
import { DialAction, Panel, PanelProps } from '../../template/panel';
import { downloadBlob } from '../sheets/csv';
import { crm, CustomData } from './store';

interface column {
  name: string;
  header: string;
  defaultFlex?: number;
  type?: string;
}

const defaultColumns = [
  {
    name: 'id',
    header: 'Id',
    defaultVisible: false,
    type: 'number',
    editable: false,
  },
  {
    name: 'name',
    header: '名称',
    defaultFlex: 1,
    editable: false,
  },
  {
    name: 'workspace',
    header: '工作空间',
    defaultFlex: 1,
    editable: false,
  },
];

@withRouter
@observer
export default class Layout extends Panel<PanelProps> {
  gridRef: any = null;
  fileRef: any = null;
  exportFile = false;

  T = '自定义数据';

  @computed get title(): string {
    return this.path;
  }

  registerStore() {
    if (!customResourceStore.isLoaded) {
      customResourceStore.loadAll();
    }
    customResourceStore.items.forEach(item => {
      crm.register(item.getName());
    });
  }

  componentDidUpdate(prevProps) {
    if (!this.props.router.query.cr || this.props.router.query.cr === '')
      return;
    this.registerStore();

    if (this.props.router.query.cr !== prevProps.router.query.cr) {
      if (prevProps.router.query.cr !== '') {
        const lastStore = crm.getStore(prevProps.router.query.cr);
        lastStore && lastStore.stop();
      }
      this.store?.watch();
    }
  }

  delete = item => {
    this.store
      .remove(item)
      .then(() => Notifications.ok(`${item.getName()} delete succeeded`))
      .catch(err => Notifications.error(`${item.getName()} delete ` + err));
  };

  patchDelete = () => {
    this.selected_list.map(item => this.delete(item.IObject));
    this.selected_objs = {};
  };

  @computed get allItems() {
    customResourceStore.items.forEach(item => {
      crm.register(item.getName());
    });
    return customResourceStore.items;
  }

  fields = () => {
    let columns: column[] = [];
    columns.push(...defaultColumns);
    if (!this.path || this.path === '') return;
    const cr = this.allItems.find(item => item.getName() === this.path)?.spec
      ?.custom_resource;
    cr &&
      Object.entries(cr).
        forEach(([key, value]) => {
          columns.push({
            name: key,
            header: key,
            defaultFlex: 1,
            type: value,
          });
        });
    return columns;
  };

  @computed get columns() {
    return this.fields() || [];
  }

  @computed get rows() {
    const renderColumns = this.columns
      .map(column => column.name)
      .filter(this.removeMetaField);
    return (
      this.store?.items.map(item =>
        this.renderTableContents(renderColumns, item)
      ) || []
    );
  }

  @computed get path() {
    const cr = this.props.router.query.cr;
    if (typeof cr == 'string') {
      return cr;
    }
    return cr ? cr[0] : '';
  }

  @computed get store() {
    if (!this.path || this.path === '') return;
    this.registerStore();
    const store = crm.getStore(this.path);
    store && store.loadAll();
    return store;
  }

  renderTableContents(columns: string[], item: CustomData) {
    let rendered: Map<string, any> = new Map();
    columns.forEach(column => {
      rendered.set(column, item.spec[column]);
    });
    // add default field name
    rendered.set('id', item.getId());
    rendered.set('name', item.getName());
    rendered.set('workspace', item.getNs());
    rendered.set('IObject', item);
    return Object.fromEntries(rendered);
  }

  customRowContextMenu = cellProps => {
    return [
      {
        label: '删除',
        onClick: () => this.delete(cellProps.data.IObject),
      },
    ];
  };

  @computed get dial(): DialAction[] {
    var items = [].concat(
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

  removeMetaField(column: string): boolean {
    if (column === 'id') return false;
    if (column === 'workspace') return false;
    if (column === 'name') return false;
    return true;
  }

  // 导入导出 csv
  exportCSV = () => {
    const columns = this.gridRef.current.allColumns;
    const data = this.gridRef.current.data;
    const headerList = columns.filter(
      c => ['__checkbox-column', 'more'].indexOf(c.id) == -1
    );
    const rows = data.map(item => headerList.map(c => item[c.id]).join(','));
    const contents = [headerList.map(c => c.name).join(',')]
      .concat(rows)
      .join('\n');
    const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, this.path + '.csv');
  };

  importCSV = e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) {
      Notifications.error('文件不存在');
      return;
    }

    const api = this.store?.api;
    if (!api) {
      Notifications.error('api未初始化,请刷新页面');
      return;
    }

    let reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = function (event) {
      api
        .upload({ data: event.target.result })
        .then(() => {
          Notifications.ok('导入成功');
        })
        .catch(err => {
          Notifications.error(err);
        });
    };

    if (this.fileRef && this.fileRef.current) {
      this.fileRef.current.value = null;
    }
  };

  extends = gridRef => {
    this.gridRef = gridRef;
    return (
      <>
        <Box sx={{ mr: 1 }}>
          <label htmlFor='import-csv'>
            <input
              ref={this.fileRef}
              style={{ display: 'none' }}
              accept=',csv'
              id='import-csv'
              type='file'
              onChange={this.importCSV}
            />
            <Button component='span'>导入 CSV</Button>
          </label>
        </Box>
        <Box sx={{ mr: 1 }}>
          <Button onClick={this.exportCSV}>导出 CSV</Button>
        </Box>
      </>
    );
  };
}