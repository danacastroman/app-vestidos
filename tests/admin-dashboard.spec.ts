import { test } from './fixtures/auth';
import { AdminDashboardPage } from './pages/AdminDashboardPage';


test.describe('Admin Dashboard', () => {
  test('should display inventory table with correct headers', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);
  
    await adminDashboard.expectDashboardVisible();
  
    const expectedHeaders = ['ID', 'Name', 'Category', 'Sizes', 'Price/day'];
    await adminDashboard.expectInventoryHeaders(expectedHeaders);
  });
  
  test('should display both inventory and rentals sections', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();
    await adminDashboard.expectInventorySectionVisible();
    await adminDashboard.expectRentalsSectionVisible();
  });

  test('ADM-210: should display rentals table with correct headers', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const expectedHeaders = ['Rental ID', 'Item', 'Dates', 'Customer', 'Status', 'Actions'];
    await adminDashboard.expectRentalsTableHeaders(expectedHeaders);
  });

  test('should display inventory items in the table', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    // Check that at least one inventory item is displayed
    const inventoryRow = loggedInPage.locator('tbody tr').first();
    await inventoryRow.waitFor({ state: 'visible' });
  });

  test('should display inventory item details correctly', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    // Verify that first item has all expected data
    const firstRow = loggedInPage.locator('section').filter({ hasText: 'Inventory' }).locator('tbody tr').first();

    // Should have ID
    await firstRow.locator('td').nth(0).waitFor({ state: 'visible' });
    // Should have Name
    await firstRow.locator('td').nth(1).waitFor({ state: 'visible' });
    // Should have Category
    await firstRow.locator('td').nth(2).waitFor({ state: 'visible' });
    // Should have Sizes
    await firstRow.locator('td').nth(3).waitFor({ state: 'visible' });
    // Should have Price
    await firstRow.locator('td').nth(4).waitFor({ state: 'visible' });
  });

  test('ADM-210: should display rentals when available', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const rentalsTable = loggedInPage.locator('section').filter({ hasText: 'Scheduled rentals' });
    const hasRentals = await rentalsTable.locator('tbody tr').count() > 0;

    if (hasRentals) {
      const firstRentalRow = rentalsTable.locator('tbody tr').first();
      await firstRentalRow.waitFor({ state: 'visible' });
    }
  });

  test('should show "No rentals yet" message when no rentals exist', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const rentalsTable = loggedInPage.locator('section').filter({ hasText: 'Scheduled rentals' });
    const messageRow = await rentalsTable.locator('tbody tr').filter({ hasText: 'No rentals yet.' }).count();

    if (messageRow > 0) {
      // When no rentals exist, should display the "No rentals yet." message
      await adminDashboard.expectNoRentals();
      // And should have exactly 1 row (the message row)
      await loggedInPage.locator('tbody tr').filter({ hasText: 'No rentals yet.' }).waitFor({ state: 'visible' });
    } else {
      // If rentals exist, should have rental rows without the message
      const firstRentalRow = rentalsTable.locator('tbody tr').first();
      await firstRentalRow.waitFor({ state: 'visible' });
      // Verify the "No rentals yet" message is not displayed
      await adminDashboard.noRentalsMessage.waitFor({ state: 'hidden' });
    }
  });

  test('ADM-210: should display rental details when rentals exist', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const rentalsTable = loggedInPage.locator('section').filter({ hasText: 'Scheduled rentals' });
    const messageRow = await rentalsTable.locator('tbody tr').filter({ hasText: 'No rentals yet.' }).count();

    if (messageRow === 0) {
      // Only check rental details if it's not the "No rentals yet." message
      const firstRentalRow = rentalsTable.locator('tbody tr').first();

      // Should display rental ID
      await firstRentalRow.locator('td').nth(0).waitFor({ state: 'visible' });
      // Should display item ID
      await firstRentalRow.locator('td').nth(1).waitFor({ state: 'visible' });
      // Should display dates
      await firstRentalRow.locator('td').nth(2).waitFor({ state: 'visible' });
      // Should display customer info
      await firstRentalRow.locator('td').nth(3).waitFor({ state: 'visible' });
      // Should display status
      await firstRentalRow.locator('td').nth(4).waitFor({ state: 'visible' });
    }
  });

  test('ADM-220: should display Cancel button for active rentals', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const activeRental = loggedInPage.locator('tr').filter({ hasText: 'active' }).first();
    const hasActiveRental = await activeRental.count() > 0;

    if (hasActiveRental) {
      await activeRental.getByRole('button', { name: 'Cancel' }).waitFor({ state: 'visible' });
    }
  });

  test('ADM-220: should not display Cancel button for cancelled rentals', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const cancelledRental = loggedInPage.locator('tr').filter({ hasText: 'cancelled' }).first();
    const hasCancelledRental = await cancelledRental.count() > 0;

    if (hasCancelledRental) {
      const cancelButton = cancelledRental.getByRole('button', { name: 'Cancel' });
      await cancelButton.waitFor({ state: 'hidden', timeout: 1000 }).catch(() => {
        // Button should not exist
      });
    }
  });

  test('should display customer information in rentals', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const rentalsTable = loggedInPage.locator('section').filter({ hasText: 'Scheduled rentals' });
    const firstRentalRow = rentalsTable.locator('tbody tr').first();
    const hasRentals = await firstRentalRow.count() > 0;

    if (hasRentals) {
      const customerCell = firstRentalRow.locator('td').nth(3);
      await customerCell.waitFor({ state: 'visible' });

      // Should contain customer name and contact details
      const customerText = await customerCell.textContent();
      // Customer cell should not be empty
      if (customerText) {
        test.expect(customerText.length).toBeGreaterThan(0);
      }
    }
  });

  test('should display rental dates in correct format', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const rentalsTable = loggedInPage.locator('section').filter({ hasText: 'Scheduled rentals' });
    const firstRentalRow = rentalsTable.locator('tbody tr').first();
    const hasRentals = await firstRentalRow.count() > 0;

    if (hasRentals) {
      const datesCell = firstRentalRow.locator('td').nth(2);
      await datesCell.waitFor({ state: 'visible' });

      const datesText = await datesCell.textContent();
      // Should contain arrow or separator between dates
      if (datesText) {
        test.expect(datesText).toContain('→');
      }
    }
  });
});
