import electron, { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import { socketServer } from './src/service/CommandService'
import { Palette } from './src/Palette'
import { store } from './src/service/Store'

// const savedCommandsPath = path.join(__dirname, './commands.json')

const savedCommandsPath = './commands.json'



const palette = new Palette(savedCommandsPath, socketServer)
palette.startServer()

function createWindow(): void {

  // dev setup to open screen on 2nd monitor
  // let displays = electron.screen.getAllDisplays()
  // let externalDisplay = displays.find((display) => {
  //   return display.bounds.x !== 0 || display.bounds.y !== 0
  // })


  const mainWindow = new BrowserWindow({
    width: 1800,
    height: 900,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? {} : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    // x: externalDisplay!.bounds.x + 50, //DEV
    // y: externalDisplay!.bounds.y + 50 //DEV

  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // dev setup to not focus on it on save
    mainWindow.blur()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('getCommands', () => {
  return palette.get()
})

ipcMain.handle('toggleTerminal', (_, id: number, state: boolean) => {
  if (state) {
    return palette.startTerminal(id)
  }
  else {
    return palette.stopTerminal(id)
  }
})

ipcMain.handle('killAll', () => {
  return palette.killAll()
})

ipcMain.handle('getStore', (_, key) => {
  return store.get(key, '300px')
})

ipcMain.handle('setStore', (_, key, value) => {
  return store.set(key, value)
})