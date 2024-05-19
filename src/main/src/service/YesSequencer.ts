import { IPty } from 'node-pty'
import { CommandMetaSetting } from '../../../types'
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
    shell: string
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

        const step = this.sequence.find((i) => i.index === this.counter)
        if (!step) return
        if (this.garbage.includes(step.index)) return
        this.garbage.push(step.index)

        const command = step.echo
        let output = ''
        if (command) {
            output = await executeScript(command, this.shell, true)
            output = output.replace('\r\n', '')
        }

        setTimeout(() => {
            if (output) {
                this.ptyProcess?.write(output)
            }
            this.ptyProcess?.write('\r')
        }, 1600)
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
        if (this.registry.find((i) => i.index === this.counter)) {
            return
        }
        this.registry.push({
            index: this.counter,
            message: this.cache[1]
                .replace(
                    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
                    ''
                )
                .slice(-40)
        })
    }

    reset() {
        this.counter = 0
        this.ptyProcess = null
        this.registry = []
        this.garbage = []
    }

    bind(process: IPty | null, sequence: CommandMetaSetting['sequencing'], shell: string) {
        if (!process) throw new Error('No process provided')
        this.ptyProcess = process
        this.sequence = sequence
        this.shell = shell
    }

    isBound() {
        return this.ptyProcess !== null
    }
}
