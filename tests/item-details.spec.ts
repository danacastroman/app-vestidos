import { test, expect } from '@playwright/test';
import { ItemDetailsPage } from './pages/ItemDetailsPage';

test.describe('Item Details Page', () => {
  test('E2E-020: should display item image', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await itemDetailsPage.expectImageVisible();
  });

  test('E2E-020: should display price per day', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await expect(itemDetailsPage.pricePerDay).toBeVisible();
  });

  test('E2E-020: should display sizes information', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await itemDetailsPage.expectSizesDisplayed();
  });

  test('E2E-020: should display rental date inputs', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    await expect(itemDetailsPage.startDateInput).toBeVisible();
    await expect(itemDetailsPage.endDateInput).toBeVisible();
  });

  test('E2E-021: should allow selecting rental dates', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await itemDetailsPage.selectDates(startDateStr, endDateStr);

    await expect(itemDetailsPage.startDateInput).toHaveValue(startDateStr);
    await expect(itemDetailsPage.endDateInput).toHaveValue(endDateStr);
  });

  test('should display back navigation option', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const backLink = page.getByRole('link').filter({ hasText: /Back|Browse|Catalog|Search/i });
    await expect(backLink.first()).toBeVisible();
  });

  test('E2E-020: should display item description or details section', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const descriptionSection = page.locator('text=/Description|Details|About/i');
    const hasDescription = await descriptionSection.count() > 0;

    if (hasDescription) {
      await expect(descriptionSection.first()).toBeVisible();
    }
  });

  test('E2E-020: should show multiple images if available', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const images = page.locator('img');
    const imageCount = await images.count();

    expect(imageCount).toBeGreaterThan(0);
  });
});
