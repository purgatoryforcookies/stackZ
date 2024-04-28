import { IPty } from 'node-pty'
import { CommandMetaSetting } from 'src/types'
import { executeScript } from '../util/util'


/**
 * Service that allows to record and the playback sequences
 * in a terminal process. Sequencer binds to the nodePty process and
 * writes to the process behalve of the users if there is something to play.
 * 
 * If there is no sequence it records.
 * If no pty process is bound to it, it does nothing.
 * 
 */
export class YesSequencer {

    counter: number
    ptyProcess: IPty | null
    private sequence: CommandMetaSetting['sequencing']
    cache: string[] = []
    cacheLimit = 2
    registry: Exclude<CommandMetaSetting['sequencing'], undefined>
    garbage: number[] = []


    constructor() {
        this.counter = 0
        this.ptyProcess = null
        this.registry = []
    }


    increment() {
        this.counter += 1
    }

    async play() {

        if (!this.ptyProcess) return
        if (!this.sequence || this.sequence.length === 0) return

        const weHave = this.sequence.find(i => i.index === this.counter)
        if (!weHave) return
        if (this.garbage.includes(weHave.index)) return
        this.garbage.push(weHave.index)

        const weDo = weHave.echo
        let output = ''
        if (weDo) {
            output = await executeScript(weDo, process.platform === 'win32' ? 'powershell.exe' : 'bash', true)
            if (!output) {
                output = await executeScript('echo ' + weDo, process.platform === 'win32' ? 'powershell.exe' : 'bash', true)
            }
        }

        setTimeout(() => {
            if (output) {
                this.ptyProcess?.write(output)
            }
            this.ptyProcess?.write('\r')
        }, 600)
    }

    trace(line: string) {
        if (!this.isBound()) return

        if (line.includes('\n')) {
            this.increment()
        }
        this.cache.push(line.toString())
        if (this.cache.length > this.cacheLimit) {
            this.cache.shift()
        }

        this.play()
    }

    register() {
        if (this.registry.find(i => i.index === this.counter)) {
            return
        }
        this.registry.push({
            index: this.counter,
            message: this.cache[1]
                .replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
                .slice(-30)
        })
    }

    reset() {
        this.counter = 0
        this.ptyProcess = null
        this.registry = []
        this.garbage = []
    }

    bind(process: IPty | null, sequence: CommandMetaSetting['sequencing']) {
        if (!process) throw new Error("No process provided")
        this.ptyProcess = process
        this.sequence = sequence

    }

    isBound() {
        return this.ptyProcess !== null
    }

}





