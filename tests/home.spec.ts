import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { appUrls } from './testData/urls';

test.describe('Home page', () => {
  test('should display main heading and hero section', async ({ page }) => {
    await page.goto(appUrls.home);

    const mainHeading = page.getByRole('heading', { name: /Rent designer dresses/ });
    await expect(mainHeading).toBeVisible();

    const description = page.getByText(/Look stunning without the price tag/);
    await expect(description).toBeVisible();
  });

  test('should display navigation links', async ({ page }) => {
    await page.goto(appUrls.home);

    await expect(page.getByRole('link', { name: 'Browse' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'How it works' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Featured' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'FAQ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('should navigate to Browse page when clicking Browse link', async ({ page }) => {
    await page.goto(appUrls.home);

    await page.getByRole('link', { name: 'Browse' }).click();
    await page.waitForURL('**/search');

    await expect(page.getByRole('heading', { name: 'Browse catalog' })).toBeVisible();
  });

  test('should navigate to admin login when clicking Admin link', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.navigateToAdmin();
    await page.waitForURL('**/admin/login');

    await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
  });

  test('should display featured items section', async ({ page }) => {
    await page.goto(appUrls.home);

    await expect(page.getByRole('heading', { name: 'Featured picks' })).toBeVisible();

    const featuredItems = page.locator('div').filter({ hasText: /From \$\d+\/day/ });
    await expect(featuredItems.first()).toBeVisible();
  });

  test('should display at least one featured item with details', async ({ page }) => {
    await page.goto(appUrls.home);

    const firstItem = page.locator('div').filter({ hasText: 'Silk Evening Gown' }).first();
    await expect(firstItem).toBeVisible();

    await expect(page.getByText(/From \$\d+\/day/).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'View details' }).first()).toBeVisible();
  });

  test('should navigate to item details when clicking View details', async ({ page }) => {
    await page.goto(appUrls.home);

    await page.getByRole('link', { name: 'View details' }).first().click();
    await page.waitForURL('**/items/**');

    expect(page.url()).toContain('/items/');
  });

  test('should display "How it works" section with 3 steps', async ({ page }) => {
    await page.goto(appUrls.home);

    await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();

    await expect(page.getByText('Browse')).toBeVisible();
    await expect(page.getByText('Rent')).toBeVisible();
    await expect(page.getByText('Return')).toBeVisible();
  });

  test('should display search form with all fields', async ({ page }) => {
    await page.goto(appUrls.home);

    await expect(page.getByPlaceholder(/Search by style, color, or designer/)).toBeVisible();
    await expect(page.locator('input[name="start"]')).toBeVisible();
    await expect(page.locator('input[name="end"]')).toBeVisible();
    await expect(page.locator('select[name="size"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search dresses' })).toBeVisible();
  });

  test('should perform search from home page', async ({ page }) => {
    await page.goto(appUrls.home);

    await page.getByPlaceholder(/Search by style, color, or designer/).fill('silk');
    await page.locator('select[name="size"]').selectOption('M');
    await page.getByRole('button', { name: 'Search dresses' }).click();

    await page.waitForURL('**/search**');
    expect(page.url()).toContain('q=silk');
    expect(page.url()).toContain('size=M');
  });

  test('should display newsletter signup section', async ({ page }) => {
    await page.goto(appUrls.home);

    await expect(page.getByRole('heading', { name: 'Join our newsletter' })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Subscribe' })).toBeVisible();
  });

  test('should display footer with links', async ({ page }) => {
    await page.goto(appUrls.home);

    await expect(page.getByText(/© \d{4} GlamRent/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'Terms' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  });
});
