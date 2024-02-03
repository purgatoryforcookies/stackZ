import { ElectronAPI } from '@electron-toolkit/preload'
import { Cmd, PaletteStack } from 'src/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getStack: (id?: number) => Promise<PaletteStack[] | PaletteStack>
      startTerminal: (stack: number, stack: number) => Promise<boolean>
      stopTerminal: (stack: number, stack: number) => Promise<boolean>
      killAll: () => Promise<void>
      save: () => Promise<void>
      createCommand: (title: string, stackId: number) => Promise<Cmd>
      startStack: (stack: number) => Promise<void>
      stopStack: (stack: number) => Promise<void>
      createStack: (title: string) => Promise<PaletteStack>
      deleteCommand: (terminalId: number, stackId: number) => Promise<void>
    }
    store: {
      get: (key: string) => Promise<string>
      set: (key: string, value: string) => Promise<void>
    }
  }
}
