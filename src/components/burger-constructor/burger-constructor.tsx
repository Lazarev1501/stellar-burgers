import { FC, useMemo } from 'react';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';

import {
  selectConstructorItems,
  resetConstructorItems
} from '../../features/burgerConstructorSlice';
import {
  selectOrderRequest,
  selectOrderModalData,
  orderBurger,
  closeModalAfterOrderingBurger
} from '../../features/ordersSlice';
import { useSelector, useDispatch } from '../../services/store';
import { userDataSelector } from '../../features/userSlice';
import { useNavigate } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();
  const constructorItems = useSelector(selectConstructorItems);
  const isRegisteredUser = useSelector(userDataSelector) ? true : false;
  const navigate = useNavigate();

  const orderRequest: boolean = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);

  const onOrderClick = () => {
    if (!isRegisteredUser) {
      return navigate('/login');
    }
    if (!constructorItems.bun || orderRequest) return;

    const ingredientsIds = constructorItems.ingredients.map(
      (ingredient) => ingredient._id
    );
    if (constructorItems.bun) {
      ingredientsIds.unshift(constructorItems.bun._id);
      ingredientsIds.push(constructorItems.bun._id);
    }

    dispatch(orderBurger(ingredientsIds))
      .unwrap()
      .then(() => {
        dispatch(resetConstructorItems());
      })
      .catch((error) => {
        console.error('Ошибка при оформлении заказа:', error);
      });
  };

  const closeOrderModal = () => {
    dispatch(closeModalAfterOrderingBurger());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
