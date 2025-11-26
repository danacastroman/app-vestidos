import { test, expect } from '@playwright/test';

test.describe('API - Rentals Endpoints', () => {
  const baseURL = 'http://localhost:3000';

  // Helper para obtener fechas futuras
  const getFutureDates = (daysAhead: number, duration: number) => {
    const today = new Date();
    const startDate = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  };

  // API-120: POST /api/rentals reserva válida
  test('API-120: should create a valid rental', async ({ request, page }) => {
    // Primero obtener un CSRF token si es necesario
    await page.goto(`${baseURL}/items/1`);
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : null;
    });

    const dates = getFutureDates(7, 3);

    const rentalData = {
      itemId: 1,
      startDate: dates.start,
      endDate: dates.end,
      customerName: 'Juan Pérez',
      customerEmail: 'juan.perez@example.com',
      customerPhone: '+598 99 123 456',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await request.post(`${baseURL}/api/rentals`, {
      data: rentalData,
      headers,
    });

    // Puede ser 200 (OK) o 201 (Created)
    expect([200, 201]).toContain(response.status());

    const rental = await response.json();
    expect(rental).toHaveProperty('id');
    expect(rental.itemId).toBe(rentalData.itemId);
  });

  // API-121: POST /api/rentals sin CSRF
  test('API-121: should reject rental without CSRF token', async ({ request }) => {
    const dates = getFutureDates(7, 3);

    const rentalData = {
      itemId: 1,
      startDate: dates.start,
      endDate: dates.end,
      customerName: 'Juan Pérez',
      customerEmail: 'juan.perez@example.com',
      customerPhone: '+598 99 123 456',
    };

    const response = await request.post(`${baseURL}/api/rentals`, {
      data: rentalData,
      headers: {
        'Content-Type': 'application/json',
        // Intencionalmente sin CSRF token
      },
    });

    // Debe rechazar la solicitud (403 Forbidden o 400 Bad Request)
    expect([400, 403]).toContain(response.status());
  });

  // API-124: POST /api/rentals con fechas solapadas
  test('API-124: should reject rental with overlapping dates', async ({ request, page }) => {
    // Primero obtener CSRF token
    await page.goto(`${baseURL}/items/1`);
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : null;
    });

    const dates = getFutureDates(7, 3);

    // Primera reserva
    const rentalData1 = {
      itemId: 1,
      startDate: dates.start,
      endDate: dates.end,
      customerName: 'Juan Pérez',
      customerEmail: 'juan.perez@example.com',
      customerPhone: '+598 99 123 456',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response1 = await request.post(`${baseURL}/api/rentals`, {
      data: rentalData1,
      headers,
    });

    // Si la primera reserva fue exitosa, intentar crear una solapada
    if ([200, 201].includes(response1.status())) {
      // Segunda reserva con fechas solapadas
      const rentalData2 = {
        itemId: 1,
        startDate: dates.start, // Mismas fechas = solapamiento total
        endDate: dates.end,
        customerName: 'María González',
        customerEmail: 'maria.gonzalez@example.com',
        customerPhone: '+598 99 654 321',
      };

      const response2 = await request.post(`${baseURL}/api/rentals`, {
        data: rentalData2,
        headers,
      });

      // Debe rechazar la reserva solapada (400, 409 Conflict, etc.)
      expect([400, 409, 422]).toContain(response2.status());

      const errorResponse = await response2.json();
      const errorText = JSON.stringify(errorResponse).toLowerCase();
      expect(errorText).toMatch(/overlap|conflict|unavailable|no disponible/);
    }
  });

  // API-125: POST /api/rentals con formato de fecha inválido
  test('API-125: should reject rental with invalid date format', async ({ request, page }) => {
    // Obtener CSRF token
    await page.goto(`${baseURL}/items/1`);
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : null;
    });

    const rentalData = {
      itemId: 1,
      startDate: 'invalid-date-format',
      endDate: '2025/12/10', // Formato incorrecto
      customerName: 'Juan Pérez',
      customerEmail: 'juan.perez@example.com',
      customerPhone: '+598 99 123 456',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await request.post(`${baseURL}/api/rentals`, {
      data: rentalData,
      headers,
    });

    // Debe rechazar la solicitud (400 Bad Request)
    expect([400, 422]).toContain(response.status());
  });

  test('API-125: should reject rental with past dates', async ({ request, page }) => {
    // Obtener CSRF token
    await page.goto(`${baseURL}/items/1`);
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : null;
    });

    // Fechas en el pasado
    const rentalData = {
      itemId: 1,
      startDate: '2020-01-01',
      endDate: '2020-01-05',
      customerName: 'Juan Pérez',
      customerEmail: 'juan.perez@example.com',
      customerPhone: '+598 99 123 456',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await request.post(`${baseURL}/api/rentals`, {
      data: rentalData,
      headers,
    });

    // Debe rechazar la solicitud
    expect([400, 422]).toContain(response.status());
  });

  test('API-125: should reject rental with end date before start date', async ({ request, page }) => {
    // Obtener CSRF token
    await page.goto(`${baseURL}/items/1`);
    const csrfToken = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="csrf-token"]');
      return meta ? meta.getAttribute('content') : null;
    });

    const dates = getFutureDates(7, 3);

    // Fechas invertidas
    const rentalData = {
      itemId: 1,
      startDate: dates.end, // Fin como inicio
      endDate: dates.start, // Inicio como fin
      customerName: 'Juan Pérez',
      customerEmail: 'juan.perez@example.com',
      customerPhone: '+598 99 123 456',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await request.post(`${baseURL}/api/rentals`, {
      data: rentalData,
      headers,
    });

    // Debe rechazar la solicitud
    expect([400, 422]).toContain(response.status());
  });
});
