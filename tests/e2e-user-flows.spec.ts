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

    // Navigate to browse/search - target the nav element specifically to avoid "Browse all" link
    await page.locator('nav').getByRole('link', { name: 'Browse', exact: true }).click();
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

  test('E2E-040: navigate to FAQ page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Click FAQ link in navigation
    await page.locator('nav').getByRole('link', { name: 'FAQ', exact: true }).click();
    await page.waitForURL('**/faq');

    // Verify FAQ page loaded
    await expect(page.getByRole('heading', { name: /FAQ|Frequently Asked Questions/i })).toBeVisible();
  });
});
