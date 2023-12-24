import { Cmd, SocketServer } from "../../types";
import { Terminal } from "./service/Terminal";
import { readJsonFile } from "./service/util";


export class Palette {
    commands: Cmd[]
    terminals: Map<number, Terminal>
    path: string
    server: SocketServer

    constructor(jsonPath: string, server: SocketServer) {
        this.path = jsonPath
        this.server = server
        this.commands = []
        this.terminals = new Map<number, Terminal>()
        this.loadSave()
    }

    async loadSave() {
        try {
            const cmds = await readJsonFile(this.path)
            this.commands = cmds

        } catch (error) {
            console.log(error)
        }
    }

    startServer(port = 3000) {
        this.server.listen(port)
        this.server.on('connection', (client) => {
            console.log(`Client ${client.id} connected`)
            const remoteTerminalID = Number(client.handshake.query.id)
            const localCmd = this.commands.find(item => item.id === remoteTerminalID)
            if (!localCmd) {
                client.emit('error', { message: 'Are you even a terminal?' })
                return
            }
            const existing = this.terminals.get(remoteTerminalID)
            if (!existing) {
                this.terminals.set(remoteTerminalID, new Terminal(localCmd, client.id, this.server))

                return
            }
            existing.ping()

        })
        this.server.on("hello", (client) => {
            client.emit("hello")
        })
    }

    get() {
        return this.commands
    }

    startTerminal(id: number) {
        console.log(`Starting terminal number ${id}`)
        const terminal = this.terminals.get(id)
        if (!terminal) return false
        terminal.start()
        return true
    }

    stopTerminal(id: number) {
        console.log(`Stopping terminal number ${id}`)
        const terminal = this.terminals.get(id)
        if (!terminal) return false
        terminal.stop()
        return true
    }

    killAll() {
        this.terminals.forEach((terminal) => {
            terminal.stop()
        })
    }

}


