const { contextBridge, ipcRenderer } = require('electron')
const { electronAPI } = require('@electron-toolkit/preload')

const api = {
  triggerGarbageCollection: () => {
    return ipcRenderer.invoke('trigger-gc')
  },
  clearBrowserCache: () => {
    return ipcRenderer
      .invoke('clear-cache')
      .then(() => console.log('Browser cache cleared.'))
      .catch((err) => console.error('Failed to clear browser cache:', err))
  }
}

const fileSystemAPI = {
  createWriteStream: (filePath) => {
    return {
      write: (chunk) => ipcRenderer.invoke('file:write', filePath, chunk),
      end: () => ipcRenderer.invoke('file:end', filePath),
      getPath: () => filePath
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('fileSystem', fileSystemAPI)
    contextBridge.exposeInMainWorld('electronAPI', {
      selectSaveLocation: () => ipcRenderer.invoke('dialog:saveFile')
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
  window.fileSystem = fileSystemAPI
  window.electronAPI = {
    selectSaveLocation: () => ipcRenderer.invoke('dialog:saveFile')
  }
}
