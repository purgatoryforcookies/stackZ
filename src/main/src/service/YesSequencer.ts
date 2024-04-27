import { IPty } from 'node-pty'
import { CommandMetaSetting } from 'src/types'


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


        await new Promise<void>((r) =>
            setTimeout(() => {
                const weDo = weHave.echo
                if (weDo) {
                    this.ptyProcess?.write(Array(weDo.length).fill('*').join(''))
                    this.ptyProcess?.write('\r\n')
                }
                r()
            }, 800))

    }

    trace(line: string) {
        if (!this.isBound()) return
        // skip also if we have a sequence

        if (line.includes('\n')) {
            this.increment()
        }
        this.cache.push(line)
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
            message: this.cache[1].split('\x1B')[0]
        })
    }

    reset() {
        this.counter = 0
        this.ptyProcess = null
        this.registry = []
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





