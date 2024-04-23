import {
    ClientEvents,
    Cmd,
    Environment,
    EnvironmentEditProps,
    HistoryKey,
    Status,
    UtilityEvents,
    UtilityProps
} from '../../types'
import { spawn, IPty } from 'node-pty'
import { envFactory, haveThesameElements, mapEnvs, parseBufferToEnvironment } from './util/util'
import path from 'path'
import { ITerminalDimensions } from 'xterm-addon-fit'
import { Socket } from 'socket.io'
import { IPingFunction, ISaveFuntion } from './Palette'
import { HistoryService } from './service/HistoryService'
import { TerminalScheduler } from './service/TerminalScheduler'

export class Terminal {
    settings: Cmd
    stackId: string
    socket: Socket
    ptyProcess: IPty | null
    isRunning: boolean
    isAboutToRun: boolean
    scheduler: TerminalScheduler | null
    win: boolean
    rows: number | undefined
    cols: number | undefined
    stackPing: IPingFunction
    save: ISaveFuntion
    history: HistoryService
    counter: number

    constructor(
        stackId: string,
        cmd: Cmd,
        socket: Socket,
        stackPing: IPingFunction,
        save: ISaveFuntion,
        history: HistoryService
    ) {
        this.settings = cmd
        this.settings.command.env = envFactory(this.settings.command.env)
        this.stackId = stackId
        this.socket = socket
        this.win = process.platform === 'win32' ? true : false
        this.ptyProcess = null
        this.isRunning = false
        this.scheduler = null
        this.stackPing = stackPing
        this.registerTerminalEvents()
        this.save = save
        this.history = history
        this.counter = 0
    }

    chooseShell(shell?: string) {
        if (shell) return shell.trim()
        if (this.win) return 'powershell.exe'
        return 'bash'
    }

    chooseStartSettings(
        shell: string | undefined,
        cmd: string,
        loose: boolean | undefined
    ): [string, string[]] {
        const tmpShell = shell ? shell.trim() : this.win ? 'powershell.exe' : 'bash'
        const cmdArr = cmd.split(' ')

        switch (tmpShell) {
            case 'cmd.exe':
                if (loose) return [tmpShell, []]
                return ['powershell.exe', ['cmd.exe', '/c', cmd]]
            case 'wsl.exe':
                if (loose) return [tmpShell, []]
                return ['powershell.exe', ['wsl.exe', '-e', cmd]]
            case 'powershell.exe':
                if (loose) return [tmpShell, []]
                return ['powershell.exe', [cmd]]
            case 'bash':
                if (loose) return [tmpShell, ['-il']]
                return ['/bin/bash', ['-il', '-c', `. ~/.bash_profile && ${cmdArr.join(' ')}`]]
            case 'zsh':
                if (loose) return [tmpShell, ['-il']]
                return ['/bin/zsh', ['-il', '-c', `. ~/.zprofile && ${cmdArr.join(' ')}`]]
            default:
                if (this.win) {
                    if (loose) return [tmpShell, []]
                    return [tmpShell, [cmd]]
                }
                if (loose) return [tmpShell, ['-il']]
                return [tmpShell, ['-il', '-c', `'${cmdArr.shift()}' ${cmdArr.join(' ')}`]]
        }
    }

    start() {
        if (this.isRunning) {
            this.stop()
        }

        try {
            const [shell, cmd] = this.chooseStartSettings(
                this.settings.command.shell,
                this.settings.command.cmd,
                this.settings.metaSettings?.loose
            )

            this.ptyProcess = spawn(shell, cmd, {
                name:
                    shell === 'zsh' || shell === '/bin/zsh'
                        ? 'xterm-256color'
                        : `Palette ${this.settings.id}`,
                cwd: this.settings.command.cwd,
                env: mapEnvs(this.settings.command.env as Environment[]),
                useConpty: false,
                rows: this.rows,
                cols: this.cols
            })

            this.isRunning = true

            if (cmd.length === 0) {
                this.run(this.settings.command.cmd)
            }

            this.ptyProcess.onData((data) => {
                this.sendToClient(data)
                if (data.includes('\n')) {
                    this.counter += 1
                }
                console.log(this.counter)
            })
            this.ptyProcess.onExit((data) => {
                this.isRunning = false
                this.counter = 0
                this.sendToClient(`Exiting with status ${data.exitCode} ${data.signal ?? ''}\r\n`)

                const divider = Array(10).fill('-').join('')
                this.sendToClient(`${divider}\r\n`)
                this.stop()

                if (this.settings.metaSettings?.rerun) {
                    this.start()
                    if (this.scheduler) {
                        this.sendToClient('[Warning]: Restarting halting terminal\r\n')
                    }
                }
                if (this.scheduler) {
                    this.sendToClient(
                        `[Info]: Releasing stack halt on exit. Code ${data.exitCode}\r\n`
                    )
                    this.scheduler.unhalt()
                    this.socket.emit(ClientEvents.HALTBEAT, false)
                    this.scheduler = null
                }
                this.ping()
                this.stackPing()
            })

            this.ping()
            this.stackPing()
        } catch (e) {
            this.sendToClient(`${e} \r\n$ `)
            this.isRunning = false
        }
    }

    run(cmd: string) {
        this.write(cmd)
        this.prompt()
    }

    /**
     * Sets a flag for the instance to indicate
     * that this terminal is about to run, once its healthcheck
     * and delays are done.
     */
    reserve() {
        this.isAboutToRun = true
        this.ping()
    }
    unReserve() {
        this.isAboutToRun = false
        this.ping()
    }
    registerScheduler(sched: TerminalScheduler) {
        this.scheduler = sched
    }

    resize(dims: ITerminalDimensions) {
        if (!dims) return
        try {
            this.ptyProcess?.resize(dims.cols, dims.rows)
        } catch {
            // swallow
        }
        this.rows = dims.rows
        this.cols = dims.cols
    }

    stop() {
        if (this.settings.metaSettings?.ctrlc) {
            this.write('\x03')
        } else {
            try {
                const code = this.win ? undefined : 'SIGHUP'
                this.isRunning = false
                this.ptyProcess?.kill(code)
            } catch {
                //swallow
            }
        }
        this.ping()
        this.stackPing()
    }

    ping() {
        this.socket.emit(ClientEvents.TERMINALSTATE, this.getState())
        this.save()
    }

    getState(): Status {
        if (!this.settings.command.shell) {
            this.settings.command.shell = this.chooseShell()
        }

        return {
            stackId: this.stackId,
            reserved: this.isAboutToRun,
            cmd: this.settings,
            isRunning: this.isRunning,
            cwd: this.settings.command.cwd ?? process.env.HOME
        }
    }

    sendToClient(data: string) {
        this.socket.emit('output', data)
    }

    writeFromClient(data: string) {
        if (data.length === 0) return
        this.write(data)
    }

    write(data: string) {
        if (!this.ptyProcess) return
        this.ptyProcess.write(data)
    }

    prompt() {
        if (!this.ptyProcess) return
        this.ptyProcess.write(`\r`)
    }

    editVariable(args: EnvironmentEditProps) {
        if (args.key.trim().length == 0) return
        const target = this.settings.command.env?.find((list) => list.order === args.order)
        if (target) {
            if (args.previousKey) {
                delete target.pairs[args.previousKey]
            }
            target.pairs[args.key] = args.value
            target.pairs = Object.fromEntries(Object.entries(target.pairs).sort())
        }
        this.ping()
    }

    muteVariable(args: UtilityProps) {
        if (args.value && args.value.trim().length == 0) return
        const target = this.settings.command.env?.find((list) => list.order === args.order)

        if (target) {
            if (!args.value) {
                if (haveThesameElements(Object.keys(target.pairs), target.disabled)) {
                    target.disabled = []
                } else {
                    target.disabled.push(...Object.keys(target.pairs))
                }
            } else if (target.disabled.includes(args.value)) {
                target.disabled = target.disabled.filter((item) => item !== args.value)
            } else {
                target.disabled.push(args.value)
            }
        }

        this.ping()
    }

    updateCwd(value: string) {
        if (!this.history.exists('CWD', value)) {
            if (this.settings.command.cwd) {
                this.history.store('CWD', this.settings.command.cwd)
            }
        }
        const newPath = path.normalize(value.trim())
        this.settings.command.cwd = newPath
        this.history.store('CWD', newPath)
        this.ping()
    }

    updateCommand(value: string | null) {
        if (!value) return
        const newCommand = value.trim()

        if (!this.history.exists('CMD', newCommand)) {
            this.history.store('CMD', this.settings.command.cmd)
        }
        this.settings.command.cmd = newCommand
        this.history.store('CMD', newCommand)
        this.ping()
    }

    changeShell(newShell: string | undefined) {
        const resolvedShell = this.chooseShell(newShell)
        this.settings.command.shell = resolvedShell
        this.history.store('SHELL', 'shell ' + newShell)
        this.ping()
    }

    changeTitle(title: string) {
        this.settings.title = title
        this.ping()
    }

    addEnvList(value: string, variables: Record<string, string>) {
        if (!value) return
        if (this.settings.command.env!.some((env) => env.title === value)) {
            value += ' (1)'
        }

        const newEnv: Environment = {
            pairs: variables,
            title: value,
            order: Math.max(...this.settings.command.env!.map((env) => env.order)) + 1,
            disabled: []
        }

        this.settings.command.env?.push(newEnv)
        this.ping()
    }

    removeEnvList(args: UtilityProps) {
        this.settings.command.env = this.settings.command.env!.filter(
            (env) => env.order != args.order
        )

        for (let i = 0; i < this.settings.command.env.length; i++) {
            this.settings.command.env[i].order = i
        }
        this.ping()
    }

    removeEnv(args: UtilityProps) {
        if (!args.value) return
        const list = this.settings.command.env?.find((list) => list.order === args.order)
        delete list?.pairs[args.value]
        this.ping()
    }

    setMetaSettings(name: string, value: string | boolean | number | undefined) {
        console.log(`Setting meta ${name} - ${value}`)
        if (!this.settings.metaSettings) {
            this.settings.metaSettings = {}
        }
        if (name === 'healthCheck' && typeof value === 'string') {
            const trimmed = value.trim()
            if (trimmed.length > 3) this.history.store('HEALTH', trimmed)
            this.settings.metaSettings[name] = trimmed
        } else {
            if (typeof value === 'undefined' || value === null) {
                delete this.settings.metaSettings[name]
            } else {
                this.settings.metaSettings[name] = value
            }
        }
        this.ping()
    }

    registerTerminalEvents() {
        this.socket.on(UtilityEvents.CWD, (arg: string, akw) => {
            console.log(`[New cwd]: ${arg}`)
            this.updateCwd(arg)
            akw(this.getState())
        })
        this.socket.on(UtilityEvents.CMD, (arg: string, akw) => {
            console.log(`[New cmd]: ${arg}`)
            this.updateCommand(arg)
            if (akw) akw(this.getState())
        })
        this.socket.on(UtilityEvents.SHELL, (arg: string, akw) => {
            console.log(`[New shell]: ${arg}`)
            this.changeShell(arg)
            if (akw) akw(this.getState())
        })
        this.socket.on(UtilityEvents.TITLE, (arg: string, akw) => {
            console.log(`[New title]: ${arg}`)
            this.changeTitle(arg)
            if (akw) akw(this.getState())
        })
        this.socket.on(UtilityEvents.INPUT, (args) => {
            if (!args.data) return
            this.writeFromClient(args.data)
        })
        this.socket.on(UtilityEvents.RESIZE, (args: { value: ITerminalDimensions }) => {
            this.resize(args.value)
        })
        this.socket.on(UtilityEvents.ENVLISTDELETE, (args: UtilityProps) => {
            this.removeEnvList(args)
        })
        this.socket.on(UtilityEvents.ENVDELETE, (args: UtilityProps) => {
            this.removeEnv(args)
        })
        this.socket.on(UtilityEvents.CMDMETASETTINGS, (name: string, value, akw) => {
            this.setMetaSettings(name, value)
            akw(this.getState())
        })
        this.socket.on(
            UtilityEvents.ENVLIST,
            (args: { value: string; fromFile: ArrayBuffer | undefined }) => {
                if (!args.value) return

                const environment = parseBufferToEnvironment(args.fromFile)
                this.addEnvList(args.value, environment)
            }
        )
        this.socket.on(UtilityEvents.ENVEDIT, (args: EnvironmentEditProps) => {
            this.editVariable(args)
        })
        this.socket.on(UtilityEvents.ENVMUTE, (arg: UtilityProps) => {
            this.muteVariable(arg)
        })
        this.socket.on(UtilityEvents.STATE, () => {
            this.ping()
        })

        this.socket.on('retrieve_settings', (akw) => {
            akw(this.getState())
        })

        this.socket.on(
            'history',
            (
                key: keyof typeof HistoryKey,
                { feed, step }: { feed?: string; step?: number },
                akw
            ) => {
                if (feed) {
                    akw(this.history.search(key, feed))
                    return
                }
                if (step) {
                    akw(this.history.get(key, step))
                    return
                }
                return
            }
        )
        this.socket.emit('hello')
        this.stackPing()
    }
}
