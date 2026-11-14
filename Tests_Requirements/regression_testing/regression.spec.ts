
import { test, expect } from '@playwright/test';

test('RT-01: TeamUp login page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Select the Sign In link in the navigation bar.
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Sign In' })
    .click();

  // Verify that the login page opens.
  await expect(page).toHaveURL(/\/auth/);

  // Verify that the email field is visible.
  await expect(page.locator('input[type="email"]')).toBeVisible();
});


test('RT-02: TeamUp team navigation loads', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Open the Sign In page.
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Sign In' })
    .click();

  // Verify the login form is available.
  await expect(page.locator('input[type="email"]')).toBeVisible();

  // Verify that the authentication page remains accessible.
  await expect(page).toHaveURL(/\/auth/);
});


test('RT-03: TeamUp homepage works after refresh', async ({ page }) => {
  // Open the TeamUp application.
  await page.goto('http://localhost:3000/');

  // Verify that the homepage loads.
  await expect(page).toHaveURL('http://localhost:3000/');

  // Refresh the application.
  await page.reload();

  // Verify that the homepage still loads.
  await expect(page).toHaveURL('http://localhost:3000/');

  // Verify the Sign In navigation link remains visible.
  await expect(
    page.getByRole('navigation').getByRole('link', { name: 'Sign In' })
  ).toBeVisible();
});

test('RT-04: Invalid page is handled correctly', async ({ page }) => {
  // Visit a page that should not exist.
  await page.goto('http://localhost:3000/this-page-does-not-exist');

  // Verify the application displays a useful response.
  await expect(page.locator('body')).not.toBeEmpty();

  // Verify that the application has not crashed.
  await expect(page.locator('body')).toBeVisible();
});

test('RT-05: Login form requires an email', async ({ page }) => {
  await page.goto('http://localhost:3000/auth?mode=signin');

  const email = page.locator('input[type="email"]');

  await expect(email).toBeVisible();

  // Check whether the email field is required.
  await expect(email).toHaveAttribute('required', '');
});

test('RT-06: Login form rejects invalid email format', async ({ page }) => {
  await page.goto('http://localhost:3000/auth?mode=signin');

  const email = page.locator('input[type="email"]');

  await expect(email).toBeVisible();

  // Enter an invalid email address.
  await email.fill('invalid-email');

  // Verify that browser email validation detects the invalid format.
  const isValid = await email.evaluate(
    (element: HTMLInputElement) => element.checkValidity()
  );

  expect(isValid).toBe(false);
});

test('RT-07: Login form remains available after refresh', async ({ page }) => {
  await page.goto('http://localhost:3000/auth?mode=signin');

  // Verify login form before refresh.
  const email = page.locator('input[type="email"]');
  await expect(email).toBeVisible();

  // Refresh the page.
  await page.reload();

  // Verify login form remains available.
  await expect(email).toBeVisible();

  // Verify the email field still requires input.
  await expect(email).toHaveAttribute('required', '');
});

