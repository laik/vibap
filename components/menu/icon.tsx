import Icon from '@mui/material/Icon';

// 图标
export const icon = (
  icon: React.ReactElement | string,
  fontSize: 'small' | 'inherit' | 'large' | 'medium' = 'small'
) => {
  if (typeof icon == 'string') {
    return (
      <Icon baseClassName='material-icons-outlined' fontSize={fontSize}>
        {icon}
      </Icon>
    );
  }
  return icon;
};
