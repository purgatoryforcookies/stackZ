import { HistoryKey, MkdirError } from "src/types";
import { readFile, access, constants, writeFileSync, mkdirSync } from "fs";
import path from "path";
import { app } from "electron";


const cmdPath = path.join(app.getPath('userData'), './history/cmd.txt')
const cwdPath = path.join(app.getPath('userData'), './history/cwd.txt')
const shellPath = path.join(app.getPath('userData'), './history/shell.txt')

export class HistoryService {

    private history: Map<keyof typeof HistoryKey, string[]>
    private limit: number

    constructor() {
        this.history = new Map([
            ['CMD', []],
            ['CWD', []],
            ['SHELL', []],
        ])

        this.limit = 3
        this.readFromDisk(cmdPath, 'CMD')
        this.readFromDisk(cwdPath, 'CWD')
        this.readFromDisk(shellPath, 'SHELL')

    }

    store(key: keyof typeof HistoryKey, value: string) {
        const mem = this.history.get(key)
        if (!mem) throw new Error(`Invalid Key ${key}`)

        if (mem.length > this.limit) mem.pop()
        mem.unshift(value)
        this.history.set(key, mem)
        console.log(this.history)
    }

    get(key: keyof typeof HistoryKey, index: number = 0) {
        return this.history.get(key)?.at(index)
    }



    async readFromDisk(file: string, key: keyof typeof HistoryKey) {

        const exists = await new Promise((res) => {
            access(file, constants.F_OK, (err) => {
                if (err) {
                    res(false)
                }
                res(true)
            })
        })

        if (!exists) {
            try {
                mkdirSync(path.join(app.getPath('userData'), './history'))
            } catch (error) {
                if ((error as MkdirError).code === 'EEXIST') {
                    console.warn("Tried to create directory for history files. It already exists.")
                }
                else {
                    console.log(error)
                }

            }
            writeFileSync(file, '');
        }



        await new Promise<void | string>((res, rej) => {
            readFile(file, 'utf8', (err, data) => {
                if (err) {
                    console.log("Could not read history")
                    rej("Error reading a file")
                }

                data.split('\n').map(i => i.trim()).reverse().forEach(i => {
                    this.history.get(key)?.push(i)
                })

                console.log(this.history)
                res()
            })

        })

    }





}