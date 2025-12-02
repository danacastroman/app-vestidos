import { test, expect } from '@playwright/test';
import { SearchPage } from './pages/SearchPage';

test.describe('Search and Browse', () => {
  test('should display search page with all filter options', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await searchPage.expectPageVisible();
    await expect(searchPage.searchInput).toBeVisible();
    await expect(searchPage.categorySelect).toBeVisible();
    await expect(searchPage.sizeInput).toBeVisible();
    await expect(searchPage.colorInput).toBeVisible();
    await expect(searchPage.styleInput).toBeVisible();
    await expect(searchPage.searchButton).toBeVisible();
  });

  test('should display items grid when no filters applied', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await searchPage.expectItemsVisible();
  });

  test('E2E-011: should filter items by category - Dresses', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await searchPage.filterByCategory('dress');
    await page.waitForURL('**/search?q=&category=dress&size=&color=&style=');

    expect(page.url()).toContain('category=dress');
  });

  test('E2E-012: should filter items by category - Shoes', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await searchPage.filterByCategory('shoes');
    await page.waitForURL('**/search?q=&category=shoes&size=&color=&style=');

    expect(page.url()).toContain('category=shoes');
  });

  test('E2E-010: should apply multiple filters at once', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await searchPage.applyFilters({
      query: 'dress',
      category: 'dress',
      size: 'M',
      color: 'black',
      style: 'cocktail',
    });

    await page.waitForURL('**/search**');
    const url = page.url();

    expect(url).toContain('q=dress');
    expect(url).toContain('category=dress');
    expect(url).toContain('size=M');
    expect(url).toContain('color=black');
    expect(url).toContain('style=cocktail');
  });

  test('should display item cards with required information', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    const firstItem = page.locator('div').filter({ hasText: /From \$\d+\/day/ }).first();
    await expect(firstItem).toBeVisible();

    await expect(page.getByRole('link', { name: 'View details' }).first()).toBeVisible();
  });

  test('should navigate to item details when clicking View details', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await page.getByRole('link', { name: 'View details' }).first().click();
    await page.waitForURL('**/items/**');

    expect(page.url()).toContain('/items/');
  });

  test('should maintain filter values after applying search', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    await searchPage.applyFilters({
      query: 'silk',
      size: 'L',
    });

    await page.waitForURL('**/search**');

    await expect(searchPage.searchInput).toHaveValue('silk');
    await expect(searchPage.sizeInput).toHaveValue('L');
  });

  test('should display category options in dropdown', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    const options = await searchPage.categorySelect.locator('option').allTextContents();

    expect(options).toContain('All categories');
    expect(options).toContain('Dresses');
    expect(options).toContain('Shoes');
    expect(options).toContain('Bags');
    expect(options).toContain('Jackets');
  });

  test('should display price per day on item cards', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    const priceTag = page.getByText(/From \$\d+\/day/).first();
    await expect(priceTag).toBeVisible();
  });
});
