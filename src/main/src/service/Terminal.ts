import {
    ClientEvents,
    Cmd,
    CommandMetaSetting,
    Environment,
    EnvironmentEditProps,
    Status,
    TerminalEvents,
    Utility2Props,
    UtilityEvents,
    UtilityProps
} from '../../../types'
import { spawn, IPty } from 'node-pty'
import { envFactory, haveThesameElements, mapEnvs } from './util'
import path from 'path'
import { ITerminalDimensions } from 'xterm-addon-fit'
import { Socket } from 'socket.io'
import { IPingFunction, ISaveFuntion } from '../Palette'

export class Terminal {
    settings: Cmd
    stackId: string
    socket: Socket
    ptyProcess: IPty | null
    isRunning: boolean
    win: boolean
    buffer: string[]
    rows: number | undefined
    cols: number | undefined
    stackPing: IPingFunction
    save: ISaveFuntion

    constructor(
        stackId: string,
        cmd: Cmd,
        socket: Socket,
        stackPing: IPingFunction,
        save: ISaveFuntion
    ) {
        this.settings = cmd
        this.settings.command.env = envFactory(this.settings.command.env)
        this.stackId = stackId
        this.socket = socket
        this.win = process.platform === 'win32' ? true : false
        this.ptyProcess = null
        this.isRunning = false
        this.buffer = []
        this.stackPing = stackPing
        this.registerTerminalEvents()
        this.save = save
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

        if (loose) {
            return [tmpShell, []]
        }
        const cmdArr = cmd.split(' ')

        switch (tmpShell) {
            case 'cmd.exe':
                return ['powershell.exe', ['cmd.exe', '/c', cmd]]
            case 'wsl.exe':
                return ['powershell.exe', ['wsl.exe', '-e', cmd]]
            case 'powershell.exe':
                return ['powershell.exe', [cmd]]
            case 'bash':
                return ['/bin/bash', ['-l', '-c', `'${cmdArr.shift()}' ${cmdArr.join(' ')}`]]
            case 'zsh':
                return ['/bin/zsh', ['-il', '-c', `. ~/.zprofile && ${cmdArr.join(' ')}`]]
            default:
                if (this.win) {
                    return ['powershell.exe', [cmd]]
                }
                return ['/bin/bash', ['-l', '-c', `'${cmdArr.shift()}' ${cmdArr.join(' ')}`]]
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
                name: `Palette ${this.settings.id}`,
                cwd: this.settings.command.cwd,
                env: mapEnvs(this.settings.command.env as Environment[]),
                useConpty: this.win ? false : true,
                rows: this.rows,
                cols: this.cols
            })
            this.isRunning = true
            this.stackPing()
            if (cmd.length === 0) {
                this.run(this.settings.command.cmd)
            }

            this.ptyProcess.onData((data) => {
                this.sendToClient(data)
            })
            this.ptyProcess.onExit((data) => {
                this.isRunning = false
                this.sendToClient(`Exiting with status ${data.exitCode} - ${data.signal ?? ''}\r\n`)

                const divider = Array(this.ptyProcess?.cols || 20)
                    .fill('-')
                    .join('')
                this.sendToClient(`${divider}\r\n$ `)
                this.stop()
                if (this.settings.metaSettings?.rerun) {
                    this.start()
                }
                this.ping()
                this.stackPing()
            })
            this.ping()
        } catch (e) {
            this.sendToClient(`${e} \r\n$ `)
        }
    }

    run(cmd: string) {
        this.write(cmd)
        this.prompt()
    }

    resize(dims: ITerminalDimensions) {
        if (!dims) return
        try {
            this.ptyProcess?.resize(dims.cols, dims.rows)
        } catch {
            // On stop, the pty process is not existing anymore but yet here we are...
        }
        this.rows = dims.rows
        this.cols = dims.cols
    }

    stop() {
        if (!this.ptyProcess) return
        try {
            console.log('Killing', this.settings.id)
            const code = this.win ? undefined : 'SIGHUP'
            this.ptyProcess.kill(code)
            this.isRunning = false
        } catch {
            //swallow
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
        this.ptyProcess?.write(data)
    }

    prompt() {
        this.ptyProcess?.write(`\r`)
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
        this.settings.command.cwd = path.normalize(value.trim())
        this.ping()
    }

    updateCommand(value: string) {
        this.settings.command.cmd = value.trim()
        this.ping()
    }

    addEnvList(value: string) {
        if (!value) return
        if (this.settings.command.env!.some((env) => env.title === value)) {
            value += ' (1)'
        }

        const newEnv: Environment = {
            pairs: {},
            title: value,
            order: Math.max(...this.settings.command.env!.map((env) => env.order)) + 1,
            disabled: []
        }

        this.settings.command.env!.push(newEnv)
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
        this.ping
    }

    changeShell(newShell: string | undefined) {
        this.settings.command.shell = this.chooseShell(newShell)
        this.ping()
    }

    setMetaSettings(settings: CommandMetaSetting) {
        this.settings.metaSettings = settings
        this.ping()
    }

    registerTerminalEvents() {
        this.socket.on(TerminalEvents.CWD, (arg: Utility2Props) => {
            console.log(`Changing cwd! new Cwd: ${arg.value}`)
            this.updateCwd(arg.value)
        })
        this.socket.on(TerminalEvents.CMD, (arg: Utility2Props) => {
            console.log(`Changing command! new CMD: ${arg.value}`)
            this.updateCommand(arg.value)
        })
        this.socket.on(TerminalEvents.SHELL, (arg: Utility2Props) => {
            console.log(`Changing shell! new shell: ${arg.value}`)
            this.changeShell(arg.value)
        })
        this.socket.on(TerminalEvents.INPUT, (data) => {
            this.writeFromClient(data)
        })
        this.socket.on(TerminalEvents.RESIZE, (args: { value: ITerminalDimensions }) => {
            this.resize(args.value)
        })
        this.socket.on(UtilityEvents.ENVLISTDELETE, (args: UtilityProps) => {
            this.removeEnvList(args)
        })
        this.socket.on(UtilityEvents.ENVDELETE, (args: UtilityProps) => {
            this.removeEnv(args)
        })
        this.socket.on(
            UtilityEvents.CMDMETASETTINGS,
            (args: { stack: string; terminal: string; settings: CommandMetaSetting }) => {
                this.setMetaSettings(args.settings)
            }
        )
        this.socket.on(UtilityEvents.ENVLIST, (args: { value: string }) => {
            if (!args.value) return
            this.addEnvList(args.value)
        })
        this.socket.on(UtilityEvents.ENVEDIT, (args: EnvironmentEditProps) => {
            console.log('Receiving variables')
            this.editVariable(args)
        })
        this.socket.on(UtilityEvents.ENVMUTE, (arg: UtilityProps) => {
            this.muteVariable(arg)
        })
        this.socket.on(UtilityEvents.STATE, () => {
            console.log('pingign')
            this.ping()
        })
        this.socket.emit('hello')
        this.stackPing()
    }
}
