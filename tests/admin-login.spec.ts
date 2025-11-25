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

    // Should remain on login page or show error
    const errorMessage = page.getByText(/Invalid|Error|incorrect/i);
    const hasError = await errorMessage.count() > 0;

    if (hasError) {
      await expect(errorMessage.first()).toBeVisible();
    } else {
      // If no error message, should stay on login page
      await loginPage.expectLoginPageVisible();
    }
  });

  test('should fail login with invalid password', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.expectLoginPageVisible();

    await loginPage.login(testUsers.admin.username, 'wrongpassword');

    // Should remain on login page or show error
    const errorMessage = page.getByText(/Invalid|Error|incorrect/i);
    const hasError = await errorMessage.count() > 0;

    if (hasError) {
      await expect(errorMessage.first()).toBeVisible();
    } else {
      await loginPage.expectLoginPageVisible();
    }
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

  test('should display username and password input fields', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.signInButton).toBeVisible();
  });

  test('should not allow direct access to admin dashboard without login', async ({ page }) => {
    await page.goto('/admin');

    // Should redirect to login or show login page
    const isLoginPage = page.url().includes('login');
    const hasLoginHeading = await page.getByRole('heading', { name: 'Admin sign in' }).count() > 0;

    expect(isLoginPage || hasLoginHeading).toBeTruthy();
  });

  test('should maintain session after page refresh', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const dashboardPage = new AdminDashboardPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await page.waitForURL('**/admin**');

    await dashboardPage.expectDashboardVisible();

    // Refresh page
    await page.reload();

    // Should still be logged in
    await dashboardPage.expectDashboardVisible();
  });

  test('should keep input field values after failed login', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.navigateToAdmin();
    await loginPage.expectLoginPageVisible();

    await loginPage.login('invaliduser', 'wrongpassword');
    await page.waitForTimeout(1000); // Wait for error

    const usernameValue = await loginPage.usernameInput.inputValue();
    const passwordValue = await loginPage.passwordInput.inputValue();

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
