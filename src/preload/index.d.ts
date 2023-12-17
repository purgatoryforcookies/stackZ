import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getCommands: () => Promise<Cmd[]>,
      startTerminal: (id: number) => Promise<boolean>,
      stopTerminal: (id: number) => Promise<boolean>,
    }
  }
}
