import FormRender, {
  FormInstance,
  useForm,
  WatchProperties
} from '@ddx2x/e-form-render';
import _ from 'lodash';
import { useEffect } from 'react';

export const delay = ms => new Promise(res => setTimeout(res, ms));

interface frProps {
  schema: any;
  formData: any;
  onFinish?(formData, errors): void;
  beforeFinish?(): void;
  watch?(form: FormInstance): WatchProperties;
  onMount?(form: FormInstance): void;
  onForm?(form: FormInstance): void;
  onChange?(formData): void;
}

export function FR(props: frProps) {
  const form = useForm({formData: props.formData || {}});

  useEffect(() => {
    // 表单 hook 初始化
    form.init();
    // useForm hook https://x-render.gitee.io/form-render/advanced/form-methods
    props.onForm && props.onForm(form);
  }, []);

  let watch = {};
  if (props.watch) {
    // 表单监听 https://x-render.gitee.io/form-render/advanced/watch
    watch = props.watch(form) || {};
  }

  const merge = (changedValues: any, formData: any): any => {
    Object.entries(changedValues).map(([k, v]) => {
      _.set(formData, k.toString(), v);
    });
    return formData;
  };

  return (
    <FormRender
      form={form}
      schema={props.schema}
      onMount={() => (props.onMount ? props.onMount(form) : null)}
      watch={watch}
      onFinish={(formData, errors) => {
        // 数据校验 `form.submit()` => `onFinish(formData, errors?)`
        if (props.onFinish) {
          props.onFinish(formData, errors);
        }
      }}
      onValuesChange={(changedValues: any, formData: any) => {
        // 数据实时更新
        if (props.onChange) {
          formData = merge(changedValues, formData);
          props.onChange(formData);
        }
      }}
    />
  );
}
