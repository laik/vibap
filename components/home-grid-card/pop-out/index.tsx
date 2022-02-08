import React, {useEffect, useMemo} from 'react';
import ReactDOM from 'react-dom';

interface IProps {
  children: React.ReactNode;
  visible?: boolean;
}

const PopOut: React.FC<IProps> = ({children, visible}: IProps) => {
  const el = useMemo(() => {
    if (!visible) return null;
    const d = document.createElement('div');
    d.style.cssText = 'position: absolute; top: 0px; left: 0px; width: 100%;';
    return d;
  }, [visible]);

  useEffect(() => {
    if (el && visible) {
      document.body.appendChild(el);
    }
    return () => {
      if (el && visible) document.body.removeChild(el);
    };
  }, [el, visible]);

  if (!visible || !el) return null;

  return ReactDOM.createPortal(children, el);
};

export default PopOut;
