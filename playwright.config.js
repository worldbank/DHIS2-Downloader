// playwright.config.js
module.exports = {
  use: {
    headless: false
  },
  projects: [
    {
      name: 'electron',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        launchOptions: {
          args: ['--no-sandbox']
        }
      }
    }
  ]
}
