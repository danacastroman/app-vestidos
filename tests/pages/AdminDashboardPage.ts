import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    readonly page: Page;
    readonly dashboardHeading: Locator;
    readonly signOutButton: Locator;
    readonly inventoryHeaderSection: Locator;
    readonly inventorySection: Locator;
    readonly inventoryHeading: Locator;
    readonly rentalsHeaderSection: Locator;
    readonly rentalsSection: Locator;
    readonly rentalsHeading: Locator;
    readonly noRentalsMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dashboardHeading = page.getByRole('heading', { name: 'Admin dashboard' });
        this.signOutButton = page.getByRole('button', { name: 'Sign out' });
        this.inventoryHeaderSection = page.locator('#inventory-table-header');
        this.inventorySection = page.getByText('Inventory').locator('..');
        this.inventoryHeading = page.getByRole('heading', { name: 'Inventory' });
        this.rentalsHeaderSection = page.locator('#rentals-table-header');
        this.rentalsSection = page.getByText('Scheduled rentals').locator('..');
        this.rentalsHeading = page.getByRole('heading', { name: 'Scheduled rentals' });
        this.noRentalsMessage = page.getByText('No rentals yet.');
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

    async expectInventorySectionVisible() {
        await expect(this.inventoryHeading).toBeVisible();
    }

    async expectRentalsSectionVisible() {
        await expect(this.rentalsHeading).toBeVisible();
    }

    async expectNoRentals() {
        await expect(this.noRentalsMessage).toBeVisible();
    }

    async expectRentalsTableHeaders(headers: string[]) {
        const rentalsTable = this.page.locator('section').filter({ hasText: 'Scheduled rentals' });
        for (const header of headers) {
            await expect(
                this.rentalsHeaderSection.getByRole('cell', { name: header, exact: true })
            ).toBeVisible();
        }
    }

    async getRentalRow(rentalId: string) {
        return this.page.locator('tr').filter({ hasText: rentalId });
    }

    async cancelRental(rentalId: string) {
        const row = await this.getRentalRow(rentalId);
        await row.getByRole('button', { name: 'Cancel' }).click();
    }

    async expectRentalStatus(rentalId: string, status: string) {
        const row = await this.getRentalRow(rentalId);
        await expect(row.getByText(status, { exact: false })).toBeVisible();
    }

    async signOut() {
        await this.signOutButton.click();
    }
}