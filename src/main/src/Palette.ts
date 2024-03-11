import { v4 as uuidv4 } from 'uuid'
import {
    ClientEvents,
    Cmd,
    GitEvents,
    NewCommandPayload,
    PaletteStack,
    StackDefaultsProps,
    StackStatus,
    UtilityEvents
} from '../../types'
import { Terminal } from './service/Terminal'
import { Server, Socket } from 'socket.io'
import { store } from './service/Store'
import { HistoryService } from './service/HistoryService'
import { GitService } from './service/GitService'

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
    socket: Socket | null
    isRunning: boolean
    save: ISaveFuntion
    history: HistoryService
    git: GitService

    constructor(
        settings: PaletteStack,
        server: Server,
        save: ISaveFuntion,
        history: HistoryService
    ) {
        this.settings = settings
        this.terminals = new Map<string, Terminal>()
        this.server = server
        this.isRunning = false
        this.socket = null
        this.save = save
        this.history = history
        this.git = new GitService(this.settings.defaultCwd)
    }

    async initTerminal(socket: Socket, remoteTerminalID: string) {
        const terminal = this.settings.palette?.find((palette) => palette.id === remoteTerminalID)

        if (terminal) {
            const newTerminal = new Terminal(
                this.settings.id,
                terminal,
                socket,
                this.pingState.bind(this),
                this.save,
                this.history
            )
            this.terminals.set(terminal.id, newTerminal)
            newTerminal.ping()
            return
        }
        if (!this.socket) return
        throw new Error(`No terminal found ${remoteTerminalID}`)
    }

    deleteTerminal(terminalId: string) {
        console.log(`Removing terminal ${terminalId}, ${this.settings.id}`)
        this.terminals.delete(terminalId)
        this.settings.palette = this.settings.palette?.filter((pal) => pal.id !== terminalId)
    }
    installStackSocket(socket: Socket) {
        this.socket = socket

        socket.on(UtilityEvents.STACKSTATE, () => {
            this.pingState()
        })
        socket.on(UtilityEvents.REORDER, (arg: { terminalId: string; newOrder: number }) => {
            this.reOrderExecution(arg)
        })
        socket.on(UtilityEvents.STACKDEFAULTS, (arg: StackDefaultsProps) => {
            this.updateDefaults(arg)
        })
        socket.on(UtilityEvents.STACKNAME, (arg: { name: string }) => {
            this.rename(arg.name)
        })
        socket.on(GitEvents.PULL, async (akw) => {
            const errors = await this.git.pull().catch(r => r)
            akw(errors)
        })
        socket.on(GitEvents.GETBRANCHES, async (akw) => {
            const branches = await this.git.getBranches().catch(r => r)
            akw(branches)
        })
        socket.on(GitEvents.SWITCHBRANCH, async (branch, akw) => {
            const errors = await this.git.switchBranch(branch)
            akw(errors)
        })
        socket.emit('hello')
        this.pingState()
    }

    async createCommand(payload: NewCommandPayload) {
        let newOrder = 1

        if (!this.settings.palette) {
            this.settings.palette = []
        } else {
            const orders = this.settings.palette.map((pal) => pal.executionOrder || 0)
            const maxOrder = Math.max(...orders)
            if (maxOrder !== -Infinity) newOrder = maxOrder + 1
        }

        const userSettings = store.get('userSettings')

        const newOne: Cmd = {
            id: uuidv4(),
            title: payload.title,
            executionOrder: newOrder,
            command: {
                cmd: payload.command ?? this.settings.defaultCommand ?? 'echo Hello World!',
                cwd:
                    payload.cwd ??
                    this.settings.defaultCwd ??
                    userSettings.global.defaultCwd ??
                    process.env.HOME,
                shell:
                    payload.shell ??
                    this.settings.defaultShell ??
                    userSettings.global.defaultShell ??
                    undefined
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
        this.pingState()
        return true
    }

    stopTerminal(id: string) {
        console.log(`Stopping terminal number ${id}`)
        const terminal = this.terminals.get(id)
        if (!terminal) return false
        terminal.stop()
        this.pingState()
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
                running: term.isRunning,
                reserved: term.isAboutToRun
            }
        })

        const state: StackStatus = {
            stack: this.settings.id,
            shell: this.settings.defaultShell,
            cwd: this.settings.defaultCwd,
            cmd: this.settings.defaultCommand,
            isRunning: terminalStates.some((term) => term.running),
            isReserved: terminalStates.some((term) => term.reserved),
            state: terminalStates
        }
        if (!this.socket) return
        this.socket.emit(ClientEvents.STACKSTATE, state)
    }

    pingAll() {
        this.terminals.forEach((term) => term.ping())
    }

    get() {
        return this.settings
    }

    reOrderExecution(arg: { terminalId: string; newOrder: number }) {
        // for updating the settings, which will be used almost all other places, than running the terminal.
        // The terminal instace contains the settings also, and they need to be updated separetly

        const oldPalette = this.settings.palette
        if (!oldPalette) return

        const objectIndex = oldPalette.findIndex((obj) => obj.id === arg.terminalId)
        if (objectIndex === -1) {
            throw new Error('Palette not found when trying to reorder')
        }

        const updatedArray = [...oldPalette]
        const item = updatedArray.splice(objectIndex, 1)[0]
        updatedArray.splice(arg.newOrder - 1, 0, item)

        this.settings.palette = updatedArray.map((term, i) => {
            return { ...term, executionOrder: i + 1 }
        })

        // and for the terminal instances
        let newExecOrder = 0
        Array.from(this.terminals.values())
            .sort((a, b) => a.settings.executionOrder! - b.settings.executionOrder!)
            .forEach((t) => {
                newExecOrder += 1
                if (t.settings.id !== arg.terminalId) t.settings.executionOrder = newExecOrder
            })
    }

    rename(newName: string) {
        this.settings.stackName = newName
        this.save()
    }
    updateDefaults(arg: StackDefaultsProps) {

        const { defaultCommand, defaultCwd, defaultShell } = arg
        if (!defaultCwd || defaultCwd.length === 0) {
            delete this.settings.defaultCwd
            this.git.clearCwd()
        } else {
            this.settings.defaultCwd = defaultCwd
            this.git.setCwd(defaultCwd)
        }

        if (!defaultShell || defaultShell.length === 0) {
            delete this.settings.defaultShell
        } else {
            this.settings.defaultShell = defaultShell
        }

        if (!defaultCommand || defaultCommand.length === 0) {
            delete this.settings.defaultCommand
        } else {
            this.settings.defaultCommand = defaultCommand
        }

        this.save()
        this.pingState()
    }
}
