import {
    AddEnvListProps,
    Cmd,
    ENVs,
    EnvironmentEditProps,
    EnvironmentMuteProps,
    RemoveEnvListProps,
    SocketServer,
    Status,
} from "../../../types"
import { spawn, IPty } from 'node-pty'
import { envFactory, haveThesameElements, mapEnvs } from "./util"
import path from "path"
import { DataMiddleWare } from "./DataMiddleWare"




export class Terminal {
    settings: Cmd
    socketId: string
    server: SocketServer
    shell: string
    ptyProcess: IPty | null
    tester: any
    isRunning: boolean
    win: boolean
    middleware: DataMiddleWare
    buffer: string[]

    constructor(cmd: Cmd, socketId: string, server: SocketServer) {
        this.settings = cmd
        this.settings.command.env = envFactory(this.settings.command.env)
        this.socketId = socketId
        this.server = server
        this.win = process.platform === 'win32' ? true : false
        this.shell = this.win ? "powershell.exe" : "bash"
        this.ptyProcess = null
        this.isRunning = false
        this.middleware = new DataMiddleWare(10)
        this.buffer = []
    }

    start() {

        try {
            this.ptyProcess = spawn(this.shell, [], {
                name: `Palette ${this.settings.id}`,
                cwd: this.settings.command.cwd,
                env: mapEnvs(this.settings.command.env as ENVs[]),
                useConpty: this.win ? false : true

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
        catch (e) {
            this.sendToClient(`Error starting terminal.\n\rIs current working directory a valid path? \n\rCwd is: ${this.settings.command.cwd}\n\r$ `)
        }


    }

    run(cmd: string) {
        this.write(cmd)
        this.prompt()
    }

    stop() {
        if (!this.ptyProcess) return
        console.log("Killing", this.settings.id)
        const code = this.win ? undefined : 'SIGINT'
        this.ptyProcess.kill(code)
        this.isRunning = false
        this.ping()
    }

    ping() {
        this.server.emit('terminalState', this.getState())
    }

    getState(): Status {
        return {
            cmd: this.settings,
            isRunning: this.isRunning,
            cwd: this.settings.command.cwd ?? process.env.HOME
        }
    }

    sendToClient(data: string) {
        this.server.to(this.socketId).emit("output", data)
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

    updateCwd(value: string) {
        this.settings.command.cwd = path.normalize(value.trim())
        this.ping()
    }

    updateCommand(value: string) {
        this.settings.command.cmd = value.trim()
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