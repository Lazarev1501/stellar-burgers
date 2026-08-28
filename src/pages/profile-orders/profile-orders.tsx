import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC } from 'react';

import { useSelector, useDispatch } from '../../services/store';
import {
  selectOrders,
  selectIsLoading,
  selectOrdersError,
  getOrders
} from '../../features/ordersSlice';
import { useEffect } from 'react';
import { Preloader } from '@ui';

export const ProfileOrders: FC = () => {
  const orders: TOrder[] = useSelector(selectOrders);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectOrdersError);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getOrders());
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return <p className='text text_type_main-default'>Ошибка: {error}</p>;
  }

  if (!orders.length) {
    return (
      <p className='text text_type_main-default'>У вас пока нет заказов</p>
    );
  }

  return <ProfileOrdersUI orders={orders} />;
};
