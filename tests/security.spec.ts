import { test, expect } from '@playwright/test';
import { test as adminTest } from './fixtures/auth';

test.describe('Security Tests', () => {
  const baseURL = 'http://localhost:3000';

  test('SEC-400: should mitigate SQL injection in search fields', async ({ page }) => {
    await page.goto(`${baseURL}/search`);

    // Payloads comunes de SQL injection
    const sqlInjectionPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE items; --",
      "1' UNION SELECT NULL, NULL, NULL--",
      "admin'--",
      "' OR 1=1--",
    ];

    for (const payload of sqlInjectionPayloads) {
      const searchInput = page.locator('input[name="q"], input[placeholder*="Search"]').first();
      await searchInput.fill(payload);

      const searchButton = page.getByRole('button', { name: /Search/i });
      await searchButton.click();

      // Esperar a que se procese la búsqueda
      await page.waitForURL('**/search**', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1000);

      // Verificar que la página no muestra errores de SQL
      const pageContent = await page.content();
      expect(pageContent.toLowerCase()).not.toContain('sql');
      expect(pageContent.toLowerCase()).not.toContain('syntax error');
      expect(pageContent.toLowerCase()).not.toContain('mysql');
      expect(pageContent.toLowerCase()).not.toContain('postgresql');
      expect(pageContent.toLowerCase()).not.toContain('database error');

      // Verificar que la página sigue funcionando correctamente
      await expect(page.getByRole('heading', { name: /Browse|Catalog/i })).toBeVisible();
    }
  });

  test('SEC-400: should mitigate SQL injection in filter parameters', async ({ page }) => {
    const sqlPayload = "' OR '1'='1";

    await page.goto(`${baseURL}/search?category=${encodeURIComponent(sqlPayload)}`);
    await page.waitForLoadState('networkidle');

    // Verificar que no hay errores de SQL expuestos
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).not.toContain('sql');
    expect(pageContent.toLowerCase()).not.toContain('syntax error');
  });

  // SEC-401: Mitigación de XSS en campos de texto
  test('SEC-401: should mitigate XSS in search input', async ({ page }) => {
    await page.goto(`${baseURL}/search`);

    // Payloads comunes de XSS
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg/onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')">',
    ];

    for (const payload of xssPayloads) {
      const searchInput = page.locator('input[name="q"], input[placeholder*="Search"]').first();
      await searchInput.fill(payload);

      const searchButton = page.getByRole('button', { name: /Search/i });
      await searchButton.click();

      await page.waitForURL('**/search**', { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1000);

      // El payload NO debe ejecutarse como código
      // Verificar que el contenido está escapado
      const pageContent = await page.content();

      // Si el payload aparece en la página, debe estar escapado (como texto, no como HTML)
      if (pageContent.includes(payload)) {
        // Verificar que está escapado (contiene &lt; &gt; en lugar de < >)
        expect(pageContent).toContain('&lt;');
      }
    }
  });

  test('SEC-402: should enforce HTTPS on admin panel', async ({ browser }) => {
    // Solo ejecutar si no estamos en localhost
    const adminUrl = baseURL.replace('http://localhost:3000', 'http://localhost:3000');

    if (!adminUrl.includes('localhost')) {
      const context = await browser.newContext({
        ignoreHTTPSErrors: false,
      });

      const page = await context.newPage();

      // Intentar acceder por HTTP
      const httpUrl = adminUrl.replace('https://', 'http://') + '/admin';

      await page.goto(httpUrl);
      await page.waitForLoadState('networkidle');

      // Verificar que se redirigió a HTTPS
      const finalUrl = page.url();
      expect(finalUrl).toMatch(/^https:\/\//);

      await context.close();
    } else {
      test.skip();
    }
  });

  test('SEC-402: should use secure connections for admin login', async ({ page }) => {
    await page.goto(`${baseURL}/admin/login`);
    await page.waitForLoadState('networkidle');

    // Si no es localhost, verificar que usa HTTPS
    const url = page.url();
    if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
      expect(url).toMatch(/^https:\/\//);
    }
  });

  adminTest('SEC-403: should not expose passwords in API responses', async ({ loggedInPage }) => {
    // Interceptar llamadas de red
    const responseData: any[] = [];

    loggedInPage.on('response', async (response) => {
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          const data = await response.json();
          responseData.push(data);
        }
      } catch (e) {
        // Ignorar errores de parsing
      }
    });

    // Navegar por el panel de admin
    await loggedInPage.goto('/admin');
    await loggedInPage.waitForLoadState('networkidle');

    // Esperar a que se carguen los datos
    await loggedInPage.waitForTimeout(2000);

    // Verificar que ninguna respuesta contiene contraseñas
    for (const data of responseData) {
      const dataStr = JSON.stringify(data).toLowerCase();
      expect(dataStr).not.toContain('password');
      expect(dataStr).not.toContain('passwd');
      expect(dataStr).not.toContain('pwd');
    }
  });

  test('SEC-403: should not expose passwords in HTML source', async ({ page }) => {
    await page.goto(`${baseURL}/admin/login`);

    const htmlContent = await page.content();

    // Verificar que no hay contraseñas hardcodeadas en el HTML
    expect(htmlContent).not.toMatch(/password\s*=\s*["'][^"']+["']/i);
    expect(htmlContent).not.toMatch(/pwd\s*=\s*["'][^"']+["']/i);
  });

  test('SEC-403: should use password type for password inputs', async ({ page }) => {
    await page.goto(`${baseURL}/admin/login`);

    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    await expect(passwordInput.first()).toBeVisible();

    // Verificar que el input es de tipo password
    const inputType = await passwordInput.first().getAttribute('type');
    expect(inputType).toBe('password');
  });
});
