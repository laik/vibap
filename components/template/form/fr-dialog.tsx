import { FormInstance, WatchProperties } from '@ddx2x/e-form-render';
import { Breakpoint } from '@mui/material';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import { computed } from 'mobx';
import React from 'react';
import Notifications from '../notification';
import { delay, FR } from './fr';


// 单步骤 表单
export class FormRenderDialog extends React.Component {

  maxWidth: string = 'sm';
  fullWidth: boolean = true;
  dialogFullScreen = false;
  subTitle: string = '';
  submitTitle: string = '提交';
  cancelTitle: string = '取消';
  validator: boolean = true; // 开启数据校验器

  modal: 'drawer' | 'dialog' = 'dialog'; // 抽屉 模态框
  drawerAnchor: 'bottom' | 'left' | 'right' | 'top' = 'right'; // 抽屉定位
  drawerWidth = '50%';

  protected inTrigger: boolean = false; // 在渲染时主动触发 in 函数
  protected form: FormInstance = null; // 动态表达 hook
  protected formData = {}; // 表单完成提交前后汇总数据
  protected onChangeformData = {}; // 表单实时更新时数据
  protected schema = {}; // 表单 schema 配置
  protected errors = []; // 表单在提交时输入校验

  @computed get object() {
    return null;
  }

  @computed get isOpen() {
    return false;
  }


  close() {
    // 关闭窗口 设定 isOpen 为 false
  }

  in() {
    // this.formData = {}
    // 在数据提交给 form render 前格式化输入 this.formData
  }
  out() {
    // this.formData
    // 在获取 form render 后格式化输出 this.formData
  }

  submit = () => {
    this.form.submit();
    delay(100).then(_ => {
      if (this.validator && this.errors.length > 0) {
        Notifications.error('表单数据未交验通过，请更新输入!');
        return;
      }
      delay(500).then(_ => {
        this.out();
        this.onFinish();
      });
    });
  };

  onFinish() {
    // 提交数据逻辑
  }

  onMount(form: FormInstance) {
    return null;
  }

  watch(form: FormInstance): WatchProperties | null {
    return null;
  }

  onValueChange = formData => {
    this.onChangeformData = formData;
  };

  prefix() {
    // 定制组件，放在配置表单上方，需要具备 value 和 onChange 的特性
    return null;
  }

  fr() {
    return (
      <FR
        schema={this.schema}
        formData={this.formData}
        onForm={form => (this.form = form)}
        onMount={this.onMount}
        watch={this.watch}
        onChange={this.onValueChange}
        onFinish={(formData, errors) => {
          this.formData = formData;
          this.errors = errors || [];
        }}
      />
    );
  }

  render() {
    // `in`函数不能在每次渲染时触发，因为当 `this.object`没初始化完成时，`in`函数读取`this.object`会读取不到数据 报错
    // 创建模式：设置 this.inTrigger 时运行 in 函数
    // 回填模式：当 this.object 初始化完成后 运行 in 函数
    if (this.object || this.inTrigger) {
      this.in();
    }

    if (this.modal === 'dialog') {
      return (
        <Dialog
          fullScreen={this.dialogFullScreen}
          maxWidth={this.maxWidth as Breakpoint}
          fullWidth={this.fullWidth}
          open={this.isOpen}
          onClose={this.close}
        >
          <DialogTitle>{this.subTitle}</DialogTitle>
          <DialogContent dividers>
            <Container>{this.fr()}</Container>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.close} color='primary'>
              {this.cancelTitle}
            </Button>
            <Button onClick={this.submit} color='primary'>
              {this.submitTitle}
            </Button>
          </DialogActions>
        </Dialog>
      );
    }

    if (this.modal === 'drawer') {
      return (
        <Drawer
          anchor={this.drawerAnchor}
          open={this.isOpen}
          onClose={this.close}
          sx={{
            '& .MuiDrawer-paper': {
              zIndex: 2500,
              width: this.drawerWidth,
            },
          }}
        >
          <DialogTitle>{this.subTitle}</DialogTitle>
          <DialogContent dividers>
            {this.prefix()}
            {this.fr()}
          </DialogContent>
          <DialogActions disableSpacing>
            <Button onClick={this.close} color='primary'>
              {this.cancelTitle}
            </Button>
            <Button onClick={this.submit} color='primary'>
              {this.submitTitle}
            </Button>
          </DialogActions>
        </Drawer>
      );
    }

    return null;
  }
}