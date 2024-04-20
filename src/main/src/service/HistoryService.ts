import { HistoryKey, MkdirError } from '../../../types'
import { readFile, access, constants, writeFileSync, mkdirSync, writeFile } from 'fs'
import { join } from 'path'
import { app } from 'electron'

// app is not available during testing with the current suite
// setting path to repo root fixes the issue
const dirPath = join(app?.getPath('userData') || '', './history')

export class HistoryService {
    private history: Map<keyof typeof HistoryKey, string[]>
    private limit: number

    constructor() {
        this.history = new Map()
        for (const key in HistoryKey) {
            //@ts-ignore the key is one of the HistoryKeys, trust me
            this.history.set(key, [])
        }

        this.limit = 20

        Array.from(this.history.keys()).forEach((key) => {
            this.readFromDisk(dirPath, key)
        })
    }

    store(key: keyof typeof HistoryKey, value: string) {
        const mem = this.history.get(key)
        if (!mem) throw new Error(`Invalid Key ${String(key)}`)

        if (mem.includes(value)) return

        if (mem.length > this.limit) mem.pop()
        mem.unshift(value)
        this.history.set(key, mem)
        this.save()
    }

    get(key: keyof typeof HistoryKey, index: number = 0) {
        return this.history.get(key)?.at(index)
    }

    search(key: keyof typeof HistoryKey, value: string): string[] {
        if (!value) return []

        const all = this.history.get(key)

        if (!all) return []

        return all.filter(o => o.toLowerCase().includes(value.toLowerCase()))
    }


    exists(key: keyof typeof HistoryKey, value: string) {
        return this.history.get(key)?.includes(value)
    }

    save() {
        Array.from(this.history.keys()).forEach((key) => {
            const hist = this.history.get(key as keyof typeof HistoryKey)
            if (!hist || hist.length === 0) return

            writeFile(dirPath + `/${String(key).toLowerCase()}.txt`, hist.join('\n'), (err) => {
                if (err) {
                    console.log(`Error, could not save history ${String(key)}, ${err}`)
                }
            })
        })
    }

    async readFromDisk(basePath: string, key: keyof typeof HistoryKey) {
        const fullPath = basePath + `/${String(key).toLowerCase()}.txt`

        const exists = await new Promise((res) => {
            access(fullPath, constants.F_OK, (err) => {
                if (err) {
                    res(false)
                }
                res(true)
            })
        })

        if (!exists) {
            try {
                mkdirSync(basePath)
            } catch (error) {
                if ((error as MkdirError).code === 'EEXIST') {
                    console.warn('Tried to create directory for history files. It already exists.')
                } else {
                    console.log(error)
                }
            }
            writeFileSync(fullPath, '')
        }

        await new Promise<void | string>((res, rej) => {
            readFile(fullPath, 'utf8', (err, data) => {
                if (err) {
                    console.log('Could not read history')
                    rej('Error reading a file')
                }

                data.split('\n')
                    .map((i) => i.trim())
                    .reverse()
                    .forEach((i) => {
                        this.history.get(key)?.push(i)
                    })
                res()
            })
        })
    }
}
