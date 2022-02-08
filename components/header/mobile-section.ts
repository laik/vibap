import {styled} from '@mui/material/styles';

export const SectionDesktop = styled('div')(({theme}) => ({
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

export const SectionMobile = styled('div')(({theme}) => ({
  display: 'flex',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

export const NavHeader = styled('div')(({theme}) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));
