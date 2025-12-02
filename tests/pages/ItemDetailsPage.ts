import { Page, Locator, expect } from '@playwright/test';

export class ItemDetailsPage {
    readonly page: Page;
    readonly itemName: Locator;
    readonly pricePerDay: Locator;
    readonly categoryLabel: Locator;
    readonly sizesInfo: Locator;
    readonly colorsInfo: Locator;
    readonly startDateInput: Locator;
    readonly endDateInput: Locator;
    readonly reserveButton: Locator;
    readonly backToCatalogLink: Locator;
    readonly itemImage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.itemName = page.locator('h1');
        this.pricePerDay = page.getByText(/\$\d+\/day/);
        this.categoryLabel = page.getByText(/Category:/);
        this.sizesInfo = page.getByText(/Sizes:/);
        this.colorsInfo = page.getByText(/Colors:/);
        this.startDateInput = page.locator('input[name="start"]');
        this.endDateInput = page.locator('input[name="end"]');
        this.reserveButton = page.getByRole('button', { name: /Reserve|Book/ });
        this.backToCatalogLink = page.getByRole('link', { name: /Back|Browse|Catalog/ });
        this.itemImage = page.locator('img').first();
    }

    async goto(itemId: number) {
        await this.page.goto(`/items/${itemId}`);
    }

    async expectDetailsVisible() {
        await expect(this.itemName).toBeVisible();
        await expect(this.pricePerDay).toBeVisible();
    }

    async selectDates(startDate: string, endDate: string) {
        await this.startDateInput.fill(startDate);
        await this.endDateInput.fill(endDate);
    }

    async reserve() {
        await this.reserveButton.click();
    }

    async expectImageVisible() {
        await expect(this.itemImage).toBeVisible();
    }

    async expectSizesDisplayed() {
        await expect(this.sizesInfo).toBeVisible();
    }

    async goBackToCatalog() {
        await this.backToCatalogLink.click();
    }
}
