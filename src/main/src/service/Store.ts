import ElectronStore from 'electron-store'
import { StoreType } from '../../../types'
import { resolveDefaultCwd } from './util'

export const store = new ElectronStore<StoreType>({
    defaults: {
        paletteWidths: {
            header: 30,
            palette: 30
        },
        userSettings: {
            defaultCwd: process.env.HOME || '',
            defaultShell: resolveDefaultCwd()
        },
        theme: 'dark'
    }
})
