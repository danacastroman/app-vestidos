import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { testUsers } from './testData/credentials';

test.describe('Admin Login', () => {
  test('should successfully login with valid credentials', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new AdminDashboardPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.expectLoginPageVisible();

    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await page.waitForURL('**/admin**');

    await dashboardPage.expectDashboardVisible();
  });

  test('should successfully logout after login', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new AdminDashboardPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await page.waitForURL('**/admin**');

    await dashboardPage.expectDashboardVisible();
    await dashboardPage.signOut();

    await loginPage.expectLoginPageVisible();
  });

  test('should fail login with invalid username', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.expectLoginPageVisible();

    await loginPage.login('invaliduser', testUsers.admin.password);

    // If no error message, should stay on login page
    await loginPage.expectLoginPageVisible();
  });

  test('should fail login with invalid password', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.expectLoginPageVisible();

    await loginPage.login(testUsers.admin.username, 'wrongpassword');
    
    await loginPage.expectLoginPageVisible();
  });

  test('should fail login with empty credentials', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.expectLoginPageVisible();

    await loginPage.login('', '');

    // Should remain on login page
    await loginPage.expectLoginPageVisible();
  });

  test('should fail login with empty username', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.expectLoginPageVisible();

    await loginPage.login('', testUsers.admin.password);

    await loginPage.expectLoginPageVisible();
  });

  test('should fail login with empty password', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.expectLoginPageVisible();

    await loginPage.login(testUsers.admin.username, '');

    await loginPage.expectLoginPageVisible();
  });

  test('should not allow direct access to admin dashboard without login', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to login or show login page
    const isLoginPage = page.url().includes('login');
    const hasLoginHeading = await page.getByRole('heading', { name: 'Admin sign in' }).count() > 0;

    expect(isLoginPage || hasLoginHeading).toBeTruthy();
  });
});
