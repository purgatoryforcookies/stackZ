import ElectronStore from 'electron-store'
import { StoreType } from '../../../types'
import { resolveDefaultCwd } from './util'

export const store = new ElectronStore<StoreType>({
    defaults: {
        paletteWidths: {
            palette1: 30,
            palette2: 30
        },
        userSettings: {
            defaultCwd: process.env.HOME || '',
            defaultShell: resolveDefaultCwd()
        },
        theme: 'dark'
    }
})
