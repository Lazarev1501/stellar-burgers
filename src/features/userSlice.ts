import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TUser } from '../utils/types';
import {
  loginUserApi,
  getUserApi,
  TRegisterData,
  logoutApi,
  updateUserApi
} from '../utils/burger-api';
import { getCookie, setCookie, deleteCookie } from '../utils/cookie';

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }: Omit<TRegisterData, 'name'>) => {
    const data = await loginUserApi({ email, password });
    setCookie('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (user: { email?: string; name?: string; password?: string }) => {
    const data = await updateUserApi(user);
    return {
      email: data.user.email,
      name: data.user.name
    };
  }
);

export const checkUserAuth = createAsyncThunk(
  'user/checkUser',
  async (_, { dispatch }) => {
    if (getCookie('accessToken')) {
      getUserApi()
        .then((res) => dispatch(setUser(res.user)))
        .finally(() => {
          dispatch(authChecked());
        });
    } else {
      dispatch(authChecked());
    }
  }
);

export const logoutUser = createAsyncThunk('user/logoutUser', async () => {
  await logoutApi();
  deleteCookie('accessToken');
  localStorage.clear();
});

interface TUserState {
  isAuthChecked: boolean;
  data: TUser | null;
  error: string;
}

const initialState: TUserState = {
  isAuthChecked: false,
  data: null,
  error: ''
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    authChecked: (state) => {
      state.isAuthChecked = true;
    },
    setUser: (state, action: PayloadAction<TUser | null>) => {
      state.data = action.payload;
    }
  },
  selectors: {
    userDataSelector: (state) => state.data,
    isAuthCheckedSelector: (state) => state.isAuthChecked,
    errorSelector: (state) => state.error
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.error = '';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = `Ошибка при логировании: ${action.error.message}`;
        deleteCookie('accessToken');
        localStorage.clear();
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = '';
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.data = null;
      });
  }
});

export const { authChecked, setUser } = userSlice.actions;
export const userReducers = userSlice.reducer;
export const { userDataSelector, isAuthCheckedSelector, errorSelector } =
  userSlice.selectors;
