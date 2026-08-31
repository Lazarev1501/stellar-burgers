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

const mockMain2: TIngredient = {
  _id: '4',
  name: 'Котлета 2',
  type: 'main',
  proteins: 25,
  fat: 18,
  carbohydrates: 12,
  calories: 250,
  price: 120,
  image: 'main2.png',
  image_mobile: 'main2-mobile.png',
  image_large: 'main2-large.png'
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

    describe('addIngredientInConstructor', () => {
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
    });

    describe('deleteIngredientFromConstructor', () => {
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
    });

    describe('moveForwardIngredient', () => {
      it('should move ingredient forward (up) in the list', () => {
        let state = burgerConstructorReducers(
          initialState,
          addIngredientInConstructor(mockMain)
        );
        state = burgerConstructorReducers(
          state,
          addIngredientInConstructor(mockSauce)
        );
        state = burgerConstructorReducers(
          state,
          addIngredientInConstructor(mockMain2)
        );

        expect(state.constructorItems.ingredients[0]._id).toBe(mockMain._id);
        expect(state.constructorItems.ingredients[1]._id).toBe(mockSauce._id);
        expect(state.constructorItems.ingredients[2]._id).toBe(mockMain2._id);

        const stateAfterMove = burgerConstructorReducers(
          state,
          moveForwardIngredient(1)
        );

        expect(stateAfterMove.constructorItems.ingredients[0]._id).toBe(
          mockSauce._id
        );
        expect(stateAfterMove.constructorItems.ingredients[1]._id).toBe(
          mockMain._id
        );
        expect(stateAfterMove.constructorItems.ingredients[2]._id).toBe(
          mockMain2._id
        );
      });

      it('should not move ingredient if index is 0', () => {
        let state = burgerConstructorReducers(
          initialState,
          addIngredientInConstructor(mockMain)
        );
        state = burgerConstructorReducers(
          state,
          addIngredientInConstructor(mockSauce)
        );

        expect(state.constructorItems.ingredients[0]._id).toBe(mockMain._id);
        expect(state.constructorItems.ingredients[1]._id).toBe(mockSauce._id);

        const stateAfterMove = burgerConstructorReducers(
          state,
          moveForwardIngredient(0)
        );

        expect(stateAfterMove.constructorItems.ingredients[0]._id).toBe(
          mockMain._id
        );
        expect(stateAfterMove.constructorItems.ingredients[1]._id).toBe(
          mockSauce._id
        );
      });
    });

    describe('moveBackIngredient', () => {
      it('should move ingredient back (down) in the list', () => {
        let state = burgerConstructorReducers(
          initialState,
          addIngredientInConstructor(mockMain)
        );
        state = burgerConstructorReducers(
          state,
          addIngredientInConstructor(mockSauce)
        );
        state = burgerConstructorReducers(
          state,
          addIngredientInConstructor(mockMain2)
        );

        expect(state.constructorItems.ingredients[0]._id).toBe(mockMain._id);
        expect(state.constructorItems.ingredients[1]._id).toBe(mockSauce._id);
        expect(state.constructorItems.ingredients[2]._id).toBe(mockMain2._id);

        const stateAfterMove = burgerConstructorReducers(
          state,
          moveBackIngredient(1)
        );

        expect(stateAfterMove.constructorItems.ingredients[0]._id).toBe(
          mockMain._id
        );
        expect(stateAfterMove.constructorItems.ingredients[1]._id).toBe(
          mockMain2._id
        );
        expect(stateAfterMove.constructorItems.ingredients[2]._id).toBe(
          mockSauce._id
        );
      });

      it('should not move ingredient if index is last', () => {
        let state = burgerConstructorReducers(
          initialState,
          addIngredientInConstructor(mockMain)
        );
        state = burgerConstructorReducers(
          state,
          addIngredientInConstructor(mockSauce)
        );

        expect(state.constructorItems.ingredients[0]._id).toBe(mockMain._id);
        expect(state.constructorItems.ingredients[1]._id).toBe(mockSauce._id);

        const stateAfterMove = burgerConstructorReducers(
          state,
          moveBackIngredient(1)
        );

        expect(stateAfterMove.constructorItems.ingredients[0]._id).toBe(
          mockMain._id
        );
        expect(stateAfterMove.constructorItems.ingredients[1]._id).toBe(
          mockSauce._id
        );
      });
    });

    describe('resetConstructorItems', () => {
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
});
