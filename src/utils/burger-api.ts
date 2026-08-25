import { setCookie, getCookie } from './cookie';
import { TIngredient, TOrder, TUser } from './types';

const URL =
  process.env.BURGER_API_URL || 'https://norma.nomoreparties.space/api';

// Улучшенная проверка ответа
const checkResponse = async <T>(res: Response): Promise<T> => {
  // Получаем текст ответа
  const text = await res.text();

  // Проверяем, не пустой ли ответ
  if (!text || text.trim() === '') {
    throw new Error('Пустой ответ от сервера');
  }

  // Проверяем, не HTML ли это
  if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    console.error('Сервер вернул HTML:', text.substring(0, 500));
    throw new Error('Сервер недоступен. Проверьте интернет-соединение.');
  }

  // Пытаемся распарсить JSON
  let data: T;
  try {
    data = JSON.parse(text);
  } catch (parseError) {
    console.error('Ошибка парсинга JSON. Получено:', text.substring(0, 500));
    throw new Error('Сервер вернул некорректный ответ');
  }

  // Проверяем успешность ответа
  if (!res.ok) {
    const error = data as any;
    const message = error?.message || `Ошибка ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return data;
};

type TServerResponse<T> = {
  success: boolean;
} & T;

type TRefreshResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
}>;

// Обновленный refreshToken с обработкой ошибок
export const refreshToken = (): Promise<TRefreshResponse> =>
  fetch(`${URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      token: localStorage.getItem('refreshToken')
    })
  })
    .then(async (res) => {
      const data = await checkResponse<TRefreshResponse>(res);
      if (!data.success) {
        return Promise.reject(new Error('Не удалось обновить токен'));
      }
      localStorage.setItem('refreshToken', data.refreshToken);
      setCookie('accessToken', data.accessToken);
      return data;
    })
    .catch((error) => {
      console.error('Ошибка обновления токена:', error);
      // Очищаем токены при ошибке
      localStorage.removeItem('refreshToken');
      setCookie('accessToken', '', { expires: -1 });
      throw error;
    });

// Обновленный fetchWithRefresh
export const fetchWithRefresh = async <T>(
  url: RequestInfo,
  options: RequestInit
): Promise<T> => {
  try {
    const res = await fetch(url, options);
    return await checkResponse<T>(res);
  } catch (err) {
    const error = err as Error;
    // Проверяем, что это ошибка истекшего токена
    if (error.message === 'jwt expired' || error.message.includes('jwt')) {
      try {
        const refreshData = await refreshToken();
        // Обновляем заголовки с новым токеном
        if (options.headers) {
          (options.headers as { [key: string]: string }).authorization =
            refreshData.accessToken;
        }
        // Повторяем запрос с новым токеном
        const res = await fetch(url, options);
        return await checkResponse<T>(res);
      } catch (refreshError) {
        // Если не удалось обновить токен, перенаправляем на логин
        window.location.href = '/login';
        throw new Error('Сессия истекла. Пожалуйста, войдите заново.');
      }
    }
    throw err;
  }
};

// Остальные функции с улучшенной обработкой

type TIngredientsResponse = TServerResponse<{
  data: TIngredient[];
}>;

type TFeedsResponse = TServerResponse<{
  orders: TOrder[];
  total: number;
  totalToday: number;
}>;

type TOrdersResponse = TServerResponse<{
  data: TOrder[];
}>;

export const getIngredientsApi = async () => {
  try {
    const res = await fetch(`${URL}/ingredients`);
    const data = await checkResponse<TIngredientsResponse>(res);
    if (data?.success) return data.data;
    throw new Error('Не удалось получить ингредиенты');
  } catch (error) {
    console.error('Ошибка получения ингредиентов:', error);
    throw error;
  }
};

export const getFeedsApi = async () => {
  try {
    const res = await fetch(`${URL}/orders/all`);
    const data = await checkResponse<TFeedsResponse>(res);
    if (data?.success) return data;
    throw new Error('Не удалось получить ленту заказов');
  } catch (error) {
    console.error('Ошибка получения ленты:', error);
    throw error;
  }
};

export const getOrdersApi = async () => {
  try {
    const token = getCookie('accessToken');
    if (!token) {
      throw new Error('Не авторизован');
    }
    const data = await fetchWithRefresh<TFeedsResponse>(`${URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: token
      }
    });
    if (data?.success) return data.orders;
    throw new Error('Не удалось получить заказы');
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    throw error;
  }
};

type TNewOrderResponse = TServerResponse<{
  order: TOrder;
  name: string;
}>;

export const orderBurgerApi = async (data: string[]) => {
  try {
    const token = getCookie('accessToken');
    if (!token) {
      throw new Error('Не авторизован');
    }
    const result = await fetchWithRefresh<TNewOrderResponse>(`${URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: token
      },
      body: JSON.stringify({
        ingredients: data
      })
    });
    if (result?.success) return result;
    throw new Error('Не удалось создать заказ');
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    throw error;
  }
};

type TOrderResponse = TServerResponse<{
  orders: TOrder[];
}>;

export const getOrderByNumberApi = async (number: number) => {
  try {
    const res = await fetch(`${URL}/orders/${number}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await checkResponse<TOrderResponse>(res);
  } catch (error) {
    console.error(`Ошибка получения заказа #${number}:`, error);
    throw error;
  }
};

export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

export type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

export const registerUserApi = async (data: TRegisterData) => {
  try {
    const res = await fetch(`${URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    const result = await checkResponse<TAuthResponse>(res);
    if (result?.success) {
      // Сохраняем токены при успешной регистрации
      localStorage.setItem('refreshToken', result.refreshToken);
      setCookie('accessToken', result.accessToken);
      return result;
    }
    throw new Error('Не удалось зарегистрироваться');
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    throw error;
  }
};

export type TLoginData = {
  email: string;
  password: string;
};

export const loginUserApi = async (data: TLoginData) => {
  try {
    console.log('Отправка запроса логина:', `${URL}/auth/login`);
    const res = await fetch(`${URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });

    const result = await checkResponse<TAuthResponse>(res);
    console.log('Ответ сервера:', result);

    if (result?.success) {
      // Сохраняем токены при успешном входе
      localStorage.setItem('refreshToken', result.refreshToken);
      setCookie('accessToken', result.accessToken);
      return result;
    }
    throw new Error('Не удалось войти');
  } catch (error) {
    console.error('Ошибка логина:', error);
    throw error;
  }
};

export const forgotPasswordApi = async (data: { email: string }) => {
  try {
    const res = await fetch(`${URL}/password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    const result = await checkResponse<TServerResponse<{}>>(res);
    if (result?.success) return result;
    throw new Error('Не удалось отправить запрос на восстановление');
  } catch (error) {
    console.error('Ошибка восстановления пароля:', error);
    throw error;
  }
};

export const resetPasswordApi = async (data: {
  password: string;
  token: string;
}) => {
  try {
    const res = await fetch(`${URL}/password-reset/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(data)
    });
    const result = await checkResponse<TServerResponse<{}>>(res);
    if (result?.success) return result;
    throw new Error('Не удалось сбросить пароль');
  } catch (error) {
    console.error('Ошибка сброса пароля:', error);
    throw error;
  }
};

type TUserResponse = TServerResponse<{ user: TUser }>;

export const getUserApi = async () => {
  try {
    const token = getCookie('accessToken');
    if (!token) {
      throw new Error('Не авторизован');
    }
    return await fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: token
      }
    });
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    throw error;
  }
};

export const updateUserApi = async (user: Partial<TRegisterData>) => {
  try {
    const token = getCookie('accessToken');
    if (!token) {
      throw new Error('Не авторизован');
    }
    return await fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        authorization: token
      },
      body: JSON.stringify(user)
    });
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    throw error;
  }
};

export const logoutApi = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    const res = await fetch(`${URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        token: refreshToken
      })
    });
    const result = await checkResponse<TServerResponse<{}>>(res);
    if (result?.success) {
      // Очищаем токены
      localStorage.removeItem('refreshToken');
      setCookie('accessToken', '', { expires: -1 });
      return result;
    }
    throw new Error('Не удалось выйти');
  } catch (error) {
    console.error('Ошибка выхода:', error);
    throw error;
  }
};
