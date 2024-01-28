import { ElectronAPI } from '@electron-toolkit/preload'
import { Cmd } from 'src/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getStack: (id?: number) => Promise<PaletteStack[] | PaletteStack>,
      startTerminal: (stack: number, stack: number) => Promise<boolean>,
      stopTerminal: (stack: number, stack: number) => Promise<boolean>,
      killAll: () => Promise<void>,
      save: () => Promise<void>,
      createCommand: (title: string) => Promise<Cmd>
    },
    store: {
      get: (key: string) => Promise<string>
      set: (key: string, value: string) => Promise<void>
    }
  }
}
