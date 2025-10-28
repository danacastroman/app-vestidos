import { test } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { testUsers } from './testData/credentials';


test.describe('Admin Login', () => {
    test('should login successfully and logout', async ({ page }) => {
        // Instancio las páginas que voy a utilizar
        const homePage = new HomePage(page);
        const loginPage = new LoginPage(page);
        const adminDashboard = new AdminDashboardPage(page);

        // Acciones y asserts
        await homePage.goto();
        await homePage.navigateToAdmin();

        await loginPage.login(testUsers.admin.username, testUsers.admin.password);

        await adminDashboard.expectDashboardVisible();

        await adminDashboard.signOut();

        await loginPage.expectLoginPageVisible();
    });
});