import { TIngredient } from '@utils-types';

export type TBurgerIngredientProps = {
  ingredient: TIngredient;
  count: number;
  dataTestId?: string; // Добавляем опциональный data-testid
};
