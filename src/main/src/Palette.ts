import { Cmd, SocketServer, UpdateCwdProps } from "../../types";
import { Terminal } from "./service/Terminal";
import { readJsonFile } from "./service/util";
import { writeFile } from "fs";

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

    save(onExport = false) {

        const obj: Cmd[] = onExport ? JSON.parse(JSON.stringify(this.commands)) : this.commands

        obj.forEach(command => {
            const terminal = this.terminals.get(command.id)
            if (terminal) {
                command = terminal.settings
            }
            if (command.command.env && onExport) {
                // Redacting OS envs onExport
                command.command.env[0].pairs = {}
            }
        })

        const filename = onExport ? 'commands_exported.json' : 'commands.json'

        writeFile(filename, JSON.stringify(this.commands), (error) => {
            if (error) throw error;
        });

    }

    startServer(port = 3000) {
        this.server.listen(port)
        this.server.on('connection', (client) => {
            console.log(`Client ${client.id} connected`)
            const remoteTerminalID = Number(client.handshake.query.id)
            const localCmd = this.commands.find(item => item.id === remoteTerminalID)
            if (!localCmd) {
                // Non terminal clients have differrent kind of listeners
                // They mostly ask for specific terminals state.
                client.on('state', (arg) => {
                    this.terminals.get(arg)?.ping()
                })
                client.on('environmentEdit', (arg) => {
                    this.terminals.get(arg.id)?.editVariable(arg)
                    this.save()
                })
                client.on('environmentMute', (arg) => {
                    this.terminals.get(arg.id)?.muteVariable(arg)
                    this.save()
                })
                client.on('environmentList', (arg) => {
                    this.terminals.get(arg.id)?.addEnvList(arg)
                    this.save()
                })
                client.on('environmentDelete', (arg) => {
                    this.terminals.get(arg.id)?.removeEnvList(arg)
                    this.save()
                })
                return
            }

            client.emit('hello')
            client.on('changeCwd', (arg: UpdateCwdProps) => {
                console.log(`Changing cwd! new Cwd: ${arg.value}`)
                this.terminals.get(arg.id)?.updateCwd(arg.value)
                this.save()
            })
            client.on('input', (arg: { id: number, value: string }) => {
                this.terminals.get(arg.id)?.writeFromClient(arg.value)
            })
            const existing = this.terminals.get(remoteTerminalID)
            if (!existing) {
                this.terminals.set(remoteTerminalID, new Terminal(localCmd, client.id, this.server))
                return
            }
            existing.ping()

        })

    }

    get() {
        return this.commands
    }

    createCommand(title: string) {
        const newOne: Cmd = {
            id: Math.max(...this.commands.map(cmd => cmd.id)) + 1,
            title: title,
            command: {
                cmd: 'echo Hello World!',
                cwd: process.env.HOME
            }
        }
        this.commands.push(newOne)
        this.save()
        return newOne
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
        this.save()
        return true
    }

    killAll() {
        this.terminals.forEach((terminal) => {
            terminal.stop()
        })
        this.save()
    }

}


