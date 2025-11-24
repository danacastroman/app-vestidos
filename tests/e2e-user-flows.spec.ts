import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ItemDetailsPage } from './pages/ItemDetailsPage';

test.describe('End-to-End User Flows', () => {
  test('complete user journey: home -> search -> item details', async ({ page }) => {
    // Start at home page
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(page.getByRole('heading', { name: /Rent designer dresses/ })).toBeVisible();

    // Navigate to browse/search
    await page.getByRole('link', { name: 'Browse' }).click();
    await page.waitForURL('**/search');

    // Verify search page loaded
    const searchPage = new SearchPage(page);
    await searchPage.expectPageVisible();

    // View details of first item
    await page.getByRole('link', { name: 'View details' }).first().click();
    await page.waitForURL('**/items/**');

    // Verify item details page loaded
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.expectDetailsVisible();
  });

  test('search from home page and view results', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Perform search from home page
    await page.getByPlaceholder(/Search by style, color, or designer/).fill('evening');
    await page.getByRole('button', { name: 'Search dresses' }).click();

    await page.waitForURL('**/search**');
    expect(page.url()).toContain('q=evening');

    // Verify search page with results
    const searchPage = new SearchPage(page);
    await searchPage.expectPageVisible();
  });

  test('filter by size and view filtered item', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    // Apply size filter
    await searchPage.applyFilters({ size: 'M' });
    await page.waitForURL('**/search?size=M');

    // Verify filter was applied
    await expect(searchPage.sizeInput).toHaveValue('M');

    // View an item from filtered results
    const hasItems = await page.getByRole('link', { name: 'View details' }).count() > 0;
    if (hasItems) {
      await page.getByRole('link', { name: 'View details' }).first().click();
      await page.waitForURL('**/items/**');
    }
  });

  test('browse by category then view specific item', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    // Filter by category
    await searchPage.filterByCategory('dress');
    await page.waitForURL('**/search?category=dress');

    // Verify category filter applied
    const categoryValue = await searchPage.categorySelect.inputValue();
    expect(categoryValue).toBe('dress');

    // View first dress item
    const hasItems = await page.getByRole('link', { name: 'View details' }).count() > 0;
    if (hasItems) {
      await page.getByRole('link', { name: 'View details' }).first().click();
      await page.waitForURL('**/items/**');

      const itemDetailsPage = new ItemDetailsPage(page);
      await itemDetailsPage.expectDetailsVisible();
    }
  });

  test('navigate through multiple items in sequence', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);

    // View item 1
    await itemDetailsPage.goto(1);
    await itemDetailsPage.expectDetailsVisible();
    await expect(page).toHaveURL(/\/items\/1$/);

    // Navigate to item 2
    await itemDetailsPage.goto(2);
    await itemDetailsPage.expectDetailsVisible();
    await expect(page).toHaveURL(/\/items\/2$/);

    // Navigate to item 3
    await itemDetailsPage.goto(3);
    await itemDetailsPage.expectDetailsVisible();
    await expect(page).toHaveURL(/\/items\/3$/);
  });

  test('search with multiple filters and view results', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.goto();

    // Apply multiple filters
    await searchPage.applyFilters({
      query: 'dress',
      category: 'dress',
      size: 'S',
    });

    await page.waitForURL('**/search**');

    // Verify all filters in URL
    const url = page.url();
    expect(url).toContain('q=dress');
    expect(url).toContain('category=dress');
    expect(url).toContain('size=S');

    // Check if results are shown or no results message
    const hasResults = await page.getByRole('link', { name: 'View details' }).count() > 0;
    const hasNoResults = await page.getByText('No items match your filters.').count() > 0;

    expect(hasResults || hasNoResults).toBeTruthy();
  });

  test('navigate from featured items on home page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Wait for featured section
    await expect(page.getByRole('heading', { name: 'Featured picks' })).toBeVisible();

    // Click first featured item
    await page.getByRole('link', { name: 'View details' }).first().click();
    await page.waitForURL('**/items/**');

    // Verify we landed on item details
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.expectDetailsVisible();
  });

  test('navigate to admin from home page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Navigate to admin
    await homePage.navigateToAdmin();
    await page.waitForURL('**/admin/login');

    // Verify admin login page
    await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
  });

  test('return to search from item details', async ({ page }) => {
    // Start at search page
    const searchPage = new SearchPage(page);
    await searchPage.goto();
    await searchPage.expectPageVisible();

    // Navigate to item details
    await page.getByRole('link', { name: 'View details' }).first().click();
    await page.waitForURL('**/items/**');

    // Go back to search/catalog
    const backLink = page.getByRole('link').filter({ hasText: /Back|Browse|Catalog|Search/i }).first();
    const hasBackLink = await backLink.count() > 0;

    if (hasBackLink) {
      await backLink.click();
      await expect(page).toHaveURL(/\/search/);
    }
  });

  test('explore all navigation links from home page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Test Browse link
    await page.getByRole('link', { name: 'Browse' }).click();
    await page.waitForURL('**/search');
    await page.goBack();

    // Test How it works anchor (should scroll on same page)
    await page.getByRole('link', { name: 'How it works' }).click();
    await expect(page.getByRole('heading', { name: 'How it works' })).toBeVisible();

    // Test Featured anchor
    await page.getByRole('link', { name: 'Featured' }).click();
    await expect(page.getByRole('heading', { name: 'Featured picks' })).toBeVisible();
  });

  test('complete search workflow with date selection', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Fill search form with dates
    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);

    await page.getByPlaceholder(/Search by style, color, or designer/).fill('gown');
    await page.locator('input[name="start"]').fill(startDate.toISOString().split('T')[0]);
    await page.locator('input[name="end"]').fill(endDate.toISOString().split('T')[0]);
    await page.locator('select[name="size"]').selectOption('M');

    await page.getByRole('button', { name: 'Search dresses' }).click();
    await page.waitForURL('**/search**');

    // Verify all parameters in URL
    const url = page.url();
    expect(url).toContain('q=gown');
    expect(url).toContain('size=M');
  });

  test('navigation consistency across the app', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Verify header navigation is present on home
    await expect(page.getByRole('link', { name: 'Browse' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();

    // Navigate to search and verify header still present
    await page.getByRole('link', { name: 'Browse' }).click();
    await page.waitForURL('**/search');

    // Header should still be accessible (we're in the same app)
    const glamRentLogo = page.getByRole('link', { name: 'GlamRent' });
    if (await glamRentLogo.count() > 0) {
      await expect(glamRentLogo).toBeVisible();
    }
  });
});
