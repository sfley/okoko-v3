import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({
  testDir: './tests', testMatch: '**/demo.spec.js', timeout: 30000, workers: 1,
  reporter: [['list'], ['json', {outputFile: '../test-results/demo-results.json'}]],
  use: {baseURL: 'http://127.0.0.1:4173/okoko-v3/', headless: true,
    launchOptions: {executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox', '--disable-dev-shm-usage']},
    screenshot: 'only-on-failure', trace: 'retain-on-failure'},
  outputDir: '../test-results/demo-artifacts',
  webServer: {command: 'node tests/serve-demo.mjs', url: 'http://127.0.0.1:4173/okoko-v3/', reuseExistingServer: !process.env.CI},
});
