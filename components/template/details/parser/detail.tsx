import {DividerProps} from '@mui/material/Divider';
import {GridProps} from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {observer} from 'mobx-react';
import React from 'react';
import {StatisticProps} from '../../../statistic';
import {DataGridTableProps} from '../../table/datagridtable';
import {DescriptionsProps} from './descriptions';
import {TopBooth} from './topbooth';
import renderField from './map';
import {TagProps} from './tag';

export type GridSchema = GridProps & {
  type: 'grid';
  items: any[];
  itemsLayout?: any[];
};
export interface ButtonSchema {
  type: 'button';
  label: string;
  onClick?: () => void;
}
export interface PanelSchema {
  type: 'panel';
  title: string;
  content: CardItem[];
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  extra?: ButtonSchema[];
}
export interface DescriptionsSchema extends DescriptionsProps {
  type: 'descriptions';
}
export interface TableSchema extends DataGridTableProps {
  type: 'table';
}
export interface StatisticSchema extends StatisticProps {
  type: 'statistic';
}
export interface TagSchema extends TagProps {
  type: 'tag';
}
export interface TagsSchema {
  type: 'tags';
  items: TagSchema[];
}
export type MasonrySchemaItem =
  | PanelSchema
  | DescriptionsSchema
  | TableSchema
  | TabsSchema;
export interface MasonrySchema {
  type: 'masonry';
  columns: number;
  items: MasonrySchemaItem[];
}
export interface DividerSchema extends DividerProps {
  type: 'divider';
  text: React.ReactNode;
}

export type CardItem =
  | DescriptionsSchema
  | TableSchema
  | TagSchema
  | TagsSchema;
export type TabsContent =
  | PanelSchema
  | TabsSchema
  | MasonrySchema
  | DividerSchema
  | TableSchema
  | GridSchema
  | DescriptionsSchema;
export type ContentItem = DescriptionsSchema;
export type ExtraContentItem = StatisticSchema;
export type ExtraSchema = ExtraHandleSchema;
export type TabsItem = {
  label: string;
  content: TabsContent[];
  spacing?: Array<number | string> | number | object | string;
};
export interface SelectSchema {
  type: 'select';
  label: string;
  options: {label: string; value: string}[];
  value?: any;
  onChange?: () => void;
}
export interface ExtraHandleSchema {
  type: 'handle';
  main?: ButtonSchema;
  secondary?: {type: 'buttonGroup'; items: ButtonSchema[]};
}
export interface TabsSchema {
  type: 'tabs';
  items: TabsItem[];
  value?: any;
  onChange?: () => void;
  showType?: 'line' | 'radio';
}
export type bodySchema = TabsSchema;

export interface ContainerProps {
  title?: SelectSchema | string;
  content?: ContentItem[];
  extraContent?: ExtraContentItem[];
  extra?: ExtraSchema;
  body?: bodySchema;
}

@observer
class Container extends React.Component<ContainerProps> {

  renderTitle(title) {
    if (typeof title === 'string') {
      return (
        <Typography
          sx={{fontSize: 22}}
          color='text.secondary'
          noWrap
          align='justify'
        >
          {title}
        </Typography>
      );
    }
    return renderField(title);
  }

  renderExtra(extra: ExtraHandleSchema) {
    if (extra && extra.type === 'handle') {
      return (
        <Stack spacing={1} direction='row'>
          {extra.secondary
            ? renderField({
                ...extra.secondary,
                size: 'small',
                variant: 'outlined',
              })
            : null}
          {extra.main
            ? renderField({...extra.main, size: 'small', variant: 'contained'})
            : null}
        </Stack>
      );
    } else {
      return null;
    }
  }

  renderContent(content: DescriptionsSchema[]) {
    if (!content) return null;
    return content.map(renderField);
  }

  renderExtraContent(extraContent: StatisticSchema[]) {
    if (!extraContent) return null;
    return extraContent.map(renderField);
  }

  render() {
    const { title, extra, content, extraContent, body } = this.props;
    return (
      <div className='detail'>
        {(title || extra || content || extraContent) && (
          <TopBooth
            title={this.renderTitle(title)}
            extra={this.renderExtra(extra)}
            content={this.renderContent(content)}
            extraContent={this.renderExtraContent(extraContent)}
          />
        )}
        {body ? renderField(body) : null}
      </div>
    );
  }
}

export default Container;
