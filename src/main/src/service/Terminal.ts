import { Cmd, Environment, EnvironmentEditProps, Status, UtilityProps } from '../../../types'
import { spawn, IPty } from 'node-pty'
import { envFactory, haveThesameElements, mapEnvs } from './util'
import path from 'path'
import { DataMiddleWare } from './DataMiddleWare'
import { ITerminalDimensions } from 'xterm-addon-fit'
import { Server } from 'socket.io'

export class Terminal {
    settings: Cmd
    socketId: string
    stackId: string
    server: Server
    ptyProcess: IPty | null
    isRunning: boolean
    win: boolean
    middleware: DataMiddleWare
    buffer: string[]

    constructor(stackId: string, cmd: Cmd, socketId: string, server: Server) {
        this.settings = cmd
        // this.settings.command.env = envFactory(this.settings.command.env)
        this.socketId = socketId
        this.stackId = stackId
        this.server = server
        this.win = process.platform === 'win32' ? true : false
        this.settings.command.shell = this.chooseShell(cmd.command.shell)
        this.ptyProcess = null
        this.isRunning = false
        this.middleware = new DataMiddleWare(10)
        this.buffer = []
    }

    chooseShell(shell: string | undefined) {
        if (shell) return shell.trim()
        if (this.win) return 'powershell.exe'
        return 'bash'
    }

    start() {
        if (this.isRunning) {
            this.stop()
        }

        try {
            this.ptyProcess = spawn(this.settings.command.shell!, [this.settings.command.cmd], {
                name: `Palette ${this.settings.id}`,
                cwd: this.settings.command.cwd,
                env: mapEnvs(this.settings.command.env as Environment[])
                // useConpty: this.win ? false : true,
            })
            this.isRunning = true

            this.ptyProcess.onData((data) => {
                this.sendToClient(data)
            })
            this.ptyProcess.onExit((data) => {
                this.sendToClient(`Exiting with status ${data.exitCode} - ${data.signal ?? ''}\r\n`)

                const divider = Array(this.ptyProcess?.cols || 20)
                    .fill('-')
                    .join('')
                this.sendToClient(`${divider}\r\n$ `)
                this.isRunning = false
                this.ping()
            })
            this.ping()
        } catch (e) {
            this.sendToClient(
                `Error starting terminal.\n\rIs current working directory a valid path? \n\rCwd is: ${this.settings.command.cwd}\n\r$ `
            )
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
    }

    stop() {
        if (!this.ptyProcess) return
        try {
            console.log('Killing', this.settings.id)
            const code = this.win ? undefined : 'SIGINT'
            this.ptyProcess.kill(code)
            this.isRunning = false
        } catch (error) {
            console.log(`Failed to kill ${this.settings.id}`)
        }
        this.ping()
    }

    ping() {
        this.server.emit('terminalState', this.getState())
    }

    getState(): Status {
        return {
            stackId: this.stackId,
            cmd: this.settings,
            isRunning: this.isRunning,
            cwd: this.settings.command.cwd ?? process.env.HOME
        }
    }

    sendToClient(data: string) {
        this.server
            .timeout(400)
            .to(this.socketId)
            .emit('output', data, (_, resp: ITerminalDimensions) => {
                if (this.ptyProcess) {
                    try {
                        this.ptyProcess.resize(resp[0].cols, resp[0].rows)
                    } catch {
                        // On stop, the pty process is not existing anymore but yet here we are...
                    }
                }
            })
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
        const target = this.settings.command.env?.find((list) => list.order == args.order)

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
        this.settings.command.env = this.settings.command.env!.filter((env) => env.order != args.order)

        for (let i = 0; i < this.settings.command.env.length; i++) {
            this.settings.command.env[i].order = i
        }
        this.ping()
    }

    changeShell(newShell: string | undefined) {
        this.settings.command.shell = this.chooseShell(newShell)
        this.ping()
    }
}
