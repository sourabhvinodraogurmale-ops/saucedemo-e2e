const { test, expect } = require('@playwright/test');

const PRODUCT = { name: 'Sauce Labs Backpack', slug: 'sauce-labs-backpack', price: 29.99 };
const BUYER = { first: 'Sourabh', last: 'Gurmale', zip: '411001' };

test.describe('Purchase flow (standard_user)', () => {
  test.beforeEach(async ({ page }) => {
    // Fresh browser context per test => empty localStorage => isolated cart state
    await page.goto('/');
    await page.getByTestId('username').fill('standard_user');
    await page.getByTestId('password').fill('secret_sauce');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('login -> add product -> checkout -> order confirmation', async ({ page }) => {
    await test.step('add product to cart', async () => {
      await page.getByTestId(`add-to-cart-${PRODUCT.slug}`).click();
      await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
      await expect(page.getByTestId(`remove-${PRODUCT.slug}`)).toBeVisible();
    });

    await test.step('cart shows the selected product', async () => {
      await page.getByTestId('shopping-cart-link').click();
      await expect(page).toHaveURL(/cart\.html/);
      await expect(page.getByTestId('inventory-item-name')).toHaveText(PRODUCT.name);
      await expect(page.getByTestId('inventory-item-price')).toHaveText(`$${PRODUCT.price}`);
      await page.getByTestId('checkout').click();
    });

    await test.step('enter customer information', async () => {
      await page.getByTestId('firstName').fill(BUYER.first);
      await page.getByTestId('lastName').fill(BUYER.last);
      await page.getByTestId('postalCode').fill(BUYER.zip);
      await page.getByTestId('continue').click();
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('overview totals are calculated correctly', async () => {
      const money = async (id) =>
        parseFloat((await page.getByTestId(id).innerText()).replace(/[^0-9.]/g, ''));
      const subtotal = await money('subtotal-label');
      const tax = await money('tax-label');
      const total = await money('total-label');
      expect(subtotal).toBeCloseTo(PRODUCT.price, 2);
      expect(subtotal + tax).toBeCloseTo(total, 2);
    });

    await test.step('finish and verify confirmation', async () => {
      await page.getByTestId('finish').click();
      await expect(page).toHaveURL(/checkout-complete\.html/);
      await expect(page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
      await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
      await page.getByTestId('back-to-products').click();
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });

  test('checkout blocks missing customer information', async ({ page }) => {
    await page.getByTestId(`add-to-cart-${PRODUCT.slug}`).click();
    await page.getByTestId('shopping-cart-link').click();
    await page.getByTestId('checkout').click();
    await page.getByTestId('continue').click();
    await expect(page.getByTestId('error')).toContainText('First Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });
});
