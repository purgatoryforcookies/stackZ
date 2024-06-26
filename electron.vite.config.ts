import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({

    main: {
        plugins: [externalizeDepsPlugin()]
    },
    preload: {
        resolve: {
            alias: {
                '@t': resolve('src/types.ts')
            }
        },
        plugins: [externalizeDepsPlugin()]
    },
    renderer: {

        resolve: {
            alias: {
                '@renderer': resolve('src/renderer/src'),
                '@t': resolve('src/types.ts')
            }
        },
        plugins: [react()]
    }
})
