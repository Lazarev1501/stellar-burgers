import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrder } from '../utils/types';
import {
  getOrdersApi,
  getOrderByNumberApi,
  orderBurgerApi
} from '../utils/burger-api';

export const getOrders = createAsyncThunk('orders/getAll', async () => {
  const orders = await getOrdersApi();
  return orders;
});

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
  orderModalData: null
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
    selectOrderData: (state) => state.orderData
  },
  extraReducers: (builder) => {
    builder.addCase(getOrders.fulfilled, (state, action) => {
      state.orders = action.payload;
    });
    builder.addCase(orderBurger.pending, (state) => {
      state.orderRequest = true;
    });
    builder.addCase(orderBurger.rejected, (state) => {
      state.orderRequest = false;
    });
    builder.addCase(orderBurger.fulfilled, (state, action) => {
      state.orderRequest = false;
      state.orderModalData = action.payload.order;
    });
    builder.addCase(getOrder.fulfilled, (state, action) => {
      state.orderData = action.payload[0];
    });
  }
});

export const {
  selectOrders,
  selectOrderRequest,
  selectOrderModalData,
  selectOrderData
} = ordersSlice.selectors;

export const { closeModalAfterOrderingBurger } = ordersSlice.actions;

export const ordersReducers = ordersSlice.reducer;
