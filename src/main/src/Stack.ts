import { v4 as uuidv4 } from 'uuid'
import { Cmd, CustomServer, PaletteStack, RecursivePartial } from '../../types'
import { Palette } from './Palette'
import { DataStore } from './stores/DataStore'
import { ZodTypeAny } from 'zod'
import { TerminalScheduler } from './service/TerminalScheduler'
import { HistoryService } from './service/HistoryService'
import { MonitorService } from './service/MonitorService'
import { EnvironmentService } from './service/EnvironmentService'
import { DockerService } from './service/DockerService'
import { DockerError, DockerFaultState } from './util/error'

const FAULTSTATE_ERROR_CODE = 'ERRFAULT'

export class Stack {
    path: string
    server: CustomServer
    raw: PaletteStack[]
    palettes: Map<string, Palette>
    store: DataStore
    scheduler: Map<string, TerminalScheduler>
    history: HistoryService
    monitor: MonitorService
    environment: EnvironmentService
    dockerService: DockerService

    constructor(jsonPath: string, server: CustomServer, schema: ZodTypeAny) {
        this.path = jsonPath
        this.server = server
        this.raw = []
        this.store = new DataStore(jsonPath, schema)
        this.palettes = new Map<string, Palette>()
        this.scheduler = new Map<string, TerminalScheduler>()
        this.history = new HistoryService()
        this.monitor = new MonitorService()
        this.environment = EnvironmentService.get()
        this.dockerService = new DockerService()
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
                this.palettes.set(
                    palette.id,
                    new Palette(palette, this.server, this.save.bind(this), this.history)
                )
            }
        }
        this.save()
        return this
    }

    startServer(port = 3123) {
        this.server.listen(port)
        console.log(`Starting server in ${port}`)
        this.server.on('connection', (client) => {
            const stackId = String(client.handshake.query.stack)
            const remoteTerminalID = client.handshake.query.id
            const palette = this.palettes.get(stackId)

            if (palette) {
                if (!remoteTerminalID) {
                    // console.log(`Stack ${stackId} connected`)
                    palette.installStackSocket(client)
                } else {
                    // console.log(`Terminal ${remoteTerminalID} connected`)
                    palette.initTerminal(client, String(remoteTerminalID))
                }
            } else {
                // console.log(`General client connected ${client.id}`)
                client.on('clearHistory', (akw) => {
                    console.log('Clearing history service')
                    this.history.reboot()
                    akw()
                })
                client.on('dockerContainers', async (akw) => {
                    try {
                        const containers = await this.dockerService.getContainers()
                        akw(JSON.stringify(Object.fromEntries(containers)))
                    } catch (error) {
                        if (error instanceof DockerError) {
                            akw('', error.message)
                            return
                        }
                        if (error instanceof DockerFaultState) {
                            akw('', FAULTSTATE_ERROR_CODE)
                            return
                        }
                        akw('', 'Unknown docker error')
                    }
                })
                client.on('dockerStop', async (id: string, akw) => {
                    const err = await this.dockerService.stopContainer(id)
                    try {
                        const containers = await this.dockerService.getContainers()
                        akw(JSON.stringify(Object.fromEntries(containers)), err)
                    } catch (error) {
                        if (error instanceof DockerError) {
                            akw('', error.message)
                            return
                        }
                        akw('', 'Unknown docker error')
                    }
                })
                client.on('dockerStart', async (id: string, akw) => {
                    const err = await this.dockerService.startContainer(id)
                    try {
                        const containers = await this.dockerService.getContainers()
                        akw(JSON.stringify(Object.fromEntries(containers)), err)
                    } catch (error) {
                        if (error instanceof DockerError) {
                            akw('', error.message)
                            return
                        }
                        akw('', 'Unknown docker error')
                    }
                })
                client.on('dockerRemove', async (id: string, akw) => {
                    const err = await this.dockerService.removeContainer(id)
                    try {
                        const containers = await this.dockerService.getContainers()
                        akw(JSON.stringify(Object.fromEntries(containers)), err)
                    } catch (error) {
                        if (error instanceof DockerError) {
                            akw('', error.message)
                            return
                        }
                        akw('', 'Unknown docker error')
                    }
                })

                client.on('m_ports', async (akw) => {
                    await Promise.all([
                        this.monitor.activePortsTCP(),
                        this.monitor.activePortsUDP()
                    ]).then((results) => {
                        akw({
                            tcp: results[0],
                            udp: results[1]
                        })
                    })
                })
            }
        })
    }

    get(id?: string) {
        if (id) return [this.raw.find((r) => r.id === id)]
        return this.raw
    }

    startStack(stack: string) {
        const palette = this.palettes.get(stack)
        if (!palette) {
            throw new Error(`Tried to start stack ${stack}, but it was not found`)
        }
        palette.isRunning = true

        // check if we already have a scheduler for this, if so
        // destruct it. Otherwise there will be ghosts.
        this.scheduler.get(stack)?.stop()

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

    async createTerminal(payload: RecursivePartial<Cmd>, stack: string) {
        const existingStack = this.palettes.get(stack)
        if (!existingStack) {
            throw new Error(`Whoah, stack ${stack} was not found when adding new terminal`)
        }

        const newT = await this.palettes.get(stack)?.createCommand(payload)
        if (!newT) throw new Error(`Could not create terminal ${payload.title} ${stack}`)
        this.save()
        return newT
    }

    createStack(name: string) {
        const newOne: PaletteStack = {
            id: uuidv4(),
            stackName: name
        }
        this.raw.push(newOne)
        this.palettes.set(
            newOne.id,
            new Palette(newOne, this.server, this.save.bind(this), this.history)
        )
        this.save()
        return newOne
    }

    removeStack(stackId: string) {
        this.raw = this.raw.filter((s) => s.id !== stackId)
        this.palettes.delete(stackId)
        this.save()
        return
    }

    /**
     * Save takes a deepcopy of the stack and filters out any
     * OS Environments from the commands.
     *
     * The OS Envs get repopulated at each save thus making them not persistent
     * (which is a good thing)
     *
     */
    save = (onExport = false) => {
        const toBeSaved: PaletteStack[] = JSON.parse(JSON.stringify(this.raw))

        toBeSaved.forEach((stack) => {
            stack.env = this.environment.store.get(stack.id)
            stack.palette?.forEach((pal) => {
                pal.command.env = this.environment.store.get(pal.id)
                pal.command.env = pal.command.env?.filter((o) => o.order > 0)
            })
        })

        const filename = onExport ? 'commands_exported.json' : this.path

        this.store.save(filename, toBeSaved)
    }
}
