import { ITerminalDimensions } from "xterm-addon-fit";
import { Cmd, PaletteStack, UpdateCwdProps } from "../../types";
import { Terminal } from "./service/Terminal";

export class Palette {
    settings: PaletteStack
    terminals: Map<number, Terminal>

    constructor(settings: PaletteStack) {
        this.settings = settings
        this.terminals = new Map<number, Terminal>()

    }

    // startServer(port = 3000) {
    //     // this.server.listen(port)
    //     this.server.on('connection', (client) => {
    //         console.log(`Client ${client.id} connected`)
    //         const remoteTerminalID = Number(client.handshake.query.id)
    //         const localCmd = this.commands.find(item => item.id === remoteTerminalID)
    //         if (!localCmd) {
    //             // Non terminal clients have differrent kind of listeners
    //             client.on('state', (arg) => {
    //                 this.terminals.get(arg)?.ping()
    //             })
    //             client.on('environmentEdit', (arg) => {
    //                 this.terminals.get(arg.id)?.editVariable(arg)
    //                 // this.save()
    //             })
    //             client.on('environmentMute', (arg) => {
    //                 this.terminals.get(arg.id)?.muteVariable(arg)
    //                 // this.save()
    //             })
    //             client.on('environmentList', (arg) => {
    //                 this.terminals.get(arg.id)?.addEnvList(arg)
    //                 // this.save()
    //             })
    //             client.on('environmentDelete', (arg) => {
    //                 this.terminals.get(arg.id)?.removeEnvList(arg)
    //                 // this.save()
    //             })
    //             return
    //         }

    //         client.emit('hello')
    //         client.on('changeCwd', (arg: UpdateCwdProps) => {
    //             console.log(`Changing cwd! new Cwd: ${arg.value}`)
    //             this.terminals.get(arg.id)?.updateCwd(arg.value)
    //             // this.save()
    //         })
    //         client.on('changeCommand', (arg: { id: number, value: string }) => {
    //             console.log(`Changing command! new CMD: ${arg.value}`)
    //             this.terminals.get(arg.id)?.updateCommand(arg.value)
    //             // this.save()
    //         })
    //         client.on('changeShell', (arg: { id: number, value: string }) => {
    //             console.log(`Changing shell! new shell: ${arg.value}`)
    //             this.terminals.get(arg.id)?.changeShell(arg.value)
    //             // this.save()
    //         })
    //         client.on('input', (arg: { id: number, value: string }) => {
    //             this.terminals.get(arg.id)?.writeFromClient(arg.value)
    //         })
    //         client.on('resize', (arg: { id: number, value: ITerminalDimensions }) => {
    //             this.terminals.get(arg.id)?.resize(arg.value)
    //         })
    //         const existing = this.terminals.get(remoteTerminalID)
    //         if (!existing) {
    //             this.terminals.set(remoteTerminalID, new Terminal(localCmd, client.id, this.server))
    //             return
    //         }
    //         existing.ping()

    //     })

    // }

    ping() {
        this.terminals.forEach(term => term.ping())
    }

    get() {
        return this.settings
    }

    createCommand(title: string) {
        const newId = this.settings.palette
            ? Math.max(...this.settings.palette.map(cmd => cmd.id)) + 1
            : 1

        const newOne: Cmd = {
            id: newId,
            title: title,
            command: {
                cmd: 'echo Hello World!',
                cwd: process.env.HOME
            }
        }
        if (!this.settings.palette) {
            this.settings.palette = []
        }
        this.settings.palette.push(newOne)
        // this.save()
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
        // this.save()
        return true
    }

    killAll() {
        this.terminals.forEach((terminal) => {
            terminal.stop()
        })
        // this.save()
    }

}


