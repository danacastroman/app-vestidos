import { test, expect } from '@playwright/test';

test.describe('API - Items Endpoints', () => {
  const baseURL = 'http://localhost:3000';

  test('API-100: should return items list without filters', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/items`);

    expect(response.status()).toBe(200);
    const { items } = await response.json();
    expect(Array.isArray(items)).toBeTruthy();
    expect(items.length).toBeGreaterThan(0);

    // Verificar estructura de un item
    const firstItem = items[0];
    expect(firstItem).toHaveProperty('id');
    expect(firstItem).toHaveProperty('name');
    expect(firstItem).toHaveProperty('pricePerDay');
  });

  test('API-101: should filter items by text query', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/items?q=dress`);

    expect(response.status()).toBe(200);

    const { items } = await response.json();
    expect(Array.isArray(items)).toBeTruthy();

    // Verificar que los items contienen el texto buscado
    if (items.length > 0) {
      const firstItem = items[0];
      const itemText = JSON.stringify(firstItem).toLowerCase();
      expect(itemText).toContain('dress');
    }
  });

  test('API-102: should filter items with multiple filters', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/items?q=dress&category=dress&size=M`);

    expect(response.status()).toBe(200);

    const { items } = await response.json();
    expect(Array.isArray(items)).toBeTruthy();
  });

  test('API-102: should handle combined filters with color and style', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/items?category=dress&color=black&style=cocktail`);

    expect(response.status()).toBe(200);

    const { items } = await response.json();
    expect(Array.isArray(items)).toBeTruthy();
  });
});

test.describe('API - Item Availability Endpoints', () => {
  const baseURL = 'http://localhost:3000';

  test('API-110: should return availability for existing item', async ({ request }) => {
    const itemId = 1;
    const response = await request.get(`${baseURL}/api/items/${itemId}/availability`);

    expect(response.status()).toBe(200);

    const availability = await response.json();
    expect(availability).toBeDefined();
  });

  test('API-110: should accept date range parameters for availability', async ({ request }) => {
    const itemId = 1;
    const startDate = '2025-12-01';
    const endDate = '2025-12-10';

    const response = await request.get(
      `${baseURL}/api/items/${itemId}/availability?start=${startDate}&end=${endDate}`
    );

    expect(response.status()).toBe(200);

    const availability = await response.json();
    expect(availability).toBeDefined();
  });

  test('API-111: should return 404 for non-existent item availability', async ({ request }) => {
    const nonExistentItemId = 99999;
    const response = await request.get(`${baseURL}/api/items/${nonExistentItemId}/availability`);

    expect(response.status()).toBe(404);
  });

  test('API-111: should return 404 for invalid item ID format', async ({ request }) => {
    const invalidItemId = 'invalid-id';
    const response = await request.get(`${baseURL}/api/items/${invalidItemId}/availability`);

    expect([400, 404]).toContain(response.status());
  });
});
