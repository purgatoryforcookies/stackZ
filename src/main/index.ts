import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { socketServer } from './src/service/socket'
import { store } from './src/stores/Store'
import { Stack } from './src/Stack'
import { stackSchema } from '../types'
import { exec } from 'child_process'
import { MyParser } from './lang-dotenv/Parser'

const savedCommandsPath = path.join(app.getPath('userData'), './stacks.json')
const stack = new Stack(savedCommandsPath, socketServer, stackSchema)

// const parser = new MyParser()
// try {
//     const program = `=`

//     const ast = parser.parse(program)

//     console.log(JSON.stringify(ast, null, 2))
// } catch (error) {
//     console.log('Parsing failed', error)
// }

// console.log = () => {}

let windowInstance: BrowserWindow | null = null

async function createWindow(): Promise<void> {
    await stack.load()
    stack.init()?.startServer()

    // dev setup to open screen on 2nd monitor for refresh
    let disp: Electron.Display | undefined

    if (is.dev) {
        const electron = require('electron')
        const displays = electron.screen.getAllDisplays()
        disp = displays.find((display) => {
            return display.bounds.x !== 0 || display.bounds.y !== 0
        })
    }

    const mainWindow = new BrowserWindow({
        titleBarStyle: 'hidden',
        hasShadow: true,
        width: 1800,
        height: 900,
        minWidth: 200,
        show: false,
        autoHideMenuBar: !is.dev,

        ...(process.platform === 'linux' ? {} : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        },
        x: disp ? disp.bounds.x + 50 : undefined, //DEV
        y: disp ? disp.bounds.y + 50 : undefined //DEV
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        // dev setup to not focus on it on save
        if (!is.dev) mainWindow.blur()
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

    windowInstance = mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.stackZ')
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

ipcMain.handle('close', () => {
    app.quit()
})

ipcMain.handle('minimize', () => {
    if (windowInstance) {
        if (windowInstance.minimizable) {
            windowInstance.minimize()
        }
    }
})

ipcMain.handle('maximize', () => {
    if (windowInstance) {
        if (windowInstance.isMaximized()) {
            windowInstance.unmaximize()
        } else {
            windowInstance.maximize()
        }
    }
})

ipcMain.handle('getStack', (_, id?: string) => {
    return JSON.stringify(stack.get(id))
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

ipcMain.handle('createCommand', (_, payload, stackId) => {
    const newOne = stack.createTerminal(payload, stackId)
    return newOne
})

ipcMain.handle('deleteCommand', (_, stackId, terminalId) => {
    return stack.deleteTerminal(stackId, terminalId)
})
ipcMain.handle('createStack', (_, title) => {
    return stack.createStack(title)
})
ipcMain.handle('deleteStack', (_, stackId) => {
    return stack.removeStack(stackId)
})

ipcMain.handle('openFilesLocation', (_, path?: string) => {
    const dirPath = path ?? app.getPath('userData')
    let command = ''
    switch (process.platform) {
        case 'darwin':
            command = 'open'
            break
        case 'win32':
            command = 'explorer'
            break
        default:
            command = 'xdg-open'
            break
    }
    exec(`${command} "${dirPath}"`)
})
