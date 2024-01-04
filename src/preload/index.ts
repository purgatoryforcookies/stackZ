import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Cmd } from '../types'

// Custom APIs for renderer
const api = {
  getCommands: (): Promise<Cmd[]> => ipcRenderer.invoke('getCommands'),
  startTerminal: (id: number): Promise<boolean> => ipcRenderer.invoke('toggleTerminal', id, true),
  stopTerminal: (id: number): Promise<boolean> => ipcRenderer.invoke('toggleTerminal', id, false),
  killAll: (): Promise<boolean> => ipcRenderer.invoke('killAll'),
  save: (): Promise<void> => ipcRenderer.invoke('save'),
  createCommand: (cmd: string): Promise<Cmd> => ipcRenderer.invoke('createCommand', cmd)
}

const store = {
  get: (key: string): Promise<string> => ipcRenderer.invoke('getStore', key),
  set: (key: string, value: string): Promise<void> => ipcRenderer.invoke('setStore', key, value)
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
