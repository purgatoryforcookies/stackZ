import { ITerminalDimensions } from "xterm-addon-fit";
import { EnvironmentEditProps, PaletteStack, SocketServer, Utility2Props, UtilityProps } from "../../types";
import { Palette } from "./Palette";
import { DataStore } from "./service/DataStore";
import { ZodTypeAny } from "zod";
import { writeFile } from "fs";



export class Stack {
    path: string
    server: SocketServer
    raw: PaletteStack[]
    palettes: Map<number, Palette>
    store: DataStore

    constructor(jsonPath: string, server: SocketServer, schema: ZodTypeAny) {
        this.path = jsonPath
        this.server = server
        this.raw = []
        this.store = new DataStore(jsonPath, schema)
        this.palettes = new Map<number, Palette>()
    }

    async load() {
        return new Promise<Stack>(async (res, rej) => {
            try {
                this.raw = await this.store.load()
                res(this)
            } catch (error) {
                rej(error)
            }
        })

    }
    init() {
        if (this.raw.length > 0) {
            for (const palette of this.raw) {
                if (this.palettes?.get(palette.id)) {
                    console.log(`Palette with ID ${palette.id} exists`)
                    return
                }
                this.palettes.set(palette.id, new Palette(palette, this.server))
            }
        }
        this.save()
        return this
    }

    startServer(port = 3123) {
        this.server.listen(port)
        console.log(`Starting server in ${port}`)
        this.server.on("connection", (client) => {
            console.log(`Client ${client.id} connected`)
            const stackId = Number(client.handshake.query.stack)
            const remoteTerminalID = Number(client.handshake.query.id)
            const palette = this.palettes.get(stackId)
            // If there is no palette for the client, it is not a palette
            // then utility listeners are registered


            if (!palette) {
                client.on('state', (arg: { stack: number, terminal?: number }) => {
                    if (!arg.terminal) {
                        this.palettes.get(arg.stack)?.pingAll()
                        return
                    }
                    this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.ping()
                })
                client.on('bigState', (arg: { stack: number }) => {
                    this.palettes.get(arg.stack)?.pingState()
                })
                client.on('environmentEdit', (args: EnvironmentEditProps) => {
                    this.palettes.get(args.stack)?.terminals.get(args.terminal)?.editVariable(args)
                    this.save()
                })
                client.on('environmentMute', (arg: UtilityProps) => {
                    this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.muteVariable(arg)
                    this.save()
                })
                client.on('environmentList', (args: Omit<UtilityProps, 'order'>) => {
                    if (!args.value) return
                    this.palettes.get(args.stack)?.terminals.get(args.terminal)?.addEnvList(args.value)
                    this.save()
                })
                client.on('environmentDelete', (args: UtilityProps) => {
                    this.palettes.get(args.stack)?.terminals.get(args.terminal)?.removeEnvList(args)
                    this.save()
                })


                return
            }
            client.on('changeCwd', (arg: Utility2Props) => {
                console.log(`Changing cwd! new Cwd: ${arg.value}`)
                this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.updateCwd(arg.value)
                this.save()
            })
            client.on('changeCommand', (arg: Utility2Props) => {
                console.log(`Changing command! new CMD: ${arg.value}`)
                this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.updateCommand(arg.value)
                this.save()
            })
            client.on('changeShell', (arg: Utility2Props) => {
                console.log(`Changing shell! new shell: ${arg.value}`)
                this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.changeShell(arg.value)
                this.save()
            })
            client.on('input', (arg: Utility2Props) => {
                console.log(`Getting input from ${arg.stack}-${arg.terminal}`)
                this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.writeFromClient(arg.value)

            })
            client.on('resize', (arg: { stack: number, terminal: number, value: ITerminalDimensions }) => {
                this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.resize(arg.value)
            })
            client.emit('hello')

            palette.initTerminal(client.id, this.server, remoteTerminalID)

        })
    }

    get(id?: number) {
        if (id) return this.raw.find(r => r.id === id)
        return this.raw
    }

    startStack(stack: number) {
        this.palettes.get(stack)?.terminals.forEach(term => {
            term.start()
        })
    }
    stopStack(stack: number) {
        this.palettes.get(stack)?.terminals.forEach(term => {
            term.stop()
        })
    }

    startTerminal(stack: number, terminal: number) {
        console.log(`Starting ${stack} -> ${terminal}`)
        this.palettes.get(stack)?.terminals.get(terminal)?.start()
    }
    stopTerminal(stack: number, terminal: number) {
        this.palettes.get(stack)?.terminals.get(terminal)?.stop()
    }

    deleteTerminal(stack: number, terminal: number) {

        this.palettes.get(stack)?.terminals.get(terminal)?.stop()
        this.palettes.get(stack)?.deleteTerminal(terminal)
        this.palettes.get(stack)?.pingAll()
        this.save()
        this.server.emit("terminalDelete", { stack, terminal })
    }

    createTerminal(title: string, stack: number) {
        const newT = this.palettes.get(stack)?.createCommand(title)
        this.save()
        return newT
    }

    createStack(name: string) {
        const newOne: PaletteStack = {
            id: Math.max(...this.raw.map(palette => palette.id)) + 1,
            stackName: name
        }
        this.raw.push(newOne)
        this.save()
        return newOne
    }

    save(onExport = false) {


        const toModify: PaletteStack[] = onExport ? JSON.parse(JSON.stringify(this.raw)) : this.raw

        toModify.forEach(palette => {
            const p = this.palettes.get(palette.id)
            if (p) {
                palette = p.settings
            }
            if (p?.settings.env && onExport) {
                // TODO omit os envs on export and not on save
            }
        })

        const filename = onExport ? 'commands_exported.json' : 'stacks.json'

        writeFile(filename, JSON.stringify(this.raw), (error) => {
            if (error) throw error;
        });

    }

}


