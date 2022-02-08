import React from 'react';
import {makeStyles} from '@mui/styles';
import {HomeGridCardProps} from './typing';

const useStyles = makeStyles(
  {
    container: {
      minWidth: '100px',
      border: '1px solid #e3e4e6',
      borderRadius: '4px',
      boxShadow: 'none',
      background: '#fff',
      overflow: 'hidden',
      '&:hover': {
        boxShadow: '1px 1px 4px 0 rgba(0,0,0,.13)',
      },
    },
    header: {
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'row',
      WebkitBoxPack: 'justify',
      justifyContent: 'space-between',
      WebkitBoxAlign: 'center',
      alignItems: 'center',
      padding: '0px 16px',
      height: '54px',
      '& h3': {
        margin: 0,
        height: '54px',
        fontSize: '14px',
        lineHeight: '54px',
        fontWeight: 500,
      },
    },
    extra: {},
    body: {},
  },
  {name: 'homeGridCard'}
);

const HomeGridCard: React.FC<HomeGridCardProps> = ({title, children}) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <h3>{title}</h3>
        <div className={classes.extra}></div>
      </div>
      <div className={classes.body}>{children}</div>
    </div>
  );
};

export default HomeGridCard;
