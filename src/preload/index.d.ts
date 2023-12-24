import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getCommands: () => Promise<Cmd[]>,
      startTerminal: (id: number) => Promise<boolean>,
      stopTerminal: (id: number) => Promise<boolean>,
      killAll: () => Promise<void>
    },
    store: {
      get: (key: string) => Promise<string>
      set: (key: string, value: string) => Promise<void>
    }
  }
}
