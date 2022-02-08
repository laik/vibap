import React, {useState, useRef, useCallback} from 'react';
import {makeStyles} from '@mui/styles';
import PopOut from './pop-out';
import {
  WidgetHomeResourcesOverviewProps,
  ResourceListItemProps,
} from './typing';

const useStyles = makeStyles(
  {
    container: {
      position: 'relative',
    },
    ctn: {
      padding: '0 16px 0',
      marginBottom: '16px',
    },
    title: {lineHeight: '20px'},
    titleMain: {
      fontSize: '12px',
      fontWeight: 600,
      color: '#555',
      display: 'inline-block',
    },
    items: {
      display: 'flex',
      flexWrap: 'wrap',
      margin: '0 -4px',
    },
    feedbackHint: {
      marginTop: '8px',
      display: 'block',
      fontWeight: 400,
      color: '#555',
    },
    resourceListItem: {
      position: 'relative',
      width: 'calc(12.5% - 8px)',
      height: '78px',
      margin: '4px',
    },
    resourceListItemMain: {
      textDecoration: 'none',
      cursor: 'pointer',
      height: '100%',
    },
    resource: {
      height: '100%',
      border: '1px solid transparent',
      padding: '12px',
      borderRadius: '4px',
      color: '#555',
      fontSize: '12px',
      background: '#f7f9fa',
      '&:hover': {
        border: '1px solid #c0c6cc',
        borderColor: '#c0c6cc',
        boxShadow: '0 2px 4px 0 #00000029',
      },
      '& h2': {
        margin: 0,
        fontSize: '24px',
        color: '#333',
        lineHeight: '36px',
        fontWeight: 500,
      },
    },
    resourceTypeTitle: {
      display: 'flex',
      '& > :first-child': {
        flex: '1 1 auto',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '& > :last-child': {
        flex: '0 0 auto',
      },
    },
    resourceRegionOverlay: {
      position: 'absolute',
      width: '279px',
      padding: '16px',
      border: '1px solid #c0c6cc',
      boxShadow: '0 4px 8px 0 rgb(0 0 0 / 16%)',
      borderRadius: '4px',
      backgroundColor: '#fff',
      transition: 'all 0.3s cubic-bezier(0.250, 0.460, 0.450, 0.940)',
      '&.opened': {
        transform: 'translateY(10px)',
      },
    },
    resourceRegionTitle: {
      fontSize: '14px',
      color: '#333',
      lineHeight: '22px',
      marginBottom: '12px',
    },
    resourceRegionContainer: {
      display: 'block',
      marginBottom: '4px',
      cursor: 'pointer',
      textDecoration: 'none',
      '&:hover span': {
        textDecoration: 'underline',
      },
    },
    resourceRegionLabel: {
      fontSize: '12px',
      lineHeight: '22px',
      color: '#333',
    },
    resourceRegionCount: {
      fontSize: '12px',
      color: '#333',
      float: 'right',
    },
  },
  {name: 'widgetHomeResourcesOverview'}
);

const WidgetHomeResourcesOverview: React.FC<WidgetHomeResourcesOverviewProps> =
  ({title, feedbackHint, items}) => {
    const classes = useStyles();
    return (
      <div className={classes.container}>
        <div className={classes.ctn}>
          {title && (
            <div className={classes.title}>
              <div className={classes.titleMain}>{title}</div>
            </div>
          )}
          <div className={classes.items}>
            {items.map((item: ResourceListItemProps, i) => {
              return <ResourceListItem key={i} {...item} />;
            })}
          </div>
          {feedbackHint && (
            <div className={classes.feedbackHint}>{feedbackHint}</div>
          )}
        </div>
      </div>
    );
  };

const ResourceListItem: React.FC<ResourceListItemProps> = ({
  label,
  value,
  overlay,
  icon,
  onClick,
}) => {
  const classes = useStyles();
  const [show, setShow] = useState(false);
  const [opened, setOpened] = useState(false);

  const ref = useRef(null);
  const Timer = useRef(null);
  const [listStyle, setListStyle] = useState<React.CSSProperties | undefined>(
    undefined
  );
  const updateShow = useCallback(
    e => {
      if (!overlay || !(overlay?.items?.length > 0)) return;
      if (Timer.current) clearTimeout(Timer.current);
      const i = ref.current.getBoundingClientRect();

      setListStyle({
        position: 'absolute',
        left: i.left,
        top: i.top + i.height - 5,
      });
      setShow(true);
      setTimeout(() => {
        setOpened(true);
      }, 30);
    },
    [overlay]
  );

  return (
    <div
      className={classes.resourceListItem}
      ref={ref}
      onMouseEnter={updateShow}
      onMouseLeave={() => {
        if (!overlay || !(overlay?.items?.length > 0)) return;
        Timer.current = setTimeout(() => {
          setOpened(false);
          setTimeout(() => {
            setShow(false);
          }, 30);
          Timer.current = null;
        }, 50);
      }}
      onClick={() => {
        onClick();
      }}
    >
      <div className={classes.resourceListItemMain}>
        <div className={classes.resource}>
          <div className={classes.resourceTypeTitle}>
            <span>{label}</span>
            <span>{icon}</span>
          </div>
          <h2>{value}</h2>
        </div>
      </div>
      <PopOut visible={show}>
        <div
          className={`${classes.resourceRegionOverlay}${
            opened ? ' opened' : ''
          }`}
          style={listStyle}
          onMouseEnter={updateShow}
        >
          {overlay?.title && (
            <div className={classes.resourceRegionTitle}>{overlay.title}</div>
          )}
          {Array.isArray(overlay?.items) &&
            overlay.items.map((item, i) => {
              return (
                <div
                  key={i}
                  className={classes.resourceRegionContainer}
                  onClick={() => {
                    if (typeof item.onClick === 'function') item.onClick(item);
                  }}
                >
                  <span className={classes.resourceRegionLabel}>
                    {item.label}
                  </span>
                  <span className={classes.resourceRegionCount}>
                    {item.value}
                  </span>
                </div>
              );
            })}
        </div>
      </PopOut>
    </div>
  );
};

export default WidgetHomeResourcesOverview;
