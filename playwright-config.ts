import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e/',
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    browserName: 'chromium',
  },
})
