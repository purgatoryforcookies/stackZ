import {
    AddEnvListProps,
    Cmd,
    ENVs,
    EnvironmentEditProps,
    EnvironmentMuteProps,
    RemoveEnvListProps,
    SocketServer,
    UpdateCwdProps
} from "../../../types"
import { spawn, IPty } from 'node-pty'
import { envFactory, haveThesameElements, mapEnvs } from "./util"



export class Terminal {
    settings: Cmd
    socketId: string
    server: SocketServer
    shell: string
    ptyProcess: IPty | null
    tester: any
    isRunning: boolean

    constructor(cmd: Cmd, socketId: string, server: SocketServer) {
        this.settings = cmd
        this.settings.command.env = envFactory(this.settings.command.env)
        this.socketId = socketId
        this.server = server
        this.shell = process.platform === 'win32' ? "powershell.exe" : "bash"
        this.ptyProcess = null
        this.isRunning = false
    }

    start() {

        this.ptyProcess = spawn(this.shell, [], {
            name: `Palette ${this.settings.id}`,
            cwd: this.settings.command.cwd ?? process.env.HOME,
            env: mapEnvs(this.settings.command.env as ENVs[]),
            useConpty: process.platform === "win32" ? false : true

        })
        this.isRunning = true

        this.ptyProcess.onData((data) => {
            this.sendToClient(data)
        })
        this.ptyProcess.onExit((data) => {
            this.sendToClient(`Exiting with status ${data.exitCode} - ${data.signal ?? "No signal"} \r\n$ `)

        })
        this.ping()
        this.run(this.settings.command.cmd)
    }

    run(cmd: string) {
        this.write(cmd)
        this.prompt()

    }

    stop() {
        if (!this.ptyProcess) return
        console.log("Killing", this.settings.id)
        this.ptyProcess.kill()
        this.isRunning = false
        this.ping()
        clearInterval(this.tester)

    }
    ping() {
        this.server.emit('terminalState', this.getState())
    }

    getState() {
        return {
            id: this.settings.id,
            isRunning: this.isRunning,
            env: this.settings.command.env,
            cmd: this.settings.command.cmd,
            cwd: this.settings.command.cwd ?? process.env.HOME
        }
    }

    sendToClient(data: string) {
        this.server.to(this.socketId).emit("output", data)
    }

    write(data: string) {
        this.ptyProcess?.write(data)
    }

    prompt() {
        this.ptyProcess?.write(`\r`)
    }

    test() {
        this.tester = setInterval(() => {
            this.write(`echo "hello from ${this.settings.id}" $Env:variable1`)
            this.prompt()
            this.server.emit('test')
        }, 1000)
    }

    editVariable(args: EnvironmentEditProps) {
        if (args.key.trim().length == 0) return
        const target = this.settings.command.env?.find(list => list.order == args.orderId)
        if (target) {
            if (args.previousKey) {
                delete target.pairs[args.previousKey]
            }
            target.pairs[args.key] = args.value
            target.pairs = Object.fromEntries(Object.entries(target.pairs).sort())
        }
        this.ping()
    }

    muteVariable(args: EnvironmentMuteProps) {

        if (args.key && args.key.trim().length == 0) return
        const target = this.settings.command.env?.find(list => list.order == args.orderId)

        if (target) {

            if (!args.key) {
                if (haveThesameElements(Object.keys(target.pairs), target.disabled)) {
                    target.disabled = []
                } else {
                    target.disabled.push(...Object.keys(target.pairs))
                }

            }
            else if (target.disabled.includes(args.key)) {
                target.disabled = target.disabled.filter(item => item !== args.key)
            }
            else {
                target.disabled.push(args.key)
            }

        }

        this.ping()
    }

    updateCwd(args: UpdateCwdProps) {

        const w = process.platform === "win32" ? true : false
        const separator = w ? '\\' : '/'

        let idx = 0
        for (let i = 0; i < args.value.length; i++) {
            if (args.value[i] == separator) {
                idx = i
            }
        }

        this.settings.command.cwd = args.value.substring(0, idx)
        this.ping()
    }

    addEnvList(args: AddEnvListProps) {
        if (this.settings.command.env!.some(env => env.title === args.title)) {
            args.title += " (1)"
        }

        const newEnv: ENVs = {
            pairs: {},
            title: args.title,
            order: Math.max(...this.settings.command.env!.map(env => env.order)) + 1,
            disabled: []
        }

        this.settings.command.env!.push(newEnv)
        this.ping()
    }

    removeEnvList(args: RemoveEnvListProps) {

        this.settings.command.env = this.settings.command.env!.filter(env => env.order != args.orderId)

        for (let i = 0; i < this.settings.command.env.length; i++) {
            this.settings.command.env[i].order = i
        }
        this.ping()
    }

}