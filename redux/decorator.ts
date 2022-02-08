import {MapDispatchToPropsParam, connect as ConnectRedux} from 'react-redux';

export function connect<TDispatchProps = {}, TOwnProps = any>(
  mapStateToProps?: (state: any, ownProps?: TOwnProps) => any,
  mapDispatchToProps?: MapDispatchToPropsParam<TDispatchProps, TOwnProps>
): any {
  return ConnectRedux(mapStateToProps, mapDispatchToProps);
}
