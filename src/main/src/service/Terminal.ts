import { Cmd, SocketServer } from "../../../types"
import { spawn, IPty } from 'node-pty'


export class Terminal {
    cmdId: number
    socketId: string
    server: SocketServer
    cmd: string
    userEnvs: Record<string, string>
    variableEnvs: Record<string, string>
    shell: string
    ptyProcess: IPty | null
    tester: any
    isRunning: boolean

    constructor(cmd: Cmd, socketId: string, server: SocketServer) {
        this.cmdId = cmd.id
        this.cmd = cmd.command.cmd
        this.userEnvs = cmd.command.env ?? {}
        this.variableEnvs = cmd.command.variables ?? {}
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
            env: { ...process.env, ...this.userEnvs },
            useConpty: process.platform === "win32" ? false : true
        })
        this.isRunning = true

        this.ptyProcess.onData((data) => {
            this.sendToClient(data)
        })
        this.ptyProcess.onExit((data) => {
            this.sendToClient(`Exiting with status ${data.exitCode} - ${data.signal ?? "No signal"} \r\n$ `)

        })
        this.server.emit('terminalState', {
            id: this.cmdId, isRunning: this.isRunning, env: {
                host: process.env,
                fromJson: this.userEnvs,
                variables: this.variableEnvs
            },
            cmd: this.cmd
        })
        this.test()
    }

    stop() {
        if (!this.ptyProcess) return
        console.log("Killing", this.cmdId)
        this.ptyProcess.kill()
        this.isRunning = false
        this.server.emit('terminalState', {
            id: this.cmdId, isRunning: this.isRunning, env: {
                host: process.env,
                fromJson: this.userEnvs,
                variables: this.variableEnvs
            },
            cmd: this.cmd
        })
        clearInterval(this.tester)

    }
    ping() {
        this.server.emit('terminalState', {
            id: this.cmdId, isRunning: this.isRunning, env: {
                host: process.env,
                fromJson: this.userEnvs,
                variables: this.variableEnvs
            },
            cmd: this.cmd
        })
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
            this.write(`echo "hello from ${this.cmdId}"`)
            this.prompt()
        }, 2500)
    }

}