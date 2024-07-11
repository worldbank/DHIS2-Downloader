import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: {
    timeout: 5000
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    ignoreHTTPSErrors: true
  },
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  projects: [
    {
      name: 'electron',
      use: {
        //   browserName: 'chromium',
        //   channel: 'chrome',
        //   launchOptions: {
        //     args: ['--no-sandbox']
        //   }
      }
    }
  ]
})
