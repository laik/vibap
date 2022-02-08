import React from 'react';
import {reaction} from 'mobx';
import {disposeOnUnmount, observer} from 'mobx-react';
import Terminal from './terminal';
import {terminalStore} from './terminal.store';
import {IDockTab} from '../dock.store';

interface TerminalWindowProps {
  tab: IDockTab;
  height: number;
}

@observer
export default class TerminalWindow extends React.Component<TerminalWindowProps> {
  public elem: HTMLElement;
  public terminal: Terminal;

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(
        () => this.props.tab.id,
        tabId => this.activate(tabId),
        {
          fireImmediately: true,
        }
      ),
    ]);
  }

  activate(tabId) {
    if (this.terminal) this.terminal.detach();
    this.terminal = terminalStore.getTerminal(tabId);
    this.terminal.attachTo(this.elem);
  }

  render() {
    const {height} = this.props;
    return (
      <div
        style={{height: height, marginLeft: 10}}
        ref={e => (this.elem = e)}
      />
    );
  }
}
