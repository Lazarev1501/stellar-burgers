import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC } from 'react';

import { useEffect } from 'react';
import { getFeedOrders } from '../../features/feedSlice';
import { selectFeedOrders } from '../../features/feedSlice';
import { useSelector, useDispatch } from '../../services/store';

export const Feed: FC = () => {
  /** TODO: взять переменную из стора */
  const orders: TOrder[] = useSelector(selectFeedOrders);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFeedOrders());
  }, []);

  const handleGetFeeds = () => {
    dispatch(getFeedOrders());
  };

  if (!orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
