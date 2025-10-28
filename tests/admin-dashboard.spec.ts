import { test } from './fixtures/auth';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

test.describe('Admin dashboard - inventory grid', () => {
  test('should display expected column headers', async ({ loggedInPage }) => {
    const adminDashboard = new AdminDashboardPage(loggedInPage);

    await adminDashboard.expectDashboardVisible();

    const expectedHeaders = ['ID', 'Name', 'Category', 'Sizes', 'Price/day'];
    await adminDashboard.expectInventoryHeaders(expectedHeaders);
  });
});