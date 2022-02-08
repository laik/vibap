import {withRouter as NextjsWithRouter} from 'next/router';

// https://nextjs.org/docs/api-reference/next/router#withrouter
// 重写 nextjs router withRouter 函数签名
export function withRouter(ComposedComponent): any {
  return NextjsWithRouter(ComposedComponent);
}
