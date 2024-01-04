import { ElectronAPI } from '@electron-toolkit/preload'
import { Cmd } from 'src/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getCommands: () => Promise<Cmd[]>,
      startTerminal: (id: number) => Promise<boolean>,
      stopTerminal: (id: number) => Promise<boolean>,
      killAll: () => Promise<void>,
      save: () => Promise<void>,
      createCommand: (cmd: string) => Promise<Cmd>
    },
    store: {
      get: (key: string) => Promise<string>
      set: (key: string, value: string) => Promise<void>
    }
  }
}
