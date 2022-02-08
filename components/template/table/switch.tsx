import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Fade from '@mui/material/Fade';
import {useState} from 'react';

export interface Swicth {
  title: string;
  value: boolean;
  onClick: () => void;
}

export interface SwitchMenuProps {
  title: string;
  items: Swicth[];
}

// switch button menu
export function SwitchMenu(props: SwitchMenuProps) {
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
        sx={{mr: 1, ml: 1}}
        id='switch-button'
        aria-controls='switch-menu'
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {props.title || ''}
      </Button>
      <Menu
        id='switch-menu'
        MenuListProps={{
          'aria-labelledby': 'switch-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
      >
        {props.items.map(item => (
          <MenuItem dense key={item.title}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.value}
                    onClick={() => item.onClick()}
                  />
                }
                label={
                  <Typography variant={'inherit'} align={'center'} noWrap>
                    {item.title}
                  </Typography>
                }
              />
            </FormGroup>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
