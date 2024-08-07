import { v4 as uuidv4 } from 'uuid'
import { Cmd, CustomServer, PaletteStack, RecursivePartial } from '../../types'
import { Palette } from './Palette'
import { DataStore } from './stores/DataStore'
import { ZodTypeAny } from 'zod'
import { TerminalScheduler } from './service/TerminalScheduler'
import { HistoryService } from './service/HistoryService'
import { EnvironmentService } from './service/EnvironmentService'
import { DockerService } from './service/DockerService'
import { DockerError, DockerFaultState } from './util/error'
import { AutocompleteService } from './service/AutocompleteService'

const FAULTSTATE_ERROR_CODE = 'ERRFAULT'

export class Stack {
    path: string
    server: CustomServer
    raw: PaletteStack[]
    palettes: Map<string, Palette>
    store: DataStore
    scheduler: Map<string, TerminalScheduler>
    history: HistoryService
    environment: EnvironmentService
    dockerService: DockerService
    autocompleteService: AutocompleteService

    constructor(server: CustomServer) {
        this.server = server
        this.raw = []
        this.store = new DataStore()
        this.palettes = new Map<string, Palette>()
        this.scheduler = new Map<string, TerminalScheduler>()
        this.history = new HistoryService()
        this.environment = new EnvironmentService(server)
        this.dockerService = new DockerService()
        this.autocompleteService = new AutocompleteService()
    }

    async load(jsonPath: string, schema: ZodTypeAny) {
        this.path = jsonPath
        this.raw = await this.store.load(jsonPath, schema)
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
                    new Palette(
                        palette,
                        this.server,
                        this.save.bind(this),
                        this.history,
                        this.environment
                    )
                )
            }
        }
        this.save()
        this.autocompleteService.loadFromStacks(this.raw)
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
                    console.log(`Stack ${stackId} connected`)
                    palette.installStackSocket(client)
                } else {
                    console.log(`Terminal ${remoteTerminalID} connected`)
                    palette.initTerminal(client, String(remoteTerminalID))
                }
            } else {
                console.log(`General client connected ${client.id}`)
                client.on('clearHistory', (akw) => {
                    console.log('Clearing history service')
                    this.history.reboot()
                    akw()
                })
                client.on('dockerContainers', async (akw) => {
                    this.dockerService.reset()

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
                client.on('editorAutocompletes', async (_id: string, akw) => {
                    akw(this.autocompleteService.completions)
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
            new Palette(newOne, this.server, this.save.bind(this), this.history, this.environment)
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
     * Save also makes sure no remote environments pairs are kept in stacks.json
     * if remote.keep is set to false.
     *
     * The OS Envs get repopulated at each save thus making them not persistent
     * (which is a good thing)
     *
     */
    save = (onExport = false) => {
        const toBeSaved: PaletteStack[] = JSON.parse(JSON.stringify(this.raw))

        toBeSaved.forEach((stack) => {
            stack.env = this.environment.getCopy(stack.id)

            stack.env?.forEach((environment) => {
                // Remove any remote envs if we dont want to keep them
                if (!environment.remote?.keep && environment.order !== 0) {
                    environment.pairs = {}
                }
            })

            stack.palette?.forEach((pal) => {
                pal.command.env = this.environment.getCopy(pal.id)
                pal.command.env?.forEach((environment) => {
                    // Remove any remote envs if we dont want to keep them
                    if (environment.remote && !environment.remote.keep && environment.order !== 0) {
                        environment.pairs = {}
                    }
                })
                // Remove OS Environment
                pal.command.env = pal.command.env?.filter((o) => o.order > 0)
            })
        })

        const filename = onExport ? 'commands_exported.json' : this.path

        this.store.save(filename, toBeSaved)
    }
}
