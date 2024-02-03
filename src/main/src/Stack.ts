import { v4 as uuidv4 } from 'uuid';
import { ITerminalDimensions } from 'xterm-addon-fit'
import { EnvironmentEditProps, PaletteStack, Utility2Props, UtilityProps } from '../../types'
import { Palette } from './Palette'
import { DataStore } from './service/DataStore'
import { ZodTypeAny } from 'zod'
import { writeFile } from 'fs'
import { Server } from 'socket.io'

export class Stack {
    path: string
    server: Server
    raw: PaletteStack[]
    palettes: Map<string, Palette>
    store: DataStore

    constructor(jsonPath: string, server: Server, schema: ZodTypeAny) {
        this.path = jsonPath
        this.server = server
        this.raw = []
        this.store = new DataStore(jsonPath, schema)
        this.palettes = new Map<string, Palette>()
    }

    async load() {
        this.raw = await this.store.load()
        for (const stack of this.raw) {
            stack.id = uuidv4()

            if (!stack.palette) return
            for (const palette of stack.palette) {
                palette.id = uuidv4()
            }
        }

        return this
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
        this.server.on('connection', (client) => {
            console.log(`Client ${client.id} connected`)
            const stackId = String(client.handshake.query.stack)
            const remoteTerminalID = String(client.handshake.query.id)
            const palette = this.palettes.get(stackId)
            // If there is no palette for the client, it is not a palette
            // then utility listeners are registered

            if (!palette) {
                client.on('state', (arg: { stack: string; terminal?: string }) => {
                    if (!arg.terminal) {
                        this.palettes.get(arg.stack)?.pingAll()
                        return
                    }
                    this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.ping()
                })
                client.on('bigState', (arg: { stack: string }) => {
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
            client.on(
                'resize',
                (arg: { stack: string; terminal: string; value: ITerminalDimensions }) => {
                    this.palettes.get(arg.stack)?.terminals.get(arg.terminal)?.resize(arg.value)
                }
            )
            client.emit('hello')

            palette.initTerminal(client.id, this.server, remoteTerminalID)
        })
    }

    get(id?: string) {
        if (id) return this.raw.find((r) => r.id === id)
        return this.raw
    }

    startStack(stack: string) {
        this.palettes.get(stack)?.terminals.forEach((term) => {
            term.start()
        })
    }
    stopStack(stack: string) {
        this.palettes.get(stack)?.terminals.forEach((term) => {
            term.stop()
        })
    }

    startTerminal(stack: string, terminal: string) {
        console.log(`Starting ${stack} -> ${terminal}`)
        this.palettes.get(stack)?.terminals.get(terminal)?.start()
    }
    stopTerminal(stack: string, terminal: string) {
        this.palettes.get(stack)?.terminals.get(terminal)?.stop()
    }

    deleteTerminal(stack: string, terminal: string) {
        this.palettes.get(stack)?.terminals.get(terminal)?.stop()
        this.palettes.get(stack)?.deleteTerminal(terminal)
        this.palettes.get(stack)?.pingAll()
        this.save()
        this.server.emit('terminalDelete', { stack, terminal })
    }

    createTerminal(title: string, stack: string) {
        const existingStack = this.palettes.get(stack)
        if (!existingStack) {
            throw new Error(`Whoah, stack ${stack} was not found when adding new temrinal!`)
        }
        const newT = this.palettes.get(stack)?.createCommand(title)
        this.save()
        return newT
    }

    createStack(name: string) {
        const newOne: PaletteStack = {
            id: uuidv4(),
            stackName: name
        }
        this.raw.push(newOne)
        this.palettes.set(newOne.id, new Palette(newOne, this.server))
        this.save()
        return newOne
    }

    save(onExport = false) {
        const toModify: PaletteStack[] = onExport ? JSON.parse(JSON.stringify(this.raw)) : this.raw

        toModify.forEach((palette) => {
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
            if (error) throw error
        })
    }
}
