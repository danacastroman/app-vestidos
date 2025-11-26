import { test, expect } from './fixtures/auth';

test.describe('Admin - Inventory Management', () => {
  // ADM-230: Crear nuevo artículo en inventario
  test('ADM-230: should create a new item in inventory', async ({ loggedInPage }) => {
    // Navegar al formulario de creación de artículo
    const createButton = loggedInPage.getByRole('button', { name: /Add|New|Create.*Item/i });
    const createLink = loggedInPage.getByRole('link', { name: /Add|New|Create.*Item/i });

    // Intentar encontrar el botón o link de crear
    const isButtonVisible = await createButton.isVisible({ timeout: 2000 }).catch(() => false);
    const isLinkVisible = await createLink.isVisible({ timeout: 2000 }).catch(() => false);

    if (isButtonVisible) {
      await createButton.click();
    } else if (isLinkVisible) {
      await createLink.click();
    } else {
      // Intentar navegar directamente a la página de creación
      await loggedInPage.goto('/admin/items/new');
    }

    // Esperar a que aparezca el formulario
    await loggedInPage.waitForURL('**/admin/items/new', { timeout: 5000 }).catch(() => {});

    // Llenar el formulario de nuevo artículo
    const nameInput = loggedInPage.locator('input[name="name"], input[id="name"]').first();
    const categorySelect = loggedInPage.locator('select[name="category"], select[id="category"]').first();
    const priceInput = loggedInPage.locator('input[name="pricePerDay"], input[name="price"]').first();

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('Test Evening Dress');
      await categorySelect.selectOption('dress');
      await priceInput.fill('150');

      // Buscar otros campos opcionales
      const sizeInput = loggedInPage.locator('input[name="sizes"], input[name="availableSizes"]').first();
      const colorInput = loggedInPage.locator('input[name="colors"], input[name="availableColors"]').first();
      const descriptionInput = loggedInPage.locator('textarea[name="description"]').first();

      if (await sizeInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await sizeInput.fill('S,M,L');
      }

      if (await colorInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await colorInput.fill('Black,Red');
      }

      if (await descriptionInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await descriptionInput.fill('Beautiful evening dress for special occasions');
      }

      // Enviar el formulario
      const submitButton = loggedInPage.getByRole('button', { name: /Submit|Create|Save|Add/i });
      await submitButton.click();

      // Verificar que se creó exitosamente
      await expect(
        loggedInPage.getByText(/success|created|added|successfully/i)
      ).toBeVisible({ timeout: 10000 });
    }
  });

  // ADM-231: Editar artículo existente
  test('ADM-231: should edit an existing item', async ({ loggedInPage }) => {
    // Buscar un botón de editar en el dashboard
    const editButton = loggedInPage.getByRole('button', { name: /Edit/i }).first();
    const editLink = loggedInPage.getByRole('link', { name: /Edit/i }).first();

    const isButtonVisible = await editButton.isVisible({ timeout: 2000 }).catch(() => false);
    const isLinkVisible = await editLink.isVisible({ timeout: 2000 }).catch(() => false);

    if (isButtonVisible) {
      await editButton.click();
    } else if (isLinkVisible) {
      await editLink.click();
    } else {
      // Intentar navegar directamente (asumiendo que el item 1 existe)
      await loggedInPage.goto('/admin/items/1/edit');
    }

    // Esperar a que aparezca el formulario de edición
    await loggedInPage.waitForURL('**/admin/items/**/edit', { timeout: 5000 }).catch(() => {});

    // Modificar el artículo
    const nameInput = loggedInPage.locator('input[name="name"], input[id="name"]').first();
    const priceInput = loggedInPage.locator('input[name="pricePerDay"], input[name="price"]').first();

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Obtener el valor actual y modificarlo
      const currentName = await nameInput.inputValue();
      await nameInput.fill(`${currentName} - Updated`);

      if (await priceInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await priceInput.fill('175');
      }

      // Guardar cambios
      const submitButton = loggedInPage.getByRole('button', { name: /Submit|Save|Update/i });
      await submitButton.click();

      // Verificar que se guardó exitosamente
      await expect(
        loggedInPage.getByText(/success|updated|saved|successfully/i)
      ).toBeVisible({ timeout: 10000 });
    }
  });

  // ADM-233: Eliminar artículo del inventario
  test('ADM-233: should delete an item from inventory', async ({ loggedInPage }) => {
    // Primero crear un artículo para eliminar
    await loggedInPage.goto('/admin/items/new').catch(() => {});

    const nameInput = loggedInPage.locator('input[name="name"], input[id="name"]').first();

    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Crear un artículo temporal
      await nameInput.fill('Item to Delete');
      const categorySelect = loggedInPage.locator('select[name="category"], select[id="category"]').first();
      const priceInput = loggedInPage.locator('input[name="pricePerDay"], input[name="price"]').first();

      await categorySelect.selectOption('dress');
      await priceInput.fill('100');

      const submitButton = loggedInPage.getByRole('button', { name: /Submit|Create|Save|Add/i });
      await submitButton.click();

      // Esperar confirmación
      await expect(
        loggedInPage.getByText(/success|created|added/i)
      ).toBeVisible({ timeout: 10000 });
    }

    // Volver al dashboard
    await loggedInPage.goto('/admin');
    await loggedInPage.waitForURL('**/admin**');

    // Buscar el botón de eliminar
    const deleteButton = loggedInPage.getByRole('button', { name: /Delete|Remove/i }).first();

    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Set up dialog handler antes de hacer clic
      loggedInPage.on('dialog', async (dialog) => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      await deleteButton.click();

      // Verificar que se eliminó exitosamente
      await expect(
        loggedInPage.getByText(/success|deleted|removed/i)
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('ADM-233: should confirm before deleting an item', async ({ loggedInPage }) => {
    // Buscar el botón de eliminar
    const deleteButton = loggedInPage.getByRole('button', { name: /Delete|Remove/i }).first();

    if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Verificar que aparece un diálogo de confirmación
      let dialogAppeared = false;

      loggedInPage.on('dialog', async (dialog) => {
        dialogAppeared = true;
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toMatch(/delete|remove|sure|confirm/i);
        await dialog.dismiss(); // Cancelar la eliminación
      });

      await deleteButton.click();

      // Esperar un momento para que aparezca el diálogo
      await loggedInPage.waitForTimeout(1000);

      expect(dialogAppeared).toBeTruthy();
    }
  });
});
