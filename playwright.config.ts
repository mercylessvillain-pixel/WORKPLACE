import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests drive a real browser against a real build of the app,
 * backed by a throwaway PGlite database — the same engine the dev server and
 * the integration suite use, so no external services are needed to run them.
 *
 * `npm run e2e` builds nothing: run `npm run build` first (CI does), then the
 * config starts `next start` on port 3100 and waits for it.
 *
 * E2E_CHROMIUM_PATH lets a machine without Playwright's own browser download
 * point at a local Chromium instead.
 */

const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;
const executablePath = process.env.E2E_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./.e2e/results",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [["github"], ["html", { outputFolder: ".e2e/report", open: "never" }]] : [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          ...(executablePath ? { executablePath } : {}),
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        },
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run e2e:server -- -p ${port}`,
        url: `${baseURL}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          NODE_ENV: "production",
          DATABASE_URL: "",
          PGLITE_DATA_DIR: ".e2e/pglite",
          AUTH_SECRET: "e2e-auth-secret-that-is-long-enough-1234567890",
          ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          NEXT_PUBLIC_APP_URL: baseURL,
          CRON_SECRET: "e2e-cron-secret",
          // Several accounts are created from one address during a run.
          RATE_LIMIT_SIGNUP: "100/3600",
          RATE_LIMIT_EMAIL_VERIFICATION: "100/3600",
          RATE_LIMIT_WIDGET_RATING: "100/3600",
        },
      },
});
