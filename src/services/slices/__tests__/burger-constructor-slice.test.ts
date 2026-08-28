import {
  burgerConstructorReducers,
  addIngredientInConstructor,
  deleteIngredientFromConstructor,
  moveForwardIngredient,
  moveBackIngredient,
  resetConstructorItems,
  IBurgerConstructorSliceState
} from '../../../features/burgerConstructorSlice';
import { TIngredient } from '../../../utils/types';

const mockBun: TIngredient = {
  _id: '1',
  name: 'Краторная булка',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'bun.png',
  image_mobile: 'bun-mobile.png',
  image_large: 'bun-large.png'
};

const mockMain: TIngredient = {
  _id: '2',
  name: 'Котлета',
  type: 'main',
  proteins: 20,
  fat: 15,
  carbohydrates: 10,
  calories: 200,
  price: 100,
  image: 'main.png',
  image_mobile: 'main-mobile.png',
  image_large: 'main-large.png'
};

const mockSauce: TIngredient = {
  _id: '3',
  name: 'Соус',
  type: 'sauce',
  proteins: 5,
  fat: 10,
  carbohydrates: 15,
  calories: 50,
  price: 30,
  image: 'sauce.png',
  image_mobile: 'sauce-mobile.png',
  image_large: 'sauce-large.png'
};

describe('burgerConstructor slice', () => {
  const initialState: IBurgerConstructorSliceState = {
    constructorItems: {
      bun: null,
      ingredients: []
    }
  };

  describe('reducers', () => {
    it('should return the initial state when passed an unknown action', () => {
      const state = burgerConstructorReducers(undefined, { type: 'UNKNOWN' });
      expect(state).toEqual(initialState);
    });

    it('should add a bun to constructor', () => {
      const action = addIngredientInConstructor(mockBun);
      const state = burgerConstructorReducers(initialState, action);

      expect(state.constructorItems.bun).toBeDefined();
      expect(state.constructorItems.bun?._id).toBe(mockBun._id);
      expect(state.constructorItems.bun?.type).toBe('bun');
      expect(state.constructorItems.bun?.id).toBeDefined();
      expect(state.constructorItems.ingredients).toHaveLength(0);
    });

    it('should add a main ingredient to constructor', () => {
      const action = addIngredientInConstructor(mockMain);
      const state = burgerConstructorReducers(initialState, action);

      expect(state.constructorItems.ingredients).toHaveLength(1);
      expect(state.constructorItems.ingredients[0]._id).toBe(mockMain._id);
      expect(state.constructorItems.ingredients[0].type).toBe('main');
      expect(state.constructorItems.ingredients[0].id).toBeDefined();
      expect(state.constructorItems.bun).toBeNull();
    });

    it('should delete an ingredient by id', () => {
      const stateWithIngredient = burgerConstructorReducers(
        initialState,
        addIngredientInConstructor(mockMain)
      );
      const ingredientId =
        stateWithIngredient.constructorItems.ingredients[0].id;
      const state = burgerConstructorReducers(
        stateWithIngredient,
        deleteIngredientFromConstructor(ingredientId!)
      );

      expect(state.constructorItems.ingredients).toHaveLength(0);
    });

    it('should reset constructor to initial state', () => {
      let state = burgerConstructorReducers(
        initialState,
        addIngredientInConstructor(mockBun)
      );
      state = burgerConstructorReducers(
        state,
        addIngredientInConstructor(mockMain)
      );

      expect(state.constructorItems.bun).toBeDefined();
      expect(state.constructorItems.ingredients).toHaveLength(1);

      const resetState = burgerConstructorReducers(
        state,
        resetConstructorItems()
      );
      expect(resetState).toEqual(initialState);
    });
  });
});
