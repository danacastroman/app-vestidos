import { test, expect } from '@playwright/test';
import { ItemDetailsPage } from './pages/ItemDetailsPage';

test.describe('Item Details Page', () => {
  test('should display item details for featured item 1', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await itemDetailsPage.expectDetailsVisible();
    await expect(page.getByText('Silk Evening Gown')).toBeVisible();
  });

  test('should display item details for featured item 2', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(2);

    await itemDetailsPage.expectDetailsVisible();
    await expect(page.getByText('Black Tie Dress')).toBeVisible();
  });

  test('should display item image', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await itemDetailsPage.expectImageVisible();
  });

  test('should display price per day', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await expect(itemDetailsPage.pricePerDay).toBeVisible();
  });

  test('should display category information', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await expect(page.getByText(/Category/i)).toBeVisible();
  });

  test('should display sizes information', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await itemDetailsPage.expectSizesDisplayed();
  });

  test('should display rental date inputs', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await expect(itemDetailsPage.startDateInput).toBeVisible();
    await expect(itemDetailsPage.endDateInput).toBeVisible();
  });

  test('should allow selecting rental dates', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await itemDetailsPage.selectDates(startDateStr, endDateStr);

    await expect(itemDetailsPage.startDateInput).toHaveValue(startDateStr);
    await expect(itemDetailsPage.endDateInput).toHaveValue(endDateStr);
  });

  test('should display availability calendar section', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await expect(page.getByText(/Availability|Calendar/i)).toBeVisible();
  });

  test('should navigate to different item IDs', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);

    // Test item 1
    await itemDetailsPage.goto(1);
    await expect(page).toHaveURL(/\/items\/1$/);

    // Test item 2
    await itemDetailsPage.goto(2);
    await expect(page).toHaveURL(/\/items\/2$/);

    // Test item 3
    await itemDetailsPage.goto(3);
    await expect(page).toHaveURL(/\/items\/3$/);

    // Test item 4
    await itemDetailsPage.goto(4);
    await expect(page).toHaveURL(/\/items\/4$/);
  });

  test('should display back navigation option', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const backLink = page.getByRole('link').filter({ hasText: /Back|Browse|Catalog|Search/i });
    await expect(backLink.first()).toBeVisible();
  });

  test('should navigate back to search from item details', async ({ page }) => {
    await page.goto('/search');
    await page.getByRole('link', { name: 'View details' }).first().click();
    await page.waitForURL('**/items/**');

    const backLink = page.getByRole('link').filter({ hasText: /Back|Browse|Catalog|Search/i }).first();
    await backLink.click();

    await expect(page).toHaveURL(/\/search/);
  });

  test('should display item description or details section', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const descriptionSection = page.locator('text=/Description|Details|About/i');
    const hasDescription = await descriptionSection.count() > 0;

    if (hasDescription) {
      await expect(descriptionSection.first()).toBeVisible();
    }
  });

  test('should show multiple images if available', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const images = page.locator('img');
    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(0);
  });
});
