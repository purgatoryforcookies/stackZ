import { ElectronAPI } from '@electron-toolkit/preload'
import { Cmd, PaletteStack } from 'src/types'

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            getStack: (id?: string) => Promise<string>
            startTerminal: (stack: string, terminal: string) => Promise<boolean>
            stopTerminal: (stack: string, terminal: string) => Promise<boolean>
            killAll: () => Promise<void>
            save: () => Promise<void>
            createCommand: (payload: NewCommandPayload, stackId: string) => Promise<Cmd>
            startStack: (stack: string) => Promise<void>
            stopStack: (stack: string) => Promise<void>
            createStack: (title: string) => Promise<PaletteStack>
            deleteStack: (stackId: string) => Promise<void>
            deleteCommand: (stackId: string, terminalId: string) => Promise<void>
        }
        store: {
            get: (key: string) => Promise<unknown>
            set: (key: string, value: unknown) => Promise<void>
            openFileLocation: () => Promise<void>
        }
    }
}
