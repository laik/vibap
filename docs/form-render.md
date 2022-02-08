

> [ReadME](../README.md)

## 动态表单(对话框 / 抽屉)

[Mobx 状态监听](https://cn.mobx.js.org/)

[表单方法](https://x-render.gitee.io/form-render/advanced/form-methods)

[表单监听](https://x-render.gitee.io/form-render/advanced/watch)

[生命周期 (加载 - 提交)](https://x-render.gitee.io/form-render/advanced/life-cycle)

[动态表单编辑器](http://localhost:3003/)

### 单个动态表单
继承 form/FormRenderDialog, 重写类属性或方法可以实现对应的表单功能
```ts
import {merge} from 'lodash';
import {computed, observable} from 'mobx';
import {observer} from 'mobx-react';
import {FormRenderDialog} from '../../template/form/fr-dialog';
import Notifications from '../../template/notification';

let schema = {
  type: 'object',
  displayType: 'row',
  labelWidth: 120,
  properties: {
    user: {
      title: '租户',
      type: 'string',
      widget: 'select',
      enum: [],
      enumNames: [],
      disabled: false,
      size: 'small',
      default: '',

      color: 'info',
      fullWidth: true,
      required: true,
    },
  },
};

// 新增模式
@observer
export class AddDialog extends FormRenderDialog {
  @observable static ok: boolean = false; // 展示开关(静态变量)
  schema = schema; // 动态表单schema
  maxWidth: string = 'sm'; // mui 最大宽度
  dialogFullScreen = false;  // 模态框模式(modal = 'dialog')下,可以开启全屏展示
  subTitle: string = ''; // 表单标题
  submitTitle: string = '提交'; // 重写提交按钮名称
  cancelTitle: string = '取消'; // 重写取消按钮名称
  validator: boolean = true; // 开启数据校验器
  modal: 'drawer' | 'dialog' = 'dialog'; // 抽屉 模态框
  drawerAnchor: 'bottom' | 'left' | 'right' | 'top' = 'right'; // 抽屉展示定位
  drawerWidth = '50%';
  inTrigger = true; // 如果没有`this.object`方法，重写`in`函数需要配置`inTrigger`为true;

  static open() {
    AddDialog.ok = true; // 调用对话框的静态方法 AddDialog.open()
  }

  close() {
    // 关闭 对话框
    AddDialog.ok = false;
  }

  @computed get isOpen() {
    // 对话框展示状态监听
    return AddDialog.ok;
  }

  in = () => {
    // 回填动态表单数据
    this.formData = {
      tenant: this.userconfig.tenant,
    };
  };

  out = () => {
    // 获取点击`提交`按钮后的数据, 可以安装后端提交重新格式化
    let formData = {};
    formData['metadata'] = {
      name: this.formData['user'],
    };
    this.formData = formData;
  };

  onFinish = () => {
    // 在点击`提交`按钮获取整个表单数据`this.formData`后, 可以在此处写提交到后端的逻辑
  };

  onMount = form => {
    // #生命周期 (加载 - 提交)
    // 在onMount函数中，使用 #表单方法 可以更新表单schema配置、初始化表单数据等操作
    form.setSchemaByPath('user', {
      enum: accountIds,
      enumNames: accountNames,
    });
  };

  watch = form => {
    // #表单监听
    // return 监听对象  '表单监听 properties key' => { 与onMount一样可以在对监听字段被触发时 使用 #表单方法 可以更新表单schema配置、重新初始化表单数据等操作 }
    retrun {
      'user': val => {
        form.setSchemaByPath('user', {
          enum: accountIds,
          enumNames: accountNames,
        });
      }
    }
  }
}


// 编辑模式
@observer
export class EditDialog extends FormRenderDialog {
  @observable static ok: boolean = false; // 展示开关(静态变量)
  @observable static data = null;
  schema = schema; // 动态表单schema

  static open(data) {
    EditDialog.data = data // 调用对话框的静态方法 AddDialog.open(data), 获取回填对象数据
    EditDialog.ok = true;
  }

  @computed get object() {
    return EditDialog.data; // 使用 @computed 实时监听回填对象变化
  }
}
```

### 多步骤动态表单

继承 form/FormRenderStepperDialog, 重写类属性或方法可以实现对应的多步骤表单功能，与单个动态表单使用方法基本一致，与单个动态表单差别在于类属性为类属性数组。在点击`下一步`的时候会根据`表单数组当前索引`(this.activeStep)调用对应的`form ref`。
```ts
@observer
export class AddDialog extends FormRenderStepperDialog {
  schema: Schemas = []; // 表单 schema 配置
  form: FormInstance[] = []; // 动态表达 hook
  formData: any[] = []; // 表单完成提交前后数据
  onChangeformData: any[] = []; // 表单实时更新时数据
  errors: Errors = []; // 表单在提交时输入校验
}
```