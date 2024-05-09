import { v4 as uuidv4 } from 'uuid'
import {
    Cmd,
    CustomServerSocket,
    PaletteStack,
    RecursivePartial,
    StackDefaultsProps,
    StackStatus,
} from '../../types'
import { Terminal } from './Terminal'
import { Server } from 'socket.io'
import { store } from './stores/Store'
import { HistoryService } from './service/HistoryService'
import { GitService } from './service/GitService'
import { EnvironmentService } from './service/EnvironmentService'


export interface ISaveFuntion {
    (onExport?: boolean): void
}

export interface IPingFunction {
    (message?: string): void
}

export class Palette {
    settings: PaletteStack
    terminals: Map<string, Terminal>
    server: Server
    socket: CustomServerSocket | null
    isRunning: boolean
    save: ISaveFuntion
    history: HistoryService
    environment: EnvironmentService
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

        this.environment = EnvironmentService.get()
        this.environment.register(this.settings.id, this.settings.env, true)
    }

    async initTerminal(socket: CustomServerSocket, remoteTerminalID: string) {
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
        this.reIndexOrders()
        this.environment.unregister(terminalId)
    }
    installStackSocket(socket: CustomServerSocket) {
        this.socket = socket

        socket.on('stackState', () => {
            this.pingState()
        })
        socket.on('reOrder', (arg) => {
            this.reOrderExecution(arg)
        })
        socket.on('stackDefaults', (arg) => {
            this.updateDefaults(arg)
        })
        socket.on('stackName', (arg) => {
            this.rename(arg.name)
        })

        socket.on('gitPull', async (akw) => {
            const errors = await this.git.pull()
            akw(errors)
        })
        socket.on('gitGetBranches', async (akw) => {
            const branches = await this.git.getBranches()
            akw(branches)
        })
        socket.on('gitSwitchBranch', async (branch, akw) => {
            const errors = await this.git.switchBranch(branch)
            akw(errors)
        })
        socket.emit('hello')
        this.pingState()
    }

    async createCommand(payload: RecursivePartial<Cmd>) {
        let newOrder = 1

        if (!this.settings.palette) {
            this.settings.palette = []
        } else {
            const orders = this.settings.palette.map((pal) => pal.executionOrder || 0)
            const maxOrder = Math.max(...orders)
            if (maxOrder !== -Infinity) newOrder = maxOrder + 1
        }

        const userSettings = store.get('userSettings')

        payload.executionOrder = newOrder

        if (!payload.command) {
            payload.command = {}
        }

        //If it has an id, it is an existing one and this is a copy process
        if (payload?.id) {
            const existing = this.environment.retrieve(payload.id)
            if (existing) {
                payload.command.env = existing
            }
        }

        if (!payload?.command?.cmd) {
            payload.command.cmd = this.settings.defaultCommand
                ?? 'Echo Hello World!'
        }
        if (!payload?.command?.cwd) {
            payload.command.cwd = this.settings.defaultCwd
                ?? userSettings.global.defaultCwd
                ?? process.env.HOME
        }
        if (!payload?.command?.shell) {
            payload.command.shell = this.settings.defaultShell
                ?? userSettings.global.defaultShell
                ?? undefined
        }

        payload.id = uuidv4()
        this.settings.palette.push(payload as Cmd)
        return payload
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

        this.socket?.emit('stackState', state)
        this.socket?.emit('badgeHeartBeat', state)
    }

    pingAll() {
        this.terminals.forEach((term) => term.ping())
    }

    get() {
        return this.settings
    }

    /**
     * for updating the settings, which will be used almost all other places, than running the terminal.
     * The terminal instace contains the settings also, and they need to be updated separetly
     */
    reOrderExecution(arg: { terminalId: string; newOrder: number }) {
        const oldPalette = this.settings.palette
        if (!oldPalette) return

        const objectIndex = oldPalette.findIndex((obj) => obj.id === arg.terminalId)
        if (objectIndex === -1) {
            throw new Error('Palette not found when trying to reorder')
        }

        const updatedArray = [...oldPalette]
        const item = updatedArray.splice(objectIndex, 1)[0]
        updatedArray.splice(arg.newOrder - 1, 0, item)

        this.settings.palette = updatedArray
        this.reIndexOrders()
    }

    /**
     * Cleans up execution orders of the stack.
     * This copies the order from settings and shifts terminal
     * instances to the same order.
     * Can be called independently any time
     */
    reIndexOrders = () => {
        this.settings.palette = this.settings.palette!.map((term, i) => {
            return { ...term, executionOrder: i + 1 }
        })
        Array.from(this.terminals.values())
            .sort((a, b) => a.settings.executionOrder! - b.settings.executionOrder!)
            .forEach((a) => {
                const settings = this.settings.palette?.find((i) => i.id === a.settings.id)
                if (!settings) throw new Error('Reindexin failed. Could not find settings.')
                a.settings.executionOrder = settings.executionOrder
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
