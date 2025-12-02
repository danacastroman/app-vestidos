import { Page, Locator, expect } from '@playwright/test';

export class SearchPage {
    readonly page: Page;
    readonly heading: Locator;
    readonly searchInput: Locator;
    readonly categorySelect: Locator;
    readonly sizeInput: Locator;
    readonly colorInput: Locator;
    readonly styleInput: Locator;
    readonly searchButton: Locator;
    readonly itemsGrid: Locator;
    readonly noResultsMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.heading = page.getByRole('heading', { name: 'Browse catalog' });
        this.searchInput = page.getByPlaceholder('Search…');
        this.categorySelect = page.locator('select[name="category"]');
        this.sizeInput = page.getByPlaceholder('Size');
        this.colorInput = page.getByPlaceholder('Color');
        this.styleInput = page.getByPlaceholder('Style (e.g., cocktail)');
        this.searchButton = page.getByRole('button', { name: 'Search' });
        this.itemsGrid = page.locator('div').filter({ hasText: /From \$\d+\/day/ }).first();
        this.noResultsMessage = page.getByText('No items match your filters.');
    }

    async goto() {
        await this.page.goto('/search');
    }

    async search(query: string) {
        await this.searchInput.fill(query);
        await this.searchButton.click();
    }

    async filterByCategory(category: string) {
        await this.categorySelect.selectOption(category);
        await this.searchButton.click();
    }

    async applyFilters(filters: {
        query?: string;
        category?: string;
        size?: string;
        color?: string;
        style?: string;
    }) {
        if (filters.query) await this.searchInput.fill(filters.query);
        if (filters.category) await this.categorySelect.selectOption(filters.category);
        if (filters.size) await this.sizeInput.fill(filters.size);
        if (filters.color) await this.colorInput.fill(filters.color);
        if (filters.style) await this.styleInput.fill(filters.style);
        await this.searchButton.click();
    }

    async expectPageVisible() {
        await expect(this.heading).toBeVisible();
    }

    async expectItemsVisible() {
        await expect(this.itemsGrid).toBeVisible();
    }

    async expectNoResults() {
        await expect(this.noResultsMessage).toBeVisible();
    }

    async getItemByName(name: string) {
        return this.page.getByText(name).first();
    }

    async clickItemDetails(name: string) {
        const item = await this.getItemByName(name);
        await item.locator('..').locator('..').getByRole('link', { name: 'View details' }).click();
    }
}
