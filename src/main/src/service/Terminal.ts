import { AddEnvListProps, Cmd, ENVs, EnvironmentEditProps, EnvironmentMuteProps, RemoveEnvListProps, SocketServer, UpdateCwdProps } from "../../../types"
import { spawn, IPty } from 'node-pty'
import { envFactory, haveThesameElements, mapEnvs } from "./util"



export class Terminal {
    cmdId: number
    socketId: string
    server: SocketServer
    cmd: string
    shell: string
    ptyProcess: IPty | null
    tester: any
    isRunning: boolean
    envs: ENVs[]
    cwd: string | undefined

    constructor(cmd: Cmd, socketId: string, server: SocketServer) {
        this.cmdId = cmd.id
        this.cmd = cmd.command.cmd
        this.envs = envFactory(cmd.command.env)
        this.socketId = socketId
        this.server = server
        this.shell = process.platform === 'win32' ? "powershell.exe" : "bash"
        this.ptyProcess = null
        this.isRunning = false
        this.cwd = cmd.command.cwd
    }

    start() {

        this.ptyProcess = spawn(this.shell, [], {
            name: `Palette ${this.cmdId}`,
            cwd: this.cwd ?? process.env.HOME,
            env: mapEnvs(this.envs),
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
        this.run(this.cmd)
    }

    run(cmd: string) {
        this.write(cmd)
        this.prompt()

    }

    stop() {
        if (!this.ptyProcess) return
        console.log("Killing", this.cmdId)
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
            id: this.cmdId,
            isRunning: this.isRunning,
            env: this.envs,
            cmd: this.cmd,
            cwd: this.cwd ?? process.env.HOME
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
            this.write(`echo "hello from ${this.cmdId}" $Env:variable1`)
            this.prompt()
            this.server.emit('test')
        }, 1000)
    }

    editVariable(args: EnvironmentEditProps) {
        if (!args.key) return
        if (args.key.trim().length == 0) return
        const target = this.envs?.find(list => list.order == args.orderId)
        if (target) {
            target.pairs[args.key] = args.value
        }
        this.ping()
    }

    muteVariable(args: EnvironmentMuteProps) {

        if (args.key && args.key.trim().length == 0) return
        const target = this.envs?.find(list => list.order == args.orderId)

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

        this.cwd = args.value.substring(0, idx)
        this.ping()
    }

    addEnvList(args: AddEnvListProps) {
        if (this.envs.some(env => env.title === args.title)) {
            args.title += " (1)"
        }

        const newEnv: ENVs = {
            pairs: {},
            title: args.title,
            order: Math.max(...this.envs.map(env => env.order)) + 1,
            disabled: []
        }
        console.log(newEnv)

        this.envs.push(newEnv)
        this.ping()
    }

    removeEnvList(args: RemoveEnvListProps) {

        this.envs = this.envs.filter(env => env.order != args.orderId)

        for (let i = 0; i < this.envs.length; i++) {
            this.envs[i].order = i
        }
        this.ping()
    }

}