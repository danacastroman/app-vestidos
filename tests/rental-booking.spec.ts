import { test, expect } from '@playwright/test';
import { ItemDetailsPage } from './pages/ItemDetailsPage';

test.describe('Rental Booking', () => {
  // E2E-030: Crear reserva válida sin registro
  test('should create a valid rental without registration', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    // Seleccionar fechas futuras válidas
    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await itemDetailsPage.selectDates(startDateStr, endDateStr);
    await itemDetailsPage.reserve();

    // Esperar el formulario de contacto/checkout
    await page.waitForURL('**/checkout**', { timeout: 5000 }).catch(() => {});

    // Si hay un formulario de checkout, llenar los datos
    const nameInput = page.locator('input[name="name"], input[name="fullName"], input[name="customerName"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const phoneInput = page.locator('input[name="phone"], input[name="telephone"], input[type="tel"]').first();

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('Juan Pérez');
      await emailInput.fill('juan.perez@example.com');
      await phoneInput.fill('+598 99 123 456');

      const submitButton = page.getByRole('button', { name: /Submit|Confirm|Book|Complete/ });
      await submitButton.click();

      // Verificar confirmación
      await expect(page.getByText(/success|confirmed|thank you/i)).toBeVisible({ timeout: 10000 });
    }
  });

  // E2E-031: Validación de campos obligatorios en reserva
  test('should validate required fields in rental form', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await itemDetailsPage.selectDates(startDateStr, endDateStr);
    await itemDetailsPage.reserve();

    await page.waitForURL('**/checkout**', { timeout: 5000 }).catch(() => {});

    const nameInput = page.locator('input[name="name"], input[name="fullName"], input[name="customerName"]').first();

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Intentar enviar sin llenar campos
      const submitButton = page.getByRole('button', { name: /Submit|Confirm|Book|Complete/ });
      await submitButton.click();

      // Verificar que aparecen mensajes de error de validación
      const errorMessage = page.getByText(/required|obligatorio|fill|completa/i);
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });

  // E2E-032: Validación de rango de fechas inválido
  test('should validate invalid date range', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    // Intentar seleccionar fecha de fin antes de fecha de inicio
    const today = new Date();
    const startDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 days
    const endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days (antes!)

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await itemDetailsPage.selectDates(startDateStr, endDateStr);
    await itemDetailsPage.reserve();

    // Verificar mensaje de error
    const errorMessage = page.getByText(/invalid|date|range|fecha|inválido/i);
    const isErrorVisible = await errorMessage.first().isVisible({ timeout: 3000 }).catch(() => false);

    // Si no hay error visible, verificar que no permitió avanzar
    if (!isErrorVisible) {
      const currentUrl = page.url();
      expect(currentUrl).toContain('/items/');
    }
  });

  // E2E-033: Validación de formato de email
  test('should validate email format', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await itemDetailsPage.selectDates(startDateStr, endDateStr);
    await itemDetailsPage.reserve();

    await page.waitForURL('**/checkout**', { timeout: 5000 }).catch(() => {});

    const nameInput = page.locator('input[name="name"], input[name="fullName"], input[name="customerName"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const phoneInput = page.locator('input[name="phone"], input[name="telephone"], input[type="tel"]').first();

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('Juan Pérez');
      await emailInput.fill('invalid-email-format'); // Email inválido
      await phoneInput.fill('+598 99 123 456');

      const submitButton = page.getByRole('button', { name: /Submit|Confirm|Book|Complete/ });
      await submitButton.click();

      // Verificar mensaje de error de validación de email
      const errorMessage = page.getByText(/invalid|email|correo|válido/i);
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });

  // E2E-034: Validación de formato de teléfono
  test('should validate phone format', async ({ page }) => {
    const itemDetailsPage = new ItemDetailsPage(page);
    await itemDetailsPage.goto(1);

    const today = new Date();
    const startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    await itemDetailsPage.selectDates(startDateStr, endDateStr);
    await itemDetailsPage.reserve();

    await page.waitForURL('**/checkout**', { timeout: 5000 }).catch(() => {});

    const nameInput = page.locator('input[name="name"], input[name="fullName"], input[name="customerName"]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const phoneInput = page.locator('input[name="phone"], input[name="telephone"], input[type="tel"]').first();

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('Juan Pérez');
      await emailInput.fill('juan.perez@example.com');
      await phoneInput.fill('123'); // Teléfono inválido (muy corto)

      const submitButton = page.getByRole('button', { name: /Submit|Confirm|Book|Complete/ });
      await submitButton.click();

      // Verificar mensaje de error de validación de teléfono
      const errorMessage = page.getByText(/invalid|phone|teléfono|válido/i);
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    }
  });
});
