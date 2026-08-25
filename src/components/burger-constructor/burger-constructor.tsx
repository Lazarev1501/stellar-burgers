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
  /** TODO: взять переменные constructorItems, orderRequest и orderModalData из стора */
  const dispatch = useDispatch();
  const constructorItems = useSelector(selectConstructorItems);
  const isRegisteredUser = useSelector(userDataSelector) ? true : false;
  const navigate = useNavigate();

  const orderRequest: boolean = useSelector(selectOrderRequest);

  const orderModalData = useSelector(selectOrderModalData);

  const createDataBurgerForOrder = useMemo(() => {
    const listIngredientsForOrder = constructorItems.ingredients.map(
      (ingredient) => ingredient._id
    );
    if (constructorItems.bun) {
      listIngredientsForOrder.unshift(constructorItems.bun._id);
      listIngredientsForOrder.push(constructorItems.bun._id);
    }
    return listIngredientsForOrder;
  }, [constructorItems]);

  const onOrderClick = () => {
    if (!isRegisteredUser) {
      return navigate('/login');
    }
    if (!constructorItems.bun || orderRequest) return;
    dispatch(orderBurger(createDataBurgerForOrder));
  };

  const closeOrderModal = () => {
    dispatch(closeModalAfterOrderingBurger());
    dispatch(resetConstructorItems());
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
