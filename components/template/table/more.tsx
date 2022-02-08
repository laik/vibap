import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useState } from 'react';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';

export interface MoreMenuProps {
  items: any[];
}

// more button menu
export function MoreMenu(props: MoreMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        id='more-button'
        aria-controls='more-menu'
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        <Typography
          variant={'inherit'}
          align={'center'}
          noWrap
          sx={{fontWeight: 500}}
        >
          操作
        </Typography>
      </Button>
      <Menu
        id='more-menu'
        MenuListProps={{
          'aria-labelledby': 'more-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {props.items.map(item => (
          <MenuItem
            key={item.label}
            dense
            onClick={() => {
              item.onClick();
              handleClose();
            }}
          >
            <Typography variant={'inherit'} align={'center'} noWrap>
              {item.label}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
