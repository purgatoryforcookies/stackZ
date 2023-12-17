import { Cmd, SocketServer } from "../../../types"
import { spawn, IPty } from 'node-pty'


export class Terminal {
    cmdId: number
    socketId: string
    server: SocketServer
    cmd: string
    shell: string
    ptyProcess: IPty | null

    constructor(cmd: Cmd, socketId: string, server: SocketServer) {
        this.cmdId = cmd.id
        this.socketId = socketId
        this.server = server
        this.cmd = cmd.command.cmd
        // this.shell = process.platform === 'win32' ? "powershell.exe" : "bash"
        this.shell = process.platform === 'win32' ? "C:/Program Files/Git/git-bash.exe" : "bash"
        this.ptyProcess = null
    }

    start() {
        this.ptyProcess = spawn(this.shell, [], {
            name: `Palette ${this.cmdId}`,
            cwd: process.env.HOME,
            env: process.env,
            useConpty: process.platform === "win32" ? false : true
        })

        this.ptyProcess.onData((data) => {
            this.sendToClient(data)
        })
        this.ptyProcess.onExit((data) => {
            this.sendToClient(`Exiting with status ${data.exitCode} - ${data.signal ?? "No signal"} \r\n$ `)

        })
        this.server.emit('terminalState', { id: this.cmdId, isRunning: true })
        this.test()
    }

    stop() {
        if (!this.ptyProcess) return
        console.log(this.ptyProcess.pid)
        this.ptyProcess.kill()
        this.server.emit('terminalState', { id: this.cmdId, isRunning: false })

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
        setInterval(() => {
            this.write(`echo "hello from ${this.cmdId}"`)
            this.prompt()
        }, 2500)
    }

}