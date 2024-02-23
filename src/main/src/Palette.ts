import { v4 as uuidv4 } from 'uuid'
import { ClientEvents, Cmd, PaletteStack, StackStatus } from '../../types'
import { Terminal } from './service/Terminal'
import { Server, Socket } from 'socket.io'
import { store } from './service/Store'

export interface ISaveFuntion {
    (onExport?: boolean): void
}

export interface IPingFunction {
    (): void
}

export class Palette {
    settings: PaletteStack
    terminals: Map<string, Terminal>
    server: Server

    constructor(settings: PaletteStack, server: Server) {
        this.settings = settings
        this.terminals = new Map<string, Terminal>()
        this.server = server
    }

    async initTerminal(socket: Socket, remoteTerminalID: string, save: ISaveFuntion) {
        const terminal = this.settings.palette?.find((palette) => palette.id === remoteTerminalID)

        if (terminal) {
            const newTerminal = new Terminal(
                this.settings.id,
                terminal,
                socket,
                this.pingState.bind(this),
                save
            )
            this.terminals.set(terminal.id, newTerminal)
            newTerminal.ping()
            return
        }

        throw new Error(`No terminal found ${remoteTerminalID}`)
    }

    deleteTerminal(terminalId: string) {
        console.log(`Removing stack ${terminalId}, ${this.settings.id}`)
        this.terminals.delete(terminalId)
        this.settings.palette = this.settings.palette?.filter((pal) => pal.id !== terminalId)
    }

    async createCommand(title: string) {
        let newOrder = 1

        if (!this.settings.palette) {
            this.settings.palette = []
        } else {
            const orders = this.settings.palette.map((pal) => pal.executionOrder || 0)
            const maxOrder = Math.max(...orders)
            if (maxOrder !== -Infinity) newOrder = maxOrder + 1
        }
        const defaultShell = (await store.get('userSettings.defaultShell')) as string
        const defaultCwd = (await store.get('userSettings.defaultCwd')) as string

        const newOne: Cmd = {
            id: uuidv4(),
            title: title,
            executionOrder: newOrder,
            command: {
                cmd: 'echo Hello World!',
                cwd: defaultCwd,
                shell: defaultShell
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
            isRunning: terminalStates.some((term) => term.running === true),
            state: terminalStates
        }

        this.server.emit(ClientEvents.STACKSTATE, state)
    }

    pingAll() {
        this.terminals.forEach((term) => term.ping())
    }

    get() {
        return this.settings
    }
}
