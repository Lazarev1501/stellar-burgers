import { TOrder } from '@utils-types';

export type BurgerConstructorUIProps = {
  constructorItems: any;
  orderRequest: boolean;
  price: number;
  orderModalData: TOrder | null;
  onOrderClick: () => void;
  closeOrderModal: () => void;
  constructorTestId?: string; // Добавляем опциональный data-testid для конструктора
  orderButtonTestId?: string; // Добавляем опциональный data-testid для кнопки
};
