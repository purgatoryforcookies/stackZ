import ElectronStore from 'electron-store'
import { StoreType } from '../../../types'

export const store = new ElectronStore<StoreType>({
  defaults: {
    paletteWidths: {
      palette1: 30,
      palette2: 30
    },
    theme: 'dark'
  }
})
