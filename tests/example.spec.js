import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import path from 'path'
import { execSync } from 'child_process'
import dotenv from 'dotenv'
import os from 'os'

dotenv.config()

test.describe('Electron app', () => {
  let electronApp

  test.beforeAll(async () => {
    // Build the application before running the tests
    execSync('npm run build', { stdio: 'inherit' })

    const platform = os.platform()
    let appPath
    if (platform == 'darwin') {
      appPath = path.join(
        __dirname,
        '..',
        'dist',
        'mac-arm64',
        'DHIS2 Downloader.app',
        'Contents',
        'MacOS',
        'DHIS2 Downloader'
      )
    } else if (platform === 'win32') {
      // Windows
      appPath = path.join(__dirname, '..', 'dist', 'win-unpacked', 'DHIS2 Downloader.exe')
    } else if (platform === 'linux') {
      // Linux
      appPath = path.join(__dirname, '..', 'dist', 'linux-unpacked', 'dhis2-downloader')
    }
    console.log(`Running on platform: ${platform}`)
    console.log(`App path: ${appPath}`)

    electronApp = await electron.launch({
      executablePath: appPath
    })
  })

  // Remove the test.afterAll hook to prevent the app from closing
  test.afterAll(async () => {
    await electronApp.close()
  })

  test.beforeEach(async () => {
    const window = await electronApp.firstWindow()
    // Clear all local storage before each test
    await window.evaluate(() => localStorage.clear())
  })

  test('should have a navbar with clickable elements', async () => {
    const window = await electronApp.firstWindow()
    const navLinks = await window.$$('xpath=//navbar//a')

    // Check that each link is clickable
    for (const link of navLinks) {
      const isClickable = await link.isClickable()
      expect(isClickable).toBe(true)
    }
  })

  test('Could fill in Login Form', async () => {
    const window = await electronApp.firstWindow()
    const dhis2UrlInput = await window.locator('xpath=//form//input[@placeholder="DHIS2 URL"]')
    await dhis2UrlInput.fill(process.env.TEST_DHIS2_URL)

    // Fill in other input fields (example)
    const usernameInput = await window.locator('xpath=//form//input[@placeholder="Username"]')
    await usernameInput.fill(process.env.TEST_USERNAME)

    const passwordInput = await window.locator('xpath=//form//input[@placeholder="Password"]')
    await passwordInput.fill(process.env.TEST_PASSWORD)

    // Optionally, click the submit button
    const submitButton = await window.locator('xpath=//form//button[@type="submit"]')
    await submitButton.click()
  })
})
