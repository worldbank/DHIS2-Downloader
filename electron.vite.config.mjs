import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    // Pass js-flags directly via the command and commandArgs
    command: 'electron',
    commandArgs: ['--js-flags="--expose_gc"']
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    worker: {
      format: 'es',
      plugins: []
    },
    plugins: [react()]
  }
})
