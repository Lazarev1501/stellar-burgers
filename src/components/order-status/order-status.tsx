import { FC } from 'react';
import { OrderStatusProps } from './type';
import { OrderStatusUI } from '@ui';

const statusMap: Record<string, { text: string; color: string }> = {
  done: { text: 'Выполнен', color: '#00CCCC' },
  pending: { text: 'Готовится', color: '#E52B1A' },
  created: { text: 'Создан', color: '#F2F2F3' },
  cancelled: { text: 'Отменён', color: '#F2F2F3' }
};

export const OrderStatus: FC<OrderStatusProps> = ({ status }) => {
  const statusInfo = statusMap[status] || { text: status, color: '#F2F2F3' };

  return <OrderStatusUI textStyle={statusInfo.color} text={statusInfo.text} />;
};
