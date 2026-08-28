import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '../utils/types';
import {
  getOrdersApi,
  getOrderByNumberApi,
  orderBurgerApi
} from '../utils/burger-api';

export const getOrders = createAsyncThunk('orders/getAll', getOrdersApi);

export const getOrder = createAsyncThunk(
  'order/getOrderByNumber',
  async (number: number) => {
    const order = await getOrderByNumberApi(number);
    return order.orders;
  }
);

export const orderBurger = createAsyncThunk(
  'order/createОrderBurger',
  async (numberOrder: string[]) => {
    const order = await orderBurgerApi(numberOrder);
    return order;
  }
);

export interface IOrdersState {
  orders: TOrder[];
  orderData: TOrder;
  orderRequest: boolean;
  orderModalData: TOrder | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: IOrdersState = {
  orders: [],
  orderData: {
    _id: '',
    ingredients: [],
    status: '',
    name: '',
    createdAt: '',
    updatedAt: '',
    number: 0
  },
  orderRequest: false,
  orderModalData: null,
  isLoading: false,
  error: null
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    closeModalAfterOrderingBurger: (state) => {
      state.orderModalData = null;
    }
  },
  selectors: {
    selectOrders: (state) => state.orders,
    selectOrderRequest: (state) => state.orderRequest,
    selectOrderModalData: (state) => state.orderModalData,
    selectOrderData: (state) => state.orderData,
    selectIsLoading: (state) => state.isLoading,
    selectOrdersError: (state) => state.error
  },
  extraReducers: (builder) => {
    builder
      // Обработка getOrders
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Ошибка при загрузке заказов';
      })
      // Обработка orderBurger
      .addCase(orderBurger.pending, (state) => {
        state.orderRequest = true;
      })
      .addCase(orderBurger.rejected, (state) => {
        state.orderRequest = false;
      })
      .addCase(orderBurger.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload.order;
      })
      // Обработка getOrder
      .addCase(getOrder.fulfilled, (state, action) => {
        state.orderData = action.payload[0];
      });
  }
});

export const {
  selectOrders,
  selectOrderRequest,
  selectOrderModalData,
  selectOrderData,
  selectIsLoading,
  selectOrdersError
} = ordersSlice.selectors;

export const { closeModalAfterOrderingBurger } = ordersSlice.actions;

export const ordersReducers = ordersSlice.reducer;
