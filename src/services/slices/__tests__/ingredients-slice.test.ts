import {
  ingredientsReducers,
  getIngredients,
  selectIngredients,
  selectIsIngredientsLoading,
  IIngredientsState
} from '../../../features/ingredientsSlice';
import { TIngredient } from '../../../utils/types';

const mockIngredients: TIngredient[] = [
  {
    _id: '1',
    name: 'Булка',
    type: 'bun',
    proteins: 10,
    fat: 5,
    carbohydrates: 40,
    calories: 300,
    price: 50,
    image: 'image.png',
    image_mobile: 'image-mobile.png',
    image_large: 'image-large.png'
  },
  {
    _id: '2',
    name: 'Котлета',
    type: 'main',
    proteins: 20,
    fat: 15,
    carbohydrates: 10,
    calories: 200,
    price: 100,
    image: 'image2.png',
    image_mobile: 'image2-mobile.png',
    image_large: 'image2-large.png'
  }
];

describe('ingredients slice', () => {
  const initialState: IIngredientsState = {
    isIngredientsLoading: false,
    ingredients: [],
    ingredientData: null
  };

  describe('reducers', () => {
    it('should return the initial state when passed an unknown action', () => {
      const state = ingredientsReducers(undefined, { type: 'UNKNOWN' });
      expect(state).toEqual(initialState);
    });

    it('should handle getIngredients.pending', () => {
      const state = ingredientsReducers(
        initialState,
        getIngredients.pending('')
      );
      expect(state.isIngredientsLoading).toBe(true);
      expect(state.ingredients).toEqual([]);
    });

    it('should handle getIngredients.rejected', () => {
      const state = ingredientsReducers(
        initialState,
        getIngredients.rejected(new Error('Ошибка загрузки'), '')
      );
      expect(state.isIngredientsLoading).toBe(false);
      expect(state.ingredients).toEqual([]);
    });

    it('should handle getIngredients.fulfilled', () => {
      const state = ingredientsReducers(
        initialState,
        getIngredients.fulfilled(mockIngredients, '')
      );
      expect(state.isIngredientsLoading).toBe(false);
      expect(state.ingredients).toEqual(mockIngredients);
    });
  });

  describe('selectors', () => {
    it('should select ingredients', () => {
      const state = {
        ingredients: { ...initialState, ingredients: mockIngredients }
      };
      expect(selectIngredients(state as any)).toEqual(mockIngredients);
    });

    it('should select loading state', () => {
      const state = {
        ingredients: { ...initialState, isIngredientsLoading: true }
      };
      expect(selectIsIngredientsLoading(state as any)).toBe(true);
    });
  });
});
