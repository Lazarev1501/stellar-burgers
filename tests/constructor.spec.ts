import { test, expect } from '@playwright/test';

test.describe('Конструктор бургера', () => {
  test.beforeEach(async ({ page }) => {
    // Используем HAR для перехвата запроса на ингредиенты
    await page.routeFromHAR('./tests/hars/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });

    // Используем HAR для перехвата запроса на создание заказа
    await page.routeFromHAR('./tests/hars/orders.har', {
      url: '**/api/orders',
      update: false
    });

    // Используем HAR для перехвата запроса на пользователя
    await page.routeFromHAR('./tests/hars/user.har', {
      url: '**/api/auth/user',
      update: false
    });

    // Подставляем фейковые токены авторизации
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'fake-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);

    // Добавляем токен в localStorage (если используется)
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'fake-refresh-token');
    });

    await page.goto('http://localhost:3000');
  });

  test.describe('Добавление ингредиентов в конструктор', () => {
    test('должен добавлять булку в конструктор', async ({ page }) => {
      const bunElement = page.locator('[data-testid="ingredient-bun"]').first();
      await bunElement.click();

      const bunConstructor = page.locator('[data-testid="constructor-bun"]');
      await expect(bunConstructor).toBeVisible();
      await expect(bunConstructor).toContainText('Краторная булка');
    });

    test('должен добавлять начинку в конструктор', async ({ page }) => {
      const mainElement = page
        .locator('[data-testid="ingredient-main"]')
        .first();
      await mainElement.click();

      const ingredientConstructor = page.locator(
        '[data-testid="constructor-ingredient"]'
      );
      await expect(ingredientConstructor).toBeVisible();
      await expect(ingredientConstructor).toContainText('Биокотлета');
    });

    test('должен добавлять несколько ингредиентов в конструктор', async ({
      page
    }) => {
      await page.locator('[data-testid="ingredient-bun"]').first().click();
      await page.locator('[data-testid="ingredient-main"]').first().click();
      await page.locator('[data-testid="ingredient-sauce"]').first().click();

      const bunConstructor = page.locator('[data-testid="constructor-bun"]');
      await expect(bunConstructor).toBeVisible();

      const ingredientsConstructor = page.locator(
        '[data-testid="constructor-ingredient"]'
      );
      await expect(ingredientsConstructor).toHaveCount(2);
    });
  });

  test.describe('Работа модальных окон', () => {
    test('должен открывать модальное окно ингредиента', async ({ page }) => {
      await page.locator('[data-testid="ingredient-main"]').first().click();

      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Детали ингредиента');
    });

    test('должен закрывать модальное окно по клику на крестик', async ({
      page
    }) => {
      await page.locator('[data-testid="ingredient-main"]').first().click();
      await page.locator('[data-testid="modal-close"]').click();

      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).not.toBeVisible();
    });

    test('должен закрывать модальное окно по клику на оверлей', async ({
      page
    }) => {
      await page.locator('[data-testid="ingredient-main"]').first().click();
      await page.locator('[data-testid="modal-overlay"]').click();

      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).not.toBeVisible();
    });

    test('должен отображать данные именно того ингредиента, по которому кликнули', async ({
      page
    }) => {
      await page.locator('[data-testid="ingredient-main"]').first().click();

      const modal = page.locator('[data-testid="modal"]');
      await expect(modal).toBeVisible();
      await expect(modal).toContainText('Биокотлета из марсианской Магнолии');
    });
  });

  test.describe('Создание заказа', () => {
    test('должен успешно создавать заказ и показывать номер', async ({
      page
    }) => {
      await page.locator('[data-testid="ingredient-bun"]').first().click();
      await page.locator('[data-testid="ingredient-main"]').first().click();

      await page.locator('[data-testid="order-button"]').click();

      const orderModal = page.locator('[data-testid="order-modal"]');
      await expect(orderModal).toBeVisible();
      await expect(orderModal).toContainText('109422'); // ✅ Исправлено!
    });

    test('должен очищать конструктор после создания заказа', async ({
      page
    }) => {
      await page.locator('[data-testid="ingredient-bun"]').first().click();
      await page.locator('[data-testid="ingredient-main"]').first().click();

      await page.locator('[data-testid="order-button"]').click();
      await page.locator('[data-testid="order-modal"]').waitFor();

      await page.locator('[data-testid="modal-close"]').click();

      const bunConstructor = page.locator('[data-testid="constructor-bun"]');
      await expect(bunConstructor).not.toBeVisible();

      const ingredientsConstructor = page.locator(
        '[data-testid="constructor-ingredient"]'
      );
      await expect(ingredientsConstructor).toHaveCount(0);
    });
  });
});