import ElectronStore, { Schema } from 'electron-store'
import { StoreType } from '../../../types'
import { resolveDefaultCwd } from './util'

const schema: Schema<StoreType> = {
    theme: {
        type: 'string',
        default: 'dark'
    },
    paletteWidths: {
        type: 'object',
        default: {},
        properties: {
            header: {
                type: 'number',
                default: 30
            },
            palette: {
                type: 'number',
                default: 30
            }
        }
    },
    userSettings: {
        type: 'object',
        default: {},
        properties: {
            global: {
                type: 'object',
                default: {},
                properties: {
                    defaultCwd: {
                        type: ['string', 'null'],
                        default: resolveDefaultCwd()
                    },
                    defaultShell: {
                        type: ['string', 'null'],
                        default: null
                    }
                }
            }
        }
    }
}

export const store = new ElectronStore<StoreType>({ schema })
