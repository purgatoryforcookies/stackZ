import { Cmd, ENVs, EnvironmentEditProps, EnvironmentMuteProps, SocketServer } from "../../../types"
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

    constructor(cmd: Cmd, socketId: string, server: SocketServer) {
        this.cmdId = cmd.id
        this.cmd = cmd.command.cmd
        this.envs = envFactory(cmd.command.env)
        this.socketId = socketId
        this.server = server
        this.shell = process.platform === 'win32' ? "powershell.exe" : "bash"
        this.ptyProcess = null
        this.isRunning = false
    }

    start() {

        this.ptyProcess = spawn(this.shell, [], {
            name: `Palette ${this.cmdId}`,
            cwd: process.env.HOME,
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
            id: this.cmdId, isRunning: this.isRunning, env: this.envs,
            cmd: this.cmd
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

}