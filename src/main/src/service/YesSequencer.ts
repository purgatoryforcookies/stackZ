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
    private secrets: string[] = []
    cache: string[] = []
    cacheLimit = 2

    /**
     * Registry contains stored steps from the stacks.json file.
     */
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

    redactSecrets(data: string) {
        if (this.secrets.length === 0) return data
        let newData = data
        this.secrets.forEach((secret) => {
            newData = newData.replaceAll(secret, '******')
        })
        return newData
    }

    /**
     * Writes and executes a step into the process when the following
     * conditions are met:
     * * There is a pty process in the sequencer
     * * There are steps in the sequence
     * * Terminal is in the correct line (ie. it is time to play a step)
     * * The step has not been played before.
     */
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
        if (step.secret) {
            this.secrets.push(output)
        }

        setTimeout(() => {
            if (output) {
                this.ptyProcess?.write(output)
            }
            this.ptyProcess?.write('\r')
        }, 300)
    }

    /**
     * Each line of the terminals feed is fed into trace.
     * Trace stores last cachelimit steps in its memory.
     * Each newline character tells the tracer that a new line
     * should be stored in the memory.
     */
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

    /**
     * Registers the current trace() -stored step into the registry.
     * Registry contains steps that are playable with play()
     *
     * register() is currently triggered when user interacts with the terminal
     * process with their keyboard.
     *
     * Last stored trace() is stored into registry as a message. Purpose of this
     * is to show it to the user. Makes an attempt to clean the message.
     */
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

    /**
     * Resets the YesSequencer completely.
     */
    reset() {
        this.counter = 0
        this.ptyProcess = null
        this.registry = []
        this.garbage = []
        this.secrets = []
    }

    /**
     * Stores a reference of the pty process in Sequencers memory
     */
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
