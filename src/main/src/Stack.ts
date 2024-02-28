import { v4 as uuidv4 } from 'uuid'
import { PaletteStack, UtilityEvents } from '../../types'
import { Palette } from './Palette'
import { DataStore } from './service/DataStore'
import { ZodTypeAny } from 'zod'
import { Server } from 'socket.io'
import { TerminalScheduler } from './service/TerminalScheduler'

export class Stack {
    path: string
    server: Server
    raw: PaletteStack[]
    palettes: Map<string, Palette>
    store: DataStore
    scheduler: Map<string, TerminalScheduler>

    constructor(jsonPath: string, server: Server, schema: ZodTypeAny) {
        this.path = jsonPath
        this.server = server
        this.raw = []
        this.store = new DataStore(jsonPath, schema)
        this.palettes = new Map<string, Palette>()
        this.scheduler = new Map<string, TerminalScheduler>()
    }

    async load() {
        this.raw = await this.store.load()
        for (const stack of this.raw) {
            stack.id = uuidv4()

            if (!stack.palette) return
            for (const palette of stack.palette) {
                palette.id = uuidv4()
                if (palette.executionOrder) return
                const orders = stack.palette.map((pal) => pal.executionOrder || 0)
                palette.executionOrder = (Math.max(...orders) ?? 1) + 1
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

            if (palette) {
                palette.initTerminal(client, remoteTerminalID, this.save.bind(this))
                return
            }

            client.on(UtilityEvents.BIGSTATE, (arg: { stack: string }) => {
                this.palettes.get(arg.stack)?.pingState()
            })
            client.on(
                UtilityEvents.REORDER,
                (arg: { stackId: string; terminalId: string; newOrder: number }) => {
                    this.palettes.get(arg.stackId)?.reOrderExecution(arg)
                    this.save()
                }
            )

            client.emit('hello')
        })
    }

    get(id?: string) {
        if (id) return this.raw.find((r) => r.id === id)
        return this.raw
    }

    startStack(stack: string) {

        const palette = this.palettes.get(stack)
        if (!palette) {
            throw new Error(`Tried to start stack ${stack}, but it was not found`)
        }
        palette.isRunning = true

        this.scheduler.set(stack, new TerminalScheduler(palette.terminals))
    }
    stopStack(stack: string) {
        this.scheduler.get(stack)?.stop()
        const palette = this.palettes.get(stack)
        if (!palette) {
            throw new Error(`Tried to stop stack ${stack}, but it was not found`)
        }
        palette.isRunning = false
        palette.terminals.forEach((term) => {
            term.stop()
        })

        this.scheduler.delete(stack)
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

    async createTerminal(title: string, stack: string) {
        const existingStack = this.palettes.get(stack)
        if (!existingStack) {
            throw new Error(`Whoah, stack ${stack} was not found when adding new terminal`)
        }
        const newT = await this.palettes.get(stack)?.createCommand(title)
        if (!newT) throw new Error(`Could not create terminal ${title} ${stack}`)
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

    removeStack(stackId: string) {
        this.raw = this.raw.filter((s) => s.id !== stackId)
        this.palettes.delete(stackId)
        this.save()

        return
    }

    save = (onExport = false) => {
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

        const filename = onExport ? 'commands_exported.json' : this.path

        this.store.save(filename, this.raw)
    }
}
