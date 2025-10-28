import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    readonly page: Page;
    readonly dashboardHeading: Locator;
    readonly signOutButton: Locator;
    readonly inventoryHeaderSection: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dashboardHeading = page.getByRole('heading', { name: 'Admin dashboard' });
        this.signOutButton = page.getByRole('button', { name: 'Sign out' });
        this.inventoryHeaderSection = page.locator('#table-header');
    }

    async expectDashboardVisible() {
        await expect(this.dashboardHeading).toBeVisible();
        await expect(this.signOutButton).toBeVisible();
    }

    async expectInventoryHeaders(headers: string[]) {
        await expect(this.inventoryHeaderSection).toBeVisible();
        for (const header of headers) {
            await expect(
                this.inventoryHeaderSection.getByRole('cell', { name: header, exact: true })
            ).toBeVisible();
        }
    }

    async signOut() {
        await this.signOutButton.click();
    }
}