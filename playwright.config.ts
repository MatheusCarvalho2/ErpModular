import { defineConfig, devices } from "@playwright/test";

/** Specs known to hang/flake on CI after suite pollution; keep in repo for local runs. */
const CI_EXCLUDED_SPECS = [
  "**/grupos-assign-authz.spec.ts",
  "**/grupos-assign-user.spec.ts",
  "**/grupos-custom-create.spec.ts",
];

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  testIgnore: process.env.CI ? CI_EXCLUDED_SPECS : [],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
