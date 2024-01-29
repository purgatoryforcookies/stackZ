import { Cmd, PaletteStack, StackStatus } from "../../types";
import { Terminal } from "./service/Terminal";
import { Server } from "socket.io";

export class Palette {
    settings: PaletteStack
    terminals: Map<number, Terminal>

    constructor(settings: PaletteStack) {
        this.settings = settings
        this.terminals = new Map<number, Terminal>()

    }

    initTerminal(socketId: string, server: Server, remoteTerminalID: number) {
        const terminal = this.settings.palette?.find(palette => palette.id === remoteTerminalID)
        if (terminal) {

            const newTerminal = new Terminal(this.settings.id, terminal, socketId, server)
            this.terminals
                .set(terminal.id, newTerminal)
            newTerminal.ping()
        }
    }

    state(): StackStatus[] {

        const state = [...this.terminals.values()].map(term => {
            return {
                id: term.settings.id,
                running: term.isRunning
            }

        })

        return state
    }

    pingAll() {
        this.terminals.forEach(term => term.ping())
    }

    get() {
        return this.settings
    }

    createCommand(title: string) {

        const newId = this.settings.palette
            ? Math.max(...this.settings.palette.map(cmd => cmd.id)) + 1
            : 1

        const newOne: Cmd = {
            id: newId,
            title: title,
            command: {
                cmd: 'echo Hello World!',
                cwd: process.env.HOME
            }
        }
        if (!this.settings.palette) {
            this.settings.palette = []
        }
        this.settings.palette.push(newOne)
        // this.save()
        return newOne
    }

    startTerminal(id: number) {
        console.log(`Starting terminal number ${id}`)
        const terminal = this.terminals.get(id)
        if (!terminal) return false
        terminal.start()
        return true
    }

    stopTerminal(id: number) {
        console.log(`Stopping terminal number ${id}`)
        const terminal = this.terminals.get(id)
        if (!terminal) return false
        terminal.stop()
        // this.save()
        return true
    }

    killAll() {
        this.terminals.forEach((terminal) => {
            terminal.stop()
        })
        // this.save()
    }

}


