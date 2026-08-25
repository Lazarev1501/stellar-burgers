import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from '../utils/types';
import { getFeedsApi } from '../utils/burger-api';

export const getFeedOrders = createAsyncThunk('feedOrders/getAll', async () => {
  const orders = await getFeedsApi();
  return orders;
});

export interface IFeedState {
  orders: TOrder[];
  total: number;
  totalToday: number;
}

const initialState: IFeedState = {
  orders: [],
  total: 0,
  totalToday: 0
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  selectors: {
    selectFeedOrders: (state) => state.orders,
    selectTotalFeedOrders: (state) => state.total,
    selectTotalTodayFeedOrders: (state) => state.totalToday
  },
  extraReducers: (builder) => {
    builder.addCase(getFeedOrders.fulfilled, (state, action) => {
      state.orders = action.payload.orders;
      state.total = action.payload.total;
      state.totalToday = action.payload.totalToday;
    });
  }
});

export const {
  selectFeedOrders,
  selectTotalFeedOrders,
  selectTotalTodayFeedOrders
} = feedSlice.selectors;

export const feedReducers = feedSlice.reducer;
