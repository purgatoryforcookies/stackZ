import { v4 as uuidv4 } from 'uuid'
import { Cmd, PaletteStack, StackStatus } from '../../types'
import { Terminal } from './service/Terminal'
import { Server } from 'socket.io'
import { resolveDefaultCwd } from './service/util'

export class Palette {
    settings: PaletteStack
    terminals: Map<string, Terminal>
    server: Server

    constructor(settings: PaletteStack, server: Server) {
        this.settings = settings
        this.terminals = new Map<string, Terminal>()
        this.server = server
    }

    initTerminal(socketId: string, server: Server, remoteTerminalID: string) {
        const terminal = this.settings.palette?.find((palette) => palette.id === remoteTerminalID)
        if (terminal) {
            const newTerminal = new Terminal(this.settings.id, terminal, socketId, server, this.pingState.bind(this))
            this.terminals.set(terminal.id, newTerminal)
            newTerminal.ping()
            return
        }
        throw new Error(`No terminal found ${socketId}, ${remoteTerminalID}`)
    }

    deleteTerminal(terminalId: string) {
        console.log(`Removing stack ${terminalId}, ${this.settings.id}`)
        this.terminals.delete(terminalId)
        this.settings.palette = this.settings.palette?.filter((pal) => pal.id !== terminalId)
    }

    createCommand(title: string) {
        let newOrder = 1

        if (!this.settings.palette) {
            this.settings.palette = []
        } else {
            const orders = this.settings.palette.map((pal) => pal.executionOrder || 0)
            const maxOrder = Math.max(...orders)
            if (maxOrder !== -Infinity) newOrder = maxOrder + 1
        }

        const newOne: Cmd = {
            id: uuidv4(),
            title: title,
            executionOrder: newOrder,
            command: {
                cmd: 'echo Hello World!',
                cwd: resolveDefaultCwd()
            }
        }

        this.settings.palette.push(newOne)
        return newOne
    }

    startTerminal(id: string) {
        console.log(`Starting terminal number ${id}`)
        const terminal = this.terminals.get(id)
        if (!terminal) return false
        terminal.start()
        return true
    }

    stopTerminal(id: string) {
        console.log(`Stopping terminal number ${id}`)
        const terminal = this.terminals.get(id)
        if (!terminal) return false
        terminal.stop()
        return true
    }

    killAll() {
        this.terminals.forEach((terminal) => {
            terminal.stop()
        })
    }

    pingState() {

        const terminalStates = [...this.terminals.values()].map((term) => {

            return {
                id: term.settings.id,
                running: term.isRunning
            }
        })
        const state: StackStatus = {
            stack: this.settings.id,
            isRunning: terminalStates.some(term => term.running === true),
            state: terminalStates
        }

        this.server.emit('stackState', state)
    }

    pingAll() {
        this.terminals.forEach((term) => term.ping())
    }

    get() {
        return this.settings
    }
}
