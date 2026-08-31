import { expect, test } from "@playwright/test";

test("redirects a signed-out visitor from the home page to sign-in", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
});

test("shows a validation error for a malformed sign-in", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("not-an-email");
  await page.getByLabel("Password").fill("short");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByText(/invalid/i).first()).toBeVisible();
});
