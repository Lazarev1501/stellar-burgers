import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient } from '../utils/types';
import { getIngredientsApi } from '../utils/burger-api';

export const getIngredients = createAsyncThunk(
  'ingredients/getAll',
  async () => {
    const ingredients = await getIngredientsApi();
    return ingredients;
  }
);

export interface IIngredientsState {
  isIngredientsLoading: boolean;
  ingredients: TIngredient[];
  ingredientData: TIngredient | null;
}

const initialState: IIngredientsState = {
  isIngredientsLoading: false,
  ingredients: [],
  ingredientData: null
};

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  selectors: {
    selectIngredients: (state) => state.ingredients,
    selectIsIngredientsLoading: (state) => state.isIngredientsLoading
  },
  extraReducers: (builder) => {
    builder.addCase(getIngredients.pending, (state) => {
      state.isIngredientsLoading = true;
    });
    builder.addCase(getIngredients.rejected, (state) => {
      state.isIngredientsLoading = false;
    });
    builder.addCase(getIngredients.fulfilled, (state, action) => {
      state.isIngredientsLoading = false;
      state.ingredients = action.payload;
    });
  }
});

export const { selectIngredients, selectIsIngredientsLoading } =
  ingredientsSlice.selectors;

export const {} = ingredientsSlice.actions;

export const ingredientsReducers = ingredientsSlice.reducer;
