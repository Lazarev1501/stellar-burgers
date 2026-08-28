import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { ingredientsReducers } from '../features/ingredientsSlice';
import { feedReducers } from '../features/feedSlice';
import { burgerConstructorReducers } from '../features/burgerConstructorSlice';
import { userReducers } from '../features/userSlice';
import { ordersReducers } from '../features/ordersSlice';

import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

const rootReducer = combineReducers({
  ingredients: ingredientsReducers,
  feed: feedReducers,
  burger: burgerConstructorReducers,
  user: userReducers,
  orders: ordersReducers
});

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export default store;
