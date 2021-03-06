import {
  TypeCellProps,
  TypeComputedProps,
  TypeRowProps,
} from '@inovua/reactdatagrid-community/types';
import SearchIcon from '@mui/icons-material/Search';
import {CardContent, Divider} from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import styled from '@mui/system/styled';
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {AsyncSearch, AsyncSearchProps} from './async.search';
import {Badge} from './badge';
import {ConfirmBox} from './confirm';
import {
  comparisonCompute,
  comparisonEnum,
  comparisonFormat,
  Field,
  FilterPopover,
} from './filter-popover';
import {MoreMenu} from './more';
import {
  DataGrid,
  DataGridProps,
  defaultTheme,
  Theme,
  Themes,
  TypeGridPublicAPI,
} from './reactdatagrid';
import {Swicth, SwitchMenu} from './switch';
import {Tag} from './tag';

export function downloadBlob(blob, fileName = 'grid-data.csv') {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.position = 'absolute';
  link.style.visibility = 'hidden';

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}

export interface DataGridTableProps extends DataGridProps {
  singleChoice?: boolean;
  title?: string;
  defaultSearchText?: string;
  moreMenuButton?: boolean;
  okBox?: boolean;
  searchInput?: boolean;
  showExport?: boolean;
  asyncSearch?: AsyncSearchProps | null;
  showOptions?: boolean;
  showThemes?: boolean;
  cardBackground?: boolean;
  okBoxKeys?: string[];
  filterColumns?: Field[];
  overflowYauto?: boolean;
  extends?: (gridRef: any) => any;
  customRowContextMenu?: (cellProps: TypeCellProps) => any[];
  onAsyncSearchChange?: (data: {field: string; value: string}) => void;
}

export function DataGridTable(props: DataGridTableProps) {
  let columns = props.columns;
  let filterColumns = props.filterColumns;
  const dataSource = props.dataSource as any[];
  const [gridRef, setGridRef] = useState(null);
  // const [gridApiRef, setGridApiRef] = useState(null);
  const [rows, setRows] = useState(dataSource);
  const [searchText, setSearchText] = useState(props.defaultSearchText);
  const [searching, setSearching] = useState(false);
  // switch
  const [filter, setFilter] = useState(false); // ?????????
  const [sortable, setSortable] = useState(true); // ??????
  const [pagination, setPagination] = useState(props.pagination); // ??????
  const [showZebraRows, setShowZebraRows] = useState(false); // ?????????

  // theme
  const [theme, setTheme] = useState(defaultTheme);

  const [filters, setFilters] = useState([]);

  const shouldComponentUpdate = () => true;

  const tableFuncSet: Swicth[] = [
    {
      title: '????????????',
      value: filter,
      onClick: () => setFilter(!filter),
    },
    {
      title: '??????',
      value: sortable,
      onClick: () => setSortable(!sortable),
    },
    {
      title: '??????',
      value: pagination,
      onClick: () => setPagination(!pagination),
    },
    {
      title: '?????????',
      value: showZebraRows,
      onClick: () => setShowZebraRows(!showZebraRows),
    },
  ];

  const themeSet = () => {
    let set = [];
    Object.entries(Themes).forEach(([k, v]) =>
      set.push({
        title: k,
        value: theme == v,
        onClick: () => setTheme(v as Theme),
      })
    );
    return set;
  };

  // ??????
  const title = () => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          margin: '4px 0',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            marginRight: '12px',
            marginBottom: 0,
            color: 'rgba(0,0,0,.85)',
            fontWeight: 450,
            fontSize: '23px',
            lineHeight: '32px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontFamily: 'Public Sans, sans-serif',
          }}
        >
          {props.title || ''}
        </span>
      </div>
    );
  };

  // ????????? ?????? ??????
  const onSelectionChange = useCallback(
    data => {
      let {selected} = data;
      if (selected === null) return;
      if (props.singleChoice) {
        if (selected === true) {
          selected = {};
        }
        if (typeof selected == 'object') {
          const selected_keys = Object.keys(selected);
          const selected_values = Object.values(selected);
          selected = {};
          let index = 0;
          if (
            selected_keys.length > 1 &&
            selected_values.length > 1 &&
            selected_keys[1]
          ) {
            index = 1;
          }
          selected[selected_keys[index]] = selected_values[index];
        }
      }
      // undefined
      if (!selected) {
        selected = {};
      }
      props.onSelectionChange({selected});
    },
    [props]
  );

  // ???????????? with ?????????
  const renderRowContextMenuWithOkBox = (
    menuProps: any,
    details: {
      rowProps: TypeRowProps;
      cellProps: TypeCellProps;
      grid: TypeGridPublicAPI;
      computedProps: TypeComputedProps;
      computedPropsRef: MutableRefObject<TypeComputedProps>;
    }
  ) => {
    if (typeof props.renderRowContextMenu === 'function') {
      props.renderRowContextMenu(menuProps, details);
    }
    menuProps.items.map(item => {
      // ??????????????????????????????
      if (props.okBoxKeys.indexOf(item.label) !== -1) {
        const click = item.onClick;
        item.onClick = () => ConfirmBox.open(item.label, click);
      }
    });
  };

  // ???????????????????????????
  const render = useCallback(
    ({value}) => {
      const lowerSearchText = searchText && searchText.toLowerCase();
      if (!lowerSearchText) {
        return value;
      }

      const str = value + ''; // get string value
      const v = str.toLowerCase(); // our search is case insensitive
      const index = v.indexOf(lowerSearchText);

      if (index === -1) {
        return value;
      }

      return [
        <span key='before'>{str.slice(0, index)}</span>,
        <span key='match' style={{background: 'yellow', fontWeight: 'bold'}}>
          {str.slice(index, index + lowerSearchText.length)}
        </span>,
        <span key='after'>{str.slice(index + lowerSearchText.length)}</span>,
      ];
    },
    [searchText]
  );

  const filterRows = useCallback(
    (value, data) => {
      if (!Array.isArray(gridRef?.current?.visibleColumns)) return [];
      const visibleColumns = gridRef.current.visibleColumns;
      const lowerSearchText = value ? value.toLowerCase() : '';
      return data.filter(p => {
        return visibleColumns.reduce((acc, col) => {
          const v = (p[col.id] + '').toLowerCase(); // get string value
          return acc || v.indexOf(lowerSearchText) != -1; // make the search case insensitive
        }, false);
      });
    },
    [gridRef]
  );

  const filterRows2 = useCallback((fs: any[], data) => {
    return data.filter((item, i) => {
      return fs.reduce((a, b) => {
        const {field, type, value, condition} = b;
        const fun = comparisonCompute[`${type}_${condition}`];
        if (typeof fun === 'function') {
          return fun(item[field], value) && a;
        }
        return a;
      }, true);
    });
  }, []);

  // ???????????????
  const onSearchChange = ({target: {value}}) => {
    setSearchText(value);
  };

  useEffect(() => {
    if (searchText === '') {
      setSearching(false);
      setRows(dataSource);
    } else {
      setSearching(true);
      setRows(filterRows(searchText, dataSource));
    }
  }, [dataSource, filterRows, searchText]);

  useEffect(() => {
    if (filters?.length > 0 && dataSource?.length > 0) {
      setSearching(true);
      setRows(filterRows2(filters, dataSource));
    } else {
      setSearching(false);
      setRows(dataSource);
    }
  }, [dataSource, filterRows2, filters]);

  const {searchInput, moreMenuButton, customRowContextMenu, okBoxKeys} = props;

  const newColumns = useMemo(() => {
    let tmp = columns.concat([]);
    if (searchInput) {
      // ?????????????????????
      tmp = (columns || []).map(item => {
        return {
          ...item,
          ...{render: item.render ? item.render : render},
          shouldComponentUpdate,
        };
      });
    }

    // ????????????
    if (gridRef && moreMenuButton) {
      tmp.push({
        header: '??????',
        name: 'more',
        // defaultFlex: 1,
        editable: false,
        lockable: true,
        render: ({data, cellProps}) => {
          let items = customRowContextMenu(cellProps);
          if (items?.length > 0) {
            items.map(item => {
              // `label`??? `okBoxKeys` ?????????, ???????????????
              if (okBoxKeys.indexOf(item.label) !== -1) {
                const click = item.onClick;
                item.onClick = () => ConfirmBox.open(item.label, click);
              }
            });
            // ??????????????????????????????, ???????????????????????????????????????
            if (Array.isArray(items) && items.length === 1) {
              return (
                <Button size='small' variant='text' onClick={items[0].onClick}>
                  {items[0].label}
                </Button>
              );
            }
            return <MoreMenu items={items} />;
          }
          return null;
        },
      });
    }

    // ?????????????????? ??????column??????
    tmp = tmp.map(item => {
      if (item.valueType) {
        return {
          ...item,
          render: ({data, cellProps}) => {
            if (item.valueType === 'label') {
              if (Array.isArray(data[cellProps.name])) {
                return (
                  <Stack spacing={1} direction='row'>
                    {data[cellProps.name].map((d, i) => {
                      return (
                        <Tag key={i} color='default'>
                          {d}
                        </Tag>
                      );
                    })}
                  </Stack>
                );
              }
              return <Tag color='default'>{data[cellProps.name]}</Tag>;
            } else if (item.valueType === 'tag') {
              if (Array.isArray(data[cellProps.name])) {
                return (
                  <Stack spacing={1} direction='row'>
                    {data[cellProps.name].map((d, i) => {
                      const cur = item.valueEnum?.[d];
                      return (
                        <Tag key={i} color={cur?.color || ''}>
                          {cur?.text}
                        </Tag>
                      );
                    })}
                  </Stack>
                );
              }
              const cur = item.valueEnum?.[data[cellProps.name]];
              return <Tag color={cur?.color || ''}>{cur?.text}</Tag>;
            } else if (item.valueType === 'select') {
              const cur = item.valueEnum?.[data[cellProps.name]];
              return <Badge {...cur} />;
            }
            return data[cellProps.name];
          },
        };
      } else {
        return item;
      }
    });

    return tmp;
  }, [
    columns,
    customRowContextMenu,
    gridRef,
    moreMenuButton,
    okBoxKeys,
    render,
    searchInput,
  ]);

  // cell ????????????
  const onCellClick = useCallback((event, cellProps) => {
    // event.stopPropagation();
    if (cellProps.name == 'more') {
      event.stopPropagation();
    }
    // console.log('onCellClick', event, cellProps);
  }, []);

  // ??????
  const onRowClick = useCallback((rowProps, event) => {
    event.stopPropagation();
    // console.log('onRowClick rowProps', rowProps);
  }, []);

  // ??????
  const onRowContextMenu = useCallback((rowProps, event) => {
    event.stopPropagation();
    // console.log('onRowContextMenu rowProps', rowProps, event);
  }, []);

  // ??????
  const search = () => {
    return (
      <Grid item>
        {/* ????????? */}
        {props.searchInput ? (
          <FormControl margin='dense' fullWidth>
            <Input
              id='input-with-icon-adornment'
              value={searchText}
              onChange={onSearchChange}
              startAdornment={
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              }
            />
          </FormControl>
        ) : null}
      </Grid>
    );
  };

  // ????????????
  const combination_filter = () => {
    return (
      <Grid item>
        {filterColumns?.length > 0 && (
          <FilterPopover
            fields={filterColumns}
            values={filters}
            onSearch={values => {
              setFilters(values);
            }}
          />
        )}
      </Grid>
    );
  };

  // ?????? csv ??????
  const export_csv = () => {
    const headerList = gridRef.current.allColumns.filter(
      c => ['__checkbox-column', 'more'].indexOf(c.id) == -1 // ?????????????????? column id
    );
    const rows = gridRef.current.data.map(item =>
      headerList.map(c => item[c.id]).join(',')
    );
    const contents = [headerList.map(c => c.name).join(',')]
      .concat(rows)
      .join('\n');
    const blob = new Blob([contents], {type: 'text/csv;charset=utf-8;'});
    downloadBlob(blob, 'datagrid.csv');
  };

  // ??????csv ??????
  const export_csv_button = () => {
    if (!props.showExport) return null;
    return (
      <Button sx={{mr: 1, ml: 1}} onClick={export_csv}>
        ??????
      </Button>
    );
  };

  // ?????????????????? ??????
  const switches = () => {
    if (!props.showOptions) return null;
    return <SwitchMenu items={tableFuncSet} title={'??????????????????'} />;
  };

  // ???????????? ??????
  const themes = () => {
    if (!props.showThemes) return null;
    const set = themeSet();
    return <SwitchMenu items={set} title={'??????'} />;
  };

  // ???????????????
  const async_search = () => {
    if (!props.asyncSearch) return null;
    return (
      <AsyncSearch
        {...props.asyncSearch}
        onAsyncSearchChange={props.onAsyncSearchChange}
      />
    );
  };

  const filter_chip_columns = () => {
    return (
      filters?.length > 0 && (
        <>
          <Divider />
          <div style={{display: 'flex', padding: '8px 16px'}}>
            <div style={{display: 'flex', alignItems: 'center', width: 120}}>
              ???????????????
            </div>
            <Stack direction={'row'} spacing={2}>
              {filters.map((item, i) => {
                const cur = filterColumns.find(f => f.field === item.field);
                return (
                  <Chip
                    key={i}
                    label={(() => {
                      const filter = filterColumns.find(
                        f => f.field === item.field
                      );
                      return `${cur.label}${
                        comparisonEnum?.[item.condition]?.label
                      }${comparisonFormat[item.type](item.value, filter)}`;
                    })()}
                    onDelete={() => {
                      setFilters(pre =>
                        pre.filter((item, index) => i !== index)
                      );
                    }}
                  />
                );
              })}
            </Stack>
          </div>
        </>
      )
    );
  };

  const bar = () => {
    if (props.toolBarRender === false) return null;
    return (
      <>
        <div
          style={{
            borderRadius: 3,
            backgroundColor: '#fff',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
            }}
          >
            {title()}
            <Gorw />
            {export_csv_button()}
            {themes()}
            {combination_filter()}
            {props.extends ? props.extends(gridRef) : null}
            {switches()}
            {search()}
            {async_search()}
          </div>
        </div>
        {filter_chip_columns()}
      </>
    );
  };

  // ???????????? DataGrid ?????????
  const defaultFilterValue =
    props.defaultFilterValue && props.defaultFilterValue.length > 0
      ? props.defaultFilterValue
      : columns.map(item => {
          return {
            name: item.name,
            operator: 'startsWith',
            type: 'string',
            value: '',
          };
        });

  const datagrid = () => {
    return (
      <DataGrid
        // ref ??????
        onReady={setGridRef}
        // handle={setGridApiRef}
        columns={newColumns}
        dataSource={searching ? rows : dataSource}
        loading={props.loading}
        // ??????
        sortable={sortable}
        // ??????
        selected={props.selected}
        onSelectionChange={onSelectionChange}
        checkboxColumn={props.checkboxColumn}
        // ??????
        enableFiltering={filter}
        defaultFilterValue={defaultFilterValue}
        // ????????????
        onRowClick={onRowClick}
        onCellClick={onCellClick}
        // ????????????
        onRowContextMenu={onRowContextMenu}
        // ??????????????????
        renderRowContextMenu={
          props.okBox
            ? renderRowContextMenuWithOkBox
            : props.renderRowContextMenu
        }
        // ????????? ????
        showZebraRows={showZebraRows}
        // ??????
        theme={theme as Theme}
        style={props.style || {}}
        // sort
        defaultSortInfo={props.defaultSortInfo}
        // pagation
        pagination={pagination}
        limit={props.limit}
        skip={props.skip}
        onLimitChange={props.onLimitChange}
        onSkipChange={props.onSkipChange}
      />
    );
  };

  const datagridWithCard = () => {
    return (
      <Card sx={{height: '100%'}}>
        <CardContent sx={{height: '100%'}}>{datagrid()}</CardContent>
      </Card>
    );
  };

  return (
    <Grid container direction='column' sx={{height: '100%'}}>
      <Grid item xs='auto'>
        {bar()}
      </Grid>
      <Grid item xs sx={props.overflowYauto ? {overflowY: 'auto'} : {}}>
        {props.cardBackground ? datagridWithCard() : datagrid()}
      </Grid>
    </Grid>
  );
}

DataGridTable.defaultProps = {
  singleChoice: false,
  moreMenuButton: true,
  searchInput: true,
  okBox: true,
  exportFile: false,
  showThemes: false,
  showOptions: true,
  showExport: false,
  okBoxKeys: ['??????', '????????????'],
  cardBackground: false,
  defaultSortInfo: null,
  overflowYauto: true,
};

const Gorw = styled('div')(({theme}) => ({
  flexGrow: 1,
}));
