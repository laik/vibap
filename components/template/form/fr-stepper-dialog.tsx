import {FormInstance, WatchProperties} from '@lz/e-form-render';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import {Breakpoint} from '@mui/material/styles';
import Box from '@mui/system/Box';
import {computed, observable} from 'mobx';
import React from 'react';
import Notifications from '../notification';
import {delay, FR} from './fr';

// schema
type Schemas = {
  title: string;
  schema: any;
}[];

// errors
type Error = any[];
type Errors = Error[];

// 多步骤
export class FormRenderStepperDialog<P> extends React.Component<P> {
  maxWidth: string = 'sm';
  subTitle: string = '';
  submitTitle: string = '提交';
  cancelTitle: string = '取消';
  validator: boolean = true; // 开启数据校验器

  modal: 'drawer' | 'dialog' = 'dialog'; // 抽屉 模态框
  drawerAnchor: 'bottom' | 'left' | 'right' | 'top' = 'right'; // 抽屉定位
  drawerWidth = '50%';

  protected inTrigger: boolean = false; // 在渲染时主动触发 in 函数
  protected schema: Schemas = []; // 表单 schema 配置
  protected form: FormInstance[] = []; // 动态表达 hook
  protected formData: any[] = []; // 表单完成提交前后数据
  protected onChangeformData: any[] = []; // 表单实时更新时数据
  protected errors: Errors = []; // 表单在提交时输入校验

  // 步骤器
  @observable activeStep: number = 0;
  @observable skipped = new Set<number>();

  isStepOptional = (step: number) => {
    return step === 1;
  };

  isStepSkipped = (step: number) => {
    return this.skipped.has(step);
  };

  handleNext = () => {
    // 提交 form hook
    this.form[this.activeStep]?.submit().then(res => {
      if (res?.length > 0) {
        Notifications.error('表单数据未校验通过，请重新输入!');
        return;
      }
      delay(1).then(_ => {
        let newSkipped = this.skipped;
        if (this.isStepSkipped(this.activeStep)) {
          newSkipped = new Set(newSkipped.values());
          newSkipped.delete(this.activeStep);
        }

        this.activeStep += 1;
        this.skipped = newSkipped;
      });
    });
  };

  handleBack = () => {
    // 提交 form hook
    this.form[this.activeStep]?.submit();

    delay(1).then(_ => {
      this.activeStep -= 1;
    });
  };

  handleReset = () => {
    this.activeStep = 0;
  };

  // 回填对象
  @computed get object() {
    return null;
  }

  // 展示开关
  @computed get isOpen() {
    return false;
  }

  close() {
    // 关闭窗口 设定 isOpen 为 false
  }

  in() {
    // thi.formData = {}
    // 在数据提交给 form render 前格式化输入 this.formData
  }
  out() {
    // this.formData
    // 在获取 form render 后格式化输出 this.formData
  }

  submit = () => {
    console.log('submit formData', this.formData);
    if (this.validator && this.errors.length > 0) {
      Notifications.error('表单数据未校验通过，请重新输入!');
      return;
    }
    delay(500).then(_ => {
      this.out();
      this.onFinish();
    });
  };

  onFinish() {
    // 提交数据逻辑
  }

  onMount(form: FormInstance, activeStep: number) {
    // onMount 根据当前`activeStep`编号索引得到的对应 form ref, 可以通过`activeStep`编号索引判断选择对应的处理函数
    // if (activeStep == 0) { form.setValueByPath('somthing', '')}
    return null;
  }

  watch(form: FormInstance, activeStep: number): WatchProperties | null {
    // watch 根据当前`activeStep`索引得到的对应 form ref, 可以通过`activeStep`编号索引判断选择对应的回调函数
    // if (activeStep == 0) { return 'schema-key-0': val => form.setValueByPath('somthing', '')}
    return null;
  }

  onValueChange = formData => {
    this.onChangeformData = formData;
  };

  // 按钮
  actions = () => {
    const lastStep = !this.schema?.[this.activeStep + 1]?.schema;
    console.log('lastStep', lastStep);
    return (
      <React.Fragment>
        <Button
          color='inherit'
          disabled={this.activeStep === 0}
          onClick={this.handleBack}
          sx={{mr: 1}}
        >
          上一步
        </Button>
        <Box sx={{flex: '1 1 auto'}} />
        <Button onClick={this.handleNext} disabled={lastStep}>
          {lastStep ? '最后一步' : '下一步'}
        </Button>
        <Button onClick={this.close} color='primary'>
          {this.cancelTitle}
        </Button>
        {lastStep ? (
          <Button
            onClick={() => {
              this.form[this.activeStep]?.submit().then(res => {
                delay(50).then(_ => {
                  this.submit();
                });
              });
            }}
            color='primary'
          >
            {this.submitTitle}
          </Button>
        ) : (
          false
        )}
      </React.Fragment>
    );
  };

  fr(index: number) {
    const activeStep = this.activeStep;
    if (index == activeStep) {
      return (
        <FR
          key={index}
          schema={this.schema[activeStep].schema}
          formData={this.formData[activeStep]}
          onForm={form => (this.form[activeStep] = form)}
          onMount={form => this.onMount(form, activeStep)}
          watch={form => this.watch(form, activeStep)}
          // onChange={this.onValueChange}
          onFinish={(formData, errors) => {
            console.log(
              'FR onFinish',
              activeStep,
              formData,
              'this.formData',
              this.formData[activeStep]
            );
            this.formData[activeStep] = formData;
            this.errors[activeStep] = errors || [];
          }}
        />
      );
    }
  }

  stepper() {
    return (
      <Stepper activeStep={this.activeStep}>
        {this.schema.map(({title}, index) => {
          const stepProps: {completed?: boolean} = {};
          if (this.isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={title} {...stepProps}>
              <StepLabel>{title}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
    );
  }

  render() {
    if (this.object || this.inTrigger) {
      this.in();
    }

    if (this.modal === 'dialog') {
      return (
        <Dialog
          maxWidth={this.maxWidth as Breakpoint}
          fullWidth
          open={this.isOpen}
          onClose={this.close}
        >
          <DialogTitle>{this.subTitle}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={1} direction='column'>
              {this.stepper()}
              {this.schema.map((item, index) => this.fr(index))}
            </Stack>
          </DialogContent>
          <DialogActions>{this.actions()}</DialogActions>
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
            <Stack spacing={1} direction='column'>
              {this.stepper()}
              {this.schema.map((item, index) => this.fr(index))}
            </Stack>
          </DialogContent>
          <DialogActions disableSpacing>{this.actions()}</DialogActions>
        </Drawer>
      );
    }

    return null;
  }
}
