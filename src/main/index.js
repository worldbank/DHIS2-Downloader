import { app, shell, BrowserWindow, ipcMain, protocol, net, dialog, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'

const iconPath = join(__dirname, '../../resources/icon')

app.commandLine.appendSwitch('ignore-gpu-blacklist', 'true')
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('enable-zero-copy')
app.commandLine.appendSwitch('max-tiles-for-interest-area', '512')
app.commandLine.appendSwitch('max-unused-resource-memory-usage-percentage', '70')
app.commandLine.appendSwitch('js-flags', '--expose_gc')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegrationInWorker: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'home' })
  }
}

function clearCache() {
  session.defaultSession
    .clearCache()
    .then(() => {
      console.log('Browser cache cleared.')
    })
    .catch((err) => {
      console.error('Failed to clear browser cache:', err)
    })
}

function logMemoryUsage() {
  function logBytes(x) {
    console.log(x[0], x[1] / (1000.0 * 1000), 'MB')
  }

  function getMemory() {
    Object.entries(process.memoryUsage()).map(logBytes)
  }

  getMemory()
}

ipcMain.handle('dialog:saveFile', async () => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: 'Save CSV File',
    defaultPath: 'dhis2_data.csv',
    buttonLabel: 'Save',
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (canceled) {
    return null
  } else {
    return filePath
  }
})

ipcMain.handle('trigger-gc', () => {
  if (global.gc) {
    global.gc()
  } else {
    console.warn('Garbage collection is not exposed')
  }
})

ipcMain.handle('clear-cache', () => {
  return clearCache()
})

ipcMain.handle('file:write', (event, filePath, chunk) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, chunk, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
})

ipcMain.handle('file:end', (event, filePath) => {
  // Any cleanup needed when file writing is done
  console.log(`File writing completed: ${filePath}`)
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  // log memory usage every 10 seconds
  setInterval(() => {
    logMemoryUsage()
  }, 10000)

  protocol.handle('media', (req) => {
    const pathToMedia = new URL(req.url).pathname
    return net.fetch(`file://${pathToMedia}`)
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
