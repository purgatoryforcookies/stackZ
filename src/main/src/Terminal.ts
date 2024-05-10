import {
    Cmd,
    CustomServerSocket,
    HistoryKey,
    MetaSettingPayload,
    Status,
} from '../../types'
import { spawn, IPty } from 'node-pty'
import { bakeEnvironmentToString, parseBufferToEnvironment } from './util/util'
import path from 'path'
import { ITerminalDimensions } from 'xterm-addon-fit'
import { IPingFunction, ISaveFuntion } from './Palette'
import { HistoryService } from './service/HistoryService'
import { TerminalScheduler } from './service/TerminalScheduler'
import { YesSequencer } from './service/YesSequencer'
import { EnvironmentService } from './service/EnvironmentService'


export class Terminal {
    settings: Cmd
    stackId: string
    environment: EnvironmentService
    socket: CustomServerSocket
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
    yesSequence: YesSequencer
    counter: number

    constructor(
        stackId: string,
        cmd: Cmd,
        socket: CustomServerSocket,
        stackPing: IPingFunction,
        save: ISaveFuntion,
        history: HistoryService
    ) {
        this.settings = cmd
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
        this.yesSequence = new YesSequencer()
        this.counter = 0

        this.environment = EnvironmentService.get()
        this.environment.register(this.settings.id, this.settings.command.env)

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
                env: this.environment.bake([this.stackId, this.settings.id]),
                useConpty: false,
                rows: this.rows,
                cols: this.cols
            })
            if (this.settings.metaSettings?.sequencing) {
                this.yesSequence.bind(this.ptyProcess, this.settings.metaSettings.sequencing, shell)
            }

            this.isRunning = true

            if (cmd.length === 0) {
                this.run(this.settings.command.cmd)
            }

            this.ptyProcess.onData((data) => {
                this.sendToClient(data)
                this.yesSequence.trace(data)
            })
            this.ptyProcess.onExit((data) => {
                this.isRunning = false

                if (this.yesSequence.isBound() && this.yesSequence.registry) {
                    if (this.settings.metaSettings?.sequencing) {
                        if (this.settings.metaSettings.sequencing.length === 0) {
                            this.settings.metaSettings.sequencing = [...this.yesSequence.registry]
                        }
                    }
                }

                this.yesSequence.reset()
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
                    this.socket.emit('haltBeat', false)
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
            console.log('[Warning:] Could not resize.')
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
                console.log('[Warning:] Error happened during stop.')
            }
        }
        this.ping()
        this.stackPing()
    }

    ping() {
        this.socket.emit('terminalState', this.getState())
        this.save()
    }

    getState(): Status {
        if (!this.settings.command.shell) {
            this.settings.command.shell = this.chooseShell()
        }

        this.settings.command.env = this.environment.store.get(this.settings.id)

        return {
            stackId: this.stackId,
            stackEnv: this.environment.store.get(this.stackId),
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

        if (this.yesSequence.isBound()) {
            this.yesSequence.register()
        }
    }

    write(data: string) {
        if (!this.ptyProcess) return
        this.ptyProcess.write(data)
    }

    prompt() {
        if (!this.ptyProcess) return
        this.ptyProcess.write(`\r`)
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

    setMetaSettings(name: string, value: MetaSettingPayload) {
        console.log(`Setting meta ${name} - ${value}`)

        if (!this.settings.metaSettings) {
            this.settings.metaSettings = {}
        }
        if (typeof value === 'undefined' || value === null) {
            delete this.settings.metaSettings[name]
            if (Object.keys(this.settings.metaSettings).length === 0) {
                delete this.settings.metaSettings
            }
            return
        }

        if (name === 'healthCheck' && typeof value === 'string') {
            const trimmed = value.trim()
            if (trimmed.length > 3) this.history.store('HEALTH', trimmed)
            this.settings.metaSettings[name] = trimmed

        }
        if (name === 'sequencing' && typeof value === 'object' && !Array.isArray(value)) {

            if (!this.settings.metaSettings.sequencing) {
                this.settings.metaSettings.sequencing = []
            }
            this.settings.metaSettings.sequencing.map(item => {
                if (item.index !== value.index) return item
                item.echo = value.echo
                return item
            })
        } else {
            this.settings.metaSettings[name] = value
        }

        this.ping()
    }

    registerTerminalEvents() {
        this.socket.on('changeCwd', (arg: string, akw) => {
            console.log(`[New cwd]: ${arg}`)
            this.updateCwd(arg)
            akw(this.getState())
        })
        this.socket.on('changeCommand', (arg: string, akw) => {
            console.log(`[New cmd]: ${arg}`)
            this.updateCommand(arg)
            if (akw) akw(this.getState())
        })
        this.socket.on('changeShell', (arg: string, akw) => {
            console.log(`[New shell]: ${arg}`)
            this.changeShell(arg)
            if (akw) akw(this.getState())
        })
        this.socket.on('changeTitle', (arg: string, akw) => {
            console.log(`[New title]: ${arg}`)
            this.changeTitle(arg)
            if (akw) akw(this.getState())
        })
        this.socket.on('input', (args) => {
            if (!args.data) return
            this.writeFromClient(args.data)
        })
        this.socket.on('resize', (args) => {
            this.resize(args.value)
        })
        this.socket.on('commandMetaSetting', (name, value, akw) => {
            console.log(name, value)
            this.setMetaSettings(name, value)
            akw(this.getState())
        })


        this.socket.on('environmentListDelete', (args) => {
            this.environment.removeViaOrder(args.id || this.settings.id, args.order)
            this.ping()
        })
        this.socket.on('environmentDelete', (args) => {
            if (!args.value) return
            this.environment.remove(args.id || this.settings.id, args.value, args.order)
            this.ping()
        })
        this.socket.on('environmentList', (args) => {
            if (!args.value) return
            const environment = parseBufferToEnvironment(args.fromFile)
            this.environment.addOrder(args.id || this.settings.id, args.value, environment)
            this.ping()
        }
        )
        this.socket.on('environmentEdit', (args) => {
            const { order, value, key, previousKey } = args
            this.environment.edit(args.id || this.settings.id, order, value, key, previousKey)
            this.ping()
        })
        this.socket.on('environmentMute', (arg) => {
            this.environment.mute(arg.id || this.settings.id, arg.order, arg.value)
            this.ping()
        })

        this.socket.on('state', () => {
            this.ping()
        })

        this.socket.on('retrieveSettings', (akw) => {
            akw(this.getState())
        })

        this.socket.on('copyToClipboard', (akw) => {
            const environment = this.environment.bake([this.stackId, this.settings.id], true)

            const asString = bakeEnvironmentToString(environment)

            const fullCommand = asString + this.settings.command.cmd

            akw(fullCommand)

        })

        this.socket.on('history',
            (key: keyof typeof HistoryKey, feed: string, akw) => {
                if (feed) {
                    akw(this.history.search(key, feed))
                    return
                }
                return
            }
        )
        this.socket.emit('hello')
        this.stackPing()
    }
}
