import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  retries: 1,
  testDir: "./tests",
  timeout: 10_000,
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "AUTH_SECRET=playwright-smoke-secret npm run dev",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://localhost:3000",
  },
});
