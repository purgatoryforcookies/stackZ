import { HistoryBook, HistoryKey, MkdirError } from '../../../types'
import { readFile, access, constants, writeFileSync, mkdirSync, writeFile } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import { executeScript } from '../util/util'

// app is not available during testing with the current suite
// setting path to repo root fixes the issue
const dirPath = join(app?.getPath('userData') || '', './history')

export class HistoryService {
    private history: Map<keyof typeof HistoryKey, string[]>
    private hostHistory: string[]
    private limit: number

    constructor() {
        this.history = new Map()
        this.hostHistory = []
        for (const key in HistoryKey) {
            //@ts-ignore the key is one of the HistoryKeys, trust me
            this.history.set(key, [])
        }

        this.limit = 20

        Array.from(this.history.keys()).forEach((key) => {
            this.readFromDisk(dirPath, key)
        })
        this.loadWinHostHistory()
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

    search(key: keyof typeof HistoryKey, value: string): HistoryBook {
        if (!value) throw new Error('Value not provided')

        const all = this.history.get(key) ?? []

        return {
            stackz: all.filter((o) => o.toLowerCase().includes(value.toLowerCase())),
            host: this.hostHistory.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
        }
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

    reboot() {
        Array.from(this.history.keys()).forEach((key) => {
            this.history.set(key, [])
        })
        this.save()
    }

    async loadWinHostHistory() {


        if (process.platform !== 'win32') {

            const resultzsh = await executeScript('cat ~/.zsh_history', '/bin/bash')
            const resultbash = await executeScript('cat ~/.bash_history', '/bin/bash')


            const arrayedZsh = resultzsh.split('\n').map((i) => i.replaceAll('\r', '')).map(i => i.split(';', 2)[1])
            const arrayedBash = resultbash.split('\n').map((i) => i.replaceAll('\r', ''))
            const combined = [...new Set(arrayedBash), ...new Set(arrayedZsh)]
            this.hostHistory = combined.filter(i => i)
        }
        else {
            const command = [
                'cat $env:USERPROFILE\\AppData',
                '\\Roaming\\Microsoft',
                '\\Windows\\PowerShell\\PSReadLine',
                '\\ConsoleHost_history.txt'
            ]
            const result = await executeScript(command.join(''), 'powershell.exe')
            const arrayed = result.split('\n').map((i) => i.replaceAll('\r', ''))
            this.hostHistory = [...new Set(arrayed)]
        }

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
