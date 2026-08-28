import { FC } from 'react';
import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';
import { userDataSelector } from '../../features/userSlice';

export const AppHeader: FC = () => {
  const user = useSelector(userDataSelector);
  const userName = user?.name || '';

  return <AppHeaderUI userName={userName} />;
};
