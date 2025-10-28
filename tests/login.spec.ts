import { test, expect } from '@playwright/test';
import { testUsers } from './testData/credentials';
import { appUrls } from './testData/urls';

test('test', async ({ page }) => {
    await page.goto(appUrls.home);
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('textbox', { name: 'Username' }).click();
    await page.getByRole('textbox', { name: 'Username' }).fill(testUsers.admin.username);
    await page.getByRole('textbox', { name: 'Username' }).press('Tab');
    await page.getByRole('textbox', { name: 'Password' }).fill(testUsers.admin.password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('heading', { name: 'Admin dashboard' }).click();
    await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
});