import {useAutocomplete} from '@mui/base/AutocompleteUnstyled';
import CheckIcon from '@mui/icons-material/Check';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import {styled} from '@mui/material/styles';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from '../../redux/decorator';
import {setUserConfig} from '../../redux/user/action';

const _ = require('lodash');

const Root = styled('div')(
  ({theme}) => `
  color: ${
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,.85)'
  };
  font-size: 14px;
  margin-right: 10px;
`
);

const InputWrapper = styled('div')(
  ({theme}) => `
  width: 220px;
  border: 1px solid ${theme.palette.mode === 'dark' ? '#434343' : '#d9d9d9'};
  background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
  border-radius: 4px;
  display: flex;
  flex-wrap: wrap;

  &:hover {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
  }

  &.focused {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  & input {
    background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
    color: ${
      theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.65)'
        : 'rgba(0,0,0,.85)'
    };
    font-size: 15px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`
);

const Listbox = styled('ul')(
  ({theme}) => `
  width: 220px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: ${theme.palette.mode === 'dark' ? '#141414' : '#fff'};
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 999999;
  font-size: 15px;
  font-weight: 520;

  & li {
    padding: 6px 12px;
    display: flex;

    & span {
      flex-grow: 2;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: ${theme.palette.mode === 'dark' ? '#2b2b2b' : '#fafafa'};

    & svg {
      color: #1890ff;
    }
  }

  & li[data-focus='true'] {
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
    cursor: pointer;

    & svg {
      color: currentColor;
    }
  }
`
);

function Selector({selected, options, onChange}) {
  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    value: selected,
    multiple: true,
    options: options,
    onChange: (event, item) => onChange(item),
  });

  const selectedNames = value.join(' , ');
  const inputProps = getInputProps();

  return (
    <Root>
      <div {...getRootProps()}>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          <input
            {...inputProps}
            placeholder={
              value.length == 0 ? '工作空间' : `工作空间 : ${selectedNames}`
            }
          />
          {/* {(focused) && value.length > 0 ? (
            <IconButton size='small' onClick={onChange([])}>
              <CloseIcon fontSize='small' />
            </IconButton>
          ) : (
            false
          )} */}
          <IconButton size='small' onMouseDown={inputProps.onMouseDown}>
            <KeyboardArrowDownIcon fontSize='small' />
          </IconButton>
        </InputWrapper>
      </div>
      {groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()}>
          {(groupedOptions as typeof options).map((option, index) => (
            <li {...getOptionProps({option, index})} key={index}>
              <span>{option}</span>
              <CheckIcon fontSize='small' />
            </li>
          ))}
        </Listbox>
      ) : null}
    </Root>
  );
}

interface WorkSpacesProps {
  user?: any;
  setUserConfig?: any;
}

const mapStateToProps = state => {
  return {
    user: state.user || {},
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setUserConfig: bindActionCreators(setUserConfig, dispatch),
  };
};

@connect(mapStateToProps, mapDispatchToProps)
@observer
export default class WorkSpaceSelect extends React.Component<WorkSpacesProps> {
  @observable workspace = this.props.user['defaultWorkspace'] || '';
  @observable allowWorkspaces = this.props.user['allowWorkspaces'] || [];

  onChange = item => {
    const workspace = item ? item[1] : '';
    this.workspace = workspace;
    _.delay(() => this.props.setUserConfig({defaultWorkspace: workspace}), 0);
  };

  render() {
    return (
      <Selector
        selected={[this.workspace]}
        options={this.allowWorkspaces}
        onChange={this.onChange}
      />
    );
  }
}
