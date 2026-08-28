import { test, expect } from '@playwright/test';
import { mockIngredients, mockUserResponse, mockOrderResponse } from './mocks';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Перехватываем запрос на получение ингредиентов
    await page.route('**/api/ingredients', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockIngredients })
      });
    });

    // Перехватываем запрос на получение пользователя
    await page.route('**/api/auth/user', async (route) => {
      const token = await page.evaluate(() => document.cookie);
      if (token.includes('accessToken')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, user: mockUserResponse })
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'Unauthorized' })
        });
      }
    });

    // Перехватываем запрос на создание заказа
    await page.route('**/api/orders', async (route) => {
      // Подставляем моковый токен
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          order: mockOrderResponse,
          name: 'Флюоресцентный бургер'
        })
      });
    });

    // Устанавливаем моковые куки для авторизации
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'mock-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.goto('http://localhost:3000');
  });

  test.describe('Добавление ингредиентов в конструктор', () => {
    test('должен добавлять булку в конструктор', async ({ page }) => {
      // Находим булку в списке ингредиентов
      const bunElement = page.locator('[data-testid="ingredient-bun"]').first();
      await bunElement.click();

      // Проверяем, что булка добавилась в конструктор
      const bunConstructor = page.locator('[data-testid="constructor-bun"]');
      await expect(bunConstructor).toBeVisible();
      await expect(bunConstructor).toContainText('Краторная булка');
    });

    test('должен добавлять начинку в конструктор', async ({ page }) => {
      // Находим начинку в списке ингредиентов
      const mainElement = page.locator('[data-testid="ingredient-main"]').first();
      await mainElement.click();

      // Проверяем, что начинка добавилась в конструктор
      const ingredientConstructor = page.locator('[data-testid="constructor-ingredient"]');
      await expect(ingredientConstructor).toBeVisible();
      await expect(ingredientConstructor).toContainText('Биокотлета');
    });

    test('должен добавлять несколько ингредиентов в конструктор', async ({ page }) => {
      // Добавляем булку
      await page.locator('[data-testid="ingredient-bun"]').first().click();
      
      // Добавляем начинку
      await page.locator('[data-testid="ingredient-main"]').first().click();
      
      // Добавляем соус
      await page.locator('[data-testid="ingredient-sauce"]').first().click();

      // Проверяем, что все ингредиенты добавились
      const bunConstructor = page.locator('[data-testid="constructor-bun"]');
      await expect(bunConstructor).toBeVisible();

      const ingredientsConstructor = page.locator('[data-testid="constructor-ingredient"]');
      await expect(ingredientsConstructor).toHaveCount(2);
    });
  });

  test.describe('Работа модальных окон', () => {
    test('должен открывать модальное окно ингредиента', async ({ page }) => {
      // Кликаем на ингредиент
      await page.locator('[data-testid="ingredient-main"]').first().click();

      // Проверяем, что модальное окно открылось
      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Детали ингредиента');
    });

    test('должен закрывать модальное окно по клику на крестик', async ({ page }) => {
      // Открываем модальное окно
      await page.locator('[data-testid="ingredient-main"]').first().click();
      
      // Кликаем на крестик
      await page.locator('[data-testid="modal-close"]').click();

      // Проверяем, что модальное окно закрылось
      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).not.toBeVisible();
    });

    test('должен закрывать модальное окно по клику на оверлей', async ({ page }) => {
      // Открываем модальное окно
      await page.locator('[data-testid="ingredient-main"]').first().click();
      
      // Кликаем на оверлей (фон)
      await page.locator('[data-testid="modal-overlay"]').click();

      // Проверяем, что модальное окно закрылось
      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Создание заказа', () => {
    test('должен успешно создавать заказ', async ({ page }) => {
      // Добавляем булку
      await page.locator('[data-testid="ingredient-bun"]').first().click();
      
      // Добавляем начинку
      await page.locator('[data-testid="ingredient-main"]').first().click();

      // Нажимаем кнопку "Оформить заказ"
      await page.locator('[data-testid="order-button"]').click();

      // Проверяем, что модальное окно с заказом открылось
      const orderModal = page.locator('[data-testid="order-modal"]');
      await expect(orderModal).toBeVisible();
      
      // Проверяем номер заказа
      await expect(orderModal).toContainText('12345');
    });

    test('должен очищать конструктор после создания заказа', async ({ page }) => {
      // Добавляем булку
      await page.locator('[data-testid="ingredient-bun"]').first().click();
      
      // Добавляем начинку
      await page.locator('[data-testid="ingredient-main"]').first().click();

      // Нажимаем кнопку "Оформить заказ"
      await page.locator('[data-testid="order-button"]').click();

      // Ждем появления модального окна
      await page.locator('[data-testid="order-modal"]').waitFor();

      // Закрываем модальное окно
      await page.locator('[data-testid="modal-close"]').click();

      // Проверяем, что конструктор пуст
      const bunConstructor = page.locator('[data-testid="constructor-bun"]');
      await expect(bunConstructor).not.toBeVisible();

      const ingredientsConstructor = page.locator('[data-testid="constructor-ingredient"]');
      await expect(ingredientsConstructor).toHaveCount(0);
    });
  });
});