import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Cmd, PaletteStack, RecursivePartial } from '../types'

// Custom APIs for renderer
const api = {
    getStack: (id?: string): Promise<PaletteStack[]> =>
        ipcRenderer.invoke('getStack', id),

    startTerminal: (stack: string, terminal: string): Promise<boolean> =>
        ipcRenderer.invoke('toggleTerminal', stack, terminal, true),

    stopTerminal: (stack: string, terminal: string): Promise<boolean> =>
        ipcRenderer.invoke('toggleTerminal', stack, terminal, false),

    startStack: (stack: string) => ipcRenderer.invoke('toggleStack', stack, true),
    stopStack: (stack: string) => ipcRenderer.invoke('toggleStack', stack, false),

    killAll: (): Promise<boolean> => ipcRenderer.invoke('killAll'),

    save: (): Promise<void> => ipcRenderer.invoke('save'),

    createCommand: (payload: RecursivePartial<Cmd>, stackId: string): Promise<Cmd> =>
        ipcRenderer.invoke('createCommand', payload, stackId),


    deleteCommand: (stackId: string, terminalId: string): Promise<Cmd> =>
        ipcRenderer.invoke('deleteCommand', stackId, terminalId),

    createStack: (title: string): Promise<PaletteStack> => ipcRenderer.invoke('createStack', title),
    deleteStack: (stackId: string): Promise<void> => ipcRenderer.invoke('deleteStack', stackId)
}

const store = {
    get: (key: string): Promise<unknown> => ipcRenderer.invoke('getStore', key),
    set: (key: string, value: unknown): Promise<void> => ipcRenderer.invoke('setStore', key, value),
    openFileLocation: (path?: string) => ipcRenderer.invoke('openFilesLocation', path)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
        contextBridge.exposeInMainWorld('store', store)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
    // @ts-ignore (define in dts)
    window.store = store
}
