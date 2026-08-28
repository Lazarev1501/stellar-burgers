import { TConstructorIngredient } from '@utils-types';

export type BurgerConstructorElementProps = {
  ingredient: TConstructorIngredient;
  index: number;
  totalItems: number;
  dataTestId?: string; // Добавляем опциональный data-testid
};
