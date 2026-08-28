import { ProtectedRouteProps } from './type';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '../../services/store';
import {
  userDataSelector,
  isAuthCheckedSelector
} from '../../features/userSlice';
import { Preloader } from '../ui/preloader';

export const ProtectedRoute = ({
  // onlyUnAuth = false(доступ не для авторизованных)
  onlyUnAuth = false,
  children
}: ProtectedRouteProps) => {
  // isAuthCheckedSelector — селектор получения состояния загрузки пользователя
  const isAuthChecked = useSelector(isAuthCheckedSelector);
  const user = useSelector(userDataSelector);
  const location = useLocation();

  // пока идёт чекаут пользователя, показываем прелоадер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate replace to='/login' state={{ from: location }} />;
  }

  if (onlyUnAuth && user) {
    const from = location.state?.from || { pathname: '/' };
    return <Navigate replace to={from} />;
  }

  return children;
};
