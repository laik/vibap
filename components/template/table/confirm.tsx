import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import React from 'react';

// 确认框
@observer
export class ConfirmBox extends React.Component {
  @observable static isOpen: boolean = false;
  @observable static label: string = '';
  @observable static func = null;

  static open(label, operator) {
    ConfirmBox.label = label;
    ConfirmBox.func = operator;
    ConfirmBox.isOpen = true;
  }

  cancel = () => {
    ConfirmBox.isOpen = false;
  };

  ok = () => {
    ConfirmBox.func();
    ConfirmBox.isOpen = false;
  };

  render() {
    return (
      <Dialog maxWidth='xs' fullWidth={true} open={ConfirmBox.isOpen}>
        <DialogTitle>确认框</DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>确认{ConfirmBox.label || ''}</Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={this.cancel}>
            取消
          </Button>
          <Button onClick={this.ok}>确认</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
