import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TUser } from '../utils/types';
import {
  loginUserApi,
  getUserApi,
  TRegisterData,
  logoutApi,
  updateUserApi,
  registerUserApi
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

export const registerUser = createAsyncThunk(
  'user/registerUser',
  async ({ email, password, name }: TRegisterData) => {
    const data = await registerUserApi({ email, password, name });
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

// Исправленный checkUserAuth с использованием return
export const checkUserAuth = createAsyncThunk(
  'user/checkUser',
  async (_, { rejectWithValue }) => {
    if (getCookie('accessToken')) {
      try {
        const res = await getUserApi();
        return res.user; // Возвращаем пользователя
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        deleteCookie('accessToken');
        localStorage.removeItem('refreshToken');
        return rejectWithValue(error);
      }
    }
    return null; // Нет токена — возвращаем null
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
    // используем extraReducers
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
      // Логин
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
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.error = '';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.error = `Ошибка при регистрации: ${action.error.message}`;
        deleteCookie('accessToken');
        localStorage.clear();
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = '';
      })
      // Обновление пользователя
      .addCase(updateUser.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      // Выход
      .addCase(logoutUser.fulfilled, (state) => {
        state.data = null;
      })
      // Проверка авторизации
      .addCase(checkUserAuth.pending, (state) => {
        state.isAuthChecked = false;
        state.error = '';
      })
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.isAuthChecked = true;
        state.data = action.payload; // Автоматически устанавливаем пользователя
      })
      .addCase(checkUserAuth.rejected, (state, action) => {
        state.isAuthChecked = true;
        state.data = null;
        state.error = action.error.message || 'Ошибка при проверке авторизации';
        deleteCookie('accessToken');
        localStorage.removeItem('refreshToken');
      });
  }
});

export const { setUser } = userSlice.actions;
export const userReducers = userSlice.reducer;
export const { userDataSelector, isAuthCheckedSelector, errorSelector } =
  userSlice.selectors;
