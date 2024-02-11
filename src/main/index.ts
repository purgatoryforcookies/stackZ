import electron, { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { socketServer } from './src/service/CommandService'
import { store } from './src/service/Store'
import { Stack } from './src/Stack'
import { stackSchema } from '../types'

// const savedCommandsPath = path.join(__dirname, './commands_save.json')

const savedCommandsPath = './stacks.json'
const stack = new Stack(savedCommandsPath, socketServer, stackSchema)

async function createWindow(): Promise<void> {
    await stack.load()
    stack.init()?.startServer()

    // dev setup to open screen on 2nd monitor
    const displays = electron.screen.getAllDisplays()
    const externalDisplay = displays.find((display) => {
        return display.bounds.x !== 0 || display.bounds.y !== 0
    })

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
        x: externalDisplay!.bounds.x + 50, //DEV
        y: externalDisplay!.bounds.y + 50 //DEV
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
app.whenReady().then(async () => {
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

ipcMain.handle('getStack', (_, id?: string) => {
    return stack.get(id)
})

ipcMain.handle('toggleTerminal', (_, stackId: string, terminalID: string, state: boolean) => {
    if (state) {
        return stack.startTerminal(stackId, terminalID)
    } else {
        return stack.stopTerminal(stackId, terminalID)
    }
})
ipcMain.handle('toggleStack', (_, stackId: string, state: boolean) => {
    if (state) {
        return stack.startStack(stackId)
    } else {
        return stack.stopStack(stackId)
    }
})

ipcMain.handle('killAll', () => {
    // return palette.killAll()
})

ipcMain.handle('getStore', (_, key) => {
    return store.get(key)
})

ipcMain.handle('setStore', (_, key, value) => {
    store.set(key, value)
})

ipcMain.handle('save', () => {
    // return palette.save()
})

ipcMain.handle('createCommand', (_, title, stackId) => {
    const newOne = stack.createTerminal(title, stackId)
    return newOne
})
ipcMain.handle('deleteCommand', (_, stackId, terminalId) => {
    return stack.deleteTerminal(stackId, terminalId)
})
ipcMain.handle('createStack', (_, title) => {
    return stack.createStack(title)
})
